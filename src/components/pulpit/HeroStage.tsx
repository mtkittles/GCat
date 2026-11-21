"use client";
import { useEffect, useState } from "react";
import { useLive } from "@/components/obszary/live";
import type { HeroLine } from "./heroProgram";

/*
  Pulpit, pas pod nagłówkiem (V3.1): okno symulatora, w którym program wykonuje się blok po bloku —
  podświetlona linia, narysowany tor do tej linii, odczyt X/Y/Z. Kolory ruchu jak w całym serwisie.
  Tor z parsera (heroProgram.ts). Ruch tylko w widoku; przy „ogranicz ruch” — cały tor, bez przełączania linii.
*/
const W = 520, H = 360, M = 70; // pole rysunku i margines
const COL = { rapid: "var(--pv-g0)", linear: "var(--pv-g1)", arc: "var(--pv-g2)" } as const;

export default function HeroStage({ lines }: { lines: HeroLine[] }) {
  const [ref, live] = useLive<HTMLDivElement>();
  const moves = lines.map((l, i) => (l.kind ? i : -1)).filter((i) => i >= 0);
  const [cur, setCur] = useState(lines.length - 1);

  useEffect(() => {
    if (!live) return;
    let k = -1;
    const t = setInterval(() => {
      if (document.hidden) return;
      k = (k + 1) % (moves.length + 2); // dwa takty przerwy na końcu programu
      setCur(moves[Math.min(k, moves.length - 1)]);
    }, 850);
    return () => clearInterval(t);
  }, [live, moves.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // skala z całego toru
  const all = lines.flatMap((l) => l.pts);
  const xs = all.map((p) => p[0]), ys = all.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const s = Math.min((W - 2 * M) / (x1 - x0), (H - 2 * M) / (y1 - y0));
  const ox = (W - (x1 - x0) * s) / 2, oy = (H - (y1 - y0) * s) / 2;
  const X = (x: number) => ox + (x - x0) * s, Y = (y: number) => H - oy - (y - y0) * s;
  const d = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${X(x).toFixed(1)} ${Y(y).toFixed(1)}`).join("");

  const pos = lines[cur].pos;
  return (
    <div ref={ref} className="hs" aria-hidden>
      <div className="hs-glow" />
      <div className="hs-win">
        <div className="hs-bar"><i /><i /><i /><span>Symulator · O0001 kontur R10 · Fanuc</span></div>
        <div className="hs-body">
          <ol className="hs-code" style={{ ["--cur" as string]: cur }}>
            {lines.map((l, i) => (
              <li key={i} className={`${i === cur ? "is-on" : ""}${i > cur ? " is-next" : ""}`}>
                <em>{i + 1}</em><span className={l.kind ? `k-${l.kind}` : undefined}>{l.text}</span>
              </li>
            ))}
          </ol>
          <div className="hs-view">
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
              <rect x={X(0)} y={Y(50)} width={60 * s} height={50 * s} className="hs-part" />
              {lines.map((l, i) => l.kind && l.pts.length > 1 && i <= cur && (
                <path key={i} d={d(l.pts)} stroke={COL[l.kind]} className={`hs-path${l.kind === "rapid" ? " is-rapid" : ""}${i === cur ? " is-cur" : ""}`} />
              ))}
              <circle cx={X(pos[0])} cy={Y(pos[1])} r={10} className="hs-tool" />
              <circle cx={X(pos[0])} cy={Y(pos[1])} r={2.5} className="hs-tip" />
            </svg>
            <div className="hs-dro">
              {(["X", "Y", "Z"] as const).map((a, k) => <span key={a}><b>{a}</b>{pos[k].toFixed(3)}</span>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
