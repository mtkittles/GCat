/*
  Rysownik GCat — model rysunku (paczka RA).
  Rysunek to lista elementów w jednostkach SVG rysunków serwisu: szerokość 360, wysokość `h` (jak fig.tsx).
  Styl nie jest dowolny: element wybiera RODZAJ linii, GRUBOŚĆ, wypełnienie, czcionkę i rozmiar tekstu
  z zamkniętych list, a kolory i kreski biorą się z tych samych klas CSS co rysunki pisane kodem.
  Ten plik nie zna Reacta ani DOM — geometria, przyciąganie, normalizacja i zapis; testy: tests/rys.test.ts.
*/

export const RYS_W = 360;
export const H_MIN = 80, H_MAX = 480, H_DEFAULT = 240;

export const LINE_KINDS = ["con", "cons", "dim", "axis", "faint", "cut", "rap", "arc", "acc", "bad", "stock", "tool", "none"] as const;
export type LineKind = (typeof LINE_KINDS)[number];
export const KIND_LABEL: Record<LineKind, string> = {
  con: "Kontur detalu", cons: "Linia pomocnicza", dim: "Cienka (wymiarowa)", axis: "Oś symetrii", faint: "Linia siatki (jasna)",
  cut: "G01 — ruch roboczy", rap: "G00 — ruch szybki", arc: "G02/G03 — łuk", acc: "Parametr (akcent)",
  bad: "Błąd / kolizja", stock: "Półfabrykat", tool: "Narzędzie", none: "Bez obrysu (samo wypełnienie)",
};

/** Grubość linii: „auto” = grubość rodzaju linii (jak w rysunkach z kodu), reszta w jednostkach rysunku. */
export const WIDTHS = ["auto", "xs", "s", "m", "l", "xl"] as const;
export type Width = (typeof WIDTHS)[number];
export const WIDTH_PX: Record<Exclude<Width, "auto">, number> = { xs: 0.6, s: 1, m: 1.6, l: 2.4, xl: 3.4 };
export const WIDTH_LABEL: Record<Width, string> = { auto: "Wg rodzaju", xs: "0,6", s: "1", m: "1,6", l: "2,4", xl: "3,4" };
/** grubość domyślna rodzaju = wartości z globals.css (.fig .p-…) */
export const KIND_WIDTH: Record<LineKind, number> = { con: 1.6, cons: 0.9, dim: 0.9, axis: 1, faint: 0.7, cut: 2, rap: 1.8, arc: 2, acc: 1.6, bad: 1.6, stock: 1, tool: 1, none: 0 };
export const strokeOf = (k: LineKind, sw: Width) => (k === "none" ? 0 : sw === "auto" ? KIND_WIDTH[k] : WIDTH_PX[sw]);

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
/** rozmiary tekstu w jednostkach rysunku; 9,5 / 10,5 / 11 / 14 to rozmiary rysunków z kodu (t-sm, t-mono, domyślny, t-big) */
export const FONT_SIZES = [8, 9.5, 10.5, 11, 12.5, 14, 16, 18, 22] as const;
export const FONTS = ["sans", "mono", "display"] as const;
export type Font = (typeof FONTS)[number];
export const FONT_LABEL: Record<Font, string> = { sans: "Tekst", mono: "Kod", display: "Nagłówek" };
export const FONT_CSS: Record<Font, string> = { sans: "var(--font-sans, Inter, system-ui, sans-serif)", mono: "var(--font-mono, ui-monospace, monospace)", display: "var(--font-display, var(--font-sans, sans-serif))" };
export const ANCHORS = ["start", "middle", "end"] as const;
export type Anchor = (typeof ANCHORS)[number];
export const POSITIONS = ["n", "ne", "e", "se", "s", "sw", "w", "nw"] as const;
export type Pos = (typeof POSITIONS)[number];
export const PT_COLORS = ["ink", "cut", "rap", "arc"] as const;
export type PtColor = (typeof PT_COLORS)[number];
/** wymiar: a — wyrównany do mierzonych punktów, h — poziomy, v — pionowy */
export const DIM_ORIENT = ["a", "h", "v"] as const;
export type DimOrient = (typeof DIM_ORIENT)[number];
export const DIM_ORIENT_LABEL: Record<DimOrient, string> = { a: "Wyrównany", h: "Poziomy", v: "Pionowy" };
export const MEASURE = "<>";

export type P2 = [number, number];
interface Base { id: string }
interface Stroke { k: LineKind; sw: Width }
export type LineItem = Base & Stroke & { t: "line"; arrow: Arrow; x1: number; y1: number; x2: number; y2: number };
export type PolyItem = Base & Stroke & { t: "poly"; arrow: Arrow; fill: Fill; closed: boolean; pts: P2[] };
export type RectItem = Base & Stroke & { t: "rect"; fill: Fill; x: number; y: number; w: number; h: number; r: number };
export type CircleItem = Base & Stroke & { t: "circle"; fill: Fill; cx: number; cy: number; r: number };
/** Łuk od kąta a0 do a1 zgodnie z ruchem wskazówek zegara na ekranie (oś Y w dół), kąty w stopniach, 0 = w prawo. */
export type ArcItem = Base & Stroke & { t: "arc"; arrow: Arrow; cx: number; cy: number; r: number; a0: number; a1: number };
export type TextItem = Base & { t: "text"; x: number; y: number; s: string; anchor: Anchor; size: number; font: Font; bold: boolean; color: TextColor };
/**
  Wymiar jak w CAD: mierzy p1–p2, linia wymiarowa odsunięta o `off`
  (a: wzdłuż normalnej do p1→p2; h: w pionie od środka; v: w poziomie od środka).
  `label` — tekst opisu, „<>” zastępuje zmierzona wartość (w mm wg skali rysunku).
*/
export type DimItem = Base & { t: "dim"; o: DimOrient; x1: number; y1: number; x2: number; y2: number; off: number; label: string; side: 1 | -1; size: number; font: Font; hz: boolean };
export type PtItem = Base & { t: "pt"; x: number; y: number; label: string; pos: Pos; color: PtColor };
export type StepItem = Base & { t: "step"; x: number; y: number; n: number };
export type GridItem = Base & { t: "grid"; x: number; y: number; w: number; h: number; minor: number; major: number };
export type Item = LineItem | PolyItem | RectItem | CircleItem | ArcItem | TextItem | DimItem | PtItem | StepItem | GridItem;
export type ItemType = Item["t"];
export const ITEM_LABEL: Record<ItemType, string> = {
  line: "Linia", poly: "Polilinia", rect: "Prostokąt", circle: "Okrąg", arc: "Łuk", text: "Tekst", dim: "Wymiar", pt: "Punkt", step: "Numer kroku", grid: "Siatka",
};

/** k — skala: ile jednostek rysunku to 1 mm (wymiar „<>” pokazuje długość / k). */
export interface RysDoc { h: number; k: number; items: Item[] }
/** Zapis w pliku: bez id, punkty polilinii jako tekst „x,y x,y”. */
export type StoredItem = Record<string, string | number | boolean>;
export interface StoredDoc { h: number; k: number; items: StoredItem[] }

/* ───────────── liczby ───────────── */
/** Współrzędne z dokładnością 0,01: przecięcia i punkty na łukach łączą się dokładnie, a plik zostaje czytelny. */
export const q = (v: number) => Math.round(v * 100) / 100 + 0; // „+ 0” zamienia −0 na 0
const num = (v: unknown, d: number, lo = -400, hi = 1000) => (typeof v === "number" && Number.isFinite(v) ? Math.min(hi, Math.max(lo, q(v))) : d);
const oneOf = <T extends string>(v: unknown, list: readonly T[], d: T): T => (typeof v === "string" && (list as readonly string[]).includes(v) ? (v as T) : d);
const bool = (v: unknown, d = false) => (typeof v === "boolean" ? v : d);
const str = (v: unknown, max = 80) => (typeof v === "string" ? v.replace(/[\u0000-\u001f]/g, " ").slice(0, max) : "");
const nearestSize = (v: number) => FONT_SIZES.reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a), 11 as number);
const LEGACY_SIZE: Record<string, number> = { sm: 9.5, md: 11, lg: 14 };
function size(v: unknown, d: number): number {
  if (typeof v === "string" && v in LEGACY_SIZE) return LEGACY_SIZE[v];
  return typeof v === "number" && Number.isFinite(v) ? nearestSize(v) : d;
}
/** liczba po polsku: przecinek, do 2 miejsc, bez zer na końcu */
export const fmt = (v: number) => String(Math.round(v * 100) / 100 + 0).replace(".", ",");

let seq = 0;
export const newId = () => `e${(++seq).toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`;

export const ptsToText = (pts: P2[]) => pts.map(([x, y]) => `${q(x)},${q(y)}`).join(" ");
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

/** Dowolna wartość (plik, schowek, szkic z localStorage, import) → poprawny rysunek. Nieznane elementy i pola są pomijane. */
export function parseDoc(raw: unknown): RysDoc {
  const o = (raw && typeof raw === "object" ? raw : {}) as { h?: unknown; k?: unknown; items?: unknown };
  const items: Item[] = [];
  for (const it of Array.isArray(o.items) ? o.items.slice(0, 1500) : []) {
    const item = parseItem(it);
    if (item) items.push(item);
  }
  return { h: num(o.h, H_DEFAULT, H_MIN, H_MAX), k: num(o.k, 1, 0.05, 50), items };
}

export function parseItem(raw: unknown): Item | null {
  if (!raw || typeof raw !== "object") return null;
  const v = raw as Record<string, unknown>;
  const id = newId();
  const k = oneOf(v.k, LINE_KINDS, "con");
  // dawny zapis: thick: true = gruba
  const sw: Width = v.sw === undefined && v.thick === true ? "l" : oneOf(v.sw, WIDTHS, "auto");
  const font = (d: Font): Font => (v.font === undefined && v.mono === true ? "mono" : oneOf(v.font, FONTS, d));
  switch (v.t) {
    case "line": return { id, t: "line", k, sw, arrow: oneOf(v.arrow, ARROWS, "none"), x1: num(v.x1, 0), y1: num(v.y1, 0), x2: num(v.x2, 0), y2: num(v.y2, 0) };
    case "poly": {
      const pts = Array.isArray(v.pts) ? (v.pts as unknown[]).flatMap((p): P2[] => (Array.isArray(p) && p.length === 2 ? [[num(p[0], 0), num(p[1], 0)]] : [])) : textToPts(v.pts);
      if (pts.length < 2) return null;
      return { id, t: "poly", k, sw, arrow: oneOf(v.arrow, ARROWS, "none"), fill: oneOf(v.fill, FILLS, "none"), closed: bool(v.closed), pts: pts.slice(0, 400) };
    }
    case "rect": return { id, t: "rect", k, sw, fill: oneOf(v.fill, FILLS, "none"), x: num(v.x, 0), y: num(v.y, 0), w: num(v.w, 10, 0.01), h: num(v.h, 10, 0.01), r: num(v.r, 0, 0, 100) };
    case "circle": return { id, t: "circle", k, sw, fill: oneOf(v.fill, FILLS, "none"), cx: num(v.cx, 0), cy: num(v.cy, 0), r: num(v.r, 5, 0.01, 800) };
    case "arc": return { id, t: "arc", k, sw, arrow: oneOf(v.arrow, ARROWS, "none"), cx: num(v.cx, 0), cy: num(v.cy, 0), r: num(v.r, 5, 0.01, 800), a0: num(v.a0, 0, -720, 720), a1: num(v.a1, 90, -720, 720) };
    case "text": {
      const s = str(v.s);
      if (!s.trim()) return null;
      return { id, t: "text", x: num(v.x, 0), y: num(v.y, 0), s, anchor: oneOf(v.anchor, ANCHORS, "start"), size: size(v.size, 11), font: font("sans"), bold: bool(v.bold), color: oneOf(v.color, TEXT_COLORS, "ink") };
    }
    case "dim": return {
      id, t: "dim", o: oneOf(v.o, DIM_ORIENT, "a"), x1: num(v.x1, 0), y1: num(v.y1, 0), x2: num(v.x2, 0), y2: num(v.y2, 0), off: num(v.off, 0, -400, 400),
      label: typeof v.label === "string" ? str(v.label, 40) : MEASURE, side: v.side === 1 ? 1 : -1, size: size(v.size, 10.5), font: font("mono"), hz: bool(v.hz),
    };
    case "pt": return { id, t: "pt", x: num(v.x, 0), y: num(v.y, 0), label: str(v.label, 40), pos: oneOf(v.pos, POSITIONS, "ne"), color: oneOf(v.color, PT_COLORS, "ink") };
    case "step": return { id, t: "step", x: num(v.x, 0), y: num(v.y, 0), n: Math.round(num(v.n, 1, 1, 99)) };
    case "grid": return { id, t: "grid", x: num(v.x, 0), y: num(v.y, 0), w: num(v.w, 100, 5), h: num(v.h, 100, 5), minor: num(v.minor, 5, 2.5, 50), major: num(v.major, 10, 5, 100) };
    default: return null;
  }
}

/** Rysunek → zapis w pliku. Stała kolejność kluczy, bez id — ten sam rysunek daje zawsze ten sam plik. */
export function storeDoc(doc: RysDoc): StoredDoc {
  return { h: doc.h, k: doc.k, items: doc.items.map(storeItem) };
}
export function storeItem(it: Item): StoredItem {
  switch (it.t) {
    case "line": return { t: it.t, k: it.k, sw: it.sw, arrow: it.arrow, x1: it.x1, y1: it.y1, x2: it.x2, y2: it.y2 };
    case "poly": return { t: it.t, k: it.k, sw: it.sw, arrow: it.arrow, fill: it.fill, closed: it.closed, pts: ptsToText(it.pts) };
    case "rect": return { t: it.t, k: it.k, sw: it.sw, fill: it.fill, x: it.x, y: it.y, w: it.w, h: it.h, r: it.r };
    case "circle": return { t: it.t, k: it.k, sw: it.sw, fill: it.fill, cx: it.cx, cy: it.cy, r: it.r };
    case "arc": return { t: it.t, k: it.k, sw: it.sw, arrow: it.arrow, cx: it.cx, cy: it.cy, r: it.r, a0: it.a0, a1: it.a1 };
    case "text": return { t: it.t, x: it.x, y: it.y, s: it.s, anchor: it.anchor, size: it.size, font: it.font, bold: it.bold, color: it.color };
    case "dim": return { t: it.t, o: it.o, x1: it.x1, y1: it.y1, x2: it.x2, y2: it.y2, off: it.off, label: it.label, side: it.side, size: it.size, font: it.font, hz: it.hz };
    case "pt": return { t: it.t, x: it.x, y: it.y, label: it.label, pos: it.pos, color: it.color };
    case "step": return { t: it.t, x: it.x, y: it.y, n: it.n };
    case "grid": return { t: it.t, x: it.x, y: it.y, w: it.w, h: it.h, minor: it.minor, major: it.major };
  }
}

/* ───────────── geometria ───────────── */
const RAD = Math.PI / 180;
/** 6 miejsc po przecinku: ten sam zapis po stronie serwera i przeglądarki (hydratacja). */
export const r6 = (v: number) => Math.round(v * 1e6) / 1e6 + 0;
export const arcPoint = (cx: number, cy: number, r: number, a: number): P2 => [r6(cx + r * Math.cos(a * RAD)), r6(cy + r * Math.sin(a * RAD))];
/** Rozwarcie łuku w stopniach, (0, 360]. */
export const arcSweep = (a0: number, a1: number) => { const s = (((a1 - a0) % 360) + 360) % 360; return s < 1e-9 ? 360 : s; };
export function arcPath(a: Pick<ArcItem, "cx" | "cy" | "r" | "a0" | "a1">): string {
  const sweep = arcSweep(a.a0, a.a1);
  const [sx, sy] = arcPoint(a.cx, a.cy, a.r, a.a0);
  if (sweep === 360) { const [mx, my] = arcPoint(a.cx, a.cy, a.r, a.a0 + 180); return `M ${sx} ${sy} A ${a.r} ${a.r} 0 1 1 ${mx} ${my} A ${a.r} ${a.r} 0 1 1 ${sx} ${sy}`; }
  const [ex, ey] = arcPoint(a.cx, a.cy, a.r, a.a1);
  return `M ${sx} ${sy} A ${a.r} ${a.r} 0 ${sweep > 180 ? 1 : 0} 1 ${ex} ${ey}`;
}
export const polyPath = (pts: P2[], closed: boolean) => pts.map(([x, y], i) => `${i ? "L" : "M"} ${r6(x)} ${r6(y)}`).join(" ") + (closed ? " Z" : "");
export const angleOf = (cx: number, cy: number, x: number, y: number) => q(Math.atan2(y - cy, x - cx) / RAD);
export const arcMidAngle = (a: Pick<ArcItem, "a0" | "a1">) => a.a0 + arcSweep(a.a0, a.a1) / 2;
/** czy kąt (stopnie) leży na łuku a0 → a1 (zgodnie z zegarem) */
export const onArc = (a: Pick<ArcItem, "a0" | "a1">, ang: number) => arcSweep(a.a0, ang) <= arcSweep(a.a0, a.a1) + 1e-6 || arcSweep(a.a0, a.a1) === 360;

/** Okrąg przez trzy punkty; null, gdy leżą na jednej prostej. */
export function circleFrom3(a: P2, b: P2, c: P2): { cx: number; cy: number; r: number } | null {
  const d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));
  if (Math.abs(d) < 1e-9) return null;
  const a2 = a[0] ** 2 + a[1] ** 2, b2 = b[0] ** 2 + b[1] ** 2, c2 = c[0] ** 2 + c[1] ** 2;
  const cx = (a2 * (b[1] - c[1]) + b2 * (c[1] - a[1]) + c2 * (a[1] - b[1])) / d;
  const cy = (a2 * (c[0] - b[0]) + b2 * (a[0] - c[0]) + c2 * (b[0] - a[0])) / d;
  return { cx, cy, r: Math.hypot(a[0] - cx, a[1] - cy) };
}
/** Łuk od s do e przechodzący przez m (łuk „z cięciwy”: początek, koniec, punkt na łuku). */
export function arcFrom3(s: P2, m: P2, e: P2): Pick<ArcItem, "cx" | "cy" | "r" | "a0" | "a1"> | null {
  const c = circleFrom3(s, m, e);
  if (!c || c.r > 5000) return null;
  const as = Math.atan2(s[1] - c.cy, s[0] - c.cx) / RAD, am = Math.atan2(m[1] - c.cy, m[0] - c.cx) / RAD, ae = Math.atan2(e[1] - c.cy, e[0] - c.cx) / RAD;
  // zgodnie z zegarem od s do e — jeżeli m po drodze, łuk s→e; inaczej e→s (ten sam łuk w drugą stronę)
  const cw = arcSweep(as, am) < arcSweep(as, ae);
  const [a0, a1] = cw ? [as, ae] : [ae, as];
  return { cx: q(c.cx), cy: q(c.cy), r: q(c.r), a0: Math.round(a0 * 1000) / 1000, a1: Math.round(a1 * 1000) / 1000 };
}
export const arcEnds = (a: Pick<ArcItem, "cx" | "cy" | "r" | "a0" | "a1">): [P2, P2, P2] => [arcPoint(a.cx, a.cy, a.r, a.a0), arcPoint(a.cx, a.cy, a.r, arcMidAngle(a)), arcPoint(a.cx, a.cy, a.r, a.a1)];

/* ───────────── wymiar ───────────── */
export interface DimGeom { A: P2; B: P2; e1: [P2, P2] | null; e2: [P2, P2] | null; u: P2; n: P2; len: number }
/** Geometria wymiaru: końce linii wymiarowej A–B, linie pomocnicze, kierunek u, normalna n (strona opisu), zmierzona długość. */
export function dimGeom(d: Pick<DimItem, "o" | "x1" | "y1" | "x2" | "y2" | "off">): DimGeom {
  let A: P2, B: P2, n: P2, len: number;
  if (d.o === "h") {
    const y = (d.y1 + d.y2) / 2 + d.off;
    A = [d.x1, y]; B = [d.x2, y]; n = [0, -1]; len = Math.abs(d.x2 - d.x1);
  } else if (d.o === "v") {
    const x = (d.x1 + d.x2) / 2 + d.off;
    A = [x, d.y1]; B = [x, d.y2]; n = [-1, 0]; len = Math.abs(d.y2 - d.y1);
  } else {
    const dx = d.x2 - d.x1, dy = d.y2 - d.y1, L = Math.hypot(dx, dy) || 1;
    n = [-dy / L, dx / L];
    A = [d.x1 + n[0] * d.off, d.y1 + n[1] * d.off]; B = [d.x2 + n[0] * d.off, d.y2 + n[1] * d.off]; len = Math.hypot(dx, dy);
  }
  const L = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1;
  const u: P2 = [(B[0] - A[0]) / L, (B[1] - A[1]) / L];
  // linia pomocnicza: od 2 jednostek za punktem mierzonym do 2,5 za linią wymiarową
  const ext = (p: P2, a: P2): [P2, P2] | null => {
    const vx = a[0] - p[0], vy = a[1] - p[1], dl = Math.hypot(vx, vy);
    if (dl < 2.5) return null;
    return [[p[0] + (vx / dl) * 2, p[1] + (vy / dl) * 2], [a[0] + (vx / dl) * 2.5, a[1] + (vy / dl) * 2.5]];
  };
  return { A, B, e1: ext([d.x1, d.y1], A), e2: ext([d.x2, d.y2], B), u, n, len };
}
/** Opis wymiaru: „<>” → zmierzona wartość w mm (długość / k). */
export const dimText = (d: Pick<DimItem, "label">, g: DimGeom, k: number) => d.label.split(MEASURE).join(fmt(g.len / (k || 1)));
/** Orientacja jak DIMLINEAR w CAD: kursor nad/pod mierzonym odcinkiem → poziomy, z boku → pionowy. */
export function autoOrient(p1: P2, p2: P2, c: P2): DimOrient {
  if (Math.abs(p1[1] - p2[1]) < 1e-6) return "h";
  if (Math.abs(p1[0] - p2[0]) < 1e-6) return "v";
  const x0 = Math.min(p1[0], p2[0]), x1 = Math.max(p1[0], p2[0]), y0 = Math.min(p1[1], p2[1]), y1 = Math.max(p1[1], p2[1]);
  const outY = c[1] < y0 ? y0 - c[1] : c[1] > y1 ? c[1] - y1 : 0, outX = c[0] < x0 ? x0 - c[0] : c[0] > x1 ? c[0] - x1 : 0;
  return outY >= outX ? "h" : "v";
}
/** Odsunięcie linii wymiarowej, która ma przejść przez punkt c. */
export function dimOffsetAt(d: Pick<DimItem, "o" | "x1" | "y1" | "x2" | "y2">, c: P2): number {
  if (d.o === "h") return q(c[1] - (d.y1 + d.y2) / 2);
  if (d.o === "v") return q(c[0] - (d.x1 + d.x2) / 2);
  const dx = d.x2 - d.x1, dy = d.y2 - d.y1, L = Math.hypot(dx, dy) || 1;
  return q((c[0] - d.x1) * (-dy / L) + (c[1] - d.y1) * (dx / L));
}

/** Prostokąt otaczający [x0, y0, x1, y1]. */
export function bbox(it: Item): [number, number, number, number] {
  switch (it.t) {
    case "line": return [Math.min(it.x1, it.x2), Math.min(it.y1, it.y2), Math.max(it.x1, it.x2), Math.max(it.y1, it.y2)];
    case "dim": { const g = dimGeom(it), xs = [it.x1, it.x2, g.A[0], g.B[0]], ys = [it.y1, it.y2, g.A[1], g.B[1]]; return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; }
    case "poly": { const xs = it.pts.map((p) => p[0]), ys = it.pts.map((p) => p[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; }
    case "rect": case "grid": return [it.x, it.y, it.x + it.w, it.y + it.h];
    case "circle": return [it.cx - it.r, it.cy - it.r, it.cx + it.r, it.cy + it.r];
    case "arc": {
      const pts = arcEnds(it), xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
      for (const a of [0, 90, 180, 270]) if (onArc(it, a)) { const p = arcPoint(it.cx, it.cy, it.r, a); xs.push(p[0]); ys.push(p[1]); }
      return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
    }
    case "text": { const w = it.s.length * it.size * (it.font === "mono" ? 0.6 : 0.55), x0 = it.anchor === "start" ? it.x : it.anchor === "middle" ? it.x - w / 2 : it.x - w; return [x0, it.y - it.size * 0.9, x0 + w, it.y + it.size * 0.25]; }
    case "pt": return [it.x - 4, it.y - 4, it.x + 4, it.y + 4];
    case "step": return [it.x - 8, it.y - 8, it.x + 8, it.y + 8];
  }
}

export function translate<T extends Item>(it: T, dx: number, dy: number): T {
  switch (it.t) {
    case "line": case "dim": return { ...it, x1: q(it.x1 + dx), y1: q(it.y1 + dy), x2: q(it.x2 + dx), y2: q(it.y2 + dy) };
    case "poly": return { ...it, pts: it.pts.map(([x, y]): P2 => [q(x + dx), q(y + dy)]) };
    case "circle": case "arc": return { ...it, cx: q(it.cx + dx), cy: q(it.cy + dy) };
    default: return { ...it, x: q(it.x + dx), y: q(it.y + dy) };
  }
}

export interface Handle { key: string; x: number; y: number }
/** Uchwyty do zmiany kształtu zaznaczonego elementu. */
export function handles(it: Item): Handle[] {
  switch (it.t) {
    case "line": return [{ key: "p1", x: it.x1, y: it.y1 }, { key: "p2", x: it.x2, y: it.y2 }];
    case "dim": {
      const g = dimGeom(it);
      return [{ key: "p1", x: it.x1, y: it.y1 }, { key: "p2", x: it.x2, y: it.y2 }, { key: "off", x: (g.A[0] + g.B[0]) / 2, y: (g.A[1] + g.B[1]) / 2 }];
    }
    case "poly": return it.pts.map(([x, y], i) => ({ key: `v${i}`, x, y }));
    case "rect": case "grid": return [{ key: "nw", x: it.x, y: it.y }, { key: "ne", x: it.x + it.w, y: it.y }, { key: "se", x: it.x + it.w, y: it.y + it.h }, { key: "sw", x: it.x, y: it.y + it.h }];
    case "circle": return [{ key: "r", x: it.cx + it.r, y: it.cy }];
    case "arc": { const [s, m, e] = arcEnds(it); return [{ key: "c", x: it.cx, y: it.cy }, { key: "s", x: s[0], y: s[1] }, { key: "m", x: m[0], y: m[1] }, { key: "e", x: e[0], y: e[1] }]; }
    default: return [];
  }
}

/** Przeciągnięcie uchwytu `key` do punktu (x, y). */
export function moveHandle(it: Item, key: string, x: number, y: number): Item {
  switch (it.t) {
    case "line": return key === "p1" ? { ...it, x1: x, y1: y } : { ...it, x2: x, y2: y };
    case "dim": {
      if (key === "p1") return { ...it, x1: x, y1: y };
      if (key === "p2") return { ...it, x2: x, y2: y };
      return { ...it, off: dimOffsetAt(it, [x, y]) };
    }
    case "poly": { const i = +key.slice(1); return { ...it, pts: it.pts.map((p, j): P2 => (j === i ? [x, y] : p)) }; }
    case "rect": case "grid": {
      const x0 = key === "nw" || key === "sw" ? it.x + it.w : it.x, y0 = key === "nw" || key === "ne" ? it.y + it.h : it.y; // róg przeciwległy zostaje
      const min = it.t === "grid" ? 5 : 0.01;
      return { ...it, x: Math.min(x0, x), y: Math.min(y0, y), w: Math.max(min, q(Math.abs(x - x0))), h: Math.max(min, q(Math.abs(y - y0))) };
    }
    case "circle": return { ...it, r: Math.max(0.01, q(Math.hypot(x - it.cx, y - it.cy))) };
    case "arc": {
      if (key === "c") return translate(it, x - it.cx, y - it.cy);
      // jak w CAD: końce i punkt środkowy łuku przesuwa się, pozostałe dwa punkty zostają
      const [s, m, e] = arcEnds(it);
      const p: P2 = [x, y];
      const g = key === "s" ? arcFrom3(p, m, e) : key === "e" ? arcFrom3(s, m, p) : arcFrom3(s, p, e);
      return g ? { ...it, ...g } : it;
    }
    default: return it;
  }
}

/* ───────────── przyciąganie (jak OSNAP w CAD) ───────────── */
export type SnapKind = "end" | "center" | "int" | "mid" | "quad" | "perp" | "near" | "grid" | "free";
export const SNAP_LABEL: Record<SnapKind, string> = {
  end: "koniec", center: "środek okręgu", int: "przecięcie", mid: "środek odcinka", quad: "kwadrant", perp: "prostopadle", near: "na linii", grid: "siatka", free: "",
};
type Seg = [P2, P2];
type Circ = { cx: number; cy: number; r: number; a0?: number; a1?: number };
export interface SnapCache { pts: { p: P2; kind: SnapKind }[]; segs: Seg[]; circs: Circ[] }

function geomOf(it: Item): { segs: Seg[]; circs: Circ[] } {
  switch (it.t) {
    case "line": return { segs: [[[it.x1, it.y1], [it.x2, it.y2]]], circs: [] };
    case "poly": { const s: Seg[] = []; for (let i = 1; i < it.pts.length; i++) s.push([it.pts[i - 1], it.pts[i]]); if (it.closed && it.pts.length > 2) s.push([it.pts[it.pts.length - 1], it.pts[0]]); return { segs: s, circs: [] }; }
    case "rect": {
      const { x, y, w, h } = it, r = Math.min(it.r, w / 2, h / 2);
      const segs: Seg[] = [[[x + r, y], [x + w - r, y]], [[x + w, y + r], [x + w, y + h - r]], [[x + w - r, y + h], [x + r, y + h]], [[x, y + h - r], [x, y + r]]];
      const circs: Circ[] = r > 0 ? [{ cx: x + w - r, cy: y + r, r, a0: 270, a1: 360 }, { cx: x + w - r, cy: y + h - r, r, a0: 0, a1: 90 }, { cx: x + r, cy: y + h - r, r, a0: 90, a1: 180 }, { cx: x + r, cy: y + r, r, a0: 180, a1: 270 }] : [];
      return { segs, circs };
    }
    case "circle": return { segs: [], circs: [{ cx: it.cx, cy: it.cy, r: it.r }] };
    case "arc": return { segs: [], circs: [{ cx: it.cx, cy: it.cy, r: it.r, a0: it.a0, a1: it.a1 }] };
    default: return { segs: [], circs: [] };
  }
}
const onC = (c: Circ, p: P2) => c.a0 === undefined || onArc({ a0: c.a0, a1: c.a1! }, Math.atan2(p[1] - c.cy, p[0] - c.cx) / RAD);
function segX(a: Seg, b: Seg): P2 | null {
  const [p, p2] = a, [r, r2] = b;
  const d1x = p2[0] - p[0], d1y = p2[1] - p[1], d2x = r2[0] - r[0], d2y = r2[1] - r[1];
  const den = d1x * d2y - d1y * d2x;
  if (Math.abs(den) < 1e-9) return null;
  const t = ((r[0] - p[0]) * d2y - (r[1] - p[1]) * d2x) / den, u = ((r[0] - p[0]) * d1y - (r[1] - p[1]) * d1x) / den;
  return t >= -1e-6 && t <= 1 + 1e-6 && u >= -1e-6 && u <= 1 + 1e-6 ? [p[0] + t * d1x, p[1] + t * d1y] : null;
}
function segCirc(s: Seg, c: Circ): P2[] {
  const [a, b] = s, dx = b[0] - a[0], dy = b[1] - a[1], fx = a[0] - c.cx, fy = a[1] - c.cy;
  const A = dx * dx + dy * dy, B = 2 * (fx * dx + fy * dy), C = fx * fx + fy * fy - c.r * c.r, D = B * B - 4 * A * C;
  if (A < 1e-12 || D < 0) return [];
  const out: P2[] = [];
  for (const t of D === 0 ? [-B / (2 * A)] : [(-B - Math.sqrt(D)) / (2 * A), (-B + Math.sqrt(D)) / (2 * A)]) {
    if (t < -1e-6 || t > 1 + 1e-6) continue;
    const p: P2 = [a[0] + t * dx, a[1] + t * dy];
    if (onC(c, p)) out.push(p);
  }
  return out;
}
function circCirc(c1: Circ, c2: Circ): P2[] {
  const dx = c2.cx - c1.cx, dy = c2.cy - c1.cy, d = Math.hypot(dx, dy);
  if (d < 1e-9 || d > c1.r + c2.r + 1e-9 || d < Math.abs(c1.r - c2.r) - 1e-9) return [];
  const a = (c1.r ** 2 - c2.r ** 2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, c1.r ** 2 - a * a));
  const mx = c1.cx + (a * dx) / d, my = c1.cy + (a * dy) / d;
  const ps: P2[] = h < 1e-9 ? [[mx, my]] : [[mx + (h * dy) / d, my - (h * dx) / d], [mx - (h * dy) / d, my + (h * dx) / d]];
  return ps.filter((p) => onC(c1, p) && onC(c2, p));
}

/** Punkty i krzywe do przyciągania; `skip` — elementy właśnie zmieniane (nie przyciągają same do siebie). */
export function snapCache(items: Item[], skip: Set<string> = new Set(), extra: P2[] = []): SnapCache {
  const pts: SnapCache["pts"] = extra.map((p) => ({ p, kind: "end" }));
  const segs: Seg[] = [], circs: Circ[] = [];
  for (const it of items) {
    if (skip.has(it.id)) continue;
    if (it.t === "pt") { pts.push({ p: [it.x, it.y], kind: "end" }); continue; }
    if (it.t === "dim") { pts.push({ p: [it.x1, it.y1], kind: "end" }, { p: [it.x2, it.y2], kind: "end" }); continue; }
    const g = geomOf(it);
    segs.push(...g.segs); circs.push(...g.circs);
    for (const [a, b] of g.segs) pts.push({ p: a, kind: "end" }, { p: b, kind: "end" }, { p: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], kind: "mid" });
    if (it.t === "circle") { pts.push({ p: [it.cx, it.cy], kind: "center" }); for (const a of [0, 90, 180, 270]) pts.push({ p: arcPoint(it.cx, it.cy, it.r, a), kind: "quad" }); }
    if (it.t === "arc") { const [s, m, e] = arcEnds(it); pts.push({ p: s, kind: "end" }, { p: e, kind: "end" }, { p: m, kind: "mid" }, { p: [it.cx, it.cy], kind: "center" }); }
  }
  // przecięcia (do 400 krzywych — więcej nie ma sensu na rysunku 360 × 480)
  if (segs.length + circs.length <= 400) {
    for (let i = 0; i < segs.length; i++) for (let j = i + 1; j < segs.length; j++) { const p = segX(segs[i], segs[j]); if (p) pts.push({ p, kind: "int" }); }
    for (const s of segs) for (const c of circs) for (const p of segCirc(s, c)) pts.push({ p, kind: "int" });
    for (let i = 0; i < circs.length; i++) for (let j = i + 1; j < circs.length; j++) for (const p of circCirc(circs[i], circs[j])) pts.push({ p, kind: "int" });
  }
  return { pts, segs, circs };
}

const PRIORITY: Record<SnapKind, number> = { end: 0, center: 0, int: 1, quad: 2, mid: 2, perp: 3, near: 4, grid: 5, free: 6 };
export interface SnapOptions { grid: number; tol?: number; cache?: SnapCache; from?: P2 | null }
export interface Snapped { x: number; y: number; to: SnapKind }
/**
  Przyciąganie jak w CAD: koniec / środek okręgu → przecięcie → środek odcinka / kwadrant → prostopadle (z punktu `from`)
  → najbliższy punkt na linii, łuku albo okręgu → siatka (grid 0 = bez siatki).
*/
export function snap(x: number, y: number, o: SnapOptions): Snapped {
  const tol = o.tol ?? 4, c = o.cache;
  if (c) {
    let best: Snapped | null = null, bd = Infinity;
    const take = (p: P2, kind: SnapKind) => {
      const d = Math.hypot(p[0] - x, p[1] - y);
      if (d > tol) return;
      const score = PRIORITY[kind] * tol + d; // wyższy priorytet wygrywa w zasięgu
      if (score < bd) { bd = score; best = { x: q(p[0]), y: q(p[1]), to: kind }; }
    };
    for (const { p, kind } of c.pts) take(p, kind);
    if (o.from) for (const [a, b] of c.segs) {
      const dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy;
      if (L2 < 1e-9) continue;
      const t = ((o.from[0] - a[0]) * dx + (o.from[1] - a[1]) * dy) / L2;
      if (t > 0 && t < 1) take([a[0] + t * dx, a[1] + t * dy], "perp");
    }
    for (const [a, b] of c.segs) {
      const dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy;
      if (L2 < 1e-9) continue;
      const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / L2));
      take([a[0] + t * dx, a[1] + t * dy], "near");
    }
    for (const ci of c.circs) {
      const d = Math.hypot(x - ci.cx, y - ci.cy);
      if (d < 1e-9) continue;
      const p: P2 = [ci.cx + ((x - ci.cx) / d) * ci.r, ci.cy + ((y - ci.cy) / d) * ci.r];
      if (onC(ci, p)) take(p, "near");
    }
    if (best) return best;
  }
  if (o.grid > 0) return { x: q(Math.round(x / o.grid) * o.grid), y: q(Math.round(y / o.grid) * o.grid), to: "grid" };
  return { x: q(x), y: q(y), to: "free" };
}

/** Shift: kierunek co 45°, długość zachowana na osi dominującej. */
export function constrain(x0: number, y0: number, x: number, y: number): P2 {
  const dx = x - x0, dy = y - y0, ax = Math.abs(dx), ay = Math.abs(dy);
  if (ax > 2 * ay) return [x, y0];
  if (ay > 2 * ax) return [x0, y];
  const d = Math.max(ax, ay);
  return [x0 + Math.sign(dx) * d, y0 + Math.sign(dy) * d];
}

export const intersects = (a: [number, number, number, number], b: [number, number, number, number]) => a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1];
export const length = (x1: number, y1: number, x2: number, y2: number) => Math.round(Math.hypot(x2 - x1, y2 - y1) * 100) / 100;

/* ───────────── legenda ───────────── */
export const LEGEND_KEYS = ["con", "cons", "dim", "axis", "cut", "rap", "arc", "acc", "bad", "stock", "tool", "hatch"] as const;
export type LegendKey = (typeof LEGEND_KEYS)[number];
export const LEGEND_LABEL: Record<LegendKey, string> = {
  con: "kontur detalu", cons: "linia pomocnicza", dim: "wymiar", axis: "oś", cut: "G01 — ruch roboczy", rap: "G00 — ruch szybki",
  arc: "G02/G03 — łuk", acc: "parametr", bad: "błąd / kolizja", stock: "półfabrykat", tool: "narzędzie", hatch: "materiał",
};
/** Legenda automatyczna: rodzaje linii i wypełnień użyte na rysunku, w stałej kolejności. */
export function autoLegend(doc: Pick<RysDoc, "items">): LegendKey[] {
  const used = new Set<string>();
  for (const it of doc.items) {
    if (it.t === "dim") used.add("dim");
    if ("k" in it) used.add(it.k);
    if ("fill" in it && it.fill === "hatch") used.add("hatch");
  }
  const order: LegendKey[] = ["con", "hatch", "stock", "tool", "cut", "rap", "arc", "acc", "bad", "axis", "cons", "dim"];
  return order.filter((k) => used.has(k));
}

export interface RysFigure { slug: string; title: string; code: string; caption: string; legend: { k: LegendKey; label: string }[]; h: number; k: number; items: StoredItem[] }
