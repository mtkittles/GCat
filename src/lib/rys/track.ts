import { q, type P2, type SnapCache } from "./model";

/*
  Śledzenie jak w CAD (POLAR / OTRACK): przy rysowaniu od punktu `from` kursor dociąga do kierunków co `polar`
  stopni, do kierunków równoległych i prostopadłych do istniejących odcinków, oraz do linii wyrównania
  (poziomej / pionowej) przez punkty charakterystyczne — końce, środki odcinków, środki okręgów (osie symetrii).
  Przecięcie kierunku z linią wyrównania wygrywa, jeśli kursor jest blisko — jak w CAD.
*/

export interface Guide { a: P2; b: P2; ref?: boolean }
export interface Tracked { p: P2; guides: Guide[]; label: string }
export interface TrackOptions { from?: P2 | null; polar?: number; parallel?: boolean; align?: boolean; cache?: SnapCache; tol: number }

const RAD = Math.PI / 180;
const deg = (a: number) => ((Math.round(a * 100) / 100) % 360 + 360) % 360;
/** kąt jak w CAD (oś Y w górę), do opisu */
export const cadAngle = (a: number) => deg(-a);

interface Dir { ang: number; label: string; ref?: [P2, P2] }

export function track(c: P2, o: TrackOptions): Tracked | null {
  const { from, tol } = o;
  // ── kierunki od punktu początkowego
  let bestDir: { p: P2; d: number; dir: Dir } | null = null;
  if (from) {
    const dirs: Dir[] = [];
    if (o.polar && o.polar > 0) for (let a = 0; a < 360; a += o.polar) dirs.push({ ang: a, label: `${cadAngle(a)}°` });
    if (o.parallel && o.cache) {
      const seen = new Set<string>();
      for (const s of o.cache.segs) {
        const [a, b] = s;
        const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (L < 2) continue;
        // odcinek, z którego właśnie wychodzimy, nie podpowiada sam siebie
        if (Math.hypot(a[0] - from[0], a[1] - from[1]) < 1e-6 || Math.hypot(b[0] - from[0], b[1] - from[1]) < 1e-6) continue;
        const ang = Math.atan2(b[1] - a[1], b[0] - a[0]) / RAD;
        for (const [x, lab] of [[ang, "∥ równolegle"], [ang + 180, "∥ równolegle"], [ang + 90, "⊥ prostopadle"], [ang - 90, "⊥ prostopadle"]] as const) {
          const key = `${deg(x).toFixed(1)}`;
          if (seen.has(key + lab)) continue;
          seen.add(key + lab);
          dirs.push({ ang: x, label: lab, ref: s });
        }
      }
    }
    const vx = c[0] - from[0], vy = c[1] - from[1];
    if (Math.hypot(vx, vy) > tol * 0.8) {
      for (const dir of dirs) {
        const ux = Math.cos(dir.ang * RAD), uy = Math.sin(dir.ang * RAD);
        const t = vx * ux + vy * uy;
        if (t <= 0) continue;
        const p: P2 = [from[0] + ux * t, from[1] + uy * t];
        const d = Math.hypot(c[0] - p[0], c[1] - p[1]);
        // kierunek z biegunowego wygrywa przy remisie (pewniejszy niż przypadkowy odcinek)
        const score = d + (dir.ref ? 0.01 : 0);
        if (d < tol && (!bestDir || score < bestDir.d)) bestDir = { p, d: score, dir };
      }
    }
  }
  // ── wyrównanie z punktami charakterystycznymi (pion / poziom)
  let vert: { p: P2; d: number; sym: boolean } | null = null, horz: { p: P2; d: number; sym: boolean } | null = null;
  if (o.align && o.cache) {
    for (const { p, kind } of o.cache.pts) {
      if (kind !== "end" && kind !== "mid" && kind !== "center") continue;
      if (Math.hypot(p[0] - c[0], p[1] - c[1]) < tol) continue; // sam punkt łapie zwykłe przyciąganie
      const dx = Math.abs(p[0] - c[0]), dy = Math.abs(p[1] - c[1]);
      const sym = kind !== "end";
      if (dx < tol && (!vert || dx < vert.d)) vert = { p, d: dx, sym };
      if (dy < tol && (!horz || dy < horz.d)) horz = { p, d: dy, sym };
    }
  }
  const alignGuide = (a: { p: P2 }, at: P2): Guide => ({ a: a.p, b: at });
  const alignLabel = (a: { sym: boolean }) => (a.sym ? "oś symetrii" : "wyrównanie");

  // przecięcie kierunku z linią wyrównania
  if (bestDir && from && (vert || horz)) {
    const ux = Math.cos(bestDir.dir.ang * RAD), uy = Math.sin(bestDir.dir.ang * RAD);
    for (const al of [vert, horz]) {
      if (!al) continue;
      const isV = al === vert;
      const den = isV ? ux : uy;
      if (Math.abs(den) < 1e-9) continue;
      const t = isV ? (al.p[0] - from[0]) / ux : (al.p[1] - from[1]) / uy;
      if (t <= 0) continue;
      const p: P2 = [from[0] + ux * t, from[1] + uy * t];
      if (Math.hypot(p[0] - c[0], p[1] - c[1]) < tol * 1.5) {
        return { p: [q(p[0]), q(p[1])], guides: [dirGuide(from, p, bestDir.dir), alignGuide(al, p), ...refGuide(bestDir.dir)], label: `${bestDir.dir.label} + ${alignLabel(al)}` };
      }
    }
  }
  if (bestDir && from) return { p: [q(bestDir.p[0]), q(bestDir.p[1])], guides: [dirGuide(from, bestDir.p, bestDir.dir), ...refGuide(bestDir.dir)], label: bestDir.dir.label };
  if (vert && horz) {
    const p: P2 = [vert.p[0], horz.p[1]];
    return { p: [q(p[0]), q(p[1])], guides: [alignGuide(vert, p), alignGuide(horz, p)], label: vert.sym || horz.sym ? "oś symetrii" : "wyrównanie" };
  }
  if (vert) { const p: P2 = [vert.p[0], c[1]]; return { p: [q(p[0]), q(p[1])], guides: [alignGuide(vert, p)], label: alignLabel(vert) }; }
  if (horz) { const p: P2 = [c[0], horz.p[1]]; return { p: [q(p[0]), q(p[1])], guides: [alignGuide(horz, p)], label: alignLabel(horz) }; }
  return null;
}

function dirGuide(from: P2, p: P2, dir: Dir): Guide {
  const ux = Math.cos(dir.ang * RAD), uy = Math.sin(dir.ang * RAD);
  return { a: from, b: [p[0] + ux * 40, p[1] + uy * 40] };
}
const refGuide = (dir: Dir): Guide[] => (dir.ref ? [{ a: dir.ref[0], b: dir.ref[1], ref: true }] : []);

/** Kąt obrotu dociągnięty do wielokrotności `step`, gdy jest blisko (do 4°), albo zawsze (force). */
export function snapAngle(a: number, step: number, force = false): number {
  if (!(step > 0)) return a;
  const r = Math.round(a / step) * step;
  return force || Math.abs(r - a) < 4 ? r : a;
}
