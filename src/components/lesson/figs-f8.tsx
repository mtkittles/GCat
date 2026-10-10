import { Code, Dim, Fig, mapper, Pt, Step, T } from "@/components/fig";

/* F8.1 — zadanie końcowe: płytka 60 × 40, naroża R6, zero na środku, frez Ø12. */

type M = ReturnType<typeof mapper>;
const R: [number, number, number, number] = [-52, 40, -30, 30];

/** Łuk w SVG: g03 = przeciwnie do zegara w układzie X w prawo, Y w górę. */
const arc = (m: M, x: number, y: number, r: number, g03: boolean) => `A ${r * m.u} ${r * m.u} 0 0 ${g03 ? 0 : 1} ${m.X(x)} ${m.Y(y)}`;

function outline(m: M) {
  return [
    `M ${m.X(-30)} ${m.Y(0)}`, `L ${m.X(-30)} ${m.Y(14)}`, arc(m, -24, 20, 6, false),
    `L ${m.X(24)} ${m.Y(20)}`, arc(m, 30, 14, 6, false), `L ${m.X(30)} ${m.Y(-14)}`, arc(m, 24, -20, 6, false),
    `L ${m.X(-24)} ${m.Y(-20)}`, arc(m, -30, -14, 6, false), "Z",
  ].join(" ");
}

export function F81Part() {
  const m = mapper(R, [10, 8, 340, 236]);
  return (
    <Fig id="f81pt" code="XY" title="Nowy detal: płytka 60 × 40, zero na środku" h={256} legend={["con", "dim", "acc"]}
      notes={<><Code k="con">X −30…30</Code><Code k="con">Y −20…20</Code><Code k="con">naroża R6</Code><Code k="acc">kontur gł. 4 · frez Ø12</Code></>}
      caption={<>Zero <b>W</b> leży na środku górnej powierzchni, więc połowa współrzędnych jest ujemna. Krawędzie: X±30 i Y±20. Łuk naroża zaczyna się 6 mm przed narożnikiem — w X±24 albo Y±14.</>}>
      {(c) => (
        <g>
          <path d={outline(m)} style={{ fill: c.hatch }} className="p-con" />
          <line x1={m.X(-50)} y1={m.Y(0)} x2={m.X(38)} y2={m.Y(0)} className="axis-c" />
          <line x1={m.X(0)} y1={m.Y(-28)} x2={m.X(0)} y2={m.Y(28)} className="axis-c" />
          <Dim x1={m.X(-30)} y1={m.Y(-20)} x2={m.X(30)} y2={m.Y(-20)} off={16} label="60" c={c} />
          <Dim x1={m.X(30)} y1={m.Y(-20)} x2={m.X(30)} y2={m.Y(20)} off={16} label="40" c={c} lside={1} />
          <line x1={m.X(24)} y1={m.Y(14)} x2={m.X(28.24)} y2={m.Y(18.24)} className="p-dim" markerEnd={c.a("dim")} />
          <T x={m.X(20)} y={m.Y(12)} cls="t-mono t-dim">R6</T>
          <Pt x={m.X(0)} y={m.Y(0)} label="W" pos="ne" cls="t-acc t-b" dot="pt-rap" />
          <Pt x={m.X(-30)} y={m.Y(14)} label="X−30 Y14" pos="w" />
          <Pt x={m.X(-24)} y={m.Y(20)} label="X−24 Y20" pos="n" />
        </g>
      )}
    </Fig>
  );
}

export function F81Path() {
  const m = mapper(R, [10, 8, 340, 236]);
  return (
    <Fig id="f81pa" code="G41" title="Tor programu: zejście, najazd, obieg, odjazd" h={256} legend={["rap", "cut", "arc", "con"]}
      notes={<><Code k="rap">G00 X-46. Y-8.</Code><Code k="cut">G41 D1 G01 X-38.</Code><Code k="arc">G03 X-30. Y0. R8.</Code><Code k="arc">G03 X-38. Y8. R8.</Code></>}
      caption={<>Program opisuje kontur z rysunku, a odsunięcie o promień 6 mm robi korekcja G41. Łuk najazdu R8 jest większy niż promień freza. Numery to kroki przykładu.</>}>
      {(c) => (
        <g>
          <path d={outline(m)} style={{ fill: c.hatch }} className="p-con" />
          <line x1={m.X(-46)} y1={m.Y(-8)} x2={m.X(-38)} y2={m.Y(-8)} className="p-cut" markerEnd={c.a("cut")} />
          <path d={`M ${m.X(-38)} ${m.Y(-8)} ${arc(m, -30, 0, 8, true)}`} className="p-arc" markerEnd={c.a("arc")} />
          <path d={`M ${m.X(-30)} ${m.Y(0)} L ${m.X(-30)} ${m.Y(14)} ${arc(m, -24, 20, 6, false)} L ${m.X(-4)} ${m.Y(20)}`} className="p-cut thick" markerEnd={c.a("cut")} />
          <path d={`M ${m.X(-30)} ${m.Y(0)} ${arc(m, -38, 8, 8, true)}`} className="p-arc" markerEnd={c.a("arc")} />
          <line x1={m.X(-38)} y1={m.Y(8)} x2={m.X(-46)} y2={m.Y(8)} className="p-cut" markerEnd={c.a("cut")} />
          <Pt x={m.X(0)} y={m.Y(0)} label="W" pos="se" cls="t-acc t-b" dot="pt-rap" />
          <Pt x={m.X(-46)} y={m.Y(-8)} dot="pt-rap" />
          <Step x={m.X(-46) - 4} y={m.Y(-8) + 15} n={1} />
          <Step x={m.X(-38)} y={m.Y(-8) + 15} n={2} />
          <Step x={m.X(-30) + 13} y={m.Y(0) + 3} n={3} />
          <Step x={m.X(-24) + 6} y={m.Y(20) - 13} n={4} />
          <Step x={m.X(-42)} y={m.Y(8) - 14} n={5} />
          <T x={m.X(6)} y={m.Y(-10) + 4} anchor="middle" cls="t-mut t-sm">obieg zgodnie z zegarem</T>
        </g>
      )}
    </Fig>
  );
}

export const f8Figs = {
  "f81-part": () => <F81Part />,
  "f81-path": () => <F81Path />,
};
