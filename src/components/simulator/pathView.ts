/*
  Warstwy podglądu symulatora — jak w programach CAM: tryb „Tor” (sam tor, bez materiału)
  i tryb „Materiał” (ubytek materiału, tor ograniczony do śladu za narzędziem).
  Czyste funkcje: wspólne dla podglądu 2D (kanwa) i 3D (three.js), sprawdzane w tests/path-view.test.ts.
*/

/** Która część toru jest widoczna. */
export type PathMode = "all" | "done" | "tail" | "tool" | "none";
/** Kolor toru: wg rodzaju ruchu (G00/G01/G02-G03) albo wg narzędzia. */
export type ColorBy = "move" | "tool";

export interface PathView {
  /** warstwa materiału (tryb „Materiał”); false = tryb „Tor” */
  stock: boolean;
  path: PathMode;
  /** ruchy szybkie G00 */
  rapid: boolean;
  color: ColorBy;
  /** obrobione miejsca cieniowane głębokością (false = zdjęty materiał znika) */
  depth: boolean;
}

/** Tryb „Tor”: cały tor z G00, bez materiału. */
export const VIEW_BACKPLOT: PathView = { stock: false, path: "all", rapid: true, color: "move", depth: true };
/** Tryb „Materiał”: ubytek z cieniowaniem głębokości, tor tylko jako ślad za narzędziem, bez G00. */
export const VIEW_MATERIAL: PathView = { stock: true, path: "tail", rapid: false, color: "move", depth: true };
/** „Czysty widok”: sam materiał i narzędzie. */
export const VIEW_CLEAN: PathView = { stock: true, path: "none", rapid: false, color: "move", depth: true };
/** Symulator w lekcjach i zadaniach: materiał i cały tor (jak dotąd). */
export const VIEW_LESSON: PathView = { stock: true, path: "all", rapid: true, color: "move", depth: true };

export const PATH_MODES: { value: PathMode; label: string; hint: string }[] = [
  { value: "all", label: "Cały", hint: "Cały tor programu, wykonana część wyraźniej" },
  { value: "done", label: "Wykonany", hint: "Tylko droga, którą narzędzie już przeszło" },
  { value: "tail", label: "Ślad", hint: "Ostatni odcinek drogi za narzędziem" },
  { value: "tool", label: "Narzędzie", hint: "Tor bieżącego narzędzia" },
  { value: "none", label: "Brak", hint: "Bez toru — sam materiał i narzędzie" },
];

/** Uzupełnia ustawienia zapisane w przeglądarce (stary zapis, brak pól, złe wartości). */
export function normalizeView(v: unknown, base: PathView = VIEW_MATERIAL): PathView {
  if (!v || typeof v !== "object") return base;
  const o = v as Partial<Record<keyof PathView, unknown>>;
  return {
    stock: typeof o.stock === "boolean" ? o.stock : base.stock,
    path: PATH_MODES.some((m) => m.value === o.path) ? (o.path as PathMode) : base.path,
    rapid: typeof o.rapid === "boolean" ? o.rapid : base.rapid,
    color: o.color === "tool" || o.color === "move" ? o.color : base.color,
    depth: typeof o.depth === "boolean" ? o.depth : base.depth,
  };
}

/** Długość śladu za narzędziem [mm drogi]: 6% programu, w granicach 40–400 mm. */
export function tailLength(total: number): number {
  return Math.min(400, Math.max(40, total * 0.06));
}

/** Przedział drogi [od, do] w mm od początku programu. */
export type Span = readonly [number, number];

/**
 * Widoczne części toru: `ghost` — przygaszony tor (jeszcze nie wykonany), `done` — wykonany.
 * `tool` — droga bieżącego narzędzia (z {@link toolSpanAt}).
 */
export function pathWindow(mode: PathMode, progress: number, total: number, tool: Span | null): { ghost: Span | null; done: Span | null } {
  const p = Math.min(Math.max(progress, 0), total);
  switch (mode) {
    case "all": return { ghost: [0, total], done: p > 0 ? [0, p] : null };
    case "done": return { ghost: null, done: p > 0 ? [0, p] : null };
    case "tail": return { ghost: null, done: p > 0 ? [Math.max(0, p - tailLength(total)), p] : null };
    case "tool": {
      if (!tool) return { ghost: null, done: null };
      const d1 = Math.min(p, tool[1]);
      return { ghost: tool, done: d1 > tool[0] ? [tool[0], d1] : null };
    }
    default: return { ghost: null, done: null };
  }
}

/**
 * Droga bieżącego narzędzia: ciągły ciąg odcinków z tym samym numerem narzędzia
 * co odcinek pod `progress` (po wymianie narzędzia zaczyna się nowy ciąg).
 */
export function toolSpanAt(lengths: number[], toolOf: (i: number) => number | null, progress: number): Span | null {
  const n = lengths.length;
  if (!n) return null;
  const starts: number[] = new Array(n);
  let acc = 0, cur = n - 1;
  for (let i = 0; i < n; i++) { starts[i] = acc; if (progress >= acc && (progress < acc + lengths[i] || i === n - 1)) cur = Math.min(cur, i); acc += lengths[i]; }
  const t = toolOf(cur);
  let a = cur, b = cur;
  while (a > 0 && toolOf(a - 1) === t) a--;
  while (b < n - 1 && toolOf(b + 1) === t) b++;
  return [starts[a], starts[b] + lengths[b]];
}

/** Część odcinka [s0, s0+len] w przedziale `w`, jako ułamki długości odcinka; null = poza. */
export function segPart(s0: number, len: number, w: Span): readonly [number, number] | null {
  const a = Math.max(w[0], s0), b = Math.min(w[1], s0 + len);
  if (b < a || (b === a && len > 0)) return null;
  if (len <= 0) return [0, 1];
  return [(a - s0) / len, (b - s0) / len];
}

/**
 * Kolory narzędzi — z barw, których serwis już używa (ruchy, kod, wzorzec zadania),
 * w kolejności numerów narzędzi.
 */
export const TOOL_COLORS = ["#22C55E", "#38BDF8", "#F97316", "#A78BFA", "#F9A8D4", "#67E8F9", "#FBBF24", "#86EFAC"] as const;
export function toolColor(tool: number | null): string {
  if (tool == null || !Number.isFinite(tool)) return "#94A3B8";
  return TOOL_COLORS[((Math.round(tool) - 1) % TOOL_COLORS.length + TOOL_COLORS.length) % TOOL_COLORS.length];
}

/** Barwa powierzchni nieobrobionej i najgłębszej (szarości łupka; im głębiej, tym ciemniej). */
/* Wierzch półfabrykatu w ciemnym, chłodnym tonie stali (V5): jasnoszary #B0BDCE był najjaśniejszą plamą ekranu
   i zagłuszał tor. Dno wybrań ciemnieje z głębokością jak dotąd (legenda „Głębokość”). */
export const DEPTH_TOP = [92, 101, 115] as const;
export const DEPTH_DEEP = [30, 35, 45] as const;

/**
 * Cieniowanie głębokości: barwa dna wybrania na wysokości `z` dla półfabrykatu `top…bottom`.
 * Skala od góry półfabrykatu do najgłębszego miejsca programu `deep` (domyślnie dół półfabrykatu) —
 * płytkie wybrania nie giną w grubym półfabrykacie.
 * null — ruch nad materiałem (nic nie zbiera); "through" — przejście na wylot.
 * Kanały maleją razem z z, więc nakładanie trybem „darken” zostawia najgłębszy ślad.
 */
export function depthShade(z: number, top: number, bottom: number, deep: number = bottom): string | "through" | null {
  const eps = 1e-6;
  if (!(top > bottom) || z >= top - eps) return null;
  if (z <= bottom + eps) return "through";
  const lo = Math.min(top - eps, Math.max(bottom, deep));
  const t = Math.min(1, (top - z) / (top - lo));
  const c = DEPTH_TOP.map((v, i) => Math.round(v + (DEPTH_DEEP[i] - v) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

/** Najgłębsze miejsce ruchów roboczych w półfabrykacie (do skali cieniowania); bez wybrań — dół półfabrykatu. */
export function deepestCut(zs: Iterable<number>, top: number, bottom: number): number {
  let d = Infinity;
  for (const z of zs) if (z < top && z < d) d = z;
  return d === Infinity ? bottom : Math.max(bottom, d);
}
