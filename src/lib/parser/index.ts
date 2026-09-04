import type {
  MachineState,
  ParsedLine,
  Plane,
  Program,
  Segment,
  Vec3,
  Word,
} from "./types";

export * from "./types";

export const initialState = (): MachineState => ({
  motion: null,
  plane: 17,
  absolute: true,
  units: "mm",
  feed: null,
  feedMode: 94,
  spindle: null,
  spindleOn: "off",
  coolant: false,
  tool: null,
  wcs: 54,
  comp: 40,
  pos: { x: 0, y: 0, z: 0 },
});

/** Rozbija linię na słowa (litera + liczba) i komentarz. */
export function tokenize(raw: string): { words: Word[]; comment: string | null } {
  let comment: string | null = null;
  let text = raw;
  const paren = text.match(/\(([^)]*)\)/);
  if (paren) {
    comment = paren[1].trim();
    text = text.replace(paren[0], " ");
  }
  const semi = text.indexOf(";");
  if (semi >= 0) {
    const c = text.slice(semi + 1).trim();
    if (c) comment = comment ? `${comment} ${c}` : c;
    text = text.slice(0, semi);
  }
  const words: Word[] = [];
  const re = /([A-Za-z])\s*([-+]?\d*\.?\d+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    words.push({ letter: m[1].toUpperCase(), value: parseFloat(m[2]), raw: m[0] });
  }
  return { words, comment };
}

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(3).replace(/0+$/, "").replace(/\.$/, ""));

const planeAxes = (p: Plane): [keyof Vec3, keyof Vec3, keyof Vec3] =>
  p === 17 ? ["x", "y", "z"] : p === 18 ? ["z", "x", "y"] : ["y", "z", "x"];

function arcCenter(
  from: Vec3,
  to: Vec3,
  words: Word[],
  plane: Plane,
  cw: boolean,
  errors: string[],
): Vec3 | null {
  const [a, b] = planeAxes(plane);
  const ijk: Record<keyof Vec3, string> = { x: "I", y: "J", z: "K" };
  const iw = words.find((w) => w.letter === ijk[a]);
  const jw = words.find((w) => w.letter === ijk[b]);
  const rw = words.find((w) => w.letter === "R");
  if (iw || jw) {
    return { ...from, [a]: from[a] + (iw?.value ?? 0), [b]: from[b] + (jw?.value ?? 0) };
  }
  if (rw) {
    const r = rw.value;
    const dx = to[a] - from[a];
    const dy = to[b] - from[b];
    const d = Math.hypot(dx, dy);
    if (d === 0) {
      errors.push("Łuk z R: punkt końcowy = początkowy (użyj I/J/K).");
      return null;
    }
    if (d > 2 * Math.abs(r) + 1e-6) {
      errors.push(`Promień R${fmt(r)} za mały — cięciwa ma ${fmt(d)}.`);
      return null;
    }
    const h = Math.sqrt(Math.max(0, r * r - (d / 2) ** 2));
    const mx = from[a] + dx / 2;
    const my = from[b] + dy / 2;
    // R>0: łuk ≤180°, R<0: łuk >180°
    let sign = cw ? -1 : 1;
    if (r < 0) sign = -sign;
    const cx = mx - (sign * h * dy) / d;
    const cy = my + (sign * h * dx) / d;
    return { ...from, [a]: cx, [b]: cy };
  }
  errors.push("Łuk wymaga I/J/K albo R.");
  return null;
}

const planeName = (p: Plane) => (p === 17 ? "XY" : p === 18 ? "ZX" : "YZ");

/** Interpretuje program (dialekt Fanuc/ISO) i zwraca segmenty ruchu + opis PL. */
export interface ParseOptions {
  /** Tokarka: X i I programowane średnicowo (Fanuc domyślnie). Geometria wewnętrzna liczona na promieniu. */
  diameterX?: boolean;
}

export function parseProgram(source: string, opts: ParseOptions = {}, start: MachineState = initialState()): Program {
  let state = start;
  const dia = !!opts.diameterX;
  const lines: ParsedLine[] = [];
  const allSegments: Segment[] = [];

  source.split(/\r?\n/).forEach((raw, index) => {
    const { words: rawWords, comment } = tokenize(raw);
    const words = dia ? rawWords.map((w) => (w.letter === "X" || w.letter === "I" || w.letter === "U" ? { ...w, value: w.value / 2 } : w)) : rawWords;
    const errors: string[] = [];
    const desc: string[] = [];
    const s: MachineState = { ...state, pos: { ...state.pos } };
    const segments: Segment[] = [];

    const gs = words.filter((w) => w.letter === "G").map((w) => w.value);
    const ms = words.filter((w) => w.letter === "M").map((w) => w.value);
    const get = (l: string) => words.find((w) => w.letter === l)?.value;

    if (ms.length > 1) errors.push("Tylko jedna funkcja M w bloku.");

    for (const g of gs) {
      switch (g) {
        case 0: case 1: case 2: case 3:
          s.motion = g as 0 | 1 | 2 | 3; break;
        case 4: desc.push(`Postój ${fmt(get("P") ?? get("X") ?? 0)} s (G04)`); break;
        case 17: case 18: case 19:
          s.plane = g as Plane; desc.push(`Płaszczyzna ${planeName(s.plane)} (G${g})`); break;
        case 20: s.units = "inch"; desc.push("Jednostki: cale (G20)"); break;
        case 21: s.units = "mm"; desc.push("Jednostki: mm (G21)"); break;
        case 28: desc.push("Powrót do punktu referencyjnego (G28)"); break;
        case 40: s.comp = 40; desc.push("Wyłącz kompensację promienia (G40)"); break;
        case 41: s.comp = 41; desc.push("Kompensacja promienia — lewa (G41)"); break;
        case 42: s.comp = 42; desc.push("Kompensacja promienia — prawa (G42)"); break;
        case 43: desc.push(`Korekcja długości narzędzia H${fmt(get("H") ?? 0)} (G43)`); break;
        case 49: desc.push("Wyłącz korekcję długości (G49)"); break;
        case 54: case 55: case 56: case 57: case 58: case 59:
          s.wcs = g; desc.push(`Układ współrzędnych G${g}`); break;
        case 80: desc.push("Anuluj cykl stały (G80)"); break;
        case 90: s.absolute = true; desc.push("Wymiarowanie absolutne (G90)"); break;
        case 91: s.absolute = false; desc.push("Wymiarowanie przyrostowe (G91)"); break;
        case 94: s.feedMode = 94; desc.push("Posuw w mm/min (G94)"); break;
        case 95: s.feedMode = 95; desc.push("Posuw w mm/obr (G95)"); break;
        case 96: desc.push(`Stała prędkość skrawania ${fmt(get("S") ?? 0)} m/min (G96)`); break;
        case 97: desc.push("Stałe obroty wrzeciona (G97)"); break;
        default: desc.push(`G${fmt(g)} — nieobsługiwane w symulatorze`);
      }
    }

    const f = get("F"); if (f !== undefined) { s.feed = f; }
    const sp = get("S"); if (sp !== undefined && !gs.includes(96)) { s.spindle = sp; }
    const t = get("T"); if (t !== undefined) { s.tool = t; desc.push(`Wybierz narzędzie T${fmt(t)}`); }

    for (const m of ms) {
      switch (m) {
        case 0: desc.push("Stop programu (M00)"); break;
        case 1: desc.push("Stop warunkowy (M01)"); break;
        case 2: desc.push("Koniec programu (M02)"); break;
        case 3: s.spindleOn = "cw"; desc.push(`Wrzeciono w prawo${s.spindle ? ` S${fmt(s.spindle)}` : ""} (M03)`); break;
        case 4: s.spindleOn = "ccw"; desc.push(`Wrzeciono w lewo${s.spindle ? ` S${fmt(s.spindle)}` : ""} (M04)`); break;
        case 5: s.spindleOn = "off"; desc.push("Stop wrzeciona (M05)"); break;
        case 6: desc.push("Wymiana narzędzia (M06)"); break;
        case 8: s.coolant = true; desc.push("Chłodziwo włączone (M08)"); break;
        case 9: s.coolant = false; desc.push("Chłodziwo wyłączone (M09)"); break;
        case 30: desc.push("Koniec programu i przewinięcie (M30)"); break;
        default: desc.push(`M${fmt(m)}`);
      }
    }

    // Ruch
    const hasAxis = ["X", "Y", "Z"].some((l) => get(l) !== undefined);
    if (hasAxis) {
      const target: Vec3 = { ...state.pos };
      (["x", "y", "z"] as const).forEach((ax) => {
        const v = get(ax.toUpperCase());
        if (v !== undefined) target[ax] = s.absolute ? v : state.pos[ax] + v;
      });
      const from = { ...state.pos };
      if (s.motion === null) {
        errors.push("Brak aktywnej funkcji ruchu (G00/G01/G02/G03).");
      } else if (s.motion === 0) {
        segments.push({ kind: "rapid", from, to: target, line: index });
        desc.push(`Szybki dojazd do ${pt(target, s.plane, dia)}`);
      } else if (s.motion === 1) {
        if (s.feed === null) errors.push("G01 bez posuwu F.");
        segments.push({ kind: "linear", from, to: target, line: index });
        desc.push(`Ruch liniowy do ${pt(target, s.plane, dia)}${s.feed ? ` z posuwem F${fmt(s.feed)}` : ""}`);
      } else {
        const cw = s.motion === 2;
        const center = arcCenter(from, target, words, s.plane, cw, errors);
        if (center) {
          segments.push({ kind: "arc", from, to: target, center, cw, plane: s.plane, line: index });
          const [a, b] = planeAxes(s.plane);
          const r = Math.hypot(from[a] - center[a], from[b] - center[b]);
          desc.push(`Łuk ${cw ? "zgodnie" : "przeciwnie"} z ruchem wskazówek do ${pt(target, s.plane, dia)}, R=${fmt(r)}`);
        }
      }
      s.pos = target;
    } else if (s.motion !== null && gs.some((g) => g <= 3) && desc.length === 0) {
      desc.push(`Tryb ruchu G0${s.motion} (modalny)`);
    }

    if (desc.length === 0 && words.length === 0) desc.push(comment ? `Komentarz: ${comment}` : "");
    if (desc.length === 0 && words.length > 0 && words.every((w) => w.letter === "N" || w.letter === "O"))
      desc.push(words[0].letter === "O" ? `Program O${fmt(words[0].value)}` : "");

    lines.push({ index, raw, words, comment, segments, state: s, description: desc.filter(Boolean).join(" · "), errors });
    allSegments.push(...segments);
    state = s;
  });

  const bounds = computeBounds(allSegments);
  return { lines, segments: allSegments, bounds };
}

function pt(p: Vec3, plane: Plane, dia = false) {
  const [a, b, c] = planeAxes(plane);
  const v = (k: keyof Vec3) => fmt(dia && k === "x" ? p[k] * 2 : p[k]);
  if (plane === 18) return `X${v("x")} Z${v("z")}`;
  return `${a.toUpperCase()}${v(a)} ${b.toUpperCase()}${v(b)} ${c.toUpperCase()}${v(c)}`;
}

function computeBounds(segments: Segment[]) {
  const min: Vec3 = { x: 0, y: 0, z: 0 };
  const max: Vec3 = { x: 0, y: 0, z: 0 };
  const add = (p: Vec3) => {
    (["x", "y", "z"] as const).forEach((k) => {
      min[k] = Math.min(min[k], p[k]);
      max[k] = Math.max(max[k], p[k]);
    });
  };
  for (const sg of segments) {
    add(sg.from); add(sg.to);
    if (sg.kind === "arc") {
      const [a, b] = planeAxes(sg.plane);
      const r = Math.hypot(sg.from[a] - sg.center[a], sg.from[b] - sg.center[b]);
      add({ ...sg.center, [a]: sg.center[a] - r, [b]: sg.center[b] - r });
      add({ ...sg.center, [a]: sg.center[a] + r, [b]: sg.center[b] + r });
    }
  }
  return { min, max };
}

/** Punkt na segmencie dla t∈[0,1] — do animacji. */
export function pointAt(sg: Segment, t: number): Vec3 {
  if (sg.kind !== "arc") {
    return {
      x: sg.from.x + (sg.to.x - sg.from.x) * t,
      y: sg.from.y + (sg.to.y - sg.from.y) * t,
      z: sg.from.z + (sg.to.z - sg.from.z) * t,
    };
  }
  const [a, b, c] = planeAxes(sg.plane);
  const { start, sweep, r } = arcParams(sg);
  const ang = start + sweep * t;
  const p: Vec3 = { x: 0, y: 0, z: 0 };
  p[a] = sg.center[a] + r * Math.cos(ang);
  p[b] = sg.center[b] + r * Math.sin(ang);
  p[c] = sg.from[c] + (sg.to[c] - sg.from[c]) * t;
  return p;
}

export function arcParams(sg: Extract<Segment, { kind: "arc" }>) {
  const [a, b] = planeAxes(sg.plane);
  const r = Math.hypot(sg.from[a] - sg.center[a], sg.from[b] - sg.center[b]);
  const start = Math.atan2(sg.from[b] - sg.center[b], sg.from[a] - sg.center[a]);
  const end = Math.atan2(sg.to[b] - sg.center[b], sg.to[a] - sg.center[a]);
  let sweep = end - start;
  const full = Math.abs(sg.from[a] - sg.to[a]) < 1e-9 && Math.abs(sg.from[b] - sg.to[b]) < 1e-9;
  if (sg.cw) {
    if (sweep >= -1e-9) sweep -= 2 * Math.PI;
  } else {
    if (sweep <= 1e-9) sweep += 2 * Math.PI;
  }
  if (full) sweep = sg.cw ? -2 * Math.PI : 2 * Math.PI;
  return { start, sweep, r };
}

export function segmentLength(sg: Segment) {
  if (sg.kind !== "arc") return Math.hypot(sg.to.x - sg.from.x, sg.to.y - sg.from.y, sg.to.z - sg.from.z);
  const { sweep, r } = arcParams(sg);
  return Math.abs(sweep) * r;
}

export { planeAxes };
