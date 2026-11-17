import { q, type P2 } from "./model";

/*
  Ołówek odręczny (szkicownik): ślad myszy → gładka polilinia.
  Kolejność: uśrednianie sąsiadów i uproszczenie (Ramer–Douglas–Peucker) zdejmują drżenie ręki, wygładzenie Chaikina zaokrągla załamania,
  drugie, drobne uproszczenie ogranicza liczbę punktów. Tolerancje w pikselach ekranu (px = jednostki rysunku na piksel),
  więc wynik wygląda tak samo przy każdym powiększeniu.
*/

export type Smooth = 0 | 1 | 2 | 3;
export const SMOOTH_LABEL: Record<Smooth, string> = { 0: "Brak", 1: "Małe", 2: "Średnie", 3: "Duże" };
const EPS_PX: Record<Smooth, number> = { 0: 0.6, 1: 1.2, 2: 2, 3: 3.2 };
const RELAX: Record<Smooth, number> = { 0: 0, 1: 2, 2: 5, 3: 10 };
const MAX_PTS = 400; // limit polilinii w modelu

const segDist = (p: P2, a: P2, b: P2) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy, t = L2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L2)) : 0;
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
};

/** Uśrednianie sąsiadów (jądro 1-2-1), `passes` razy — gasi drżenie ręki; końce otwartej linii zostają. */
export function relax(pts: P2[], closed: boolean, passes: number): P2[] {
  let cur = pts;
  const n = pts.length;
  if (n < 3) return pts.slice();
  for (let k = 0; k < passes; k++) {
    cur = cur.map((p, i) => {
      if (!closed && (i === 0 || i === n - 1)) return p;
      const a = cur[(i - 1 + n) % n], b = cur[(i + 1) % n];
      return [(a[0] + 2 * p[0] + b[0]) / 4, (a[1] + 2 * p[1] + b[1]) / 4] as P2;
    });
  }
  return cur;
}

/** Ramer–Douglas–Peucker: zostają punkty odległe od cięciwy o więcej niż eps (iteracyjnie, bez rekurencji). */
export function simplify(pts: P2[], eps: number): P2[] {
  if (pts.length < 3) return pts.slice();
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack: [number, number][] = [[0, pts.length - 1]];
  while (stack.length) {
    const [i, j] = stack.pop()!;
    let best = -1, bd = eps;
    for (let k = i + 1; k < j; k++) { const d = segDist(pts[k], pts[i], pts[j]); if (d > bd) { bd = d; best = k; } }
    if (best > 0) { keep[best] = 1; stack.push([i, best], [best, j]); }
  }
  return pts.filter((_, k) => keep[k]);
}

/** Wygładzenie Chaikina: każdy odcinek zastępują punkty w 1/4 i 3/4; końce otwartej linii zostają na miejscu. */
export function chaikin(pts: P2[], closed: boolean, iter: number): P2[] {
  let cur = pts;
  for (let n = 0; n < iter && cur.length >= 3; n++) {
    const out: P2[] = closed ? [] : [cur[0]], m = closed ? cur.length : cur.length - 1;
    for (let i = 0; i < m; i++) {
      const a = cur[i], b = cur[(i + 1) % cur.length];
      out.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
    }
    if (!closed) out.push(cur[cur.length - 1]);
    cur = out;
  }
  return cur;
}

/**
  Ślad ołówka → punkty polilinii. Ślad zamyka się, gdy jego końcówka wraca blisko początku (12 px), także z zakładką.
  Zwraca null dla śladu krótszego niż 3 px (samo kliknięcie).
*/
export function smoothStroke(raw: P2[], px: number, level: Smooth): { pts: P2[]; closed: boolean } | null {
  const pts = raw.filter((p, i) => i === 0 || Math.hypot(p[0] - raw[i - 1][0], p[1] - raw[i - 1][1]) > 1e-9);
  if (pts.length < 2) return null;
  let len = 0;
  for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  if (len < 3 * px) return null;
  // zamknięcie: końcówka śladu (ostatnia ćwierć) wraca blisko początku — często z zakładką, więc ucinamy w punkcie najbliższym początkowi
  const a = pts[0];
  let cut = pts.length - 1, bd = Infinity;
  for (let i = Math.floor(pts.length * 0.75); i < pts.length; i++) { const d = Math.hypot(pts[i][0] - a[0], pts[i][1] - a[1]); if (d < bd) { bd = d; cut = i; } }
  const closed = pts.length > 6 && bd < 12 * px && len > 40 * px;
  if (closed) pts.length = cut + 1;
  const soft = relax(closed ? pts.slice(0, -1) : pts, closed, RELAX[level]);
  let out = simplify(closed ? [...soft, soft[0]] : soft, EPS_PX[level] * px);
  if (closed) out = out.slice(0, -1);
  out = chaikin(out, closed, level === 0 ? 0 : level + 1);
  out = simplify(closed ? [...out, out[0]] : out, 0.3 * px);
  if (closed) out = out.slice(0, -1);
  for (let eps = 0.6; out.length > MAX_PTS; eps *= 1.6) out = simplify(out, eps * px); // bardzo długi ślad
  const res = out.map((p) => [q(p[0]), q(p[1])] as P2).filter((p, i, arr) => i === 0 || p[0] !== arr[i - 1][0] || p[1] !== arr[i - 1][1]);
  return res.length >= 2 ? { pts: res, closed: closed && res.length >= 3 } : null;
}
