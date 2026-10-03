import { describe, expect, it } from "vitest";
import { mergeDone, mergeLesson, mergePrograms, mergeProgress } from "@/lib/merge";

describe("scalanie postępu z kontem", () => {
  it("lepszy wynik testu wygrywa, przeczytanie się sumuje, ostatnia wizyta to nowsza", () => {
    const m = mergeLesson({ visited: 100, quiz: { score: 5, total: 7, at: 1 } }, { visited: 200, read: true, quiz: { score: 6, total: 7, at: 2 } });
    expect(m).toEqual({ visited: 200, read: true, quiz: { score: 6, total: 7, at: 2 } });
  });
  it("przy równym wyniku zostaje nowszy; brak danych po jednej stronie nie kasuje drugiej", () => {
    expect(mergeLesson({ quiz: { score: 6, total: 7, at: 5 } }, { quiz: { score: 6, total: 7, at: 9 } }).quiz?.at).toBe(9);
    expect(mergeLesson({}, { read: true }).read).toBe(true);
    expect(mergeLesson({ done: true }, {}).done).toBe(true);
  });
  it("klucze z obu stron trafiają do wyniku", () => {
    const m = mergeProgress({ "frezowanie/F1.1": { read: true } }, { "toczenie/T1.1": { visited: 5 } });
    expect(Object.keys(m).sort()).toEqual(["frezowanie/F1.1", "toczenie/T1.1"]);
  });
  it("zadania: suma bez duplikatów; programy: nowsza wersja zakładki wygrywa", () => {
    expect(mergeDone(["a", "b"], ["b", "c"])).toEqual(["a", "b", "c"]);
    const p = mergePrograms([{ id: "x", name: "A", src: "G00", mode: "mill", updated: 1 }], [{ id: "x", name: "B", src: "G01", mode: "mill", updated: 2 }, { id: "y", name: "C", src: "", mode: "lathe", updated: 1 }]);
    expect(p.map((q) => q.id + ":" + q.name)).toEqual(["y:C", "x:B"]);
  });
});
