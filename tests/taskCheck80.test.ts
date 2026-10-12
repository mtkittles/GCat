import { describe, expect, it } from "vitest";
import { runTaskChecks } from "@/lib/taskCheck";
import type { LessonDoc, Practice } from "@/lib/lesson";
import { f1_3 } from "@/content/nauka/f1-3";
import { f1_4 } from "@/content/nauka/f1-4";
import { f1_5 } from "@/content/nauka/f1-5";
import { f2_1 } from "@/content/nauka/f2-1";
import { f2_2 } from "@/content/nauka/f2-2";
import { f3_1 } from "@/content/nauka/f3-1";
import { f3_2 } from "@/content/nauka/f3-2";
import { f3_3 } from "@/content/nauka/f3-3";
import { f3_4 } from "@/content/nauka/f3-4";
import { f3_5 } from "@/content/nauka/f3-5";

/*
  Raport #80 (audyt Nauki frezowania, etapy 1–5), §4 i załącznik §9: kontrprzykłady R1–R6
  były zaliczane, bo sprawdzano obecność słowa albo dowolną poprawną parę bloków.
  Programy R1–R6 przepisane z raportu bez zmian.
*/

type Task = Extract<Practice, { kind: "task" }>;
const tasks = (doc: LessonDoc) => doc.practice.filter((p): p is Task => p.kind === "task");
const task = (doc: LessonDoc, i = 0): Task => {
  const t = tasks(doc)[i];
  if (!t) throw new Error(`${doc.id}: brak zadania ${i}`);
  return t;
};
const run = (doc: LessonDoc, src: string, i = 0) => {
  const t = task(doc, i);
  return runTaskChecks(src, t.checks, t.mode ?? "mill");
};
const failed = (doc: LessonDoc, src: string, i = 0) => run(doc, src, i).checks.filter((c) => !c.ok).map((c) => c.label);
const sub = (src: string, a: string, b: string) => {
  expect(src).toContain(a);
  return src.replace(a, b);
};

const R1 = `O1000
G21 G90 G94 G17
G40 G49 G80
G54
T1 M06
G43 H1 Z50.
S2500 M03
M08
G00 X-20. Y10.
G00 Z5.
G01 Z-5. F150
G01 X-5. F400
G01 Y55.
G00 Z50.
M09
T2
G00 G43 H2 Z50.
S1800 M03
G00 X12. Y10.
G00 Z2.
G01 Z-3. F100
G00 Z50.
M05
M30`;

const R2 = `O1000
G21 G90 G94 G17
G40 G49 G80
G54
T1 M06
S2500 M03
M08
G00 X40. Y25. Z50.
G00 X-20. Y10. Z5.
G00 Z50.
G00 X-19. Y10.
G00 X-20. Y10.
G00 Z5.
M09
M05
M30`;

const R3 = `O1002 (NAWIERCENIE)
G21 G90 G94 G17
G40 G49 G80
G54
T2 M06
S1500 M03
M08
G00 X20. Y25. Z50.
G00 Z5.
G04 X0.01
G01 Z-2. F80
G00 Z5.
M09
M05
M30`;

const R4 = `O1000
G21 G90 G94 G17
G40 G49 G80
G54
T1 M06
G43 H1 Z50.
S2500 M03
M08
G00 X0. Y0.
G00 Z5.
G01 Z-3. F150
G91
G90
G01 X20. F400
Y30.
X50.
Y0.
G90
G00 Z50.
M09
M05
M30`;

const R5 = `O1000
G21 G90 G94 G17
G40 G49 G80
G54
T2 M06
G43 H2 Z50.8
S1800 M03
G00 X38.1 Y19.05
G00 Z2.54
G01 Z-2.54 F6
G00 Z50.8
M05
M30`;

const R6 = `O1000
T1 M06
G43 H1 Z50.
S2500 M03
G00 X-20. Y10.
G00 Z5.
G01 Z-5. F150
G01 X-5. F400
G01 Y55.
G00 Z50.
G21 G90 G94 G17
G40 G49 G80
G54
M05
M30`;

describe("raport #80 — kontrprzykłady R1–R6 są odrzucane", () => {
  it("R1 F2.1: brak drugiej wymiany — nawiercanie wykonuje T1", () => {
    const f = failed(f2_1, R1);
    expect(f.some((l) => l.startsWith("Nawiercanie w X12 Y10"))).toBe(true);
  });
  it("R2 F3.1: błędny dojazd XYZ, poprawna para dopisana później", () => {
    const r = run(f3_1, R2);
    expect(r.passed).toBe(false);
    const a = r.checks.find((c) => c.label.startsWith("Najpierw XY wysoko"));
    expect(a?.ok).toBe(false);
    expect(a?.detail).toMatch(/łączy XY/);
  });
  it("R3 F3.5: postój 0,01 s na Z5 zamiast 0,5 s na Z−2", () => {
    const r = run(f3_5, R3);
    expect(r.passed).toBe(false);
    expect(r.checks.find((c) => c.label.startsWith("Postój"))?.ok).toBe(false);
  });
  it("R4 F1.3: G91 obecne, kontur wykonany w G90", () => {
    const r = run(f1_3, R4);
    expect(r.passed).toBe(false);
    expect(r.checks.find((c) => c.label.includes("G91"))?.detail).toMatch(/G90/);
  });
  it("R5 F1.4: współrzędne przeliczone, F6 nieprzeliczony", () => {
    const r = run(f1_4, R5);
    expect(r.passed).toBe(false);
    expect(r.checks.find((c) => c.label.startsWith("Posuw przeliczony"))?.ok).toBe(false);
  });
  it("R6 F1.5: blok startowy po obróbce", () => {
    const f = failed(f1_5, R6);
    expect(f).toContain("G21 przed pierwszym ruchem");
    expect(f).toContain("G54 przed pierwszym ruchem");
  });
});

describe("raport #80 — rozwiązania wzorcowe przechodzą", () => {
  for (const doc of [f1_3, f1_4, f1_5, f2_1, f2_2, f3_1, f3_2, f3_3, f3_5]) {
    it(doc.id, () => expect(failed(doc, task(doc).solution)).toEqual([]));
  }
  it("F3.4 (rowek pierścieniowy)", () => expect(failed(f3_4, task(f3_4).solution)).toEqual([]));
});

describe("raport #80 — dopuszczone równoważne zapisy przechodzą", () => {
  it("F1.4: posuw świadomie zaokrąglony do F150", () => {
    expect(failed(f1_4, sub(task(f1_4).solution, "F152.4", "F150"))).toEqual([]);
  });
  it("F1.3: G91 w bloku z pierwszym ruchem konturu", () => {
    expect(failed(f1_3, sub(task(f1_3).solution, "G91\nG01 X20. F400", "G91 G01 X20. F400"))).toEqual([]);
  });
  it("F1.5: blok startowy w jednej linii", () => {
    const s = sub(task(f1_5).solution, "G21 G90 G94 G17\nG40 G49 G80\nG54", "G21 G90 G94 G17 G40 G49 G80 G54");
    expect(failed(f1_5, s)).toEqual([]);
  });
  it("F2.1: M05 przed odjazdem w Z", () => {
    const s = sub(task(f2_1).solution, "G00 Z50.\nM09\nM05\nT2 M06", "M09\nM05\nG00 Z50.\nT2 M06");
    expect(failed(f2_1, s)).toEqual([]);
  });
  it("F3.2: obieg dzielony na krótsze bloki", () => {
    const s = sub(task(f3_2).solution, "G01 Y55.", "G01 Y30.\nG01 Y55.");
    expect(failed(f3_2, s)).toEqual([]);
  });
});

describe("raport #80 — inne błędy celu ćwiczenia", () => {
  it("F2.1: M06 przy obracającym się wrzecionie", () => {
    const s = sub(task(f2_1).solution, "M05\nT2 M06", "T2 M06");
    expect(failed(f2_1, s)).toContain("Wymiana narzędzia przy zatrzymanym wrzecionie (M05 przed M06)");
  });
  it("F2.2: S2500 M03 dopisane dopiero po obróbce", () => {
    let s = sub(task(f2_2).solution, "S2500 M03\n", "");
    s = sub(s, "M09\nM05", "M09\nS2500 M03\nM05");
    expect(failed(f2_2, s).some((l) => l.startsWith("Każdy ruch roboczy przy S2500"))).toBe(true);
  });
  it("F3.2: obieg przeciwnie do ruchu wskazówek zegara", () => {
    const ccw = "G01 Z-5. F150\nG01 X-5. Y10. F400\nG01 Y-5.\nG01 X85.\nG01 Y55.\nG01 X-5.\nG01 Y10.";
    const src = task(f3_2).starter.replace("(DOPISZ: ZEJSCIE NA Z-5, DOJAZD DO X-5 I OBIEG KONTURU)\n", ccw);
    expect(failed(f3_2, src).some((l) => l.startsWith("Obieg zgodnie"))).toBe(true);
  });
  it("F3.3: naroża przez I/J zamiast R", () => {
    const s = sub(task(f3_3).solution, "G02 X10. Y55. R15.", "G02 X10. Y55. I15. J0.");
    expect(failed(f3_3, s)).toContain("Każdy łuk zapisany przez R");
  });
  it("F3.4: okrąg z dwóch półokręgów R", () => {
    const s = sub(task(f3_4).solution, "G02 I-10. J0. F300", "G02 X30. Y25. R10. F300\nG02 X50. Y25. R10.");
    expect(failed(f3_4, s)).toContain("Okrąg zapisany przez I/J (bez R)");
  });
});
