import { pointAt, type Program } from "@/lib/parser";
import { toolProfile } from "./cylinder";
import type { PieceBox } from "./pieces";
import { cuttingRadius, toolOf, type Setup } from "./setup";

/*
  Mapa wysokości półfabrykatu frezarki (widok z góry): wspólna dla bryły 3D
  i miniatur detali w galerii, więc oba miejsca pokazują ten sam obrobiony detal.
  Kształt czoła narzędzia (kulisty, z promieniem naroża, V/fazownik, wiertło) — z `toolProfile`.
*/
export interface MillMeta { minX: number; maxX: number; minY: number; maxY: number; top: number; bottom: number; nx: number; ny: number; cx: number; cy: number }

const CELL_TARGET = 0.35;   // największa komórka mapy wysokości [mm]
const CELL_MIN = 0.15;      // najmniejsza komórka — na mocnych urządzeniach
const GRID_MIN = 100;

/**
 * Siatka mapy wysokości dla jednego detalu (prostopadłościan z `stockBoxes`);
 * `cap` — górny limit punktów na bok (zależny od urządzenia), budżet dzielony między detale.
 * `coarse` — miniatura: dowolnie duże oczko, tylko tyle punktów, ile ma obrazek.
 */
export function millMeta(box: PieceBox, count: number, cap: number, coarse = false): MillMeta {
  const { x0: minX, x1: maxX, y0: minY, y1: maxY, top, bottom } = box;
  const spanX = Math.max(1e-6, maxX - minX), spanY = Math.max(1e-6, maxY - minY);
  const budget = (cap * cap) / Math.max(1, count);
  const raw = Math.sqrt((spanX * spanY) / budget);
  const cell = coarse ? Math.max(raw, CELL_MIN) : Math.max(CELL_MIN, Math.min(CELL_TARGET, raw));
  const nx = Math.max(coarse ? 20 : GRID_MIN, Math.min(Math.round(cap * 1.8), Math.round(spanX / cell)));
  const ny = Math.max(coarse ? 12 : 40, Math.min(Math.round(cap * 1.8), Math.round(nx * spanY / spanX)));
  return { minX, maxX, minY, maxY, top, bottom, nx, ny, cx: (maxX - minX) / nx, cy: (maxY - minY) / ny };
}

/**
 * Nanosi na mapę wysokości ubytek z podanego zakresu postępu. `deadline` (performance.now()) —
 * długie programy z CAM liczone porcjami: zwraca postęp, do którego zdążyło.
 */
export function carve(h: Float32Array, m: MillMeta, program: Program, lengths: number[], setup: Setup, mode: "mill" | "lathe", from: number, to: number, deadline = Infinity): number {
  let acc = 0;
  for (let i = 0; i < program.segments.length; i++) {
    const sg = program.segments[i];
    const len = lengths[i];
    const segStart = acc, segEnd = acc + len;
    acc = segEnd;
    if (sg.kind === "rapid" || sg.kind === "dwell" || segEnd <= from || segStart >= to) continue;
    if (deadline !== Infinity && performance.now() > deadline) return Math.max(from, segStart);
    const t0 = Math.max(0, (from - segStart) / (len || 1));
    const t1 = Math.min(1, (to - segStart) / (len || 1));
    if (t1 <= t0) continue;
    const tl = toolOf(setup, program.lines[sg.line]?.state.tool ?? null, mode);
    const r = cuttingRadius(tl), prof = toolProfile(tl);
    const steps = Math.max(1, Math.ceil((len * (t1 - t0)) / (Math.min(m.cx, m.cy) * 0.7)));
    for (let k = 0; k <= steps; k++) {
      const p = pointAt(sg, t0 + ((t1 - t0) * k) / steps);
      if (p.z >= m.top) continue;
      const i0 = Math.floor((p.x - r - m.minX) / m.cx), i1 = Math.ceil((p.x + r - m.minX) / m.cx);
      const j0 = Math.floor((p.y - r - m.minY) / m.cy), j1 = Math.ceil((p.y + r - m.minY) / m.cy);
      for (let j = Math.max(0, j0); j <= Math.min(m.ny, j1); j++) {
        for (let ii = Math.max(0, i0); ii <= Math.min(m.nx, i1); ii++) {
          const gx = m.minX + ii * m.cx, gy = m.minY + j * m.cy;
          const d2 = (gx - p.x) ** 2 + (gy - p.y) ** 2;
          if (d2 > r * r) continue;
          const idx = j * (m.nx + 1) + ii;
          const zHere = prof ? p.z + prof(Math.sqrt(d2)) : p.z;
          if (zHere < h[idx]) h[idx] = Math.max(zHere, m.bottom);
        }
      }
    }
  }
  return to;
}
