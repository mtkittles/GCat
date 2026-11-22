/*
  UI-9: jasny motyw — papier techniczny pod rysunkami i symulatorami. Sprawdza, że paleta kanwy na papierze
  ma te same role co ciemna, a linie toru, osie i opisy mają kontrast do papieru wystarczający dla grafiki
  (WCAG 1.4.11: ≥ 3:1), tekst HUD ≥ 4,5:1. Ciemny motyw zostaje bez zmian.
*/
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { SIM_DARK, SIM_LIGHT } from "@/components/simulator/simPalette";
import { ink, PAPER } from "@/components/simulator/simTheme";
import { TOOL_COLORS, TOOL_COLORS_LIGHT, toolColor } from "@/components/simulator/pathView";

function rgb(c: string): [number, number, number, number] {
  const h = /^#([0-9a-f]{6})$/i.exec(c);
  if (h) return [parseInt(h[1].slice(0, 2), 16), parseInt(h[1].slice(2, 4), 16), parseInt(h[1].slice(4, 6), 16), 1];
  const m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/.exec(c);
  if (!m) throw new Error(c);
  return [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]];
}
/** kolor z przezroczystością nałożony na papier */
function onPaper(c: string): [number, number, number] {
  const [r, g, b, a] = rgb(c), [pr, pg, pb] = rgb(PAPER);
  return [r * a + pr * (1 - a), g * a + pg * (1 - a), b * a + pb * (1 - a)];
}
function lum([r, g, b]: [number, number, number]) {
  const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
const contrast = (c: string) => { const a = lum(onPaper(c)), b = lum(rgb(PAPER).slice(0, 3) as [number, number, number]); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); };

describe("motyw symulatora — papier techniczny (UI-9)", () => {
  it("paleta jasna ma te same role co ciemna", () => {
    expect(Object.keys(SIM_LIGHT).sort()).toEqual(Object.keys(SIM_DARK).sort());
  });

  it("tor, narzędzie, osie i opisy czytelne na papierze", () => {
    for (const k of ["rapid", "linear", "arc", "dwell", "tool", "axis", "zero", "ref", "probeDot", "label"] as const) {
      expect(contrast(SIM_LIGHT[k]), `${k} ${SIM_LIGHT[k]}`).toBeGreaterThanOrEqual(3);
    }
    expect(contrast(SIM_LIGHT.hudText)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(SIM_LIGHT.hudMuted)).toBeGreaterThanOrEqual(4.5);
  });

  it("kolory narzędzi na papierze ≥ 3:1, ciemny motyw bez zmian", () => {
    for (const c of TOOL_COLORS_LIGHT) expect(contrast(c), c).toBeGreaterThanOrEqual(3);
    expect(TOOL_COLORS_LIGHT).toHaveLength(TOOL_COLORS.length);
    expect(toolColor(1)).toBe(TOOL_COLORS[0]);
    expect(toolColor(1, true)).toBe(TOOL_COLORS_LIGHT[0]);
    expect(toolColor(null, true)).toBe("#57534E");
  });

  it("jasne odcienie ze sceny 3D zamieniane na ciemne tylko w jasnym motywie", () => {
    expect(ink("#FACC15", false)).toBe("#FACC15");
    for (const c of ["#F59E0B", "#22C55E", "#38BDF8", "#FCA5A5", "#86EFAC", "#7DD3FC", "#FACC15"]) {
      expect(contrast(ink(c, true)), c).toBeGreaterThanOrEqual(3);
    }
  });

  it("papier w CSS zgodny z kanwą; rysunki i podglądy na papierze", () => {
    const g = readFileSync("src/app/globals.css", "utf8");
    expect(g).toContain(`--paper: ${PAPER};`);
    expect(g).toMatch(/\.fig svg \{[^}]*background: var\(--paper\)/);
    expect(g).toMatch(/\.sim-canvas \{[^}]*background: var\(--paper\)/);
    expect(g).toMatch(/\[data-theme="light"\] :is\(\.fig svg, \.fig-legend, \.pp, \.calc-fig, \.lj, \.tech-thumb\)/);
  });
});
