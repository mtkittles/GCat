import { describe, expect, it } from "vitest";
import { runTaskChecks } from "@/lib/taskCheck";
import type { LessonDoc, Practice } from "@/lib/lesson";
import { f2_3 } from "@/content/nauka/f2-3";
import { f2_4 } from "@/content/nauka/f2-4";
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
    const s = sub(task(f5_3).solution, "G84 X10. Y10. Z-12. R5. F500", "G95\nG84 X10. Y10. Z-12. R5. F1.");
    expect(run(f5_3, s).passed).toBe(true);
  });
  it("F5.4: jawne G99 X75. po przejeździe nad dociskiem", () => {
    const s = sub(task(f5_4).solution, "G98 X45.\nX75.", "G98 X45.\nG99 X75.");
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
    let s = sub(task(f5_3).solution, "G84 X10. Y10. Z-12. R5. F500", "G84 X10. Y10. Z-12. R5. F100");
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
