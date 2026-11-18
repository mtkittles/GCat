import { parseProgram, pointAt, type Segment, type Vec3 } from "@/lib/parser";
import type { WorkedStep, WorkedStory } from "@/lib/lesson";
import { applyCompensation } from "@/components/simulator/compensation";
import { defaultSetup, defaultTool, makeTool } from "@/components/simulator/setup";

/*
  Przykład sterowany przewijaniem (Etap 12, B3): geometria toru z podziałem na linie programu.
  Frezowanie — widok z góry (X w prawo, Y w górę); toczenie — widok jak w kursie (Z w prawo, X w górę,
  promień, bez odbicia pod osią). Czysta logika — komponent `WorkedStory` tylko ją rysuje.
*/

export type StoryMode = "mill" | "lathe";
export type StoryKind = "rapid" | "linear" | "arc";
export interface StorySeg { line: number; kind: StoryKind; d: string }
export interface StoryGeo {
  mode: StoryMode;
  /** viewBox SVG: oś pionowa w górę (punkty mają już odwrócony znak) */
  view: { x: number; y: number; w: number; h: number };
  /** tor zaprogramowany (przy G41/G42 — kontur) */
  segs: StorySeg[];
  /** tor środka freza / naroża noża z korekcją promienia — tylko gdy program używa G41/G42 */
  center: StorySeg[];
  /** po linii (od 0) znane jest położenie w płaszczyźnie widoku — przed pierwszym dojazdem parser zakłada zero */
  xy: boolean[];
  /** pozycja narzędzia po wykonaniu linii (indeks od 0); przed pierwszym ruchem — null */
  pos: (Vec3 | null)[];
  /** liczba linii programu */
  lines: number;
  /** otwory z cykli wiercenia na frezarce (G73, G81–G89): punkt XY i linia, w której powstał */
  holes: { x: number; y: number; line: number }[];
}

const r3 = (n: number) => Math.round(n * 1000) / 1000;

/** Punkt w płaszczyźnie widoku: [poziomo, pionowo]. Tokarka: Z w prawo, X (promień) w górę. */
export const plane = (mode: StoryMode) => (p: Vec3): [number, number] => (mode === "lathe" ? [p.z, p.x] : [p.x, p.y]);

/**
 * Ścieżka SVG odcinka; łuk próbkowany co ~6° po okręgu w płaszczyźnie widoku. Kierunek obiegu
 * bierzemy z punktu w połowie łuku liczonego przez parser (pointAt) — ta sama konwencja G02/G03
 * co w symulatorze, w każdej płaszczyźnie.
 */
function segPath(sg: Segment, P: (p: Vec3) => [number, number]): string {
  const pt = (p: Vec3) => { const [h, v] = P(p); return `${r3(h)} ${r3(-v)}`; };
  if (sg.kind !== "arc") return `M${pt(sg.from)}L${pt(sg.to)}`;
  const [fh, fv] = P(sg.from), [th, tv] = P(sg.to), [ch, cv] = P(sg.center);
  const r = Math.hypot(fh - ch, fv - cv);
  const a0 = Math.atan2(fv - cv, fh - ch);
  const ang = (t: number) => { const [h, v] = P(pointAt(sg, t)); return Math.atan2(v - cv, h - ch); };
  const norm = (a: number) => { while (a <= -Math.PI) a += 2 * Math.PI; while (a > Math.PI) a -= 2 * Math.PI; return a; };
  // znak obiegu z małego kroku od startu; zakres kąta z punktu końcowego
  const ccw = norm(ang(0.02) - a0) > 0;
  const full = Math.hypot(th - fh, tv - fv) < 1e-9;
  let da = full ? 2 * Math.PI : norm(Math.atan2(tv - cv, th - ch) - a0);
  if (!full) { if (ccw && da < 0) da += 2 * Math.PI; if (!ccw && da > 0) da -= 2 * Math.PI; }
  else if (!ccw) da = -da;
  const n = Math.max(4, Math.ceil(Math.abs(da) / (Math.PI / 30)));
  let d = `M${pt(sg.from)}`;
  for (let i = 1; i <= n; i++) { const a = a0 + (da * i) / n; d += `L${r3(ch + r * Math.cos(a))} ${r3(-(cv + r * Math.sin(a)))}`; }
  return d;
}

export function storyGeometry(story: WorkedStory, mode: StoryMode = "mill", focus: number[] = []): StoryGeo {
  const lathe = mode === "lathe";
  const P = plane(mode);
  const prog = parseProgram(story.program, { diameterX: lathe });
  // korekcja promienia: tor liczony tym samym kodem co w symulatorze
  const tools = [...new Set(prog.lines.map((l) => l.state.tool ?? 1))];
  const setup = {
    ...defaultSetup(mode),
    tools: Object.fromEntries(tools.map((t) => [t, lathe ? defaultTool("lathe") : { ...makeTool("endmill"), d: story.tool ?? 10 }])),
  };
  const comp = applyCompensation(prog, setup, mode);
  const moves = (sg: Segment) => { const [a, b] = P(sg.from), [c, d] = P(sg.to); return Math.hypot(c - a, d - b) > 1e-9; };

  // Przed pierwszym ustawieniem w płaszczyźnie widoku parser zakłada start w zerze — to nie jest położenie
  // z programu. Pierwszy szybki dojazd (z tego punktu) i ruchy przed nim nie wchodzą do rysunku ani kadru.
  const hasXY = (line: number) => { const w = prog.lines[line]?.words ?? []; const [a, b] = lathe ? ["X", "Z"] : ["X", "Y"]; return w.some((x) => x.letter === a) && w.some((x) => x.letter === b); };
  const placedAt = (list: Segment[]) => list.findIndex((sg) => sg.kind !== "dwell" && (hasXY(sg.line) || moves(sg)));
  const trace = (list: Segment[]) => {
    const out: StorySeg[] = [];
    const first = placedAt(list);
    for (let k = 0; k < list.length; k++) {
      const sg = list[k];
      if (sg.kind === "dwell") continue;
      if (first >= 0 && (k < first || (k === first && sg.kind === "rapid"))) continue;
      // ruch prostopadły do widoku (Z na frezarce) nie zostawia śladu, ale przesuwa narzędzie
      if (moves(sg) || sg.kind === "arc") out.push({ line: sg.line, kind: sg.kind, d: segPath(sg, P) });
    }
    return out;
  };
  const segs = trace(prog.segments);
  const center = comp.active ? trace(comp.segments) : [];

  const pos: (Vec3 | null)[] = new Array(prog.lines.length).fill(null);
  const xy: boolean[] = new Array(prog.lines.length).fill(false);
  const firstXY = placedAt(comp.segments);
  comp.segments.forEach((sg, k) => { if (sg.kind !== "dwell") { pos[sg.line] = sg.to; if (firstXY >= 0 && k >= firstXY) xy[sg.line] = true; } });
  // Linia z osiami bez odcinka (pierwszy dojazd — parser zaczyna w tym punkcie, ruch zerowy) — pozycja ze stanu.
  // Dalej pozycja przenoszona przez linie bez ruchu.
  let last: Vec3 | null = null, lastXY = false;
  for (let i = 0; i < pos.length; i++) {
    if (!pos[i] && prog.lines[i]?.words.some((w) => w.letter === "X" || w.letter === "Y" || w.letter === "Z")) { pos[i] = prog.lines[i].state.pos; if (hasXY(i)) xy[i] = true; }
    if (pos[i]) { last = pos[i]; lastXY = lastXY || xy[i]; } else pos[i] = last;
    xy[i] = lastXY;
  }

  // otwory: zagłębienie w osi Z w bloku cyklu wiercenia (frezarka)
  const holes: StoryGeo["holes"] = [];
  if (!lathe) for (const sg of prog.segments) {
    if (sg.kind !== "linear" || !prog.lines[sg.line]?.state.cycle || sg.to.z >= sg.from.z) continue;
    if (Math.hypot(sg.to.x - sg.from.x, sg.to.y - sg.from.y) > 1e-9) continue;
    if (!holes.some((h) => Math.hypot(h.x - sg.to.x, h.y - sg.to.y) < 1e-6)) holes.push({ x: sg.to.x, y: sg.to.y, line: sg.line });
  }

  // Kadr: ruchy robocze, półfabrykat i detal, pozycje w krokach przykładu. Odjazdy daleko od detalu
  // (G28, G00 X100. Z100.) nie rozpychają kadru — wychodzą poza rysunek.
  const hs: number[] = [], vs: number[] = [];
  const add = (p: Vec3) => { const [h, v] = P(p); hs.push(h); vs.push(v); };
  comp.segments.forEach((sg, k) => {
    if (sg.kind === "dwell" || sg.kind === "rapid" || (firstXY >= 0 && k < firstXY)) return;
    add(sg.from); add(sg.to);
    if (sg.kind === "arc") { const [ch, cv] = P(sg.center), [fh, fv] = P(sg.from); const r = Math.hypot(fh - ch, fv - cv); hs.push(ch - r, ch + r); vs.push(cv - r, cv + r); }
  });
  for (const l of focus) { const p = pos[l]; if (p && xy[l]) add(p); }
  if (story.stock) { hs.push(story.stock[0], story.stock[2]); vs.push(story.stock[1], story.stock[3]); }
  const pt0 = story.part;
  if (pt0 && "cx" in pt0) { hs.push(pt0.cx - pt0.d / 2, pt0.cx + pt0.d / 2); vs.push(pt0.cy - pt0.d / 2, pt0.cy + pt0.d / 2); }
  else if (pt0) { hs.push(...pt0.x); vs.push(...pt0.y); }
  if (story.bar) { hs.push(...story.bar.z); vs.push(0, story.bar.d / 2); }
  if (lathe) vs.push(0); // oś toczenia zawsze w kadrze
  if (!hs.length) { hs.push(0); vs.push(0); }
  const tr = lathe ? 0 : (story.tool ?? 0) / 2;
  const x0 = Math.min(...hs) - tr, x1 = Math.max(...hs) + tr, y0 = Math.min(...vs) - tr, y1 = Math.max(...vs) + tr;
  const m = Math.max(lathe ? 2 : 4, 0.06 * Math.max(x1 - x0, y1 - y0));
  return { mode, view: { x: r3(x0 - m), y: r3(-(y1 + m)), w: r3(x1 - x0 + 2 * m), h: r3(y1 - y0 + 2 * m) }, segs, center, pos, xy, lines: prog.lines.length, holes };
}

/**
 * Linie programu (od 0) kroku `i`: [pierwsza, ostatnia] podświetlona; podgląd sięga do ostatniej.
 * Krok −1 — stan przed pierwszym krokiem (`from`), krok bez linii (rachunek, kontrola) zostaje
 * na liniach poprzedniego kroku. Brak linii: [−1, −1].
 */
export function stepLines(steps: Pick<WorkedStep, "line" | "lineTo">[], i: number, from?: number): [number, number] {
  for (let k = Math.min(i, steps.length - 1); k >= 0; k--) {
    const s = steps[k];
    if (s.line) return [s.line - 1, (s.lineTo ?? s.line) - 1];
  }
  const f = (from ?? 0) - 1;
  return [f, f];
}

/** Linie (od 0), których pozycje muszą się zmieścić w kadrze: `from` i końce kroków. */
export function focusLines(steps: Pick<WorkedStep, "line" | "lineTo">[], from?: number): number[] {
  const out = steps.flatMap((s) => (s.line ? [s.line - 1, (s.lineTo ?? s.line) - 1] : []));
  if (from) out.push(from - 1);
  return out;
}

/** Rodzaj ruchu w kolorach symulatora: G00 bursztyn, G01 zieleń, G02/G03 błękit. */
export function motionClass(word: string): "g00" | "g01" | "g23" | null {
  const m = /^G0?([0-3])$/.exec(word);
  if (!m) return null;
  return m[1] === "0" ? "g00" : m[1] === "1" ? "g01" : "g23";
}

/*
  Etap 12b — liczby do przeciągania: w bieżącej linii przykładu współrzędne (X Y Z U W), parametry łuku
  (I J K R) są „pokrętłami”. Program z nowymi wartościami przechodzi przez parser i walidator na żywo.
*/

/** Litery adresów, których wartości można przeciągać — geometria toru. */
export const SCRUB_LETTERS = "XYZUWIJKR";

/** Słowo `X-5.` jako liczba do przeciągania: litera, wartość, krok (1 albo dokładność zapisu, np. 0.1, 0.05). */
export interface ScrubWord { letter: string; value: number; step: number }

/** Podział linii na tokeny jak w podświetlaniu kodu: komentarz w nawiasie albo słowo bez spacji. */
export function tokens(line: string): { text: string; comment: boolean; start: number }[] {
  const out: { text: string; comment: boolean; start: number }[] = [];
  const re = /(\([^)]*\))|(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) out.push({ text: m[0], comment: !!m[1], start: m.index });
  return out;
}

export function scrubWord(text: string): ScrubWord | null {
  const m = /^([A-Z])(-?(?:\d+\.?\d*|\.\d+))$/.exec(text);
  if (!m || !SCRUB_LETTERS.includes(m[1])) return null;
  const frac = m[2].includes(".") ? m[2].split(".")[1].length : 0;
  return { letter: m[1], value: Number(m[2]), step: frac === 0 ? 1 : Math.max(0.01, 10 ** -frac) };
}

/** Liczba w zapisie kursu: całkowite z kropką (`15.`), ułamki bez zbędnych zer (`12.5`, `-0.05`). */
export function fmtWord(v: number): string {
  const r = Math.round(v * 1000) / 1000;
  if (Object.is(r, -0) || r === 0) return "0.";
  return Number.isInteger(r) ? `${r}.` : String(r);
}

/** Klucz zmiany: `linia:indeks tokenu` (oba od 0). */
export type Edits = Record<string, number>;

/** Program z podmienionymi wartościami; reszta linii bajt w bajt bez zmian. */
export function applyEdits(program: string, edits: Edits): string {
  if (!Object.keys(edits).length) return program;
  return program.split("\n").map((row, li) => {
    const toks = tokens(row);
    let out = "", last = 0;
    toks.forEach((t, ti) => {
      const v = edits[`${li}:${ti}`];
      if (v === undefined || t.comment) return;
      const w = scrubWord(t.text);
      if (!w) return;
      out += row.slice(last, t.start) + w.letter + fmtWord(v);
      last = t.start + t.text.length;
    });
    return out + row.slice(last);
  }).join("\n");
}
