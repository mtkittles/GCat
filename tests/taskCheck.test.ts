import { describe, expect, it } from "vitest";
import { runTaskChecks } from "@/lib/taskCheck";
import type { LessonDoc, Practice } from "@/lib/lesson";
import { f2_3 } from "@/content/nauka/f2-3";
import { f2_4 } from "@/content/nauka/f2-4";
import { f5_2 } from "@/content/nauka/f5-2";
import { f5_3 } from "@/content/nauka/f5-3";
import { f5_4 } from "@/content/nauka/f5-4";

/*
  Audyt Nauki 2026-10-09 (issue #29, A01): cztery kontrprzykłady, które poprzednio były
  zaliczane, bo sprawdzano obecność słowa w tekście, a nie stan w chwili ruchu.
*/

type Task = Extract<Practice, { kind: "task" }>;
const task = (doc: LessonDoc): Task => {
  const t = doc.practice.find((p): p is Task => p.kind === "task");
  if (!t) throw new Error(`${doc.id}: brak zadania`);
  return t;
};
const run = (doc: LessonDoc, src: string) => {
  const t = task(doc);
  return runTaskChecks(src, t.checks, t.mode ?? "mill");
};
const sub = (src: string, a: string, b: string) => {
  expect(src).toContain(a);
  return src.replace(a, b);
};

describe("zadania Nauki — rozwiązania wzorcowe przechodzą", () => {
  for (const doc of [f2_3, f2_4, f5_3, f5_4]) {
    it(doc.id, () => {
      const r = run(doc, task(doc).solution);
      expect(r.checks.filter((c) => !c.ok)).toEqual([]);
      expect(r.passed).toBe(true);
    });
  }
});

describe("zadania Nauki — inne poprawne zapisy też przechodzą", () => {
  it("F2.3: F400 w osobnej linii przed konturem", () => {
    const s = sub(task(f2_3).solution, "G01 X-5. F400", "F400\nG01 X-5.");
    expect(run(f2_3, s).passed).toBe(true);
  });
  it("F2.4: M08 w bloku najazdu", () => {
    const s = sub(task(f2_4).solution, "M08\nG00 X-20. Y10.", "G00 X-20. Y10. M08");
    const r = run(f2_4, s);
    expect(r.checks.filter((c) => !c.ok)).toEqual([]);
  });
  it("F5.3: G95 z F1. (posuw na obrót = skok)", () => {
    const s = sub(task(f5_3).solution, "G84 X10. Y10. Z-15. R5. F500", "G95\nG84 X10. Y10. Z-15. R5. F1.");
    expect(run(f5_3, s).passed).toBe(true);
  });
  it("F5.4: kody G w innej kolejności w bloku (G81 G99 …, X45. G98)", () => {
    let s = sub(task(f5_4).solution, "G99 G81 X15.", "G81 G99 X15.");
    s = sub(s, "G98 X45.", "X45. G98");
    expect(run(f5_4, s).passed).toBe(true);
  });
});

describe("zadania Nauki — kontrprzykłady z audytu są odrzucane", () => {
  it("F2.3: F400 na zejściu w Z i F150 na konturze", () => {
    let s = sub(task(f2_3).solution, "G01 Z-5. F150", "G01 Z-5. F400");
    s = sub(s, "G01 X-5. F400", "G01 X-5. F150");
    const r = run(f2_3, s);
    expect(r.passed).toBe(false);
    expect(r.checks.find((c) => c.label.startsWith("Zejście"))?.ok).toBe(false);
    expect(r.checks.find((c) => c.label.startsWith("Kontur"))?.ok).toBe(false);
  });
  it("F2.4: M09 przed obróbką, M08 po obróbce", () => {
    let s = sub(task(f2_4).solution, "M08\nG00 X-20.", "M09\nG00 X-20.");
    s = sub(s, "G00 Z50.\nM09", "G00 Z50.\nM08");
    expect(run(f2_4, s).passed).toBe(false);
  });
  it("F2.4: M09 dopiero po M05", () => {
    const s = sub(task(f2_4).solution, "M09\nM05", "M05\nM09");
    expect(run(f2_4, s).passed).toBe(false);
  });
  it("F5.3: G84 z F100 przy S500 i skoku 1, F500 dopisane po G80", () => {
    let s = sub(task(f5_3).solution, "G84 X10. Y10. Z-15. R5. F500", "G84 X10. Y10. Z-15. R5. F100");
    s = sub(s, "G80", "G80\nF500");
    const r = run(f5_3, s);
    expect(r.passed).toBe(false);
    expect(r.checks.find((c) => c.label.startsWith("Posuw w cyklu G84"))?.ok).toBe(false);
  });
  it("F5.4: po drugim otworze nadal G99 (przejazd na R2), G98 dopisane po G80", () => {
    let s = sub(task(f5_4).solution, "G98 X45.", "X45.");
    s = sub(s, "G80", "G80\nG98");
    const r = run(f5_4, s);
    expect(r.passed).toBe(false);
    expect(r.checks.find((c) => c.label.startsWith("Przejazd nad dociskiem"))?.ok).toBe(false);
  });
});

describe("F5.2/F5.3 — bilans głębokości otworu gwintowanego (audyt #29, A02/A06)", () => {
  it("G83 R2 Z−18 Q4: pięć zagłębień liczonych od R", async () => {
    const { parseProgram } = await import("@/lib/parser");
    const sol = task(f5_2).solution;
    const first = sol.split("\n").slice(0, sol.split("\n").findIndex((l) => l.startsWith("X70.")));
    const p = parseProgram(first.join("\n"), {});
    const bottoms = p.segments.filter((s) => s.kind === "linear" && s.to.z < s.from.z).map((s) => +s.to.z.toFixed(3));
    expect(bottoms).toEqual([-2, -6, -10, -14, -18]);
  });
  it("koniec gwintownika (Z w G84) leży powyżej końca pełnej średnicy otworu", () => {
    const zOf = (src: string, code: string) => Number(src.match(new RegExp(`${code}[^\\n]*Z(-?[\\d.]+)`))![1]);
    const zTip = zOf(task(f5_2).solution, "G83"), zTap = zOf(task(f5_3).solution, "G84");
    const full = zTip + 0.18 * 5; // wiertło Ø5, 140°
    expect(zTap).toBe(-15);       // 12 mm pełnego gwintu + 3 mm nakroju
    expect(zTap - full).toBeGreaterThanOrEqual(2);
  });
});

describe("F5.4 — trzeci otwór z G99 (audyt #29, A07)", () => {
  it("rozwiązanie: tylko jeden powrót na Z30, po otworze 2", async () => {
    const { parseProgram } = await import("@/lib/parser");
    const p = parseProgram(task(f5_4).solution, {});
    const ups = p.segments.filter((s) => s.kind === "rapid" && s.to.z > s.from.z && s.from.z < 0).map((s) => [s.to.x, +s.to.z.toFixed(3)]);
    expect(ups).toEqual([[15, 2], [45, 30], [75, 2]]);
  });
  it("droga w Z: G98 vs G99 dla 6 otworów, start i koniec na Z40 — 370 mm", async () => {
    const { parseProgram } = await import("@/lib/parser");
    const holes = (ret: string) => `G21 G90 G17 G54\nS1000 M03\nG00 X0. Y0. Z40.\n${ret} G81 X0. Y0. Z-5. R3. F100\nX10.\nX20.\nX30.\nX40.\nX50.\nG80\nG00 Z40.\nM30`;
    const zLen = (src: string) => parseProgram(src, {}).segments.reduce((a, s) => a + Math.abs(s.to.z - s.from.z), 0);
    expect(Math.round(zLen(holes("G98")) - zLen(holes("G99")))).toBe(370);
  });
});
