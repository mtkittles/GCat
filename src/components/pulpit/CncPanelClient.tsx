"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import StatusLed from "@/components/tactile/StatusLed";
import TactileSegmentedControl from "@/components/tactile/TactileSegmentedControl";
import GcodeLine from "./gcodeTokens";
import { useTactileFeedback } from "@/lib/ui/useTactileFeedback";

/*
  Mini-pulpit: przełączniki (sterowanie, operacja, warstwa G00) → kod operacji w wybranym języku
  i opis technologiczny → tor na rysunku detalu 80 × 50. Na telefonie trzy zakładki.
  Liczby w opisach pochodzą wprost z bloków programu (src/content/homeDemo.ts).
*/
export type PanelLine = { n: number; raw: string };
export type PanelSeg = { kind: "rapid" | "linear" | "arc"; ch: number; d: string | null; hole?: boolean; x: number; y: number };
type Dialect = "fanuc" | "sinumerik";

const OPS: { key: string; name: string; tool: string; text: string[]; fanuc: string; sinumerik: string; warn?: string }[] = [
  {
    key: "01", name: "Kontur R10", tool: "T01 · frez ⌀10 · Z−3",
    text: [
      "Bez korekcji promienia (G40) zaprogramowany kontur 80 × 50 jest torem środka freza. Frez ⌀10 zbiera po 5 mm z obu stron toru, więc płytka po obróbce ma 70 × 40, a naroża R5.",
    ],
    fanuc: "naroża łukiem G03 z promieniem R10.",
    sinumerik: "naroża łukiem G3 z promieniem CR=10.",
    warn: "G40 — wymiar detalu = tor − średnica freza",
  },
  {
    key: "02", name: "Kieszeń ⌀30", tool: "T01 · frez ⌀10 · Z−2",
    text: [
      "Wejście w środku X40 Y25, potem dwa pełne okręgi zgodnie z ruchem wskazówek zegara. I, J to wektor od punktu startu łuku do środka: I6 daje promień toru 6, I10 — promień 10.",
      "Średnica kieszeni = 2 · (10 + 5) = 30 mm: promień toru plus promień freza.",
    ],
    fanuc: "pełny okrąg to G02 z samym środkiem (I6 J0) — punkt końcowy = punkt startu.",
    sinumerik: "pełny okrąg to G2 z punktem końcowym równym punktowi startu (X34 Y25 I6 J0).",
  },
  {
    key: "03", name: "Rowki", tool: "T01 · frez ⌀10 · Z−2",
    text: [
      "Tor środka X8 → X18 i X62 → X72 na Y25. Szerokość rowka = średnica freza = 10 mm; po konturze z operacji 01 oba rowki wychodzą na krawędź płytki.",
      "Między rowkami G00 na Z5 — przejazd szybki ponad materiałem.",
    ],
    fanuc: "ruchy G00 / G01, posuw F350 w bloku skrawania.",
    sinumerik: "ruchy G0 / G1 — zwykle bez zera wiodącego; zapis G00 i G01 też jest poprawny.",
  },
  {
    key: "04", name: "Otwory G81", tool: "T02 · wiertło ⌀6 · Z−14",
    text: [
      "Cztery otwory w rozstawie 56 × 30 (X12 / X68, Y10 / Y40). Z−14 to położenie wierzchołka wiertła na dnie otworu.",
    ],
    fanuc: "G99 G81 … R2 — po każdym otworze powrót na płaszczyznę R (Z2). Kolejne bloki podają tylko zmienioną współrzędną, G80 kasuje cykl.",
    sinumerik: "MCALL CYCLE81(RTP, RFP, SDIS, DP) = (2, 0, 2, −14) — wywołanie modalne wierci w każdym następnym punkcie, puste MCALL je kasuje.",
  },
];

const KIND = { rapid: "is-rap", linear: "is-cut", arc: "is-arc" } as const;
type Tab = "pulpit" | "kod" | "tor";

export default function CncPanelClient({ segs, box, code, simHref }: {
  segs: PanelSeg[];
  box: { minX: number; minY: number; maxX: number; maxY: number };
  code: Record<Dialect, PanelLine[][]>;
  simHref: string;
}) {
  const [dialect, setDialect] = useState<Dialect>("fanuc");
  const [op, setOp] = useState(0);
  const [rapids, setRapids] = useState(true);
  const [tab, setTab] = useState<Tab>("pulpit");
  const feedback = useTactileFeedback();
  const o = OPS[op];

  const pad = 9;
  const vb = `${box.minX - pad} ${-box.maxY - pad} ${box.maxX - box.minX + 2 * pad} ${box.maxY - box.minY + 2 * pad}`;
  const dialectName = dialect === "fanuc" ? "Fanuc" : "Sinumerik";

  return (
    <section className="cp" aria-labelledby="cp-title">
      <header className="cp-bar">
        <span className="cp-tag">Pulpit</span>
        <h2 id="cp-title" className="cp-title">Płytka mocująca 80 × 50 — jeden program, cztery operacje</h2>
        <span className="cp-status"><StatusLed state="ready" />{dialectName} · gotowy</span>
      </header>

      <div className="cp-tabs">
        <TactileSegmentedControl<Tab> label="Widok pulpitu" value={tab} onChange={setTab} full size="sm"
          options={[{ value: "pulpit", label: "Pulpit" }, { value: "kod", label: "Kod" }, { value: "tor", label: "Tor 2D" }]} />
      </div>

      <div className="cp-body">
        {/* przełączniki */}
        <div className={`cp-col cp-ctl${tab === "pulpit" ? " is-tab" : ""}`}>
          <p className="cp-k">Sterowanie</p>
          <TactileSegmentedControl<Dialect> label="Język sterowania" value={dialect} onChange={setDialect} full
            options={[{ value: "fanuc", label: "Fanuc / ISO" }, { value: "sinumerik", label: "Sinumerik" }]} />

          <p className="cp-k">Operacja</p>
          <div className="cp-ops" role="radiogroup" aria-label="Operacja">
            {OPS.map((x, k) => (
              <button key={x.key} type="button" role="radio" aria-checked={k === op} className={`cp-op${k === op ? " is-on" : ""}`}
                onClick={() => { if (k !== op) { feedback(); setOp(k); } }}>
                <StatusLed state={k === op ? "on" : "idle"} pulse={false} />
                <span className="cp-op-n">{x.key}</span>
                <span className="cp-op-t">{x.name}<small>{x.tool}</small></span>
              </button>
            ))}
          </div>

          <p className="cp-k">Warstwa</p>
          <button type="button" role="switch" aria-checked={rapids} className={`cp-sw${rapids ? " is-on" : ""}`}
            onClick={() => { feedback(); setRapids((v) => !v); }}>
            <StatusLed state={rapids ? "warning" : "idle"} pulse={false} />
            <span><b>G00</b> Ruchy szybkie</span>
            <span className="cp-sw-v">{rapids ? "WŁ" : "WYŁ"}</span>
          </button>
        </div>

        {/* kod i opis */}
        <div className={`cp-col cp-code${tab === "kod" ? " is-tab" : ""}`}>
          <div className="cp-ed" aria-label={`Kod operacji ${o.key} — ${dialectName}`}>
            <div className="cp-ed-bar"><span>{o.key} · {o.name}</span><span>{dialectName}</span></div>
            <ol className="cp-lines" tabIndex={0} aria-label={`Bloki operacji ${o.key}`}>
              {code[dialect][op].map((l) => (
                <li key={l.n}><span className="cp-ln">{String(l.n).padStart(2, "0")}</span><code><GcodeLine raw={l.raw} /></code></li>
              ))}
            </ol>
          </div>
          <div className="cp-desc">
            <p className="cp-k">Opis technologiczny</p>
            {o.text.map((t) => <p key={t}>{t}</p>)}
            <p className="cp-diff"><b>{dialectName}:</b> {dialect === "fanuc" ? o.fanuc : o.sinumerik}</p>
            {o.warn && <p className="cp-warn"><StatusLed state="warning" />{o.warn}</p>}
          </div>
        </div>

        {/* tor */}
        <div className={`cp-col cp-view${tab === "tor" ? " is-tab" : ""}`}>
          <div className="cp-svg bg-cnc-grid">
            <svg viewBox={vb} role="img" aria-label={`Tor narzędzia w XY, operacja ${o.key}: ${o.name}`}>
              <rect x="-5" y="-55" width="90" height="60" rx="1" className="cp-stock" />
              {op === 0 && <rect x="5" y="-45" width="70" height="40" rx="5" className="cp-part" />}
              {/* inne operacje: tylko skrawanie, bez przejazdów G00 — ukośne przejazdy przecinały detal (V3) */}
              {segs.map((s, i) => s.d && s.ch !== op && s.kind !== "rapid" && <path key={`g${i}`} d={s.d} className="cp-ghost" />)}
              <g key={`${op}-${rapids}`} className="cp-live">
                {op < 3 && <path d={segs.filter((s) => s.d && s.ch === op && s.kind !== "rapid").map((s) => s.d).join("")} className="cp-swath" />}
                {segs.map((s, i) => s.d && s.ch === op && (s.kind !== "rapid" || rapids) && <path key={i} d={s.d} pathLength={1} className={`cp-path ${KIND[s.kind]}`} />)}
              </g>
              {segs.map((s, i) => s.hole && <circle key={`h${i}`} cx={s.x} cy={-s.y} r="3" className={op === 3 ? "cp-hole is-on" : "cp-hole"} />)}
              <g className="cp-zero"><circle r="1.4" /><path d="M-3 0H3M0 -3V3" /><text x="2" y="6">X0 Y0</text></g>
            </svg>
          </div>
          <div className="cp-view-foot">
            <ul className="cp-legend">
              <li className="is-rap">G00</li><li className="is-cut">G01</li><li className="is-arc">G02/G03</li><li className="is-sw">ślad freza ⌀10</li>{op === 0 && <li className="is-part">detal 70 × 40</li>}
            </ul>
            <Link href={simHref} className="btn cp-sim">Otwórz w symulatorze <ArrowRight aria-hidden /></Link>
          </div>
          {dialect === "sinumerik" && <p className="cp-note">Symulator czyta zapis ISO — otworzy ten program w wersji Fanuc.</p>}
        </div>
      </div>
    </section>
  );
}
