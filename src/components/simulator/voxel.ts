import { pointAt, type Program } from "@/lib/parser";
import { toolProfile } from "./cylinder";
import { axisAt, type PartSeg } from "./multiaxis";
import type { PieceBox } from "./pieces";
import { cuttingRadius, toolOf, type Setup } from "./setup";

/*
  Ubytek materiału dla frezowania 4/5-osiowego: narzędzie może wchodzić z boku i pod kątem,
  więc mapa wysokości (widok z góry) nie wystarcza. Półfabrykat to pole odległości na siatce
  punktów (dodatnie — materiał, ujemne — powietrze). Narzędzie odejmuje się jako bryła
  (walec z czołem wg `toolProfile`) ustawiona wzdłuż swojej osi: f = min(f, d_narzędzia).
  Powierzchnię buduje „surface nets” — po kawałku siatki (chunk), więc w trakcie animacji
  przelicza się tylko fragment, przez który przeszło narzędzie.
*/

export interface VoxMeta {
  x0: number; y0: number; z0: number; h: number;
  nx: number; ny: number; nz: number;
  /** rozmiar kawałka w komórkach i liczba kawałków w osiach */
  C: number; cx: number; cy: number; cz: number;
}

const PAD = 2;

/** Siatka dla prostopadłościanu `box` przy budżecie punktów (telefon mniej, komputer więcej). */
export function voxMeta(box: PieceBox, budget: number): VoxMeta {
  const sx = Math.max(1, box.x1 - box.x0), sy = Math.max(1, box.y1 - box.y0), sz = Math.max(1, box.top - box.bottom);
  const h = Math.max(0.2, Math.cbrt((sx * sy * sz) / budget));
  const nx = Math.ceil(sx / h) + 1 + 2 * PAD, ny = Math.ceil(sy / h) + 1 + 2 * PAD, nz = Math.ceil(sz / h) + 1 + 2 * PAD;
  const C = 24;
  return {
    x0: box.x0 - PAD * h, y0: box.y0 - PAD * h, z0: box.bottom - PAD * h, h, nx, ny, nz,
    C, cx: Math.ceil((nx - 1) / C), cy: Math.ceil((ny - 1) / C), cz: Math.ceil((nz - 1) / C),
  };
}

/** Pole odległości prostopadłościanu (dodatnie w środku). */
export function voxInit(m: VoxMeta, box: PieceBox): Float32Array {
  const f = new Float32Array(m.nx * m.ny * m.nz);
  for (let k = 0; k < m.nz; k++) {
    const z = m.z0 + k * m.h, dz = Math.min(z - box.bottom, box.top - z);
    for (let j = 0; j < m.ny; j++) {
      const y = m.y0 + j * m.h, dy = Math.min(y - box.y0, box.y1 - y, dz);
      const row = m.nx * (j + m.ny * k);
      for (let i = 0; i < m.nx; i++) {
        const x = m.x0 + i * m.h;
        f[row + i] = Math.min(x - box.x0, box.x1 - x, dy);
      }
    }
  }
  return f;
}

const chunkKey = (m: VoxMeta, ci: number, cj: number, ck: number) => ci + m.cx * (cj + m.cy * ck);

/** Odejmuje narzędzie w jednym położeniu: wierzchołek `p`, oś `n` (jednostkowa, w górę narzędzia). */
function stamp(f: Float32Array, m: VoxMeta, px: number, py: number, pz: number, nx: number, ny: number, nz: number, r: number, L: number, prof: ((d: number) => number) | null, dirty: Set<number>) {
  const ex = px + nx * L, ey = py + ny * L, ez = pz + nz * L;
  const i0 = Math.max(0, Math.floor((Math.min(px, ex) - r - m.x0) / m.h)), i1 = Math.min(m.nx - 1, Math.ceil((Math.max(px, ex) + r - m.x0) / m.h));
  const j0 = Math.max(0, Math.floor((Math.min(py, ey) - r - m.y0) / m.h)), j1 = Math.min(m.ny - 1, Math.ceil((Math.max(py, ey) + r - m.y0) / m.h));
  const k0 = Math.max(0, Math.floor((Math.min(pz, ez) - r - m.z0) / m.h)), k1 = Math.min(m.nz - 1, Math.ceil((Math.max(pz, ez) + r - m.z0) / m.h));
  if (i0 > i1 || j0 > j1 || k0 > k1) return;
  let changed = false;
  for (let k = k0; k <= k1; k++) {
    const qz = m.z0 + k * m.h - pz;
    for (let j = j0; j <= j1; j++) {
      const qy = m.y0 + j * m.h - py;
      const row = m.nx * (j + m.ny * k);
      for (let i = i0; i <= i1; i++) {
        const idx = row + i;
        const cur = f[idx];
        if (cur <= -m.h) continue;                       // już powietrze
        const qx = m.x0 + i * m.h - px;
        const hgt = qx * nx + qy * ny + qz * nz;          // wysokość nad wierzchołkiem wzdłuż osi
        const rho = Math.sqrt(Math.max(0, qx * qx + qy * qy + qz * qz - hgt * hgt));
        const bottom = prof ? prof(Math.min(rho, r)) : 0;
        const d = Math.max(rho - r, bottom - hgt, hgt - L);
        if (d < cur) { f[idx] = d; changed = true; }
      }
    }
  }
  if (!changed) return;
  // punkt wpływa na komórki i krawędzie sąsiednich kawałków — zapas o jedną komórkę
  const c = (v: number, n: number) => Math.max(0, Math.min(n - 1, Math.floor(v / m.C)));
  for (let ck = c(k0 - 2, m.cz); ck <= c(k1 + 1, m.cz); ck++)
    for (let cj = c(j0 - 2, m.cy); cj <= c(j1 + 1, m.cy); cj++)
      for (let ci = c(i0 - 2, m.cx); ci <= c(i1 + 1, m.cx); ci++) dirty.add(chunkKey(m, ci, cj, ck));
}

/** Nanosi ubytek z zakresu postępu [from, to]; `dirty` dostaje numery kawałków do przebudowy. */
export function voxCarve(f: Float32Array, m: VoxMeta, segs: PartSeg[], lengths: number[], program: Program, setup: Setup, from: number, to: number, dirty: Set<number>) {
  let acc = 0;
  for (let i = 0; i < segs.length; i++) {
    const sg = segs[i], len = lengths[i];
    const s0 = acc, s1 = acc + len;
    acc = s1;
    if (sg.kind === "rapid" || sg.kind === "dwell" || s1 <= from || s0 >= to) continue;
    const t0 = Math.max(0, (from - s0) / (len || 1)), t1 = Math.min(1, (to - s0) / (len || 1));
    if (t1 < t0) continue;
    const tl = toolOf(setup, program.lines[sg.line]?.state.tool ?? null, "mill");
    const r = cuttingRadius(tl), prof = toolProfile(tl);
    const L = Math.max(tl.len || 0, 3 * r, 20);
    const a0 = axisAt(sg, t0), a1 = axisAt(sg, t1);
    const turn = Math.acos(Math.max(-1, Math.min(1, a0.x * a1.x + a0.y * a1.y + a0.z * a1.z)));
    const p0 = pointAt(sg, t0), p1 = pointAt(sg, t1);
    const path = Math.hypot(p1.x - p0.x, p1.y - p0.y, p1.z - p0.z) + (sg.kind === "arc" ? len * (t1 - t0) : 0);
    const steps = Math.max(1, Math.ceil(Math.max(path, turn * L) / (m.h * 0.6)));
    for (let k = 0; k <= steps; k++) {
      const t = t0 + ((t1 - t0) * k) / steps;
      const p = pointAt(sg, t), n = axisAt(sg, t);
      stamp(f, m, p.x, p.y, p.z, n.x, n.y, n.z, r, L, prof, dirty);
    }
  }
}

/** Wszystkie kawałki (pierwsza budowa siatki). */
export function allChunks(m: VoxMeta): Set<number> {
  const s = new Set<number>();
  for (let k = 0; k < m.cz; k++) for (let j = 0; j < m.cy; j++) for (let i = 0; i < m.cx; i++) s.add(chunkKey(m, i, j, k));
  return s;
}

export interface ChunkMesh { pos: Float32Array; nrm: Float32Array; idx: Uint32Array }

/**
 * Surface nets dla jednego kawałka. Współrzędne wyjściowe od razu w układzie three.js
 * (X, Z w górę, −Y), tak jak reszta sceny frezarki.
 */
export function voxChunkMesh(f: Float32Array, m: VoxMeta, key: number): ChunkMesh | null {
  const ci = key % m.cx, cj = Math.floor(key / m.cx) % m.cy, ck = Math.floor(key / (m.cx * m.cy));
  const { nx, ny, nz, C } = m;
  const i0 = ci * C, j0 = cj * C, k0 = ck * C;
  const i1 = Math.min(i0 + C, nx - 1), j1 = Math.min(j0 + C, ny - 1), k1 = Math.min(k0 + C, nz - 1);
  // komórki z zakresu [x0-1, x1) — lokalna tablica numerów wierzchołków
  const bx = i0 - 1, by = j0 - 1, bz = k0 - 1, sx = i1 - bx, sy = j1 - by, sz = k1 - bz;
  const vmap = new Int32Array(sx * sy * sz).fill(-1);
  const pos: number[] = [], nrm: number[] = [], idx: number[] = [];
  const F = (i: number, j: number, k: number) => f[i + nx * (j + ny * k)];
  const corner = new Float32Array(8);
  const vert = (i: number, j: number, k: number): number => {
    if (i < 0 || j < 0 || k < 0 || i >= nx - 1 || j >= ny - 1 || k >= nz - 1) return -1;
    const li = (i - bx) + sx * ((j - by) + sy * (k - bz));
    if (vmap[li] >= 0) return vmap[li];
    let n = 0;
    for (let c = 0; c < 8; c++) { const v = F(i + (c & 1), j + ((c >> 1) & 1), k + ((c >> 2) & 1)); corner[c] = v; if (v > 0) n++; }
    if (n === 0 || n === 8) return -1;
    // średnia punktów przecięcia na 12 krawędziach komórki
    let ax = 0, ay = 0, az = 0, cnt = 0;
    for (let c = 0; c < 8; c++) for (const b of [1, 2, 4]) {
      if (c & b) continue;
      const d = c | b, va = corner[c], vb = corner[d];
      if ((va > 0) === (vb > 0)) continue;
      const t = va / (va - vb);
      ax += (c & 1) + (b === 1 ? t : 0); ay += ((c >> 1) & 1) + (b === 2 ? t : 0); az += ((c >> 2) & 1) + (b === 4 ? t : 0);
      cnt++;
    }
    const x = m.x0 + (i + ax / cnt) * m.h, y = m.y0 + (j + ay / cnt) * m.h, z = m.z0 + (k + az / cnt) * m.h;
    // normalna = −gradient pola (na zewnątrz materiału)
    const gx = (corner[1] - corner[0]) + (corner[3] - corner[2]) + (corner[5] - corner[4]) + (corner[7] - corner[6]);
    const gy = (corner[2] - corner[0]) + (corner[3] - corner[1]) + (corner[6] - corner[4]) + (corner[7] - corner[5]);
    const gz = (corner[4] - corner[0]) + (corner[5] - corner[1]) + (corner[6] - corner[2]) + (corner[7] - corner[3]);
    const gl = Math.hypot(gx, gy, gz) || 1;
    const id = pos.length / 3;
    pos.push(x, z, -y);
    nrm.push(-gx / gl, -gz / gl, gy / gl);
    vmap[li] = id;
    return id;
  };
  const quad = (a: number, b: number, c: number, d: number, flip: boolean) => {
    if (a < 0 || b < 0 || c < 0 || d < 0) return;
    if (flip) idx.push(a, c, b, a, d, c); else idx.push(a, b, c, a, c, d);
  };
  for (let k = k0; k < k1; k++) for (let j = j0; j < j1; j++) for (let i = i0; i < i1; i++) {
    const v0 = F(i, j, k) > 0;
    if (j > 0 && k > 0 && v0 !== F(i + 1, j, k) > 0) quad(vert(i, j - 1, k - 1), vert(i, j, k - 1), vert(i, j, k), vert(i, j - 1, k), v0);
    if (i > 0 && k > 0 && v0 !== F(i, j + 1, k) > 0) quad(vert(i - 1, j, k - 1), vert(i - 1, j, k), vert(i, j, k), vert(i, j, k - 1), v0);
    if (i > 0 && j > 0 && v0 !== F(i, j, k + 1) > 0) quad(vert(i - 1, j - 1, k), vert(i, j - 1, k), vert(i, j, k), vert(i - 1, j, k), v0);
  }
  if (!idx.length) return null;
  // kolejność wierzchołków zgodna z normalną (przód trójkąta na zewnątrz materiału) —
  // inaczej materiał dwustronny odwraca normalną i ściana świeci na czarno
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t] * 3, b = idx[t + 1] * 3, c = idx[t + 2] * 3;
    const ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2];
    const vx = pos[c] - pos[a], vy = pos[c + 1] - pos[a + 1], vz = pos[c + 2] - pos[a + 2];
    const cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;
    const nx = nrm[a] + nrm[b] + nrm[c], ny = nrm[a + 1] + nrm[b + 1] + nrm[c + 1], nz = nrm[a + 2] + nrm[b + 2] + nrm[c + 2];
    if (cx * nx + cy * ny + cz * nz < 0) { const tmp = idx[t + 1]; idx[t + 1] = idx[t + 2]; idx[t + 2] = tmp; }
  }
  return { pos: new Float32Array(pos), nrm: new Float32Array(nrm), idx: new Uint32Array(idx) };
}

/** Objętość materiału [mm³] — do testów i statystyk. */
export function voxVolume(f: Float32Array, m: VoxMeta): number {
  let n = 0;
  for (let i = 0; i < f.length; i++) if (f[i] > 0) n++;
  return n * m.h ** 3;
}

/** Wartość pola w dowolnym punkcie (interpolacja trójliniowa); poza siatką — powietrze. */
export function voxSample(f: Float32Array, m: VoxMeta, x: number, y: number, z: number): number {
  const gx = (x - m.x0) / m.h, gy = (y - m.y0) / m.h, gz = (z - m.z0) / m.h;
  if (gx < 0 || gy < 0 || gz < 0 || gx >= m.nx - 1 || gy >= m.ny - 1 || gz >= m.nz - 1) return -m.h;
  const i = Math.floor(gx), j = Math.floor(gy), k = Math.floor(gz), tx = gx - i, ty = gy - j, tz = gz - k;
  const at = (a: number, b: number, c: number) => f[a + m.nx * (b + m.ny * c)];
  const l = (a: number, b: number, t: number) => a + (b - a) * t;
  return l(
    l(l(at(i, j, k), at(i + 1, j, k), tx), l(at(i, j + 1, k), at(i + 1, j + 1, k), tx), ty),
    l(l(at(i, j, k + 1), at(i + 1, j, k + 1), tx), l(at(i, j + 1, k + 1), at(i + 1, j + 1, k + 1), tx), ty),
    tz,
  );
}

/** Obrys kilku półfabrykatów jednym prostopadłościanem (5 osi: jeden detal na stole). */
export function unionBox(boxes: PieceBox[]): PieceBox | null {
  if (!boxes.length) return null;
  return boxes.reduce((a, b) => ({ ...a, x0: Math.min(a.x0, b.x0), x1: Math.max(a.x1, b.x1), y0: Math.min(a.y0, b.y0), y1: Math.max(a.y1, b.y1), top: Math.max(a.top, b.top), bottom: Math.min(a.bottom, b.bottom) }));
}

/**
 * Widok z góry modelu objętościowego: obraz RGBA (nx × ny, wiersz 0 = największe Y),
 * jasność z cieniowania wzgórzowego i głębokości — dla widoku 2D przy obróbce 4/5-osiowej.
 */
export function voxTopImage(f: Float32Array, m: VoxMeta, top: number, bottom: number): { w: number; h: number; data: Uint8ClampedArray<ArrayBuffer> } {
  const { nx, ny, nz } = m;
  const zt = new Float32Array(nx * ny).fill(NaN);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    for (let k = nz - 2; k >= 0; k--) {
      const a = f[i + nx * (j + ny * k)];
      if (a > 0) {
        const b = f[i + nx * (j + ny * (k + 1))];
        zt[j * nx + i] = m.z0 + (k + (b < 0 ? a / (a - b) : 0)) * m.h;
        break;
      }
    }
  }
  const data = new Uint8ClampedArray(new ArrayBuffer(nx * ny * 4));
  const L = { x: -0.5, y: 0.5, z: 0.707 }, depth = Math.max(0.5, top - bottom);
  const at = (i: number, j: number, fb: number) => { const v = zt[Math.min(ny - 1, Math.max(0, j)) * nx + Math.min(nx - 1, Math.max(0, i))]; return Number.isNaN(v) ? fb : v; };
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const v = zt[j * nx + i];
    const o = ((ny - 1 - j) * nx + i) * 4;
    if (Number.isNaN(v)) continue;
    const dx = (at(i + 1, j, v) - at(i - 1, j, v)) / (2 * m.h), dy = (at(i, j + 1, v) - at(i, j - 1, v)) / (2 * m.h);
    const lam = Math.max(0, (-dx * L.x - dy * L.y + L.z) / Math.hypot(dx, dy, 1));
    const t = Math.max(0, Math.min(1, (0.3 + 0.7 * lam) * (1 - 0.5 * Math.min(1, (top - v) / depth))));
    data[o] = 70 + 150 * t; data[o + 1] = 78 + 152 * t; data[o + 2] = 92 + 150 * t; data[o + 3] = 200;
  }
  return { w: nx, h: ny, data };
}
