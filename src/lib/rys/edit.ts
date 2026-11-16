import {
  arcSweep, bulgeArc, newId, polySegs, q, type ArcItem, type Item, type LineItem, type P2, type PolyItem,
} from "./model";

/*
  Edycja geometrii jak w CAD (paczka RB3): utnij, wydłuż, rozbij, złącz, lustro.
  Każdy element zamienia się na ciąg krzywych: odcinków (L) i łuków (A: kąt początkowy s, kąt rozwarcia w ze znakiem,
  w > 0 — zgodnie z ruchem wskazówek na ekranie). Parametr t ∈ [0, 1] na krzywej, s = i + t na całym ciągu.
  Bez Reacta i DOM — testy: tests/rys-edit.test.ts.
*/

export type Curve = { k: "L"; a: P2; b: P2 } | { k: "A"; cx: number; cy: number; r: number; s: number; w: number };
const RAD = Math.PI / 180, EPS = 1e-6;
const n360 = (a: number) => ((a % 360) + 360) % 360;

export function at(c: Curve, t: number): P2 {
  if (c.k === "L") return [c.a[0] + (c.b[0] - c.a[0]) * t, c.a[1] + (c.b[1] - c.a[1]) * t];
  const a = (c.s + c.w * t) * RAD;
  return [c.cx + c.r * Math.cos(a), c.cy + c.r * Math.sin(a)];
}
/** Parametr punktu o kącie φ na łuku (null — poza łukiem). */
function onA(c: Extract<Curve, { k: "A" }>, phi: number): number | null {
  if (Math.abs(c.w) >= 360 - EPS) return n360(phi - c.s) / 360;
  const d = c.w > 0 ? n360(phi - c.s) : n360(c.s - phi), u = d / Math.abs(c.w);
  return u <= 1 + EPS ? Math.min(1, u) : null;
}
const angleAt = (cx: number, cy: number, p: P2) => Math.atan2(p[1] - cy, p[0] - cx) / RAD;

/** Element → ciąg krzywych; null — element, którego nie da się ciąć (tekst, wymiar, punkt…). */
export function curvesOf(it: Item): { cs: Curve[]; closed: boolean } | null {
  switch (it.t) {
    case "line": return { cs: [{ k: "L", a: [it.x1, it.y1], b: [it.x2, it.y2] }], closed: false };
    case "poly": return {
      cs: polySegs(it).map(([p, qq, b]): Curve => {
        const g = b ? bulgeArc(p, qq, b) : null;
        if (!g) return { k: "L", a: p, b: qq };
        const sw = arcSweep(g.a0, g.a1);
        return b > 0 ? { k: "A", cx: g.cx, cy: g.cy, r: g.r, s: g.a0, w: sw } : { k: "A", cx: g.cx, cy: g.cy, r: g.r, s: g.a1, w: -sw };
      }),
      closed: it.closed && it.pts.length > 2,
    };
    case "rect": {
      const { x, y, w, h } = it, r = Math.min(it.r, w / 2, h / 2);
      if (r <= 0) return { cs: [[x, y, x + w, y], [x + w, y, x + w, y + h], [x + w, y + h, x, y + h], [x, y + h, x, y]].map(([a, b, c, d]): Curve => ({ k: "L", a: [a, b], b: [c, d] })), closed: true };
      return {
        cs: [
          { k: "L", a: [x + r, y], b: [x + w - r, y] }, { k: "A", cx: x + w - r, cy: y + r, r, s: 270, w: 90 },
          { k: "L", a: [x + w, y + r], b: [x + w, y + h - r] }, { k: "A", cx: x + w - r, cy: y + h - r, r, s: 0, w: 90 },
          { k: "L", a: [x + w - r, y + h], b: [x + r, y + h] }, { k: "A", cx: x + r, cy: y + h - r, r, s: 90, w: 90 },
          { k: "L", a: [x, y + h - r], b: [x, y + r] }, { k: "A", cx: x + r, cy: y + r, r, s: 180, w: 90 },
        ],
        closed: true,
      };
    }
    case "circle": return { cs: [{ k: "A", cx: it.cx, cy: it.cy, r: it.r, s: 0, w: 360 }], closed: true };
    case "arc": return { cs: [{ k: "A", cx: it.cx, cy: it.cy, r: it.r, s: it.a0, w: arcSweep(it.a0, it.a1) }], closed: false };
    default: return null;
  }
}

/** Przecięcia dwóch krzywych: [t na pierwszej, t na drugiej]. `ray` — pierwsza krzywa to prosta bez końców (wydłużanie). */
export function cross(c1: Curve, c2: Curve, ray = false): [number, number][] {
  const out: [number, number][] = [];
  if (c1.k === "L" && c2.k === "L") {
    const d1x = c1.b[0] - c1.a[0], d1y = c1.b[1] - c1.a[1], d2x = c2.b[0] - c2.a[0], d2y = c2.b[1] - c2.a[1];
    const den = d1x * d2y - d1y * d2x;
    if (Math.abs(den) < 1e-12) return out;
    const t = ((c2.a[0] - c1.a[0]) * d2y - (c2.a[1] - c1.a[1]) * d2x) / den, u = ((c2.a[0] - c1.a[0]) * d1y - (c2.a[1] - c1.a[1]) * d1x) / den;
    if ((ray || (t >= -EPS && t <= 1 + EPS)) && u >= -EPS && u <= 1 + EPS) out.push([t, u]);
    return out;
  }
  if (c1.k === "L" && c2.k === "A") {
    const dx = c1.b[0] - c1.a[0], dy = c1.b[1] - c1.a[1], fx = c1.a[0] - c2.cx, fy = c1.a[1] - c2.cy;
    const A = dx * dx + dy * dy, B = 2 * (fx * dx + fy * dy), C = fx * fx + fy * fy - c2.r * c2.r, D = B * B - 4 * A * C;
    if (A < 1e-12 || D < -1e-9) return out;
    const sq = Math.sqrt(Math.max(0, D));
    for (const t of D < 1e-9 ? [-B / (2 * A)] : [(-B - sq) / (2 * A), (-B + sq) / (2 * A)]) {
      if (!ray && (t < -EPS || t > 1 + EPS)) continue;
      const u = onA(c2, angleAt(c2.cx, c2.cy, at(c1, t)));
      if (u !== null) out.push([t, u]);
    }
    return out;
  }
  if (c1.k === "A" && c2.k === "L") return cross(c2, c1).map(([a, b]) => [b, a]);
  const a1 = c1 as Extract<Curve, { k: "A" }>, a2 = c2 as Extract<Curve, { k: "A" }>;
  const dx = a2.cx - a1.cx, dy = a2.cy - a1.cy, d = Math.hypot(dx, dy);
  if (d < 1e-9 || d > a1.r + a2.r + 1e-9 || d < Math.abs(a1.r - a2.r) - 1e-9) return out;
  const a = (a1.r * a1.r - a2.r * a2.r + d * d) / (2 * d), h = Math.sqrt(Math.max(0, a1.r * a1.r - a * a));
  const mx = a1.cx + (a * dx) / d, my = a1.cy + (a * dy) / d;
  const pts: P2[] = h < 1e-9 ? [[mx, my]] : [[mx + (h * dy) / d, my - (h * dx) / d], [mx - (h * dy) / d, my + (h * dx) / d]];
  for (const p of pts) {
    const u1 = onA(a1, angleAt(a1.cx, a1.cy, p)), u2 = onA(a2, angleAt(a2.cx, a2.cy, p));
    if (u1 !== null && u2 !== null) out.push([u1, u2]);
  }
  return out;
}

/** Najbliższy punkt krzywej: parametr i odległość. */
export function nearest(c: Curve, p: P2): { t: number; d: number } {
  if (c.k === "L") {
    const dx = c.b[0] - c.a[0], dy = c.b[1] - c.a[1], L2 = dx * dx + dy * dy;
    const t = L2 < 1e-12 ? 0 : Math.max(0, Math.min(1, ((p[0] - c.a[0]) * dx + (p[1] - c.a[1]) * dy) / L2));
    const x = at(c, t);
    return { t, d: Math.hypot(p[0] - x[0], p[1] - x[1]) };
  }
  const u = onA(c, angleAt(c.cx, c.cy, p));
  if (u !== null) return { t: u, d: Math.abs(Math.hypot(p[0] - c.cx, p[1] - c.cy) - c.r) };
  const e0 = at(c, 0), e1 = at(c, 1), d0 = Math.hypot(p[0] - e0[0], p[1] - e0[1]), d1 = Math.hypot(p[0] - e1[0], p[1] - e1[1]);
  return d0 < d1 ? { t: 0, d: d0 } : { t: 1, d: d1 };
}

function sub(c: Curve, t0: number, t1: number): Curve {
  if (c.k === "L") return { k: "L", a: at(c, t0), b: at(c, t1) };
  return { ...c, s: c.s + c.w * t0, w: c.w * (t1 - t0) };
}
/** Fragment ciągu od s0 do s1 (dla zamkniętego s1 może przekraczać liczbę krzywych — zawija). */
export function piece(cs: Curve[], s0: number, s1: number): Curve[] {
  const n = cs.length, out: Curve[] = [];
  for (let i = Math.floor(s0); i < s1 - EPS; i++) {
    const t0 = Math.max(0, s0 - i), t1 = Math.min(1, s1 - i);
    if (t1 - t0 > EPS) out.push(sub(cs[((i % n) + n) % n], t0, t1));
  }
  return out;
}

type Styled = Pick<LineItem, "k" | "sw"> & { g?: string; l?: string };
/** Sąsiednie łuki tego samego okręgu (np. po zawinięciu okręgu) i współliniowe odcinki łączą się w jedną krzywą. */
function merge(cs: Curve[]): Curve[] {
  const out: Curve[] = [];
  for (const c of cs) {
    const p = out[out.length - 1];
    if (p && p.k === "A" && c.k === "A" && Math.abs(p.cx - c.cx) < 1e-6 && Math.abs(p.cy - c.cy) < 1e-6 && Math.abs(p.r - c.r) < 1e-6 && Math.sign(p.w) === Math.sign(c.w)
      && Math.abs(n360(p.s + p.w - c.s + 180) - 180) < 1e-4) out[out.length - 1] = { ...p, w: p.w + c.w };
    else if (p && p.k === "L" && c.k === "L" && Math.abs((p.b[0] - p.a[0]) * (c.b[1] - c.a[1]) - (p.b[1] - p.a[1]) * (c.b[0] - c.a[0])) < 1e-6 && Math.hypot(p.b[0] - c.a[0], p.b[1] - c.a[1]) < 1e-6
      && (p.b[0] - p.a[0]) * (c.b[0] - c.a[0]) + (p.b[1] - p.a[1]) * (c.b[1] - c.a[1]) > 0) out[out.length - 1] = { k: "L", a: p.a, b: c.b };
    else out.push(c);
  }
  return out;
}
const keep = (src: Item) => ({ ...("g" in src && src.g ? { g: src.g } : {}), ...(src.l ? { l: src.l } : {}) });
/** Ciąg krzywych → element: jeden odcinek → linia, jeden łuk → łuk, więcej → polilinia z łukami. */
export function toItem(cs0: Curve[], st: Styled, src: Item, closed = false, fill: PolyItem["fill"] = "none"): Item | null {
  const cs = merge(cs0);
  if (!cs.length) return null;
  const base = { id: newId(), ...keep(src), k: st.k, sw: st.sw };
  if (cs.length === 1 && !closed) {
    const c = cs[0];
    if (c.k === "L") return { ...base, t: "line", arrow: "none", x1: q(c.a[0]), y1: q(c.a[1]), x2: q(c.b[0]), y2: q(c.b[1]) };
    const [a0, a1] = c.w > 0 ? [c.s, c.s + c.w] : [c.s + c.w, c.s];
    return { ...base, t: "arc", arrow: "none", cx: q(c.cx), cy: q(c.cy), r: q(c.r), a0: q(n360(a0)), a1: q(n360(a1)) } satisfies ArcItem;
  }
  const pts: P2[] = cs.map((c) => { const p = at(c, 0); return [q(p[0]), q(p[1])]; });
  if (!closed) { const e = at(cs[cs.length - 1], 1); pts.push([q(e[0]), q(e[1])]); }
  const b = cs.map((c) => (c.k === "A" ? Math.round(Math.tan((c.w * RAD) / 4) * 1e4) / 1e4 : 0));
  if (!closed) b.push(0);
  return { ...base, t: "poly", arrow: "none", fill: closed ? fill : "none", closed, pts, ...(b.some((x) => x) ? { b } : {}) };
}

/* ───────────── utnij (TRIM) ───────────── */
export interface TrimResult { add: Item[]; cut: Curve[] }
/**
  Utnij: kawałek elementu `target` między najbliższymi przecięciami po obu stronach punktu `p` znika.
  Krawędzie tnące — wszystkie `others` i pozostałe krzywe samego elementu. Bez przecięć element znika cały.
*/
export function trim(target: Item, others: Item[], p: P2): TrimResult | null {
  const cv = curvesOf(target);
  if (!cv) return null;
  const { cs, closed } = cv, n = cs.length;
  const cuts: number[] = [];
  const edges: Curve[] = others.flatMap((o) => (o.id === target.id ? [] : curvesOf(o)?.cs ?? []));
  cs.forEach((c, i) => {
    // krawędź obca może przejść też przez wierzchołek (t = 0 albo 1); własne krzywe tną tylko we wnętrzu obu
    for (const e of edges) for (const [t] of cross(c, e)) cuts.push(i + Math.max(0, Math.min(1, t)));
    cs.forEach((e, j) => { if (j !== i) for (const [t, u] of cross(c, e)) if (t > EPS && t < 1 - EPS && u > EPS && u < 1 - EPS) cuts.push(i + t); });
  });
  const norm = cuts.map((x) => (closed ? ((x % n) + n) % n : x)).filter((x) => closed || (x > EPS && x < n - EPS));
  const sorted = [...new Set(norm.map((x) => Math.round(x * 1e7) / 1e7 % (closed ? n : Infinity)))].sort((a, b) => a - b);
  let best = { s: 0, d: Infinity };
  cs.forEach((c, i) => { const r = nearest(c, p); if (r.d < best.d) best = { s: i + r.t, d: r.d }; });
  const sc = best.s;
  if (!sorted.length || (closed && sorted.length < 2)) return { add: [], cut: cs };
  const st: Styled = { k: "k" in target ? target.k : "con", sw: "sw" in target ? target.sw : "auto" };
  if (!closed) {
    const lo = [...sorted].reverse().find((s) => s < sc) ?? 0, hi = sorted.find((s) => s > sc) ?? n;
    const add = [lo > 0 ? toItem(piece(cs, 0, lo), st, target) : null, hi < n ? toItem(piece(cs, hi, n), st, target) : null].filter((x): x is Item => !!x);
    return { add, cut: piece(cs, lo, hi) };
  }
  const lo = [...sorted].reverse().find((s) => s < sc) ?? sorted[sorted.length - 1] - n, hi = sorted.find((s) => s > sc) ?? sorted[0] + n;
  const rest = toItem(piece(cs, hi, lo + n), st, target);
  return { add: rest ? [rest] : [], cut: piece(cs, lo, hi) };
}

/* ───────────── wydłuż (EXTEND) ───────────── */
/** Wydłuż koniec linii, łuku albo otwartej polilinii (koniec bliższy punktowi `p`) do najbliższej krawędzi. */
export function extend(target: Item, others: Item[], p: P2): Item | null {
  const edges: Curve[] = others.flatMap((o) => (o.id === target.id ? [] : curvesOf(o)?.cs ?? []));
  const lineEnd = (a: P2, b: P2): P2 | null => { // wydłuż odcinek a→b za punkt b
    const c: Curve = { k: "L", a, b };
    let tb = Infinity;
    for (const e of edges) for (const [t] of cross(c, e, true)) if (t > 1 + 1e-4 && t < tb) tb = t;
    return Number.isFinite(tb) ? [q(a[0] + (b[0] - a[0]) * tb), q(a[1] + (b[1] - a[1]) * tb)] : null;
  };
  const d = (x: P2) => Math.hypot(x[0] - p[0], x[1] - p[1]);
  if (target.t === "line") {
    const p1: P2 = [target.x1, target.y1], p2: P2 = [target.x2, target.y2];
    if (d(p2) <= d(p1)) { const e = lineEnd(p1, p2); return e ? { ...target, x2: e[0], y2: e[1] } : null; }
    const e = lineEnd(p2, p1); return e ? { ...target, x1: e[0], y1: e[1] } : null;
  }
  if (target.t === "poly" && !target.closed) {
    const pts = target.pts, n = pts.length, atEnd = d(pts[n - 1]) <= d(pts[0]);
    const bi = atEnd ? n - 2 : 0;
    if (target.b?.[bi]) return null; // koniec na łuku — łuk polilinii nie wydłuża się (rozbij ją najpierw)
    const e = atEnd ? lineEnd(pts[n - 2], pts[n - 1]) : lineEnd(pts[1], pts[0]);
    if (!e) return null;
    return { ...target, pts: atEnd ? [...pts.slice(0, -1), e] : [e, ...pts.slice(1)] };
  }
  if (target.t === "arc") {
    const full: Curve = { k: "A", cx: target.cx, cy: target.cy, r: target.r, s: 0, w: 360 };
    const sw = arcSweep(target.a0, target.a1), e0: P2 = [target.cx + target.r * Math.cos(target.a0 * RAD), target.cy + target.r * Math.sin(target.a0 * RAD)];
    const e1: P2 = [target.cx + target.r * Math.cos(target.a1 * RAD), target.cy + target.r * Math.sin(target.a1 * RAD)];
    const fwd = d(e1) <= d(e0);
    let best = Infinity;
    for (const e of edges) for (const [t] of cross(full, e)) {
      const phi = t * 360, dd = fwd ? n360(phi - target.a1) : n360(target.a0 - phi);
      if (dd > 1e-3 && dd < 360 - sw - 1e-3 && dd < best) best = dd;
    }
    if (!Number.isFinite(best)) return null;
    return fwd ? { ...target, a1: q(n360(target.a1 + best)) } : { ...target, a0: q(n360(target.a0 - best)) };
  }
  return null;
}

/* ───────────── rozbij i złącz ───────────── */
/** Prostokąt, polilinia → osobne odcinki i łuki. */
export function explode(it: Item): Item[] | null {
  if (it.t !== "rect" && it.t !== "poly") return null;
  const cv = curvesOf(it)!, st: Styled = { k: it.k, sw: it.sw };
  return cv.cs.map((c) => toItem([c], st, it)).filter((x): x is Item => !!x);
}
/** Linie, łuki i otwarte polilinie stykające się końcami (do 0,05) → jedna polilinia; zamknięta, gdy koniec wraca na początek. */
export function join(items: Item[], tol = 0.05): Item | null {
  const chains = items.map((it) => (it.t === "line" || it.t === "arc" || (it.t === "poly" && !it.closed) ? curvesOf(it)!.cs : null));
  if (chains.some((c) => !c) || chains.length < 2) return null;
  const rev = (cs: Curve[]): Curve[] => [...cs].reverse().map((c): Curve => (c.k === "L" ? { k: "L", a: c.b, b: c.a } : { ...c, s: c.s + c.w, w: -c.w }));
  const near = (a: P2, b: P2) => Math.hypot(a[0] - b[0], a[1] - b[1]) <= tol;
  let path = chains[0]!;
  const left = chains.slice(1) as Curve[][];
  while (left.length) {
    const s = at(path[0], 0), e = at(path[path.length - 1], 1);
    const i = left.findIndex((c) => near(at(c[0], 0), e) || near(at(c[c.length - 1], 1), e) || near(at(c[c.length - 1], 1), s) || near(at(c[0], 0), s));
    if (i < 0) return null; // nie wszystkie się stykają
    const c = left.splice(i, 1)[0];
    if (near(at(c[0], 0), e)) path = [...path, ...c];
    else if (near(at(c[c.length - 1], 1), e)) path = [...path, ...rev(c)];
    else if (near(at(c[c.length - 1], 1), s)) path = [...c, ...path];
    else path = [...rev(c), ...path];
  }
  const first = items[0], closed = near(at(path[0], 0), at(path[path.length - 1], 1)) && path.length > 2;
  return toItem(path, { k: "k" in first ? first.k : "con", sw: "sw" in first ? first.sw : "auto" }, first, closed);
}

/** Ścieżka SVG ciągu krzywych (podgląd w edytorze). */
export function curvesPath(cs: Curve[]): string {
  return cs.map((c) => {
    const a = at(c, 0), b = at(c, 1);
    if (c.k === "L") return `M ${a[0]} ${a[1]} L ${b[0]} ${b[1]}`;
    if (Math.abs(c.w) >= 360 - EPS) { const m = at(c, 0.5); return `M ${a[0]} ${a[1]} A ${c.r} ${c.r} 0 1 1 ${m[0]} ${m[1]} A ${c.r} ${c.r} 0 1 1 ${a[0]} ${a[1]}`; }
    return `M ${a[0]} ${a[1]} A ${c.r} ${c.r} 0 ${Math.abs(c.w) > 180 ? 1 : 0} ${c.w > 0 ? 1 : 0} ${b[0]} ${b[1]}`;
  }).join(" ");
}
/** Element pod kursorem: najbliższa krzywa w promieniu `tol`. */
export function pickCurve(items: Item[], p: P2, tol: number): Item | null {
  let best: Item | null = null, bd = tol;
  for (const it of items) for (const c of curvesOf(it)?.cs ?? []) { const d = nearest(c, p).d; if (d < bd) { bd = d; best = it; } }
  return best;
}
