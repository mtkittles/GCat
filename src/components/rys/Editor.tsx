"use client";
import { useEffect, useEffectEvent, useReducer, useRef, useState, type ClipboardEvent, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { FigDefs, figCtx } from "@/components/fig";
import {
  angleOf, bbox, constrain, dimNormal, handles, intersects, length, moveHandle, newId, parseItem, r5, RYS_W, snap, snapPoints, storeItem, translate,
  type Item, type P2, type RysDoc,
} from "@/lib/rys/model";
import { icons, type IconName } from "./icons";
import PropsPanel, { DEFAULT_STYLE, type PanelAction, type Style } from "./Props";
import { renderItem } from "./render";
import { addItems, align, duplicate, edReducer, initEd, patchItems, removeItems, reorder } from "./state";

/*
  Edytor rysownika GCat (paczka RA): płótno SVG 360 × h rysowane tym samym kodem co rysunki na stronie.
  Mysz i klawiatura (komputer). Styl elementów tylko z list w panelu — rysunek nie może wyjść poza styl serwisu.
*/

export type Tool = "select" | "line" | "poly" | "rect" | "circle" | "arc" | "text" | "dim" | "pt" | "step" | "grid";
const TOOLS: { id: Tool; label: string; key: string; hint: string }[] = [
  { id: "select", label: "Zaznacz", key: "V", hint: "Kliknij element, żeby go zaznaczyć; przeciągnij, żeby przesunąć. Shift dodaje do zaznaczenia, przeciągnięcie po pustym polu zaznacza obszar." },
  { id: "line", label: "Linia", key: "L", hint: "Przeciągnij od początku do końca. Shift — kierunek co 45°, Alt — bez przyciągania." },
  { id: "poly", label: "Polilinia", key: "P", hint: "Klikaj kolejne punkty. Enter albo podwójne kliknięcie kończy, kliknięcie w pierwszy punkt zamyka kontur." },
  { id: "rect", label: "Prostokąt", key: "R", hint: "Przeciągnij od rogu do rogu. Shift — kwadrat." },
  { id: "circle", label: "Okrąg", key: "C", hint: "Przeciągnij od środka na zewnątrz." },
  { id: "arc", label: "Łuk", key: "A", hint: "Trzy kliknięcia: środek, początek łuku, koniec łuku. Łuk biegnie zgodnie z ruchem wskazówek zegara — kierunek odwrócisz w panelu." },
  { id: "dim", label: "Wymiar", key: "D", hint: "Przeciągnij między mierzonymi punktami, potem odsuń linię wymiarową uchwytem i wpisz opis." },
  { id: "text", label: "Tekst", key: "T", hint: "Kliknij miejsce tekstu i wpisz treść w panelu." },
  { id: "pt", label: "Punkt", key: "O", hint: "Kliknij położenie punktu, opis wpisz w panelu." },
  { id: "step", label: "Krok", key: "N", hint: "Kliknij — kolejne numery kroków nadają się same." },
  { id: "grid", label: "Siatka", key: "G", hint: "Przeciągnij obszar siatki współrzędnych (element rysunku, widoczny na stronie)." },
];
const DRAG_TOOLS = new Set<Tool>(["line", "rect", "circle", "dim", "grid"]);
const LINE_TOOLS = new Set<Tool>(["line", "poly", "rect", "circle", "arc"]);
const GRID_STEPS = [0, 1, 2.5, 5, 10];

type Draft =
  | { t: "drag"; tool: Tool; a: P2; b: P2 }
  | { t: "poly"; pts: P2[]; cur: P2 }
  | { t: "arc"; c: P2; s: P2 | null; cur: P2 };
type Drag =
  | { kind: "move"; start: P2; from: RysDoc; ids: string[] }
  | { kind: "handle"; id: string; key: string; from: RysDoc }
  | { kind: "marquee"; start: P2; add: string[] };

const ED = "rys-ed";
const CLIP = "gcat-rys";

/** Element z przeciągnięcia a → b narzędziem `tool`. */
function fromDrag(tool: Tool, a: P2, b: P2, st: Style): Item | null {
  const id = newId();
  if (tool === "line") return { id, t: "line", k: st.k, thick: st.thick, arrow: st.arrow, x1: a[0], y1: a[1], x2: b[0], y2: b[1] };
  if (tool === "dim") return { id, t: "dim", x1: a[0], y1: a[1], x2: b[0], y2: b[1], off: 0, label: String(length(a[0], a[1], b[0], b[1])).replace(".", ","), side: -1 };
  const x = Math.min(a[0], b[0]), y = Math.min(a[1], b[1]), w = Math.abs(b[0] - a[0]), h = Math.abs(b[1] - a[1]);
  if (tool === "rect") return { id, t: "rect", k: st.k, thick: st.thick, fill: st.fill, x, y, w, h, r: 0 };
  if (tool === "grid") return { id, t: "grid", x, y, w, h, minor: 5, major: 10 };
  if (tool === "circle") return { id, t: "circle", k: st.k, thick: st.thick, fill: st.fill, cx: a[0], cy: a[1], r: r5(Math.hypot(b[0] - a[0], b[1] - a[1])) };
  return null;
}
function draftItem(d: Draft, st: Style): Item | null {
  if (d.t === "drag") return fromDrag(d.tool, d.a, d.b, st);
  if (d.t === "poly") return { id: "draft", t: "poly", k: st.k, thick: st.thick, arrow: "none", fill: "none", closed: false, pts: [...d.pts, d.cur] };
  if (!d.s) return { id: "draft", t: "line", k: "cons", thick: false, arrow: "none", x1: d.c[0], y1: d.c[1], x2: d.cur[0], y2: d.cur[1] };
  return { id: "draft", t: "arc", k: st.k, thick: st.thick, arrow: st.arrow, cx: d.c[0], cy: d.c[1], r: r5(Math.hypot(d.s[0] - d.c[0], d.s[1] - d.c[1])), a0: angleOf(d.c[0], d.c[1], d.s[0], d.s[1]), a1: angleOf(d.c[0], d.c[1], d.cur[0], d.cur[1]) };
}

/** Niewidoczny, szeroki obszar trafienia myszą dla elementu. */
function hit(it: Item): ReactNode {
  const filled = "fill" in it && it.fill !== "none";
  const cn = `rys-hit${filled ? " is-fill" : ""}`;
  switch (it.t) {
    case "line": return <line x1={it.x1} y1={it.y1} x2={it.x2} y2={it.y2} className={cn} />;
    case "dim": { const [nx, ny] = dimNormal(it), o = it.off; return <line x1={it.x1 + nx * o} y1={it.y1 + ny * o} x2={it.x2 + nx * o} y2={it.y2 + ny * o} className={cn} />; }
    case "rect": case "grid": return <rect x={it.x} y={it.y} width={it.w} height={it.h} className={cn} />;
    case "circle": return <circle cx={it.cx} cy={it.cy} r={it.r} className={cn} />;
    case "pt": case "step": return <circle cx={it.x} cy={it.y} r={8} className="rys-hit is-fill" />;
    case "text": { const b = bbox(it); return <rect x={b[0] - 2} y={b[1] - 2} width={b[2] - b[0] + 4} height={b[3] - b[1] + 4} className="rys-hit is-fill" />; }
    default: return null; // poly i arc: ścieżka z renderera jest powtarzana niżej
  }
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
  const [grid, setGrid] = useState(5);
  const [snapPts, setSnapPts] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [marquee, setMarquee] = useState<[number, number, number, number] | null>(null);
  const [cursor, setCursor] = useState<P2 | null>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const [focusKey, setFocusKey] = useState(0);
  const root = useRef<HTMLDivElement>(null), stage = useRef<HTMLDivElement>(null), svg = useRef<SVGSVGElement>(null);
  const drag = useRef<Drag | null>(null);
  const liveFrom = useRef<RysDoc | null>(null);

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
  const scale = box ? Math.max(0.5, Math.min((box.w - 40) / RYS_W, (box.h - 40) / doc.h)) : 2;
  const c = figCtx(ED);

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
  const pickTool = (t: Tool) => { setTool(t); setDraft(null); if (t !== "select") dispatch({ type: "sel", sel: [] }); };

  const act = (a: PanelAction) => {
    if (!sel.length) return;
    if (a === "del") set(removeItems(doc, sel), []);
    else if (a === "dup") { const d = duplicate(doc, sel); set(d.doc, d.ids); }
    else if (a === "up" || a === "down" || a === "top" || a === "bottom") set(reorder(doc, sel, a));
    else if (a === "flip") edit((it) => (it.t === "arc" ? { ...it, a0: it.a1, a1: it.a0 } : it.t === "line" ? { ...it, x1: it.x2, y1: it.y2, x2: it.x1, y2: it.y1 } : it));
    else set(align(doc, sel, a === "atop" ? "top" : a === "abottom" ? "bottom" : a));
  };

  /* ───────────── mysz ───────────── */
  const at = (e: PointerEvent): P2 => {
    const r = svg.current!.getBoundingClientRect();
    return [((e.clientX - r.left) * RYS_W) / r.width, ((e.clientY - r.top) * doc.h) / r.height];
  };
  const snapAt = (p: P2, e: PointerEvent, from?: P2 | null, skip?: Set<string>): P2 => {
    if (e.altKey) return [r5(p[0]), r5(p[1])];
    const q = e.shiftKey && from ? constrain(from[0], from[1], p[0], p[1]) : p;
    const s = snap(q[0], q[1], { grid, points: snapPts ? snapPoints(doc.items, skip) : [], tol: 6 / scale + 1.5 });
    return [s.x, s.y];
  };

  const onDown = (e: PointerEvent<SVGSVGElement>) => {
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
        drag.current = next.includes(id) ? { kind: "move", start: p, from: doc, ids: next } : null;
      } else {
        if (!e.shiftKey) dispatch({ type: "sel", sel: [] });
        drag.current = { kind: "marquee", start: p, add: e.shiftKey ? sel : [] };
      }
      return;
    }
    const sp = snapAt(p, e);
    if (DRAG_TOOLS.has(tool)) { e.currentTarget.setPointerCapture(e.pointerId); setDraft({ t: "drag", tool, a: sp, b: sp }); return; }
    if (tool === "poly") {
      if (draft?.t === "poly") {
        const [fx, fy] = draft.pts[0], q = snapAt(p, e, draft.pts[draft.pts.length - 1]);
        if (draft.pts.length >= 3 && Math.hypot(q[0] - fx, q[1] - fy) < 0.5) finishPoly(draft.pts, true);
        else setDraft({ t: "poly", pts: [...draft.pts, q], cur: q });
      } else setDraft({ t: "poly", pts: [sp], cur: sp });
      return;
    }
    if (tool === "arc") {
      if (draft?.t !== "arc") setDraft({ t: "arc", c: sp, s: null, cur: sp });
      else if (!draft.s) { if (Math.hypot(sp[0] - draft.c[0], sp[1] - draft.c[1]) >= 1) setDraft({ ...draft, s: sp, cur: sp }); }
      else { const it = draftItem({ ...draft, cur: sp }, style); setDraft(null); if (it) add({ ...it, id: newId() }); }
      return;
    }
    if (tool === "text") add({ id: newId(), t: "text", x: sp[0], y: sp[1], s: "Tekst", anchor: "start", size: style.size, bold: style.bold, mono: style.mono, color: style.color }, true);
    else if (tool === "pt") add({ id: newId(), t: "pt", x: sp[0], y: sp[1], label: "", pos: "ne", color: "ink" }, true);
    else if (tool === "step") add({ id: newId(), t: "step", x: sp[0], y: sp[1], n: Math.min(99, 1 + Math.max(0, ...doc.items.map((it) => (it.t === "step" ? it.n : 0)))) });
  };

  const finishPoly = (pts: P2[], closed: boolean) => {
    setDraft(null);
    // punkty podwojone podwójnym kliknięciem odpadają
    const clean = pts.filter((q, i) => i === 0 || Math.hypot(q[0] - pts[i - 1][0], q[1] - pts[i - 1][1]) >= 0.5);
    if (clean.length >= 2) add({ id: newId(), t: "poly", k: style.k, thick: style.thick, arrow: closed ? "none" : style.arrow, fill: closed ? style.fill : "none", closed, pts: clean });
  };

  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    const p = at(e);
    setCursor([r5(p[0]), r5(p[1])]);
    const d = drag.current;
    if (d?.kind === "move") {
      let dx = p[0] - d.start[0], dy = p[1] - d.start[1];
      if (e.shiftKey) { if (Math.abs(dx) > Math.abs(dy)) dy = 0; else dx = 0; }
      const g = e.altKey ? 0.5 : grid || 0.5;
      dx = Math.round(dx / g) * g; dy = Math.round(dy / g) * g;
      dispatch({ type: "live", doc: patchItems(d.from, d.ids, (it) => translate(it, dx, dy)) });
    } else if (d?.kind === "handle") {
      const sp = snapAt(p, e, null, new Set([d.id]));
      dispatch({ type: "live", doc: patchItems(d.from, [d.id], (it) => moveHandle(it, d.key, sp[0], sp[1])) });
    } else if (d?.kind === "marquee") setMarquee([Math.min(d.start[0], p[0]), Math.min(d.start[1], p[1]), Math.max(d.start[0], p[0]), Math.max(d.start[1], p[1])]);
    else if (draft?.t === "drag") {
      let b = snapAt(p, e, draft.tool === "line" || draft.tool === "dim" ? draft.a : null);
      if (e.shiftKey && draft.tool === "rect") { const s = Math.max(Math.abs(b[0] - draft.a[0]), Math.abs(b[1] - draft.a[1])); b = [draft.a[0] + Math.sign(b[0] - draft.a[0] || 1) * s, draft.a[1] + Math.sign(b[1] - draft.a[1] || 1) * s]; }
      setDraft({ ...draft, b });
    } else if (draft?.t === "poly") setDraft({ ...draft, cur: snapAt(p, e, draft.pts[draft.pts.length - 1]) });
    else if (draft?.t === "arc") setDraft({ ...draft, cur: snapAt(p, e) });
  };

  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    if (d?.kind === "move" || d?.kind === "handle") dispatch({ type: "settle", from: d.from });
    else if (d?.kind === "marquee") {
      if (marquee && (marquee[2] - marquee[0] > 1 || marquee[3] - marquee[1] > 1)) {
        const inside = doc.items.filter((it) => intersects(bbox(it), marquee)).map((it) => it.id);
        dispatch({ type: "sel", sel: [...new Set([...d.add, ...inside])] });
      }
      setMarquee(null);
    } else if (draft?.t === "drag") {
      const far = Math.hypot(draft.b[0] - draft.a[0], draft.b[1] - draft.a[1]) >= 1;
      const flat = (draft.tool === "rect" || draft.tool === "grid") && (draft.b[0] === draft.a[0] || draft.b[1] === draft.a[1]);
      const it = far && !flat ? fromDrag(draft.tool, draft.a, draft.b, style) : null;
      setDraft(null);
      if (it) add(it, it.t === "dim");
    }
  };

  /* ───────────── klawiatura i schowek ───────────── */
  const typing = (t: EventTarget) => t instanceof HTMLElement && (t.tagName === "INPUT" || t.tagName === "SELECT" || t.tagName === "TEXTAREA");
  const onKey = (e: KeyboardEvent) => {
    if (typing(e.target)) { if (e.key === "Escape" || e.key === "Enter") { (e.target as HTMLElement).blur(); root.current?.focus(); } return; }
    const mod = e.ctrlKey || e.metaKey, k = e.key.toLowerCase();
    const done = () => e.preventDefault();
    if (mod && k === "z") { done(); dispatch({ type: e.shiftKey ? "redo" : "undo" }); }
    else if (mod && k === "y") { done(); dispatch({ type: "redo" }); }
    else if (mod && k === "d") { done(); act("dup"); }
    else if (mod && k === "a") { done(); setTool("select"); dispatch({ type: "sel", sel: doc.items.map((it) => it.id) }); }
    else if (mod) return;
    else if (e.key === "Delete" || e.key === "Backspace") { done(); act("del"); }
    else if (e.key === "Escape") { if (draft) setDraft(null); else if (sel.length) dispatch({ type: "sel", sel: [] }); else setTool("select"); }
    else if (e.key === "Enter" && draft?.t === "poly") { done(); finishPoly(draft.pts, false); }
    else if (e.key === "]") act("up");
    else if (e.key === "[") act("down");
    else if (e.key.startsWith("Arrow") && sel.length) {
      done();
      const g = (grid || 1) * (e.shiftKey ? 5 : 1);
      const [dx, dy] = e.key === "ArrowLeft" ? [-g, 0] : e.key === "ArrowRight" ? [g, 0] : e.key === "ArrowUp" ? [0, -g] : [0, g];
      set(patchItems(doc, sel, (it) => translate(it, dx, dy)));
    } else { const t = TOOLS.find((x) => x.key.toLowerCase() === k); if (t) pickTool(t.id); }
  };
  const onCopy = (e: ClipboardEvent) => {
    if (typing(e.target) || !sel.length) return;
    e.preventDefault();
    e.clipboardData.setData("text/plain", JSON.stringify({ [CLIP]: 1, items: doc.items.filter((it) => sel.includes(it.id)).map(storeItem) }));
    if (e.type === "cut") act("del");
  };
  const onPaste = (e: ClipboardEvent) => {
    if (typing(e.target)) return;
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
  const hr = 4.5 / scale + 0.6; // uchwyt: stały rozmiar na ekranie
  const gs = grid >= 2.5 ? grid : 10;
  const toolBtn = (t: (typeof TOOLS)[number]) => (
    <button key={t.id} type="button" className="rys-tool" aria-pressed={tool === t.id} title={`${t.label} (${t.key})`} onClick={() => pickTool(t.id)}>
      {icons[t.id as IconName]}<span>{t.label}</span>
    </button>
  );
  const hint = TOOLS.find((t) => t.id === tool)!.hint;

  return (
    <div ref={root} className="rys-ed" tabIndex={0} onKeyDown={onKey} onCopy={onCopy} onCut={onCopy} onPaste={onPaste}>
      <div className="rys-bar" role="toolbar" aria-label="Narzędzia rysownika">
        <div className="rys-tools">{TOOLS.map(toolBtn)}</div>
        <div className="rys-tools">
          <button type="button" className="rys-tool" disabled={!st.past.length} onClick={() => dispatch({ type: "undo" })} title="Cofnij (Ctrl+Z)">{icons.undo}<span>Cofnij</span></button>
          <button type="button" className="rys-tool" disabled={!st.future.length} onClick={() => dispatch({ type: "redo" })} title="Ponów (Ctrl+Shift+Z)">{icons.redo}<span>Ponów</span></button>
        </div>
        <div className="rys-tools">
          <button type="button" className="rys-tool" aria-pressed={snapPts} onClick={() => setSnapPts((v) => !v)} title="Przyciąganie do końców linii, wierzchołków i środków">{icons.magnet}<span>Punkty</span></button>
          <button type="button" className="rys-tool" aria-pressed={showGrid} onClick={() => setShowGrid((v) => !v)} title="Pokaż siatkę roboczą (nie trafia na rysunek)">{icons.dots}<span>Siatka</span></button>
          <label className="rys-step" title="Skok przyciągania do siatki, w jednostkach rysunku">Skok
            <select value={grid} onChange={(e) => setGrid(+e.target.value)}>{GRID_STEPS.map((g) => <option key={g} value={g}>{g === 0 ? "brak" : String(g).replace(".", ",")}</option>)}</select>
          </label>
        </div>
        {actions && <div className="rys-actions">{actions}</div>}
      </div>

      <div ref={stage} className="rys-stage">
        <div className="fig rys-sheet" style={{ width: RYS_W * scale, height: doc.h * scale }}>
          <svg ref={svg} viewBox={`0 0 ${RYS_W} ${doc.h}`} className={`rys-svg tool-${tool}`} role="application" aria-label="Płótno rysunku"
            onMouseDown={(e) => e.preventDefault() /* fokus ustawia onDown; domyślny zabrałby go polu w panelu */}
            onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onPointerLeave={() => setCursor(null)}
            onDoubleClick={() => { if (draft?.t === "poly") finishPoly(draft.pts, false); else if (tool === "select" && sel.length === 1) setFocusKey((k) => k + 1); }}>
            <FigDefs id={ED} />
            <defs>
              <pattern id={`${ED}-g`} width={gs} height={gs} patternUnits="userSpaceOnUse"><path d={`M ${gs} 0 H 0 V ${gs}`} className="rys-gmin" /></pattern>
              <pattern id={`${ED}-G`} width="50" height="50" patternUnits="userSpaceOnUse"><path d="M 50 0 H 0 V 50" className="rys-gmaj" /></pattern>
            </defs>
            {showGrid && <g pointerEvents="none">{gs * scale >= 7 && <rect width={RYS_W} height={doc.h} fill={`url(#${ED}-g)`} />}<rect width={RYS_W} height={doc.h} fill={`url(#${ED}-G)`} /></g>}
            {doc.items.map((it) => (
              <g key={it.id} data-id={it.id} className="rys-item">
                {renderItem(it, c)}
                {it.t === "poly" || it.t === "arc" ? <g className={`rys-hitwrap${it.t === "poly" && it.fill !== "none" ? " is-fill" : ""}`}>{renderItem({ ...it, arrow: "none" } as Item, c)}</g> : hit(it)}
              </g>
            ))}
            {preview && <g className="rys-draft" pointerEvents="none">{renderItem(preview, c)}</g>}
            {draft?.t === "poly" && <circle cx={draft.pts[0][0]} cy={draft.pts[0][1]} r={hr} className="rys-close" pointerEvents="none" />}
            {tool === "select" && doc.items.filter((it) => sel.includes(it.id)).map((it) => { const b = bbox(it), pad = 3; return <rect key={it.id} x={b[0] - pad} y={b[1] - pad} width={b[2] - b[0] + 2 * pad} height={b[3] - b[1] + 2 * pad} className="rys-selbox" pointerEvents="none" />; })}
            {tool === "select" && one && handles(one).map((h) => <circle key={h.key} data-h={h.key} cx={h.x} cy={h.y} r={hr} className={`rys-handle${h.key === "off" || h.key === "c" ? " is-alt" : ""}`} />)}
            {marquee && <rect x={marquee[0]} y={marquee[1]} width={marquee[2] - marquee[0]} height={marquee[3] - marquee[1]} className="rys-marquee" pointerEvents="none" />}
          </svg>
        </div>
      </div>

      <PropsPanel doc={doc} sel={sel} drawing={LINE_TOOLS.has(tool)} style={style} focusKey={focusKey}
        edit={edit} settle={settle} onStyle={(p) => setStyle((s) => ({ ...s, ...p }))}
        onHeight={(h) => { liveFrom.current ??= doc; dispatch({ type: "live", doc: { ...doc, h } }); }}
        onSelect={(ids) => { setTool("select"); dispatch({ type: "sel", sel: ids }); }} onAction={act} />

      <div className="rys-status">
        <span className="rys-coords">{cursor ? `X ${String(cursor[0]).replace(".", ",")} · Y ${String(cursor[1]).replace(".", ",")}` : `360 × ${doc.h}`}</span>
        <span>{hint}</span>
      </div>
    </div>
  );
}
