import { describe, expect, it } from "vitest";
import { parseProgram } from "@/lib/parser";
import { arcNear, measLabel, nearestSnap, snapPoints } from "@/components/simulator/measure2d";

const prog = parseProgram(`G90 G17 G54
G00 X0 Y0 Z5
G01 Z-2 F100
G01 X40
G03 X50 Y10 I0 J10
G01 Y30
G00 Z5
M30`);

describe("pomiary 2D", () => {
  it("punkty przyciągania: końce ruchów roboczych i środek łuku, bez powtórzeń", () => {
    const pts = snapPoints(prog.segments, "x", "y");
    const list: string[] = [];
    for (let i = 0; i < pts.length; i += 2) list.push(`${pts[i]},${pts[i + 1]}`);
    expect(list).toContain("40,0");
    expect(list).toContain("50,10");
    expect(list).toContain("40,10");   // środek łuku G03
    expect(new Set(list).size).toBe(list.length);
  });

  it("przyciąga do najbliższego punktu w tolerancji, poza nią — nic", () => {
    const pts = snapPoints(prog.segments, "x", "y");
    expect(nearestSnap(pts, 40.3, 0.2, 1)).toEqual([40, 0]);
    expect(nearestSnap(pts, 20, 5, 1)).toBeNull();
  });

  it("łuk pod kursorem daje promień i środek", () => {
    const p = { x: 40 + 10 * Math.SQRT1_2, y: 10 - 10 * Math.SQRT1_2 };
    const arc = arcNear(prog.segments, "x", "y", p.x + 0.2, p.y, 0.5)!;
    expect(arc.r).toBeCloseTo(10);
    expect(arc.c).toEqual([40, 10]);
    expect(arcNear(prog.segments, "x", "y", 20, 20, 0.5)).toBeNull();
  });

  it("opis wymiaru: długość, przyrosty i kąt; tokarka — X jako średnica", () => {
    const d = measLabel({ kind: "d", a: [0, 0], b: [30, 40] }, "mill");
    expect(d.main).toBe("50.000 mm");
    expect(d.sub).toContain("ΔX 30.000");
    expect(d.sub).toContain("ΔY 40.000");
    expect(measLabel({ kind: "d", a: [0, 10], b: [-20, 15] }, "lathe").sub).toContain("ΔX⌀ 10.000");
    expect(measLabel({ kind: "r", c: [1, 2], r: 6, p: [7, 2] }, "mill").main).toBe("R 6.000  ⌀ 12.000");
  });
});
