import { describe, expect, it } from "vitest";
import { flat } from "@/lib/course";
import { parseProgram } from "@/lib/parser";
import { validate } from "@/lib/parser/validate";
import { applyEdits, fmtWord, focusLines, motionClass, plane, scrubWord, stepLines, storyGeometry, tokens } from "@/lib/workedStory";

const storiesOf = (t: "frezowanie" | "toczenie") => flat(t).flatMap((l) => (l.doc?.worked.story ? [{ id: l.id, w: l.doc.worked, story: l.doc.worked.story, mode: (t === "toczenie" ? "lathe" : "mill") as "mill" | "lathe" }] : []));
const stories = [...storiesOf("frezowanie"), ...storiesOf("toczenie")];
/** Słowo programu z liczbą znormalizowaną: `X44` i `X44.` to to samo. */
const word = (w: string) => { const m = /^([A-Z])(-?[0-9.]+)$/.exec(w); return m ? `${m[1]}${Number(m[2])}` : w; };

describe("przykład przewijany (Etap 12, B3) — pilotaż", () => {
  it("przykłady z programem; bez podprogramów (F7.1, T8.1 — kolejność wykonania ≠ kolejność linii) i kroków opisujących konturu przed cyklem (T5.2)", () => {
    expect(storiesOf("frezowanie").map((s) => s.id)).toEqual(["F1.3", "F1.5", "F2.1", "F2.3", "F2.4", "F3.1", "F3.2", "F3.3", "F3.4", "F4.2", "F4.3", "F5.1", "F5.2", "F5.3", "F5.4", "F6.1", "F6.2", "F6.3", "F8.1"]);
    expect(storiesOf("toczenie").map((s) => s.id)).toEqual(["T1.1", "T1.2", "T1.3", "T2.1", "T2.3", "T3.1", "T3.2", "T3.3", "T4.1", "T5.1", "T6.1", "T6.2", "T7.2"]);
  });

  for (const { id, w, story, mode } of stories) {
    describe(id, () => {
      const prog = parseProgram(story.program, { diameterX: mode === "lathe" });
      const rows = story.program.split("\n");
      it("program przechodzi parser i walidator bez uwag", () => {
        expect(prog.lines.flatMap((l) => l.errors)).toEqual([]);
        expect(validate(prog, "fanuc")).toEqual([]);
      });
      it("kadr obejmuje pozycje narzędzia w krokach", () => {
        const g = storyGeometry(story, mode, focusLines(w.steps, story.from));
        const P = plane(mode);
        for (const l of focusLines(w.steps, story.from)) {
          const p = g.pos[l]; if (!p || !g.xy[l]) continue;
          const [h, v] = P(p);
          expect(h).toBeGreaterThanOrEqual(g.view.x); expect(h).toBeLessThanOrEqual(g.view.x + g.view.w);
          expect(-v).toBeGreaterThanOrEqual(g.view.y); expect(-v).toBeLessThanOrEqual(g.view.y + g.view.h);
        }
      });
      it("kroki wskazują linie programu z kodem kroku; końce kroków nie maleją", () => {
        let prev = story.from ?? 0;
        for (const st of w.steps) {
          if (!st.line) { expect(st.lineTo).toBeUndefined(); continue; }
          const to = st.lineTo ?? st.line;
          expect(st.line).toBeGreaterThan(0);
          expect(to).toBeGreaterThanOrEqual(st.line);
          expect(to).toBeLessThanOrEqual(rows.length);
          expect(to).toBeGreaterThanOrEqual(prev);
          prev = to;
          // kod kroku zapisany jak w programie (bez rachunków, strzałek, „…”, „·”): co najmniej połowa słów jest
          // w liniach kroku — krok może pokazywać też współrzędną modalną z wcześniejszej linii (np. T1.1 `X36 Z-55`)
          if (st.code && /^[A-Z0-9.\- ]+$/.test(st.code)) {
            const words = rows.slice(st.line - 1, to).join(" ").split(/\s+/).map(word);
            const mine = st.code.split(/\s+/).map(word);
            expect(mine.filter((x) => words.includes(x)).length * 2, `${id}: ${st.code}`).toBeGreaterThanOrEqual(mine.length);
          }
        }
        expect(story.from ?? 0).toBeLessThan(w.steps.find((s) => s.line)!.line!);
      });
    });
  }
});

describe("geometria przykładu", () => {
  const byId = (id: string) => stories.find((s) => s.id === id)!.story;
  it("F3.2: narzędzie po linii 16 (Y-5.) w X85 Y−5 Z−5; obieg ma 6 odcinków G01 w XY", () => {
    const g = storyGeometry(byId("F3.2"));
    expect(g.pos[15]).toMatchObject({ x: 85, y: -5, z: -5 });
    expect(g.segs.filter((s) => s.kind === "linear")).toHaveLength(6);
    expect(g.center).toEqual([]); // bez G41/G42
  });
  it("F3.1: przed pierwszym ruchem brak pozycji, ruch tylko w Z nie zostawia śladu w XY", () => {
    const g = storyGeometry(byId("F3.1"));
    expect(g.pos[0]).toBeNull();
    expect(g.pos[10]).toMatchObject({ x: -20, y: 10, z: 5 }); // linia 11: G00 Z5.
    expect(g.segs.some((s) => s.line === 10)).toBe(false);
  });
  it("F4.2: z G41 środek freza jedzie 5 mm od konturu — koniec linii 13 (G01 Y40.) w X−5 Y40", () => {
    const g = storyGeometry(byId("F4.2"));
    expect(g.center.length).toBeGreaterThan(0);
    expect(g.pos[12]!.x).toBeCloseTo(-5, 6);
    expect(g.pos[12]!.y).toBeCloseTo(40, 6);
  });
  it("F5.1: cztery otwory z cyklu G82 w środkach naroży R10, każdy z linii, w której powstał", () => {
    const g = storyGeometry(byId("F5.1"));
    expect(g.holes.map((h) => [h.x, h.y, h.line + 1])).toEqual([[10, 10, 9], [70, 10, 10], [70, 40, 11], [10, 40, 12]]);
  });
  it("F6.3: kieszeń okrągła w kadrze; bez cykli — bez otworów", () => {
    const g = storyGeometry(byId("F6.3"));
    expect(g.holes).toEqual([]);
    expect(g.view.x).toBeLessThan(50);
  });
  it("T3.3: łuk wklęsły G02 R1 w widoku Z→, X↑ idzie zgodnie z zegarem przez punkt nad stopniem (Z−39, ⌀32)", () => {
    const g = storyGeometry(byId("T3.3"), "lathe");
    const arc = g.segs.find((s) => s.kind === "arc" && s.line === 13)!;
    // próbki łuku leżą na okręgu o środku Z−39 X(promień)16 — wklęsły (środek poza materiałem)
    const pts = [...arc.d.matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)].map((m) => [Number(m[1]), -Number(m[2])]);
    for (const [h, v] of pts) expect(Math.hypot(h - -39, v - 16)).toBeCloseTo(1, 2);
  });
  it("T1.1: tokarka — pozycja po linii 10 (Z-55.) to ⌀36 Z−55; kadr obejmuje oś", () => {
    const g = storyGeometry(byId("T1.1"), "lathe");
    expect(g.pos[9]!.x * 2).toBeCloseTo(36, 6);
    expect(g.pos[9]!.z).toBeCloseTo(-55, 6);
    expect(g.view.y + g.view.h).toBeGreaterThan(0);
  });
  it("viewBox obejmuje półfabrykat i promień narzędzia", () => {
    const g = storyGeometry(byId("F3.3"));
    expect(g.view.x).toBeLessThan(-2 - 5);
    expect(g.view.x + g.view.w).toBeGreaterThan(82 + 5);
  });
});

describe("krok → linia", () => {
  const steps = [{ line: 10 }, {}, { line: 11, lineTo: 13 }];
  it("przed pierwszym krokiem — linia `from`; krok bez linii zostaje na poprzedniej; zakres linii", () => {
    expect(stepLines(steps, -1, 9)).toEqual([8, 8]);
    expect(stepLines(steps, 0, 9)).toEqual([9, 9]);
    expect(stepLines(steps, 1, 9)).toEqual([9, 9]);
    expect(stepLines(steps, 2, 9)).toEqual([10, 12]);
    expect(stepLines([{}], 0)).toEqual([-1, -1]);
  });
  it("kolory ruchu", () => {
    expect(motionClass("G00")).toBe("g00");
    expect(motionClass("G1")).toBe("g01");
    expect(motionClass("G03")).toBe("g23");
    expect(motionClass("G41")).toBeNull();
  });
});

describe("liczby do przeciągania (Etap 12b)", () => {
  it("słowa geometrii z krokiem wg zapisu; inne adresy nie", () => {
    expect(scrubWord("R15.")).toEqual({ letter: "R", value: 15, step: 1 });
    expect(scrubWord("X36.4")).toEqual({ letter: "X", value: 36.4, step: 0.1 });
    expect(scrubWord("R0.05")).toEqual({ letter: "R", value: 0.05, step: 0.01 });
    expect(scrubWord("Z-5.")).toMatchObject({ value: -5 });
    for (const w of ["F400", "S2500", "G01", "N10", "T0101", "(X5)"]) expect(scrubWord(w)).toBeNull();
  });
  it("zapis liczby jak w kursie", () => {
    expect(fmtWord(20)).toBe("20.");
    expect(fmtWord(-5)).toBe("-5.");
    expect(fmtWord(12.5)).toBe("12.5");
    expect(fmtWord(0.1 + 0.2)).toBe("0.3");
    expect(fmtWord(-0)).toBe("0.");
  });
  it("zmiana podmienia tylko wskazane słowo; reszta programu bez zmian", () => {
    const src = "G01 Y40. F400 (BOK)\nG02 X10. Y55. R15.";
    expect(applyEdits(src, {})).toBe(src);
    expect(applyEdits(src, { "1:3": 20 })).toBe("G01 Y40. F400 (BOK)\nG02 X10. Y55. R20.");
    // komentarz ani słowo spoza geometrii nie są zmieniane nawet przy kluczu
    expect(applyEdits(src, { "0:3": 9, "0:2": 1 })).toBe(src);
  });
  it("F3.3: R na narożu zmienia łuk na żywo; za małe R — błąd parsera jak w symulatorze", () => {
    const story = stories.find((s) => s.id === "F3.3")!.story;
    const line = story.program.split("\n").findIndex((r) => r === "G02 X10. Y55. R15.");
    const ri = tokens(story.program.split("\n")[line]).findIndex((t) => t.text === "R15.");
    const big = parseProgram(applyEdits(story.program, { [`${line}:${ri}`]: 20 }), {});
    const arc = big.segments.find((s) => s.line === line && s.kind === "arc")!;
    expect(arc.kind === "arc" && Math.hypot(arc.from.x - arc.center.x, arc.from.y - arc.center.y)).toBeCloseTo(20, 6);
    const small = parseProgram(applyEdits(story.program, { [`${line}:${ri}`]: 5 }), {});
    expect(small.lines[line].errors.join(" ")).toMatch(/za mały/);
  });
});
