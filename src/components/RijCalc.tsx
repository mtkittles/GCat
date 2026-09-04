"use client";
import { useState } from "react";

function F({ l, v, on }: { l: string; v: number; on: (n: number) => void }) {
  return (
    <label className="grid gap-1 text-sm"><span className="text-muted">{l}</span>
      <input type="number" inputMode="decimal" step="0.1" className="border border-line rounded px-2 py-1 bg-card font-mono" value={v} onChange={(e) => on(Number(e.target.value))} /></label>
  );
}

const n3 = (v: number) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : NaN);

export default function RijCalc() {
  const [x1, sx1] = useState(4); const [y1, sy1] = useState(2);
  const [x2, sx2] = useState(10); const [y2, sy2] = useState(10);
  const [R, sR] = useState(5); const [cw, setCw] = useState(true);
  const [i, si] = useState(3); const [j, sj] = useState(4);

  const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy);
  const ok = d > 0 && Math.abs(R) >= d / 2;
  const h = ok ? Math.sqrt(Math.max(0, R * R - (d / 2) ** 2)) : NaN;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const s = (cw ? -1 : 1) * (R < 0 ? -1 : 1);
  const cxAbs = mx - (s * h * dy) / d, cyAbs = my + (s * h * dx) / d;
  const Iv = n3(cxAbs - x1), Jv = n3(cyAbs - y1);
  const Rout = n3(Math.hypot(i, j));

  return (
    <div className="grid gap-4 sm:grid-cols-2 border border-line rounded-md p-4 bg-card">
      <div className="grid gap-2">
        <h3 className="font-bold">R → I, J</h3>
        <div className="grid grid-cols-2 gap-2"><F l="Start X" v={x1} on={sx1} /><F l="Start Y" v={y1} on={sy1} /><F l="Koniec X" v={x2} on={sx2} /><F l="Koniec Y" v={y2} on={sy2} /><F l="Promień R" v={R} on={sR} /></div>
        <div className="filters"><button aria-pressed={cw} onClick={() => setCw(true)}>G02 (CW)</button><button aria-pressed={!cw} onClick={() => setCw(false)}>G03 (CCW)</button></div>
        {ok ? <p className="font-mono text-sm">I{Iv >= 0 ? "" : ""}{Iv} J{Jv} <span className="text-muted">(środek bezwzględnie: {n3(cxAbs)}, {n3(cyAbs)})</span></p>
            : <p className="text-sm" style={{ color: "var(--red)" }}>Promień za mały: cięciwa ma {n3(d)} mm, więc |R| musi być ≥ {n3(d / 2)}.</p>}
      </div>
      <div className="grid gap-2">
        <h3 className="font-bold">I, J → R</h3>
        <div className="grid grid-cols-2 gap-2"><F l="I" v={i} on={si} /><F l="J" v={j} on={sj} /></div>
        <p className="font-mono text-sm">R = {Rout}</p>
        <p className="text-xs text-muted">R = √(I² + J²). Zamiana działa tylko dla łuków do 180°; powyżej użyj I/J, bo R jest niejednoznaczne.</p>
      </div>
    </div>
  );
}
