import { describe, expect, it } from "vitest";
import { parseProgram } from "@/lib/parser";
import { carveCylStep, contactAngle, cylCollisions, cylIndex, cylInit, cylMeta, toolProfile } from "@/components/simulator/cylinder";
import { defaultSetup, makeTool } from "@/components/simulator/setup";

/* Walec ⌀60 (R=30), długość 100, Z0 na powierzchni; oś w Z-30. */
const setupCyl = (extra: object = {}) => { const s = defaultSetup("mill"); s.stock = { ...s.stock, shape: "cylX", d: 60, len: 100, ox: 0, oz: 30, ...extra }; return s; };
const TOP = Math.PI / 2;

describe("profile narzędzi na walcu", () => {
  it("frez kulisty ⌀6 na Z-1: rowek półokrągły — w osi freza 1 mm, 0,8 mm od osi płycej", () => {
    const m = cylMeta(setupCyl()), h = cylInit(m), t = makeTool("ballnose"); t.d = 6;
    carveCylStep(h, m, 50, 0, -1, 0, 3, toolProfile(t));
    const j = Math.round((50 - m.x0) / m.cx), iTop = Math.round(TOP / m.ct);
    expect(30 - h[cylIndex(m, j, iTop)]).toBeCloseTo(1, 1);
    const dj = Math.round(0.8 / m.cx);
    const side = 30 - h[cylIndex(m, j + dj, iTop)];
    expect(side).toBeLessThan(0.95); expect(side).toBeGreaterThan(0.6);
  });
  it("frez płaski z tym samym zagłębieniem robi rowek o płaskim dnie (0,8 mm od osi też 1 mm)", () => {
    const m = cylMeta(setupCyl()), h = cylInit(m);
    carveCylStep(h, m, 50, 0, -1, 0, 3, toolProfile(makeTool("endmill")));
    const j = Math.round((50 - m.x0) / m.cx), iTop = Math.round(TOP / m.ct);
    expect(30 - h[cylIndex(m, j + Math.round(0.8 / m.cx), iTop)]).toBeCloseTo(1, 1);
  });
  it("frez grawerski V 60° na Z-0,5 przesuwany wzdłuż X: rowek o dnie ≈0,5 mm i szerokości ≈0,58 mm", () => {
    const m = cylMeta(setupCyl()), h = cylInit(m), t = makeTool("vbit"), prof = toolProfile(t);
    for (let x = 45; x <= 55; x += 0.05) carveCylStep(h, m, x, 0, -0.5, 0, 3, prof);
    const j = Math.round((50 - m.x0) / m.cx), iTop = Math.round(TOP / m.ct);
    // ostre dno: węzeł kątowy nie trafia dokładnie w wierzchołek (oczko ~0,34 mm po obwodzie)
    let deepest = 0;
    for (let di = -2; di <= 2; di++) deepest = Math.max(deepest, 30 - h[cylIndex(m, j, iTop + di)]);
    expect(deepest).toBeGreaterThan(0.3); expect(deepest).toBeLessThanOrEqual(0.5 + 1e-6);
    // ~1 mm w bok po obwodzie (3 oczka) — już poza rowkiem
    expect(h[cylIndex(m, j, iTop + 3)]).toBe(30); expect(h[cylIndex(m, j, iTop - 3)]).toBe(30);
  });
  it("profil: płaski → null, kulisty w d=r równy r, stożek 90° w d=1 równy 1", () => {
    expect(toolProfile(makeTool("endmill"))).toBeNull();
    const b = makeTool("ballnose"); b.d = 10;
    expect(toolProfile(b)!(5)).toBeCloseTo(5, 9);
    expect(toolProfile(makeTool("chamfer"))!(1)).toBeCloseTo(1, 9);
  });
});

describe("uchwyt i konik", () => {
  it("frez ⌀10 w X10 na Z-1 wchodzi w szczęki (10 mm od lewego czoła); w X30 — bez kolizji", () => {
    const bad = parseProgram("G90 G00 X10 Y0 Z5 A0\nG01 Z-1 F100\nG01 X30 F300\nM30");
    const msgs = cylCollisions(bad, setupCyl());
    expect(msgs.some((i) => /szczękami/.test(i.msg) && i.level === "error")).toBe(true);
    const ok = parseProgram("G90 G00 X30 Y0 Z5 A0\nG01 Z-1 F100\nG01 X80 A360 F300\nG00 Z5\nM30");
    expect(cylCollisions(ok, setupCyl())).toEqual([]);
  });
  it("wysoko nad uchwytem (Z50) wolno przejechać; szczęki 0 mm — brak kolizji ze szczękami", () => {
    expect(cylCollisions(parseProgram("G90 G00 X5 Y0 Z50\nG00 X90 Z50\nM30"), setupCyl())).toEqual([]);
    expect(cylCollisions(parseProgram("G90 G00 X5 Y0 Z5\nG01 Z-1 F100\nM30"), setupCyl({ grip: 0 })).filter((i) => /szczękami/.test(i.msg))).toEqual([]);
  });
  it("kieł konika: ruch w X100 nisko przy osi koliduje tylko gdy konik włączony", () => {
    const p = parseProgram("G90 G00 X105 Y0 Z5\nG01 Z-25 F100\nM30");
    expect(cylCollisions(p, setupCyl()).some((i) => /konika/.test(i.msg))).toBe(false);
    expect(cylCollisions(p, setupCyl({ tailstock: true })).some((i) => /konika/.test(i.msg))).toBe(true);
  });
});

describe("rozwinięcie: kąt styku", () => {
  it("Y0 przy A0 → 90° (wierzch), A90 → 0°, A-90 → 180°, pełny obrót zawija", () => {
    expect(contactAngle(0, 0, 30)).toBeCloseTo(90, 9);
    expect(contactAngle(0, 90, 30)).toBeCloseTo(0, 9);
    expect(contactAngle(0, -90, 30)).toBeCloseTo(180, 9);
    expect(contactAngle(0, 360, 30)).toBeCloseTo(90, 9);
  });
});
