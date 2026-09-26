"use client";
import { useState } from "react";
import type { JogGoal } from "@/lib/lesson";

/*
  Ręczny przesuw osi (JOG) na płytce 80 × 50 × 20. Zero W w lewym przednim narożniku,
  Z0 na górnej powierzchni. Rzut ukośny: X w prawo, Y w głąb, Z w górę.
  Stan tylko w pamięci komponentu — bez efektów i bez zapisu.
*/

type V = { x: number; y: number; z: number };
const LIM = { x: [-20, 100], y: [-15, 65], z: [-25, 45] } as const;
const U = 2.2, KX = 0.41, KY = 0.287, OX = 69.4, OY = 227;
const P = (x: number, y: number, z: number) => [OX + (x + y * KX) * U, OY - (z + y * KY) * U] as const;
const pts = (...v: [number, number, number][]) => v.map(([x, y, z]) => P(x, y, z).join(",")).join(" ");
const fmt = (v: number) => v.toFixed(3);
const clamp = (v: number, [a, b]: readonly [number, number]) => Math.min(b, Math.max(a, v));
const overPart = (p: V) => p.x > -5 && p.x < 85 && p.y > -5 && p.y < 55;

const DIR: Record<string, string> = {
  "X+": "w prawo", "X-": "w lewo", "Y+": "w głąb, od operatora", "Y-": "do operatora",
  "Z+": "w górę, od detalu", "Z-": "w dół, w stronę detalu",
};

export default function JogDemo({ goals = [] }: { goals?: JogGoal[] }) {
  const [pos, setPos] = useState<V>({ x: 40, y: 20, z: 30 });
  const [step, setStep] = useState<1 | 10>(10);
  const [goal, setGoal] = useState(0);
  const [last, setLast] = useState<string | null>(null);

  const move = (axis: "x" | "y" | "z", sign: 1 | -1) => {
    const next = { ...pos, [axis]: clamp(pos[axis] + sign * step, LIM[axis]) };
    setPos(next);
    setLast(`${axis.toUpperCase()}${sign > 0 ? "+" : "-"}`);
    const g = goals[goal];
    if (g && next.x === g.x && next.y === g.y && next.z === g.z) setGoal(goal + 1);
  };

  const inMat = pos.z < 0 && overPart(pos);
  const belowPart = pos.z < -20;
  const surf = overPart(pos) ? 0 : -20;
  const tip = P(pos.x, pos.y, pos.z);
  const r = 5 * U, len = 30 * U;
  const g = goals[goal];
  const allDone = goals.length > 0 && goal >= goals.length;

  return (
    <div className="jog">
      <div className="jog-view">
        <svg viewBox="0 0 360 300" role="img" aria-label={`Narzędzie w punkcie X${pos.x} Y${pos.y} Z${pos.z}`}>
          <defs>
            <marker id="jog-a" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" viewBox="0 0 10 10">
              <path d="M0 1.2 L9 5 L0 8.8 z" className="jog-mk" />
            </marker>
          </defs>
          <polygon points={pts([-20, -15, -20], [100, -15, -20], [100, 65, -20], [-20, 65, -20])} className="jog-table" />
          <polygon points={pts([0, 0, 0], [80, 0, 0], [80, 0, -20], [0, 0, -20])} className="jog-front" />
          <polygon points={pts([80, 0, 0], [80, 50, 0], [80, 50, -20], [80, 0, -20])} className="jog-side" />
          <polygon points={pts([0, 0, 0], [80, 0, 0], [80, 50, 0], [0, 50, 0])} className="jog-top" />
          {[10, 20, 30, 40, 50, 60, 70].map((x) => { const [a, b] = [P(x, 0, 0), P(x, 50, 0)]; return <line key={`gx${x}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} className="jog-grid" />; })}
          {[10, 20, 30, 40].map((y) => { const [a, b] = [P(0, y, 0), P(80, y, 0)]; return <line key={`gy${y}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} className="jog-grid" />; })}

          {(() => { const o = P(0, 0, 0), x = P(98, 0, 0), y = P(0, 64, 0), z = P(0, 0, 28); return (
            <g className="jog-axes">
              <line x1={o[0]} y1={o[1]} x2={x[0]} y2={x[1]} markerEnd="url(#jog-a)" />
              <line x1={o[0]} y1={o[1]} x2={y[0]} y2={y[1]} markerEnd="url(#jog-a)" />
              <line x1={o[0]} y1={o[1]} x2={z[0]} y2={z[1]} markerEnd="url(#jog-a)" />
              <text x={x[0] + 4} y={x[1] + 4}>X</text>
              <text x={y[0] + 6} y={y[1] + 2}>Y</text>
              <text x={z[0] - 12} y={z[1] + 2}>Z</text>
              <circle cx={o[0]} cy={o[1]} r={3.2} className="jog-w" />
              <text x={o[0] - 14} y={o[1] + 14} className="jog-wl">W</text>
            </g>
          ); })()}

          {g && (() => { const q = P(g.x, g.y, g.z); return (
            <g className="jog-goal">
              <circle cx={q[0]} cy={q[1]} r={6} />
              <line x1={q[0] - 10} y1={q[1]} x2={q[0] + 10} y2={q[1]} />
              <line x1={q[0]} y1={q[1] - 10} x2={q[0]} y2={q[1] + 10} />
            </g>
          ); })()}

          {pos.z > surf && (() => { const s = P(pos.x, pos.y, surf); return (
            <g className="jog-drop">
              <line x1={tip[0]} y1={tip[1]} x2={s[0]} y2={s[1]} />
              <ellipse cx={s[0]} cy={s[1]} rx={r} ry={1.8 * U} />
            </g>
          ); })()}

          <g className={inMat || belowPart ? "jog-tool is-bad" : "jog-tool"}>
            <rect x={tip[0] - r} y={tip[1] - len} width={2 * r} height={len} />
            <ellipse cx={tip[0]} cy={tip[1]} rx={r} ry={1.8 * U} />
            <ellipse cx={tip[0]} cy={tip[1] - len} rx={r} ry={1.8 * U} />
            <line x1={tip[0] - r * 0.4} y1={tip[1] - len * 0.9} x2={tip[0] + r * 0.4} y2={tip[1] - len * 0.1} />
            <circle cx={tip[0]} cy={tip[1]} r={2.4} className="jog-tip" />
          </g>
        </svg>
      </div>

      <div className="jog-read" aria-live="polite">
        {(["x", "y", "z"] as const).map((a) => (
          <span key={a} className={last?.[0] === a.toUpperCase() ? "is-last" : ""}><i>{a.toUpperCase()}</i>{fmt(pos[a])}</span>
        ))}
      </div>

      <div className="jog-pad">
        {(["x", "y", "z"] as const).map((a) => (
          <div key={a} className="jog-row">
            <button type="button" className="jog-btn" onClick={() => move(a, -1)} aria-label={`${a.toUpperCase()} minus ${step} mm`}>−</button>
            <span className="jog-axis">{a.toUpperCase()}</span>
            <button type="button" className="jog-btn" onClick={() => move(a, 1)} aria-label={`${a.toUpperCase()} plus ${step} mm`}>+</button>
          </div>
        ))}
        <div className="jog-step segmented" role="tablist" aria-label="Skok">
          {([1, 10] as const).map((s) => (
            <button key={s} type="button" role="tab" aria-selected={step === s} onClick={() => setStep(s)}>{s} mm</button>
          ))}
        </div>
      </div>

      <p className={`jog-status${inMat || belowPart ? " is-bad" : ""}`}>
        {inMat ? "Z ujemne nad detalem: narzędzie jest w materiale. Na maszynie w tym miejscu frez już skrawa." :
          belowPart ? "Poniżej dolnej krawędzi detalu. Na maszynie tu jest imadło albo stół." :
            last ? `Ostatni ruch ${last.replace("-", "−")}: narzędzie ${DIR[last]}.` : "Naciśnij + albo − przy wybranej osi."}
      </p>

      {goals.length > 0 && (
        <ol className="jog-goals">
          {goals.map((q, i) => (
            <li key={i} className={i < goal ? "is-done" : i === goal ? "is-now" : ""}>
              <code>X{q.x} Y{q.y} Z{q.z}</code><span>{q.label}</span>
            </li>
          ))}
          {allDone && <li className="jog-win">Wszystkie punkty osiągnięte.</li>}
        </ol>
      )}
    </div>
  );
}
