import { describe, expect, it } from "vitest";
import { matchRanges, norm, queryTerms } from "../src/lib/searchNorm";

const marked = (text: string, q: string) =>
  matchRanges(text, q).map(([a, b]) => text.slice(a, b));

describe("matchRanges — podświetlanie jak w search()", () => {
  it("dopasowuje zapis bez polskich znaków", () => {
    expect(marked("Łożyskowanie wrzeciona", "loz")).toEqual(["Łoż"]);
    expect(marked("Głębokość skrawania", "glebokosc")).toEqual(["Głębokość"]);
  });

  it("każde słowo zapytania osobno, także gdy nie stoją obok siebie", () => {
    expect(marked("Posuw na obrót i posuw na minutę", "posuw minut")).toEqual(["Posuw", "posuw", "minut"]);
  });

  it("bez rozróżniania wielkości liter i z kodami", () => {
    expect(marked("Cykl g81 i G81 w programie", "G81")).toEqual(["g81", "G81"]);
  });

  it("scala nakładające się trafienia", () => {
    expect(matchRanges("kompensacja", "komp kompensacja")).toEqual([[0, 11]]);
  });

  it("pomija słowa jednoznakowe i puste zapytanie", () => {
    expect(matchRanges("G01 X10", "x")).toEqual([]);
    expect(matchRanges("G01 X10", "   ")).toEqual([]);
    expect(matchRanges("", "g01")).toEqual([]);
  });

  it("znaki specjalne zapytania nie psują dopasowania", () => {
    expect(marked("Wzór (a+b) i [R]", "(a+b)")).toEqual(["(a+b)"]);
  });

  it("norm zachowuje długość tekstu (pozycje zgadzają się z oryginałem)", () => {
    const s = "Zażółć gęślą jaźń ŁÓDŹ";
    expect(norm(s)).toHaveLength(s.length);
    expect(norm(s)).toBe("zazolc gesla jazn lodz");
  });

  it("queryTerms dzieli jak search()", () => {
    expect(queryTerms("  Posuw   NA obrót ")).toEqual(["posuw", "na", "obrot"]);
  });
});
