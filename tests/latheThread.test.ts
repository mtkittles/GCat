import { describe, expect, it } from "vitest";
import { parseProgram, playLength } from "@/lib/parser";
import { carveLathe, initLatheProfile } from "@/components/simulator/latheStock";
import { defaultSetup, makeTool, type Tool } from "@/components/simulator/setup";
import { PROGRAMS } from "@/content/programy";

/*
  Regresja: tuleja z gwintem wewnętrznym M30×1,5 odtwarzana klatka po klatce (jak animacja)
  zbierała materiał z powierzchni ZEWNĘTRZNEJ — strona gwintu była oceniana na środku
  dotychczas wykonanej części przejścia, a ten na początku leżał przed czołem (brak materiału).
*/
function profileAt(stepMm: number | null) {
  const pg = PROGRAMS.find((p) => p.slug === "tuleja-gwint-wewn")!;
  const p = parseProgram(pg.src, { diameterX: true });
  const setup = defaultSetup("lathe");
  setup.tools = Object.fromEntries(Object.entries(pg.tools ?? {}).map(([n, t]) => [Number(n), { ...makeTool((t as Tool).kind), ...(t as Partial<Tool>) }]));
  const L = p.segments.map(playLength), total = L.reduce((a, b) => a + b, 0);
  const pr = initLatheProfile(p, p.segments, setup)!;
  if (stepMm === null) carveLathe(pr, p, p.segments, L, 0, total, setup);
  else for (let t = 0; t < total; t += stepMm) carveLathe(pr, p, p.segments, L, t, Math.min(total, t + stepMm), setup);
  return (z: number) => { const k = Math.round((z - pr.z0) / pr.dz); return { out: pr.rout[k] * 2, inn: pr.rin[k] * 2 }; };
}

describe("gwint wewnętrzny na tokarce", () => {
  it("animacja klatka po klatce nie zbiera materiału z zewnątrz tulei (⌀48 zostaje)", () => {
    const at = profileAt(0.4);
    for (const z of [-3, -8, -12, -18, -21]) expect(at(z).out).toBeCloseTo(48, 1);
  });
  it("klatka po klatce i jednym ruchem dają ten sam detal", () => {
    const a = profileAt(0.4), b = profileAt(null);
    for (let z = -24; z <= -1; z += 0.37) { expect(a(z).out).toBeCloseTo(b(z).out, 1); expect(a(z).inn).toBeCloseTo(b(z).inn, 1); }
  });
  it("bruzdy gwintu są w otworze: między ⌀28,4 (wierzchołek) a ⌀30 (dno)", () => {
    const at = profileAt(0.4);
    let deepest = 0;
    for (let z = -20; z <= -5; z += 0.05) deepest = Math.max(deepest, at(z).inn);
    expect(deepest).toBeGreaterThan(29.5); expect(deepest).toBeLessThanOrEqual(30.01);
  });
});
