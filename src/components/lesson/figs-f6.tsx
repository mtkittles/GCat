import { Code, Dim, Fig, mapper, Pt, T } from "@/components/fig";

/* Rysunki modułu F6 — kieszenie i planowanie. Styl i kolory z fig.tsx. */

type M = ReturnType<typeof mapper>;
const rr = (m: M, x0: number, y0: number, x1: number, y1: number, r: number, ccw = false) => {
  const R = r * m.u, s = ccw ? 0 : 1;
  if (!ccw) return `M ${m.X(x0)} ${m.Y(y0 + r)} L ${m.X(x0)} ${m.Y(y1 - r)} A ${R} ${R} 0 0 ${s} ${m.X(x0 + r)} ${m.Y(y1)} L ${m.X(x1 - r)} ${m.Y(y1)} A ${R} ${R} 0 0 ${s} ${m.X(x1)} ${m.Y(y1 - r)} L ${m.X(x1)} ${m.Y(y0 + r)} A ${R} ${R} 0 0 ${s} ${m.X(x1 - r)} ${m.Y(y0)} L ${m.X(x0 + r)} ${m.Y(y0)} A ${R} ${R} 0 0 ${s} ${m.X(x0)} ${m.Y(y0 + r)} Z`;
  return `M ${m.X(x0 + r)} ${m.Y(y0)} L ${m.X(x1 - r)} ${m.Y(y0)} A ${R} ${R} 0 0 0 ${m.X(x1)} ${m.Y(y0 + r)} L ${m.X(x1)} ${m.Y(y1 - r)} A ${R} ${R} 0 0 0 ${m.X(x1 - r)} ${m.Y(y1)} L ${m.X(x0 + r)} ${m.Y(y1)} A ${R} ${R} 0 0 0 ${m.X(x0)} ${m.Y(y1 - r)} L ${m.X(x0)} ${m.Y(y0 + r)} A ${R} ${R} 0 0 0 ${m.X(x0 + r)} ${m.Y(y0)} Z`;
};

/* ================= F6.1: planowanie jednym przejściem ================= */
export function FacePass() {
  const R: [number, number, number, number] = [-76, 156, -14, 64];
  const m = mapper(R, [8, 6, 344, 206]);
  const r = 31.5;
  return (
    <Fig id="f61fp" code="Ø63" title="Planowanie płytki jednym przejściem głowicy" h={230} legend={["cut", "acc", "stock"]}
      notes={<><Code k="acc">ae = 50 z 63 mm ≈ 79% D</Code><Code k="cut">G01 X120. F800</Code></>}
      caption={<>Głowica startuje i kończy poza detalem — w całości, z zapasem. Oś jedzie środkiem płytki, więc po obu stronach zostaje po 6,5 mm wystającej głowicy, a ostrza wchodzą w materiał na cienkim wiórze.</>}>
      {(c) => (
        <g>
          <rect x={m.X(0)} y={m.Y(50)} width={80 * m.u} height={50 * m.u} fill={c.hatch} className="p-con" />
          {[-40, 40].map((x, i) => <circle key={x} cx={m.X(x)} cy={m.Y(25)} r={r * m.u} className={i === 1 ? "tool" : "p-cons"} />)}
          <line x1={m.X(-40)} y1={m.Y(25)} x2={m.X(120) - 3} y2={m.Y(25)} className="p-cut thick" markerEnd={c.a("cut")} />
          <Pt x={m.X(-40)} y={m.Y(25)} label="X−40" pos="n" cls="t-mono" dot="pt-rap" />
          <Pt x={m.X(120)} y={m.Y(25)} label="X120" pos="n" cls="t-mono" />
          <Dim x1={m.X(88)} y1={m.Y(0)} x2={m.X(88)} y2={m.Y(50)} label="ae 50" c={c} lside={1} cls="t-acc t-b t-mono" />
          <Pt x={m.X(0)} y={m.Y(0)} label="W" pos="sw" cls="t-b" />
        </g>
      )}
    </Fig>
  );
}

/* ================= F6.1: położenie głowicy ================= */
function FacePos({ x0, good }: { x0: number; good: boolean }) {
  const cx = x0 + 85, cy = 112, r = 56;
  const top = good ? cy - 42 : cy, bot = good ? cy + 42 : cy + 70;
  return (
    <g>
      <rect x={x0 + 8} y={top} width={154} height={bot - top} className="solid-hatch" />
      <circle cx={cx} cy={cy} r={r} className={good ? "tool" : "p-fill-bad"} />
      <circle cx={cx} cy={cy} r={2.5} className="pt" />
      <line x1={cx - r - 14} y1={cy} x2={cx - r - 2} y2={cy} className="p-cut thick" markerEnd="url(#f61ps-a-cut)" />
      <T x={x0 + 85} y={22} anchor="middle" cls={good ? "t-cut t-b" : "t-bad t-b"}>{good ? "ae ≈ 75% D" : "oś na krawędzi"}</T>
      <T x={x0 + 85} y={198} anchor="middle" cls="t-mut">{good ? "cienki wiór na wejściu" : "gruby wiór na wejściu"}</T>
    </g>
  );
}
export function FacePosition() {
  return (
    <Fig id="f61ps" code="ae" title="Gdzie ustawić oś głowicy" h={210} legend={["cut", "bad"]}
      caption={<>Oś głowicy na krawędzi detalu to najgorszy przypadek: ostrze wchodzi w materiał od razu na pełnej grubości wióra. Szerokość ae około 70–80% średnicy i oś nad detalem dają łagodne wejście i dłuższą trwałość płytek.</>}>
      {() => <g><FacePos x0={2} good={false} /><FacePos x0={184} good /></g>}
    </Fig>
  );
}

/* ================= F6.1: strategie dla szerokiej powierzchni ================= */
function Strat({ x0, zig }: { x0: number; zig: boolean }) {
  const ys = [58, 98, 138], xa = x0 + 22, xb = x0 + 150;
  return (
    <g>
      <rect x={x0 + 30} y={44} width={112} height={108} className="solid-hatch" />
      {ys.map((y, i) => {
        const rev = zig && i % 2 === 1;
        return <line key={y} x1={rev ? xb : xa} y1={y} x2={rev ? xa + 3 : xb - 3} y2={y} className="p-cut thick" markerEnd="url(#f61st-a-cut)" />;
      })}
      {ys.slice(0, -1).map((y, i) => zig
        ? <line key={`c${y}`} x1={i % 2 === 0 ? xb : xa} y1={y} x2={i % 2 === 0 ? xb : xa} y2={ys[i + 1] - 3} className="p-cut" markerEnd="url(#f61st-a-cut)" />
        : <polyline key={`c${y}`} points={`${xb},${y} ${xb},${y + 12} ${xa},${ys[i + 1] - 8} ${xa},${ys[i + 1] - 3}`} className="p-rap" />)}
      <T x={x0 + 86} y={24} anchor="middle" cls="t-b">{zig ? "zygzak" : "w jednym kierunku"}</T>
      <T x={x0 + 86} y={176} anchor="middle" cls="t-mut">{zig ? "krócej, kierunek mieszany" : "zawsze współbieżnie"}</T>
    </g>
  );
}
export function FaceStrategy() {
  return (
    <Fig id="f61st" code="G01" title="Powierzchnia szersza niż głowica" h={190} legend={["cut", "rap"]}
      caption={<>Przy kilku przejściach wybierasz między ruchem w jednym kierunku z powrotem w powietrzu a zygzakiem. Jeden kierunek daje równą powierzchnię, zygzak skraca czas.</>}>
      {() => <g><Strat x0={2} zig={false} /><Strat x0={184} zig /></g>}
    </Fig>
  );
}

/* ================= F6.2: kieszeń prostokątna ================= */
export function RectPocket() {
  const R: [number, number, number, number] = [8, 52, 8, 42];
  const m = mapper(R, [10, 6, 340, 230]);
  return (
    <Fig id="f62rp" code="26×20" title="Kieszeń 26 × 20, R6 — zgrubnie i na gotowo" h={252} legend={["cut", "arc", "stock"]}
      notes={<><Code k="cut">oś X23…X37 + pętla Y21…Y29</Code><Code k="arc">G41 D1: ściany z rysunku, R6</Code></>}
      caption={<>Zgrubnie: przejście po osi i jedna pętla 1 mm od ścian. Na gotowo: ściany z korekcją promienia, z najazdem i odjazdem po łuku R6 w środku dolnej ściany. Obieg przeciwnie do zegara daje w kieszeni frezowanie współbieżne.</>}>
      {(c) => (
        <g>
          <rect x={m.X(8)} y={m.Y(42)} width={44 * m.u} height={34 * m.u} fill={c.hatch} className="p-con" />
          <path d={rr(m, 17, 15, 43, 35, 6)} className="panel-bg" />
          <path d={rr(m, 17, 15, 43, 35, 6)} className="p-arc thick" style={{ fill: "none" }} />
          <line x1={m.X(23)} y1={m.Y(25)} x2={m.X(37)} y2={m.Y(25)} className="p-cut thick" />
          <rect x={m.X(23)} y={m.Y(29)} width={14 * m.u} height={8 * m.u} className="p-cut" style={{ fill: "none" }} />
          <line x1={m.X(37)} y1={m.Y(25)} x2={m.X(24) + 2} y2={m.Y(21) - 1} className="p-acc dashed" />
          <path d={`M ${m.X(24)} ${m.Y(21)} A ${6 * m.u} ${6 * m.u} 0 0 0 ${m.X(30)} ${m.Y(15)}`} className="p-acc thick" markerEnd={c.a("acc")} />
          <circle cx={m.X(30)} cy={m.Y(25)} r={5 * m.u} className="tool" />
          <Pt x={m.X(30)} y={m.Y(15)} label="wejście X30 Y15" pos="s" cls="t-mono t-acc t-b" />
          <Dim x1={m.X(17)} y1={m.Y(35)} x2={m.X(43)} y2={m.Y(35)} off={-12} label="26" c={c} />
          <Dim x1={m.X(43)} y1={m.Y(15)} x2={m.X(43)} y2={m.Y(35)} off={-12} label="20" c={c} lside={1} />
        </g>
      )}
    </Fig>
  );
}

/* ================= F6.2: rampa ================= */
export function RampEntry() {
  const R: [number, number, number, number] = [14, 46, -7, 5];
  const m = mapper(R, [12, 6, 336, 176]);
  const pts = [[23, 0], [37, -1], [23, -2], [37, -3], [23, -4], [37, -4]];
  return (
    <Fig id="f62ra" code="rampa" title="Wejście po rampie — przekrój wzdłuż osi kieszeni" h={200} legend={["cut", "bad", "stock"]}
      notes={<><Code k="cut">G01 X37. Z-1. → X23. Z-2. → …</Code></>}
      caption={<>Frez schodzi o 1 mm na każde 14 mm drogi — około 4°. Skrawa wtedy obwodem, a nie samym czołem. Wejście pionowe w pełny materiał przeciąża środek freza, a wiele frezów nie ma tam w ogóle ostrza.</>}>
      {(c) => (
        <g>
          <rect x={m.X(14)} y={m.Y(0)} width={32 * m.u} height={7 * m.u} fill={c.hatch} className="p-con" />
          <rect x={m.X(17)} y={m.Y(0)} width={26 * m.u} height={4 * m.u} className="panel-bg" />
          <polyline points={pts.map(([x, z]) => `${m.X(x)},${m.Y(z)}`).join(" ")} className="p-cut thick" />
          <line x1={m.X(20)} y1={m.Y(4)} x2={m.X(20)} y2={m.Y(-4) + 3} className="p-bad" markerEnd={c.a("bad")} />
          <T x={m.X(19.4)} y={m.Y(3.2)} anchor="end" cls="t-bad">pionowo</T>
          <T x={m.X(38)} y={m.Y(-1) + 4} cls="t-cut t-b">≈ 4°</T>
          <T x={m.X(45)} y={m.Y(-4) + 4} anchor="end" cls="t-mono">Z−4</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= F6.3: kieszeń okrągła ================= */
export function CirclePocket() {
  const R: [number, number, number, number] = [44, 76, 9, 41];
  const m = mapper(R, [10, 6, 340, 226]);
  const C = { x: 60, y: 25 };
  return (
    <Fig id="f63cp" code="Ø20" title="Kieszeń Ø20: spirala, najazd, okrąg, odjazd" h={250} legend={["acc", "arc", "stock"]}
      notes={<><Code k="acc">G03 I-3. Z-1. … Z-4.</Code><Code k="arc">G41 → G03 R7. → G03 I-10. → G03 R7. → G40</Code></>}
      caption={<>Spirala o promieniu 3 mm schodzi po 1 mm na obrót i od razu wybiera środek kieszeni. Ścianę wykańcza pełny okrąg z korekcją, z łukami najazdu i odjazdu R7 — większymi niż promień freza, mniejszymi niż promień kieszeni.</>}>
      {(c) => (
        <g>
          <rect x={m.X(44)} y={m.Y(41)} width={32 * m.u} height={32 * m.u} fill={c.hatch} className="p-con" />
          <circle cx={m.X(C.x)} cy={m.Y(C.y)} r={10 * m.u} className="panel-bg" />
          <circle cx={m.X(C.x)} cy={m.Y(C.y)} r={10 * m.u} className="p-arc thick" style={{ fill: "none" }} />
          <circle cx={m.X(C.x)} cy={m.Y(C.y)} r={3 * m.u} className="p-acc thick" style={{ fill: "none" }} />
          <line x1={m.X(63)} y1={m.Y(25)} x2={m.X(63)} y2={m.Y(18) + 3} className="p-acc dashed" markerEnd={c.a("acc")} />
          <path d={`M ${m.X(63)} ${m.Y(18)} A ${7 * m.u} ${7 * m.u} 0 0 0 ${m.X(70)} ${m.Y(25)}`} className="p-arc" markerEnd={c.a("arc")} />
          <path d={`M ${m.X(70)} ${m.Y(25)} A ${7 * m.u} ${7 * m.u} 0 0 0 ${m.X(63)} ${m.Y(32)}`} className="p-arc dashed" markerEnd={c.a("arc")} />
          <Pt x={m.X(C.x)} y={m.Y(C.y)} label="X60 Y25" pos="w" cls="t-mono" />
          <Pt x={m.X(63)} y={m.Y(25)} label="start" pos="e" cls="t-mono t-acc" dot="pt-rap" />
          <Pt x={m.X(70)} y={m.Y(25)} label="X70" pos="e" cls="t-mono t-b" dot="pt-cut" />
          <T x={m.X(60)} y={m.Y(36.5)} anchor="middle" cls="t-arc t-b">Ø20</T>
        </g>
      )}
    </Fig>
  );
}

export const f6Figs = {
  "f61-face": () => <FacePass />,
  "f61-pos": () => <FacePosition />,
  "f61-strategy": () => <FaceStrategy />,
  "f62-pocket": () => <RectPocket />,
  "f62-ramp": () => <RampEntry />,
  "f63-circle": () => <CirclePocket />,
};
