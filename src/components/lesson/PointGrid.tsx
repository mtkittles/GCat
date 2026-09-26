"use client";
import { useState } from "react";
import { Fig, Grid, mapper, Pt, T } from "@/components/fig";
import type { PointTask } from "@/lib/lesson";

/*
  Widok z góry z płytką 80 × 50. Tapnięcie wybiera punkt (przyciąganie co `snap` mm).
  Komponent jest sterowany: `picked` i `onPick` trzyma rodzic.
*/

const RANGE: [number, number, number, number] = [-20, 96, -16, 62];
const BOX: [number, number, number, number] = [18, 8, 330, 232];

export function PointGrid({ id, title, picked, onPick, target, reveal, guides, snap = 5, locked }: {
  id: string; title: string; picked: [number, number] | null; onPick: (p: [number, number]) => void;
  target?: [number, number]; reveal?: boolean; guides?: boolean; snap?: number; locked?: boolean;
}) {
  const m = mapper(RANGE, BOX);
  const inv = (px: number, py: number): [number, number] => {
    const x = RANGE[0] + (px - m.X(RANGE[0])) / m.u;
    const y = RANGE[2] + (m.Y(RANGE[2]) - py) / m.u;
    const s = (v: number, [a, b]: [number, number]) => Math.min(b, Math.max(a, Math.round(v / snap) * snap));
    return [s(x, [RANGE[0], RANGE[1]]), s(y, [RANGE[2], RANGE[3]])];
  };
  const onDown = (e: React.PointerEvent<SVGRectElement>) => {
    if (locked) return;
    const svg = e.currentTarget.ownerSVGElement; const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    onPick(inv(p.x, p.y));
  };
  const ok = picked && target && picked[0] === target[0] && picked[1] === target[1];
  return (
    <Fig id={id} title={title} h={256}>
      {(c) => (
        <g>
          <Grid m={m} range={RANGE} c={c} />
          <rect x={m.X(0)} y={m.Y(50)} width={80 * m.u} height={50 * m.u} fill={c.hatch} className="p-con" />
          <T x={m.X(0) + 5} y={m.Y(0) - 5} cls="t-acc t-b">W</T>
          {target && guides && <>
            <line x1={m.X(target[0])} y1={m.Y(RANGE[2])} x2={m.X(target[0])} y2={m.Y(RANGE[3])} className="p-cons" />
            <line x1={m.X(RANGE[0])} y1={m.Y(target[1])} x2={m.X(RANGE[1])} y2={m.Y(target[1])} className="p-cons" />
          </>}
          {target && reveal && !ok && <Pt x={m.X(target[0])} y={m.Y(target[1])} dot="pt-cut" label={`X${target[0]} Y${target[1]}`} pos={target[0] > 60 ? "nw" : "ne"} cls="t-cut t-b t-mono" />}
          {picked && (
            <g>
              <circle cx={m.X(picked[0])} cy={m.Y(picked[1])} r={8} className={reveal ? (ok ? "pick-ring is-ok" : "pick-ring is-bad") : "pick-ring"} />
              <circle cx={m.X(picked[0])} cy={m.Y(picked[1])} r={3} className="pick-dot" />
            </g>
          )}
          <rect x={BOX[0]} y={BOX[1]} width={BOX[2]} height={BOX[3]} fill="transparent" onPointerDown={onDown}
            style={{ cursor: locked ? "default" : "crosshair", touchAction: "manipulation" }} />
        </g>
      )}
    </Fig>
  );
}

const fmtP = (p: [number, number]) => `X${p[0]} Y${p[1]}`.replace(/-/g, "−");

/** Seria zadań „zaznacz punkt” — pierwsze z podpowiedzią, kolejne bez. */
export function PointDrill({ tasks }: { tasks: PointTask[] }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<[number, number] | null>(null);
  const [checked, setChecked] = useState(false);
  const t = tasks[i];
  if (!t) return (
    <div className="drill-done">
      <p>Wszystkie punkty zaznaczone.</p>
      <button type="button" className="btn ghost" onClick={() => { setI(0); setPicked(null); setChecked(false); }}>Zacznij od nowa</button>
    </div>
  );
  const ok = picked && picked[0] === t.target[0] && picked[1] === t.target[1];
  return (
    <div className="drill">
      <div className="drill-head"><span className="drill-n">{i + 1}/{tasks.length}</span><span>{t.prompt}</span></div>
      <PointGrid id={`drill${i}`} title="Tapnij, aby zaznaczyć" picked={picked} target={t.target} guides={t.guides}
        reveal={checked} locked={checked && !!ok} onPick={(p) => { setPicked(p); setChecked(false); }} />
      <div className="drill-foot">
        <span className="drill-pick">{picked ? <>Twój punkt: <code>{fmtP(picked)}</code></> : "Nie zaznaczono punktu"}</span>
        {!checked || !ok
          ? <button type="button" className="btn" disabled={!picked} onClick={() => setChecked(true)}>Sprawdź</button>
          : <button type="button" className="btn" onClick={() => { setI(i + 1); setPicked(null); setChecked(false); }}>Dalej</button>}
      </div>
      {checked && (
        <p className={`fb ${ok ? "is-ok" : "is-bad"}`}>
          {ok ? "Dobrze." : `To jest ${fmtP(picked!)}. Szukany punkt ${fmtP(t.target)} zaznaczono na zielono — popraw i sprawdź jeszcze raz.`}
        </p>
      )}
    </div>
  );
}
