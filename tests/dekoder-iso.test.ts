import { getSchema, type JSONContent } from "@tiptap/core";
import { Node as PMNode } from "@tiptap/pm/model";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { docToMdx, mdxToDoc } from "@/lib/edytor/mdx";
import { gcatExtensions } from "@/lib/edytor/schema";
import { compileContent, renderContent } from "@/lib/mdx/compile";
import { componentNames, diagramIds, mdxComponents } from "@/lib/mdx/components";
import { liveSources } from "@/lib/mdx/live";
import { dekoduj, POZYCJE } from "@/lib/iso1832";

/* V3.2a — <DekoderISO>: odczyt oznaczenia ISO 1832, blok edytora, sprawdzanie w treści. */

const schema = getSchema(gcatExtensions());
const opts = { file: "test.mdx", components: componentNames, diagramIds, sources: liveSources };
const odczyt = (kod: string) => Object.fromEntries(dekoduj(kod).znaki.map((z) => [z.poz, [z.s, z.odczyt]]));

describe("dekoduj (ISO 1832)", () => {
  it("CNMG 120408 — przykład z poradnika ISCAR (s. 69), naroże 0,8", () => {
    const o = odczyt("CNMG 120408");
    expect(o.ksztalt).toEqual(["C", "romb 80°"]);
    expect(o.przylozenie[1]).toMatch(/0° — płytka negatywowa/);
    expect(o.typ[1]).toBe("otwór walcowy, łamacz z obu stron");
    expect(o.grubosc[1]).toBe("grubość 4,76 mm");
    expect(o.naroze[1]).toBe("promień naroża 0,8 mm");
    expect(dekoduj("CNMG 120408").znaki).toHaveLength(7);
  });

  it("grubość T3, naroże M0, opcjonalne pozycje i oznaczenie producenta", () => {
    expect(odczyt("DCMT 11T304").grubosc).toEqual(["T3", "grubość 3,97 mm"]);
    expect(odczyt("RCMT 0803M0").naroze[1]).toMatch(/okrągła/);
    const o = odczyt("cnmg120408en-mp");
    expect(o.krawedz).toEqual(["E", "krawędź zaokrąglona"]);
    expect(o.kierunek[0]).toBe("N");
    expect(o.lamacz[0]).toBe("MP");
  });

  it("błędny zapis i znak spoza zestawienia", () => {
    expect(dekoduj("CNMG 12").blad).toBeTruthy();
    expect(dekoduj("ZNMG 120408").znaki[0].odczyt).toBeNull();
    expect(POZYCJE.filter((p) => p.obowiazkowa)).toHaveLength(7);
  });
});

describe("<DekoderISO> w treści i edytorze", () => {
  it("zapis edytora bajt w bajt i blok dekoderIso (nie raw)", () => {
    const body = `Tekst.\n\n<DekoderISO kod="DCMT 11T304" />\n`;
    const p = mdxToDoc(body);
    const doc = PMNode.fromJSON(schema, p.doc).toJSON() as JSONContent;
    expect(doc.content!.map((n) => n.type)).toEqual(["paragraph", "dekoderIso"]);
    expect(doc.content![1].attrs?.kod).toBe("DCMT 11T304");
    for (const o of p.origins.values()) o.canon = undefined;
    expect(docToMdx(doc, p)).toBe(body);
  });

  it("strona: przyciski znaków z aria-pressed, rysunek z tytułem", async () => {
    const html = renderToStaticMarkup(await renderContent(await compileContent(`<DekoderISO kod="CNMG 120408" />`, opts), mdxComponents));
    expect((html.match(/aria-pressed/g) ?? []).length).toBe(7);
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain("<title");
  });

  it("kompilacja odrzuca brak kodu i zły zapis", async () => {
    await expect(compileContent(`<DekoderISO />`, opts)).rejects.toThrow(/wymaga kod/);
    await expect(compileContent(`<DekoderISO kod="CNMG12" />`, opts)).rejects.toThrow(/ISO 1832/);
  });
});
