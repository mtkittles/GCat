import { Code, Dim, Fig, Grid, mapper, Pt, T } from "@/components/fig";

/* Rysunki lekcji F0.1 — układ współrzędnych frezarki. Styl i kolory z fig.tsx. */

/* ================= osie i reguła prawej dłoni ================= */
export function AxesTriad() {
  const O = { x: 132, y: 150 };
  const ang = (35 * Math.PI) / 180;
  const Y = { x: O.x + Math.cos(ang) * 96, y: O.y - Math.sin(ang) * 96 };
  const nY = { x: O.x - Math.cos(ang) * 58, y: O.y + Math.sin(ang) * 58 };
  return (
    <Fig id="f01ax" code="XYZ" title="Osie frezarki i reguła prawej dłoni" h={236} legend={["acc", "cons"]}
      caption={<>Kciuk to <b>+X</b>, palec wskazujący <b>+Y</b>, środkowy <b>+Z</b>. Linie przerywane to kierunki ujemne. Obroty wokół X, Y i Z to osie <b>A</b>, <b>B</b> i <b>C</b>.</>}>
      {(c) => (
        <g>
          <line x1={O.x} y1={O.y} x2={O.x - 76} y2={O.y} className="p-cons" />
          <line x1={O.x} y1={O.y} x2={O.x} y2={O.y + 60} className="p-cons" />
          <line x1={O.x} y1={O.y} x2={nY.x} y2={nY.y} className="p-cons" />
          <T x={O.x - 80} y={O.y + 4} anchor="end" cls="t-mut t-mono">−X</T>
          <T x={O.x + 8} y={O.y + 62} cls="t-mut t-mono">−Z</T>
          <T x={nY.x - 6} y={nY.y + 8} anchor="end" cls="t-mut t-mono">−Y</T>

          <line x1={O.x} y1={O.y} x2={O.x + 126} y2={O.y} className="p-acc thick" markerEnd={c.a("acc")} />
          <line x1={O.x} y1={O.y} x2={O.x} y2={O.y - 118} className="p-acc thick" markerEnd={c.a("acc")} />
          <line x1={O.x} y1={O.y} x2={Y.x} y2={Y.y} className="p-acc thick" markerEnd={c.a("acc")} />

          <T x={O.x + 134} y={O.y + 5} cls="t-acc t-b t-big">+X</T>
          <T x={O.x + 134} y={O.y + 20} cls="t-mut">kciuk</T>
          <T x={Y.x + 8} y={Y.y - 2} cls="t-acc t-b t-big">+Y</T>
          <T x={Y.x + 8} y={Y.y + 13} cls="t-mut">palec wskazujący</T>
          <T x={O.x + 10} y={O.y - 116} cls="t-acc t-b t-big">+Z</T>
          <T x={O.x + 10} y={O.y - 101} cls="t-mut">palec środkowy</T>
          <Pt x={O.x} y={O.y} />
        </g>
      )}
    </Fig>
  );
}

/* ================= widok z góry: odczyt współrzędnych ================= */
export function TopView() {
  const R: [number, number, number, number] = [-14, 96, -16, 62];
  const m = mapper(R, [20, 8, 328, 236]);
  const H = { x: 60, y: 20 };
  return (
    <Fig id="f01top" code="XY" title="Płytka 80 × 50 z góry — zero w lewym dolnym narożniku" h={256} legend={["acc", "dim", "stock"]}
      notes={<><Code k="acc">H: X60 Y20</Code><Code k="con">P2: X80 Y0</Code><Code k="con">P3: X80 Y50</Code><Code k="con">P4: X0 Y50</Code></>}
      caption={<>Od zera <b>W</b> idziesz najpierw wzdłuż X, potem wzdłuż Y. Siatka co 5 mm, opisy co 10 mm.</>}>
      {(c) => (
        <g>
          <Grid m={m} range={R} c={c} />
          <rect x={m.X(0)} y={m.Y(50)} width={80 * m.u} height={50 * m.u} fill={c.hatch} className="p-con" />
          <line x1={m.X(H.x)} y1={m.Y(0)} x2={m.X(H.x)} y2={m.Y(H.y)} className="p-cons" />
          <line x1={m.X(0)} y1={m.Y(H.y)} x2={m.X(H.x)} y2={m.Y(H.y)} className="p-cons" />
          <Dim x1={m.X(0)} y1={m.Y(0)} x2={m.X(H.x)} y2={m.Y(0)} off={30} label="X60" c={c} lside={1} cls="t-mono t-acc t-b" />
          <Dim x1={m.X(H.x) + 10} y1={m.Y(0)} x2={m.X(H.x) + 10} y2={m.Y(H.y)} label="Y20" c={c} lside={1} cls="t-mono t-acc t-b" />
          <Pt x={m.X(0)} y={m.Y(0)} label="W" pos="ne" cls="t-acc t-b" />
          <Pt x={m.X(80)} y={m.Y(0)} label="P2" pos="nw" />
          <Pt x={m.X(80)} y={m.Y(50)} label="P3" pos="sw" />
          <Pt x={m.X(0)} y={m.Y(50)} label="P4" pos="se" />
          <Pt x={m.X(H.x)} y={m.Y(H.y)} label="H" pos="nw" cls="t-acc t-b" dot="pt-rap" />
        </g>
      )}
    </Fig>
  );
}

/* ================= widok z boku: znak Z ================= */
export function SideView() {
  const R: [number, number, number, number] = [-22, 96, -26, 36];
  const m = mapper(R, [16, 8, 332, 232]);
  const tool = (x: number, z: number, cls: string) => (
    <rect x={m.X(x - 5)} y={m.Y(36)} width={10 * m.u} height={m.Y(z) - m.Y(36)} className={cls} rx={2} />
  );
  return (
    <Fig id="f01side" code="Z" title="Widok z boku — Z0 na górnej powierzchni" h={254} legend={["rap", "cut", "stock"]}
      caption={<>Nad powierzchnią Z jest dodatnie, w materiale — ujemne. <b>Z5</b> to typowa wysokość, z której frez zjeżdża do skrawania, <b>Z−5</b> to 5 mm w głąb detalu.</>}>
      {(c) => (
        <g>
          <rect x={m.X(0)} y={m.Y(0)} width={80 * m.u} height={20 * m.u} fill={c.hatch} className="p-con" />
          <rect x={m.X(55)} y={m.Y(0)} width={10 * m.u} height={5 * m.u} className="panel-bg" />
          <line x1={m.X(-22)} y1={m.Y(0)} x2={m.X(96)} y2={m.Y(0)} className="p-cons" />
          <T x={m.X(84)} y={m.Y(0) - 5} cls="t-acc t-b t-mono">Z0</T>

          <line x1={m.X(-13)} y1={m.Y(0)} x2={m.X(-13)} y2={m.Y(30)} className="p-acc thick" markerEnd={c.a("acc")} />
          <line x1={m.X(-13)} y1={m.Y(0)} x2={m.X(-13)} y2={m.Y(-22)} className="p-bad" markerEnd={c.a("bad")} />
          <T x={m.X(-10)} y={m.Y(30) + 4} cls="t-acc t-b">+Z</T>
          <T x={m.X(-10)} y={m.Y(30) + 17} cls="t-mut">od detalu</T>
          <T x={m.X(-10)} y={m.Y(-22) - 2} cls="t-bad t-b">−Z</T>
          <T x={m.X(-10)} y={m.Y(-22) + 11} cls="t-mut">w materiał</T>

          {tool(25, 5, "cutter")}
          <line x1={m.X(19)} y1={m.Y(5)} x2={m.X(31)} y2={m.Y(5)} className="p-rap" />
          <T x={m.X(32)} y={m.Y(5) + 4} cls="t-rap t-b t-mono">Z5</T>

          {tool(60, -5, "cutter")}
          <line x1={m.X(54)} y1={m.Y(-5)} x2={m.X(66)} y2={m.Y(-5)} className="p-cut" />
          <T x={m.X(67)} y={m.Y(-5) + 4} cls="t-cut t-b t-mono">Z−5</T>

          <Dim x1={m.X(80)} y1={m.Y(0)} x2={m.X(80)} y2={m.Y(-20)} off={-12} label="20" c={c} lside={-1} />
        </g>
      )}
    </Fig>
  );
}

/* ================= zero w narożniku czy na środku ================= */
function Plate({ top, title, center }: { top: number; title: string; center: boolean }) {
  const u = 1.9, w = 80 * u, h = 50 * u;
  const x0 = 180 - w / 2, y0 = top + 44, x1 = x0 + w, y1 = y0 + h;
  const W = center ? { x: 180, y: y0 + h / 2 } : { x: x0, y: y1 };
  const lab = center
    ? { sw: "X−40 Y−25", se: "X40 Y−25", ne: "X40 Y25", nw: "X−40 Y25" }
    : { sw: "X0 Y0", se: "X80 Y0", ne: "X80 Y50", nw: "X0 Y50" };
  return (
    <g>
      <T x={16} y={top + 14} cls="t-b">{title}</T>
      <rect x={x0} y={y0} width={w} height={h} className="p-con" style={{ fill: "color-mix(in srgb, var(--ink) 5%, transparent)" }} />
      {center && <>
        <line x1={x0 - 14} y1={W.y} x2={x1 + 16} y2={W.y} className="p-cons" />
        <line x1={W.x} y1={y1 + 12} x2={W.x} y2={y0 - 14} className="p-cons" />
        <T x={x0 + w * 0.75} y={y0 + h * 0.25 + 4} anchor="middle" cls="t-mut t-mono">X+ Y+</T>
        <T x={x0 + w * 0.25} y={y0 + h * 0.25 + 4} anchor="middle" cls="t-mut t-mono">X− Y+</T>
        <T x={x0 + w * 0.25} y={y0 + h * 0.75 + 4} anchor="middle" cls="t-mut t-mono">X− Y−</T>
        <T x={x0 + w * 0.75} y={y0 + h * 0.75 + 4} anchor="middle" cls="t-mut t-mono">X+ Y−</T>
      </>}
      {!center && <T x={x0 + w / 2} y={y0 + h / 2 + 4} anchor="middle" cls="t-mut t-mono">X+ Y+</T>}
      <line x1={W.x} y1={W.y} x2={W.x + 34} y2={W.y} className="p-acc thick" markerEnd="url(#f01zero-a-acc)" />
      <line x1={W.x} y1={W.y} x2={W.x} y2={W.y - 34} className="p-acc thick" markerEnd="url(#f01zero-a-acc)" />
      <T x={W.x + 38} y={W.y + 4} cls="t-acc t-b">X</T>
      <T x={W.x + 5} y={W.y - 36} cls="t-acc t-b">Y</T>
      <Pt x={W.x} y={W.y} dot="pt-rap" />
      <T x={W.x - 6} y={W.y + 15} anchor="end" cls="t-acc t-b">W</T>
      <T x={x0 - 6} y={y1 + 16} anchor="end" cls="t-mono">{lab.sw}</T>
      <T x={x1 + 6} y={y1 + 16} cls="t-mono">{lab.se}</T>
      <T x={x1 + 6} y={y0 - 5} cls="t-mono">{lab.ne}</T>
      <T x={x0 - 6} y={y0 - 5} anchor="end" cls="t-mono">{lab.nw}</T>
    </g>
  );
}

export function ZeroChoice() {
  return (
    <Fig id="f01zero" code="W" title="Ta sama płytka, dwa położenia zera" h={356} legend={["acc", "cons"]}
      caption={<>Przy zerze w narożniku wszystkie punkty płytki mają dodatnie X i Y. Przy zerze na środku detal leży w czterech ćwiartkach i połowa współrzędnych ma minus.</>}>
      {() => (
        <g>
          <Plate top={4} title="Zero w narożniku" center={false} />
          <line x1={16} y1={176} x2={344} y2={176} className="p-ext" />
          <Plate top={180} title="Zero na środku" center />
        </g>
      )}
    </Fig>
  );
}

/* ================= błąd: znak Z ================= */
export function ZSign() {
  const R: [number, number, number, number] = [0, 100, -24, 28];
  const m = mapper(R, [14, 6, 332, 176]);
  const tool = (x: number, z: number, cls: string) => (
    <rect x={m.X(x - 5)} y={m.Y(28)} width={10 * m.u} height={m.Y(z) - m.Y(28)} className={cls} rx={2} />
  );
  return (
    <Fig id="f01zs" code="Z" title="Jeden znak, trzy skutki" h={196} legend={["cut", "bad", "stock"]}
      caption={<>Miało być <b>Z−2</b>. Bez minusa frez tnie powietrze. Z dodatkowym zerem wchodzi 20 mm w detal.</>}>
      {(c) => (
        <g>
          <rect x={m.X(4)} y={m.Y(0)} width={92 * m.u} height={20 * m.u} fill={c.hatch} className="p-con" />
          {tool(20, 2, "cutter")}
          <T x={m.X(27)} y={m.Y(9)} cls="t-rap t-b t-mono">Z2</T>
          <T x={m.X(27)} y={m.Y(9) + 13} cls="t-mut">powietrze</T>
          <rect x={m.X(45)} y={m.Y(0)} width={10 * m.u} height={2 * m.u} className="panel-bg" />
          {tool(50, -2, "cutter")}
          <T x={m.X(57)} y={m.Y(-2) + 4} cls="t-cut t-b t-mono">Z−2</T>
          <T x={m.X(57)} y={m.Y(-2) + 18} cls="t-cut">dobrze</T>
          {tool(80, -20, "p-fill-bad")}
          <T x={m.X(87)} y={m.Y(-10)} cls="t-bad t-b t-mono">Z−20</T>
          <T x={m.X(87)} y={m.Y(-10) + 14} cls="t-bad">kolizja</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= błąd: ruch stołu a ruch narzędzia ================= */
export function TableMotion() {
  return (
    <Fig id="f01tab" code="X" title="Stół jedzie w lewo, narzędzie idzie po detalu w +X" h={176} legend={["acc", "dim", "tool"]}
      caption={<>Program zawsze opisuje ruch <b>narzędzia względem detalu</b>. Norma ISO 841 ruch stołu oznacza osobno (X′) i ma on przeciwny zwrot.</>}>
      {(c) => (
        <g>
          <rect x={24} y={40} width={312} height={86} rx={6} className="panel-bg" />
          <T x={30} y={54} cls="t-mut">stół</T>
          <rect x={118} y={58} width={124} height={52} className="p-con" style={{ fill: "color-mix(in srgb, var(--ink) 6%, transparent)" }} />
          <circle cx={150} cy={84} r={11} className="tool" />
          <circle cx={150} cy={84} r={2} className="pt-cut" />
          <line x1={165} y1={84} x2={226} y2={84} className="p-acc thick" markerEnd={c.a("acc")} />
          <T x={170} y={76} cls="t-acc t-b">+X</T>
          <line x1={300} y1={146} x2={200} y2={146} className="p-dim" markerEnd={c.a("dim")} />
          <T x={250} y={166} anchor="middle" cls="t-mut">X′ — ruch stołu</T>
          <T x={180} y={26} anchor="middle" cls="t-acc">narzędzie względem detalu</T>
        </g>
      )}
    </Fig>
  );
}

export const f0Figs = {
  "f01-axes": () => <AxesTriad />,
  "f01-top": () => <TopView />,
  "f01-side": () => <SideView />,
  "f01-zero": () => <ZeroChoice />,
  "f01-zsign": () => <ZSign />,
  "f01-table": () => <TableMotion />,
};
