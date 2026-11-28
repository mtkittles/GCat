import type { ReactNode } from "react";
import { Dim, Fig, mapper, Pt, T, type Ctx, type LegendItem } from "@/components/fig";

/*
  Rysunki detali do zadań (paczka UB2). Jeden styl z fig.tsx: rysunek 360 jednostek szerokości,
  po lewej widok z góry (frezarka) albo profil (tokarka, Z w prawo, X w górę jako promień),
  po prawej przekrój z głębokością. Półfabrykat przerywaną, kontur gotowy białą linią z kreskowaniem,
  wymiary szare, punkt zera W. Rysunek pokazuje wymiary detalu — nie tor narzędzia, ten pisze uczący się.
*/

type M = ReturnType<typeof mapper>;
type R4 = [number, number, number, number];
const PLAN: R4 = [8, 8, 232, 216];
const SIDE: R4 = [262, 8, 90, 216];
const P = (m: M, x: number, y: number) => `${m.X(x)},${m.Y(y)}`;
const n = (v: number) => String(v).replace(".", ",");

const rr = (m: M, x0: number, y0: number, x1: number, y1: number, r: number) => {
  const R = r * m.u;
  return `M ${m.X(x0)} ${m.Y(y0 + r)} L ${m.X(x0)} ${m.Y(y1 - r)} A ${R} ${R} 0 0 1 ${m.X(x0 + r)} ${m.Y(y1)} L ${m.X(x1 - r)} ${m.Y(y1)} A ${R} ${R} 0 0 1 ${m.X(x1)} ${m.Y(y1 - r)} L ${m.X(x1)} ${m.Y(y0 + r)} A ${R} ${R} 0 0 1 ${m.X(x1 - r)} ${m.Y(y0)} L ${m.X(x0 + r)} ${m.Y(y0)} A ${R} ${R} 0 0 1 ${m.X(x0)} ${m.Y(y0 + r)} Z`;
};
/** Rowek: dwa łuki o promieniu r wokół środków (x0,y) i (x1,y). */
const slot = (m: M, x0: number, x1: number, y: number, r: number) => {
  const R = r * m.u;
  return `M ${m.X(x0)} ${m.Y(y + r)} L ${m.X(x1)} ${m.Y(y + r)} A ${R} ${R} 0 0 1 ${m.X(x1)} ${m.Y(y - r)} L ${m.X(x0)} ${m.Y(y - r)} A ${R} ${R} 0 0 1 ${m.X(x0)} ${m.Y(y + r)} Z`;
};

/* ---------- półfabrykat (widok z góry) ---------- */
function Stock({ m, x0, y0, w, h, dy = -4 }: { m: M; x0: number; y0: number; w: number; h: number; dy?: number }) {
  return (
    <g>
      <rect x={m.X(x0)} y={m.Y(y0 + h)} width={w * m.u} height={h * m.u} className="stock-out" />
      <T x={m.X(x0)} y={m.Y(y0 + h) + dy} cls="t-mut t-sm">{`półfabrykat ${n(w)} × ${n(h)}`}</T>
    </g>
  );
}

/* ---------- przekrój: grubość, głębokości, strefa ubytku ---------- */
/** `cuts`: głębokości od góry (strefa ubytku, `x` — ułamek szerokości); `marks`: płaszczyzny odniesienia (np. R). */
interface Cut { z: number; label: string; x?: [number, number] }
function Section({ c, z, top = 0, cuts, marks = [] }: { c: Ctx; z: number; top?: number; cuts: Cut[]; marks?: { z: number; label: string }[] }) {
  const zMin = top - z;
  const m = mapper([0, 30, zMin - 2, top + 8], SIDE);
  const x0 = 9, x1 = 22;
  return (
    <g>
      <T x={m.X(15.5)} y={SIDE[1] + 11} anchor="middle" cls="t-mut t-sm">przekrój</T>
      <rect x={m.X(x0)} y={m.Y(top)} width={(x1 - x0) * m.u} height={z * m.u} fill={c.hatch} className="p-con" />
      {cuts.map((k, i) => {
        const [a, b] = k.x ? [x0 + (x1 - x0) * k.x[0], x0 + (x1 - x0) * k.x[1]] : [x0, x1];
        const left = i % 2 === 0;
        return (
          <g key={i}>
            <rect x={m.X(a)} y={m.Y(top)} width={(b - a) * m.u} height={(top - k.z) * m.u} className="cut-zone" />
            <line x1={m.X(a)} y1={m.Y(k.z)} x2={m.X(b)} y2={m.Y(k.z)} className="p-cons" />
            {(top - k.z) * m.u >= 20
              ? <Dim x1={m.X(left ? x0 : x1)} y1={m.Y(top)} x2={m.X(left ? x0 : x1)} y2={m.Y(k.z)} off={left ? 8 + Math.floor(i / 2) * 12 : -(8 + Math.floor(i / 2) * 12)} label={k.label} c={c} lside={left ? 1 : -1} />
              : <g>
                  <line x1={m.X(left ? x0 : x1)} y1={m.Y(k.z)} x2={m.X(left ? x0 : x1) + (left ? -10 : 10)} y2={m.Y(k.z)} className="p-ext" />
                  <T x={m.X(left ? x0 : x1) + (left ? -12 : 12)} y={m.Y(k.z) + 4} anchor={left ? "end" : "start"} cls="t-mono t-dim">{k.label}</T>
                </g>}
          </g>
        );
      })}
      {marks.map((k) => (
        <g key={k.label}>
          <line x1={m.X(x0) - 6} y1={m.Y(k.z)} x2={m.X(x1) + 6} y2={m.Y(k.z)} className="p-cons" />
          <T x={m.X(x1) + 8} y={m.Y(k.z) + 4} cls="t-mono t-sm t-acc">{k.label}</T>
        </g>
      ))}
      {top > 0 && <T x={m.X(x0)} y={m.Y(top) - 4} cls="t-mono t-sm t-mut">{`Z+${n(top)}`}</T>}
      <T x={m.X(15.5)} y={m.Y(zMin) + 12} anchor="middle" cls="t-mut t-sm">{`gr. ${n(z)}`}</T>
    </g>
  );
}

/* ---------- wspólna rama ---------- */
function MillFig({ id, title, caption, legend, range, children }: { id: string; title: string; caption: ReactNode; legend?: LegendItem[]; range: R4; children: (m: M, c: Ctx) => ReactNode }) {
  const m = mapper(range, PLAN);
  return (
    <Fig id={id} title={title} caption={caption} h={236} legend={legend ?? [["con", "kontur gotowy"], ["stock", "materiał"], ["dim", "wymiar"]]}>
      {(c) => <g>{children(m, c)}</g>}
    </Fig>
  );
}
/** Punkt zera detalu. */
const W = ({ m, pos = "sw" }: { m: M; pos?: "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw" }) => <Pt x={m.X(0)} y={m.Y(0)} label="W" pos={pos} cls="t-b" />;

/* ================= 1. prostokąt 80 × 50 ================= */
export function ProstokatFig() {
  return (
    <MillFig id="z01" title="Prostokąt 80 × 50, głębokość 3" range={[-22, 98, -24, 64]}
      caption={<>Kontur zaczyna się i kończy w punkcie zera W. Oś freza biegnie po konturze, więc rowek ma szerokość freza.</>}>
      {(m, c) => (
        <g>
          <Stock m={m} x0={-10} y0={-10} w={100} h={70} />
          <rect x={m.X(0)} y={m.Y(50)} width={80 * m.u} height={50 * m.u} fill={c.hatch} className="p-con" />
          <Dim x1={m.X(0)} y1={m.Y(50)} x2={m.X(80)} y2={m.Y(50)} off={-14} label="80" c={c} lside={1} />
          <Dim x1={m.X(80)} y1={m.Y(50)} x2={m.X(80)} y2={m.Y(0)} off={-14} label="50" c={c} lside={-1} />
          <W m={m} />
          <Section c={c} z={20} cuts={[{ z: -3, label: "3" }]} />
        </g>
      )}
    </MillFig>
  );
}

/* ================= 2. prostokąt R10 ================= */
export function ProstokatR10Fig() {
  return (
    <MillFig id="z02" title="Prostokąt 80 × 50, naroża R10, głębokość 3" range={[-22, 98, -24, 64]}
      caption={<>Cztery naroża zaokrąglone promieniem 10. Kontur zaczyna się w punkcie S (X10 Y0), więc pierwszy odcinek prosty kończy się tam, gdzie zaczyna się łuk.</>}>
      {(m, c) => (
        <g>
          <Stock m={m} x0={-10} y0={-10} w={100} h={70} />
          <path d={rr(m, 0, 0, 80, 50, 10)} fill={c.hatch} className="p-con" />
          <Dim x1={m.X(0)} y1={m.Y(50)} x2={m.X(80)} y2={m.Y(50)} off={-14} label="80" c={c} lside={1} />
          <Dim x1={m.X(80)} y1={m.Y(50)} x2={m.X(80)} y2={m.Y(0)} off={-14} label="50" c={c} lside={-1} />
          <line x1={m.X(70)} y1={m.Y(40)} x2={m.X(77.1)} y2={m.Y(47.1)} className="p-dim" markerEnd={c.a("dim")} />
          <T x={m.X(66)} y={m.Y(36)} anchor="end" cls="t-mono t-dim">4 × R10</T>
          <Pt x={m.X(10)} y={m.Y(0)} label="S  X10 Y0" pos="s" cls="t-mono t-sm t-b" dot="pt-cut" />
          <Pt x={m.X(0)} y={m.Y(0)} label="W" pos="w" cls="t-b" />
          <Section c={c} z={20} cuts={[{ z: -3, label: "3" }]} />
        </g>
      )}
    </MillFig>
  );
}

/* ---------- otwory: okrąg + oś ---------- */
function Hole({ m, x, y, d, label }: { m: M; x: number; y: number; d: number; label?: string }) {
  const r = (d / 2) * m.u, k = r + 4;
  return (
    <g>
      <line x1={m.X(x) - k} y1={m.Y(y)} x2={m.X(x) + k} y2={m.Y(y)} className="axis-c" />
      <line x1={m.X(x)} y1={m.Y(y) - k} x2={m.X(x)} y2={m.Y(y) + k} className="axis-c" />
      <circle cx={m.X(x)} cy={m.Y(y)} r={r} className="hole-top" />
      {label && <T x={m.X(x)} y={m.Y(y) - k - 3} anchor="middle" cls="t-mono t-sm">{label}</T>}
    </g>
  );
}

/* ================= 3. cztery otwory G81 ================= */
export function OtworyCyklFig() {
  const H: [number, number][] = [[20, 20], [80, 20], [80, 50], [20, 50]];
  return (
    <MillFig id="z03" title="Cztery otwory ⌀8,5 na głębokość 18" range={[-10, 108, -14, 78]}
      caption={<>Otwory leżą w narożach prostokąta 60 × 30, przesuniętego o 20 od krawędzi półfabrykatu. Płaszczyzna R na Z+2, dno na Z−18.</>}>
      {(m, c) => (
        <g>
          <rect x={m.X(0)} y={m.Y(70)} width={100 * m.u} height={70 * m.u} fill={c.hatch} className="p-con" />
          {H.map(([x, y], i) => <Hole key={i} m={m} x={x} y={y} d={8.5} label={i === 3 ? "4 × ⌀8,5" : undefined} />)}
          <Dim x1={m.X(0)} y1={m.Y(70)} x2={m.X(20)} y2={m.Y(70)} off={-12} label="20" c={c} lside={1} />
          <Dim x1={m.X(20)} y1={m.Y(70)} x2={m.X(80)} y2={m.Y(70)} off={-12} label="60" c={c} lside={1} />
          <Dim x1={m.X(100)} y1={m.Y(20)} x2={m.X(100)} y2={m.Y(0)} off={-12} label="20" c={c} lside={-1} />
          <Dim x1={m.X(100)} y1={m.Y(50)} x2={m.X(100)} y2={m.Y(20)} off={-12} label="30" c={c} lside={-1} />
          <W m={m} pos="nw" />
          <Section c={c} z={25} cuts={[{ z: -18, label: "18", x: [0.35, 0.65] }]} marks={[{ z: 2, label: "R2" }]} />
        </g>
      )}
    </MillFig>
  );
}

/* ================= 4. otwór głęboki G83 ================= */
export function WiercenieGlebokieFig() {
  return (
    <MillFig id="z04" title="Otwór ⌀8 na głębokość 45 (ponad 5 × D)" range={[-10, 68, -14, 68]}
      caption={<>Jeden otwór w środku kostki 60 × 60 × 50. Głębokość 45 to ponad pięć średnic wiertła, dlatego cykl z pełnym wycofaniem i zagłębianiem po Q = 6.</>}>
      {(m, c) => (
        <g>
          <rect x={m.X(0)} y={m.Y(60)} width={60 * m.u} height={60 * m.u} fill={c.hatch} className="p-con" />
          <Hole m={m} x={30} y={30} d={8} label="⌀8" />
          <Dim x1={m.X(0)} y1={m.Y(60)} x2={m.X(30)} y2={m.Y(60)} off={-12} label="30" c={c} lside={1} />
          <Dim x1={m.X(60)} y1={m.Y(30)} x2={m.X(60)} y2={m.Y(0)} off={-12} label="30" c={c} lside={-1} />
          <W m={m} pos="nw" />
          <Section c={c} z={50} cuts={[{ z: -45, label: "45", x: [0.4, 0.6] }, { z: -6, label: "Q6", x: [0.4, 0.6] }]} marks={[{ z: 2, label: "R2" }]} />
        </g>
      )}
    </MillFig>
  );
}

/* ================= 5. pięć rowków co 15 ================= */
export function PrzyrostowoFig() {
  return (
    <MillFig id="z05" title="Pięć rowków 20 (frez ⌀6), rozstaw 15" range={[-16, 70, -12, 92]}
      caption={<>Wymiar 20 to droga środka freza. Pierwszy rowek zaczyna się w X10 Y10, każdy następny 15 wyżej w osi Y, głębokość 2.</>}
      legend={[["con", "kontur gotowy"], ["stock", "materiał"], ["dim", "wymiar"]]}>
      {(m, c) => (
        <g>
          <rect x={m.X(0)} y={m.Y(80)} width={50 * m.u} height={80 * m.u} fill={c.hatch} className="p-con" />
          {[10, 25, 40, 55, 70].map((y) => <path key={y} d={slot(m, 10, 30, y, 3)} className="hole-top" />)}
          <Dim x1={m.X(10)} y1={m.Y(80)} x2={m.X(30)} y2={m.Y(80)} off={-12} label="20" c={c} lside={1} />
          <Dim x1={m.X(0)} y1={m.Y(0)} x2={m.X(10)} y2={m.Y(0)} off={12} label="10" c={c} lside={-1} />
          <Dim x1={m.X(50)} y1={m.Y(10)} x2={m.X(50)} y2={m.Y(0)} off={-12} label="10" c={c} lside={-1} />
          <Dim x1={m.X(50)} y1={m.Y(25)} x2={m.X(50)} y2={m.Y(10)} off={-12} label="15" c={c} lside={-1} />
          <Dim x1={m.X(50)} y1={m.Y(70)} x2={m.X(50)} y2={m.Y(25)} off={-12} label="3 × 15" c={c} lside={-1} />
          <T x={m.X(34.5)} y={m.Y(70) + 4} cls="t-mono t-sm">⌀6</T>
          <W m={m} pos="nw" />
          <Section c={c} z={20} cuts={[{ z: -2, label: "2", x: [0.2, 0.5] }]} />
        </g>
      )}
    </MillFig>
  );
}

/* ---------- tokarka: profil nad osią ---------- */
function LatheFig({ id, title, caption, range, children }: { id: string; title: string; caption: ReactNode; range: R4; children: (m: M, c: Ctx) => ReactNode }) {
  const m = mapper(range, [8, 8, 344, 216]);
  return (
    <Fig id={id} title={title} caption={caption} h={236} legend={[["con", "kontur gotowy"], ["stock", "półfabrykat"], ["dim", "wymiar"]]}>
      {(c) => (
        <g>
          <line x1={m.X(range[0])} y1={m.Y(0)} x2={m.X(range[1])} y2={m.Y(0)} className="axis-c" />
          <T x={m.X(range[1]) - 2} y={m.Y(0) - 4} anchor="end" cls="t-mut t-sm">oś</T>
          {children(m, c)}
        </g>
      )}
    </Fig>
  );
}
/** Pręt (półfabrykat) nad osią: od czoła z0 w lewo o len, promień d/2. */
function Bar({ m, z0, len, d }: { m: M; z0: number; len: number; d: number }) {
  return (
    <g>
      <rect x={m.X(z0 - len)} y={m.Y(d / 2)} width={len * m.u} height={(d / 2) * m.u} className="stock-out" />
      <T x={m.X(z0 - len)} y={m.Y(0) + 14} cls="t-mut t-sm">{`pręt ⌀${n(d)} × ${n(len)}`}</T>
    </g>
  );
}
/** Średnica: wymiar pionowy od osi do promienia, z opisem ⌀. */
const Dia = ({ m, c, z, d, off = 0, lside = -1 as 1 | -1 }: { m: M; c: Ctx; z: number; d: number; off?: number; lside?: 1 | -1 }) => (
  <Dim x1={m.X(z)} y1={m.Y(0)} x2={m.X(z)} y2={m.Y(d / 2)} off={off} label={`⌀${n(d)}`} c={c} lside={lside} />
);

/* ================= 6. wałek stopniowy ================= */
export function WalekStopniowyFig() {
  const PR: [number, number][] = [[0, 0], [0, 15], [-25, 15], [-25, 20], [-55, 20], [-55, 25], [-62, 25], [-62, 0]];
  return (
    <LatheFig id="z06" title="Wałek stopniowy ⌀30 / ⌀40 z pręta ⌀50" range={[-78, 14, -8, 40]}
      caption={<>Nad osią X to promień, program podaje średnice. ⌀30 na długości 25, ⌀40 do Z−55, dalej pręt ⌀50, czoło na Z0.</>}>
      {(m, c) => (
        <g>
          <Bar m={m} z0={0} len={70} d={50} />
          <polygon points={PR.map(([z, r]) => P(m, z, r)).join(" ")} fill={c.hatch} className="p-con" />
          <Dia m={m} c={c} z={4} d={30} off={0} lside={1} />
          <Dia m={m} c={c} z={-40} d={40} off={0} lside={1} />
          <Dia m={m} c={c} z={-70} d={50} off={0} lside={-1} />
          <Dim x1={m.X(-25)} y1={m.Y(25)} x2={m.X(0)} y2={m.Y(25)} off={-18} label="25" c={c} lside={1} />
          <Dim x1={m.X(-55)} y1={m.Y(25)} x2={m.X(0)} y2={m.Y(25)} off={-32} label="55" c={c} lside={1} />
          <Pt x={m.X(0)} y={m.Y(0)} label="W  Z0" pos="se" cls="t-b" />
        </g>
      )}
    </LatheFig>
  );
}

/* ================= 7. wałek z fazą i R5 ================= */
export function WalekZaokraglenieFig() {
  const m = mapper([-66, 14, -8, 40], [8, 8, 344, 216]);
  const d = (z: number, r: number) => `${m.X(z)} ${m.Y(r)}`;
  const R5 = 5 * m.u;
  const path = `M ${d(0, 0)} L ${d(0, 13)} L ${d(-2, 15)} L ${d(-20, 15)} A ${R5} ${R5} 0 0 0 ${d(-25, 20)} L ${d(-45, 20)} L ${d(-45, 23)} L ${d(-47, 25)} L ${d(-52, 25)} L ${d(-52, 0)} Z`;
  return (
    <LatheFig id="z07" title="Wałek ⌀30 / ⌀40 z fazami 2 × 45° i R5" range={[-66, 14, -8, 40]}
      caption={<>Faza na czole od ⌀26 do ⌀30, ⌀30 do Z−20, zaokrąglenie R5 wychodzi na ⌀40 w Z−25, czoło stopnia do ⌀46 i faza do ⌀50 w Z−47.</>}>
      {(_, c) => (
        <g>
          <Bar m={m} z0={0} len={60} d={50} />
          <path d={path} fill={c.hatch} className="p-con" />
          <Dia m={m} c={c} z={4} d={30} lside={1} />
          <Dia m={m} c={c} z={-35} d={40} lside={1} />
          <Dia m={m} c={c} z={-58} d={50} lside={-1} />
          <Dim x1={m.X(-20)} y1={m.Y(25)} x2={m.X(0)} y2={m.Y(25)} off={-14} label="20" c={c} lside={1} />
          <Dim x1={m.X(-25)} y1={m.Y(25)} x2={m.X(0)} y2={m.Y(25)} off={-28} label="25" c={c} lside={1} />
          <Dim x1={m.X(-45)} y1={m.Y(25)} x2={m.X(0)} y2={m.Y(25)} off={-42} label="45" c={c} lside={1} />
          <Dim x1={m.X(-47)} y1={m.Y(25)} x2={m.X(0)} y2={m.Y(25)} off={-56} label="47" c={c} lside={1} />
          <T x={m.X(-3)} y={m.Y(15) - 6} anchor="end" cls="t-mono t-sm">2 × 45°</T>
          <line x1={m.X(-46)} y1={m.Y(24)} x2={m.X(-50)} y2={m.Y(28)} className="p-dim" markerStart={c.a("dim")} />
          <T x={m.X(-51)} y={m.Y(28) + 4} anchor="end" cls="t-mono t-sm">2 × 45°</T>
          <line x1={m.X(-22.5)} y1={m.Y(17.5)} x2={m.X(-16)} y2={m.Y(9)} className="p-dim" markerStart={c.a("dim")} />
          <T x={m.X(-15)} y={m.Y(8)} cls="t-mono t-dim">R5</T>
          <Pt x={m.X(0)} y={m.Y(0)} label="W  Z0" pos="se" cls="t-b" />
        </g>
      )}
    </LatheFig>
  );
}

/* ================= 8. kieszeń 60 × 40 ================= */
export function KieszenFig() {
  return (
    <MillFig id="z08" title="Kieszeń 60 × 40, głębokość 6" range={[-14, 90, -14, 70]}
      caption={<>Kieszeń od X10 Y10 do X70 Y50; przerywany prostokąt to tor środka freza ⌀10, od X15 Y15 do X65 Y45. Dwa przejścia po 3.</>}
      legend={[["con", "kontur gotowy"], ["cons", "tor środka freza"], ["tool", "frez ⌀10"], ["dim", "wymiar"]]}>
      {(m, c) => (
        <g>
          <rect x={m.X(0)} y={m.Y(60)} width={80 * m.u} height={60 * m.u} className="p-con" style={{ fill: "none" }} />
          <rect x={m.X(10)} y={m.Y(50)} width={60 * m.u} height={40 * m.u} fill={c.hatch} className="p-con" />
          <rect x={m.X(15)} y={m.Y(45)} width={50 * m.u} height={30 * m.u} className="p-cons" />
          <circle cx={m.X(15)} cy={m.Y(15)} r={5 * m.u} className="tool" />
          <Dim x1={m.X(0)} y1={m.Y(60)} x2={m.X(10)} y2={m.Y(60)} off={-12} label="10" c={c} lside={1} />
          <Dim x1={m.X(10)} y1={m.Y(60)} x2={m.X(70)} y2={m.Y(60)} off={-12} label="60" c={c} lside={1} />
          <Dim x1={m.X(80)} y1={m.Y(10)} x2={m.X(80)} y2={m.Y(0)} off={-12} label="10" c={c} lside={-1} />
          <Dim x1={m.X(80)} y1={m.Y(50)} x2={m.X(80)} y2={m.Y(10)} off={-12} label="40" c={c} lside={-1} />
          <W m={m} pos="nw" />
          <Section c={c} z={20} cuts={[{ z: -3, label: "3", x: [0.2, 0.8] }, { z: -6, label: "6", x: [0.2, 0.8] }]} />
        </g>
      )}
    </MillFig>
  );
}

/* ================= 9. kontur z G41 ================= */
export function KompensacjaFig() {
  return (
    <MillFig id="z09" title="Kontur 70 × 45 z korekcją promienia, głębokość 4" range={[-34, 88, -34, 60]}
      caption={<>Z korekcją G41 programujesz sam kontur gotowy: 70 × 45 od W. Dojazd i odjazd z punktu S (X−20 Y−20); w bloku dojazdowym włączasz G41, w odjeździe wyłączasz G40.</>}>
      {(m, c) => (
        <g>
          <Stock m={m} x0={-10} y0={-10} w={90} h={65} />
          <rect x={m.X(0)} y={m.Y(45)} width={70 * m.u} height={45 * m.u} fill={c.hatch} className="p-con" />
          <Dim x1={m.X(0)} y1={m.Y(45)} x2={m.X(70)} y2={m.Y(45)} off={-14} label="70" c={c} lside={1} />
          <Dim x1={m.X(70)} y1={m.Y(45)} x2={m.X(70)} y2={m.Y(0)} off={-14} label="45" c={c} lside={-1} />
          <line x1={m.X(-20)} y1={m.Y(-20)} x2={m.X(-1.5)} y2={m.Y(-1.5)} className="p-cons" />
          <Pt x={m.X(-20)} y={m.Y(-20)} label="S  X−20 Y−20" pos="s" cls="t-mono t-sm t-b" dot="pt-rap" />
          <W m={m} pos="nw" />
          <Section c={c} z={20} cuts={[{ z: -4, label: "4" }]} />
        </g>
      )}
    </MillFig>
  );
}

/* ================= 10. cztery gwinty M8 ================= */
export function GwintowanieFig() {
  const H: [number, number][] = [[20, 20], [70, 20], [70, 45], [20, 45]];
  return (
    <MillFig id="z10" title="Cztery gwinty M8: otwór ⌀6,8 na 20, gwint na 15" range={[-10, 98, -14, 72]}
      caption={<>Otwory w narożach prostokąta 50 × 25 od punktu X20 Y20. Najpierw wiercenie ⌀6,8 na Z−20, potem gwintownik M8 × 1,25 na Z−15 z płaszczyzną R na Z+5.</>}>
      {(m, c) => (
        <g>
          <rect x={m.X(0)} y={m.Y(65)} width={90 * m.u} height={65 * m.u} fill={c.hatch} className="p-con" />
          {H.map(([x, y], i) => (
            <g key={i}>
              <circle cx={m.X(x)} cy={m.Y(y)} r={4 * m.u} className="p-cons" />
              <Hole m={m} x={x} y={y} d={6.8} label={i === 2 ? "4 × M8" : undefined} />
            </g>
          ))}
          <Dim x1={m.X(0)} y1={m.Y(65)} x2={m.X(20)} y2={m.Y(65)} off={-12} label="20" c={c} lside={1} />
          <Dim x1={m.X(20)} y1={m.Y(65)} x2={m.X(70)} y2={m.Y(65)} off={-12} label="50" c={c} lside={1} />
          <Dim x1={m.X(90)} y1={m.Y(20)} x2={m.X(90)} y2={m.Y(0)} off={-12} label="20" c={c} lside={-1} />
          <Dim x1={m.X(90)} y1={m.Y(45)} x2={m.X(90)} y2={m.Y(20)} off={-12} label="25" c={c} lside={-1} />
          <W m={m} pos="nw" />
          <Section c={c} z={30} cuts={[{ z: -20, label: "20", x: [0.38, 0.62] }, { z: -15, label: "15", x: [0.34, 0.66] }]} marks={[{ z: 5, label: "R5" }]} />
        </g>
      )}
    </MillFig>
  );
}

/* ================= 11. helisa ================= */
export function HelisaFig() {
  return (
    <MillFig id="z11" title="Wejście po helisie R15 wokół X40 Y40, Z0 → Z−6" range={[-10, 90, -14, 90]}
      caption={<>Oś freza krąży po okręgu R15 wokół środka C = X40 Y40, zaczynając w punkcie S = X25 Y40. Trzy pełne obiegi, każdy o 2 niżej: Z−2, Z−4, Z−6.</>}
      legend={[["con", "kontur gotowy"], ["cons", "tor środka freza"], ["dim", "wymiar"]]}>
      {(m, c) => (
        <g>
          <rect x={m.X(0)} y={m.Y(80)} width={80 * m.u} height={80 * m.u} fill={c.hatch} className="p-con" />
          <circle cx={m.X(40)} cy={m.Y(40)} r={20 * m.u} className="hole-top" />
          <circle cx={m.X(40)} cy={m.Y(40)} r={15 * m.u} className="p-cons" />
          <line x1={m.X(40)} y1={m.Y(40)} x2={m.X(29.4)} y2={m.Y(50.6)} className="p-dim" markerEnd={c.a("dim")} />
          <T x={m.X(31)} y={m.Y(47)} anchor="end" cls="t-mono t-dim">R15</T>
          <Pt x={m.X(40)} y={m.Y(40)} label="C" pos="se" cls="t-b" />
          <Pt x={m.X(25)} y={m.Y(40)} label="S" pos="w" cls="t-b" dot="pt-arc" />
          <Dim x1={m.X(0)} y1={m.Y(80)} x2={m.X(40)} y2={m.Y(80)} off={-12} label="40" c={c} lside={1} />
          <Dim x1={m.X(80)} y1={m.Y(40)} x2={m.X(80)} y2={m.Y(0)} off={-12} label="40" c={c} lside={-1} />
          <W m={m} pos="nw" />
          <Section c={c} z={20} cuts={[{ z: -6, label: "3 × 2", x: [0.1, 0.9] }]} marks={[{ z: -2, label: "" }, { z: -4, label: "" }]} />
        </g>
      )}
    </MillFig>
  );
}

/* ================= 12. trzy rowki co 20 ================= */
export function PodprogramFig() {
  return (
    <MillFig id="z12" title="Trzy rowki 25 (frez ⌀6), rozstaw 20" range={[-16, 76, -12, 78]}
      caption={<>Wymiar 25 to droga środka freza: pierwszy rowek od X15 Y15, kolejne co 20 w osi Y, głębokość 3. Zapis dowolny — sprawdzany jest tor.</>}>
      {(m, c) => (
        <g>
          <rect x={m.X(0)} y={m.Y(70)} width={60 * m.u} height={70 * m.u} fill={c.hatch} className="p-con" />
          {[15, 35, 55].map((y) => <path key={y} d={slot(m, 15, 40, y, 3)} className="hole-top" />)}
          <Dim x1={m.X(0)} y1={m.Y(70)} x2={m.X(15)} y2={m.Y(70)} off={-12} label="15" c={c} lside={1} />
          <Dim x1={m.X(15)} y1={m.Y(70)} x2={m.X(40)} y2={m.Y(70)} off={-12} label="25" c={c} lside={1} />
          <Dim x1={m.X(60)} y1={m.Y(15)} x2={m.X(60)} y2={m.Y(0)} off={-12} label="15" c={c} lside={-1} />
          <Dim x1={m.X(60)} y1={m.Y(55)} x2={m.X(60)} y2={m.Y(15)} off={-12} label="2 × 20" c={c} lside={-1} />
          <T x={m.X(44.5)} y={m.Y(55) + 4} cls="t-mono t-sm">⌀6</T>
          <W m={m} pos="nw" />
          <Section c={c} z={20} cuts={[{ z: -3, label: "3", x: [0.2, 0.6] }]} />
        </g>
      )}
    </MillFig>
  );
}

/* ================= 13. planowanie ================= */
export function PlanowanieFig() {
  return (
    <MillFig id="z13" title="Planowanie 100 × 60 głowicą ⌀50, naddatek 1" range={[-46, 146, -14, 74]}
      caption={<>Trzy przejścia wzdłuż X w liniach Y15, Y30, Y45 (przerywane), każde od X−30 do X130, czyli z wyjściem poza materiał o więcej niż promień głowicy. Góra półfabrykatu na Z+1, gotowa płaszczyzna na Z0.</>}
      legend={[["con", "kontur gotowy"], ["cons", "tor środka głowicy"], ["dim", "wymiar"]]}>
      {(m, c) => (
        <g>
          <rect x={m.X(0)} y={m.Y(60)} width={100 * m.u} height={60 * m.u} fill={c.hatch} className="p-con" />
          {[15, 30, 45].map((y) => (
            <g key={y}>
              <line x1={m.X(-30)} y1={m.Y(y)} x2={m.X(130)} y2={m.Y(y)} className="p-cons" />
              <T x={m.X(132)} y={m.Y(y) + 4} cls="t-mono t-sm">{`Y${y}`}</T>
            </g>
          ))}
          <circle cx={m.X(-30)} cy={m.Y(15)} r={25 * m.u} className="tool" />
          <T x={m.X(-30)} y={m.Y(15) + 25 * m.u + 11} anchor="middle" cls="t-mono t-sm">⌀50</T>
          <Dim x1={m.X(0)} y1={m.Y(60)} x2={m.X(100)} y2={m.Y(60)} off={-12} label="100" c={c} lside={1} />
          <Dim x1={m.X(100)} y1={m.Y(60)} x2={m.X(100)} y2={m.Y(0)} off={-12} label="60" c={c} lside={-1} />
          <W m={m} pos="sw" />
          <Section c={c} z={21} top={1} cuts={[{ z: 0, label: "1" }]} />
        </g>
      )}
    </MillFig>
  );
}

/* ================= 14. czoło i faza ================= */
export function ToczenieCzoloFig() {
  const PR: [number, number][] = [[0, 0], [0, 16], [-2, 18], [-30, 18], [-30, 20], [-42, 20], [-42, 0]];
  return (
    <LatheFig id="z14" title="Czoło na Z0, faza 2 × 45°, ⌀36 na długości 30" range={[-56, 16, -8, 32]}
      caption={<>Czoło planowane do osi (nóż z promieniem naroża 0,8 kończy przejście w X−1,6). Faza od ⌀32 do ⌀36, dalej ⌀36 do Z−30, reszta zostaje w pręcie ⌀40.</>}>
      {(m, c) => (
        <g>
          <Bar m={m} z0={0} len={50} d={40} />
          <polygon points={PR.map(([z, r]) => P(m, z, r)).join(" ")} fill={c.hatch} className="p-con" />
          <Dia m={m} c={c} z={-16} d={36} lside={1} />
          <Dia m={m} c={c} z={-48} d={40} lside={-1} />
          <Dim x1={m.X(-30)} y1={m.Y(20)} x2={m.X(0)} y2={m.Y(20)} off={-16} label="30" c={c} lside={1} />
          <T x={m.X(3)} y={m.Y(17) + 4} cls="t-mono t-sm">2 × 45°</T>
          <Pt x={m.X(0)} y={m.Y(0)} label="W  Z0" pos="se" cls="t-b" />
        </g>
      )}
    </LatheFig>
  );
}

/* ================= 15. przejścia zgrubne ================= */
export function ToczenieZgrubneFig() {
  const PR: [number, number][] = [[0, 0], [0, 22], [-40, 22], [-40, 30], [-50, 30], [-50, 0]];
  return (
    <LatheFig id="z15" title="⌀60 → ⌀44 na długości 40, cztery przejścia po 2" range={[-64, 16, -8, 40]}
      caption={<>Każde przejście zbiera 2 na promieniu, czyli 4 na średnicy: ⌀56, ⌀52, ⌀48, ⌀44 (przerywane). Po przejściu wycofanie na ⌀62 i powrót do Z+2.</>}>
      {(m, c) => (
        <g>
          <Bar m={m} z0={0} len={55} d={60} />
          <polygon points={PR.map(([z, r]) => P(m, z, r)).join(" ")} fill={c.hatch} className="p-con" />
          {[28, 26, 24].map((r) => <line key={r} x1={m.X(2)} y1={m.Y(r)} x2={m.X(-40)} y2={m.Y(r)} className="p-cons" />)}
          <Dia m={m} c={c} z={4} d={44} lside={1} />
          <Dia m={m} c={c} z={-54} d={60} lside={-1} />
          <Dim x1={m.X(-40)} y1={m.Y(30)} x2={m.X(0)} y2={m.Y(30)} off={-16} label="40" c={c} lside={1} />
          <Dim x1={m.X(4)} y1={m.Y(22)} x2={m.X(4)} y2={m.Y(30)} off={0} label="4 × 2" c={c} lside={1} />
          <Pt x={m.X(0)} y={m.Y(0)} label="W  Z0" pos="se" cls="t-b" />
        </g>
      )}
    </LatheFig>
  );
}

/* ================= 16. kontur + 2 otwory ================= */
export function ProgramPelnyFig() {
  return (
    <MillFig id="z16" title="Kontur 90 × 55 (głębokość 5) i dwa otwory ⌀8 na 22" range={[-28, 108, -30, 70]}
      caption={<>T1: kontur 90 × 55 od W, dojazd i odjazd przez S (X−10 Y−10). T2: dwa otwory ⌀8 w X25 Y27 i X65 Y27 cyklem G81.</>}>
      {(m, c) => (
        <g>
          <Stock m={m} x0={-5} y0={-5} w={100} h={65} dy={-22} />
          <rect x={m.X(0)} y={m.Y(55)} width={90 * m.u} height={55 * m.u} fill={c.hatch} className="p-con" />
          {[25, 65].map((x) => <Hole key={x} m={m} x={x} y={27} d={8} label={x === 65 ? "2 × ⌀8" : undefined} />)}
          <Dim x1={m.X(0)} y1={m.Y(55)} x2={m.X(90)} y2={m.Y(55)} off={-14} label="90" c={c} lside={1} />
          <Dim x1={m.X(90)} y1={m.Y(55)} x2={m.X(90)} y2={m.Y(0)} off={-14} label="55" c={c} lside={-1} />
          <Dim x1={m.X(0)} y1={m.Y(0)} x2={m.X(25)} y2={m.Y(0)} off={20} label="25" c={c} lside={-1} />
          <Dim x1={m.X(25)} y1={m.Y(0)} x2={m.X(65)} y2={m.Y(0)} off={20} label="40" c={c} lside={-1} />
          <Dim x1={m.X(90)} y1={m.Y(27)} x2={m.X(90)} y2={m.Y(0)} off={-30} label="27" c={c} lside={-1} />
          <line x1={m.X(-10)} y1={m.Y(-10)} x2={m.X(-1.5)} y2={m.Y(-1.5)} className="p-cons" />
          <Pt x={m.X(-10)} y={m.Y(-10)} label="S" pos="sw" cls="t-mono t-sm t-b" dot="pt-rap" />
          <W m={m} pos="nw" />
          <Section c={c} z={25} cuts={[{ z: -5, label: "5" }, { z: -22, label: "22", x: [0.38, 0.62] }]} marks={[{ z: 2, label: "R2" }]} />
        </g>
      )}
    </MillFig>
  );
}

/** Rysunek do zadania po slugu (strona zadania). */
export const EXERCISE_FIGS: Record<string, () => ReactNode> = {
  "prostokat": ProstokatFig, "prostokat-zaokraglony": ProstokatR10Fig, "otwory-cykl": OtworyCyklFig,
  "wiercenie-glebokie": WiercenieGlebokieFig, "przyrostowo": PrzyrostowoFig, "walek-stopniowy": WalekStopniowyFig,
  "walek-zaokraglenie": WalekZaokraglenieFig, "kieszen": KieszenFig, "kompensacja": KompensacjaFig,
  "gwintowanie": GwintowanieFig, "helisa": HelisaFig, "podprogram": PodprogramFig, "planowanie": PlanowanieFig,
  "toczenie-czolo": ToczenieCzoloFig, "toczenie-zgrubne": ToczenieZgrubneFig, "program-pelny": ProgramPelnyFig,
};
