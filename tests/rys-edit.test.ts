import { describe, expect, it } from "vitest";
import { curvesOf, explode, extend, join, trim } from "@/lib/rys/edit";
import { bulgeArc, parseDoc, polyPath, storeDoc, type Item } from "@/lib/rys/model";

/* Rysownik RB3: utnij, wydłuż, rozbij, złącz, łuki w polilinii. */

const L = (x1: number, y1: number, x2: number, y2: number, id = "l"): Item => ({ id, t: "line", k: "con", sw: "auto", arrow: "none", x1, y1, x2, y2 });

describe("utnij", () => {
  it("odcinek między dwiema liniami tnącymi znika, zostają dwa kawałki", () => {
    const t = L(0, 50, 100, 50, "t");
    const r = trim(t, [t, L(30, 0, 30, 100, "a"), L(70, 0, 70, 100, "b")], [50, 50])!;
    expect(r.add.map((x) => (x.t === "line" ? [x.x1, x.x2] : null))).toEqual([[0, 30], [70, 100]]);
  });
  it("koniec odcinka za ostatnim przecięciem", () => {
    const t = L(0, 50, 100, 50, "t");
    const r = trim(t, [t, L(30, 0, 30, 100, "a")], [10, 50])!;
    expect(r.add).toHaveLength(1);
    expect(r.add[0]).toMatchObject({ t: "line", x1: 30, x2: 100 });
  });
  it("bez przecięć element znika cały", () => {
    const t = L(0, 0, 10, 0, "t");
    expect(trim(t, [t], [5, 0])!.add).toEqual([]);
  });
  it("okrąg przecięty linią: zostaje łuk po drugiej stronie", () => {
    const c: Item = { id: "c", t: "circle", k: "con", sw: "auto", fill: "none", cx: 0, cy: 0, r: 10 };
    const r = trim(c, [c, L(-20, 0, 20, 0, "a")], [0, -10])!; // klik u góry (y ujemne)
    expect(r.add).toHaveLength(1);
    expect(r.add[0]).toMatchObject({ t: "arc", a0: 0, a1: 180 }); // dolna połowa (zgodnie z zegarem od 0° do 180°)
  });
  it("bok prostokąta przecięty linią staje się otwartą polilinią", () => {
    const rc: Item = { id: "r", t: "rect", k: "con", sw: "auto", fill: "none", x: 0, y: 0, w: 100, h: 50, r: 0 };
    const r = trim(rc, [rc, L(50, -10, 50, 10, "a"), L(80, -10, 80, 10, "b")], [65, 0])!;
    expect(r.add).toHaveLength(1);
    const p = r.add[0];
    expect(p.t).toBe("poly");
    if (p.t === "poly") { expect(p.closed).toBe(false); expect(p.pts[0]).toEqual([80, 0]); expect(p.pts.at(-1)).toEqual([50, 0]); expect(p.pts).toHaveLength(6); }
  });
});

describe("wydłuż", () => {
  it("linia do najbliższej krawędzi", () => {
    const t = L(0, 0, 10, 0, "t");
    expect(extend(t, [t, L(40, -5, 40, 5, "a"), L(25, -5, 25, 5, "b")], [9, 0])).toMatchObject({ x2: 25 });
    expect(extend(t, [t, L(-30, -5, -30, 5, "a")], [1, 0])).toMatchObject({ x1: -30 });
  });
  it("łuk do linii", () => {
    const a: Item = { id: "a", t: "arc", k: "con", sw: "auto", arrow: "none", cx: 0, cy: 0, r: 10, a0: 0, a1: 45 };
    expect(extend(a, [a, L(-20, 0.0001, 20, 0.0001, "x")], [7, 7])).toMatchObject({ a1: 180 });
  });
});

describe("łuki w polilinii, rozbij, złącz", () => {
  it("wypełnienie b: zapis, odczyt i ścieżka SVG", () => {
    const d = parseDoc({ h: 100, k: 1, items: [{ t: "poly", pts: "0,0 10,0 10,10", b: "1 0 0" }] });
    const p = d.items[0];
    expect(p.t === "poly" && p.b).toEqual([1, 0, 0]);
    expect(storeDoc(d).items[0].b).toBe("1 0 0");
    expect(p.t === "poly" && polyPath(p.pts, false, p.b)).toContain("A 5 5 0 0 1 10 0");
    expect(bulgeArc([0, 0], [10, 0], 1)).toMatchObject({ cx: 5, cy: 0, r: 5 }); // półokrąg
  });
  it("prostokąt z zaokrągleniem rozbija się na 4 odcinki i 4 łuki", () => {
    const rc: Item = { id: "r", t: "rect", k: "con", sw: "auto", fill: "none", x: 0, y: 0, w: 100, h: 50, r: 10 };
    const parts = explode(rc)!;
    expect(parts.map((x) => x.t).sort()).toEqual(["arc", "arc", "arc", "arc", "line", "line", "line", "line"]);
  });
  it("cztery odcinki stykające się końcami → zamknięta polilinia", () => {
    const j = join([L(0, 0, 10, 0, "a"), L(10, 10, 10, 0, "b"), L(0, 10, 10, 10, "c"), L(0, 0, 0, 10, "d")]);
    expect(j?.t).toBe("poly");
    if (j?.t === "poly") { expect(j.closed).toBe(true); expect(j.pts).toHaveLength(4); }
  });
  it("rozbicie i złączenie wracają do tego samego kształtu", () => {
    const p: Item = { id: "p", t: "poly", k: "con", sw: "auto", arrow: "none", fill: "none", closed: true, pts: [[0, 0], [20, 0], [20, 10], [0, 10]], b: [0, 0.5, 0, 0] };
    const back = join(explode(p)!);
    expect(back && curvesOf(back)!.cs.map((c) => c.k)).toEqual(["L", "A", "L", "L"]);
  });
});

import { cornerLines, cornerVertex, filletCurves, offsetItem } from "@/lib/rys/edit";
describe("zaokrąglenie, faza, odsunięcie", () => {
  const sq: Item = { id: "r", t: "rect", k: "con", sw: "auto", fill: "hatch", x: 0, y: 0, w: 40, h: 20, r: 0 };
  it("narożnik prostokąta R5 → polilinia z łukiem 90°", () => {
    const p = cornerVertex(sq, 1, 5, false);
    expect(typeof p).not.toBe("string");
    if (typeof p !== "string") {
      expect(p.pts.slice(1, 3)).toEqual([[35, 0], [40, 5]]);
      expect(p.b?.[1]).toBeCloseTo(Math.tan(Math.PI / 8), 3); // ćwierć okręgu, zgodnie z zegarem
      expect(p.fill).toBe("hatch");
    }
  });
  it("faza 3 mm i za duży promień", () => {
    const p = cornerVertex(sq, 0, 3, true);
    expect(typeof p !== "string" && p.pts.slice(0, 2)).toEqual([[0, 3], [3, 0]]);
    expect(cornerVertex(sq, 0, 30, false)).toBe("promień za duży dla tych boków");
  });
  it("faza: dwie długości i długość × kąt (jak w CAD/NX)", () => {
    // wierzchołek 1 prostokąta (40, 0): pierwszy bok dochodzi z (0, 0), drugi idzie do (40, 20)
    const two = cornerVertex(sq, 1, 4, true, { d2: 2 });
    expect(typeof two !== "string" && two.pts.slice(1, 3)).toEqual([[36, 0], [40, 2]]);
    const near = cornerVertex(sq, 1, 4, true, { d2: 2 }, [40, 10]); // kursor przy drugim boku — on dostaje pierwszą długość
    expect(typeof near !== "string" && near.pts.slice(1, 3)).toEqual([[38, 0], [40, 4]]);
    const a30 = cornerVertex(sq, 1, 6, true, { ang: 30 }); // narożnik 90°: d2 = 6·tg 30°
    expect(typeof a30 !== "string" && a30.pts[2][1]).toBeCloseTo(6 * Math.tan(Math.PI / 6), 2);
    expect(cornerVertex(sq, 1, 6, true, { ang: 90 })).toBe("kąt fazy za duży dla tego narożnika");
    const r = cornerLines(L(0, 0, 100, 0, "a") as never, [80, 0], L(50, -50, 50, 50, "b") as never, [50, 40], 2, true, { ang: 45 });
    expect(typeof r !== "string" && r.extra).toMatchObject({ t: "line", x1: 52, y1: 0, x2: 50, y2: 2 });
  });
  it("łuk styczny do dwóch okręgów i do okręgu z linią (jak FILLET w CAD)", () => {
    const c = (cx: number, cy: number, r: number, id: string): Item => ({ id, t: "circle", k: "con", sw: "auto", fill: "none", cx, cy, r });
    const r = filletCurves(c(0, 0, 10, "a"), [0, -10], c(40, 0, 10, "b"), [40, -10], 15);
    expect(typeof r).not.toBe("string");
    if (typeof r !== "string") {
      expect(r.patch).toEqual([]); // okręgi zostają całe
      expect(r.arc).toMatchObject({ cx: 20, cy: -15, r: 15 });
      expect(r.arc.a0).toBeCloseTo(36.87, 1); expect(r.arc.a1).toBeCloseTo(143.13, 1); // łuk od strony okręgów
    }
    const lr = filletCurves(c(0, 0, 10, "a"), [10, 0], L(-50, 20, 50, 20, "l") as never, [20, 20], 8);
    expect(typeof lr).not.toBe("string");
    if (typeof lr !== "string") {
      expect(lr.arc).toMatchObject({ cx: 13.42, cy: 12, r: 8 });
      expect(lr.patch[0]).toMatchObject({ id: "l", x1: 13.42, y1: 20, x2: 50 });
    }
    expect(filletCurves(c(0, 0, 10, "a"), [0, -10], c(100, 0, 10, "b"), [100, -10], 5)).toBe("promień nie pasuje do tych elementów");
  });
  it("dwie linie: łuk styczny R10 i linie skrócone do punktów styczności", () => {
    const r = cornerLines(L(0, 0, 100, 0, "a") as never, [80, 0], L(50, -50, 50, 50, "b") as never, [50, 40], 10, false);
    expect(typeof r).not.toBe("string");
    if (typeof r !== "string") {
      expect([r.l1.x1, r.l1.x2]).toEqual([60, 100]);
      expect([r.l2.y1, r.l2.y2]).toEqual([10, 50]);
      expect(r.extra).toMatchObject({ t: "arc", cx: 60, cy: 10, r: 10 });
    }
  });
  it("odsunięcie: linia, okrąg i zamknięta polilinia na zewnątrz", () => {
    expect(offsetItem(L(0, 0, 10, 0), 2, [5, 5])).toMatchObject({ t: "line", y1: 2, y2: 2 });
    expect(offsetItem({ id: "c", t: "circle", k: "con", sw: "auto", fill: "none", cx: 0, cy: 0, r: 10 }, 2, [20, 0])).toMatchObject({ r: 12 });
    const tri: Item = { id: "t", t: "poly", k: "con", sw: "auto", arrow: "none", fill: "none", closed: true, pts: [[0, 0], [40, 0], [40, 20], [0, 20]] };
    const o = offsetItem(tri, 5, [-10, -10]);
    expect(o?.t === "poly" && o.pts).toEqual([[-5, -5], [45, -5], [45, 25], [-5, 25]]);
  });
});

import { mirrorItem } from "@/lib/rys/edit";
import { frameAngle, frameOf, stretchItem } from "@/lib/rys/model";
describe("lustro i ramka obrócona", () => {
  it("odbicie względem osi pionowej: linia, łuk (kierunek odwrócony), polilinia z łukiem", () => {
    const ax: [[number, number], [number, number]] = [[50, 0], [50, 10]];
    expect(mirrorItem(L(0, 0, 10, 5), ...ax)).toMatchObject({ x1: 100, y1: 0, x2: 90, y2: 5 });
    expect(mirrorItem({ id: "a", t: "arc", k: "con", sw: "auto", arrow: "none", cx: 40, cy: 0, r: 5, a0: 0, a1: 90 }, ...ax)).toMatchObject({ cx: 60, a0: 90, a1: 180 });
    const p = mirrorItem({ id: "p", t: "poly", k: "con", sw: "auto", arrow: "none", fill: "none", closed: false, pts: [[0, 0], [10, 0]], b: [0.5, 0] }, ...ax);
    expect(p.t === "poly" && p.b).toEqual([-0.5, 0]);
  });
  it("ramka obróconego prostokąta ma jego kąt i wymiary, rozciągnięcie zostawia kąty proste", () => {
    const poly: Item = { id: "p", t: "poly", k: "con", sw: "auto", arrow: "none", fill: "none", closed: true, pts: [[0, 0], [86.6, -50], [111.6, -6.7], [25, 43.3]] };
    expect(frameAngle([poly])).toBeCloseTo(-30, 1);
    const f = frameOf([poly], frameAngle([poly]))!;
    expect(f.hw * 2).toBeCloseTo(100, 0);
    expect(f.hh * 2).toBeCloseTo(50, 0);
    const s = stretchItem(poly, poly.t === "poly" ? poly.pts[0] : [0, 0], f.a, 1.5, 1);
    if (s.t === "poly") {
      const [a, b, c] = s.pts;
      expect(Math.hypot(b[0] - a[0], b[1] - a[1])).toBeCloseTo(150, 0);
      expect((a[0] - b[0]) * (c[0] - b[0]) + (a[1] - b[1]) * (c[1] - b[1])).toBeCloseTo(0, -1);
    }
  });
});
