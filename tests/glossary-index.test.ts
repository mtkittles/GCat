import { describe, expect, it } from "vitest";
import { DIGITS, groupOf, hasla } from "../src/lib/glossaryIndex";
import { glossary } from "../src/lib/content";

describe("indeks słownika", () => {
  it("grupuje po pierwszej literze, cyfry razem", () => {
    expect(groupOf("ae — szerokość skrawania")).toBe("A");
    expect(groupOf("  Naddatek")).toBe("N");
    expect(groupOf("3+2 (obróbka pozycjonowana)")).toBe(DIGITS);
    expect(groupOf("4. oś")).toBe(DIGITS);
    expect(groupOf("śruba")).toBe("Ś");
  });
  it("odmienia liczbę haseł", () => {
    expect([1, 2, 4, 5, 12, 14, 21, 22, 25, 78, 112].map(hasla)).toEqual(
      ["1 hasło", "2 hasła", "4 hasła", "5 haseł", "12 haseł", "14 haseł", "21 haseł", "22 hasła", "25 haseł", "78 haseł", "112 haseł"]);
  });
  it("każde hasło trafia do jednej grupy, a kotwice nie kolidują z adresem litery", () => {
    for (const e of glossary) {
      expect(groupOf(e.term)).toMatch(/^(\p{Lu}|0–9)$/u);
      expect(e.anchor.startsWith("litera-")).toBe(false);
    }
  });
});
