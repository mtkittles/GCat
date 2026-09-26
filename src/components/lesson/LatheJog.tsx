"use client";
import { useState } from "react";
import type { LatheGoal } from "@/lib/lesson";

/*
  Tokarka z boku: uchwyt po lewej, pręt Ø40 wystaje 70 mm, Z0 na czole, X0 na osi.
  Głowica tylna — nóż nad osią, +X w górę. Odczyt X w średnicy (jak na tokarce),
  z przełącznikiem na promień. Tryb `setZ`: przesunięcie Z nieznane, dopóki uczeń
  nie dotknie czoła i nie zapisze Z0 — jak pomiar zera na maszynie.
*/

const ZMIN = -90, ZMAX = 30, DMAX = 70;
const BW = 340, BH = 200, OX = 10, OY = 8;
const U = Math.min(BW / (ZMAX - ZMIN), BH / (DMAX + 10));
const AXIS = OY + BH / 2 + 18;
const SX = (z: number) => OX + (z - ZMIN) * U;
const SY = (r: number) => AXIS - r * U;
const FACE_M = -312.4; // pozycja maszynowa czoła (ukryta do pomiaru)

const f3 = (v: number) => (Object.is(v, -0) ? 0 : v).toFixed(3).replace("-", "−");

export default function LatheJog({ goals, setZ = false }: { goals: LatheGoal[]; setZ?: boolean }) {
  const [pos, setPos] = useState({ d: 60, z: 20 });
  const [step, setStep] = useState<1 | 10>(10);
  const [radius, setRadius] = useState(false);
  const [zSet, setZSet] = useState(!setZ);
  const [done, setDone] = useState(0);

  const r = pos.d / 2;
  const inMat = pos.z < -0.001 && r < 20 - 0.001 && pos.z > -70;
  const onSurface = !inMat && ((Math.abs(pos.z) < 0.001 && r <= 20) || (Math.abs(r - 20) < 0.001 && pos.z <= 0 && pos.z >= -70));

  const hit = (g: LatheGoal, p: typeof pos, zs: boolean) => {
    if (g.kind === "setz") return zs;
    return zs && p.d === g.x && p.z === g.z;
  };
  const advance = (p: typeof pos, zs: boolean) => {
    let d = done;
    while (goals[d] && hit(goals[d], p, zs)) d++;
    if (d !== done) setDone(d);
  };
  const move = (axis: "d" | "z", sign: 1 | -1) => {
    const v = pos[axis] + sign * step;
    const next = { ...pos, [axis]: axis === "d" ? Math.max(0, Math.min(DMAX, v)) : Math.max(ZMIN + 5, Math.min(ZMAX, v)) };
    setPos(next); advance(next, zSet);
  };
  const measure = () => {
    if (Math.abs(pos.z) > 0.001) return;
    setZSet(true); advance(pos, true);
  };

  const goal = goals[done];
  const tip = { x: SX(pos.z), y: SY(r) };
  const zShown = zSet ? f3(pos.z) : f3(FACE_M + pos.z);

  return (
    <div className="jog lj">
      <div className="jog-view">
        <svg viewBox="0 0 360 236" role="img" aria-label={`Nóż w X${pos.d} Z${pos.z}`}>
          <rect x={SX(-90)} y={SY(34)} width={(10) * U} height={68 * U} rx={3} className="lj-chuck" />
          <rect x={SX(-80)} y={SY(26)} width={8 * U} height={10 * U} className="lj-jaw" />
          <rect x={SX(-80)} y={SY(-16)} width={8 * U} height={10 * U} className="lj-jaw" />
          <rect x={SX(-80)} y={SY(20)} width={80 * U} height={40 * U} className="lj-bar" />
          <rect x={SX(-80)} y={SY(0)} width={80 * U} height={20 * U} className="lj-bar-low" />
          <line x1={SX(-92)} y1={AXIS} x2={SX(28)} y2={AXIS} className="lj-axis" />
          <T x={SX(26)} y={AXIS - 5} anchor="end" cls="lj-lab">oś</T>
          <line x1={SX(0)} y1={AXIS} x2={SX(24)} y2={AXIS} className="lj-ax" markerEnd="url(#lj-a)" />
          <line x1={SX(0)} y1={AXIS} x2={SX(0)} y2={SY(30)} className="lj-ax" markerEnd="url(#lj-a)" />
          <T x={SX(24) + 3} y={AXIS + 14} cls="lj-axl">+Z</T>
          <T x={SX(0) + 5} y={SY(30) + 4} cls="lj-axl">+X</T>
          <circle cx={SX(0)} cy={AXIS} r={3.4} className="lj-w" />
          <T x={SX(0) - 6} y={AXIS + 14} anchor="end" cls="lj-axl">{zSet ? "W" : "W ?"}</T>
          <defs>
            <marker id="lj-a" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" viewBox="0 0 10 10">
              <path d="M0 1.2 L9 5 L0 8.8 z" className="jog-mk" />
            </marker>
          </defs>
          {goal && goal.kind !== "setz" && zSet && (
            <g className="jog-goal">
              <circle cx={SX(goal.z)} cy={SY(goal.x / 2)} r={6} />
              <line x1={SX(goal.z) - 10} y1={SY(goal.x / 2)} x2={SX(goal.z) + 10} y2={SY(goal.x / 2)} />
              <line x1={SX(goal.z)} y1={SY(goal.x / 2) - 10} x2={SX(goal.z)} y2={SY(goal.x / 2) + 10} />
            </g>
          )}
          <g className={inMat ? "lj-tool is-bad" : "lj-tool"}>
            <polygon points={`${tip.x},${tip.y} ${tip.x + 9},${tip.y - 16} ${tip.x + 22},${tip.y - 9}`} />
            <rect x={tip.x + 10} y={tip.y - 40} width={16} height={26} rx={2} className="lj-holder" />
            <circle cx={tip.x} cy={tip.y} r={2.4} className="jog-tip" />
          </g>
          {radius && <line x1={tip.x} y1={tip.y} x2={tip.x} y2={AXIS} className="lj-rad" />}
        </svg>
      </div>

      <div className="jog-read lj-read" aria-live="polite">
        <span><i>{radius ? "X (r)" : "X (Ø)"}</i>{f3(radius ? r : pos.d)}</span>
        <span><i>{zSet ? "Z" : "Z masz."}</i>{zShown}</span>
      </div>

      <div className="oj-pad">
        {([["d", "X"], ["z", "Z"]] as const).map(([a, l]) => (
          <div key={a} className="jog-row">
            <button type="button" className="jog-btn" onClick={() => move(a, -1)} aria-label={`${l} minus ${step} mm`}>−</button>
            <span className="jog-axis">{l}</span>
            <button type="button" className="jog-btn" onClick={() => move(a, 1)} aria-label={`${l} plus ${step} mm`}>+</button>
          </div>
        ))}
        <div className="segmented oj-step" role="tablist" aria-label="Skok">
          {([1, 10] as const).map((s) => <button key={s} type="button" role="tab" aria-selected={step === s} onClick={() => setStep(s)}>{s} mm</button>)}
        </div>
      </div>

      <div className="oj-regs">
        <button type="button" className="btn ghost" aria-pressed={radius} onClick={() => setRadius(!radius)}>{radius ? "Pokaż średnicę" : "Pokaż promień"}</button>
        {setZ && !zSet && <button type="button" className="btn" disabled={Math.abs(pos.z) > 0.001 && !onSurface} onClick={measure}>Zapisz Z0 tutaj</button>}
      </div>

      <p className={`jog-status${inMat ? " is-bad" : ""}`}>
        {inMat ? "Ostrze jest w materiale: Z ujemne i średnica mniejsza niż Ø40." :
          setZ && !zSet ? "Dotknij ostrzem czoła pręta i zapisz tę pozycję jako Z0." :
            onSurface ? "Ostrze dotyka powierzchni pręta." : "Naciśnij + albo − przy wybranej osi."}
      </p>

      <ol className="jog-goals">
        {goals.map((g, i) => (
          <li key={i} className={i < done ? "is-done" : i === done ? "is-now" : ""}>
            <code>{g.kind === "setz" ? "Z0 ← czoło" : `X${g.x} Z${g.z}`}</code><span>{g.label}</span>
          </li>
        ))}
        {done >= goals.length && <li className="jog-win">Wszystkie punkty osiągnięte.</li>}
      </ol>
    </div>
  );
}

function T({ x, y, anchor, cls, children }: { x: number; y: number; anchor?: "start" | "middle" | "end"; cls?: string; children: React.ReactNode }) {
  return <text x={x} y={y} textAnchor={anchor} className={cls}>{children}</text>;
}
