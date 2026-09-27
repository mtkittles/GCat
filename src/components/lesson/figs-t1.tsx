import { Code, Fig, mapper, Pt, T } from "@/components/fig";

/* Rysunki modułu T1 — struktura programu tokarskiego. */

const COL: Record<string, string> = { N: "var(--muted)", G: "var(--cm-g)", X: "var(--ink)", Z: "var(--ink)", F: "var(--cm-fs)" };

/* ================= T1.1: blok tokarski ================= */
export function LatheBlock() {
  const words = [["N30", "numer", "adres N"], ["G01", "funkcja G", "ruch roboczy"], ["X30.", "średnica", "adres X"], ["Z-20.", "długość", "adres Z"], ["F0.2", "posuw", "mm/obr"]];
  const cw = 9.3, pad = 12, gap = 6, y = 58, h = 30;
  const widths = words.map(([w]) => w.length * cw + pad);
  const total = widths.reduce((a, b) => a + b, 0) + gap * (words.length - 1);
  let x0 = (360 - total) / 2;
  const box = words.map(([w, a, b], i) => { const r = { w, a, b, x: x0, width: widths[i], cx: x0 + widths[i] / 2 }; x0 += widths[i] + gap; return r; });
  return (
    <Fig id="t11bl" code="N G X Z F" title="Blok tokarski: pięć słów" h={172}
      caption={<>Budowa bloku jest taka sama jak na frezarce. Różnią się znaczenia: X to średnica, a F przy G99 to posuw na obrót — 0,2 mm na każdy obrót wrzeciona.</>}>
      {() => (
        <g>
          {box.map((b, i) => (
            <g key={b.w}>
              <rect x={b.x} y={y - h / 2} width={b.width} height={h} rx={6} className="panel-bg" />
              <text x={b.cx} y={y + 5.5} textAnchor="middle" style={{ fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 700, fill: COL[b.w[0]] }}>{b.w}</text>
              <line x1={b.cx} y1={y + h / 2 + 3} x2={b.cx} y2={(i % 2 ? 140 : 108) - 12} className="p-cons" />
              <T x={b.cx} y={i % 2 ? 140 : 108} anchor="middle" cls="t-b">{b.a}</T>
              <T x={b.cx} y={(i % 2 ? 140 : 108) + 13} anchor="middle" cls="t-mut t-sm">{b.b}</T>
            </g>
          ))}
        </g>
      )}
    </Fig>
  );
}

/* ================= T1.2: X/Z i U/W ================= */
export function LatheAbsInc() {
  const R: [number, number, number, number] = [-48, 8, -4, 26];
  const m = mapper(R, [10, 6, 340, 196]);
  const path: [number, number][] = [[2, 20], [2, 15], [-20, 15], [-20, 18], [-40, 18]];
  const inc = ["U−10.", "W−22.", "U6.", "W−20."];
  const abs = ["X30.", "Z−20.", "X36.", "Z−40."];
  return (
    <Fig id="t12uw" code="X U" title="Ten sam tor: X/Z absolutnie, U/W przyrostowo" h={220} legend={["cut", "acc", "stock"]}
      notes={<><Code k="con">X30. → Z-20. → X36. → Z-40.</Code><Code k="acc">U-10. → W-22. → U6. → W-20.</Code></>}
      caption={<>Start w X40 Z2. X i Z podają cel względem zera W, U i W — przesunięcie od bieżącego punktu. U jest w średnicy: U−10 to 5 mm bliżej osi.</>}>
      {(c) => (
        <g>
          <rect x={m.X(-46)} y={m.Y(20)} width={46 * m.u} height={20 * m.u} fill={c.hatch} className="p-con" style={{ opacity: 0.5 }} />
          <line x1={m.X(-48)} y1={m.Y(0)} x2={m.X(8)} y2={m.Y(0)} className="p-cons" />
          {path.slice(1).map(([z, r], i) => {
            const [z0, r0] = path[i];
            const horiz = r === r0;
            return (
              <g key={i}>
                <line x1={m.X(z0)} y1={m.Y(r0)} x2={m.X(z)} y2={m.Y(r)} className="p-cut thick" markerEnd={c.a("cut")} />
                <T x={horiz ? (m.X(z0) + m.X(z)) / 2 : m.X(z) + 5} y={horiz ? m.Y(r) + 15 : (m.Y(r0) + m.Y(r)) / 2 + 4} anchor={horiz ? "middle" : "start"} cls="t-acc t-b t-mono">{inc[i]}</T>
                <T x={horiz ? (m.X(z0) + m.X(z)) / 2 : m.X(z) + 5} y={horiz ? m.Y(r) - 7 : (m.Y(r0) + m.Y(r)) / 2 + 17} anchor={horiz ? "middle" : "start"} cls="t-mono">{abs[i]}</T>
              </g>
            );
          })}
          <Pt x={m.X(2)} y={m.Y(20)} label="X40 Z2" pos="ne" cls="t-mono t-b" dot="pt-rap" />
          <Pt x={m.X(0)} y={m.Y(0)} label="W" pos="se" cls="t-acc t-b" />
        </g>
      )}
    </Fig>
  );
}

/* ================= T1.3: szkielet programu tokarskiego ================= */
export function LatheSkeleton() {
  const secs: { t: string; d: string; lines: string[]; col: string }[] = [
    { t: "Nagłówek", d: "numer, nazwa, zero, surówka", lines: ["O2001 (WALEK)", "(ZERO W: OS, CZOLO)"], col: "var(--muted)" },
    { t: "Bezpieczny start", d: "płaszczyzna, jednostki, kasowanie", lines: ["G18 G21 G40 G80 G99"], col: "var(--accent)" },
    { t: "Układ detalu", d: "zero W", lines: ["G54"], col: "var(--accent)" },
    { t: "Narzędzie i wrzeciono", d: "moduł T2", lines: ["T0101", "G96 S200 M03"], col: "var(--cm-t)" },
    { t: "Obróbka", d: "najazd, skrawanie", lines: ["G00 X44. Z2.", "…"], col: "var(--green)" },
    { t: "Zakończenie", d: "najpierw X, potem Z", lines: ["G28 U0.", "G28 W0.", "M30"], col: "var(--cm-m)" },
  ];
  let y = 10;
  const boxes = secs.map((s) => { const h = 22 + s.lines.length * 15; const b = { ...s, y, h }; y += h + 6; return b; });
  return (
    <Fig id="t13sk" code="O…M30" title="Szkielet programu tokarskiego" h={y + 4}
      caption={<>Kolejność sekcji jest taka sama jak na frezarce. Różnice: G18 zamiast G17, posuw na obrót G99, narzędzie T0101 bez M06 i odjazd na końcu najpierw w X, potem w Z.</>}>
      {() => (
        <g>
          {boxes.map((b) => (
            <g key={b.t}>
              <rect x={10} y={b.y} width={340} height={b.h} rx={8} className="panel-bg" />
              <rect x={10} y={b.y} width={4} height={b.h} rx={2} style={{ fill: b.col }} />
              <T x={24} y={b.y + 18} cls="t-b">{b.t}</T>
              <T x={24} y={b.y + 32} cls="t-mut t-sm">{b.d}</T>
              {b.lines.map((l, i) => <T key={i} x={186} y={b.y + 18 + i * 15} cls="t-mono">{l}</T>)}
            </g>
          ))}
        </g>
      )}
    </Fig>
  );
}

export const t1Figs = {
  "t11-block": () => <LatheBlock />,
  "t12-uw": () => <LatheAbsInc />,
  "t13-skeleton": () => <LatheSkeleton />,
};
