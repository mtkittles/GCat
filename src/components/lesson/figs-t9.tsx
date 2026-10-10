import { Code, Dim, Fig, mapper, Pt, Step, T } from "@/components/fig";

/* T9.1 — zadanie końcowe: wałek z pręta Ø50, inne średnice i nóż zgrubny R0,4. */

type M = ReturnType<typeof mapper>;
/* profil [z, r] górnej połowy: czoło → koniec Ø46 */
const PROF: [number, number][] = [[0, 0], [0, 11.5], [-1.5, 13], [-22, 13], [-22, 17], [-23, 18], [-38, 18], [-38, 22], [-39, 23], [-50, 23], [-50, 0]];
const poly = (m: M, pts: [number, number][], mirror = false) => pts.map(([z, r]) => `${m.X(z)},${m.Y(mirror ? -r : r)}`).join(" ");

export function T91Part() {
  const R: [number, number, number, number] = [-60, 8, -50, 28];
  const m = mapper(R, [10, 6, 340, 236]);
  const vd = (z: number, r: number, label: string) => (
    <g key={label}>
      <line x1={m.X(z)} y1={m.Y(r)} x2={m.X(z)} y2={m.Y(-r)} className="p-dim" markerStart="url(#t91pt-a-dim)" markerEnd="url(#t91pt-a-dim)" />
      <T x={m.X(z) + 4} y={m.Y(-r / 2)} cls="t-mono t-acc t-b">{label}</T>
    </g>
  );
  return (
    <Fig id="t91pt" code="Ø" title="Nowy wałek: pręt Ø50, trzy średnice" h={256} legend={["acc", "dim", "stock"]}
      notes={<><Code k="con">Ø26 × 22, faza 1,5 × 45°</Code><Code k="con">Ø36, faza 1 × 45°</Code><Code k="con">Ø46, R1 na krawędzi</Code></>}
      caption={<>Zero W na osi, na czole detalu — jak w kursie. Inne są średnice, długości, fazy i promień ostrza noża zgrubnego. Surówka to pręt Ø50 — linia przerywana.</>}>
      {(c) => (
        <g>
          <rect x={m.X(-56)} y={m.Y(25)} width={56 * m.u} height={50 * m.u} className="stock-out" />
          <polygon points={poly(m, PROF)} fill={c.hatch} className="p-con" />
          <polygon points={poly(m, PROF, true)} className="panel-bg" style={{ stroke: "var(--ink-2)" }} />
          <line x1={m.X(-60)} y1={m.Y(0)} x2={m.X(8)} y2={m.Y(0)} className="p-cons" />
          {vd(-11, 13, "Ø26")}{vd(-30, 18, "Ø36")}{vd(-45, 23, "Ø46")}
          <Dim x1={m.X(0)} y1={m.Y(-23)} x2={m.X(-22)} y2={m.Y(-23)} off={-14} label="22" c={c} lside={1} />
          <Dim x1={m.X(0)} y1={m.Y(-23)} x2={m.X(-38)} y2={m.Y(-23)} off={-30} label="38" c={c} lside={1} />
          <Dim x1={m.X(0)} y1={m.Y(-23)} x2={m.X(-50)} y2={m.Y(-23)} off={-46} label="50" c={c} lside={1} />
          <Pt x={m.X(0)} y={m.Y(0)} label="W" pos="ne" cls="t-acc t-b" dot="pt-rap" />
        </g>
      )}
    </Fig>
  );
}

export function T91Contour() {
  const R: [number, number, number, number] = [-56, 6, -2, 27];
  const m = mapper(R, [10, 8, 340, 232]);
  const pts: [number, number][] = [[2, 9.5], [-1.5, 13], [-22, 13], [-22, 17], [-23, 18], [-38, 18], [-38, 22], [-39, 23], [-50, 23], [-50, 26]];
  return (
    <Fig id="t91ct" code="P–Q" title="Kontur N10–N20 — górna połowa" h={256} legend={["rap", "cut", "arc", "con"]}
      notes={<><Code k="rap">N10 G00 X19.</Code><Code k="cut">G01 X26. Z-1.5 F0.1</Code><Code k="arc">G03 X46. Z-39. R1.</Code><Code k="cut">N20 X52.</Code></>}
      caption={<>Faza przy czole przedłużona do Z2, skąd startuje cykl: na 1,5 mm długości średnica rośnie o 3 mm, więc na Z2 wypada X19. Kontur jest monotoniczny w X i w Z — warunek G71 typu I. Numery to kroki przykładu.</>}>
      {(c) => (
        <g>
          <polygon points={poly(m, PROF)} fill={c.hatch} className="p-con" />
          <line x1={m.X(-56)} y1={m.Y(0)} x2={m.X(6)} y2={m.Y(0)} className="p-cons" />
          <line x1={m.X(2)} y1={m.Y(26)} x2={m.X(2)} y2={m.Y(9.5)} className="p-rap" markerEnd={c.a("rap")} />
          <polyline points={pts.slice(0, 7).map(([z, r]) => `${m.X(z)},${m.Y(r)}`).join(" ")} className="p-cut thick" />
          <path d={`M ${m.X(-38)} ${m.Y(22)} A ${m.u} ${m.u} 0 0 0 ${m.X(-39)} ${m.Y(23)}`} className="p-arc thick" />
          <polyline points={pts.slice(7).map(([z, r]) => `${m.X(z)},${m.Y(r)}`).join(" ")} className="p-cut thick" markerEnd={c.a("cut")} />
          <Pt x={m.X(2)} y={m.Y(26)} label="X52 Z2" pos="nw" dot="pt-rap" />
          <Step x={m.X(2) + 12} y={m.Y(9.5) + 4} n={1} />
          <Step x={m.X(-1.5) + 4} y={m.Y(13) - 12} n={2} />
          <Step x={m.X(-22) + 12} y={m.Y(15)} n={3} />
          <Step x={m.X(-38) + 12} y={m.Y(20)} n={4} />
          <Step x={m.X(-50) + 12} y={m.Y(24.5)} n={5} />
          <T x={m.X(-11)} y={m.Y(13) + 16} anchor="middle" cls="t-mono t-sm">Ø26</T>
          <T x={m.X(-30)} y={m.Y(18) + 16} anchor="middle" cls="t-mono t-sm">Ø36</T>
          <T x={m.X(-45)} y={m.Y(23) + 16} anchor="middle" cls="t-mono t-sm">Ø46</T>
          <Pt x={m.X(0)} y={m.Y(0)} label="W" pos="ne" cls="t-acc t-b" dot="pt-rap" />
        </g>
      )}
    </Fig>
  );
}

export const t9Figs = {
  "t91-part": () => <T91Part />,
  "t91-contour": () => <T91Contour />,
};
