import { Code, Dim, Fig, mapper, Pt, T } from "@/components/fig";

/* Rysunki modułu T6 — rowki i wiercenie osiowe. Z w prawo, X (promień) w górę. */

type M = ReturnType<typeof mapper>;
const P = (m: M, z: number, r: number) => `${m.X(z)},${m.Y(r)}`;

/* ================= T6.1: podcięcie pod gwint ================= */
export function ReliefGroove() {
  const R: [number, number, number, number] = [-25, -11, 6.5, 17.5];
  const m = mapper(R, [14, 6, 332, 214]);
  return (
    <Fig id="t61gr" code="G75" title="Podcięcie 4 × Ø17 nożem szerokim na 3 mm" h={240} legend={["cut", "acc", "stock"]}
      notes={<><Code k="acc">1. wcięcie: Z−19</Code><Code k="acc">2. wcięcie: Z−20</Code><Code k="con">P — lewe naroże</Code></>}
      caption={<>Rowek jest szerszy niż nóż, więc potrzeba dwóch wcięć. Nóż zmierzony na lewym narożu: Z w programie to położenie jego lewej krawędzi. Pierwsze wcięcie w Z−19 obrabia Z−19…−16, drugie w Z−20 dochodzi do stopnia.</>}>
      {(c) => (
        <g>
          <polygon points={`${P(m, -11, 6.5)} ${P(m, -11, 10)} ${P(m, -16, 10)} ${P(m, -16, 8.5)} ${P(m, -20, 8.5)} ${P(m, -20, 14)} ${P(m, -21, 15)} ${P(m, -25, 15)} ${P(m, -25, 6.5)}`} fill={c.hatch} className="p-con" />
          <rect x={m.X(-19)} y={m.Y(17.5)} width={3 * m.u} height={9 * m.u} className="p-fill-acc" style={{ stroke: "var(--accent)" }} />
          <rect x={m.X(-20)} y={m.Y(17.5)} width={3 * m.u} height={9 * m.u} className="p-cons" style={{ fill: "none" }} />
          <Pt x={m.X(-19)} y={m.Y(8.5)} label="P" pos="sw" cls="t-acc t-b" dot="pt-rap" />
          <Dim x1={m.X(-20)} y1={m.Y(10)} x2={m.X(-16)} y2={m.Y(10)} off={-m.u * 0.6} label="4" c={c} cls="t-mono" />
          <Dim x1={m.X(-14)} y1={m.Y(8.5)} x2={m.X(-14)} y2={m.Y(10)} label="1,5" c={c} lside={1} cls="t-mono" />
          <line x1={m.X(-16)} y1={m.Y(8.5)} x2={m.X(-13)} y2={m.Y(8.5)} className="p-cons" />
          <T x={m.X(-15.6)} y={m.Y(11.6)} cls="t-mut">Ø20 pod gwint</T>
          <T x={m.X(-18)} y={m.Y(7.3)} anchor="middle" cls="t-mono t-b">Ø17</T>
          <T x={m.X(-23)} y={m.Y(16)} cls="t-mut">stopień Ø30</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= T6.1: wcinanie z wycofaniem ================= */
export function GroovePeck() {
  const X = (z: number) => 90 + z * 30, Y = (r: number) => 30 + (11 - r) * 55;
  return (
    <Fig id="t61pk" code="P R" title="Jedno wcięcie G75 — schemat, skala powiększona" h={200} legend={["cut", "rap"]}
      notes={<><Code k="cut">P1500 — 1,5 mm na stronę</Code><Code k="rap">R0.5 — wycofanie</Code></>}
      caption={<>Nóż wcina się o P, cofa o R, żeby złamać wiór, i wcina dalej — aż do dna. Na dnie wraca ruchem szybkim do średnicy startowej i przesuwa się o Q na następne wcięcie. P i Q podaje się bez kropki, w mikrometrach: P1500 = 1,5 mm.</>}>
      {() => (
        <g>
          <line x1={X(0)} y1={Y(11)} x2={X(0)} y2={Y(9.5) - 3} className="p-cut thick" markerEnd="url(#t61pk-a-cut)" />
          <line x1={X(0) + 8} y1={Y(9.5)} x2={X(0) + 8} y2={Y(10) + 3} className="p-rap" markerEnd="url(#t61pk-a-rap)" />
          <line x1={X(0) + 16} y1={Y(10)} x2={X(0) + 16} y2={Y(8.5) - 3} className="p-cut thick" markerEnd="url(#t61pk-a-cut)" />
          <line x1={X(0) + 24} y1={Y(8.5)} x2={X(0) + 24} y2={Y(11) + 3} className="p-rap" markerEnd="url(#t61pk-a-rap)" />
          {[11, 10, 9.5, 8.5].map((r) => <line key={r} x1={X(0) - 30} y1={Y(r)} x2={X(0) + 60} y2={Y(r)} className="p-ext" />)}
          <T x={X(0) + 66} y={Y(11) + 4} cls="t-mono">Ø22 — start</T>
          <T x={X(0) + 66} y={Y(10) + 4} cls="t-mono t-rap">Ø20 — po wycofaniu</T>
          <T x={X(0) + 66} y={Y(9.5) + 4} cls="t-mono t-cut">Ø19 — 1. wejście</T>
          <T x={X(0) + 66} y={Y(8.5) + 4} cls="t-mono t-cut t-b">Ø17 — dno</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= T6.2: wiercenie osiowe ================= */
export function AxialDrill() {
  const R: [number, number, number, number] = [-20, 8, -9, 12];
  const m = mapper(R, [14, 6, 332, 210]);
  return (
    <Fig id="t62dr" code="G74" title="Wiercenie w osi: G74 z wejściami po 3 mm" h={236} legend={["cut", "rap", "stock"]}
      notes={<><Code k="cut">G74 Z-15. Q3000 F0.08</Code><Code k="con">G97 S1200</Code></>}
      caption={<>Wiertło stoi w osi (X0), detal się obraca. G74 wchodzi po Q = 3 mm, cofa się o R i wchodzi dalej, aż do Z−15. Obroty stałe (G97), bo w osi średnica jest zerowa.</>}>
      {(c) => (
        <g>
          <rect x={m.X(-20)} y={m.Y(10)} width={20 * m.u} height={20 * m.u} fill={c.hatch} className="p-con" />
          <polygon points={`${P(m, 0, 4)} ${P(m, -13.8, 4)} ${P(m, -15, 0)} ${P(m, -13.8, -4)} ${P(m, 0, -4)}`} className="panel-bg" style={{ stroke: "var(--ink-2)" }} />
          <line x1={m.X(-20)} y1={m.Y(0)} x2={m.X(8)} y2={m.Y(0)} className="p-cons" />
          <polygon points={`${P(m, 2, 4)} ${P(m, 2, -4)} ${P(m, 7, -4)} ${P(m, 7, 4)}`} className="cutter" />
          <Dim x1={m.X(0)} y1={m.Y(8)} x2={m.X(-15)} y2={m.Y(8)} off={-10} label="Z−15" c={c} cls="t-mono t-b" />
          <T x={m.X(-7)} y={m.Y(5.2)} anchor="middle" cls="t-mono t-b">Ø8</T>
          <T x={m.X(4.5)} y={m.Y(-6)} anchor="middle" cls="t-mut t-sm">wiertło</T>
        </g>
      )}
    </Fig>
  );
}

export const t6Figs = {
  "t61-groove": () => <ReliefGroove />,
  "t61-peck": () => <GroovePeck />,
  "t62-drill": () => <AxialDrill />,
};
