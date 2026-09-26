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


/* ================= F0.2: punkty M, R, W, N ================= */
export function MachinePoints() {
  return (
    <Fig id="f02pts" code="M" title="Punkty charakterystyczne frezarki — widok z przodu" h={258} legend={["acc", "cons", "stock"]}
      notes={<><Code k="acc">M — zero maszyny</Code><Code k="acc">R — punkt referencyjny</Code><Code k="cut">W — zero detalu</Code><Code k="con">N — baza narzędzia</Code></>}
      caption={<>M i R ustala producent, W — programista dla każdego zamocowania. Wektor od M do W to wartość zapisywana w rejestrze przesunięcia.</>}>
      {(c) => (
        <g>
          <rect x={30} y={30} width={292} height={168} className="stock-out" />
          <T x={36} y={46} cls="t-mut">przestrzeń robocza</T>
          <rect x={36} y={200} width={290} height={14} className="clamp" />
          <T x={40} y={230} cls="t-mut">stół</T>
          <rect x={106} y={168} width={12} height={32} className="clamp" />
          <rect x={222} y={168} width={12} height={32} className="clamp" />
          <rect x={118} y={160} width={104} height={40} fill={c.hatch} className="p-con" />
          <rect x={252} y={30} width={36} height={40} className="spindle" />
          <rect x={259} y={70} width={22} height={18} className="holder" />
          <rect x={266} y={88} width={8} height={40} className="cutter" />
          <line x1={322} y1={30} x2={121} y2={158} className="p-acc dashed" markerEnd={c.a("acc")} />
          <T x={205} y={100} cls="t-acc t-b">G54</T>
          <Pt x={322} y={30} label="M" pos="ne" cls="t-acc t-b" dot="pt-rap" />
          <Pt x={302} y={30} label="R" pos="n" cls="t-acc t-b" dot="pt-rap" />
          <Pt x={118} y={160} label="W" pos="nw" cls="t-cut t-b" dot="pt-cut" />
          <Pt x={270} y={70} label="N" pos="w" />
          <line x1={10} y1={248} x2={34} y2={248} className="p-dim" markerEnd={c.a("dim")} />
          <line x1={10} y1={248} x2={10} y2={224} className="p-dim" markerEnd={c.a("dim")} />
          <T x={38} y={252} cls="t-ax">X</T>
          <T x={14} y={222} cls="t-ax">Z</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= F0.2: łańcuch współrzędnych w osi X ================= */
export function CoordChain() {
  const x = (v: number) => 336 + v * 0.86;
  return (
    <Fig id="f02ch" code="X" title="Pozycja maszynowa = przesunięcie + program" h={204} legend={["acc", "dim"]}
      notes={<Code k="acc">−260 = −320 + 60</Code>}
      caption={<>Oś X w widoku z góry. Zero maszyny M po prawej, więc wszystkie pozycje maszynowe są ujemne. Narzędzie T stoi 60 mm od W.</>}>
      {(c) => (
        <g>
          <line x1={x(-360)} y1={150} x2={x(12)} y2={150} className="ax" markerEnd={c.a("dim")} />
          {[-350, -300, -250, -200, -150, -100, -50, 0].map((v) => (
            <g key={v}><line x1={x(v)} y1={146} x2={x(v)} y2={154} className="p-dim" /><T x={x(v)} y={168} anchor="middle" cls="t-tick">{v}</T></g>
          ))}
          <line x1={x(0)} y1={40} x2={x(-320) + 3} y2={40} className="p-acc thick" markerEnd={c.a("acc")} />
          <T x={x(-160)} y={33} anchor="middle" cls="t-acc t-b t-mono">G54 X−320</T>
          <line x1={x(-320)} y1={78} x2={x(-260) - 3} y2={78} className="p-cut thick" markerEnd={c.a("cut")} />
          <T x={x(-290)} y={71} anchor="middle" cls="t-cut t-b t-mono">X60</T>
          <line x1={x(0)} y1={112} x2={x(-260) + 3} y2={112} className="p-dim" markerEnd={c.a("dim")} />
          <T x={x(-130)} y={105} anchor="middle" cls="t-b t-mono">MASZYNA X−260</T>
          {[[-320, "W"], [-260, "T"], [0, "M"]].map(([v, l]) => (
            <g key={l as string}><line x1={x(v as number)} y1={30} x2={x(v as number)} y2={150} className="p-cons" />
              <Pt x={x(v as number)} y={150} dot={l === "W" ? "pt-cut" : l === "M" ? "pt-rap" : "pt"} />
              <T x={x(v as number)} y={190} anchor="middle" cls={l === "W" ? "t-cut t-b" : l === "M" ? "t-acc t-b" : "t-b"}>{l as string}</T></g>
          ))}
        </g>
      )}
    </Fig>
  );
}

/* ================= F0.2: zero na bazach rysunkowych ================= */
export function DatumZero() {
  const R: [number, number, number, number] = [-24, 96, -26, 60];
  const m = mapper(R, [14, 8, 332, 214]);
  const flag = (x: number, y: number, l: string, dir: "down" | "left") => {
    const [dx, dy] = dir === "down" ? [0, 1] : [-1, 0];
    const bx = x + dx * 22, by = y + dy * 22;
    return (
      <g>
        <line x1={x} y1={y} x2={bx} y2={by} className="p-dim" />
        <polygon points={dir === "down" ? `${x - 6},${y} ${x + 6},${y} ${x},${y + 8}` : `${x},${y - 6} ${x},${y + 6} ${x - 8},${y}`} className="solid-hatch" />
        <rect x={bx - 9} y={by - 9} width={18} height={18} className="panel-bg" style={{ stroke: "var(--ink-2)" }} />
        <T x={bx} y={by + 4} anchor="middle" cls="t-b">{l}</T>
      </g>
    );
  };
  return (
    <Fig id="f02dat" code="W" title="Zero detalu na przecięciu baz A i B" h={236} legend={["dim", "stock"]}
      caption={<>Wymiary otworu liczone od baz A i B. Przy W w narożniku baz trafiają do programu bez zmian: <b>X60 Y20</b>. Przy W na środku trzeba liczyć: X20 Y−5.</>}>
      {(c) => (
        <g>
          <rect x={m.X(0)} y={m.Y(50)} width={80 * m.u} height={50 * m.u} fill={c.hatch} className="p-con" />
          <circle cx={m.X(60)} cy={m.Y(20)} r={5 * m.u} className="hole-top" />
          {flag(m.X(20), m.Y(0), "A", "down")}
          {flag(m.X(0), m.Y(38), "B", "left")}
          <Dim x1={m.X(0)} y1={m.Y(50)} x2={m.X(60)} y2={m.Y(50)} off={-14} label="60" c={c} />
          <Dim x1={m.X(80)} y1={m.Y(0)} x2={m.X(80)} y2={m.Y(20)} off={-14} label="20" c={c} lside={1} />
          <Pt x={m.X(0)} y={m.Y(0)} label="W" pos="ne" cls="t-cut t-b" dot="pt-cut" />
          <circle cx={m.X(40)} cy={m.Y(25)} r={4} className="p-fill-bad" />
          <T x={m.X(40) + 7} y={m.Y(25) - 6} cls="t-bad">W na środku</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= F0.3: pomiar krawędzi czujnikiem ================= */
export function EdgeFind() {
  const R: [number, number, number, number] = [-16, 42, -18, 26];
  const m = mapper(R, [16, 8, 328, 226]);
  const r = 5;
  return (
    <Fig id="f03edge" code="G54" title="Czujnik krawędzi Ø10 — dotyk od lewej i od przodu" h={250} legend={["acc", "dim", "stock"]}
      notes={<><Code k="acc">X: −325 + 5 = −320</Code><Code k="acc">Y: −265 + 5 = −260</Code></>}
      caption={<>W chwili styku środek czujnika jest o promień od krawędzi, po stronie ujemnej. Krawędź = pozycja maszynowa + r.</>}>
      {(c) => (
        <g>
          <rect x={m.X(0)} y={m.Y(30)} width={48 * m.u} height={30 * m.u} fill={c.hatch} className="p-con" />
          <T x={m.X(26)} y={m.Y(16)} anchor="middle" cls="t-b">detal</T>
          <circle cx={m.X(-r)} cy={m.Y(18)} r={r * m.u} className="probe" />
          <circle cx={m.X(-r)} cy={m.Y(18)} r={2} className="pt" />
          <Dim x1={m.X(-r)} y1={m.Y(18)} x2={m.X(0)} y2={m.Y(18)} off={-r * m.u - 10} label="r = 5" c={c} cls="t-mono t-acc t-b" />
          <T x={m.X(-r)} y={m.Y(18) + r * m.u + 16} anchor="middle" cls="t-mono">MASZ. X−325</T>
          <circle cx={m.X(22)} cy={m.Y(-r)} r={r * m.u} className="probe" />
          <circle cx={m.X(22)} cy={m.Y(-r)} r={2} className="pt" />
          <T x={m.X(22) + r * m.u + 6} y={m.Y(-r) + 4} cls="t-mono">MASZ. Y−265</T>
          <Pt x={m.X(0)} y={m.Y(0)} label="W" pos="ne" cls="t-cut t-b" dot="pt-cut" />
        </g>
      )}
    </Fig>
  );
}

/* ================= F0.3: dwa detale, G54 i G55 ================= */
export function TwoOffsets() {
  const R: [number, number, number, number] = [-420, 30, -300, 20];
  const m = mapper(R, [12, 8, 336, 220]);
  const W = [{ x: -320, y: -260, g: "G54" }, { x: -150, y: -260, g: "G55" }];
  return (
    <Fig id="f03two" code="G54 G55" title="Dwa imadła, dwa zera, jeden program" h={244} legend={["acc", "stock"]}
      caption={<>Rejestry przechowują wektory od M do każdego W. Program z <b>G54</b> obrabia detal 1, ten sam program z <b>G55</b> — detal 2.</>}>
      {(c) => (
        <g>
          <rect x={m.X(-410)} y={m.Y(10)} width={430 * m.u} height={300 * m.u} rx={6} className="panel-bg" />
          <T x={m.X(-404)} y={m.Y(10) + 14} cls="t-mut">stół</T>
          {W.map((w, i) => (
            <g key={w.g}>
              <rect x={m.X(w.x)} y={m.Y(w.y + 50)} width={80 * m.u} height={50 * m.u} fill={c.hatch} className="p-con" />
              <T x={m.X(w.x + 40)} y={m.Y(w.y + 25) + 4} anchor="middle" cls="t-b">detal {i + 1}</T>
              <line x1={m.X(0)} y1={m.Y(0)} x2={m.X(w.x) + 3} y2={m.Y(w.y) - 3} className="p-acc" markerEnd={c.a("acc")} />
              <Pt x={m.X(w.x)} y={m.Y(w.y)} label={`${w.g}  X${w.x} Y${w.y}`.replace(/-/g, "−")} pos="s" cls="t-acc t-b t-mono" dot="pt-rap" />
            </g>
          ))}
          <Pt x={m.X(0)} y={m.Y(0)} label="M" pos="sw" cls="t-acc t-b" dot="pt-rap" />
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
  "f02-points": () => <MachinePoints />,
  "f02-chain": () => <CoordChain />,
  "f02-datum": () => <DatumZero />,
  "f03-edge": () => <EdgeFind />,
  "f03-two": () => <TwoOffsets />,
};
