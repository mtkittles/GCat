import { arcParams, type Program, type Segment, type Vec3 } from "@/lib/parser";
import { cuttingRadius, toolOf, type Setup } from "./setup";

/*
  Kompensacja promienia narzędzia (G41/G42) liczona na potrzeby podglądu.
  Program opisuje kontur detalu, a sterownik prowadzi środek narzędzia po torze
  odsuniętym o promień. Poniższy kod odtwarza ten tor: każdy odcinek i łuk jest
  przesuwany o promień w bok, a sąsiednie elementy łączone w punkcie przecięcia,
  żeby nie zostawały szczeliny na narożach.
*/

const EPS = 1e-9;

/** Znak odsunięcia: G41 (lewa strona) to +90° od kierunku ruchu, G42 (prawa) to −90°. */
const side = (comp: 41 | 42) => (comp === 41 ? 1 : -1);

function offsetLinear(sg: Segment, r: number, comp: 41 | 42): Segment {
  const dx = sg.to.x - sg.from.x, dy = sg.to.y - sg.from.y;
  const len = Math.hypot(dx, dy);
  if (len < EPS) return sg;
  const s = side(comp) * r;
  // wektor prostopadły do kierunku ruchu (obrót o +90°)
  const nx = (-dy / len) * s, ny = (dx / len) * s;
  return { ...sg, from: { ...sg.from, x: sg.from.x + nx, y: sg.from.y + ny }, to: { ...sg.to, x: sg.to.x + nx, y: sg.to.y + ny } };
}

function offsetArc(sg: Extract<Segment, { kind: "arc" }>, r: number, comp: 41 | 42): Segment {
  const { start, sweep } = arcParams(sg);
  const R = Math.hypot(sg.from.x - sg.center.x, sg.from.y - sg.center.y);
  // Przy ruchu przeciwnym do wskazówek zegara lewa strona jest na zewnątrz łuku.
  const outward = sg.cw ? -side(comp) : side(comp);
  const R2 = Math.max(0.001, R + outward * r);
  const at = (ang: number): Vec3 => ({ x: sg.center.x + R2 * Math.cos(ang), y: sg.center.y + R2 * Math.sin(ang), z: 0 });
  const a = at(start), b = at(start + sweep);
  return { ...sg, from: { ...sg.from, x: a.x, y: a.y }, to: { ...sg.to, x: b.x, y: b.y } };
}

/** Przecięcie dwóch prostych zadanych odcinkami; null gdy równoległe. */
function intersect(a: Segment, b: Segment): { x: number; y: number } | null {
  const x1 = a.from.x, y1 = a.from.y, x2 = a.to.x, y2 = a.to.y;
  const x3 = b.from.x, y3 = b.from.y, x4 = b.to.x, y4 = b.to.y;
  const d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(d) < 1e-7) return null;
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / d;
  return { x: x1 + t * (x2 - x1), y: y1 + t * (y2 - y1) };
}

export interface CompResult {
  segments: Segment[];
  /** true, jeśli w programie w ogóle użyto G41/G42 */
  active: boolean;
}

/**
 * Zwraca tor środka narzędzia z uwzględnieniem G41/G42.
 * Zachowuje kolejność i przypisanie do linii, więc krokowanie i animacja działają bez zmian.
 */
export function applyCompensation(program: Program, setup: Setup, mode: "mill" | "lathe"): CompResult {
  if (mode !== "mill") return { segments: program.segments, active: false };

  const comps = program.segments.map((sg) => program.lines[sg.line]?.state.comp ?? 40);
  const active = comps.some((c) => c === 41 || c === 42);
  if (!active) return { segments: program.segments, active: false };

  const out = program.segments.map((sg, i) => {
    const c = comps[i];
    if (c === 40 || sg.kind === "rapid") return sg;
    const tool = toolOf(setup, program.lines[sg.line]?.state.tool ?? null, mode);
    const r = cuttingRadius(tool);
    if (r < EPS) return sg;
    return sg.kind === "arc" ? offsetArc(sg, r, c as 41 | 42) : offsetLinear(sg, r, c as 41 | 42);
  });

  // domknięcie naroży: sąsiednie odcinki spotykają się w punkcie przecięcia
  for (let i = 0; i < out.length - 1; i++) {
    const a = out[i], b = out[i + 1];
    if (comps[i] === 40 || comps[i + 1] === 40) continue;
    // Zmiana strony kompensacji: tor rzeczywiście przeskakuje na drugą stronę
    // konturu. Nie udajemy przecięcia — pokazujemy przeskok tak, jak wygląda.
    if (comps[i] !== comps[i + 1]) continue;
    if (a.kind === "rapid" || b.kind === "rapid") continue;
    const gap = Math.hypot(b.from.x - a.to.x, b.from.y - a.to.y);
    if (gap < 1e-6) continue;
    if (a.kind !== "arc" && b.kind !== "arc") {
      const p = intersect(a, b);
      if (p && Number.isFinite(p.x) && Number.isFinite(p.y)) {
        const jump = Math.hypot(p.x - a.to.x, p.y - a.to.y);
        // zbyt odległe przecięcie oznacza naroże ostrzejsze niż dopuszcza promień
        if (jump < 50) {
          out[i] = { ...a, to: { ...a.to, x: p.x, y: p.y } };
          out[i + 1] = { ...b, from: { ...b.from, x: p.x, y: p.y } };
          continue;
        }
      }
    }
    // naroże z łukiem albo przypadek zdegenerowany: łączymy punkty wprost
    const mx = (a.to.x + b.from.x) / 2, my = (a.to.y + b.from.y) / 2;
    out[i] = { ...a, to: { ...a.to, x: mx, y: my } };
    out[i + 1] = { ...b, from: { ...b.from, x: mx, y: my } };
  }

  return { segments: out, active: true };
}
