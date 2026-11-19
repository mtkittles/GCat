import type { Segment, Vec3 } from "@/lib/parser/types";

export interface Bounds { min: Vec3; max: Vec3 }
export interface StockRect { minX: number; maxX: number; minY: number; maxY: number }

/**
 * Kadr podglądu 2D (V5): tor programu poszerzony o półfabrykat (frezarka — gdy podany w zadaniu lub programie)
 * i o tor wzorcowy zadania. Bez tego zadanie z pustym programem startowało w kadrze ±10 mm wokół X0 Y0 —
 * cała kanwa w kolorze materiału, widać tylko narzędzie.
 */
export function framed(b: Bounds, stock?: readonly StockRect[] | null, ref?: readonly Segment[] | null): Bounds {
  const min = { ...b.min }, max = { ...b.max };
  for (const s of stock ?? []) {
    min.x = Math.min(min.x, s.minX); max.x = Math.max(max.x, s.maxX);
    min.y = Math.min(min.y, s.minY); max.y = Math.max(max.y, s.maxY);
  }
  for (const sg of ref ?? []) for (const p of [sg.from, sg.to]) {
    for (const k of ["x", "y", "z"] as const) { min[k] = Math.min(min[k], p[k]); max[k] = Math.max(max[k], p[k]); }
  }
  return { min, max };
}
