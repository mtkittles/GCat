/*
  „Program blok po bloku” na stronie głównej: tor narzędzia w płaszczyźnie XY podzielony na rozdziały
  (operacje) i rozłożony na odcinek postępu 0–1, którym steruje przewijanie strony.
  Każdy rozdział dostaje równą część postępu; ruchy rysują się w pierwszych `draw` częściach rozdziału,
  reszta to chwila na obejrzenie gotowej operacji. Ruch szybki liczy się krócej niż roboczy.
*/
import { parseProgram, segmentLength, type Segment } from "@/lib/parser";

export interface StorySeg {
  kind: "rapid" | "linear" | "arc";
  /** indeks linii programu (od 0) */
  line: number;
  ch: number;
  /** początek i długość odcinka postępu 0–1 */
  a: number; w: number;
  from: [number, number]; to: [number, number];
  /** łuk: środek, kąt początkowy i kąt obrotu ze znakiem (układ matematyczny, Y w górę) */
  c?: [number, number]; a0?: number; da?: number; r?: number;
  /** ścieżka SVG (Y w dół); null dla ruchu tylko w Z */
  d: string | null;
  /** zagłębienie w rozdziale z otworami — rysowane jako otwór */
  hole?: boolean;
}
export interface StoryChapter { from: number; to: number; lines: { n: number; raw: string }[] }
export interface Story { segs: StorySeg[]; chapters: StoryChapter[]; box: { minX: number; minY: number; maxX: number; maxY: number } }

const TAU = Math.PI * 2;
const f = (n: number) => String(Math.round(n * 1000) / 1000);
const RAPID_WEIGHT = 0.35;

function arcGeom(sg: Extract<Segment, { kind: "arc" }>) {
  const cx = sg.center.x, cy = sg.center.y;
  const a0 = Math.atan2(sg.from.y - cy, sg.from.x - cx);
  const a1 = Math.atan2(sg.to.y - cy, sg.to.x - cx);
  const r = Math.hypot(sg.from.x - cx, sg.from.y - cy);
  let sweep = sg.cw ? a0 - a1 : a1 - a0;
  sweep = ((sweep % TAU) + TAU) % TAU;
  if (sweep < 1e-9) sweep = TAU; // punkt końcowy = początkowy: pełny okrąg
  return { cx, cy, a0, r, da: sg.cw ? -sweep : sweep };
}

function arcPath(g: ReturnType<typeof arcGeom>, from: [number, number], to: [number, number]) {
  // po odwróceniu osi Y obrót zgodny z ruchem wskazówek zegara pozostaje zgodny na ekranie: sweep-flag = 1 dla G02
  const sw = g.da < 0 ? 1 : 0;
  const start = `M${f(from[0])} ${f(-from[1])}`;
  if (Math.abs(Math.abs(g.da) - TAU) < 1e-9) {
    const mx = 2 * g.cx - from[0], my = 2 * g.cy - from[1];
    return `${start}A${f(g.r)} ${f(g.r)} 0 1 ${sw} ${f(mx)} ${f(-my)}A${f(g.r)} ${f(g.r)} 0 1 ${sw} ${f(from[0])} ${f(-from[1])}`;
  }
  return `${start}A${f(g.r)} ${f(g.r)} 0 ${Math.abs(g.da) > Math.PI ? 1 : 0} ${sw} ${f(to[0])} ${f(-to[1])}`;
}

/** @param starts dla każdego rozdziału: tekst, od którego zaczyna się jego pierwsza linia (komentarz operacji) */
export function buildStory(src: string, starts: string[], opts: { draw?: number; holeChapters?: number[] } = {}): Story {
  const draw = opts.draw ?? 0.8;
  const program = parseProgram(src, {});
  const raw = program.lines.map((l) => l.raw);
  const first = starts.map((s) => raw.findIndex((r) => r.trim().startsWith(s)));
  if (first.some((i) => i < 0)) throw new Error("storyPath: brak linii początku rozdziału");
  const chOf = (line: number) => { let k = 0; for (let i = 0; i < first.length; i++) if (line >= first[i]) k = i; return k; };
  const N = starts.length;
  const chapters: StoryChapter[] = first.map((from, k) => {
    const to = k + 1 < N ? first[k + 1] - 1 : raw.length - 1;
    return { from, to, lines: raw.map((r, n) => ({ n, raw: r.trim() })).filter((l) => l.n >= from && l.n <= to && l.raw) };
  });

  const weight = (sg: Segment) => Math.max(segmentLength(sg), 0.5) * (sg.kind === "rapid" ? RAPID_WEIGHT : 1);
  const moves = program.segments.filter((sg): sg is Exclude<Segment, { kind: "dwell" }> => sg.kind === "rapid" || sg.kind === "linear" || sg.kind === "arc");
  const total = Array.from({ length: N }, () => 0);
  for (const sg of moves) total[chOf(sg.line)] += weight(sg);
  const done = Array.from({ length: N }, () => 0);
  const box = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  const segs: StorySeg[] = moves.map((sg) => {
    const ch = chOf(sg.line), wt = weight(sg);
    const a = (ch + (draw * done[ch]) / total[ch]) / N, w = (draw * wt) / total[ch] / N;
    done[ch] += wt;
    const from: [number, number] = [sg.from.x, sg.from.y], to: [number, number] = [sg.to.x, sg.to.y];
    for (const p of [from, to]) { box.minX = Math.min(box.minX, p[0]); box.maxX = Math.max(box.maxX, p[0]); box.minY = Math.min(box.minY, p[1]); box.maxY = Math.max(box.maxY, p[1]); }
    const flat = Math.hypot(to[0] - from[0], to[1] - from[1]) < 1e-9;
    if (sg.kind === "arc") {
      const g = arcGeom(sg);
      return { kind: "arc", line: sg.line, ch, a, w, from, to, c: [g.cx, g.cy], a0: g.a0, da: g.da, r: g.r, d: arcPath(g, from, to) };
    }
    const hole = flat && sg.kind === "linear" && sg.to.z < sg.from.z && (opts.holeChapters ?? []).includes(ch);
    return { kind: sg.kind, line: sg.line, ch, a, w, from, to, d: flat ? null : `M${f(from[0])} ${f(-from[1])}L${f(to[0])} ${f(-to[1])}`, ...(hole ? { hole } : {}) };
  });
  return { segs, chapters, box };
}

/** Odcinek wykonywany przy postępie p (ostatni, który już się zaczął). */
export function segAt(segs: StorySeg[], p: number): number {
  let i = 0;
  for (let k = 0; k < segs.length; k++) { if (segs[k].a <= p) i = k; else break; }
  return i;
}

/** Położenie środka narzędzia w XY (mm, Y w górę) przy postępie p. */
export function pointAt(segs: StorySeg[], p: number): [number, number] {
  if (!segs.length) return [0, 0];
  const s = segs[segAt(segs, p)];
  const t = Math.min(1, Math.max(0, (p - s.a) / s.w));
  if (s.kind === "arc" && s.c && s.a0 != null && s.da != null && s.r != null) {
    const ang = s.a0 + s.da * t;
    return [s.c[0] + s.r * Math.cos(ang), s.c[1] + s.r * Math.sin(ang)];
  }
  return [s.from[0] + (s.to[0] - s.from[0]) * t, s.from[1] + (s.to[1] - s.from[1]) * t];
}
