import type { Heading, InlineCode, List, Nodes, PhrasingContent, Root, Strong, Table, Text } from "mdast";
import type { MdxJsxAttribute, MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx-jsx";
import { visit } from "unist-util-visit";
import { tableClass } from "@/lib/tableKind";
import { resolveKey, type TermSources } from "./resolve";
import { anchorRe } from "./schema";
import { motionClass } from "@/lib/motionClass";
import { parseProgram } from "@/lib/parser";
import { normLine, progHash } from "@/lib/progHash";

/*
  Plugin remark dla treści GCat (MDX):
  • [[klucz]] i [[klucz|etykieta]] → <Term k="klucz">etykieta</Term>. Marker zostaje dosłownie w pliku,
    zamiana dzieje się tylko przy kompilacji. Regex i kolejność wyszukiwania (karta, potem słownik) jak rich() i Term.tsx.
    Nierozpoznany klucz = błąd builda (dziś renderowałby się cicho jako sam tekst).
  • autoCodes: gołe kody G/M → <Term> z <code class="inline-code is-link"> jak CodeText.tsx (tylko w kartach).
  • `kod` → <code class="inline-code"> jak rich().
  • ## Nagłówek {#kotwica} → <h2 id="kotwica">; kotwica musi być jawna i unikalna.
  • Dozwolone tylko znane komponenty (np. <Diagram id="…" />), bez wyrażeń {…} i import/export.
  • <Code>/<Sim>/<Demo> zawierają jeden blok ``` — jego treść staje się atrybutem `src`.
  • Tabela GFM → <Table> (figure + klasy + data-label z nagłówka) jak blok `table` w Article.tsx.
  • file.data.gcat = { headings, diagrams, text, programs } — spis treści, „czy jest rysunek”, tekst do wyszukiwarki, programy.
  Standard treści (pilotaż 2026-11-22):
  • Lista oznaczeń: lista, w której każdy punkt zaczyna się od **(1) Nazwa:** → <ul class="oznaczenia">, numer jako
    kółko jak na rysunku (span.ozn-nr), bez kropek listy.
  • programLinks: `kod` równy linii programu z <Sim>/<Demo>/<Code> na tej stronie → kolor ruchu tej linii
    (is-g00/g01/g02) + data-prog/data-prog-line (kliknięcie ustawia symulator na linii, components/ProgLinks.tsx).
  • <Wzor f="…" legend="…" caption="…" /> — wzór w ramce (components/Wzor.tsx).
*/

/** Wartości atrybutów komponentów (jak typy bloków w src/lib/article.ts). */
const ENUMS: Record<string, Record<string, string[]>> = {
  Note: { kind: ["tip", "warn", "info"] },
  Sim: { mode: ["mill", "lathe"] },
  Demo: { mode: ["mill", "lathe"] },
  Widget: { id: ["rij", "arc", "jog"] },
  /** kolor wyróżnienia w tekście — gotowy zestaw jak kolory ruchów (rysownik, symulator) */
  Kolor: { k: ["g00", "g01", "g02", "akcent", "blad"] },
  /** sort="true" — tabela sortowana kliknięciem w nagłówek (porównania w Technologii) */
  Table: { sort: ["true"] },
};
const WITH_SRC = new Set(["Code", "Sim", "Demo"]);

export interface GcatMeta {
  headings: { id: string; label: string }[];
  diagrams: number;
  /** tekst do wyszukiwarki: surowy tekst bloków bez ** i ` (jak dawne blockText w searchIndex.ts) */
  text: string;
  /** programy z <Sim> i <Demo> (dla audit:programy) */
  programs: { kind: "sim" | "demo"; src: string; mode: "mill" | "lathe" }[];
}

/** Sam tekst węzła (etykieta nagłówka do spisu treści). */
const plain = (n: Nodes): string => ("value" in n && typeof n.value === "string" ? n.value : "children" in n ? (n.children as Nodes[]).map(plain).join("") : "");
const strAttr = (el: MdxJsxFlowElement | MdxJsxTextElement, name: string) => {
  const a = el.attributes.find((x): x is MdxJsxAttribute => x.type === "mdxJsxAttribute" && x.name === name);
  return a ? a.value : undefined;
};

/** Ten sam regex markera co w rich() (Rich.tsx) i CodeText.tsx. */
export const MARKER_RE = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
const CODE_RE = /\b([GM]\d{1,3}(?:\.\d)?)\b/g;
const HEADING_ID_RE = /\s*\{#([^\s{}]+)\}\s*$/;

export interface GcatRemarkOptions {
  /** Źródła do sprawdzania kluczy markerów (karty i hasła z content/). */
  sources: TermSources;
  /** Auto-linki gołych kodów G/M (jak CodeText w kartach). */
  autoCodes?: { known: Set<string>; self: string[] };
  /** Nazwy komponentów dozwolonych w treści. */
  components: string[];
  /** Dozwolone id rysunków dla <Diagram id="…" />. */
  diagramIds: Set<string>;
  /** Rysunki z rysownika dla <Rys id="…" /> (content/rysunki/); brak = bez kontroli (kontrolę robi npm run tresci). */
  rysIds?: Set<string>;
  /** Wymagaj jawnej kotwicy {#id} w każdym nagłówku (domyślnie tak). */
  requireHeadingIds?: boolean;
  /** Czy plik public/<src> istnieje (dla <Obraz>); brak = bez kontroli — kompilacja w przeglądarce (edytor) nie ma dysku. */
  publicFile?: (src: string) => boolean;
  /** Fragmenty kodu w tekście = linie programu z tej strony: kolor ruchu i przeskok symulatora (standard treści). */
  programLinks?: boolean;
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
      else out.push(termEl(c, [{ type: "mdxJsxTextElement", name: "code", attributes: [attr("className", `inline-code is-link${motionClass(m[1])}`)], children: [{ type: "text", value: m[1] }] }]));
      last = m.index + m[0].length;
    }
    if (last < s.length) out.push({ type: "text", value: s.slice(last) });
    return out;
  }

  return (tree: Root, file: { path?: string; value?: unknown; data: Record<string, unknown> }) => {
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

    const meta: GcatMeta = { headings: [], diagrams: 0, text: "", programs: [] };
    /** wszystkie programy strony (także <Code>) — do przypisania fragmentów kodu w tekście */
    const progs: { src: string; mode: "mill" | "lathe"; linked: boolean }[] = [];
    const source = String(file.value ?? "");

    // 0. Tekst do wyszukiwarki — z surowego źródła, przed przekształceniami (jeden wpis na blok najwyższego poziomu).
    const raw = (n: { position?: { start: { offset?: number }; end: { offset?: number } } } | undefined) =>
      n?.position?.start.offset !== undefined && n.position.end.offset !== undefined ? source.slice(n.position.start.offset, n.position.end.offset) : "";
    const unesc = (x: string) => x.replace(/\\([!-/:-@[-`{-~])/g, "$1");
    const cells = (t: Table) => t.children.flatMap((r) => r.children.map((c) => unesc(raw(c).trim().replace(/^\|/, "").replace(/\|$/, "").trim())));
    meta.text = tree.children.map((n): string => {
      switch (n.type) {
        case "heading": return unesc(raw(n).replace(/^#+\s*/, "").replace(/\s*\\?\{#[^\s{}]+\}\s*$/, ""));
        case "paragraph": return unesc(raw(n));
        case "list": return n.children.map((li) => unesc(raw(li.children[0]))).join(" ");
        case "table": return cells(n).join(" ");
        case "mdxJsxFlowElement": {
          if (n.name === "Note") return unesc(n.children.length ? source.slice(n.children[0].position!.start.offset!, n.children[n.children.length - 1].position!.end.offset!) : "");
          if (n.name === "Code" || n.name === "Sim") return String(strAttr(n, "caption") ?? "");
          if (n.name === "Wzor") return [strAttr(n, "caption"), strAttr(n, "f"), strAttr(n, "legend")].filter((x) => typeof x === "string").join(" ").replace(/[_^{}]/g, "");
          if (n.name === "Table") { const t = n.children.find((c): c is Table => c.type === "table"); return t ? cells(t).join(" ") : ""; }
          return "";
        }
        default: return "";
      }
    }).join(" ").replace(/\*\*|`/g, "");

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
      meta.headings.push({ id, label: plain(h).trim() });
    });

    // 2. Komponenty i wyrażenia.
    visit(tree, (n) => {
      if (n.type === "mdxjsEsm") at(n, "import/export jest niedozwolony w treści");
      else if (n.type === "mdxFlowExpression" || n.type === "mdxTextExpression") at(n, "wyrażenie {…} jest niedozwolone w treści (klamry w tekście: \\{ \\})");
      else if (n.type === "mdxJsxFlowElement" || n.type === "mdxJsxTextElement") {
        const el = n as MdxJsxTextElement;
        if (!el.name || !allowed.has(el.name)) { at(n, `nieznany komponent <${el.name ?? ""}> (dozwolone: ${[...allowed].join(", ")})`); return; }
        for (const a of el.attributes) if (a.type !== "mdxJsxAttribute" || (a.value !== null && typeof a.value !== "string")) at(n, `<${el.name}>: atrybuty tylko jako tekst w cudzysłowie`);
        if (el.name === "Diagram") {
          meta.diagrams++;
          const id = strAttr(el, "id");
          if (typeof id !== "string") at(n, `<Diagram> wymaga id="…" (tekst)`);
          else if (!opts.diagramIds.has(id)) at(n, `<Diagram id="${id}" /> — nie ma takiego rysunku w diagrams.tsx`);
        }
        if (el.name === "Rys") {
          meta.diagrams++;
          const id = strAttr(el, "id");
          if (typeof id !== "string") at(n, `<Rys> wymaga id="…" (nazwa rysunku z content/rysunki/)`);
          else if (opts.rysIds && !opts.rysIds.has(id)) at(n, `<Rys id="${id}" /> — nie ma pliku content/rysunki/${id}.yaml`);
        }
        if (el.name === "Wzor") {
          const f = strAttr(el, "f");
          if (typeof f !== "string" || !f.trim()) at(n, `<Wzor> wymaga f="…" (zapis wzoru, np. n = 1000 · V_c / (π · D))`);
          else if ((f.match(/\(/g) ?? []).length !== (f.match(/\)/g) ?? []).length) at(n, `<Wzor f="${f}">: niedomknięty nawias`);
        }
        if (el.name === "Obraz") {
          const src = strAttr(el, "src");
          if (typeof src !== "string" || !src.startsWith("/rysunki/") || src.includes("..")) at(n, `<Obraz> wymaga src="/rysunki/…" (plik w public/rysunki/)`);
          else if (opts.publicFile && !opts.publicFile(src)) at(n, `<Obraz src="${src}" /> — nie ma pliku public${src}`);
        }
        for (const [name, values] of Object.entries(ENUMS[el.name] ?? {})) {
          const v = strAttr(el, name);
          if (v !== undefined && !values.includes(String(v))) at(n, `<${el.name} ${name}="${v}">: dozwolone ${values.join(" | ")}`);
          if (v === undefined && (el.name === "Note" || el.name === "Widget" || el.name === "Kolor")) at(n, `<${el.name}> wymaga ${name}="…" (${values.join(" | ")})`);
        }
        // markery w podpisach i tytułach (renderowane przez rich() w komponencie)
        for (const name of ["caption", "title"]) {
          const v = strAttr(el, name);
          if (typeof v === "string") for (const m of v.matchAll(MARKER_RE)) if (!resolveKey(m[1], opts.sources)) at(n, `${name}: marker [[${m[0].slice(2, -2)}]] — klucz „${m[1]}” nie pasuje do żadnej karty ani hasła słownika`);
        }
        // <Note> z treścią w osobnych liniach (format Keystatic) → jeden akapit; renderujemy samą treść jak blok `note` w Article.tsx
        if (el.name === "Note") {
          const kids = (el.children as Nodes[]).filter((c) => !(c.type === "text" && !c.value.trim()));
          if (kids.length === 1 && kids[0].type === "paragraph") el.children = kids[0].children as typeof el.children;
        }
        if (WITH_SRC.has(el.name)) {
          const kids = (el.children as Nodes[]).filter((c) => !(c.type === "text" && !c.value.trim()));
          if (kids.length !== 1 || kids[0].type !== "code") { at(n, `<${el.name}> musi zawierać dokładnie jeden blok kodu \`\`\` (program)`); return; }
          const src = (kids[0] as { value: string }).value;
          el.attributes.push(attr("src", src));
          el.children = [];
          progs.push({ src, mode: strAttr(el, "mode") === "lathe" ? "lathe" : "mill", linked: el.name !== "Code" });
          if (el.name !== "Code") meta.programs.push({ kind: el.name === "Sim" ? "sim" : "demo", src, mode: strAttr(el, "mode") === "lathe" ? "lathe" : "mill" });
        }
      } else if (n.type === "code") at(n, "blok kodu ``` tylko wewnątrz <Code>, <Sim> albo <Demo>");
    });

    // 2b. Tabele: <Table> (figure), klasy (tableClass — układ na telefonie wg liczby kolumn, Z a) i data-label jak w Article.tsx.
    visit(tree, "table", (t: Table, index, parent) => {
      const cols = t.children[0]?.children.length ?? 0;
      const kind = tableClass(cols, t.children.slice(1).map((r) => r.children.map((c) => plain(c))));
      t.data = { ...t.data, hProperties: { ...(t.data?.hProperties ?? {}), className: ["code-table", kind] } };
      // data-label = surowy tekst nagłówka bez ** i ` (jak `head.replace(/\*\*|`/g, "")`); escape'y Markdown (\[ \| …,
      // zapis Keystatic) zdjęte jak w treści komórki
      const head = t.children[0]?.children.map((c) => {
        const a = c.position?.start.offset, b = c.position?.end.offset;
        const raw = a !== undefined && b !== undefined ? source.slice(a, b) : plain(c);
        return raw.trim().replace(/^\|/, "").replace(/\|$/, "").trim().replace(/\\([!-/:-@[-`{-~])/g, "$1").replace(/\*\*|`/g, "");
      }) ?? [];
      for (const row of t.children.slice(1)) row.children.forEach((c, k) => { c.data = { ...c.data, hProperties: { ...(c.data?.hProperties ?? {}), dataLabel: head[k] ?? "" } }; });
      const p = parent as unknown as MdxJsxFlowElement | undefined;
      if (!p || index === undefined || (p.type === "mdxJsxFlowElement" && p.name === "Table")) return;
      const wrap: MdxJsxFlowElement = { type: "mdxJsxFlowElement", name: "Table", attributes: [], children: [t] };
      (p.children as unknown[]).splice(index, 1, wrap);
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

    // 4. `kod` jak w rich(): klasa inline-code (+ kolor słowa ruchu, lib/motionClass).
    //    programLinks: fragment równy linii programu tej strony → kolor ruchu tej linii i odnośnik do symulatora.
    const lines = opts.programLinks ? progs.map((p) => {
      const prog = parseProgram(p.src, { diameterX: p.mode === "lathe" });
      // rodzaj ruchu linii: z odcinka toru, a gdy go nie ma (pierwszy ruch, błąd) — z modalnego G00–G03, jeśli linia ma adres osi
      const MODAL = ["rapid", "linear", "arc", "arc"];
      const kind = (l: (typeof prog.lines)[number]) => prog.segments.find((sg) => sg.line === l.index && sg.kind !== "dwell")?.kind
        ?? (/(^|\s)[XYZUWABC][-+.\d]/.test(normLine(l.raw ?? "")) && l.state?.motion != null ? MODAL[l.state.motion] : undefined);
      return { hash: progHash(p.src), linked: p.linked, cursor: 0, rows: prog.lines.map((l) => ({ i: l.index, norm: normLine(l.raw ?? ""), kind: kind(l) })).filter((r) => r.norm) };
    }) : [];
    const findLine = (v: string) => {
      const q = normLine(v);
      if (!q) return null;
      const words = q.split(" ").length;
      const hit = (norm: string) => norm === q || (words >= 2 && norm.startsWith(q + " "));
      for (const p of lines) {
        const r = p.rows.find((x) => x.i >= p.cursor && hit(x.norm)) ?? p.rows.find((x) => hit(x.norm));
        if (r) { p.cursor = r.i + 1; return { p, r }; }
      }
      return null;
    };
    const KIND: Record<string, string> = { rapid: " is-g00", linear: " is-g01", arc: " is-g02" };
    visit(tree, "inlineCode", (c: InlineCode) => {
      const bare = motionClass(c.value);
      const m = bare ? null : findLine(c.value);
      const props: Record<string, string | number | string[]> = { className: `inline-code${bare || (m?.r.kind ? KIND[m.r.kind] ?? "" : "")}${m?.p.linked ? " is-prog" : ""}`.split(" ") };
      if (m?.p.linked) Object.assign(props, { dataProg: m.p.hash, dataProgLine: String(m.r.i), role: "button", tabIndex: 0, title: "Pokaż w symulatorze" });
      c.data = { ...c.data, hProperties: { ...(c.data?.hProperties ?? {}), ...props } };
    });

    // 5. Lista oznaczeń: każdy punkt zaczyna się od **(n) Nazwa:** → numer w kółku jak na rysunku, bez kropek.
    const OZN = /^\((\d{1,2})\)\s+/;
    visit(tree, "list", (l: List) => {
      if (l.ordered || !l.children.length) return;
      const heads = l.children.map((li) => {
        const p = li.children[0];
        const s0 = p?.type === "paragraph" ? p.children[0] : undefined;
        const t0 = s0?.type === "strong" ? (s0 as Strong).children[0] : undefined;
        return t0?.type === "text" && OZN.test(t0.value) ? { p, s0: s0 as Strong, t0 } : null;
      });
      if (heads.some((h) => !h)) return;
      l.data = { ...l.data, hProperties: { ...(l.data?.hProperties ?? {}), className: ["oznaczenia"] } };
      for (const h of heads) {
        const { p, t0 } = h!;
        const n = t0.value.match(OZN)![1];
        t0.value = t0.value.replace(OZN, "");
        (p as { children: PhrasingContent[] }).children.unshift({ type: "text", value: n, data: { hName: "span", hProperties: { className: ["ozn-nr"] } } } as Text);
      }
    });

    if (issues.length) throw new ContentError(file.path ?? "(treść)", issues);
    file.data.gcat = meta;
  };
}
