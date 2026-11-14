import type { ReactNode } from "react";

/*
  Rysunek poglądowy kalkulatora: pokazuje, czym są wpisane wielkości (D, ae, ap, f, rε, skok),
  i zmienia proporcje razem z nimi. To schemat, nie rysunek w skali — proporcje są ograniczone,
  żeby przy skrajnych wartościach rysunek pozostał czytelny. Kolory jak w rysunkach kursu:
  materiał szary, narzędzie pomarańczowe, wymiary jasnoszare, materiał zbierany — zielony.
*/
export type CalcFigProps =
  | { kind: "mill"; d: number; ae: number; ap: number; z: number }
  | { kind: "turn"; d: number; ap: number; f: number; re: number; rt: number }
  | { kind: "drill"; d: number; f: number }
  | { kind: "thread"; name: string; pitch: number; drill: number };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Number.isFinite(v) ? v : lo));
const n = (v: number) => String(Math.round(v * 1000) / 1000).replace(".", ",");

/** wymiar poziomy / pionowy ze strzałkami i opisem */
function HDim({ x1, x2, y, children, below }: { x1: number; x2: number; y: number; children: ReactNode; below?: boolean }) {
  return <g><path className="cf-dim" d={`M${x1} ${y}H${x2}`} markerStart="url(#cf-a)" markerEnd="url(#cf-a)" /><text x={(x1 + x2) / 2} y={below ? y + 14 : y - 6} textAnchor="middle">{children}</text></g>;
}
function VDim({ x, y1, y2, children, left, under }: { x: number; y1: number; y2: number; children: ReactNode; left?: boolean; under?: boolean }) {
  return (
    <g>
      <path className="cf-dim" d={`M${x} ${y1}V${y2}`} markerStart="url(#cf-a)" markerEnd="url(#cf-a)" />
      {under ? <text x={x} y={y2 + 15} textAnchor="middle">{children}</text> : <text x={left ? x - 7 : x + 7} y={(y1 + y2) / 2 + 4} textAnchor={left ? "end" : "start"}>{children}</text>}
    </g>
  );
}
const Ext = ({ d }: { d: string }) => <path className="cf-ext" d={d} />;

function Mill({ d, ae, ap, z }: Extract<CalcFigProps, { kind: "mill" }>) {
  const R = 40, k = clamp(ae / d, 0.06, 1), e = k * 2 * R; // zagłębienie freza w materiał w widoku z góry
  const top = 104, cx = 112, cy = top + e - R; // najniższy punkt freza leży na głębokości ae od krawędzi materiału
  const tw = 36, dp = clamp(ap / d, 0.08, 1.25) * tw, sw = k * tw, sl = 270; // widok wzdłuż posuwu: przekrój warstwy ae × ap
  const zz = clamp(Math.round(z), 1, 12), teeth = Array.from({ length: zz }, (_, i) => (i * 360) / zz);
  return (
    <>
      <text className="cf-cap" x="14" y="16">Z góry</text>
      <rect className="cf-stock" x="14" y={top} width="190" height="96" />
      <rect className="cf-gone" x="13" y={top - 1} width={cx - 13} height={e + 1} />
      <rect className="cf-cut" x={cx} y={top} width={204 - cx} height={e} />
      <circle className="cf-tool" cx={cx} cy={cy} r={R} />
      {teeth.map((a) => <path key={a} className="cf-tooth" d={`M${cx} ${cy}L${cx + R * Math.cos((a * Math.PI) / 180)} ${cy + R * Math.sin((a * Math.PI) / 180)}`} />)}
      <circle className="cf-dot" cx={cx} cy={cy} r="2" />
      <HDim x1={cx - R} x2={cx + R} y={Math.max(18, cy - R - 8)}>D {n(d)}</HDim>
      <Ext d={`M206 ${top}H228M206 ${top + e}H228`} />
      <VDim x={220} y1={top} y2={top + e} under>ae {n(ae)}</VDim>
      <path className="cf-edge" d={`M14 ${top + e}H${cx}`} />
      <text className="cf-feed-t" x="14" y="222">posuw Vf</text><path className="cf-feed" d="M76 218h40" markerEnd="url(#cf-f)" />

      <text className="cf-cap" x={sl - 26} y="16">Wzdłuż posuwu</text>
      <rect className="cf-stock" x={sl} y="120" width="64" height="76" />
      <rect className="cf-tool" x={sl + sw - tw} y="44" width={tw} height={76 + dp} rx="3" />
      <rect className="cf-cut" x={sl} y="120" width={sw} height={dp} />
      <Ext d={`M${sl + sw + 3} ${120 + dp}H${sl + sw + 20}`} />
      <VDim x={sl + sw + 14} y1={120} y2={120 + dp} under>ap {n(ap)}</VDim>
    </>
  );
}

function Turn({ d, ap, f, re, rt }: Extract<CalcFigProps, { kind: "turn" }>) {
  // widok z boku: przy uchwycie średnica przed przejściem, po prawej już stoczona; nóż idzie w lewo
  const R = 40, cy = 84, top = cy - R, a = clamp(ap / (d / 2), 0.3, 0.62) * R, sx = 196, ty = top + a;
  // powiększenie powierzchni: ślady naroża rε w odstępie f; wysokość wierzchołków rośnie z f² / (8 · rε)
  const p = 39, x0 = 160, by = 204, c = clamp((f / (8 * re)) * 160, 4, 18), r = ((p * p) / 4 + c * c) / (2 * c);
  const sc = `M${x0} ${by - c}` + [1, 2, 3, 4].map((i) => `A${r} ${r} 0 0 0 ${x0 + i * p} ${by - c}`).join("");
  return (
    <>
      <rect className="cf-chuck" x="14" y={top - 12} width="34" height={2 * R + 24} rx="3" />
      <path className="cf-stock" d={`M48 ${top}H${sx}V${ty}H330V${cy + R - a}H${sx}V${cy + R}H48Z`} />
      <rect className="cf-cut" x={sx - 56} y={top} width="56" height={a} />
      <path className="cf-axis" d={`M8 ${cy}H350`} />
      <path className="cf-tool" d={`M${sx} ${ty}L${sx - 3} ${ty - 22}V10H${sx + 30}V${ty - 10}Z`} />
      <VDim x={sx - 66} y1={top} y2={ty} left>ap {n(ap)}</VDim>
      <path className="cf-feed" d={`M${sx - 14} ${top - 14}h-36`} markerEnd="url(#cf-f)" /><text className="cf-feed-t" x={sx - 60} y={top - 10} textAnchor="end">posuw f {n(f)}</text>
      <VDim x={64} y1={top} y2={cy + R}>⌀ D {n(d)}</VDim>

      <text className="cf-cap" x="14" y="172">Powierzchnia</text>
      <text className="cf-cap" x="14" y="187">w powiększeniu</text>
      <text className="cf-sub" x="14" y="206">ślady naroża rε {n(re)}</text>
      <text className="cf-sub" x="14" y="221">co posuw f</text>
      <rect className="cf-zoom" x="150" y="146" width="200" height="82" rx="6" />
      <clipPath id="cf-z"><rect x="151" y="147" width="198" height="80" rx="5" /></clipPath>
      <g clipPath="url(#cf-z)">
        <path className="cf-fill" d={`${sc}V228H${x0}Z`} />
        <circle className="cf-nose" cx={x0 + 1.5 * p} cy={by - r} r={r} />
        <path className="cf-profile" d={sc} />
      </g>
      <Ext d={`M${x0 + 4 * p} ${by - c}h22M${x0 + 3.5 * p} ${by}h${22 + p / 2}`} />
      <path className="cf-rt" d={`M${x0 + 4 * p + 16} ${by}V168`} />
      <HDim x1={x0 + 2 * p} x2={x0 + 3 * p} y={by - c - 9}>f</HDim>
      <text className="cf-acc" x="344" y="163" textAnchor="end">Rt {n(Math.round(rt * 100) / 100)} µm</text>
    </>
  );
}

function Drill({ d, f }: Extract<CalcFigProps, { kind: "drill" }>) {
  const w = clamp(d * 4.5, 26, 70), cx = 134, top = 96, depth = 78, tip = (w / 2) * 0.6; // wierzchołek ok. 118°
  return (
    <>
      <rect className="cf-stock" x="24" y={top} width="220" height="120" />
      <path className="cf-cut" d={`M${cx - w / 2} ${top}V${top + depth}L${cx} ${top + depth + tip}L${cx + w / 2} ${top + depth}V${top}Z`} />
      <path className="cf-tool" d={`M${cx - w / 2} 22V${top + depth}L${cx} ${top + depth + tip}L${cx + w / 2} ${top + depth}V22Z`} />
      <path className="cf-tooth" d={`M${cx - w / 2} 46L${cx + w / 2} 72M${cx - w / 2} 82L${cx + w / 2} 108M${cx - w / 2} 118L${cx + w / 2} 144`} />
      <path className="cf-axis" d={`M${cx} 10V226`} />
      <path className="cf-dim" d={`M${cx - w / 2} ${top - 8}H${cx + w / 2}`} markerStart="url(#cf-a)" markerEnd="url(#cf-a)" />
      <text x={cx + w / 2 + 10} y={top - 4}>⌀ D {n(d)}</text>
      <path className="cf-feed" d="M262 106v40" markerEnd="url(#cf-f)" /><text className="cf-feed-t" x="272" y="124">posuw f</text><text className="cf-feed-t" x="272" y="139">{n(f)} mm/obr</text>
      <path className="cf-rot" d={`M${cx - 20} 16a20 7 0 1 0 40 0`} markerEnd="url(#cf-f)" />
    </>
  );
}

function Thread({ name, pitch, drill }: Extract<CalcFigProps, { kind: "thread" }>) {
  const nom = Number(name.slice(1)), cx = 150, rn = 62, rd = clamp(drill / nom, 0.6, 0.95) * rn, top = 50, ph = 22, k = 6;
  const zig = (side: 1 | -1) => Array.from({ length: k }, (_, i) => `L${cx + side * rn} ${top + i * ph + ph / 2}L${cx + side * rd} ${top + (i + 1) * ph}`).join("");
  return (
    <>
      <rect className="cf-stock" x="40" y={top} width="220" height={k * ph} />
      <path className="cf-hole" d={`M${cx - rd} ${top}${zig(-1)}H${cx + rd}${Array.from({ length: k }, (_, i) => `L${cx + rn} ${top + (k - i) * ph - ph / 2}L${cx + rd} ${top + (k - i - 1) * ph}`).join("")}Z`} />
      <path className="cf-axis" d={`M${cx} 30V${top + k * ph + 14}`} />
      <Ext d={`M${cx - rd} ${top}V26M${cx + rd} ${top}V26`} />
      <HDim x1={cx - rd} x2={cx + rd} y={32}>otwór ⌀{n(drill)}</HDim>
      <Ext d={`M${cx - rn} ${top + k * ph - ph / 2}V${top + k * ph + 26}M${cx + rn} ${top + k * ph - ph / 2}V${top + k * ph + 26}`} />
      <HDim x1={cx - rn} x2={cx + rn} y={top + k * ph + 20} below>{name}</HDim>
      <Ext d={`M${cx + rn + 4} ${top + ph / 2}H300M${cx + rn + 4} ${top + ph * 1.5}H300`} />
      <VDim x={292} y1={top + ph / 2} y2={top + ph * 1.5}>skok {n(pitch)}</VDim>
    </>
  );
}

const ALT: Record<CalcFigProps["kind"], string> = {
  mill: "Schemat frezowania: średnica freza D i szerokość skrawania ae w widoku z góry, głębokość ap w widoku wzdłuż posuwu",
  turn: "Schemat toczenia: średnica D, głębokość ap, posuw f oraz powiększenie powierzchni z wysokością nierówności Rt",
  drill: "Schemat wiercenia: średnica wiertła D i posuw na obrót f",
  thread: "Przekrój otworu gwintowanego: średnica otworu pod gwintownik, średnica nominalna i skok",
};

export default function CalcFig(p: CalcFigProps) {
  return (
    <figure className="calc-card calc-fig">
      <h2 className="calc-h">Podgląd</h2>
      <svg viewBox="0 0 360 236" role="img" aria-label={ALT[p.kind]}>
        <defs>
          <marker id="cf-a" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L8 4L0 8Z" className="cf-arrow" /></marker>
          <marker id="cf-f" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L8 4L0 8Z" className="cf-arrow-f" /></marker>
        </defs>
        {p.kind === "mill" ? <Mill {...p} /> : p.kind === "turn" ? <Turn {...p} /> : p.kind === "drill" ? <Drill {...p} /> : <Thread {...p} />}
      </svg>
      <figcaption>Schemat, nie rysunek w skali. Proporcje zmieniają się z wpisanymi wartościami.</figcaption>
    </figure>
  );
}
