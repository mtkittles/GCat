import { readdirSync, readFileSync } from "node:fs";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { glossary } from "@/lib/content";
import { gcodes } from "@/lib/gcodes";
import { hasloToEntry, kodToGcode } from "@/lib/mdx/gcode";
import { kartaMdx } from "@/lib/mdx/kody";
import { loadContent, type Content } from "@/lib/mdx/loader";
import { mdxPrograms } from "@/lib/mdx/programs";
import kotwice from "./fixtures/kotwice.json";

/*
  Karty i słownik z content/ (krok 4): content/kody/*.mdx i content/slownik/*.yaml są jedynym źródłem prawdy.
  • kotwice: nagłówki kart i hasła słownika mają jawne kotwice równe migawce sprzed migracji
    (tests/fixtures/kotwice.json) — zmiana kotwicy psuje linki z zewnątrz i z lekcji, więc wymaga świadomej zmiany migawki;
  • dane strony (content/.generated, npm run tresci) są aktualne względem plików;
  • schematy, markery i <Diagram> waliduje loader (każdy błąd = błąd testu).
*/

let content: Content;
const load = async () => (content ??= await loadContent("content"));

describe("karty i słownik z content/", () => {
  it("cała treść przechodzi walidację (schematy, slugi, kotwice, markery, rysunki)", async () => {
    const c = await load();
    expect(c.kody.length).toBe(56);
    expect(c.slownik.length).toBe(77);
  });

  it("dane strony (content/.generated) = pliki treści, w kolejności `order`", async () => {
    const c = await load();
    expect(gcodes).toEqual(c.kody.map((k) => kodToGcode(k.data, k.meta.headings.length > 0 || k.meta.text.trim() !== "")));
    expect(glossary).toEqual(c.slownik.map((x) => hasloToEntry(x.data)));
    expect(gcodes.filter((g) => g.star).map((g) => g.slug)).toEqual(["g00", "g01", "g02", "g03", "g04", "g17-g19", "g20-g21", "g40-g42", "g43-g49", "g54-g59", "g90-g91", "g94-g95"]);
  });

  it("kotwice nagłówków kart = migawka (jawne {#…} w plikach)", async () => {
    const c = await load();
    const now = Object.fromEntries(c.kody.map((k) => [k.data.slug, k.meta.headings.map((x) => x.id)]));
    expect(now).toEqual(kotwice.kody);
    for (const k of c.kody) {
      const src = readFileSync(k.file, "utf8");
      const explicit = [...src.matchAll(/^#{2,6} .* \{#([^}]+)\}$/gm)].map((m) => m[1]);
      const all = [...src.matchAll(/^#{2,6} /gm)].length;
      expect(explicit.length, k.file).toBe(all);
    }
    expect(Object.values(now).flat().length).toBe(159);
  });

  it("kotwice słownika = migawka; plik = <kotwica>.yaml", async () => {
    const c = await load();
    expect(c.slownik.map((x) => x.data.anchor)).toEqual(kotwice.slownik);
    expect(readdirSync("content/slownik").filter((f) => f.endsWith(".yaml")).sort()).toEqual(kotwice.slownik.map((a) => `${a}.yaml`).sort());
  });

  it("programy <Sim>/<Demo>: odczyt dla audit:programy = plugin", async () => {
    const c = await load();
    let n = 0;
    for (const k of c.kody) {
      expect(mdxPrograms(readFileSync(k.file, "utf8")), k.file).toEqual(k.meta.programs);
      n += k.meta.programs.length;
    }
    expect(n).toBe(36); // = bloki sim/demo w dawnych artykułach (audit:programy: 217 programów bez zmian)
  });

  it("artykuły wszystkich kart renderują się: kotwice h2 = spis treści, bez surowych markerów", async () => {
    let n = 0;
    for (const g of gcodes) {
      const m = await kartaMdx(g.slug);
      expect(!!m, g.slug).toBe(true);
      if (!g.hasArticle) continue;
      const html = renderToStaticMarkup(h("div", null, await m!.render()));
      expect([...html.matchAll(/<h2 id="([^"]+)">/g)].map((x) => x[1]), g.slug).toEqual(kotwice.kody[g.slug as keyof typeof kotwice.kody]);
      expect(html, g.slug).not.toMatch(/\[\[|\]\]|\{#/);
      n++;
    }
    expect(n).toBe(27);
  });
});
