import { describe, expect, it } from "vitest";
import { parseProgram } from "@/lib/parser";
import { validate } from "@/lib/parser/validate";
import { pieceOrigins, stockBoxes } from "@/components/simulator/pieces";
import { defaultSetup } from "@/components/simulator/setup";

/* Program obrabiający dwie sztuki: ten sam kontur w G54 i w G55 przesuniętym o X60. */
const TWO = "G90 G10 L2 P2 X60 Y0 Z0\nG54 G00 X0 Y0 Z5\nG01 Z-1 F100\nG01 X20 F300\nG01 Y10\nG00 Z5\nG55\nG00 X0 Y0\nG01 Z-1 F100\nG01 X20 F300\nG01 Y10\nG00 Z5\nM30";

describe("detale w symulacji (osobny półfabrykat na układ)", () => {
  it("G54 + G55 → dwa zera detali; G52/G92 nie tworzą nowej sztuki", () => {
    const p = parseProgram(TWO);
    expect(pieceOrigins(p, p.segments, true)).toEqual([{ x: 0, y: 0, z: 0 }, { x: 60, y: 0, z: 0 }]);
    const q = parseProgram("G90 G00 X0 Y0 Z5\nG01 Z-1 F100\nG52 X30 Y0\nG01 X10 F100\nG92 X0\nG01 X5");
    expect(pieceOrigins(q, q.segments, true)).toEqual([{ x: 0, y: 0, z: 0 }]);
  });
  it("wyłączone → jeden detal w zerze; program bez ruchu roboczego → jeden detal", () => {
    const p = parseProgram(TWO);
    expect(pieceOrigins(p, p.segments, false)).toEqual([{ x: 0, y: 0, z: 0 }]);
    const r = parseProgram("G00 X10 Y10");
    expect(pieceOrigins(r, r.segments, true)).toEqual([{ x: 0, y: 0, z: 0 }]);
  });
  it("ręczny półfabrykat 100×80×20 z zerem w narożniku: dwa prostopadłościany, drugi przesunięty o X60", () => {
    const p = parseProgram(TWO);
    const setup = defaultSetup("mill");
    setup.stock = { ...setup.stock, auto: false, x: 100, y: 80, z: 20, ox: 0, oy: 0, oz: 20 };
    const b = stockBoxes(p, p.segments, setup);
    expect(b).toHaveLength(2);
    expect(b[0]).toMatchObject({ x0: 0, x1: 100, y0: 0, y1: 80, top: 0, bottom: -20 });
    expect(b[1]).toMatchObject({ x0: 60, x1: 160, y0: 0, y1: 80, top: 0, bottom: -20, origin: { x: 60, y: 0, z: 0 } });
  });
  it("automatyczny półfabrykat: obrys ruchów roboczych każdego detalu osobno, z promieniem narzędzia (⌀10 → 5 mm)", () => {
    const p = parseProgram(TWO);
    const b = stockBoxes(p, p.segments, defaultSetup("mill"));
    expect(b).toHaveLength(2);
    expect(b[0]).toMatchObject({ x0: -5, x1: 25, y0: -5, y1: 15, top: 0 });
    expect(b[1]).toMatchObject({ x0: 55, x1: 85, y0: -5, y1: 15, top: 0 });
    const one = stockBoxes(p, p.segments, { ...defaultSetup("mill"), stock: { ...defaultSetup("mill").stock, perWcs: false } });
    expect(one).toHaveLength(1); expect(one[0]).toMatchObject({ x0: -5, x1: 85 });
  });
  it("bez przesunięć wynik jak dotąd: jeden prostokąt", () => {
    const p = parseProgram("G90 G00 X0 Y0 Z5\nG01 Z-1 F100\nG01 X20 F300");
    expect(stockBoxes(p, p.segments, defaultSetup("mill"))).toHaveLength(1);
  });
  it("walidator sprawdza kolizję szybkiego przejazdu z każdym detalem", () => {
    const p = parseProgram("G90 G00 X-10 Y5 Z-2\nG00 X70 Y5\nM30");
    const boxes = [{ minX: 0, maxX: 20, minY: 0, maxY: 10, top: 0, bottom: -20 }, { minX: 60, maxX: 80, minY: 0, maxY: 10, top: 0, bottom: -20 }];
    const msgs = validate(p, "fanuc", boxes).filter((i) => /Kolizja/.test(i.msg));
    expect(msgs.length).toBeGreaterThan(0);
    const far = parseProgram("G90 G00 X30 Y5 Z-2\nG00 X50 Y5\nM30");
    expect(validate(far, "fanuc", boxes).filter((i) => /Kolizja/.test(i.msg))).toHaveLength(0);
  });
});
