import { Code, Dim, Fig, mapper, T } from "@/components/fig";

/* Rysunki modułu T7 — gwintowanie. Z w prawo, X (promień) w górę. */

/* ================= T7.1: profil M20×1,5 ================= */
export function ThreadProfile() {
  const R: [number, number, number, number] = [-5.2, 0.4, 8.6, 10.6];
  const m = mapper(R, [16, 8, 328, 196]);
  const p = 1.5, crest = 10, root = 9.08;
  const pts: string[] = [];
  for (let k = 0; k < 4; k++) {
    const z0 = -k * p;
    pts.push(`${m.X(z0)},${m.Y(crest)}`, `${m.X(z0 - p * 0.125)},${m.Y(crest)}`, `${m.X(z0 - p * 0.5 + p * 0.0625)},${m.Y(root)}`, `${m.X(z0 - p * 0.5 - p * 0.0625)},${m.Y(root)}`, `${m.X(z0 - p * 0.875)},${m.Y(crest)}`);
  }
  return (
    <Fig id="t71pr" code="M20×1,5" title="Gwint M20×1,5 — przekrój zwoju" h={220} legend={["acc", "dim", "stock"]}
      notes={<><Code k="acc">h3 = 0,6134 · P = 0,92</Code><Code k="acc">rdzeń: 20 − 2 · 0,92 = Ø18,16</Code></>}
      caption={<>Kąt zarysu 60°, skok P = 1,5 mm. Wysokość zwoju gwintu zewnętrznego h3 ≈ 0,6134 · P. W programie: średnica rdzenia X18.16 i wysokość zwoju P920 (w mikrometrach).</>}>
      {(c) => (
        <g>
          <polygon points={`${m.X(0.4)},${m.Y(crest)} ${pts.join(" ")} ${m.X(-5.2)},${m.Y(crest)} ${m.X(-5.2)},${m.Y(8.6)} ${m.X(0.4)},${m.Y(8.6)}`} fill={c.hatch} className="p-con" />
          <line x1={m.X(-5.2)} y1={m.Y(crest)} x2={m.X(0.4)} y2={m.Y(crest)} className="p-cons" />
          <line x1={m.X(-5.2)} y1={m.Y(root)} x2={m.X(0.4)} y2={m.Y(root)} className="p-cons" />
          <Dim x1={m.X(-1.5)} y1={m.Y(10.35)} x2={m.X(-3)} y2={m.Y(10.35)} off={0} label="P 1,5" c={c} cls="t-mono t-acc t-b" />
          <Dim x1={m.X(0.25)} y1={m.Y(root)} x2={m.X(0.25)} y2={m.Y(crest)} label="0,92" c={c} lside={1} cls="t-mono t-acc t-b" />
          <T x={m.X(-5)} y={m.Y(crest) - 6} cls="t-mono">Ø20</T>
          <T x={m.X(-5)} y={m.Y(root) + 14} cls="t-mono">Ø18,16</T>
          <T x={m.X(-2.25)} y={m.Y(9.2)} anchor="middle" cls="t-mut t-sm">60°</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= T7.1: wejścia G76 ================= */
export function ThreadPasses() {
  const d = [0.3, 0.424, 0.52, 0.6, 0.671, 0.735, 0.794, 0.849, 0.87, 0.92];
  const L = 40, B = 180, W = 300, H = 150;
  const x = (i: number) => L + 8 + i * (W / d.length);
  const y = (v: number) => B - (v / 1) * H;
  return (
    <Fig id="t71ps" code="G76" title="Głębokość po kolejnych przejściach G76" h={210} legend={["acc", "cut"]}
      notes={<><Code k="acc">głębokość n = Q · √n</Code><Code k="cut">ostatnie: naddatek R, potem pełna głębokość</Code></>}
      caption={<>Każde przejście zdejmuje wiór o podobnym przekroju — dlatego kolejne wejścia są coraz płytsze. Pierwsze 0,3 mm, potem 0,12, 0,10… aż do 0,87, na końcu przejście wykańczające na pełną wysokość 0,92.</>}>
      {() => (
        <g>
          <line x1={L} y1={B} x2={L + W + 10} y2={B} className="ax" /><line x1={L} y1={B} x2={L} y2={B - H - 10} className="ax" />
          {[0, 0.5, 1].map((v) => <T key={v} x={L - 5} y={y(v) + 4} anchor="end" cls="t-tick">{v}</T>)}
          <T x={L} y={B - H - 16} cls="t-mut t-sm">głębokość [mm]</T>
          {d.map((v, i) => (
            <g key={i}>
              <rect x={x(i)} y={y(v)} width={W / d.length - 8} height={B - y(v)} className={i >= d.length - 2 ? "p-fill-cut" : "p-fill-acc"} />
              <T x={x(i) + (W / d.length - 8) / 2} y={B + 13} anchor="middle" cls="t-tick">{i + 1}</T>
            </g>
          ))}
          <line x1={L} y1={y(0.92)} x2={L + W + 10} y2={y(0.92)} className="p-cut dashed" />
          <T x={L + W + 8} y={y(0.92) - 5} anchor="end" cls="t-cut t-sm t-b">0,92</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= T7.2: przejście G32 ================= */
export function G32Pass() {
  const X = (z: number) => 26 + (z + 20) * 13, Y = (r: number) => 180 - (r - 8.5) * 55;
  return (
    <Fig id="t72pl" code="G32" title="Jedno przejście gwintu zapisane ręcznie — schemat" h={212} legend={["rap", "cut", "stock"]}
      notes={<><Code k="rap">G00 X19.4</Code><Code k="cut">G32 Z-17. F1.5</Code><Code k="rap">G00 X22.</Code><Code k="rap">Z5.</Code></>}
      caption={<>G32 to toczenie po prostej z posuwem równym skokowi, zsynchronizowane z obrotem wrzeciona. Każde przejście musi zaczynać się w tym samym Z startowym, żeby nóż trafiał w ten sam zwój. Skala pionowa powiększona.</>}>
      {(c) => (
        <g>
          <rect x={X(-20)} y={Y(10)} width={X(0) - X(-20)} height={Y(8.5) - Y(10)} fill={c.hatch} className="p-con" />
          <rect x={X(-20)} y={Y(10)} width={X(-16) - X(-20)} height={Y(8.5) - Y(10)} className="panel-bg" />
          <line x1={X(5)} y1={Y(11)} x2={X(5)} y2={Y(9.7) - 3} className="p-rap thick" markerEnd={c.a("rap")} />
          <line x1={X(5)} y1={Y(9.7)} x2={X(-17) + 3} y2={Y(9.7)} className="p-cut thick" markerEnd={c.a("cut")} />
          <line x1={X(-17)} y1={Y(9.7)} x2={X(-17)} y2={Y(11) + 3} className="p-rap" markerEnd={c.a("rap")} />
          <line x1={X(-17)} y1={Y(11)} x2={X(5) - 3} y2={Y(11)} className="p-rap" markerEnd={c.a("rap")} />
          <T x={X(5) - 6} y={Y(11) - 8} anchor="end" cls="t-mono t-b">X22 Z5</T>
          <T x={X(-6)} y={Y(9.7) - 6} anchor="middle" cls="t-cut t-b">G32 Z-17. F1.5</T>
          <T x={X(-18)} y={Y(8.5) + 14} anchor="middle" cls="t-mut t-sm">podcięcie</T>
          <T x={X(-8)} y={Y(8.5) + 14} anchor="middle" cls="t-mut t-sm">czop Ø20</T>
        </g>
      )}
    </Fig>
  );
}

export const t7Figs = {
  "t71-profile": () => <ThreadProfile />,
  "t71-passes": () => <ThreadPasses />,
  "t72-g32": () => <G32Pass />,
};
