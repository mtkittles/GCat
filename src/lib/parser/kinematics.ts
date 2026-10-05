import type { Vec3 } from "./types";

/*
  Kinematyka frezarki 4- i 5-osiowej w układzie stół–stół (obraca się detal, wrzeciono stoi pionowo).
  • „AC” — kołyska A (obrót wokół X maszyny) i stół obrotowy C (wokół osi stołu),
  • „BC” — kołyska B (wokół Y) i stół C,
  • „A”  — sama 4. oś A (stół obrotowy wokół X).
  Umowa: środek obrotu stołu leży w zerze maszyny (zero G54 bez przesunięć G10) — tak ustawia się
  detal w uproszczonym modelu. Punkt detalu p trafia w maszynie do M = R · p, gdzie
  R = Rx(A)·Rz(C) albo Ry(B)·Rz(C). Dodatni kąt obraca stół prawoskrętnie wokół osi maszyny.
  Oś narzędzia (+Z maszyny) widziana w układzie detalu to Rᵀ·ẑ.
*/

export type Kin = "A" | "AC" | "BC";
export type Rot3 = { a: number; b: number; c: number };
/** Macierz 3×3 wierszami. */
export type Mat3 = [number, number, number, number, number, number, number, number, number];

const D = Math.PI / 180;
export const I3: Mat3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];

export function rx(deg: number): Mat3 { const c = Math.cos(deg * D), s = Math.sin(deg * D); return [1, 0, 0, 0, c, -s, 0, s, c]; }
export function ry(deg: number): Mat3 { const c = Math.cos(deg * D), s = Math.sin(deg * D); return [c, 0, s, 0, 1, 0, -s, 0, c]; }
export function rz(deg: number): Mat3 { const c = Math.cos(deg * D), s = Math.sin(deg * D); return [c, -s, 0, s, c, 0, 0, 0, 1]; }

export function mul(a: Mat3, b: Mat3): Mat3 {
  const o = new Array(9).fill(0) as Mat3;
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) o[i * 3 + j] = a[i * 3] * b[j] + a[i * 3 + 1] * b[3 + j] + a[i * 3 + 2] * b[6 + j];
  return o;
}
export const tr = (m: Mat3): Mat3 => [m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]];
export const mulV = (m: Mat3, v: Vec3): Vec3 => ({
  x: m[0] * v.x + m[1] * v.y + m[2] * v.z,
  y: m[3] * v.x + m[4] * v.y + m[5] * v.z,
  z: m[6] * v.x + m[7] * v.y + m[8] * v.z,
});

export const rot3 = (r?: Partial<Rot3> | null): Rot3 => ({ a: r?.a ?? 0, b: r?.b ?? 0, c: r?.c ?? 0 });
export const lerpRot = (p: Rot3, q: Rot3, t: number): Rot3 => ({ a: p.a + (q.a - p.a) * t, b: p.b + (q.b - p.b) * t, c: p.c + (q.c - p.c) * t });
export const isIdentityRot = (r: Rot3, kin: Kin) => Math.abs(kin === "BC" ? r.b : r.a) < 1e-9 && (kin === "A" || Math.abs(r.c) < 1e-9);

/** Stół → maszyna (M = R · p). Osie spoza kinematyki są pomijane. */
export function tableMat(kin: Kin, r?: Partial<Rot3> | null): Mat3 {
  const q = rot3(r);
  if (kin === "A") return rx(q.a);
  if (kin === "BC") return mul(ry(q.b), rz(q.c));
  return mul(rx(q.a), rz(q.c));
}

/** Kierunek osi narzędzia (od wierzchołka w stronę wrzeciona) w układzie detalu. */
export function toolAxis(kin: Kin, r?: Partial<Rot3> | null): Vec3 {
  const m = tableMat(kin, r);
  return { x: m[6], y: m[7], z: m[8] };
}

const wrap = (d: number) => ((d % 360) + 540) % 360 - 180;

/**
 * Kąty stołu, przy których oś narzędzia jest równoległa do wektora `n` (w układzie detalu).
 * Z dwóch rozwiązań wybieramy to z mniejszym ruchem osi od bieżącego położenia (albo ze znakiem `prefer`); przy n ∥ Z oś C zostaje.
 * null — kinematyka nie potrafi ustawić takiego kierunku (np. sama oś A, a n ma składową X).
 */
export function solveAngles(kin: Kin, n: Vec3, cur: Rot3, prefer?: -1 | 1): Rot3 | null {
  const len = Math.hypot(n.x, n.y, n.z);
  if (len < 1e-9) return null;
  const x = n.x / len, y = n.y / len, z = n.z / len;
  const r = Math.hypot(x, y);
  if (kin === "A") {
    if (Math.abs(x) > 1e-6) return null;
    return { ...cur, a: Math.atan2(y, z) / D };
  }
  const tilt = Math.atan2(r, z) / D;               // 0…180
  const cands: Rot3[] = [];
  if (r < 1e-9) {
    cands.push(kin === "AC" ? { ...cur, a: tilt } : { ...cur, b: -tilt });
  } else if (kin === "AC") {
    const c = Math.atan2(x, y) / D;
    cands.push({ ...cur, a: tilt, c: cur.c + wrap(c - cur.c) }, { ...cur, a: -tilt, c: cur.c + wrap(c + 180 - cur.c) });
  } else {
    const c = Math.atan2(-y, x) / D;
    cands.push({ ...cur, b: -tilt, c: cur.c + wrap(c - cur.c) }, { ...cur, b: tilt, c: cur.c + wrap(c + 180 - cur.c) });
  }
  // Sinumerik _DIR: −1 / +1 — znak kąta osi pochylającej; bez preferencji — najkrótszy ruch osi.
  const tiltOf = (q: Rot3) => (kin === "BC" ? q.b : q.a);
  const cost = (q: Rot3) => Math.abs(q.a - cur.a) + Math.abs(q.b - cur.b) + Math.abs(q.c - cur.c) + (prefer && Math.sign(tiltOf(q)) === -prefer ? 1e6 : 0);
  const best = cands.sort((p, q) => cost(p) - cost(q))[0];
  const fix = (v: number) => (Math.abs(v) < 1e-9 ? 0 : Math.round(v * 1e6) / 1e6);
  return { a: fix(best.a), b: fix(best.b), c: fix(best.c) };
}

/** Fanuc G68.2: kąty Eulera I J K (Z, potem nowa X, potem nowa Z). */
export const eulerZXZ = (i: number, j: number, k: number): Mat3 => mul(mul(rz(i), rx(j)), rz(k));

/**
 * Sinumerik CYCLE800, obrót „osiowo” (bity 6–7 trybu = 0): kolejność osi z bitów 0–5
 * (po dwa bity: 01 = X, 10 = Y, 11 = Z; 57 = X→Y→Z), każdy obrót wokół osi już obróconego układu.
 * Kąty `ang` w kolejności X, Y, Z (parametry _A, _B, _C).
 */
export function axisByAxis(mode: number, ang: { x: number; y: number; z: number }): Mat3 {
  let seq = mode & 63;
  const order: ("x" | "y" | "z")[] = [];
  for (let i = 0; i < 3; i++) { const b = seq & 3; seq >>= 2; if (b === 1) order.push("x"); else if (b === 2) order.push("y"); else if (b === 3) order.push("z"); }
  if (order.length !== 3) order.splice(0, order.length, "x", "y", "z");
  let m = I3;
  for (const ax of order) m = mul(m, ax === "x" ? rx(ang.x) : ax === "y" ? ry(ang.y) : rz(ang.z));
  return m;
}

/**
 * Kinematyka z liter użytych w programie: oś B → stół B/C; oś C albo płaszczyzna pochylona
 * (G68.2 / CYCLE800) → A/C; sama oś A → 4. oś A. Bez osi obrotowych — A/C (bez znaczenia).
 */
export function detectKin(source: string): Kin {
  const clean = source.replace(/;[^\n]*/g, " ").replace(/CYCLE800\s*\([^)]*\)/gi, " CYCLE800 ").replace(/\([^)]*\)/g, " ").toUpperCase()
    .replace(/\b[A-Z_][A-Z_0-9]*\s*=\s*(?:"[^"]*"|\S+)/g, " ");   // przypisania (A3=0.7 — wektor, nie oś)
  const word = (l: string) => new RegExp(`(^|[^A-Z_])${l}\\s*=?\\s*[-+]?\\.?\\d`, "m").test(clean);
  if (word("B")) return "BC";
  if (word("C") || /G0*68\.2|CYCLE800|G0*43\.4|TRAORI/.test(clean)) return "AC";
  return word("A") ? "A" : "AC";
}
