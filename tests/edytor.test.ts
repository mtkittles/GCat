import { readdirSync, readFileSync } from "node:fs";
import { getSchema, type JSONContent } from "@tiptap/core";
import { Node as PMNode } from "@tiptap/pm/model";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { canon, docToMdx, mdxToDoc } from "@/lib/edytor/mdx";
import { gcatExtensions } from "@/lib/edytor/schema";
import { joinFile, splitFile } from "@/lib/edytor/plik";
import { rysunekYaml } from "@/lib/edytor/rysunek";
import { rodzaj, sprawdzHaslo, sprawdzObraz, sprawdzRysunek } from "@/lib/edytor/walidacja";
import { rysunki } from "@/components/rys/registry";
import { parseDoc } from "@/lib/rys/model";
import { compileContent, renderContent } from "@/lib/mdx/compile";
import { componentNames, diagramIds, mdxComponents } from "@/lib/mdx/components";
import { liveSources } from "@/lib/mdx/live";

const schema = getSchema(gcatExtensions());
const KODY = readdirSync("content/kody").filter((f) => f.endsWith(".mdx")).sort();

/** Jak w edytorze: dokument po normalizacji schematem + kanoniczne bloki zapamiętane jako oryginał. */
function load(body: string) {
  const p = mdxToDoc(body);
  const doc = PMNode.fromJSON(schema, p.doc).toJSON() as JSONContent;
  for (const n of doc.content ?? []) {
    const o = n.attrs?.oid ? p.origins.get(n.attrs.oid) : undefined;
    if (o) o.canon = canon(n);
  }
  return { p, doc };
}
const opts = { file: "test.mdx", components: componentNames, diagramIds, sources: liveSources };
const html = async (mdx: string) => renderToStaticMarkup(await renderContent(await compileContent(mdx, opts), mdxComponents));

describe("edytor: MDX ↔ dokument", () => {
  it.each(KODY)("%s: dokument bez zmian zapisuje się bajt w bajt", (f) => {
    const { body } = splitFile(readFileSync(`content/kody/${f}`, "utf8"));
    const { p, doc } = load(body);
    expect(docToMdx(doc, p)).toBe(body);
    expect(doc.content!.filter((n) => n.type === "raw").map((n) => n.attrs?.src)).toEqual([]); // edytor zna każdy blok kart
  });

  it.each(KODY)("%s: każdy blok zapisany na nowo daje tę samą stronę", async (f) => {
    const { body } = splitFile(readFileSync(`content/kody/${f}`, "utf8"));
    const { p, doc } = load(body);
    for (const o of p.origins.values()) o.canon = undefined; // wymuś serializację wszystkich bloków
    const again = docToMdx(doc, p);
    expect(await html(again)).toBe(await html(body));
    // drugi przebieg jest stały (zapis jest idempotentny)
    const second = load(again);
    for (const o of second.p.origins.values()) o.canon = undefined;
    expect(docToMdx(second.doc, second.p)).toBe(again);
  }, 30000);

  it("zmiana jednego akapitu zmienia w pliku tylko ten akapit", () => {
    const { body } = splitFile(readFileSync("content/kody/g00.mdx", "utf8"));
    const { p, doc } = load(body);
    const i = doc.content!.findIndex((n) => n.type === "paragraph");
    doc.content![i] = { ...doc.content![i], content: [{ type: "text", text: "Nowy akapit z " }, { type: "term", attrs: { k: "G01", label: null } }, { type: "text", text: " i ", marks: [{ type: "bold" }] }, { type: "text", text: "F100", marks: [{ type: "bold" }, { type: "code" }] }] };
    const out = docToMdx(doc, p);
    const diff = out.split("\n").filter((l, k) => l !== body.split("\n")[k]);
    expect(diff).toEqual(["Nowy akapit z \\[\\[G01]] **i `F100`**"]);
  });

  it("nowe bloki: nagłówek z kotwicą, ramka, tabela z podpisem, kolor, program", () => {
    const { p } = load("");
    const doc: JSONContent = { type: "doc", content: [
      { type: "heading", attrs: { level: 2, anchor: "nowa-sekcja" }, content: [{ type: "text", text: "Nowa sekcja" }] },
      { type: "note", attrs: { kind: "warn" }, content: [{ type: "paragraph", content: [{ type: "text", text: "Uważaj na " }, { type: "text", text: "G00", marks: [{ type: "kolor", attrs: { k: "g00" } }] }] }] },
      { type: "table", attrs: { caption: "Porównanie", align: null }, content: [
        { type: "tableRow", content: [{ type: "tableHeader", content: [{ type: "paragraph", content: [{ type: "text", text: "A" }] }] }, { type: "tableHeader", content: [{ type: "paragraph", content: [{ type: "text", text: "B" }] }] }] },
        { type: "tableRow", content: [{ type: "tableCell", content: [{ type: "paragraph", content: [{ type: "term", attrs: { k: "zero detalu", label: "zero" } }] }] }, { type: "tableCell", content: [{ type: "paragraph", content: [{ type: "text", text: "x", marks: [{ type: "code" }] }] }] }] },
      ] },
      { type: "simFig", attrs: { mode: "lathe", caption: "Toczenie", name: "" }, content: [{ type: "text", text: "G00 X20.\nG01 Z-5. F0.2" }] },
    ] };
    expect(docToMdx(PMNode.fromJSON(schema, doc).toJSON(), p)).toBe([
      "## Nowa sekcja \\{#nowa-sekcja}",
      "",
      '<Note kind="warn">',
      '  Uważaj na <Kolor k="g00">G00</Kolor>',
      "</Note>",
      "",
      '<Table caption="Porównanie">',
      "  | A                       | B   |",
      "  | ----------------------- | --- |",
      "  | \\[\\[zero detalu\\|zero]] | `x` |",
      "</Table>",
      "",
      '<Sim mode="lathe" caption="Toczenie">',
      "  ```",
      "  G00 X20.",
      "  G01 Z-5. F0.2",
      "  ```",
      "</Sim>",
      "",
    ].join("\n"));
  });
});

describe("edytor: plik i frontmatter", () => {
  it("plik bez zmian składa się z powrotem identycznie; zmiana pola nie rusza innych", () => {
    const src = readFileSync("content/kody/g00.mdx", "utf8");
    const f = splitFile(src);
    expect(joinFile(f, f.data)).toBe(src);
    const out = joinFile(f, { ...f.data, name: "Ruch szybki" });
    const changed = out.split("\n").filter((l, k) => l !== src.split("\n")[k]);
    expect(changed).toEqual(["name: Ruch szybki"]);
  });
});

describe("edytor: słownik i rysunki", () => {
  const HASLA = readdirSync("content/slownik").filter((f) => f.endsWith(".yaml")).sort();
  it.each(HASLA)("%s: plik hasła bez zmian składa się identycznie, zmiana pola rusza tylko to pole", (f) => {
    const src = readFileSync(`content/slownik/${f}`, "utf8");
    const p = splitFile(src, "yaml");
    expect(joinFile(p, p.data)).toBe(src);
    const out = joinFile(p, { ...p.data, def: "Nowa definicja." });
    const before = src.split("\n"), after = out.split("\n");
    expect(after.filter((l) => !before.includes(l))).toEqual(["def: Nowa definicja."]);
    expect(sprawdzHaslo(`content/slownik/${f}`, src, { rysIds: new Set(rysunki.map((r) => r.slug)) })).toEqual([]);
  });

  it("nowy rysunek z rysownika zapisuje się w formacie, który przyjmuje loader", () => {
    const doc = parseDoc({ h: 200, items: [{ t: "line", k: "cut", x1: 10, y1: 10, x2: 100, y2: 50, arrow: "end" }, { t: "circle", cx: 50, cy: 50, r: 20 }, { t: "text", x: 5, y: 5, s: "Opis [[G01]]" }] });
    const text = rysunekYaml({ title: "Test", code: "", caption: "Zob. [[G01]]", legend: [] }, doc);
    expect(sprawdzRysunek("content/rysunki/test.yaml", text)).toEqual([]);
    expect(sprawdzRysunek("content/rysunki/test.yaml", text.replace("[[G01]]", "[[nie-ma-takiego]]"))[0]?.message).toMatch(/nie ma takiej karty/);
  });

  it("obraz: sygnatura pliku zgodna z rozszerzeniem, SVG bez skryptów", () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(sprawdzObraz("public/rysunki/a.png", png)).toEqual([]);
    expect(sprawdzObraz("public/rysunki/a.jpg", png)[0].message).toMatch(/JPG/);
    expect(sprawdzObraz("public/rysunki/a.svg", new TextEncoder().encode('<svg onload="x()"></svg>'))[0].message).toMatch(/skrypt/);
    expect(rodzaj("public/rysunki/a.png")?.kind).toBe("obraz");
    expect(rodzaj("public/inne/a.png")).toBeUndefined();
    expect(rodzaj("content/slownik/kąt-przystawienia.yaml")?.kind).toBe("haslo");
  });
});
