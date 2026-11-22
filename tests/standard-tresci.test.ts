import { getSchema, type JSONContent } from "@tiptap/core";
import { Node as PMNode } from "@tiptap/pm/model";
import { createElement, Fragment } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Wzor, { formula, parseLegend } from "@/components/Wzor";
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

const md = (nodes: ReturnType<typeof formula>) => renderToStaticMarkup(createElement(Fragment, null, ...nodes));
// <Sim> bez symulatora (canvas) — sama figura z data-prog jak w components.tsx
const comps = { ...mdxComponents, Sim: ({ src }: { src: string }) => createElement("figure", { "data-prog": progHash(src) }) };
const html = async (body: string, programLinks = true) =>
  renderToStaticMarkup(await renderContent(await compileContent(body, { file: "t.mdx", sources: liveSources, components: componentNames, diagramIds, programLinks }), comps));

describe("<Wzor> — zapis wzoru", () => {
  it("zmienne kursywą, indeks dolny prosto, π i funkcje prosto", () => {
    expect(md(formula("n = 1000 · V_c / (π · D)"))).toBe('<i>n</i> = 1000 · <i>V</i><sub>c</sub> / (<span class="wz-fn">π</span> · <i>D</i>)');
    expect(md(formula("h_ex = f_z · sin κ_r"))).toBe('<i>h</i><sub>ex</sub> = <i>f</i><sub>z</sub> · <span class="wz-fn">sin</span> <i>κ</i><sub>r</sub>');
  });
  it("indeks w klamrach, wykładnik, pierwiastek z kreską", () => {
    expect(md(formula("D_{cap}"))).toBe("<i>D</i><sub>cap</sub>");
    expect(md(formula("a_e^2"))).toBe("<i>a</i><sub>e</sub><sup>2</sup>");
    expect(md(formula("√(a_p · (D − a_p))"))).toBe('<span class="wz-sqrt">√<span class="wz-rad"><i>a</i><sub>p</sub> · (<i>D</i> − <i>a</i><sub>p</sub>)</span></span>');
  });
  it("legenda: symbol — znaczenie [jednostka]", () => {
    expect(parseLegend("V_c — prędkość skrawania [m/min]; z — liczba ostrzy")).toEqual([
      { sym: "V_c", desc: "prędkość skrawania", unit: "m/min" },
      { sym: "z", desc: "liczba ostrzy", unit: undefined },
    ]);
  });
  it("kilka wzorów w jednej ramce, podpis i legenda, tekst dla czytnika", () => {
    const h = renderToStaticMarkup(createElement(Wzor, { f: "n = 1000 · V_c / (π · D); v_f = f_z · n · z", legend: "n — obroty [obr/min]", caption: "Obroty" }));
    expect(h.match(/role="math"/g)).toHaveLength(2);
    expect(h).toContain('aria-label="n = 1000 · Vc / (π · D)"');
    expect(h).toContain('<figcaption class="wzor-cap">Obroty</figcaption>');
    expect(h).toContain('<span class="wzor-unit">obr/min</span>');
  });
  it("w treści MDX: wymagany zapis f, edytor zapisuje bez zmian", async () => {
    await expect(html('<Wzor legend="x" />')).rejects.toThrow(/<Wzor> wymaga f=/);
    const body = 'Tekst.\n\n<Wzor f="n = 1000 · V_c / (π · D)" legend="n — obroty wrzeciona [obr/min]" caption="Obroty" />\n';
    const p = mdxToDoc(body);
    const doc = PMNode.fromJSON(getSchema(gcatExtensions()), p.doc).toJSON() as JSONContent;
    expect(doc.content?.map((n) => n.type)).toEqual(["paragraph", "wzor"]);
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
