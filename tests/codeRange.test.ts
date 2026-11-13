import { describe, expect, it } from "vitest";
import { codeParts, groupId } from "@/lib/codeRange";

/* Zapis kodów na liście /kody (paczka Z c). */
describe("codeParts", () => {
  it("trzy i więcej kolejnych kodów → zakres", () => {
    expect(codeParts("G40 G41 G42")).toEqual(["G40–G42"]);
    expect(codeParts("G54 G55 G56 G57 G58 G59")).toEqual(["G54–G59"]);
    expect(codeParts("M03 M04 M05")).toEqual(["M03–M05"]);
    expect(codeParts("G76 G87 G88 G89")).toEqual(["G76", "G87–G89"]);
  });
  it("dwa kody, przerwy i nie-kody bez zmian", () => {
    expect(codeParts("G02 G03")).toEqual(["G02", "G03"]);
    expect(codeParts("G09 G61 G64")).toEqual(["G09", "G61", "G64"]);
    expect(codeParts("G43 G44 G49")).toEqual(["G43", "G44", "G49"]);
    expect(codeParts("G68.2 G53.1")).toEqual(["G68.2", "G53.1"]);
    expect(codeParts("A B C")).toEqual(["A", "B", "C"]);
    expect(codeParts("CYCLE800")).toEqual(["CYCLE800"]);
  });
});

describe("groupId", () => {
  it("polskie znaki i spacje", () => {
    expect(groupId("Funkcje M")).toBe("grupa-funkcje-m");
    expect(groupId("Wieloosiowe")).toBe("grupa-wieloosiowe");
  });
});
