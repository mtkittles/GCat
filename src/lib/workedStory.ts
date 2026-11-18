import { parseProgram, pointAt, type Segment, type Vec3 } from "@/lib/parser";
import type { WorkedStep, WorkedStory } from "@/lib/lesson";
import { applyCompensation } from "@/components/simulator/compensation";
import { defaultSetup, makeTool } from "@/components/simulator/setup";

/*
  Przykład sterowany przewijaniem (Etap 12, B3): geometria toru w XY z podziałem na linie programu.
  Czysta logika — komponent `WorkedStory` tylko ją rysuje.
*/

export type StoryKind = "rapid" | "linear" | "arc";
export interface StorySeg { line: number; kind: StoryKind; d: string }
export interface StoryGeo {
  /** viewBox SVG: oś Y w górę (punkty mają już odwrócone Y) */
  view: { x: number; y: number; w: number; h: number };
  /** tor zaprogramowany (przy G41/G42 — kontur) */
  segs: StorySeg[];
  /** tor środka narzędzia z korekcją promienia — tylko gdy program używa G41/G42 */
  center: StorySeg[];
  /** pozycja środka narzędzia po wykonaniu linii (indeks od 0); przed pierwszym ruchem — null */
  pos: (Vec3 | null)[];
  /** liczba linii programu */
  lines: number;
}

const r3 = (n: number) => Math.round(n * 1000) / 1000;
const pt = (p: Vec3) => `${r3(p.x)} ${r3(-p.y)}`;

/** Ścieżka SVG odcinka w XY; łuk próbkowany co ~6° (dokładnie przez pointAt parsera). */
function segPath(sg: Segment): string {
  if (sg.kind !== "arc") return `M${pt(sg.from)}L${pt(sg.to)}`;
  const a0 = Math.atan2(sg.from.y - sg.center.y, sg.from.x - sg.center.x);
  const a1 = Math.atan2(sg.to.y - sg.center.y, sg.to.x - sg.center.x);
  let da = a1 - a0;
  if (sg.cw && da > 0) da -= 2 * Math.PI;
  if (!sg.cw && da < 0) da += 2 * Math.PI;
  if (Math.abs(da) < 1e-9) da = sg.cw ? -2 * Math.PI : 2 * Math.PI;
  const n = Math.max(4, Math.ceil(Math.abs(da) / (Math.PI / 30)));
  let d = `M${pt(sg.from)}`;
  for (let i = 1; i <= n; i++) d += `L${pt(pointAt(sg, i / n))}`;
  return d;
}

export function storyGeometry(story: WorkedStory): StoryGeo {
  const prog = parseProgram(story.program, {});
  // korekcja promienia: tor środka liczony tym samym kodem co w symulatorze, narzędzie o średnicy `tool`
  const setup = { ...defaultSetup("mill"), tools: Object.fromEntries([...new Set(prog.lines.map((l) => l.state.tool ?? 1))].map((t) => [t, { ...makeTool("endmill"), d: story.tool ?? 10 }])) };
  const comp = applyCompensation(prog, setup, "mill");
  const xs: number[] = [], ys: number[] = [];
  const trace = (list: Segment[]) => {
    const out: StorySeg[] = [];
    for (const sg of list) {
      if (sg.kind === "dwell") continue;
      // ruch tylko w Z nie zostawia śladu w XY, ale przesuwa narzędzie
      if (Math.hypot(sg.to.x - sg.from.x, sg.to.y - sg.from.y) > 1e-9 || sg.kind === "arc") out.push({ line: sg.line, kind: sg.kind, d: segPath(sg) });
      for (const p of [sg.from, sg.to]) { xs.push(p.x); ys.push(p.y); }
      if (sg.kind === "arc") { const r = Math.hypot(sg.from.x - sg.center.x, sg.from.y - sg.center.y); xs.push(sg.center.x - r, sg.center.x + r); ys.push(sg.center.y - r, sg.center.y + r); }
    }
    return out;
  };
  const segs = trace(prog.segments);
  const center = comp.active ? trace(comp.segments) : [];
  const pos: (Vec3 | null)[] = new Array(prog.lines.length).fill(null);
  for (const sg of comp.segments) if (sg.kind !== "dwell") pos[sg.line] = sg.to;
  // pozycja przenoszona przez linie bez ruchu
  let last: Vec3 | null = null;
  for (let i = 0; i < pos.length; i++) { if (pos[i]) last = pos[i]; else pos[i] = last; }

  if (story.stock) { xs.push(story.stock[0], story.stock[2]); ys.push(story.stock[1], story.stock[3]); }
  if (story.part) { xs.push(...story.part.x); ys.push(...story.part.y); }
  const tr = (story.tool ?? 0) / 2;
  const x0 = Math.min(...xs) - tr, x1 = Math.max(...xs) + tr, y0 = Math.min(...ys) - tr, y1 = Math.max(...ys) + tr;
  const m = Math.max(4, 0.06 * Math.max(x1 - x0, y1 - y0));
  return { view: { x: r3(x0 - m), y: r3(-(y1 + m)), w: r3(x1 - x0 + 2 * m), h: r3(y1 - y0 + 2 * m) }, segs, center, pos, lines: prog.lines.length };
}

/**
 * Linia programu (od 0) pokazywana przy kroku `i` (−1 — stan przed pierwszym krokiem, `from`).
 * Krok bez `line` (rachunek, kontrola) zostaje na linii poprzedniego kroku.
 */
export function stepLine(steps: Pick<WorkedStep, "line">[], i: number, from?: number): number {
  for (let k = Math.min(i, steps.length - 1); k >= 0; k--) if (steps[k].line) return steps[k].line! - 1;
  return (from ?? 0) - 1;
}

/** Rodzaj ruchu w kolorach symulatora: G00 bursztyn, G01 zieleń, G02/G03 błękit. */
export function motionClass(word: string): "g00" | "g01" | "g23" | null {
  const m = /^G0?([0-3])$/.exec(word);
  if (!m) return null;
  return m[1] === "0" ? "g00" : m[1] === "1" ? "g01" : "g23";
}
