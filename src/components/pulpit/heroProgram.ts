import { parseProgram, pointAt } from "@/lib/parser";

/*
  Program w animacji na pulpicie (V3.1): kontur 60 × 50 z zaokrągleniem R10, frez ⌀10, Fanuc.
  Tor i odczyty X/Y/Z liczy parser serwisu przy budowie strony — rysunek zawsze zgadza się z kodem.
  Program przechodzi walidator bez uwag (tests/pulpit.test.ts).
*/
export const HERO_SRC = `O0001 (KONTUR R10)
G21 G90 G17 G54
T1 M06
G43 H1 G00 Z50.
S4800 M03
X-10. Y-10.
Z5.
G01 Z-2. F300
G41 D1 X0. Y0. F600
Y40.
G02 X10. Y50. R10.
G01 X60.
Y0.
X-10.
G40 X-20. Y-10.
G00 Z50.
M30`;

export type MoveKind = "rapid" | "linear" | "arc";
export interface HeroLine {
  text: string;
  /** rodzaj ruchu w bloku (kolor jak w edytorze); brak — blok bez ruchu */
  kind?: MoveKind;
  /** tor w płaszczyźnie XY: punkty [x, y] w mm (pusty, gdy ruch tylko w Z) */
  pts: [number, number][];
  /** pozycja po bloku */
  pos: [number, number, number];
}

const r1 = (v: number) => Math.round(v * 100) / 100;

export function heroLines(src = HERO_SRC): HeroLine[] {
  const prog = parseProgram(src);
  let pos: [number, number, number] = [0, 0, 0];
  let seen = false;
  return src.split("\n").map((text, i) => {
    const segs = prog.segments.filter((s) => s.line === i && s.kind !== "dwell");
    const pts: [number, number][] = [];
    let kind: MoveKind | undefined;
    for (const s of segs) {
      kind = s.kind as MoveKind;
      const n = s.kind === "arc" ? 16 : 1;
      for (let k = 0; k <= n; k++) {
        const p = pointAt(s, k / n);
        if (k === 0 && pts.length) continue;
        pts.push([r1(p.x), r1(p.y)]);
      }
      pos = [r1(s.to.x), r1(s.to.y), r1(s.to.z)];
      seen = true;
    }
    // blok bez odcinka (np. dojazd na wysokość, na której narzędzie już jest) — kolor z kodu G w tekście
    if (!kind) { const g = /\bG0?([0-3])(?!\d)/.exec(text)?.[1]; if (g) kind = g === "0" ? "rapid" : g === "1" ? "linear" : "arc"; }
    // ruch tylko w Z nie zmienia rysunku z góry
    const flat = pts.length > 1 && pts.every(([x, y]) => x === pts[0][0] && y === pts[0][1]);
    return { text, kind, pts: flat ? [] : pts, pos: seen ? pos : [0, 0, 50] };
  });
}
