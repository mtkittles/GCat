import { arcParams, lerpRot, mulV, pointAt, tableMat, toolAxis, tr, type Kin, type Program, type Rot3, type Segment, type Vec3 } from "@/lib/parser";

/*
  Frezowanie 4/5-osiowe: parser podaje odcinki we współrzędnych osi maszyny i kąty stołu (A/B/C).
  Symulacja ubytku i podgląd potrzebują ich w układzie detalu — tam, gdzie leży półfabrykat:
  wierzchołek narzędzia p = Rᵀ·M i oś narzędzia n = Rᵀ·ẑ (stół–stół, środek obrotu w zerze maszyny).
  Gdy kąty zmieniają się w czasie ruchu, odcinek jest dzielony na krótkie kawałki (≤ 2°),
  bo w układzie detalu wierzchołek idzie wtedy po łuku.
*/

/** Odcinek w układzie detalu: `tax` — oś narzędzia (jednostkowa) na początku i końcu. */
export type PartSeg = Segment & { tax?: { from: Vec3; to: Vec3 } };

const rotZero = (r: Rot3) => Math.abs(r.a) < 1e-9 && Math.abs(r.b) < 1e-9 && Math.abs(r.c) < 1e-9;
const rotSame = (p: Rot3, q: Rot3) => Math.abs(p.a - q.a) < 1e-9 && Math.abs(p.b - q.b) < 1e-9 && Math.abs(p.c - q.c) < 1e-9;
const lerp = (p: Vec3, q: Vec3, t: number): Vec3 => ({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t, z: p.z + (q.z - p.z) * t });

/** Program korzysta z obrotu stołu albo TCP — wymaga symulacji w układzie detalu. */
export function isMultiAxis(program: Program): boolean {
  return program.segments.some((sg) => sg.kind !== "dwell" && (sg.tcp || (sg.r && (!rotZero(sg.r.from) || !rotZero(sg.r.to)))));
}

/** Kąty stołu w danym miejscu odcinka. */
export function rotAt(sg: Segment, t: number): Rot3 {
  if (sg.kind === "dwell" || !sg.r) return { a: 0, b: 0, c: 0 };
  return lerpRot(sg.r.from, sg.r.to, t);
}

/** Odcinki maszyny → odcinki w układzie detalu z osią narzędzia. */
export function toPartFrame(segs: Segment[], kin: Kin): PartSeg[] {
  const out: PartSeg[] = [];
  const toPart = (m: Vec3, r: Rot3) => mulV(tr(tableMat(kin, r)), m);
  let last: Rot3 = { a: 0, b: 0, c: 0 };
  for (const sg of segs) {
    if (sg.kind === "dwell") {
      const p = toPart(sg.from, last);
      out.push({ ...sg, from: p, to: { ...p } });
      continue;
    }
    const r0 = sg.r?.from ?? { a: 0, b: 0, c: 0 }, r1 = sg.r?.to ?? r0;
    last = r1;
    const base = { line: sg.line, ...(sg.tcp ? { tcp: true } : {}) };
    // stały obrót: odcinek prosty zostaje prosty; łuk — tylko bez obrotu (inaczej leży w pochylonej płaszczyźnie)
    if (rotSame(r0, r1)) {
      const ax = toolAxis(kin, r0);
      if (sg.kind === "arc" && rotZero(r0)) { out.push({ ...sg, tax: { from: ax, to: ax } }); continue; }
      if (sg.kind !== "arc") { out.push({ kind: sg.kind, from: toPart(sg.from, r0), to: toPart(sg.to, r0), ...base, r: { from: r0, to: r1 }, tax: { from: ax, to: ax } }); continue; }
      const n = Math.max(4, Math.ceil(Math.abs(arcParams(sg).sweep) / (4 * Math.PI / 180)));
      let prev = toPart(sg.from, r0);
      for (let k = 1; k <= n; k++) {
        const p = toPart(pointAt(sg, k / n), r0);
        out.push({ kind: "linear", from: prev, to: p, ...base, r: { from: r0, to: r1 }, tax: { from: ax, to: ax } });
        prev = p;
      }
      continue;
    }
    // obrót w czasie ruchu: TCP — wierzchołek prosto w układzie detalu, bez TCP — prosto idą osie maszyny
    const dAng = Math.max(Math.abs(r1.a - r0.a), Math.abs(r1.b - r0.b), Math.abs(r1.c - r0.c));
    const n = Math.max(1, Math.ceil(dAng / 2), sg.kind === "arc" ? 16 : 1);
    const p0 = toPart(sg.from, r0), p1 = toPart(sg.to, r1);
    const at = (t: number) => (sg.tcp && sg.kind !== "arc" ? lerp(p0, p1, t) : toPart(pointAt(sg, t), lerpRot(r0, r1, t)));
    let prev = p0, prevR = r0;
    for (let k = 1; k <= n; k++) {
      const t = k / n, rk = lerpRot(r0, r1, t);
      const p = k === n ? p1 : at(t);
      out.push({ kind: sg.kind === "rapid" ? "rapid" : "linear", from: prev, to: p, ...base, r: { from: prevR, to: rk }, tax: { from: toolAxis(kin, prevR), to: toolAxis(kin, rk) } });
      prev = p; prevR = rk;
    }
  }
  return out;
}

/** Oś narzędzia (jednostkowa) w danym miejscu odcinka w układzie detalu; bez danych — pionowo. */
export function axisAt(sg: PartSeg, t: number): Vec3 {
  if (!sg.tax) return { x: 0, y: 0, z: 1 };
  const v = lerp(sg.tax.from, sg.tax.to, t);
  const l = Math.hypot(v.x, v.y, v.z) || 1;
  return { x: v.x / l, y: v.y / l, z: v.z / l };
}
