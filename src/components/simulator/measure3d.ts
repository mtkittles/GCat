/*
  Wymiarowanie na bryle 3D (jak pomiar w CAD). Punkty wskazane na powierzchni detalu niosą normalną ściany.
  • Odległość: między ścianami równoległymi — prostopadle do nich; inaczej odległość punktów
    i odległość drugiego punktu od płaszczyzny pierwszej ściany. Środek okręgu też jest punktem.
  • Kąt: między dwiema ścianami (kąt normalnych) i jego dopełnienie.
  • Okrąg z 3 punktów: na krawędzi albo na ściance otworu (oś z normalnych ścianki) — ⌀, R, środek, oś.
  Współrzędne w układzie sceny (three: Y w górę); opisy przeliczane na osie programu.
*/

export type P3 = { x: number; y: number; z: number };
export type Pick3 = { p: P3; n: P3; center?: boolean };
export type M3 =
  | { kind: "dist"; a: Pick3; b: Pick3 }
  | { kind: "ang"; a: Pick3; b: Pick3 }
  | { kind: "circ"; pts: P3[]; c: P3; r: number; ax: P3; wall: boolean };
export type Tool3 = "dist" | "ang" | "circ";

export const v3 = {
  sub: (a: P3, b: P3): P3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }),
  add: (a: P3, b: P3): P3 => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }),
  mul: (a: P3, k: number): P3 => ({ x: a.x * k, y: a.y * k, z: a.z * k }),
  dot: (a: P3, b: P3) => a.x * b.x + a.y * b.y + a.z * b.z,
  cross: (a: P3, b: P3): P3 => ({ x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x }),
  len: (a: P3) => Math.hypot(a.x, a.y, a.z),
  unit: (a: P3): P3 => { const l = Math.hypot(a.x, a.y, a.z) || 1; return { x: a.x / l, y: a.y / l, z: a.z / l }; },
};

const COS_PAR = Math.cos((3 * Math.PI) / 180);

/** Normalna bliska osi (do 2°) — dokładnie na osi: ściany obrobione równolegle do osi maszyny. */
export function snapAxis(n: P3): P3 {
  const u = v3.unit(n), c = Math.cos((2 * Math.PI) / 180);
  for (const k of ["x", "y", "z"] as const) if (Math.abs(u[k]) >= c) return { x: 0, y: 0, z: 0, [k]: Math.sign(u[k]) } as P3;
  return u;
}

/** Odległość: prosta, prostopadła do płaszczyzny ściany a; `par` — ściany równoległe. */
export function distOf(a: Pick3, b: Pick3) {
  const d = v3.sub(b.p, a.p);
  const par = !a.center && !b.center && Math.abs(v3.dot(a.n, b.n)) >= COS_PAR;
  const perp = v3.dot(d, a.n);
  return { L: v3.len(d), d, par, perp: Math.abs(perp), foot: v3.add(a.p, v3.mul(a.n, perp)) };
}

/** Kąt między ścianami (normalnymi) w stopniach. */
export function angOf(a: Pick3, b: Pick3) {
  const c = Math.max(-1, Math.min(1, v3.dot(v3.unit(a.n), v3.unit(b.n))));
  return (Math.acos(c) * 180) / Math.PI;
}

/** Okrąg przez trzy punkty (null — punkty współliniowe). */
export function circle3(p1: P3, p2: P3, p3: P3): { c: P3; r: number; ax: P3 } | null {
  const ab = v3.sub(p2, p1), ac = v3.sub(p3, p1);
  const n = v3.cross(ab, ac), n2 = v3.dot(n, n);
  if (n2 < 1e-9) return null;
  const t = v3.add(v3.mul(v3.cross(n, ab), v3.dot(ac, ac)), v3.mul(v3.cross(ac, n), v3.dot(ab, ab)));
  const c = v3.add(p1, v3.mul(t, 1 / (2 * n2)));
  return { c, r: v3.len(v3.sub(c, p1)), ax: v3.unit(n) };
}

/**
 * Okrąg z trzech wskazań. Gdy punkty leżą na ściance otworu / walca (normalne prostopadłe do wspólnej osi),
 * oś to iloczyn normalnych, a punkty rzutujemy na płaszczyznę prostopadłą do osi — wysokość wskazania nie ma znaczenia.
 */
export function circleOf(ps: Pick3[]): Extract<M3, { kind: "circ" }> | null {
  if (ps.length < 3) return null;
  const [a, b, c] = ps;
  const ax0 = v3.cross(a.n, b.n);
  if (v3.len(ax0) > 0.2) {
    const ax = snapAxis(ax0);
    if ([a, b, c].every((q) => Math.abs(v3.dot(q.n, ax)) < 0.17)) {
      const flat = (q: P3) => v3.sub(q, v3.mul(ax, v3.dot(v3.sub(q, a.p), ax)));
      const k = circle3(a.p, flat(b.p), flat(c.p));
      if (k) return { kind: "circ", pts: [a.p, b.p, c.p], c: k.c, r: k.r, ax, wall: true };
    }
  }
  const k = circle3(a.p, b.p, c.p);
  return k ? { kind: "circ", pts: [a.p, b.p, c.p], c: k.c, r: k.r, ax: snapAxis(k.ax), wall: false } : null;
}

const f3 = (v: number) => (Math.abs(v) < 5e-4 ? 0 : v).toFixed(3);

/** Wektor sceny → osie programu: frezarka X = x, Y = −z, Z = y; tokarka Z = x (X jako średnica). */
function prog(p: P3, lathe: boolean) {
  return lathe ? { Z: p.x, X: 2 * Math.hypot(p.y, p.z) } : { X: p.x, Y: -p.z, Z: p.y };
}
const fmtP = (p: P3, lathe: boolean) => Object.entries(prog(p, lathe)).map(([k, v]) => `${k}${f3(v)}`).join(" ");

/** Opis wymiaru 3D: wartość na scenie i szczegóły w liście. */
export function m3Text(m: M3, lathe: boolean): { main: string; sub: string } {
  if (m.kind === "circ") {
    const ax = `(${f3(m.ax.x)}, ${f3(-m.ax.z)}, ${f3(m.ax.y)})`;
    return { main: `⌀${f3(m.r * 2)}`, sub: `R${f3(m.r)} · środek ${fmtP(m.c, lathe)}${lathe ? "" : ` · oś ${ax}`}${m.wall ? " · ze ścianki" : ""}` };
  }
  if (m.kind === "ang") {
    const a = angOf(m.a, m.b);
    return { main: `∠${a.toFixed(2)}°`, sub: `kąt między ścianami (normalnymi) · dopełnienie ${(180 - a).toFixed(2)}°` };
  }
  const r = distOf(m.a, m.b);
  const da = lathe ? `ΔZ ${f3(r.d.x)}  ΔX⌀ ${f3(2 * (Math.hypot(m.b.p.y, m.b.p.z) - Math.hypot(m.a.p.y, m.a.p.z)))}` : `ΔX ${f3(r.d.x)}  ΔY ${f3(-r.d.z)}  ΔZ ${f3(r.d.y)}`;
  if (r.par) return { main: `${f3(r.perp)} mm`, sub: `ściany równoległe — prostopadle · L ${f3(r.L)} · ${da}` };
  const from = m.a.center ? "od środka okręgu" : `do płaszczyzny 1: ${f3(r.perp)}`;
  return { main: `${f3(r.L)} mm`, sub: `${from} · ${da}` };
}
