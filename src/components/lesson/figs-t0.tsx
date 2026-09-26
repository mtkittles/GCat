import { Code, Dim, Fig, mapper, Pt, T } from "@/components/fig";

/* Rysunki modułu T0 — tokarka. Widok z boku: Z w prawo, X (promień) w górę. */

type M = ReturnType<typeof mapper>;
/* profil wałka: [z, r] — górna połowa od czoła do końca Ø36 */
export const PROFILE: [number, number][] = [[0, 0], [0, 9], [-1, 10], [-20, 10], [-20, 14], [-21, 15], [-40, 15], [-40, 18], [-55, 18], [-55, 0]];
const poly = (m: M, pts: [number, number][], mirror = false) => pts.map(([z, r]) => `${m.X(z)},${m.Y(mirror ? -r : r)}`).join(" ");

function Chuck({ m, z0, r }: { m: M; z0: number; r: number }) {
  return (
    <g>
      <rect x={m.X(z0 - 10)} y={m.Y(r + 8)} width={10 * m.u} height={(2 * r + 16) * m.u} rx={3} className="clamp" />
      <rect x={m.X(z0)} y={m.Y(r + 6)} width={7 * m.u} height={6 * m.u} className="solid-hatch" />
      <rect x={m.X(z0)} y={m.Y(-r)} width={7 * m.u} height={6 * m.u} className="solid-hatch" />
    </g>
  );
}

/* ================= T0.1: osie tokarki ================= */
export function LatheAxes() {
  const R: [number, number, number, number] = [-98, 42, -30, 44];
  const m = mapper(R, [10, 6, 340, 226]);
  return (
    <Fig id="t01ax" code="X Z" title="Osie tokarki — widok z boku, głowica tylna" h={250} legend={["acc", "stock"]}
      caption={<>Z leży w osi wrzeciona: +Z od uchwytu w stronę konika. X jest promieniowo: +X od osi obrotu. Obie osie dodatnie oddalają nóż od detalu, tak samo jak na frezarce.</>}>
      {(c) => (
        <g>
          <Chuck m={m} z0={-88} r={20} />
          <rect x={m.X(-88)} y={m.Y(20)} width={88 * m.u} height={20 * m.u} fill={c.hatch} className="p-con" />
          <rect x={m.X(-88)} y={m.Y(0)} width={88 * m.u} height={20 * m.u} className="panel-bg" style={{ stroke: "var(--ink-2)" }} />
          <line x1={m.X(-98)} y1={m.Y(0)} x2={m.X(42)} y2={m.Y(0)} className="p-cons" />
          <line x1={m.X(0)} y1={m.Y(0)} x2={m.X(34)} y2={m.Y(0)} className="p-acc thick" markerEnd={c.a("acc")} />
          <line x1={m.X(0)} y1={m.Y(0)} x2={m.X(0)} y2={m.Y(38)} className="p-acc thick" markerEnd={c.a("acc")} />
          <T x={m.X(34)} y={m.Y(0) + 16} anchor="end" cls="t-acc t-b">+Z</T>
          <T x={m.X(0) + 6} y={m.Y(38) + 4} cls="t-acc t-b">+X</T>
          <line x1={m.X(-4)} y1={m.Y(-26)} x2={m.X(-40)} y2={m.Y(-26)} className="p-dim" markerEnd={c.a("dim")} />
          <T x={m.X(-22)} y={m.Y(-26) + 16} anchor="middle" cls="t-mut">−Z w stronę uchwytu</T>
          <polygon points={`${m.X(12)},${m.Y(24)} ${m.X(16)},${m.Y(30)} ${m.X(22)},${m.Y(27)}`} className="p-fill-acc" style={{ stroke: "var(--accent)" }} />
          <T x={m.X(24)} y={m.Y(30)} cls="t-mut">nóż</T>
          <Pt x={m.X(0)} y={m.Y(0)} label="W" pos="sw" cls="t-acc t-b" dot="pt-rap" />
          <T x={m.X(-44)} y={m.Y(10) + 4} anchor="middle" cls="t-b">pręt Ø40</T>
          <T x={m.X(-60)} y={m.Y(0) + 14} cls="t-mut t-sm">oś obrotu</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= T0.1: detal przewodni ================= */
export function LathePart() {
  const R: [number, number, number, number] = [-66, 10, -34, 26];
  const m = mapper(R, [10, 6, 340, 226]);
  const vd = (z: number, r: number, label: string) => (
    <g key={label}>
      <line x1={m.X(z)} y1={m.Y(r)} x2={m.X(z)} y2={m.Y(-r)} className="p-dim" markerStart={`url(#t01pt-a-dim)`} markerEnd={`url(#t01pt-a-dim)`} />
      <T x={m.X(z) + 4} y={m.Y(-r / 2)} cls="t-mono t-acc t-b">{label}</T>
    </g>
  );
  return (
    <Fig id="t01pt" code="Ø" title="Wałek stopniowany — detal przewodni ścieżki" h={250} legend={["acc", "dim", "stock"]}
      notes={<><Code k="con">Ø20 × 20</Code><Code k="con">Ø30 × 20</Code><Code k="con">Ø36 × 15</Code><Code k="con">fazy 1 × 45°</Code></>}
      caption={<>Rysunek tokarski pokazuje górną połowę jako przekrój, a średnice wymiaruje przez oś. Zero W leży na osi, na czole detalu. Surówka to pręt Ø40 — linia przerywana.</>}>
      {(c) => (
        <g>
          <rect x={m.X(-62)} y={m.Y(20)} width={62 * m.u} height={40 * m.u} className="stock-out" />
          <polygon points={poly(m, PROFILE)} fill={c.hatch} className="p-con" />
          <polygon points={poly(m, PROFILE, true)} className="panel-bg" style={{ stroke: "var(--ink-2)" }} />
          <line x1={m.X(-66)} y1={m.Y(0)} x2={m.X(10)} y2={m.Y(0)} className="p-cons" />
          {vd(-10, 10, "Ø20")}{vd(-30, 15, "Ø30")}{vd(-48, 18, "Ø36")}
          <Dim x1={m.X(0)} y1={m.Y(-20)} x2={m.X(-20)} y2={m.Y(-20)} off={10} label="20" c={c} lside={1} />
          <Dim x1={m.X(0)} y1={m.Y(-20)} x2={m.X(-40)} y2={m.Y(-20)} off={30} label="40" c={c} lside={1} />
          <Pt x={m.X(0)} y={m.Y(0)} label="W" pos="ne" cls="t-acc t-b" dot="pt-rap" />
        </g>
      )}
    </Fig>
  );
}

/* ================= T0.2: promień i średnica ================= */
export function DiaRadius() {
  const R: [number, number, number, number] = [-46, 26, -24, 28];
  const m = mapper(R, [10, 6, 340, 226]);
  return (
    <Fig id="t02dr" code="Ø / r" title="X w programie to średnica" h={248} legend={["acc", "cut", "stock"]}
      notes={<><Code k="acc">X30 → promień 15</Code><Code k="cut">ap = (40 − 30) / 2 = 5</Code></>}
      caption={<>Nóż w X30 stoi 15 mm od osi. Z Ø40 na Ø30 schodzi 5 mm materiału na stronę — głębokość skrawania to połowa różnicy średnic.</>}>
      {(c) => (
        <g>
          <rect x={m.X(-44)} y={m.Y(20)} width={44 * m.u} height={20 * m.u} fill={c.hatch} className="p-con" />
          <rect x={m.X(-44)} y={m.Y(0)} width={44 * m.u} height={20 * m.u} className="panel-bg" style={{ stroke: "var(--ink-2)" }} />
          <rect x={m.X(-30)} y={m.Y(20)} width={30 * m.u} height={5 * m.u} className="p-fill-cut" />
          <line x1={m.X(-46)} y1={m.Y(0)} x2={m.X(26)} y2={m.Y(0)} className="p-cons" />
          <polygon points={`${m.X(0)},${m.Y(15)} ${m.X(3)},${m.Y(21)} ${m.X(8)},${m.Y(18)}`} className="p-fill-acc" style={{ stroke: "var(--accent)" }} />
          <Dim x1={m.X(12)} y1={m.Y(0)} x2={m.X(12)} y2={m.Y(15)} label="r 15" c={c} lside={1} cls="t-mono t-acc t-b" />
          <Dim x1={m.X(20)} y1={m.Y(-15)} x2={m.X(20)} y2={m.Y(15)} label="Ø30" c={c} lside={1} cls="t-mono t-b" />
          <Dim x1={m.X(-38)} y1={m.Y(15)} x2={m.X(-38)} y2={m.Y(20)} off={0} label="ap 5" c={c} lside={-1} cls="t-mono t-cut t-b" />
          <line x1={m.X(-44)} y1={m.Y(15)} x2={m.X(0)} y2={m.Y(15)} className="p-cut dashed" />
          <line x1={m.X(-44)} y1={m.Y(-15)} x2={m.X(0)} y2={m.Y(-15)} className="p-cut dashed" />
        </g>
      )}
    </Fig>
  );
}

/* ================= T0.2: faza na średnicy ================= */
export function DiaChamfer() {
  const R: [number, number, number, number] = [-5, 3, 6.5, 12];
  const m = mapper(R, [30, 8, 300, 196]);
  return (
    <Fig id="t02ch" code="1×45°" title="Faza 1 × 45° w zapisie średnicowym" h={220} legend={["cut", "stock"]}
      notes={<><Code k="cut">X18. Z0. → X20. Z-1.</Code></>}
      caption={<>Faza zjada 1 mm w osi Z i 1 mm promieniowo. Promień rośnie z 9 do 10, więc średnica z 18 do 20: przy 45° X zmienia się o dwa razy więcej niż Z.</>}>
      {(c) => (
        <g>
          <polygon points={`${m.X(0)},${m.Y(6.5)} ${m.X(0)},${m.Y(9)} ${m.X(-1)},${m.Y(10)} ${m.X(-5)},${m.Y(10)} ${m.X(-5)},${m.Y(6.5)}`} fill={c.hatch} className="p-con" />
          <line x1={m.X(0)} y1={m.Y(9)} x2={m.X(-1)} y2={m.Y(10)} className="p-cut thick" />
          <Pt x={m.X(0)} y={m.Y(9)} label="X18 Z0" pos="e" cls="t-mono t-b" dot="pt-cut" />
          <Pt x={m.X(-1)} y={m.Y(10)} label="X20 Z−1" pos="n" cls="t-mono t-b" dot="pt-cut" />
          <Dim x1={m.X(0)} y1={m.Y(10)} x2={m.X(-1)} y2={m.Y(10)} off={-m.u * 0.6} label="1" c={c} cls="t-mono" />
          <Dim x1={m.X(1.2)} y1={m.Y(9)} x2={m.X(1.2)} y2={m.Y(10)} label="1" c={c} lside={1} cls="t-mono" />
        </g>
      )}
    </Fig>
  );
}

/* ================= T0.3: zero maszyny i zero detalu ================= */
export function LatheZero() {
  const R: [number, number, number, number] = [-100, 40, -30, 34];
  const m = mapper(R, [10, 6, 340, 226]);
  return (
    <Fig id="t03zr" code="M W" title="Zero maszyny na wrzecionie, zero detalu na czole" h={250} legend={["acc", "stock"]}
      caption={<>Na tokarce X0 wypada zawsze na osi obrotu. Operator ustala więc tylko Z: dotyka nożem czoła detalu i zapisuje tę pozycję jako Z0. Odległość od M do W zależy od długości wysięgu pręta z uchwytu.</>}>
      {(c) => (
        <g>
          <Chuck m={m} z0={-88} r={20} />
          <rect x={m.X(-88)} y={m.Y(20)} width={88 * m.u} height={40 * m.u} fill={c.hatch} className="p-con" />
          <line x1={m.X(-100)} y1={m.Y(0)} x2={m.X(40)} y2={m.Y(0)} className="p-cons" />
          <Pt x={m.X(-98)} y={m.Y(0)} label="M" pos="n" cls="t-acc t-b" dot="pt-rap" />
          <Pt x={m.X(0)} y={m.Y(0)} label="W" pos="ne" cls="t-cut t-b" dot="pt-cut" />
          <Dim x1={m.X(-98)} y1={m.Y(-20)} x2={m.X(0)} y2={m.Y(-20)} off={16} label="przesunięcie Z (G54)" c={c} lside={1} cls="t-acc t-b" />
          <polygon points={`${m.X(0)},${m.Y(12)} ${m.X(4)},${m.Y(18)} ${m.X(10)},${m.Y(15)}`} className="p-fill-acc" style={{ stroke: "var(--accent)" }} />
          <T x={m.X(12)} y={m.Y(18)} cls="t-mut">dotyk czoła → Z0</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= T0.3: głowica przednia i tylna ================= */
function Turret({ x0, rear }: { x0: number; rear: boolean }) {
  const cy = 100, top = rear ? cy - 46 : cy + 46;
  return (
    <g>
      <rect x={x0 + 6} y={cy - 22} width={16} height={44} rx={2} className="clamp" />
      <rect x={x0 + 22} y={cy - 12} width={110} height={24} className="solid-hatch" />
      <line x1={x0 + 2} y1={cy} x2={x0 + 170} y2={cy} className="p-cons" />
      <polygon points={rear ? `${x0 + 132},${cy - 14} ${x0 + 138},${cy - 26} ${x0 + 146},${cy - 20}` : `${x0 + 132},${cy + 14} ${x0 + 138},${cy + 26} ${x0 + 146},${cy + 20}`} className="p-fill-acc" style={{ stroke: "var(--accent)" }} />
      <rect x={x0 + 138} y={rear ? cy - 50 : cy + 26} width={22} height={24} rx={2} className="holder" />
      <line x1={x0 + 60} y1={cy} x2={x0 + 60} y2={top} className="p-acc thick" markerEnd="url(#t03tu-a-acc)" />
      <T x={x0 + 66} y={rear ? top + 8 : top - 2} cls="t-acc t-b">+X</T>
      <T x={x0 + 86} y={22} anchor="middle" cls="t-b">{rear ? "głowica tylna" : "głowica przednia"}</T>
      <T x={x0 + 86} y={186} anchor="middle" cls="t-mut">{rear ? "nóż za osią" : "nóż po stronie operatora"}</T>
    </g>
  );
}
export function TurretPosition() {
  return (
    <Fig id="t03tu" code="X±" title="Widok z góry: gdzie jest nóż, tam jest +X" h={214} legend={["acc"]}
      notes={<Code k="con">operator stoi na dole rysunku</Code>}
      caption={<>+X zawsze prowadzi od osi w stronę noża. Przy głowicy tylnej (typowe tokarki ze skośnym łożem) to kierunek od operatora, przy przedniej — do operatora. Program jest ten sam, zmienia się tylko to, jak wygląda z miejsca operatora.</>}>
      {() => <g><Turret x0={2} rear={false} /><Turret x0={184} rear /></g>}
    </Fig>
  );
}

export const t0Figs = {
  "t01-axes": () => <LatheAxes />,
  "t01-part": () => <LathePart />,
  "t02-dia": () => <DiaRadius />,
  "t02-chamfer": () => <DiaChamfer />,
  "t03-zero": () => <LatheZero />,
  "t03-turret": () => <TurretPosition />,
};
