import { describe, expect, it } from "vitest";
import { parseProgram } from "@/lib/parser";
import { validate } from "@/lib/parser/validate";

const msgs = (src: string, dialect: "fanuc" | "sinumerik" = "fanuc", stock?: Parameters<typeof validate>[2]) =>
  validate(parseProgram(src), dialect, stock).map((i) => `${i.level}:${i.msg}`);

const OK = "G21 G90 G17 G54\nT01 M06\nG43 H01 Z50.\nS2000 M03\nG00 X0 Y0 Z5\nG01 Z-2 F100\nG01 X20 F200\nG00 Z5\nM30";

describe("walidator", () => {
  it("kompletny program nie ma ostrzeżeń", () => {
    expect(msgs(OK)).toEqual([]);
  });
  it("ruch roboczy bez wrzeciona, brak G43 i brak M30", () => {
    const m = msgs("G21 G90 G17 G54\nT01 M06\nG00 X0 Y0 Z5\nG01 Z-2 F100");
    expect(m.join("\n")).toMatch(/wyłączonym wrzecionie/);
    expect(m.join("\n")).toMatch(/brak G43/);
    expect(m.join("\n")).toMatch(/Brak M30/);
  });
  it("dwie funkcje z jednej grupy w bloku to błąd", () => {
    expect(msgs("G00 G01 X10\nM30").join("\n")).toMatch(/error:Dwie funkcje/);
  });
  it("szybki przejazd w dół poniżej zera detalu", () => {
    expect(msgs("S1000 M03\nG00 Z5\nG00 X10 Z-3\nM30").join("\n")).toMatch(/G00 w dół/);
  });
  it("Sinumerik: G28 tylko w trybie ISO, jednostki G70/G71", () => {
    const m = msgs("G21 G90\nG28 Z0\nM30", "sinumerik").join("\n");
    expect(m).toMatch(/G28 działa tylko w trybie ISO/);
    expect(m).toMatch(/G70 \(cale\) \/ G71 \(mm\)/);
  });
  it("Fanuc: P w G04 z kropką to błąd", () => {
    expect(msgs("G04 P0.5\nM30").join("\n")).toMatch(/error:Fanuc: w G04/);
  });
  it("zmiana strony korekcji bez G40 to błąd", () => {
    const src = "S1000 M03\nG00 X-15 Y-15 Z5\nG01 Z-3 F100\nG41 D1 X0 Y0 F200\nG01 Y40\nG42 X60\nG40 X70\nM30";
    expect(msgs(src).join("\n")).toMatch(/error:Zmiana strony kompensacji/);
  });
  it("kolizja: szybki przejazd bokiem przez półfabrykat", () => {
    const stock = { minX: 0, maxX: 100, minY: 0, maxY: 80, top: 0, bottom: -20 };
    const src = "S1000 M03\nG00 X-10 Y10 Z5\nG01 Z-5 F100\nG00 X50 Y10\nM30";
    expect(msgs(src, "fanuc", stock).join("\n")).toMatch(/error:Kolizja/);
  });
});
