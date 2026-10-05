import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createElement as h, Fragment } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { articles } from "@/content/articles";
import { diagrams } from "@/components/diagrams";
import CodeText from "@/components/CodeText";
import { rich } from "@/components/Rich";
import { gcodes } from "@/lib/gcodes";
import { compileContent, renderContent } from "@/lib/mdx/compile";
import { componentNames, diagramIds, mdxComponents } from "@/lib/mdx/components";
import { ContentErrors, loadContent } from "@/lib/mdx/loader";
import { MARKER_RE } from "@/lib/mdx/remark";
import { knownCodes, resolveKey, selfCodes } from "@/lib/mdx/resolve";
import { applyApproved, ZATWIERDZONE } from "./zatwierdzone";

/*
  Szkielet MDX (krok 2): fixture → loader → plugin remark → render.
  Fixture leży w tests/fixtures/tresci i nie jest czytany przez żadną stronę.
*/

const FIX = "tests/fixtures/tresci";
const CARD = `${FIX}/kody/g17-g19.mdx`;
/** id z useId() (aria-controls) zależy od kolejności renderu — pomijany w porównaniach */
const N = (s: string) => s.replace(/ aria-controls="[^"]*"/g, "");
const html = async (code: string, components = {}) => N(renderToStaticMarkup(await renderContent(code, { ...mdxComponents, ...components })));
const opts = { file: "test.mdx", components: componentNames, diagramIds };
const md = (src: string, extra: Partial<Parameters<typeof compileContent>[1]> = {}) => compileContent(src, { ...opts, ...extra });
const hashDir = (dir: string): string => {
  const hsh = createHash("sha1");
  const walk = (d: string) => { for (const f of readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) { const p = path.join(d, f.name); if (f.isDirectory()) walk(p); else hsh.update(p).update(readFileSync(p)); } };
  walk(dir);
  return hsh.digest("hex");
};

describe("loader: fixture content/", () => {
  it("czyta wszystkie typy plików, slugi i kotwice = nazwy plików, pliki bez zmian", async () => {
    const before = hashDir(FIX);
    const c = await loadContent(FIX);
    expect(hashDir(FIX)).toBe(before);

    expect(c.kody.map((k) => k.data.slug)).toEqual(["g17-g19"]);
    expect(c.kody[0].data).toMatchObject({ name: "Wybór płaszczyzny", star: false, related: ["g02", "g40-g42"], syntax: { fanuc: "G17 | G18 | G19" } });
    expect(c.kody[0].self).toEqual(["G17", "G18", "G19"]);
    expect(c.slownik.map((s) => s.data.anchor)).toEqual(["frezowanie-współbieżne"]);
    expect(c.lekcje.map((l) => [l.tor, l.data.id, l.data.slug])).toEqual([["frezowanie", "F9.1", "f9-1-test-lekcji"]]);
    expect(c.lekcje[0].cwiczenia.quiz[0]).toMatchObject({ kind: "gap", template: "G{0} — płaszczyzna XY" });
    expect(c.programy[0].data).toMatchObject({ slug: "plytka-testowa", dialect: "fanuc", redirectsFrom: ["stary-adres-testowy"] });
    expect(c.programy[0].nc).toContain("G02 X20 Y0 R10");
    expect(c.zadania.map((z) => z.data.slug)).toEqual(["plaszczyzna-testowa"]);
  });

  it("marker [[…]] zostaje dosłownie w pliku", () => {
    const src = readFileSync(CARD, "utf8");
    for (const m of ["[[G17]]", "[[G18]]", "[[G19]]", "[[funkcja modalna|modalna]]", "[[G02|G02/G03]]", "[[kompensacja promienia]]"]) expect(src).toContain(m);
    expect(src).not.toContain("<Term");
  });

  it("render karty: Term (karta, potem słownik), jawne kotwice, <Diagram>, tabela, `kod`", async () => {
    const c = await loadContent(FIX);
    const out = await html(c.kody[0].body);
    // kotwice jawne, bez {#…} w tekście
    expect([...out.matchAll(/<h2 id="([^"]+)">([^<]*)<\/h2>/g)].map((m) => [m[1], m[2]])).toEqual([["trzy-plaszczyzny", "Trzy płaszczyzny"], ["fanuc-i-sinumerik", "Fanuc i Sinumerik"]]);
    expect(out).not.toContain("{#");
    // markery → Term (ten sam HTML co rich() dla tych samych markerów)
    for (const [k, label] of [["G17", "G17"], ["funkcja modalna", "modalna"], ["G02", "G02/G03"], ["kompensacja promienia", "kompensacja promienia"]]) {
      expect(out).toContain(N(renderToStaticMarkup(h(Fragment, null, rich(`[[${k}|${label}]]`)))));
    }
    expect(out).not.toMatch(/\[\[|\]\]/);
    // marker w komórce tabeli z | nie dzieli komórki
    expect(out).toMatch(/<td data-label="Uwagi">łuki z <span class="term-wrap">.*?G02\/G03<\/button><\/span> i I, J<\/td>/);
    expect(out).toContain('<figure class="grid gap-1"><div class="overflow-x-auto"><table class="code-table tbl-stack"><thead><tr><th>Płaszczyzna</th>');
    // <Diagram> = ten sam rysunek co blok `diagram` w Article.tsx
    expect(out).toContain(renderToStaticMarkup(h("div", null, diagrams["g17-g19"]())));
    expect(out).toContain('<code class="inline-code">G17</code>');
    expect(out).toContain('<strong><code class="inline-code">G17</code></strong>');
  });

  it("pola karty: auto-linki gołych kodów G/M (G02, G41 → Term; G17 bieżącej karty — tylko wyróżniony)", async () => {
    const c = await loadContent(FIX);
    const out = await html(c.kody[0].fields.desc);
    expect(out).toContain('<code class="inline-code is-link">G02</code>');
    expect(out).toContain('<code class="inline-code is-link">G41</code>');
    expect(out).toContain('<code class="inline-code">G17</code>');
    expect(out).not.toContain('is-link">G17');
  });
});

describe("zgodność z dzisiejszym renderem (1:1)", () => {
  it("akapity artykułów: MDX == rich() (poza zatwierdzonymi wyjątkami z tests/zatwierdzone.ts)", async () => {
    const ps = Object.values(articles).flat().filter((b): b is { t: "p"; x: string } => b.t === "p").map((b) => b.x);
    expect(ps.length).toBeGreaterThan(100);
    const used = new Set<string>();
    for (const x of ps) {
      const want = applyApproved(N(renderToStaticMarkup(h("p", null, rich(x)))));
      want.used.forEach((u) => used.add(u));
      expect(await html(await md(x)), x).toBe(want.html);
    }
    // wszystkie 5 zatwierdzonych zmian dotyczy akapitów (3 akapity: g01, g68-g69, g84)
    expect([...used].sort()).toEqual(ZATWIERDZONE.map((a) => a.where).sort());
  });

  it("pola wszystkich 56 kart: MDX z auto-linkami == CodeText", async () => {
    const known = knownCodes();
    expect(gcodes.length).toBe(56);
    let n = 0;
    for (const g of gcodes) {
      const self = selfCodes(g.code);
      const fields = [g.short, ...g.desc.split(/\n\n+/), g.sinumerik, ...g.params.map((p) => p.desc), ...g.pitfalls];
      for (const t of fields) {
        const want = N(renderToStaticMarkup(h("p", null, h(CodeText, { text: t, self }))));
        expect(await html(await md(t, { autoCodes: { known, self } })), `${g.slug}: ${t}`).toBe(want);
        n++;
      }
    }
    expect(n).toBeGreaterThan(200);
  });

  it("wszystkie dzisiejsze markery rozwiązują się (karta albo słownik)", () => {
    const files = [...readdirSync("src/content", { recursive: true, withFileTypes: true })].filter((f) => f.isFile() && f.name.endsWith(".ts")).map((f) => path.join(f.parentPath, f.name));
    const keys = new Set<string>();
    for (const f of [...files, "content/gcodes.json"]) for (const m of readFileSync(f, "utf8").matchAll(MARKER_RE)) if (m[0] !== "[[...]]" && !/^["\d-]/.test(m[1])) keys.add(m[1]); // pomija tablice JSON odpowiedzi [["26"]]
    const missing = [...keys].filter((k) => !resolveKey(k));
    expect(keys.size).toBeGreaterThanOrEqual(60);
    expect(missing).toEqual([]);
  });

  it("postać z backslashami (edytor może ucieczkować nawiasy) działa tak samo", async () => {
    expect(await html(await md("Patrz \\[\\[G17\\]\\] i \\[\\[funkcja modalna|modalne\\]\\]."))).toBe(await html(await md("Patrz [[G17]] i [[funkcja modalna|modalne]].")));
  });
});

describe("błędy: czytelny komunikat z nazwą pliku", () => {
  const tmp = () => mkdtempSync(path.join(tmpdir(), "gcat-tresci-"));
  const put = (root: string, rel: string, s: string) => { mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); writeFileSync(path.join(root, rel), s); };
  const card = readFileSync(CARD, "utf8");
  const errs = async (root: string) => { try { await loadContent(root); } catch (e) { expect(e).toBeInstanceOf(ContentErrors); return (e as Error).message; } throw new Error("oczekiwano błędu"); };

  it("nierozpoznany marker, nagłówek bez kotwicy, zły <Diagram>, nieznany komponent, wyrażenie {…}", async () => {
    const r = tmp();
    put(r, "kody/g17-g19.mdx", card + "\n## Bez kotwicy\n\nZobacz [[G999]].\n\n<Diagram id=\"nie-ma\" />\n\n<Script />\n\n{1 + 1}\n");
    const m = await errs(r);
    expect(m).toMatch(/kody\/g17-g19\.mdx:\d+:\d+ — nagłówek bez jawnej kotwicy/);
    expect(m).toContain(`g17-g19.mdx:${card.split("\n").length + 3}:8 — marker [[G999]]: klucz „G999” nie pasuje`);
    expect(m).toContain('<Diagram id="nie-ma" /> — nie ma takiego rysunku');
    expect(m).toContain("nieznany komponent <Script>");
    expect(m).toContain("wyrażenie {…} jest niedozwolone");
    const lines = card.split("\n").length;
    expect(m).toContain(`g17-g19.mdx:${lines + 1}:1 — nagłówek bez jawnej kotwicy`);
  });

  it("slug ≠ nazwa pliku, kotwica ≠ nazwa pliku, brak pola, błąd YAML z linią, zła lekcja", async () => {
    const r = tmp();
    put(r, "kody/inna.mdx", card);
    put(r, "slownik/zla.yaml", "term: X\nanchor: inna\ndef: Y\n");
    put(r, "zadania/z.yaml", "slug: z\ntitle: [niedomknięte\n");
    put(r, "programy/p.mdx", "---\nslug: p\ntitle: P\nmode: mill\ncategory: K\nlevel: podstawowy\ntools: {}\n---\nOpis.\n");
    put(r, "nauka/frezowanie/f1-1-x/index.mdx", "---\nid: F1.1\nslug: f1-1-x\ntitle: T\nminutes: 1\ngoal: G\n---\n");
    const m = await errs(r);
    expect(m).toContain("kody/inna.mdx — slug „g17-g19” ≠ nazwa pliku „inna.mdx”");
    expect(m).toContain("slownik/zla.yaml — anchor „inna” ≠ nazwa pliku „zla.yaml”");
    expect(m).toMatch(/zadania\/z\.yaml:\d+:\d+ — błąd YAML/);
    expect(m).toMatch(/programy\/p\.mdx:\d+:\d+ — pole „src”: program potrzebuje dokładnie jednego/);
    expect(m).toContain("nauka/frezowanie/f1-1-x — brak cwiczenia.yaml");
  });

  it("zły typ pola wskazuje linię w pliku", async () => {
    const r = tmp();
    put(r, "kody/g17-g19.mdx", card.replace("level: 2", "level: 7"));
    expect(await errs(r)).toMatch(/kody\/g17-g19\.mdx:6:1 — pole „level”: poziom: 1, 2 albo 3/);
  });
});

describe("schematy pasują do dzisiejszych danych (eksport w pamięci, bez plików)", () => {
  it("56 kart, słownik, lekcje, programy, zadania", async () => {
    const { CURATED } = await import("@/content/articles");
    const { glossary, exercises } = await import("@/lib/content");
    const { flat } = await import("@/lib/course");
    const { PROGRAMS } = await import("@/content/programy");
    const { kodSchema, hasloSchema, lekcjaSchema, cwiczeniaSchema, programSchema, zadanieSchema } = await import("@/lib/mdx/schema");
    const { glossaryAnchor } = await import("@/lib/mdx/resolve");
    const bad: string[] = [];
    const check = (what: string, s: { safeParse: (x: unknown) => { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } } }, x: unknown) => {
      const r = s.safeParse(x);
      if (!r.success) bad.push(`${what}: ${r.error!.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}`);
    };
    for (const g of gcodes) check(`karta ${g.slug}`, kodSchema, {
      code: g.code, slug: g.slug, name: g.name, group: g.group, level: g.level, modal: g.modal,
      machines: [...(g.milling ? ["frezowanie"] : []), ...(g.turning ? ["toczenie"] : [])],
      star: CURATED.has(g.slug), related: g.related ?? [], variesBy: g.variesBy ?? null,
      short: g.short, desc: g.desc, syntax: g.syntax, sinumerik: g.sinumerik, params: g.params, pitfalls: g.pitfalls,
      example: { src: g.example, simulate: g.simulate ?? true, mode: g.exampleMode, dialect: g.exampleDialect, stock: g.exampleStock ?? null },
    });
    for (const t of glossary) check(`hasło ${t.term}`, hasloSchema, { ...t, anchor: glossaryAnchor(t.term) });
    let lessons = 0;
    for (const tor of ["frezowanie", "toczenie"] as const) for (const l of flat(tor)) {
      if (!l.doc) continue;
      lessons++;
      const d = l.doc;
      check(`lekcja ${d.id}`, lekcjaSchema, { id: d.id, slug: d.slug, title: d.title, minutes: d.minutes, goal: d.goal, controllers: d.controllers, pitfalls: d.pitfalls, summary: d.summary, sources: d.sources });
      check(`ćwiczenia ${d.id}`, cwiczeniaSchema, JSON.parse(JSON.stringify({ worked: d.worked, practice: d.practice, quiz: d.quiz })));
    }
    for (const p of PROGRAMS) {
      // lesson ({href,label}) → id lekcji, src → plik .nc, summary → treść MDX: poza frontmatterem
      const fm = JSON.parse(JSON.stringify(p));
      for (const k of ["lesson", "src", "summary"]) delete fm[k];
      check(`program ${p.slug}`, programSchema, { ...fm, src: `./${p.slug}.nc` });
    }
    for (const e of exercises) check(`zadanie ${e.slug}`, zadanieSchema, e);
    expect(bad).toEqual([]);
    expect([gcodes.length, glossary.length >= 77, lessons, PROGRAMS.length, exercises.length]).toEqual([56, true, 51, 22, 16]);
  });
});
