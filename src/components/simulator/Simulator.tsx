"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { formatTime, validate, type StockBox } from "@/lib/parser/validate";
import { applyCompensation } from "./compensation";
import SetupPanel from "./SetupPanel";
import Sim3DBoundary from "./Sim3DBoundary";
import { TOOL_LABEL, cuttingRadius, defaultSetup, isLatheTool, toolOf, withProgramTools, type Setup } from "./setup";
import {
  parseProgram,
  pointAt,
  segmentLength,
  type Segment,
  type Vec3,
} from "@/lib/parser";

export type SimMode = "mill" | "lathe";
export type Dialect = "fanuc" | "sinumerik";

const GcodeEditor = dynamic(() => import("./GcodeEditor"), { ssr: false, loading: () => <div className="gcode-editor" style={{ minHeight: 200 }} /> });
const GcodePad = dynamic(() => import("./GcodePad"), { ssr: false });
const Sim3D = dynamic(() => import("./Sim3D"), { ssr: false, loading: () => <div className="sim-canvas" style={{ height: 360 }} /> });

interface Props {
  source: string;
  mode?: SimMode;
  editable?: boolean;
  onSourceChange?: (s: string) => void;
  compact?: boolean;
  autoplay?: boolean;
  dialect?: Dialect;
  allow3d?: boolean;
  /** Wymiary półfabrykatu narzucone przez przykład lub lekcję. */
  stock?: { x: number; y: number; z: number; ox: number; oy: number; oz: number };
  /** Tryb pokazowy: podgląd + kod z podświetlaną linią, odtwarzany w pętli. */
  showcase?: boolean;
}

const COLORS = {
  rapid: "#F59E0B",   // szybki przejazd
  linear: "#22C55E",  // ruch roboczy
  arc: "#38BDF8",     // interpolacja kołowa
  grid: "rgba(255,255,255,0.06)",
  axis: "rgba(255,255,255,0.22)",
  tool: "#FFFFFF",
  stock: "rgba(255,255,255,0.04)",
  stockEdge: "rgba(255,255,255,0.14)",
};

export default function Simulator({ source, mode = "mill", editable = true, onSourceChange, compact = false, autoplay = false, dialect = "fanuc", allow3d = true, stock: stockProp, showcase = false }: Props) {
  const program = useMemo(() => parseProgram(source, { diameterX: mode === "lathe" }), [source, mode]);
  const [show3d, setShow3d] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [full, setFull] = useState(false);
  const linesRef = useRef<HTMLOListElement>(null);
  const editorRef = useRef<{ insert: (t: string) => void } | null>(null);
  const [probe, setProbe] = useState<{ h: number; v: number; px: number; py: number } | null>(null);
  const mapRef = useRef<{ P: (p: Vec3) => readonly [number, number]; inv: (px: number, py: number) => [number, number] } | null>(null);
  const [setup, setSetup] = useState<Setup>(() => { const d = defaultSetup(mode); return stockProp ? { ...d, stock: { ...d.stock, ...stockProp, auto: false } } : d; });
  const [prevMode, setPrevMode] = useState(mode);
  if (prevMode !== mode) { setPrevMode(mode); setSetup({ ...defaultSetup(mode), stock: stockProp ? { ...defaultSetup(mode).stock, ...stockProp, auto: false } : defaultSetup(mode).stock }); }

  const stockKey = stockProp ? `${stockProp.x}x${stockProp.y}x${stockProp.z}:${stockProp.ox},${stockProp.oy},${stockProp.oz}` : "";
  const [prevStockKey, setPrevStockKey] = useState(stockKey);
  if (prevStockKey !== stockKey) {
    setPrevStockKey(stockKey);
    setSetup((s2) => ({ ...s2, stock: stockProp ? { ...s2.stock, ...stockProp, auto: false } : { ...s2.stock, auto: true } }));
  }
  const stockBox = useMemo<StockBox | undefined>(() => {
    if (mode !== "mill" || setup.stock.auto) return undefined;
    const st = setup.stock;
    return { minX: -st.ox, maxX: st.x - st.ox, minY: -st.oy, maxY: st.y - st.oy, top: st.z - st.oz, bottom: -st.oz };
  }, [mode, setup.stock]);
  const issues = useMemo(() => validate(program, dialect, stockBox), [program, dialect, stockBox]);
  const errorLines = useMemo(() => issues.filter((i) => i.level === "error").map((i) => i.line), [issues]);
  const warnLines = useMemo(() => issues.filter((i) => i.level === "warn").map((i) => i.line), [issues]);

  // narzędzia użyte w programie -> uzupełnij tabelę
  const usedTools = useMemo(() => {
    const set = new Set<number>();
    for (const l of program.lines) for (const w of l.words) if (w.letter === "T") set.add(Math.floor(w.value));
    return [...set].filter((n) => n > 0).sort((a, b) => a - b);
  }, [program]);
  const toolsKey = usedTools.join(",");
  const [prevToolsKey, setPrevToolsKey] = useState(toolsKey);
  if (prevToolsKey !== toolsKey) { setPrevToolsKey(toolsKey); setSetup((s) => withProgramTools(s, usedTools, mode)); }
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0); // mm przebyte
  const [playing, setPlaying] = useState(autoplay);
  const [speed, setSpeed] = useState(1);
  const [prevSource, setPrevSource] = useState(source);
  if (prevSource !== source) { setPrevSource(source); setProgress(0); setPlaying(autoplay); }

  const [showComp, setShowComp] = useState(true);
  const comp = useMemo(() => applyCompensation(program, setup, mode), [program, setup, mode]);
  const segments = showComp && comp.active ? comp.segments : program.segments;
  const lengths = useMemo(() => segments.map(segmentLength), [segments]);
  const total = useMemo(() => lengths.reduce((a, b) => a + b, 0), [lengths]);

  // pętla animacji
  useEffect(() => {
    if (!playing) return;
    let raf = 0; let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000; last = now;
      setProgress((p) => {
        // szybki dojazd 3x szybciej niż posuw
        const idx = segIndexAt(p, lengths);
        const mult = segments[idx]?.kind === "rapid" ? 3 : 1;
        const np = p + dt * 40 * speed * mult;
        if (np >= total) {
          if (showcase) return 0;      // pokaz startuje od nowa
          setPlaying(false); return total;
        }
        return np;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed, total, lengths, segments, showcase]);

  // aktualna linia i pozycja narzędzia
  const { activeLine, currentPos } = useMemo(() => {
    let acc = 0; let pos: Vec3 = { x: 0, y: 0, z: 0 }; let active: number | null = null;
    segments.forEach((sg, i) => {
      const len = lengths[i];
      const done = Math.min(1, Math.max(0, (progress - acc) / (len || 1)));
      if (done > 0 && done < 1) { active = sg.line; pos = pointAt(sg, done); }
      else if (done >= 1) { pos = sg.to; if (progress - acc - len < 1e-9 && progress < total) active = sg.line; }
      acc += len;
    });
    if (progress >= total && segments.length) { active = null; pos = segments[segments.length - 1].to; }
    if (progress === 0 && segments.length) { pos = segments[0].from; active = segments[0].line; }
    return { activeLine: active as number | null, currentPos: pos };
  }, [segments, progress, lengths, total]);

  // W pokazie lista kodu podąża za wykonywaną linią, ale przewijamy wyłącznie
  // wnętrze konsoli. scrollIntoView pociągnąłby za sobą całą stronę i wyrywał
  // czytelnika z powrotem do symulacji przy każdym bloku.
  useEffect(() => {
    if (!showcase || activeLine === null) return;
    const list = linesRef.current;
    const el = list?.querySelector<HTMLLIElement>("li.is-active");
    if (!list || !el) return;
    const target = el.offsetTop - list.clientHeight / 2 + el.clientHeight / 2;
    const max = list.scrollHeight - list.clientHeight;
    const next = Math.max(0, Math.min(max, target));
    if (Math.abs(list.scrollTop - next) > 2) {
      list.scrollTo({ top: next, behavior: reduceMotion() ? "auto" : "smooth" });
    }
  }, [activeLine, showcase]);

  // Pokaz działa tylko wtedy, gdy jest widoczny — poza ekranem nie ma sensu
  // liczyć animacji ani zużywać baterii.
  useEffect(() => {
    if (!showcase) return;
    const el = canvasRef.current; if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setPlaying(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, [showcase]);

  const activeToolNo = (activeLine !== null ? program.lines[activeLine]?.state.tool : program.lines.at(-1)?.state.tool) ?? usedTools[0] ?? null;
  const activeTool = toolOf(setup, activeToolNo, mode);

  // Przerysowanie po zmianie rozmiaru kontenera — inaczej po obrocie telefonu
  // kanwa zostaje w starej rozdzielczości i rysunek jest rozmyty.
  const [resizeTick, setResizeTick] = useState(0);
  useEffect(() => {
    const cv = canvasRef.current; if (!cv || typeof ResizeObserver === "undefined") return;
    let raf = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setResizeTick((t) => t + 1));
    });
    ro.observe(cv);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  // rysowanie
  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = cv.clientWidth, H = cv.clientHeight;
    if (W < 8 || H < 8) return;   // kontener jeszcze bez wymiarów
    cv.width = W * dpr; cv.height = H * dpr; ctx.scale(dpr, dpr);

    const [ha, va] = mode === "mill" ? (["x", "y"] as const) : (["z", "x"] as const);
    const { min: bmin, max: bmax } = program.bounds;
    const min = mode === "lathe" ? { ...bmin, x: Math.min(bmin.x, -bmax.x) } : bmin;
    const max = bmax;
    const spanH = Math.max(max[ha] - min[ha], 10);
    const spanV = Math.max(max[va] - min[va], 10);
    const pad = 28;
    const scale = Math.min((W - pad * 2) / spanH, (H - pad * 2) / spanV);
    const ox = pad + ((W - pad * 2) - spanH * scale) / 2 - min[ha] * scale;
    const oy = H - pad - ((H - pad * 2) - spanV * scale) / 2 + min[va] * scale;
    const P = (p: Vec3) => [ox + p[ha] * scale, oy - p[va] * scale] as const;
    mapRef.current = { P, inv: (px, py) => [(px - ox) / scale, (oy - py) / scale] };

    ctx.clearRect(0, 0, W, H);

    // siatka
    const step = niceStep(Math.max(spanH, spanV) / 8);
    ctx.lineWidth = 1; ctx.strokeStyle = COLORS.grid; ctx.font = "10px ui-monospace, monospace"; ctx.fillStyle = COLORS.axis;
    for (let v = Math.floor(min[ha] / step) * step; v <= max[ha] + step; v += step) {
      const [x] = P({ x: 0, y: 0, z: 0, [ha]: v } as Vec3);
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      if (!compact) ctx.fillText(String(round(v)), x + 2, H - 4);
    }
    for (let v = Math.floor(min[va] / step) * step; v <= max[va] + step; v += step) {
      const [, y] = P({ x: 0, y: 0, z: 0, [va]: v } as Vec3);
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      if (!compact) ctx.fillText(String(round(v)), 4, y - 2);
    }
    // osie zerowe
    ctx.strokeStyle = COLORS.axis;
    const [zx, zy] = P({ x: 0, y: 0, z: 0 });
    ctx.beginPath(); ctx.moveTo(zx, 0); ctx.lineTo(zx, H); ctx.moveTo(0, zy); ctx.lineTo(W, zy); ctx.stroke();
    ctx.fillStyle = COLORS.axis; ctx.font = "11px ui-monospace, monospace";
    ctx.fillText(ha.toUpperCase(), W - 14, zy - 6);
    ctx.fillText(va.toUpperCase(), zx + 6, 14);

    // tokarka: oś obrotu + lustrzany zarys wałka
    if (mode === "lathe") {
      ctx.save(); ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.setLineDash([8, 4, 2, 4]);
      const [, ay] = P({ x: 0, y: 0, z: 0 });
      ctx.beginPath(); ctx.moveTo(0, ay); ctx.lineTo(W, ay); ctx.stroke(); ctx.restore();
      const cut = segments.filter((s) => s.kind !== "rapid");
      ctx.save(); ctx.globalAlpha = 0.25;
      for (const sg of cut) {
        ctx.strokeStyle = COLORS[sg.kind]; ctx.lineWidth = 2; ctx.beginPath();
        const n = sg.kind === "arc" ? 48 : 1;
        const [x0, y0] = P({ ...sg.from, x: -sg.from.x }); ctx.moveTo(x0, y0);
        for (let i = 1; i <= n; i++) { const q = pointAt(sg, i / n); const [x, y] = P({ ...q, x: -q.x }); ctx.lineTo(x, y); }
        ctx.stroke();
      }
      ctx.restore();
    }

    // półfabrykat
    const cut = segments.filter((s) => s.kind !== "rapid");
    if (!setup.stock.auto && mode === "mill") {
      const stk = setup.stock;
      const st = stk;
      const x0 = -st.ox, x1s = st.x - st.ox;
      const y0 = -st.oy, y1s = st.y - st.oy;
      const [ax, ay] = P({ x: x0, y: y0, z: 0 }); const [bx2, by2] = P({ x: x1s, y: y1s, z: 0 });
      ctx.fillStyle = COLORS.stock; ctx.strokeStyle = COLORS.stockEdge; ctx.lineWidth = 1.5;
      ctx.fillRect(ax, by2, bx2 - ax, ay - by2); ctx.strokeRect(ax, by2, bx2 - ax, ay - by2);
      ctx.fillStyle = COLORS.axis; ctx.font = "11px ui-monospace, monospace";
      ctx.fillText(`${st.x} × ${st.y} × ${st.z} mm`, ax + 4, by2 - 6);
    } else if (cut.length) {
      const b = boundsOf(cut, ha, va);
      const [x1, y1] = P({ x: 0, y: 0, z: 0, [ha]: b.minH, [va]: b.minV } as Vec3);
      const [x2, y2] = P({ x: 0, y: 0, z: 0, [ha]: b.maxH, [va]: b.maxV } as Vec3);
      ctx.fillStyle = COLORS.stock; ctx.strokeStyle = COLORS.stockEdge;
      ctx.fillRect(x1, y2, x2 - x1, y1 - y2); ctx.strokeRect(x1, y2, x2 - x1, y1 - y2);
    }

    // ścieżka
    let acc = 0;
    segments.forEach((sg, i) => {
      const len = lengths[i];
      const done = Math.min(1, Math.max(0, (progress - acc) / (len || 1)));
      drawSeg(ctx, sg, P, 1, showcase ? 0.28 : 0.22, showcase);
      if (done > 0) drawSeg(ctx, sg, P, done, 1, showcase);
      acc += len;
    });

    const bare = compact || showcase;

    // zakres obróbki (bounding box ruchów roboczych)
    if (cut.length && !bare) {
      const bb = boundsOf(cut, ha, va);
      const [bx1, by1] = P({ x: 0, y: 0, z: 0, [ha]: bb.minH, [va]: bb.minV } as Vec3);
      const [bx2, by2] = P({ x: 0, y: 0, z: 0, [ha]: bb.maxH, [va]: bb.maxV } as Vec3);
      ctx.save(); ctx.strokeStyle = "rgba(255,255,255,0.18)"; ctx.setLineDash([2, 4]); ctx.lineWidth = 1;
      ctx.strokeRect(bx1, by2, bx2 - bx1, by1 - by2); ctx.restore();
    }

    // znacznik zera detalu
    ctx.fillStyle = "#F97316";
    const [oxp, oyp] = P({ x: 0, y: 0, z: 0 });
    ctx.beginPath(); ctx.arc(oxp, oyp, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.font = "10px ui-monospace, monospace"; ctx.fillText("0", oxp + 6, oyp + 12);

    // narzędzie
    const [tx, ty] = P(currentPos);
    ctx.strokeStyle = COLORS.tool; ctx.lineWidth = 1.5;
    const rPx = mode === "mill" && !isLatheTool(activeTool.kind) ? Math.max(4, cuttingRadius(activeTool) * scale) : 6;
    ctx.beginPath(); ctx.arc(tx, ty, rPx, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(tx - 10, ty); ctx.lineTo(tx + 10, ty); ctx.moveTo(tx, ty - 10); ctx.lineTo(tx, ty + 10); ctx.stroke();

    // celownik sondy pod palcem
    if (probe && !bare) {
      ctx.save();
      ctx.strokeStyle = "rgba(90,169,240,0.9)"; ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(probe.px, 0); ctx.lineTo(probe.px, H); ctx.moveTo(0, probe.py); ctx.lineTo(W, probe.py); ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(probe.px, probe.py, 4, 0, Math.PI * 2); ctx.strokeStyle = "#5AA9F0"; ctx.stroke();
      const label = mode === "mill"
        ? `X ${probe.h.toFixed(2)}  Y ${probe.v.toFixed(2)}`
        : `Z ${probe.h.toFixed(2)}  X ${(probe.v * 2).toFixed(2)}⌀`;
      ctx.font = "11px ui-monospace, monospace";
      const w = ctx.measureText(label).width + 12;
      const bx = Math.min(W - w - 4, probe.px + 10), by = Math.max(16, probe.py - 10);
      ctx.fillStyle = "rgba(5,7,10,0.85)"; ctx.fillRect(bx, by - 13, w, 18);
      ctx.fillStyle = "#5AA9F0"; ctx.fillText(label, bx + 6, by);
      ctx.restore();
    }

    // HUD: współrzędne, aktywna linia, narzędzie
    if (!bare) {
      const L = activeLine !== null ? program.lines[activeLine] : null;
      const rows = [
        mode === "mill"
          ? `X ${fmt(currentPos.x)}  Y ${fmt(currentPos.y)}  Z ${fmt(currentPos.z)}`
          : `X ${fmt(currentPos.x * 2)}⌀  Z ${fmt(currentPos.z)}`,
        `T${String(activeToolNo ?? 0).padStart(2, "0")}  ${TOOL_LABEL[activeTool.kind]}${isLatheTool(activeTool.kind) ? ` rε${activeTool.d}` : ` ⌀${activeTool.d}`}${activeTool.tiltA || activeTool.tiltB ? `  A${activeTool.tiltA}° B${activeTool.tiltB}°` : ""}`,
        L ? `linia ${L.index + 1}: ${(L.raw.trim() || "—").slice(0, 34)}` : "koniec programu",
      ];
      ctx.save();
      ctx.font = "11px ui-monospace, monospace";
      const wMax = Math.max(...rows.map((r) => ctx.measureText(r).width));
      ctx.fillStyle = "rgba(5,7,10,0.72)";
      ctx.fillRect(8, 8, wMax + 16, rows.length * 15 + 10);
      rows.forEach((r, i) => {
        ctx.fillStyle = i === 0 ? "#F8FAFC" : i === 1 ? "#F97316" : "#94A3B8";
        ctx.fillText(r, 16, 24 + i * 15);
      });
      ctx.restore();
    }

  }, [program, segments, progress, lengths, total, mode, compact, showcase, currentPos, setup, activeTool, activeLine, activeToolNo, probe, resizeTick]);

  const st = activeLine !== null ? program.lines[activeLine]?.state : program.lines.at(-1)?.state;

  const readProbe = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const m = mapRef.current; if (!m) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - r.left, py = e.clientY - r.top;
    const [h, v] = m.inv(px, py);
    setProbe({ h, v, px, py });
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files?.[0]; if (!f || !editable) return;
    const text = await f.text();
    onSourceChange?.(text.replace(/\r\n/g, "\n")); setFileName(f.name);
  };

  // W trybie pełnoekranowym kolejność jest odwrócona: podgląd zajmuje dwie trzecie
  // szerokości po lewej, konsola programu jedną trzecią po prawej.
  if (showcase) {
    return (
      <div className="showcase">
        <div className="showcase-view">
          <canvas ref={canvasRef} className="sim-canvas showcase-canvas" />
          <ul className="showcase-legend">
            <li><i style={{ background: "var(--amber)" }} />G00 · szybki przejazd</li>
            <li><i style={{ background: "var(--green)" }} />G01 · ruch roboczy</li>
            <li><i style={{ background: "var(--blue)" }} />G02 / G03 · łuk</li>
          </ul>
        </div>
        <div className="showcase-code">
          <div className="codecard-head"><span className="codecard-dot" />Symulacja programu</div>
          <ol className="showcase-lines" ref={linesRef}>
            {program.lines.filter((l) => l.raw.trim()).map((l) => (
              <li key={l.index} className={l.index === activeLine ? "is-active" : ""}>
                <span className="ln">{String(l.index + 1).padStart(2, "0")}</span>
                <code>{highlight(l.raw.trim())}</code>
              </li>
            ))}
          </ol>
          <div className="showcase-state">
            <span>X {fmt(currentPos.x)}</span><span>Y {fmt(currentPos.y)}</span><span>Z {fmt(currentPos.z)}</span>
            {st?.feed != null && <span>F {st.feed}</span>}
            {st?.spindle != null && <span>S {st.spindle}</span>}
            <span className="is-tool">T{String(activeToolNo ?? 1).padStart(2, "0")} · {TOOL_LABEL[activeTool.kind]}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${compact ? "grid gap-3" : "workbench"} ${full ? "is-full" : ""} ${dragOver ? "is-dragover" : ""}`}
      onDragOver={(e) => { if (editable) { e.preventDefault(); setDragOver(true); } }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}>
      {!compact && (
        <div className="flex flex-col gap-2 min-h-0">
          {editable ? (
            <>
              <GcodeEditor value={source} onChange={(v) => onSourceChange?.(v)} activeLine={activeLine} errorLines={errorLines} warnLines={warnLines}
                onReady={(h) => { editorRef.current = h; }} />
              <GcodePad onInsert={(t) => editorRef.current?.insert(t)} />
            </>
          ) : null}
          {editable && (
            <div className="file-bar">
              <label className="file-btn">
                Wczytaj plik
                <input type="file" accept=".nc,.gcode,.tap,.txt,.cnc,.mpf,.min,.eia,.ngc" onChange={async (e) => {
                  const f = e.target.files?.[0]; if (!f) return;
                  const text = await f.text();
                  onSourceChange?.(text.replace(/\r\n/g, "\n"));
                  setFileName(f.name);
                  e.target.value = "";
                }} />
              </label>
              <button onClick={() => {
                const blob = new Blob([source], { type: "text/plain;charset=utf-8" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = fileName || "program.nc";
                a.click(); URL.revokeObjectURL(a.href);
              }}>Zapisz jako .nc</button>
              <button onClick={() => { navigator.clipboard?.writeText(source); }}>Kopiuj</button>
              {fileName && <span className="file-name">{fileName}</span>}
              <span className="file-hint">albo przeciągnij plik tutaj</span>
              <span className="file-stat">{program.lines.filter((l) => l.words.length).length} bloków · {program.segments.length} ruchów</span>
            </div>
          )}
          {issues.length > 0 && (
            <ul className="sim-issues">
              {issues.map((i, k) => <li key={k} className={i.level}><b>linia {i.line + 1}</b> {i.msg}</li>)}
            </ul>
          )}
          <ol className="sim-lines">
            {program.lines.map((l) => (
              <li key={l.index} className={`${l.index === activeLine ? "is-active" : ""} ${l.errors.length ? "has-error" : ""} ${l.segments.length ? "is-clickable" : ""}`}
                onClick={() => {
                  if (!l.segments.length) return;
                  let acc = 0;
                  for (let i = 0; i < segments.length; i++) {
                    if (segments[i].line === l.index) { setPlaying(false); setProgress(acc + 1e-3); return; }
                    acc += lengths[i];
                  }
                }}>
                <code>{l.raw || " "}</code>
                <span>{l.errors.length ? l.errors.join(" ") : l.description}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
      <div className="flex flex-col gap-2">
        <canvas ref={canvasRef} className="sim-canvas" style={{ height: compact ? 220 : 380, touchAction: "none" }}
          onPointerDown={(e) => { if (compact) return; e.currentTarget.setPointerCapture(e.pointerId); readProbe(e); }}
          onPointerMove={(e) => { if (compact || e.buttons === 0 && e.pointerType !== "mouse") return; if (e.pointerType === "mouse" && e.buttons === 0) { readProbe(e); return; } readProbe(e); }}
          onPointerUp={() => setProbe(null)}
          onPointerLeave={() => setProbe(null)} />
        <div className="sim-controls">
          <button onClick={() => { if (progress >= total) setProgress(0); setPlaying((p) => !p); }}>{playing ? "Pauza" : "Start"}</button>
          <button onClick={() => { setPlaying(false); setProgress((p) => stepTo(p, lengths, +1)); }}>Krok ›</button>
          <button onClick={() => { setPlaying(false); setProgress((p) => stepTo(p, lengths, -1)); }}>‹ Krok</button>
          <button onClick={() => { setPlaying(false); setProgress(0); }}>Reset</button>
          <label>
            Prędkość
            <input type="range" min={0.25} max={4} step={0.25} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
          </label>
          <input type="range" className="sim-scrub" min={0} max={total || 1} step={0.1} value={progress} onChange={(e) => { setPlaying(false); setProgress(Number(e.target.value)); }} />
        </div>
        {!compact && st && (
          <div className="sim-state">
            <span>X {fmt(mode === "lathe" ? currentPos.x * 2 : currentPos.x)}{mode === "lathe" ? " ⌀" : ""}</span>{mode === "mill" && <span>Y {fmt(currentPos.y)}</span>}<span>Z {fmt(currentPos.z)}</span>
            <span>G{st.motion ?? "--"}</span><span>G{st.plane}</span><span>{st.absolute ? "G90" : "G91"}</span>
            <span>G{st.wcs}</span><span>G{st.comp}</span>
            <span>F {st.feed ?? "--"}</span><span>S {st.spindle ?? "--"}</span>
            <span>{st.spindleOn === "off" ? "M05" : st.spindleOn === "cw" ? "M03" : "M04"}</span>
            <span>{st.coolant ? "M08" : "M09"}</span>
            <span>czas {formatTime(program.seconds)}</span>
            <span>T{String(activeToolNo ?? 0).padStart(2, "0")} {TOOL_LABEL[activeTool.kind]} {isLatheTool(activeTool.kind) ? `rε${activeTool.d}` : `⌀${activeTool.d}`}</span>
          </div>
        )}
        {!compact && allow3d && (
          <>
            <div className="filters">
              <button aria-pressed={show3d} onClick={() => setShow3d((v) => !v)}>{show3d ? "Ukryj widok 3D" : "Pokaż widok 3D"}</button>
              <button className="only-wide" aria-pressed={full} onClick={() => setFull((v) => !v)} title="Podgląd na dwie trzecie szerokości, konsola programu obok">
                {full ? "Zwykły układ" : "Szeroki podgląd"}
              </button>
              {comp.active && <button aria-pressed={showComp} onClick={() => setShowComp((v) => !v)} title="Tor środka narzędzia z uwzględnieniem G41/G42">{showComp ? "Tor rzeczywisty (G41/G42)" : "Tor programowany"}</button>}
              {!comp.active && program.lines.some((l) => l.segments.some((sg) => sg.kind !== "rapid")) && (
                <span className="comp-note">G40 — współrzędne opisują tor środka narzędzia, nie kontur detalu</span>
              )}
            </div>
            {show3d && <Sim3DBoundary><Sim3D source={source} mode={mode} progress={progress} setup={setup} segments={segments} /></Sim3DBoundary>}
          </>
        )}
        {!compact && <SetupPanel mode={mode} setup={setup} onChange={setSetup} activeTool={activeToolNo} />}
      </div>
    </div>
  );
}

function drawSeg(ctx: CanvasRenderingContext2D, sg: Segment, P: (p: Vec3) => readonly [number, number], t: number, alpha: number, bold = false) {
  ctx.globalAlpha = alpha; ctx.lineWidth = sg.kind === "rapid" ? (bold ? 1.6 : 1) : (bold ? 3.4 : 2.5);
  ctx.setLineDash(sg.kind === "rapid" ? [5, 4] : []);
  ctx.strokeStyle = COLORS[sg.kind];
  ctx.beginPath();
  const n = sg.kind === "arc" ? 48 : 1;
  const [x0, y0] = P(sg.from); ctx.moveTo(x0, y0);
  for (let i = 1; i <= n; i++) { const [x, y] = P(pointAt(sg, (i / n) * t)); ctx.lineTo(x, y); }
  ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
}

/** Kolorowanie słów G-kodu w widoku pokazowym. */
function highlight(line: string) {
  const parts = line.match(/\([^)]*\)|[A-Za-z][-+0-9.]*|\s+|[^\sA-Za-z]+/g) ?? [line];
  return parts.map((tok, i) => {
    const L = tok[0]?.toUpperCase();
    if (tok.startsWith("(")) return <span key={i} className="t-cm">{tok}</span>;
    if (L === "G") return <span key={i} className="t-g">{tok}</span>;
    if (L === "M") return <span key={i} className="t-m">{tok}</span>;
    if (L === "F" || L === "S") return <span key={i} className="t-fs">{tok}</span>;
    if (L === "T" || L === "H" || L === "D") return <span key={i} className="t-t">{tok}</span>;
    if (L && "XYZIJKR".includes(L)) return <span key={i} className="t-ax">{tok}</span>;
    return <span key={i}>{tok}</span>;
  });
}

const reduceMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function segIndexAt(p: number, lengths: number[]) {
  let acc = 0;
  for (let i = 0; i < lengths.length; i++) { acc += lengths[i]; if (p < acc) return i; }
  return lengths.length - 1;
}

function stepTo(p: number, lengths: number[], dir: 1 | -1) {
  let acc = 0; const marks = [0];
  for (const l of lengths) { acc += l; marks.push(acc); }
  if (dir > 0) return marks.find((m) => m > p + 1e-6) ?? acc;
  return [...marks].reverse().find((m) => m < p - 1e-6) ?? 0;
}

function boundsOf(segs: Segment[], ha: keyof Vec3, va: keyof Vec3) {
  let minH = Infinity, maxH = -Infinity, minV = Infinity, maxV = -Infinity;
  const add = (p: Vec3) => { minH = Math.min(minH, p[ha]); maxH = Math.max(maxH, p[ha]); minV = Math.min(minV, p[va]); maxV = Math.max(maxV, p[va]); };
  for (const s of segs) {
    add(s.from); add(s.to);
    if (s.kind === "arc") { for (let t = 0; t <= 1; t += 0.05) add(pointAt(s, t)); }
  }
  return { minH, maxH, minV, maxV };
}

function niceStep(x: number) {
  const p = Math.pow(10, Math.floor(Math.log10(x || 1)));
  const m = x / p;
  return (m < 2 ? 2 : m < 5 ? 5 : 10) * p;
}
const round = (v: number) => Math.round(v * 100) / 100;
const fmt = (v: number) => v.toFixed(2);
