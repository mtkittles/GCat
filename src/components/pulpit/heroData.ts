import { parseProgram, type Segment } from "@/lib/parser";
import { simHref } from "@/lib/simLink";
import { HOME_DEMO, HOME_DEMO_OPS } from "@/content/homeDemo";
import { KORPUS, KORPUS_OPS, WALEK, WALEK_OPS } from "@/content/heroDetale";

/*
  Dane okna programu na stronie startowej (V3.1), liczone przy budowie strony: tor z parsera (wersja Fanuc),
  odcinki z czasem odtwarzania, warstwa zebranego materiału, kod obu sterowań z kolorem ruchu i mapą linii Fanuc → Sinumerik.
  Widok: frezowanie — z góry (X w prawo, Y w górę); toczenie — przekrój osiowy (Z w prawo, X na promieniu w górę).
*/
export type Kind = "rapid" | "linear" | "arc";
export interface CodeLine { t: string; k?: Kind; op: number }
export interface HSeg {
  kind: Kind;
  /** indeks linii programu Fanuc (od 0) */
  line: number;
  op: number;
  /** punkty [poziomo, pionowo, z] w mm (widok); łuki próbkowane */
  pts: [number, number, number][];
  /** waga czasu odtwarzania */
  w: number;
  /** frezowanie: ruch roboczy w materiale (Z ≤ 0) — rysowany jako ślad o szerokości narzędzia */
  cut: boolean;
  /** frezowanie: średnica narzędzia [mm] */
  dia: number;
  /** wiercenie / zagłębienie: otwór w punkcie */
  hole?: [number, number, number];
}
export interface HOp { name: string; tool: string; line: number }
export interface HDetal {
  key: string; name: string; sub: string; mode: "mill" | "lathe";
  stock: { x0: number; y0: number; x1: number; y1: number };
  ops: HOp[];
  code: CodeLine[];
  /** indeks linii Sinumerik odpowiadający linii Fanuc */
  segs: HSeg[];
  simHref: string;
}

const r3 = (v: number) => Math.round(v * 1000) / 1000;
const TAU = Math.PI * 2;

/** Punkty odcinka w przestrzeni (x, y, z); łuk w płaszczyźnie XY lub ZX, punkt końcowy = początkowy → pełny okrąg. */
function sample(s: Exclude<Segment, { kind: "dwell" }>): { x: number; y: number; z: number }[] {
  if (s.kind !== "arc") return [s.from, s.to];
  const zx = s.plane === 18;
  const u = (p: typeof s.from) => (zx ? p.z : p.x), v = (p: typeof s.from) => (zx ? p.x : p.y);
  const cu = u(s.center), cv = v(s.center);
  const a0 = Math.atan2(v(s.from) - cv, u(s.from) - cu), a1 = Math.atan2(v(s.to) - cv, u(s.to) - cu);
  const r = Math.hypot(v(s.from) - cv, u(s.from) - cu);
  // G18: oś Y wskazuje w drugą stronę niż w XY — kierunek obrotu w (Z, X) jest odwrócony
  const cw = zx ? !s.cw : s.cw;
  let sweep = cw ? a0 - a1 : a1 - a0;
  sweep = ((sweep % TAU) + TAU) % TAU;
  if (sweep < 1e-9) sweep = TAU;
  const da = cw ? -sweep : sweep;
  const n = Math.max(8, Math.ceil((Math.abs(da) / TAU) * 48));
  return Array.from({ length: n + 1 }, (_, k) => {
    const a = a0 + (da * k) / n, t = k / n;
    const pu = cu + r * Math.cos(a), pv = cv + r * Math.sin(a);
    return zx ? { x: pv, y: s.from.y, z: pu } : { x: pu, y: pv, z: s.from.z + (s.to.z - s.from.z) * t };
  });
}

/** Kolor ruchu z tekstu (stan modalny G0–G3 przenoszony na kolejne bloki z osiami). */
function colorize(src: string, opStarts: string[]): CodeLine[] {
  let modal: Kind | undefined;
  let op = -1;
  return src.split("\n").map((t) => {
    const k = opStarts.findIndex((s) => t.trim().startsWith(s));
    if (k >= 0) op = k;
    const code = t.replace(/\(.*?\)|;.*$/g, "");
    const g = [...code.matchAll(/\bG0?([0-3])(?!\d)/g)].at(-1)?.[1];
    if (g) modal = g === "0" ? "rapid" : g === "1" ? "linear" : "arc";
    if (/\bG8[0-9]\b|MCALL/.test(code)) modal = undefined;
    const moves = /(^|\s)[XYZ]-?[\d.]/.test(code) || !!g;
    return { t, k: moves && !/^\s*(T|M6|M06)/.test(code) ? modal : undefined, op: Math.max(op, 0) };
  });
}

function opIndex(lines: string[], starts: string[]) {
  return starts.map((s) => lines.findIndex((l) => l.trim().startsWith(s)));
}

function build(o: {
  key: string; name: string; sub: string; mode: "mill" | "lathe"; fanuc: string;
  ops: string[]; opNames: string[]; opTools: string[]; stock: HDetal["stock"];
}): HDetal {
  const lathe = o.mode === "lathe";
  const prog = parseProgram(o.fanuc, { diameterX: lathe });
  const fl = o.fanuc.split("\n");
  const fStart = opIndex(fl, o.ops);
  if (fStart.some((i) => i < 0)) throw new Error(`heroData ${o.key}: brak początku operacji`);
  const opOf = (line: number) => Math.max(0, fStart.filter((s) => s <= line).length - 1);

  // narzędzie operacji: ostatnie T przed jej początkiem (komentarz z FI<średnica>)
  let toolDia = 10;
  const toolAt: { line: number; dia: number }[] = [];
  fl.forEach((t, i) => {
    if (/^\s*T\d/.test(t)) {
      const d = /FI\s*([\d.]+)/.exec(t);
      toolDia = d ? Number(d[1]) : toolDia;
      toolAt.push({ line: i, dia: toolDia });
    }
  });
  const toolFor = (line: number) => [...toolAt].reverse().find((t) => t.line <= line) ?? toolAt[0];

  const segs: HSeg[] = [];
  for (const s of prog.segments as Segment[]) {
    if (s.kind === "dwell") continue;
    const pts: [number, number, number][] = sample(s).map((p) => (lathe ? [r3(p.z), r3(p.x), r3(p.z)] : [r3(p.x), r3(p.y), r3(p.z)]));
    const len = pts.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1], lathe ? 0 : p[2] - pts[i][2]), 0);
    if (len < 1e-6) continue;
    const kind = s.kind as Kind;
    const t = toolFor(s.line);
    const plunge = !lathe && kind === "linear" && s.from.x === s.to.x && s.from.y === s.to.y && s.to.z < 0;
    segs.push({
      kind, line: s.line, op: opOf(s.line), pts,
      w: (kind === "rapid" ? 0.3 : 1) * len + (plunge ? 6 : 0),
      cut: !lathe && kind !== "rapid" && s.from.z <= 0 && s.to.z <= 0 && !plunge,
      dia: t?.dia ?? 10,
      hole: plunge ? [r3(s.to.x), r3(s.to.y), (t?.dia ?? 10) / 2] : undefined,
    });
  }

  return {
    key: o.key, name: o.name, sub: o.sub, mode: o.mode, stock: o.stock,
    ops: fStart.map((line, k) => ({ name: o.opNames[k], tool: o.opTools[k], line })),
    code: colorize(o.fanuc, o.ops),
    segs,
    simHref: simHref({ src: o.fanuc, mode: o.mode, name: o.name }),
  };
}

export function heroDetale(): HDetal[] {
  return [
    build({
      key: "plytka", name: "Płytka mocująca 80 × 50", sub: "frezowanie · 2 narzędzia", mode: "mill",
      fanuc: HOME_DEMO, ops: HOME_DEMO_OPS,
      opNames: ["Kontur R10", "Kieszeń ⌀30", "Rowki", "Otwory G81"], opTools: ["frez ⌀10", "frez ⌀10", "frez ⌀10", "wiertło ⌀6"],
      stock: { x0: 0, y0: 0, x1: 80, y1: 50 },
    }),
    build({
      key: "walek", name: "Wałek stopniowany ⌀50", sub: "toczenie · nóż zewnętrzny", mode: "lathe",
      fanuc: WALEK, ops: WALEK_OPS,
      opNames: ["Zgrubnie", "Wykańczająco"], opTools: ["nóż zewnętrzny", "nóż zewnętrzny"],
      stock: { x0: -62, y0: 0, x1: 0, y1: 25 },
    }),
    build({
      key: "korpus", name: "Korpus z kieszenią i wyspą", sub: "frezowanie · 2 narzędzia", mode: "mill",
      fanuc: KORPUS, ops: KORPUS_OPS,
      opNames: ["Kieszeń z wyspą", "Otwory G81"], opTools: ["frez ⌀10", "wiertło ⌀6,8"],
      stock: { x0: 0, y0: 0, x1: 90, y1: 70 },
    }),
  ];
}
