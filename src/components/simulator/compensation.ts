import type { Program, Segment, Vec3 } from "@/lib/parser";
import { cuttingRadius, isLatheTool, toolOf, type Setup, type Tool } from "./setup";

/*
  Kompensacja promienia (G41/G42) liczona na potrzeby podglądu.

  Frezarka: program opisuje kontur detalu, a sterownik prowadzi środek freza
  po torze odsuniętym o promień.

  Tokarka: program opisuje kontur, a nóż jest zmierzony do teoretycznego
  wierzchołka P. Sterownik prowadzi środek naroża w odległości rε od konturu,
  a punkt P — przesunięty względem środka zgodnie z kierunkiem ostrza.
  Podgląd pokazuje tor punktu P, tak jak jedzie maszyna.

  Każdy odcinek i łuk jest przesuwany w bok, sąsiednie elementy łączone
  w punkcie przecięcia, a ruchy włączające i wyłączające korekcję dochodzą
  do toru bez skoków.
*/

const EPS = 1e-9;

type Key = "x" | "y" | "z";
interface Plane { h: Key; v: Key }
const MILL: Plane = { h: "x", v: "y" };
const LATHE: Plane = { h: "z", v: "x" };

/** Znak odsunięcia: G41 (lewa strona) to +90° od kierunku ruchu, G42 (prawa) to −90°. */
const side = (comp: 41 | 42) => (comp === 41 ? 1 : -1);

/** Kierunek ostrza 0–9 → położenie punktu P względem środka naroża, w osiach (Z, X). */
const TIP: Record<number, [number, number]> = {
  1: [1, 1], 2: [-1, 1], 3: [-1, -1], 4: [1, -1], 5: [1, 0], 6: [0, 1], 7: [-1, 0], 8: [0, -1],
};
export const defaultTip = (t: Tool) => (t.kind === "boring" ? 2 : t.kind === "threading" ? 8 : 3);

/** Naroże noża tokarskiego: promień i wektor środek → P (w osiach Z, X). Null, gdy nóż nie ma naroża do korekcji. */
export function noseOf(t: Tool): { r: number; tz: number; tx: number } | null {
  if (t.kind !== "turning" && t.kind !== "boring") return null;
  const r = t.d;
  if (!(r > 0)) return null;
  const tip = Number.isFinite(t.tip) ? Math.round(t.tip as number) : defaultTip(t);
  const [dz, dx] = TIP[tip] ?? [0, 0];
  return { r, tz: dz * r, tx: dx * r };
}

function offsetLinear(sg: Segment, r: number, comp: 41 | 42, P: Plane, sh: [number, number]): Segment {
  const dh = sg.to[P.h] - sg.from[P.h], dv = sg.to[P.v] - sg.from[P.v];
  const len = Math.hypot(dh, dv);
  if (len < EPS) return sg;
  const s = side(comp) * r;
  // wektor prostopadły do kierunku ruchu (obrót o +90°) plus przesunięcie środek → P
  const nh = (-dv / len) * s + sh[0], nv = (dh / len) * s + sh[1];
  return {
    ...sg,
    from: { ...sg.from, [P.h]: sg.from[P.h] + nh, [P.v]: sg.from[P.v] + nv },
    to: { ...sg.to, [P.h]: sg.to[P.h] + nh, [P.v]: sg.to[P.v] + nv },
  };
}

function offsetArc(sg: Extract<Segment, { kind: "arc" }>, r: number, comp: 41 | 42, P: Plane, sh: [number, number]): Segment {
  const ch = sg.center[P.h], cv = sg.center[P.v];
  const R = Math.hypot(sg.from[P.h] - ch, sg.from[P.v] - cv);
  const a0 = Math.atan2(sg.from[P.v] - cv, sg.from[P.h] - ch);
  const a1 = Math.atan2(sg.to[P.v] - cv, sg.to[P.h] - ch);
  // Przy ruchu przeciwnym do zegara środek łuku leży po lewej: G41 zmniejsza promień, G42 zwiększa.
  // Przy ruchu zgodnym z zegarem — odwrotnie.
  const R2 = Math.max(0.001, R + (sg.cw ? side(comp) : -side(comp)) * r);
  const at = (base: Vec3, a: number): Vec3 => ({ ...base, [P.h]: ch + R2 * Math.cos(a) + sh[0], [P.v]: cv + R2 * Math.sin(a) + sh[1] });
  return { ...sg, from: at(sg.from, a0), to: at(sg.to, a1), center: { ...sg.center, [P.h]: ch + sh[0], [P.v]: cv + sh[1] } };
}

/** Przecięcie dwóch prostych zadanych odcinkami; null gdy równoległe. */
function intersect(a: Segment, b: Segment, P: Plane): { h: number; v: number } | null {
  const x1 = a.from[P.h], y1 = a.from[P.v], x2 = a.to[P.h], y2 = a.to[P.v];
  const x3 = b.from[P.h], y3 = b.from[P.v], x4 = b.to[P.h], y4 = b.to[P.v];
  const d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(d) < 1e-7) return null;
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / d;
  return { h: x1 + t * (x2 - x1), v: y1 + t * (y2 - y1) };
}

export interface CompResult {
  segments: Segment[];
  /** true, jeśli w programie w ogóle użyto G41/G42 */
  active: boolean;
}

/**
 * Zwraca tor z uwzględnieniem G41/G42: środek freza na frezarce, punkt P ostrza na tokarce.
 * Zachowuje kolejność i przypisanie do linii, więc krokowanie i animacja działają bez zmian.
 */
export function applyCompensation(program: Program, setup: Setup, mode: "mill" | "lathe"): CompResult {
  const P = mode === "mill" ? MILL : LATHE;
  const plane = mode === "mill" ? 17 : 18;
  const comps = program.segments.map((sg) => program.lines[sg.line]?.state.comp ?? 40);
  const active = comps.some((c) => c === 41 || c === 42);
  if (!active) return { segments: program.segments, active: false };

  const moved = program.segments.map(() => false);
  const out = program.segments.map((sg, i) => {
    const c = comps[i];
    if (c === 40 || sg.kind === "rapid" || sg.kind === "dwell") return sg;
    if (sg.kind === "arc" && sg.plane !== plane) return sg;
    const tool = toolOf(setup, program.lines[sg.line]?.state.tool ?? null, mode);
    let r = 0, sh: [number, number] = [0, 0];
    if (mode === "mill") {
      if (isLatheTool(tool.kind)) return sg;
      r = cuttingRadius(tool);
    } else {
      const nose = noseOf(tool);
      if (!nose) return sg;
      r = nose.r; sh = [nose.tz, nose.tx];
    }
    if (r < EPS) return sg;
    moved[i] = true;
    return sg.kind === "arc" ? offsetArc(sg, r, c as 41 | 42, P, sh) : offsetLinear(sg, r, c as 41 | 42, P, sh);
  });

  // domknięcie naroży: sąsiednie odcinki spotykają się w punkcie przecięcia
  const gapOf = (a: Segment, b: Segment) => Math.hypot(b.from[P.h] - a.to[P.h], b.from[P.v] - a.to[P.v]);
  for (let i = 0; i < out.length - 1; i++) {
    if (!moved[i] || !moved[i + 1]) continue;
    // Zmiana strony kompensacji: tor rzeczywiście przeskakuje na drugą stronę konturu.
    if (comps[i] !== comps[i + 1]) continue;
    const a = out[i], b = out[i + 1];
    if (gapOf(a, b) < 1e-6) continue;
    if (a.kind !== "arc" && b.kind !== "arc") {
      const p = intersect(a, b, P);
      if (p && Number.isFinite(p.h) && Number.isFinite(p.v)) {
        const jump = Math.hypot(p.h - a.to[P.h], p.v - a.to[P.v]);
        // zbyt odległe przecięcie oznacza naroże ostrzejsze niż dopuszcza promień
        if (jump < 50) {
          out[i] = { ...a, to: { ...a.to, [P.h]: p.h, [P.v]: p.v } };
          out[i + 1] = { ...b, from: { ...b.from, [P.h]: p.h, [P.v]: p.v } };
          continue;
        }
      }
    }
    // naroże z łukiem albo przypadek zdegenerowany: łączymy punkty wprost
    const mh = (a.to[P.h] + b.from[P.h]) / 2, mv = (a.to[P.v] + b.from[P.v]) / 2;
    out[i] = { ...a, to: { ...a.to, [P.h]: mh, [P.v]: mv } };
    out[i + 1] = { ...b, from: { ...b.from, [P.h]: mh, [P.v]: mv } };
  }

  // ruchy włączające i wyłączające korekcję dochodzą do toru bez skoków
  for (let i = 0; i < out.length; i++) {
    const cur = out[i];
    // ruch szybki przy aktywnej korekcji kończy się tam, gdzie zaczyna się przesunięty tor
    if (!moved[i] && i + 1 < out.length && moved[i + 1] && comps[i] !== 40 && gapOf(cur, out[i + 1]) > 1e-6) {
      out[i] = { ...cur, to: { ...cur.to, [P.h]: out[i + 1].from[P.h], [P.v]: out[i + 1].from[P.v] } };
    }
    // pierwszy przesunięty odcinek po G40 startuje z punktu, w którym nóż stoi
    if (moved[i] && i > 0 && comps[i - 1] === 40) {
      const prev = out[i - 1];
      out[i] = { ...out[i], from: { ...out[i].from, [P.h]: prev.to[P.h], [P.v]: prev.to[P.v] } };
    }
    // ruch po przesuniętym torze (odjazd, G40) zaczyna się w jego końcu
    if (!moved[i] && i > 0 && moved[i - 1] && gapOf(out[i - 1], out[i]) > 1e-6) {
      out[i] = { ...out[i], from: { ...out[i].from, [P.h]: out[i - 1].to[P.h], [P.v]: out[i - 1].to[P.v] } };
    }
  }

  return { segments: out, active: true };
}
