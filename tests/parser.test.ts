import { describe, expect, it } from "vitest";
import { parseProgram, tokenize } from "@/lib/parser";

// Pierwszy ruch szybki od pozycji startowej tylko ustawia położenie (nie rysuje odcinka),
// dlatego koniec programu czytamy ze stanu ostatniej linii, a nie z segmentów.
const last = (src: string, opts?: Parameters<typeof parseProgram>[1]) => {
  const p = parseProgram(src, opts);
  return p.lines[p.lines.length - 1].state.pos;
};

describe("tokenize", () => {
  it("rozbija słowa i komentarze w nawiasie i po średniku", () => {
    const t = tokenize("N10 G01 X-12.5 Y3 (KONTUR) ; posuw");
    expect(t.words.map((w) => w.letter + w.value)).toEqual(["N10", "G1", "X-12.5", "Y3"]);
    expect(t.comment).toBe("KONTUR posuw");
  });
});

describe("ruchy liniowe i tryby", () => {
  it("G90 bezwzględnie, G91 przyrostowo", () => {
    expect(last("G90 G00 X10 Y20\nG01 X30 F100")).toEqual({ x: 30, y: 20, z: 0 });
    expect(last("G90 G00 X10 Y20\nG91 G01 X5 Y-5 F100")).toEqual({ x: 15, y: 15, z: 0 });
  });
  it("G20 przelicza cale na milimetry", () => {
    expect(last("G20 G90 G00 X1 Y0")).toEqual({ x: 25.4, y: 0, z: 0 });
  });
  it("tokarka: X w średnicy, geometria na promieniu", () => {
    expect(last("G18 G90 G00 X40 Z2", { diameterX: true })).toEqual({ x: 20, y: 0, z: 2 });
  });
  it("pierwszy G00 ustawia pozycję bez odcinka; kolejne ruchy rysują", () => {
    expect(parseProgram("G90 G00 X10 Y0").segments).toHaveLength(0);
    expect(parseProgram("G90 G00 X10 Y0\nG01 X20 F100").segments).toHaveLength(1);
  });
});

describe("łuki", () => {
  it("R dodatnie — łuk krótki, R ujemne — długi (środki po przeciwnych stronach cięciwy)", () => {
    const a = parseProgram("G17 G90 G00 X20 Y20\nG03 X50 Y50 R30 F100").segments[0];
    const b = parseProgram("G17 G90 G00 X20 Y20\nG03 X50 Y50 R-30 F100").segments[0];
    if (a.kind !== "arc" || b.kind !== "arc") throw new Error("oczekiwano łuku");
    expect([a.center.x, a.center.y].map(Math.round)).toEqual([20, 50]);
    expect([b.center.x, b.center.y].map(Math.round)).toEqual([50, 20]);
  });
  it("I/J są przyrostowe względem punktu startu także przy G90", () => {
    const s = parseProgram("G17 G90 G00 X40 Y25\nG02 X40 Y25 I10 J0 F100").segments[0];
    if (s.kind !== "arc") throw new Error("oczekiwano łuku");
    expect(s.center).toEqual({ x: 50, y: 25, z: 0 });
  });
  it("za mały promień zgłasza błąd zamiast cichego łuku", () => {
    const p = parseProgram("G17 G90 G00 X0 Y0\nG02 X100 Y0 R10 F100");
    expect(p.lines[1].errors.join(" ")).toMatch(/za mały/);
  });
  it("łuk w G18 używa I/K", () => {
    const s = parseProgram("G18 G90 G00 X0 Z0\nG02 X10 Z-10 I10 K0 F100").segments[0];
    expect(s.kind).toBe("arc");
    if (s.kind === "arc") expect(s.center).toEqual({ x: 10, y: 0, z: 0 });
  });
});

describe("cykle i podprogramy", () => {
  it("G81 w G99 wraca do płaszczyzny R, w G98 do Z początkowego", () => {
    const p99 = parseProgram("G17 G90 G00 X0 Y0 Z10\nG99 G81 X10 Y10 Z-5 R2 F100\nG80");
    const p98 = parseProgram("G17 G90 G00 X0 Y0 Z10\nG98 G81 X10 Y10 Z-5 R2 F100\nG80");
    expect(last("G17 G90 G00 X0 Y0 Z10\nG99 G81 X10 Y10 Z-5 R2 F100").z).toBe(2);
    expect(p99.lines[1].segments.length).toBeGreaterThan(0);
    expect(last("G17 G90 G00 X0 Y0 Z10\nG98 G81 X10 Y10 Z-5 R2 F100").z).toBe(10);
    expect(p98.lines[1].state.cycle?.retract).toBe(98);
  });
  it("M98 wykonuje podprogram spod M30 zadaną liczbę razy", () => {
    const src = "G17 G90 G91 G00 X0 Y0\nM98 P100 L3\nM30\nO100\nG01 X10 F100\nM99";
    const p = parseProgram(src);
    expect(p.segments.filter((s) => s.kind === "linear")).toHaveLength(3);
    expect(p.lines[2].state.pos.x).toBe(30); // stan w linii M30, po trzech wywołaniach
  });
  it("brak podprogramu to błąd na linii wywołania", () => {
    const p = parseProgram("G00 X0\nM98 P999\nM30");
    expect(p.lines[1].errors.join(" ")).toMatch(/Brak podprogramu/);
  });
});

describe("czas i postój", () => {
  it("G04 P w milisekundach, X w sekundach", () => {
    const a = parseProgram("G04 P500").segments[0];
    const b = parseProgram("G04 X1.5").segments[0];
    expect(a.kind === "dwell" && a.seconds).toBe(0.5);
    expect(b.kind === "dwell" && b.seconds).toBe(1.5);
  });
  it("czas cyklu liczy posuw roboczy", () => {
    const p = parseProgram("G90 G00 X0 Y0\nG01 X100 F100");
    expect(p.seconds).toBeGreaterThanOrEqual(60);
  });
});

describe("osie obrotowe", () => {
  it("A zapamiętane bezwzględnie i przyrostowo, z opisem; tor liniowy bez zmian", () => {
    const p = parseProgram("G90 G00 X10 Y0 A90\nG91 G01 X5 A-30 F200");
    expect(p.lines[0].state.rotary?.a).toBe(90);
    expect(p.lines[1].state.rotary?.a).toBe(60);
    expect(p.lines[1].description).toMatch(/Oś obrotowa: A60°/);
    expect(p.lines[1].state.pos).toEqual({ x: 15, y: 0, z: 0 });
  });
});
