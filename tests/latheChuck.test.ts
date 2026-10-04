import { describe, expect, it } from "vitest";
import { parseProgram } from "@/lib/parser";
import { initLatheProfile, latheChuck, latheCollisions } from "@/components/simulator/latheStock";
import { defaultSetup } from "@/components/simulator/setup";

/* Pręt ⌀40, wysięg 50 (półfabrykat ręczny): czoło szczęk w Z-50, szczęki do ⌀64. */
const manual = () => { const s = defaultSetup("lathe"); s.stock = { ...s.stock, auto: false, d: 40, len: 50 }; return s; };
const PROG = "G18 G90 G00 X42 Z2\nG01 X38 F0.2\nG01 Z-40\nG00 X42\nG00 Z2\nM30";

describe("uchwyt tokarski", () => {
  it("czoło szczęk na końcu wysięgu, szczęki 12 mm ponad pręt", () => {
    const p = parseProgram(PROG, { diameterX: true });
    const ch = latheChuck(initLatheProfile(p, p.segments, manual())!);
    expect(ch.zFace).toBe(-50); expect(ch.jawR).toBe(32);
  });
  it("toczenie do Z-40 przy wysięgu 50 — bez kolizji; do Z-55 — kolizja ze szczękami na tej linii", () => {
    const ok = parseProgram(PROG, { diameterX: true });
    expect(latheCollisions(ok, ok.segments, manual())).toEqual([]);
    const bad = parseProgram(PROG.replace("Z-40", "Z-55"), { diameterX: true });
    const c = latheCollisions(bad, bad.segments, manual());
    // pierwsza kolizja na linii toczenia; odjazd X i powrót Z też zaczynają się w szczękach
    expect(c.map((i) => i.line)).toEqual([2, 3, 4]); expect(c[0].msg).toMatch(/szczękami/);
  });
  it("półfabrykat automatyczny: uchwyt za najdalszym punktem programu, kolizji nie zgłaszamy", () => {
    const p = parseProgram(PROG.replace("Z-40", "Z-55"), { diameterX: true });
    const s = defaultSetup("lathe");
    expect(latheCollisions(p, p.segments, s)).toEqual([]);
    const ch = latheChuck(initLatheProfile(p, p.segments, s)!, p.segments, true);
    expect(ch.zFace).toBeLessThanOrEqual(-58);
  });
});
