import { describe, expect, it } from "vitest";
import { carveRange } from "@/components/simulator/carveRange";

/* Przyrostowa warstwa materiału (Simulator.tsx): kawałki z kolejnych klatek = jedno wycięcie od zera. */
const lengths = [5, 0, 12.5, 3, 40, 0.2];
const total = lengths.reduce((a, b) => a + b, 0);

function coverage(pieces: { i: number; d0: number; d1: number }[]) {
  const per = lengths.map(() => [] as [number, number][]);
  for (const p of pieces) per[p.i].push([p.d0, p.d1]);
  // scal przedziały każdego odcinka
  return per.map((iv) => {
    const s = iv.sort((a, b) => a[0] - b[0]);
    const m: [number, number][] = [];
    for (const [a, b] of s) { const last = m.at(-1); if (last && a <= last[1] + 1e-12) last[1] = Math.max(last[1], b); else m.push([a, b]); }
    return m.map(([a, b]) => [+a.toFixed(9), +b.toFixed(9)]);
  });
}

describe("carveRange", () => {
  it("od zera do postępu: pełne odcinki (też zerowej długości — jak dotąd w widoku) i ułamek bieżącego", () => {
    expect(carveRange(lengths, 0, 10)).toEqual([{ i: 0, d0: 0, d1: 1 }, { i: 1, d0: 0, d1: 1 }, { i: 2, d0: 0, d1: 5 / 12.5 }]);
  });

  it("kolejne klatki pokrywają to samo co jedno wycięcie", () => {
    for (const to of [0.3, 7, 17.5, 20.5, total * 0.73, total]) {
      const once = coverage(carveRange(lengths, 0, to));
      const steps: { i: number; d0: number; d1: number }[] = [];
      let from = 0;
      for (let k = 1; k <= 37; k++) { const p = (to * k) / 37; steps.push(...carveRange(lengths, from, p)); from = p; }
      expect(coverage(steps)).toEqual(once);
    }
  });

  it("bez ruchu postępu nic nie dochodzi", () => {
    expect(carveRange(lengths, 12, 12)).toEqual([]);
    expect(carveRange(lengths, total, total)).toEqual([]);
  });
});
