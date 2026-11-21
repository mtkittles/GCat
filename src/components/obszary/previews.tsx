"use client";
import { useId } from "react";
import { useTicker } from "./live";

/*
  Podglądy „żywych kart” (pulpit i Technologia). Rysunki schematyczne — bez wymiarów do odczytu; liczby, które
  pokazują (obroty, oznaczenie płytki, twardość), wynikają ze wzoru albo z danych artykułów. Kolory z klas pv-* (obszary.css):
  akcent, tekst, linie i kolory ruchu G00/G01/G02-G03. Ruch tylko pod [data-live] i przy `live` (useLive).
*/

/* ---------- pulpit: obszary ---------- */

/** Programowanie CNC: kontur z korekcją promienia rysowany po torze + bloki programu w kolorach ruchu. */
export function CncPreview() {
  return (
    <svg viewBox="0 0 560 190" preserveAspectRatio="xMidYMid meet" aria-hidden>
      <rect x="150" y="40" width="220" height="110" rx="14" className="pv-part" />
      <path d="M60 165V24H130" className="pv-g0 pv-dash" />
      <path className="pv-g1 pv-trace" pathLength={100}
        d="M130 24V60H150v76a14 14 0 0 0 14 14h192a14 14 0 0 0 14-14V54a14 14 0 0 0-14-14H164a14 14 0 0 0-14 14" />
      <g className="pv-code">
        <text x="396" y="58" className="pv-t-mut">N30 G41 D1</text>
        <text x="396" y="80" className="pv-t-g1">N40 G01 Y136.</text>
        <text x="396" y="102" className="pv-t-g2">N50 G03 X164.</text>
        <text x="396" y="124" className="pv-t-g2">  Y150. R14.</text>
        <text x="396" y="146" className="pv-t-g1">N60 G01 X356.</text>
      </g>
    </svg>
  );
}

/** Frez trzpieniowy z przesuwającymi się rowkami (obrót) — wspólny dla Technologii na pulpicie i karty Narzędzia. */
function MillBody({ x, y, w, h, cut }: { x: number; y: number; w: number; h: number; cut: string }) {
  const n = Math.ceil((w + h) / 24) + 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} className="pv-tool" />
      <clipPath id={cut}><rect x={x} y={y} width={w} height={h} /></clipPath>
      <g clipPath={`url(#${cut})`}>
        <g className="pv-flutes">
          {Array.from({ length: n }, (_, i) => <path key={i} d={`M${x - h - 24 + i * 24} ${y}l${h} ${h}`} className="pv-ink2" />)}
        </g>
      </g>
      <path d={`M${x + w} ${y}v${h}`} className="pv-edge" />
    </g>
  );
}

export function TechPreview() {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 560 190" preserveAspectRatio="xMidYMid meet" aria-hidden>
      <path d="M30 95h500" className="pv-axis" />
      <path d="M60 74h150v42H60z" className="pv-shank" />
      <path d="M210 80h32v30h-32z" className="pv-shank" />
      <MillBody x={242} y={66} w={220} h={58} cut={`m${id}`} />
    </svg>
  );
}

/** Pomiar i jakość: ramka tolerancji położenia i wymiar z tolerancją. */
export function PomiarPreview() {
  return (
    <svg viewBox="0 0 560 190" preserveAspectRatio="xMidYMid meet" aria-hidden>
      <g className="pv-ink2-s">
        <rect x="110" y="70" width="168" height="34" fill="none" />
        <path d="M150 70v34M240 70v34" />
      </g>
      <g className="pv-code pv-t-ink2" style={{ fontSize: 15 }}>
        <text x="121" y="93">⌖</text><text x="160" y="93">⌀0,05</text><text x="253" y="93">A</text>
      </g>
      <path d="M330 130h140M330 140V80M470 140V80" className="pv-mut-s" />
      <path d="m330 130 8-4v8zm140 0-8-4v8z" className="pv-mut-f" />
      <text x="400" y="122" textAnchor="middle" className="pv-code pv-t-ink2" style={{ fontSize: 14 }}>40 ±0,02</text>
    </svg>
  );
}

/* ---------- Technologia: karty działów ---------- */

const PARTS = ["chwyt", "szyjka", "część robocza", "ostrze czołowe"];

/** Narzędzia: frez z odnośnikami 1–4 podświetlanymi po kolei. */
export function MillParts({ live }: { live: boolean }) {
  const id = useId().replace(/:/g, "");
  const p = useTicker(live, 1400, PARTS.length);
  const call = (i: number, x: number, y1: number, y2: number, cy: number) => (
    <g key={i} className={p === i ? "pv-call is-on" : "pv-call"}>
      <line x1={x} y1={y1} x2={x} y2={y2} />
      <circle cx={x} cy={cy} r="10" />
      <text x={x} y={cy + 4} textAnchor="middle">{i + 1}</text>
    </g>
  );
  return (
    <div className="pv-mill">
      <div className="well pv-mill-fig">
        <svg viewBox="0 0 420 200" preserveAspectRatio="xMidYMid meet" aria-hidden>
          <path d="M14 100h392" className="pv-axis" />
          <path d="M28 82h118v36H28z" className="pv-shank" />
          <path d="M146 87h28v26h-28z" className="pv-shank" />
          <MillBody x={174} y={72} w={196} h={56} cut={`p${id}`} />
          <g className="pv-code">
            {call(0, 86, 46, 82, 36)}
            {call(1, 160, 46, 87, 36)}
            {call(2, 250, 46, 72, 36)}
            {call(3, 370, 152, 128, 162)}
          </g>
          <path d="M174 184h196" className="pv-mut-s" />
          <text x="272" y="197" textAnchor="middle" className="pv-code pv-t-mut">część robocza</text>
        </svg>
      </div>
      <ol className="pv-parts" aria-hidden>
        {PARTS.map((t, i) => <li key={t} className={p === i ? "is-on" : undefined}><b>{i + 1}</b>{t}</li>)}
      </ol>
    </div>
  );
}

/* Oznaczenie płytki według ISO 1832 — przykład CNMG 120408 (pozycje: kształt, kąt przyłożenia, tolerancja, otwór i łamacz, krawędź, grubość, promień naroża). */
const ISO: [string, string][] = [
  ["C", "kształt: romb 80°"], ["N", "kąt przyłożenia 0°"], ["M", "klasa tolerancji"], ["G", "otwór i łamacz wióra"],
  ["12", "długość krawędzi skrawającej"], ["04", "grubość płytki"], ["08", "promień naroża 0,8 mm"],
];
export function IsoDecoder({ live }: { live: boolean }) {
  const i = useTicker(live, 1500, ISO.length);
  return (
    <div className="pv-iso" aria-hidden>
      <div className="pv-iso-row">
        {ISO.map(([c], k) => <span key={k} className={`${k === i ? "is-on" : ""}${k === 4 ? " is-gap" : ""}`}>{c}</span>)}
      </div>
      <p className="pv-cap"><b>{ISO[i][0]}</b> — {ISO[i][1]}</p>
    </div>
  );
}

/** Obliczenia: wyświetlacz obrotów n = 1000·Vc/(π·D) dla Vc = 150 m/min i średnic 6…24 mm. */
const DS = [6, 8, 10, 12, 16, 20, 24, 20, 16, 12, 10, 8];
export const rpm = (vc: number, d: number) => Math.round((1000 * vc) / (Math.PI * d));
export function RpmDro({ live }: { live: boolean }) {
  const d = DS[useTicker(live, 1100, DS.length) % DS.length] ?? 10;
  return (
    <div className="pv-dro-wrap" aria-hidden>
      <div className="pv-dro"><b>n</b><span className="pv-dro-v">{rpm(150, d).toLocaleString("pl-PL")}</span><small>⌀{d} · Vc 150</small></div>
      <p className="pv-cap pv-mono">n = 1000 · Vc / (π · D)</p>
    </div>
  );
}

/** Proces: nóż, materiał i zwijający się wiór. */
export function ChipPreview() {
  return (
    <div className="well pv-strip" aria-hidden>
      <svg viewBox="0 0 220 86" preserveAspectRatio="xMidYMid meet">
        <path d="M10 70h120" className="pv-mut-s" />
        <path d="M10 70V56h90" className="pv-ln-s" />
        <path d="m100 56 18 14" className="pv-ink2" />
        <path d="m118 70 8-38 26-4z" className="pv-shank" />
        <path className="pv-a pv-trace" pathLength={100} style={{ ["--dur" as string]: "3.5s" }} d="M114 52c-4-18 14-30 28-20s4 26-10 20-4-20 8-14" />
        <text x="164" y="76" className="pv-code pv-t-mut">wiór</text>
      </svg>
    </div>
  );
}

/** Mocowanie: czujnik zegarowy przy pomiarze bicia. */
export function RunoutPreview() {
  return (
    <div className="well pv-strip" aria-hidden>
      <svg viewBox="0 0 220 86" preserveAspectRatio="xMidYMid meet">
        <path d="M30 62a30 30 0 0 1 60 0" className="pv-dial" />
        <line x1="60" y1="62" x2="60" y2="32" className="pv-needle" />
        <circle cx="60" cy="62" r="4" className="pv-hub" />
        <text x="110" y="44" className="pv-code pv-t-ink2">bicie</text>
        <text x="110" y="62" className="pv-code pv-t-mut">czujnik zegarowy</text>
      </svg>
    </div>
  );
}

/** Materiały: zakresy twardości HV z artykułu „Materiały narzędziowe” (wykres tech-twardosc). */
export function HardnessBars({ rows, max }: { rows: [string, number, number][]; max: number }) {
  return (
    <div className="pv-hv" aria-hidden>
      {rows.map(([n, a, b], i) => (
        <div key={n} className="pv-hv-row">
          <span>{n}</span>
          <span className="pv-hv-track"><i style={{ left: `${(a / max) * 100}%`, width: `${((b - a) / max) * 100}%`, animationDelay: `${i * .1}s` }} /></span>
        </div>
      ))}
      <p className="pv-cap pv-mono">twardość · 0–{max / 1000} tys. HV</p>
    </div>
  );
}

/** Strategie: tor trochoidalny (cykloida wydłużona: x = a·t − b·sin t, y = −b·cos t, b > a daje pętle). */
const TROCHOID = (() => {
  const a = 8, b = 22, pts: string[] = [];
  for (let t = 0; t <= 16 * Math.PI + 1e-9; t += 0.15) pts.push(`${(24 + a * t - b * Math.sin(t)).toFixed(1)} ${(43 - b * Math.cos(t)).toFixed(1)}`);
  return `M${pts.join("L")}`;
})();
export function TrochoidPreview() {
  return (
    <div className="well pv-strip" aria-hidden>
      <svg viewBox="0 0 460 86" preserveAspectRatio="xMidYMid meet">
        <path d="M10 76h440" className="pv-mut-s" />
        <path className="pv-g1 pv-trace" pathLength={100} style={{ ["--dur" as string]: "7s" }} d={TROCHOID} />
      </svg>
    </div>
  );
}
