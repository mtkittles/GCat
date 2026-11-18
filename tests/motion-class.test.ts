import { describe, expect, it } from "vitest";
import { motionClass } from "@/lib/motionClass";

describe("motionClass — kolor słowa ruchu w kodzie w tekście", () => {
  it("G00–G03 (też bez zera) dostają klasę koloru ruchu", () => {
    expect(motionClass("G00")).toBe(" is-g00");
    expect(motionClass("G0")).toBe(" is-g00");
    expect(motionClass("g01")).toBe(" is-g01");
    expect(motionClass("G1")).toBe(" is-g01");
    expect(motionClass("G02")).toBe(" is-g02");
    expect(motionClass("G03")).toBe(" is-g02");
  });
  it("inne kody i całe bloki zostają neutralne", () => {
    for (const c of ["G04", "G41", "G17", "M03", "X60", "G01 X40", "N30 G01 X40 F200", "G00.1", "G010"]) expect(motionClass(c)).toBe("");
  });
});
