import { Code, Fig, mapper, Pt, T } from "@/components/fig";

/* Rysunki modułu T3 — ruchy na tokarce. Widok z boku: Z w prawo, X (promień) w górę. */

type M = ReturnType<typeof mapper>;
const P = (m: M, z: number, r: number) => `${m.X(z)},${m.Y(r)}`;

/* ================= T3.1: jedno przejście ================= */
/* Schemat bez zachowania skali: oś X (promień) rozciągnięta, żeby 2 mm były widoczne. */
export function PassLoop() {
  const X = (z: number) => 18 + (z + 60) * 4.6, Y = (r: number) => 196 - (r - 13) * 16;
  return (
    <Fig id="t31pl" code="G00 G01" title="Jedno przejście zgrubne: cztery ruchy" h={222} legend={["rap", "cut", "bad", "stock"]}
      notes={<><Code k="rap">G00 X36.4</Code><Code k="cut">G01 Z-54.8 F0.3</Code><Code k="cut">X40.5</Code><Code k="rap">G00 Z2.</Code></>}
      caption={<>Wejście na średnicę i powrót idą ruchem szybkim w powietrzu, toczenie i wyjście z materiału — posuwem. Powrót ruchem szybkim bez wyjścia w X przeciągnąłby ostrze po świeżo toczonej powierzchni. Skala pionowa powiększona.</>}>
      {(c) => (
        <g>
          <rect x={X(-60)} y={Y(20)} width={X(0) - X(-60)} height={Y(13) - Y(20)} fill={c.hatch} className="p-con" style={{ opacity: 0.6 }} />
          <line x1={X(2)} y1={Y(22)} x2={X(2)} y2={Y(18.2) - 3} className="p-rap thick" markerEnd={c.a("rap")} />
          <line x1={X(2)} y1={Y(18.2)} x2={X(-54.8) + 3} y2={Y(18.2)} className="p-cut thick" markerEnd={c.a("cut")} />
          <line x1={X(-54.8)} y1={Y(18.2)} x2={X(-54.8)} y2={Y(20.25) + 3} className="p-cut thick" markerEnd={c.a("cut")} />
          <line x1={X(-54.8)} y1={Y(20.25)} x2={X(2) - 3} y2={Y(20.25)} className="p-rap" markerEnd={c.a("rap")} />
          <line x1={X(-50)} y1={Y(17.3)} x2={X(-4)} y2={Y(17.3)} className="p-bad" markerEnd={c.a("bad")} />
          <T x={X(-27)} y={Y(17.3) + 16} anchor="middle" cls="t-bad">G00 Z2. bez wyjścia w X — po powierzchni</T>
          <T x={X(-26)} y={Y(18.2) - 6} anchor="middle" cls="t-cut t-b">2. G01 Z-54.8</T>
          <T x={X(-26)} y={Y(20.25) - 6} anchor="middle" cls="t-rap t-b">4. G00 Z2.</T>
          <T x={X(2) + 6} y={Y(20.8)} cls="t-rap t-b">1.</T>
          <T x={X(-54.8) - 6} y={Y(19.4)} anchor="end" cls="t-cut t-b">3.</T>
          <Pt x={X(2)} y={Y(22)} label="X44 Z2" pos="w" cls="t-mono" dot="pt-rap" />
          <T x={X(-58)} y={Y(14)} cls="t-mut">pręt Ø40 — toczona warstwa</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= T3.2: kontur wykańczający ================= */
export function FinishContour() {
  const R: [number, number, number, number] = [-60, 8, -2, 24];
  const m = mapper(R, [10, 6, 340, 206]);
  const pts: [number, number][] = [[2, 7], [-1, 10], [-20, 10], [-20, 14], [-21, 15], [-40, 15], [-40, 18], [-55, 18], [-55, 21]];
  const labels: [number, number, string, "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw"][] = [[-1, 10, "X20 Z−1", "sw"], [-20, 14, "X28", "sw"], [-21, 15, "X30 Z−21", "nw"], [-40, 18, "X36", "nw"], [-55, 18, "Z−55", "sw"]];
  return (
    <Fig id="t32fc" code="G01" title="Kontur wykańczający z fazami" h={230} legend={["rap", "cut", "stock"]}
      notes={<><Code k="rap">G00 X14. Z2.</Code><Code k="cut">G01 X20. Z-1. F0.1</Code></>}
      caption={<>Nóż wchodzi na fazę po jej przedłużeniu: z X14 Z2 linia 45° trafia dokładnie w początek fazy na czole. Ostre naroże przy Ø36 dostanie promień w lekcji T3.3.</>}>
      {(c) => (
        <g>
          <polygon points={`${P(m, 0, 0)} ${P(m, 0, 9)} ${pts.slice(1, -1).map(([z, r]) => P(m, z, r)).join(" ")} ${P(m, -58, 18)} ${P(m, -58, 0)}`} fill={c.hatch} className="p-con" />
          <line x1={m.X(-60)} y1={m.Y(0)} x2={m.X(8)} y2={m.Y(0)} className="p-cons" />
          <polyline points={pts.map(([z, r]) => P(m, z, r)).join(" ")} className="p-cut thick" style={{ fill: "none" }} />
          <line x1={m.X(2)} y1={m.Y(7)} x2={m.X(0)} y2={m.Y(9)} className="p-rap" />
          {labels.map(([z, r, l, pos]) => <Pt key={l} x={m.X(z)} y={m.Y(r)} label={l} pos={pos} cls="t-mono" dot="pt-cut" />)}
          <Pt x={m.X(2)} y={m.Y(7)} label="X14 Z2" pos="s" cls="t-mono t-b" dot="pt-rap" />
        </g>
      )}
    </Fig>
  );
}

/* ================= T3.2: przejścia zgrubne ================= */
export function RoughLayers() {
  const R: [number, number, number, number] = [-60, 8, -2, 24];
  const m = mapper(R, [10, 6, 340, 196]);
  const layers: [number, number, number][] = [[18.2, -54.8, 20], [16, -39.8, 18.2], [15.2, -39.8, 16], [12.75, -19.8, 15.2], [10.2, -19.8, 12.75]];
  return (
    <Fig id="t32rl" code="ap" title="Pięć przejść zgrubnych z pręta Ø40" h={222} legend={["cut", "acc", "stock"]}
      notes={<><Code k="cut">Ø36,4 → Ø32 → Ø30,4 → Ø25,5 → Ø20,4</Code></>}
      caption={<>Każdy pas to jedno przejście. Ostatnie przejścia na każdym stopniu zostawiają 0,2 mm na stronę (Ø +0,4) i 0,2 mm w Z na nóż wykańczający. Tę samą pracę wykona cykl G71 z modułu T5 — w dwóch blokach.</>}>
      {(c) => (
        <g>
          <rect x={m.X(-58)} y={m.Y(20)} width={58 * m.u} height={20 * m.u} className="panel-bg" />
          {layers.map(([r, z, top], i) => (
            <g key={i}>
              <rect x={m.X(z)} y={m.Y(top)} width={-z * m.u} height={(top - r) * m.u} className={i % 2 ? "p-fill-cut" : "p-fill-acc"} />
              <T x={m.X(z) + 4} y={m.Y((r + top) / 2) + 4} cls="t-mono t-sm">{`Ø${(r * 2).toFixed(1).replace(".0", "")}`}</T>
            </g>
          ))}
          <polygon points={`${P(m, 0, 0)} ${P(m, 0, 9)} ${P(m, -1, 10)} ${P(m, -20, 10)} ${P(m, -20, 14)} ${P(m, -21, 15)} ${P(m, -40, 15)} ${P(m, -40, 18)} ${P(m, -58, 18)} ${P(m, -58, 0)}`} fill={c.hatch} className="p-con" />
          <line x1={m.X(-60)} y1={m.Y(0)} x2={m.X(8)} y2={m.Y(0)} className="p-cons" />
        </g>
      )}
    </Fig>
  );
}

/* ================= T3.3: promienie przy stopniu ================= */
export function StepArcs() {
  const R: [number, number, number, number] = [-43, -36.5, 13.8, 19.2];
  const m = mapper(R, [30, 8, 300, 206]);
  const u = m.u;
  return (
    <Fig id="t33ar" code="G02 G03" title="Stopień Ø30 → Ø36: naroże wklęsłe i wypukłe" h={232} legend={["cut", "arc", "stock"]}
      notes={<><Code k="arc">Z-39. → G02 X32. Z-40. R1.</Code><Code k="arc">G01 X35. → G03 X36. Z-40.5 R0.5</Code></>}
      caption={<>Patrząc na rysunek z osią X w górę: promień wklęsły między Ø30 a czołem stopnia to łuk zgodnie z zegarem (G02), a zaokrąglenie krawędzi Ø36 — przeciwnie (G03). Nóż jedzie od czoła w stronę uchwytu.</>}>
      {(c) => (
        <g>
          <path d={`M ${P(m, -36.5, 15)} L ${P(m, -39, 15)} A ${u} ${u} 0 0 1 ${P(m, -40, 16)} L ${P(m, -40, 17.5)} A ${0.5 * u} ${0.5 * u} 0 0 0 ${P(m, -40.5, 18)} L ${P(m, -43, 18)} L ${P(m, -43, 13.8)} L ${P(m, -36.5, 13.8)} Z`} fill={c.hatch} className="p-con" />
          <line x1={m.X(-36.5)} y1={m.Y(15)} x2={m.X(-39)} y2={m.Y(15)} className="p-cut thick" />
          <path d={`M ${P(m, -39, 15)} A ${u} ${u} 0 0 1 ${P(m, -40, 16)}`} className="p-arc thick" markerEnd={c.a("arc")} />
          <line x1={m.X(-40)} y1={m.Y(16)} x2={m.X(-40)} y2={m.Y(17.5)} className="p-cut thick" />
          <path d={`M ${P(m, -40, 17.5)} A ${0.5 * u} ${0.5 * u} 0 0 0 ${P(m, -40.5, 18)}`} className="p-arc thick" markerEnd={c.a("arc")} />
          <line x1={m.X(-40.5)} y1={m.Y(18)} x2={m.X(-43)} y2={m.Y(18)} className="p-cut thick" />
          <T x={m.X(-39.2)} y={m.Y(15.3)} cls="t-arc t-b">G02 R1</T>
          <T x={m.X(-40.2)} y={m.Y(18.6)} anchor="middle" cls="t-arc t-b">G03 R0,5</T>
          <Pt x={m.X(-39)} y={m.Y(15)} label="X30 Z−39" pos="se" cls="t-mono" dot="pt-cut" />
          <Pt x={m.X(-40)} y={m.Y(16)} label="X32 Z−40" pos="e" cls="t-mono" dot="pt-cut" />
          <Pt x={m.X(-40.5)} y={m.Y(18)} label="X36 Z−40,5" pos="nw" cls="t-mono" dot="pt-cut" />
        </g>
      )}
    </Fig>
  );
}

/* ================= T3.3: ten sam łuk z dwóch stron ================= */
function View({ x0, rear }: { x0: number; rear: boolean }) {
  const cy = rear ? 132 : 60, sgn = rear ? -1 : 1, r0 = 34, cx = x0 + 110;
  const y = (r: number) => cy + sgn * r;
  const arc = `M ${cx} ${y(r0)} A 18 18 0 0 ${rear ? 1 : 0} ${cx - 18} ${y(r0 + 18)}`;
  return (
    <g>
      <line x1={x0 + 6} y1={cy} x2={x0 + 170} y2={cy} className="p-cons" />
      <line x1={x0 + 170} y1={y(r0)} x2={cx} y2={y(r0)} className="p-cut thick" />
      <path d={arc} className="p-arc thick" markerEnd="url(#t33vw-a-arc)" />
      <line x1={cx - 18} y1={y(r0 + 18)} x2={x0 + 20} y2={y(r0 + 18)} className="p-cut thick" />
      <line x1={x0 + 150} y1={cy} x2={x0 + 150} y2={y(r0 + 26)} className="p-acc" markerEnd="url(#t33vw-a-acc)" />
      <T x={x0 + 156} y={y(r0 + 22)} cls="t-acc t-b">+X</T>
      <T x={x0 + 88} y={rear ? 186 : 22} anchor="middle" cls="t-b">{rear ? "głowica tylna" : "głowica przednia"}</T>
    </g>
  );
}
export function ArcViews() {
  return (
    <Fig id="t33vw" code="G02" title="Ten sam blok G02 widziany przy dwóch głowicach" h={200} legend={["arc", "acc"]}
      notes={<Code k="arc">w programie: G02 — w obu przypadkach</Code>}
      caption={<>Przy głowicy tylnej +X biegnie od operatora i łuk G02 wygląda zgodnie z zegarem. Przy przedniej +X biegnie do operatora — ten sam łuk wygląda z jego miejsca na przeciwny. Kierunek odczytuje się zawsze z rysunku w układzie X w górę, a nie przez szybę.</>}>
      {() => <g><View x0={2} rear={false} /><View x0={184} rear /></g>}
    </Fig>
  );
}

export const t3Figs = {
  "t31-pass": () => <PassLoop />,
  "t32-contour": () => <FinishContour />,
  "t32-rough": () => <RoughLayers />,
  "t33-arcs": () => <StepArcs />,
  "t33-views": () => <ArcViews />,
};
