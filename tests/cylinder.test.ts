import { describe, expect, it } from "vitest";
import { parseProgram, playLength } from "@/lib/parser";
import { angleAt, carveCyl, carveCylStep, cylIndex, cylInit, cylMesh, cylMeta, cylUpdate, cylVolume } from "@/components/simulator/cylinder";
import { defaultSetup } from "@/components/simulator/setup";

/* Walec ⌀60 (R=30), długość 100, zero X na lewym czole, zero Z na powierzchni (oz = 30 → oś w Z-30). */
const setupCyl = () => { const s = defaultSetup("mill"); s.stock = { ...s.stock, shape: "cylX", d: 60, len: 100, ox: 0, oz: 30 }; return s; };
const TOP = Math.PI / 2; // θ wierzchu przy A=0

describe("parser: kąt A na odcinku", () => {
  it("G01 X50 A360 zapamiętuje A od 0 do 360 na odcinku; blok bez A dziedziczy kąt", () => {
    const p = parseProgram("G90 G00 X0 Y0 Z5 A0\nG01 X50 A360 F300\nG01 Z-1");
    expect(p.lines[1].segments[0].kind !== "dwell" && p.lines[1].segments[0].a).toEqual({ from: 0, to: 360 });
    expect(p.lines[2].segments[0].kind !== "dwell" && p.lines[2].segments[0].a).toEqual({ from: 360, to: 360 });
  });
  it("program bez A nie dostaje pola a", () => {
    const p = parseProgram("G90 G00 X0 Y0 Z5\nG01 X50 F300");
    expect("a" in p.lines[1].segments[0]).toBe(false);
  });
  it("angleAt interpoluje w trakcie odcinka", () => {
    const p = parseProgram("G90 G00 X0 Y0 Z5 A0\nG01 X100 A180 F300");
    const lengths = p.segments.map(() => 100);
    expect(angleAt(p, lengths, 50)).toBeCloseTo(90, 6);
    expect(angleAt(p, lengths, 100)).toBe(180);
  });
});

describe("walec na 4. osi: skrawanie frezem walcowym", () => {
  it("frez ⌀6 na Z-1 przy A=0 zdejmuje 1 mm na wierzchu (θ=90°) w pasie ±3 mm, reszta nietknięta", () => {
    const m = cylMeta(setupCyl()), h = cylInit(m);
    const changed = carveCylStep(h, m, 50, 0, -1, 0, 3);
    expect(changed).toBeGreaterThan(0);
    const jTop = Math.round((50 - m.x0) / m.cx), iTop = Math.round(TOP / m.ct);
    expect(h[cylIndex(m, jTop, iTop)]).toBeCloseTo(29, 2);
    expect(h[cylIndex(m, jTop + Math.ceil(5 / m.cx), iTop)]).toBe(30);   // 5 mm dalej w X — poza frezem
    expect(h[cylIndex(m, jTop, iTop + Math.round(Math.PI / 2 / m.ct))]).toBe(30); // θ=180° (bok) — nietknięte
    expect(h[cylIndex(m, jTop, 0)]).toBe(30);                              // θ=0 (bok +Y) — nietknięte
  });
  it("po obrocie A=90 ten sam frez skrawa θ=0° detalu, a wierzch θ=90° zostaje", () => {
    const m = cylMeta(setupCyl()), h = cylInit(m);
    carveCylStep(h, m, 50, 0, -1, 90, 3);
    const j = Math.round((50 - m.x0) / m.cx);
    expect(h[cylIndex(m, j, 0)]).toBeCloseTo(29, 2);
    expect(h[cylIndex(m, j, Math.round(TOP / m.ct))]).toBe(30);
  });
  it("frez nad powierzchnią nic nie zbiera; program z G01 A360 zbiera rowek dookoła", () => {
    const m = cylMeta(setupCyl()), h = cylInit(m);
    expect(carveCylStep(h, m, 50, 0, 2, 0, 3)).toBe(0);
    const p = parseProgram("G90 G00 X50 Y0 Z5 A0\nG01 Z-2 F100\nG01 A360 F300");
    expect(p.segments).toHaveLength(2); // Z-2 i sam obrót A360 (odcinek bez długości liniowej)
    const L = p.segments.map(playLength);
    expect(L[1]).toBeGreaterThan(0);
    carveCyl(h, m, p, L, setupCyl(), 0, L.reduce((a, b) => a + b, 0));
    const j = Math.round((50 - m.x0) / m.cx);
    for (const i of [0, Math.round(m.nt / 4), Math.round(m.nt / 2), Math.round((3 * m.nt) / 4)]) expect(h[cylIndex(m, j, i)]).toBeCloseTo(28, 1);
    const v = cylVolume(h, m);
    expect(v.left).toBeLessThan(v.full); expect(v.left).toBeGreaterThan(v.full * 0.98);
  });
  it("siatka: (nx+1)·nt wierzchołków płaszcza + 2 czoła, aktualizacja promieni bez alokacji", () => {
    const m = cylMeta(setupCyl(), 120), h = cylInit(m);
    const g = cylMesh(h, m);
    expect(g.pos.length / 3).toBe((m.nx + 1) * m.nt + 2 * (m.nt + 1));
    expect(g.idx.length % 3).toBe(0);
    const k = cylIndex(m, 3, 0); h[k] = 20;
    cylUpdate(g.pos, g.map, h, m);
    const v = Array.from(g.map).indexOf(k);
    expect(Math.hypot(g.pos[v * 3 + 1], g.pos[v * 3 + 2])).toBeCloseTo(20, 6);
  });
});
