import { describe, expect, it } from "vitest";
import { parseProgram, solveAngles, toolAxis, type Vec3 } from "@/lib/parser";
import { axisAt, isMultiAxis, toPartFrame } from "@/components/simulator/multiaxis";

const near = (a: Vec3, b: Vec3, eps = 1e-6) => {
  expect(a.x).toBeCloseTo(b.x, 5); expect(a.y).toBeCloseTo(b.y, 5); expect(a.z).toBeCloseTo(b.z, 5);
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) < eps;
};

describe("kinematyka stół–stół", () => {
  it("A/C: oś narzędzia po obrocie to kierunek, o który prosiliśmy", () => {
    for (const n of [{ x: 0, y: -1, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 0.5, y: 0.5, z: Math.SQRT1_2 }]) {
      const ang = solveAngles("AC", n, { a: 0, b: 0, c: 0 })!;
      near(toolAxis("AC", ang), n);
    }
  });
  it("A/C: z dwóch rozwiązań wybiera krótszy ruch (przód detalu: A-90, C0)", () => {
    expect(solveAngles("AC", { x: 0, y: -1, z: 0 }, { a: 0, b: 0, c: 0 })).toEqual({ a: -90, b: 0, c: 0 });
  });
  it("B/C: bok detalu +X → B-90", () => {
    const ang = solveAngles("BC", { x: 1, y: 0, z: 0 }, { a: 0, b: 0, c: 0 })!;
    expect(ang.b).toBeCloseTo(-90); near(toolAxis("BC", ang), { x: 1, y: 0, z: 0 });
  });
  it("sama oś A nie ustawi kierunku ze składową X", () => {
    expect(solveAngles("A", { x: 1, y: 0, z: 0 }, { a: 0, b: 0, c: 0 })).toBeNull();
  });
});

describe("parser: 3+2 i TCP", () => {
  it("program bez osi obrotowych nie jest wieloosiowy", () => {
    expect(isMultiAxis(parseProgram("G90 G54\nG00 X0 Y0 Z5\nG01 Z-1 F100\nG01 X20\nM30"))).toBe(false);
  });

  it("G68.2 + G53.1: punkt w pochylonym układzie trafia na ścianę +Y detalu, otwór G81 wzdłuż osi płaszczyzny", () => {
    const p = parseProgram(`G90 G54
G68.2 X0 Y0 Z0 I0 J-90 K0
G53.1
G00 X10 Y5 Z20
G81 Z-3 R2 F100
G80
G69
M30`);
    expect(p.lines.every((l) => l.errors.length === 0)).toBe(true);
    const parts = toPartFrame(p.segments, "AC");
    // obrót stołu po G53.1: oś narzędzia = +Y detalu
    near(axisAt(parts[parts.length - 1], 1), { x: 0, y: 1, z: 0 });
    // dojazd: (10, 5, 20) w układzie płaszczyzny → (10, 20, -5) w układzie detalu
    const rapid = parts.find((s) => s.line === 3)!;
    near(rapid.to, { x: 10, y: 20, z: -5 });
    // dno otworu: Z-3 płaszczyzny = 3 mm w głąb ściany (y = -3)
    const ys = parts.filter((s) => s.line === 4).map((s) => s.to.y);
    expect(Math.min(...ys)).toBeCloseTo(-3);
  });

  it("G43.4: sam obrót C — wierzchołek narzędzia stoi w miejscu, maszyna jedzie", () => {
    const p = parseProgram(`G90 G54
G43.4 H1
G00 X10 Y0 Z0 A-30 C0
G01 C90 F500
G49
M30`);
    const turn = p.segments.find((s) => s.line === 3)!;
    expect(Math.hypot(turn.to.x - turn.from.x, turn.to.y - turn.from.y, turn.to.z - turn.from.z)).toBeGreaterThan(1);
    const parts = toPartFrame(p.segments, "AC").filter((s) => s.line === 3);
    expect(parts.length).toBeGreaterThan(10);
    for (const s of parts) near(s.to, { x: 10, y: 0, z: 0 });
    near(axisAt(parts[parts.length - 1], 1), toolAxis("AC", { a: -30, b: 0, c: 90 }));
  });

  it("CYCLE800 osiowo (57), obrót X o -90, _DIR -1: oś narzędzia na ścianę +Y, A ujemne", () => {
    const p = parseProgram(`G17 G90 G54
CYCLE800(1,"TABLE",100000,57,0,0,0,-90,0,0,0,0,0,-1,100,1)
G0 X0 Y0 Z10
CYCLE800()
M30`, { dialect: "sinumerik" });
    expect(p.lines[1].errors).toEqual([]);
    expect(p.lines[1].state.rotary?.a).toBeLessThan(0);
    near(toolAxis("AC", p.lines[1].state.rotary), { x: 0, y: 1, z: 0 });
    // CYCLE800() wraca do położenia podstawowego
    expect(p.lines[3].state.tilt ?? null).toBeNull();
    expect(p.lines[3].state.rotary?.a ?? 0).toBeCloseTo(0);
  });

  it("4. oś bez TCP (indeksowanie): po A90 oś Z maszyny to oś Y detalu", () => {
    const p = parseProgram("G90 G54\nG00 X10 Y0 Z30 A90\nG01 Z-2 F100\nM30");
    expect(isMultiAxis(p)).toBe(true);
    const cut = toPartFrame(p.segments, "AC").find((s) => s.line === 2)!;
    near(cut.to, { x: 10, y: -2, z: 0 });
    near(axisAt(cut, 1), { x: 0, y: 1, z: 0 });
  });
});
