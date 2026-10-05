/*
  Obraz detalu w rzucie aksonometrycznym z pola odległości (dodatnie — materiał):
  promień z kamery idzie przez prostopadłościan obrysu krokiem `step`, na granicy materiału
  zawężamy bisekcją, normalna z gradientu, cieniowanie Lamberta. Liczone przy budowie strony
  (miniatury programów 4/5-osiowych i walca na 4. osi) — bez WebGL.
*/
export interface Box3 { x0: number; x1: number; y0: number; y1: number; z0: number; z1: number }

/** Obraz w palecie: 0 — tło (przezroczyste), 1…levels — od cienia do światła. */
export function isoRender(sdf: (x: number, y: number, z: number) => number, b: Box3, W: number, H: number, step: number, levels = 64): Uint8Array {
  // kamera z przodu-prawej-góry (oś Y od operatora), rzut równoległy
  const e = norm({ x: 1, y: -1.25, z: 0.95 });
  const d = { x: -e.x, y: -e.y, z: -e.z };
  const u = norm({ x: d.y, y: -d.x, z: 0 });                                // w prawo na ekranie
  const v = norm({ x: u.y * d.z, y: -u.x * d.z, z: u.x * d.y - u.y * d.x }); // w górę na ekranie
  const corners = [b.x0, b.x1].flatMap((x) => [b.y0, b.y1].flatMap((y) => [b.z0, b.z1].map((z) => ({ x, y, z }))));
  const pu = corners.map((c) => dot(c, u)), pv = corners.map((c) => dot(c, v));
  const u0 = Math.min(...pu), u1 = Math.max(...pu), v0 = Math.min(...pv), v1 = Math.max(...pv);
  const pad = 0.04;
  const s = Math.min((W * (1 - 2 * pad)) / (u1 - u0), (H * (1 - 2 * pad)) / (v1 - v0));
  const uc = (u0 + u1) / 2, vc = (v0 + v1) / 2;
  const L = norm({ x: -0.45, y: -0.55, z: 0.75 });                          // światło z lewej-przodu-góry
  const out = new Uint8Array(W * H);
  const reach = Math.hypot(b.x1 - b.x0, b.y1 - b.y0, b.z1 - b.z0);
  const C = { x: (b.x0 + b.x1) / 2, y: (b.y0 + b.y1) / 2, z: (b.z0 + b.z1) / 2 }, cu = dot(C, u), cv = dot(C, v);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const a = uc + (i + 0.5 - W / 2) / s, c = vc - (j + 0.5 - H / 2) / s;
    // punkt na płaszczyźnie przez środek obrysu, cofnięty wzdłuż promienia
    const o = {
      x: C.x + u.x * (a - cu) + v.x * (c - cv) - d.x * reach,
      y: C.y + u.y * (a - cu) + v.y * (c - cv) - d.y * reach,
      z: C.z + u.z * (a - cu) + v.z * (c - cv) - d.z * reach,
    };
    const span = slab(o, d, b);
    if (!span) continue;
    let t = span[0], hit = -1;
    let prev = t;
    for (; t <= span[1]; t += step) {
      if (sdf(o.x + d.x * t, o.y + d.y * t, o.z + d.z * t) > 0) { hit = t; break; }
      prev = t;
    }
    if (hit < 0) continue;
    let lo = prev, hi = hit;
    for (let k = 0; k < 7; k++) { const m = (lo + hi) / 2; if (sdf(o.x + d.x * m, o.y + d.y * m, o.z + d.z * m) > 0) hi = m; else lo = m; }
    const p = { x: o.x + d.x * hi, y: o.y + d.y * hi, z: o.z + d.z * hi };
    const g = step;
    const n = norm({
      x: sdf(p.x - g, p.y, p.z) - sdf(p.x + g, p.y, p.z),
      y: sdf(p.x, p.y - g, p.z) - sdf(p.x, p.y + g, p.z),
      z: sdf(p.x, p.y, p.z - g) - sdf(p.x, p.y, p.z + g),
    });
    const lam = Math.max(0, dot(n, L));
    const tt = Math.max(0, Math.min(1, 0.22 + 0.78 * lam));
    out[j * W + i] = 1 + Math.round(tt * (levels - 1));
  }
  return out;
}

type V = { x: number; y: number; z: number };
const dot = (a: V, b: V) => a.x * b.x + a.y * b.y + a.z * b.z;
function norm(a: V): V { const l = Math.hypot(a.x, a.y, a.z) || 1; return { x: a.x / l, y: a.y / l, z: a.z / l }; }
/** Przedział t, w którym promień o + t·d jest wewnątrz prostopadłościanu. */
function slab(o: V, d: V, b: Box3): [number, number] | null {
  let t0 = -Infinity, t1 = Infinity;
  for (const [oo, dd, lo, hi] of [[o.x, d.x, b.x0, b.x1], [o.y, d.y, b.y0, b.y1], [o.z, d.z, b.z0, b.z1]] as const) {
    if (Math.abs(dd) < 1e-12) { if (oo < lo || oo > hi) return null; continue; }
    let a = (lo - oo) / dd, c = (hi - oo) / dd;
    if (a > c) [a, c] = [c, a];
    t0 = Math.max(t0, a); t1 = Math.min(t1, c);
  }
  return t1 >= t0 ? [Math.max(0, t0), t1] : null;
}
