/*
  Rysownik GCat — model rysunku (paczka RA).
  Rysunek to lista elementów w jednostkach SVG rysunków serwisu: szerokość 360, wysokość `h` (jak fig.tsx).
  Styl nie jest dowolny: element wybiera RODZAJ linii, wypełnienie i rodzaj tekstu z zamkniętych list,
  a wygląd (kolor, grubość, kreska) bierze się z tych samych klas CSS co rysunki pisane kodem.
  Ten plik nie zna Reacta ani DOM — geometria, normalizacja i zapis; testy: tests/rys.test.ts.
*/

export const RYS_W = 360;
export const H_MIN = 80, H_MAX = 480, H_DEFAULT = 240;

export const LINE_KINDS = ["con", "cons", "dim", "axis", "cut", "rap", "arc", "acc", "bad", "stock", "tool"] as const;
export type LineKind = (typeof LINE_KINDS)[number];
export const KIND_LABEL: Record<LineKind, string> = {
  con: "Kontur detalu", cons: "Linia pomocnicza", dim: "Cienka (wymiarowa)", axis: "Oś symetrii",
  cut: "G01 — ruch roboczy", rap: "G00 — ruch szybki", arc: "G02/G03 — łuk", acc: "Parametr (akcent)",
  bad: "Błąd / kolizja", stock: "Półfabrykat", tool: "Narzędzie",
};

export const FILLS = ["none", "hatch", "hole", "acc", "cut", "bad"] as const;
export type Fill = (typeof FILLS)[number];
export const FILL_LABEL: Record<Fill, string> = {
  none: "Bez wypełnienia", hatch: "Materiał (kreskowanie)", hole: "Otwór (tło)", acc: "Akcent", cut: "Strefa skrawania", bad: "Błąd",
};

export const ARROWS = ["none", "end", "start", "both"] as const;
export type Arrow = (typeof ARROWS)[number];
export const ARROW_LABEL: Record<Arrow, string> = { none: "Bez grotów", end: "Grot na końcu", start: "Grot na początku", both: "Groty z obu stron" };

export const TEXT_COLORS = ["ink", "mut", "acc", "cut", "rap", "arc", "bad"] as const;
export type TextColor = (typeof TEXT_COLORS)[number];
export const TEXT_COLOR_LABEL: Record<TextColor, string> = {
  ink: "Podstawowy", mut: "Przygaszony", acc: "Akcent", cut: "G01 zielony", rap: "G00 bursztyn", arc: "G02/G03 niebieski", bad: "Błąd",
};
export const SIZES = ["sm", "md", "lg"] as const;
export type Size = (typeof SIZES)[number];
export const ANCHORS = ["start", "middle", "end"] as const;
export type Anchor = (typeof ANCHORS)[number];
export const POSITIONS = ["n", "ne", "e", "se", "s", "sw", "w", "nw"] as const;
export type Pos = (typeof POSITIONS)[number];
export const PT_COLORS = ["ink", "cut", "rap", "arc"] as const;
export type PtColor = (typeof PT_COLORS)[number];

export type P2 = [number, number];
interface Base { id: string }
export type LineItem = Base & { t: "line"; k: LineKind; thick: boolean; arrow: Arrow; x1: number; y1: number; x2: number; y2: number };
export type PolyItem = Base & { t: "poly"; k: LineKind; thick: boolean; arrow: Arrow; fill: Fill; closed: boolean; pts: P2[] };
export type RectItem = Base & { t: "rect"; k: LineKind; thick: boolean; fill: Fill; x: number; y: number; w: number; h: number; r: number };
export type CircleItem = Base & { t: "circle"; k: LineKind; thick: boolean; fill: Fill; cx: number; cy: number; r: number };
/** Łuk od kąta a0 do a1 zgodnie z ruchem wskazówek zegara na ekranie (oś Y w dół), kąty w stopniach, 0 = w prawo. */
export type ArcItem = Base & { t: "arc"; k: LineKind; thick: boolean; arrow: Arrow; cx: number; cy: number; r: number; a0: number; a1: number };
export type TextItem = Base & { t: "text"; x: number; y: number; s: string; anchor: Anchor; size: Size; bold: boolean; mono: boolean; color: TextColor };
/** Wymiar jak Dim z fig.tsx: linia między punktami odsunięta o `off`, opis po stronie `side`. */
export type DimItem = Base & { t: "dim"; x1: number; y1: number; x2: number; y2: number; off: number; label: string; side: 1 | -1 };
export type PtItem = Base & { t: "pt"; x: number; y: number; label: string; pos: Pos; color: PtColor };
export type StepItem = Base & { t: "step"; x: number; y: number; n: number };
export type GridItem = Base & { t: "grid"; x: number; y: number; w: number; h: number; minor: number; major: number };
export type Item = LineItem | PolyItem | RectItem | CircleItem | ArcItem | TextItem | DimItem | PtItem | StepItem | GridItem;
export type ItemType = Item["t"];
export const ITEM_LABEL: Record<ItemType, string> = {
  line: "Linia", poly: "Polilinia", rect: "Prostokąt", circle: "Okrąg", arc: "Łuk", text: "Tekst", dim: "Wymiar", pt: "Punkt", step: "Numer kroku", grid: "Siatka",
};

export interface RysDoc { h: number; items: Item[] }
/** Zapis w pliku: bez id, punkty polilinii jako tekst „x,y x,y”. */
export type StoredItem = Record<string, string | number | boolean>;
export interface StoredDoc { h: number; items: StoredItem[] }

/* ───────────── liczby ───────────── */
export const r5 = (v: number) => Math.round(v * 2) / 2;
const num = (v: unknown, d: number, lo = -200, hi = 800) => (typeof v === "number" && Number.isFinite(v) ? Math.min(hi, Math.max(lo, r5(v))) : d);
const oneOf = <T extends string>(v: unknown, list: readonly T[], d: T): T => (typeof v === "string" && (list as readonly string[]).includes(v) ? (v as T) : d);
const bool = (v: unknown, d = false) => (typeof v === "boolean" ? v : d);
const str = (v: unknown, max = 80) => (typeof v === "string" ? v.replace(/[\u0000-\u001f]/g, " ").slice(0, max) : "");

let seq = 0;
export const newId = () => `e${(++seq).toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`;

export const ptsToText = (pts: P2[]) => pts.map(([x, y]) => `${r5(x)},${r5(y)}`).join(" ");
export function textToPts(s: unknown): P2[] {
  if (typeof s !== "string") return [];
  const out: P2[] = [];
  for (const part of s.trim().split(/\s+/)) {
    const m = part.match(/^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/);
    if (m) out.push([num(+m[1], 0), num(+m[2], 0)]);
  }
  return out;
}

/* ───────────── odczyt i zapis ───────────── */

/** Dowolna wartość (plik, schowek, szkic z localStorage) → poprawny rysunek. Nieznane elementy i pola są pomijane. */
export function parseDoc(raw: unknown): RysDoc {
  const o = (raw && typeof raw === "object" ? raw : {}) as { h?: unknown; items?: unknown };
  const items: Item[] = [];
  for (const it of Array.isArray(o.items) ? o.items.slice(0, 400) : []) {
    const item = parseItem(it);
    if (item) items.push(item);
  }
  return { h: num(o.h, H_DEFAULT, H_MIN, H_MAX), items };
}

export function parseItem(raw: unknown): Item | null {
  if (!raw || typeof raw !== "object") return null;
  const v = raw as Record<string, unknown>;
  const id = newId();
  const k = oneOf(v.k, LINE_KINDS, "con"), thick = bool(v.thick);
  switch (v.t) {
    case "line": return { id, t: "line", k, thick, arrow: oneOf(v.arrow, ARROWS, "none"), x1: num(v.x1, 0), y1: num(v.y1, 0), x2: num(v.x2, 0), y2: num(v.y2, 0) };
    case "poly": {
      const pts = Array.isArray(v.pts) ? (v.pts as unknown[]).flatMap((p): P2[] => (Array.isArray(p) && p.length === 2 ? [[num(p[0], 0), num(p[1], 0)]] : [])) : textToPts(v.pts);
      if (pts.length < 2) return null;
      return { id, t: "poly", k, thick, arrow: oneOf(v.arrow, ARROWS, "none"), fill: oneOf(v.fill, FILLS, "none"), closed: bool(v.closed), pts: pts.slice(0, 200) };
    }
    case "rect": return { id, t: "rect", k, thick, fill: oneOf(v.fill, FILLS, "none"), x: num(v.x, 0), y: num(v.y, 0), w: num(v.w, 10, 0.5), h: num(v.h, 10, 0.5), r: num(v.r, 0, 0, 100) };
    case "circle": return { id, t: "circle", k, thick, fill: oneOf(v.fill, FILLS, "none"), cx: num(v.cx, 0), cy: num(v.cy, 0), r: num(v.r, 5, 0.5, 400) };
    case "arc": return { id, t: "arc", k, thick, arrow: oneOf(v.arrow, ARROWS, "none"), cx: num(v.cx, 0), cy: num(v.cy, 0), r: num(v.r, 5, 0.5, 400), a0: num(v.a0, 0, -360, 360), a1: num(v.a1, 90, -360, 360) };
    case "text": {
      const s = str(v.s);
      if (!s.trim()) return null;
      return { id, t: "text", x: num(v.x, 0), y: num(v.y, 0), s, anchor: oneOf(v.anchor, ANCHORS, "start"), size: oneOf(v.size, SIZES, "md"), bold: bool(v.bold), mono: bool(v.mono), color: oneOf(v.color, TEXT_COLORS, "ink") };
    }
    case "dim": return { id, t: "dim", x1: num(v.x1, 0), y1: num(v.y1, 0), x2: num(v.x2, 0), y2: num(v.y2, 0), off: num(v.off, 0, -200, 200), label: str(v.label, 40), side: v.side === 1 ? 1 : -1 };
    case "pt": return { id, t: "pt", x: num(v.x, 0), y: num(v.y, 0), label: str(v.label, 40), pos: oneOf(v.pos, POSITIONS, "ne"), color: oneOf(v.color, PT_COLORS, "ink") };
    case "step": return { id, t: "step", x: num(v.x, 0), y: num(v.y, 0), n: num(v.n, 1, 1, 99) | 0 };
    case "grid": return { id, t: "grid", x: num(v.x, 0), y: num(v.y, 0), w: num(v.w, 100, 5), h: num(v.h, 100, 5), minor: num(v.minor, 5, 2.5, 50), major: num(v.major, 10, 5, 100) };
    default: return null;
  }
}

/** Rysunek → zapis w pliku. Stała kolejność kluczy, bez id — ten sam rysunek daje zawsze ten sam plik. */
export function storeDoc(doc: RysDoc): StoredDoc {
  return { h: doc.h, items: doc.items.map(storeItem) };
}
export function storeItem(it: Item): StoredItem {
  switch (it.t) {
    case "line": return { t: it.t, k: it.k, thick: it.thick, arrow: it.arrow, x1: it.x1, y1: it.y1, x2: it.x2, y2: it.y2 };
    case "poly": return { t: it.t, k: it.k, thick: it.thick, arrow: it.arrow, fill: it.fill, closed: it.closed, pts: ptsToText(it.pts) };
    case "rect": return { t: it.t, k: it.k, thick: it.thick, fill: it.fill, x: it.x, y: it.y, w: it.w, h: it.h, r: it.r };
    case "circle": return { t: it.t, k: it.k, thick: it.thick, fill: it.fill, cx: it.cx, cy: it.cy, r: it.r };
    case "arc": return { t: it.t, k: it.k, thick: it.thick, arrow: it.arrow, cx: it.cx, cy: it.cy, r: it.r, a0: it.a0, a1: it.a1 };
    case "text": return { t: it.t, x: it.x, y: it.y, s: it.s, anchor: it.anchor, size: it.size, bold: it.bold, mono: it.mono, color: it.color };
    case "dim": return { t: it.t, x1: it.x1, y1: it.y1, x2: it.x2, y2: it.y2, off: it.off, label: it.label, side: it.side };
    case "pt": return { t: it.t, x: it.x, y: it.y, label: it.label, pos: it.pos, color: it.color };
    case "step": return { t: it.t, x: it.x, y: it.y, n: it.n };
    case "grid": return { t: it.t, x: it.x, y: it.y, w: it.w, h: it.h, minor: it.minor, major: it.major };
  }
}

/* ───────────── geometria ───────────── */
const RAD = Math.PI / 180;
/** 6 miejsc po przecinku: ten sam zapis po stronie serwera i przeglądarki (hydratacja). */
const r6 = (v: number) => Math.round(v * 1e6) / 1e6;
export const arcPoint = (cx: number, cy: number, r: number, a: number): P2 => [r6(cx + r * Math.cos(a * RAD)), r6(cy + r * Math.sin(a * RAD))];
/** Rozwarcie łuku w stopniach, (0, 360]. */
export const arcSweep = (a0: number, a1: number) => { const s = (((a1 - a0) % 360) + 360) % 360; return s === 0 ? 360 : s; };
export function arcPath(a: Pick<ArcItem, "cx" | "cy" | "r" | "a0" | "a1">): string {
  const sweep = arcSweep(a.a0, a.a1);
  const [sx, sy] = arcPoint(a.cx, a.cy, a.r, a.a0);
  if (sweep === 360) { const [mx, my] = arcPoint(a.cx, a.cy, a.r, a.a0 + 180); return `M ${sx} ${sy} A ${a.r} ${a.r} 0 1 1 ${mx} ${my} A ${a.r} ${a.r} 0 1 1 ${sx} ${sy}`; }
  const [ex, ey] = arcPoint(a.cx, a.cy, a.r, a.a1);
  return `M ${sx} ${sy} A ${a.r} ${a.r} 0 ${sweep > 180 ? 1 : 0} 1 ${ex} ${ey}`;
}
export const polyPath = (pts: P2[], closed: boolean) => pts.map(([x, y], i) => `${i ? "L" : "M"} ${x} ${y}`).join(" ") + (closed ? " Z" : "");
export const angleOf = (cx: number, cy: number, x: number, y: number) => r5(Math.atan2(y - cy, x - cx) / RAD);

/** Prostokąt otaczający [x0, y0, x1, y1]. */
export function bbox(it: Item): [number, number, number, number] {
  switch (it.t) {
    case "line": case "dim": return [Math.min(it.x1, it.x2), Math.min(it.y1, it.y2), Math.max(it.x1, it.x2), Math.max(it.y1, it.y2)];
    case "poly": { const xs = it.pts.map((p) => p[0]), ys = it.pts.map((p) => p[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; }
    case "rect": case "grid": return [it.x, it.y, it.x + it.w, it.y + it.h];
    case "circle": case "arc": return [it.cx - it.r, it.cy - it.r, it.cx + it.r, it.cy + it.r];
    case "text": { const w = it.s.length * (it.size === "lg" ? 7.5 : it.size === "sm" ? 5 : 6), x0 = it.anchor === "start" ? it.x : it.anchor === "middle" ? it.x - w / 2 : it.x - w; return [x0, it.y - 10, x0 + w, it.y + 3]; }
    case "pt": return [it.x - 4, it.y - 4, it.x + 4, it.y + 4];
    case "step": return [it.x - 8, it.y - 8, it.x + 8, it.y + 8];
  }
}

export function translate<T extends Item>(it: T, dx: number, dy: number): T {
  const m = (v: number) => r5(v);
  switch (it.t) {
    case "line": case "dim": return { ...it, x1: m(it.x1 + dx), y1: m(it.y1 + dy), x2: m(it.x2 + dx), y2: m(it.y2 + dy) };
    case "poly": return { ...it, pts: it.pts.map(([x, y]): P2 => [m(x + dx), m(y + dy)]) };
    case "circle": case "arc": return { ...it, cx: m(it.cx + dx), cy: m(it.cy + dy) };
    default: return { ...it, x: m(it.x + dx), y: m(it.y + dy) };
  }
}

export interface Handle { key: string; x: number; y: number }
/** Uchwyty do zmiany kształtu zaznaczonego elementu. */
export function handles(it: Item): Handle[] {
  switch (it.t) {
    case "line": return [{ key: "p1", x: it.x1, y: it.y1 }, { key: "p2", x: it.x2, y: it.y2 }];
    case "dim": {
      const [nx, ny] = dimNormal(it), mx = (it.x1 + it.x2) / 2, my = (it.y1 + it.y2) / 2;
      return [{ key: "p1", x: it.x1, y: it.y1 }, { key: "p2", x: it.x2, y: it.y2 }, { key: "off", x: mx + nx * it.off, y: my + ny * it.off }];
    }
    case "poly": return it.pts.map(([x, y], i) => ({ key: `v${i}`, x, y }));
    case "rect": case "grid": return [{ key: "nw", x: it.x, y: it.y }, { key: "ne", x: it.x + it.w, y: it.y }, { key: "se", x: it.x + it.w, y: it.y + it.h }, { key: "sw", x: it.x, y: it.y + it.h }];
    case "circle": return [{ key: "r", x: it.cx + it.r, y: it.cy }];
    case "arc": { const [sx, sy] = arcPoint(it.cx, it.cy, it.r, it.a0), [ex, ey] = arcPoint(it.cx, it.cy, it.r, it.a1); return [{ key: "c", x: it.cx, y: it.cy }, { key: "s", x: sx, y: sy }, { key: "e", x: ex, y: ey }]; }
    default: return [];
  }
}

export function dimNormal(d: Pick<DimItem, "x1" | "y1" | "x2" | "y2">): P2 {
  const dx = d.x2 - d.x1, dy = d.y2 - d.y1, L = Math.hypot(dx, dy) || 1;
  return [-dy / L, dx / L];
}

/** Przeciągnięcie uchwytu `key` do punktu (x, y). */
export function moveHandle(it: Item, key: string, x: number, y: number): Item {
  switch (it.t) {
    case "line": return key === "p1" ? { ...it, x1: x, y1: y } : { ...it, x2: x, y2: y };
    case "dim": {
      if (key === "p1") return { ...it, x1: x, y1: y };
      if (key === "p2") return { ...it, x2: x, y2: y };
      const [nx, ny] = dimNormal(it);
      return { ...it, off: r5((x - (it.x1 + it.x2) / 2) * nx + (y - (it.y1 + it.y2) / 2) * ny) };
    }
    case "poly": { const i = +key.slice(1); return { ...it, pts: it.pts.map((p, j): P2 => (j === i ? [x, y] : p)) }; }
    case "rect": case "grid": {
      const x0 = key === "nw" || key === "sw" ? it.x + it.w : it.x, y0 = key === "nw" || key === "ne" ? it.y + it.h : it.y; // róg przeciwległy zostaje
      const min = it.t === "grid" ? 5 : 0.5;
      return { ...it, x: Math.min(x0, x), y: Math.min(y0, y), w: Math.max(min, Math.abs(x - x0)), h: Math.max(min, Math.abs(y - y0)) };
    }
    case "circle": return { ...it, r: Math.max(0.5, r5(Math.hypot(x - it.cx, y - it.cy))) };
    case "arc": {
      if (key === "c") return { ...it, cx: x, cy: y };
      if (key === "s") return { ...it, r: Math.max(0.5, r5(Math.hypot(x - it.cx, y - it.cy))), a0: angleOf(it.cx, it.cy, x, y) };
      return { ...it, a1: angleOf(it.cx, it.cy, x, y) };
    }
    default: return it;
  }
}

/** Punkty charakterystyczne do przyciągania: końce, wierzchołki, środki, rogi. */
export function snapPoints(items: Item[], skip: Set<string> = new Set()): P2[] {
  const out: P2[] = [];
  for (const it of items) {
    if (skip.has(it.id) || it.t === "grid" || it.t === "text" || it.t === "step") continue;
    if (it.t === "pt") { out.push([it.x, it.y]); continue; }
    if (it.t === "circle") { out.push([it.cx, it.cy], [it.cx + it.r, it.cy], [it.cx - it.r, it.cy], [it.cx, it.cy + it.r], [it.cx, it.cy - it.r]); continue; }
    for (const h of handles(it)) if (h.key !== "off") out.push([h.x, h.y]);
    if (it.t === "line") out.push([(it.x1 + it.x2) / 2, (it.y1 + it.y2) / 2]);
  }
  return out;
}

export interface SnapOptions { grid: number; points?: P2[]; tol?: number }
/** Przyciąganie: najpierw do punktu charakterystycznego w zasięgu `tol`, potem do siatki (grid 0 = bez siatki). */
export function snap(x: number, y: number, o: SnapOptions): { x: number; y: number; to: "point" | "grid" | "free" } {
  const tol = o.tol ?? 4;
  let best: P2 | null = null, bd = tol;
  for (const p of o.points ?? []) { const d = Math.hypot(p[0] - x, p[1] - y); if (d <= bd) { bd = d; best = p; } }
  if (best) return { x: best[0], y: best[1], to: "point" };
  if (o.grid > 0) return { x: Math.round(x / o.grid) * o.grid, y: Math.round(y / o.grid) * o.grid, to: "grid" };
  return { x: r5(x), y: r5(y), to: "free" };
}

/** Shift: kierunek co 45° od punktu początkowego, długość zachowana na osi dominującej. */
export function constrain(x0: number, y0: number, x: number, y: number): P2 {
  const dx = x - x0, dy = y - y0, ax = Math.abs(dx), ay = Math.abs(dy);
  if (ax > 2 * ay) return [x, y0];
  if (ay > 2 * ax) return [x0, y];
  const d = Math.max(ax, ay);
  return [x0 + Math.sign(dx) * d, y0 + Math.sign(dy) * d];
}

export const intersects = (a: [number, number, number, number], b: [number, number, number, number]) => a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1];
export const length = (x1: number, y1: number, x2: number, y2: number) => Math.round(Math.hypot(x2 - x1, y2 - y1) * 10) / 10;

/* ───────────── legenda ───────────── */
export const LEGEND_KEYS = [...LINE_KINDS, "hatch"] as const;
export type LegendKey = (typeof LEGEND_KEYS)[number];
export const LEGEND_LABEL: Record<LegendKey, string> = {
  con: "kontur detalu", cons: "linia pomocnicza", dim: "wymiar", axis: "oś", cut: "G01 — ruch roboczy", rap: "G00 — ruch szybki",
  arc: "G02/G03 — łuk", acc: "parametr", bad: "błąd / kolizja", stock: "półfabrykat", tool: "narzędzie", hatch: "materiał",
};
/** Legenda automatyczna: rodzaje linii i wypełnień użyte na rysunku, w stałej kolejności. */
export function autoLegend(doc: RysDoc): LegendKey[] {
  const used = new Set<LegendKey>();
  for (const it of doc.items) {
    if (it.t === "dim") used.add("dim");
    if ("k" in it) used.add(it.k);
    if ("fill" in it && it.fill === "hatch") used.add("hatch");
  }
  const order: LegendKey[] = ["con", "hatch", "stock", "tool", "cut", "rap", "arc", "acc", "bad", "axis", "cons", "dim"];
  return order.filter((k) => used.has(k));
}

export interface RysFigure { slug: string; title: string; code: string; caption: string; legend: { k: LegendKey; label: string }[]; h: number; items: StoredItem[] }
