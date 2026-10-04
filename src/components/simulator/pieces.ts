import { activeOffset, pointAt, type Program, type Segment, type Vec3 } from "@/lib/parser";
import { isLatheTool, type Setup } from "./setup";

/*
  Detale w symulacji frezarki. Program z kilkoma układami (G54 i G55, G54.1 P1…, TRANS)
  obrabia kilka sztuk — każda dostaje własny półfabrykat w zerze swojego układu.
  G52 i G92 to przesunięcia w obrębie detalu, więc nie tworzą nowej sztuki.
*/
export interface PieceBox { x0: number; x1: number; y0: number; y1: number; top: number; bottom: number; origin: Vec3 }

const ZERO: Vec3 = { x: 0, y: 0, z: 0 };
const key = (v: Vec3) => `${v.x.toFixed(3)},${v.y.toFixed(3)},${v.z.toFixed(3)}`;

/** Zero detalu dla stanu maszyny: przesunięcie układu + ramka TRANS (bez G52/G92). */
export function pieceOrigin(s: Program["lines"][number]["state"]): Vec3 {
  const o = activeOffset(s);
  return { x: o.x + s.frame.x, y: o.y + s.frame.y, z: o.z + s.frame.z };
}

/** Zera wszystkich detali, w kolejności pierwszego ruchu roboczego. Bez ruchów roboczych — jeden detal w zerze. */
export function pieceOrigins(program: Program, segments: Segment[], perWcs: boolean): Vec3[] {
  if (!perWcs) return [ZERO];
  const seen = new Map<string, Vec3>();
  for (const sg of segments) {
    if (sg.kind === "rapid" || sg.kind === "dwell") continue;
    const s = program.lines[sg.line]?.state; if (!s) continue;
    const v = pieceOrigin(s);
    if (!seen.has(key(v))) seen.set(key(v), v);
  }
  return seen.size ? [...seen.values()] : [ZERO];
}

/**
 * Prostopadłościany półfabrykatów (współrzędne maszynowe), jeden na detal.
 * Ręczny wymiar: z ustawień, przesunięty do zera detalu. Automatyczny: obrys ruchów roboczych
 * tego detalu (z `margin` — plus promień największego narzędzia, jak w 3D).
 */
export function stockBoxes(program: Program, segments: Segment[], setup: Setup, margin = true): PieceBox[] {
  const st = setup.stock;
  const perWcs = st.perWcs !== false;
  const origins = pieceOrigins(program, segments, perWcs);
  if (!st.auto) {
    return origins.map((o) => ({ x0: o.x - st.ox, x1: o.x + st.x - st.ox, y0: o.y - st.oy, y1: o.y + st.y - st.oy, top: o.z + st.z - st.oz, bottom: o.z - st.oz, origin: o }));
  }
  const r = margin ? Math.max(...Object.values(setup.tools).filter((t) => !isLatheTool(t.kind)).map((t) => t.d / 2), 3) : 0;
  const out: PieceBox[] = [];
  for (const o of origins) {
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, mz = 0;
    for (const sg of segments) {
      if (sg.kind === "rapid" || sg.kind === "dwell") continue;
      if (perWcs) { const s = program.lines[sg.line]?.state; if (!s || key(pieceOrigin(s)) !== key(o)) continue; }
      const n = sg.kind === "arc" ? 20 : 10;
      for (let k = 0; k <= n; k++) { const p = pointAt(sg, k / n); x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); mz = Math.min(mz, p.z); }
    }
    if (x0 === Infinity) continue;
    out.push({ x0: x0 - r, x1: x1 + r, y0: y0 - r, y1: y1 + r, top: o.z, bottom: Math.min(mz - 5, o.z - 5), origin: o });
  }
  return out;
}
