import { Code, Fig, mapper, Pt, T } from "@/components/fig";

/* Rysunki modułu T5 — cykle zgrubne. Z w prawo, X (promień) w górę. */

type M = ReturnType<typeof mapper>;
const P = (m: M, z: number, r: number) => `${m.X(z)},${m.Y(r)}`;
const PROF: [number, number][] = [[2, 7], [-1, 10], [-20, 10], [-20, 14], [-21, 15], [-40, 15], [-40, 18], [-55, 18], [-55, 21]];

/* ================= T5.1: przebieg G71 ================= */
export function G71Passes() {
  const R: [number, number, number, number] = [-60, 6, -1, 23];
  const m = mapper(R, [10, 6, 340, 206]);
  const levels = [19, 17, 15, 13, 11, 9];
  const zEnd = (r: number) => (r > 18.2 ? -54.9 : r > 15.2 ? -39.9 : r > 10.2 ? -19.9 : -0.9);
  return (
    <Fig id="t51gp" code="G71" title="G71: przejścia wzdłużne aż do konturu z naddatkiem" h={232} legend={["rap", "cut", "acc", "stock"]}
      notes={<><Code k="acc">G71 U2. R0.5</Code><Code k="acc">G71 P10 Q20 U0.4 W0.1 F0.3</Code></>}
      caption={<>Z punktu startowego A cykl schodzi warstwami po U = 2 mm, każdą warstwę toczy do konturu przesuniętego o naddatek, wycofuje się pod kątem 45° o R = 0,5 i wraca ruchem szybkim. Na końcu przechodzi raz po konturze z naddatkiem i wraca do A.</>}>
      {(c) => (
        <g>
          <rect x={m.X(-58)} y={m.Y(20)} width={58 * m.u} height={20 * m.u} className="panel-bg" />
          <polygon points={`${P(m, 0, 0)} ${P(m, 0, 9)} ${PROF.slice(1, -1).map(([z, r]) => P(m, z, r)).join(" ")} ${P(m, -58, 18)} ${P(m, -58, 0)}`} fill={c.hatch} className="p-con" />
          <line x1={m.X(-60)} y1={m.Y(0)} x2={m.X(6)} y2={m.Y(0)} className="p-cons" />
          {levels.map((r) => {
            const ze = zEnd(r);
            return (
              <g key={r}>
                <line x1={m.X(2)} y1={m.Y(r)} x2={m.X(ze)} y2={m.Y(r)} className="p-cut" />
                <line x1={m.X(ze)} y1={m.Y(r)} x2={m.X(ze + 0.5)} y2={m.Y(r + 0.5)} className="p-cut" />
                <line x1={m.X(ze + 0.5)} y1={m.Y(r + 0.5)} x2={m.X(2)} y2={m.Y(r + 0.5)} className="p-rap" />
              </g>
            );
          })}
          <polyline points={PROF.map(([z, r]) => P(m, z + 0.1, r + 0.2)).join(" ")} className="p-acc" style={{ fill: "none" }} />
          <Pt x={m.X(2)} y={m.Y(21)} label="A" pos="ne" cls="t-mono t-b" dot="pt-rap" />
          <T x={m.X(-57)} y={m.Y(21.4)} cls="t-mut t-sm">pręt Ø40</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= T5.1: budowa programu z G71/G70 ================= */
export function CycleLayout() {
  const rows: { t: string; l: string[]; col: string }[] = [
    { t: "nóż zgrubny", l: ["T0101 …", "G00 X42. Z2."], col: "var(--muted)" },
    { t: "cykl zgrubny", l: ["G71 U2. R0.5", "G71 P10 Q20 U0.4 W0.1 F0.3"], col: "var(--accent)" },
    { t: "kontur N10–N20", l: ["N10 G00 X14.", "G01 X20. Z-1. F0.1", "…", "N20 X42."], col: "var(--green)" },
    { t: "nóż wykańczający", l: ["G28 U0. / G28 W0.", "T0202 …", "G42 G00 X42. Z2."], col: "var(--muted)" },
    { t: "cykl wykańczający", l: ["G70 P10 Q20"], col: "var(--cm-t)" },
  ];
  let y = 10;
  const boxes = rows.map((r) => { const h = 12 + r.l.length * 15; const b = { ...r, y, h }; y += h + 6; return b; });
  return (
    <Fig id="t51ly" code="P Q" title="Kontur zapisany raz, użyty dwa razy" h={y + 6}
      caption={<>G71 odczytuje kontur z bloków N10–N20, ale ich nie wykonuje — program po cyklu przechodzi od razu za N20. G70 wykonuje te same bloki na gotowo, z posuwem F0.1 zapisanym w konturze.</>}>
      {() => (
        <g>
          {boxes.map((b) => (
            <g key={b.t}>
              <rect x={10} y={b.y} width={340} height={b.h} rx={8} className="panel-bg" />
              <rect x={10} y={b.y} width={4} height={b.h} rx={2} style={{ fill: b.col }} />
              <T x={24} y={b.y + 18} cls="t-b">{b.t}</T>
              {b.l.map((l, i) => <T key={i} x={150} y={b.y + 18 + i * 15} cls="t-mono">{l}</T>)}
            </g>
          ))}
        </g>
      )}
    </Fig>
  );
}

/* ================= T5.2: G72 na kołnierzu ================= */
export function G72Passes() {
  const R: [number, number, number, number] = [-20, 4, -1, 34];
  const m = mapper(R, [30, 6, 300, 210]);
  const levels = [0, -2, -4, -6, -8, -10, -12, -14];
  return (
    <Fig id="t52gp" code="G72" title="G72: przejścia poprzeczne — kołnierz z pręta Ø60" h={232} legend={["rap", "cut", "acc", "stock"]}
      notes={<><Code k="acc">G72 W2. R0.5</Code><Code k="acc">G72 P10 Q20 U0.4 W0.1 F0.25</Code></>}
      caption={<>Detal krótki i szeroki: piasta Ø30 długa na 15 mm i kołnierz Ø60. G72 schodzi warstwami w Z po W = 2 mm, a każdą warstwę toczy poprzecznie — od zewnątrz do konturu piasty. Tu to wydajniejsze niż długie, płytkie przejścia G71.</>}>
      {(c) => (
        <g>
          <rect x={m.X(-18)} y={m.Y(30)} width={18 * m.u} height={30 * m.u} className="panel-bg" />
          <polygon points={`${P(m, 0, 0)} ${P(m, 0, 14)} ${P(m, -1, 15)} ${P(m, -15, 15)} ${P(m, -15, 30)} ${P(m, -18, 30)} ${P(m, -18, 0)}`} fill={c.hatch} className="p-con" />
          <line x1={m.X(-20)} y1={m.Y(0)} x2={m.X(4)} y2={m.Y(0)} className="p-cons" />
          {levels.map((z) => (
            <g key={z}>
              <line x1={m.X(z)} y1={m.Y(32)} x2={m.X(z)} y2={m.Y(15.4)} className="p-cut" />
              <line x1={m.X(z)} y1={m.Y(15.4)} x2={m.X(z + 0.5)} y2={m.Y(15.9)} className="p-cut" />
              <line x1={m.X(z + 0.5)} y1={m.Y(15.9)} x2={m.X(z + 0.5)} y2={m.Y(32)} className="p-rap" />
            </g>
          ))}
          <polyline points={`${P(m, -14.9, 32.2)} ${P(m, -14.9, 15.2)} ${P(m, -0.9, 15.2)} ${P(m, 0.1, 14.2)}`} className="p-acc" style={{ fill: "none" }} />
          <Pt x={m.X(2)} y={m.Y(32)} label="A — X64 Z2" pos="ne" cls="t-mono t-b" dot="pt-rap" />
          <T x={m.X(-17.5)} y={m.Y(26)} cls="t-mut t-sm">kołnierz</T>
          <T x={m.X(-7)} y={m.Y(8)} anchor="middle" cls="t-mut t-sm">piasta Ø30</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= T5.3: CYCLE95 ================= */
export function Cycle95Layout() {
  return (
    <Fig id="t53cy" code="CYCLE95" title="Sinumerik: kontur jako podprogram, cykl jako wywołanie" h={214}
      caption={<>Kontur leży w osobnym podprogramie albo między etykietami w programie głównym. CYCLE95 dostaje jego nazwę, głębokość skrawania, naddatki, posuwy i rodzaj obróbki — wykonuje zgrubnie, na gotowo albo oba etapy naraz.</>}>
      {() => (
        <g>
          <rect x={10} y={20} width={176} height={176} rx={8} className="panel-bg" />
          <T x={20} y={38} cls="t-b">WALEK.MPF</T>
          {["T1 D1", "G96 S200 M3", "G0 X42 Z2", "CYCLE95(\"KONTUR\", …)", "…", "M30"].map((l, i) => (
            <T key={i} x={20} y={62 + i * 20} cls={i === 3 ? "t-mono t-acc t-b" : "t-mono"}>{l}</T>
          ))}
          <rect x={206} y={40} width={144} height={136} rx={8} className="panel-bg" style={{ stroke: "var(--cm-t)" }} />
          <T x={216} y={58} cls="t-b">KONTUR.SPF</T>
          {["G1 X14 Z0", "G1 X20 Z-1", "Z-20", "…", "RET"].map((l, i) => <T key={i} x={216} y={82 + i * 19} cls="t-mono">{l}</T>)}
          <path d="M 176 118 C 190 118, 192 70, 204 70" className="p-acc thick" markerEnd="url(#t53cy-a-acc)" />
        </g>
      )}
    </Fig>
  );
}

export const t5Figs = {
  "t51-g71": () => <G71Passes />,
  "t51-layout": () => <CycleLayout />,
  "t52-g72": () => <G72Passes />,
  "t53-cycle95": () => <Cycle95Layout />,
};
