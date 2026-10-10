import { Code, Fig, mapper, Pt, Step, T, Dim } from "@/components/fig";

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
      caption={<>Przy ruchu szybkim osie często jadą niezależnie, każda z pełną prędkością. Oś Z kończy wcześniej i reszta drogi biegnie nisko — prosto na docisk. Bezpiecznie: najpierw XY wysoko, potem sam Z w dół. Frez Ø10 w X−20 ma krawędzie w X−25 i X−15, więc do detalu (X0) zostaje 15 mm. Docisk i szczęki trzeba sprawdzić osobno — ich położenie wynika z ustawienia detalu.</>}>
      {(c) => (
        <g>
          <rect x={m.X(0)} y={m.Y(0)} width={60 * m.u} height={20 * m.u} fill={c.hatch} className="p-con" />
          <rect x={m.X(-8)} y={m.Y(9)} width={14 * m.u} height={9 * m.u} rx={2} className="clamp" />
          <T x={m.X(-1)} y={m.Y(4.5) + 4} anchor="middle" cls="t-mut t-sm">docisk</T>
          <line x1={m.X(-36)} y1={m.Y(0)} x2={m.X(66)} y2={m.Y(0)} className="p-cons" />
          <T x={m.X(64)} y={m.Y(0) - 5} anchor="end" cls="t-mut t-mono">Z0</T>
          <line x1={m.X(S.x)} y1={m.Y(S.z)} x2={m.X(E.x) + 3} y2={m.Y(S.z)} className="p-rap thick" markerEnd={c.a("rap")} />
          <line x1={m.X(E.x)} y1={m.Y(S.z)} x2={m.X(E.x)} y2={m.Y(E.z) - 3} className="p-rap thick" markerEnd={c.a("rap")} />
          <polyline points={`${m.X(S.x)},${m.Y(S.z)} ${m.X(knee.x)},${m.Y(knee.z)} ${m.X(E.x) + 3},${m.Y(E.z)}`} className="p-bad" markerEnd={c.a("bad")} />
          <T x={m.X(10)} y={m.Y(26)} cls="t-bad">razem z Z</T>
          <T x={m.X(8)} y={m.Y(S.z) - 7} anchor="middle" cls="t-rap t-b">1. XY wysoko</T>
          <T x={m.X(E.x) - 5} y={m.Y(28)} anchor="end" cls="t-rap t-b">2. Z w dół</T>
          <Pt x={m.X(S.x)} y={m.Y(S.z)} label="Z50." pos="ne" cls="t-mono t-b" />
          {/* frez Ø10 w pozycji końcowej: krawędzie X−25 i X−15 */}
          <rect x={m.X(-25)} y={m.Y(E.z + 14)} width={10 * m.u} height={14 * m.u} className="cutter" opacity={0.55} />
          <Pt x={m.X(E.x)} y={m.Y(E.z)} label="X−20 Z5" pos="sw" cls="t-mono t-b" dot="pt-rap" />
          <line x1={m.X(-25)} y1={m.Y(E.z)} x2={m.X(-25)} y2={m.Y(-12)} className="p-ext" />
          <line x1={m.X(-15)} y1={m.Y(E.z)} x2={m.X(-15)} y2={m.Y(-12)} className="p-ext" />
          <Dim c={c} x1={m.X(-15)} y1={m.Y(-10)} x2={m.X(0)} y2={m.Y(-10)} label="15" lside={1} />
          <T x={m.X(-25)} y={m.Y(-12) + 13} anchor="middle" cls="t-mono t-sm">X−25</T>
          <T x={m.X(-15)} y={m.Y(-12) + 13} anchor="middle" cls="t-mono t-sm">X−15</T>
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

/* ================= F3.2: przykład — tor środka wokół płytki ================= */
export function PlatePath() {
  const R: [number, number, number, number] = [-26, 100, -14, 66];
  const m = mapper(R, [10, 8, 340, 214]);
  const P: [number, number][] = [[-5, 10], [-5, 55], [85, 55], [85, -5], [-5, -5], [-5, 10]];
  return (
    <Fig id="f32pp" code="G01" title="Płytka 80 × 50 i tor środka freza Ø10" h={232} legend={["cut", "stock"]}
      notes={<><Code k="cut">Y55. → X85. → Y-5. → X-5. → Y10.</Code></>}
      caption={<>Tor środka leży 5 mm (promień freza) od krawędzi, na zewnątrz płytki. Każdy wymiar toru to wymiar krawędzi ± 5. Numery odpowiadają krokom przykładu: lewa, górna, prawa i dolna krawędź.</>}>
      {(c) => (
        <g>
          <rect x={m.X(0)} y={m.Y(50)} width={80 * m.u} height={50 * m.u} fill={c.hatch} className="p-con" />
          <line x1={m.X(-20)} y1={m.Y(10)} x2={m.X(-5) - 3} y2={m.Y(10)} className="p-cut" markerEnd={c.a("cut")} />
          <Pt x={m.X(-20)} y={m.Y(10)} label="X−20 Y10" pos="n" cls="t-mono t-sm" dot="pt-cut" />
          {P.slice(0, -1).map((p, i) => {
            const q = P[i + 1];
            return <line key={i} x1={m.X(p[0])} y1={m.Y(p[1])} x2={m.X(q[0])} y2={m.Y(q[1])} className="p-cut thick" markerEnd={c.a("cut")} />;
          })}
          <T x={m.X(-5) - 6} y={m.Y(32)} anchor="end" cls="t-cut t-b t-mono">X−5</T>
          <T x={m.X(40)} y={m.Y(55) - 7} anchor="middle" cls="t-cut t-b t-mono">Y55</T>
          <T x={m.X(85) + 6} y={m.Y(25)} cls="t-cut t-b t-mono">X85</T>
          <T x={m.X(40)} y={m.Y(-5) + 15} anchor="middle" cls="t-cut t-b t-mono">Y−5</T>
          <Step x={m.X(-5) + 14} y={m.Y(32)} n={1} />
          <Step x={m.X(20)} y={m.Y(55) + 13} n={2} />
          <Step x={m.X(85) - 14} y={m.Y(25)} n={3} />
          <Step x={m.X(20)} y={m.Y(-5) - 13} n={4} />
          <Pt x={m.X(0)} y={m.Y(0)} label="W" pos="ne" cls="t-b" dot="pt-cut" />
        </g>
      )}
    </Fig>
  );
}

/* ================= F3.4: przykład — to samo naroże przez I, J ================= */
export function CornerIJ() {
  const R: [number, number, number, number] = [-14, 36, 20, 62];
  const m = mapper(R, [12, 6, 336, 226]);
  const part = `M ${m.X(0)} ${m.Y(20)} L ${m.X(0)} ${m.Y(40)} A ${10 * m.u} ${10 * m.u} 0 0 1 ${m.X(10)} ${m.Y(50)} L ${m.X(36)} ${m.Y(50)} L ${m.X(36)} ${m.Y(20)} Z`;
  return (
    <Fig id="f34ij" code="I J" title="Naroże przez I, J: wektor od startu do środka" h={248} legend={["arc", "acc", "stock"]}
      notes={<><Code k="arc">G02 X10. Y55. I15. J0.</Code></>}
      caption={<>I i J to przesunięcie od punktu startu łuku (X−5 Y40) do jego środka (X10 Y40): w X o 15, w Y o 0. 1 — I = 10 − (−5). 2 — J = 40 − 40. 3 — kierunek G02. 4 — punkt końcowy X10 Y55.</>}>
      {(c) => (
        <g>
          <path d={part} fill={c.hatch} className="p-con" />
          <path d={`M ${m.X(-5)} ${m.Y(40)} A ${15 * m.u} ${15 * m.u} 0 0 1 ${m.X(10)} ${m.Y(55)}`} className="p-arc thick" markerEnd={c.a("arc")} />
          <line x1={m.X(-5)} y1={m.Y(40)} x2={m.X(10) - 3} y2={m.Y(40)} className="p-acc thick" markerEnd={c.a("acc")} />
          <T x={m.X(2.5)} y={m.Y(40) - 8} anchor="middle" cls="t-acc t-b t-mono">I15</T>
          <Step x={m.X(2.5)} y={m.Y(40) + 16} n={1} />
          <T x={m.X(10) + 6} y={m.Y(40) - 8} cls="t-acc t-b t-mono">J0</T>
          <Step x={m.X(10) + 34} y={m.Y(40) - 12} n={2} />
          <Step x={m.X(-3)} y={m.Y(52)} n={3} />
          <Pt x={m.X(10)} y={m.Y(40)} label="środek X10 Y40" pos="s" cls="t-mono t-sm" />
          <Pt x={m.X(-5)} y={m.Y(40)} label="start X−5 Y40" pos="w" cls="t-mono t-b t-sm" dot="pt-cut" />
          <Pt x={m.X(10)} y={m.Y(55)} label="X10 Y55" pos="n" cls="t-mono t-b" dot="pt-cut" />
          <Step x={m.X(10) + 52} y={m.Y(55) - 14} n={4} />
        </g>
      )}
    </Fig>
  );
}

/* ================= F3.5: przykład — Z w czasie, postój na dnie ================= */
export function DwellTime() {
  // oś pozioma: czas w s (0–1,0), pionowa: Z (−3..6)
  const X = (t: number) => 60 + t * 270, Y = (z: number) => 30 + (6 - z) * 16;
  const pts: [number, number][] = [[0, 5], [0.26, -2], [0.46, -2], [0.5, 5], [1, 5]];
  return (
    <Fig id="f35dw" code="G04" title="Nawiercenie: Z w czasie przy S1500" h={206} legend={["cut", "rap", "acc"]}
      notes={<><Code k="cut">G01 Z-2. F80</Code><Code k="acc">G04 X0.2</Code><Code k="rap">G00 Z5.</Code></>}
      caption={<>1 — wejście z F80. 2 — postój 0,2 s na dnie: przy S1500 jeden obrót trwa 0,04 s, więc to 5 obrotów — co najmniej 3 wymagane. 3 — wyjście ruchem szybkim. Czasy wejścia i wyjścia są tu poglądowe.</>}>
      {() => (
        <g>
          <line x1={X(0)} y1={Y(0)} x2={X(1)} y2={Y(0)} className="p-cons" strokeDasharray="3 3" />
          <T x={X(0) - 6} y={Y(0) + 4} anchor="end" cls="t-mut t-sm">Z0</T>
          <T x={X(0) - 6} y={Y(5) + 4} anchor="end" cls="t-mono t-sm">Z5</T>
          <T x={X(0) - 6} y={Y(-2) + 4} anchor="end" cls="t-mono t-sm">Z−2</T>
          <line x1={X(pts[0][0])} y1={Y(pts[0][1])} x2={X(pts[1][0])} y2={Y(pts[1][1])} className="p-cut thick" />
          <line x1={X(pts[1][0])} y1={Y(pts[1][1])} x2={X(pts[2][0])} y2={Y(pts[2][1])} className="p-acc thick" />
          <line x1={X(pts[2][0])} y1={Y(pts[2][1])} x2={X(pts[3][0])} y2={Y(pts[3][1])} className="p-rap thick" />
          {[0, 1, 2, 3, 4, 5].map((k) => <line key={k} x1={X(0.26 + k * 0.04)} y1={Y(-2) + 5} x2={X(0.26 + k * 0.04)} y2={Y(-2) + 11} className="p-acc" />)}
          <T x={X(0.36)} y={Y(-2) + 25} anchor="middle" cls="t-acc t-b t-sm">0,2 s = 5 obrotów</T>
          <Step x={X(0.1)} y={Y(2)} n={1} />
          <Step x={X(0.36)} y={Y(-2) - 14} n={2} />
          <Step x={X(0.56)} y={Y(2)} n={3} />
          <T x={X(1)} y={Y(-3) + 18} anchor="end" cls="t-mut t-sm">czas →</T>
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
  "f32-path": () => <PlatePath />,
  "f34-ij": () => <CornerIJ />,
  "f35-dwell": () => <DwellTime />,
};
