import { Code, Dim, Fig, mapper, Pt, T } from "@/components/fig";

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
      notes={<><Code k="acc">Rt ≈ f² / (8 · rε) · 1000 [µm]</Code><Code k="con">f 0,2, rε 0,8 → Rt ≈ 6,3 µm, Ra ≈ 1,6</Code></>}
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
  "t22-css": () => <CssChart />,
  "t23-rt": () => <Roughness />,
  "t23-face": () => <FaceCenter />,
};
