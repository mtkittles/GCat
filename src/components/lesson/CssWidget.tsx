"use client";
import { useState } from "react";

/*
  Stała prędkość skrawania (G96): obroty rosną, gdy średnica maleje,
  aż do limitu G50. Suwak średnicy + wykres n(D).
*/

const W = 340, H = 180, L = 44, B = 150, R = 330, T = 14;
const DMAX = 80, NMAX = 4500;
const X = (d: number) => L + (d / DMAX) * (R - L);
const Y = (n: number) => B - (n / NMAX) * (B - T);

export default function CssWidget({ vc0 = 200, limit0 = 3000 }: { vc0?: number; limit0?: number }) {
  const [d, setD] = useState(40);
  const [vc, setVc] = useState(vc0);
  const [limit, setLimit] = useState(limit0);
  const raw = (1000 * vc) / (Math.PI * Math.max(d, 0.5));
  const n = Math.min(raw, limit);
  const clamped = raw > limit;
  const dLimit = (1000 * vc) / (Math.PI * limit);
  const pts = Array.from({ length: 80 }, (_, i) => { const dd = 1 + (i / 79) * (DMAX - 1); return `${X(dd)},${Y(Math.min(NMAX, (1000 * vc) / (Math.PI * dd)))}`; }).join(" ");
  const ptsL = Array.from({ length: 80 }, (_, i) => { const dd = 1 + (i / 79) * (DMAX - 1); return `${X(dd)},${Y(Math.min(limit, (1000 * vc) / (Math.PI * dd)))}`; }).join(" ");
  return (
    <div className="jog css">
      <div className="jog-view">
        <svg viewBox={`0 0 ${W + 20} ${H + 12}`} role="img" aria-label={`Obroty ${Math.round(n)} przy średnicy ${d}`}>
          <line x1={L} y1={B} x2={R} y2={B} className="css-ax" />
          <line x1={L} y1={B} x2={L} y2={T} className="css-ax" />
          {[0, 20, 40, 60, 80].map((v) => <text key={v} x={X(v)} y={B + 14} textAnchor="middle" className="css-t">{v}</text>)}
          {[0, 1000, 2000, 3000, 4000].map((v) => <text key={v} x={L - 5} y={Y(v) + 3} textAnchor="end" className="css-t">{v}</text>)}
          <text x={R} y={B + 28} textAnchor="end" className="css-t">średnica Ø [mm]</text>
          <text x={L} y={T - 3} className="css-t">n [obr/min]</text>
          <polyline points={pts} className="css-raw" />
          <polyline points={ptsL} className="css-cur" />
          <line x1={L} y1={Y(limit)} x2={R} y2={Y(limit)} className="css-lim" />
          <text x={R} y={Y(limit) - 4} textAnchor="end" className="css-limt">G50 S{limit}</text>
          <line x1={X(d)} y1={B} x2={X(d)} y2={Y(n)} className="css-drop" />
          <circle cx={X(d)} cy={Y(n)} r={5} className={clamped ? "css-dot is-lim" : "css-dot"} />
        </svg>
      </div>
      <div className="jog-read lj-read">
        <span><i>Ø</i>{d.toFixed(1)}</span>
        <span><i>n</i>{Math.round(n)}</span>
      </div>
      <label className="css-row">Średnica toczenia
        <input type="range" min={1} max={80} step={0.5} value={d} onChange={(e) => setD(Number(e.target.value))} />
      </label>
      <div className="css-inputs">
        <label>vc (G96 S) <input type="number" inputMode="numeric" value={vc} min={20} max={500} onChange={(e) => setVc(Math.max(20, Math.min(500, Number(e.target.value) || 20)))} /></label>
        <label>limit (G50 S) <input type="number" inputMode="numeric" value={limit} min={500} max={4500} step={100} onChange={(e) => setLimit(Math.max(500, Math.min(4500, Number(e.target.value) || 500)))} /></label>
      </div>
      <p className={`jog-status${clamped ? " is-bad" : ""}`}>
        {clamped
          ? `Limit G50: sterowanie trzyma ${limit} obr/min. Prędkość skrawania spada poniżej ${vc} m/min — poniżej Ø${dLimit.toFixed(1)}.`
          : `n = 1000 · ${vc} / (π · ${d}) ≈ ${Math.round(raw)} obr/min. Prędkość skrawania stała: ${vc} m/min.`}
      </p>
    </div>
  );
}
