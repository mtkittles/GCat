import { describe, expect, it } from "vitest";
import { optionOrder } from "@/lib/quizOrder";
import { flat } from "@/lib/course";
import type { Question } from "@/lib/lesson";

/* Audyt toczenia §3.4 (decyzja 1): kolejność odpowiedzi losowana z ziarnem z pytania — stała, a poprawna nie stoi zawsze na A. */

type Choice = Extract<Question, { kind: "choice" }>;
const choices = (track: "frezowanie" | "toczenie"): Choice[] =>
  flat(track).flatMap((l) => {
    const d = l.doc;
    if (!d) return [];
    const fromPractice = d.practice.flatMap((p) => ("questions" in p && Array.isArray(p.questions) ? (p.questions as Question[]) : []));
    return [...d.quiz, ...fromPractice].filter((q): q is Choice => q.kind === "choice");
  });

describe("kolejność odpowiedzi w teście", () => {
  it("permutacja, ta sama przy każdym wywołaniu", () => {
    const o = optionOrder("Pytanie?", ["a", "b", "c", "d"]);
    expect([...o].sort()).toEqual([0, 1, 2, 3]);
    expect(optionOrder("Pytanie?", ["a", "b", "c", "d"])).toEqual(o);
  });
  for (const track of ["frezowanie", "toczenie"] as const) {
    it(`${track}: poprawna odpowiedź na pozycji A w mniej niż 40% pytań`, () => {
      const qs = choices(track);
      expect(qs.length).toBeGreaterThan(100);
      const atA = qs.filter((q) => optionOrder(q.q, q.options)[0] === q.answer).length;
      expect(atA / qs.length).toBeLessThan(0.4);
    });
  }
});
