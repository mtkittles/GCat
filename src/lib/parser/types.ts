export type Vec3 = { x: number; y: number; z: number };

export type Plane = 17 | 18 | 19;

export interface CannedCycle {
  code: number;        // 73, 81, 82, 83, 84, 85, 86, 89
  z: number;           // dno otworu
  r: number;           // płaszczyzna R
  q: number | null;    // głębokość zagłębienia (G73/G83)
  p: number | null;    // postój [ms]
  f: number | null;    // posuw
  retract: 98 | 99;    // powrót do punktu początkowego / do R
  initialZ: number;    // Z przed rozpoczęciem cyklu
}

export interface MachineState {
  motion: 0 | 1 | 2 | 3 | null;
  plane: Plane;
  absolute: boolean;
  units: "mm" | "inch";
  feed: number | null;
  feedMode: 94 | 95;
  spindle: number | null;
  /** Tokarka: stała prędkość skrawania G96 [m/min] i limit obrotów G50. */
  css?: number | null;
  maxRpm?: number | null;
  spindleOn: "cw" | "ccw" | "off";
  coolant: boolean;
  tool: number | null;
  /**
   * Aktywny układ współrzędnych: 54–59 (G54–G59), 54.1 (G54.1 P — numer w `wcsP`),
   * Sinumerik: 500 (G500 — bez przesunięcia bazowego), 505–599 (G505–G599).
   */
  wcs: number;
  /** Numer P dla G54.1 (1–48); null dla pozostałych układów. */
  wcsP: number | null;
  /**
   * Tabela przesunięć układów (jak w sterowniku): klucze "ext" (G10 L2 P0), "54"…"59",
   * "p1"…"p48" (G54.1), "505"…"599". Brak klucza = zero. Zapis przez G10 L2 / L20.
   */
  offsets: Readonly<Record<string, Vec3>>;
  comp: 40 | 41 | 42;
  cycle: CannedCycle | null;
  /** Obrót układu G68: kąt w stopniach i środek; null gdy G69. */
  rot: { deg: number; cx: number; cy: number } | null;
  /** Przesunięcie lokalne G52 względem aktywnego układu. */
  local: Vec3;
  /** Przesunięcie G92 (frezarka): „bieżący punkt ma mieć te współrzędne”; kasowane przez G92.1. */
  shift: Vec3;
  /** Ramka programowalna Sinumerik TRANS (zastępuje) / ATRANS (dodaje). */
  frame: Vec3;
  /**
   * Pozycja maszynowa — używana do rysowania toru.
   * pos = prog + offsets[wcs] + local (G52) + shift (G92) + frame (TRANS), potem obrót G68.
   */
  pos: Vec3;
  /** Pozycja w układzie programu, przed przesunięciem i obrotem. */
  prog: Vec3;
  /** Tokarka Fanuc (system A): aktywny cykl pojedynczy G90/G92/G94 i jego ostatni punkt końcowy. */
  lcycle?: { code: 90 | 92 | 94; end: Vec3; r: number } | null;
  /** Współrzędne biegunowe G16: promień i kąt zapamiętane modalnie. */
  polar?: { r: number; a: number } | null;
  /** Osie obrotowe A/B/C [°] — pozycja zapamiętana; geometria toru jest liczona dla osi liniowych. */
  rotary?: { a?: number; b?: number; c?: number } | null;
}

export interface Word {
  letter: string;
  value: number;
  raw: string;
}

export type Segment =
  | { kind: "rapid"; from: Vec3; to: Vec3; line: number }
  | { kind: "linear"; from: Vec3; to: Vec3; line: number }
  | {
      kind: "arc";
      from: Vec3;
      to: Vec3;
      center: Vec3;
      cw: boolean;
      plane: Plane;
      line: number;
    }
  /** Postój (G04): brak ruchu, from i to to ten sam punkt. `seconds` to realny czas z programu,
      niezależny od geometrii — używany zarówno do statystyk, jak i do tego, żeby odtwarzacz
      rzeczywiście się na nim zatrzymał. */
  | { kind: "dwell"; from: Vec3; to: Vec3; seconds: number; line: number };

export interface ParsedLine {
  index: number;
  raw: string;
  words: Word[];
  comment: string | null;
  segments: Segment[];
  state: MachineState;
  description: string;
  errors: string[];
}

export interface Program {
  lines: ParsedLine[];
  /** Szacowany czas cyklu w sekundach (posuwy + przejazdy + postoje). */
  seconds: number;
  segments: Segment[];
  bounds: { min: Vec3; max: Vec3 };
}
