import { describe, expect, it } from "vitest";
import { parseProgram } from "@/lib/parser";
import { buildGeo, measLabel, measOf, measValue, nearestArc, nearestPoint, pickEnt, placeLin, radOf, type Ent } from "@/components/simulator/measure2d";

const prog = parseProgram(`G90 G17 G54
G00 X0 Y0 Z5
G01 Z-2 F100
G01 X40
G03 X50 Y10 I0 J10
G01 Y30
G00 Z5
G00 X70 Y20
G01 Z-2
G03 I-5 J0
G00 Z5
M30`);
const geo = buildGeo(prog.segments, "x", "y", [{ x0: -10, y0: -10, x1: 90, y1: 50 }]);
const L = (a: [number, number], b: [number, number], q = a): Extract<Ent, { t: "l" }> => ({ t: "l", a, b, q });

describe("wymiarowanie 2D", () => {
  it("geometria: końce ruchów, środki łuków, naroża półfabrykatu; linie bez ruchów w samym Z", () => {
    const list: string[] = [];
    for (let i = 0; i < geo.pts.length; i += 2) list.push(`${geo.pts[i]},${geo.pts[i + 1]}`);
    for (const p of ["40,0", "50,10", "40,10", "-10,-10", "90,50"]) expect(list).toContain(p);
    expect(new Set(list).size).toBe(list.length);
    // 4 krawędzie półfabrykatu + X40 + Y30 (ruch Z-2 ma zerowy rzut)
    expect(geo.lines.length / 4).toBe(6);
    expect(geo.arcs.find((a) => a.full)?.r).toBeCloseTo(5);
  });

  it("wskazanie: punkt ma pierwszeństwo, łuk działa w narzędziu Ø/R", () => {
    expect(nearestPoint(geo.pts, 40.3, 0.2, 1)).toEqual([40, 0]);
    expect(pickEnt(geo, "dist", 20, 0.3, 1)?.t).toBe("l");
    const c = nearestArc(geo.arcs, 65, 25.2, 0.5)!;
    expect(c.full).toBe(true);
    expect(pickEnt(geo, "dia", 65, 25.2, 0.5)?.t).toBe("c");
  });

  it("punkt–punkt: linia wymiarowa nad punktami — poziomo, z boku — pionowo, między nimi — wyrównany", () => {
    expect(measValue(placeLin([0, 0], [30, 40], [15, 60]))).toBeCloseTo(30);
    expect(measValue(placeLin([0, 0], [30, 40], [50, 20]))).toBeCloseTo(40);
    expect(measValue(placeLin([0, 0], [30, 40], [15, 20]))).toBeCloseTo(50);
    expect(measLabel(placeLin([0, 0], [30, 40], [15, 60]), "mill").sub).toContain("poziomo");
  });

  it("linie równoległe i punkt–linia: odległość prostopadła; linie pod kątem — kąt", () => {
    const par = measOf("dist", L([0, 0], [40, 0], [20, 0]), L([0, 10], [40, 10]));
    expect(par && "kind" in par && par.kind).toBe("perp");
    expect(measValue(par as never)).toBeCloseTo(10);
    const pl = measOf("dist", { t: "p", p: [5, 7] }, L([0, 0], [40, 0]));
    expect(measValue(pl as never)).toBeCloseTo(7);
    const ang = measOf("ang", L([0, 0], [10, 0], [8, 0]), L([0, 0], [10, 10], [8, 8]));
    expect(measValue(ang as never)).toBeCloseTo(45);
    // wskazania po drugiej stronie wierzchołka — kąt rozwarty
    const obt = measOf("ang", L([0, 0], [10, 0], [-8, 0]), L([0, 0], [10, 10], [8, 8]));
    expect(measValue(obt as never)).toBeCloseTo(135);
  });

  it("okrąg pełny — średnica, łuk — promień; od środka okręgu do linii", () => {
    const full = radOf(nearestArc(geo.arcs, 65, 25.2, 0.5)!);
    expect(full.dia).toBe(true);
    expect(measLabel(full, "mill").main).toBe("⌀10.000");
    const arc = radOf(nearestArc(geo.arcs, 40 + 10 * Math.SQRT1_2, 10 - 10 * Math.SQRT1_2, 0.5)!);
    expect(arc.dia).toBe(false);
    expect(measLabel(arc, "mill").main).toBe("R10.000");
    const fromCenter = measOf("dist", { t: "c", c: [65, 20], r: 5, full: true, q: [65, 25] }, L([0, 0], [40, 0]));
    expect(measValue(fromCenter as never)).toBeCloseTo(20);
  });
});
