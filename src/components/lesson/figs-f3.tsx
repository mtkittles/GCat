import { Code, Fig, mapper, Pt, T } from "@/components/fig";

/* Rysunki modułu F3 — ruchy. Styl i kolory z fig.tsx. */

/* ================= F3.1: bezpieczny najazd ================= */
export function SafeApproach() {
  const R: [number, number, number, number] = [-36, 66, -24, 56];
  const m = mapper(R, [10, 6, 340, 232]);
  const S = { x: 40, z: 50 }, E = { x: -20, z: 5 };
  const knee = { x: S.x - (S.z - E.z), z: E.z };
  return (
    <Fig id="f31ap" code="G00" title="Najazd ruchem szybkim — widok z boku" h={250} legend={["rap", "bad", "stock"]}
      notes={<><Code k="rap">G00 X-20. Y10.</Code><Code k="rap">G00 Z5.</Code><Code k="bad">G00 X-20. Y10. Z5.</Code></>}
      caption={<>Przy ruchu szybkim osie często jadą niezależnie, każda z pełną prędkością. Oś Z kończy wcześniej i reszta drogi biegnie nisko — prosto na docisk. Bezpiecznie: najpierw XY wysoko, potem sam Z w dół.</>}>
      {(c) => (
        <g>
          <rect x={m.X(0)} y={m.Y(0)} width={60 * m.u} height={20 * m.u} fill={c.hatch} className="p-con" />
          <rect x={m.X(-8)} y={m.Y(9)} width={14 * m.u} height={9 * m.u} rx={2} className="clamp" />
          <T x={m.X(-1)} y={m.Y(9) - 5} anchor="middle" cls="t-mut">docisk</T>
          <line x1={m.X(-36)} y1={m.Y(0)} x2={m.X(66)} y2={m.Y(0)} className="p-cons" />
          <T x={m.X(64)} y={m.Y(0) - 5} anchor="end" cls="t-mut t-mono">Z0</T>
          <line x1={m.X(S.x)} y1={m.Y(S.z)} x2={m.X(E.x) + 3} y2={m.Y(S.z)} className="p-rap thick" markerEnd={c.a("rap")} />
          <line x1={m.X(E.x)} y1={m.Y(S.z)} x2={m.X(E.x)} y2={m.Y(E.z) - 3} className="p-rap thick" markerEnd={c.a("rap")} />
          <polyline points={`${m.X(S.x)},${m.Y(S.z)} ${m.X(knee.x)},${m.Y(knee.z)} ${m.X(E.x) + 3},${m.Y(E.z)}`} className="p-bad" markerEnd={c.a("bad")} />
          <T x={m.X(10)} y={m.Y(26)} cls="t-bad">razem z Z</T>
          <T x={m.X(8)} y={m.Y(S.z) - 7} anchor="middle" cls="t-rap t-b">1. XY wysoko</T>
          <T x={m.X(E.x) - 5} y={m.Y(28)} anchor="end" cls="t-rap t-b">2. Z w dół</T>
          <Pt x={m.X(S.x)} y={m.Y(S.z)} label="Z50." pos="ne" cls="t-mono t-b" />
          <Pt x={m.X(E.x)} y={m.Y(E.z)} label="X−20 Z5" pos="sw" cls="t-mono t-b" dot="pt-rap" />
        </g>
      )}
    </Fig>
  );
}

export const f3Figs = {
  "f31-approach": () => <SafeApproach />,
};
