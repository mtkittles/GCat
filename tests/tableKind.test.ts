import { describe, expect, it } from "vitest";
import { PAIR_MAX, tableClass } from "@/lib/tableKind";

/* Układ tabeli na telefonie (paczka Z a, audyt kart cz. 2 §4.3). */
describe("tableClass", () => {
  it("2 kolumny — zwykła tabela, bez kart", () => {
    expect(tableClass(2, [["X", "współrzędna końca w osi X, w bieżących jednostkach i trybie G90/G91"]])).toBe("tbl-2");
  });
  it("3 kolumny z krótkimi wartościami — para pod etykietą wiersza", () => {
    expect(tableClass(3, [["Układ lokalny", "`G52`", "`TRANS`, `ATRANS`"], ["Skalowanie", "G50/G51", "SCALE"]])).toBe("tbl-pair");
  });
  it("3 kolumny z długim tekstem i ≥ 4 kolumny — wiersz jako karta", () => {
    const long = "x".repeat(PAIR_MAX + 5);
    expect(tableClass(3, [["G85", long, long]])).toBe("tbl-stack");
    expect(tableClass(4, [["a", "b", "c", "d"]])).toBe("tbl-stack");
  });
  it("znaczniki [[…]], ** i ` nie liczą się do długości", () => {
    expect(tableClass(3, [["a", `[[korekcja promienia|${"k".repeat(30)}]]`, "**b**"]])).toBe("tbl-pair");
  });
});
