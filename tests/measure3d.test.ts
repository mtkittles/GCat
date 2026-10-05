import { describe, expect, it } from "vitest";
import { angOf, circle3, circleOf, distOf, m3Text, snapAxis } from "@/components/simulator/measure3d";

// scena three: Y w górę (Z programu), Z sceny = −Y programu
const up = { x: 0, y: 1, z: 0 }, side = { x: 1, y: 0, z: 0 };

describe("wymiarowanie 3D", () => {
  it("ściany równoległe: odległość prostopadła, niezależnie od przesunięcia w bok", () => {
    const r = distOf({ p: { x: 0, y: 0, z: 0 }, n: up }, { p: { x: 30, y: -12, z: 7 }, n: { x: 0, y: -1, z: 0 } });
    expect(r.par).toBe(true);
    expect(r.perp).toBeCloseTo(12);
    expect(r.L).toBeGreaterThan(12);
    expect(m3Text({ kind: "dist", a: { p: { x: 0, y: 0, z: 0 }, n: up }, b: { p: { x: 30, y: -12, z: 7 }, n: up } }, false).main).toBe("12.000 mm");
  });

  it("ściany nierównoległe: odległość punktów i Δ w osiach programu", () => {
    const t = m3Text({ kind: "dist", a: { p: { x: 0, y: 0, z: 0 }, n: up }, b: { p: { x: 3, y: 0, z: -4 }, n: side } }, false);
    expect(t.main).toBe("5.000 mm");
    expect(t.sub).toContain("ΔY 4.000");
  });

  it("kąt między ścianami: góra i skos 30°", () => {
    const a30 = (30 * Math.PI) / 180;
    expect(angOf({ p: { x: 0, y: 0, z: 0 }, n: up }, { p: { x: 1, y: 0, z: 0 }, n: { x: Math.sin(a30), y: Math.cos(a30), z: 0 } })).toBeCloseTo(30);
  });

  it("okrąg przez 3 punkty i okrąg ze ścianki otworu (punkty na różnych wysokościach)", () => {
    const c = circle3({ x: 5, y: 0, z: 0 }, { x: 0, y: 0, z: 5 }, { x: -5, y: 0, z: 0 })!;
    expect(c.r).toBeCloseTo(5);
    expect(Math.abs(c.ax.y)).toBeCloseTo(1);
    // otwór ⌀12 w osi pionowej, środek (10, ·, -20); normalne ścianki do środka otworu
    const P = (ang: number, h: number) => { const a = (ang * Math.PI) / 180; return { p: { x: 10 + 6 * Math.cos(a), y: h, z: -20 + 6 * Math.sin(a) }, n: { x: -Math.cos(a), y: 0, z: -Math.sin(a) } }; };
    const m = circleOf([P(0, -2), P(100, -7), P(220, -4)])!;
    expect(m.wall).toBe(true);
    expect(m.r).toBeCloseTo(6);
    expect(m.c.x).toBeCloseTo(10); expect(m.c.z).toBeCloseTo(-20);
    expect(m3Text(m, false).main).toBe("⌀12.000");
  });

  it("normalna prawie w osi — dokładnie w osi", () => {
    expect(snapAxis({ x: 0.01, y: 0.9999, z: 0 })).toEqual({ x: 0, y: 1, z: 0 });
  });
});
