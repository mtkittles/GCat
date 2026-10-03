import { Dim, Fig, mapper, T } from "@/components/fig";

/*
  Niezależne rysunki dydaktyczne (nie korzystają z symulatora).
  Wszystkie współrzędne liczone w mm, mapowane na SVG przez mapper().
*/

/* ===== G84: cztery różne głębokości przy gwintowaniu (M10×1,5) =====
   Założenia przykładu: gwintownik z nakrojem ok. 3 zwojów (3 × 1,5 = 4,5 mm),
   pełny gwint L = 15 mm, otwór Ø8,5 z zapasem 2,5 mm i stożkiem 118°. */
export function TapDepths() {
  const R: [number, number, number, number] = [-34, 34, -30, 9];
  const m = mapper(R, [8, 8, 344, 236]);
  const L = 15, nak = 4.5, zTool = -(L + nak), zHole = zTool - 2.5;
  const rHole = 4.25, rTap = 5, cone = rHole / Math.tan((59 * Math.PI) / 180);
  const xs = -12; // oś otworu
  return (
    <Fig id="g84dep" code="G84" title="G84 — cztery różne głębokości (M10×1,5)" h={250} legend={["acc", "dim", "stock"]}
      caption={<>Z w bloku G84 to <b>położenie końca gwintownika</b> na dnie cyklu: Z−19,5 = pełny gwint 15 mm + nakrój ok. 4,5 mm. Otwór musi być głębszy niż Z, bo stożek wiertła i wióry potrzebują miejsca. R5 to płaszczyzna startu posuwu, nie głębokość.</>}>
      {(c) => (
        <g>
          {/* materiał z otworem */}
          <rect x={m.X(-30)} y={m.Y(0)} width={60 * m.u} height={28 * m.u} fill={c.hatch} className="p-con" />
          <rect x={m.X(xs - rHole)} y={m.Y(0)} width={2 * rHole * m.u} height={-zHole * m.u} style={{ fill: "var(--bg)", stroke: "var(--ink-2)" }} />
          <polygon points={`${m.X(xs - rHole)},${m.Y(zHole)} ${m.X(xs + rHole)},${m.Y(zHole)} ${m.X(xs)},${m.Y(zHole - cone)}`} style={{ fill: "var(--bg)", stroke: "var(--ink-2)" }} />
          {/* pełny gwint: zarys piłowy po obu stronach na długości L */}
          {Array.from({ length: Math.round(L / 1.5) }, (_, i) => {
            const z1 = -i * 1.5, z2 = z1 - 0.75, z3 = z1 - 1.5;
            return (
              <g key={i}>
                <polyline points={`${m.X(xs - rHole)},${m.Y(z1)} ${m.X(xs - rTap)},${m.Y(z2)} ${m.X(xs - rHole)},${m.Y(z3)}`} className="p-acc" fill="none" />
                <polyline points={`${m.X(xs + rHole)},${m.Y(z1)} ${m.X(xs + rTap)},${m.Y(z2)} ${m.X(xs + rHole)},${m.Y(z3)}`} className="p-acc" fill="none" />
              </g>
            );
          })}
          {/* nakrój: zwoje niepełne, zbieżne */}
          <line x1={m.X(xs - rTap)} y1={m.Y(-L)} x2={m.X(xs - rHole)} y2={m.Y(zTool)} className="p-acc dashed" />
          <line x1={m.X(xs + rTap)} y1={m.Y(-L)} x2={m.X(xs + rHole)} y2={m.Y(zTool)} className="p-acc dashed" />
          {/* płaszczyzny */}
          <line x1={m.X(-30)} y1={m.Y(5)} x2={m.X(30)} y2={m.Y(5)} className="p-rap" strokeDasharray="5 4" />
          <T x={m.X(-29)} y={m.Y(5) - 5} cls="t-rap t-b">R5 — start posuwu</T>
          <T x={m.X(-29)} y={m.Y(0) - 5} cls="t-mut t-sm">Z0 — powierzchnia</T>
          <line x1={m.X(xs - 9)} y1={m.Y(zTool)} x2={m.X(xs + 9)} y2={m.Y(zTool)} className="p-cut thick" />
          <T x={m.X(xs - 10)} y={m.Y(zTool) + 4} anchor="end" cls="t-cut t-b">Z−19,5</T>
          {/* wymiary */}
          <Dim c={c} x1={m.X(4)} y1={m.Y(0)} x2={m.X(4)} y2={m.Y(-L)} label="pełny gwint 15" lside={1} />
          <Dim c={c} x1={m.X(4)} y1={m.Y(-L)} x2={m.X(4)} y2={m.Y(zTool)} label="nakrój ≈ 4,5" lside={1} />
          <Dim c={c} x1={m.X(19)} y1={m.Y(0)} x2={m.X(19)} y2={m.Y(zHole)} label="otwór 22" lside={1} />
          <T x={m.X(xs)} y={m.Y(zHole - cone) + 14} anchor="middle" cls="t-mut t-sm">Ø8,5, stożek 118°</T>
        </g>
      )}
    </Fig>
  );
}

/* ===== G28: punkt pośredni w G91 i w G90 =====
   Frezarka pionowa; punkt referencyjny Z ustawiony u góry zakresu (typowo — zależy od maszyny).
   Narzędzie stoi w Z5 nad detalem, zero detalu na górnej powierzchni (Z0). */
export function G28Path() {
  const R: [number, number, number, number] = [-10, 130, -24, 62];
  const m = mapper(R, [8, 8, 344, 236]);
  const zRef = 56;
  return (
    <Fig id="g28p" code="G28" title="G28 — przejazd przez punkt pośredni" h={250} legend={["rap", "bad", "stock"]}
      caption={<>Oba bloki jadą najpierw do punktu pośredniego, potem do punktu referencyjnego. W <b>G91 G28 Z0</b> punkt pośredni to bieżąca pozycja (przyrost 0), więc zostaje sam drugi etap. W <b>G90 G28 Z0</b> punkt pośredni to Z0 układu detalu — tu powierzchnia detalu, więc pierwszy etap schodzi ruchem szybkim na detal.</>}>
      {(c) => (
        <g>
          <rect x={m.X(0)} y={m.Y(0)} width={110 * m.u} height={20 * m.u} fill={c.hatch} className="p-con" />
          <T x={m.X(108)} y={m.Y(-18)} anchor="end" cls="t-mut t-sm">detal, Z0 na górze</T>
          <line x1={m.X(-8)} y1={m.Y(zRef)} x2={m.X(118)} y2={m.Y(zRef)} className="p-cons" />
          <T x={m.X(-8)} y={m.Y(zRef) - 6} cls="t-b">punkt referencyjny Z (ustawia producent)</T>
          {/* G91: z Z5 prosto do referencji */}
          <circle cx={m.X(25)} cy={m.Y(5)} r={3.6} className="pt" />
          <T x={m.X(25) - 7} y={m.Y(5) + 4} anchor="end" cls="t-b">start Z5</T>
          <line x1={m.X(25)} y1={m.Y(5)} x2={m.X(25)} y2={m.Y(zRef)} className="p-rap thick" markerEnd={c.a("rap")} />
          <T x={m.X(25) - 6} y={m.Y(30)} anchor="end" cls="t-rap t-b">G91 G28 Z0</T>
          {/* G90: najpierw do Z0 detalu, potem do referencji */}
          <circle cx={m.X(72)} cy={m.Y(5)} r={3.6} className="pt" />
          <T x={m.X(72) + 7} y={m.Y(5) - 2} cls="t-b">start Z5</T>
          <line x1={m.X(72)} y1={m.Y(5)} x2={m.X(72)} y2={m.Y(0)} className="p-bad thick" markerEnd={c.a("bad")} />
          <circle cx={m.X(72)} cy={m.Y(0)} r={3.2} className="pt" />
          <T x={m.X(72)} y={m.Y(0) + 15} anchor="middle" cls="t-bad t-b">1: pośredni = Z0</T>
          <line x1={m.X(78)} y1={m.Y(0)} x2={m.X(78)} y2={m.Y(zRef)} className="p-rap" markerEnd={c.a("rap")} />
          <T x={m.X(81)} y={m.Y(30)} cls="t-rap t-b">2: do punktu ref.</T>
          <T x={m.X(72)} y={m.Y(-12)} anchor="middle" cls="t-bad t-b">G90 G28 Z0</T>
        </g>
      )}
    </Fig>
  );
}

/* ===== T0.2: faza i stożek w zapisie średnicowym ===== */
export function DiaTaper() {
  const R: [number, number, number, number] = [-9, 3, 12, 17.5];
  const m = mapper(R, [10, 8, 340, 232]);
  return (
    <Fig id="t02tap" code="ΔX ΔZ" title="Faza 45° a ΔX = 1 przy ΔZ = 1 (zapis średnicowy)" h={250} legend={["cut", "bad", "dim"]}
      caption={<>Na górze: faza 1 × 45° — ΔZ = 1, promień zmienia się o 1, więc <b>|ΔX| = 2</b> (Ø28 → Ø30). Na dole: |ΔX| = 1 przy |ΔZ| = 1 to zmiana promienia o 0,5 — stożek o półkącie α ≈ 26,6° do osi Z (tan α = 0,5), a nie faza 45°. Znaki ΔX i ΔZ zależą od kierunku ruchu; wzory dotyczą wartości bezwzględnych.</>}>
      {(c) => (
        <g>
          {/* górny wariant: Ø28 → Ø30 na 1 mm, poziom r 14..15 */}
          <polyline points={`${m.X(-8)},${m.Y(15)} ${m.X(-2)},${m.Y(15)} ${m.X(-1)},${m.Y(14)} ${m.X(2)},${m.Y(14)}`} className="p-cut thick" fill="none" />
          <Dim c={c} x1={m.X(-2)} y1={m.Y(15)} x2={m.X(-1)} y2={m.Y(15)} off={-12} label="ΔZ 1" />
          <Dim c={c} x1={m.X(-0.6)} y1={m.Y(14)} x2={m.X(-0.6)} y2={m.Y(15)} label="Δr 1" lside={1} />
          <T x={m.X(-8)} y={m.Y(15.5)} cls="t-cut t-b">faza 1×45°: |ΔX| = 2</T>
          {/* dolny wariant: zmiana promienia 0,5 na 1 mm */}
          <polyline points={`${m.X(-8)},${m.Y(13)} ${m.X(-2)},${m.Y(13)} ${m.X(-1)},${m.Y(12.5)} ${m.X(2)},${m.Y(12.5)}`} className="p-bad thick" fill="none" />
          <line x1={m.X(-1)} y1={m.Y(12.5)} x2={m.X(-4.5)} y2={m.Y(12.5)} className="p-cons" />
          <T x={m.X(-4.4)} y={m.Y(12.5) + 14} cls="t-bad t-sm">α ≈ 26,6° do osi Z</T>
          <Dim c={c} x1={m.X(-0.6)} y1={m.Y(12.5)} x2={m.X(-0.6)} y2={m.Y(13)} label="Δr 0,5" lside={1} />
          <T x={m.X(-8)} y={m.Y(13.5)} cls="t-bad t-b">|ΔX| = 1: stożek, nie faza</T>
        </g>
      )}
    </Fig>
  );
}

export const auditFigs = {
  "g84-depths": () => <TapDepths />,
  "g28-path": () => <G28Path />,
  "t02-taper": () => <DiaTaper />,
};
