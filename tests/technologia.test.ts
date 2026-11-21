import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { getSchema, type JSONContent } from "@tiptap/core";
import { Node as PMNode } from "@tiptap/pm/model";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { canon, docToMdx, mdxToDoc } from "@/lib/edytor/mdx";
import { joinFile, pairYaml, splitFile } from "@/lib/edytor/plik";
import { gcatExtensions } from "@/lib/edytor/schema";
import { nowyArtykul, slugTytulu, SZABLONY } from "@/lib/edytor/szablony";
import { rodzaj, sprawdzArtykul } from "@/lib/edytor/walidacja";
import { editTarget } from "@/lib/edycja";
import { can } from "@/lib/entitlements";
import { compileContent, renderContent } from "@/lib/mdx/compile";
import { componentNames, diagramIds, mdxComponents } from "@/lib/mdx/components";
import { liveSources } from "@/lib/mdx/live";
import { loadContent } from "@/lib/mdx/loader";
import { mdxPrograms } from "@/lib/mdx/programs";
import { ARTYKUL_TYPY, artykulSchema } from "@/lib/mdx/schema";
import { firstThumb, readingMinutes } from "@/lib/mdx/tech-meta";
import { compareCells, numOf } from "@/components/ui/SortTable";
import { search } from "@/lib/searchIndex";
import { artykuly, artykulow, dzialy, lekcje, publicArts } from "@/lib/technologia";
import sitemap from "@/app/sitemap";

/*
  Technologia (V3.0): treść, format zapisu edytora, kontrola przed zapisem, szablony, Pro i obejście dla redakcji,
  wyszukiwarka, mapa strony, tabela sortowana.
*/

const schema = getSchema(gcatExtensions());
const DIR = "content/technologia";
const PLIKI = readdirSync(DIR).filter((d) => statSync(`${DIR}/${d}`).isDirectory())
  .flatMap((d) => readdirSync(`${DIR}/${d}`).filter((f) => f.endsWith(".mdx")).map((f) => `${DIR}/${d}/${f}`)).sort();

/** Plik zapisany na nowo przez edytor (każde pole i każdy blok od zera) — format zapisu edytora. */
function kanon(text: string): string {
  const f = splitFile(text);
  const yaml = Object.entries(f.data).map(([k, v]) => pairYaml(k, v)).join("");
  const p = mdxToDoc(f.body);
  const doc = PMNode.fromJSON(schema, p.doc).toJSON() as JSONContent;
  return `---\n${yaml}---\n${docToMdx(doc, { origins: new Map(), lead: p.lead, tail: p.tail, seps: new Map() })}`;
}
/** Jak w edytorze: bloki bez zmian zapisują się jak w pliku. */
function load(body: string) {
  const p = mdxToDoc(body);
  const doc = PMNode.fromJSON(schema, p.doc).toJSON() as JSONContent;
  for (const n of doc.content ?? []) { const o = n.attrs?.oid ? p.origins.get(n.attrs.oid) : undefined; if (o) o.canon = canon(n); }
  return { p, doc };
}
const html = async (mdx: string) => renderToStaticMarkup(await renderContent(await compileContent(mdx, { file: "t.mdx", components: componentNames, diagramIds, sources: liveSources }), mdxComponents));

describe("Technologia: treść", () => {
  it("dzialy.yaml: 7 działów w kolejności planu, Narzędzia i Płytki ISO szersze", async () => {
    const c = await loadContent("content", { lessonIds: new Set(lekcje.map((l) => l.id)) });
    expect(c.technologia.dzialy.map((d) => d.slug)).toEqual(["narzedzia", "plytki-iso", "obliczenia", "proces", "mocowanie", "materialy", "strategie"]);
    expect(c.technologia.dzialy.filter((d) => d.big).map((d) => d.slug)).toEqual(["narzedzia", "plytki-iso"]);
    expect(c.technologia.artykuly.length).toBe(PLIKI.length);
  });

  it("po jednym artykule pilotażowym na szablon, każdy ze źródłami i oznaczony do weryfikacji", () => {
    expect([...new Set(artykuly.map((a) => a.typ))].sort()).toEqual([...ARTYKUL_TYPY].sort());
    for (const a of artykuly) { expect(a.sources.length, a.key).toBeGreaterThan(0); expect(a.stan, a.key).toBe("szkic"); }
  });

  it.each(PLIKI)("%s: format zapisu edytora (zapis od zera = plik)", (f) => {
    const text = readFileSync(f, "utf8");
    expect(kanon(text)).toBe(text);
  });

  it.each(PLIKI)("%s: otwarty i zapisany bez zmian w edytorze = zero różnic", (f) => {
    const text = readFileSync(f, "utf8");
    const file = splitFile(text);
    const { p, doc } = load(file.body);
    expect(joinFile(file, file.data, docToMdx(doc, p))).toBe(text);
    expect(doc.content!.filter((n) => n.type === "raw")).toEqual([]); // edytor zna każdy blok
  });

  it.each(PLIKI)("%s: kontrola edytora (te same reguły co build) — bez błędów", async (f) => {
    const { problems } = await sprawdzArtykul(f.replace(/^\.\//, ""), readFileSync(f, "utf8"));
    expect(problems).toEqual([]);
  });
});

describe("Technologia: kontrola przed zapisem", () => {
  const base = readFileSync(`${DIR}/narzedzia/frez-trzpieniowy-walcowy.mdx`, "utf8");
  const path = "content/technologia/narzedzia/frez-trzpieniowy-walcowy.mdx";
  const zmien = (data: Record<string, unknown>) => { const f = splitFile(base); return joinFile(f, { ...f.data, ...data }); };

  it("rodzaj „artykul” w SCIEZKI: content/technologia/<dział>/<slug>.mdx", () => {
    expect(rodzaj(path)?.kind).toBe("artykul");
    expect(rodzaj("content/technologia/narzedzia/Frez.mdx")).toBeUndefined();
    expect(rodzaj("content/technologia/dzialy.yaml")).toBeUndefined();
  });

  it("zły dział, slug, źródło, powiązania — błędy z nazwą pola", async () => {
    const f = splitFile(base);
    const pow = f.data.powiazane as Record<string, unknown>;
    const bad = joinFile(f, { ...f.data, slug: "inny", typ: "esej", sources: [{ id: "nie-ma", where: "x", loc: "", url: "" }], powiazane: { ...pow, kody: ["g999"], lekcje: ["F99.9"], hasla: ["nie-ma-hasla"] } });
    const { problems } = await sprawdzArtykul(path, bad);
    const where = problems.map((p) => p.where).join(" | ");
    expect(where).toMatch(/typ/);
    const r2 = await sprawdzArtykul(path, zmien({ slug: "inny" }));
    expect(r2.problems.map((p) => p.where)).toContain("slug");
    const r3 = await sprawdzArtykul(path, zmien({ sources: [{ id: "nie-ma", where: "x", loc: "", url: "" }], powiazane: { ...pow, kody: ["g999"], lekcje: ["F99.9"], hasla: ["nie-ma-hasla"], artykuly: ["narzedzia/frez-trzpieniowy-walcowy"] } }));
    expect(r3.problems.map((p) => p.where).sort()).toEqual(["powiązane artykuły", "powiązane hasła", "powiązane kody", "powiązane lekcje", "źródło 1"]);
  });

  it("nieznany komponent i marker w treści — błąd treści", async () => {
    const r = await sprawdzArtykul(path, base + "\n<Nieznany />\n\nTekst [[nie-ma-takiego-hasla]].\n");
    expect(r.problems.filter((p) => p.where === "treść").length).toBeGreaterThan(0);
  });
});

describe("Technologia: szablony i nowy artykuł", () => {
  it.each(ARTYKUL_TYPY)("szablon %s: plik w formacie edytora, przechodzi kontrolę", async (typ) => {
    const text = nowyArtykul({ dzial: "proces", typ, title: "Test szablonu", slug: "test-szablonu", order: 10, dodano: "2026-11-21", obrobka: ["toczenie"] });
    expect(kanon(text)).toBe(text);
    expect(artykulSchema.safeParse(splitFile(text).data).success).toBe(true);
    const { problems, meta } = await sprawdzArtykul("content/technologia/proces/test-szablonu.mdx", text);
    expect(problems).toEqual([]);
    expect(meta!.headings.map((h) => h.label)).toEqual(SZABLONY[typ].sekcje.filter((s) => s !== "Wstęp" && s !== "Tabela"));
  });

  it("slug z tytułu: bez polskich znaków, tylko małe litery, cyfry i myślniki", () => {
    expect(slugTytulu("Frez trzpieniowy kulisty — ⌀10")).toBe("frez-trzpieniowy-kulisty-10");
    expect(slugTytulu("Łamacze wióra, żeliwo i ŻŁÓĆ")).toBe("lamacze-wiora-zeliwo-i-zloc");
  });

  it("miniatura i czas czytania", () => {
    expect(firstThumb('Tekst\n\n<Rys id="a-b" />\n\n<Diagram id="vc" />')).toEqual({ kind: "rys", id: "a-b" });
    expect(firstThumb("bez rysunku")).toBeNull();
    expect(readingMinutes("słowo ".repeat(10))).toBe(1);
    expect(readingMinutes("słowo ".repeat(900))).toBe(5);
  });
});

describe("Technologia: tabela sortowana", () => {
  it("<Table sort> przechodzi przez edytor i zapisuje atrybut", () => {
    const body = '<Table caption="Podpis" sort="true">\n  | A | B |\n  | - | - |\n  | 1 | 2 |\n</Table>\n';
    const { p, doc } = load(body);
    expect(doc.content![0].attrs?.sort).toBe("true");
    for (const o of p.origins.values()) o.canon = undefined;
    expect(docToMdx(doc, p)).toMatch(/<Table caption="Podpis" sort="true">/);
    doc.content![0].attrs = { ...doc.content![0].attrs, sort: "" };
    expect(docToMdx(doc, p)).toMatch(/<Table caption="Podpis">/);
  });

  it("strona: tabela z sort ma przyciski w nagłówkach, bez sort — zwykła", async () => {
    const t = '<Table caption="X" sort="true">\n  | Materiał | HV |\n  | - | - |\n  | b | 500–3000 |\n  | a | 200–1200 |\n</Table>\n';
    expect(await html(t)).toMatch(/class="st-btn"/);
    expect(await html(t.replace(' sort="true"', ""))).not.toMatch(/st-btn/);
  });

  it("porównanie komórek: liczby (zakresy, przecinek, spacja tysięcy) liczbowo, reszta alfabetycznie", () => {
    expect(numOf("8000–12 000")).toBe(8000);
    expect(numOf("12 000")).toBe(12000);
    expect(numOf("0,05 mm")).toBe(0.05);
    expect(compareCells("200–1200", "1000–4000")).toBeLessThan(0);
    expect(compareCells("cermetal", "ceramika")).toBeGreaterThan(0);
    expect(compareCells("węglik", "ceramika")).toBeGreaterThan(0);
  });
});

describe("Technologia: Pro, szukajka, mapa strony, tryb edycji", () => {
  it("can(): konto redakcji widzi wszystko bez względu na plan", () => {
    expect(can("free", "proContent")).toBe(false);
    expect(can("pro", "proContent")).toBe(true);
    expect(can("free", "proContent", { admin: true })).toBe(true);
    expect(can("free", "exports", { admin: true })).toBe(true);
    expect(can("free", "sync")).toBe(true);
    expect(can("free", "certificate")).toBe(false);
  });

  it("publiczne listy pomijają artykuły Pro", () => {
    expect(publicArts.every((a) => a.plan === "free")).toBe(true);
    expect(publicArts.length).toBe(artykuly.filter((a) => a.plan === "free").length);
  });

  it("wyszukiwarka zna artykuły (także po tekście treści)", () => {
    expect(search("trzpieniowy").some((h) => h.kind === "artykuł" && h.href === "/technologia/narzedzia/frez-trzpieniowy-walcowy")).toBe(true);
    expect(search("cermetal").some((h) => h.href === "/technologia/materialy/materialy-narzedziowe")).toBe(true);
  });

  it("mapa strony: /technologia, działy i artykuły publiczne", () => {
    const urls = sitemap().map((u) => new URL(u.url).pathname);
    expect(urls).toContain("/technologia");
    for (const d of dzialy) expect(urls).toContain(`/technologia/${d.slug}`);
    for (const a of publicArts) expect(urls).toContain(`/technologia/${a.dzial}/${a.slug}`);
  });

  it("tryb edycji: przycisk na stronach Technologii", () => {
    expect(editTarget("/technologia/narzedzia/frez-trzpieniowy-walcowy")?.href).toBe("/edytor/technologia/narzedzia/frez-trzpieniowy-walcowy");
    expect(editTarget("/technologia/narzedzia")?.href).toBe("/edytor/technologia/nowy?dzial=narzedzia");
    expect(editTarget("/technologia")?.href).toBe("/edytor#technologia");
  });

  it("odmiana liczby artykułów", () => {
    expect([1, 2, 5, 12, 22].map(artykulow)).toEqual(["1 artykuł", "2 artykuły", "5 artykułów", "12 artykułów", "22 artykuły"]);
  });

  it("programy w artykułach są w audycie (wspólny odczyt <Sim>/<Demo>)", () => {
    const n = PLIKI.reduce((s, f) => s + mdxPrograms(readFileSync(f, "utf8")).length, 0);
    expect(n).toBeGreaterThanOrEqual(2);
    expect(existsSync("scripts/audit-technologia.ts")).toBe(true);
  });
});
