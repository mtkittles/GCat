"use client";
import {
  useEffect, useEffectEvent, useLayoutEffect, useMemo, useReducer, useRef, useState, type ClipboardEvent, type KeyboardEvent, type PointerEvent, type ReactNode,
} from "react";
import { FigDefs, figCtx } from "@/components/fig";
import {
  angleOf, arcFrom3, bbox, constrain, dimGeom, dimOffsetAt, autoOrient, fmt, handles, intersects, length, MEASURE, moveHandle, newId, parseItem, q, RYS_W,
  snap, snapCache, SNAP_LABEL, storeItem, translate, rotateItem, scaleItem, angleSector, onArc, dimrGeom, arcPath, polyPath, refAngle, fmt as fmtN,
  layersOf, layerOf, parseDoc, storeDoc, drop, FILLS, FILL_LABEL, opacityOf, SNAP_KINDS, tangentPts, commonTangents, frameAngle, frameOf, framePt, toLocal, stretchItem, type Frame,
  type DimOrient, type Fill, type Item, type Layer, type P2, type RysDoc, type SnapCache, type SnapKind,
} from "@/lib/rys/model";
import { parse as parseYaml } from "yaml";
import { idbDel, idbGet, idbSet } from "@/lib/rys/idb";
import { ArrayPanel, DynInput, ExportDialog, FileMenu, KalkaPanel, LayersPanel, SnapMenu, type ArrayParams, parseNum, readKalka, type Dyn, type ExportFormat, type Kalka, type KalkaMode, type MenuItem } from "./Extras";
import { download } from "./exportRys";
import { sanitizeSvg, svgToDoc } from "./importSvg";
import { boolShapes, boundary, buildRegions, faceAt, facePath, shapesFrom, type BoolOp } from "@/lib/rys/regions";
import { cornerLines, cornerVertex, curvesPath, explode, extend, join, mirrorItem, offsetItem, pickCurve, trim, vertexAt, type Curve } from "@/lib/rys/edit";
import { icons, type IconName } from "./icons";
import ImportDialog from "./ImportDialog";
import PropsPanel, { DEFAULT_STYLE, type PanelAction, type PanelTool, type Style } from "./Props";
import { renderItem } from "./render";
import { cadAngle, snapAngle, track, type Guide } from "@/lib/rys/track";
import { addItems, align, duplicate, edReducer, group, initEd, patchItems, regroup, removeItems, reorder, ungroup, withGroups } from "./state";

/*
  Edytor rysownika GCat (paczka RA): płótno SVG 360 × h rysowane tym samym kodem co rysunki na stronie.
  Mysz i klawiatura (komputer), praca jak w CAD: przyciąganie do końców, środków, przecięć i linii,
  linie klik‑klik łańcuchem, wymiar z odsuwaną linią wymiarową, łuk z cięciwy, powiększanie kółkiem.
*/

export type Tool = PanelTool;
const TOOLS: { id: Tool; label: string; key: string; hint: string }[] = [
  { id: "select", label: "Zaznacz", key: "V", hint: "Kliknij element, żeby go zaznaczyć; przeciągnij, żeby przesunąć. Ctrl albo Shift dodaje do zaznaczenia, przeciągnięcie po pustym polu zaznacza obszar. Kółko nad ramką obraca, narożniki skalują (Shift — obrót co 15°)." },
  { id: "line", label: "Linia", key: "L", hint: "Klikaj kolejne punkty — linie łączą się w łańcuch; Esc albo prawy przycisk kończy. Można też przeciągnąć. Shift — kierunek co 45°, Alt — bez przyciągania." },
  { id: "poly", label: "Polilinia", key: "P", hint: "Klikaj kolejne punkty. Enter, prawy przycisk albo podwójne kliknięcie kończy; kliknięcie w pierwszy punkt zamyka kontur." },
  { id: "rect", label: "Prostokąt", key: "R", hint: "Kliknij dwa przeciwległe rogi albo przeciągnij. Shift — kwadrat." },
  { id: "circle", label: "Okrąg", key: "C", hint: "Kliknij środek, potem punkt na okręgu (albo przeciągnij)." },
  { id: "arc", label: "Łuk", key: "A", hint: "Łuk z cięciwy: kliknij początek, koniec, potem wyciągnij łuk myszą i kliknij." },
  { id: "arcc", label: "Łuk ze środka", key: "S", hint: "Kliknij środek, początek i koniec łuku. Łuk biegnie zgodnie z ruchem wskazówek zegara — kierunek odwrócisz w panelu." },
  { id: "dim", label: "Wymiar", key: "D", hint: "Rodzaj wymiaru wybierasz na pasku. Auto: kliknięcie w okrąg — średnica, w łuk — promień; dwa punkty — wymiar liniowy (kursor nad/pod — poziomy, z boku — pionowy). Kątowy: kliknij dwie linie (albo wierzchołek i dwa punkty), potem położenie łuku." },
  { id: "text", label: "Tekst", key: "T", hint: "Kliknij miejsce tekstu i wpisz treść w panelu." },
  { id: "pt", label: "Punkt", key: "O", hint: "Kliknij położenie punktu, opis wpisz w panelu." },
  { id: "step", label: "Krok", key: "N", hint: "Kliknij — kolejne numery kroków nadają się same." },
  { id: "grid", label: "Siatka", key: "G", hint: "Przeciągnij obszar siatki współrzędnych (element rysunku, widoczny na stronie)." },
  { id: "axes", label: "Osie", key: "X", hint: "Przeciągnij od początku układu współrzędnych do końców osi X i Y. Nazwy osi (X/Y albo Z/X) i opisy wartości ustawisz w panelu." },
  { id: "trim", label: "Utnij", key: "U", hint: "Najedź na kawałek linii, łuku, okręgu albo boku figury między przecięciami — podświetli się na czerwono; kliknięcie go usuwa. Shift+klik — wydłuż." },
  { id: "extend", label: "Wydłuż", key: "E", hint: "Kliknij blisko końca linii, łuku albo otwartej polilinii — wydłuży się do najbliższej krawędzi. Shift+klik — utnij." },
  { id: "fillet", label: "Zaokrąglij", key: "F", hint: "Kliknij narożnik polilinii albo prostokąta — dostanie łuk o promieniu z paska. Dla dwóch linii: kliknij pierwszą, potem drugą (zostają części po stronie kliknięć). R = 0 — ostry narożnik." },
  { id: "chamfer", label: "Fazuj", key: "K", hint: "Kliknij narożnik polilinii albo prostokąta — dostanie fazę o długości z paska (na każdym boku). Dla dwóch linii: kliknij pierwszą, potem drugą." },
  { id: "region", label: "Obszary", key: "B", hint: "Najedź na obszar wyznaczony przez nachodzące figury i linie — podświetli się. Kliknięcie zaznacza (Shift albo Ctrl dodaje kolejne). Potem „Wypełnij” albo „Utwórz figurę” na pasku." },
  { id: "mirror", label: "Lustro", key: "M", hint: "Zaznacz elementy, wybierz Lustro i kliknij dwa punkty osi odbicia — powstanie odbita kopia. Shift przy drugim kliknięciu — bez oryginału." },
  { id: "offset", label: "Odsuń", key: "W", hint: "Kliknij linię, okrąg, łuk, polilinię albo prostokąt, potem stronę — powstanie kopia odsunięta o odstęp z paska." },
];
/** narzędzia edycji geometrii — osobna grupa na pasku */
const EDIT_TOOLS = new Set<Tool>(["trim", "extend", "fillet", "chamfer", "offset", "mirror", "region"]);
type DragTool = "line" | "rect" | "circle" | "grid" | "dim" | "axes";
const DRAG_TOOLS = new Set<Tool>(["line", "rect", "circle", "dim", "grid", "axes"]);
/** Po pierwszym punkcie wpisanie liczby otwiera pole wartości przy kursorze. */
const DYN_TOOL: Partial<Record<Tool, Dyn["kind"]>> = { line: "line", poly: "line", rect: "rect", grid: "rect", circle: "circle" };
const GRID_STEPS = [0, 1, 2.5, 5, 10];
const Z_MIN = 0.5, Z_MAX = 24;

type Draft =
  | { t: "drag"; tool: DragTool; a: P2; b: P2; click: boolean } // click: tryb klik‑klik, czeka na drugi punkt
  | { t: "poly"; pts: P2[]; cur: P2 }
  | { t: "arc3"; s: P2; e: P2 | null; cur: P2 }
  | { t: "arcc"; c: P2; s: P2 | null; cur: P2 }
  | { t: "dimoff"; p1: P2; p2: P2; o: DimOrient; off: number }
  | { t: "dimr"; d: boolean; cx: number; cy: number; r: number; cur: P2 }
  | { t: "dima1"; seg?: [P2, P2]; v?: P2; p1?: P2; cur: P2 }
  | { t: "dima"; cx: number; cy: number; b1: number; b2: number; lines: boolean; cur: P2 }
  | { t: "tan1"; c: Extract<Item, { t: "circle" | "arc" }>; click: P2; cur: P2 }
  | { t: "corner1"; id: string; click: P2 }
  | { t: "off1"; id: string }
  | { t: "mir1"; a: P2; cur: P2 };
type Drag =
  | { kind: "move"; base: P2; from: RysDoc; ids: string[] }
  | { kind: "handle"; id: string; key: string; from: RysDoc }
  | { kind: "marquee"; start: P2; add: string[] }
  | { kind: "rotate"; from: RysDoc; ids: string[]; c: P2; a0: number; base: number | null }
  | { kind: "pivot"; key: string }
  | { kind: "kalka"; start: P2; x: number; y: number }
  | { kind: "scale"; from: RysDoc; ids: string[]; anchor: P2; a: number; sx: number; sy: number; l0: P2; uni: boolean; f: Frame; grab: P2 };

/** Rodzaje wymiaru na pasku (jak w CAD). */
export const DIM_TYPES = [["auto", "Auto"], ["h", "Poziomy"], ["v", "Pionowy"], ["a", "Wyrównany"], ["ang", "Kątowy"], ["r", "Promień"], ["d", "Średnica"]] as const;
type DimType = (typeof DIM_TYPES)[number][0];
const POLAR_STEPS = [90, 45, 30, 15];
/** Elementy, dla których przy pojedynczym zaznaczeniu pokazujemy też uchwyty skali (reszta ma własne uchwyty kształtu). */
const SCALE_ONE = new Set(["poly", "text", "dim", "dimr", "dima", "pt", "step", "axes"]);
/** elementy, które da się rozciągać osobno w szerokość i wysokość (reszta tylko proporcjonalnie) */
const STRETCH = new Set(["poly", "line", "rect", "grid", "axes", "dim"]);
const FRAME_H: [number, number][] = [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]];

const ED = "rys-ed";
const CLIP = "gcat-rys";

function fromDrag(tool: DragTool, a: P2, b: P2, st: Style): Item | null {
  const id = newId();
  if (tool === "line") return { id, t: "line", k: st.k, sw: st.sw, arrow: st.arrow, x1: a[0], y1: a[1], x2: b[0], y2: b[1] };
  const x = Math.min(a[0], b[0]), y = Math.min(a[1], b[1]), w = q(Math.abs(b[0] - a[0])), h = q(Math.abs(b[1] - a[1]));
  if (tool === "rect") return { id, t: "rect", k: st.k, sw: st.sw, fill: st.fill, x, y, w, h, r: 0 };
  if (tool === "grid") return { id, t: "grid", x, y, w, h, minor: 5, major: 10 };
  if (tool === "circle") return { id, t: "circle", k: st.k, sw: st.sw, fill: st.fill, cx: a[0], cy: a[1], r: q(Math.hypot(b[0] - a[0], b[1] - a[1])) };
  if (tool === "axes") return { id, t: "axes", x: a[0], y: a[1], xn: 0, xp: Math.max(5, w), yn: 0, yp: Math.max(5, h), xl: "X", yl: "Y", ts: 0, tv: 10 };
  return null;
}
const dimItem = (p1: P2, p2: P2, o: DimOrient, off: number, st: Style, id = newId()): Item =>
  ({ id, t: "dim", o, x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1], off, label: MEASURE, side: -1, size: st.dimSize, font: st.dimFont, hz: false });

function draftItem(d: Draft, st: Style): Item | null {
  if (d.t === "drag") return d.tool === "dim" ? { id: "draft", t: "line", k: "cons", sw: "auto", arrow: "none", x1: d.a[0], y1: d.a[1], x2: d.b[0], y2: d.b[1] } : fromDrag(d.tool, d.a, d.b, st);
  if (d.t === "dimoff") return dimItem(d.p1, d.p2, d.o, d.off, st, "draft");
  if (d.t === "dimr") { const dist = Math.hypot(d.cur[0] - d.cx, d.cur[1] - d.cy); return { id: "draft", t: "dimr", d: d.d, cx: d.cx, cy: d.cy, r: d.r, a: angleOf(d.cx, d.cy, d.cur[0], d.cur[1]), ext: q(Math.max(-d.r + 2, dist - d.r)), label: d.d ? `⌀${MEASURE}` : `R${MEASURE}`, size: st.dimSize, font: st.dimFont }; }
  if (d.t === "dima1") {
    if (d.seg) return { id: "draft", t: "line", k: "acc", sw: "m", arrow: "none", x1: d.seg[0][0], y1: d.seg[0][1], x2: d.seg[1][0], y2: d.seg[1][1] };
    const a = d.p1 ?? d.cur;
    return d.v ? { id: "draft", t: "poly", k: "cons", sw: "auto", arrow: "none", fill: "none", closed: false, pts: d.p1 ? [d.p1, d.v, d.cur] : [d.v, a] } : null;
  }
  if (d.t === "tan1" || d.t === "corner1" || d.t === "off1" || d.t === "mir1") return null; // podgląd liczy edytor (potrzebuje innych elementów)
  if (d.t === "dima") {
    const sec = angleSector(d.b1, d.b2, angleOf(d.cx, d.cy, d.cur[0], d.cur[1]), d.lines);
    return { id: "draft", t: "dima", cx: d.cx, cy: d.cy, ...sec, r: Math.max(4, q(Math.hypot(d.cur[0] - d.cx, d.cur[1] - d.cy))), label: `${MEASURE}°`, size: st.dimSize, font: st.dimFont };
  }
  if (d.t === "poly") return { id: "draft", t: "poly", k: st.k, sw: st.sw, arrow: "none", fill: "none", closed: false, pts: [...d.pts, d.cur] };
  if (d.t === "arc3") {
    if (!d.e) return { id: "draft", t: "line", k: "cons", sw: "auto", arrow: "none", x1: d.s[0], y1: d.s[1], x2: d.cur[0], y2: d.cur[1] };
    const g = arcFrom3(d.s, d.cur, d.e);
    return g ? { id: "draft", t: "arc", k: st.k, sw: st.sw, arrow: st.arrow, ...g } : { id: "draft", t: "line", k: "cons", sw: "auto", arrow: "none", x1: d.s[0], y1: d.s[1], x2: d.e[0], y2: d.e[1] };
  }
  if (!d.s) return { id: "draft", t: "line", k: "cons", sw: "auto", arrow: "none", x1: d.c[0], y1: d.c[1], x2: d.cur[0], y2: d.cur[1] };
  return { id: "draft", t: "arc", k: st.k, sw: st.sw, arrow: st.arrow, cx: d.c[0], cy: d.c[1], r: q(Math.hypot(d.s[0] - d.c[0], d.s[1] - d.c[1])), a0: angleOf(d.c[0], d.c[1], d.s[0], d.s[1]), a1: angleOf(d.c[0], d.c[1], d.cur[0], d.cur[1]) };
}

/** Niewidoczny, szeroki obszar trafienia myszą (szerokość w pikselach ekranu, niezależnie od powiększenia). */
function hit(it: Item): ReactNode {
  const filled = "fill" in it && it.fill !== "none";
  const cn = `rys-hit${filled ? " is-fill" : ""}`;
  switch (it.t) {
    case "line": return <line x1={it.x1} y1={it.y1} x2={it.x2} y2={it.y2} className={cn} />;
    case "dim": { const g = dimGeom(it); return <line x1={g.A[0]} y1={g.A[1]} x2={g.B[0]} y2={g.B[1]} className={cn} />; }
    case "dimr": { const g = dimrGeom(it), s0 = it.d ? g.Q : [it.cx, it.cy]; return <line x1={s0[0]} y1={s0[1]} x2={g.E[0]} y2={g.E[1]} className={cn} />; }
    case "dima": return <path d={arcPath({ cx: it.cx, cy: it.cy, r: it.r, a0: it.a1, a1: it.a2 })} className={cn} />;
    case "rect": case "grid": return <rect x={it.x} y={it.y} width={it.w} height={it.h} className={cn} />;
    case "axes": return <path d={`M ${it.x - it.xn} ${it.y} H ${it.x + it.xp} M ${it.x} ${it.y + it.yn} V ${it.y - it.yp}`} className={cn} />;
    case "circle": return <circle cx={it.cx} cy={it.cy} r={it.r} className={cn} />;
    case "pt": case "step": return <circle cx={it.x} cy={it.y} r={8} className="rys-hit is-fill" />;
    case "text": { const b = bbox(it); return <rect x={b[0] - 2} y={b[1] - 2} width={b[2] - b[0] + 4} height={b[3] - b[1] + 4} className="rys-hit is-fill" />; }
    default: return null; // poly i arc: kształt z renderera powtarzany niżej
  }
}

/** Obrys zaznaczenia po kształcie elementu (jak podświetlenie w CAD); prostokąt tylko dla tekstu i punktów. */
function selShape(it: Item, pad: number, cn = "rys-selbox"): ReactNode {
  switch (it.t) {
    case "line": return <line x1={it.x1} y1={it.y1} x2={it.x2} y2={it.y2} className={cn} />;
    case "poly": return <path d={polyPath(it.pts, it.closed, it.b)} className={cn} />;
    case "arc": return <path d={arcPath(it)} className={cn} />;
    case "circle": return <circle cx={it.cx} cy={it.cy} r={it.r} className={cn} />;
    case "rect": case "grid": return <rect x={it.x} y={it.y} width={it.w} height={it.h} className={cn} />;
    case "axes": return <path d={`M ${it.x - it.xn} ${it.y} H ${it.x + it.xp} M ${it.x} ${it.y + it.yn} V ${it.y - it.yp}`} className={cn} />;
    case "dim": { const g = dimGeom(it); return <path d={`M ${it.x1} ${it.y1} L ${g.A[0]} ${g.A[1]} L ${g.B[0]} ${g.B[1]} L ${it.x2} ${it.y2}`} className={cn} />; }
    case "dimr": { const g = dimrGeom(it), s0 = it.d ? g.Q : [it.cx, it.cy]; return <line x1={s0[0]} y1={s0[1]} x2={g.E[0]} y2={g.E[1]} className={cn} />; }
    case "dima": return <path d={arcPath({ cx: it.cx, cy: it.cy, r: it.r, a0: it.a1, a1: it.a2 })} className={cn} />;
    default: { const b = bbox(it); return <rect x={b[0] - pad} y={b[1] - pad} width={b[2] - b[0] + 2 * pad} height={b[3] - b[1] + 2 * pad} className={cn} />; }
  }
}

/** Znacznik przyciągania jak w CAD (rozmiar w pikselach ekranu: u = 1 px w jednostkach rysunku). */
function SnapMark({ x, y, kind, u }: { x: number; y: number; kind: SnapKind; u: number }) {
  const s = 6 * u;
  const d: Record<SnapKind, string> = {
    end: `M ${x - s} ${y - s} h ${2 * s} v ${2 * s} h ${-2 * s} Z`,
    center: "",
    int: `M ${x - s} ${y - s} L ${x + s} ${y + s} M ${x + s} ${y - s} L ${x - s} ${y + s}`,
    mid: `M ${x} ${y - s * 1.2} L ${x + s * 1.1} ${y + s * 0.8} L ${x - s * 1.1} ${y + s * 0.8} Z`,
    quad: `M ${x} ${y - s * 1.2} L ${x + s * 1.2} ${y} L ${x} ${y + s * 1.2} L ${x - s * 1.2} ${y} Z`,
    perp: `M ${x - s} ${y + s} H ${x + s} M ${x} ${y + s} V ${y - s}`,
    tan: `M ${x - s} ${y - s} H ${x + s} M ${x - s * 0.8} ${y + s * 0.15} a ${s * 0.8} ${s * 0.8} 0 1 0 ${s * 1.6} 0 a ${s * 0.8} ${s * 0.8} 0 1 0 ${-s * 1.6} 0`,
    ext: `M ${x - s * 1.4} ${y} h ${s * 0.5} M ${x - s * 0.5} ${y} h ${s * 0.5} M ${x + s * 0.4} ${y} h ${s * 0.5} M ${x - s * 0.4} ${y - s * 0.4} L ${x + s * 0.4} ${y + s * 0.4} M ${x + s * 0.4} ${y - s * 0.4} L ${x - s * 0.4} ${y + s * 0.4}`,
    near: `M ${x - s} ${y - s} H ${x + s} L ${x - s} ${y + s} H ${x + s} Z`,
    grid: "", free: "",
  };
  return <g className="rys-snap" pointerEvents="none">{kind === "center" ? <circle cx={x} cy={y} r={s} /> : <path d={d[kind]} />}</g>;
}

export interface EditorProps {
  initial: RysDoc;
  onChange?: (doc: RysDoc) => void;
  /** przyciski po prawej stronie paska narzędzi (Zapisz, Gotowe…) */
  actions?: ReactNode;
  /** pozycje menu Plik od gospodarza (np. Nowy, Moje rysunki) — na początku listy */
  menu?: MenuItem[];
  /** klucz kalki w pamięci przeglądarki; bez niego kalka żyje tylko do zamknięcia edytora */
  kalkaKey?: string;
}

const fitLayers = (items: Item[], layers: Layer[]): Item[] => {
  const ok = new Set(layers.map((l) => l.id));
  return items.map((it) => (it.l && !ok.has(it.l) ? drop(it, "l") : it));
};

export default function Editor({ initial, onChange, actions, menu, kalkaKey }: EditorProps) {
  const [st, dispatch] = useReducer(edReducer, initial, initEd);
  const { doc, sel } = st;
  const [tool, setTool] = useState<Tool>("select");
  const [style, setStyle] = useState<Style>(DEFAULT_STYLE);
  const [grid, setGrid] = useState(2.5);
  const [snapOn, setSnapOn] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [marquee, setMarquee] = useState<[number, number, number, number] | null>(null);
  const [cursor, setCursor] = useState<P2 | null>(null);
  const [mark, setMark] = useState<{ x: number; y: number; kind: SnapKind } | null>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [panKey, setPanKey] = useState(false);
  const [panning, setPanning] = useState(false);
  const [importing, setImporting] = useState(false);
  const [focusKey, setFocusKey] = useState(0);
  const [dimType, setDimType] = useState<DimType>("auto");
  const [polar, setPolar] = useState(true);
  const [polarStep, setPolarStep] = useState(15);
  const [trackOn, setTrackOn] = useState(true);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [info, setInfo] = useState("");
  // punkt obrotu (jak punkt bazowy w CAD) — ważny dla tego zaznaczenia, po zmianie zaznaczenia wraca domyślny
  const [pivotSt, setPivotSt] = useState<{ key: string; p: P2 } | null>(null);
  const [active, setActive] = useState("0"); // warstwa, na którą trafiają nowe elementy
  const [snapKinds, setSnapKinds] = useState<ReadonlySet<SnapKind>>(() => new Set(SNAP_KINDS));
  const [lineMode, setLineMode] = useState<"free" | "tan">("free");
  const [xray, setXray] = useState(true); // kontury pod wypełnieniami widoczne w edytorze
  const [hoverEdit, setHoverEdit] = useState<{ cut?: Curve[]; ext?: Item; prev?: Item[] } | null>(null); // podgląd utnij / wydłuż / narożnik / odsunięcie
  const [vals, setVals] = useState({ fillet: 5, chamfer: 3, offset: 5 }); // mm
  // obszary: wybór ważny dla tego stanu rysunku (po zmianie rysunku ściany liczą się od nowa)
  const [regSel, setRegSel] = useState<{ items: Item[]; ids: number[] } | null>(null);
  const [regHover, setRegHover] = useState<number | null>(null);
  const [regFill, setRegFill] = useState<Fill>("hatch");
  const [kalka, setKalka] = useState<Kalka | null>(null);
  const [kalkaMode, setKalkaMode] = useState<KalkaMode>(null);
  const [calPts, setCalPts] = useState<P2[]>([]);
  const [dyn, setDyn] = useState<Dyn | null>(null);
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const fileIn = useRef<HTMLInputElement>(null), kalkaIn = useRef<HTMLInputElement>(null);
  const lastXY = useRef<[number, number]>([0, 0]);
  const root = useRef<HTMLDivElement>(null), stage = useRef<HTMLDivElement>(null), svg = useRef<SVGSVGElement>(null);
  const drag = useRef<Drag | null>(null);
  const liveFrom = useRef<RysDoc | null>(null);
  const cacheRef = useRef<{ items: Item[]; key: string; c: SnapCache } | null>(null);
  const anchor = useRef<{ px: number; py: number; cx: number; cy: number } | null>(null);
  const pan = useRef<{ x: number; y: number; sl: number; st: number; id: number } | null>(null);

  const notify = useEffectEvent((d: RysDoc) => onChange?.(d));
  useEffect(() => { notify(doc); }, [doc]);
  useEffect(() => { root.current?.focus({ preventScroll: true }); }, []); // skróty klawiszowe działają od razu
  useEffect(() => {
    if (!kalkaKey) return;
    let live = true;
    void idbGet<Kalka>(`kalka:${kalkaKey}`).then((k) => { if (live && k?.src) setKalka(k); });
    return () => { live = false; };
  }, [kalkaKey]);
  const saveKalka = (k: Kalka | null) => {
    setKalka(k);
    if (!kalkaKey) return;
    if (k) void idbSet(`kalka:${kalkaKey}`, k); else void idbDel(`kalka:${kalkaKey}`);
  };
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const fit = box ? Math.max(0.3, Math.min((box.w - 80) / RYS_W, (box.h - 80) / doc.h)) : 2;
  const S = fit * zoom; // pikseli ekranu na jednostkę rysunku
  const u = 1 / S;
  const c = figCtx(ED);

  /* ───────────── powiększenie i przesuwanie widoku ───────────── */
  const zoomTo = (nz: number, cx?: number, cy?: number) => {
    const z = Math.min(Z_MAX, Math.max(Z_MIN, nz));
    const r = svg.current?.getBoundingClientRect(), sr = stage.current?.getBoundingClientRect();
    if (r && sr) {
      const x = cx ?? sr.left + sr.width / 2, y = cy ?? sr.top + sr.height / 2;
      anchor.current = { px: (x - r.left) / S, py: (y - r.top) / S, cx: x, cy: y }; // punkt rysunku pod kursorem zostaje pod kursorem
    }
    setZoom(z);
  };
  useLayoutEffect(() => {
    const a = anchor.current, el = stage.current, r = svg.current?.getBoundingClientRect();
    anchor.current = null;
    if (!a || !el || !r) return;
    el.scrollLeft += r.left + a.px * S - a.cx;
    el.scrollTop += r.top + a.py * S - a.cy;
  }, [S]);
  const onWheel = useEffectEvent((e: WheelEvent) => {
    e.preventDefault();
    zoomTo(zoom * Math.exp(-e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.0018)), e.clientX, e.clientY);
  });
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const h = (e: WheelEvent) => onWheel(e);
    el.addEventListener("wheel", h, { passive: false });
    return () => el.removeEventListener("wheel", h);
  }, []);
  const onStageDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 1 && !(e.button === 0 && panKey)) return;
    e.preventDefault(); e.stopPropagation();
    const el = stage.current!;
    pan.current = { x: e.clientX, y: e.clientY, sl: el.scrollLeft, st: el.scrollTop, id: e.pointerId };
    el.setPointerCapture(e.pointerId);
    setPanning(true);
  };
  const onStageMove = (e: PointerEvent<HTMLDivElement>) => {
    const p = pan.current;
    if (!p || p.id !== e.pointerId) return;
    stage.current!.scrollLeft = p.sl - (e.clientX - p.x);
    stage.current!.scrollTop = p.st - (e.clientY - p.y);
  };
  const onStageUp = (e: PointerEvent<HTMLDivElement>) => { if (pan.current?.id === e.pointerId) { pan.current = null; setPanning(false); } };

  /* ───────────── warstwy ───────────── */
  const layers = layersOf(doc);
  const hiddenL = new Set(layers.filter((l) => !l.vis).map((l) => l.id)), lockedL = new Set(layers.filter((l) => l.lock).map((l) => l.id));
  const activeL = layers.some((l) => l.id === active) ? active : "0";
  const shown = hiddenL.size ? doc.items.filter((it) => !hiddenL.has(layerOf(it))) : doc.items;
  const pickable = (it: Item) => !hiddenL.has(layerOf(it)) && !lockedL.has(layerOf(it));
  const onLayer = (it: Item): Item => (activeL === "0" ? it : { ...it, l: activeL });
  const regions = useMemo(() => {
    if (tool !== "region") return null;
    const ls = layersOf(doc), off = new Set(ls.filter((l) => !l.vis || l.lock).map((l) => l.id));
    return buildRegions(doc.items.filter((it) => !off.has(layerOf(it))));
  }, [tool, doc]);
  const regIds = regSel && regSel.items === doc.items ? regSel.ids : [];
  const regionAction = (as: "fill" | "shape") => {
    if (!regions || !regIds.length) return;
    const b = boundary(regions, new Set(regIds));
    const src: Item = { id: "src", t: "line", k: "con", sw: "auto", arrow: "none", x1: 0, y1: 0, x2: 0, y2: 0 };
    const made = shapesFrom(b, { k: as === "fill" ? "none" : style.k, sw: style.sw, fill: regFill }, src).map(onLayer);
    // samo wypełnienie idzie pod spód (linie zostają widoczne), figura na wierzch
    set({ ...doc, items: as === "fill" ? [...made, ...doc.items] : [...doc.items, ...made] }, as === "shape" ? made.map((x) => x.id) : []);
    setRegSel(null); root.current?.focus({ preventScroll: true }); // przycisk staje się nieaktywny — skróty mają dalej działać
    setInfo(as === "fill" ? `wypełniono: ${made.length} ${made.length === 1 ? "figura" : "figury"} pod rysunkiem` : "utworzono figurę z obszaru");
  };

  /* ───────────── zmiany ───────────── */
  const set = (next: RysDoc, nextSel?: string[]) => dispatch({ type: "set", doc: next, sel: nextSel });
  const edit = (fn: (it: Item) => Item, mode: "set" | "live" = "set") => {
    if (mode === "live") { liveFrom.current ??= doc; dispatch({ type: "live", doc: patchItems(doc, sel, fn) }); }
    else set(patchItems(doc, sel, fn));
  };
  const settle = () => {
    const from = liveFrom.current;
    liveFrom.current = null;
    if (!from) return;
    const blank = doc.items.filter((it) => it.t === "text" && !it.s.trim()).map((it) => it.id); // tekst wyczyszczony do zera znika
    if (blank.length) dispatch({ type: "live", doc: removeItems(doc, blank) });
    dispatch({ type: "settle", from });
  };
  const add = (it: Item, focus = false) => {
    let base = doc;
    if (hiddenL.has(activeL) || lockedL.has(activeL)) { // rysowanie na ukrytej albo zablokowanej warstwie: pokaż ją i odblokuj
      base = { ...doc, layers: layers.map((l) => (l.id === activeL ? { ...l, vis: true, lock: false } : l)) };
      setInfo(`warstwa „${layers.find((l) => l.id === activeL)?.name}” znów widoczna — rysujesz na niej`);
    }
    set(addItems(base, [onLayer(it)]), [it.id]);
    if (focus) setFocusKey((k) => k + 1);
  };
  const pickTool = (t: Tool) => {
    setTool(t); setDraft(null); setMark(null); setHoverEdit(null);
    if (t === "mirror") setInfo(sel.length ? "lustro: kliknij pierwszy punkt osi odbicia" : "lustro: najpierw zaznacz elementy (Zaznacz), potem Lustro");
    else if (t !== "select") dispatch({ type: "sel", sel: [] });
  };

  const act = (a: PanelAction) => {
    if (!sel.length) return;
    if (a === "del") set(removeItems(doc, sel), []);
    else if (a === "dup") { const d = duplicate(doc, sel); set(d.doc, d.ids); }
    else if (a === "up" || a === "down" || a === "top" || a === "bottom") set(reorder(doc, sel, a));
    else if (a === "group") set(group(doc, sel));
    else if (a === "ungroup") set(ungroup(doc, sel));
    else if (a === "flip") edit((it) => (it.t === "arc" ? { ...it, a0: it.a1, a1: it.a0 } : it.t === "line" ? { ...it, x1: it.x2, y1: it.y2, x2: it.x1, y2: it.y1 } : it));
    else if (a === "union" || a === "subtract" || a === "intersect" || a === "xor") {
      const shapes = sel.map((id) => doc.items.find((it) => it.id === id)).filter((x): x is Item => !!x);
      const res = boolShapes(shapes, a as BoolOp);
      if (typeof res === "string") { setInfo(res); return; }
      const idx = doc.items.findIndex((it) => sel.includes(it.id)), rest = doc.items.filter((it) => !sel.includes(it.id));
      set({ ...doc, items: [...rest.slice(0, idx), ...res.map(onLayer), ...rest.slice(idx)] }, res.map((x) => x.id));
    } else if (a === "explode") {
      const out: Item[] = [], ids: string[] = [];
      for (const it of doc.items) { const ex = sel.includes(it.id) ? explode(it) : null; if (ex) { out.push(...ex); ids.push(...ex.map((x) => x.id)); } else out.push(it); }
      set({ ...doc, items: out }, ids);
    } else if (a === "join") {
      const j = join(doc.items.filter((it) => sel.includes(it.id)));
      if (!j) { setInfo("nie da się złączyć: elementy muszą stykać się końcami"); return; }
      const idx = doc.items.findIndex((it) => sel.includes(it.id));
      const rest = doc.items.filter((it) => !sel.includes(it.id));
      set({ ...doc, items: [...rest.slice(0, idx), j, ...rest.slice(idx)] }, [j.id]);
    }
    else set(align(doc, sel, a === "atop" ? "top" : a === "abottom" ? "bottom" : a));
  };

  /* ───────────── przyciąganie ───────────── */
  const cacheFor = (skip: string[], extra: P2[]): SnapCache => {
    const key = `${skip.join(",")}|${extra.map((p) => p.join(",")).join(" ")}|${[...hiddenL].join(",")}`;
    const hc = cacheRef.current;
    if (hc && hc.items === doc.items && hc.key === key) return hc.c;
    const cc = snapCache(shown, new Set(skip), extra);
    cacheRef.current = { items: doc.items, key, c: cc };
    return cc;
  };
  const draftPts = (d: Draft | null): P2[] => !d ? [] : d.t === "poly" ? d.pts : d.t === "drag" ? [d.a] : d.t === "arc3" ? (d.e ? [d.s, d.e] : [d.s]) : d.t === "arcc" ? (d.s ? [d.c, d.s] : [d.c]) : d.t === "dimoff" ? [d.p1, d.p2] : d.t === "dima1" && d.v ? [d.v] : d.t === "mir1" ? [d.a] : [];
  /** punkt kursora po przyciągnięciu; `from` — punkt początkowy (Shift co 45°, prostopadle) */
  const snapAt = (p: P2, e: { altKey: boolean; shiftKey: boolean }, from?: P2 | null, skip: string[] = []): P2 => {
    if (e.altKey) { setMark(null); setGuides([]); setInfo(""); return [q(p[0]), q(p[1])]; }
    const pp = e.shiftKey && from ? constrain(from[0], from[1], p[0], p[1]) : p;
    const cache = snapOn && !(e.shiftKey && from) ? cacheFor(skip, draftPts(draft)) : undefined;
    const s = snap(pp[0], pp[1], { grid, from, tol: 9 * u, cache, kinds: snapKinds });
    // punkt charakterystyczny wygrywa; inaczej śledzenie (kąty, równoległość, prostopadłość, wyrównanie) przed siatką i „na linii”
    if (!["end", "center", "int", "mid", "quad", "tan", "perp", "ext", "near"].includes(s.to) && !(e.shiftKey && from) && (polar || trackOn)) {
      const t = track(p, { from, polar: polar ? polarStep : 0, parallel: trackOn, align: trackOn, cache: cache ?? cacheFor(skip, draftPts(draft)), tol: 7 * u });
      if (t) { setMark(null); setGuides(t.guides); setInfo(t.label); return t.p; }
    }
    setGuides([]); setInfo("");
    setMark(s.to === "grid" || s.to === "free" ? null : { x: s.x, y: s.y, kind: s.to });
    return [s.x, s.y];
  };
  /** Okrąg albo łuk pod kursorem (do wymiaru ⌀/R). */
  const curveAt = (p: P2): Extract<Item, { t: "circle" | "arc" }> | null => {
    let best: Extract<Item, { t: "circle" | "arc" }> | null = null, bd = 9 * u;
    for (const it of shown) {
      if (it.t !== "circle" && it.t !== "arc") continue;
      const d = Math.abs(Math.hypot(p[0] - it.cx, p[1] - it.cy) - it.r);
      if (d < bd && (it.t === "circle" || onArc(it, angleOf(it.cx, it.cy, p[0], p[1])))) { bd = d; best = it; }
    }
    return best;
  };
  const onCurve = (c: Extract<Item, { t: "circle" | "arc" }>, p: P2) => c.t === "circle" || onArc(c, angleOf(c.cx, c.cy, p[0], p[1]));
  /** Linia styczna: do dwóch okręgów (gdy kursor jest na drugim) albo z punktu kursora do okręgu; wybór najbliższy kliknięciom. */
  function tanLine(d: Extract<Draft, { t: "tan1" }>, cur: P2): Item | null {
    const c2 = curveAt(cur), pick: { v: number; ab: [P2, P2] | null } = { v: Infinity, ab: null };
    const consider = (a: P2, b: P2, r1: P2, r2: P2) => { const v = Math.hypot(a[0] - r1[0], a[1] - r1[1]) + Math.hypot(b[0] - r2[0], b[1] - r2[1]); if (v < pick.v) { pick.v = v; pick.ab = [a, b]; } };
    if (c2 && c2.id !== d.c.id) for (const [a, b] of commonTangents(d.c, c2)) if (onCurve(d.c, a) && onCurve(c2, b)) consider(a, b, d.click, cur);
    if (!pick.ab) for (const a of tangentPts(cur, d.c.cx, d.c.cy, d.c.r)) if (onCurve(d.c, a)) consider(a, cur, d.click, cur);
    if (!pick.ab) return null;
    const [a, b] = pick.ab;
    return { id: newId(), t: "line", k: style.k, sw: style.sw, arrow: style.arrow, x1: q(a[0]), y1: q(a[1]), x2: q(b[0]), y2: q(b[1]) };
  }
  /** Zaokrąglenie / faza pod kursorem: wierzchołek polilinii/prostokąta albo druga linia po wybraniu pierwszej. */
  function cornerAt(p: P2): { patch: Record<string, Item>; add: Item[] } | string | null {
    if (tool !== "fillet" && tool !== "chamfer") return null;
    const v = (tool === "fillet" ? vals.fillet : vals.chamfer) * (doc.k || 1), ch = tool === "chamfer", items = doc.items.filter(pickable);
    if (draft?.t === "corner1") {
      const l1 = doc.items.find((it) => it.id === draft.id), tgt = pickCurve(items, p, 9 * u);
      if (l1?.t !== "line" || tgt?.t !== "line" || tgt.id === l1.id) return null;
      const r = cornerLines(l1, draft.click, tgt, p, v, ch);
      return typeof r === "string" ? r : { patch: { [l1.id]: r.l1, [tgt.id]: r.l2 }, add: r.extra ? [onLayer(r.extra)] : [] };
    }
    const vx = vertexAt(items, p, 9 * u);
    if (!vx) return null;
    const r = cornerVertex(vx.it, vx.i, v, ch);
    return typeof r === "string" ? r : { patch: { [vx.it.id]: r }, add: [] };
  }
  /** Odcinek pod kursorem (do wymiaru kątowego). */
  const segAt = (p: P2): [P2, P2] | null => {
    let best: [P2, P2] | null = null, bd = 9 * u;
    for (const [a, b] of cacheFor([], []).segs) {
      const dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy;
      if (L2 < 1e-9) continue;
      const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L2));
      const d = Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
      if (d < bd) { bd = d; best = [a, b]; }
    }
    return best;
  };
  /** Domyślny punkt obrotu: środek odcinka, środek okręgu/łuku, inaczej środek ramki. Można go przesunąć (przyciąga się). */
  const pivotOf = (ids: string[]): P2 | null => {
    if (pivotSt && pivotSt.key === ids.join(",")) return pivotSt.p;
    const its = doc.items.filter((it) => ids.includes(it.id));
    if (its.length === 1) {
      const it = its[0];
      if (it.t === "line") return [q((it.x1 + it.x2) / 2), q((it.y1 + it.y2) / 2)];
      if (it.t === "circle" || it.t === "arc" || it.t === "dimr" || it.t === "dima") return [it.cx, it.cy];
    }
    const f = frameFor(ids);
    return f ? [q(f.c[0]), q(f.c[1])] : null;
  };
  /** Ramka zaznaczenia obrócona razem z figurą (wspólny kierunek elementów). */
  const frameFor = (ids: string[]): Frame | null => {
    const its = doc.items.filter((it) => ids.includes(it.id));
    return frameOf(its, frameAngle(its));
  };

  /* ───────────── mysz ───────────── */
  const at = (e: { clientX: number; clientY: number }): P2 => {
    const r = svg.current!.getBoundingClientRect();
    return [((e.clientX - r.left) * RYS_W) / r.width, ((e.clientY - r.top) * doc.h) / r.height];
  };

  const finishDrag = (d: Extract<Draft, { t: "drag" }>, b: P2, chain: boolean) => {
    if (d.tool === "dim") {
      if (Math.hypot(b[0] - d.a[0], b[1] - d.a[1]) < 0.5) { setDraft(null); return; }
      setDraft({ t: "dimoff", p1: d.a, p2: b, o: dimType === "h" || dimType === "v" || dimType === "a" ? dimType : autoOrient(d.a, b, b), off: 0 });
      return;
    }
    const flat = (d.tool === "rect" || d.tool === "grid") && (b[0] === d.a[0] || b[1] === d.a[1]);
    const it = Math.hypot(b[0] - d.a[0], b[1] - d.a[1]) >= 0.5 && !flat ? fromDrag(d.tool, d.a, b, style) : null;
    if (it) add(it);
    setDraft(chain && d.tool === "line" && it ? { t: "drag", tool: "line", a: b, b, click: true } : null);
  };
  const finishPoly = (pts: P2[], closed: boolean) => {
    setDraft(null);
    const clean = pts.filter((p, i) => i === 0 || Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) >= 0.01); // punkty podwojone podwójnym kliknięciem odpadają
    if (clean.length >= 2) add({ id: newId(), t: "poly", k: style.k, sw: style.sw, arrow: closed ? "none" : style.arrow, fill: closed ? style.fill : "none", closed, pts: clean });
  };
  const endDraft = () => { if (draft?.t === "poly") finishPoly(draft.pts, false); else setDraft(null); setMark(null); setGuides([]); setInfo(""); };

  const onDown = (e: PointerEvent<SVGSVGElement>) => {
    if (e.button === 2) { e.preventDefault(); endDraft(); return; }
    if (e.button !== 0) return;
    root.current?.focus({ preventScroll: true });
    const p = at(e), target = e.target as Element;
    if (kalka && kalkaMode === "move") { e.currentTarget.setPointerCapture(e.pointerId); drag.current = { kind: "kalka", start: p, x: kalka.x, y: kalka.y }; return; }
    if (kalka && kalkaMode === "cal") {
      const pts = calPts.length >= 2 ? [p] : [...calPts, p];
      setCalPts(pts);
      if (pts.length === 2) { setDyn({ kind: "cal", a: "", b: "", at: [e.clientX, e.clientY] }); setInfo("wpisz rzeczywistą odległość tych punktów"); }
      else setInfo("kliknij drugi punkt na kalce");
      return;
    }
    if (tool === "select") {
      e.currentTarget.setPointerCapture(e.pointerId);
      const h = target.closest("[data-h]"), g = target.closest("[data-g]"), el = target.closest("[data-id]");
      const multi = e.shiftKey || e.ctrlKey || e.metaKey;
      const sb = frameFor(sel);
      if (h && sel.length === 1) drag.current = { kind: "handle", id: sel[0], key: h.getAttribute("data-h")!, from: doc };
      else if (g && sb) {
        const key = g.getAttribute("data-g")!;
        if (key === "pivot") drag.current = { kind: "pivot", key: sel.join(",") };
        else if (key === "rot") {
          const c = pivotOf(sel)!, its = doc.items.filter((it) => sel.includes(it.id));
          drag.current = { kind: "rotate", from: doc, ids: sel, c, a0: Math.atan2(p[1] - c[1], p[0] - c[0]) * 180 / Math.PI, base: its.length === 1 ? refAngle(its[0]) : its.length > 1 ? sb.a : null };
        } else if (key.startsWith("s:")) {
          // uchwyt ramki: punkt przeciwległy stoi, przeciągany idzie za kursorem (z przyciąganiem) w układzie ramki
          const [sx, sy] = key.slice(2).split(":").map(Number), its = doc.items.filter((it) => sel.includes(it.id));
          const anchor = framePt(sb, -sx, -sy), hp = framePt(sb, sx, sy);
          drag.current = { kind: "scale", from: doc, ids: sel, anchor, a: sb.a, sx, sy, l0: toLocal(hp, anchor, sb.a), uni: !its.some((it) => STRETCH.has(it.t)), f: sb, grab: [hp[0] - p[0], hp[1] - p[1]] };
        }
      } else if (el) {
        const id = el.getAttribute("data-id")!, grp = withGroups(doc, [id]);
        const next = multi ? (sel.includes(id) ? sel.filter((s) => !grp.includes(s)) : [...new Set([...sel, ...grp])]) : sel.includes(id) ? sel : grp;
        dispatch({ type: "sel", sel: next });
        // punkt chwytu przyciągnięty (np. do końca linii) — przy upuszczeniu trafi dokładnie w punkt innej linii
        drag.current = next.includes(id) ? { kind: "move", base: snapAt(p, e), from: doc, ids: next } : null;
      } else {
        if (!multi) dispatch({ type: "sel", sel: [] });
        drag.current = { kind: "marquee", start: p, add: multi ? sel : [] };
      }
      return;
    }
    if (tool === "region") {
      const f = regions ? faceAt(regions, p) : null, multi = e.shiftKey || e.ctrlKey || e.metaKey;
      if (!f) { if (!multi) setRegSel(null); return; }
      const ids = multi ? (regIds.includes(f.id) ? regIds.filter((x) => x !== f.id) : [...regIds, f.id]) : [f.id];
      setRegSel({ items: doc.items, ids });
      return;
    }
    if (tool === "fillet" || tool === "chamfer") {
      const r = cornerAt(p);
      if (r && typeof r !== "string") { set({ ...doc, items: [...doc.items.map((it) => r.patch[it.id] ?? it), ...r.add] }, []); setDraft(null); setHoverEdit(null); setInfo(""); return; }
      if (typeof r === "string") { setInfo(r); return; }
      const tgt = pickCurve(doc.items.filter(pickable), p, 9 * u);
      if (tgt?.t === "line" && draft?.t !== "corner1") { setDraft({ t: "corner1", id: tgt.id, click: p }); setInfo("kliknij drugą linię (po stronie, która ma zostać)"); }
      else setInfo("kliknij narożnik polilinii albo prostokąta, albo dwie linie");
      return;
    }
    if (tool === "mirror") {
      if (!sel.length) { setInfo("lustro: najpierw zaznacz elementy (Zaznacz), potem Lustro"); return; }
      const sp = snapAt(p, e, draft?.t === "mir1" ? draft.a : null);
      if (draft?.t !== "mir1") { setDraft({ t: "mir1", a: sp, cur: sp }); setInfo("lustro: kliknij drugi punkt osi (Shift — bez oryginału)"); return; }
      if (Math.hypot(sp[0] - draft.a[0], sp[1] - draft.a[1]) < 0.5) return;
      const copies = regroup(doc.items.filter((it) => sel.includes(it.id)).map((it) => mirrorItem(it, draft.a, sp)));
      const base = e.shiftKey ? removeItems(doc, sel) : doc;
      set(addItems(base, copies), copies.map((x) => x.id)); setDraft(null); setInfo(""); setTool("select");
      return;
    }
    if (tool === "offset") {
      const src = draft?.t === "off1" ? doc.items.find((it) => it.id === draft.id) : null;
      if (src) { const o = offsetItem(src, vals.offset * (doc.k || 1), p); if (o) add(o); else setInfo("tego odsunięcia nie da się zrobić (za mały promień albo za duży odstęp)"); setDraft(null); setHoverEdit(null); return; }
      const tgt = pickCurve(doc.items.filter(pickable), p, 9 * u);
      if (tgt) { setDraft({ t: "off1", id: tgt.id }); setInfo("kliknij stronę, po której ma powstać kopia"); } else setInfo("odsuń: kliknij linię, okrąg, łuk, polilinię albo prostokąt");
      return;
    }
    if (tool === "trim" || tool === "extend") {
      const ext = (tool === "extend") !== e.shiftKey, tgt = pickCurve(doc.items.filter(pickable), p, 9 * u);
      if (!tgt) { setInfo(ext ? "wydłuż: kliknij blisko końca linii albo łuku" : "utnij: kliknij kawałek linii między przecięciami"); return; }
      if (ext) {
        const nx = extend(tgt, shown, p);
        if (nx) set(patchItems(doc, [tgt.id], () => nx)); else setInfo("w tym kierunku nie ma krawędzi do wydłużenia");
      } else {
        const r = trim(tgt, shown, p);
        if (r) { const i = doc.items.findIndex((it) => it.id === tgt.id); set({ ...doc, items: [...doc.items.slice(0, i), ...r.add, ...doc.items.slice(i + 1)] }, []); }
      }
      setHoverEdit(null);
      return;
    }
    if (tool === "line" && lineMode === "tan") {
      if (draft?.t === "tan1") { const ln = tanLine(draft, snapAt(p, e)); if (ln) { add(ln); setInfo(""); } else setInfo("z tego miejsca nie ma stycznej"); setDraft(null); return; }
      const cv = curveAt(p);
      if (!cv) { setInfo("styczna: kliknij okrąg albo łuk"); return; }
      setDraft({ t: "tan1", c: cv, click: p, cur: p }); setInfo("styczna: kliknij drugi okrąg/łuk albo punkt końcowy");
      return;
    }
    if (draft?.t === "dimoff") { add(dimItem(draft.p1, draft.p2, draft.o, draft.off, style)); setDraft(null); setMark(null); return; }
    if (draft?.t === "dimr" || draft?.t === "dima") { const it = draftItem({ ...draft, cur: p }, style); setDraft(null); if (it) add({ ...it, id: newId() }); setInfo(""); return; }
    if (tool === "dim" && dimType === "ang") {
      const sp = snapAt(p, e);
      if (draft?.t === "dima1") {
        if (draft.seg) {
          const s2 = segAt(p);
          if (!s2) { setInfo("kliknij drugą linię"); return; }
          const [a, b] = draft.seg, [c2, d2] = s2;
          const d1x = b[0] - a[0], d1y = b[1] - a[1], ex = d2[0] - c2[0], ey = d2[1] - c2[1], den = d1x * ey - d1y * ex;
          if (Math.abs(den) < 1e-9) { setInfo("linie są równoległe — wybierz inną"); return; }
          const t = ((c2[0] - a[0]) * ey - (c2[1] - a[1]) * ex) / den;
          const v: P2 = [a[0] + t * d1x, a[1] + t * d1y];
          setDraft({ t: "dima", cx: q(v[0]), cy: q(v[1]), b1: angleOf(a[0], a[1], b[0], b[1]), b2: angleOf(c2[0], c2[1], d2[0], d2[1]), lines: true, cur: p });
        } else if (draft.v && !draft.p1) setDraft({ ...draft, p1: sp, cur: sp });
        else if (draft.v && draft.p1) setDraft({ t: "dima", cx: draft.v[0], cy: draft.v[1], b1: angleOf(draft.v[0], draft.v[1], draft.p1[0], draft.p1[1]), b2: angleOf(draft.v[0], draft.v[1], sp[0], sp[1]), lines: false, cur: p });
        return;
      }
      const seg = mark && ["end", "int", "center", "mid", "quad"].includes(mark.kind) ? null : segAt(p);
      setDraft(seg ? { t: "dima1", seg, cur: p } : { t: "dima1", v: sp, cur: sp });
      setInfo(seg ? "kliknij drugą linię" : "kliknij punkt na pierwszym ramieniu");
      return;
    }
    if (tool === "dim" && (dimType === "r" || dimType === "d" || dimType === "auto")) {
      const strong = mark && ["end", "int", "center", "mid"].includes(mark.kind); // kwadrant okręgu to nadal „klik w okrąg”
      const cv = !strong || dimType !== "auto" ? curveAt(p) : null;
      if (cv) { setDraft({ t: "dimr", d: dimType === "d" || (dimType === "auto" && cv.t === "circle"), cx: cv.cx, cy: cv.cy, r: cv.r, cur: p }); return; }
      if (dimType !== "auto") { setInfo("kliknij okrąg albo łuk"); return; }
    }
    if (draft?.t === "drag" && draft.click) { finishDrag(draft, snapAt(p, e, draft.a), true); return; }
    const sp = snapAt(p, e, draft?.t === "poly" ? draft.pts[draft.pts.length - 1] : null);
    if (DRAG_TOOLS.has(tool)) { e.currentTarget.setPointerCapture(e.pointerId); setDraft({ t: "drag", tool: tool as DragTool, a: sp, b: sp, click: false }); return; }
    if (tool === "poly") {
      if (draft?.t === "poly") {
        const [fx, fy] = draft.pts[0];
        if (draft.pts.length >= 3 && Math.hypot(sp[0] - fx, sp[1] - fy) < 0.01) finishPoly(draft.pts, true);
        else setDraft({ t: "poly", pts: [...draft.pts, sp], cur: sp });
      } else setDraft({ t: "poly", pts: [sp], cur: sp });
      return;
    }
    if (tool === "arc") {
      if (draft?.t !== "arc3") setDraft({ t: "arc3", s: sp, e: null, cur: sp });
      else if (!draft.e) { if (Math.hypot(sp[0] - draft.s[0], sp[1] - draft.s[1]) >= 0.5) setDraft({ ...draft, e: sp, cur: sp }); }
      else { const it = draftItem({ ...draft, cur: sp }, style); setDraft(null); if (it && it.t === "arc") add({ ...it, id: newId() }); }
      return;
    }
    if (tool === "arcc") {
      if (draft?.t !== "arcc") setDraft({ t: "arcc", c: sp, s: null, cur: sp });
      else if (!draft.s) { if (Math.hypot(sp[0] - draft.c[0], sp[1] - draft.c[1]) >= 0.5) setDraft({ ...draft, s: sp, cur: sp }); }
      else { const it = draftItem({ ...draft, cur: sp }, style); setDraft(null); if (it) add({ ...it, id: newId() }); }
      return;
    }
    if (tool === "text") add({ id: newId(), t: "text", x: sp[0], y: sp[1], s: "Tekst", anchor: "start", size: style.size, font: style.font, bold: style.bold, color: style.color }, true);
    else if (tool === "pt") add({ id: newId(), t: "pt", x: sp[0], y: sp[1], label: "", pos: "ne", color: "ink" }, true);
    else if (tool === "step") add({ id: newId(), t: "step", x: sp[0], y: sp[1], n: Math.min(99, 1 + Math.max(0, ...doc.items.map((it) => (it.t === "step" ? it.n : 0)))) });
  };

  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    if (pan.current) return;
    const p = at(e);
    lastXY.current = [e.clientX, e.clientY];
    setCursor([q(p[0]), q(p[1])]);
    const d = drag.current;
    if (d?.kind === "kalka") { if (kalka) setKalka({ ...kalka, x: q(d.x + p[0] - d.start[0]), y: q(d.y + p[1] - d.start[1]) }); return; }
    if (d?.kind === "move") {
      const t = snapAt(p, e, null, d.ids);
      let dx = t[0] - d.base[0], dy = t[1] - d.base[1];
      if (e.shiftKey) { if (Math.abs(dx) > Math.abs(dy)) dy = 0; else dx = 0; }
      dispatch({ type: "live", doc: patchItems(d.from, d.ids, (it) => translate(it, dx, dy)) });
    } else if (d?.kind === "handle") {
      const it = d.from.items.find((x) => x.id === d.id);
      const ends = it?.t === "line" || it?.t === "dim";
      const fromPt: P2 | null = ends && d.key === "p1" ? [it.x2, it.y2] : ends && d.key === "p2" ? [it.x1, it.y1] : it?.t === "poly" ? null : null;
      const sp = snapAt(p, e, fromPt, [d.id]);
      if (fromPt) {
        const L = Math.hypot(sp[0] - fromPt[0], sp[1] - fromPt[1]) / (doc.k || 1), A = cadAngle(Math.atan2(sp[1] - fromPt[1], sp[0] - fromPt[0]) * 180 / Math.PI);
        setInfo((v) => `${v && !v.startsWith("L ") ? v + " · " : ""}L ${fmtN(L)} · ${fmtN(A)}°`);
      }
      dispatch({ type: "live", doc: patchItems(d.from, [d.id], (x) => moveHandle(x, d.key, sp[0], sp[1])) });
    } else if (d?.kind === "pivot") {
      setPivotSt({ key: d.key, p: snapAt(p, e) });
    } else if (d?.kind === "rotate") {
      const raw = Math.atan2(p[1] - d.c[1], p[0] - d.c[0]) * 180 / Math.PI - d.a0;
      // odcinek: dociągamy kąt wynikowy (0°, 15°, 30°, 45°, 90°…), nie sam przyrost — wtedy da się ustawić idealnie poziomo/pionowo
      const b0 = d.base ?? 0, step = e.shiftKey ? 15 : polar ? polarStep : 0;
      const abs = step ? snapAngle(b0 + raw, step, e.shiftKey) : Math.round((b0 + raw) * 10) / 10;
      const ang = abs - b0;
      setInfo(d.base !== null && d.ids.length === 1 ? `kąt ${fmtN(cadAngle(abs))}° · obrót ${fmtN(-ang)}°` : `obrót ${fmtN(-ang)}°`);
      dispatch({ type: "live", doc: patchItems(d.from, d.ids, (it) => rotateItem(it, d.c, ang)) });
    } else if (d?.kind === "scale") {
      // przyciąga się narożnik/bok figury (nie kursor obok niego)
      const t = snapAt([p[0] + d.grab[0], p[1] + d.grab[1]], e, null, d.ids), l = toLocal(t, d.anchor, d.a);
      let kx = d.sx ? l[0] / d.l0[0] : 1, ky = d.sy ? l[1] / d.l0[1] : 1;
      if (d.uni || e.shiftKey) { // proporcjonalnie: rzut kursora na przekątną (narożnik) albo skala z jednej osi (bok)
        const k = d.sx && d.sy ? (l[0] * d.l0[0] + l[1] * d.l0[1]) / (d.l0[0] ** 2 + d.l0[1] ** 2) : d.sx ? kx : ky;
        kx = ky = k;
      }
      kx = Math.max(0.02, Math.round(kx * 1e4) / 1e4); ky = Math.max(0.02, Math.round(ky * 1e4) / 1e4);
      const mmv = (v: number) => fmtN(v / (doc.k || 1));
      setInfo(kx === ky && (d.uni || e.shiftKey) ? `skala × ${fmtN(kx)}` : `${mmv(2 * d.f.hw * kx)} × ${mmv(2 * d.f.hh * ky)} mm`);
      dispatch({ type: "live", doc: patchItems(d.from, d.ids, (it) => stretchItem(it, d.anchor, d.a, kx, ky)) });
    } else if (d?.kind === "marquee") setMarquee([Math.min(d.start[0], p[0]), Math.min(d.start[1], p[1]), Math.max(d.start[0], p[0]), Math.max(d.start[1], p[1])]);
    else if (draft?.t === "drag") {
      let b = snapAt(p, e, draft.tool === "line" || draft.tool === "dim" ? draft.a : null);
      if (e.shiftKey && draft.tool === "rect") { const s = Math.max(Math.abs(b[0] - draft.a[0]), Math.abs(b[1] - draft.a[1])); b = [draft.a[0] + Math.sign(b[0] - draft.a[0] || 1) * s, draft.a[1] + Math.sign(b[1] - draft.a[1] || 1) * s]; }
      setDraft({ ...draft, b });
    } else if (draft?.t === "dimoff") {
      const cpt = snapAt(p, e);
      const o = dimType === "h" || dimType === "v" || dimType === "a" ? dimType : autoOrient(draft.p1, draft.p2, cpt);
      setDraft({ ...draft, o, off: dimOffsetAt({ o, x1: draft.p1[0], y1: draft.p1[1], x2: draft.p2[0], y2: draft.p2[1] }, cpt) });
    } else if (draft?.t === "poly") setDraft({ ...draft, cur: snapAt(p, e, draft.pts[draft.pts.length - 1]) });
    else if (draft?.t === "arc3") setDraft({ ...draft, cur: snapAt(p, e, draft.e ? null : draft.s) });
    else if (draft?.t === "arcc") setDraft({ ...draft, cur: snapAt(p, e, draft.s ? null : draft.c) });
    else if (draft?.t === "dimr" || draft?.t === "dima") setDraft({ ...draft, cur: [q(p[0]), q(p[1])] });
    else if (draft?.t === "tan1") setDraft({ ...draft, cur: snapAt(p, e) });
    else if (draft?.t === "mir1") setDraft({ ...draft, cur: snapAt(p, e, draft.a) });
    else if (tool === "region") { const f = regions ? faceAt(regions, p) : null; setRegHover(f ? f.id : null); }
    else if (tool === "fillet" || tool === "chamfer") {
      const r = cornerAt(p);
      setHoverEdit(r && typeof r !== "string" ? { prev: [...Object.values(r.patch), ...r.add] } : null);
      if (typeof r === "string") setInfo(r);
    } else if (tool === "offset" && draft?.t === "off1") {
      const src = doc.items.find((it) => it.id === draft.id), o = src ? offsetItem(src, vals.offset * (doc.k || 1), p) : null;
      setHoverEdit(o ? { prev: [o] } : null);
    }
    else if (tool === "trim" || tool === "extend") {
      const ext = (tool === "extend") !== e.shiftKey, tgt = pickCurve(doc.items.filter(pickable), p, 9 * u);
      if (!tgt) setHoverEdit(null);
      else if (ext) { const nx = extend(tgt, shown, p); setHoverEdit(nx ? { ext: nx } : null); }
      else { const r = trim(tgt, shown, p); setHoverEdit(r ? { cut: r.cut } : null); }
    }
    else if (draft?.t === "dima1") setDraft({ ...draft, cur: draft.v ? snapAt(p, e, draft.v) : [q(p[0]), q(p[1])] });
    else if (tool !== "select") snapAt(p, e); // znacznik przyciągania także przed pierwszym kliknięciem
    else setMark(null);
  };

  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    if (d?.kind === "move" || d?.kind === "handle" || d?.kind === "rotate" || d?.kind === "scale") { dispatch({ type: "settle", from: d.from }); setMark(null); setInfo(""); setGuides([]); }
    else if (d?.kind === "pivot") { setMark(null); setGuides([]); setInfo(""); }
    else if (d?.kind === "kalka") saveKalka(kalka);
    else if (d?.kind === "marquee") {
      if (marquee && (marquee[2] - marquee[0] > 1 || marquee[3] - marquee[1] > 1)) {
        const inside = withGroups(doc, doc.items.filter((it) => pickable(it) && intersects(bbox(it), marquee)).map((it) => it.id));
        dispatch({ type: "sel", sel: [...new Set([...d.add, ...inside])] });
      }
      setMarquee(null);
    } else if (draft?.t === "drag" && !draft.click) {
      // przeciągnięcie → gotowy element; samo kliknięcie → tryb klik‑klik (czeka na drugi punkt)
      if (Math.hypot(draft.b[0] - draft.a[0], draft.b[1] - draft.a[1]) >= 0.5) finishDrag(draft, draft.b, false);
      else setDraft({ ...draft, click: true });
    }
  };

  /* ───────────── klawiatura i schowek ───────────── */
  const typing = (t: EventTarget) => t instanceof HTMLElement && (t.tagName === "INPUT" || t.tagName === "SELECT" || t.tagName === "TEXTAREA");
  const inDialog = (t: EventTarget) => t instanceof Element && !!t.closest("dialog"); // okno importu ma własną klawiaturę (Enter = Wczytaj)
  const onKey = (e: KeyboardEvent) => {
    if (inDialog(e.target)) return;
    if (typing(e.target)) { if (e.key === "Escape" || e.key === "Enter") { (e.target as HTMLElement).blur(); root.current?.focus(); } return; }
    const mod = e.ctrlKey || e.metaKey, k = e.key.toLowerCase();
    const done = () => e.preventDefault();
    if (e.key === " ") { done(); setPanKey(true); return; }
    // liczba po pierwszym punkcie → pole wartości przy kursorze (jak w CAD)
    const dk = DYN_TOOL[tool];
    if (!mod && dk && /^[0-9.,-]$/.test(e.key) && ((draft?.t === "drag" && draft.click && DYN_TOOL[draft.tool as Tool] === dk) || (draft?.t === "poly" && dk === "line"))) {
      done(); setDyn({ kind: dk, a: e.key, b: "", at: lastXY.current }); return;
    }
    if (mod && k === "s") { done(); saveCopy(); return; }
    if (mod && k === "o") { done(); fileIn.current?.click(); return; }
    if (mod && k === "g") { done(); if (e.shiftKey) act("ungroup"); else if (sel.length > 1) act("group"); return; }
    if (mod && k === "z") { done(); dispatch({ type: e.shiftKey ? "redo" : "undo" }); }
    else if (mod && k === "y") { done(); dispatch({ type: "redo" }); }
    else if (mod && k === "d") { done(); act("dup"); }
    else if (mod && k === "a") { done(); setTool("select"); dispatch({ type: "sel", sel: doc.items.filter(pickable).map((it) => it.id) }); }
    else if (mod && (k === "=" || k === "+")) { done(); zoomTo(zoom * 1.25); }
    else if (mod && k === "-") { done(); zoomTo(zoom / 1.25); }
    else if (mod && k === "0") { done(); zoomTo(1); }
    else if (mod) return;
    else if (e.key === "+" || e.key === "=") zoomTo(zoom * 1.25);
    else if (e.key === "-") zoomTo(zoom / 1.25);
    else if (e.key === "0") zoomTo(1);
    else if (e.key === "Delete" || e.key === "Backspace") { done(); act("del"); }
    else if (e.key === "Escape") { if (kalkaMode) { setKalkaMode(null); setCalPts([]); setInfo(""); } else if (draft || tool !== "select") { endDraft(); pickTool("select"); } else if (sel.length) dispatch({ type: "sel", sel: [] }); }
    else if (e.key === "Enter" && draft) { done(); endDraft(); }
    else if (e.key === "]") act("up");
    else if (e.key === "[") act("down");
    else if (e.key.startsWith("Arrow") && sel.length) {
      done();
      const g = (grid || 1) * (e.shiftKey ? 5 : 1);
      const [dx, dy] = e.key === "ArrowLeft" ? [-g, 0] : e.key === "ArrowRight" ? [g, 0] : e.key === "ArrowUp" ? [0, -g] : [0, g];
      set(patchItems(doc, sel, (it) => translate(it, dx, dy)));
    } else { const t = TOOLS.find((x) => x.key.toLowerCase() === k); if (t) pickTool(t.id); }
  };
  const onKeyUp = (e: KeyboardEvent) => { if (e.key === " ") setPanKey(false); };
  const onCopy = (e: ClipboardEvent) => {
    if (typing(e.target) || inDialog(e.target) || !sel.length) return;
    e.preventDefault();
    e.clipboardData.setData("text/plain", JSON.stringify({ [CLIP]: 1, items: doc.items.filter((it) => sel.includes(it.id)).map(storeItem) }));
    if (e.type === "cut") act("del");
  };
  const onPaste = (e: ClipboardEvent) => {
    if (typing(e.target) || inDialog(e.target)) return;
    const img = Array.from(e.clipboardData.files).find((f) => f.type.startsWith("image/"));
    if (img) { e.preventDefault(); void loadKalka(img); return; }
    try {
      const data = JSON.parse(e.clipboardData.getData("text/plain")) as { items?: unknown[] };
      const raw = Array.isArray(data.items) ? data.items : [];
      const same = raw.length > 0 && doc.items.some((it) => JSON.stringify(storeItem(it)) === JSON.stringify(raw[0])); // wklejane na to samo miejsce → odsuń
      const items = regroup(raw.flatMap((r) => { const it = parseItem(r); return it ? [same ? translate(it, 10, 10) : it] : []; })).map((it) => onLayer(drop(it, "l")));
      if (!items.length) return;
      e.preventDefault();
      setTool("select");
      set(addItems(doc, items), items.map((it) => it.id));
    } catch { /* w schowku nie ma rysunku */ }
  };

  /* ───────────── widok ───────────── */
  const dynPt = dyn ? dynPoint(dyn) : null; // wpisywana wartość widoczna od razu na płótnie
  const preview = draft?.t === "tan1" ? tanLine(draft, draft.cur) : draft ? draftItem(dynPt ? (draft.t === "poly" ? { ...draft, cur: dynPt } : draft.t === "drag" ? { ...draft, b: dynPt } : draft) : draft, style) : null;
  const one = sel.length === 1 ? doc.items.find((it) => it.id === sel[0]) : undefined;
  const hr = 4.5 * u; // uchwyt: stały rozmiar na ekranie
  // siatka na ekranie = skok przyciągania (gęstsza tylko gdy przy tym powiększeniu nie zlewa się w szarość)
  let gs = grid > 0 ? grid : 10;
  while (gs * S < 6) gs *= gs === 1 ? 5 : 2;
  const gM = gs * (gs === 1 ? 10 : 5); // linie grubsze co 10 (skok 1) albo co 5 kroków
  const toolBtn = (t: (typeof TOOLS)[number]) => (
    <button key={t.id} type="button" className="rys-tool" aria-pressed={tool === t.id} title={`${t.label} (${t.key})`} onClick={() => pickTool(t.id)}>
      {icons[t.id as IconName]}<span>{t.label}</span>
    </button>
  );
  const hint = TOOLS.find((t) => t.id === tool)!.hint;
  // podpowiedź pomiaru przy kursorze, jak w CAD
  const mm = (v: number) => fmt(v / (doc.k || 1));
  let measure = "";
  if (draft?.t === "drag") {
    const [a, b] = [draft.a, draft.b];
    measure = draft.tool === "rect" || draft.tool === "grid" ? `${mm(Math.abs(b[0] - a[0]))} × ${mm(Math.abs(b[1] - a[1]))}`
      : draft.tool === "circle" ? `R ${mm(length(a[0], a[1], b[0], b[1]))}` : `L ${mm(length(a[0], a[1], b[0], b[1]))} · ${fmt(-angleOf(a[0], a[1], b[0], b[1]))}°`;
  } else if (draft?.t === "dimoff") measure = mm(dimGeom({ o: draft.o, x1: draft.p1[0], y1: draft.p1[1], x2: draft.p2[0], y2: draft.p2[1], off: draft.off }).len);
  else if (draft?.t === "poly") { const a = draft.pts[draft.pts.length - 1]; measure = `L ${mm(length(a[0], a[1], draft.cur[0], draft.cur[1]))} · ${fmt(-angleOf(a[0], a[1], draft.cur[0], draft.cur[1]))}°`; }
  else if (preview?.t === "arc") measure = `R ${mm(preview.r)}`;

  const doImport = (r: { items: Item[]; h: number; k: number }, mode: "replace" | "add") => {
    setTool("select");
    if (mode === "replace") { set({ h: r.h, k: r.k, items: fitLayers(r.items, layersOf(doc)), ...(doc.layers ? { layers: doc.layers } : {}) }, []); zoomTo(1); }
    else { const fresh = regroup(r.items).map((it) => onLayer(drop(it, "l"))); set(addItems(doc, fresh), fresh.map((it) => it.id)); }
  };

  /** Szyk prostokątny (odstępy w mm, Y w górę jak w CAD) albo kołowy wokół punktu obrotu zaznaczenia. */
  const makeArray = (pa: ArrayParams) => {
    const src = doc.items.filter((it) => sel.includes(it.id)), kk = doc.k || 1, out: Item[] = [];
    if (pa.kind === "rect") {
      for (let r = 0; r < pa.rows; r++) for (let cc = 0; cc < pa.cols; cc++) if (r || cc) out.push(...regroup(src).map((it) => translate(it, q(cc * pa.dx * kk), q(-r * pa.dy * kk))));
    } else {
      const c0 = pivotOf(sel);
      if (!c0) return;
      const step = Math.abs(Math.abs(pa.ang) - 360) < 1e-9 ? pa.ang / pa.n : pa.ang / (pa.n - 1);
      for (let i = 1; i < pa.n; i++) out.push(...regroup(src).map((it) => rotateItem(it, c0, -step * i)));
    }
    set(addItems(doc, out.map(onLayer)), [...sel, ...out.map((x) => x.id)]);
    setInfo(`szyk: ${out.length / Math.max(1, src.length) + 1} szt.`);
  };

  /* ───────────── plik, kalka, wartości z klawiatury ───────────── */
  const saveCopy = () => download(JSON.stringify({ "gcat-rys": 1, ...storeDoc(doc) }, null, 1), `rysunek-${new Date().toISOString().slice(0, 10)}.gcat-rys.json`, "application/json");
  const openFile = async (f: File) => {
    try {
      const text = await f.text(), name = f.name.toLowerCase();
      let next: RysDoc;
      if (name.endsWith(".svg") || text.trimStart().startsWith("<")) {
        const parsed = new DOMParser().parseFromString(text, "image/svg+xml").documentElement;
        if (parsed.tagName.toLowerCase() !== "svg") throw new Error("plik SVG jest uszkodzony");
        sanitizeSvg(parsed);
        const host = document.createElement("div");
        host.style.cssText = "position:fixed;left:-20000px;top:0;width:720px";
        host.className = "fig";
        const el = document.importNode(parsed, true) as unknown as SVGSVGElement;
        host.appendChild(el); document.body.appendChild(host);
        try {
          const r = svgToDoc(el);
          let ly: unknown;
          try { ly = JSON.parse(el.getAttribute("data-rl") ?? "null"); } catch { ly = null; }
          next = parseDoc({ h: r.h, k: r.k, items: r.items.map(storeItem), layers: ly });
          if (r.approx) setInfo(`plik wczytany, ${r.approx} przybliżeń (krzywe, obce style)`);
        } finally { host.remove(); }
      } else if (name.endsWith(".yaml") || name.endsWith(".yml")) {
        const y = parseYaml(text) as { rys?: unknown } | null;
        next = parseDoc(y && typeof y === "object" && "rys" in y ? y.rys : y);
      } else next = parseDoc(JSON.parse(text));
      if (!next.items.length) throw new Error("w pliku nie ma elementów rysunku");
      setTool("select"); setActive("0"); set(next, []); zoomTo(1);
      setInfo(`otwarto „${f.name}” — Ctrl+Z wraca do poprzedniego rysunku`);
    } catch (err) { setInfo(`nie udało się otworzyć „${f.name}”: ${err instanceof Error ? err.message : "nieznany format"}`); }
  };
  const loadKalka = async (f: Blob) => {
    try { saveKalka(await readKalka(f, doc.h)); setInfo("kalka wczytana — ustawienia w panelu po prawej"); }
    catch (err) { setInfo(err instanceof Error ? err.message : "nie udało się wczytać obrazu"); }
  };
  /** punkt z wartości wpisanych przy kursorze (null — brak liczby albo brak punktu początkowego) */
  function dynPoint(d: Dyn): P2 | null {
    const v1 = parseNum(d.a), v2 = parseNum(d.b), kk = doc.k || 1;
    const from = draft?.t === "poly" ? draft.pts[draft.pts.length - 1] : draft?.t === "drag" ? draft.a : null;
    const cur = draft?.t === "poly" ? draft.cur : draft?.t === "drag" ? draft.b : null;
    if (v1 === null || !from || !cur || d.kind === "cal") return null;
    if (d.kind === "line") {
      const ang = v2 !== null ? (-v2 * Math.PI) / 180 : Math.hypot(cur[0] - from[0], cur[1] - from[1]) > 0.01 ? Math.atan2(cur[1] - from[1], cur[0] - from[0]) : 0;
      return [q(from[0] + v1 * kk * Math.cos(ang)), q(from[1] + v1 * kk * Math.sin(ang))];
    }
    if (d.kind === "rect") {
      const sx = Math.sign(cur[0] - from[0]) || 1, sy = Math.sign(cur[1] - from[1]) || -1;
      return [q(from[0] + sx * Math.abs(v1) * kk), q(from[1] + sy * Math.abs(v2 ?? v1) * kk)];
    }
    return [q(from[0] + Math.abs(v1) * kk), from[1]];
  }
  const applyDyn = (d: Dyn) => {
    const v1 = parseNum(d.a), kk = doc.k || 1;
    const close = () => { setDyn(null); root.current?.focus({ preventScroll: true }); };
    if (d.kind === "cal") {
      if (kalka && calPts.length === 2 && v1 && v1 > 0) {
        const [p1, p2] = calPts, dist = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
        if (dist > 0.01) { const sc = (v1 * kk) / dist; saveKalka({ ...kalka, w: q(kalka.w * sc), x: q(p1[0] - (p1[0] - kalka.x) * sc), y: q(p1[1] - (p1[1] - kalka.y) * sc) }); setInfo(`kalka przeskalowana × ${fmtN(sc)}`); }
      }
      setCalPts([]); setKalkaMode(null); close(); return;
    }
    if (v1 === null) return;
    const pt = dynPoint(d);
    if (!pt || !draft) { close(); return; }
    if (draft.t === "poly") setDraft({ ...draft, pts: [...draft.pts, pt], cur: pt });
    else if (draft.t === "drag") finishDrag(draft, pt, true);
    close();
  };
  const menuItems: MenuItem[] = [
    ...(menu ?? []),
    { label: "Otwórz plik…", key: "Ctrl+O", hint: "Kopia z dysku (.gcat-rys.json), plik rysunku z treści (.yaml) albo SVG wyeksportowany z rysownika", onClick: () => fileIn.current?.click(), sep: !!menu?.length },
    { label: "Zapisz kopię na dysk", key: "Ctrl+S", hint: "Plik .gcat-rys.json — pełny zapis rysunku z warstwami; otworzysz go przez „Otwórz plik”", onClick: saveCopy },
    { label: "Eksport SVG…", onClick: () => setExporting("svg"), sep: true },
    { label: "Eksport PNG…", onClick: () => setExporting("png") },
    { label: "Eksport PDF…", onClick: () => setExporting("pdf") },
    { label: kalka ? "Wymień kalkę (obraz)…" : "Wczytaj kalkę (obraz)…", hint: "Obraz pod rysunkiem do odrysowania (zdjęcie, skan, zrzut). Nie trafia na stronę. Można też wkleić obraz Ctrl+V.", onClick: () => kalkaIn.current?.click(), sep: true },
    { label: "Import ze strony serwisu…", hint: "Rysunek z dowolnej strony GCat do edycji", onClick: () => setImporting(true) },
  ];

  const gbox = tool === "select" && sel.length ? frameFor(sel) : null;
  const pivot = gbox ? pivotOf(sel) : null;
  const showScale = sel.length > 1 || (!!one && SCALE_ONE.has(one.t));
  const selItems = doc.items.filter((it) => sel.includes(it.id));
  const edgeH = selItems.some((it) => STRETCH.has(it.t));
  // obrót ma sens dla grupy albo elementu z kierunkiem — sam okrąg nie dostaje ramki ani uchwytu obrotu
  const canRot = sel.length > 1 || (!!one && one.t !== "circle"); // uchwyty na bokach tylko, gdy da się rozciągać osobno
  const fp = (sx: number, sy: number, pad: number) => (gbox ? framePt(gbox, sx, sy, pad) : ([0, 0] as P2));

  return (
    <div ref={root} className="rys-ed" tabIndex={0} onKeyDown={onKey} onKeyUp={onKeyUp} onBlur={() => setPanKey(false)} onCopy={onCopy} onCut={onCopy} onPaste={onPaste}>
      <div className="rys-bar" role="toolbar" aria-label="Narzędzia rysownika">
        <div className="rys-tools"><FileMenu items={menuItems} icon={icons.file} /></div>
        <div className="rys-tools">{TOOLS.filter((t) => !EDIT_TOOLS.has(t.id)).map(toolBtn)}</div>
        <div className="rys-tools" aria-label="Edycja geometrii">{TOOLS.filter((t) => EDIT_TOOLS.has(t.id)).map(toolBtn)}</div>
        <div className="rys-tools">
          <button type="button" className="rys-tool" disabled={!st.past.length} onClick={() => dispatch({ type: "undo" })} title="Cofnij (Ctrl+Z)">{icons.undo}<span>Cofnij</span></button>
          <button type="button" className="rys-tool" disabled={!st.future.length} onClick={() => dispatch({ type: "redo" })} title="Ponów (Ctrl+Shift+Z)">{icons.redo}<span>Ponów</span></button>
        </div>
        <div className="rys-tools">
          <button type="button" className="rys-tool" aria-pressed={snapOn} onClick={() => setSnapOn((v) => !v)} title="Przyciąganie do końców, środków, przecięć i linii (Alt wyłącza na chwilę)">{icons.magnet}<span>Punkty</span></button>
          <SnapMenu kinds={snapKinds} onChange={setSnapKinds} />
          <button type="button" className="rys-tool" aria-pressed={xray} onClick={() => setXray((v) => !v)} title="Kontury pod wypełnieniami: cienki podgląd krawędzi zakrytych przez wypełnienie (tylko w edytorze)">{icons.xray}<span>Kontury</span></button>
          <button type="button" className="rys-tool" aria-pressed={showGrid} onClick={() => setShowGrid((v) => !v)} title="Pokaż siatkę roboczą (nie trafia na rysunek)">{icons.dots}<span>Siatka</span></button>
          <label className="rys-step" title="Skok przyciągania do siatki, w jednostkach rysunku (brak — bez dociągania do siatki)">Skok
            <select value={grid} onChange={(e) => setGrid(+e.target.value)}>{GRID_STEPS.map((g) => <option key={g} value={g}>{g === 0 ? "brak" : fmt(g)}</option>)}</select>
          </label>
        </div>
        <div className="rys-tools">
          <button type="button" className="rys-tool" aria-pressed={polar} onClick={() => setPolar((v) => !v)} title="Kąty: przy rysowaniu kierunek dociąga do wielokrotności wybranego kąta (jak POLAR w CAD)">{icons.polar}<span>Kąty</span></button>
          <label className="rys-step" title="Krok kąta">
            <select value={polarStep} onChange={(e) => { setPolarStep(+e.target.value); setPolar(true); }}>{POLAR_STEPS.map((a) => <option key={a} value={a}>{a}°</option>)}</select>
          </label>
          <button type="button" className="rys-tool" aria-pressed={trackOn} onClick={() => setTrackOn((v) => !v)} title="Śledzenie: równolegle i prostopadle do innych linii, wyrównanie z końcami, środkami i osiami symetrii (jak OTRACK w CAD)">{icons.track}<span>Śledzenie</span></button>
        </div>
        <div className="rys-tools">
          <button type="button" className="rys-tool" onClick={() => zoomTo(zoom / 1.25)} title="Pomniejsz (−, kółko myszy)">{icons.zout}<span>Pomniejsz</span></button>
          <button type="button" className="rys-tool rys-zoom" onClick={() => zoomTo(1)} title="Dopasuj do okna (0)">{icons.fit}<span>{Math.round(zoom * 100)}%</span></button>
          <button type="button" className="rys-tool" onClick={() => zoomTo(zoom * 1.25)} title="Powiększ (+, kółko myszy)">{icons.zin}<span>Powiększ</span></button>
        </div>
        {actions && <div className="rys-actions">{actions}</div>}
        {tool === "region" && (
          <div className="rys-regbar">
            <span>{regIds.length ? `Zaznaczone obszary: ${regIds.length}` : "Kliknij obszar"}</span>
            <label className="rys-step">Wypełnienie
              <select value={regFill} onChange={(e) => setRegFill(e.target.value as Fill)}>{FILLS.filter((f) => f !== "none").map((f) => <option key={f} value={f}>{FILL_LABEL[f]}</option>)}</select>
            </label>
            <button type="button" className="rys-btn" disabled={!regIds.length} onClick={() => regionAction("fill")} title="Samo wypełnienie pod rysunkiem — linie zostają bez zmian">Wypełnij</button>
            <button type="button" className="rys-btn" disabled={!regIds.length} onClick={() => regionAction("shape")} title="Nowa figura z obrysem (styl z panelu) i wypełnieniem">Utwórz figurę</button>
          </div>
        )}
        {(tool === "fillet" || tool === "chamfer" || tool === "offset") && (
          <label className="rys-step rys-val">{tool === "fillet" ? "Promień R" : tool === "chamfer" ? "Faza" : "Odstęp"}
            <input type="number" min={0} step={0.5} value={vals[tool]} onChange={(e) => { const v = Number(e.target.value); if (Number.isFinite(v) && v >= 0) setVals((o) => ({ ...o, [tool]: v })); }} /> mm
          </label>
        )}
        {tool === "line" && (
          <div className="rys-seg rys-dimtypes" role="radiogroup" aria-label="Rodzaj linii">
            {([["free", "Zwykła"], ["tan", "Styczna do okręgu / dwóch okręgów"]] as const).map(([v, l]) => <button key={v} type="button" role="radio" aria-checked={lineMode === v} onClick={() => { setLineMode(v); setDraft(null); setInfo(v === "tan" ? "styczna: kliknij okrąg albo łuk" : ""); }}>{l}</button>)}
          </div>
        )}
        {tool === "dim" && (
          <div className="rys-seg rys-dimtypes" role="radiogroup" aria-label="Rodzaj wymiaru">
            {DIM_TYPES.map(([v, l]) => <button key={v} type="button" role="radio" aria-checked={dimType === v} onClick={() => { setDimType(v); setDraft(null); setInfo(""); }}>{l}</button>)}
          </div>
        )}
      </div>

      <div ref={stage} className={`rys-stage${panKey || panning ? " is-pan" : ""}${panning ? " is-panning" : ""}`}
        onPointerDownCapture={onStageDown} onPointerMove={onStageMove} onPointerUp={onStageUp} onPointerCancel={onStageUp}
        onMouseDown={(e) => { if (e.button === 1) e.preventDefault(); /* bez autoprzewijania środkowym przyciskiem */ }}>
        <div className="rys-pad">
          <div className="fig rys-sheet" style={{ width: RYS_W * S, height: doc.h * S }}>
            <svg ref={svg} viewBox={`0 0 ${RYS_W} ${doc.h}`} className={`rys-svg tool-${tool}${kalkaMode ? ` is-kalka-${kalkaMode}` : ""}`} role="application" aria-label="Płótno rysunku"
              onMouseDown={(e) => e.preventDefault() /* fokus ustawia onDown; domyślny zabrałby go polu w panelu */}
              onContextMenu={(e) => e.preventDefault()}
              onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onPointerLeave={() => { setCursor(null); setHoverEdit(null); setRegHover(null); if (!draft && !drag.current) setMark(null); }}
              onDoubleClick={(e) => {
                if (draft?.t === "poly") { finishPoly(draft.pts, false); return; }
                if (tool !== "select") return;
                const id = (e.target as Element).closest("[data-id]")?.getAttribute("data-id");
                const it = id ? doc.items.find((x) => x.id === id) : null;
                if (it?.g && sel.length > 1) dispatch({ type: "sel", sel: [it.id] }); // podwójne kliknięcie w grupę — sam element
                else if (sel.length === 1) setFocusKey((k) => k + 1);
              }}>
              <FigDefs id={ED} />
              <defs>
                <pattern id={`${ED}-g`} width={gs} height={gs} patternUnits="userSpaceOnUse"><path d={`M ${gs} 0 H 0 V ${gs}`} className="rys-gmin" /></pattern>
                <pattern id={`${ED}-G`} width={gM} height={gM} patternUnits="userSpaceOnUse"><path d={`M ${gM} 0 H 0 V ${gM}`} className="rys-gmaj" /></pattern>
              </defs>
              {showGrid && <g pointerEvents="none">{<rect width={RYS_W} height={doc.h} fill={`url(#${ED}-g)`} />}<rect width={RYS_W} height={doc.h} fill={`url(#${ED}-G)`} /></g>}
              {kalka?.vis && <image href={kalka.src} x={kalka.x} y={kalka.y} width={kalka.w} height={kalka.w * kalka.ar} opacity={kalka.op} preserveAspectRatio="none" pointerEvents="none" className="rys-kalka-img" />}
              {shown.map((it) => lockedL.has(layerOf(it)) ? <g key={it.id} className="rys-item is-locked" pointerEvents="none" opacity={opacityOf(doc, it) < 1 ? opacityOf(doc, it) : undefined}>{renderItem(it, c, doc.k)}</g> : (
                <g key={it.id} data-id={it.id} className="rys-item" opacity={opacityOf(doc, it) < 1 ? opacityOf(doc, it) : undefined}>
                  {renderItem(it, c, doc.k)}
                  {it.t === "poly" || it.t === "arc" ? <g className={`rys-hitwrap${it.t === "poly" && it.fill !== "none" ? " is-fill" : ""}`}>{renderItem({ ...it, arrow: "none" } as Item, c)}</g> : hit(it)}
                </g>
              ))}
              {xray && shown.some((it) => "fill" in it && it.fill !== "none") && (
                <g className="rys-xr" pointerEvents="none">{shown.filter((it) => it.t !== "text" && it.t !== "pt" && it.t !== "step").map((it) => <g key={it.id}>{selShape(it, 0, "rys-xr-l")}</g>)}</g>
              )}
              {draft?.t === "tan1" && <g pointerEvents="none">{selShape(draft.c, 0, "rys-tanc")}</g>}
              {regions && (
                <g pointerEvents="none">
                  {regions.faces.filter((f) => regIds.includes(f.id)).map((f) => <path key={f.id} d={facePath(f)} className="rys-reg is-sel" fillRule="evenodd" />)}
                  {regHover !== null && regions.faces[regHover] && <path d={facePath(regions.faces[regHover])} className="rys-reg" fillRule="evenodd" />}
                </g>
              )}
              {hoverEdit?.cut && <path d={curvesPath(hoverEdit.cut)} className="rys-cutprev" pointerEvents="none" />}
              {hoverEdit?.ext && <g className="rys-draft" pointerEvents="none">{renderItem(hoverEdit.ext, c, doc.k)}</g>}
              {draft?.t === "mir1" && Math.hypot(draft.cur[0] - draft.a[0], draft.cur[1] - draft.a[1]) > 0.5 && (
                <g pointerEvents="none">
                  <line x1={draft.a[0] - (draft.cur[0] - draft.a[0]) * 20} y1={draft.a[1] - (draft.cur[1] - draft.a[1]) * 20} x2={draft.a[0] + (draft.cur[0] - draft.a[0]) * 20} y2={draft.a[1] + (draft.cur[1] - draft.a[1]) * 20} className="rys-guide" />
                  <g className="rys-draft">{doc.items.filter((it) => sel.includes(it.id)).map((it) => <g key={it.id}>{renderItem(mirrorItem(it, draft.a, draft.cur), c, doc.k)}</g>)}</g>
                </g>
              )}
              {hoverEdit?.prev && <g className="rys-draft rys-prev" pointerEvents="none">{hoverEdit.prev.map((it) => <g key={it.id}>{renderItem(it, c, doc.k)}</g>)}</g>}
              {(draft?.t === "corner1" || draft?.t === "off1") && (() => { const it = doc.items.find((x) => x.id === draft.id); return it ? <g pointerEvents="none">{selShape(it, 0, "rys-tanc")}</g> : null; })()}
              {kalkaMode === "cal" && calPts.length > 0 && (
                <g pointerEvents="none" className="rys-cal">
                  {calPts.length === 2 && <line x1={calPts[0][0]} y1={calPts[0][1]} x2={calPts[1][0]} y2={calPts[1][1]} />}
                  {calPts.map((pt, i) => <circle key={i} cx={pt[0]} cy={pt[1]} r={hr} />)}
                </g>
              )}
              {preview && <g className="rys-draft" pointerEvents="none">{renderItem(preview, c, doc.k)}</g>}
              {draft?.t === "poly" && <circle cx={draft.pts[0][0]} cy={draft.pts[0][1]} r={hr} className="rys-close" pointerEvents="none" />}
              {draft?.t === "arc3" && draft.e && <line x1={draft.s[0]} y1={draft.s[1]} x2={draft.e[0]} y2={draft.e[1]} className="rys-chord" pointerEvents="none" />}
              {(tool === "select" || tool === "mirror") && doc.items.filter((it) => sel.includes(it.id)).map((it) => <g key={it.id} pointerEvents="none">{selShape(it, 3 * u)}</g>)}
              {tool === "select" && gbox && (
                <g>
                  {sel.length > 1 && <polygon points={[fp(-1, -1, 5 * u), fp(1, -1, 5 * u), fp(1, 1, 5 * u), fp(-1, 1, 5 * u)].map((p) => p.join(",")).join(" ")} className="rys-gframe" pointerEvents="none" />}
                  {showScale && FRAME_H.filter(([sx, sy]) => (sx && sy) || (edgeH && (sx ? gbox.hh : gbox.hw) * 2 > 12 * u)).map(([sx, sy]) => {
                    const [x, y] = fp(sx, sy, 5 * u), dir = Math.round(((Math.atan2(sy, sx) * 180) / Math.PI + gbox.a + 360) % 180 / 45) % 4;
                    return <circle key={`${sx}${sy}`} data-g={`s:${sx}:${sy}`} cx={x} cy={y} r={hr * 0.75} className={`rys-ghandle is-d${dir}`} />;
                  })}
                  {canRot && <line x1={fp(1, -1, 5 * u)[0]} y1={fp(1, -1, 5 * u)[1]} x2={fp(1, -1, 18 * u)[0]} y2={fp(1, -1, 18 * u)[1]} className="rys-rotline" pointerEvents="none" />}
                  {pivot && canRot && <g data-g="pivot" className="rys-pivot"><circle cx={pivot[0]} cy={pivot[1]} r={hr * 1.3} /><path d={`M ${pivot[0] - hr * 2.2} ${pivot[1]} h ${hr * 4.4} M ${pivot[0]} ${pivot[1] - hr * 2.2} v ${hr * 4.4}`} /><title>Punkt obrotu — przeciągnij, przyciąga się do punktów</title></g>}
                  {canRot && <g data-g="rot" className="rys-rot"><title>Obrót (Shift — co 15°)</title><circle cx={fp(1, -1, 18 * u)[0]} cy={fp(1, -1, 18 * u)[1]} r={hr * 1.6} /><path d={`M ${fp(1, -1, 18 * u)[0] - hr * 0.8} ${fp(1, -1, 18 * u)[1]} a ${hr * 0.8} ${hr * 0.8} 0 1 1 ${hr * 0.8} ${hr * 0.8}`} /></g>}
                </g>
              )}
              {tool === "select" && one && handles(one).map((h) => <circle key={h.key} data-h={h.key} cx={h.x} cy={h.y} r={hr * 0.8} className={`rys-handle${h.key === "off" || h.key === "c" || h.key === "m" ? " is-alt" : ""}`} />)}
              {guides.map((g, i) => <line key={i} x1={g.a[0]} y1={g.a[1]} x2={g.b[0]} y2={g.b[1]} className={g.ref ? "rys-guide is-ref" : "rys-guide"} pointerEvents="none" />)}
              {marquee && <rect x={marquee[0]} y={marquee[1]} width={marquee[2] - marquee[0]} height={marquee[3] - marquee[1]} className="rys-marquee" pointerEvents="none" />}
              {mark && <SnapMark {...mark} u={u} />}
            </svg>
          </div>
        </div>
      </div>

      <PropsPanel doc={doc} sel={sel} tool={tool} style={style} focusKey={focusKey}
        edit={edit} settle={settle} onStyle={(p) => setStyle((s) => ({ ...s, ...p }))}
        onDoc={(p) => { liveFrom.current ??= doc; dispatch({ type: "live", doc: { ...doc, ...p } }); }}
        onSelect={(ids) => { setTool("select"); dispatch({ type: "sel", sel: ids }); }} onAction={act}
        onTransform={(kind, v) => { const c = pivotOf(sel); if (c) set(patchItems(doc, sel, (it) => (kind === "rot" ? rotateItem(it, c, -v) : scaleItem(it, c, v)))); }}
        sections={[
          ...(kalka ? [{ title: "Kalka", body: <KalkaPanel kalka={kalka} mode={kalkaMode} k={doc.k} onChange={(pp) => saveKalka({ ...kalka, ...pp })} onRemove={() => { saveKalka(null); setKalkaMode(null); setCalPts([]); }}
            onMode={(m) => { setKalkaMode(m); setCalPts([]); setInfo(m === "move" ? "przeciągnij kalkę myszą, Esc kończy" : m === "cal" ? "kliknij pierwszy punkt o znanej odległości" : ""); if (m) { pickTool("select"); dispatch({ type: "sel", sel: [] }); } root.current?.focus({ preventScroll: true }); }} /> }] : []),
          ...(sel.length && tool === "select" ? [{ title: "Szyk", body: <ArrayPanel onMake={makeArray} /> }] : []),
          { title: "Warstwy", body: <LayersPanel doc={doc} active={activeL} sel={sel} onActive={setActive}
            onLayers={(ls, removed) => set({ ...doc, layers: ls, items: removed ? doc.items.map((it) => (it.l === removed ? drop(it, "l") : it)) : doc.items })}
            onMove={(l) => set(patchItems(doc, sel, (it) => (l === "0" ? drop(it, "l") : { ...it, l })))} /> },
        ]} />

      <div className="rys-status">
        <span className="rys-coords">{cursor ? `X ${fmt(cursor[0])} · Y ${fmt(cursor[1])}` : `360 × ${doc.h}`}</span>
        {mark && <span className="rys-snapname">{SNAP_LABEL[mark.kind]}</span>}
        {info && <span className="rys-snapname">{info}</span>}
        {measure && <span className="rys-measure">{measure}</span>}
        <span className="rys-hint">{hint} Kółko myszy — powiększenie, środkowy przycisk albo spacja — przesuwanie widoku.</span>
      </div>
      {dyn && <DynInput dyn={dyn} onChange={setDyn} onApply={applyDyn} onClose={() => { setDyn(null); if (dyn.kind === "cal") { setCalPts([]); setKalkaMode(null); } root.current?.focus({ preventScroll: true }); }} />}
      {exporting && <ExportDialog doc={doc} format={exporting} onClose={() => { setExporting(null); root.current?.focus({ preventScroll: true }); }} />}
      <input ref={fileIn} type="file" hidden accept=".json,.yaml,.yml,.svg,application/json,image/svg+xml" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void openFile(f); }} />
      <input ref={kalkaIn} type="file" hidden accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void loadKalka(f); }} />
      {importing && <ImportDialog onImport={doImport} onClose={() => { setImporting(false); root.current?.focus({ preventScroll: true }); }} />}
    </div>
  );
}
