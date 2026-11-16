import { describe, expect, it } from "vitest";
import { boolShapes, boundary, buildRegions, faceAt, interior, shapesFrom } from "@/lib/rys/regions";
import { curvesOf } from "@/lib/rys/edit";
import type { Item } from "@/lib/rys/model";

/* Rysownik RB4: obszary nachodzących figur i operacje logiczne. */

const R = (x: number, y: number, w: number, h: number, id: string, fill: "none" | "hatch" = "none"): Item => ({ id, t: "rect", k: "con", sw: "auto", fill, x, y, w, h, r: 0 });
const C = (cx: number, cy: number, r: number, id: string): Item => ({ id, t: "circle", k: "con", sw: "auto", fill: "none", cx, cy, r });
const polyArea = (it: Item) => {
  const pts = curvesOf(it)!.cs.flatMap((c) => (c.k === "L" ? [c.a] : Array.from({ length: 60 }, (_, i) => { const a = (c.s + (c.w * i) / 60) * Math.PI / 180; return [c.cx + c.r * Math.cos(a), c.cy + c.r * Math.sin(a)] as [number, number]; })));
  let s = 0; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; s += a[0] * b[1] - b[0] * a[1]; }
  return Math.abs(s / 2);
};

describe("obszary", () => {
  it("dwa nachodzące prostokąty dają 3 obszary: dwa „tylko jeden” i część wspólną", () => {
    const r = buildRegions([R(0, 0, 100, 50, "a"), R(60, 20, 80, 60, "b")]);
    expect(r.faces).toHaveLength(3);
    expect(faceAt(r, [80, 35])!.area).toBeCloseTo(40 * 30, 3); // część wspólna
    expect(faceAt(r, [10, 10])!.area).toBeCloseTo(100 * 50 - 1200, 3);
    expect(faceAt(r, [200, 200])).toBeNull();
  });
  it("okrąg w prostokącie: obszar z otworem", () => {
    const r = buildRegions([R(0, 0, 100, 100, "a"), C(50, 50, 20, "c")]);
    expect(r.faces).toHaveLength(2);
    const ring = faceAt(r, [5, 5])!;
    expect(ring.holes).toHaveLength(1);
    expect(ring.area).toBeCloseTo(10000 - Math.PI * 400, -1);
    const p = interior(ring);
    expect(faceAt(r, p)?.id).toBe(ring.id);
  });
  it("linia przecinająca prostokąt dzieli go na dwa obszary, wiszący koniec nie przeszkadza", () => {
    const r = buildRegions([R(0, 0, 100, 50, "a"), { id: "l", t: "line", k: "con", sw: "auto", arrow: "none", x1: 40, y1: -10, x2: 40, y2: 70 }]);
    expect(r.faces).toHaveLength(2);
    expect(faceAt(r, [10, 10])!.area).toBeCloseTo(2000, 3);
  });
  it("wspólny bok dwóch prostokątów liczy się raz", () => {
    const r = buildRegions([R(0, 0, 50, 50, "a"), R(50, 0, 50, 50, "b")]);
    expect(r.faces).toHaveLength(2);
    const b = boundary(r, new Set(r.faces.map((f) => f.id)));
    expect(b.outer).toHaveLength(1);
    const [it] = shapesFrom(b, { k: "con", sw: "auto", fill: "none" }, R(0, 0, 1, 1, "x"));
    expect(it.t === "poly" && it.pts).toHaveLength(4); // 4 narożniki, boki połączone
  });
});

describe("operacje logiczne", () => {
  const a = R(0, 0, 100, 50, "a", "hatch"), b = R(60, 20, 80, 60, "b");
  const area = (res: Item[] | string) => (typeof res === "string" ? -1 : res.filter((x) => !(x.t === "poly" && x.fill === "hole")).reduce((s, x) => s + polyArea(x), 0));
  it("suma, część wspólna, różnica, poza wspólną", () => {
    expect(area(boolShapes([a, b], "union"))).toBeCloseTo(5000 + 4800 - 1200, 3);
    expect(area(boolShapes([a, b], "intersect"))).toBeCloseTo(1200, 3);
    expect(area(boolShapes([a, b], "subtract"))).toBeCloseTo(5000 - 1200, 3);
    expect(area(boolShapes([b, a], "subtract"))).toBeCloseTo(4800 - 1200, 3);
    const x = boolShapes([a, b], "xor");
    expect(typeof x !== "string" && x.length).toBe(2);
    expect(area(x)).toBeCloseTo(5000 + 4800 - 2400, 3);
  });
  it("wynik w stylu pierwszej figury; okrąg wycięty z prostokąta to kontur + otwór", () => {
    const res = boolShapes([a, C(50, 25, 10, "c")], "subtract");
    expect(typeof res).not.toBe("string");
    if (typeof res !== "string") {
      expect(res.map((x) => (x.t === "poly" ? x.fill : x.t))).toEqual(["hatch", "hole"]);
      expect(res[0].g).toBeDefined();
      expect(res[0].g).toBe(res[1].g);
      const hole = res[1];
      expect(hole.t === "poly" && hole.b?.every((x) => x !== 0)).toBe(true); // otwór z łuków
    }
  });
  it("figury rozłączne nie mają części wspólnej", () => {
    expect(boolShapes([R(0, 0, 10, 10, "a"), R(50, 50, 10, 10, "b")], "intersect")).toBe("figury nie mają części wspólnej");
  });
});
