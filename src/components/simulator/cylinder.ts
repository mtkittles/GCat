import { pointAt, type Program } from "@/lib/parser";
import type { Issue } from "@/lib/parser/validate";
import { cuttingRadius, toolOf, type Setup, type Tool } from "./setup";

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
export function carveCylStep(h: Float32Array, m: CylMeta, xt: number, yt: number, zt: number, aDeg: number, rt: number, prof?: Profile | null): number {
  if (prof) return carveCylStepProfile(h, m, xt, yt, zt, aDeg, rt, prof);
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

/**
 * Profil czoła narzędzia: wysokość ostrza nad wierzchołkiem w odległości d od osi (0 ≤ d ≤ rt).
 * null — czoło płaskie (frez walcowy, rozwiertak, gwintownik…), liczone szybką ścieżką analityczną.
 */
export type Profile = (d: number) => number;
export function toolProfile(t: Tool): Profile | null {
  const r = cuttingRadius(t);
  const tanHalf = Math.tan((Math.max(10, Math.min(170, t.angle || 90)) * Math.PI) / 360);
  switch (t.kind) {
    case "ballnose": return (d) => r - Math.sqrt(Math.max(0, r * r - d * d));
    case "bullnose": {
      const c = Math.min(r * 0.95, Math.max(0, t.corner));
      if (c <= 0) return null;
      return (d) => (d <= r - c ? 0 : c - Math.sqrt(Math.max(0, c * c - (d - (r - c)) ** 2)));
    }
    case "vbit": case "chamfer": case "spotdrill": case "drill":
      return (d) => d / tanHalf;
    default: return null;
  }
}

/**
 * Krok skrawania narzędziem o profilowanym czole (kulisty, stożkowy, z promieniem naroża, wiertło).
 * Na każdym promieniu detalu szukamy pierwszego punktu wewnątrz bryły narzędzia (od osi na zewnątrz):
 * próbkowanie co ~0,1 mm i dokładne zawężenie bisekcją.
 */
function carveCylStepProfile(h: Float32Array, m: CylMeta, xt: number, yt: number, zt: number, aDeg: number, rt: number, prof: Profile): number {
  const zr = zt - m.axisZ;
  if (zr >= m.R) return 0;
  const rMin = Math.max(R_MIN, zr);
  const lo = clamp((yt - rt) / rMin, -1, 1), hi = clamp((yt + rt) / rMin, -1, 1);
  const A = (aDeg * Math.PI) / 180;
  const i0 = Math.floor((Math.acos(hi) - A) / m.ct) - 1, i1 = Math.ceil((Math.acos(lo) - A) / m.ct) + 1;
  const j0 = Math.max(0, Math.floor((xt - rt - m.x0) / m.cx)), j1 = Math.min(m.nx, Math.ceil((xt + rt - m.x0) / m.cx));
  let changed = 0;
  for (let i = i0; i <= i1; i++) {
    const phi = i * m.ct + A, sn = Math.sin(phi), cs = Math.cos(phi);
    if (sn <= 1e-3) continue;
    for (let j = j0; j <= j1; j++) {
      const dx = m.x0 + j * m.cx - xt;
      if (Math.abs(dx) > rt) continue;
      const idx = cylIndex(m, j, i), r = h[idx];
      const inside = (q: number) => { const d = Math.hypot(dx, q * cs - yt); return d <= rt && q * sn >= zr + prof(d) - 1e-9; };
      const start = Math.max(R_MIN, zr / sn);
      if (start >= r) continue;
      const step = Math.min(0.1, (r - start) / 4);
      let prev = start, hit = -1;
      for (let q = start; q < r; q += step) { if (inside(q)) { hit = q; break; } prev = q; }
      if (hit < 0) continue;
      let a = prev, b = hit;
      if (a < b) for (let k = 0; k < 12; k++) { const mid = (a + b) / 2; if (inside(mid)) b = mid; else a = mid; }
      if (b < r) { h[idx] = Math.max(b, R_MIN); changed++; }
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
    const rt = cuttingRadius(tl), prof = toolProfile(tl);
    const a0 = sg.a?.from ?? program.lines[sg.line]?.state.rotary?.a ?? 0, a1 = sg.a?.to ?? a0;
    // krok: oczko siatki wzdłuż X i po obwodzie (obrót o dA przesuwa powierzchnię o R·dA)
    const arcLen = (Math.abs(a1 - a0) * Math.PI / 180) * m.R;
    const steps = Math.max(1, Math.ceil(((len + arcLen) * (t1 - t0)) / (Math.min(m.cx, m.R * m.ct) * 0.7)));
    for (let k = 0; k <= steps; k++) {
      const t = t0 + ((t1 - t0) * k) / steps;
      const p = pointAt(sg, t);
      carveCylStep(h, m, p.x, p.y, p.z, a0 + (a1 - a0) * t, rt, prof);
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

/* ---------- Uchwyt i konik ---------- */

/** Geometria osprzętu 4. osi w układzie detalu: szczęki uchwytu przy lewym czole, opcjonalnie kieł konika przy prawym. */
export interface Fixture { x0: number; x1: number; R: number; axisZ: number; grip: number; jawR: number; bodyX0: number; tail: { x0: number; x1: number; r: number } | null }
export function fixtureOf(setup: Setup): Fixture {
  const st = setup.stock, R = Math.max(0.5, st.d / 2), x0 = -st.ox, x1 = x0 + Math.max(1, st.len);
  const grip = Math.max(0, st.grip ?? 10);
  return { x0, x1, R, axisZ: -st.oz, grip, jawR: R + 12, bodyX0: x0 - 40, tail: st.tailstock ? { x0: x1, x1: x1 + 60, r: Math.min(R, 15) } : null };
}

/** Czy narzędzie (wierzchołek p, promień rt, bryła ku górze) przecina walec osiowy o promieniu rc na odcinku X [a, b]. */
function hitsAxisCylinder(p: { x: number; y: number; z: number }, rt: number, f: Fixture, a: number, b: number, rc: number) {
  if (p.x + rt < a || p.x - rt > b) return false;
  const ymin = Math.max(0, Math.abs(p.y) - rt);
  const zd = Math.max(0, p.z - f.axisZ);
  return ymin * ymin + zd * zd < rc * rc - 1e-6;
}

/**
 * Kolizje narzędzia z uchwytem (szczęki na długości `grip` od lewego czoła i korpus uchwytu)
 * oraz z kłem konika. Sprawdzamy wszystkie ruchy, także szybkie — po jednym komunikacie na linię.
 */
export function cylCollisions(program: Program, setup: Setup): Issue[] {
  const f = fixtureOf(setup), out: Issue[] = [], seen = new Set<string>();
  for (const sg of program.segments) {
    if (sg.kind === "dwell") continue;
    const tl = toolOf(setup, program.lines[sg.line]?.state.tool ?? null, "mill"), rt = cuttingRadius(tl);
    for (let k = 0; k <= 16; k++) {
      const p = pointAt(sg, k / 16);
      const jaw = f.grip > 0 && hitsAxisCylinder(p, rt, f, f.x0, f.x0 + f.grip, f.jawR);
      const body = hitsAxisCylinder(p, rt, f, f.bodyX0, f.x0, f.jawR + 13);
      const tail = f.tail && hitsAxisCylinder(p, rt, f, f.tail.x0, f.tail.x1, f.tail.r);
      const what = jaw ? "ze szczękami uchwytu" : body ? "z korpusem uchwytu" : tail ? "z kłem konika" : null;
      if (!what) continue;
      const key = `${sg.line}:${what}`;
      if (!seen.has(key)) {
        seen.add(key);
        const where = jaw ? ` — szczęki trzymają materiał od X${fmt(f.x0)} do X${fmt(f.x0 + f.grip)}` : tail ? ` — kieł konika od X${fmt(f.tail!.x0)}` : "";
        out.push({ line: sg.line, level: "error", msg: `Kolizja ${what} 4. osi (X${fmt(p.x)} Z${fmt(p.z)})${where}. Odsuń narzędzie albo zmień długość w szczękach.` });
      }
      break;
    }
  }
  return out;
}
const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));

/* ---------- Rozwinięcie walca (widok 2D) ---------- */

/** Kąt detalu [°, 0–360) pod narzędziem w punkcie (y, A): kąt maszynowy styku minus obrót stołu. */
export function contactAngle(y: number, aDeg: number, R: number): number {
  const phi = (Math.atan2(Math.sqrt(Math.max(0, R * R - y * y)), y) * 180) / Math.PI;
  return (((phi - aDeg) % 360) + 360) % 360;
}
