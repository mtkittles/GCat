"use client";
import { useState } from "react";
import type { OffsetGoal, OffsetPart } from "@/lib/lesson";

/*
  Stół frezarki z góry. M — zero maszyny w prawym tylnym rogu przestrzeni roboczej,
  więc pozycje maszynowe są ujemne (typowe dla centrów pionowych).
  Odczyt podwójny: MASZYNA oraz układ detalu (G54/G55).
  Tryb `set`: rejestry startują puste, przycisk zapisuje bieżącą pozycję maszynową
  do wybranego rejestru — tak jak pomiar zera na maszynie.
*/

type Reg = "G54" | "G55";
const RX: [number, number] = [-520, 20], RY: [number, number] = [-420, 20];
const BX = 10, BY = 8, BW = 340, BH = 272;
const U = Math.min(BW / (RX[1] - RX[0]), BH / (RY[1] - RY[0]));
const OX = BX + (BW - (RX[1] - RX[0]) * U) / 2, OY = BY + BH - (BH - (RY[1] - RY[0]) * U) / 2;
const X = (v: number) => OX + (v - RX[0]) * U, Y = (v: number) => OY - (v - RY[0]) * U;
const LIM = { x: [-500, 0], y: [-400, 0] } as const;
const f3 = (v: number) => (Object.is(v, -0) ? 0 : v).toFixed(3).replace("-", "−");

export default function OffsetJog({ parts, goals, set = false }: { parts: OffsetPart[]; goals: OffsetGoal[]; set?: boolean }) {
  const [pos, setPos] = useState({ x: -100, y: -80 });
  const [step, setStep] = useState<1 | 10 | 100>(100);
  const [active, setActive] = useState<Reg>(parts[0]?.reg ?? "G54");
  const [regs, setRegs] = useState<Record<Reg, { x: number; y: number } | null>>(() => {
    const r: Record<Reg, { x: number; y: number } | null> = { G54: null, G55: null };
    if (!set) parts.forEach((p) => { r[p.reg] = { x: p.x, y: p.y }; });
    return r;
  });
  const [done, setDone] = useState(0);
  const regsUsed = Array.from(new Set(parts.map((p) => p.reg)));

  const hit = (g: OffsetGoal, p: { x: number; y: number }, rg: typeof regs) => {
    if (g.kind === "set") { const r = rg[g.reg]; return !!r && r.x === g.x && r.y === g.y; }
    if (g.frame === "M") return p.x === g.x && p.y === g.y;
    const r = rg[g.frame]; return !!r && p.x - r.x === g.x && p.y - r.y === g.y;
  };
  const advance = (p: { x: number; y: number }, rg: typeof regs) => {
    let d = done;
    while (goals[d] && hit(goals[d], p, rg)) d++;
    if (d !== done) setDone(d);
  };

  const move = (axis: "x" | "y", sign: 1 | -1) => {
    const [a, b] = LIM[axis];
    const next = { ...pos, [axis]: Math.min(b, Math.max(a, pos[axis] + sign * step)) };
    setPos(next); advance(next, regs);
  };
  const measure = () => {
    const rg = { ...regs, [active]: { ...pos } };
    setRegs(rg); advance(pos, rg);
  };

  const r = regs[active];
  const goal = goals[done];

  return (
    <div className="jog oj">
      <div className="jog-view">
        <svg viewBox="0 0 360 290" role="img" aria-label={`Pozycja maszynowa X${pos.x} Y${pos.y}`}>
          <rect x={X(-510)} y={Y(10)} width={520 * U} height={420 * U} rx={6} className="oj-table" />
          {[-450, -350, -250, -150, -50].map((v) => <line key={v} x1={X(v)} y1={Y(10)} x2={X(v)} y2={Y(-410)} className="oj-slot" />)}
          {parts.map((p) => {
            const set_ = regs[p.reg];
            return (
              <g key={p.reg}>
                <rect x={X(p.x)} y={Y(p.y + 50)} width={80 * U} height={50 * U} className="oj-part" />
                <text x={X(p.x + 40)} y={Y(p.y + 25) + 4} textAnchor="middle" className="oj-plab">{p.label}</text>
                <circle cx={X(p.x)} cy={Y(p.y)} r={3.5} className={set_ ? "oj-w is-set" : "oj-w"} />
                <text x={X(p.x) - 5} y={Y(p.y) + 14} textAnchor="end" className="oj-wlab">{set_ ? `W ${p.reg}` : "W ?"}</text>
              </g>
            );
          })}
          <circle cx={X(0)} cy={Y(0)} r={4.5} className="oj-m" />
          <text x={X(0) - 8} y={Y(0) + 4} textAnchor="end" className="oj-mlab">M</text>
          {r && <line x1={X(0)} y1={Y(0)} x2={X(r.x)} y2={Y(r.y)} className="oj-vec" />}
          {goal && goal.kind === "move" && (() => {
            const base = goal.frame === "M" ? { x: 0, y: 0 } : regs[goal.frame];
            if (!base) return null;
            const gx = X(base.x + goal.x), gy = Y(base.y + goal.y);
            return <g className="jog-goal"><circle cx={gx} cy={gy} r={7} /><line x1={gx - 11} y1={gy} x2={gx + 11} y2={gy} /><line x1={gx} y1={gy - 11} x2={gx} y2={gy + 11} /></g>;
          })()}
          <g>
            <circle cx={X(pos.x)} cy={Y(pos.y)} r={7} className="oj-tool" />
            <line x1={X(pos.x) - 4} y1={Y(pos.y)} x2={X(pos.x) + 4} y2={Y(pos.y)} className="oj-cross" />
            <line x1={X(pos.x)} y1={Y(pos.y) - 4} x2={X(pos.x)} y2={Y(pos.y) + 4} className="oj-cross" />
          </g>
        </svg>
      </div>

      <div className="oj-read" aria-live="polite">
        <div className="oj-row"><span className="oj-k">MASZYNA</span><span><i>X</i>{f3(pos.x)}</span><span><i>Y</i>{f3(pos.y)}</span></div>
        <div className="oj-row is-work"><span className="oj-k">{active}</span>
          {r ? <><span><i>X</i>{f3(pos.x - r.x)}</span><span><i>Y</i>{f3(pos.y - r.y)}</span></>
            : <span className="oj-empty">rejestr pusty</span>}
        </div>
      </div>

      <div className="oj-pad">
        {(["x", "y"] as const).map((a) => (
          <div key={a} className="jog-row">
            <button type="button" className="jog-btn" onClick={() => move(a, -1)} aria-label={`${a.toUpperCase()} minus ${step} mm`}>−</button>
            <span className="jog-axis">{a.toUpperCase()}</span>
            <button type="button" className="jog-btn" onClick={() => move(a, 1)} aria-label={`${a.toUpperCase()} plus ${step} mm`}>+</button>
          </div>
        ))}
        <div className="segmented oj-step" role="tablist" aria-label="Skok">
          {([1, 10, 100] as const).map((s) => (
            <button key={s} type="button" role="tab" aria-selected={step === s} onClick={() => setStep(s)}>{s}</button>
          ))}
        </div>
      </div>

      {(regsUsed.length > 1 || set) && (
        <div className="oj-regs">
          {regsUsed.length > 1 && (
            <div className="segmented" role="tablist" aria-label="Aktywny układ">
              {regsUsed.map((g) => <button key={g} type="button" role="tab" aria-selected={active === g} onClick={() => setActive(g)}>{g}</button>)}
            </div>
          )}
          {set && <button type="button" className="btn" onClick={measure}>Zapisz pozycję do {active}</button>}
        </div>
      )}

      <table className="oj-regtab">
        <thead><tr><th>Rejestr</th><th>X</th><th>Y</th></tr></thead>
        <tbody>{regsUsed.map((g) => (
          <tr key={g} className={g === active ? "is-active" : ""}><th scope="row">{g}</th>
            <td>{regs[g] ? f3(regs[g]!.x) : "—"}</td><td>{regs[g] ? f3(regs[g]!.y) : "—"}</td></tr>
        ))}</tbody>
      </table>

      <ol className="jog-goals">
        {goals.map((g, i) => (
          <li key={i} className={i < done ? "is-done" : i === done ? "is-now" : ""}>
            <code>{g.kind === "set" ? `${g.reg} ← X${g.x} Y${g.y}` : `${g.frame === "M" ? "MASZ." : g.frame} X${g.x} Y${g.y}`}</code>
            <span>{g.label}</span>
          </li>
        ))}
        {done >= goals.length && <li className="jog-win">Wszystkie kroki wykonane.</li>}
      </ol>
    </div>
  );
}
