import { describe, expect, it } from "vitest";
import { contourPath, isoSegments, joinSegments, simplify, type Pt2 } from "../src/lib/contour";

/** Pole na siatce n × n z funkcji (i, j). */
const field = (n: number, f: (i: number, j: number) => number) => {
  const g = new Float32Array(n * n);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) g[j * n + i] = f(i, j);
  return g;
};

describe("kontur obrobionych miejsc (marching squares)", () => {
  it("kieszeń prostokątna daje jedną zamkniętą łamaną na jej krawędzi", () => {
    const g = field(20, (i, j) => (i >= 5 && i <= 14 && j >= 4 && j <= 11 ? 3 : 0));
    const lines = joinSegments(isoSegments(g, 20, 20, 0.05));
    expect(lines).toHaveLength(1);
    const l = lines[0];
    expect(l[0]).toEqual(l[l.length - 1]);
    const xs = l.map((p) => p[0]), ys = l.map((p) => p[1]);
    // granica między węzłem 4 (0) a 5 (3) przy poziomie 0,05 → 4,0167
    expect(Math.min(...xs)).toBeCloseTo(4 + 0.05 / 3, 3);
    expect(Math.max(...xs)).toBeCloseTo(15 - 0.05 / 3, 3);
    expect(Math.min(...ys)).toBeCloseTo(3 + 0.05 / 3, 3);
    expect(Math.max(...ys)).toBeCloseTo(12 - 0.05 / 3, 3);
  });

  it("dwa otwory — dwie osobne pętle; okrąg upraszcza się do kilkunastu punktów", () => {
    const n = 60;
    const g = field(n, (i, j) => Math.max(8 - Math.hypot(i - 15, j - 30), 8 - Math.hypot(i - 45, j - 30)));
    const lines = joinSegments(isoSegments(g, n, n, 0.05));
    expect(lines).toHaveLength(2);
    for (const l of lines) {
      const r = l.map((p) => Math.hypot(p[0] - (p[0] < 30 ? 15 : 45), p[1] - 30));
      expect(Math.min(...r)).toBeGreaterThan(7.8);
      expect(Math.max(...r)).toBeLessThan(8);
    }
    const d = contourPath(lines, (p) => [p[0] * 4, p[1] * 4], 0.4);
    expect(d.match(/Z/g)).toHaveLength(2);
    expect(d.split("L").length).toBeLessThan(lines.reduce((s, l) => s + l.length, 0));
  });

  it("NaN (poza półfabrykatem) liczy się jak nieobrobione", () => {
    const g = field(10, (i) => (i < 3 ? NaN : i < 6 ? 2 : 0));
    const lines = joinSegments(isoSegments(g, 10, 10, 0.05));
    expect(lines.length).toBeGreaterThan(0);
    for (const l of lines) for (const [x] of l) expect(x).toBeGreaterThanOrEqual(2);
  });

  it("puste pole — brak konturu", () => {
    expect(isoSegments(new Float32Array(16), 4, 4, 0.05)).toEqual([]);
  });

  it("simplify zostawia narożniki prostej łamanej", () => {
    const pts: Pt2[] = [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1], [3, 2]];
    expect(simplify(pts, 0.1)).toEqual([[0, 0], [3, 0], [3, 2]]);
  });
});
