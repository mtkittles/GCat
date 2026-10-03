import { describe, expect, it } from "vitest";
import { checkExercise } from "@/lib/checker";
import { runTaskChecks } from "@/lib/taskCheck";

const REF = "G21 G90 G17 G54\nS2000 M03\nG00 X0 Y0 Z5\nG01 Z-3 F100\nG01 X80 F400\nG01 Y50\nG01 X0\nG01 Y0\nG00 Z5\nM30";

describe("checkExercise", () => {
  it("wzorzec przechodzi sam ze sobą", () => {
    expect(checkExercise(REF, { mode: "mill", reference: REF }).passed).toBe(true);
  });
  it("ten sam tor inną drogą (G91) też przechodzi", () => {
    const alt = "G21 G90 G17 G54\nS2000 M03\nG00 X0 Y0 Z5\nG01 Z-3 F100\nG91\nG01 X80 F400\nG01 Y50\nG01 X-80\nG01 Y-50\nG90\nG00 Z5\nM30";
    expect(checkExercise(alt, { mode: "mill", reference: REF }).passed).toBe(true);
  });
  it("inny wymiar nie przechodzi, wynik poniżej 100", () => {
    const bad = REF.replace("X80", "X70");
    const r = checkExercise(bad, { mode: "mill", reference: REF });
    expect(r.passed).toBe(false);
    expect(r.score).toBeLessThan(100);
  });
  it("wymagane i zabronione kody", () => {
    expect(checkExercise(REF, { mode: "mill", reference: REF, requireCodes: ["G02"] }).passed).toBe(false);
    expect(checkExercise(REF, { mode: "mill", reference: REF, forbidCodes: ["G01"] }).passed).toBe(false);
  });
});

describe("runTaskChecks", () => {
  it("sprawdza punkt końcowy, najazd i użyte kody", () => {
    const src = "S1000 M03\nG00 X0 Y0 Z50\nG00 X10 Y10 Z5\nG00 Z2\nG01 Z-3 F100\nG00 Z5\nM30";
    const r = runTaskChecks(src, [
      { t: "end", x: 10, y: 10, z: 5, label: "koniec" },
      { t: "approach", x: 10, y: 10, z: 2, label: "najazd" },
      { t: "require", codes: ["G01"] },
      { t: "forbid", codes: ["G02"] },
    ], "mill");
    expect(r.passed).toBe(true);
  });
  it("tokarka: punkt końcowy w średnicy", () => {
    const r = runTaskChecks("G18 G99\nG97 S1000 M03\nG00 X80 Z50\nG00 X40 Z2\nM30", [{ t: "end", x: 40, z: 2, label: "koniec" }], "lathe");
    expect(r.passed).toBe(true);
  });
});
