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
  spindleOn: "cw" | "ccw" | "off";
  coolant: boolean;
  tool: number | null;
  wcs: number; // 54..59
  comp: 40 | 41 | 42;
  cycle: CannedCycle | null;
  pos: Vec3;
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
    };

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
