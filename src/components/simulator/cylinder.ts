import { pointAt, type Program } from "@/lib/parser";
import { cuttingRadius, toolOf, type Setup } from "./setup";

/*
  4. oś, etap 1: półfabrykat walcowy w osi X (uchwyt na stole obrotowym A).
  Materiał opisuje mapa promienia r(θ, x) w układzie detalu: θ liczone prawoskrętnie wokół +X
  (od +Y do +Z), więc przy A=0 wierzch walca to θ=90°. Obrót stołu o A przenosi punkt detalu
  na kąt maszynowy φ = θ + A. Frez walcowy (oś pionowa) zbiera materiał z promienia tam,
  gdzie jego walec przecina promień detalu — liczone na każdym kroku ruchu, także przy
  jednoczesnym ruchu X/Y/Z + A (grawerowanie linii śrubowej).
*/
export interface CylMeta { x0: number; x1: number; R: number; axisZ: number; nx: number; nt: number; cx: number; ct: number }

const R_MIN = 0.2;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export function cylMeta(setup: Setup, cap = 400): CylMeta {
  const st = setup.stock;
  const R = Math.max(0.5, st.d / 2), len = Math.max(1, st.len);
  const x0 = -st.ox, x1 = x0 + len, axisZ = -st.oz;
  const circ = 2 * Math.PI * R;
  const cell = clamp(Math.sqrt((len * circ) / (cap * cap)), 0.15, 0.6);
  const nx = clamp(Math.round(len / cell), 60, Math.round(cap * 1.8));
  const nt = clamp(Math.round(circ / cell), 90, 720);
  return { x0, x1, R, axisZ, nx, nt, cx: len / nx, ct: (2 * Math.PI) / nt };
}

export const cylInit = (m: CylMeta) => new Float32Array((m.nx + 1) * m.nt).fill(m.R);
export const cylIndex = (m: CylMeta, j: number, i: number) => j * m.nt + (((i % m.nt) + m.nt) % m.nt);

/** Kąt A [°] w danym miejscu programu: interpolacja na odcinku z ruchem A, inaczej ostatni osiągnięty. */
export function angleAt(program: Program, lengths: number[], progress: number): number {
  let acc = 0, a = 0;
  for (let i = 0; i < program.segments.length; i++) {
    const sg = program.segments[i], len = lengths[i];
    const ra = sg.kind !== "dwell" ? sg.a : undefined;
    if (progress <= acc) break;
    if (ra) a = progress >= acc + len ? ra.to : ra.from + (ra.to - ra.from) * ((progress - acc) / (len || 1));
    acc += len;
  }
  return a;
}

/**
 * Jeden krok skrawania: frez walcowy o promieniu rt z czołem w (xt, yt, zt) maszyny, stół obrócony o A [°].
 * Zwraca liczbę zmienionych komórek (do testów).
 */
export function carveCylStep(h: Float32Array, m: CylMeta, xt: number, yt: number, zt: number, aDeg: number, rt: number): number {
  const zr = zt - m.axisZ;             // wysokość czoła freza nad osią
  if (zr >= m.R) return 0;
  const rMin = Math.max(R_MIN, zr);    // najmniejszy promień, do którego frez może sięgnąć
  // okno kątów maszynowych φ, w których promień detalu może trafić w walec freza (górna połowa: sin φ > 0)
  const lo = clamp((yt - rt) / rMin, -1, 1), hi = clamp((yt + rt) / rMin, -1, 1);
  const phiA = Math.acos(hi), phiB = Math.acos(lo);
  const A = (aDeg * Math.PI) / 180;
  const i0 = Math.floor((phiA - A) / m.ct) - 1, i1 = Math.ceil((phiB - A) / m.ct) + 1;
  const j0 = Math.max(0, Math.floor((xt - rt - m.x0) / m.cx)), j1 = Math.min(m.nx, Math.ceil((xt + rt - m.x0) / m.cx));
  let changed = 0;
  for (let i = i0; i <= i1; i++) {
    const phi = i * m.ct + A;
    const sn = Math.sin(phi), cs = Math.cos(phi);
    if (sn <= 1e-3) continue;          // promień skierowany w dół/poziomo — frez z góry go nie sięga
    const rz = zr / sn;                // promień, na którym promień detalu przebija płaszczyznę czoła freza
    for (let j = j0; j <= j1; j++) {
      const gx = m.x0 + j * m.cx, dx = gx - xt;
      if (Math.abs(dx) > rt) continue;
      const w = Math.sqrt(rt * rt - dx * dx);
      const idx = cylIndex(m, j, i);
      const r = h[idx];
      if (rz >= r) continue;
      let rNew = r;
      // czoło freza: punkt przebicia leży w obrysie walca freza
      if (Math.abs(rz * cs - yt) <= w) rNew = Math.max(rz, R_MIN);
      else {
        // ścianka boczna freza: promień detalu wchodzi w walec przez bok, y = yt ± w
        for (const yw of [yt - w, yt + w]) {
          if (Math.abs(cs) < 1e-6) continue;
          const rs = yw / cs;
          if (rs > rz && rs < r) rNew = Math.min(rNew, rs);
        }
      }
      if (rNew < r) { h[idx] = Math.max(rNew, R_MIN); changed++; }
    }
  }
  return changed;
}

/** Nanosi ubytek z zakresu postępu [from, to] na mapę promienia. */
export function carveCyl(h: Float32Array, m: CylMeta, program: Program, lengths: number[], setup: Setup, from: number, to: number) {
  let acc = 0;
  program.segments.forEach((sg, i) => {
    const len = lengths[i];
    const segStart = acc, segEnd = acc + len;
    acc = segEnd;
    if (sg.kind === "rapid" || sg.kind === "dwell" || segEnd <= from || segStart >= to) return;
    const t0 = Math.max(0, (from - segStart) / (len || 1)), t1 = Math.min(1, (to - segStart) / (len || 1));
    if (t1 <= t0) return;
    const tl = toolOf(setup, program.lines[sg.line]?.state.tool ?? null, "mill");
    const rt = cuttingRadius(tl);
    const a0 = sg.a?.from ?? program.lines[sg.line]?.state.rotary?.a ?? 0, a1 = sg.a?.to ?? a0;
    // krok: oczko siatki wzdłuż X i po obwodzie (obrót o dA przesuwa powierzchnię o R·dA)
    const arcLen = (Math.abs(a1 - a0) * Math.PI / 180) * m.R;
    const steps = Math.max(1, Math.ceil(((len + arcLen) * (t1 - t0)) / (Math.min(m.cx, m.R * m.ct) * 0.7)));
    for (let k = 0; k <= steps; k++) {
      const t = t0 + ((t1 - t0) * k) / steps;
      const p = pointAt(sg, t);
      carveCylStep(h, m, p.x, p.y, p.z, a0 + (a1 - a0) * t, rt);
    }
  });
}

/**
 * Siatka walca z mapy promienia — współrzędne względem osi walca (obrót stołu to obrót grupy w 3D).
 * Pozycje w układzie świata three.js: (x, z_detalu, −y_detalu). Zwraca tablice do BufferGeometry
 * i mapę wierzchołek → komórka (−1: środek dna), żeby kolejne klatki tylko przepisywały promienie.
 */
export function cylMesh(h: Float32Array, m: CylMeta): { pos: Float32Array; idx: number[]; map: Int32Array } {
  const grid = (m.nx + 1) * m.nt;
  const N = grid + 2 * (m.nt + 1);
  const pos = new Float32Array(N * 3), map = new Int32Array(N).fill(-1);
  const idx: number[] = [];
  let n = 0;
  const V = (x: number, ym: number, zm: number, k: number) => { pos[n * 3] = x; pos[n * 3 + 1] = zm; pos[n * 3 + 2] = -ym; map[n] = k; return n++; };
  for (let j = 0; j <= m.nx; j++) for (let i = 0; i < m.nt; i++) {
    const k = cylIndex(m, j, i), r = h[k], th = i * m.ct;
    V(m.x0 + j * m.cx, r * Math.cos(th), r * Math.sin(th), k);
  }
  for (let j = 0; j < m.nx; j++) for (let i = 0; i < m.nt; i++) {
    const a = j * m.nt + i, b = j * m.nt + ((i + 1) % m.nt), c = a + m.nt, d = b + m.nt;
    idx.push(a, b, c, b, d, c);
  }
  // czoła: wachlarz wokół środka, obręcz z promieni skrajnych kolumn
  for (const [j, flip] of [[0, true], [m.nx, false]] as const) {
    const center = V(m.x0 + j * m.cx, 0, 0, -1);
    const rim: number[] = [];
    for (let i = 0; i < m.nt; i++) { const k = cylIndex(m, j, i), r = h[k], th = i * m.ct; rim.push(V(m.x0 + j * m.cx, r * Math.cos(th), r * Math.sin(th), k)); }
    for (let i = 0; i < m.nt; i++) { const a = rim[i], b = rim[(i + 1) % m.nt]; if (flip) idx.push(center, b, a); else idx.push(center, a, b); }
  }
  return { pos: pos.subarray(0, n * 3), idx, map: map.subarray(0, n) };
}

/** Przepisanie promieni w istniejącej siatce (bez alokacji). */
export function cylUpdate(pos: Float32Array, map: Int32Array, h: Float32Array, m: CylMeta) {
  for (let v = 0; v < map.length; v++) {
    const k = map[v]; if (k < 0) continue;
    const i = k % m.nt, th = i * m.ct, r = h[k];
    pos[v * 3 + 1] = r * Math.sin(th); pos[v * 3 + 2] = -(r * Math.cos(th));
  }
}

/** Czy ustawienia opisują walec na 4. osi. */
export const isCyl = (setup: Setup, mode: "mill" | "lathe") => mode === "mill" && setup.stock.shape === "cylX";

/** Pozostały materiał [mm³] i objętość wyjściowa — do statystyk. */
export function cylVolume(h: Float32Array, m: CylMeta): { left: number; full: number } {
  let left = 0;
  for (let j = 0; j < m.nx; j++) for (let i = 0; i < m.nt; i++) { const r = h[cylIndex(m, j, i)]; left += 0.5 * r * r * m.ct * m.cx; }
  return { left, full: Math.PI * m.R * m.R * (m.x1 - m.x0) };
}
