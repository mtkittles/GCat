import { describe, expect, it } from "vitest";
import { longDate, shortDate } from "../src/lib/shortDate";

describe("shortDate — data w kafelku Konta", () => {
  const now = new Date(2026, 10, 18, 9, 30).getTime(); // 18 listopada 2026, 9:30 czasu lokalnego
  it("ten sam dzień — „dziś”, także tuż po północy", () => {
    expect(shortDate(new Date(2026, 10, 18, 0, 5).getTime(), now)).toBe("dziś");
  });
  it("poprzedni dzień kalendarzowy — „wczoraj”", () => {
    expect(shortDate(new Date(2026, 10, 17, 23, 59).getTime(), now)).toBe("wczoraj");
  });
  it("starsze — dd.mm.rrrr", () => {
    expect(shortDate(new Date(2026, 10, 3, 12).getTime(), now)).toBe("03.11.2026");
    expect(shortDate(new Date(2025, 11, 31, 12).getTime(), now)).toBe("31.12.2025");
  });
  it("pełna data do dymku", () => {
    expect(longDate(new Date(2026, 10, 18).getTime())).toBe("18 listopada 2026");
  });
});
