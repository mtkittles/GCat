import { Code, Dim, Fig, mapper, Pt, Step, T } from "@/components/fig";

/* Rysunki modułu F4 — korekcje. Styl i kolory z fig.tsx. */

/* ================= F4.1: długość narzędzia ================= */
export function ToolLength() {
  const top = 176;
  const tools = [{ x: 90, L: 86, n: 1, h: "85.200" }, { x: 250, L: 118, n: 2, h: "102.700" }];
  return (
    <Fig id="f41tl" code="G43 H" title="Dwa narzędzia, ten sam cel Z5" h={246} legend={["acc", "dim", "stock"]}
      notes={<><Code k="acc">pozycja N = Z programu + H</Code></>}
      caption={<>Program mówi tylko, gdzie ma być czubek: Z5. Sterowanie dolicza długość z rejestru H i ustawia czoło wrzeciona N wyżej dla dłuższego narzędzia. Bez G43 oba czubki trafiłyby w złe miejsce.</>}>
      {(c) => (
        <g>
          <rect x={20} y={top} width={320} height={40} fill={c.hatch} className="p-con" />
          <line x1={14} y1={top} x2={346} y2={top} className="p-cons" />
          <T x={344} y={top - 5} anchor="end" cls="t-mono t-mut">Z0</T>
          <line x1={14} y1={top - 14} x2={346} y2={top - 14} className="p-rap" />
          <T x={344} y={top - 18} anchor="end" cls="t-mono t-rap">Z5</T>
          {tools.map((t) => {
            const tip = top - 14, nY = tip - t.L;
            return (
              <g key={t.n}>
                <rect x={t.x - 26} y={nY - 34} width={52} height={34} className="spindle" />
                <rect x={t.x - 12} y={nY} width={24} height={16} className="holder" />
                <rect x={t.x - 5} y={nY + 16} width={10} height={t.L - 16} className="cutter" />
                <line x1={t.x - 40} y1={nY} x2={t.x + 40} y2={nY} className="p-acc" />
                <Pt x={t.x} y={nY} label="N" pos="w" cls="t-acc t-b" dot="pt-rap" />
                <Dim x1={t.x + 30} y1={nY} x2={t.x + 30} y2={tip} label={`H${t.n}`} c={c} lside={1} cls="t-acc t-b t-mono" />
                <T x={t.x} y={top + 30} anchor="middle" cls="t-b t-mono">{`T${t.n}  H${t.n} = ${t.h}`}</T>
              </g>
            );
          })}
        </g>
      )}
    </Fig>
  );
}

/* zaokrąglony prostokąt w układzie rysunku */
const rr = (m: ReturnType<typeof mapper>, x0: number, y0: number, x1: number, y1: number, r: number) => {
  const R = r * m.u;
  return `M ${m.X(x0)} ${m.Y(y0 + r)} L ${m.X(x0)} ${m.Y(y1 - r)} A ${R} ${R} 0 0 1 ${m.X(x0 + r)} ${m.Y(y1)} L ${m.X(x1 - r)} ${m.Y(y1)} A ${R} ${R} 0 0 1 ${m.X(x1)} ${m.Y(y1 - r)} L ${m.X(x1)} ${m.Y(y0 + r)} A ${R} ${R} 0 0 1 ${m.X(x1 - r)} ${m.Y(y0)} L ${m.X(x0 + r)} ${m.Y(y0)} A ${R} ${R} 0 0 1 ${m.X(x0)} ${m.Y(y0 + r)} Z`;
};

/* ================= F4.2: kontur programowany i tor środka ================= */
export function CompPath() {
  const R: [number, number, number, number] = [-24, 92, -10, 60];
  const m = mapper(R, [10, 6, 340, 220]);
  return (
    <Fig id="f42cp" code="G41" title="Program opisuje detal, sterowanie odsuwa środek freza" h={244} legend={["cut", "acc", "stock"]}
      notes={<><Code k="cut">program: X0…X80, R10</Code><Code k="acc">środek freza: X−5…X85, R15</Code></>}
      caption={<>Z <b>G41 D1</b> w programie stoją wymiary z rysunku. Sterowanie prowadzi środek freza z lewej strony konturu, patrząc w kierunku ruchu, odsunięty o promień z rejestru D1.</>}>
      {(c) => (
        <g>
          <path d={rr(m, 0, 0, 80, 50, 10)} fill={c.hatch} className="p-con" />
          <path d={rr(m, -5, -5, 85, 55, 15)} className="p-acc dashed" />
          <path d={rr(m, 0, 0, 80, 50, 10)} className="p-cut thick" style={{ fill: "none" }} />
          <line x1={m.X(-20)} y1={m.Y(10)} x2={m.X(0)} y2={m.Y(10)} className="p-cut" />
          <line x1={m.X(-20)} y1={m.Y(12)} x2={m.X(-5)} y2={m.Y(12)} className="p-acc dashed" />
          <line x1={m.X(-2)} y1={m.Y(27)} x2={m.X(-2)} y2={m.Y(33)} className="p-cut thick" markerEnd={c.a("cut")} />
          <T x={m.X(-23)} y={m.Y(10) + 16} cls="t-cut t-mono t-b t-sm">G41 D1 G01 X0.</T>
          <Pt x={m.X(-20)} y={m.Y(10)} dot="pt-rap" />
          <Pt x={m.X(0)} y={m.Y(0)} label="W" pos="sw" cls="t-b" />
          <Step x={m.X(-14)} y={m.Y(10) - 12} n={1} />
          <Step x={m.X(6)} y={m.Y(25)} n={2} />
          <Step x={m.X(9)} y={m.Y(41)} n={3} />
          <Step x={m.X(71)} y={m.Y(41)} n={4} />
        </g>
      )}
    </Fig>
  );
}

/* ================= F4.3: najazd i odjazd po łuku ================= */
export function LeadInOut() {
  const R: [number, number, number, number] = [-26, 22, -6, 32];
  const m = mapper(R, [10, 6, 340, 226]);
  const arc = (x0: number, y0: number, x1: number, y1: number, r: number, cw: boolean) => `M ${m.X(x0)} ${m.Y(y0)} A ${r * m.u} ${r * m.u} 0 0 ${cw ? 1 : 0} ${m.X(x1)} ${m.Y(y1)}`;
  const part = `M ${m.X(0)} ${m.Y(32)} L ${m.X(0)} ${m.Y(10)} A ${10 * m.u} ${10 * m.u} 0 0 0 ${m.X(10)} ${m.Y(0)} L ${m.X(22)} ${m.Y(0)} L ${m.X(22)} ${m.Y(32)} Z`;
  return (
    <Fig id="f43io" code="G41 G40" title="Najazd i odjazd styczny — lewy dolny róg płytki" h={250} legend={["cut", "arc", "rap", "stock"]}
      notes={<><Code k="cut">G41 D1 G01 X-10. Y0.</Code><Code k="arc">G03 X0. Y10. R10.</Code><Code k="arc">G03 X-10. Y20. R10.</Code><Code k="cut">G40 G01 X-20. Y10.</Code></>}
      caption={<>Frez wchodzi na kontur po łuku stycznym i tak samo z niego schodzi. Nie zatrzymuje się na ścianie, więc nie zostawia śladu w miejscu wejścia. Korekcję włącza i wyłącza odcinek w powietrzu.</>}>
      {(c) => (
        <g>
          <path d={part} fill={c.hatch} className="p-con" />
          <line x1={m.X(0)} y1={m.Y(10)} x2={m.X(0)} y2={m.Y(30)} className="p-cut thick" markerEnd={c.a("cut")} />
          <path d={arc(10, 0, 0, 10, 10, true)} className="p-arc thick" />
          <line x1={m.X(-20)} y1={m.Y(10)} x2={m.X(-10)} y2={m.Y(0)} className="p-cut" markerEnd={c.a("cut")} />
          <path d={arc(-10, 0, 0, 10, 10, false)} className="p-arc" markerEnd={c.a("arc")} />
          <path d={arc(0, 10, -10, 20, 10, false)} className="p-arc dashed" markerEnd={c.a("arc")} />
          <line x1={m.X(-10)} y1={m.Y(20)} x2={m.X(-20) + 3} y2={m.Y(10) + 3} className="p-cut dashed" markerEnd={c.a("cut")} />
          <T x={m.X(-17)} y={m.Y(1)} cls="t-cut t-b">najazd</T>
          <T x={m.X(-19)} y={m.Y(22)} cls="t-arc t-b">odjazd</T>
          <Pt x={m.X(-20)} y={m.Y(10)} label="X−20 Y10" pos="w" cls="t-mono" dot="pt-rap" />
          <Pt x={m.X(0)} y={m.Y(10)} label="X0 Y10" pos="e" cls="t-mono t-b" dot="pt-cut" />
          <Pt x={m.X(-10)} y={m.Y(10)} label="środek łuków" pos="s" cls="t-mut t-sm" />
        </g>
      )}
    </Fig>
  );
}

/* ================= F4.1: dwa narzędzia, ten sam Z5 =================
   Współrzędne maszynowe Z (pionowo). G54 Z = −400 (pozycja N, gdy czoło wrzeciona leżałoby
   na górnej powierzchni detalu), H1 = 85,2 (frez), H2 = 102,7 (wiertło) — długości od N do czubka,
   zmierzone na presetterze. Program: G43 Hn Z5. dla obu narzędzi. */
export function TwoLengths() {
  const R: [number, number, number, number] = [0, 200, -418, -268];
  const m = mapper(R, [8, 8, 344, 250]);
  const g54 = -400, z5 = g54 + 5;
  const tools = [
    { x: 75, h: 85.2, name: "T1 frez", n: g54 + 5 + 85.2, w: 10 },
    { x: 150, h: 102.7, name: "T2 wiertło", n: g54 + 5 + 102.7, w: 6 },
  ];
  const fmt = (v: number) => v.toFixed(1).replace(".", ",").replace("-", "−");
  return (
    <Fig id="f41tw" code="G43" title="Ten sam Z5, różne pozycje wrzeciona" h={268} legend={["dim", "stock"]}
      notes={<><Code k="acc">N = G54 Z + Z programu + H</Code></>}
      caption={<>Pionowo współrzędne maszynowe. Detal leży pod linią Z0, czyli pod pozycją −400 zapisaną w G54. Oba narzędzia mają czubek na Z5 programu (−395 maszynowo). Czoło wrzeciona N stoi wyżej o długość narzędzia: frez −309,8, wiertło −292,3. Różnica 17,5 mm to różnica długości H — wartość Z w G54 jest dla obu ta sama.</>}>
      {(c) => (
        <g>
          <rect x={m.X(0)} y={m.Y(g54)} width={200 * m.u} height={18 * m.u} fill={c.hatch} className="p-con" />
          <line x1={m.X(0)} y1={m.Y(g54)} x2={m.X(200)} y2={m.Y(g54)} className="p-cons" />
          <T x={m.X(198)} y={m.Y(g54) + 13} anchor="end" cls="t-acc t-b t-mono">Z0 · G54 Z −400</T>
          <line x1={m.X(0)} y1={m.Y(z5)} x2={m.X(200)} y2={m.Y(z5)} className="p-cons" strokeDasharray="4 4" />
          <T x={m.X(2)} y={m.Y(z5) - 4} cls="t-mono t-sm">Z5 programu = −395</T>
          {tools.map((t) => (
            <g key={t.name}>
              <rect x={m.X(t.x - 9)} y={m.Y(-268)} width={18 * m.u} height={m.Y(t.n) - m.Y(-268)} rx={2} className="clamp" />
              <rect x={m.X(t.x - t.w / 2)} y={m.Y(t.n)} width={t.w * m.u} height={(t.h) * m.u} className="cutter" />
              <line x1={m.X(t.x - 12)} y1={m.Y(t.n)} x2={m.X(t.x + 12)} y2={m.Y(t.n)} className="p-acc thick" />
              <T x={m.X(t.x + 13)} y={m.Y(t.n) + 4} cls="t-acc t-b t-mono">{`N ${fmt(t.n)}`}</T>
              <Dim c={c} x1={m.X(t.x - 16)} y1={m.Y(t.n)} x2={m.X(t.x - 16)} y2={m.Y(z5)} label={`H ${fmt(t.h)}`} lside={1} />
              <T x={m.X(t.x - 11)} y={m.Y(-268) + 14} anchor="end" cls="t-b t-sm">{t.name}</T>
            </g>
          ))}
        </g>
      )}
    </Fig>
  );
}

export const f4Figs = {
  "f41-length": () => <ToolLength />,
  "f41-two": () => <TwoLengths />,
  "f42-comp": () => <CompPath />,
  "f43-leadin": () => <LeadInOut />,
};
