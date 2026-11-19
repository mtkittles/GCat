import { describe, expect, it } from "vitest";
import { framed } from "../src/components/simulator/frame";
import { parseProgram } from "../src/lib/parser";

const empty = { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 50 } };

describe("framed — kadr podglądu 2D (V5)", () => {
  it("pusty program w zadaniu: kadr obejmuje półfabrykat, nie ±10 mm wokół zera", () => {
    const b = framed(empty, [{ minX: -10, maxX: 90, minY: -10, maxY: 60 }], null);
    expect(b.min).toMatchObject({ x: -10, y: -10 });
    expect(b.max).toMatchObject({ x: 90, y: 60 });
  });

  it("tor wzorcowy poza półfabrykatem też w kadrze", () => {
    const ref = parseProgram("G90 G21 G17\nG00 X0 Y0 Z5\nG01 Z-3 F200\nG01 X120 Y0\nG01 X120 Y-15\n").segments.filter((s) => s.kind !== "rapid");
    const b = framed(empty, [{ minX: 0, maxX: 100, minY: 0, maxY: 70 }], ref);
    expect(b.max.x).toBe(120);
    expect(b.min.y).toBe(-15);
    expect(b.max.y).toBe(70);
  });

  it("bez półfabrykatu i wzorca — kadr toru bez zmian", () => {
    const tor = { min: { x: 5, y: 5, z: -3 }, max: { x: 40, y: 20, z: 5 } };
    expect(framed(tor)).toEqual(tor);
    expect(framed(tor, null, null)).toEqual(tor);
  });
});
