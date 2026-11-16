import {
  arcSweep, bulgeArc, dimGeom, dimOffsetAt, newId, polySegs, q, type ArcItem, type Item, type LineItem, type P2, type PolyItem,
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
      closed: it.closed && (it.pts.length > 2 || !!it.b?.[1]),
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
  // w polilinii łuk ponad 180° dzielimy na połowy — wypukłość zostaje skończona (pełny okrąg = dwa półokręgi)
  const segs = cs.flatMap((c): Curve[] => (c.k === "A" && Math.abs(c.w) > 180 + 1e-9 ? [{ ...c, w: c.w / 2 }, { ...c, s: c.s + c.w / 2, w: c.w / 2 }] : [c]));
  const pts: P2[] = segs.map((c) => { const p = at(c, 0); return [q(p[0]), q(p[1])]; });
  if (!closed) { const e = at(segs[segs.length - 1], 1); pts.push([q(e[0]), q(e[1])]); }
  const b = segs.map((c) => (c.k === "A" ? Math.round(Math.tan((c.w * RAD) / 4) * 1e4) / 1e4 : 0));
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

/* ───────────── zaokrąglenie i fazowanie (FILLET / CHAMFER) ───────────── */
const unit = (a: P2, b: P2): P2 => { const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [(b[0] - a[0]) / d, (b[1] - a[1]) / d]; };
/** Prostokąt → zamknięta polilinia (do edycji narożnika). */
export function rectToPoly(it: Item): PolyItem | null {
  if (it.t === "poly") return it;
  if (it.t !== "rect") return null;
  const p = toItem(curvesOf(it)!.cs, { k: it.k, sw: it.sw }, it, true, it.fill);
  return p?.t === "poly" ? { ...p, id: it.id } : null;
}
/** Wierzchołek polilinii albo narożnik prostokąta pod kursorem (oba sąsiednie odcinki proste). */
export function vertexAt(items: Item[], p: P2, tol: number): { it: Item; i: number } | null {
  for (const it of items) {
    const pl = it.t === "rect" && it.r === 0 ? rectToPoly(it) : it.t === "poly" ? it : null;
    if (!pl) continue;
    const n = pl.pts.length;
    for (let i = 0; i < n; i++) {
      if (!pl.closed && (i === 0 || i === n - 1)) continue;
      if (Math.hypot(pl.pts[i][0] - p[0], pl.pts[i][1] - p[1]) > tol) continue;
      const bi = (i - 1 + n) % n;
      if (pl.b?.[bi] || pl.b?.[i]) continue;
      return { it, i };
    }
  }
  return null;
}
/** Zaokrąglenie (r) albo faza (chamfer: d wzdłuż obu boków) w wierzchołku i polilinii/prostokąta. */
export function cornerVertex(it: Item, i: number, v: number, chamfer: boolean): PolyItem | string {
  const pl = rectToPoly(it);
  if (!pl) return "to nie jest polilinia ani prostokąt";
  const n = pl.pts.length, P = pl.pts[(i - 1 + n) % n], V = pl.pts[i], N = pl.pts[(i + 1) % n];
  const d1 = unit(P, V), d2 = unit(V, N), cos = Math.max(-1, Math.min(1, d1[0] * d2[0] + d1[1] * d2[1])), th = Math.acos(cos);
  if (th < 1e-3) return "boki są współliniowe";
  const t = chamfer ? v : v * Math.tan(th / 2);
  if (t > Math.hypot(V[0] - P[0], V[1] - P[1]) + 1e-6 || t > Math.hypot(N[0] - V[0], N[1] - V[1]) + 1e-6) return chamfer ? "faza dłuższa niż bok" : "promień za duży dla tych boków";
  const T1: P2 = [q(V[0] - d1[0] * t), q(V[1] - d1[1] * t)], T2: P2 = [q(V[0] + d2[0] * t), q(V[1] + d2[1] * t)];
  const cr = d1[0] * d2[1] - d1[1] * d2[0], bulge = chamfer ? 0 : Math.round(Math.sign(cr) * Math.tan(th / 4) * 1e4) / 1e4;
  const b = pl.b ? [...pl.b] : pl.pts.map(() => 0);
  const pts = [...pl.pts.slice(0, i), T1, T2, ...pl.pts.slice(i + 1)];
  b.splice(i, 1, bulge, b[i] ?? 0);
  return { ...pl, pts, ...(b.some((x) => x) ? { b } : { b: undefined }) };
}
/**
  Zaokrąglenie/faza między dwiema liniami (zostają kawałki po stronie kliknięć, jak w CAD).
  r = 0 — ostry narożnik (obie linie do punktu przecięcia).
*/
export function cornerLines(l1: LineItem, c1: P2, l2: LineItem, c2: P2, v: number, chamfer: boolean): { l1: LineItem; l2: LineItem; extra: Item | null } | string {
  const den = (l1.x2 - l1.x1) * (l2.y2 - l2.y1) - (l1.y2 - l1.y1) * (l2.x2 - l2.x1);
  if (Math.abs(den) < 1e-9) return "linie są równoległe";
  // przecięcie prostych (oba parametry dowolne)
  const tx = ((l2.x1 - l1.x1) * (l2.y2 - l2.y1) - (l2.y1 - l1.y1) * (l2.x2 - l2.x1)) / den;
  const X: P2 = [l1.x1 + (l1.x2 - l1.x1) * tx, l1.y1 + (l1.y2 - l1.y1) * tx];
  const keep = (l: LineItem, c: P2): { end: "1" | "2"; far: P2 } => {
    const p1: P2 = [l.x1, l.y1], p2: P2 = [l.x2, l.y2], d = unit(p1, p2);
    const pr = (p: P2) => (p[0] - X[0]) * d[0] + (p[1] - X[1]) * d[1], sc = pr(c), s1 = pr(p1), s2 = pr(p2);
    // zostaje koniec po tej samej stronie przecięcia co kliknięcie; drugi koniec idzie do punktu styczności
    if (Math.sign(s1) !== Math.sign(s2)) return Math.sign(s1) === Math.sign(sc) ? { end: "2", far: p1 } : { end: "1", far: p2 };
    return Math.abs(s1) > Math.abs(s2) ? { end: "2", far: p1 } : { end: "1", far: p2 };
  };
  const k1 = keep(l1, c1), k2 = keep(l2, c2);
  const u1 = unit(X, k1.far), u2 = unit(X, k2.far), cos = Math.max(-1, Math.min(1, u1[0] * u2[0] + u1[1] * u2[1])), al = Math.acos(cos);
  if (al < 1e-3 || al > Math.PI - 1e-3) return "linie są współliniowe";
  const t = chamfer ? v : v / Math.tan(al / 2);
  if (t > Math.hypot(k1.far[0] - X[0], k1.far[1] - X[1]) + 1e-6 || t > Math.hypot(k2.far[0] - X[0], k2.far[1] - X[1]) + 1e-6) return chamfer ? "faza dłuższa niż linia" : "promień za duży dla tych linii";
  const T1: P2 = [q(X[0] + u1[0] * t), q(X[1] + u1[1] * t)], T2: P2 = [q(X[0] + u2[0] * t), q(X[1] + u2[1] * t)];
  const set = (l: LineItem, k: { end: "1" | "2" }, T: P2): LineItem => (k.end === "1" ? { ...l, x1: T[0], y1: T[1] } : { ...l, x2: T[0], y2: T[1] });
  let extra: Item | null = null;
  if (v > 0 && chamfer) extra = { id: newId(), ...keep2(l1), t: "line", k: l1.k, sw: l1.sw, arrow: "none", x1: T1[0], y1: T1[1], x2: T2[0], y2: T2[1] };
  else if (v > 0) {
    const bis = unit([0, 0], [u1[0] + u2[0], u1[1] + u2[1]]), h = v / Math.sin(al / 2), C: P2 = [X[0] + bis[0] * h, X[1] + bis[1] * h];
    const A1 = Math.atan2(T1[1] - C[1], T1[0] - C[0]) / RAD, A2 = Math.atan2(T2[1] - C[1], T2[0] - C[0]) / RAD;
    const [a0, a1] = arcSweep(A1, A2) <= 180 ? [A1, A2] : [A2, A1];
    extra = { id: newId(), ...keep2(l1), t: "arc", k: l1.k, sw: l1.sw, arrow: "none", cx: q(C[0]), cy: q(C[1]), r: q(v), a0: q(n360(a0)), a1: q(n360(a1)) };
  }
  return { l1: set(l1, k1, T1), l2: set(l2, k2, T2), extra };
}
const keep2 = (src: Item) => ({ ...(src.g ? { g: src.g } : {}), ...(src.l ? { l: src.l } : {}) });

/* ───────────── odsunięcie (OFFSET) ───────────── */
function inside(pts: P2[], p: P2): boolean {
  let r = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) r = !r;
  }
  return r;
}
/** Kopia odsunięta o d (jednostki rysunku) w stronę punktu `side`: linia, okrąg, łuk, polilinia (także z łukami), prostokąt. */
export function offsetItem(it: Item, d: number, side: P2): Item | null {
  if (!(d > 0)) return null;
  if (it.t === "circle" || it.t === "arc") {
    const out = Math.hypot(side[0] - it.cx, side[1] - it.cy) > it.r, r = q(it.r + (out ? d : -d));
    return r > 0.01 ? { ...it, id: newId(), r } : null;
  }
  if (it.t === "rect" && it.r === 0) {
    const inn = side[0] > it.x && side[0] < it.x + it.w && side[1] > it.y && side[1] < it.y + it.h, s = inn ? -d : d;
    return it.w + 2 * s > 0.01 && it.h + 2 * s > 0.01 ? { ...it, id: newId(), x: q(it.x - s), y: q(it.y - s), w: q(it.w + 2 * s), h: q(it.h + 2 * s) } : null;
  }
  const cv = curvesOf(it.t === "rect" ? rectToPoly(it) ?? it : it);
  if (!cv || (it.t !== "line" && it.t !== "poly" && it.t !== "rect")) return null;
  const { cs, closed } = cv;
  // strona: po prawej (na ekranie) kierunku krzywych → s = +1
  let s: number;
  if (closed) {
    const pts = cs.map((c) => at(c, 0));
    let area = 0; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; area += a[0] * b[1] - b[0] * a[1]; }
    const cw = area > 0; // y w dół: dodatnie pole = zgodnie z ruchem wskazówek, prawa strona = środek
    s = inside(pts, side) === cw ? 1 : -1;
  } else {
    let best = { i: 0, d: Infinity, t: 0 };
    cs.forEach((c, i) => { const r = nearest(c, side); if (r.d < best.d) best = { i, d: r.d, t: r.t }; });
    const c = cs[best.i], p0 = at(c, Math.max(0, best.t - 1e-3)), p1 = at(c, Math.min(1, best.t + 1e-3));
    s = (p1[0] - p0[0]) * (side[1] - p0[1]) - (p1[1] - p0[1]) * (side[0] - p0[0]) > 0 ? 1 : -1;
  }
  const off: Curve[] = [];
  for (const c of cs) {
    if (c.k === "L") { const u = unit(c.a, c.b), n: P2 = [-u[1] * s * d, u[0] * s * d]; off.push({ k: "L", a: [c.a[0] + n[0], c.a[1] + n[1]], b: [c.b[0] + n[0], c.b[1] + n[1]] }); }
    else { const r = c.r + (c.w > 0 ? -s * d : s * d); if (r <= 0.01) return null; off.push({ ...c, r }); }
  }
  // połączenia: sąsiednie odcinki proste przecinają się, reszta łączy się krótkim odcinkiem
  const out: Curve[] = [...off];
  const fix = (i: number, j: number) => {
    const a = out[i], b = out[j], ea = at(a, 1), sb = at(b, 0);
    if (Math.hypot(ea[0] - sb[0], ea[1] - sb[1]) < 1e-6) return;
    if (a.k === "L" && b.k === "L") {
      const den = (a.b[0] - a.a[0]) * (b.b[1] - b.a[1]) - (a.b[1] - a.a[1]) * (b.b[0] - b.a[0]);
      if (Math.abs(den) > 1e-12) {
        const t = ((b.a[0] - a.a[0]) * (b.b[1] - b.a[1]) - (b.a[1] - a.a[1]) * (b.b[0] - b.a[0])) / den, X: P2 = [a.a[0] + (a.b[0] - a.a[0]) * t, a.a[1] + (a.b[1] - a.a[1]) * t];
        out[i] = { ...a, b: X }; out[j] = { ...b, a: X };
        return;
      }
    }
    out.splice(j, 0, { k: "L", a: ea, b: sb });
  };
  for (let i = out.length - 2; i >= 0; i--) fix(i, i + 1);
  if (closed) { const last = out.length - 1; fix(last, 0); }
  const src = it.t === "rect" ? rectToPoly(it)! : it;
  const res = toItem(out, { k: "k" in src ? src.k : "con", sw: "sw" in src ? src.sw : "auto" }, src, closed); // kopia bez wypełnienia, jak w CAD
  if (res && (res.t === "line" || res.t === "poly") && (src.t === "line" || src.t === "poly")) res.arrow = src.arrow;
  return res;
}

/* ───────────── lustro (MIRROR) ───────────── */
/** Odbicie elementu względem osi przez punkty a, b. Tekst nie odwraca się (zostaje czytelny), przesuwa się jego punkt. */
export function mirrorItem(it: Item, a: P2, b: P2): Item {
  const d = unit(a, b), th = Math.atan2(d[1], d[0]) / RAD;
  const M = (p: P2): P2 => { const vx = p[0] - a[0], vy = p[1] - a[1], k = vx * d[0] + vy * d[1]; return [q(a[0] + 2 * k * d[0] - vx), q(a[1] + 2 * k * d[1] - vy)]; };
  const A = (x: number) => q(n360(2 * th - x));
  const right = Math.abs(((th % 90) + 90) % 90) < 1e-6 || Math.abs(((th % 90) + 90) % 90 - 90) < 1e-6;
  const id = newId();
  switch (it.t) {
    case "line": { const [p1, p2] = [M([it.x1, it.y1]), M([it.x2, it.y2])]; return { ...it, id, x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1] }; }
    case "poly": return { ...it, id, pts: it.pts.map(M), ...(it.b ? { b: it.b.map((x) => (x ? -x : 0)) } : {}) };
    case "rect": case "grid": {
      if (right) { const p1 = M([it.x, it.y]), p2 = M([it.x + it.w, it.y + it.h]); return { ...it, id, x: Math.min(p1[0], p2[0]), y: Math.min(p1[1], p2[1]) }; }
      if (it.t === "grid") { const m = M([it.x + it.w / 2, it.y + it.h / 2]); return { ...it, id, x: q(m[0] - it.w / 2), y: q(m[1] - it.h / 2) }; }
      return mirrorItem(rectToPoly(it)!, a, b);
    }
    case "circle": { const c = M([it.cx, it.cy]); return { ...it, id, cx: c[0], cy: c[1] }; }
    case "arc": { const c = M([it.cx, it.cy]); return { ...it, id, cx: c[0], cy: c[1], a0: A(it.a1), a1: A(it.a0) }; }
    case "dimr": { const c = M([it.cx, it.cy]); return { ...it, id, cx: c[0], cy: c[1], a: A(it.a) }; }
    case "dima": { const c = M([it.cx, it.cy]); return { ...it, id, cx: c[0], cy: c[1], a1: A(it.a2), a2: A(it.a1) }; }
    case "dim": {
      const g = dimGeom(it), mid = M([(g.A[0] + g.B[0]) / 2, (g.A[1] + g.B[1]) / 2]), [p1, p2] = [M([it.x1, it.y1]), M([it.x2, it.y2])];
      const nd = { ...it, id, o: right ? it.o : ("a" as const), x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1] };
      return { ...nd, off: dimOffsetAt(nd, mid) };
    }
    default: { const p = M([it.x, it.y]); return { ...it, id, x: p[0], y: p[1] } as Item; }
  }
}
