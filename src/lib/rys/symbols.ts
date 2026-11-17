import type { DatumItem, Font, GdtItem, GdtSym, P2, RoughItem } from "./model";

/*
  Symbole rysunku technicznego (paczka RB6a) — sama geometria, bez Reacta (rysuje components/rys/symbols.tsx).
  Źródła:
  - ramka tolerancji geometrycznej i symbole cech: ISO 1101:2017 (tolerancje kształtu, kierunku, położenia i bicia);
    współosiowość/współśrodkowość i symetria są w ISO 1101, ASME Y14.5-2018 je usunęła;
  - symbol bazy (litera w kwadracie + trójkąt na elemencie bazowym): ISO 5459:2011 i ISO 1101:2017;
  - chropowatość: ISO 21920-1:2021 (EN ISO 21920-1:2022), która zastąpiła ISO 1302:2002 — znak podstawowy z dwóch ramion
    pod 60° do powierzchni, wariant z kreską (wymagane usunięcie materiału) i z okręgiem (bez usuwania materiału);
    proporcje ramion ≈ 1,4 h i 3 h (h — wysokość pisma) jak w ISO 1302:2002 — do weryfikacji z wydaniem 21920-1.
  Proporcje ramek i symboli są przybliżone (jak w programach CAD), nie wymiarowane wg normy.
*/

const RAD = Math.PI / 180;
const r2 = (v: number) => Math.round(v * 100) / 100 + 0;
/** Szacunkowa szerokość tekstu (bez pomiaru w przeglądarce — ten sam wynik na serwerze i w edytorze). */
export const textW = (s: string, size: number, font: Font) => s.length * size * (font === "mono" ? 0.6 : 0.58);

/* ───────────── ramka tolerancji geometrycznej ───────────── */
export interface GdtCell { x0: number; x1: number; text?: string; mod?: string }
export interface GdtLayout { x: number; y0: number; y1: number; h: number; w: number; cells: GdtCell[]; lead: { a: P2; b: P2 } | null }
export const gdtDatums = (dat: string) => dat.split("|").map((s) => s.trim()).filter(Boolean).slice(0, 3);
export function gdtLayout(it: GdtItem): GdtLayout {
  const h = r2(it.size * 1.7), pad = it.size * 0.8;
  const tolText = `${it.dia ? "⌀" : ""}${it.tol}`;
  const cells: GdtCell[] = [{ x0: 0, x1: h }];
  const tw = Math.max(h, textW(tolText, it.size, it.font) + (it.mod ? it.size * 1.15 : 0) + pad);
  cells.push({ x0: h, x1: h + tw, text: tolText, ...(it.mod ? { mod: it.mod } : {}) });
  let x = h + tw;
  for (const d of gdtDatums(it.dat)) { const w = Math.max(h, textW(d, it.size, it.font) + pad); cells.push({ x0: x, x1: x + w, text: d }); x += w; }
  const out: GdtLayout = { x: it.x, y0: r2(it.y - h / 2), y1: r2(it.y + h / 2), h, w: r2(x), cells: cells.map((c) => ({ ...c, x0: r2(it.x + c.x0), x1: r2(it.x + c.x1) })), lead: null };
  if (it.lx !== undefined && it.ly !== undefined) {
    const b: P2 = [it.lx, it.ly], xr = it.x + out.w;
    // linia odniesienia wychodzi z boku ramki bliższego wskazywanemu elementowi
    const a: P2 = b[0] < it.x ? [it.x, it.y] : b[0] > xr ? [xr, it.y] : [r2(it.x + h / 2), b[1] > it.y ? out.y1 : out.y0];
    out.lead = { a, b };
  }
  return out;
}
export function gdtBox(it: GdtItem): [number, number, number, number] {
  const L = gdtLayout(it), xs = [L.x, L.x + L.w], ys = [L.y0, L.y1];
  if (L.lead) { xs.push(L.lead.b[0]); ys.push(L.lead.b[1]); }
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

/** Rysunek symbolu cechy w kwadracie o środku (cx, cy) i połowie boku e: odcinki, okręgi, ścieżki, groty (czubek, kierunek). */
export interface Glyph { lines: [number, number, number, number][]; circles: [number, number, number][]; paths: string[]; heads: [P2, P2][] }
export function gdtGlyph(sym: GdtSym, cx: number, cy: number, e: number): Glyph {
  const g: Glyph = { lines: [], circles: [], paths: [], heads: [] };
  const L = (x1: number, y1: number, x2: number, y2: number) => g.lines.push([r2(cx + x1 * e), r2(cy + y1 * e), r2(cx + x2 * e), r2(cy + y2 * e)]);
  const C = (x: number, y: number, r: number) => g.circles.push([r2(cx + x * e), r2(cy + y * e), r2(r * e)]);
  const P = (pts: [number, number][], close = false) => g.paths.push(`M ${pts.map(([x, y]) => `${r2(cx + x * e)} ${r2(cy + y * e)}`).join(" L ")}${close ? " Z" : ""}`);
  const arrow = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy), u: P2 = [dx / l, dy / l];
    L(x1, y1, x2 - u[0] * 0.45, y2 - u[1] * 0.45);
    g.heads.push([[r2(cx + x2 * e), r2(cy + y2 * e)], u]);
  };
  switch (sym) {
    case "str": L(-0.9, 0, 0.9, 0); break; // prostoliniowość
    case "flat": P([[-0.9, 0.42], [0.45, 0.42], [0.9, -0.42], [-0.45, -0.42]], true); break; // płaskość
    case "circ": C(0, 0, 0.78); break; // okrągłość
    case "cyl": { // walcowość: okrąg i dwie styczne pochylone pod 60°
      C(0, 0, 0.55);
      const d: P2 = [0.5, -0.866], n: P2 = [0.866, 0.5];
      for (const s of [1, -1]) L(n[0] * 0.55 * s - d[0] * 1.05, n[1] * 0.55 * s - d[1] * 1.05, n[0] * 0.55 * s + d[0] * 1.05, n[1] * 0.55 * s + d[1] * 1.05);
      break;
    }
    case "pline": g.paths.push(`M ${r2(cx - 0.85 * e)} ${r2(cy + 0.35 * e)} A ${r2(0.85 * e)} ${r2(0.85 * e)} 0 0 1 ${r2(cx + 0.85 * e)} ${r2(cy + 0.35 * e)}`); break; // profil linii
    case "psurf": g.paths.push(`M ${r2(cx - 0.85 * e)} ${r2(cy + 0.35 * e)} A ${r2(0.85 * e)} ${r2(0.85 * e)} 0 0 1 ${r2(cx + 0.85 * e)} ${r2(cy + 0.35 * e)} Z`); break; // profil powierzchni
    case "par": L(-0.62, 0.75, -0.15, -0.75); L(0.15, 0.75, 0.62, -0.75); break; // równoległość
    case "perp": L(-0.85, 0.75, 0.85, 0.75); L(0, 0.75, 0, -0.85); break; // prostopadłość
    case "ang": L(-0.85, 0.75, 0.85, 0.75); L(-0.85, 0.75, 0.75, -0.17); break; // nachylenie (ramiona pod 30°)
    case "pos": C(0, 0, 0.55); L(-0.95, 0, 0.95, 0); L(0, -0.95, 0, 0.95); break; // pozycja: linie przez całą szerokość
    case "coax": C(0, 0, 0.85); C(0, 0, 0.42); break; // współosiowość / współśrodkowość
    case "sym": L(-0.55, -0.5, 0.55, -0.5); L(-0.95, 0, 0.95, 0); L(-0.55, 0.5, 0.55, 0.5); break; // symetria
    case "run": arrow(-0.6, 0.8, 0.55, -0.75); break; // bicie
    case "trun": arrow(-0.85, 0.8, 0.05, -0.75); arrow(-0.15, 0.8, 0.75, -0.75); L(-0.85, 0.8, -0.15, 0.8); break; // bicie całkowite
  }
  return g;
}

/* ───────────── symbol bazy ───────────── */
export interface DatumLayout { tri: [P2, P2, P2]; lead: [P2, P2] | null; box: [number, number, number, number] }
export function datumLayout(it: DatumItem): DatumLayout {
  const hs = it.size * 1.7, T: P2 = [it.x, it.y], B: P2 = [it.bx, it.by];
  let dx = B[0] - T[0], dy = B[1] - T[1], l = Math.hypot(dx, dy);
  if (l < 1e-6) { dx = 0; dy = -1; l = 1; }
  const d: P2 = [dx / l, dy / l], n: P2 = [-d[1], d[0]], w = hs * 0.32, th = w * Math.sqrt(3);
  const A: P2 = [T[0] + d[0] * th, T[1] + d[1] * th];
  const tri: [P2, P2, P2] = [[r2(T[0] + n[0] * w), r2(T[1] + n[1] * w)], [r2(T[0] - n[0] * w), r2(T[1] - n[1] * w)], [r2(A[0]), r2(A[1])]];
  const k = hs / 2 / Math.max(Math.abs(d[0]), Math.abs(d[1])), E: P2 = [B[0] - d[0] * k, B[1] - d[1] * k];
  const lead: [P2, P2] | null = (E[0] - A[0]) * d[0] + (E[1] - A[1]) * d[1] > 0.5 ? [[r2(A[0]), r2(A[1])], [r2(E[0]), r2(E[1])]] : null;
  return { tri, lead, box: [r2(B[0] - hs / 2), r2(B[1] - hs / 2), r2(B[0] + hs / 2), r2(B[1] + hs / 2)] };
}
export function datumBox(it: DatumItem): [number, number, number, number] {
  const L = datumLayout(it), xs = [L.box[0], L.box[2], ...L.tri.map((p) => p[0])], ys = [L.box[1], L.box[3], ...L.tri.map((p) => p[1])];
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

/* ───────────── chropowatość ───────────── */
/** Punkty znaku w układzie lokalnym (wierzchołek w 0,0, „w górę” = −y), przed obrotem o `a`. */
export function roughLocal(it: RoughItem) {
  const h = it.size * 0.75, H1 = 1.4 * h, H2 = 3 * h, t = Math.tan(30 * RAD);
  const Lp: P2 = [-H1 * t, -H1], R: P2 = [H2 * t, -H2];
  const tw = it.s ? textW(it.s, it.size, it.font) + it.size * 0.6 : 0;
  return { H1, Lp, R, bar: [Lp, [H1 * t, -H1]] as [P2, P2], circle: { c: [0, -H1 * (2 / 3)] as P2, r: H1 / 3 }, ext: it.s ? ([R, [R[0] + tw, R[1]]] as [P2, P2]) : null, text: [R[0] + it.size * 0.3, R[1] + it.size * 1.05] as P2 };
}
export function roughBox(it: RoughItem): [number, number, number, number] {
  const g = roughLocal(it), pts: P2[] = [[0, 0], g.Lp, g.R, ...(g.ext ? [g.ext[1], [g.ext[1][0], g.text[1]] as P2] : [])];
  const r = it.a * RAD, co = Math.cos(r), si = Math.sin(r);
  const w = pts.map(([x, y]): P2 => [it.x + x * co - y * si, it.y + x * si + y * co]);
  const xs = w.map((p) => p[0]), ys = w.map((p) => p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

/** Ramka z linią odniesienia: strzałka w p (element), ramka przy kursorze — po prawej albo po lewej stronie strzałki. */
export function placeGdt(tpl: GdtItem, p: P2, cur: P2): GdtItem {
  const w = gdtLayout({ ...tpl, x: 0, y: 0, lx: undefined, ly: undefined }).w;
  return { ...tpl, x: r2(cur[0] >= p[0] ? cur[0] : cur[0] - w), y: r2(cur[1]), lx: r2(p[0]), ly: r2(p[1]) };
}
/** Następna wolna litera bazy (bez I, O, Q — mylą się z cyframi, jak w praktyce rysunkowej). */
export function nextDatum(used: string[]): string {
  const taken = new Set(used.map((u) => u.toUpperCase()));
  return [..."ABCDEFGHJKLMNPRSTUVWXYZ"].find((c) => !taken.has(c)) ?? "A";
}
