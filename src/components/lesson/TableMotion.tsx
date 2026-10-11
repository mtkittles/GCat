"use client";
import { useEffect, useRef, useState } from "react";

/*
  F0.1 — ten sam program X0 → X40 na dwa sposoby (#31, V08):
  u góry maszyna, na której jeździ stół (wrzeciono stoi), u dołu ten sam ruch względem detalu.
  Zero W zawsze na detalu, odczyt X ten sam. Start tylko po kliknięciu; przy „ogranicz ruch” bez animacji.
*/

const END = 40;
const U = 2.6; // px na mm
const DUR = 2400;

function Panel({ x, mode }: { x: number; mode: "table" | "tool" }) {
  const tableShift = mode === "table" ? -x * U : 0;
  const toolX = 140 + (mode === "tool" ? x * U : 0);
  const partX = 140 - 20 * U; // W na lewej krawędzi detalu, narzędzie startuje 20 mm na prawo od W
  return (
    <svg viewBox="0 0 360 170" role="img"
      aria-label={mode === "table" ? `Stół przesunięty o ${x} mm w lewo, narzędzie stoi` : `Narzędzie ${x} mm w prawo względem detalu`}>
      {/* wrzeciono z narzędziem: u góry stoi w miejscu, u dołu przesuwa się względem detalu */}
      <rect x={toolX - 18} y={8} width={36} height={34} rx={3} className="tm-spindle" />
      <rect x={toolX - 6} y={42} width={12} height={44} className="tm-tool" />
      <circle cx={toolX} cy={86} r={2.6} className="tm-tip" />
      <g transform={`translate(${tableShift} 0)`}>
        <rect x={10} y={118} width={420} height={18} className="tm-table" />
        {[30, 80, 130, 180, 230, 280, 330, 380].map((t) => <line key={t} x1={t} y1={118} x2={t} y2={136} className="tm-slot" />)}
        <rect x={partX} y={92} width={110 * U * 0.62} height={26} className="tm-part" />
        <circle cx={partX} cy={92} r={3.4} className="tm-w" />
        <text x={partX - 4} y={88} textAnchor="end" className="tm-wl">W</text>
      </g>
      {mode === "table" ? (
        <g className="tm-arrow">
          <line x1={250} y1={154} x2={250 - 34} y2={154} />
          <path d={`M ${250 - 40} 154 l 8 -4.5 v 9 z`} />
          <text x={256} y={158}>stół jedzie w X−</text>
        </g>
      ) : (
        <g className="tm-arrow">
          <line x1={toolX + 14} y1={64} x2={toolX + 48} y2={64} />
          <path d={`M ${toolX + 54} 64 l -8 -4.5 v 9 z`} />
          <text x={toolX + 58} y={68}>X+</text>
        </g>
      )}
    </svg>
  );
}

export default function TableMotion() {
  const [x, setX] = useState(0);
  const [playing, setPlaying] = useState(false);
  const raf = useRef<number | null>(null);
  const t0 = useRef(0);
  const x0 = useRef(0);

  useEffect(() => {
    if (!playing) return;
    t0.current = performance.now(); x0.current = x >= END ? 0 : x;
    const tick = (now: number) => {
      const v = Math.min(END, x0.current + ((now - t0.current) / DUR) * END);
      setX(v);
      if (v < END) raf.current = requestAnimationFrame(tick); else setPlaying(false);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  const xr = Math.round(x);
  return (
    <figure className="tm">
      <div className="fig-head"><span className="fig-code">X</span><span>Ten sam blok G01 X60. — dwa sposoby patrzenia</span></div>
      <div className="tm-panels">
        <div>
          <p className="tm-k">Na maszynie: jedzie stół, wrzeciono stoi</p>
          <Panel x={x} mode="table" />
        </div>
        <div>
          <p className="tm-k">Względem detalu: jedzie narzędzie</p>
          <Panel x={x} mode="tool" />
        </div>
      </div>
      <div className="tm-bar">
        <button type="button" className="btn" onClick={() => {
          if (!playing && window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setX(END); return; }
          setPlaying((p) => !p);
        }}>{playing ? "Pauza" : x >= END ? "Jeszcze raz" : "Start"}</button>
        <button type="button" className="btn ghost" onClick={() => { setPlaying(false); setX(0); }}>Reset</button>
        <label className="tm-range"><span className="sr-only">Położenie</span>
          <input type="range" min={0} max={END} step={1} value={xr} onChange={(e) => { setPlaying(false); setX(Number(e.target.value)); }} />
        </label>
        <span className="tm-read" aria-live="polite"><i>X</i>{(20 + xr).toFixed(3)}</span>
      </div>
      <figcaption className="fig-cap">Program: narzędzie z X20 do X60 względem zera <b>W</b> na detalu. Na frezarce z ruchomym stołem silnik osi X przesuwa stół o 40 mm w lewo, a narzędzie stoi. Względem detalu to ruch narzędzia o 40 mm w prawo, czyli <b>X+</b>. Odczyt X jest w obu widokach ten sam, bo sterowanie pokazuje położenie narzędzia względem detalu.</figcaption>
    </figure>
  );
}
