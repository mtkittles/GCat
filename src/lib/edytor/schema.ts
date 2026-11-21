import { Extension, Mark, Node, mergeAttributes, type AnyExtension } from "@tiptap/core";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import { Placeholder } from "@tiptap/extensions";
import StarterKit from "@tiptap/starter-kit";

/*
  Schemat dokumentu edytora treści GCat (TipTap/ProseMirror) — ten sam zamknięty zestaw co MDX kart:
  akapit, nagłówek (kotwica jawna), listy, tabela GFM (z podpisem), ramki <Note>, programy <Code>/<Sim>/<Demo>,
  rysunki <Diagram>/<Rys>, <Obraz>, <Widget>, odnośnik [[…]] (węzeł „term”), wyróżnienia: pogrubienie, kursywa,
  `kod`, kolor z gotowego zestawu (<Kolor>), link.
  Tu tylko definicje (bez React) — schemat jest też budowany w testach (round-trip wszystkich kart).
  Widoki bloków dokłada warsztat (src/components/edytor/views.tsx) przez .extend({ addNodeView }).
  `oid` (atrybut globalny, nie trafia do HTML) wiąże blok najwyższego poziomu z jego źródłem w pliku:
  blok niezmieniony zapisuje się dokładnie tak, jak był (zero różnic w niezmienionych częściach).
*/

export const NOTE_KINDS = ["tip", "warn", "info"] as const;
export type NoteKind = (typeof NOTE_KINDS)[number];
export const NOTE_LABEL: Record<NoteKind, string> = { tip: "Wskazówka", warn: "Uwaga", info: "Warto wiedzieć" };
export const KOLORY = ["g00", "g01", "g02", "akcent", "blad"] as const;
export type KolorK = (typeof KOLORY)[number];
export const KOLOR_LABEL: Record<KolorK, string> = { g00: "G00 — ruch szybki", g01: "G01 — ruch roboczy", g02: "G02/G03 — łuk", akcent: "Akcent", blad: "Błąd / kolizja" };
export const WIDGETS = ["rij", "arc", "jog"] as const;
export const WIDGET_LABEL: Record<(typeof WIDGETS)[number], string> = { rij: "Kalkulator R ↔ I, J", arc: "Kalkulator łuku", jog: "Ręczny przesuw osi" };

/** Bloki najwyższego poziomu, które pamiętają swoje źródło (oid). */
export const TOP_TYPES = ["paragraph", "heading", "bulletList", "orderedList", "table", "note", "codeFig", "simFig", "demoFig", "diagram", "rys", "obraz", "widget", "raw"];

const str = (name: string, def: string | null = "") => ({ default: def, parseHTML: (el: HTMLElement) => el.getAttribute(`data-${name}`) ?? def, renderHTML: (a: Record<string, unknown>) => (a[name] == null ? {} : { [`data-${name}`]: a[name] }) });

const Origin = Extension.create({
  name: "origin",
  addGlobalAttributes() {
    return [{ types: TOP_TYPES, attributes: { oid: { default: null, rendered: false, keepOnSplit: false } } }];
  },
});

export const Term = Node.create({
  name: "term",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,
  addAttributes() { return { k: str("k"), label: str("label", null) }; },
  parseHTML() { return [{ tag: "span[data-term]" }]; },
  renderHTML({ node, HTMLAttributes }) { return ["span", mergeAttributes(HTMLAttributes, { "data-term": "", class: "ed-term" }), String(node.attrs.label ?? node.attrs.k)]; },
  renderText({ node }) { return String(node.attrs.label ?? node.attrs.k); },
});

export const Kolor = Mark.create({
  name: "kolor",
  addAttributes() { return { k: str("k", "akcent") }; },
  parseHTML() { return [{ tag: "span[data-k]" }]; },
  renderHTML({ HTMLAttributes }) { return ["span", mergeAttributes(HTMLAttributes, { class: `kolor kolor-${HTMLAttributes["data-k"]}` }), 0]; },
});

export const Note = Node.create({
  name: "note",
  group: "block",
  content: "(paragraph | bulletList | orderedList)+",
  defining: true,
  addAttributes() { return { kind: str("kind", "info") }; },
  parseHTML() { return [{ tag: "div[data-note]" }]; },
  renderHTML({ node, HTMLAttributes }) { return ["div", mergeAttributes(HTMLAttributes, { "data-note": "", role: "note", class: `note note-${node.attrs.kind}` }), 0]; },
});

/** Program w treści: <Code> (do przeczytania), <Sim> (animacja z symulatorem), <Demo> (animacja z tytułem). Treść = tekst programu. */
const program = (name: string, attrs: Record<string, ReturnType<typeof str>>) => Node.create({
  name,
  group: "block",
  content: "text*",
  marks: "",
  code: true,
  defining: true,
  isolating: true,
  addAttributes() { return { ...attrs, lang: { default: null, rendered: false } }; },
  parseHTML() { return [{ tag: `figure[data-${name}]`, preserveWhitespace: "full" as const }]; },
  renderHTML({ HTMLAttributes }) { return ["figure", mergeAttributes(HTMLAttributes, { [`data-${name}`]: "" }), ["pre", { class: "syntax" }, 0]]; },
});
export const CodeFig = program("codeFig", { caption: str("caption") });
export const SimFig = program("simFig", { mode: str("mode", "mill"), caption: str("caption"), name: str("name") });
export const DemoFig = program("demoFig", { mode: str("mode", "mill"), title: str("title"), caption: str("caption") });

const atomBlock = (name: string, attrs: Record<string, ReturnType<typeof str>>) => Node.create({
  name,
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,
  addAttributes() { return attrs; },
  parseHTML() { return [{ tag: `div[data-${name}]` }]; },
  renderHTML({ HTMLAttributes }) { return ["div", mergeAttributes(HTMLAttributes, { [`data-${name}`]: "" })]; },
});
export const DiagramNode = atomBlock("diagram", { id: str("id") });
export const RysNode = atomBlock("rys", { id: str("id"), /** rysunek z biblioteki, który ten zastąpił (przywrócenie w panelu; nie trafia do pliku) */ was: { default: "", rendered: false } as unknown as ReturnType<typeof str> });
export const ObrazNode = atomBlock("obraz", { src: str("src"), alt: str("alt"), caption: str("caption") });
export const WidgetNode = atomBlock("widget", { id: str("id", "rij") });
/** Blok, którego edytor nie zna — zostaje w pliku bez zmian (źródło MDX widoczne i edytowalne jako tekst). */
export const RawNode = atomBlock("raw", { src: str("src") });

const GfmTable = Table.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      caption: { default: "", rendered: false },
      /** "true" — tabela sortowana kliknięciem w nagłówek (<Table sort="true">, porównania w Technologii) */
      sort: { default: "", rendered: false },
      /** wyrównanie kolumn z tabeli GFM (null | left | center | right) — zapisywane bez zmian */
      align: { default: null, rendered: false },
    };
  },
}).configure({ resizable: false, renderWrapper: false, View: null }); // bez widoku kolumn: renderHTML pokazuje podpis nad tabelą
const Cell = TableCell.extend({ content: "paragraph" });
const Header = TableHeader.extend({ content: "paragraph" });

/** Nagłówek: atrybut `anchor` (kotwica {#…}); edytor pilnuje unikalności i nadaje kotwicę nowym nagłówkom. */
const anchorAttr = Extension.create({
  name: "anchorAttr",
  addGlobalAttributes() {
    return [{ types: ["heading"], attributes: {
      anchor: { default: "", renderHTML: (a: Record<string, unknown>) => (a.anchor ? { id: a.anchor } : {}), parseHTML: (el: HTMLElement) => el.id || "" },
      /** kotwica idzie za tekstem nagłówka (nowy nagłówek); false = kotwica z pliku albo wpisana ręcznie */
      autoAnchor: { default: false, rendered: false },
    } }];
  },
});

/** Lista rozszerzeń schematu (bez widoków). `placeholder` — podpowiedź w pustym dokumencie (tylko w przeglądarce). */
export function gcatExtensions(o: { placeholder?: string } = {}): AnyExtension[] {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3] },
      blockquote: false,
      codeBlock: false,
      horizontalRule: false,
      strike: false,
      underline: false,
      link: { openOnClick: false, autolink: false, linkOnPaste: true },
      code: { HTMLAttributes: { class: "inline-code" } },
      trailingNode: { node: "paragraph" },
    }),
    Origin,
    anchorAttr,
    Term,
    Kolor,
    Note,
    CodeFig,
    SimFig,
    DemoFig,
    DiagramNode,
    RysNode,
    ObrazNode,
    WidgetNode,
    RawNode,
    GfmTable,
    TableRow,
    Header,
    Cell,
    ...(o.placeholder ? [Placeholder.configure({ placeholder: o.placeholder })] : []),
  ];
}
