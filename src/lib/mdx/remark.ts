import type { Heading, InlineCode, PhrasingContent, Root, Text } from "mdast";
import type { MdxJsxAttribute, MdxJsxTextElement } from "mdast-util-mdx-jsx";
import { visit } from "unist-util-visit";
import { resolveKey, type TermSources } from "./resolve";
import { anchorRe } from "./schema";

/*
  Plugin remark dla treści GCat (MDX):
  • [[klucz]] i [[klucz|etykieta]] → <Term k="klucz">etykieta</Term>. Marker zostaje dosłownie w pliku,
    zamiana dzieje się tylko przy kompilacji. Regex i kolejność wyszukiwania (karta, potem słownik) jak rich() i Term.tsx.
    Nierozpoznany klucz = błąd builda (dziś renderowałby się cicho jako sam tekst).
  • autoCodes: gołe kody G/M → <Term> z <code class="inline-code is-link"> jak CodeText.tsx (tylko w kartach).
  • `kod` → <code class="inline-code"> jak rich().
  • ## Nagłówek {#kotwica} → <h2 id="kotwica">; kotwica musi być jawna i unikalna.
  • Dozwolone tylko znane komponenty (np. <Diagram id="…" />), bez wyrażeń {…} i import/export.
*/

/** Ten sam regex markera co w rich() (Rich.tsx) i CodeText.tsx. */
export const MARKER_RE = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
const CODE_RE = /\b([GM]\d{1,3}(?:\.\d)?)\b/g;
const HEADING_ID_RE = /\s*\{#([^\s{}]+)\}\s*$/;

export interface GcatRemarkOptions {
  /** Źródła do sprawdzania kluczy markerów (domyślnie: dzisiejsze gcodes.json + glossary.json). */
  sources?: TermSources;
  /** Auto-linki gołych kodów G/M (jak CodeText w kartach). */
  autoCodes?: { known: Set<string>; self: string[] };
  /** Nazwy komponentów dozwolonych w treści. */
  components: string[];
  /** Dozwolone id rysunków dla <Diagram id="…" />. */
  diagramIds: Set<string>;
  /** Wymagaj jawnej kotwicy {#id} w każdym nagłówku (domyślnie tak). */
  requireHeadingIds?: boolean;
}

export interface ContentIssue { line?: number; column?: number; message: string }

/** Błąd treści: czytelny komunikat z nazwą pliku i pozycją. */
export class ContentError extends Error {
  constructor(public file: string, public issues: ContentIssue[]) {
    super(issues.map((i) => `${file}${i.line ? `:${i.line}:${i.column ?? 1}` : ""} — ${i.message}`).join("\n"));
    this.name = "ContentError";
  }
}

/**
 * Przygotowanie źródła tylko w pamięci (plik na dysku się nie zmienia), bez przesuwania numerów linii:
 * • `{#id}` na końcu nagłówka → `\{#id}` (inaczej MDX czyta klamrę jako wyrażenie JS),
 * • `[[klucz|etykieta]]` w wierszu tabeli → `[[klucz\|etykieta]]` (inaczej `|` dzieli komórkę).
 */
export function prepareSource(src: string): string {
  let fence = false;
  return src.split("\n").map((line) => {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    if (fence) return line;
    if (/^#{1,6}\s/.test(line)) return line.replace(/(?<!\\)\{#([^\s{}]+)\}(\s*)$/, "\\{#$1}$2");
    if (/^\s*\|/.test(line)) return line.replace(/\[\[([^\]|]+?)(\\?)\|([^\]]+)\]\]/g, (_, k: string, _bs, l: string) => `[[${k}\\|${l}]]`);
    return line;
  }).join("\n");
}

const attr = (name: string, value: string): MdxJsxAttribute => ({ type: "mdxJsxAttribute", name, value });
const termEl = (k: string, children: PhrasingContent[]): MdxJsxTextElement => ({ type: "mdxJsxTextElement", name: "Term", attributes: [attr("k", k)], children });
const inlineCode = (value: string): InlineCode => ({ type: "inlineCode", value });
const normCode = (c: string) => c.toUpperCase().replace(/^([GM])(\d)$/, "$10$2");

export function remarkGcat(opts: GcatRemarkOptions) {
  const allowed = new Set(opts.components);
  const known = opts.autoCodes?.known;
  const self = new Set((opts.autoCodes?.self ?? []).map(normCode));

  /** Gołe kody G/M w kawałku zwykłego tekstu (jak codes() w CodeText.tsx). */
  function codes(s: string): PhrasingContent[] {
    if (!known) return s ? [{ type: "text", value: s }] : [];
    const out: PhrasingContent[] = [];
    let last = 0;
    for (const m of s.matchAll(CODE_RE)) {
      if (m.index > last) out.push({ type: "text", value: s.slice(last, m.index) });
      const c = normCode(m[1]);
      if (self.has(c) || !known.has(c)) out.push(inlineCode(m[1]));
      else out.push(termEl(c, [{ type: "mdxJsxTextElement", name: "code", attributes: [attr("className", "inline-code is-link")], children: [{ type: "text", value: m[1] }] }]));
      last = m.index + m[0].length;
    }
    if (last < s.length) out.push({ type: "text", value: s.slice(last) });
    return out;
  }

  return (tree: Root, file: { path?: string }) => {
    const issues: ContentIssue[] = [];
    const at = (n: { position?: { start: { line: number; column: number } } } | undefined, message: string) =>
      issues.push({ line: n?.position?.start.line, column: n?.position?.start.column, message });
    /** pozycja znaku `i` w węźle tekstu (przybliżona przy ucieczkach \[ w źródle) */
    const atText = (t: Text, i: number, message: string) => {
      const p = t.position?.start;
      if (!p) return at(t, message);
      const before = t.value.slice(0, i).split("\n");
      issues.push({ line: p.line + before.length - 1, column: before.length > 1 ? before[before.length - 1].length + 1 : p.column + i, message });
    };

    // 1. Nagłówki: jawna, unikalna kotwica {#id}.
    const ids = new Set<string>();
    visit(tree, "heading", (h: Heading) => {
      const last = h.children[h.children.length - 1];
      const m = last?.type === "text" ? last.value.match(HEADING_ID_RE) : null;
      if (!m) {
        if (opts.requireHeadingIds !== false) at(h, "nagłówek bez jawnej kotwicy — dopisz na końcu {#kotwica}");
        return;
      }
      const id = m[1];
      (last as Text).value = (last as Text).value.slice(0, m.index);
      if (!anchorRe.test(id)) at(h, `kotwica {#${id}}: tylko małe litery, cyfry i myślniki`);
      if (ids.has(id)) at(h, `kotwica {#${id}} powtarza się w pliku`);
      ids.add(id);
      h.data = { ...h.data, hProperties: { ...(h.data?.hProperties ?? {}), id } };
    });

    // 2. Komponenty i wyrażenia.
    visit(tree, (n) => {
      if (n.type === "mdxjsEsm") at(n, "import/export jest niedozwolony w treści");
      else if (n.type === "mdxFlowExpression" || n.type === "mdxTextExpression") at(n, "wyrażenie {…} jest niedozwolone w treści (klamry w tekście: \\{ \\})");
      else if (n.type === "mdxJsxFlowElement" || n.type === "mdxJsxTextElement") {
        const el = n as MdxJsxTextElement;
        if (!el.name || !allowed.has(el.name)) { at(n, `nieznany komponent <${el.name ?? ""}> (dozwolone: ${[...allowed].join(", ")})`); return; }
        if (el.name === "Diagram") {
          const id = el.attributes.find((a): a is MdxJsxAttribute => a.type === "mdxJsxAttribute" && a.name === "id")?.value;
          if (typeof id !== "string") at(n, `<Diagram> wymaga id="…" (tekst)`);
          else if (!opts.diagramIds.has(id)) at(n, `<Diagram id="${id}" /> — nie ma takiego rysunku w diagrams.tsx`);
        }
      }
    });

    // 3. Markery [[…]] i auto-linki kodów w tekście.
    visit(tree, "text", (t: Text, index, parent) => {
      if (!parent || index === undefined) return;
      const s = t.value;
      const out: PhrasingContent[] = [];
      let last = 0;
      for (const m of s.matchAll(MARKER_RE)) {
        out.push(...codes(s.slice(last, m.index)));
        const key = m[1];
        if (!resolveKey(key, opts.sources)) atText(t, m.index, `marker [[${m[0].slice(2, -2)}]]: klucz „${key}” nie pasuje do żadnej karty ani hasła słownika`);
        out.push(termEl(key, [{ type: "text", value: m[2] ?? key }]));
        last = m.index + m[0].length;
      }
      out.push(...codes(s.slice(last)));
      for (const p of out) if (p.type === "text" && /\[\[|\]\]/.test(p.value)) at(t, `niedomknięty lub rozbity marker w „${p.value.trim().slice(0, 40)}” (marker nie może zawierać formatowania ani nawiasów ])`);
      if (out.length === 1 && out[0].type === "text") return;
      (parent.children as PhrasingContent[]).splice(index, 1, ...out);
      return index + out.length;
    });

    // 4. `kod` jak w rich(): klasa inline-code.
    visit(tree, "inlineCode", (c: InlineCode) => {
      c.data = { ...c.data, hProperties: { ...(c.data?.hProperties ?? {}), className: ["inline-code"] } };
    });

    if (issues.length) throw new ContentError(file.path ?? "(treść)", issues);
  };
}
