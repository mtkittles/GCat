import { describe, expect, it } from "vitest";
import { activityByDay, level, mapGrid, streak, summary } from "@/lib/activity";
import { dayKey, LOG_DONE, LOG_OPEN, LOG_TEST, logDay, type ProgressStore } from "@/lib/progress";
import { mergeLesson } from "@/lib/merge";

const at = (d: number, h = 12) => new Date(2026, 10, d, h).getTime(); // listopad 2026, czas lokalny

describe("dziennik dni w postępie", () => {
  it("dzień lokalny i suma bitów w jednym dniu", () => {
    expect(dayKey(at(18))).toBe("2026-11-18");
    let log = logDay(undefined, at(18, 9), LOG_OPEN);
    log = logDay(log, at(18, 21), LOG_TEST | LOG_DONE);
    expect(log).toEqual({ "2026-11-18": LOG_OPEN | LOG_TEST | LOG_DONE });
  });
  it("dziennik przycięty do 400 ostatnich dni", () => {
    let log: Record<string, number> = {};
    for (let i = 0; i < 410; i++) log = logDay(log, new Date(2025, 0, 1 + i, 12).getTime(), LOG_OPEN);
    const keys = Object.keys(log).sort();
    expect(keys).toHaveLength(400);
    expect(keys[0]).toBe(dayKey(new Date(2025, 0, 11, 12).getTime()));
  });
  it("scalanie z kontem: dzienniki się sumują, brak dziennika po stronie konta niczego nie kasuje", () => {
    expect(mergeLesson({ log: { "2026-11-17": 1, "2026-11-18": 2 } }, { log: { "2026-11-18": 4 } }).log).toEqual({ "2026-11-17": 1, "2026-11-18": 6 });
    expect(mergeLesson({ log: { "2026-11-18": 1 } }, { visited: 5 }).log).toEqual({ "2026-11-18": 1 });
    expect(mergeLesson({ visited: 5 }, {}).log).toBeUndefined();
  });
});

describe("mapa nauki", () => {
  const store: ProgressStore = {
    "frezowanie/F3.1": { visited: at(18), log: { "2026-11-16": LOG_OPEN, "2026-11-18": LOG_OPEN } },
    "frezowanie/F3.2": { log: { "2026-11-18": LOG_OPEN | LOG_TEST | LOG_DONE }, quiz: { score: 9, total: 10, at: at(18) } },
    // zapis sprzed dziennika: tylko daty otwarcia i testu
    "toczenie/T1.1": { visited: at(17), quiz: { score: 5, total: 10, at: at(10) } },
  };
  const by = activityByDay(store);

  it("dni z danych: dziennik i daty sprzed dziennika; bez zmyślonych dni", () => {
    expect([...by.keys()].sort()).toEqual(["2026-11-10", "2026-11-16", "2026-11-17", "2026-11-18"]);
    expect(by.get("2026-11-18")).toEqual({ lessons: ["frezowanie/F3.1", "frezowanie/F3.2"], tests: 1, done: 1 });
    expect(by.get("2026-11-10")).toEqual({ lessons: ["toczenie/T1.1"], tests: 1, done: 0 });
  });
  it("pusty zapis — pusta mapa", () => {
    expect(activityByDay({}).size).toBe(0);
  });
  it("poziomy: 0, 1, 2, 3–4, 5+", () => {
    expect([0, 1, 2, 3, 4, 5, 9].map(level)).toEqual([0, 1, 2, 3, 3, 4, 4]);
  });
  it("siatka: kolumna od poniedziałku, ostatnia kolumna zawiera dziś, dni po dziś oznaczone", () => {
    const today = new Date(2026, 10, 18, 15); // środa
    const cols = mapGrid(by, today, 4);
    expect(cols).toHaveLength(4);
    for (const c of cols) { expect(c).toHaveLength(7); expect(c[0].date.getDay()).toBe(1); }
    const last = cols[3];
    expect(last[2].day).toBe("2026-11-18");
    expect(last[2].future).toBe(false);
    expect(last.slice(3).every((c) => c.future)).toBe(true);
    expect(cols[0][0].day).toBe("2026-10-26");
    expect(last[2].a?.lessons).toHaveLength(2);
  });
  it("seria: od dziś albo od wczoraj wstecz", () => {
    expect(streak(by, new Date(2026, 10, 18))).toBe(3); // 16, 17, 18
    expect(streak(by, new Date(2026, 10, 19))).toBe(3); // dziś jeszcze nic — liczy od wczoraj
    expect(streak(by, new Date(2026, 10, 21))).toBe(0);
  });
  it("podsumowanie okresu", () => {
    const cols = mapGrid(by, new Date(2026, 10, 18), 4);
    expect(summary(cols, store)).toEqual({ days: 4, lessons: 3, finished: 1 });
    expect(summary(mapGrid(by, new Date(2026, 10, 18), 1), store)).toEqual({ days: 3, lessons: 3, finished: 1 });
  });
});
