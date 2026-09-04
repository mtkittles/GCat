import type { ReactNode } from "react";

const S = { stroke: "var(--ink)", fill: "none", strokeWidth: 2 } as const;
const T = { fontSize: 12, fill: "var(--muted)", fontFamily: "var(--font-mono)" } as const;
const Frame = ({ children, w = 520, h = 220, caption }: { children: ReactNode; w?: number; h?: number; caption: string }) => (
  <figure className="grid gap-1">
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-2xl bg-white border border-line rounded-md" role="img" aria-label={caption}>{children}</svg>
    <figcaption className="text-sm text-muted">{caption}</figcaption>
  </figure>
);

/** G41 / G42: strona narzędzia względem konturu, patrząc w kierunku ruchu. */
const Comp = () => (
  <Frame caption="Stań za narzędziem i patrz w kierunku ruchu (strzałka). G41: narzędzie po lewej stronie konturu. G42: po prawej. Kolor: rzeczywisty tor środka freza po włączeniu kompensacji.">
    {[["G41", 40, "left"], ["G42", 290, "right"]].map(([label, x0, side]) => {
      const x = Number(x0); const off = side === "left" ? -22 : 22;
      return (
        <g key={label as string}>
          <text x={x} y={28} fontSize={16} fontWeight={700} fill="var(--ink)">{label}</text>
          <rect x={x + 30} y={60} width={150} height={110} {...S} />
          <text x={x + 75} y={120} {...T}>kontur</text>
          {/* tor środka narzędzia: równolegle do górnej krawędzi, przesunięty */}
          <line x1={x + 30} y1={60 + off} x2={x + 180} y2={60 + off} stroke="var(--green)" strokeWidth={2.5} />
          <polygon points={`${x + 172},${52 + off} ${x + 188},${60 + off} ${x + 172},${68 + off}`} fill="var(--green)" />
          <circle cx={x + 100} cy={60 + off} r={12} fill="none" stroke="var(--amber)" strokeWidth={2} />
          <text x={x + 30} y={200} {...T}>ruch w prawo, narzędzie {side === "left" ? "nad" : "pod"} krawędzią</text>
        </g>
      );
    })}
  </Frame>
);

/** I/J kontra R: dwa łuki przez te same punkty. */
const Arc = () => (
  <Frame caption="Przez punkty A i B o promieniu R przechodzą dwa łuki. R dodatnie wybiera krótszy (≤180°), R ujemne dłuższy. I/J wskazują środek jednoznacznie — wektor od punktu startu A.">
    <circle cx={200} cy={110} r={70} fill="none" stroke="var(--line)" strokeDasharray="4 4" />
    <circle cx={200} cy={110} r={3} fill="var(--ink)" />
    <text x={206} y={106} {...T}>środek (I,J)</text>
    {/* A = (130,110) na lewo, B = (200,40) na górze */}
    <path d="M130 110 A70 70 0 0 1 200 40" stroke="var(--blue)" strokeWidth={3} fill="none" />
    <path d="M130 110 A70 70 0 1 0 200 40" stroke="var(--red)" strokeWidth={2} fill="none" strokeDasharray="6 4" />
    <circle cx={130} cy={110} r={4} fill="var(--ink)" /><text x={100} y={114} fontSize={14} fontWeight={700} fill="var(--ink)">A</text>
    <circle cx={200} cy={40} r={4} fill="var(--ink)" /><text x={206} y={36} fontSize={14} fontWeight={700} fill="var(--ink)">B</text>
    <line x1={130} y1={110} x2={200} y2={110} stroke="var(--amber)" strokeWidth={2} markerEnd="url(#ah)" />
    <text x={150} y={128} {...T} fill="var(--amber)">I = +70, J = 0</text>
    <text x={320} y={70} {...T}><tspan fill="var(--blue)">━━</tspan> R+70 → krótszy łuk (90°)</text>
    <text x={320} y={95} {...T}><tspan fill="var(--red)">╌╌</tspan> R−70 → dłuższy łuk (270°)</text>
    <text x={320} y={135} {...T}>G02 X200 Y40 R70</text>
    <text x={320} y={155} {...T}>G02 X200 Y40 I70 J0</text>
    <text x={320} y={175} {...T}>(Y w górę → CW = G02)</text>
    <text x={320} y={205} {...T}>pełne koło: tylko I/J</text>
    <defs><marker id="ah" markerWidth={8} markerHeight={8} refX={6} refY={4} orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="var(--amber)" /></marker></defs>
  </Frame>
);

/** G98 / G99: powrót w cyklach. */
const Cycle = () => (
  <Frame caption="Cykl wiercenia: szybki dojazd do R, posuw do Z, powrót. G99 wraca tylko do płaszczyzny R (szybciej), G98 do punktu początkowego — potrzebne, gdy między otworami jest zacisk.">
    {[["G99 — powrót do R", 30], ["G98 — powrót do punktu początkowego", 280]].map(([label, x0], i) => {
      const x = Number(x0);
      return (
        <g key={i}>
          <text x={x} y={24} fontSize={13} fontWeight={700} fill="var(--ink)">{label}</text>
          <rect x={x} y={110} width={220} height={80} fill="#EEF0EC" stroke="var(--line)" />
          {i === 1 && <rect x={x + 95} y={70} width={30} height={40} fill="var(--line)" />}
          {i === 1 && <text x={x + 90} y={64} {...T}>zacisk</text>}
          <line x1={x} y1={50} x2={x + 220} y2={50} stroke="var(--line)" strokeDasharray="3 3" /><text x={x + 170} y={46} {...T}>start</text>
          <line x1={x} y1={98} x2={x + 220} y2={98} stroke="var(--line)" strokeDasharray="3 3" /><text x={x + 190} y={94} {...T}>R</text>
          {/* otwór 1 */}
          <line x1={x + 40} y1={50} x2={x + 40} y2={98} stroke="var(--amber)" strokeDasharray="5 3" strokeWidth={1.5} />
          <line x1={x + 40} y1={98} x2={x + 40} y2={170} stroke="var(--green)" strokeWidth={3} />
          <line x1={x + 44} y1={170} x2={x + 44} y2={i === 0 ? 98 : 50} stroke="var(--amber)" strokeDasharray="5 3" strokeWidth={1.5} />
          {/* przejazd */}
          <line x1={x + 44} y1={i === 0 ? 98 : 50} x2={x + 176} y2={i === 0 ? 98 : 50} stroke="var(--amber)" strokeDasharray="5 3" strokeWidth={1.5} />
          {/* otwór 2 */}
          <line x1={x + 176} y1={i === 0 ? 98 : 50} x2={x + 176} y2={98} stroke="var(--amber)" strokeDasharray="5 3" strokeWidth={1.5} />
          <line x1={x + 176} y1={98} x2={x + 176} y2={170} stroke="var(--green)" strokeWidth={3} />
          {i === 0 && <text x={x + 60} y={150} fontSize={12} fill="var(--red)">↑ w G99 tu byłaby kolizja z zaciskiem</text>}
        </g>
      );
    })}
  </Frame>
);

/** G90 / G91: te same słowa, inne miejsce. */
const AbsInc = () => (
  <Frame caption="Ten sam blok „X30 Y20” po dojeździe do X20 Y10: w G90 to punkt (30,20); w G91 to przesunięcie o 30 i 20, czyli punkt (50,30).">
    {[["G90 — absolutnie", 30, 30, 20], ["G91 — przyrostowo", 280, 50, 30]].map(([label, x0, tx, ty]) => {
      const x = Number(x0); const sx = 4; const oy = 190;
      const P = (px: number, py: number) => [x + 10 + px * sx, oy - py * sx] as const;
      const [ax, ay] = P(20, 10); const [bx, by] = P(Number(tx), Number(ty));
      return (
        <g key={label as string}>
          <text x={x} y={24} fontSize={13} fontWeight={700} fill="var(--ink)">{label}</text>
          <line x1={x + 10} y1={oy} x2={x + 230} y2={oy} stroke="var(--line)" /><line x1={x + 10} y1={oy} x2={x + 10} y2={40} stroke="var(--line)" />
          {[10, 20, 30, 40, 50].map((v) => <text key={v} x={x + 10 + v * sx - 6} y={oy + 14} {...T} fontSize={10}>{v}</text>)}
          <circle cx={ax} cy={ay} r={4} fill="var(--ink)" /><text x={ax + 6} y={ay + 14} {...T}>start (20,10)</text>
          <line x1={ax} y1={ay} x2={bx} y2={by} stroke="var(--green)" strokeWidth={3} />
          <circle cx={bx} cy={by} r={4} fill="var(--green)" /><text x={bx - 30} y={by - 10} {...T} fill="var(--ink)">({tx},{ty})</text>
        </g>
      );
    })}
  </Frame>
);

/** Toczenie: X jako średnica. */
const Dia = () => (
  <Frame caption="Na tokarce narzędzie stoi 20 mm od osi, ale w programie piszesz X40 — sterownik liczy średnicowo. Promień w I podajesz jednak jako promień." h={200}>
    <line x1={40} y1={100} x2={480} y2={100} stroke="var(--ink)" strokeDasharray="10 4 2 4" />
    <rect x={120} y={60} width={300} height={80} fill="#EEF0EC" stroke="var(--ink)" strokeWidth={2} />
    <line x1={90} y1={60} x2={90} y2={140} stroke="var(--blue)" strokeWidth={2} markerStart="url(#d)" markerEnd="url(#d)" />
    <text x={44} y={104} {...T} fill="var(--blue)">⌀40</text>
    <line x1={450} y1={100} x2={450} y2={60} stroke="var(--amber)" strokeWidth={2} />
    <text x={456} y={84} {...T} fill="var(--amber)">r = 20</text>
    <rect x={425} y={44} width={14} height={16} fill="var(--ink)" /><text x={400} y={38} {...T}>nóż: X40</text>
    <text x={200} y={168} {...T}>oś obrotu (Z)</text>
    <defs><marker id="d" markerWidth={6} markerHeight={6} refX={3} refY={3} orient="auto"><circle cx={3} cy={3} r={2} fill="var(--blue)" /></marker></defs>
  </Frame>
);

export const diagrams: Record<string, () => ReactNode> = {
  "g40-g42": Comp, g02: Arc, g03: Arc, "g81-g83": Cycle, "g90-g91": AbsInc, "g96-g97": Dia, "g94-g95": Dia,
};
