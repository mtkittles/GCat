import { describe, expect, it } from "vitest";
import { chaikin, simplify, smoothStroke } from "@/lib/rys/sketch";
import type { P2 } from "@/lib/rys/model";

/* Rysownik: ołówek odręczny — uproszczenie, wygładzenie, zamykanie śladu. */

// pseudolosowe drżenie ręki (powtarzalne)
const jitter = (i: number) => Math.sin(i * 12.9898) * 0.4;

describe("ołówek odręczny", () => {
  it("drżąca prosta → kilka punktów blisko prostej", () => {
    const raw: P2[] = Array.from({ length: 120 }, (_, i) => [i, 50 + jitter(i)]);
    const r = smoothStroke(raw, 1, 2)!;
    expect(r.closed).toBe(false);
    expect(r.pts.length).toBeLessThan(8);
    expect(r.pts[0]).toEqual([0, 50.0]);
    for (const p of r.pts) expect(Math.abs(p[1] - 50)).toBeLessThan(0.6);
  });

  it("okrąg narysowany ręką zamyka się i zostaje gładki", () => {
    const raw: P2[] = Array.from({ length: 200 }, (_, i) => { const a = (i / 185) * 2 * Math.PI; /* zakładka ~8% za początek */ return [100 + 40 * Math.cos(a) + jitter(i), 100 + 40 * Math.sin(a) + jitter(i + 7)]; });
    const r = smoothStroke(raw, 1, 2)!;
    expect(r.closed).toBe(true);
    expect(r.pts.length).toBeGreaterThan(12);
    expect(r.pts.length).toBeLessThan(120);
    for (const p of r.pts) expect(Math.abs(Math.hypot(p[0] - 100, p[1] - 100) - 40)).toBeLessThan(2.5);
  });

  it("samo kliknięcie nie tworzy linii; długi ślad mieści się w limicie 400 punktów", () => {
    expect(smoothStroke([[0, 0], [0.5, 0.5]], 1, 2)).toBeNull();
    const raw: P2[] = Array.from({ length: 5000 }, (_, i) => [i * 0.5, 30 * Math.sin(i / 7)]);
    expect(smoothStroke(raw, 0.2, 0)!.pts.length).toBeLessThanOrEqual(400);
  });

  it("RDP i Chaikin", () => {
    expect(simplify([[0, 0], [5, 0.1], [10, 0]], 0.5)).toEqual([[0, 0], [10, 0]]);
    expect(chaikin([[0, 0], [10, 0], [10, 10]], false, 1)).toEqual([[0, 0], [2.5, 0], [7.5, 0], [10, 2.5], [10, 7.5], [10, 10]]);
  });
});
