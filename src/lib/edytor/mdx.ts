import type { JSONContent } from "@tiptap/core";
import type { BlockContent, Break, Code, Emphasis, Heading, InlineCode, Link, List, ListItem, Nodes, Paragraph, PhrasingContent, Root, RootContent, Strong, Table, TableCell, TableRow, Text } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown, gfmToMarkdown } from "mdast-util-gfm";
import { mdxFromMarkdown, mdxToMarkdown } from "mdast-util-mdx";
import type { MdxJsxAttribute, MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx-jsx";
import { toMarkdown } from "mdast-util-to-markdown";
import { gfm } from "micromark-extension-gfm";
import { mdxjs } from "micromark-extension-mdxjs";
import { prepareSource } from "@/lib/mdx/remark";

/*
  Treść MDX (bez frontmattera) ↔ dokument edytora (JSON ProseMirror).
  Zapis: blok najwyższego poziomu, który się nie zmienił, wraca do pliku jako dokładnie ten sam fragment źródła
  (atrybut `oid` + mapa origins: kanoniczny JSON bloku i jego tekst). Zmienione i nowe bloki serializuje
  mdast-util-to-markdown w tym samym stylu co Keystatic (`*` w listach, wyrównane tabele, \[\[ i \{ w tekście).
  Odstępy między niezmienionymi sąsiednimi blokami też zostają oryginalne.
*/

export interface Origin { src: string; /** kanoniczny JSON bloku po normalizacji schematem (bez oid); ustawia edytor */ canon?: string }
export interface Parsed { doc: JSONContent; origins: Map<string, Origin>; lead: string; tail: string; seps: Map<string, string> }

const MARKER = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
const HEADING_ID = /\s*\{#([^\s{}]+)\}\s*$/;

export function parseMdx(body: string): Root {
  return fromMarkdown(prepareSource(body), { extensions: [mdxjs(), gfm()], mdastExtensions: [mdxFromMarkdown(), gfmFromMarkdown()] });
}

const attrOf = (el: MdxJsxFlowElement | MdxJsxTextElement, name: string): string | undefined => {
  const a = el.attributes.find((x): x is MdxJsxAttribute => x.type === "mdxJsxAttribute" && x.name === name);
  return typeof a?.value === "string" ? a.value : undefined;
};

/* ───────────── mdast → dokument ───────────── */

type Mark = { type: string; attrs?: Record<string, unknown> };

function textWithTerms(value: string, marks: Mark[]): JSONContent[] {
  const out: JSONContent[] = [];
  let last = 0;
  const mk = marks.length ? { marks } : {};
  for (const m of value.matchAll(MARKER)) {
    if (m.index > last) out.push({ type: "text", text: value.slice(last, m.index), ...mk });
    out.push({ type: "term", attrs: { k: m[1], label: m[2] ?? null }, ...mk });
    last = m.index + m[0].length;
  }
  if (last < value.length) out.push({ type: "text", text: value.slice(last), ...mk });
  return out;
}

/** Treść wierszowa → węzły inline. Nieznane elementy (np. <Term> wpisany ręcznie) wracają jako zwykły tekst źródła. */
function inline(nodes: PhrasingContent[], marks: Mark[], src: string): JSONContent[] {
  const out: JSONContent[] = [];
  for (const n of nodes) {
    if (n.type === "text") out.push(...textWithTerms(n.value, marks));
    else if (n.type === "strong") out.push(...inline(n.children, [...marks, { type: "bold" }], src));
    else if (n.type === "emphasis") out.push(...inline(n.children, [...marks, { type: "italic" }], src));
    else if (n.type === "inlineCode") out.push({ type: "text", text: n.value, marks: [...marks, { type: "code" }] });
    else if (n.type === "link") out.push(...inline(n.children, [...marks, { type: "link", attrs: { href: n.url } }], src));
    else if (n.type === "break") out.push({ type: "hardBreak" });
    else if (n.type === "mdxJsxTextElement" && n.name === "Kolor") out.push(...inline(n.children as PhrasingContent[], [...marks, { type: "kolor", attrs: { k: attrOf(n, "k") ?? "akcent" } }], src));
    else {
      const a = n.position?.start.offset, b = n.position?.end.offset;
      const raw = a !== undefined && b !== undefined ? src.slice(a, b) : "";
      if (raw) out.push({ type: "text", text: raw, ...(marks.length ? { marks } : {}) });
    }
  }
  return out.filter((x) => x.type !== "text" || x.text);
}

const para = (p: Paragraph, src: string): JSONContent => {
  const content = inline(p.children, [], src);
  return content.length ? { type: "paragraph", content } : { type: "paragraph" };
};

function list(l: List, src: string): JSONContent {
  const items = l.children.map((li: ListItem) => {
    const content = li.children.flatMap((c) => block(c, src));
    return { type: "listItem", content: content.length ? content : [{ type: "paragraph" }] };
  });
  return l.ordered ? { type: "orderedList", attrs: { start: l.start ?? 1 }, content: items } : { type: "bulletList", content: items };
}

function table(t: Table, src: string, caption = "", sort = ""): JSONContent {
  return {
    type: "table",
    attrs: { caption, sort, align: t.align ?? null },
    content: t.children.map((r: TableRow, i) => ({
      type: "tableRow",
      content: r.children.map((c: TableCell) => {
        const content = inline(c.children, [], src);
        return { type: i === 0 ? "tableHeader" : "tableCell", content: [content.length ? { type: "paragraph", content } : { type: "paragraph" }] };
      }),
    })),
  };
}

const PROGRAM: Record<string, { type: string; attrs: string[] }> = {
  Code: { type: "codeFig", attrs: ["caption"] },
  Sim: { type: "simFig", attrs: ["mode", "caption", "name"] },
  Demo: { type: "demoFig", attrs: ["mode", "title", "caption"] },
};
const ATOMS: Record<string, { type: string; attrs: string[] }> = {
  Diagram: { type: "diagram", attrs: ["id"] },
  Rys: { type: "rys", attrs: ["id"] },
  Obraz: { type: "obraz", attrs: ["src", "alt", "caption"] },
  Widget: { type: "widget", attrs: ["id"] },
};

const slice = (n: Nodes, src: string) => src.slice(n.position!.start.offset!, n.position!.end.offset!);
const raw = (n: Nodes, src: string): JSONContent => ({ type: "raw", attrs: { src: slice(n, src) } });

/** Blok mdast → bloki dokumentu (zwykle jeden). Nieznane konstrukcje → blok `raw` (źródło bez zmian). */
function block(n: RootContent, src: string): JSONContent[] {
  switch (n.type) {
    case "paragraph": return [para(n, src)];
    case "heading": {
      if (n.depth !== 2 && n.depth !== 3) return [raw(n, src)];
      const kids = [...n.children];
      let anchor = "";
      const last = kids[kids.length - 1];
      if (last?.type === "text") {
        const m = last.value.match(HEADING_ID);
        if (m) { anchor = m[1]; kids[kids.length - 1] = { ...last, value: last.value.slice(0, m.index) }; }
      }
      const content = inline(kids, [], src);
      return [{ type: "heading", attrs: { level: n.depth, anchor }, ...(content.length ? { content } : {}) }];
    }
    case "list": return [list(n, src)];
    case "table": return [table(n, src)];
    case "mdxJsxFlowElement": {
      const name = n.name ?? "";
      const kids = (n.children as RootContent[]).filter((c) => !(c.type === "text" && !c.value.trim()));
      if (name === "Note") {
        const content = kids.flatMap((c) => (c.type === "paragraph" || c.type === "list" ? block(c, src) : []));
        if (content.length !== kids.length) return [raw(n, src)];
        return [{ type: "note", attrs: { kind: attrOf(n, "kind") ?? "info" }, content: content.length ? content : [{ type: "paragraph" }] }];
      }
      if (name === "Table") {
        if (kids.length !== 1 || kids[0].type !== "table") return [raw(n, src)];
        return [table(kids[0], src, attrOf(n, "caption") ?? "", attrOf(n, "sort") ?? "")];
      }
      const p = PROGRAM[name];
      if (p) {
        if (kids.length !== 1 || kids[0].type !== "code") return [raw(n, src)];
        const code = kids[0] as Code;
        const attrs: Record<string, unknown> = { lang: code.lang ?? null };
        for (const a of p.attrs) attrs[a] = attrOf(n, a) ?? (a === "mode" ? "mill" : "");
        return [{ type: p.type, attrs, ...(code.value ? { content: [{ type: "text", text: code.value }] } : {}) }];
      }
      const at = ATOMS[name];
      if (at && kids.length === 0) {
        const attrs: Record<string, unknown> = {};
        for (const a of at.attrs) attrs[a] = attrOf(n, a) ?? "";
        return [{ type: at.type, attrs }];
      }
      return [raw(n, src)];
    }
    default: return [raw(n, src)];
  }
}

/** Plik (treść bez frontmattera) → dokument + źródła bloków. */
export function mdxToDoc(body: string): Parsed {
  const tree = parseMdx(body);
  const src = prepareSource(body); // te same długości linii co body (prepareSource nie przesuwa offsetów? — dopisuje „\\”, więc fragmenty bierzemy z niego)
  const origins = new Map<string, Origin>();
  const seps = new Map<string, string>();
  const content: JSONContent[] = [];
  let prevEnd = -1, prevOid = "";
  tree.children.forEach((n, i) => {
    const blocks = block(n, src);
    const a = n.position!.start.offset!, b = n.position!.end.offset!;
    if (blocks.length === 1) {
      const oid = `o${i}`;
      blocks[0].attrs = { ...(blocks[0].attrs ?? {}), oid };
      origins.set(oid, { src: src.slice(a, b) });
      if (prevOid) seps.set(`${prevOid}>${oid}`, src.slice(prevEnd, a));
      prevOid = oid;
    } else prevOid = "";
    prevEnd = b;
    content.push(...blocks);
  });
  const first = tree.children[0], last = tree.children[tree.children.length - 1];
  const lead = first ? src.slice(0, first.position!.start.offset!) : "";
  const tail = last ? src.slice(last.position!.end.offset!) : src;
  return { doc: { type: "doc", content: content.length ? content : [{ type: "paragraph" }] }, origins, lead, tail, seps };
}

/* ───────────── dokument → mdast → MDX ───────────── */

const MARK_ORDER = ["link", "kolor", "bold", "italic"];
const sameMark = (a: Mark, b: Mark) => a.type === b.type && JSON.stringify(a.attrs ?? {}) === JSON.stringify(b.attrs ?? {});

/** Ciąg węzłów inline z markami → drzewo phrasing (sąsiednie fragmenty z tą samą marką w jednym węźle). */
function phrasing(items: JSONContent[], level = 0): PhrasingContent[] {
  if (level >= MARK_ORDER.length) {
    const out: PhrasingContent[] = [];
    for (const it of items) {
      if (it.type === "hardBreak") { out.push({ type: "break" } as Break); continue; }
      const code = (it.marks ?? []).some((m) => m.type === "code");
      const value = it.type === "term" ? `[[${it.attrs?.k}${it.attrs?.label ? `|${it.attrs.label}` : ""}]]` : it.text ?? "";
      if (code) { out.push({ type: "inlineCode", value } as InlineCode); continue; }
      const prev = out[out.length - 1];
      if (prev?.type === "text") prev.value += value;
      else out.push({ type: "text", value } as Text);
    }
    return out;
  }
  const type = MARK_ORDER[level];
  const out: PhrasingContent[] = [];
  let i = 0;
  while (i < items.length) {
    const m = (items[i].marks ?? []).find((x) => x.type === type) as Mark | undefined;
    let j = i + 1;
    while (j < items.length) {
      const mj = (items[j].marks ?? []).find((x) => x.type === type) as Mark | undefined;
      if (!!m !== !!mj || (m && mj && !sameMark(m, mj))) break;
      j++;
    }
    const group = items.slice(i, j);
    const inner = phrasing(m ? group.map((g) => ({ ...g, marks: (g.marks ?? []).filter((x) => x.type !== type) })) : group, level + 1);
    // spacje na brzegach wyróżnienia wychodzą na zewnątrz (**␣x** nie jest pogrubieniem w Markdown)
    let pre = "", post = "";
    if (m) {
      const f = inner[0], l = inner[inner.length - 1];
      if (f?.type === "text") { pre = f.value.match(/^\s*/)![0]; f.value = f.value.slice(pre.length); }
      if (l?.type === "text") { post = l.value.match(/\s*$/)![0]; l.value = l.value.slice(0, l.value.length - post.length); }
      if (f?.type === "text" && !f.value) inner.shift();
      if (inner.length && l?.type === "text" && !l.value && l !== f) inner.pop();
    }
    const pushText = (v: string) => { if (!v) return; const prev = out[out.length - 1]; if (prev?.type === "text") prev.value += v; else out.push({ type: "text", value: v } as Text); };
    pushText(pre);
    if (m && !inner.length) { pushText(post); i = j; continue; }
    if (!m) { for (const x of inner) { if (x.type === "text") pushText(x.value); else out.push(x); } i = j; continue; }
    if (type === "bold") out.push({ type: "strong", children: inner } as Strong);
    else if (type === "italic") out.push({ type: "emphasis", children: inner } as Emphasis);
    else if (type === "link") out.push({ type: "link", url: String(m.attrs?.href ?? ""), children: inner } as Link);
    else out.push({ type: "mdxJsxTextElement", name: "Kolor", attributes: [jsxAttr("k", String(m.attrs?.k ?? "akcent"))], children: inner } as MdxJsxTextElement);
    pushText(post);
    i = j;
  }
  return out;
}

const jsxAttr = (name: string, value: string): MdxJsxAttribute => ({ type: "mdxJsxAttribute", name, value });
const jsxBlock = (name: string, attrs: [string, unknown][], children: (BlockContent | Code)[] = []): MdxJsxFlowElement => ({
  type: "mdxJsxFlowElement",
  name,
  attributes: attrs.filter(([, v]) => typeof v === "string" && v !== "").map(([k, v]) => jsxAttr(k, String(v))),
  children: children as MdxJsxFlowElement["children"],
});

const textOf = (n: JSONContent) => (n.content ?? []).map((c) => c.text ?? "").join("");

function toMdast(n: JSONContent): RootContent | null {
  const a = n.attrs ?? {};
  switch (n.type) {
    case "paragraph": return { type: "paragraph", children: phrasing(n.content ?? []) } as Paragraph;
    case "heading": {
      const children = phrasing(n.content ?? []);
      if (a.anchor) children.push({ type: "text", value: ` {#${a.anchor}}` } as Text);
      const prev = children[children.length - 2], last = children[children.length - 1];
      if (prev?.type === "text" && last?.type === "text") { prev.value += last.value; children.pop(); }
      return { type: "heading", depth: a.level === 3 ? 3 : 2, children } as Heading;
    }
    case "bulletList": case "orderedList":
      return {
        type: "list",
        ordered: n.type === "orderedList",
        ...(n.type === "orderedList" && a.start !== 1 ? { start: a.start as number } : {}),
        spread: false,
        children: (n.content ?? []).map((li) => ({ type: "listItem", spread: false, children: (li.content ?? []).map(toMdast).filter(Boolean) as BlockContent[] }) as ListItem),
      } as List;
    case "table": {
      const t: Table = {
        type: "table",
        align: (a.align as Table["align"]) ?? null,
        children: (n.content ?? []).map((r) => ({ type: "tableRow", children: (r.content ?? []).map((c) => ({ type: "tableCell", children: phrasing(c.content?.[0]?.content ?? []) }) as TableCell) }) as TableRow),
      };
      return a.caption || a.sort ? jsxBlock("Table", [["caption", a.caption], ["sort", a.sort]], [t]) : t;
    }
    case "note": return jsxBlock("Note", [["kind", a.kind]], (n.content ?? []).map(toMdast).filter(Boolean) as BlockContent[]);
    case "codeFig": return jsxBlock("Code", [["caption", a.caption]], [{ type: "code", lang: (a.lang as string) ?? null, value: textOf(n) } as Code]);
    case "simFig": return jsxBlock("Sim", [["mode", a.mode], ["caption", a.caption], ["name", a.name]], [{ type: "code", lang: (a.lang as string) ?? null, value: textOf(n) } as Code]);
    case "demoFig": return jsxBlock("Demo", [["mode", a.mode], ["title", a.title], ["caption", a.caption]], [{ type: "code", lang: (a.lang as string) ?? null, value: textOf(n) } as Code]);
    case "diagram": return jsxBlock("Diagram", [["id", a.id]]);
    case "rys": return jsxBlock("Rys", [["id", a.id]]);
    case "obraz": return jsxBlock("Obraz", [["src", a.src], ["alt", a.alt], ["caption", a.caption]]);
    case "widget": return jsxBlock("Widget", [["id", a.id]]);
    default: return null;
  }
}

const OPTS = { extensions: [mdxToMarkdown(), gfmToMarkdown()], bullet: "*" as const, listItemIndent: "one" as const, rule: "-" as const };

/** Jeden blok dokumentu → MDX (bez końcowego \n). */
export function blockToMdx(n: JSONContent): string {
  if (n.type === "raw") return String(n.attrs?.src ?? "");
  const m = toMdast(n);
  if (!m) return "";
  if (m.type === "paragraph" && m.children.length === 0) return "";
  return toMarkdown({ type: "root", children: [m] } as Root, OPTS).replace(/\n+$/, "");
}

/** Kanoniczny zapis bloku do porównania z oryginałem (bez oid). */
export function canon(n: JSONContent): string {
  const strip = (x: JSONContent): JSONContent => {
    const { oid: _oid, ...attrs } = x.attrs ?? {};
    void _oid;
    return { ...x, ...(x.attrs ? { attrs } : {}), ...(x.content ? { content: x.content.map(strip) } : {}) };
  };
  return JSON.stringify(strip(n));
}

/** Dokument → MDX. Bloki niezmienione (oid + ten sam kanoniczny JSON) wracają jako oryginalny fragment. */
export function docToMdx(doc: JSONContent, p: Pick<Parsed, "origins" | "lead" | "tail" | "seps">): string {
  const parts: string[] = [];
  let prev = "";
  for (const n of doc.content ?? []) {
    const oid = n.attrs?.oid as string | undefined;
    const o = oid ? p.origins.get(oid) : undefined;
    const same = !!o && o.canon !== undefined && o.canon === canon(n);
    const text = same ? o!.src : blockToMdx(n);
    if (!text) { prev = ""; continue; } // pusty akapit (np. końcowy) nie trafia do pliku
    const sep = parts.length === 0 ? "" : (same && prev && p.seps.get(`${prev}>${oid}`)) || "\n\n";
    parts.push(sep + text);
    prev = same ? oid! : "";
  }
  if (!parts.length) return "";
  return p.lead + parts.join("") + (p.tail || "\n");
}
