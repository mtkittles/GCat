import { readdirSync, readFileSync } from "node:fs";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Article, { tocItems } from "@/components/Article";
import { articles, CURATED } from "@/content/articles";
import { bySlug, gcodes } from "@/lib/gcodes";
import { componentNames, mdxComponents } from "@/lib/mdx/components";
import { exportKod } from "@/lib/mdx/export";
import { kodMdx, MDX_KODY, tresci } from "@/lib/mdx/kody";
import { applyApproved, normIds } from "./zatwierdzone";

/*
  Pilot (krok 3): karty z MDX_KODY strona czyta z content/kody/*.mdx.
  Wymagania: HTML artykułu = dzisiejszy Article.tsx (poza zatwierdzonymi wyjątkami), kotwice i spis treści
  identyczne, dane karty = gcodes.json, pozostałe karty dalej ze starych plików.
*/

const PILOT = [...MDX_KODY].sort();

describe("pilot: karty z MDX", () => {
  it("przełącznik = pliki w content/kody; pozostałe karty ze starych źródeł", async () => {
    const files = readdirSync("content/kody").filter((f) => f.endsWith(".mdx")).map((f) => f.slice(0, -4)).sort();
    expect(files).toEqual(PILOT);
    expect(PILOT).toEqual(["g01", "g02", "g03", "g84"]);
    expect(gcodes.length - PILOT.length).toBe(52);
    for (const g of gcodes) if (!MDX_KODY.has(g.slug)) expect(await kodMdx(g.slug)).toBeNull();
  });

  it("komponenty: lista dla walidacji = mapa renderowania", () => {
    expect([...componentNames].sort()).toEqual(Object.keys(mdxComponents).sort());
  });

  for (const slug of PILOT) {
    describe(slug, () => {
      it("dane karty z frontmattera = gcodes.json", async () => {
        const m = (await kodMdx(slug))!;
        expect(m.g).toEqual(bySlug(slug));
        const k = (await tresci()).kody.find((x) => x.data.slug === slug)!;
        expect(k.data.star).toBe(CURATED.has(slug));
      });

      it("plik = eksport ze starych źródeł (deterministyczny)", () => {
        expect(readFileSync(`content/kody/${slug}.mdx`, "utf8")).toBe(exportKod(bySlug(slug)!, CURATED.has(slug), articles[slug]));
      });

      it("kotwice i spis treści identyczne jak dziś, zapisane jawnie w pliku", async () => {
        const m = (await kodMdx(slug))!;
        const today = tocItems(articles[slug]);
        expect(m.headings).toEqual(today);
        const src = readFileSync(`content/kody/${slug}.mdx`, "utf8");
        const explicit = [...src.matchAll(/^## .* \{#([^}]+)\}$/gm)].map((x) => x[1]);
        expect(explicit).toEqual(today.map((t) => t.id));
      });

      it("HTML artykułu = Article.tsx (jedyne różnice: zatwierdzone wyjątki)", async () => {
        const m = (await kodMdx(slug))!;
        const now = normIds(renderToStaticMarkup(h("div", { className: "article grid gap-4" }, await m.render())));
        const old = applyApproved(normIds(renderToStaticMarkup(h(Article, { blocks: articles[slug] }))));
        expect(now).toBe(old.html);
        const expected: Record<string, string[]> = {
          g01: ["g01 — link do kalkulatora", "g01 — [[G90]] w pogrubieniu"],
          g02: ["g02/g03 — [[G17]] w pogrubieniu", "g02/g03 — [[G18]] w pogrubieniu", "g02/g03 — [[G19]] w pogrubieniu", "g02/g03 — [[G41]] i [[G42]] w pogrubieniu"],
          g84: ["g84 — `CYCLE84` w pogrubieniu", "g84 — `CYCLE840` w pogrubieniu"],
        };
        expect(old.used).toEqual(expected[slug === "g03" ? "g02" : slug]);
      });
    });
  }
});
