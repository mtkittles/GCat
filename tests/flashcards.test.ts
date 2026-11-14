import { describe, expect, it } from "vitest";
import { FLASHCARDS, FREE_LIMIT, freeCards } from "@/lib/flashcards";
import { glossary } from "@/lib/content";
import { gcodes } from "@/lib/gcodes";
import { buildSession, requeue, shuffle } from "@/lib/leitner";

// deterministyczny generator do testów
const seeded = (seed: number) => () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
const DAY = 86_400_000;

describe("talia fiszek", () => {
  it("identyfikatory są unikalne, a stare (t:hasło, g:slug) zostały — postęp użytkowników się nie zeruje", () => {
    const ids = FLASHCARDS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const g of glossary) expect(ids).toContain(`t:${g.term}`);
    for (const g of gcodes) expect(ids).toContain(`g:${g.slug}`);
  });
  it("każda karta ma pytanie, przód i odpowiedź; kod jest pytany w obie strony", () => {
    for (const c of FLASHCARDS) {
      expect(c.ask && c.front).toBeTruthy();
      expect(c.back || c.lines?.length).toBeTruthy();
    }
    expect(FLASHCARDS.filter((c) => c.deck === "kody").length).toBe(gcodes.length * 2);
    expect(FLASHCARDS.filter((c) => c.deck === "wzory").length).toBe(glossary.filter((g) => g.formulas?.length).length);
    // odpowiedzi na „Jaki to kod?” nie widać na przodzie
    for (const c of FLASHCARDS.filter((x) => x.id.startsWith("k:"))) expect(c.front).not.toContain(c.title!);
  });
  it("Free: 15 pierwszych haseł słownika", () => {
    expect(freeCards().length).toBe(FREE_LIMIT);
    expect(freeCards().every((c) => c.deck === "slownik")).toBe(true);
  });
});

describe("tura powtórki", () => {
  const ids = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const t = 10 * DAY;
  const deck = { a: { box: 2, due: t - DAY }, b: { box: 1, due: t - 2 * DAY }, c: { box: 3, due: t + DAY } };
  it("zaległe przed nowymi, niezaległe pominięte, limit długości", () => {
    const q = buildSession(deck, ids, { now: t, size: 4, rnd: seeded(1) });
    expect(q.length).toBe(4);
    expect([...q.slice(0, 2)].sort()).toEqual(["a", "b"]);
    expect(q).not.toContain("c");
    expect(buildSession(deck, ids, { now: t, rnd: seeded(1) }).length).toBe(7);
  });
  it("kolejność zależy od losowania, skład nie", () => {
    const q1 = buildSession({}, ids, { now: t, rnd: seeded(1) }), q2 = buildSession({}, ids, { now: t, rnd: seeded(7) });
    expect(q1).not.toEqual(q2);
    expect([...q1].sort()).toEqual([...q2].sort());
    expect([...shuffle(ids, seeded(3))].sort()).toEqual(ids);
  });
  it("„nie wiem” odkłada kartę 3–5 pozycji dalej, w krótkiej kolejce na koniec", () => {
    for (const s of [1, 2, 3, 4, 5]) {
      const q = requeue(ids, seeded(s)), at = q.indexOf("a");
      expect(at).toBeGreaterThanOrEqual(3); expect(at).toBeLessThanOrEqual(5);
      expect(q.length).toBe(ids.length);
    }
    expect(requeue(["a", "b"], seeded(1))).toEqual(["b", "a"]);
    expect(requeue(["a"], seeded(1))).toEqual(["a"]);
  });
});
