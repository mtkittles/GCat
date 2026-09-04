import type { ReactNode } from "react";

/*
  Wspólny układ dla wszystkich schematów w serwisie:
  – siatka co 10 jednostek, osie X/Y zaznaczone i opisane,
  – jedna paleta: pomarańczowy = ruch szybki i wymiary pomocnicze,
    zielony = ruch roboczy, niebieski = łuk i konstrukcja,
    czerwony = błąd lub wariant odrzucony, ciemny = materiał i kontur detalu.
*/

const C = {
  grid: "var(--line)",
  axis: "var(--muted)",
  ink: "var(--ink)",
  rapid: "var(--amber)",
  cut: "var(--green)",
  arc: "var(--blue)",
  bad: "var(--red)",
  stock: "color-mix(in srgb, var(--muted) 12%, transparent)",
} as const;

export interface Mapper {
  X: (v: number) => number;
  Y: (v: number) => number;
  u: number;
}

interface PlotProps {
  children: (m: Mapper) => ReactNode;
  range: [number, number, number, number];
  caption: string;
  title?: string;
  height?: number;
  xLabel?: string;
  yLabel?: string;
  step?: number;
}

export function Plot({ children, range, caption, title, height = 250, xLabel = "X", yLabel = "Y", step = 10 }: PlotProps) {
  const [x0, x1, y0, y1] = range;
  const pad = 36;
  const W = 560, H = height;
  const s = Math.min((W - pad * 2) / (x1 - x0), (H - pad * 2) / (y1 - y0));
  const ox = pad + ((W - pad * 2) - (x1 - x0) * s) / 2;
  const oy = H - pad - ((H - pad * 2) - (y1 - y0) * s) / 2;
  const X = (v: number) => ox + (v - x0) * s;
  const Y = (v: number) => oy - (v - y0) * s;

  const gridX: number[] = [], gridY: number[] = [];
  for (let v = Math.ceil(x0 / step) * step; v <= x1; v += step) gridX.push(v);
  for (let v = Math.ceil(y0 / step) * step; v <= y1; v += step) gridY.push(v);

  return (
    <figure className="grid gap-1 diagram">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full bg-card border border-line rounded-md" role="img" aria-label={caption}>
        <defs>
          <marker id="arw" markerWidth={9} markerHeight={9} refX={7} refY={4.5} orient="auto"><path d="M0 1 L8 4.5 L0 8 z" fill="currentColor" /></marker>
          <marker id="dot" markerWidth={6} markerHeight={6} refX={3} refY={3}><circle cx={3} cy={3} r={2} fill="currentColor" /></marker>
        </defs>

        {title && <text x={12} y={18} fill={C.ink} fontSize={13} fontWeight={700}>{title}</text>}

        <g stroke={C.grid} strokeWidth={1} opacity={0.7}>
          {gridX.map((v) => <line key={`gx${v}`} x1={X(v)} y1={Y(y0)} x2={X(v)} y2={Y(y1)} />)}
          {gridY.map((v) => <line key={`gy${v}`} x1={X(x0)} y1={Y(v)} x2={X(x1)} y2={Y(v)} />)}
        </g>

        <g stroke={C.axis} strokeWidth={1.5} color={C.axis}>
          <line x1={X(x0)} y1={Y(0)} x2={X(x1)} y2={Y(0)} markerEnd="url(#arw)" />
          <line x1={X(0)} y1={Y(y0)} x2={X(0)} y2={Y(y1)} markerEnd="url(#arw)" />
        </g>
        <text x={X(x1) - 4} y={Y(0) + 17} fill={C.axis} fontSize={12} fontWeight={700} textAnchor="end">{xLabel}</text>
        <text x={X(0) + 7} y={Y(y1) + 12} fill={C.axis} fontSize={12} fontWeight={700}>{yLabel}</text>

        <g fill={C.axis} fontSize={9} fontFamily="var(--font-mono)">
          {gridX.filter((v) => v !== 0).map((v) => <text key={`lx${v}`} x={X(v)} y={Y(0) + 13} textAnchor="middle">{v}</text>)}
          {gridY.filter((v) => v !== 0).map((v) => <text key={`ly${v}`} x={X(0) - 5} y={Y(v) + 3.5} textAnchor="end">{v}</text>)}
          <text x={X(0) - 5} y={Y(0) + 13} textAnchor="end">0</text>
        </g>

        {children({ X, Y, u: s })}
      </svg>
      <figcaption className="cap">{caption}</figcaption>
      <div className="diagram-legend">
        <span><i style={{ background: C.rapid }} />wymiar / szybki przejazd</span>
        <span><i style={{ background: C.cut }} />ruch roboczy</span>
        <span><i style={{ background: C.arc }} />łuk i konstrukcja</span>
        <span><i style={{ background: C.ink }} />kontur detalu</span>
      </div>
    </figure>
  );
}

const ArcIJ = () => (
  <Plot range={[-5, 75, -5, 55]} title="Łuk: I/J kontra R"
    caption="Z punktu A(20,20) do B(50,50) promieniem 30. Wektor I/J prowadzi od punktu startu do środka S(50,20): I = 50 − 20 = 30, J = 20 − 20 = 0. Zapis promieniowy R30 wybiera łuk krótszy (niebieski), R−30 — dłuższy (czerwony przerywany).">
    {({ X, Y, u }) => (
      <g>
        <circle cx={X(50)} cy={Y(20)} r={30 * u} fill="none" stroke={C.arc} strokeWidth={1} strokeDasharray="3 4" opacity={0.45} />
        <path d={`M ${X(20)} ${Y(20)} A ${30 * u} ${30 * u} 0 0 0 ${X(50)} ${Y(50)}`} fill="none" stroke={C.arc} strokeWidth={3.5} color={C.arc} markerEnd="url(#arw)" />
        <path d={`M ${X(20)} ${Y(20)} A ${30 * u} ${30 * u} 0 1 1 ${X(50)} ${Y(50)}`} fill="none" stroke={C.bad} strokeWidth={1.8} strokeDasharray="6 4" />
        <line x1={X(20)} y1={Y(20)} x2={X(50)} y2={Y(20)} stroke={C.rapid} strokeWidth={1.6} color={C.rapid} markerStart="url(#dot)" markerEnd="url(#arw)" />
        <text x={X(35)} y={Y(20) - 7} fill={C.rapid} fontSize={12} textAnchor="middle" fontFamily="var(--font-mono)" fontWeight={700}>I = +30</text>
        <text x={X(52)} y={Y(16)} fill={C.rapid} fontSize={11} fontFamily="var(--font-mono)">J = 0</text>
        <circle cx={X(20)} cy={Y(20)} r={4.5} fill={C.ink} />
        <text x={X(19)} y={Y(20) - 9} fill={C.ink} fontSize={12} fontWeight={700} textAnchor="end">A (20,20)</text>
        <circle cx={X(50)} cy={Y(50)} r={4.5} fill={C.ink} />
        <text x={X(51)} y={Y(50) - 5} fill={C.ink} fontSize={12} fontWeight={700}>B (50,50)</text>
        <circle cx={X(50)} cy={Y(20)} r={3.5} fill={C.arc} />
        <text x={X(52)} y={Y(20) + 14} fill={C.arc} fontSize={11} fontFamily="var(--font-mono)">S (50,20)</text>
        <text x={X(-3)} y={Y(52)} fill={C.arc} fontSize={11} fontFamily="var(--font-mono)">G03 X50 Y50 I30 J0</text>
        <text x={X(-3)} y={Y(47)} fill={C.arc} fontSize={11} fontFamily="var(--font-mono)">G03 X50 Y50 R30</text>
        <text x={X(-3)} y={Y(42)} fill={C.bad} fontSize={11} fontFamily="var(--font-mono)">G03 X50 Y50 R−30</text>
      </g>
    )}
  </Plot>
);

const Comp = () => (
  <Plot range={[-15, 78, -14, 56]} title="G41 / G42 — po której stronie konturu"
    caption="Kontur detalu na ciemno, tor środka narzędzia na zielono, okrąg pokazuje frez. Patrząc w kierunku ruchu (strzałka w prawo): przy G41 narzędzie jest po lewej stronie konturu, przy G42 po prawej. Odsunięcie równa się promieniowi r z rejestru korekcji.">
    {({ X, Y, u }) => (
      <g>
        <rect x={X(0)} y={Y(40)} width={60 * u} height={40 * u} fill={C.stock} stroke={C.ink} strokeWidth={2.5} />
        <text x={X(30)} y={Y(20)} fill={C.ink} fontSize={12} textAnchor="middle">kontur detalu</text>
        <line x1={X(0)} y1={Y(48)} x2={X(58)} y2={Y(48)} stroke={C.cut} strokeWidth={2.8} color={C.cut} markerEnd="url(#arw)" />
        <circle cx={X(28)} cy={Y(48)} r={8 * u} fill="none" stroke={C.cut} strokeWidth={1.5} strokeDasharray="3 3" />
        <text x={X(0)} y={Y(51)} fill={C.cut} fontSize={12} fontWeight={700}>G41 — narzędzie z lewej</text>
        <line x1={X(0)} y1={Y(32)} x2={X(58)} y2={Y(32)} stroke={C.cut} strokeWidth={2.8} color={C.cut} markerEnd="url(#arw)" opacity={0.7} />
        <circle cx={X(28)} cy={Y(32)} r={8 * u} fill="none" stroke={C.cut} strokeWidth={1.5} strokeDasharray="3 3" opacity={0.7} />
        <text x={X(0)} y={Y(27)} fill={C.cut} fontSize={12} fontWeight={700} opacity={0.85}>G42 — narzędzie z prawej</text>
        <line x1={X(52)} y1={Y(40)} x2={X(52)} y2={Y(48)} stroke={C.rapid} strokeWidth={1.5} color={C.rapid} markerStart="url(#dot)" markerEnd="url(#arw)" />
        <text x={X(53)} y={Y(43)} fill={C.rapid} fontSize={12} fontFamily="var(--font-mono)" fontWeight={700}>r</text>
        <text x={X(-14)} y={Y(-9)} fill={C.axis} fontSize={11}>Stań za narzędziem i patrz w kierunku ruchu.</text>
      </g>
    )}
  </Plot>
);

const AbsInc = () => (
  <Plot range={[-5, 65, -5, 45]} title="G90 kontra G91 — ten sam blok, dwa miejsca"
    caption="Narzędzie stoi w punkcie (20,10). Blok G01 X30 Y20 w trybie absolutnym prowadzi do punktu (30,20). W trybie przyrostowym oznacza przesunięcie o 30 w X i 20 w Y, czyli dojazd do punktu (50,30).">
    {({ X, Y }) => (
      <g>
        <circle cx={X(20)} cy={Y(10)} r={4.5} fill={C.ink} />
        <text x={X(19)} y={Y(10) + 16} fill={C.ink} fontSize={12} textAnchor="end">start (20,10)</text>
        <line x1={X(20)} y1={Y(10)} x2={X(30)} y2={Y(20)} stroke={C.cut} strokeWidth={3.2} color={C.cut} markerEnd="url(#arw)" />
        <circle cx={X(30)} cy={Y(20)} r={4} fill={C.cut} />
        <text x={X(31)} y={Y(21)} fill={C.cut} fontSize={12} fontWeight={700}>G90 → (30,20)</text>
        <line x1={X(20)} y1={Y(10)} x2={X(50)} y2={Y(30)} stroke={C.arc} strokeWidth={3.2} strokeDasharray="8 4" color={C.arc} markerEnd="url(#arw)" />
        <circle cx={X(50)} cy={Y(30)} r={4} fill={C.arc} />
        <text x={X(51)} y={Y(31)} fill={C.arc} fontSize={12} fontWeight={700}>G91 → (50,30)</text>
        <text x={X(1)} y={Y(41)} fill={C.axis} fontSize={12} fontFamily="var(--font-mono)" fontWeight={700}>G01 X30 Y20</text>
      </g>
    )}
  </Plot>
);

const Cycle = () => (
  <Plot range={[-5, 108, -30, 22]} yLabel="Z" title="G98 kontra G99 — powrót w cyklu"
    caption="Dwa otwory, między nimi zacisk. W trybie G99 narzędzie wraca tylko do płaszczyzny R i uderza w przeszkodę (czerwony). W trybie G98 wraca na wysokość początkową i przechodzi ponad nią bezpiecznie (zielony).">
    {({ X, Y, u }) => (
      <g>
        <rect x={X(0)} y={Y(0)} width={100 * u} height={25 * u} fill={C.stock} stroke={C.ink} strokeWidth={2} />
        <rect x={X(42)} y={Y(15)} width={16 * u} height={15 * u} fill={C.ink} opacity={0.7} />
        <text x={X(50)} y={Y(17.5)} fill={C.ink} fontSize={11} textAnchor="middle">zacisk</text>
        <line x1={X(0)} y1={Y(15)} x2={X(100)} y2={Y(15)} stroke={C.axis} strokeDasharray="4 4" />
        <text x={X(101)} y={Y(15) + 4} fill={C.axis} fontSize={11}>start</text>
        <line x1={X(0)} y1={Y(3)} x2={X(100)} y2={Y(3)} stroke={C.axis} strokeDasharray="4 4" />
        <text x={X(101)} y={Y(3) + 4} fill={C.axis} fontSize={11}>R</text>
        <polyline points={`${X(18)},${Y(15)} ${X(18)},${Y(3)}`} fill="none" stroke={C.rapid} strokeWidth={1.6} strokeDasharray="5 3" />
        <polyline points={`${X(18)},${Y(3)} ${X(18)},${Y(-20)}`} fill="none" stroke={C.cut} strokeWidth={3.2} />
        <polyline points={`${X(21)},${Y(-20)} ${X(21)},${Y(3)} ${X(77)},${Y(3)}`} fill="none" stroke={C.bad} strokeWidth={2} strokeDasharray="5 3" />
        <text x={X(50)} y={Y(5.5)} fill={C.bad} fontSize={11} textAnchor="middle" fontWeight={700}>G99 — kolizja</text>
        <polyline points={`${X(24)},${Y(-20)} ${X(24)},${Y(15)} ${X(80)},${Y(15)} ${X(80)},${Y(3)}`} fill="none" stroke={C.cut} strokeWidth={2} strokeDasharray="5 3" />
        <text x={X(58)} y={Y(17)} fill={C.cut} fontSize={11} fontWeight={700}>G98 — nad zaciskiem</text>
        <polyline points={`${X(80)},${Y(3)} ${X(80)},${Y(-20)}`} fill="none" stroke={C.cut} strokeWidth={3.2} />
      </g>
    )}
  </Plot>
);

const Dia = () => (
  <Plot range={[-12, 92, -34, 34]} yLabel="X" xLabel="Z" title="Tokarka: X jest średnicą"
    caption="Nóż stoi 20 mm od osi obrotu, ale w programie piszesz X40 — sterownik liczy średnicowo. Adresy I oraz R pozostają promieniowe. Linia X0 to oś obrotu detalu.">
    {({ X, Y, u }) => (
      <g>
        <line x1={X(-12)} y1={Y(0)} x2={X(92)} y2={Y(0)} stroke={C.axis} strokeWidth={1.5} strokeDasharray="12 4 3 4" />
        <text x={X(66)} y={Y(0) - 7} fill={C.axis} fontSize={11}>oś obrotu (X0)</text>
        <rect x={X(10)} y={Y(20)} width={60 * u} height={40 * u} fill={C.stock} stroke={C.ink} strokeWidth={2.5} />
        <line x1={X(4)} y1={Y(-20)} x2={X(4)} y2={Y(20)} stroke={C.arc} strokeWidth={1.6} color={C.arc} markerStart="url(#dot)" markerEnd="url(#arw)" />
        <text x={X(1)} y={Y(2)} fill={C.arc} fontSize={12} fontWeight={700} textAnchor="end" fontFamily="var(--font-mono)">⌀40</text>
        <line x1={X(62)} y1={Y(0)} x2={X(62)} y2={Y(20)} stroke={C.rapid} strokeWidth={1.6} color={C.rapid} markerStart="url(#dot)" markerEnd="url(#arw)" />
        <text x={X(63)} y={Y(11)} fill={C.rapid} fontSize={11} fontFamily="var(--font-mono)">r = 20</text>
        <path d={`M ${X(66)} ${Y(20)} L ${X(76)} ${Y(29)} L ${X(76)} ${Y(23)} L ${X(69)} ${Y(18)} Z`} fill={C.ink} />
        <text x={X(78)} y={Y(27)} fill={C.ink} fontSize={12} fontFamily="var(--font-mono)" fontWeight={700}>X40</text>
      </g>
    )}
  </Plot>
);

const Rapid = () => (
  <Plot range={[-5, 85, -5, 55]} title="G00 — tor nie jest linią prostą"
    caption="Przy szybkim przejeździe każda oś rusza z własną prędkością maksymalną. Oś o krótszej drodze kończy ruch wcześniej, więc rzeczywisty tor (pomarańczowy) biegnie po skosie, a potem prosto — a nie po przekątnej (szara linia), jak podpowiada intuicja.">
    {({ X, Y, u }) => (
      <g>
        <line x1={X(10)} y1={Y(10)} x2={X(70)} y2={Y(40)} stroke={C.axis} strokeWidth={1.5} strokeDasharray="5 5" opacity={0.55} />
        <text x={X(42)} y={Y(29)} fill={C.axis} fontSize={11}>zakładany tor</text>
        <polyline points={`${X(10)},${Y(10)} ${X(40)},${Y(40)} ${X(68)},${Y(40)}`} fill="none" stroke={C.rapid} strokeWidth={3.2} color={C.rapid} markerEnd="url(#arw)" />
        <text x={X(44)} y={Y(43)} fill={C.rapid} fontSize={12} fontWeight={700}>tor rzeczywisty</text>
        <circle cx={X(10)} cy={Y(10)} r={4.5} fill={C.ink} />
        <text x={X(10)} y={Y(10) + 17} fill={C.ink} fontSize={11} textAnchor="middle">start (10,10)</text>
        <circle cx={X(70)} cy={Y(40)} r={4.5} fill={C.ink} />
        <text x={X(71)} y={Y(40) - 7} fill={C.ink} fontSize={11} fontFamily="var(--font-mono)">G00 X70 Y40</text>
        <rect x={X(46)} y={Y(32)} width={10 * u} height={24 * u} fill={C.bad} opacity={0.25} stroke={C.bad} strokeDasharray="3 3" />
        <text x={X(51)} y={Y(19)} fill={C.bad} fontSize={11} textAnchor="middle">przeszkoda</text>
      </g>
    )}
  </Plot>
);

const Helix = () => (
  <Plot range={[-5, 85, -5, 55]} title="Interpolacja śrubowa"
    caption="Łuk z jednoczesnym przesunięciem w osi prostopadłej daje helisę. W rzucie z góry widać okrąg, a narzędzie schodzi o zadaną wartość Z na każdy pełny obrót — stąd łagodne wejście w materiał zamiast zagłębiania pionowego.">
    {({ X, Y, u }) => (
      <g>
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={X(45)} cy={Y(25)} r={(20 - i * 0.7) * u} fill="none" stroke={C.arc} strokeWidth={2.4} opacity={1 - i * 0.25} />
        ))}
        <circle cx={X(45)} cy={Y(25)} r={3} fill={C.arc} />
        <text x={X(47)} y={Y(25) + 15} fill={C.arc} fontSize={11} fontFamily="var(--font-mono)">środek</text>
        <circle cx={X(25)} cy={Y(25)} r={4.5} fill={C.ink} />
        <text x={X(24)} y={Y(25) - 9} fill={C.ink} fontSize={11} textAnchor="end">start</text>
        <text x={X(-3)} y={Y(52)} fill={C.axis} fontSize={11} fontFamily="var(--font-mono)">G03 X25 Y25 Z−2 I20 J0</text>
        <text x={X(-3)} y={Y(47)} fill={C.axis} fontSize={11} fontFamily="var(--font-mono)">G03 X25 Y25 Z−4 I20 J0</text>
        <text x={X(-3)} y={Y(42)} fill={C.axis} fontSize={11} fontFamily="var(--font-mono)">G03 X25 Y25 Z−6 I20 J0</text>
      </g>
    )}
  </Plot>
);

export const diagrams: Record<string, () => ReactNode> = {
  g00: Rapid,
  g01: Rapid,
  g02: ArcIJ,
  g03: ArcIJ,
  "g40-g42": Comp,
  "g43-g49": Comp,
  "g81-g83": Cycle,
  g84: Cycle,
  "g85-g86": Cycle,
  "g90-g91": AbsInc,
  "g94-g95": Dia,
  "g96-g97": Dia,
  "g71-g70": Dia,
  g76: Dia,
  g33: Dia,
  "g17-g19": Dia,
  helix: Helix,
};
