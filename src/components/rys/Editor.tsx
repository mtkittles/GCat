"use client";
import {
  useEffect, useEffectEvent, useLayoutEffect, useReducer, useRef, useState, type ClipboardEvent, type KeyboardEvent, type PointerEvent, type ReactNode,
} from "react";
import { FigDefs, figCtx } from "@/components/fig";
import {
  angleOf, arcFrom3, bbox, constrain, dimGeom, dimOffsetAt, autoOrient, fmt, handles, intersects, length, MEASURE, moveHandle, newId, parseItem, q, RYS_W,
  snap, snapCache, SNAP_LABEL, storeItem, translate, type DimOrient, type Item, type P2, type RysDoc, type SnapCache, type SnapKind,
} from "@/lib/rys/model";
import { icons, type IconName } from "./icons";
import ImportDialog from "./ImportDialog";
import PropsPanel, { DEFAULT_STYLE, type PanelAction, type PanelTool, type Style } from "./Props";
import { renderItem } from "./render";
import { addItems, align, duplicate, edReducer, initEd, patchItems, removeItems, reorder } from "./state";

/*
  Edytor rysownika GCat (paczka RA): płótno SVG 360 × h rysowane tym samym kodem co rysunki na stronie.
  Mysz i klawiatura (komputer), praca jak w CAD: przyciąganie do końców, środków, przecięć i linii,
  linie klik‑klik łańcuchem, wymiar z odsuwaną linią wymiarową, łuk z cięciwy, powiększanie kółkiem.
*/

export type Tool = PanelTool;
const TOOLS: { id: Tool; label: string; key: string; hint: string }[] = [
  { id: "select", label: "Zaznacz", key: "V", hint: "Kliknij element, żeby go zaznaczyć; przeciągnij, żeby przesunąć (punkt chwytu przyciąga się do innych linii). Shift dodaje do zaznaczenia, przeciągnięcie po pustym polu zaznacza obszar." },
  { id: "line", label: "Linia", key: "L", hint: "Klikaj kolejne punkty — linie łączą się w łańcuch; Esc albo prawy przycisk kończy. Można też przeciągnąć. Shift — kierunek co 45°, Alt — bez przyciągania." },
  { id: "poly", label: "Polilinia", key: "P", hint: "Klikaj kolejne punkty. Enter, prawy przycisk albo podwójne kliknięcie kończy; kliknięcie w pierwszy punkt zamyka kontur." },
  { id: "rect", label: "Prostokąt", key: "R", hint: "Kliknij dwa przeciwległe rogi albo przeciągnij. Shift — kwadrat." },
  { id: "circle", label: "Okrąg", key: "C", hint: "Kliknij środek, potem punkt na okręgu (albo przeciągnij)." },
  { id: "arc", label: "Łuk", key: "A", hint: "Łuk z cięciwy: kliknij początek, koniec, potem wyciągnij łuk myszą i kliknij." },
  { id: "arcc", label: "Łuk ze środka", key: "S", hint: "Kliknij środek, początek i koniec łuku. Łuk biegnie zgodnie z ruchem wskazówek zegara — kierunek odwrócisz w panelu." },
  { id: "dim", label: "Wymiar", key: "D", hint: "Kliknij dwa mierzone punkty (albo przeciągnij), odsuń linię wymiarową myszą i kliknij. Kursor nad/pod — wymiar poziomy, z boku — pionowy." },
  { id: "text", label: "Tekst", key: "T", hint: "Kliknij miejsce tekstu i wpisz treść w panelu." },
  { id: "pt", label: "Punkt", key: "O", hint: "Kliknij położenie punktu, opis wpisz w panelu." },
  { id: "step", label: "Krok", key: "N", hint: "Kliknij — kolejne numery kroków nadają się same." },
  { id: "grid", label: "Siatka", key: "G", hint: "Przeciągnij obszar siatki współrzędnych (element rysunku, widoczny na stronie)." },
];
type DragTool = "line" | "rect" | "circle" | "grid" | "dim";
const DRAG_TOOLS = new Set<Tool>(["line", "rect", "circle", "dim", "grid"]);
const GRID_STEPS = [0, 1, 2.5, 5, 10];
const Z_MIN = 0.5, Z_MAX = 24;

type Draft =
  | { t: "drag"; tool: DragTool; a: P2; b: P2; click: boolean } // click: tryb klik‑klik, czeka na drugi punkt
  | { t: "poly"; pts: P2[]; cur: P2 }
  | { t: "arc3"; s: P2; e: P2 | null; cur: P2 }
  | { t: "arcc"; c: P2; s: P2 | null; cur: P2 }
  | { t: "dimoff"; p1: P2; p2: P2; o: DimOrient; off: number };
type Drag =
  | { kind: "move"; base: P2; from: RysDoc; ids: string[] }
  | { kind: "handle"; id: string; key: string; from: RysDoc }
  | { kind: "marquee"; start: P2; add: string[] };

const ED = "rys-ed";
const CLIP = "gcat-rys";

function fromDrag(tool: DragTool, a: P2, b: P2, st: Style): Item | null {
  const id = newId();
  if (tool === "line") return { id, t: "line", k: st.k, sw: st.sw, arrow: st.arrow, x1: a[0], y1: a[1], x2: b[0], y2: b[1] };
  const x = Math.min(a[0], b[0]), y = Math.min(a[1], b[1]), w = q(Math.abs(b[0] - a[0])), h = q(Math.abs(b[1] - a[1]));
  if (tool === "rect") return { id, t: "rect", k: st.k, sw: st.sw, fill: st.fill, x, y, w, h, r: 0 };
  if (tool === "grid") return { id, t: "grid", x, y, w, h, minor: 5, major: 10 };
  if (tool === "circle") return { id, t: "circle", k: st.k, sw: st.sw, fill: st.fill, cx: a[0], cy: a[1], r: q(Math.hypot(b[0] - a[0], b[1] - a[1])) };
  return null;
}
const dimItem = (p1: P2, p2: P2, o: DimOrient, off: number, st: Style, id = newId()): Item =>
  ({ id, t: "dim", o, x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1], off, label: MEASURE, side: -1, size: st.dimSize, font: st.dimFont, hz: false });

function draftItem(d: Draft, st: Style): Item | null {
  if (d.t === "drag") return d.tool === "dim" ? { id: "draft", t: "line", k: "cons", sw: "auto", arrow: "none", x1: d.a[0], y1: d.a[1], x2: d.b[0], y2: d.b[1] } : fromDrag(d.tool, d.a, d.b, st);
  if (d.t === "dimoff") return dimItem(d.p1, d.p2, d.o, d.off, st, "draft");
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
    case "rect": case "grid": return <rect x={it.x} y={it.y} width={it.w} height={it.h} className={cn} />;
    case "circle": return <circle cx={it.cx} cy={it.cy} r={it.r} className={cn} />;
    case "pt": case "step": return <circle cx={it.x} cy={it.y} r={8} className="rys-hit is-fill" />;
    case "text": { const b = bbox(it); return <rect x={b[0] - 2} y={b[1] - 2} width={b[2] - b[0] + 4} height={b[3] - b[1] + 4} className="rys-hit is-fill" />; }
    default: return null; // poly i arc: kształt z renderera powtarzany niżej
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
}

export default function Editor({ initial, onChange, actions }: EditorProps) {
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
  const add = (it: Item, focus = false) => { set(addItems(doc, [it]), [it.id]); if (focus) setFocusKey((k) => k + 1); };
  const pickTool = (t: Tool) => { setTool(t); setDraft(null); setMark(null); if (t !== "select") dispatch({ type: "sel", sel: [] }); };

  const act = (a: PanelAction) => {
    if (!sel.length) return;
    if (a === "del") set(removeItems(doc, sel), []);
    else if (a === "dup") { const d = duplicate(doc, sel); set(d.doc, d.ids); }
    else if (a === "up" || a === "down" || a === "top" || a === "bottom") set(reorder(doc, sel, a));
    else if (a === "flip") edit((it) => (it.t === "arc" ? { ...it, a0: it.a1, a1: it.a0 } : it.t === "line" ? { ...it, x1: it.x2, y1: it.y2, x2: it.x1, y2: it.y1 } : it));
    else set(align(doc, sel, a === "atop" ? "top" : a === "abottom" ? "bottom" : a));
  };

  /* ───────────── przyciąganie ───────────── */
  const cacheFor = (skip: string[], extra: P2[]): SnapCache => {
    const key = `${skip.join(",")}|${extra.map((p) => p.join(",")).join(" ")}`;
    const hc = cacheRef.current;
    if (hc && hc.items === doc.items && hc.key === key) return hc.c;
    const cc = snapCache(doc.items, new Set(skip), extra);
    cacheRef.current = { items: doc.items, key, c: cc };
    return cc;
  };
  const draftPts = (d: Draft | null): P2[] => !d ? [] : d.t === "poly" ? d.pts : d.t === "drag" ? [d.a] : d.t === "arc3" ? (d.e ? [d.s, d.e] : [d.s]) : d.t === "arcc" ? (d.s ? [d.c, d.s] : [d.c]) : [d.p1, d.p2];
  /** punkt kursora po przyciągnięciu; `from` — punkt początkowy (Shift co 45°, prostopadle) */
  const snapAt = (p: P2, e: { altKey: boolean; shiftKey: boolean }, from?: P2 | null, skip: string[] = []): P2 => {
    if (e.altKey) { setMark(null); return [q(p[0]), q(p[1])]; }
    const pp = e.shiftKey && from ? constrain(from[0], from[1], p[0], p[1]) : p;
    const s = snap(pp[0], pp[1], { grid, from, tol: 9 * u, cache: snapOn && !(e.shiftKey && from) ? cacheFor(skip, draftPts(draft)) : undefined });
    setMark(s.to === "grid" || s.to === "free" ? null : { x: s.x, y: s.y, kind: s.to });
    return [s.x, s.y];
  };

  /* ───────────── mysz ───────────── */
  const at = (e: { clientX: number; clientY: number }): P2 => {
    const r = svg.current!.getBoundingClientRect();
    return [((e.clientX - r.left) * RYS_W) / r.width, ((e.clientY - r.top) * doc.h) / r.height];
  };

  const finishDrag = (d: Extract<Draft, { t: "drag" }>, b: P2, chain: boolean) => {
    if (d.tool === "dim") {
      if (Math.hypot(b[0] - d.a[0], b[1] - d.a[1]) < 0.5) { setDraft(null); return; }
      setDraft({ t: "dimoff", p1: d.a, p2: b, o: style.dimMode === "a" ? "a" : autoOrient(d.a, b, b), off: 0 });
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
  const endDraft = () => { if (draft?.t === "poly") finishPoly(draft.pts, false); else setDraft(null); setMark(null); };

  const onDown = (e: PointerEvent<SVGSVGElement>) => {
    if (e.button === 2) { e.preventDefault(); endDraft(); return; }
    if (e.button !== 0) return;
    root.current?.focus({ preventScroll: true });
    const p = at(e), target = e.target as Element;
    if (tool === "select") {
      e.currentTarget.setPointerCapture(e.pointerId);
      const h = target.closest("[data-h]"), el = target.closest("[data-id]");
      if (h && sel.length === 1) drag.current = { kind: "handle", id: sel[0], key: h.getAttribute("data-h")!, from: doc };
      else if (el) {
        const id = el.getAttribute("data-id")!;
        const next = e.shiftKey ? (sel.includes(id) ? sel.filter((s) => s !== id) : [...sel, id]) : sel.includes(id) ? sel : [id];
        dispatch({ type: "sel", sel: next });
        // punkt chwytu przyciągnięty (np. do końca linii) — przy upuszczeniu trafi dokładnie w punkt innej linii
        drag.current = next.includes(id) ? { kind: "move", base: snapAt(p, e), from: doc, ids: next } : null;
      } else {
        if (!e.shiftKey) dispatch({ type: "sel", sel: [] });
        drag.current = { kind: "marquee", start: p, add: e.shiftKey ? sel : [] };
      }
      return;
    }
    if (draft?.t === "dimoff") { add(dimItem(draft.p1, draft.p2, draft.o, draft.off, style)); setDraft(null); setMark(null); return; }
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
    setCursor([q(p[0]), q(p[1])]);
    const d = drag.current;
    if (d?.kind === "move") {
      const t = snapAt(p, e, null, d.ids);
      let dx = t[0] - d.base[0], dy = t[1] - d.base[1];
      if (e.shiftKey) { if (Math.abs(dx) > Math.abs(dy)) dy = 0; else dx = 0; }
      dispatch({ type: "live", doc: patchItems(d.from, d.ids, (it) => translate(it, dx, dy)) });
    } else if (d?.kind === "handle") {
      const it = d.from.items.find((x) => x.id === d.id);
      const fromPt: P2 | null = it?.t === "line" ? (d.key === "p1" ? [it.x2, it.y2] : [it.x1, it.y1]) : null;
      const sp = snapAt(p, e, fromPt, [d.id]);
      dispatch({ type: "live", doc: patchItems(d.from, [d.id], (x) => moveHandle(x, d.key, sp[0], sp[1])) });
    } else if (d?.kind === "marquee") setMarquee([Math.min(d.start[0], p[0]), Math.min(d.start[1], p[1]), Math.max(d.start[0], p[0]), Math.max(d.start[1], p[1])]);
    else if (draft?.t === "drag") {
      let b = snapAt(p, e, draft.tool === "line" || draft.tool === "dim" ? draft.a : null);
      if (e.shiftKey && draft.tool === "rect") { const s = Math.max(Math.abs(b[0] - draft.a[0]), Math.abs(b[1] - draft.a[1])); b = [draft.a[0] + Math.sign(b[0] - draft.a[0] || 1) * s, draft.a[1] + Math.sign(b[1] - draft.a[1] || 1) * s]; }
      setDraft({ ...draft, b });
    } else if (draft?.t === "dimoff") {
      const cpt = snapAt(p, e);
      const o = style.dimMode === "a" ? "a" : autoOrient(draft.p1, draft.p2, cpt);
      setDraft({ ...draft, o, off: dimOffsetAt({ o, x1: draft.p1[0], y1: draft.p1[1], x2: draft.p2[0], y2: draft.p2[1] }, cpt) });
    } else if (draft?.t === "poly") setDraft({ ...draft, cur: snapAt(p, e, draft.pts[draft.pts.length - 1]) });
    else if (draft?.t === "arc3") setDraft({ ...draft, cur: snapAt(p, e, draft.e ? null : draft.s) });
    else if (draft?.t === "arcc") setDraft({ ...draft, cur: snapAt(p, e, draft.s ? null : draft.c) });
    else if (tool !== "select") snapAt(p, e); // znacznik przyciągania także przed pierwszym kliknięciem
    else setMark(null);
  };

  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    if (d?.kind === "move" || d?.kind === "handle") { dispatch({ type: "settle", from: d.from }); setMark(null); }
    else if (d?.kind === "marquee") {
      if (marquee && (marquee[2] - marquee[0] > 1 || marquee[3] - marquee[1] > 1)) {
        const inside = doc.items.filter((it) => intersects(bbox(it), marquee)).map((it) => it.id);
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
    if (mod && k === "z") { done(); dispatch({ type: e.shiftKey ? "redo" : "undo" }); }
    else if (mod && k === "y") { done(); dispatch({ type: "redo" }); }
    else if (mod && k === "d") { done(); act("dup"); }
    else if (mod && k === "a") { done(); setTool("select"); dispatch({ type: "sel", sel: doc.items.map((it) => it.id) }); }
    else if (mod && (k === "=" || k === "+")) { done(); zoomTo(zoom * 1.25); }
    else if (mod && k === "-") { done(); zoomTo(zoom / 1.25); }
    else if (mod && k === "0") { done(); zoomTo(1); }
    else if (mod) return;
    else if (e.key === "+" || e.key === "=") zoomTo(zoom * 1.25);
    else if (e.key === "-") zoomTo(zoom / 1.25);
    else if (e.key === "0") zoomTo(1);
    else if (e.key === "Delete" || e.key === "Backspace") { done(); act("del"); }
    else if (e.key === "Escape") { if (draft) endDraft(); else if (sel.length) dispatch({ type: "sel", sel: [] }); else setTool("select"); }
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
    try {
      const data = JSON.parse(e.clipboardData.getData("text/plain")) as { items?: unknown[] };
      const raw = Array.isArray(data.items) ? data.items : [];
      const same = raw.length > 0 && doc.items.some((it) => JSON.stringify(storeItem(it)) === JSON.stringify(raw[0])); // wklejane na to samo miejsce → odsuń
      const items = raw.flatMap((r) => { const it = parseItem(r); return it ? [same ? translate(it, 10, 10) : it] : []; });
      if (!items.length) return;
      e.preventDefault();
      setTool("select");
      set(addItems(doc, items), items.map((it) => it.id));
    } catch { /* w schowku nie ma rysunku */ }
  };

  /* ───────────── widok ───────────── */
  const preview = draft ? draftItem(draft, style) : null;
  const one = sel.length === 1 ? doc.items.find((it) => it.id === sel[0]) : undefined;
  const hr = 4.5 * u; // uchwyt: stały rozmiar na ekranie
  const gs = grid >= 2.5 ? grid : 10;
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
    if (mode === "replace") { set({ h: r.h, k: r.k, items: r.items }, []); zoomTo(1); }
    else { const fresh = r.items.map((it) => ({ ...it, id: newId() })); set(addItems(doc, fresh), fresh.map((it) => it.id)); }
  };

  return (
    <div ref={root} className="rys-ed" tabIndex={0} onKeyDown={onKey} onKeyUp={onKeyUp} onBlur={() => setPanKey(false)} onCopy={onCopy} onCut={onCopy} onPaste={onPaste}>
      <div className="rys-bar" role="toolbar" aria-label="Narzędzia rysownika">
        <div className="rys-tools">{TOOLS.map(toolBtn)}</div>
        <div className="rys-tools">
          <button type="button" className="rys-tool" disabled={!st.past.length} onClick={() => dispatch({ type: "undo" })} title="Cofnij (Ctrl+Z)">{icons.undo}<span>Cofnij</span></button>
          <button type="button" className="rys-tool" disabled={!st.future.length} onClick={() => dispatch({ type: "redo" })} title="Ponów (Ctrl+Shift+Z)">{icons.redo}<span>Ponów</span></button>
        </div>
        <div className="rys-tools">
          <button type="button" className="rys-tool" aria-pressed={snapOn} onClick={() => setSnapOn((v) => !v)} title="Przyciąganie do końców, środków, przecięć i linii (Alt wyłącza na chwilę)">{icons.magnet}<span>Punkty</span></button>
          <button type="button" className="rys-tool" aria-pressed={showGrid} onClick={() => setShowGrid((v) => !v)} title="Pokaż siatkę roboczą (nie trafia na rysunek)">{icons.dots}<span>Siatka</span></button>
          <label className="rys-step" title="Skok przyciągania do siatki, w jednostkach rysunku">Skok
            <select value={grid} onChange={(e) => setGrid(+e.target.value)}>{GRID_STEPS.map((g) => <option key={g} value={g}>{g === 0 ? "brak" : fmt(g)}</option>)}</select>
          </label>
        </div>
        <div className="rys-tools">
          <button type="button" className="rys-tool" onClick={() => zoomTo(zoom / 1.25)} title="Pomniejsz (−, kółko myszy)">{icons.zout}<span>Pomniejsz</span></button>
          <button type="button" className="rys-tool rys-zoom" onClick={() => zoomTo(1)} title="Dopasuj do okna (0)">{icons.fit}<span>{Math.round(zoom * 100)}%</span></button>
          <button type="button" className="rys-tool" onClick={() => zoomTo(zoom * 1.25)} title="Powiększ (+, kółko myszy)">{icons.zin}<span>Powiększ</span></button>
        </div>
        <div className="rys-tools">
          <button type="button" className="rys-tool" onClick={() => setImporting(true)} title="Wczytaj rysunek z dowolnej strony serwisu do edycji">{icons.import}<span>Import</span></button>
        </div>
        {actions && <div className="rys-actions">{actions}</div>}
      </div>

      <div ref={stage} className={`rys-stage${panKey || panning ? " is-pan" : ""}${panning ? " is-panning" : ""}`}
        onPointerDownCapture={onStageDown} onPointerMove={onStageMove} onPointerUp={onStageUp} onPointerCancel={onStageUp}
        onMouseDown={(e) => { if (e.button === 1) e.preventDefault(); /* bez autoprzewijania środkowym przyciskiem */ }}>
        <div className="rys-pad">
          <div className="fig rys-sheet" style={{ width: RYS_W * S, height: doc.h * S }}>
            <svg ref={svg} viewBox={`0 0 ${RYS_W} ${doc.h}`} className={`rys-svg tool-${tool}`} role="application" aria-label="Płótno rysunku"
              onMouseDown={(e) => e.preventDefault() /* fokus ustawia onDown; domyślny zabrałby go polu w panelu */}
              onContextMenu={(e) => e.preventDefault()}
              onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onPointerLeave={() => { setCursor(null); if (!draft && !drag.current) setMark(null); }}
              onDoubleClick={() => { if (draft?.t === "poly") finishPoly(draft.pts, false); else if (tool === "select" && sel.length === 1) setFocusKey((k) => k + 1); }}>
              <FigDefs id={ED} />
              <defs>
                <pattern id={`${ED}-g`} width={gs} height={gs} patternUnits="userSpaceOnUse"><path d={`M ${gs} 0 H 0 V ${gs}`} className="rys-gmin" /></pattern>
                <pattern id={`${ED}-G`} width="50" height="50" patternUnits="userSpaceOnUse"><path d="M 50 0 H 0 V 50" className="rys-gmaj" /></pattern>
              </defs>
              {showGrid && <g pointerEvents="none">{gs * S >= 6 && <rect width={RYS_W} height={doc.h} fill={`url(#${ED}-g)`} />}<rect width={RYS_W} height={doc.h} fill={`url(#${ED}-G)`} /></g>}
              {doc.items.map((it) => (
                <g key={it.id} data-id={it.id} className="rys-item">
                  {renderItem(it, c, doc.k)}
                  {it.t === "poly" || it.t === "arc" ? <g className={`rys-hitwrap${it.t === "poly" && it.fill !== "none" ? " is-fill" : ""}`}>{renderItem({ ...it, arrow: "none" } as Item, c)}</g> : hit(it)}
                </g>
              ))}
              {preview && <g className="rys-draft" pointerEvents="none">{renderItem(preview, c, doc.k)}</g>}
              {draft?.t === "poly" && <circle cx={draft.pts[0][0]} cy={draft.pts[0][1]} r={hr} className="rys-close" pointerEvents="none" />}
              {draft?.t === "arc3" && draft.e && <line x1={draft.s[0]} y1={draft.s[1]} x2={draft.e[0]} y2={draft.e[1]} className="rys-chord" pointerEvents="none" />}
              {tool === "select" && doc.items.filter((it) => sel.includes(it.id)).map((it) => { const b = bbox(it), pad = 3 * u; return <rect key={it.id} x={b[0] - pad} y={b[1] - pad} width={b[2] - b[0] + 2 * pad} height={b[3] - b[1] + 2 * pad} className="rys-selbox" pointerEvents="none" />; })}
              {tool === "select" && one && handles(one).map((h) => <circle key={h.key} data-h={h.key} cx={h.x} cy={h.y} r={hr} className={`rys-handle${h.key === "off" || h.key === "c" || h.key === "m" ? " is-alt" : ""}`} />)}
              {marquee && <rect x={marquee[0]} y={marquee[1]} width={marquee[2] - marquee[0]} height={marquee[3] - marquee[1]} className="rys-marquee" pointerEvents="none" />}
              {mark && <SnapMark {...mark} u={u} />}
            </svg>
          </div>
        </div>
      </div>

      <PropsPanel doc={doc} sel={sel} tool={tool} style={style} focusKey={focusKey}
        edit={edit} settle={settle} onStyle={(p) => setStyle((s) => ({ ...s, ...p }))}
        onDoc={(p) => { liveFrom.current ??= doc; dispatch({ type: "live", doc: { ...doc, ...p } }); }}
        onSelect={(ids) => { setTool("select"); dispatch({ type: "sel", sel: ids }); }} onAction={act} />

      <div className="rys-status">
        <span className="rys-coords">{cursor ? `X ${fmt(cursor[0])} · Y ${fmt(cursor[1])}` : `360 × ${doc.h}`}</span>
        {mark && <span className="rys-snapname">{SNAP_LABEL[mark.kind]}</span>}
        {measure && <span className="rys-measure">{measure}</span>}
        <span className="rys-hint">{hint} Kółko myszy — powiększenie, środkowy przycisk albo spacja — przesuwanie widoku.</span>
      </div>
      {importing && <ImportDialog onImport={doImport} onClose={() => { setImporting(false); root.current?.focus({ preventScroll: true }); }} />}
    </div>
  );
}
