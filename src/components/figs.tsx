import { Code, Dim, Fig, Grid, mapper, Pt, Step, T } from "./fig";

/* ================= G02 / G03: I/J kontra R ================= */
export function ArcIJ({ dir }: { dir: 2 | 3 }) {
  const R: [number, number, number, number] = [-15, 85, -14, 85];
  const m = mapper(R, [30, 12, 318, 250]);
  const A = { x: 20, y: 20 }, B = { x: 50, y: 50 };
  const S = dir === 2 ? { x: 50, y: 20 } : { x: 20, y: 50 };   // środek łuku krótszego
  const S2 = dir === 2 ? { x: 20, y: 50 } : { x: 50, y: 20 };  // środek łuku dłuższego (R ujemne)
  const r = 30 * m.u, sw = dir === 2 ? 1 : 0;
  const short = `M ${m.X(A.x)} ${m.Y(A.y)} A ${r} ${r} 0 0 ${sw} ${m.X(B.x)} ${m.Y(B.y)}`;
  const long = `M ${m.X(A.x)} ${m.Y(A.y)} A ${r} ${r} 0 1 ${sw} ${m.X(B.x)} ${m.Y(B.y)}`;
  const g = dir === 2 ? "G02" : "G03";
  const ij = dir === 2 ? "I30 J0" : "I0 J30";
  return (
    <Fig id={`arc${dir}`} code={g} title="Łuk: środek I/J albo promień R" h={276} legend={["arc", "bad", "acc"]}
      notes={<><Code k="arc">{g} X50 Y50 {ij}</Code><Code k="arc">{g} X50 Y50 R30</Code><Code k="bad">{g} X50 Y50 R−30</Code></>}
      caption={<>Start A, koniec B, środek S. I i J to odległość od <b>punktu startu</b> do środka. Dodatnie R wybiera łuk do 180°, ujemne R — dłuższy.</>}>
      {(c) => (
        <g>
          <Grid m={m} range={R} c={c} />
          <circle cx={m.X(S.x)} cy={m.Y(S.y)} r={r} className="p-cons" />
          <circle cx={m.X(S2.x)} cy={m.Y(S2.y)} r={r} className="p-cons" />
          <path d={long} className="p-bad" markerEnd={c.a("bad")} />
          <path d={short} className="p-arc thick" markerEnd={c.a("arc")} />
          {dir === 2
            ? <line x1={m.X(A.x)} y1={m.Y(A.y)} x2={m.X(S.x) - 5} y2={m.Y(S.y)} className="p-acc" markerEnd={c.a("acc")} />
            : <line x1={m.X(A.x)} y1={m.Y(A.y)} x2={m.X(S.x)} y2={m.Y(S.y) + 5} className="p-acc" markerEnd={c.a("acc")} />}
          {dir === 2
            ? <T x={m.X(35)} y={m.Y(20) + 16} anchor="middle" cls="t-mono t-acc t-b">I = 30</T>
            : <T x={m.X(20) - 8} y={m.Y(35) + 4} anchor="end" cls="t-mono t-acc t-b">J = 30</T>}
          <Pt x={m.X(A.x)} y={m.Y(A.y)} label="A (20, 20)" pos={dir === 2 ? "sw" : "se"} />
          <Pt x={m.X(B.x)} y={m.Y(B.y)} label="B (50, 50)" pos="ne" />
          <Pt x={m.X(S.x)} y={m.Y(S.y)} label={`S (${S.x}, ${S.y})`} pos={dir === 2 ? "se" : "nw"} cls="t-arc t-b" dot="pt-arc" />
          <T x={dir === 2 ? m.X(-12) : m.X(84)} y={dir === 2 ? m.Y(80) : m.Y(62)} anchor={dir === 2 ? "start" : "end"} cls="t-bad">łuk dla R−30</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= G41 / G42 ================= */
export function Comp() {
  const R: [number, number, number, number] = [-12, 78, -24, 64];
  const m = mapper(R, [26, 10, 322, 236]);
  const r = 8;
  return (
    <Fig id="comp" code="G41 G42" title="Po której stronie konturu jedzie frez" h={262} legend={["cut", "con", "stock", "dim"]}
      caption={<>Patrz w kierunku ruchu. <b>G41</b>: frez po lewej stronie konturu, <b>G42</b>: po prawej. Tor środka jest odsunięty o promień <b>r</b> z rejestru D.</>}>
      {(c) => (
        <g>
          <Grid m={m} range={R} c={c} ticks={false} />
          <rect x={m.X(0)} y={m.Y(40)} width={60 * m.u} height={40 * m.u} fill={c.hatch} className="p-con" />
          <T x={m.X(30)} y={m.Y(20) + 4} anchor="middle" cls="t-b">detal</T>
          {/* G41 — górna krawędź, ruch w +X, frez nad konturem */}
          <line x1={m.X(-6)} y1={m.Y(40 + r)} x2={m.X(66)} y2={m.Y(40 + r)} className="p-cut thick" markerEnd={c.a("cut")} />
          <circle cx={m.X(18)} cy={m.Y(40 + r)} r={r * m.u} className="tool" />
          <circle cx={m.X(18)} cy={m.Y(40 + r)} r={1.8} className="pt-cut" />
          <T x={m.X(-10)} y={m.Y(58)} cls="t-cut t-b">G41 — frez po lewej</T>
          <Dim x1={m.X(44)} y1={m.Y(40)} x2={m.X(44)} y2={m.Y(40 + r)} label="r" c={c} lside={1} cls="t-mono t-acc t-b" />
          {/* G42 — dolna krawędź, ruch w +X, frez pod konturem */}
          <line x1={m.X(-6)} y1={m.Y(-r)} x2={m.X(66)} y2={m.Y(-r)} className="p-cut thick" markerEnd={c.a("cut")} />
          <circle cx={m.X(18)} cy={m.Y(-r)} r={r * m.u} className="tool" />
          <circle cx={m.X(18)} cy={m.Y(-r)} r={1.8} className="pt-cut" />
          <T x={m.X(-10)} y={m.Y(-21)} cls="t-cut t-b">G42 — frez po prawej</T>
          <T x={m.X(70)} y={m.Y(40 + r) + 4} cls="t-mut">ruch</T>
          <T x={m.X(70)} y={m.Y(-r) + 4} cls="t-mut">ruch</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= cykl wiercenia: G98 / G99 ================= */
export function CycleRetract() {
  // widok z boku: poziomo X, pionowo Z (w pikselach)
  const x = (v: number) => 34 + v * 3.1, z = (v: number) => 128 - v * 3.3;
  const holes = [15, 85];
  return (
    <Fig id="cyc" code="G98 G99" title="Powrót po otworze: poziom początkowy albo R" h={250} legend={["rap", "cut", "bad", "stock"]}
      caption={<>Między otworami stoi zacisk. Z <b>G99</b> narzędzie przejeżdża na wysokości <b>R</b> i uderza w zacisk. Z <b>G98</b> wraca na poziom początkowy i przechodzi nad nim.</>}>
      {(c) => (
        <g>
          <rect x={x(0)} y={z(0)} width={x(100) - x(0)} height={z(-30) - z(0)} fill={c.hatch} className="p-con" />
          <rect x={x(42)} y={z(14)} width={x(58) - x(42)} height={z(0) - z(14)} className="clamp" />
          <T x={x(50)} y={z(14) - 5} anchor="middle" cls="t-mut">zacisk</T>
          {holes.map((h) => <rect key={h} x={x(h) - 5} y={z(0)} width={10} height={z(-18) - z(0)} className="hole" />)}
          {/* poziomy */}
          <line x1={x(-4)} y1={z(30)} x2={x(104)} y2={z(30)} className="p-cons" />
          <line x1={x(-4)} y1={z(3)} x2={x(104)} y2={z(3)} className="p-cons" />
          <T x={x(104)} y={z(30) - 5} anchor="end" cls="t-mono">poziom początkowy</T>
          <T x={x(104)} y={z(3) - 5} anchor="end" cls="t-mono t-acc">R</T>
          <T x={x(104)} y={z(0) + 13} anchor="end" cls="t-mono t-mut">Z0</T>
          {/* otwór 1: wiercenie */}
          <line x1={x(15)} y1={z(30)} x2={x(15)} y2={z(3)} className="p-rap" />
          <line x1={x(15)} y1={z(3)} x2={x(15)} y2={z(-18)} className="p-cut thick" markerEnd={c.a("cut")} />
          {/* G98: w górę do poziomu początkowego i nad zaciskiem */}
          <polyline points={`${x(15) + 5},${z(-18)} ${x(15) + 5},${z(30) - 3} ${x(85)},${z(30) - 3} ${x(85)},${z(3)}`} className="p-rap" markerEnd={c.a("rap")} />
          <T x={x(50)} y={z(30) - 10} anchor="middle" cls="t-rap t-b">G98</T>
          {/* G99: przejazd na R — kolizja */}
          <polyline points={`${x(15) - 5},${z(-18)} ${x(15) - 5},${z(3)} ${x(41)},${z(3)}`} className="p-bad" markerEnd={c.a("bad")} />
          <T x={x(28)} y={z(3) + 14} anchor="middle" cls="t-bad t-b">G99</T>
          <path d={`M ${x(41) - 5} ${z(3) - 5} l 10 10 M ${x(41) + 5} ${z(3) - 5} l -10 10`} className="p-bad thick" />
          <T x={x(15) - 8} y={z(-18) + 16} anchor="middle" cls="t-mono">Z</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= G90 / G91 ================= */
export function AbsInc() {
  const R: [number, number, number, number] = [-5, 62, -5, 42];
  const m = mapper(R, [30, 10, 320, 216]);
  return (
    <Fig id="absinc" code="G90 G91" title="Ten sam blok, dwa różne punkty" h={240} legend={["cut", "dim"]}
      notes={<><Code>G90 G01 X30 Y20</Code><Code>G91 G01 X30 Y20</Code></>}
      caption={<>Narzędzie stoi w punkcie <b>P (20, 10)</b>. W <b>G90</b> liczby to współrzędne punktu docelowego. W <b>G91</b> to przesunięcie od miejsca, w którym narzędzie stoi.</>}>
      {(c) => (
        <g>
          <Grid m={m} range={R} c={c} />
          <line x1={m.X(20)} y1={m.Y(10)} x2={m.X(30)} y2={m.Y(20)} className="p-cut thick" markerEnd={c.a("cut")} />
          <line x1={m.X(20)} y1={m.Y(10)} x2={m.X(50)} y2={m.Y(30)} className="p-cut thick dashed" markerEnd={c.a("cut")} />
          <Dim x1={m.X(20)} y1={m.Y(10)} x2={m.X(50)} y2={m.Y(10)} off={-14} label="ΔX = 30" c={c} lside={1} />
          <Dim x1={m.X(50)} y1={m.Y(10)} x2={m.X(50)} y2={m.Y(30)} off={14} label="ΔY = 20" c={c} lside={1} />
          <Pt x={m.X(20)} y={m.Y(10)} label="P (20, 10)" pos="w" />
          <Pt x={m.X(30)} y={m.Y(20)} label="G90 → (30, 20)" pos="nw" cls="t-cut t-b" dot="pt-cut" />
          <Pt x={m.X(50)} y={m.Y(30)} label="G91 → (50, 30)" pos="nw" cls="t-cut t-b" dot="pt-cut" />
        </g>
      )}
    </Fig>
  );
}

/* ================= G43 / G44 / G49 ================= */
export function ToolLen() {
  const gz = 30, surf = 190;
  return (
    <Fig id="tlen" code="G43 H" title="Długość narzędzia: od czoła wrzeciona do ostrza" h={236} legend={["dim", "acc", "stock"]}
      notes={<Code k="acc">G43 Z10 H01</Code>}
      caption={<>Sterowanie zna położenie czoła wrzeciona. <b>G43</b> dodaje długość z rejestru <b>H</b>, więc Z10 oznacza, że <b>ostrze</b> stoi 10 mm nad Z0 detalu. <b>G49</b> kasuje korekcję.</>}>
      {(c) => (
        <g>
          <rect x={120} y={4} width={70} height={gz - 4} className="spindle" />
          <T x={155} y={20} anchor="middle" cls="t-mut">wrzeciono</T>
          <line x1={60} y1={gz} x2={300} y2={gz} className="p-cons" />
          <T x={300} y={gz - 5} anchor="end" cls="t-mono">czoło wrzeciona</T>
          <rect x={138} y={gz} width={34} height={36} className="holder" />
          <rect x={148} y={gz + 36} width={14} height={78} className="cutter" />
          <line x1={60} y1={gz + 114} x2={300} y2={gz + 114} className="p-cons" />
          <T x={300} y={gz + 109} anchor="end" cls="t-mono t-acc">ostrze</T>
          <Dim x1={120} y1={gz} x2={120} y2={gz + 114} off={20} label="H01" c={c} lside={-1} cls="t-mono t-acc t-b" />
          <rect x={60} y={surf} width={240} height={40} fill={c.hatch} className="p-con" />
          <T x={300} y={surf - 5} anchor="end" cls="t-mono">Z0 (G54)</T>
          <Dim x1={200} y1={gz + 114} x2={200} y2={surf} off={-26} label="Z10" c={c} lside={1} cls="t-mono t-b" />
        </g>
      )}
    </Fig>
  );
}

/* ================= G17 / G18 / G19 ================= */
export function Planes() {
  const P = [
    { g: "G17", h: "X", v: "Y", n: "patrzysz z +Z", x: 8 },
    { g: "G18", h: "Z", v: "X", n: "patrzysz z +Y", x: 126 },
    { g: "G19", h: "Y", v: "Z", n: "patrzysz z +X", x: 244 },
  ];
  return (
    <Fig id="pl" code="G17 G18 G19" title="Płaszczyzna łuków i kompensacji" h={186} legend={["arc"]}
      caption={<>Kierunek G02 (zgodnie z zegarem) ocenia się, patrząc na płaszczyznę od strony dodatniej trzeciej osi. Frezarka startuje w <b>G17</b>, tokarka w <b>G18</b>.</>}>
      {(c) => (
        <g>
          {P.map((p) => (
            <g key={p.g} transform={`translate(${p.x} 0)`}>
              <rect x={0} y={6} width={108} height={170} rx={10} className="panel-bg" />
              <T x={54} y={26} anchor="middle" cls="t-mono t-b t-big">{p.g}</T>
              <line x1={22} y1={140} x2={94} y2={140} className="ax" markerEnd={c.a("dim")} />
              <line x1={22} y1={140} x2={22} y2={52} className="ax" markerEnd={c.a("dim")} />
              <T x={94} y={156} anchor="end" cls="t-ax">{p.h}</T>
              <T x={30} y={58} cls="t-ax">{p.v}</T>
              <path d="M 44 116 A 26 26 0 0 1 84 92" className="p-arc thick" markerEnd={c.a("arc")} />
              <T x={62} y={100} anchor="middle" cls="t-mono t-arc">G02</T>
              <T x={54} y={170} anchor="middle" cls="t-mut t-sm">{p.n}</T>
            </g>
          ))}
        </g>
      )}
    </Fig>
  );
}

/* ================= G71 (tokarka, zgrubnie) ================= */
export function LatheRough() {
  // Z poziomo (w lewo ujemne), X pionowo jako promień
  const zx = (v: number) => 322 + v * 5.4, xx = (v: number) => 196 - v * 5.6;
  const prof: [number, number][] = [[0, 10], [-12, 10], [-12, 15], [-26, 15], [-36, 22], [-50, 22]];
  const u = 1.2;
  const rough: number[] = [22.5, 20, 17.5, 15, 12.5];
  const zAt = (xr: number) => { // koniec przejścia: gdzie kontur (+naddatek) osiąga promień xr
    if (xr > 22 + u) return -50;
    if (xr > 15 + u) return -26 - ((xr - 15 - u) / 7) * 10 - 1.4;
    if (xr > 10 + u) return -12 - 0.8;
    return 0;
  };
  return (
    <Fig id="g71" code="G71" title="Toczenie zgrubne warstwami wzdłuż osi Z" h={236} legend={["cut", "rap", "con", "dim"]}
      caption={<>Nóż zbiera materiał przejściami równoległymi do osi, każde głębsze o <b>Δd</b> (U w 1. bloku). Wzdłuż konturu zostaje naddatek na wykończenie, który zbiera <b>G70</b>.</>}>
      {(c) => (
        <g>
          <line x1={zx(-54)} y1={xx(0)} x2={zx(4)} y2={xx(0)} className="axis-c" />
          <T x={zx(4)} y={xx(0) + 14} anchor="end" cls="t-ax">Z</T>
          <line x1={zx(0)} y1={xx(-1)} x2={zx(0)} y2={xx(28)} className="ax" markerEnd={c.a("dim")} />
          <T x={zx(0) + 6} y={xx(28) + 4} cls="t-ax">X</T>
          <rect x={zx(-50)} y={xx(25)} width={zx(0) - zx(-50)} height={xx(0) - xx(25)} className="stock-out" />
          <polygon points={[...prof.map(([z, r]) => `${zx(z)},${xx(r)}`), `${zx(-50)},${xx(0)}`, `${zx(0)},${xx(0)}`].join(" ")} fill={c.hatch} className="p-con" />
          <polyline points={prof.map(([z, r]) => `${zx(z) + 3},${xx(r) - 5}`).join(" ")} className="p-cons" />
          {rough.map((xr, i) => {
            const ze = zAt(xr);
            return (
              <g key={xr}>
                <line x1={zx(2)} y1={xx(xr)} x2={zx(ze)} y2={xx(xr)} className="p-cut" markerEnd={i === 0 ? c.a("cut") : undefined} />
                <line x1={zx(ze)} y1={xx(xr)} x2={zx(ze) + 5} y2={xx(xr) - 5} className="p-rap" />
              </g>
            );
          })}
          <Dim x1={zx(-4)} y1={xx(22.5)} x2={zx(-4)} y2={xx(20)} off={0} label="Δd" c={c} lside={1} cls="t-mono t-acc t-b" />
          <T x={zx(-31)} y={xx(22) - 30} anchor="middle" cls="t-mut">naddatek u/2, w</T>
          <T x={zx(-25)} y={xx(5)} anchor="middle" cls="t-b">detal</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= G15 / G16 ================= */
export function Polar() {
  const R: [number, number, number, number] = [-52, 52, -50, 50];
  const m = mapper(R, [34, 10, 300, 232]);
  const angs = [0, 60, 120, 180, 240, 300];
  const pt = (a: number) => ({ x: 40 * Math.cos((a * Math.PI) / 180), y: 40 * Math.sin((a * Math.PI) / 180) });
  const p60 = pt(60);
  return (
    <Fig id="polar" code="G16" title="Otwory na okręgu podziałowym" h={256} legend={["acc"]}
      notes={<><Code k="acc">G16</Code><Code>G81 X40 Y0 …</Code><Code>Y60</Code><Code>Y120 …</Code><Code k="acc">G15</Code></>}
      caption={<>Po <b>G16</b> w płaszczyźnie XY adres <b>X</b> to promień, a <b>Y</b> to kąt od osi +X, dodatni przeciwnie do ruchu wskazówek zegara. Biegun to zero układu (przy G90).</>}>
      {(c) => (
        <g>
          <Grid m={m} range={R} c={c} ticks={false} />
          <circle cx={m.X(0)} cy={m.Y(0)} r={40 * m.u} className="p-cons" />
          <line x1={m.X(0)} y1={m.Y(0)} x2={m.X(p60.x) - 3} y2={m.Y(p60.y) + 5} className="p-acc" markerEnd={c.a("acc")} />
          <path d={`M ${m.X(14)} ${m.Y(0)} A ${14 * m.u} ${14 * m.u} 0 0 0 ${m.X(14 * Math.cos(Math.PI / 3))} ${m.Y(14 * Math.sin(Math.PI / 3))}`} className="p-acc" markerEnd={c.a("acc")} />
          <T x={m.X(17)} y={m.Y(9)} cls="t-mono t-acc t-b">Y = 60°</T>
          <T x={m.X(p60.x / 2) - 10} y={m.Y(p60.y / 2)} anchor="end" cls="t-mono t-acc t-b">X = 40</T>
          {angs.map((a) => { const p = pt(a); return <circle key={a} cx={m.X(p.x)} cy={m.Y(p.y)} r={4.5} className="hole-top" />; })}
          <Pt x={m.X(0)} y={m.Y(0)} label="biegun" pos="sw" cls="t-mut" />
        </g>
      )}
    </Fig>
  );
}

/* ================= G83 kontra G73 ================= */
export function Peck() {
  const z = (v: number) => 56 - v * 8.4;           // R = +2, dno = −18
  type Mv = { k: "cut" | "rap"; a: number; b: number };
  const g83: Mv[] = [{ k: "cut", a: 2, b: -6 }, { k: "rap", a: -6, b: 2 }, { k: "rap", a: 2, b: -5 }, { k: "cut", a: -5, b: -12 }, { k: "rap", a: -12, b: 2 }, { k: "rap", a: 2, b: -11 }, { k: "cut", a: -11, b: -18 }, { k: "rap", a: -18, b: 2 }];
  const g73: Mv[] = [{ k: "cut", a: 2, b: -6 }, { k: "rap", a: -6, b: -5 }, { k: "cut", a: -5, b: -12 }, { k: "rap", a: -12, b: -11 }, { k: "cut", a: -11, b: -18 }, { k: "rap", a: -18, b: 2 }];
  const col = (x0: number, mv: Mv[], title: string, c: { a: (k: "cut" | "rap") => string }) => {
    const step = 34 / (mv.length - 1);
    return (
      <g>
        <T x={x0} y={18} anchor="middle" cls="t-mono t-b t-big">{title}</T>
        <rect x={x0 - 44} y={z(0)} width={88} height={z(-22) - z(0)} className="solid-hatch" />
        <rect x={x0 - 24} y={z(0)} width={48} height={z(-18) - z(0)} className="hole" />
        {mv.map((m, i) => {
          const x = x0 - 17 + i * step;
          return <g key={i}>
            {i > 0 && <line x1={x - step} y1={z(m.a)} x2={x} y2={z(m.a)} className="p-cons" />}
            <line x1={x} y1={z(m.a)} x2={x} y2={z(m.b)} className={m.k === "cut" ? "p-cut thick" : "p-rap"} markerEnd={c.a(m.k)} />
          </g>;
        })}
      </g>
    );
  };
  return (
    <Fig id="peck" code="G83 G73" title="Wiercenie krokami: wyrzut wióra albo łamanie" h={262} legend={["cut", "rap", "acc"]}
      caption={<><b>G83</b> po każdym kroku <b>Q</b> wycofuje wiertło do płaszczyzny R — wiór wylatuje z otworu. <b>G73</b> cofa tylko o <b>d</b> (parametr sterowania) — wiór się łamie, a cykl jest szybszy.</>}>
      {(c) => (
        <g>
          <line x1={14} y1={z(2)} x2={346} y2={z(2)} className="p-cons" />
          <T x={346} y={z(2) - 5} anchor="end" cls="t-mono t-acc t-b">R</T>
          <T x={346} y={z(0) + 13} anchor="end" cls="t-mono t-mut">Z0</T>
          {col(100, g83, "G83", c)}
          {col(262, g73, "G73", c)}
          <Dim x1={42} y1={z(0)} x2={42} y2={z(-6)} label="Q" c={c} lside={-1} cls="t-mono t-acc t-b" />
          <Dim x1={42} y1={z(-6)} x2={42} y2={z(-12)} label="Q" c={c} lside={-1} cls="t-mono t-acc t-b" />
          <Dim x1={42} y1={z(-12)} x2={42} y2={z(-18)} label="Q" c={c} lside={-1} cls="t-mono t-acc t-b" />
          <T x={292} y={z(-5.5) + 4} cls="t-mono t-acc t-b">d</T>
          <T x={100} y={z(-22) + 15} anchor="middle" cls="t-mono t-mut">dno (Z)</T>
          <T x={262} y={z(-22) + 15} anchor="middle" cls="t-mono t-mut">dno (Z)</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= G90 / G92 / G94 tokarka: cztery ruchy ================= */
export function LatheSingle() {
  const zx = (v: number) => 300 + v * 5.6, xx = (v: number) => 226 - (v - 10) * 11;
  const A = { z: 2, r: 26.5 }, D = 23, Ze = -40;
  return (
    <Fig id="g90t" code="G90 (tokarka)" title="Jeden blok cyklu — cztery ruchy" h={226} legend={["rap", "cut", "con"]}
      notes={<Code>G90 X46 Z−40 F0.25</Code>}
      caption={<>Z punktu startu: <b>1</b> dojazd na średnicę, <b>2</b> toczenie do Z, <b>3</b> wyjście w X, <b>4</b> powrót szybki. Kolejny blok z samym X powtarza cykl głębiej.</>}>
      {(c) => (
        <g>
          <rect x={zx(-44)} y={xx(25)} width={zx(0) - zx(-44)} height={xx(10.6) - xx(25)} fill={c.hatch} className="p-con" />
          <rect x={zx(Ze)} y={xx(25)} width={zx(0) - zx(Ze)} height={xx(D) - xx(25)} className="cut-zone" />
          <line x1={zx(-48)} y1={xx(10.6)} x2={zx(6)} y2={xx(10.6)} className="break" />
          <T x={zx(6)} y={xx(10.6) + 14} anchor="end" cls="t-mut">oś detalu niżej</T>
          <line x1={zx(A.z)} y1={xx(A.r)} x2={zx(A.z)} y2={xx(D)} className="p-rap" markerEnd={c.a("rap")} />
          <line x1={zx(A.z)} y1={xx(D)} x2={zx(Ze)} y2={xx(D)} className="p-cut thick" markerEnd={c.a("cut")} />
          <line x1={zx(Ze)} y1={xx(D)} x2={zx(Ze)} y2={xx(A.r)} className="p-cut" markerEnd={c.a("cut")} />
          <line x1={zx(Ze)} y1={xx(A.r)} x2={zx(A.z)} y2={xx(A.r)} className="p-rap" markerEnd={c.a("rap")} />
          <Step x={zx(A.z) + 13} y={(xx(A.r) + xx(D)) / 2} n={1} />
          <Step x={zx(-19)} y={xx(D) + 15} n={2} />
          <Step x={zx(Ze) - 13} y={(xx(A.r) + xx(D)) / 2} n={3} />
          <Step x={zx(-19)} y={xx(A.r) - 14} n={4} />
          <Pt x={zx(A.z)} y={xx(A.r)} label="start" pos="ne" cls="t-mut" />
          <T x={zx(-22)} y={xx(16)} anchor="middle" cls="t-b">materiał Ø50 → Ø46</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= G28 / G30: przez punkt pośredni ================= */
export function RefPoint() {
  const R: [number, number, number, number] = [-5, 100, -5, 62];
  const m = mapper(R, [26, 10, 322, 214]);
  return (
    <Fig id="ref" code="G28 G30" title="Powrót do bazy przez punkt pośredni" h={238} legend={["rap", "bad"]}
      notes={<><Code k="rap">G91 G28 Z0</Code><Code k="bad">G90 G28 Z0</Code></>}
      caption={<>Oś jedzie najpierw do punktu pośredniego z bloku, potem do bazy maszyny. <b>G91 … Z0</b> oznacza „pośredni = tu, gdzie stoję”. <b>G90 … Z0</b> prowadzi przez zero detalu.</>}>
      {(c) => (
        <g>
          <Grid m={m} range={R} c={c} xl="X" yl="Z" ticks={false} />
          <rect x={m.X(10)} y={m.Y(0)} width={60 * m.u} height={10 * m.u} fill={c.hatch} className="p-con" />
          <T x={m.X(40)} y={m.Y(0) + 16} anchor="middle" cls="t-mut">detal (Z0 na górze)</T>
          <line x1={m.X(55)} y1={m.Y(20)} x2={m.X(55)} y2={m.Y(55)} className="p-rap thick" markerEnd={c.a("rap")} />
          <polyline points={`${m.X(52)},${m.Y(20)} ${m.X(52)},${m.Y(1)} ${m.X(52)},${m.Y(55)}`} className="p-bad" />
          <path d={`M ${m.X(52) - 4} ${m.Y(1) - 4} l 8 8 M ${m.X(52) + 4} ${m.Y(1) - 4} l -8 8`} className="p-bad thick" />
          <Pt x={m.X(55)} y={m.Y(20)} label="narzędzie" pos="e" />
          <Pt x={m.X(55)} y={m.Y(55)} label="baza maszyny (Z)" pos="e" cls="t-rap t-b" dot="pt-rap" />
          <T x={m.X(48)} y={m.Y(8)} anchor="end" cls="t-bad t-b">G90 … Z0</T>
        </g>
      )}
    </Fig>
  );
}
