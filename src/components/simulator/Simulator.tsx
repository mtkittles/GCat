"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  parseProgram,
  pointAt,
  segmentLength,
  type Segment,
  type Vec3,
} from "@/lib/parser";

export type SimMode = "mill" | "lathe";

interface Props {
  source: string;
  mode?: SimMode;
  editable?: boolean;
  onSourceChange?: (s: string) => void;
  compact?: boolean;
  autoplay?: boolean;
}

const COLORS = {
  rapid: "#E8A317",
  linear: "#3FCB84",
  arc: "#5AA9F0",
  grid: "rgba(255,255,255,0.06)",
  axis: "rgba(255,255,255,0.22)",
  tool: "#FFFFFF",
  stock: "rgba(255,255,255,0.04)",
  stockEdge: "rgba(255,255,255,0.14)",
};

export default function Simulator({ source, mode = "mill", editable = true, onSourceChange, compact = false, autoplay = false }: Props) {
  const program = useMemo(() => parseProgram(source, { diameterX: mode === "lathe" }), [source, mode]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0); // mm przebyte
  const [playing, setPlaying] = useState(autoplay);
  const [speed, setSpeed] = useState(1);
  const [prevSource, setPrevSource] = useState(source);
  if (prevSource !== source) { setPrevSource(source); setProgress(0); setPlaying(autoplay); }

  const lengths = useMemo(() => program.segments.map(segmentLength), [program]);
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
        const mult = program.segments[idx]?.kind === "rapid" ? 3 : 1;
        const np = p + dt * 40 * speed * mult;
        if (np >= total) { setPlaying(false); return total; }
        return np;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed, total, lengths, program.segments]);

  // aktualna linia i pozycja narzędzia
  const { activeLine, currentPos } = useMemo(() => {
    let acc = 0; let pos: Vec3 = { x: 0, y: 0, z: 0 }; let active: number | null = null;
    program.segments.forEach((sg, i) => {
      const len = lengths[i];
      const done = Math.min(1, Math.max(0, (progress - acc) / (len || 1)));
      if (done > 0 && done < 1) { active = sg.line; pos = pointAt(sg, done); }
      else if (done >= 1) { pos = sg.to; if (progress - acc - len < 1e-9 && progress < total) active = sg.line; }
      acc += len;
    });
    if (progress >= total && program.segments.length) { active = null; pos = program.segments[program.segments.length - 1].to; }
    if (progress === 0 && program.segments.length) { pos = program.segments[0].from; active = program.segments[0].line; }
    return { activeLine: active as number | null, currentPos: pos };
  }, [program, progress, lengths, total]);

  // rysowanie
  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const W = cv.clientWidth, H = cv.clientHeight;
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
      const cut = program.segments.filter((s) => s.kind !== "rapid");
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

    // przedmiot (obrys z zakresu posuwu roboczego)
    const cut = program.segments.filter((s) => s.kind !== "rapid");
    if (cut.length) {
      const b = boundsOf(cut, ha, va);
      const [x1, y1] = P({ x: 0, y: 0, z: 0, [ha]: b.minH, [va]: b.minV } as Vec3);
      const [x2, y2] = P({ x: 0, y: 0, z: 0, [ha]: b.maxH, [va]: b.maxV } as Vec3);
      ctx.fillStyle = COLORS.stock; ctx.strokeStyle = COLORS.stockEdge;
      ctx.fillRect(x1, y2, x2 - x1, y1 - y2); ctx.strokeRect(x1, y2, x2 - x1, y1 - y2);
    }

    // ścieżka
    let acc = 0;
    program.segments.forEach((sg, i) => {
      const len = lengths[i];
      const done = Math.min(1, Math.max(0, (progress - acc) / (len || 1)));
      drawSeg(ctx, sg, P, 1, 0.22);
      if (done > 0) drawSeg(ctx, sg, P, done, 1);
      acc += len;
    });

    // narzędzie
    const [tx, ty] = P(currentPos);
    ctx.strokeStyle = COLORS.tool; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(tx, ty, 6, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(tx - 10, ty); ctx.lineTo(tx + 10, ty); ctx.moveTo(tx, ty - 10); ctx.lineTo(tx, ty + 10); ctx.stroke();

  }, [program, progress, lengths, total, mode, compact, currentPos]);

  const st = activeLine !== null ? program.lines[activeLine]?.state : program.lines.at(-1)?.state;

  return (
    <div className={`grid gap-3 ${compact ? "" : "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]"}`}>
      {!compact && (
        <div className="flex flex-col gap-2 min-h-0">
          {editable ? (
            <textarea
              value={source}
              onChange={(e) => onSourceChange?.(e.target.value)}
              spellCheck={false}
              className="sim-editor"
              rows={14}
            />
          ) : null}
          <ol className="sim-lines">
            {program.lines.map((l) => (
              <li key={l.index} className={`${l.index === activeLine ? "is-active" : ""} ${l.errors.length ? "has-error" : ""}`}>
                <code>{l.raw || " "}</code>
                <span>{l.errors.length ? l.errors.join(" ") : l.description}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
      <div className="flex flex-col gap-2">
        <canvas ref={canvasRef} className="sim-canvas" style={{ height: compact ? 220 : 380 }} />
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
          </div>
        )}
      </div>
    </div>
  );
}

function drawSeg(ctx: CanvasRenderingContext2D, sg: Segment, P: (p: Vec3) => readonly [number, number], t: number, alpha: number) {
  ctx.globalAlpha = alpha; ctx.lineWidth = sg.kind === "rapid" ? 1 : 2.5;
  ctx.setLineDash(sg.kind === "rapid" ? [5, 4] : []);
  ctx.strokeStyle = COLORS[sg.kind];
  ctx.beginPath();
  const n = sg.kind === "arc" ? 48 : 1;
  const [x0, y0] = P(sg.from); ctx.moveTo(x0, y0);
  for (let i = 1; i <= n; i++) { const [x, y] = P(pointAt(sg, (i / n) * t)); ctx.lineTo(x, y); }
  ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
}

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
