import { Code, Dim, Fig, mapper, Pt, Step, T } from "@/components/fig";

/* Rysunki modułu F1 — struktura programu. Styl i kolory z fig.tsx. */

const COL: Record<string, string> = { N: "var(--muted)", G: "var(--cm-g)", X: "var(--ink)", Y: "var(--ink)", F: "var(--cm-fs)", M: "var(--cm-m)" };

/* ================= F1.1: anatomia bloku ================= */
export function BlockAnatomy() {
  const words = ["N40", "G01", "X60", "Y20", "F300", "M08"];
  const cw = 9.3, pad = 12, gap = 6, y = 62, h = 30;
  const widths = words.map((w) => w.length * cw + pad);
  const total = widths.reduce((a, b) => a + b, 0) + gap * (words.length - 1);
  let x0 = (360 - total) / 2;
  const box = words.map((w, i) => { const b = { w, x: x0, width: widths[i], cx: x0 + widths[i] / 2 }; x0 += widths[i] + gap; return b; });
  const lab = (i: number, row: 1 | 2, t1: string, t2: string, cx = box[i].cx) => {
    const ly = row === 1 ? 118 : 156;
    return (
      <g key={t1}>
        <line x1={cx} y1={y + h / 2 + 3} x2={cx} y2={ly - 12} className="p-cons" />
        <T x={cx} y={ly} anchor="middle" cls="t-b">{t1}</T>
        <T x={cx} y={ly + 13} anchor="middle" cls="t-mut t-sm">{t2}</T>
      </g>
    );
  };
  const xy = (box[2].cx + box[3].cx) / 2;
  const X = box[2];
  return (
    <Fig id="f11blk" code="N G X F M" title="Jeden blok, sześć słów" h={186}
      caption={<>Każde słowo to <b>adres</b> (litera) i <b>wartość</b> (liczba). Kolejność słów w bloku nie zmienia jego znaczenia, ale przyjęty porządek ułatwia czytanie.</>}>
      {() => (
        <g>
          <T x={X.x + 12} y={22} anchor="end" cls="t-acc t-sm t-b">adres</T>
          <T x={X.x + X.width - 16} y={22} cls="t-acc t-sm t-b">wartość</T>
          <line x1={X.x + 9} y1={28} x2={X.x + 9} y2={y - h / 2 + 2} className="p-acc" />
          <line x1={X.x + X.width - 12} y1={28} x2={X.x + X.width - 12} y2={y - h / 2 + 2} className="p-acc" />
          {box.map((b) => (
            <g key={b.w}>
              <rect x={b.x} y={y - h / 2} width={b.width} height={h} rx={6} className="panel-bg" />
              <text x={b.cx} y={y + 5.5} textAnchor="middle" style={{ fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 700, fill: COL[b.w[0]] }}>{b.w}</text>
            </g>
          ))}
          {lab(0, 1, "numer", "adres N")}
          {lab(1, 2, "funkcja G", "przygotowawcza")}
          {lab(2, 1, "współrzędne", "adresy X, Y", xy)}
          <line x1={box[2].cx} y1={y + h / 2 + 3} x2={box[3].cx} y2={y + h / 2 + 3} className="p-cons" />
          {lab(4, 2, "posuw", "adres F")}
          {lab(5, 1, "funkcja M", "pomocnicza")}
        </g>
      )}
    </Fig>
  );
}

/* ================= F1.2: słowa modalne działają dalej ================= */
export function ModalCarry() {
  const lines: { t: [string, boolean][] }[] = [
    { t: [["G01", true], ["X10", true], ["Y0", true], ["F200", true]] },
    { t: [["X50", true]] },
    { t: [["Y30", true]] },
    { t: [["G00", true], ["Z5", true]] },
    { t: [["X0", true], ["Y0", true]] },
    { t: [["G01", true], ["Z-2", true], ["F100", true]] },
  ];
  const y0 = 46, dy = 27;
  const ly = (i: number) => y0 + i * dy;
  const bar = (x: number, a: number, b: number, cls: string, label: string) => (
    <g key={`${x}${a}`}>
      <rect x={x} y={ly(a) - 11} width={62} height={(b - a) * dy + 18} rx={5} className={cls} />
      <T x={x + 31} y={(ly(a) + ly(b)) / 2 + 4} anchor="middle" cls="t-b t-mono">{label}</T>
    </g>
  );
  return (
    <Fig id="f12car" code="modal" title="Co obowiązuje w każdej linii" h={222} legend={["rap", "cut"]}
      caption={<>Linie 2, 3 i 5 nie mają G ani F, a mimo to frez jedzie odpowiednio ruchem G01 z F200 i ruchem G00. Słowa modalne działają, dopóki inne słowo z tej samej grupy ich nie zmieni.</>}>
      {() => (
        <g>
          <T x={228} y={24} anchor="middle" cls="t-mut">ruch</T>
          <T x={306} y={24} anchor="middle" cls="t-mut">posuw</T>
          {lines.map((l, i) => (
            <g key={i}>
              <T x={18} y={ly(i) + 4} cls="t-tick">{i + 1}</T>
              <text x={34} y={ly(i) + 4} style={{ fontFamily: "var(--font-mono)", fontSize: 12.5 }}>
                {l.t.map(([w], k) => (
                  <tspan key={k} style={{ fill: w[0] === "G" ? "var(--cm-g)" : w[0] === "F" ? "var(--cm-fs)" : "var(--ink)", fontWeight: w[0] === "G" || w[0] === "F" ? 700 : 500 }}>{(k ? " " : "") + w}</tspan>
                ))}
              </text>
            </g>
          ))}
          {bar(197, 0, 2, "p-fill-cut", "G01")}
          {bar(197, 3, 4, "mod-rap", "G00")}
          {bar(197, 5, 5, "p-fill-cut", "G01")}
          {bar(275, 0, 4, "mod-f", "F200")}
          {bar(275, 5, 5, "mod-f", "F100")}
        </g>
      )}
    </Fig>
  );
}

/* ================= F1.3: ten sam kontur, dwa zapisy ================= */
export function AbsIncPlate() {
  const R: [number, number, number, number] = [-22, 104, -20, 64];
  const m = mapper(R, [10, 8, 340, 224]);
  const P = [[0, 0], [80, 0], [80, 50], [0, 50]] as const;
  const inc = ["X80", "Y50", "X−80", "Y−50"];
  return (
    <Fig id="f13ai" code="G90 G91" title="Obieg płytki: absolutnie i przyrostowo" h={250} legend={["cut", "acc"]}
      notes={<><Code k="con">G90: X80 → Y50 → X0 → Y0</Code><Code k="acc">G91: X80 → Y50 → X−80 → Y−50</Code></>}
      caption={<>Przy narożach biała współrzędna od zera W (G90). Na krawędziach pomarańczowy ruch od bieżącego punktu (G91). Tor jest ten sam.</>}>
      {(c) => (
        <g>
          <rect x={m.X(0)} y={m.Y(50)} width={80 * m.u} height={50 * m.u} fill={c.hatch} className="p-con" />
          {P.map((p, i) => {
            const q = P[(i + 1) % 4];
            return <line key={i} x1={m.X(p[0])} y1={m.Y(p[1])} x2={m.X(q[0])} y2={m.Y(q[1])} className="p-cut thick" markerEnd={c.a("cut")} />;
          })}
          <T x={m.X(40)} y={m.Y(0) + 17} anchor="middle" cls="t-acc t-b t-mono">{inc[0]}</T>
          <T x={m.X(80) + 8} y={m.Y(25) + 4} cls="t-acc t-b t-mono">{inc[1]}</T>
          <T x={m.X(40)} y={m.Y(50) - 8} anchor="middle" cls="t-acc t-b t-mono">{inc[2]}</T>
          <T x={m.X(0) - 8} y={m.Y(25) + 4} anchor="end" cls="t-acc t-b t-mono">{inc[3]}</T>
          <Pt x={m.X(0)} y={m.Y(0)} label="W  X0 Y0" pos="sw" cls="t-b t-mono" dot="pt-cut" />
          <Pt x={m.X(80)} y={m.Y(0)} label="X80 Y0" pos="se" cls="t-b t-mono" />
          <Pt x={m.X(80)} y={m.Y(50)} label="X80 Y50" pos="ne" cls="t-b t-mono" />
          <Pt x={m.X(0)} y={m.Y(50)} label="X0 Y50" pos="nw" cls="t-b t-mono" />
          <Dim x1={m.X(0)} y1={m.Y(0)} x2={m.X(80)} y2={m.Y(0)} off={30} label="80" c={c} lside={1} />
        </g>
      )}
    </Fig>
  );
}


/* ================= F1.1: przykład — blok N90 na płytce (widok z góry) ================= */
export function BlockRead() {
  const R: [number, number, number, number] = [-34, 30, -6, 30];
  const m = mapper(R, [10, 8, 340, 186]);
  const r = 5;
  return (
    <Fig id="f11rd" code="N90" title="N90 G01 X-5. F400 — co zrobi frez" h={206} legend={["cut", "stock"]}
      notes={<><Code k="cut">N90 G01 X-5. F400</Code></>}
      caption={<>Widok z góry. Przed blokiem frez Ø10 stoi w X−20 Y10 na Z−5, obok płytki. 1 — N90 to tylko etykieta. 2 — G01: ruch roboczy po prostej. 3 — X−5: cel w osi X; Y10 i Z−5 zostają, bo blok ich nie podaje. 4 — F400: prędkość ruchu 400 mm/min. Krawędź freza staje przy boku płytki w X0.</>}>
      {(c) => (
        <g>
          <rect x={m.X(0)} y={m.Y(30)} width={30 * m.u} height={30 * m.u} fill={c.hatch} className="p-con" />
          <T x={m.X(15)} y={m.Y(22)} anchor="middle" cls="t-mut">płytka</T>
          <circle cx={m.X(-20)} cy={m.Y(10)} r={r * m.u} className="tool" opacity={0.45} />
          <T x={m.X(-20)} y={m.Y(10) + r * m.u + 13} anchor="middle" cls="t-mono t-sm">X−20 Y10</T>
          <line x1={m.X(-20) + 4} y1={m.Y(10)} x2={m.X(-5) - 3} y2={m.Y(10)} className="p-cut thick" markerEnd={c.a("cut")} />
          <circle cx={m.X(-5)} cy={m.Y(10)} r={r * m.u} className="tool" />
          <circle cx={m.X(-5)} cy={m.Y(10)} r={2.2} className="pt" />
          <T x={m.X(-5)} y={m.Y(10) + r * m.u + 13} anchor="middle" cls="t-mono t-sm t-b">X−5 Y10</T>
          <Step x={m.X(-31)} y={m.Y(27)} n={1} />
          <T x={m.X(-31) + 11} y={m.Y(27) + 4} cls="t-mono t-sm">N90</T>
          <Step x={m.X(-12.5)} y={m.Y(10) - 14} n={2} />
          <Step x={m.X(-5)} y={m.Y(10) - r * m.u - 12} n={3} />
          <Step x={m.X(-20)} y={m.Y(10) - r * m.u - 12} n={4} />
          <T x={m.X(-20) + 11} y={m.Y(10) - r * m.u - 8} cls="t-cut t-b t-sm">F400</T>
          <line x1={m.X(0)} y1={m.Y(-6)} x2={m.X(0)} y2={m.Y(30)} className="p-cons" strokeDasharray="3 3" />
          <T x={m.X(0) + 3} y={m.Y(-6) - 3} cls="t-mut t-sm">X0</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= F1.2: przykład — linie 2–5 w widoku z przodu (X–Z) ================= */
export function ModalRun() {
  const R: [number, number, number, number] = [-34, 22, -12, 56];
  const m = mapper(R, [10, 8, 340, 336]);
  return (
    <Fig id="f12rn" code="modal" title="Linie 2–5 — widok z przodu" h={352} legend={["rap", "cut", "stock"]}
      notes={<><Code k="rap">2  G00 X-20. Y10.</Code><Code k="rap">3  Z5.</Code><Code k="cut">4  G01 Z-5. F150</Code><Code k="cut">5  X-5. F400</Code></>}
      caption={<>Narzędzie zaczyna na Z50 po <code>G43 H1 Z50.</code> 2 — G00 nad punkt X−20. 3 — linia bez kodu ruchu: działa G00 z linii 2. 4 — G01 i F150 zmieniają stan. 5 — znów bez kodu ruchu: działa G01 z linii 4, a F400 zastępuje F150.</>}>
      {(c) => (
        <g>
          <rect x={m.X(0)} y={m.Y(0)} width={22 * m.u} height={12 * m.u} fill={c.hatch} className="p-con" />
          <T x={m.X(11)} y={m.Y(-6) + 4} anchor="middle" cls="t-mut t-sm">płytka</T>
          <line x1={m.X(-34)} y1={m.Y(0)} x2={m.X(22)} y2={m.Y(0)} className="p-cons" strokeDasharray="3 3" />
          <T x={m.X(21)} y={m.Y(0) - 4} anchor="end" cls="t-mut t-sm">Z0</T>
          <line x1={m.X(14)} y1={m.Y(50)} x2={m.X(-20) + 3} y2={m.Y(50)} className="p-rap thick" markerEnd={c.a("rap")} />
          <T x={m.X(15)} y={m.Y(50) + 4} cls="t-mono t-sm">Z50</T>
          <Step x={m.X(0)} y={m.Y(50) - 13} n={2} />
          <line x1={m.X(-20)} y1={m.Y(50)} x2={m.X(-20)} y2={m.Y(5) - 3} className="p-rap thick" markerEnd={c.a("rap")} />
          <Step x={m.X(-20) - 14} y={m.Y(28)} n={3} />
          <line x1={m.X(-20)} y1={m.Y(5)} x2={m.X(-20)} y2={m.Y(-5) - 3} className="p-cut thick" markerEnd={c.a("cut")} />
          <T x={m.X(-20) + 6} y={m.Y(1.5)} cls="t-cut t-b t-sm">F150</T>
          <Step x={m.X(-20) - 14} y={m.Y(1)} n={4} />
          <line x1={m.X(-20)} y1={m.Y(-5)} x2={m.X(-5) - 3} y2={m.Y(-5)} className="p-cut thick" markerEnd={c.a("cut")} />
          <T x={m.X(-12.5)} y={m.Y(-5) + 15} anchor="middle" cls="t-cut t-b t-sm">F400</T>
          <Step x={m.X(-25)} y={m.Y(-5)} n={5} />
          <rect x={m.X(-10)} y={m.Y(10)} width={10 * m.u} height={15 * m.u} className="tool" opacity={0.6} />
          <T x={m.X(-5)} y={m.Y(10) - 5} anchor="middle" cls="t-mono t-sm t-b">X−5 Z−5</T>
          <T x={m.X(-20) + 6} y={m.Y(5) - 2} cls="t-mono t-sm">Z5</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= F1.3: przykład — kontur z G90 na G91 ================= */
export function IncContour() {
  const R: [number, number, number, number] = [-14, 70, -14, 44];
  const m = mapper(R, [10, 8, 340, 214]);
  const P: [number, number][] = [[0, 0], [20, 0], [20, 30], [50, 30], [50, 0]];
  const inc = ["X20.", "Y30.", "X30.", "Y-30."];
  const lab: [number, number, "start" | "end" | "middle"][] = [[10, -6, "middle"], [17, 15, "end"], [35, 36, "middle"], [53, 15, "start"]];
  return (
    <Fig id="f13rn" code="G91" title="Kontur: cel z G90, przyrost do G91" h={232} legend={["cut", "acc"]}
      notes={<><Code k="con">G90: X20. Y0. → X20. Y30. → X50. Y30. → X50. Y0.</Code><Code k="acc">G91: X20. → Y30. → X30. → Y-30.</Code></>}
      caption={<>Biała współrzędna przy punkcie — cel w G90, liczony od W. Pomarańczowy napis przy odcinku — przyrost w G91: cel minus punkt, w którym frez właśnie stoi. Numery odpowiadają krokom przykładu.</>}>
      {(c) => (
        <g>
          {P.slice(0, -1).map((p, i) => {
            const q = P[i + 1];
            return <line key={i} x1={m.X(p[0])} y1={m.Y(p[1])} x2={m.X(q[0])} y2={m.Y(q[1])} className="p-cut thick" markerEnd={c.a("cut")} />;
          })}
          {inc.map((t, i) => <T key={t} x={m.X(lab[i][0])} y={m.Y(lab[i][1]) + 4} anchor={lab[i][2]} cls="t-acc t-b t-mono">{t}</T>)}
          {[[10, 6], [27, 15], [35, 23], [43, 15]].map(([x, y], i) => <Step key={i} x={m.X(x)} y={m.Y(y)} n={i + 1} />)}
          <Pt x={m.X(0)} y={m.Y(0)} label="W  X0 Y0" pos="sw" cls="t-b t-mono" dot="pt-cut" />
          <Pt x={m.X(20)} y={m.Y(0)} label="X20 Y0" pos="se" cls="t-b t-mono t-sm" />
          <Pt x={m.X(20)} y={m.Y(30)} label="X20 Y30" pos="nw" cls="t-b t-mono t-sm" />
          <Pt x={m.X(50)} y={m.Y(30)} label="X50 Y30" pos="ne" cls="t-b t-mono t-sm" />
          <Pt x={m.X(50)} y={m.Y(0)} label="X50 Y0" pos="se" cls="t-b t-mono t-sm" />
        </g>
      )}
    </Fig>
  );
}

/* ================= F1.4: przykład — otwór zwymiarowany w calach ================= */
export function InchHole() {
  const R: [number, number, number, number] = [-16, 64, -14, 34];
  const m = mapper(R, [10, 8, 340, 196]);
  return (
    <Fig id="f14ih" code="G20 G21" title="Otwór z rysunku calowego" h={214} legend={["dim", "stock"]}
      notes={<><Code k="acc">G20 … X1.5 Y0.75</Code><Code k="cut">G21 … X38.1 Y19.05</Code></>}
      caption={<>Ten sam punkt w dwóch zapisach: wymiar z rysunku w calach i po przeliczeniu × 25,4 na milimetry. Program wybiera jeden system i ustawia go w bloku startowym.</>}>
      {(c) => (
        <g>
          <rect x={m.X(0)} y={m.Y(30)} width={60 * m.u} height={30 * m.u} fill={c.hatch} className="p-con" />
          <circle cx={m.X(38.1)} cy={m.Y(19.05)} r={3 * m.u} className="panel-bg" style={{ stroke: "var(--ink-2)" }} />
          <line x1={m.X(38.1) - 8} y1={m.Y(19.05)} x2={m.X(38.1) + 8} y2={m.Y(19.05)} className="p-ext" />
          <line x1={m.X(38.1)} y1={m.Y(19.05) - 8} x2={m.X(38.1)} y2={m.Y(19.05) + 8} className="p-ext" />
          <Pt x={m.X(0)} y={m.Y(0)} label="W" pos="sw" cls="t-b" dot="pt-cut" />
          <Dim c={c} x1={m.X(0)} y1={m.Y(0)} x2={m.X(38.1)} y2={m.Y(0)} off={22} label="1,5″ = 38,1" lside={1} />
          <Dim c={c} x1={m.X(0)} y1={m.Y(0)} x2={m.X(0)} y2={m.Y(19.05)} off={-26} label="0,75″ = 19,05" lside={-1} />
        </g>
      )}
    </Fig>
  );
}

/* ================= F1.4: ten sam zapis, dwie jednostki ================= */
export function UnitsCompare() {
  const R: [number, number, number, number] = [-8, 92, -10, 40];
  const m = mapper(R, [12, 8, 336, 190]);
  return (
    <Fig id="f14un" code="G20 G21" title="Ten sam blok X2. w milimetrach i w calach" h={212} legend={["cut", "acc", "stock"]}
      notes={<><Code k="cut">G21 X2. → 2 mm</Code><Code k="acc">G20 X2. → 2 × 25,4 = 50,8 mm</Code></>}
      caption={<>Sterowanie nie wie, w jakich jednostkach zwymiarowano rysunek. Liczy tak, jak każe aktywny kod G20 albo G21.</>}>
      {(c) => (
        <g>
          <rect x={m.X(0)} y={m.Y(30)} width={80 * m.u} height={30 * m.u} fill={c.hatch} className="p-con" />
          <line x1={m.X(0)} y1={m.Y(22)} x2={m.X(2) + 2} y2={m.Y(22)} className="p-cut thick" markerEnd={c.a("cut")} />
          <T x={m.X(4)} y={m.Y(22) + 4} cls="t-cut t-b t-mono">G21: 2 mm</T>
          <line x1={m.X(0)} y1={m.Y(9)} x2={m.X(50.8) - 2} y2={m.Y(9)} className="p-acc thick" markerEnd={c.a("acc")} />
          <T x={m.X(52)} y={m.Y(9) + 4} cls="t-acc t-b t-mono">G20: 50,8 mm</T>
          <Pt x={m.X(0)} y={m.Y(0)} label="W" pos="sw" cls="t-b" dot="pt-cut" />
          <Dim x1={m.X(0)} y1={m.Y(0)} x2={m.X(80)} y2={m.Y(0)} off={18} label="80 mm" c={c} lside={1} />
        </g>
      )}
    </Fig>
  );
}

/* ================= F1.5: szkielet programu ================= */
export function ProgramSkeleton() {
  const secs: { t: string; d: string; lines: string[]; col: string }[] = [
    { t: "Nagłówek", d: "numer, nazwa, zero", lines: ["O1000 (PLYTKA 80X50X20)", "(ZERO W: LEWY DOLNY)"], col: "var(--muted)" },
    { t: "Bezpieczny start", d: "jednostki, tryby, kasowanie", lines: ["G21 G90 G94 G17", "G40 G49 G80"], col: "var(--accent)" },
    { t: "Układ detalu", d: "zero W", lines: ["G54"], col: "var(--accent)" },
    { t: "Narzędzie i wrzeciono", d: "wymiana, obroty", lines: ["T1 M06", "S2500 M03"], col: "var(--cm-t)" },
    { t: "Obróbka", d: "ruchy", lines: ["G00 X-20. Y10.", "…"], col: "var(--green)" },
    { t: "Zakończenie", d: "odjazd, stop, koniec", lines: ["G00 Z5.", "M05", "G91 G28 Z0.", "G90", "M30"], col: "var(--cm-m)" },
  ];
  let y = 10;
  const boxes = secs.map((s) => { const h = 22 + s.lines.length * 15; const b = { ...s, y, h }; y += h + 6; return b; });
  return (
    <Fig id="f15sk" code="O…M30" title="Szkielet programu w kursie" h={y + 4}
      caption={<>Kolejność sekcji jest stała. Sekcja obróbki zmienia się z detalu na detal, a początek i koniec zostają prawie takie same.</>}>
      {() => (
        <g>
          {boxes.map((b) => (
            <g key={b.t}>
              <rect x={10} y={b.y} width={340} height={b.h} rx={8} className="panel-bg" />
              <rect x={10} y={b.y} width={4} height={b.h} rx={2} style={{ fill: b.col }} />
              <T x={24} y={b.y + 18} cls="t-b">{b.t}</T>
              <T x={24} y={b.y + 32} cls="t-mut t-sm">{b.d}</T>
              {b.lines.map((l, i) => <T key={i} x={178} y={b.y + 18 + i * 15} cls="t-mono">{l}</T>)}
            </g>
          ))}
        </g>
      )}
    </Fig>
  );
}

export const f1Figs = {
  "f11-block": () => <BlockAnatomy />,
  "f12-carry": () => <ModalCarry />,
  "f13-absinc": () => <AbsIncPlate />,
  "f11-read": () => <BlockRead />,
  "f12-run": () => <ModalRun />,
  "f13-run": () => <IncContour />,
  "f14-hole": () => <InchHole />,
  "f14-units": () => <UnitsCompare />,
  "f15-skeleton": () => <ProgramSkeleton />,
};
