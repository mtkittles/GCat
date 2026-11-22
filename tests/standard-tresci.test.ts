import { getSchema, type JSONContent } from "@tiptap/core";
import { Node as PMNode } from "@tiptap/pm/model";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Wzor, { fromField, parseLegend, tex, texError, toField, wrapLines } from "@/components/Wzor";
import { progressAtLine } from "@/components/simulator/seek";
import { docToMdx, mdxToDoc } from "@/lib/edytor/mdx";
import { gcatExtensions } from "@/lib/edytor/schema";
import { compileContent, renderContent } from "@/lib/mdx/compile";
import { componentNames, diagramIds, mdxComponents } from "@/lib/mdx/components";
import { liveSources } from "@/lib/mdx/live";
import { normLine, progHash } from "@/lib/progHash";

/*
  Standard treści (pilotaż 2026-11-22): wzór w ramce (<Wzor>), lista oznaczeń pod rysunkiem (**(1) Nazwa:**),
  fragmenty kodu w opisie = linie programu ze strony (kolor ruchu + przeskok symulatora).
*/

// <Sim> bez symulatora (canvas) — sama figura z data-prog jak w components.tsx
const comps = { ...mdxComponents, Sim: ({ src }: { src: string }) => createElement("figure", { "data-prog": progHash(src) }) };
const html = async (body: string, programLinks = true) =>
  renderToStaticMarkup(await renderContent(await compileContent(body, { file: "t.mdx", sources: liveSources, components: componentNames, diagramIds, programLinks }), comps));

describe("<Wzor> — skład matematyczny (KaTeX)", () => {
  it("ułamek jako licznik nad mianownikiem, indeksy i potęgi przy literze, MathML dla czytników", () => {
    const h = tex("n = \\frac{1000 \\cdot V_c}{\\pi \\cdot D}", true);
    expect(h).toContain('class="katex-display"');
    expect(h).toContain("<mfrac>");
    expect(h).toContain("<msub><mi>V</mi><mi>c</mi></msub>");
    expect(tex("D^4", false)).toContain("<msup><mi>D</mi><mn>4</mn></msup>");
    expect(tex("\\sqrt{a_p}", false)).toContain("<msqrt>");
  });
  it("kilka wzorów w ramce: \\\\ jeden pod drugim, z & wyrównane do znaku", () => {
    expect(wrapLines("a = 1 \\\\ b = 2")).toBe("\\begin{gathered}a = 1 \\\\ b = 2\\end{gathered}");
    expect(wrapLines("a &= 1 \\\\ b &= 2")).toMatch(/^\\begin\{aligned\}/);
    expect(wrapLines("a = 1")).toBe("a = 1");
  });
  it("przecinek dziesiętny bez odstępu, błąd zapisu z komunikatem", () => {
    expect(tex("0,05", false)).toContain("0,05");
    expect(texError("\\frac{a}{b}")).toBeNull();
    expect(texError("\\frac{a}{b")).toMatch(/niedomknięta klamra/);
    expect(texError("\\foo x")).toBe("nieznane polecenie \\foo");
    expect(tex("\\frac{a}{b", true)).toContain('class="wzor-err"');
  });
  it("pole edytora (MathLive): wiersze tam i z powrotem, puste pole □ to błąd", () => {
    expect(toField("a = 1 \\\\ b = 0,5")).toBe("\\displaylines{a = 1 \\\\ b = 0{,}5}");
    expect(toField("n &= 1 \\\\ v &= 2")).toMatch(/^\\begin\{aligned\}/);
    expect(toField("k \\propto D")).toBe("k \\propto D");
    expect(fromField("\\displaylines{a=1\\\\ b=0{,}5\\\\ }")).toBe("a=1 \\\\ b=0,5");
    expect(fromField("\\begin{aligned}n &= 1 \\\\ v &= 2\\end{aligned}")).toBe("n &= 1 \\\\ v &= 2");
    expect(fromField("x=\\frac{1}{2}")).toBe("x=\\frac{1}{2}");
    expect(fromField(toField("n = \\frac{1000 \\cdot V_c}{\\pi \\cdot D} \\\\ v_f = f_z \\cdot n \\cdot z"))).toBe("n = \\frac{1000 \\cdot V_c}{\\pi \\cdot D} \\\\ v_f = f_z \\cdot n \\cdot z");
    expect(texError("A=\\frac{1000}{\\sqrt{\\placeholder{}}}")).toMatch(/puste pole/);
    // zapis MathLive wkopiowany wprost też się składa
    expect(tex("\\displaylines{a\\\\ b}", true)).toContain("katex-display");
    expect(tex("\\int_0^1 x\\,\\differentialD x", true)).not.toContain("wzor-err");
  });

  it("legenda: symbol — znaczenie [jednostka]", () => {
    expect(parseLegend("V_c — prędkość skrawania [m/min]; z — liczba ostrzy; \\propto — jest proporcjonalne do")).toEqual([
      { sym: "V_c", desc: "prędkość skrawania", unit: "m/min" },
      { sym: "z", desc: "liczba ostrzy", unit: undefined },
      { sym: "\\propto", desc: "jest proporcjonalne do", unit: undefined },
    ]);
  });
  it("ramka: podpis, wzór, legenda z jednostką", () => {
    const h = renderToStaticMarkup(createElement(Wzor, { f: "n = \\frac{1000 \\cdot V_c}{\\pi \\cdot D} \\\\ v_f = f_z \\cdot n \\cdot z", legend: "n — obroty [obr/min]", caption: "Obroty" }));
    expect(h).toContain('<figcaption class="wzor-cap">Obroty</figcaption>');
    expect(h).toContain("gathered");
    expect(h).toContain('<span class="wzor-unit">obr/min</span>');
  });
  it("w treści MDX: LaTeX w atrybucie, kontrola zapisu, edytor zapisuje bez zmian", async () => {
    await expect(html('<Wzor legend="x" />')).rejects.toThrow(/<Wzor> wymaga f=/);
    await expect(html('<Wzor f="\\frac{a}{b" />')).rejects.toThrow(/błąd zapisu wzoru/);
    const ok = await html('<Wzor f="k \\propto \\frac{D^4}{L^3} \\\\ y \\propto L^3" />');
    expect(ok).toContain("<mfrac>");
    const body = 'Tekst.\n\n<Wzor f="n = \\frac{1000 \\cdot V_c}{\\pi \\cdot D} \\\\ v_f = f_z \\cdot n \\cdot z" legend="n — obroty wrzeciona [obr/min]; \\propto — proporcjonalne do" caption="Obroty" />\n';
    const p = mdxToDoc(body);
    const doc = PMNode.fromJSON(getSchema(gcatExtensions()), p.doc).toJSON() as JSONContent;
    expect(doc.content?.map((n) => n.type)).toEqual(["paragraph", "wzor"]);
    expect(doc.content?.[1].attrs?.f).toBe("n = \\frac{1000 \\cdot V_c}{\\pi \\cdot D} \\\\ v_f = f_z \\cdot n \\cdot z");
    expect(docToMdx(doc, { origins: new Map(), lead: p.lead, tail: p.tail, seps: new Map() })).toBe(body);
  });
});

describe("lista oznaczeń pod rysunkiem", () => {
  it("**(n) Nazwa:** → numer w kółku, lista bez kropek", async () => {
    const h = await html("* **(1) Chwyt:** część mocowana.\n* **(2) Szyjka:** odcinek.\n");
    expect(h).toContain('<ul class="oznaczenia">');
    expect(h).toContain('<li><span class="ozn-nr">1</span><strong>Chwyt:</strong> część mocowana.</li>');
  });
  it("zwykła lista bez zmian", async () => {
    const h = await html("* **Chwyt (1):** część.\n* zwykły punkt\n");
    expect(h).not.toContain("oznaczenia");
    expect(h).not.toContain("ozn-nr");
  });
});

describe("fragmenty kodu w opisie programu", () => {
  const prog = "G21 G90 G94 G17\nT1 M06\nS1000 M03\nG00 X-15. Y-15.\nG01 Z-3. F300\nG02 X0. Y0. R15.\nX10.\nM30";
  const sim = `<Sim mode="mill">\n  \`\`\`\n  ${prog.split("\n").join("\n  ")}\n  \`\`\`\n</Sim>\n`;
  it("linia programu: kolor ruchu tej linii i odnośnik do symulatora", async () => {
    const h = await html(`${sim}\n1. \`T1 M06\` wymiana. \`G00 X-15. Y-15.\` dojazd. \`G01 Z-3. F300\` zejście. \`G02 X0. Y0. R15.\` łuk. \`X10.\` dalej łukiem.\n`);
    const hash = progHash(prog);
    expect(h).toContain(`<code class="inline-code is-prog" data-prog="${hash}" data-prog-line="1" role="button" tabindex="0" title="Pokaż w symulatorze">T1 M06</code>`);
    expect(h).toContain(`<code class="inline-code is-g00 is-prog" data-prog="${hash}" data-prog-line="3"`);
    expect(h).toContain(`<code class="inline-code is-g01 is-prog" data-prog="${hash}" data-prog-line="4"`);
    expect(h).toContain(`<code class="inline-code is-g02 is-prog" data-prog="${hash}" data-prog-line="5"`);
    expect(h).toContain(`<code class="inline-code is-g02 is-prog" data-prog="${hash}" data-prog-line="6"`); // X10. — nadal łuk (modalność)
    expect(h).toContain(`<figure data-prog="${hash}">`);
  });
  it("gołe słowo ruchu i kod spoza programu jak dotąd; bez programLinks bez zmian", async () => {
    const h = await html(`${sim}\nKod \`G01\` i \`G41 D1\`.\n`);
    expect(h).toContain('<code class="inline-code is-g01">G01</code>');
    expect(h).toContain('<code class="inline-code">G41 D1</code>');
    const off = await html(`${sim}\n\`T1 M06\`\n`, false);
    expect(off).toContain('<code class="inline-code">T1 M06</code>');
  });
  it("linia z komentarzem pasuje bez komentarza", () => {
    expect(normLine("T1 M06 (FREZ FI10)")).toBe("T1 M06");
    expect(normLine("g01  x60. ")).toBe("G01 X60.");
  });
  it("symulator: postęp na początku linii, linia bez ruchu — następny ruch", () => {
    const segs = [{ line: 3 }, { line: 4 }, { line: 4 }, { line: 6 }];
    const len = [10, 5, 5, 20];
    expect(progressAtLine(segs, len, 4)).toBeCloseTo(10);
    expect(progressAtLine(segs, len, 5)).toBeCloseTo(20);
    expect(progressAtLine(segs, len, 1)).toBeCloseTo(0);
    expect(progressAtLine(segs, len, 7)).toBeNull();
  });
});
