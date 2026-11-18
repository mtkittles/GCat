import { describe, expect, it } from "vitest";
import { flat } from "@/lib/course";
import { parseProgram } from "@/lib/parser";
import { validate } from "@/lib/parser/validate";
import { motionClass, stepLine, storyGeometry } from "@/lib/workedStory";

const stories = flat("frezowanie").flatMap((l) => (l.doc?.worked.story ? [{ id: l.id, w: l.doc.worked, story: l.doc.worked.story }] : []));

describe("przykład przewijany (Etap 12, B3) — pilotaż", () => {
  it("pilotaż: F3.1, F3.2, F3.3, F4.2, F4.3", () => {
    expect(stories.map((s) => s.id)).toEqual(["F3.1", "F3.2", "F3.3", "F4.2", "F4.3"]);
  });

  for (const { id, w, story } of stories) {
    describe(id, () => {
      const prog = parseProgram(story.program, {});
      const rows = story.program.split("\n");
      it("program przechodzi parser i walidator bez uwag", () => {
        expect(prog.lines.flatMap((l) => l.errors)).toEqual([]);
        expect(validate(prog, "fanuc")).toEqual([]);
      });
      it("kroki wskazują linie programu z kodem kroku; kolejność nie maleje", () => {
        let prev = story.from ?? 0;
        for (const s of w.steps) {
          if (!s.line) continue;
          expect(s.line).toBeGreaterThan(0);
          expect(s.line).toBeLessThanOrEqual(rows.length);
          expect(s.line).toBeGreaterThanOrEqual(prev);
          prev = s.line;
          // kod kroku zapisany jak w programie (bez rachunków i strzałek) — każde słowo jest w tej linii
          if (s.code && /^[A-Z0-9.\- ]+$/.test(s.code)) for (const word of s.code.split(/\s+/)) expect(rows[s.line - 1].split(/\s+/)).toContain(word);
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
  it("viewBox obejmuje półfabrykat i promień narzędzia", () => {
    const g = storyGeometry(byId("F3.3"));
    expect(g.view.x).toBeLessThan(-2 - 5);
    expect(g.view.x + g.view.w).toBeGreaterThan(82 + 5);
  });
});

describe("krok → linia", () => {
  const steps = [{ line: 10 }, {}, { line: 11 }];
  it("przed pierwszym krokiem — linia `from`; krok bez linii zostaje na poprzedniej", () => {
    expect(stepLine(steps, -1, 9)).toBe(8);
    expect(stepLine(steps, 0, 9)).toBe(9);
    expect(stepLine(steps, 1, 9)).toBe(9);
    expect(stepLine(steps, 2, 9)).toBe(10);
    expect(stepLine([{}], 0)).toBe(-1);
  });
  it("kolory ruchu", () => {
    expect(motionClass("G00")).toBe("g00");
    expect(motionClass("G1")).toBe("g01");
    expect(motionClass("G03")).toBe("g23");
    expect(motionClass("G41")).toBeNull();
  });
});
