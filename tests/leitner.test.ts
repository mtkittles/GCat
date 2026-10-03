import { describe, expect, it } from "vitest";
import { BOX_DAYS, deckStats, dueCards, review } from "@/lib/leitner";

const DAY = 86_400_000;
describe("powtórki Leitnera", () => {
  it("„wiem” przenosi dalej z większym odstępem, „nie wiem” cofa do pudełka 1", () => {
    const t = 1_000_000;
    let d = review({}, "a", true, t);
    expect(d.a).toEqual({ box: 1, due: t + BOX_DAYS[1] * DAY });
    d = review(d, "a", true, t); d = review(d, "a", true, t);
    expect(d.a.box).toBe(3);
    d = review(d, "a", false, t);
    expect(d.a.box).toBe(1);
  });
  it("do powtórki: zaległe najstarsze najpierw, potem nowe z limitem", () => {
    const t = 10 * DAY;
    const deck = { a: { box: 2, due: t - DAY }, b: { box: 1, due: t - 2 * DAY }, c: { box: 3, due: t + DAY } };
    expect(dueCards(deck, ["a", "b", "c", "d", "e", "f"], t, 2)).toEqual(["b", "a", "d", "e"]);
    expect(deckStats(deck, ["a", "b", "c", "d"], t)).toEqual({ boxes: [1, 1, 1, 1, 0, 0], due: 2, learned: 0, total: 4 });
  });
});
