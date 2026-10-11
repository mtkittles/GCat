"use client";
import { useMemo } from "react";

/*
  Przekrój z boku do zadania G43 (F4.1): wrzeciono, oprawka, narzędzie i płytka w osi Z.
  Liczy z programu w edytorze, gdzie stanie czubek przy dojeździe i w najniższym ruchu.
  Dane jak w przykładzie lekcji: G54 Z −400, rejestr H1 = 85,2 (frez T1), H2 = 102,7.
  Czubek = Z programu + wartość z rejestru H − rzeczywista długość narzędzia we wrzecionie
  (bez G43: Z programu − długość, bo sterowanie ustawia na Z czoło wrzeciona).
*/

const G54Z = -400;
const REG: Record<number, number> = { 1: 85.2, 2: 102.7 };
const PART = 20;

type Rec = { line: number; z: number; comp: boolean; h: number | null };

function scan(src: string): { first: Rec | null; low: Rec | null; tool: number | null } {
  let comp = false, h: number | null = null, tool: number | null = null, after = false;
  let first: Rec | null = null, low: Rec | null = null;
  src.split("\n").forEach((raw, i) => {
    const line = raw.replace(/\([^)]*\)/g, "").replace(/;.*/, "").toUpperCase();
    const words = [...line.matchAll(/([A-Z])\s*(-?\d*\.?\d+)/g)].map((m) => ({ k: m[1], v: Number(m[2]) }));
    const has = (k: string, v: number) => words.some((w) => w.k === k && w.v === v);
    const t = words.find((w) => w.k === "T");
    if (has("M", 6)) { after = true; comp = false; h = null; if (t) tool = t.v; }
    if (has("G", 49)) { comp = false; h = null; }
    if (has("G", 43)) { comp = true; const hw = words.find((w) => w.k === "H"); h = hw ? hw.v : h; }
    const z = words.find((w) => w.k === "Z");
    if (after && z) {
      const rec = { line: i + 1, z: z.v, comp, h };
      if (!first) first = rec;
      if (!low || z.v < low.z) low = rec;
    }
  });
  return { first, low, tool };
}

const f1 = (v: number) => (Math.round(v * 10) / 10).toFixed(1).replace(".", ",").replace("-", "−");

function tipOf(r: Rec, L: number) {
  const add = r.comp && r.h != null ? REG[r.h] ?? 0 : 0;
  return { tip: r.z + add - L, nose: r.z + add, add };
}

export default function G43Side({ src }: { src: string }) {
  const { first, low, tool } = useMemo(() => scan(src), [src]);
  const L = REG[tool ?? 1] ?? REG[1];
  const cases = [
    { key: "Dojazd", r: first },
    { key: "Najniższy ruch", r: low && first && low.line !== first.line ? low : null },
  ].filter((c): c is { key: string; r: Rec } => !!c.r);

  // skala: Z w układzie detalu od −110 do 150 mm
  const Z0 = -110, Z1 = 150, H = 300, top = 10;
  const Y = (z: number) => top + (Z1 - z) * (H / (Z1 - Z0));
  const colX = [95, 235];

  return (
    <figure className="g43s">
      <svg viewBox="0 0 360 330" role="img" aria-label="Przekrój z boku: położenie czubka narzędzia w osi Z">
        <rect x={20} y={Y(0)} width={320} height={Y(-PART) - Y(0)} className="g43s-part" />
        <rect x={10} y={Y(-PART)} width={340} height={Y(Z0) - Y(-PART)} className="g43s-table" />
        <line x1={10} y1={Y(0)} x2={350} y2={Y(0)} className="g43s-z0" />
        <text x={346} y={Y(0) - 4} textAnchor="end" className="g43s-lab is-acc">Z0 detalu</text>
        <text x={346} y={Y(-PART) + 14} textAnchor="end" className="g43s-lab">stół / imadło</text>
        {cases.map((c, i) => {
          const { tip, nose } = tipOf(c.r, L);
          const x = colX[i];
          const bad = Math.abs(tip - c.r.z) > 0.01;
          const yt = Math.max(Y(Z1 - 4), Math.min(Y(Z0 + 2), Y(tip)));
          const yn = Math.max(Y(Z1), Math.min(Y(Z0), Y(nose)));
          return (
            <g key={c.key}>
              <rect x={x - 22} y={Math.max(0, yn - 70)} width={44} height={Math.max(0, yn - Math.max(0, yn - 70))} className="g43s-spindle" />
              <rect x={x - 13} y={yn} width={26} height={Math.max(0, Math.min(18, yt - yn))} className="g43s-holder" />
              <rect x={x - 6} y={Math.min(yn + 18, yt)} width={12} height={Math.max(0, yt - Math.min(yn + 18, yt))} className={bad ? "g43s-tool is-bad" : "g43s-tool"} />
              <line x1={x - 30} y1={yn} x2={x + 30} y2={yn} className="g43s-nose" />
              <text x={x + 32} y={yn + 4} className="g43s-lab is-acc">N</text>
              <circle cx={x} cy={yt} r={3.2} className={bad ? "g43s-tip is-bad" : "g43s-tip"} />
              <text x={x} y={yt + (bad ? -8 : 16)} textAnchor="middle" className={bad ? "g43s-val is-bad" : "g43s-val"}>{`Z${f1(tip)}`}</text>
              <text x={x} y={322} textAnchor="middle" className="g43s-lab">{`${c.key}: linia ${c.r.line}`}</text>
            </g>
          );
        })}
      </svg>
      <figcaption className="g43s-cap">
        <span className="g43s-reg"><b>G54</b> Z {f1(G54Z)}</span>
        <span className="g43s-reg"><b>T{tool ?? 1}</b> we wrzecionie — długość {f1(L)} mm</span>
        <span className="g43s-reg"><b>rejestr H1</b> = 85,2 · <b>H2</b> = 102,7</span>
        {cases.length === 0 && <span>Brak ruchu w Z po wymianie narzędzia.</span>}
        {cases.map((c) => {
          const { tip, nose, add } = tipOf(c.r, L);
          const how = c.r.comp && c.r.h != null ? `G43 H${c.r.h}` : c.r.comp ? "G43 bez H" : "bez G43";
          const off = tip - c.r.z;
          const ok = Math.abs(off) <= 0.01;
          const where = tip < -PART ? "pod detalem — w stole albo imadle" : tip < 0 ? "w materiale" : "nad detalem";
          const verdict = ok ? (tip < 0 ? `tam, gdzie mówi program — skrawa na głębokości ${f1(tip)}` : "tam, gdzie mówi program")
            : `${f1(Math.abs(off))} mm ${off < 0 ? "niżej" : "wyżej"} niż w programie, ${where}`;
          return (
            <span key={c.key} className={ok ? "g43s-row" : "g43s-row is-bad"}>
              <b>{c.key}</b> ({how}, Z{f1(c.r.z)}): czoło N maszynowo {f1(G54Z)} + {f1(c.r.z)}{add ? ` + ${f1(add)}` : ""} = {f1(G54Z + nose)}; czubek Z{f1(tip)} — {verdict}.
            </span>
          );
        })}
      </figcaption>
    </figure>
  );
}
