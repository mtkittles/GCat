import { describe, expect, it } from "vitest";
import { activeOffset, frameShift, parseProgram, wcsLabel } from "@/lib/parser";
import { validate } from "@/lib/parser/validate";

/*
  Model przesunięć: pos (maszyna) = prog + offsets[wcs] + G52 + G92 + TRANS, potem G68.
  Tabela układów jest domyślnie zerowa, więc programy bez G10/G92/G52 rysują się jak dotąd.
*/
const P = (src: string, opts?: Parameters<typeof parseProgram>[1]) => parseProgram(src, opts);
const lastState = (src: string, opts?: Parameters<typeof parseProgram>[1]) => { const p = P(src, opts); return p.lines[p.lines.length - 1].state; };
const V = (x: number, y: number, z: number) => ({ x, y, z });

describe("G10 L2 i wybór układu G54–G59", () => {
  it("G10 L2 P2 X100 → G55 → ruch X10: maszyna 110, program 10; w G54 to samo daje 10", () => {
    const s55 = lastState("G90 G10 L2 P2 X100 Y0 Z0\nG55\nG00 X10 Y5 Z2");
    expect(s55.pos).toEqual(V(110, 5, 2)); expect(s55.prog).toEqual(V(10, 5, 2));
    const s54 = lastState("G90 G10 L2 P2 X100 Y0 Z0\nG54\nG00 X10 Y5 Z2");
    expect(s54.pos).toEqual(V(10, 5, 2));
  });
  it("G10 L2 przed G54 zapisuje tabelę; układ aktywowany później ją czyta", () => {
    const p = P("G90 G10 L2 P1 X-20 Y-30 Z0\nG54\nG00 X0 Y0 Z0");
    expect(activeOffset(p.lines[1].state)).toEqual(V(-20, -30, 0));
    expect(p.lines[2].state.pos).toEqual(V(-20, -30, 0));
  });
  it("G10 L2 na AKTYWNYM układzie nie rusza maszyną — zmienia się tylko odczyt programu", () => {
    const p = P("G90 G54 G00 X10 Y10 Z5\nG10 L2 P1 X100\nG01 X10 Y10 F100");
    expect(p.lines[1].segments).toHaveLength(0);
    expect(p.lines[1].state.pos).toEqual(V(10, 10, 5));
    expect(p.lines[1].state.prog).toEqual(V(-90, 10, 5));
    const seg = p.lines[2].segments[0];
    expect(seg.from).toEqual(V(10, 10, 5)); expect(seg.to).toEqual(V(110, 10, 5));
  });
  it("G91 G10 L2 dodaje do istniejącej wartości; pominięte osie zostają", () => {
    const s = lastState("G90 G10 L2 P3 X10 Y20 Z30\nG91 G10 L2 P3 X5\nG90 G56 G00 X0 Y0 Z0");
    expect(activeOffset(s)).toEqual(V(15, 20, 30));
    expect(s.pos).toEqual(V(15, 20, 30));
  });
  it("zmiana układu w trakcie programu nie tworzy segmentu, a następny ruch startuje z pozycji maszynowej", () => {
    const p = P("G90 G10 L2 P2 X50 Y0 Z0\nG54 G00 X10 Y0 Z5\nG55\nG01 X10 Y0 F100");
    expect(p.lines[2].segments).toHaveLength(0);
    expect(p.lines[2].state.pos).toEqual(V(10, 0, 5));
    expect(p.lines[2].state.prog).toEqual(V(-40, 0, 5));
    expect(p.lines[3].segments[0]).toMatchObject({ from: V(10, 0, 5), to: V(60, 0, 5) });
  });
  it("P poza zakresem i brak L to błędy linii, bez zmiany tabeli", () => {
    expect(P("G10 L2 P7 X1").lines[0].errors.join()).toMatch(/P0.*P1–P6/);
    expect(P("G10 P1 X1").lines[0].errors.join()).toMatch(/wymaga L/);
    expect(P("G10 L2 P7 X1").lines[0].state.offsets).toEqual({});
  });
  it("G10 L10/L11 (korektory) to komunikat „nieobsługiwane”, nie cichy ruch ani błąd", () => {
    const l = P("G90 G10 L10 P1 R125.37").lines[0];
    expect(l.errors).toEqual([]); expect(l.segments).toEqual([]);
    expect(l.description).toMatch(/nieobsługiwane/);
  });
  it("tokarka: X w G10 L2 jest średnicą, jak reszta programu", () => {
    const s = lastState("G10 L2 P2 X10 Z-5\nG55 G00 X0 Z0", { diameterX: true });
    expect(s.pos).toEqual(V(5, 0, -5));
  });
});

describe("G54.1 P i G10 L20", () => {
  it("G54.1 P3 z G10 L20 P3", () => {
    const s = lastState("G90 G10 L20 P3 X7 Y8 Z9\nG54.1 P3\nG00 X1 Y1 Z1");
    expect(wcsLabel(s)).toBe("G54.1 P3");
    expect(s.pos).toEqual(V(8, 9, 10));
  });
  it("P49 i brak P to błędy", () => {
    expect(P("G54.1 P49").lines[0].errors.join()).toMatch(/P1–P48/);
    expect(P("G54.1").lines[0].errors.join()).toMatch(/P1–P48/);
    expect(P("G10 L20 P0 X1").lines[0].errors.join()).toMatch(/P1–P48/);
  });
});

describe("G92 i G92.1", () => {
  it("G92 X0 Y0 w punkcie (50,20): program (0,0), maszyna bez zmian, G92.1 przywraca", () => {
    const p = P("G90 G00 X50 Y20 Z3\nG92 X0 Y0\nG01 X10 F100\nG92.1\nG01 X10 F100");
    expect(p.lines[1].segments).toHaveLength(0);
    expect(p.lines[1].state.pos).toEqual(V(50, 20, 3));
    expect(p.lines[1].state.prog).toEqual(V(0, 0, 3));
    expect(p.lines[2].state.pos).toEqual(V(60, 20, 3));
    expect(p.lines[3].state.prog).toEqual(V(60, 20, 3));
    expect(p.lines[4].state.pos).toEqual(V(10, 20, 3));
  });
  it("G52 X0 Y0 nie kasuje G92; G52 i G92 współistnieją, G52 X0 zeruje tylko G52", () => {
    const p = P("G90 G00 X50 Y20 Z0\nG92 X0 Y0\nG52 X10 Y10\nG01 X0 Y0 F100\nG52 X0 Y0\nG01 X0 Y0");
    expect(frameShift(p.lines[2].state)).toEqual(V(60, 30, 0));
    expect(p.lines[3].state.pos).toEqual(V(60, 30, 0));
    expect(p.lines[4].state.local).toEqual(V(0, 0, 0)); expect(p.lines[4].state.shift).toEqual(V(50, 20, 0));
    expect(p.lines[5].state.pos).toEqual(V(50, 20, 0));
  });
  it("tokarka Fanuc (system A): G92 pozostaje cyklem gwintowania", () => {
    const p = P("G00 X30 Z5\nG92 X28 Z-20 F1.5", { diameterX: true });
    expect(p.lines[1].state.lcycle?.code).toBe(92);
    expect(p.lines[1].segments.length).toBe(4);
    expect(p.lines[1].state.shift).toEqual(V(0, 0, 0));
  });
});

describe("Sinumerik: TRANS/ATRANS, G500, G505", () => {
  it("TRANS X50 → X0 rysuje się w X50; ATRANS X10 dodaje; TRANS bez osi kasuje", () => {
    const p = P("G54 G0 X0 Y0 Z0\nTRANS X50 Y0\nG1 X0 Y0 F100\nATRANS X10\nG1 X0 Y0\nTRANS\nG1 X0 Y0", { dialect: "sinumerik" });
    expect(p.lines[1].segments).toHaveLength(0);
    expect(p.lines[2].state.pos).toEqual(V(50, 0, 0));
    expect(p.lines[4].state.pos).toEqual(V(60, 0, 0));
    expect(p.lines[5].state.frame).toEqual(V(0, 0, 0));
    expect(p.lines[6].state.pos).toEqual(V(0, 0, 0));
  });
  it("G505 z własnym przesunięciem, G500 kasuje układ bazowy", () => {
    const p = P("G0 X0 Y0 Z0\nG505\nG1 X0 Y0 F100\nG500\nG1 X0 Y0", { dialect: "sinumerik" });
    expect(wcsLabel(p.lines[1].state)).toBe("G505");
    expect(wcsLabel(p.lines[3].state)).toBe("G500");
    expect(activeOffset(p.lines[3].state)).toEqual(V(0, 0, 0));
    expect(p.lines[1].errors).toEqual([]);
  });
  it("ROT/SUPA: komunikat, blok bez ruchu", () => {
    const l = P("ROT Z45", { dialect: "sinumerik" }).lines[0];
    expect(l.segments).toEqual([]); expect(l.description).toMatch(/nieobsługiwane/);
  });
  it("Fanuc: TRANS nie jest ruchem, walidator ostrzega o składni Sinumerika", () => {
    const p = P("G90 G00 X0 Y0\nTRANS X50 Y0\nG01 X0 F100");
    expect(p.lines[1].segments).toHaveLength(0);
    expect(validate(p, "fanuc").some((i) => /TRANS/.test(i.msg) && /Sinumerik/.test(i.msg))).toBe(true);
  });
  it("Sinumerik: G92 i G54.1 to składnia Fanuca — ostrzeżenie", () => {
    const p = P("G90 G0 X0 Y0\nG92 X0 Y0\nG54.1 P1\nG1 X1 F100", { dialect: "sinumerik" });
    const msgs = validate(p, "sinumerik").map((i) => i.msg).join(" | ");
    expect(msgs).toMatch(/G92/); expect(msgs).toMatch(/G54\.1/);
  });
});

describe("wzór pozycji i G68", () => {
  it("pos = prog + offsets[wcs] + G52 + G92 + TRANS, potem obrót", () => {
    const s = lastState("G90 G10 L2 P2 X10 Y0 Z0\nG55\nG52 X5 Y0\nG00 X0 Y0 Z0\nG92 X-1 Y0\nTRANS Y3\nG68 X0 Y0 R90\nG01 X10 Y0 F100");
    // frameShift = 10+5+1 w X, 3 w Y → punkt (10,0) programu → (26,3) → obrót o 90° wokół (0,0) → (-3,26)
    expect(frameShift(s)).toEqual(V(16, 3, 0));
    expect(s.pos.x).toBeCloseTo(-3, 9); expect(s.pos.y).toBeCloseTo(26, 9);
    expect(s.prog).toEqual(V(10, 0, 0));
  });
  it("program bez przesunięć: stan początkowy ma zerową tabelę i etykietę G54", () => {
    const s = lastState("G90 G00 X1 Y2 Z3");
    expect(s.offsets).toEqual({}); expect(wcsLabel(s)).toBe("G54"); expect(frameShift(s)).toEqual(V(0, 0, 0));
  });
});
