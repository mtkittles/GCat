import { at, cross, curvesOf, toItem, type Curve } from "./edit";
import { newId, type Fill, type Item, type LineKind, type P2, type Width } from "./model";

/*
  Obszary nachodzących figur (paczka RB4) — jak „kreator kształtów” w programach graficznych i BOUNDARY w CAD.
  Krzywe wszystkich figur dzielą się w punktach przecięcia na krawędzie; z krawędzi powstaje graf płaski,
  a obejście ścian daje obszary (łuki zostają łukami). Ściana = kontur zewnętrzny + ewentualne otwory.
  Z wybranego zbioru ścian liczy się brzeg → nowe figury (suma, różnica, część wspólna, „poza wspólną”).
*/

const RAD = Math.PI / 180, TOL = 1e-3;
type Half = { e: number; fwd: boolean };
interface Edge { c: Curve; u: number; v: number }
export interface Loop { hs: Half[]; poly: P2[]; area: number }
export interface Face { id: number; outer: Loop; holes: Loop[]; area: number }
export interface Regions { edges: Edge[]; verts: P2[]; faces: Face[]; faceOf: Map<string, number>; ang: Map<string, number> }

const hk = (h: Half) => `${h.e}${h.fwd ? "+" : "-"}`;
const lenOf = (c: Curve) => (c.k === "L" ? Math.hypot(c.b[0] - c.a[0], c.b[1] - c.a[1]) : Math.abs(c.r * c.w * RAD));
function sub(c: Curve, t0: number, t1: number): Curve {
  return c.k === "L" ? { k: "L", a: at(c, t0), b: at(c, t1) } : { ...c, s: c.s + c.w * t0, w: c.w * (t1 - t0) };
}
const rev = (c: Curve): Curve => (c.k === "L" ? { k: "L", a: c.b, b: c.a } : { ...c, s: c.s + c.w, w: -c.w });
/** krzywa półkrawędzi w kierunku obejścia */
export const halfCurve = (r: Pick<Regions, "edges">, h: Half): Curve => (h.fwd ? r.edges[h.e].c : rev(r.edges[h.e].c));
function sample(c: Curve): P2[] {
  if (c.k === "L") return [c.a];
  const n = Math.max(2, Math.ceil(Math.abs(c.w) / 6));
  return Array.from({ length: n }, (_, i) => at(c, i / n));
}
function area(poly: P2[]): number {
  let s = 0;
  for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length]; s += a[0] * b[1] - b[0] * a[1]; }
  return s / 2;
}
export function inPoly(poly: P2[], p: P2): boolean {
  let r = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) r = !r;
  }
  return r;
}
/** Parametry punktów końcowych drugiego odcinka na pierwszym, gdy oba leżą na jednej prostej (nakładające się boki). */
function overlap(a: Curve, b: Curve): number[] {
  if (a.k !== "L" || b.k !== "L") return [];
  const dx = a.b[0] - a.a[0], dy = a.b[1] - a.a[1], L2 = dx * dx + dy * dy;
  if (L2 < 1e-12) return [];
  const off = (p: P2) => Math.abs((p[0] - a.a[0]) * dy - (p[1] - a.a[1]) * dx) / Math.sqrt(L2);
  if (off(b.a) > TOL || off(b.b) > TOL) return [];
  return [b.a, b.b].map((p) => ((p[0] - a.a[0]) * dx + (p[1] - a.a[1]) * dy) / L2).filter((t) => t > 1e-9 && t < 1 - 1e-9);
}

/** Graf płaski i ściany z krzywych podanych elementów (tylko te, które da się ciąć: linie, polilinie, prostokąty, okręgi, łuki). */
export function buildRegions(items: Item[], maxEdges = 1500): Regions {
  const cs: Curve[] = items.flatMap((it) => curvesOf(it)?.cs ?? []).filter((c) => lenOf(c) > 1e-6);
  // 1) podział w przecięciach (również nakładające się odcinki)
  const ts: number[][] = cs.map(() => [0, 1]);
  for (let i = 0; i < cs.length; i++) for (let j = i + 1; j < cs.length; j++) {
    for (const [t, u] of cross(cs[i], cs[j])) { ts[i].push(Math.max(0, Math.min(1, t))); ts[j].push(Math.max(0, Math.min(1, u))); }
    ts[i].push(...overlap(cs[i], cs[j])); ts[j].push(...overlap(cs[j], cs[i]));
  }
  const verts: P2[] = [];
  const vid = (p: P2) => {
    for (let i = 0; i < verts.length; i++) if (Math.abs(verts[i][0] - p[0]) < TOL && Math.abs(verts[i][1] - p[1]) < TOL) return i;
    verts.push(p); return verts.length - 1;
  };
  let edges: Edge[] = [];
  const seen = new Set<string>();
  cs.forEach((c, i) => {
    const u = [...new Set(ts[i].map((t) => Math.round(t * 1e9) / 1e9))].sort((a, b) => a - b);
    for (let k = 0; k + 1 < u.length; k++) {
      if (u[k + 1] - u[k] < 1e-9) continue;
      const s = sub(c, u[k], u[k + 1]);
      if (lenOf(s) < TOL) continue;
      const a = vid(at(s, 0)), b = vid(at(s, 1)), m = at(s, 0.5);
      const key = `${Math.min(a, b)}|${Math.max(a, b)}|${Math.round(m[0] * 100)}|${Math.round(m[1] * 100)}`;
      if (seen.has(key)) continue; // ta sama krawędź z dwóch figur (wspólny bok)
      seen.add(key);
      if (a === b && s.k === "L") continue;
      edges.push({ c: s, u: a, v: b });
      if (edges.length > maxEdges) break;
    }
  });
  // 2) krawędzie wiszące (koniec bez dalszego połączenia) nie ograniczają żadnego obszaru
  for (let changed = true; changed;) {
    changed = false;
    const deg = new Array(verts.length).fill(0);
    for (const e of edges) { deg[e.u]++; deg[e.v]++; }
    const keep = edges.filter((e) => deg[e.u] > 1 && deg[e.v] > 1);
    if (keep.length !== edges.length) { edges = keep; changed = true; }
  }
  // 3) półkrawędzie wychodzące z wierzchołka, posortowane po kącie (kierunek do punktu tuż za wierzchołkiem)
  const out = new Map<number, { h: Half; ang: number }[]>(), ang = new Map<string, number>();
  edges.forEach((e, i) => {
    const d = Math.min(0.25, 1 / Math.max(1e-9, lenOf(e.c)));
    for (const fwd of [true, false]) {
      const p0 = at(e.c, fwd ? 0 : 1), p1 = at(e.c, fwd ? d : 1 - d), v = fwd ? e.u : e.v;
      const arr = out.get(v) ?? [];
      const a = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]);
      arr.push({ h: { e: i, fwd }, ang: a }); ang.set(hk({ e: i, fwd }), a);
      out.set(v, arr);
    }
  });
  for (const arr of out.values()) arr.sort((a, b) => a.ang - b.ang);
  const end = (h: Half) => (h.fwd ? edges[h.e].v : edges[h.e].u);
  const next = (h: Half): Half => {
    const v = end(h), arr = out.get(v)!, tw = hk({ e: h.e, fwd: !h.fwd });
    const i = arr.findIndex((o) => hk(o.h) === tw);
    return arr[(i - 1 + arr.length) % arr.length].h;
  };
  // 4) obejście ścian: dodatnie pole (y w dół) — obszar ograniczony, ujemne — brzeg zewnętrzny składowej
  const used = new Set<string>(), loops: Loop[] = [];
  for (let i = 0; i < edges.length; i++) for (const fwd of [true, false]) {
    let h: Half = { e: i, fwd };
    if (used.has(hk(h))) continue;
    const hs: Half[] = [];
    for (let guard = 0; guard < edges.length * 2 + 2 && !used.has(hk(h)); guard++) { used.add(hk(h)); hs.push(h); h = next(h); }
    const poly = hs.flatMap((x) => sample(halfCurve({ edges }, x)));
    loops.push({ hs, poly, area: area(poly) });
  }
  const pos = loops.filter((l) => l.area > 1e-6).sort((a, b) => a.area - b.area);
  const faces: Face[] = pos.map((l, i) => ({ id: i, outer: l, holes: [], area: l.area }));
  const faceOf = new Map<string, number>();
  faces.forEach((f) => f.outer.hs.forEach((h) => faceOf.set(hk(h), f.id)));
  // otwór (ujemny kontur) należy do najmniejszej ściany, która go zawiera
  for (const l of loops.filter((x) => x.area < -1e-6)) {
    const probe = l.poly[0];
    const f = faces.find((x) => inPoly(x.outer.poly, probe) && !x.outer.hs.some((h) => l.hs.some((g) => g.e === h.e)));
    if (!f) continue;
    f.holes.push(l); f.area += l.area;
    l.hs.forEach((h) => faceOf.set(hk(h), f.id));
  }
  return { edges, verts, faces, faceOf, ang };
}

/** Ściana pod punktem (najmniejsza, bez otworów, w których leży punkt). */
export function faceAt(r: Regions, p: P2): Face | null {
  for (const f of r.faces) if (inPoly(f.outer.poly, p) && !f.holes.some((h) => inPoly(h.poly, p))) return f;
  return null;
}
/** Punkt na pewno wewnątrz ściany (najszersza cięciwa poziomej prostej). */
export function interior(f: Face): P2 {
  const polys = [f.outer.poly, ...f.holes.map((h) => h.poly)];
  const ys = f.outer.poly.map((p) => p[1]), y0 = Math.min(...ys), y1 = Math.max(...ys);
  let best: { p: P2; w: number } = { p: f.outer.poly[0], w: -1 };
  for (const k of [0.5, 0.37, 0.63, 0.25, 0.75, 0.13, 0.87]) {
    const y = y0 + (y1 - y0) * k, xs: number[] = [];
    for (const poly of polys) for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length];
      if ((a[1] > y) !== (b[1] > y)) xs.push(a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1]));
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) if (xs[i + 1] - xs[i] > best.w) best = { p: [(xs[i] + xs[i + 1]) / 2, y], w: xs[i + 1] - xs[i] };
  }
  return best.p;
}

/** Ścieżka SVG ściany (kontur + otwory, reguła evenodd) — podświetlenie w edytorze. */
export function facePath(f: Face): string {
  return [f.outer, ...f.holes].map((l) => `M ${l.poly.map((p) => `${p[0]} ${p[1]}`).join(" L ")} Z`).join(" ");
}

/** Brzeg zbioru ścian: kontury zewnętrzne (dodatnie) i otwory, jako ciągi krzywych. */
export function boundary(r: Regions, ids: Set<number>): { outer: Curve[][]; holes: Curve[][] } {
  const inS = (h: Half) => { const f = r.faceOf.get(hk(h)); return f !== undefined && ids.has(f); };
  const B = new Map<string, Half>();
  r.edges.forEach((_, e) => { for (const fwd of [true, false]) { const h = { e, fwd }, t = { e, fwd: !fwd }; if (inS(h) && !inS(t)) B.set(hk(h), h); } });
  const start = (h: Half) => (h.fwd ? r.edges[h.e].u : r.edges[h.e].v), end = (h: Half) => (h.fwd ? r.edges[h.e].v : r.edges[h.e].u);
  const outer: Curve[][] = [], holes: Curve[][] = [], used = new Set<string>();
  for (const h0 of B.values()) {
    if (used.has(hk(h0))) continue;
    const cyc: Half[] = [];
    let h: Half | undefined = h0;
    while (h && !used.has(hk(h))) {
      used.add(hk(h)); cyc.push(h);
      // jak przy ścianach: następna krawędź brzegu to poprzednia kątowo względem powrotu — stykające się narożnikami kontury zostają osobno
      const v = end(h), back = r.ang.get(hk({ e: h.e, fwd: !h.fwd }))!;
      const cand = [...B.values()].filter((x) => start(x) === v && !used.has(hk(x)));
      const d = (x: Half) => { let a = back - r.ang.get(hk(x))!; while (a <= 1e-12) a += 2 * Math.PI; return a; };
      h = cand.sort((a, b) => d(a) - d(b))[0];
    }
    const cs = cyc.map((x) => halfCurve(r, x));
    (area(cs.flatMap(sample)) > 0 ? outer : holes).push(cs);
  }
  return { outer, holes };
}

export interface ShapeStyle { k: LineKind; sw: Width; fill: Fill }
/**
  Brzeg → elementy: kontury zewnętrzne z wypełnieniem `st.fill`, otwory jako figury z wypełnieniem „Otwór” (zakrywają środek)
  albo bez wypełnienia, gdy kontur go nie ma. Kilka figur dostaje wspólną grupę.
*/
export function shapesFrom(b: { outer: Curve[][]; holes: Curve[][] }, st: ShapeStyle, src: Item): Item[] {
  const g = b.outer.length + b.holes.length > 1 ? newId() : undefined;
  const mk = (cs: Curve[], fill: Fill) => { const it = toItem(cs, st, src, true, fill); return it ? { ...it, ...(g ? { g } : {}) } : null; };
  return [...b.outer.map((cs) => mk(cs, st.fill)), ...b.holes.map((cs) => mk(cs, st.fill === "none" ? "none" : "hole"))].filter((x): x is Item => !!x);
}

/** Wnętrze zamkniętej figury jako wielokąt (do sprawdzenia, w których figurach leży ściana). */
export function shapePoly(it: Item): P2[] | null {
  const cv = curvesOf(it);
  return cv && cv.closed ? cv.cs.flatMap(sample) : null;
}
export type BoolOp = "union" | "subtract" | "intersect" | "xor";
/**
  Operacja logiczna na zamkniętych figurach (kolejność jak zaznaczenie: odejmowanie = pierwsza minus reszta).
  Zwraca nowe elementy w stylu pierwszej figury albo komunikat.
*/
export function boolShapes(shapes: Item[], op: BoolOp): Item[] | string {
  const polys = shapes.map(shapePoly);
  if (shapes.length < 2 || polys.some((p) => !p)) return "zaznacz co najmniej dwie zamknięte figury (prostokąt, okrąg, zamknięta polilinia)";
  const r = buildRegions(shapes);
  const ids = new Set<number>();
  for (const f of r.faces) {
    const p = interior(f), inside = polys.map((poly) => inPoly(poly!, p)), n = inside.filter(Boolean).length;
    const take = op === "union" ? n > 0 : op === "intersect" ? n === shapes.length : op === "xor" ? n % 2 === 1 : inside[0] && n === 1;
    if (take) ids.add(f.id);
  }
  if (!ids.size) return op === "intersect" ? "figury nie mają części wspólnej" : "wynik jest pusty";
  const base = shapes[0];
  const st: ShapeStyle = { k: "k" in base ? base.k : "con", sw: "sw" in base ? base.sw : "auto", fill: "fill" in base ? base.fill : "none" };
  return shapesFrom(boundary(r, ids), st, base);
}
