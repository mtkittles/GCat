import { Code, Dim, Fig, T } from "./fig";

/* Rysunki haseł słownika (paczka UE): posuwy, kąt przystawienia, przekrój warstwy skrawanej. */

/* ================= posuw na obrót i posuw minutowy ================= */
export function FeedsDiag() {
  const top = 78, f = 20, marks = [150, 130, 110, 90];
  return (
    <Fig id="feeds" code="F" title="Posuw na obrót f i posuw minutowy Vf" h={212} legend={[["acc", "posuw na obrót f"], ["cut", "posuw minutowy Vf"], "stock"]}
      notes={<><Code k="cut">Vf = f · n</Code><Code k="acc">frezowanie: f = fz · z</Code></>}
      caption={<>Posuw na obrót <b>f</b> to droga narzędzia na jeden obrót wrzeciona. Posuw minutowy <b>Vf</b> to droga na minutę, czyli f pomnożone przez obroty. Przy frezowaniu jeden obrót to praca wszystkich ostrzy, więc f = fz · z.</>}>
      {(c) => (
        <g>
          <T x={86} y={22} anchor="middle" cls="t-b">jeden obrót</T>
          <rect x={22} y={top} width={128} height={84} fill={c.hatch} className="p-con" />
          <line x1={10} y1={top + 42} x2={164} y2={top + 42} className="axis-c" />
          {marks.map((x) => <line key={x} x1={x} y1={top} x2={x} y2={top + 84} className="p-cons" />)}
          <path d={`M ${marks[3]} ${top} l -9 -30 h 26 l -5 30 z`} className="p-fill-acc" />
          <path d={`M ${marks[3]} ${top} l -9 -30 h 26 l -5 30 z`} className="p-acc" />
          <Dim x1={marks[2]} y1={top - 10} x2={marks[1]} y2={top - 10} label="f" c={c} lside={-1} cls="t-mono t-acc t-b" />
          <path d="M 156 96 A 10 26 0 0 1 156 144" className="rot" markerEnd={c.a("dim")} />
          <T x={172} y={104} cls="t-mono">n</T>
          <T x={86} y={186} anchor="middle" cls="t-mut">ślady co f na powierzchni</T>

          <line x1={184} y1={34} x2={184} y2={196} className="p-cons" />
          <T x={272} y={22} anchor="middle" cls="t-b">jedna minuta</T>
          <line x1={202} y1={120} x2={340} y2={120} className="p-cut thick" markerEnd={c.a("cut")} />
          {Array.from({ length: 6 }, (_, i) => <line key={i} x1={202 + i * f} y1={112} x2={202 + i * f} y2={128} className="p-dim" />)}
          <Dim x1={202} y1={104} x2={202 + f} y2={104} label="f" c={c} lside={-1} cls="t-mono t-acc t-b" />
          <T x={272} y={150} anchor="middle" cls="t-cut t-b">Vf — droga w ciągu minuty</T>
          <T x={272} y={168} anchor="middle" cls="t-mut">n obrotów po f każdy</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= kąt przystawienia a grubość wióra ================= */
export function KappaDiag() {
  const y1 = 70, y2 = 150, f = 40;
  return (
    <Fig id="kappa" code="κr" title="Kąt przystawienia a grubość wióra" h={214} legend={[["acc", "krawędź i przekrój wióra"], "dim", ["cut", "kierunek posuwu"]]}
      notes={<Code k="acc">h = f · sin κr</Code>}
      caption={<>Pomarańczowe pole to przekrój warstwy zbieranej w jednym obrocie. Przy <b>κr = 90°</b> grubość wióra równa się posuwowi. Przy mniejszym kącie ten sam posuw rozkłada się na dłuższy odcinek krawędzi: wiór jest cieńszy i szerszy. Dla 45° h ≈ 0,71 · f.</>}>
      {(c) => (
        <g>
          <T x={92} y={24} anchor="middle" cls="t-b">κr = 90°</T>
          <path d={`M 72 ${y2} V ${y1} h ${f} V ${y2} z`} className="p-fill-acc" />
          <line x1={72} y1={y2} x2={72} y2={y1} className="p-acc thick" />
          <line x1={72 + f} y1={y2} x2={72 + f} y2={y1} className="p-acc" />
          <Dim x1={72} y1={y1 - 12} x2={72 + f} y2={y1 - 12} label="h = f" c={c} lside={-1} cls="t-mono t-acc t-b" />
          <Dim x1={48} y1={y1} x2={48} y2={y2} label="ap" c={c} lside={-1} cls="t-mono" />
          <line x1={36} y1={y2} x2={150} y2={y2} className="p-con" />
          <path d={`M 90 ${y2} A 18 18 0 0 0 72 ${y2 - 18}`} className="p-dim" />
          <line x1={72} y1={176} x2={72 + f} y2={176} className="p-cut" markerEnd={c.a("cut")} />
          <T x={72 + f + 8} y={180} cls="t-cut">posuw f</T>

          <line x1={180} y1={34} x2={180} y2={196} className="p-cons" />
          <T x={272} y={24} anchor="middle" cls="t-b">κr = 45°</T>
          <path d={`M 212 ${y2} L 292 ${y1} h ${f} L ${212 + f} ${y2} z`} className="p-fill-acc" />
          <line x1={212} y1={y2} x2={292} y2={y1} className="p-acc thick" />
          <line x1={212 + f} y1={y2} x2={292 + f} y2={y1} className="p-acc" />
          <Dim x1={252} y1={110} x2={272} y2={130} label="h" c={c} lside={1} cls="t-mono t-acc t-b" />
          <line x1={196} y1={y2} x2={346} y2={y2} className="p-con" />
          <path d={`M 234 ${y2} A 22 22 0 0 0 227.6 ${y2 - 15.6}`} className="p-dim" />
          <T x={240} y={y2 - 6} cls="t-mono">κr</T>
          <line x1={212} y1={176} x2={212 + f} y2={176} className="p-cut" markerEnd={c.a("cut")} />
          <T x={212 + f + 8} y={180} cls="t-cut">ten sam posuw f</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= przekrój warstwy skrawanej i siła ================= */
export function ChipAreaDiag() {
  return (
    <Fig id="chiparea" code="kc" title="Przekrój warstwy skrawanej i siła skrawania" h={190} legend={[["acc", "przekrój warstwy"], "dim", ["arc", "siła skrawania Fc"]]}
      notes={<Code k="acc">Fc = kc · ap · f</Code>}
      caption={<>Przy toczeniu ostrze zbiera w jednym obrocie warstwę o przekroju <b>ap · f</b>. Opór właściwy <b>kc</b> mówi, ile niutonów siły skrawania przypada na każdy milimetr kwadratowy tego przekroju.</>}>
      {(c) => (
        <g>
          <rect x={70} y={48} width={64} height={104} className="p-fill-acc" />
          <rect x={70} y={48} width={64} height={104} className="p-acc" />
          <T x={102} y={104} anchor="middle" cls="t-mono t-b">ap · f</T>
          <Dim x1={70} y1={166} x2={134} y2={166} label="f" c={c} lside={1} cls="t-mono t-acc t-b" />
          <Dim x1={46} y1={48} x2={46} y2={152} label="ap" c={c} lside={-1} cls="t-mono t-acc t-b" />
          <line x1={196} y1={56} x2={196} y2={140} className="p-arc thick" markerEnd={c.a("arc")} />
          <T x={208} y={92} cls="t-arc t-b">Fc — siła skrawania</T>
          <T x={208} y={110} cls="t-mut">kc niutonów na każdy mm²</T>
          <T x={208} y={126} cls="t-mut">przekroju</T>
        </g>
      )}
    </Fig>
  );
}
