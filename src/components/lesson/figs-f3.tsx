import { Code, Fig, mapper, Pt, T } from "@/components/fig";

/* Rysunki modułu F3 — ruchy. Styl i kolory z fig.tsx. */

/* ================= F3.1: bezpieczny najazd ================= */
export function SafeApproach() {
  const R: [number, number, number, number] = [-36, 66, -24, 56];
  const m = mapper(R, [10, 6, 340, 232]);
  const S = { x: 40, z: 50 }, E = { x: -20, z: 5 };
  const knee = { x: S.x - (S.z - E.z), z: E.z };
  return (
    <Fig id="f31ap" code="G00" title="Najazd ruchem szybkim — widok z boku" h={250} legend={["rap", "bad", "stock"]}
      notes={<><Code k="rap">G00 X-20. Y10.</Code><Code k="rap">G00 Z5.</Code><Code k="bad">G00 X-20. Y10. Z5.</Code></>}
      caption={<>Przy ruchu szybkim osie często jadą niezależnie, każda z pełną prędkością. Oś Z kończy wcześniej i reszta drogi biegnie nisko — prosto na docisk. Bezpiecznie: najpierw XY wysoko, potem sam Z w dół.</>}>
      {(c) => (
        <g>
          <rect x={m.X(0)} y={m.Y(0)} width={60 * m.u} height={20 * m.u} fill={c.hatch} className="p-con" />
          <rect x={m.X(-8)} y={m.Y(9)} width={14 * m.u} height={9 * m.u} rx={2} className="clamp" />
          <T x={m.X(-1)} y={m.Y(9) - 5} anchor="middle" cls="t-mut">docisk</T>
          <line x1={m.X(-36)} y1={m.Y(0)} x2={m.X(66)} y2={m.Y(0)} className="p-cons" />
          <T x={m.X(64)} y={m.Y(0) - 5} anchor="end" cls="t-mut t-mono">Z0</T>
          <line x1={m.X(S.x)} y1={m.Y(S.z)} x2={m.X(E.x) + 3} y2={m.Y(S.z)} className="p-rap thick" markerEnd={c.a("rap")} />
          <line x1={m.X(E.x)} y1={m.Y(S.z)} x2={m.X(E.x)} y2={m.Y(E.z) - 3} className="p-rap thick" markerEnd={c.a("rap")} />
          <polyline points={`${m.X(S.x)},${m.Y(S.z)} ${m.X(knee.x)},${m.Y(knee.z)} ${m.X(E.x) + 3},${m.Y(E.z)}`} className="p-bad" markerEnd={c.a("bad")} />
          <T x={m.X(10)} y={m.Y(26)} cls="t-bad">razem z Z</T>
          <T x={m.X(8)} y={m.Y(S.z) - 7} anchor="middle" cls="t-rap t-b">1. XY wysoko</T>
          <T x={m.X(E.x) - 5} y={m.Y(28)} anchor="end" cls="t-rap t-b">2. Z w dół</T>
          <Pt x={m.X(S.x)} y={m.Y(S.z)} label="Z50." pos="ne" cls="t-mono t-b" />
          <Pt x={m.X(E.x)} y={m.Y(E.z)} label="X−20 Z5" pos="sw" cls="t-mono t-b" dot="pt-rap" />
        </g>
      )}
    </Fig>
  );
}


/* ================= F3.3: znak R ================= */
export function RSign() {
  const A = { x: 110, y: 146 }, B = { x: 250, y: 146 }, r = 86;
  return (
    <Fig id="f33rs" code="R±" title="Te same punkty, ten sam promień, dwa łuki G02" h={196} legend={["arc"]}
      notes={<><Code k="arc">G02 X… Y… R43.</Code><Code k="arc">G02 X… Y… R-43.</Code></>}
      caption={<>Z punktu A do B da się poprowadzić łuk krótki (do 180°) i długi (ponad 180°). Dodatnie R wybiera krótki, ujemne — długi. Pełnego okręgu przez R zapisać się nie da.</>}>
      {(c) => (
        <g>
          <path d={`M ${A.x} ${A.y} A ${r} ${r} 0 0 1 ${B.x} ${B.y}`} className="p-arc thick" markerEnd={c.a("arc")} />
          <path d={`M ${A.x} ${A.y} A ${r} ${r} 0 1 1 ${B.x} ${B.y}`} className="p-arc dashed" markerEnd={c.a("arc")} />
          <Pt x={A.x} y={A.y} label="A — start" pos="w" cls="t-b" />
          <Pt x={B.x} y={B.y} label="B — koniec" pos="e" cls="t-b" />
          <T x={180} y={138} anchor="middle" cls="t-arc t-b">R+ krótki</T>
          <T x={180} y={62} anchor="middle" cls="t-arc t-b">R− długi</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= F3.3: naroże płytki ================= */
export function CornerArc() {
  const R: [number, number, number, number] = [-14, 36, 20, 62];
  const m = mapper(R, [12, 6, 336, 226]);
  const C = { x: 10, y: 40 };
  const part = `M ${m.X(0)} ${m.Y(20)} L ${m.X(0)} ${m.Y(40)} A ${10 * m.u} ${10 * m.u} 0 0 1 ${m.X(10)} ${m.Y(50)} L ${m.X(36)} ${m.Y(50)} L ${m.X(36)} ${m.Y(20)} Z`;
  return (
    <Fig id="f33co" code="R15" title="Naroże R10 detalu i tor środka freza Ø10" h={248} legend={["cut", "arc", "stock"]}
      notes={<><Code k="con">naroże detalu R10</Code><Code k="arc">G02 X10. Y55. R15.</Code></>}
      caption={<>Środek łuku narzędzia leży w środku naroża detalu. Promień toru to promień naroża plus promień freza: 10 + 5 = 15. Łuk styka się z odcinkami w X−5 Y40 i X10 Y55.</>}>
      {(c) => (
        <g>
          <path d={part} fill={c.hatch} className="p-con" />
          <line x1={m.X(-5)} y1={m.Y(20)} x2={m.X(-5)} y2={m.Y(40)} className="p-cut thick" />
          <path d={`M ${m.X(-5)} ${m.Y(40)} A ${15 * m.u} ${15 * m.u} 0 0 1 ${m.X(10)} ${m.Y(55)}`} className="p-arc thick" markerEnd={c.a("arc")} />
          <line x1={m.X(10)} y1={m.Y(55)} x2={m.X(36)} y2={m.Y(55)} className="p-cut thick" />
          <circle cx={m.X(-5)} cy={m.Y(40)} r={5 * m.u} className="tool" />
          <line x1={m.X(C.x)} y1={m.Y(C.y)} x2={m.X(C.x) - 15 * m.u * Math.cos(Math.PI / 4)} y2={m.Y(C.y) - 15 * m.u * Math.sin(Math.PI / 4)} className="p-dim" />
          <T x={m.X(C.x) - 7.5 * m.u * Math.cos(Math.PI / 4) + 6} y={m.Y(C.y) - 7.5 * m.u * Math.sin(Math.PI / 4) + 12} cls="t-arc t-b t-mono">R15</T>
          <line x1={m.X(C.x)} y1={m.Y(C.y)} x2={m.X(C.x) - 10 * m.u * Math.cos(Math.PI / 3)} y2={m.Y(C.y) - 10 * m.u * Math.sin(Math.PI / 3)} className="p-cons" />
          <Pt x={m.X(C.x)} y={m.Y(C.y)} label="środek X10 Y40" pos="se" cls="t-mono" />
          <Pt x={m.X(-5)} y={m.Y(40)} label="X−5 Y40" pos="w" cls="t-mono t-b" dot="pt-cut" />
          <Pt x={m.X(10)} y={m.Y(55)} label="X10 Y55" pos="n" cls="t-mono t-b" dot="pt-cut" />
        </g>
      )}
    </Fig>
  );
}

/* ================= F3.4: pełny okrąg przez I ================= */
export function FullCircle() {
  const R: [number, number, number, number] = [-6, 86, -6, 56];
  const m = mapper(R, [12, 6, 336, 214]);
  const C = { x: 40, y: 25 }, r = 10;
  return (
    <Fig id="f34fc" code="I J" title="Pełny okrąg: start = koniec, środek przez I i J" h={236} legend={["arc", "acc", "stock"]}
      notes={<><Code k="arc">G02 I-10. J0.</Code><Code k="acc">I = X środka − X startu</Code></>}
      caption={<>Frez startuje w X50 Y25. Środek okręgu leży 10 mm w lewo, więc I−10, J0. Blok bez X i Y kończy łuk w punkcie startu — powstaje pełny okrąg.</>}>
      {(c) => (
        <g>
          <rect x={m.X(0)} y={m.Y(50)} width={80 * m.u} height={50 * m.u} fill={c.hatch} className="p-con" />
          <circle cx={m.X(C.x)} cy={m.Y(C.y)} r={r * m.u} className="p-arc thick" />
          <path d={`M ${m.X(50)} ${m.Y(25)} A ${r * m.u} ${r * m.u} 0 0 1 ${m.X(40)} ${m.Y(15)}`} className="p-arc thick" markerEnd={c.a("arc")} />
          <line x1={m.X(50)} y1={m.Y(25) - 14} x2={m.X(40) + 2} y2={m.Y(25) - 14} className="p-acc" markerEnd={c.a("acc")} />
          <T x={m.X(45)} y={m.Y(25) - 20} anchor="middle" cls="t-acc t-b t-mono">I−10</T>
          <Pt x={m.X(C.x)} y={m.Y(C.y)} label="środek X40 Y25" pos="sw" cls="t-mono" />
          <Pt x={m.X(50)} y={m.Y(25)} label="start = koniec" pos="e" cls="t-mono t-b" dot="pt-cut" />
          <Pt x={m.X(0)} y={m.Y(0)} label="W" pos="sw" cls="t-b" />
        </g>
      )}
    </Fig>
  );
}

export const f3Figs = {
  "f31-approach": () => <SafeApproach />,
  "f33-rsign": () => <RSign />,
  "f33-corner": () => <CornerArc />,
  "f34-circle": () => <FullCircle />,
};
