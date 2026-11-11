import { describe, expect, it } from "vitest";
import { profil } from "../scripts/lib/profil-kursu";
import { programyKart } from "../scripts/lib/programy-kart";
import { readOnlyCaption, simGaps } from "@/lib/simGaps";

/* Paczka U: programy w kartach kodów według profilu kursu (F1.5, T1.3). */

const MILL = `G21 G90 G94 G17
G40 G49 G80
G54
T1 M06
G00 G43 H1 Z50.
S2000 M03
G00 X10. Y10.
G00 Z5.
G01 Z-2. F100
G01 X40. F300
G00 Z50.
M05
M30`;

const LATHE = `G18 G21 G40 G80 G99
G54
T0101
G50 S3000
G96 S200 M03
G00 X44. Z2.
G01 Z-20. F0.2
G00 X50.
M05
M30`;

const prog = (src: string, mode: "mill" | "lathe" = "mill") => profil({ src, mode, kind: "program" }).join("\n");

describe("profil kursu — programy w kartach", () => {
  it("program frezarski i tokarski wg profilu nie mają uwag", () => {
    expect(prog(MILL)).toBe("");
    expect(prog(LATHE, "lathe")).toBe("");
  });
  it("nagłówek bez G94 i w jednej linii", () => {
    expect(prog(MILL.replace("G21 G90 G94 G17\nG40 G49 G80\nG54", "G21 G90 G17 G54"))).toMatch(/blok startowy/);
  });
  it("S M03 przed G43", () => {
    expect(prog(MILL.replace("G00 G43 H1 Z50.\nS2000 M03", "S2000 M03\nG00 G43 H1 Z50."))).toMatch(/zamiast G00 G43/);
  });
  it("pierwszy dojazd łączy XY i Z", () => {
    expect(prog(MILL.replace("G00 X10. Y10.\nG00 Z5.", "G00 X10. Y10. Z5."))).toMatch(/łączy XY i Z/);
  });
  it("współrzędna bez kropki, komentarz „;”, minus typograficzny, za długa linia z komentarzem", () => {
    expect(prog(MILL.replace("G01 X40. F300", "G01 X40 F300"))).toMatch(/bez kropki/);
    expect(prog(MILL.replace("M05", "M05 ; stop"))).toMatch(/komentarz „;”/);
    expect(prog(MILL.replace("G01 Z-2.", "G01 Z−2."))).toMatch(/minus typograficzny/);
    expect(prog(MILL.replace("M05", "M05 (wrzeciono stop, bo za chwilę koniec programu)"))).toMatch(/limit 42/);
  });
  it("Q w cyklu frezarskim z kropką, P i Q cykli tokarskich bez kropki", () => {
    expect(profil({ src: "G99 G83 X10. Y10. Z-18. R2. Q4 F100", mode: "mill", kind: "fragment" }).join()).toMatch(/Q4/);
    expect(profil({ src: "G76 P010060 Q50 R0.05", mode: "lathe", kind: "fragment" })).toEqual([]);
  });
  it("tokarka: bez T, G96 bez G50, G95 zamiast G99", () => {
    expect(prog(LATHE.replace("T0101\n", ""), "lathe")).toMatch(/T0101/);
    expect(prog(LATHE.replace("G50 S3000\n", ""), "lathe")).toMatch(/G96 bez/);
    expect(prog(LATHE.replace("G99", "G95"), "lathe")).toMatch(/blok startowy/);
  });
  it("fragment zestawiający Fanuc i Sinumerik: „;” dozwolone w sekcji Sinumerika", () => {
    const src = "(Fanuc)\nG00 X23.2 Z5.\nG32 Z-25. F1.5\n\n; Sinumerik\nG0 X23.2 Z5\nG33 Z-25 K1.5";
    expect(profil({ src, mode: "lathe", kind: "fragment" })).toEqual([]);
  });
  it("wszystkie programy i bloki kodu w kartach spełniają profil", () => {
    const bad = programyKart().map((p) => [p.where, profil({ src: p.src, mode: p.mode, dialect: p.dialect, kind: p.full ? "program" : "fragment" })] as const).filter(([, r]) => r.length);
    expect(bad).toEqual([]);
  });
});

describe("podpis przykładu bez podglądu", () => {
  it("wymienia kody, których symulator nie odtwarza", () => {
    expect(simGaps("M19\nM30", "mill").missing).toEqual(["M19"]);
    expect(readOnlyCaption("G00 Z100.\nM19\nM30", "mill")).toMatch(/nie odtwarza: M19/);
  });
  it("program bez ruchu i program w pełni obsługiwany", () => {
    expect(readOnlyCaption("G23\nM30", "mill")).toMatch(/nie ma w nim ruchu/);
    expect(readOnlyCaption(MILL, "mill")).toBe("Program do przeczytania.");
  });
});
