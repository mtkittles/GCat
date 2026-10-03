import { describe, expect, it } from "vitest";
import { parseProgram } from "@/lib/parser";
import { pathToSvg } from "@/components/simulator/exportPath";

describe("eksport SVG", () => {
  it("rysuje odcinki i łuki w milimetrach z osią Y w górę", () => {
    const p = parseProgram("G90 G00 X0 Y0\nG01 X40 F100\nG03 X50 Y10 R10");
    const svg = pathToSvg(p.segments, "mill", "test");
    expect(svg).toContain('<path d="M0.000 0.000 L40.000 0.000"');
    expect(svg).toMatch(/stroke="#38BDF8"/);
    expect(svg).toMatch(/width="\d+\.\dmm"/);
  });
  it("pusty program daje poprawny plik", () => {
    expect(pathToSvg([], "lathe")).toContain("<svg");
  });
});
