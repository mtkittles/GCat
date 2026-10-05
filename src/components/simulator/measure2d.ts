import { arcParams, planeAxes, pointAt, type Segment, type Vec3 } from "@/lib/parser";

/*
  Wymiarowanie na rzucie 2D jak w CAD/CAM. Elementy do wskazania:
  • punkt — koniec ruchu roboczego, środek łuku, naroże półfabrykatu,
  • linia — prosty ruch roboczy albo krawędź półfabrykatu,
  • okrąg / łuk — łuk w płaszczyźnie rzutu (G02/G03).
  Narzędzia:
  • „Odległość”: punkt–punkt (wymiar poziomy, pionowy albo wyrównany — zależnie od tego, gdzie
    położysz linię wymiarową), punkt–linia i linia–linia równoległe (prostopadle do linii),
    łuk działa jak jego środek; dwie linie nierównoległe dają kąt.
  • „Kąt”: dwie linie — kąt między nimi, po stronie wskazanych miejsc.
  • „Ø/R”: okrąg pełny (otwór, kieszeń) — średnica, łuk — promień.
  Współrzędne [h, v] to osie rzutu: frezarka X/Y, tokarka Z/X (promień).
*/

export type Pt2 = [number, number];
export type MeasTool = "dist" | "ang" | "dia";
/** Wskazany element: `q` — miejsce wskazania rzutowane na element. */
export type Ent =
  | { t: "p"; p: Pt2 }
  | { t: "l"; a: Pt2; b: Pt2; q: Pt2 }
  | { t: "c"; c: Pt2; r: number; full: boolean; q: Pt2 };
export type Meas2 =
  /** wymiar liniowy między punktami wzdłuż kierunku `dir` (poziomo / pionowo / wyrównany), linia wymiarowa odsunięta o `off` */
  | { kind: "lin"; a: Pt2; b: Pt2; dir: Pt2; off: number }
  /** odległość prostopadła do linii: `a` na pierwszym elemencie, `b` — spodek na prostej; `ext` — przedłużenie krawędzi do spodka */
  | { kind: "perp"; a: Pt2; b: Pt2; ext: [Pt2, Pt2] | null; par: boolean }
  /** kąt w wierzchołku `o` między półprostymi `u` i `v` (wektory jednostkowe) */
  | { kind: "ang"; o: Pt2; u: Pt2; v: Pt2 }
  /** średnica (dia) albo promień okręgu; `at` — kąt [rad], pod którym rysujemy linię wymiarową */
  | { kind: "rad"; c: Pt2; r: number; at: number; dia: boolean };

type Ax = keyof Vec3;

const sub = (a: Pt2, b: Pt2): Pt2 => [a[0] - b[0], a[1] - b[1]];
const add = (a: Pt2, b: Pt2): Pt2 => [a[0] + b[0], a[1] + b[1]];
const mul = (a: Pt2, k: number): Pt2 => [a[0] * k, a[1] * k];
const dot = (a: Pt2, b: Pt2) => a[0] * b[0] + a[1] * b[1];
const len = (a: Pt2) => Math.hypot(a[0], a[1]);
const unit = (a: Pt2): Pt2 => { const l = len(a) || 1; return [a[0] / l, a[1] / l]; };
const cross = (a: Pt2, b: Pt2) => a[0] * b[1] - a[1] * b[0];

/** Łuk leży w płaszczyźnie rzutu — w widoku jest prawdziwym okręgiem. */
function inView(sg: Extract<Segment, { kind: "arc" }>, ha: Ax, va: Ax) {
  if ((sg as { tax?: unknown }).tax) return false;   // 4/5 osi: łuk w pochylonej płaszczyźnie
  const [a, b] = planeAxes(sg.plane);
  return (a === ha && b === va) || (a === va && b === ha);
}

/** Geometria do wskazywania: punkty (bez powtórzeń), odcinki i łuki z toru roboczego oraz krawędzie półfabrykatu. */
export interface Geo2 { pts: Float64Array; lines: Float64Array; arcs: { c: Pt2; r: number; seg: Extract<Segment, { kind: "arc" }> | null; full: boolean }[] }

export function buildGeo(segs: Segment[], ha: Ax, va: Ax, boxes: { x0: number; y0: number; x1: number; y1: number }[] = [], limit = 60_000): Geo2 {
  const seen = new Set<string>();
  const pts: number[] = [], lines: number[] = [];
  const arcs: Geo2["arcs"] = [];
  const addP = (h: number, v: number) => {
    if (!Number.isFinite(h) || !Number.isFinite(v)) return;
    const k = `${Math.round(h * 1000)}:${Math.round(v * 1000)}`;
    if (seen.has(k)) return;
    seen.add(k); pts.push(h, v);
  };
  for (const b of boxes) {
    const c: Pt2[] = [[b.x0, b.y0], [b.x1, b.y0], [b.x1, b.y1], [b.x0, b.y1]];
    c.forEach((p, i) => { addP(p[0], p[1]); const q = c[(i + 1) % 4]; lines.push(p[0], p[1], q[0], q[1]); });
  }
  for (const sg of segs) {
    if (pts.length >= limit * 2) break;
    if (sg.kind === "rapid" || sg.kind === "dwell") continue;
    const a: Pt2 = [sg.from[ha], sg.from[va]], b: Pt2 = [sg.to[ha], sg.to[va]];
    addP(a[0], a[1]); addP(b[0], b[1]);
    if (sg.kind === "linear") { if (len(sub(b, a)) > 1e-4) lines.push(a[0], a[1], b[0], b[1]); continue; }
    if (!inView(sg, ha, va)) continue;
    const { r, sweep } = arcParams(sg);
    addP(sg.center[ha], sg.center[va]);
    arcs.push({ c: [sg.center[ha], sg.center[va]], r, seg: sg, full: Math.abs(sweep) > Math.PI * 1.98 });
  }
  return { pts: Float64Array.from(pts), lines: Float64Array.from(lines), arcs };
}

/** Najbliższy punkt w promieniu `tol` albo null. */
export function nearestPoint(pts: Float64Array, h: number, v: number, tol: number): Pt2 | null {
  let best = tol * tol, bi = -1;
  for (let i = 0; i < pts.length; i += 2) {
    const d = (pts[i] - h) ** 2 + (pts[i + 1] - v) ** 2;
    if (d <= best) { best = d; bi = i; }
  }
  return bi < 0 ? null : [pts[bi], pts[bi + 1]];
}

/** Najbliższy odcinek w promieniu `tol` (wskazanie rzutowane na odcinek). */
export function nearestLine(lines: Float64Array, h: number, v: number, tol: number): Extract<Ent, { t: "l" }> | null {
  let best = tol, hit: Extract<Ent, { t: "l" }> | null = null;
  for (let i = 0; i < lines.length; i += 4) {
    const a: Pt2 = [lines[i], lines[i + 1]], b: Pt2 = [lines[i + 2], lines[i + 3]];
    const d = sub(b, a), L2 = dot(d, d);
    const t = Math.max(0, Math.min(1, dot(sub([h, v], a), d) / L2));
    const q = add(a, mul(d, t));
    const dist = len(sub([h, v], q));
    if (dist < best) { best = dist; hit = { t: "l", a, b, q }; }
  }
  return hit;
}

/** Łuk / okrąg najbliżej wskazania (odległość od samego łuku, nie całego okręgu). */
export function nearestArc(arcs: Geo2["arcs"], h: number, v: number, tol: number): Extract<Ent, { t: "c" }> | null {
  let best = tol, hit: Extract<Ent, { t: "c" }> | null = null;
  for (const a of arcs) {
    if (Math.abs(Math.hypot(h - a.c[0], v - a.c[1]) - a.r) > best) continue;
    if (a.full || !a.seg) {
      const ang = Math.atan2(v - a.c[1], h - a.c[0]);
      const q: Pt2 = [a.c[0] + a.r * Math.cos(ang), a.c[1] + a.r * Math.sin(ang)];
      const d = len(sub([h, v], q));
      if (d < best) { best = d; hit = { t: "c", c: a.c, r: a.r, full: a.full, q }; }
      continue;
    }
    const [pa, pb] = planeAxes(a.seg.plane);
    const ha: Ax = a.c[0] === a.seg.center[pa] ? pa : pb, va: Ax = ha === pa ? pb : pa;
    for (let i = 0; i <= 48; i++) {
      const p = pointAt(a.seg, i / 48);
      const d = Math.hypot(p[ha] - h, p[va] - v);
      if (d < best) { best = d; hit = { t: "c", c: a.c, r: a.r, full: false, q: [p[ha], p[va]] }; }
    }
  }
  return hit;
}

/** Element pod kursorem dla danego narzędzia: punkt ma pierwszeństwo przed łukiem, łuk przed linią. */
export function pickEnt(g: Geo2, tool: MeasTool, h: number, v: number, tol: number): Ent | null {
  if (tool === "dia") return nearestArc(g.arcs, h, v, tol);
  if (tool === "dist") { const p = nearestPoint(g.pts, h, v, tol); if (p) return { t: "p", p }; }
  if (tool === "dist") { const c = nearestArc(g.arcs, h, v, tol * 0.8); if (c) return c; }
  return nearestLine(g.lines, h, v, tol * 0.8);
}

/** Punkt, od którego mierzymy: punkt, środek okręgu (wymiar od osi otworu), miejsce wskazania linii. */
const anchor = (e: Ent): Pt2 => (e.t === "p" ? e.p : e.t === "c" ? e.c : e.q);

const PAR = Math.sin((1 * Math.PI) / 180);   // linie „równoległe” — do 1°

/** Spodek prostopadłej z punktu p na prostą przez a–b i przedłużenie krawędzi, gdy spodek wypada poza odcinek. */
function foot(p: Pt2, a: Pt2, b: Pt2): { f: Pt2; ext: [Pt2, Pt2] | null } {
  const d = sub(b, a), t = dot(sub(p, a), d) / dot(d, d);
  const f = add(a, mul(d, t));
  return { f, ext: t < 0 ? [a, f] : t > 1 ? [b, f] : null };
}

/** Kąt między dwiema liniami, po stronie wskazanych miejsc; null gdy równoległe. */
export function angleOf(l1: Extract<Ent, { t: "l" }>, l2: Extract<Ent, { t: "l" }>): Extract<Meas2, { kind: "ang" }> | null {
  const d1 = unit(sub(l1.b, l1.a)), d2 = unit(sub(l2.b, l2.a));
  const den = cross(d1, d2);
  if (Math.abs(den) < PAR) return null;
  const t = cross(sub(l2.a, l1.a), d2) / den;
  const o = add(l1.a, mul(d1, t));
  const side = (d: Pt2, q: Pt2): Pt2 => { const w = sub(q, o); return len(w) > 1e-6 && dot(w, d) < 0 ? mul(d, -1) : d; };
  return { kind: "ang", o, u: side(d1, l1.q), v: side(d2, l2.q) };
}

/**
 * Wymiar z dwóch wskazanych elementów (narzędzie „Odległość” albo „Kąt”).
 * Punkt–punkt zwraca "place": linię wymiarową kładzie się trzecim kliknięciem (`placeLin`).
 */
export function measOf(tool: MeasTool, e1: Ent, e2: Ent): Meas2 | { place: [Pt2, Pt2] } | null {
  if (tool === "ang") return e1.t === "l" && e2.t === "l" ? angleOf(e1, e2) : null;
  if (e1.t === "l" && e2.t === "l") {
    const d1 = unit(sub(e1.b, e1.a)), d2 = unit(sub(e2.b, e2.a));
    if (Math.abs(cross(d1, d2)) >= PAR) return angleOf(e1, e2);
    const { f, ext } = foot(e1.q, e2.a, e2.b);
    return { kind: "perp", a: e1.q, b: f, ext, par: true };
  }
  if (e1.t === "l" || e2.t === "l") {
    const [l, o] = (e1.t === "l" ? [e1, e2] : [e2, e1]) as [Extract<Ent, { t: "l" }>, Ent];
    const p = anchor(o), { f, ext } = foot(p, l.a, l.b);
    return { kind: "perp", a: p, b: f, ext, par: false };
  }
  return { place: [anchor(e1), anchor(e2)] };
}

/**
 * Położenie linii wymiarowej punkt–punkt kursorem (jak w CAD): odsunięcie w pionie → wymiar poziomy,
 * w poziomie → pionowy, wzdłuż prostopadłej do odcinka (w pasie między punktami) → wyrównany.
 */
export function placeLin(a: Pt2, b: Pt2, cur: Pt2): Extract<Meas2, { kind: "lin" }> {
  const ab = sub(b, a), al = unit(ab);
  const lo = [Math.min(a[0], b[0]), Math.min(a[1], b[1])], hi = [Math.max(a[0], b[0]), Math.max(a[1], b[1])];
  const inX = cur[0] > lo[0] && cur[0] < hi[0], inY = cur[1] > lo[1] && cur[1] < hi[1];
  let dir: Pt2;
  if (Math.abs(ab[0]) < 1e-9) dir = [0, 1];
  else if (Math.abs(ab[1]) < 1e-9) dir = [1, 0];
  else if (inX && inY) dir = al;                 // kursor między punktami — wymiar wzdłuż odcinka
  else if (inX) dir = [1, 0];                    // nad / pod — poziomy
  else if (inY) dir = [0, 1];                    // z boku — pionowy
  else dir = al;
  // linia wymiarowa przechodzi przez kursor; odsunięcie liczone od punktu a
  const nn: Pt2 = [-dir[1], dir[0]];
  return { kind: "lin", a, b, dir, off: dot(sub(cur, a), nn) };
}

/** Wymiar średnicy / promienia ze wskazanego okręgu. */
export function radOf(e: Extract<Ent, { t: "c" }>): Extract<Meas2, { kind: "rad" }> {
  return { kind: "rad", c: e.c, r: e.r, at: Math.atan2(e.q[1] - e.c[1], e.q[0] - e.c[0]), dia: e.full };
}

const f3 = (x: number) => (Math.abs(x) < 5e-4 ? 0 : x).toFixed(3);
const deg = (r: number) => (r * 180) / Math.PI;

/** Wartość wymiaru [mm albo °]. */
export function measValue(m: Meas2): number {
  switch (m.kind) {
    case "lin": return Math.abs(dot(sub(m.b, m.a), m.dir));
    case "perp": return len(sub(m.b, m.a));
    case "ang": return deg(Math.acos(Math.max(-1, Math.min(1, dot(m.u, m.v)))));
    case "rad": return m.dia ? m.r * 2 : m.r;
  }
}

/** Opis wymiaru: wartość i szczegóły. Tokarka: X jako średnica. */
export function measLabel(m: Meas2, mode: "mill" | "lathe"): { main: string; sub: string } {
  const H = mode === "lathe" ? "Z" : "X", V = mode === "lathe" ? "X" : "Y";
  const val = measValue(m);
  switch (m.kind) {
    case "lin": {
      const d = sub(m.b, m.a);
      const kind = Math.abs(m.dir[1]) < 1e-9 ? `poziomo (Δ${H})` : Math.abs(m.dir[0]) < 1e-9 ? `pionowo (Δ${V}${mode === "lathe" ? " na promieniu" : ""})` : "wyrównany";
      return { main: `${f3(val)}`, sub: `${kind} · L ${f3(len(d))}  Δ${H} ${f3(d[0])}  Δ${V} ${f3(d[1])}` };
    }
    case "perp": return { main: `${f3(val)}`, sub: m.par ? "linie równoległe — odległość prostopadła" : "punkt–linia — odległość prostopadła" };
    case "ang": return { main: `${val.toFixed(2)}°`, sub: `uzupełnienie ${(180 - val).toFixed(2)}°` };
    case "rad": {
      const c = mode === "lathe" ? `Z${f3(m.c[0])} X${f3(m.c[1] * 2)}` : `X${f3(m.c[0])} Y${f3(m.c[1])}`;
      return { main: m.dia ? `⌀${f3(m.r * 2)}` : `R${f3(m.r)}`, sub: `${m.dia ? `R${f3(m.r)}` : `⌀${f3(m.r * 2)}`} · środek ${c}` };
    }
  }
}

type Proj = (p: Pt2) => readonly [number, number];
const YEL = "#FACC15";

function arrow(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number) {
  ctx.beginPath(); ctx.moveTo(x, y);
  ctx.lineTo(x - 9 * Math.cos(ang - 0.32), y - 9 * Math.sin(ang - 0.32));
  ctx.lineTo(x - 9 * Math.cos(ang + 0.32), y - 9 * Math.sin(ang + 0.32));
  ctx.closePath(); ctx.fill();
}

function tag(ctx: CanvasRenderingContext2D, W: number, H: number, x: number, y: number, main: string, subTxt: string) {
  ctx.font = "600 12px ui-monospace, monospace"; const w1 = ctx.measureText(main).width;
  ctx.font = "10.5px ui-monospace, monospace"; const w2 = subTxt ? ctx.measureText(subTxt).width : 0;
  const w = Math.max(w1, w2) + 14, h = subTxt ? 34 : 20;
  const bx = Math.max(4, Math.min(W - w - 4, x - w / 2)), by = Math.max(4, Math.min(H - h - 4, y - h / 2));
  ctx.fillStyle = "rgba(5,7,10,0.88)"; ctx.strokeStyle = "rgba(250,204,21,0.7)"; ctx.lineWidth = 1;
  ctx.fillRect(bx, by, w, h); ctx.strokeRect(bx + 0.5, by + 0.5, w - 1, h - 1);
  ctx.fillStyle = YEL; ctx.font = "600 12px ui-monospace, monospace"; ctx.fillText(main, bx + 7, by + 14);
  if (subTxt) { ctx.fillStyle = "#CBD5E1"; ctx.font = "10.5px ui-monospace, monospace"; ctx.fillText(subTxt, bx + 7, by + 28); }
}

/** Linia wymiarowa ze strzałkami na końcach (strzałki do środka, gdy jest miejsce). */
function dimLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  const a = Math.atan2(y2 - y1, x2 - x1);
  if (Math.hypot(x2 - x1, y2 - y1) > 22) { arrow(ctx, x2, y2, a); arrow(ctx, x1, y1, a + Math.PI); }
}

/** Rysuje wymiar na kanwie 2D. `full` — z opisem szczegółów (wymiar aktywny / podgląd). */
export function drawMeas(ctx: CanvasRenderingContext2D, m: Meas2, Q: Proj, W: number, H: number, mode: "mill" | "lathe", alpha = 1, full = true) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = YEL; ctx.fillStyle = YEL; ctx.lineWidth = 1.4;
  const lb = measLabel(m, mode);
  const thin = () => { ctx.save(); ctx.lineWidth = 1; ctx.globalAlpha = alpha * 0.6; ctx.setLineDash([]); };
  switch (m.kind) {
    case "lin": {
      // linia wymiarowa przez punkty a + dir·t + n·off; linie pomocnicze od punktów do niej
      const n: Pt2 = [-m.dir[1], m.dir[0]];
      const tb = dot(sub(m.b, m.a), m.dir);
      const pa = add(m.a, mul(n, m.off)), pb = add(add(m.a, mul(m.dir, tb)), mul(n, m.off));
      const [ax, ay] = Q(m.a), [bx, by] = Q(m.b), [px, py] = Q(pa), [qx, qy] = Q(pb);
      thin();
      const ext = (x0: number, y0: number, x1: number, y1: number) => { const L = Math.hypot(x1 - x0, y1 - y0) || 1; ctx.beginPath(); ctx.moveTo(x0 + (x1 - x0) * 3 / L, y0 + (y1 - y0) * 3 / L); ctx.lineTo(x1 + (x1 - x0) * 6 / L, y1 + (y1 - y0) * 6 / L); ctx.stroke(); };
      ext(ax, ay, px, py); ext(bx, by, qx, qy);
      ctx.restore();
      dimLine(ctx, px, py, qx, qy);
      for (const [x, y] of [[ax, ay], [bx, by]]) { ctx.beginPath(); ctx.arc(x, y, 2.4, 0, Math.PI * 2); ctx.fill(); }
      tag(ctx, W, H, (px + qx) / 2, (py + qy) / 2 - 14, lb.main, full ? lb.sub : "");
      break;
    }
    case "perp": {
      const [ax, ay] = Q(m.a), [bx, by] = Q(m.b);
      if (m.ext) { const [e0x, e0y] = Q(m.ext[0]), [e1x, e1y] = Q(m.ext[1]); ctx.save(); ctx.setLineDash([4, 4]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(e0x, e0y); ctx.lineTo(e1x, e1y); ctx.stroke(); ctx.restore(); }
      dimLine(ctx, ax, ay, bx, by);
      // znak kąta prostego przy spodku
      const u = unit([ax - bx, ay - by]), s = 7;
      const v: Pt2 = [-u[1], u[0]];
      thin(); ctx.beginPath(); ctx.moveTo(bx + u[0] * s, by + u[1] * s); ctx.lineTo(bx + u[0] * s + v[0] * s, by + u[1] * s + v[1] * s); ctx.lineTo(bx + v[0] * s, by + v[1] * s); ctx.stroke(); ctx.restore();
      tag(ctx, W, H, (ax + bx) / 2, (ay + by) / 2 - 14, lb.main, full ? lb.sub : "");
      break;
    }
    case "ang": {
      const [ox, oy] = Q(m.o);
      const [ux, uy] = Q(add(m.o, m.u)), [vx, vy] = Q(add(m.o, m.v));
      const a1 = Math.atan2(uy - oy, ux - ox), a2 = Math.atan2(vy - oy, vx - ox);
      let d = a2 - a1; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
      const R = 42;
      thin(); ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + Math.cos(a1) * (R + 14), oy + Math.sin(a1) * (R + 14)); ctx.moveTo(ox, oy); ctx.lineTo(ox + Math.cos(a2) * (R + 14), oy + Math.sin(a2) * (R + 14)); ctx.stroke(); ctx.restore();
      ctx.beginPath(); ctx.arc(ox, oy, R, a1, a1 + d, d < 0); ctx.stroke();
      arrow(ctx, ox + Math.cos(a1 + d) * R, oy + Math.sin(a1 + d) * R, a1 + d + (d > 0 ? Math.PI / 2 : -Math.PI / 2));
      arrow(ctx, ox + Math.cos(a1) * R, oy + Math.sin(a1) * R, a1 + (d > 0 ? -Math.PI / 2 : Math.PI / 2));
      const am = a1 + d / 2;
      tag(ctx, W, H, ox + Math.cos(am) * (R + 26), oy + Math.sin(am) * (R + 26), lb.main, full ? lb.sub : "");
      break;
    }
    case "rad": {
      const [cx, cy] = Q(m.c);
      const [ex, ey] = Q([m.c[0] + m.r * Math.cos(m.at), m.c[1] + m.r * Math.sin(m.at)]);
      thin(); ctx.beginPath(); ctx.moveTo(cx - 7, cy); ctx.lineTo(cx + 7, cy); ctx.moveTo(cx, cy - 7); ctx.lineTo(cx, cy + 7); ctx.stroke(); ctx.restore();
      if (m.dia) {
        const [fx, fy] = Q([m.c[0] - m.r * Math.cos(m.at), m.c[1] - m.r * Math.sin(m.at)]);
        dimLine(ctx, fx, fy, ex, ey);
      } else {
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ex, ey); ctx.stroke();
        arrow(ctx, ex, ey, Math.atan2(ey - cy, ex - cx));
      }
      tag(ctx, W, H, ex + (ex - cx) * 0.15, ey + (ey - cy) * 0.15 - 12, lb.main, full ? lb.sub : "");
      break;
    }
  }
  ctx.restore();
}

/** Podświetlenie wskazanego elementu (przed kliknięciem i po pierwszym wskazaniu). */
export function drawEnt(ctx: CanvasRenderingContext2D, e: Ent, Q: Proj, alpha = 1) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = YEL; ctx.fillStyle = YEL; ctx.lineWidth = 2.5;
  if (e.t === "p") { const [x, y] = Q(e.p); ctx.lineWidth = 1.5; ctx.strokeRect(x - 5, y - 5, 10, 10); }
  else if (e.t === "l") { const [ax, ay] = Q(e.a), [bx, by] = Q(e.b); ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke(); }
  else {
    const [cx, cy] = Q(e.c), [ex] = Q([e.c[0] + e.r, e.c[1]]);
    ctx.beginPath(); ctx.arc(cx, cy, Math.abs(ex - cx), 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(cx - 5, cy); ctx.lineTo(cx + 5, cy); ctx.moveTo(cx, cy - 5); ctx.lineTo(cx, cy + 5); ctx.stroke();
  }
  ctx.restore();
}
