import { Code, Dim, Fig, mapper, Pt, Step, T } from "@/components/fig";

/* Rysunki modułu T2 — narzędzie, obroty, posuw na tokarce. */

/* ================= T2.1: głowica i słowo T ================= */
export function TurretT() {
  const cx = 104, cy = 118, r = 62;
  const st = Array.from({ length: 8 }, (_, i) => i);
  return (
    <Fig id="t21tu" code="T0101" title="Głowica rewolwerowa i słowo T" h={236} legend={["acc"]}
      caption={<>Pierwsze dwie cyfry wybierają pozycję w głowicy — głowica obraca się od razu, bez M06. Dwie ostatnie wybierają rejestr korekcji: geometrię i zużycie tego noża. T0100 wyłącza korekcję.</>}>
      {() => (
        <g>
          <circle cx={cx} cy={cy} r={r} className="spindle" />
          <circle cx={cx} cy={cy} r={8} className="holder" />
          {st.map((i) => {
            const a = Math.PI + (i * Math.PI) / 4, x = cx + Math.cos(a) * (r - 4), y = cy + Math.sin(a) * (r - 4);
            const on = i === 0;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={10} className={on ? "p-fill-acc" : "panel-bg"} style={{ stroke: on ? "var(--accent)" : "var(--ink-2)" }} />
                <text x={x} y={y + 3.5} textAnchor="middle" style={{ font: "700 10px var(--font-mono)", fill: on ? "var(--accent)" : "var(--ink-2)" }}>{i + 1}</text>
              </g>
            );
          })}
          <polygon points={`${cx - r - 10},${cy} ${cx - r - 22},${cy - 6} ${cx - r - 22},${cy + 6}`} className="p-fill-acc" style={{ stroke: "var(--accent)" }} />
          <T x={cx - r - 16} y={cy + 24} anchor="middle" cls="t-acc t-sm t-b">praca</T>
          <text x={262} y={96} textAnchor="middle" style={{ font: "700 30px var(--font-mono)", fill: "var(--ink)" }}>
            <tspan style={{ fill: "var(--cm-t)" }}>T</tspan><tspan style={{ fill: "var(--accent)" }}>01</tspan><tspan style={{ fill: "var(--cm-fs)" }}>01</tspan>
          </text>
          <line x1={262} y1={104} x2={244} y2={132} className="p-cons" />
          <line x1={290} y1={104} x2={300} y2={156} className="p-cons" />
          <T x={244} y={146} anchor="middle" cls="t-acc t-b">pozycja</T>
          <T x={244} y={159} anchor="middle" cls="t-mut t-sm">w głowicy</T>
          <T x={300} y={170} anchor="middle" cls="t-b" >korekcja</T>
          <T x={300} y={183} anchor="middle" cls="t-mut t-sm">rejestr nr 1</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= T2.1: korekcje geometrii ================= */
export function ToolOffsets() {
  const R: [number, number, number, number] = [-14, 58, -4, 58];
  const m = mapper(R, [10, 6, 340, 224]);
  return (
    <Fig id="t21of" code="X Z" title="Korekcja geometrii: od punktu bazowego głowicy do ostrza" h={248} legend={["acc", "dim"]}
      notes={<><Code k="acc">geometria X, Z — z pomiaru</Code><Code k="con">zużycie X, Z — drobne poprawki</Code></>}
      caption={<>Sterowanie zna położenie punktu bazowego głowicy. Korekcja mówi, jak daleko od niego leży ostrze danego noża — dzięki temu każdy nóż trafia w ten sam wymiar z programu.</>}>
      {(c) => (
        <g>
          <rect x={m.X(18)} y={m.Y(56)} width={38 * m.u} height={22 * m.u} className="spindle" />
          <rect x={m.X(10)} y={m.Y(38)} width={16 * m.u} height={20 * m.u} className="holder" />
          <polygon points={`${m.X(4)},${m.Y(12)} ${m.X(13)},${m.Y(15)} ${m.X(16)},${m.Y(24)} ${m.X(7)},${m.Y(21)}`} className="p-fill-acc" style={{ stroke: "var(--accent)" }} />
          <Pt x={m.X(46)} y={m.Y(40)} label="punkt bazowy" pos="e" cls="t-mut" dot="pt-rap" />
          <Pt x={m.X(4)} y={m.Y(12)} label="ostrze" pos="w" cls="t-acc t-b" dot="pt-cut" />
          <Dim x1={m.X(4)} y1={m.Y(4)} x2={m.X(46)} y2={m.Y(4)} off={0} label="korekcja Z" c={c} cls="t-acc t-b" lside={1} />
          <Dim x1={m.X(52)} y1={m.Y(12)} x2={m.X(52)} y2={m.Y(40)} label="korekcja X" c={c} cls="t-acc t-b" lside={1} />
          <line x1={m.X(4)} y1={m.Y(12)} x2={m.X(56)} y2={m.Y(12)} className="p-cons" />
          <line x1={m.X(46)} y1={m.Y(40)} x2={m.X(46)} y2={m.Y(2)} className="p-cons" />
        </g>
      )}
    </Fig>
  );
}


/* ================= T2.1: przykład — zmiana noża ================= */
export function ToolChange() {
  const R: [number, number, number, number] = [-70, 112, -4, 86];
  const m = mapper(R, [10, 8, 340, 222]);
  const tc = { z: 96, r: 70 };
  return (
    <Fig id="t21ch" code="T0202" title="Zmiana noża: odjazd, obrót głowicy, powrót" h={240} legend={["rap", "stock"]}
      notes={<><Code k="rap">1  G28 U0. → G28 W0.</Code><Code k="con">2  T0202 · 3  G96 S250 M03</Code><Code k="rap">4  G00 X44. Z2.</Code></>}
      caption={<>Nóż T0101 kończy pracę w X42 Z2. Głowica obraca się dopiero daleko od detalu i konika. Tor ruchu szybkiego do punktu 4 zależy od sterowania — na rysunku uproszczony. Numery odpowiadają krokom przykładu.</>}>
      {(c) => (
        <g>
          <rect x={m.X(-66)} y={m.Y(20)} width={66 * m.u} height={20 * m.u} fill={c.hatch} className="p-con" />
          <line x1={m.X(-70)} y1={m.Y(0)} x2={m.X(112)} y2={m.Y(0)} className="p-cons" />
          <line x1={m.X(2)} y1={m.Y(21)} x2={m.X(2)} y2={m.Y(tc.r) + 3} className="p-rap thick" markerEnd={c.a("rap")} />
          <line x1={m.X(2)} y1={m.Y(tc.r)} x2={m.X(tc.z - 12) - 3} y2={m.Y(tc.r)} className="p-rap thick" markerEnd={c.a("rap")} />
          <Step x={m.X(-6)} y={m.Y(46)} n={1} />
          <circle cx={m.X(tc.z)} cy={m.Y(tc.r)} r={12 * m.u} className="spindle" />
          {[0, 1, 2, 3, 4, 5].map((i) => { const a = (i * Math.PI) / 3 + Math.PI; return <circle key={i} cx={m.X(tc.z) + Math.cos(a) * 9 * m.u} cy={m.Y(tc.r) + Math.sin(a) * 9 * m.u} r={2.6 * m.u} className={i === 1 ? "p-fill-acc" : "panel-bg"} style={{ stroke: i === 1 ? "var(--accent)" : "var(--ink-2)" }} />; })}
          <path d={`M ${m.X(tc.z) + 15 * m.u} ${m.Y(tc.r) - 2 * m.u} A ${15 * m.u} ${15 * m.u} 0 0 1 ${m.X(tc.z) + 2 * m.u} ${m.Y(tc.r) + 15 * m.u}`} className="p-acc" fill="none" markerEnd={c.a("acc")} />
          <Step x={m.X(tc.z + 16)} y={m.Y(tc.r + 12)} n={2} />
          <T x={m.X(tc.z - 14)} y={m.Y(tc.r + 8)} anchor="end" cls="t-mono t-acc t-b t-sm">T0202</T>
          <Step x={m.X(60)} y={m.Y(30)} n={3} />
          <T x={m.X(65)} y={m.Y(30) + 4} cls="t-mono t-sm">G96 S250 M03</T>
          <line x1={m.X(tc.z - 9)} y1={m.Y(tc.r - 9)} x2={m.X(2) + 3} y2={m.Y(22) - 2} className="p-rap" strokeDasharray="6 4" markerEnd={c.a("rap")} />
          <Step x={m.X(30)} y={m.Y(43)} n={4} />
          <Pt x={m.X(2)} y={m.Y(22)} label="X44 Z2" pos="e" cls="t-mono t-sm" />
          <T x={m.X(-33)} y={m.Y(10) + 4} anchor="middle" cls="t-mut t-sm">wałek</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= T2.2: G96 i G50 ================= */
export function CssChart() {
  const L = 48, B = 176, Rr = 338, Tt = 26, DM = 80, NM = 4500;
  const X = (d: number) => L + (d / DM) * (Rr - L), Y = (n: number) => B - (n / NM) * (B - Tt);
  const curve = (lim: number) => Array.from({ length: 90 }, (_, i) => { const d = 1 + (i / 89) * (DM - 1); return `${X(d)},${Y(Math.min(lim, (1000 * 200) / (Math.PI * d)))}`; }).join(" ");
  const dL = (1000 * 200) / (Math.PI * 3000);
  return (
    <Fig id="t22cs" code="G96" title="vc = 200 m/min: obroty w funkcji średnicy" h={214} legend={["acc", "bad"]}
      notes={<><Code k="acc">n = 1000 · vc / (π · D)</Code><Code k="bad">G50 S3000 — od Ø21,2 w dół</Code></>}
      caption={<>Im mniejsza średnica, tym szybciej musi się kręcić wrzeciono, żeby ostrze miało tę samą prędkość. Przy osi obroty rosłyby bez końca — G50 ogranicza je do bezpiecznej wartości.</>}>
      {() => (
        <g>
          <line x1={L} y1={B} x2={Rr} y2={B} className="ax" /><line x1={L} y1={B} x2={L} y2={Tt} className="ax" />
          {[0, 20, 40, 60, 80].map((v) => <T key={v} x={X(v)} y={B + 14} anchor="middle" cls="t-tick">{v}</T>)}
          {[1000, 2000, 3000, 4000].map((v) => <T key={v} x={L - 5} y={Y(v) + 3} anchor="end" cls="t-tick">{v}</T>)}
          <T x={Rr} y={B + 28} anchor="end" cls="t-mut t-sm">średnica Ø</T>
          <T x={L} y={Tt - 8} cls="t-mut t-sm">obr/min</T>
          <polyline points={curve(NM)} className="p-cons" style={{ fill: "none" }} />
          <polyline points={curve(3000)} className="p-acc thick" style={{ fill: "none" }} />
          <line x1={L} y1={Y(3000)} x2={Rr} y2={Y(3000)} className="p-bad" />
          <line x1={X(dL)} y1={B} x2={X(dL)} y2={Y(3000)} className="p-cons" />
          <T x={X(dL) + 4} y={B - 6} cls="t-mono t-sm">Ø21,2</T>
          <Pt x={X(40)} y={Y((1000 * 200) / (Math.PI * 40))} label="Ø40: 1592" pos="ne" cls="t-mono t-acc" />
        </g>
      )}
    </Fig>
  );
}


/* ================= T2.2: przykład — obroty przy planowaniu ================= */
export function FaceRpm() {
  const L = 48, B = 180, Rr = 330, Tt = 30, DM = 48, NM = 4000;
  const X = (d: number) => L + (d / DM) * (Rr - L), Y = (n: number) => B - (n / NM) * (B - Tt);
  const n = (d: number) => (1000 * 200) / (Math.PI * d);
  const dL = (1000 * 200) / (Math.PI * 3000);
  const curve = Array.from({ length: 80 }, (_, i) => { const d = dL + (i / 79) * (44 - dL); return `${X(d)},${Y(n(d))}`; }).join(" ");
  const ghost = Array.from({ length: 40 }, (_, i) => { const d = 15 + (i / 39) * (dL - 15); return `${X(d)},${Y(n(d))}`; }).join(" ");
  return (
    <Fig id="t22fr" code="G50" title="Planowanie od Ø44 do osi: G96 S200, G50 S3000" h={222} legend={["acc", "bad"]}
      notes={<><Code k="acc">Ø44 → Ø21,2: obroty rosną, vc = 200 m/min</Code><Code k="bad">Ø21,2 → oś: 3000 obr/min, vc spada do zera</Code></>}
      caption={<>Nóż jedzie od prawej do lewej strony wykresu. Do Ø21,2 sterowanie podnosi obroty, żeby utrzymać vc. Dalej trzyma limit — w czerwonym polu prędkość skrawania już nie jest stała. Numery odpowiadają krokom przykładu.</>}>
      {() => (
        <g>
          <rect x={L} y={Tt} width={X(dL) - L} height={B - Tt} className="p-fill-bad" opacity={0.18} />
          <line x1={L} y1={B} x2={Rr} y2={B} className="ax" /><line x1={L} y1={B} x2={L} y2={Tt} className="ax" />
          {[0, 10, 20, 30, 40].map((v) => <T key={v} x={X(v)} y={B + 14} anchor="middle" cls="t-tick">{v}</T>)}
          {[1000, 2000, 3000].map((v) => <T key={v} x={L - 5} y={Y(v) + 3} anchor="end" cls="t-tick">{v}</T>)}
          <T x={Rr} y={B + 28} anchor="end" cls="t-mut t-sm">średnica Ø</T>
          <T x={L} y={Tt - 10} cls="t-mut t-sm">obr/min</T>
          <polyline points={ghost} className="p-cons" style={{ fill: "none" }} />
          <polyline points={curve} className="p-acc thick" style={{ fill: "none" }} />
          <line x1={L} y1={Y(3000)} x2={X(dL)} y2={Y(3000)} className="p-bad thick" style={{ strokeDasharray: "none" }} />
          <Pt x={X(44)} y={Y(n(44))} label="Ø44: 1447" pos="n" cls="t-mono t-acc t-sm" />
          <Step x={X(44)} y={Y(n(44)) + 18} n={1} />
          <Pt x={X(dL)} y={Y(3000)} label="Ø21,2" pos="ne" cls="t-mono t-sm t-b" />
          <Step x={X(dL) + 14} y={Y(3000) + 22} n={2} />
          <T x={X(dL / 2)} y={Y(3000) + 18} anchor="middle" cls="t-bad t-sm t-b">limit 3000</T>
          <Step x={X(dL / 2)} y={Y(3000) + 40} n={3} />
          <T x={X(dL / 2)} y={Y(1000)} anchor="middle" cls="t-bad t-sm">vc &lt; 200</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= T2.3: chropowatość teoretyczna ================= */
export function Roughness() {
  const f = 64, re = 58, y0 = 120, n = 4, x0 = 44;
  const h = re - Math.sqrt(re * re - (f / 2) ** 2);
  const arcs = Array.from({ length: n }, (_, i) => {
    const cx = x0 + i * f;
    return `M ${cx - f / 2} ${y0 - h} A ${re} ${re} 0 0 0 ${cx + f / 2} ${y0 - h}`;
  });
  return (
    <Fig id="t23rt" code="Rt" title="Posuw zostawia ślad promienia naroża" h={206} legend={["acc", "dim", "stock"]}
      notes={<><Code k="acc">Rt ≈ f² / (8 · rε) · 1000 [µm]</Code><Code k="con">f 0,2, rε 0,8 → Rt ≈ 6,3 µm (Ra ≈ 1,6 — przybliżenie)</Code></>}
      caption={<>Każdy obrót przesuwa ostrze o posuw f, a naroże o promieniu rε zostawia łuk. Wysokość grzbietów między łukami to teoretyczna chropowatość Rt — rośnie z kwadratem posuwu i maleje z promieniem naroża. Skala przesadzona.</>}>
      {(c) => (
        <g>
          <path d={`M ${x0 - f / 2} ${y0 - h} ${arcs.map((a) => a.replace(/^M [^A]+/, "")).join(" ")} L ${x0 + (n - 0.5) * f} 186 L ${x0 - f / 2} 186 Z`} fill={c.hatch} className="p-con" />
          <circle cx={x0 + f} cy={y0 - re} r={re} className="p-cons" />
          <Dim x1={x0 + f / 2} y1={y0 - h - 18} x2={x0 + 1.5 * f} y2={y0 - h - 18} off={0} label="f" c={c} cls="t-acc t-b t-mono" />
          <line x1={x0 + 1.5 * f} y1={y0 - h} x2={x0 + 1.5 * f + 40} y2={y0 - h} className="p-cons" />
          <line x1={x0 + 2 * f} y1={y0} x2={x0 + 1.5 * f + 40} y2={y0} className="p-cons" />
          <Dim x1={x0 + 1.5 * f + 34} y1={y0 - h} x2={x0 + 1.5 * f + 34} y2={y0} off={0} label="Rt" c={c} lside={1} cls="t-acc t-b t-mono" />
          <T x={x0 + f} y={y0 - re - 6} anchor="middle" cls="t-mut">naroże rε</T>
        </g>
      )}
    </Fig>
  );
}


/* ================= T2.3: przykład — planowanie czoła ================= */
export function FacePass() {
  const R: [number, number, number, number] = [-16, 10, -3, 25];
  const m = mapper(R, [30, 8, 300, 222]);
  return (
    <Fig id="t23fp" code="G01" title="Planowanie czoła wałka" h={240} legend={["rap", "cut", "stock"]}
      notes={<><Code k="rap">1  G00 X44. Z0.</Code><Code k="cut">2  G01 X-1.6 F0.15</Code><Code k="rap">3  G00 Z2.</Code></>}
      caption={<>Pręt Ø40, nóż z narożem R0,8 w kierunku ostrza 3, bez korekcji promienia. Tor punktu P kończy się 0,8 mm za osią, w X−1,6 — dopiero wtedy naroże zbiera materiał do samego środka. Numery odpowiadają krokom przykładu.</>}>
      {(c) => (
        <g>
          <rect x={m.X(-16)} y={m.Y(20)} width={16 * m.u} height={20 * m.u} fill={c.hatch} className="p-con" />
          <rect x={m.X(0)} y={m.Y(20)} width={0.5 * m.u} height={20 * m.u} className="p-fill-cut" />
          <line x1={m.X(-16)} y1={m.Y(0)} x2={m.X(10)} y2={m.Y(0)} className="p-cons" />
          <T x={m.X(9.5)} y={m.Y(0) - 5} anchor="end" cls="t-mut t-sm">oś</T>
          <line x1={m.X(7)} y1={m.Y(24)} x2={m.X(0) + 3} y2={m.Y(22)} className="p-rap thick" markerEnd={c.a("rap")} />
          <Step x={m.X(5)} y={m.Y(20.5)} n={1} />
          <line x1={m.X(0)} y1={m.Y(22)} x2={m.X(0)} y2={m.Y(-0.8) + 3} className="p-cut thick" markerEnd={c.a("cut")} />
          <Step x={m.X(2.5)} y={m.Y(10)} n={2} />
          <line x1={m.X(0)} y1={m.Y(-0.8)} x2={m.X(2) - 3} y2={m.Y(-0.8)} className="p-rap thick" markerEnd={c.a("rap")} />
          <Step x={m.X(4.5)} y={m.Y(-0.8)} n={3} />
          <Pt x={m.X(0)} y={m.Y(22)} label="X44 Z0" pos="nw" cls="t-mono t-sm" dot="pt-rap" />
          <Pt x={m.X(0)} y={m.Y(-0.8)} label="X−1,6" pos="sw" cls="t-mono t-cut t-b t-sm" />
          <T x={m.X(-8)} y={m.Y(10) + 4} anchor="middle" cls="t-mut t-sm">pręt Ø40</T>
          <T x={m.X(1.2)} y={m.Y(16) + 4} cls="t-mut t-sm">zbiera ok. 0,5</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= T2.3: planowanie do osi ================= */
export function FaceCenter() {
  const R: [number, number, number, number] = [-6, 5, -3, 6];
  const m = mapper(R, [30, 8, 300, 196]);
  const re = 0.8;
  return (
    <Fig id="t23fc" code="X−1.6" title="Planowanie czoła przez oś" h={220} legend={["cut", "bad", "stock"]}
      notes={<><Code k="cut">G01 X-1.6 F0.15</Code><Code k="bad">G01 X0 — zostaje pipka</Code></>}
      caption={<>Program prowadzi teoretyczny wierzchołek ostrza. Naroże o promieniu 0,8 kończy się przed nim, więc przy X0 w środku zostaje mały czop. Wyjazd za oś na X = −2 · rε = −1,6 zbiera go do końca.</>}>
      {(c) => (
        <g>
          <rect x={m.X(-6)} y={m.Y(5)} width={6 * m.u} height={8 * m.u} fill={c.hatch} className="p-con" />
          <line x1={m.X(-6)} y1={m.Y(0)} x2={m.X(5)} y2={m.Y(0)} className="p-cons" />
          <T x={m.X(4.5)} y={m.Y(0) - 5} anchor="end" cls="t-mut t-sm">oś</T>
          <circle cx={m.X(re)} cy={m.Y(re)} r={re * m.u} className="p-bad" style={{ fill: "none" }} />
          <line x1={m.X(0.2)} y1={m.Y(5)} x2={m.X(0.2)} y2={m.Y(-0.8) + 3} className="p-cut thick" markerEnd={c.a("cut")} />
          <circle cx={m.X(re)} cy={m.Y(-0.8 + re)} r={re * m.u} className="tool" />
          <T x={m.X(0.4)} y={m.Y(3)} cls="t-cut t-b t-mono">X−1.6</T>
          <T x={m.X(1.8)} y={m.Y(1.2)} cls="t-bad">przy X0</T>
          <Pt x={m.X(0)} y={m.Y(0)} label="W" pos="sw" cls="t-acc t-b" />
        </g>
      )}
    </Fig>
  );
}

export const t2Figs = {
  "t21-turret": () => <TurretT />,
  "t21-offsets": () => <ToolOffsets />,
  "t21-change": () => <ToolChange />,
  "t22-css": () => <CssChart />,
  "t22-face": () => <FaceRpm />,
  "t23-rt": () => <Roughness />,
  "t23-face": () => <FaceCenter />,
  "t23-pass": () => <FacePass />,
};
