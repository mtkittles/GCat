import { Code, Dim, Fig, mapper, Pt, T } from "@/components/fig";

/* Rysunki modułu F5 — cykle wiercenia. Styl i kolory z fig.tsx. */

const Num = ({ x, y, n }: { x: number; y: number; n: number }) => (
  <g><circle cx={x} cy={y} r={8} className="step" /><text x={x} y={y + 3.8} textAnchor="middle" className="step-n">{n}</text></g>
);

/* ================= F5.1: przebieg cyklu ================= */
export function CycleSteps() {
  const R: [number, number, number, number] = [-6, 78, -16, 56];
  const m = mapper(R, [10, 6, 340, 232]);
  const hx = 40;
  return (
    <Fig id="f51cy" code="G81" title="Cykl wiercenia w czterech ruchach" h={254} legend={["rap", "cut", "stock"]}
      notes={<Code k="cut">G81 X40. Y… Z-10. R2. F120</Code>}
      caption={<>1 — ruch szybki nad otwór, 2 — ruch szybki do płaszczyzny R, 3 — posuw do dna Z, 4 — ruch szybki w górę. Cały ten przebieg opisuje jeden blok.</>}>
      {(c) => (
        <g>
          <rect x={m.X(18)} y={m.Y(0)} width={60 * m.u} height={16 * m.u} fill={c.hatch} className="p-con" />
          <rect x={m.X(hx - 2.5)} y={m.Y(0)} width={5 * m.u} height={10 * m.u} className="panel-bg" />
          <line x1={m.X(-6)} y1={m.Y(50)} x2={m.X(78)} y2={m.Y(50)} className="p-cons" />
          <line x1={m.X(-6)} y1={m.Y(2)} x2={m.X(78)} y2={m.Y(2)} className="p-cons" />
          <T x={m.X(76)} y={m.Y(50) - 5} anchor="end" cls="t-mut">poziom początkowy</T>
          <T x={m.X(76)} y={m.Y(2) - 5} anchor="end" cls="t-acc t-b">R2</T>
          <T x={m.X(hx) + 10} y={m.Y(-10) + 4} cls="t-cut t-b t-mono">Z−10</T>
          <line x1={m.X(0)} y1={m.Y(50)} x2={m.X(hx) - 3} y2={m.Y(50)} className="p-rap thick" markerEnd={c.a("rap")} />
          <line x1={m.X(hx) - 4} y1={m.Y(50)} x2={m.X(hx) - 4} y2={m.Y(2) - 3} className="p-rap thick" markerEnd={c.a("rap")} />
          <line x1={m.X(hx)} y1={m.Y(2)} x2={m.X(hx)} y2={m.Y(-10) - 3} className="p-cut thick" markerEnd={c.a("cut")} />
          <line x1={m.X(hx) + 4} y1={m.Y(-10)} x2={m.X(hx) + 4} y2={m.Y(50) + 3} className="p-rap" markerEnd={c.a("rap")} />
          <Num x={m.X(20)} y={m.Y(50) - 13} n={1} />
          <Num x={m.X(hx) - 16} y={m.Y(26)} n={2} />
          <Num x={m.X(hx) - 14} y={m.Y(-5)} n={3} />
          <Num x={m.X(hx) + 18} y={m.Y(26)} n={4} />
          <Pt x={m.X(0)} y={m.Y(50)} dot="pt-rap" />
        </g>
      )}
    </Fig>
  );
}

/* ================= F5.1: głębokość nawiercenia ================= */
export function SpotDepth() {
  const R: [number, number, number, number] = [-13, 13, -7, 15];
  const m = mapper(R, [14, 6, 332, 206]);
  const P = (x: number, z: number) => `${m.X(x)},${m.Y(z)}`;
  return (
    <Fig id="f51sp" code="90°" title="Nawiertak 90°: głębokość = połowa średnicy fazki" h={230} legend={["dim", "stock"]}
      notes={<><Code k="acc">fazka Ø6 → Z−3</Code><Code k="acc">fazka Ø8 → Z−4</Code></>}
      caption={<>Kąt 90° znaczy, że ścianka stożka biegnie pod 45°: ile w głąb, tyle w bok. Fazka odrobinę większa niż średnica gwintu chroni pierwszy zwój przed wyrwaniem.</>}>
      {(c) => (
        <g>
          <polygon points={`${P(-13, 0)} ${P(-3, 0)} ${P(0, -3)} ${P(3, 0)} ${P(13, 0)} ${P(13, -7)} ${P(-13, -7)}`} fill={c.hatch} className="p-con" />
          <polygon points={`${P(0, 3)} ${P(5, 8)} ${P(5, 15)} ${P(-5, 15)} ${P(-5, 8)}`} className="cutter" />
          <line x1={m.X(-5)} y1={m.Y(8)} x2={m.X(5)} y2={m.Y(8)} className="p-dim" />
          <Dim x1={m.X(-3)} y1={m.Y(0)} x2={m.X(3)} y2={m.Y(0)} off={-m.u * 1.4} label="Ø6" c={c} cls="t-acc t-b t-mono" />
          <Dim x1={m.X(8)} y1={m.Y(0)} x2={m.X(8)} y2={m.Y(-3)} off={0} label="3" c={c} lside={1} cls="t-acc t-b t-mono" />
          <line x1={m.X(0)} y1={m.Y(-3)} x2={m.X(8)} y2={m.Y(-3)} className="p-cons" />
          <T x={m.X(-7)} y={m.Y(11)} anchor="end" cls="t-mut">nawiertak Ø10</T>
        </g>
      )}
    </Fig>
  );
}

const rr = (m: ReturnType<typeof mapper>, x0: number, y0: number, x1: number, y1: number, r: number) => {
  const R = r * m.u;
  return `M ${m.X(x0)} ${m.Y(y0 + r)} L ${m.X(x0)} ${m.Y(y1 - r)} A ${R} ${R} 0 0 1 ${m.X(x0 + r)} ${m.Y(y1)} L ${m.X(x1 - r)} ${m.Y(y1)} A ${R} ${R} 0 0 1 ${m.X(x1)} ${m.Y(y1 - r)} L ${m.X(x1)} ${m.Y(y0 + r)} A ${R} ${R} 0 0 1 ${m.X(x1 - r)} ${m.Y(y0)} L ${m.X(x0 + r)} ${m.Y(y0)} A ${R} ${R} 0 0 1 ${m.X(x0)} ${m.Y(y0 + r)} Z`;
};

/* ================= F5.1: otwory płytki ================= */
export function PlateHoles() {
  const R: [number, number, number, number] = [-6, 86, -10, 58];
  const m = mapper(R, [10, 6, 340, 220]);
  const H = [[10, 10], [70, 10], [70, 40], [10, 40]] as const;
  return (
    <Fig id="f51ho" code="4 × M6" title="Cztery otwory M6 w środkach naroży R10" h={242} legend={["rap", "stock"]}
      notes={<><Code k="con">X10 Y10 → X70 → Y40 → X10</Code></>}
      caption={<>Otwory leżą w środkach zaokrągleń naroży, więc ścianka ma wszędzie 10 − 3 = 7 mm. Kolejność obiegu skraca drogę: każdy następny otwór różni się tylko jedną współrzędną.</>}>
      {(c) => (
        <g>
          <path d={rr(m, 0, 0, 80, 50, 10)} fill={c.hatch} className="p-con" />
          {H.map(([x, y], i) => {
            const q = H[(i + 1) % 4];
            return (
              <g key={i}>
                {i < 3 && <line x1={m.X(x) + (q[0] - x) * 0.12 * m.u} y1={m.Y(y) - (q[1] - y) * 0.2 * m.u} x2={m.X(q[0]) - (q[0] - x) * 0.12 * m.u} y2={m.Y(q[1]) + (q[1] - y) * 0.2 * m.u} className="p-rap" markerEnd={c.a("rap")} />}
                <circle cx={m.X(x)} cy={m.Y(y)} r={3 * m.u} className="p-cons" />
                <circle cx={m.X(x)} cy={m.Y(y)} r={2.5 * m.u} className="hole-top" />
                <T x={m.X(x) + (x < 40 ? -12 : 12)} y={m.Y(y) + (y < 25 ? 18 : -12)} anchor={x < 40 ? "end" : "start"} cls="t-mono t-b">{`${i + 1}  X${x} Y${y}`}</T>
              </g>
            );
          })}
          <Pt x={m.X(0)} y={m.Y(0)} label="W" pos="sw" cls="t-b" />
        </g>
      )}
    </Fig>
  );
}

/* ================= F5.2: G83 i G73 ================= */
/* Przebieg ruchu w czasie: poziomo kolejne ruchy, pionowo głębokość. */
function Peck({ x0, deep }: { x0: number; deep: boolean }) {
  const zR = 2, depth = 16, q = 4, back = deep ? 1 : 0.6;
  const Y = (z: number) => 58 - z * 8.4;              // z w mm, dodatnie w górę
  const pts: { z: number; kind: "cut" | "rap" }[] = [{ z: zR, kind: "rap" }];
  let d = 0;
  while (d > -depth) {
    const next = Math.max(-depth, d - q);
    pts.push({ z: next, kind: "cut" });
    d = next;
    if (d > -depth) {
      if (deep) { pts.push({ z: zR, kind: "rap" }); pts.push({ z: d + back, kind: "rap" }); }
      else pts.push({ z: d + back, kind: "rap" });
    }
  }
  pts.push({ z: zR, kind: "rap" });
  let x = x0 + 22;
  const segs = pts.slice(1).map((p, i) => {
    const a = pts[i], len = Math.abs(p.z - a.z);
    const dx = p.kind === "cut" ? len * 3.2 : Math.max(3, len * 0.55);
    const s = { x1: x, y1: Y(a.z), x2: x + dx, y2: Y(p.z), kind: p.kind };
    x += dx;
    return s;
  });
  return (
    <g>
      <rect x={x0 + 8} y={Y(0)} width={160} height={Y(-depth - 1.5) - Y(0)} className="solid-hatch" />
      <line x1={x0 + 8} y1={Y(zR)} x2={x0 + 168} y2={Y(zR)} className="p-cons" />
      <T x={x0 + 10} y={Y(zR) - 4} cls="t-acc t-sm t-b">R</T>
      <T x={x0 + 166} y={Y(-depth) + 12} anchor="end" cls="t-mono t-sm">Z−16</T>
      {[-4, -8, -12].map((z) => <line key={z} x1={x0 + 8} y1={Y(z)} x2={x0 + 168} y2={Y(z)} className="p-ext" />)}
      {segs.map((sg, i) => <line key={i} x1={sg.x1} y1={sg.y1} x2={sg.x2} y2={sg.y2} className={sg.kind === "cut" ? "p-cut thick" : "p-rap"} />)}
      <T x={x0 + 88} y={24} anchor="middle" cls="t-b t-mono t-big">{deep ? "G83" : "G73"}</T>
      <T x={x0 + 88} y={Y(-depth - 1.5) + 16} anchor="middle" cls="t-mut">{deep ? "wyjazd do R po każdym Q" : "krótkie cofnięcie po każdym Q"}</T>
    </g>
  );
}

export function PeckCompare() {
  return (
    <Fig id="f52pk" code="Q" title="Przebieg wiercenia z wycofaniem, Q4 na Z−16" h={236} legend={["cut", "rap"]}
      caption={<>Poziomo kolejne ruchy, pionowo głębokość. <b>G83</b> po każdym zagłębieniu Q wyjeżdża do płaszczyzny R — wiór wychodzi z otworu. <b>G73</b> cofa się tylko o ułamek milimetra, żeby złamać wiór — jest szybszy, ale wiór zostaje w otworze.</>}>
      {() => <g><Peck x0={2} deep /><Peck x0={184} deep={false} /></g>}
    </Fig>
  );
}

/* ================= F5.2: stożek wiertła ================= */
export function DrillTip() {
  const R: [number, number, number, number] = [-10, 12, -18, 3];
  const m = mapper(R, [14, 6, 332, 214]);
  const P = (x: number, z: number) => `${m.X(x)},${m.Y(z)}`;
  return (
    <Fig id="f52tp" code="118°" title="Z w programie to czubek wiertła" h={236} legend={["dim", "stock"]}
      notes={<><Code k="acc">118°: stożek ≈ 0,3 · D</Code><Code k="acc">140°: stożek ≈ 0,18 · D</Code></>}
      caption={<>Wiertło Ø5 o kącie 118°: czubek w Z−16, pełna średnica kończy się 1,5 mm wyżej, w Z−14,5. Przy otworze pod gwint liczy się właśnie ta głębokość.</>}>
      {(c) => (
        <g>
          <polygon points={`${P(-10, 0)} ${P(-2.5, 0)} ${P(-2.5, -14.5)} ${P(0, -16)} ${P(2.5, -14.5)} ${P(2.5, 0)} ${P(12, 0)} ${P(12, -18)} ${P(-10, -18)}`} fill={c.hatch} className="p-con" />
          <line x1={m.X(-4)} y1={m.Y(-14.5)} x2={m.X(12)} y2={m.Y(-14.5)} className="p-cons" />
          <line x1={m.X(0)} y1={m.Y(-16)} x2={m.X(12)} y2={m.Y(-16)} className="p-cons" />
          <Dim x1={m.X(-6)} y1={m.Y(0)} x2={m.X(-6)} y2={m.Y(-14.5)} label="14,5" c={c} lside={-1} cls="t-mono" />
          <Dim x1={m.X(9)} y1={m.Y(0)} x2={m.X(9)} y2={m.Y(-16)} label="Z−16" c={c} lside={1} cls="t-mono t-acc t-b" />
          <T x={m.X(3.5)} y={m.Y(-15.3)} cls="t-acc t-sm">1,5</T>
          <Dim x1={m.X(-2.5)} y1={m.Y(0)} x2={m.X(2.5)} y2={m.Y(0)} off={-16} label="Ø5" c={c} cls="t-mono" />
        </g>
      )}
    </Fig>
  );
}

/* ================= F5.3: gwintowanie ================= */
export function TapCycle() {
  const R: [number, number, number, number] = [-14, 14, -15, 9];
  const m = mapper(R, [14, 6, 332, 214]);
  const threads = Array.from({ length: 12 }, (_, i) => -i - 0.5);
  return (
    <Fig id="f53tp" code="G84" title="Gwintowanie: posuw = obroty × skok" h={238} legend={["cut", "arc", "stock"]}
      notes={<><Code k="cut">wejście: obroty w prawo, F = S · P</Code><Code k="arc">wyjście: obroty odwrócone</Code></>}
      caption={<>Na jeden obrót gwintownik M6 wchodzi dokładnie o skok 1 mm. Przy S500 posuw musi wynosić 500 mm/min — inaczej gwintownik zrywa zwoje albo pęka. Na dnie cykl odwraca obroty i wykręca narzędzie tym samym torem.</>}>
      {(c) => (
        <g>
          <rect x={m.X(-14)} y={m.Y(0)} width={28 * m.u} height={15 * m.u} fill={c.hatch} className="p-con" />
          <rect x={m.X(-3)} y={m.Y(0)} width={6 * m.u} height={12 * m.u} className="panel-bg" />
          {threads.map((z) => <g key={z}><line x1={m.X(-3)} y1={m.Y(z) - 4} x2={m.X(-2.5)} y2={m.Y(z) + 4} className="p-dim" /><line x1={m.X(3)} y1={m.Y(z) - 4} x2={m.X(2.5)} y2={m.Y(z) + 4} className="p-dim" /></g>)}
          <rect x={m.X(-2.5)} y={m.Y(9)} width={5 * m.u} height={21 * m.u} className="cutter" />
          <line x1={m.X(-14)} y1={m.Y(5)} x2={m.X(14)} y2={m.Y(5)} className="p-cons" />
          <T x={m.X(13.5)} y={m.Y(5) - 5} anchor="end" cls="t-acc t-b">R5</T>
          <line x1={m.X(-8)} y1={m.Y(5)} x2={m.X(-8)} y2={m.Y(-12) - 3} className="p-cut thick" markerEnd={c.a("cut")} />
          <line x1={m.X(8)} y1={m.Y(-12)} x2={m.X(8)} y2={m.Y(5) + 3} className="p-arc thick" markerEnd={c.a("arc")} />
          <T x={m.X(-9)} y={m.Y(-4)} anchor="end" cls="t-cut t-b">M03</T>
          <T x={m.X(9)} y={m.Y(-4)} cls="t-arc t-b">M04</T>
          <T x={m.X(0)} y={m.Y(-12) + 22} anchor="middle" cls="t-mono t-b">Z−12</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= F5.4: G98 i G99 przy docisku ================= */
export function RetractLevels() {
  const R: [number, number, number, number] = [-4, 96, -10, 38];
  const m = mapper(R, [10, 6, 340, 208]);
  const holes = [15, 45, 75];
  return (
    <Fig id="f54lv" code="G98 G99" title="Powrót do R albo do poziomu początkowego" h={232} legend={["rap", "bad", "stock"]}
      notes={<><Code k="rap">G99 X15. … X45.</Code><Code k="rap">G98 X45. (przed dociskiem)</Code></>}
      caption={<><b>G99</b> wraca do płaszczyzny R — krótko i szybko, gdy między otworami nic nie wystaje. <b>G98</b> wraca do poziomu początkowego — tak przeskakuje się nad dociskiem.</>}>
      {(c) => (
        <g>
          <rect x={m.X(0)} y={m.Y(0)} width={90 * m.u} height={10 * m.u} fill={c.hatch} className="p-con" />
          <rect x={m.X(56)} y={m.Y(14)} width={10 * m.u} height={14 * m.u} rx={2} className="clamp" />
          <T x={m.X(61)} y={m.Y(14) - 5} anchor="middle" cls="t-mut">docisk</T>
          {holes.map((h) => <rect key={h} x={m.X(h - 2)} y={m.Y(0)} width={4 * m.u} height={7 * m.u} className="panel-bg" />)}
          <line x1={m.X(-4)} y1={m.Y(30)} x2={m.X(96)} y2={m.Y(30)} className="p-cons" />
          <line x1={m.X(-4)} y1={m.Y(2)} x2={m.X(96)} y2={m.Y(2)} className="p-cons" />
          <T x={m.X(95)} y={m.Y(30) - 5} anchor="end" cls="t-mut">poziom początkowy</T>
          <T x={m.X(95)} y={m.Y(2) - 5} anchor="end" cls="t-acc t-b">R</T>
          <line x1={m.X(15) + 3} y1={m.Y(2)} x2={m.X(45) - 3} y2={m.Y(2)} className="p-rap thick" markerEnd={c.a("rap")} />
          <line x1={m.X(45)} y1={m.Y(-7)} x2={m.X(45)} y2={m.Y(30) + 3} className="p-rap thick" markerEnd={c.a("rap")} />
          <line x1={m.X(45) + 3} y1={m.Y(30)} x2={m.X(75) - 3} y2={m.Y(30)} className="p-rap thick" markerEnd={c.a("rap")} />
          <line x1={m.X(45) + 3} y1={m.Y(2) + 5} x2={m.X(75) - 3} y2={m.Y(2) + 5} className="p-bad" markerEnd={c.a("bad")} />
          <T x={m.X(30)} y={m.Y(2) - 6} anchor="middle" cls="t-rap t-b">G99</T>
          <T x={m.X(60)} y={m.Y(30) - 6} anchor="middle" cls="t-rap t-b">G98</T>
          <T x={m.X(50)} y={m.Y(2) + 22} cls="t-bad">G99 — kolizja</T>
        </g>
      )}
    </Fig>
  );
}

export const f5Figs = {
  "f51-cycle": () => <CycleSteps />,
  "f51-spot": () => <SpotDepth />,
  "f51-holes": () => <PlateHoles />,
  "f52-peck": () => <PeckCompare />,
  "f52-tip": () => <DrillTip />,
  "f53-tap": () => <TapCycle />,
  "f54-levels": () => <RetractLevels />,
};
