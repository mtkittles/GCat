import { describe, expect, it } from "vitest";
import { runTaskChecks } from "@/lib/taskCheck";
import { flat } from "@/lib/course";
import type { LessonDoc, Practice } from "@/lib/lesson";

/*
  Audyt Nauki toczenia (docs/audyt-toczenie-2026-11-13.md, §3.3 i zał. A.2): 11 z 15 kontrprzykładów było zaliczanych,
  bo kontrola sprawdzała obecność słowa, a nie stan maszyny w chwili ruchu ani kolejność bloków.
  R7–R16 — te same programy co w scripts/audyt-toczenie/checks.ts (rozwiązanie wzorcowe z jedną zmianą).
*/

type Task = Extract<Practice, { kind: "task" }>;
const L: Record<string, LessonDoc> = Object.fromEntries(flat("toczenie").filter((l) => l.doc).map((l) => [l.id, l.doc!]));
const task = (id: string): Task => {
  const t = L[id]?.practice.find((p): p is Task => p.kind === "task");
  if (!t) throw new Error(`${id}: brak zadania`);
  return t;
};
const run = (id: string, src: string) => runTaskChecks(src, task(id).checks, "lathe");
const sol = (id: string) => task(id).solution;
/** Etykiety niezaliczonych kontroli — kontrprzykład ma odpaść właśnie na tej kontroli. */
const failed = (id: string, src: string) => run(id, src).checks.filter((c) => !c.ok).map((c) => c.label);
const swap = (src: string, a: string | RegExp, b: string) => {
  const out = src.replace(a, b);
  if (out === src) throw new Error(`zamiana nie zadziałała: ${String(a)}`);
  return out;
};

describe("zaliczanie zadań toczenia — rozwiązania wzorcowe", () => {
  for (const id of Object.keys(L)) {
    const t = L[id].practice.find((p): p is Task => p.kind === "task");
    if (t) it(`${id}: rozwiązanie wzorcowe zaliczone`, () => expect(run(id, t.solution).passed).toBe(true));
  }
});

describe("zaliczanie zadań toczenia — kontrprzykłady z audytu (R7–R16)", () => {
  it("R7 T1.3: blok startowy i G54 dopisane po obróbce", () => {
    const src = swap(swap(sol("T1.3"), "G18 G21 G40 G80 G99\nG54\n", ""), "G28 U0.\n", "G18 G21 G40 G80 G99\nG54\nG28 U0.\n");
    expect(failed("T1.3", src)).toContain("G18 przed pierwszym ruchem");
  });
  it("R8 T1.3: odjazd najpierw w Z", () => {
    expect(failed("T1.3", swap(sol("T1.3"), "G28 U0.\nG28 W0.", "G28 W0.\nG28 U0."))).toContain("Odjazd najpierw w X (G28 U), potem w Z (G28 W)");
  });
  it("R9 T2.1: T0202 bez odjazdu", () => {
    expect(failed("T2.1", swap(sol("T2.1"), "G28 U0.\nG28 W0.\nT0202", "T0202"))).toContain("Przed zmianą noża odjazd G28 U, potem G28 W");
  });
  it("R10 T2.1: G97 S250 zamiast G96 S250", () => {
    expect(failed("T2.1", swap(sol("T2.1"), "G96 S250 M03", "G97 S250 M03"))).toContain("Nóż T0202 skrawa przy G96");
  });
  it("R11 T2.2 i T9.1: G50 po G96", () => {
    expect(failed("T2.2", swap(sol("T2.2"), "G50 S3000\nG96 S200 M03", "G96 S200 M03\nG50 S3000"))).toContain("Limit G50 przed G96");
    expect(failed("T9.1", swap(sol("T9.1"), "G50 S3000\nG96 S200 M03", "G96 S200 M03\nG50 S3000"))).toContain("Limit G50 przed G96");
  });
  it("R12 T4.1: G42 dopiero po konturze", () => {
    const src = swap(swap(sol("T4.1"), "G42 G00 X14. Z2.", "G00 X14. Z2."), "G40 G00 Z2.", "G42 G00 Z2.\nG40 G00 X44.");
    expect(failed("T4.1", src)).toContain("Korekcja G42 aktywna na ruchach konturu");
  });
  it("R13 T5.1: G70 nożem zgrubnym, przed zmianą na T0202", () => {
    const src = swap(sol("T5.1"), /G28 U0\.\nG28 W0\.\nT0202[^\n]*\nG96 S250 M03\nG42 G00 X42\. Z2\.\nG70 P10 Q20/, "G42 G00 X42. Z2.\nG70 P10 Q20\nG28 U0.\nG28 W0.\nT0202 (NOZ WYKANCZAJACY VBMT R0.4)\nG96 S250 M03");
    expect(failed("T5.1", src)).toContain("Wykańczanie G70 nożem T0202");
  });
  it("R14 T6.2: wiercenie przy G96", () => {
    expect(failed("T6.2", swap(sol("T6.2"), "G97 S1200 M03", "G50 S3000\nG96 S200 M03"))).toContain("Wiercenie G74 przy stałych obrotach (G97)");
  });
  it("R15 T7.1: gwint przy G96", () => {
    expect(failed("T7.1", swap(sol("T7.1"), "G97 S1200 M03", "G50 S3000\nG96 S120 M03"))).toContain("Gwint G76 przy stałych obrotach (G97)");
  });
  it("R16 T9.1: G42 dopisane dopiero po G70", () => {
    const src = swap(swap(sol("T9.1"), "G42 G00 X52. Z2.", "G00 X52. Z2."), "G40 G00 X54. Z5.", "G42 G00 X54. Z5.\nG40 G00 X56.");
    expect(failed("T9.1", src)).toContain("Korekcja G42 aktywna w wykańczaniu G70");
  });
  it("kontrole już wcześniej odrzucające (T2.2 bez G96, T3.1, T4.1 G41, T7.2) dalej odrzucają", () => {
    expect(run("T2.2", swap(sol("T2.2"), "G96 S200 M03", "G97 S200 M03\n(G96)")).passed).toBe(false);
    expect(run("T3.1", swap(sol("T3.1"), "X42.\nG00 Z2.", "G00 X42.\nZ2.")).passed).toBe(false);
    expect(run("T4.1", swap(sol("T4.1"), "G42 G00", "G41 G00")).passed).toBe(false);
  });
});
