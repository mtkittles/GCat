"use client";
import { useMemo, useState } from "react";

/*
  Kalkulator łuku: zamiana zapisu promieniowego (R) na wektorowy (I, J)
  i odwrotnie, z podglądem geometrii oraz gotowym blokiem G-kodu.

  Wszystkie obliczenia w płaszczyźnie XY (G17). Dla G18 zamień Y na Z i J na K,
  dla G19 X na Y oraz I na J — zależności geometryczne pozostają te same.
*/

type Dir = "cw" | "ccw";

const n3 = (v: number) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : NaN);
const n2 = (v: number) => (Number.isFinite(v) ? Math.round(v * 100) / 100 : NaN);

function Num({ label, unit, value, onChange, step = 0.5 }: { label: string; unit?: string; value: number; onChange: (v: number) => void; step?: number }) {
  const [text, setText] = useState(String(value));
  const [focus, setFocus] = useState(false);
  return (
    <label className="arc-field">
      <span>{label}{unit && <i> [{unit}]</i>}</span>
      <input
        type="text" inputMode="decimal" step={step}
        value={focus ? text : String(value)}
        onFocus={(e) => { setFocus(true); setText(String(value)); e.currentTarget.select(); }}
        onBlur={() => { setFocus(false); const n = Number(text.replace(",", ".")); if (Number.isFinite(n)) onChange(n); }}
        onChange={(e) => {
          const raw = e.target.value;
          if (!/^-?[0-9]*[.,]?[0-9]*$/.test(raw)) return;
          setText(raw);
          const n = Number(raw.replace(",", "."));
          if (raw !== "" && raw !== "-" && Number.isFinite(n)) onChange(n);
        }} />
    </label>
  );
}

function Copy({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="codeout">
      <pre className="syntax">{text}</pre>
      <button onClick={() => { navigator.clipboard?.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); }}>
        {done ? "Skopiowano" : "Kopiuj"}
      </button>
    </div>
  );
}

export default function ArcCalc() {
  // --- kierunek i punkty
  const [dir, setDir] = useState<Dir>("ccw");
  const [x1, setX1] = useState(20), [y1, setY1] = useState(20);
  const [x2, setX2] = useState(50), [y2, setY2] = useState(50);
  const [R, setR] = useState(30);
  const [longArc, setLongArc] = useState(false);

  // --- kierunek odwrotny: I/J → R
  const [i, setI] = useState(30), [j, setJ] = useState(0);

  type Geo =
    | { ok: false; reason: string }
    | { ok: true; cx: number; cy: number; I: number; J: number; d: number; deg: number; len: number; sag: number; sweep: number; a1: number };

  const geo = useMemo<Geo>(() => {
    const dx = x2 - x1, dy = y2 - y1;
    const d = Math.hypot(dx, dy);
    const Rs = longArc ? -Math.abs(R) : Math.abs(R);
    if (d < 1e-9) return { ok: false, reason: "Punkt końcowy pokrywa się z początkowym — pełne koło zapisz przez I/J." };
    if (Math.abs(R) < d / 2 - 1e-9) return { ok: false, reason: `Promień |R| = ${n2(Math.abs(R))} jest mniejszy niż połowa cięciwy (${n2(d / 2)} mm). Taki łuk nie istnieje.` };

    const h = Math.sqrt(Math.max(0, R * R - (d / 2) ** 2));
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    // znak wybiera jedną z dwóch możliwych stron cięciwy
    let sign = dir === "cw" ? -1 : 1;
    if (Rs < 0) sign = -sign;
    const cx = mx - (sign * h * dy) / d;
    const cy = my + (sign * h * dx) / d;

    const a1 = Math.atan2(y1 - cy, x1 - cx);
    const a2 = Math.atan2(y2 - cy, x2 - cx);
    let sweep = a2 - a1;
    if (dir === "cw") { if (sweep >= -1e-9) sweep -= 2 * Math.PI; }
    else if (sweep <= 1e-9) sweep += 2 * Math.PI;

    const deg = Math.abs((sweep * 180) / Math.PI);
    const len = Math.abs(sweep) * Math.abs(R);
    const sag = Math.abs(R) - h;   // strzałka łuku nad cięciwą

    return { ok: true, cx, cy, I: cx - x1, J: cy - y1, d, deg, len, sag, sweep, a1 };
  }, [x1, y1, x2, y2, R, dir, longArc]);

  const Rfrom = n3(Math.hypot(i, j));

  const code = geo.ok
    ? `${dir === "cw" ? "G02" : "G03"} X${n3(x2)} Y${n3(y2)} I${n3(geo.I)} J${n3(geo.J)} F___\n${dir === "cw" ? "G02" : "G03"} X${n3(x2)} Y${n3(y2)} R${longArc ? "-" : ""}${n3(Math.abs(R))} F___`
    : "";

  // --- podgląd geometrii
  const view = useMemo(() => {
    if (!geo.ok) return null;
    const pts = [
      { x: x1, y: y1 }, { x: x2, y: y2 }, { x: geo.cx, y: geo.cy },
      { x: geo.cx - Math.abs(R), y: geo.cy }, { x: geo.cx + Math.abs(R), y: geo.cy },
      { x: geo.cx, y: geo.cy - Math.abs(R) }, { x: geo.cx, y: geo.cy + Math.abs(R) },
    ];
    const minX = Math.min(...pts.map((p) => p.x)), maxX = Math.max(...pts.map((p) => p.x));
    const minY = Math.min(...pts.map((p) => p.y)), maxY = Math.max(...pts.map((p) => p.y));
    const pad = Math.max(maxX - minX, maxY - minY) * 0.14 + 4;
    const W = 420, H = 300;
    const s = Math.min((W - 40) / (maxX - minX + pad * 2), (H - 40) / (maxY - minY + pad * 2));
    const ox = 20 + (W - 40 - (maxX - minX + pad * 2) * s) / 2;
    const oy = H - 20 - (H - 40 - (maxY - minY + pad * 2) * s) / 2;
    const X = (v: number) => ox + (v - (minX - pad)) * s;
    const Y = (v: number) => oy - (v - (minY - pad)) * s;
    const rp = Math.abs(R) * s;
    const large = geo.deg > 180 ? 1 : 0;
    const sweepFlag = dir === "cw" ? 1 : 0;
    return { X, Y, rp, large, sweepFlag, W, H };
  }, [geo, x1, y1, x2, y2, R, dir]);

  return (
    <div className="arc-calc">
      <div className="arc-cols">
        <div className="arc-panel">
          <h3>Z promienia R na wektor I, J</h3>

          <div className="segmented" role="tablist" aria-label="Kierunek łuku">
            <button role="tab" aria-selected={dir === "cw"} onClick={() => setDir("cw")}>G02 — zgodnie z zegarem</button>
            <button role="tab" aria-selected={dir === "ccw"} onClick={() => setDir("ccw")}>G03 — przeciwnie</button>
          </div>

          <div className="arc-grid">
            <Num label="Start X" unit="mm" value={x1} onChange={setX1} />
            <Num label="Start Y" unit="mm" value={y1} onChange={setY1} />
            <Num label="Koniec X" unit="mm" value={x2} onChange={setX2} />
            <Num label="Koniec Y" unit="mm" value={y2} onChange={setY2} />
            <Num label="Promień R" unit="mm" value={R} onChange={setR} />
            <label className="arc-check">
              <input type="checkbox" checked={longArc} onChange={(e) => setLongArc(e.target.checked)} />
              <span>Łuk dłuższy niż 180° (R ujemne)</span>
            </label>
          </div>

          {!geo.ok ? (
            <p className="arc-error">{geo.reason}</p>
          ) : (
            <>
              <div className="arc-outs">
                <div className="arc-out big"><span>I</span><b>{n3(geo.I)}</b></div>
                <div className="arc-out big"><span>J</span><b>{n3(geo.J)}</b></div>
                <div className="arc-out"><span>Środek łuku</span><b>{n2(geo.cx)}, {n2(geo.cy)}</b></div>
                <div className="arc-out"><span>Kąt rozwarcia</span><b>{n2(geo.deg)}°</b></div>
                <div className="arc-out"><span>Długość łuku</span><b>{n2(geo.len)} mm</b></div>
                <div className="arc-out"><span>Cięciwa</span><b>{n2(geo.d)} mm</b></div>
                <div className="arc-out"><span>Strzałka</span><b>{n2(geo.sag)} mm</b></div>
              </div>
              <Copy text={code} />
            </>
          )}
        </div>

        <div className="arc-panel">
          <h3>Podgląd geometrii</h3>
          {view && geo.ok ? (
            <svg viewBox={`0 0 ${view.W} ${view.H}`} className="arc-svg" role="img" aria-label="Podgląd łuku">
              <defs>
                <marker id="ac-arw" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
                  <path d="M0 1 L8 4.5 L0 8 z" fill="var(--accent)" />
                </marker>
              </defs>
              {/* okrąg konstrukcyjny */}
              <circle cx={view.X(geo.cx)} cy={view.Y(geo.cy)} r={view.rp} fill="none" stroke="var(--line-strong)" strokeWidth="1" strokeDasharray="4 4" />
              {/* cięciwa */}
              <line x1={view.X(x1)} y1={view.Y(y1)} x2={view.X(x2)} y2={view.Y(y2)} stroke="var(--muted)" strokeWidth="1" strokeDasharray="3 3" />
              {/* łuk właściwy */}
              <path
                d={`M ${view.X(x1)} ${view.Y(y1)} A ${view.rp} ${view.rp} 0 ${view.large} ${view.sweepFlag} ${view.X(x2)} ${view.Y(y2)}`}
                fill="none" stroke="var(--blue)" strokeWidth="3.2" markerEnd="url(#ac-arw)" />
              {/* wektor I/J */}
              <line x1={view.X(x1)} y1={view.Y(y1)} x2={view.X(geo.cx)} y2={view.Y(geo.cy)} stroke="var(--accent)" strokeWidth="1.8" />
              <text x={(view.X(x1) + view.X(geo.cx)) / 2} y={(view.Y(y1) + view.Y(geo.cy)) / 2 - 6}
                fill="var(--accent)" fontSize="11" fontFamily="var(--font-mono)" textAnchor="middle">I{n2(geo.I)} J{n2(geo.J)}</text>
              {/* punkty */}
              <circle cx={view.X(x1)} cy={view.Y(y1)} r="4.5" fill="var(--ink)" />
              <text x={view.X(x1)} y={view.Y(y1) + 17} fill="var(--ink)" fontSize="11" textAnchor="middle" fontFamily="var(--font-mono)">start</text>
              <circle cx={view.X(x2)} cy={view.Y(y2)} r="4.5" fill="var(--ink)" />
              <text x={view.X(x2) + 8} y={view.Y(y2) - 6} fill="var(--ink)" fontSize="11" fontFamily="var(--font-mono)">koniec</text>
              <circle cx={view.X(geo.cx)} cy={view.Y(geo.cy)} r="3.5" fill="var(--accent)" />
              <text x={view.X(geo.cx) + 7} y={view.Y(geo.cy) + 14} fill="var(--accent)" fontSize="11" fontFamily="var(--font-mono)">środek</text>
            </svg>
          ) : (
            <p className="setup-hint">Popraw dane, żeby zobaczyć podgląd.</p>
          )}

          <h3 className="mt">Z wektora I, J na promień R</h3>
          <div className="arc-grid two">
            <Num label="I" unit="mm" value={i} onChange={setI} />
            <Num label="J" unit="mm" value={j} onChange={setJ} />
          </div>
          <div className="arc-outs">
            <div className="arc-out big"><span>R</span><b>{Rfrom}</b></div>
          </div>
          <p className="setup-hint">R = √(I² + J²). Przeliczenie działa w obie strony tylko dla łuków do 180° — powyżej promień jest niejednoznaczny, więc pełne koło i łuki rozwarte zapisuje się wyłącznie przez I/J.</p>
        </div>
      </div>
    </div>
  );
}
