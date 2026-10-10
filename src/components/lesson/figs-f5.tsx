import { Code, Dim, Fig, mapper, Pt, T } from "@/components/fig";

/* Rysunki modułu F5 — cykle wiercenia. Styl i kolory z fig.tsx. */

const Num = ({ x, y, n }: { x: number; y: number; n: number }) => (
  <g><circle cx={x} cy={y} r={8} className="step" /><text x={x} y={y + 3.8} textAnchor="middle" className="step-n">{n}</text></g>
);

/* ================= F5.1: przebieg cyklu ================= */
export function CycleSteps() {
  const R: [number, number, number, number] = [-6, 78, -16, 56];
  const m = mapper(R, [10, 6, 340, 232]);
  const hx = 40;
  return (
    <Fig id="f51cy" code="G81" title="Cykl wiercenia w czterech ruchach" h={254} legend={["rap", "cut", "stock"]}
      notes={<Code k="cut">G81 X40. Y… Z-10. R2. F120</Code>}
      caption={<>1 — ruch szybki nad otwór, 2 — ruch szybki do płaszczyzny R, 3 — posuw do dna Z, 4 — ruch szybki w górę. Cały ten przebieg opisuje jeden blok.</>}>
      {(c) => (
        <g>
          <rect x={m.X(18)} y={m.Y(0)} width={60 * m.u} height={16 * m.u} fill={c.hatch} className="p-con" />
          <rect x={m.X(hx - 2.5)} y={m.Y(0)} width={5 * m.u} height={10 * m.u} className="panel-bg" />
          <line x1={m.X(-6)} y1={m.Y(50)} x2={m.X(78)} y2={m.Y(50)} className="p-cons" />
          <line x1={m.X(-6)} y1={m.Y(2)} x2={m.X(78)} y2={m.Y(2)} className="p-cons" />
          <T x={m.X(76)} y={m.Y(50) - 5} anchor="end" cls="t-mut">poziom początkowy</T>
          <T x={m.X(76)} y={m.Y(2) - 5} anchor="end" cls="t-acc t-b">R2</T>
          <T x={m.X(hx) + 10} y={m.Y(-10) + 4} cls="t-cut t-b t-mono">Z−10</T>
          <line x1={m.X(0)} y1={m.Y(50)} x2={m.X(hx) - 3} y2={m.Y(50)} className="p-rap thick" markerEnd={c.a("rap")} />
          <line x1={m.X(hx) - 4} y1={m.Y(50)} x2={m.X(hx) - 4} y2={m.Y(2) - 3} className="p-rap thick" markerEnd={c.a("rap")} />
          <line x1={m.X(hx)} y1={m.Y(2)} x2={m.X(hx)} y2={m.Y(-10) - 3} className="p-cut thick" markerEnd={c.a("cut")} />
          <line x1={m.X(hx) + 4} y1={m.Y(-10)} x2={m.X(hx) + 4} y2={m.Y(50) + 3} className="p-rap" markerEnd={c.a("rap")} />
          <Num x={m.X(20)} y={m.Y(50) - 13} n={1} />
          <Num x={m.X(hx) - 16} y={m.Y(26)} n={2} />
          <Num x={m.X(hx) - 14} y={m.Y(-5)} n={3} />
          <Num x={m.X(hx) + 18} y={m.Y(26)} n={4} />
          <Pt x={m.X(0)} y={m.Y(50)} dot="pt-rap" />
        </g>
      )}
    </Fig>
  );
}

/* ================= F5.1: głębokość nawiercenia ================= */
export function SpotDepth() {
  const R: [number, number, number, number] = [-13, 13, -7, 15];
  const m = mapper(R, [14, 6, 332, 206]);
  const P = (x: number, z: number) => `${m.X(x)},${m.Y(z)}`;
  return (
    <Fig id="f51sp" code="90°" title="Nawiertak 90°: głębokość = połowa średnicy fazki" h={230} legend={["dim", "stock"]}
      notes={<><Code k="acc">fazka Ø6 → Z−3</Code><Code k="acc">fazka Ø8 → Z−4</Code></>}
      caption={<>Kąt 90° znaczy, że ścianka stożka biegnie pod 45°: ile w głąb, tyle w bok. Fazka odrobinę większa niż średnica gwintu chroni pierwszy zwój przed wyrwaniem.</>}>
      {(c) => (
        <g>
          <polygon points={`${P(-13, 0)} ${P(-3, 0)} ${P(0, -3)} ${P(3, 0)} ${P(13, 0)} ${P(13, -7)} ${P(-13, -7)}`} fill={c.hatch} className="p-con" />
          <polygon points={`${P(0, 3)} ${P(5, 8)} ${P(5, 15)} ${P(-5, 15)} ${P(-5, 8)}`} className="cutter" />
          <line x1={m.X(-5)} y1={m.Y(8)} x2={m.X(5)} y2={m.Y(8)} className="p-dim" />
          <Dim x1={m.X(-3)} y1={m.Y(0)} x2={m.X(3)} y2={m.Y(0)} off={-m.u * 1.4} label="Ø6" c={c} cls="t-acc t-b t-mono" />
          <Dim x1={m.X(8)} y1={m.Y(0)} x2={m.X(8)} y2={m.Y(-3)} off={0} label="3" c={c} lside={1} cls="t-acc t-b t-mono" />
          <line x1={m.X(0)} y1={m.Y(-3)} x2={m.X(8)} y2={m.Y(-3)} className="p-cons" />
          <T x={m.X(-7)} y={m.Y(11)} anchor="end" cls="t-mut">nawiertak Ø10</T>
        </g>
      )}
    </Fig>
  );
}

const rr = (m: ReturnType<typeof mapper>, x0: number, y0: number, x1: number, y1: number, r: number) => {
  const R = r * m.u;
  return `M ${m.X(x0)} ${m.Y(y0 + r)} L ${m.X(x0)} ${m.Y(y1 - r)} A ${R} ${R} 0 0 1 ${m.X(x0 + r)} ${m.Y(y1)} L ${m.X(x1 - r)} ${m.Y(y1)} A ${R} ${R} 0 0 1 ${m.X(x1)} ${m.Y(y1 - r)} L ${m.X(x1)} ${m.Y(y0 + r)} A ${R} ${R} 0 0 1 ${m.X(x1 - r)} ${m.Y(y0)} L ${m.X(x0 + r)} ${m.Y(y0)} A ${R} ${R} 0 0 1 ${m.X(x0)} ${m.Y(y0 + r)} Z`;
};

/* ================= F5.1: otwory płytki ================= */
export function PlateHoles() {
  const R: [number, number, number, number] = [-6, 86, -10, 58];
  const m = mapper(R, [10, 6, 340, 220]);
  const H = [[10, 10], [70, 10], [70, 40], [10, 40]] as const;
  return (
    <Fig id="f51ho" code="4 × M6" title="Cztery otwory M6 w środkach naroży R10" h={242} legend={["rap", "stock"]}
      notes={<><Code k="con">X10 Y10 → X70 → Y40 → X10</Code></>}
      caption={<>Otwory leżą w środkach zaokrągleń naroży, więc ścianka ma wszędzie 10 − 3 = 7 mm. Kolejność obiegu skraca drogę: każdy następny otwór różni się tylko jedną współrzędną.</>}>
      {(c) => (
        <g>
          <path d={rr(m, 0, 0, 80, 50, 10)} fill={c.hatch} className="p-con" />
          {H.map(([x, y], i) => {
            const q = H[(i + 1) % 4];
            return (
              <g key={i}>
                {i < 3 && <line x1={m.X(x) + (q[0] - x) * 0.12 * m.u} y1={m.Y(y) - (q[1] - y) * 0.2 * m.u} x2={m.X(q[0]) - (q[0] - x) * 0.12 * m.u} y2={m.Y(q[1]) + (q[1] - y) * 0.2 * m.u} className="p-rap" markerEnd={c.a("rap")} />}
                <circle cx={m.X(x)} cy={m.Y(y)} r={3 * m.u} className="p-cons" />
                <circle cx={m.X(x)} cy={m.Y(y)} r={2.5 * m.u} className="hole-top" />
                <T x={m.X(x) + (x < 40 ? -12 : 12)} y={m.Y(y) + (y < 25 ? 18 : -12)} anchor={x < 40 ? "end" : "start"} cls="t-mono t-b">{`${i + 1}  X${x} Y${y}`}</T>
              </g>
            );
          })}
          <Pt x={m.X(0)} y={m.Y(0)} label="W" pos="sw" cls="t-b" />
        </g>
      )}
    </Fig>
  );
}

/* ================= F5.2: G83 krok po kroku ================= */
/* Pięć przekrojów tego samego otworu — po jednym na każde zagłębienie.
   Zagłębienia liczone od płaszczyzny R (jak w parserze GCat i opisie G83 Haas):
   R2, Z−18, Q4 → dna Z−2, −6, −10, −14, −18. Odstęp ponownego najazdu (1 mm) jest
   przykładowy — w sterowaniu ustawia go parametr. Tory w osi otworu rozsunięte w bok
   tylko po to, żeby ruch w dół i w górę nie nakładały się na siebie. */
const PK = { zR: 2, depth: 18, q: 4, gap: 1 };
const peckBottoms = () => {
  const out: number[] = [];
  for (let d = PK.zR; d > -PK.depth + 1e-9;) { d = Math.max(-PK.depth, d - PK.q); out.push(d); }
  return out;
};

export function PeckCompare() {
  const bottoms = peckBottoms();
  const top = 40, k = 10.5;                      // y dla Z=+2 … skala px/mm
  const Y = (z: number) => top + (PK.zR - z) * k;
  const x0 = 70, col = 57, hw = 7;               // pierwsza kolumna, odstęp kolumn, pół szerokości otworu
  const zBot = -PK.depth - 2;
  const fmtZ = (z: number) => (z < 0 ? `−${Math.abs(z)}` : `${z}`);
  return (
    <Fig id="f52pk" code="G83" title="G83 krok po kroku: R2, Q4, Z−18" h={300} legend={["cut", "rap", "stock"]}
      notes={<Code k="acc">G83 X… Y… Z-18. R2. Q4. F380</Code>}
      caption={<>Pięć kolejnych wejść w ten sam otwór. Zagłębienia liczy się od <b>R2</b>: dna w Z−2, −6, −10, −14 i −18. Pierwsze wejście zaczyna 2 mm nad materiałem, więc w metalu zbiera tylko 2 mm. Po każdym dnie <b>G83</b> wyjeżdża szybko do R — wiór wychodzi z otworu — i wraca szybko tuż nad poprzednie dno; ten odstęp ustawia parametr sterowania. Ruch w dół i w górę idzie w osi otworu, na rysunku rozsunięto je dla czytelności.</>}>
      {(c) => (
        <g>
          {/* oś głębokości */}
          {[PK.zR, 0, ...bottoms].map((z) => (
            <g key={z}>
              <line x1={x0 - 22} y1={Y(z)} x2={x0 + col * 4 + 26} y2={Y(z)} className="p-ext" />
              <T x={x0 - 24} y={Y(z) + 3.5} anchor="end" cls={z === PK.zR ? "t-acc t-b" : "t-mono t-mut"}>{z === PK.zR ? "R2" : `Z${fmtZ(z)}`}</T>
            </g>
          ))}
          {bottoms.map((d, i) => {
            const xc = x0 + i * col;
            const prev = i === 0 ? null : bottoms[i - 1];
            const start = prev === null ? PK.zR : prev + PK.gap;   // gdzie zaczyna się posuw
            const xd = xc - 3.5, xu = xc + 3.5;
            return (
              <g key={d}>
                {/* materiał i otwór wywiercony do bieżącego dna */}
                <rect x={xc - 23} y={Y(0)} width={46} height={Y(zBot) - Y(0)} fill={c.hatch} className="p-con" />
                <polygon points={`${xc - hw},${Y(0)} ${xc + hw},${Y(0)} ${xc + hw},${Y(d) - 2} ${xc},${Y(d) + 2} ${xc - hw},${Y(d) - 2}`} style={{ fill: "var(--bg)", stroke: "var(--ink-2)" }} />
                {/* dojazd szybki nad poprzednie dno */}
                {prev !== null && <line x1={xd} y1={Y(PK.zR)} x2={xd} y2={Y(start) - 3} className="p-rap" markerEnd={c.a("rap")} />}
                {/* posuw do nowego dna */}
                <line x1={xd} y1={Y(start)} x2={xd} y2={Y(d) - 3} className="p-cut thick" markerEnd={c.a("cut")} />
                {/* wyjazd szybki do R */}
                <line x1={xu} y1={Y(d)} x2={xu} y2={Y(PK.zR) + 3} className="p-rap" markerEnd={c.a("rap")} />
                <Num x={xc} y={top - 22} n={i + 1} />
                <T x={xc} y={Y(zBot) + 14} anchor="middle" cls="t-mono t-sm">{`do Z${fmtZ(d)}`}</T>
              </g>
            );
          })}
        </g>
      )}
    </Fig>
  );
}

/* ================= F5.2: stożek wiertła ================= */
/* Wiertło Ø5, 140° z przykładu F5.2: stożek 2,5 / tan 70° ≈ 0,9 mm. */
export function DrillTip() {
  const R: [number, number, number, number] = [-10, 12, -20, 3];
  const m = mapper(R, [14, 6, 332, 214]);
  const P = (x: number, z: number) => `${m.X(x)},${m.Y(z)}`;
  const tip = -18, full = -17.1;
  return (
    <Fig id="f52tp" code="140°" title="Z w programie to czubek wiertła" h={236} legend={["dim", "stock"]}
      notes={<><Code k="acc">118°: stożek ≈ 0,3 · D</Code><Code k="acc">140°: stożek ≈ 0,18 · D</Code></>}
      caption={<>Wiertło Ø5 o kącie 140° z lekcji: czubek w Z−18, pełna średnica kończy się 0,9 mm wyżej, w Z−17,1. Przy otworze pod gwint liczy się właśnie ta głębokość. Wiertło 118° tej samej średnicy miałoby stożek 1,5 mm.</>}>
      {(c) => (
        <g>
          <polygon points={`${P(-10, 0)} ${P(-2.5, 0)} ${P(-2.5, full)} ${P(0, tip)} ${P(2.5, full)} ${P(2.5, 0)} ${P(12, 0)} ${P(12, -20)} ${P(-10, -20)}`} fill={c.hatch} className="p-con" />
          <line x1={m.X(-4)} y1={m.Y(full)} x2={m.X(12)} y2={m.Y(full)} className="p-cons" />
          <line x1={m.X(0)} y1={m.Y(tip)} x2={m.X(12)} y2={m.Y(tip)} className="p-cons" />
          <Dim x1={m.X(-6)} y1={m.Y(0)} x2={m.X(-6)} y2={m.Y(full)} label="17,1" c={c} lside={-1} cls="t-mono" />
          <Dim x1={m.X(9)} y1={m.Y(0)} x2={m.X(9)} y2={m.Y(tip)} label="Z−18" c={c} lside={1} cls="t-mono t-acc t-b" />
          <T x={m.X(3.5)} y={m.Y(-17.4)} cls="t-acc t-sm">0,9</T>
          <Dim x1={m.X(-2.5)} y1={m.Y(0)} x2={m.X(2.5)} y2={m.Y(0)} off={-16} label="Ø5" c={c} cls="t-mono" />
        </g>
      )}
    </Fig>
  );
}

/* ================= F5.3: gwintowanie ================= */
/* Otwór z F5.2 (pełna średnica do Z−17,1, czubek Z−18), pełny gwint do Z−12,
   nakrój 3 mm (założenie lekcji) → koniec gwintownika Z−15. */
export function TapCycle() {
  const R: [number, number, number, number] = [-14, 14, -20, 9];
  const m = mapper(R, [14, 6, 332, 214]);
  const P = (x: number, z: number) => `${m.X(x)},${m.Y(z)}`;
  const full = Array.from({ length: 12 }, (_, i) => -i - 0.5);
  const chamf = [-12.5, -13.5, -14.5];
  return (
    <Fig id="f53tp" code="G84" title="Gwintowanie: posuw = obroty × skok" h={248} legend={["cut", "arc", "stock"]}
      notes={<><Code k="cut">wejście: obroty w prawo, F = S · P</Code><Code k="arc">wyjście: obroty odwrócone</Code></>}
      caption={<>Na jeden obrót gwintownik M6 wchodzi dokładnie o skok 1 mm. Przy S500 posuw musi wynosić 500 mm/min — inaczej gwintownik zrywa zwoje albo może pęknąć. Koniec gwintownika schodzi do Z−15: pełny gwint sięga Z−12, niżej pracuje nakrój. Na dnie cykl odwraca obroty i wykręca narzędzie tym samym torem.</>}>
      {(c) => (
        <g>
          <polygon points={`${P(-14, 0)} ${P(-2.5, 0)} ${P(-2.5, -17.1)} ${P(0, -18)} ${P(2.5, -17.1)} ${P(2.5, 0)} ${P(14, 0)} ${P(14, -20)} ${P(-14, -20)}`} fill={c.hatch} className="p-con" />
          {full.map((z) => <g key={z}><line x1={m.X(-3)} y1={m.Y(z) - 4} x2={m.X(-2.5)} y2={m.Y(z) + 4} className="p-dim" /><line x1={m.X(3)} y1={m.Y(z) - 4} x2={m.X(2.5)} y2={m.Y(z) + 4} className="p-dim" /></g>)}
          {chamf.map((z) => <g key={z}><line x1={m.X(-2.8)} y1={m.Y(z) - 3} x2={m.X(-2.5)} y2={m.Y(z) + 3} className="p-ext" /><line x1={m.X(2.8)} y1={m.Y(z) - 3} x2={m.X(2.5)} y2={m.Y(z) + 3} className="p-ext" /></g>)}
          <rect x={m.X(-2.5)} y={m.Y(9)} width={5 * m.u} height={24 * m.u} className="cutter" />
          <line x1={m.X(-14)} y1={m.Y(5)} x2={m.X(14)} y2={m.Y(5)} className="p-cons" />
          <T x={m.X(13.5)} y={m.Y(5) - 5} anchor="end" cls="t-acc t-b">R5</T>
          <line x1={m.X(-8)} y1={m.Y(5)} x2={m.X(-8)} y2={m.Y(-15) - 3} className="p-cut thick" markerEnd={c.a("cut")} />
          <line x1={m.X(8)} y1={m.Y(-15)} x2={m.X(8)} y2={m.Y(5) + 3} className="p-arc thick" markerEnd={c.a("arc")} />
          <T x={m.X(-9)} y={m.Y(-4)} anchor="end" cls="t-cut t-b">M03</T>
          <T x={m.X(9)} y={m.Y(-4)} cls="t-arc t-b">M04</T>
          <line x1={m.X(-5)} y1={m.Y(-15)} x2={m.X(5)} y2={m.Y(-15)} className="p-cut" />
          <T x={m.X(-9)} y={m.Y(-15) + 4} anchor="end" cls="t-mono t-b">Z−15</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= F5.3: cztery głębokości otworu gwintowanego =================
   Założenia lekcji F5.2/F5.3: M6×1, pełny gwint 12 mm, nakrój 3 zwoje (3 mm),
   wiertło Ø5 140°, czubek Z−18. Fazka z nawiercania pominięta. */
export function TapDepthM6() {
  const R: [number, number, number, number] = [-16, 22, -20.5, 3];
  const m = mapper(R, [8, 8, 344, 226]);
  const P = (x: number, z: number) => `${m.X(x)},${m.Y(z)}`;
  const xs = -8, rH = 2.5, rT = 3;
  const L = 12, zTap = -15, zFull = -17.1, zTip = -18;
  const lv: { z: number; t: string; cls: string; dy: number }[] = [
    { z: -L, t: "Z−12 koniec pełnego gwintu", cls: "t-acc t-b", dy: -4 },
    { z: zTap, t: "Z−15 koniec gwintownika (G84)", cls: "t-cut t-b", dy: -4 },
    { z: zFull, t: "Z−17,1 koniec pełnej Ø5", cls: "t-mut", dy: -4 },
    { z: zTip, t: "Z−18 czubek wiertła (G83)", cls: "t-mut", dy: 12 },
  ];
  return (
    <Fig id="f53dp" code="M6×1" title="Cztery głębokości otworu gwintowanego" h={244} legend={["acc", "dim", "stock"]}
      notes={<><Code k="cut">G84 … Z-15. R5. F500</Code><Code k="acc">G83 … Z-18. R2. Q4.</Code></>}
      caption={<>Wymagane 12 mm pełnego gwintu. Gwintownik z nakrojem 3 zwojów (założenie przykładu) musi zejść końcem do <b>Z−15</b>. Pełna średnica otworu sięga Z−17,1, czyli 2,1 mm niżej — to zapas na wióry i bicie osiowe. Czubek wiertła jest jeszcze o stożek 0,9 mm niżej, w Z−18. Fazka z nawiercania pominięta.</>}>
      {(c) => (
        <g>
          <polygon points={`${P(-16, 0)} ${P(xs - rH, 0)} ${P(xs - rH, zFull)} ${P(xs, zTip)} ${P(xs + rH, zFull)} ${P(xs + rH, 0)} ${P(0, 0)} ${P(0, -20.5)} ${P(-16, -20.5)}`} fill={c.hatch} className="p-con" />
          {Array.from({ length: L }, (_, i) => {
            const z1 = -i, z2 = z1 - 0.5, z3 = z1 - 1;
            return (
              <g key={i}>
                <polyline points={`${P(xs - rH, z1)} ${P(xs - rT, z2)} ${P(xs - rH, z3)}`} className="p-acc" fill="none" />
                <polyline points={`${P(xs + rH, z1)} ${P(xs + rT, z2)} ${P(xs + rH, z3)}`} className="p-acc" fill="none" />
              </g>
            );
          })}
          <line x1={m.X(xs - rT)} y1={m.Y(-L)} x2={m.X(xs - rH)} y2={m.Y(zTap)} className="p-acc dashed" />
          <line x1={m.X(xs + rT)} y1={m.Y(-L)} x2={m.X(xs + rH)} y2={m.Y(zTap)} className="p-acc dashed" />
          {lv.map((l) => (
            <g key={l.z}>
              <line x1={m.X(xs - 4)} y1={m.Y(l.z)} x2={m.X(1)} y2={m.Y(l.z)} className={l.z === zTap ? "p-cut" : "p-cons"} />
              <T x={m.X(1.5)} y={m.Y(l.z) + l.dy + (l.dy < 0 ? 6 : 0)} cls={l.cls}>{l.t}</T>
            </g>
          ))}
          <T x={m.X(1.5)} y={m.Y(0) - 4} cls="t-mut t-sm">Z0 — powierzchnia</T>
          <Dim c={c} x1={m.X(-14)} y1={m.Y(0)} x2={m.X(-14)} y2={m.Y(-L)} label="12" lside={-1} />
          <Dim c={c} x1={m.X(-14)} y1={m.Y(-L)} x2={m.X(-14)} y2={m.Y(zTap)} label="3" lside={-1} />
          <Dim c={c} x1={m.X(-14)} y1={m.Y(zTap)} x2={m.X(-14)} y2={m.Y(zFull)} label="2,1" lside={-1} />
        </g>
      )}
    </Fig>
  );
}

/* ================= F5.4: G98 i G99 przy docisku ================= */
export function RetractLevels() {
  const R: [number, number, number, number] = [-4, 96, -10, 38];
  const m = mapper(R, [10, 6, 340, 208]);
  const holes = [15, 45, 75];
  return (
    <Fig id="f54lv" code="G98 G99" title="Powrót do R albo do poziomu początkowego" h={232} legend={["rap", "bad", "stock"]}
      notes={<><Code k="rap">G99 X15. … X45.</Code><Code k="rap">G98 X45. (przed dociskiem)</Code></>}
      caption={<><b>G99</b> wraca do płaszczyzny R — krótko i szybko, gdy między otworami nic nie wystaje. <b>G98</b> wraca do poziomu początkowego — tak przeskakuje się nad dociskiem.</>}>
      {(c) => (
        <g>
          <rect x={m.X(0)} y={m.Y(0)} width={90 * m.u} height={10 * m.u} fill={c.hatch} className="p-con" />
          <rect x={m.X(56)} y={m.Y(14)} width={10 * m.u} height={14 * m.u} rx={2} className="clamp" />
          <T x={m.X(61)} y={m.Y(14) - 5} anchor="middle" cls="t-mut">docisk</T>
          {holes.map((h) => <rect key={h} x={m.X(h - 2)} y={m.Y(0)} width={4 * m.u} height={7 * m.u} className="panel-bg" />)}
          <line x1={m.X(-4)} y1={m.Y(30)} x2={m.X(96)} y2={m.Y(30)} className="p-cons" />
          <line x1={m.X(-4)} y1={m.Y(2)} x2={m.X(96)} y2={m.Y(2)} className="p-cons" />
          <T x={m.X(95)} y={m.Y(30) - 5} anchor="end" cls="t-mut">poziom początkowy</T>
          <T x={m.X(95)} y={m.Y(2) - 5} anchor="end" cls="t-acc t-b">R</T>
          <line x1={m.X(15) + 3} y1={m.Y(2)} x2={m.X(45) - 3} y2={m.Y(2)} className="p-rap thick" markerEnd={c.a("rap")} />
          <line x1={m.X(45)} y1={m.Y(-7)} x2={m.X(45)} y2={m.Y(30) + 3} className="p-rap thick" markerEnd={c.a("rap")} />
          <line x1={m.X(45) + 3} y1={m.Y(30)} x2={m.X(75) - 3} y2={m.Y(30)} className="p-rap thick" markerEnd={c.a("rap")} />
          <line x1={m.X(45) + 3} y1={m.Y(2) + 5} x2={m.X(75) - 3} y2={m.Y(2) + 5} className="p-bad" markerEnd={c.a("bad")} />
          <T x={m.X(30)} y={m.Y(2) - 6} anchor="middle" cls="t-rap t-b">G99</T>
          <T x={m.X(60)} y={m.Y(30) - 6} anchor="middle" cls="t-rap t-b">G98</T>
          <T x={m.X(50)} y={m.Y(2) + 22} cls="t-bad">G99 — kolizja</T>
        </g>
      )}
    </Fig>
  );
}

export const f5Figs = {
  "f51-cycle": () => <CycleSteps />,
  "f51-spot": () => <SpotDepth />,
  "f51-holes": () => <PlateHoles />,
  "f52-peck": () => <PeckCompare />,
  "f52-tip": () => <DrillTip />,
  "f53-tap": () => <TapCycle />,
  "f53-depth": () => <TapDepthM6 />,
  "f54-levels": () => <RetractLevels />,
};
