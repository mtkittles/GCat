import { arcParams, planeAxes, pointAt, type Segment, type Vec3 } from "@/lib/parser";

/*
  Proste pomiary na rzucie 2D (wymiarowanie jak na rysunku): odległość między dwoma punktami
  z ΔX/ΔY oraz promień łuku. Punkty przyciągają się do końców ruchów roboczych, środków łuków
  i naroży półfabrykatu — wymiar wychodzi dokładny, a nie „na oko” z pikseli.
  Współrzędne [h, v] to osie rzutu: frezarka X/Y, tokarka Z/X (promień).
*/

export type Pt2 = [number, number];
export type Meas2 =
  | { kind: "d"; a: Pt2; b: Pt2 }
  | { kind: "r"; c: Pt2; r: number; p: Pt2 };

type Ax = keyof Vec3;

/** Punkty przyciągania: końce ruchów roboczych, środki łuków, punkty dodatkowe (np. naroża półfabrykatu). Bez powtórzeń. */
export function snapPoints(segs: Segment[], ha: Ax, va: Ax, extra: Pt2[] = [], limit = 60_000): Float64Array {
  const seen = new Set<string>();
  const out: number[] = [];
  const add = (h: number, v: number) => {
    if (!Number.isFinite(h) || !Number.isFinite(v)) return;
    const k = `${Math.round(h * 1000)}:${Math.round(v * 1000)}`;
    if (seen.has(k)) return;
    seen.add(k); out.push(h, v);
  };
  for (const p of extra) add(p[0], p[1]);
  for (const sg of segs) {
    if (out.length >= limit * 2) break;
    if (sg.kind === "rapid" || sg.kind === "dwell") continue;
    add(sg.from[ha], sg.from[va]); add(sg.to[ha], sg.to[va]);
    if (sg.kind === "arc" && inView(sg, ha, va)) add(sg.center[ha], sg.center[va]);
  }
  return Float64Array.from(out);
}

/** Najbliższy punkt przyciągania w promieniu `tol` (w jednostkach rysunku) albo null. */
export function nearestSnap(pts: Float64Array, h: number, v: number, tol: number): Pt2 | null {
  let best = tol * tol, bi = -1;
  for (let i = 0; i < pts.length; i += 2) {
    const d = (pts[i] - h) ** 2 + (pts[i + 1] - v) ** 2;
    if (d <= best) { best = d; bi = i; }
  }
  return bi < 0 ? null : [pts[bi], pts[bi + 1]];
}

/** Łuk leży w płaszczyźnie rzutu — w widoku jest prawdziwym okręgiem. */
function inView(sg: Extract<Segment, { kind: "arc" }>, ha: Ax, va: Ax) {
  if ((sg as { tax?: unknown }).tax) return false;   // 4/5 osi: łuk w pochylonej płaszczyźnie
  const [a, b] = planeAxes(sg.plane);
  return (a === ha && b === va) || (a === va && b === ha);
}

/** Łuk roboczy najbliżej punktu (w promieniu `tol`): środek i promień do wymiaru „R”. */
export function arcNear(segs: Segment[], ha: Ax, va: Ax, h: number, v: number, tol: number): { c: Pt2; r: number; p: Pt2 } | null {
  let best = tol, hit: { c: Pt2; r: number; p: Pt2 } | null = null;
  for (const sg of segs) {
    if (sg.kind !== "arc" || !inView(sg, ha, va)) continue;
    const cx = sg.center[ha], cy = sg.center[va];
    const r = arcParams(sg).r;
    if (Math.abs(Math.hypot(h - cx, v - cy) - r) > best) continue;
    // odległość od samego łuku (nie całego okręgu) — próbkowanie wzdłuż łuku
    for (let i = 0; i <= 48; i++) {
      const q = pointAt(sg, i / 48);
      const d = Math.hypot(q[ha] - h, q[va] - v);
      if (d < best) { best = d; hit = { c: [cx, cy], r, p: [q[ha], q[va]] }; }
    }
  }
  return hit;
}

const f3 = (x: number) => (Math.abs(x) < 5e-4 ? 0 : x).toFixed(3);

/** Opis wymiaru: długość i przyrosty w osiach rzutu. Tokarka: X jako średnica. */
export function measLabel(m: Meas2, mode: "mill" | "lathe"): { main: string; sub: string } {
  if (m.kind === "r") {
    const c = mode === "lathe" ? `Z${f3(m.c[0])} X${f3(m.c[1] * 2)}` : `X${f3(m.c[0])} Y${f3(m.c[1])}`;
    return { main: `R ${f3(m.r)}  ⌀ ${f3(m.r * 2)}`, sub: `środek ${c}` };
  }
  const dh = m.b[0] - m.a[0], dv = m.b[1] - m.a[1];
  const L = Math.hypot(dh, dv);
  const sub = mode === "lathe" ? `ΔZ ${f3(dh)}  ΔX⌀ ${f3(dv * 2)}` : `ΔX ${f3(dh)}  ΔY ${f3(dv)}`;
  const ang = L > 1e-9 ? `  ∠ ${(((Math.atan2(dv, dh) * 180) / Math.PI + 360) % 180).toFixed(1)}°` : "";
  return { main: `${f3(L)} mm`, sub: sub + ang };
}
