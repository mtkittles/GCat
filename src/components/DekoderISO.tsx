"use client";

import { useId, useState } from "react";
import { dekoduj, GRUBOSCI, KSZTALTY, pozycja, PRZYLOZENIA, TYPY, type PozId } from "@/lib/iso1832";

/*
  <DekoderISO kod="CNMG 120408" /> — oznaczenie płytki wg ISO 1832: klik w znak → nazwa pozycji, odczyt i rysunek
  (widok z góry i przekrój, element pozycji w kolorze parametru). Proporcje rysunku poglądowe.
  Dane: src/lib/iso1832.ts. Styl: .dekoder w src/app/technologia.css, rysunek w ramie .fig (papier techniczny).
*/

const rad = (d: number) => (d * Math.PI) / 180;
type Pt = [number, number];
const path = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ") + " Z";

/** Obrys płytki z góry: naroże robocze z lewej; r — promień okręgu wpisanego. */
function outline(shape: string, cx: number, cy: number, r: number): { pts: Pt[] | null; nose: Pt; angle: number } {
  const [, a] = KSZTALTY[shape] ?? ["", 80];
  const poly = (n: number, start = 180): Pt[] => {
    const R = r / Math.cos(Math.PI / n);
    return Array.from({ length: n }, (_, i) => [cx + R * Math.cos(rad(start + (360 / n) * i)), cy - R * Math.sin(rad(start + (360 / n) * i))] as Pt);
  };
  if (shape === "R") return { pts: null, nose: [cx - r, cy], angle: 0 };
  if (shape === "T") { const p = poly(3); return { pts: p, nose: p[0], angle: 60 }; }
  if (shape === "S") { const p = poly(4); return { pts: p, nose: p[0], angle: 90 }; }
  if (shape === "P") { const p = poly(5); return { pts: p, nose: p[0], angle: 108 }; }
  if (shape === "H") { const p = poly(6); return { pts: p, nose: p[0], angle: 120 }; }
  if (shape === "O") { const p = poly(8); return { pts: p, nose: p[0], angle: 135 }; }
  if (shape === "L") { const p: Pt[] = [[cx - 1.5 * r, cy - r * 0.8], [cx + 1.5 * r, cy - r * 0.8], [cx + 1.5 * r, cy + r * 0.8], [cx - 1.5 * r, cy + r * 0.8]]; return { pts: p, nose: p[3], angle: 90 }; }
  if (shape === "W") {
    const p = Array.from({ length: 6 }, (_, i) => { const R = i % 2 ? r * 1.02 : r * 1.32; const t = rad(180 + 60 * i); return [cx + R * Math.cos(t), cy - R * Math.sin(t)] as Pt; });
    return { pts: p, nose: p[0], angle: 80 };
  }
  // romb i równoległobok (poglądowo jako romb o kącie a)
  const dA = r / Math.sin(rad(a / 2)), dO = r / Math.cos(rad(a / 2));
  const s = Math.min(1, 62 / dA);
  const p: Pt[] = [[cx - dA * s, cy], [cx, cy - dO * s], [cx + dA * s, cy], [cx, cy + dO * s]];
  return { pts: p, nose: p[0], angle: a };
}

function Rysunek({ znaki, poz, idp }: { znaki: Record<PozId, string | undefined>; poz: PozId; idp: string }) {
  const shape = znaki.ksztalt ?? "C";
  const cx = 96, cy = 78, r = 40;
  const o = outline(shape, cx, cy, r);
  const on = (p: PozId | PozId[]) => ((Array.isArray(p) ? p : [p]).includes(poz) ? "p-acc thick" : "p-con");
  const clear = PRZYLOZENIA[znaki.przylozenie ?? "N"] ?? 0;
  const typ = TYPY[znaki.typ ?? "G"] ?? TYPY.G;
  const hole = !typ[0].startsWith("bez") && typ[0] !== "wykonanie specjalne";
  const cs = typ[0].includes("pogłębieniem");
  const csBoth = typ[0].includes("z obu stron");
  const cbTop = !typ[1].startsWith("bez"), cbBot = typ[1].includes("z obu stron");
  const t = Math.max(14, Math.min(34, (GRUBOSCI[znaki.grubosc ?? "04"] ?? 4.76) * 5));
  // przekrój: x0…x1, góra y0
  const x0 = 222, x1 = 342, y0 = 70, y1 = y0 + t, off = Math.tan(rad(clear)) * t;
  const sec: Pt[] = [[x0, y0], [x1, y0], [x1 - off, y1], [x0 + off, y1]];
  const [nx, ny] = o.nose;
  return (
    <svg viewBox="0 0 360 156" role="img" aria-labelledby={`${idp}-t`}>
      <title id={`${idp}-t`}>{`Płytka ${shape}: widok z góry i przekrój; zaznaczona pozycja: ${pozycja(poz).nazwa.toLowerCase()}.`}</title>
      {/* widok z góry */}
      <text x={12} y={16} className="t-sm t-mut">widok z góry</text>
      {o.pts ? <path d={path(o.pts)} className={`cutter ${poz === "ksztalt" || poz === "wielkosc" ? "is-acc" : ""}`} /> : <circle cx={cx} cy={cy} r={r} className="cutter" />}
      {o.pts ? <path d={path(o.pts)} fill="none" className={on(["ksztalt"])} /> : <circle cx={cx} cy={cy} r={r} fill="none" className={on(["ksztalt", "wielkosc"])} />}
      {(poz === "tolerancja" || poz === "wielkosc") && <circle cx={cx} cy={cy} r={r} className="p-cons" fill="none" />}
      {hole && <circle cx={cx} cy={cy} r={8} className={on("typ")} fill="var(--paper)" />}
      {poz === "lamacz" && o.pts && <path d={path(o.pts.map(([x, y]) => [cx + (x - cx) * 0.8, cy + (y - cy) * 0.8] as Pt))} className="p-acc" fill="none" strokeDasharray="4 3" />}
      {poz === "wielkosc" && o.pts && <line x1={o.pts[0][0]} y1={o.pts[0][1]} x2={o.pts[1][0]} y2={o.pts[1][1]} className="p-acc thick" />}
      {poz === "ksztalt" && o.angle > 0 && o.pts && (() => {
        const p1 = o.pts[1], pl = o.pts[o.pts.length - 1];
        const a1 = Math.atan2(ny - p1[1], p1[0] - nx), a2 = Math.atan2(ny - pl[1], pl[0] - nx);
        const R = 20, A = (q: number): Pt => [nx + R * Math.cos(q), ny - R * Math.sin(q)];
        const [sx, sy] = A(a1), [ex, ey] = A(a2);
        return <><path d={`M ${sx.toFixed(1)} ${sy.toFixed(1)} A ${R} ${R} 0 0 0 ${ex.toFixed(1)} ${ey.toFixed(1)}`} className="p-acc" fill="none" /><text x={nx + 26} y={ny + 4} className="t-acc t-b">{o.angle}°</text></>;
      })()}
      {poz === "naroze" && <><circle cx={nx} cy={ny} r={9} className="p-acc" fill="none" /><text x={nx - 4} y={ny - 14} className="t-acc t-b" textAnchor="middle">rε</text></>}
      {poz === "tolerancja" && <><text x={cx} y={cy + r + 14} textAnchor="middle" className="t-acc t-b">d</text><text x={nx - 2} y={ny + 16} className="t-acc t-b" textAnchor="middle">m</text></>}
      {poz === "wielkosc" && <text x={cx} y={cy + r + 14} textAnchor="middle" className="t-acc t-b">{shape === "R" ? "d" : "l"}</text>}
      {poz === "kierunek" && <><line x1={cx + 30} y1={146} x2={cx - 30} y2={146} className="p-acc" markerEnd={`url(#${idp}-a)`} /><text x={cx + 36} y={150} className="t-sm t-acc">{znaki.kierunek === "L" ? "posuw (płytka lewa)" : znaki.kierunek === "N" ? "posuw w obu kierunkach" : "posuw (płytka prawa)"}</text></>}
      {/* przekrój */}
      <text x={x0} y={16} className="t-sm t-mut">przekrój</text>
      <path d={path(sec)} className="cutter" />
      {hole && (cs
        ? <path d={`M ${(x0 + x1) / 2 - 12} ${y0} L ${(x0 + x1) / 2 - 6} ${y0 + 6} L ${(x0 + x1) / 2 - 6} ${csBoth ? y1 - 6 : y1} ${csBoth ? `L ${(x0 + x1) / 2 - 12} ${y1}` : ""} M ${(x0 + x1) / 2 + 12} ${y0} L ${(x0 + x1) / 2 + 6} ${y0 + 6} L ${(x0 + x1) / 2 + 6} ${csBoth ? y1 - 6 : y1} ${csBoth ? `L ${(x0 + x1) / 2 + 12} ${y1}` : ""}`} className={on("typ")} fill="none" />
        : <path d={`M ${(x0 + x1) / 2 - 8} ${y0} L ${(x0 + x1) / 2 - 8} ${y1} M ${(x0 + x1) / 2 + 8} ${y0} L ${(x0 + x1) / 2 + 8} ${y1}`} className={on("typ")} fill="none" />)}
      <path d={path(sec)} fill="none" className="p-con" />
      {cbTop && <path d={`M ${x0 + 4} ${y0} q 8 6 16 0 M ${x1 - 20} ${y0} q 8 6 16 0`} className={on(["typ", "lamacz"])} fill="none" />}
      {cbBot && <path d={`M ${x0 + off + 4} ${y1} q 8 -6 16 0 M ${x1 - off - 20} ${y1} q 8 -6 16 0`} className={on(["typ", "lamacz"])} fill="none" />}
      <line x1={x0} y1={y0} x2={x0 + off} y2={y1} className={on("przylozenie")} />
      {poz === "przylozenie" && <><line x1={x0} y1={y0} x2={x0} y2={y1 + 14} className="p-cons" /><text x={x0 - 6} y={y1 + 26} className="t-acc t-b" textAnchor="middle">{clear}°</text></>}
      {poz === "grubosc" && <><line x1={x1 + 8} y1={y0} x2={x1 + 8} y2={y1} className="p-acc" /><text x={x1 + 12} y={(y0 + y1) / 2 + 4} className="t-acc t-b">s</text></>}
      {poz === "tolerancja" && <text x={x1 + 12} y={(y0 + y1) / 2 + 4} className="t-acc t-b">s</text>}
      {poz === "krawedz" && <><circle cx={x0} cy={y0} r={10} className="p-acc" fill="none" /><text x={x0} y={y0 - 16} className="t-acc t-sm" textAnchor="middle">krawędź</text></>}
      {poz === "kierunek" && <defs><marker id={`${idp}-a`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L8 4 L0 8 Z" className="t-acc" style={{ fill: "var(--accent)" }} /></marker></defs>}
    </svg>
  );
}

export default function DekoderISO({ kod = "CNMG 120408" }: { kod?: string }) {
  const d = dekoduj(kod);
  const [sel, setSel] = useState(0);
  const idp = useId().replace(/:/g, "");
  if (d.blad || !d.znaki.length) return <div className="note note-warn" role="note">{d.blad}</div>;
  const z = d.znaki[Math.min(sel, d.znaki.length - 1)];
  const p = pozycja(z.poz);
  const map = Object.fromEntries(d.znaki.map((x) => [x.poz, x.s])) as Record<PozId, string | undefined>;
  return (
    <figure className="fig dekoder">
      <div className="dek-kod" role="group" aria-label={`Oznaczenie ${d.kod} — wybierz znak`}>
        {d.znaki.map((x, i) => {
          const q = pozycja(x.poz);
          return (
            <button key={x.poz} type="button" aria-pressed={i === sel} onClick={() => setSel(i)}
              className={`${x.poz === "wielkosc" || x.poz === "krawedz" ? "is-gap" : ""}${x.poz === "lamacz" ? " is-dash" : ""}`}
              aria-label={`${x.s} — pozycja ${q.nr}, ${q.nazwa.toLowerCase()}`}>
              <span className="dek-s">{x.s}</span>
              <span className="dek-nr" aria-hidden>{q.nr}</span>
            </button>
          );
        })}
      </div>
      <Rysunek znaki={map} poz={z.poz} idp={idp} />
      <div className="dek-opis" aria-live="polite">
        <p className="dek-poz">{p.nr}. {p.nazwa}{p.obowiazkowa ? "" : " — opcjonalnie"}</p>
        <p className="dek-odczyt"><b>{z.s}</b> — {z.odczyt ?? "znak spoza zestawienia; znaczenie podaje katalog producenta"}</p>
        <p className="dek-help">{p.opis}</p>
      </div>
      <figcaption className="cap">Wybierz znak oznaczenia, żeby zobaczyć jego znaczenie; rysunek poglądowy.</figcaption>
    </figure>
  );
}
