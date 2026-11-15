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

/* ================= skok gwintu P ================= */
export function PitchDiag() {
  const P = 26, y0 = 92, dep = 18, x0 = 24, n = 5;
  // zarys gwintu zewnętrznego w przekroju: grzbiety co P, dno między nimi
  let d = `M ${x0} ${y0 + 70} V ${y0 + dep}`;
  for (let i = 0; i < n; i++) d += ` L ${x0 + i * P + P / 2} ${y0} L ${x0 + (i + 1) * P} ${y0 + dep}`;
  d += ` V ${y0 + 70} Z`;
  return (
    <Fig id="pitch" code="P" title="Skok gwintu P a posuw" h={210} legend={["con", ["acc", "jeden obrót"], "dim"]}
      notes={<><Code k="acc">G94: F = n · P</Code><Code k="acc">G95: F = P</Code><Code k="dim">otwór pod gwintownik ≈ D − P</Code></>}
      caption={<>Skok <b>P</b> to odległość między sąsiednimi grzbietami wzdłuż osi. Na jeden obrót wrzeciona narzędzie musi przesunąć się dokładnie o P — stąd posuw w cyklach gwintowania wynika ze skoku, a nie z tablic posuwów. Dla M8 P = 1,25, dla M10 P = 1,5.</>}>
      {(c) => (
        <g>
          <path d={d} fill={c.hatch} className="p-con" />
          <line x1={10} y1={y0 + 70} x2={x0 + n * P + 14} y2={y0 + 70} className="axis-c" />
          <T x={x0 + n * P / 2} y={y0 + 84} anchor="middle" cls="t-mut t-sm">oś gwintu</T>
          <Dim x1={x0 + P / 2} y1={y0 - 12} x2={x0 + P * 1.5} y2={y0 - 12} label="P" c={c} lside={-1} cls="t-mono t-acc t-b" />
          <Dim x1={x0 + 2.5 * P} y1={y0 - 12} x2={x0 + 3.5 * P} y2={y0 - 12} label="P" c={c} lside={-1} />
          <Dim x1={x0 + n * P + 10} y1={y0} x2={x0 + n * P + 10} y2={y0 + 70} label="D/2" c={c} lside={-1} cls="t-mono" />
          <T x={x0 + n * P / 2} y={y0 + 40} anchor="middle" cls="t-mut t-sm">zarys gwintu zewnętrznego</T>

          <line x1={196} y1={28} x2={196} y2={176} className="p-cons" />
          <T x={278} y={28} anchor="middle" cls="t-b">jeden obrót → droga P</T>
          <circle cx={240} cy={96} r={26} className="p-con" />
          <path d="M 240 70 A 26 26 0 1 1 214 96" className="p-acc thick" markerEnd={c.a("acc")} />
          <T x={240} y={100} anchor="middle" cls="t-mono t-sm">n</T>
          <line x1={282} y1={96} x2={340} y2={96} className="p-acc thick" markerEnd={c.a("acc")} />
          <Dim x1={282} y1={80} x2={340} y2={80} label="P" c={c} lside={-1} cls="t-mono t-acc t-b" />
          <T x={311} y={118} anchor="middle" cls="t-mut t-sm">ruch osi</T>
          <T x={278} y={160} anchor="middle" cls="t-mut">posuw na obrót = skok</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= nakrój gwintownika a głębokość otworu ================= */
export function TapChamferDiag() {
  const top = 48, gw = 92, nak = 34, zap = 20, hw = 26, cx = 120, ux = 1;
  const bottom = top + gw + nak + zap;
  return (
    <Fig id="tap-chamfer" code="nakrój" title="Nakrój gwintownika a głębokość otworu" h={248} legend={["con", ["acc", "pełny zarys gwintu"], ["cons", "nakrój — zarys niepełny"], "dim"]}
      notes={<Code k="dim">L_otw ≥ L_gw + z · P + zapas</Code>}
      caption={<>Pełny zarys gwintu kończy się tam, gdzie zaczyna się stożkowy nakrój — kilka zwojów wyżej, niż stoi czubek gwintownika. Otwór nieprzelotowy musi więc być głębszy niż gwint o długość nakroju (forma C: 2–3 zwoje, forma E: 1,5–2) i o zapas na wiór nad stożkiem wiertła.</>}>
      {(c) => (
        <g>
          <rect x={22} y={top} width={cx - hw - 22} height={bottom - top + 30} fill={c.hatch} className="p-con" />
          <rect x={cx + hw} y={top} width={212 - hw - cx + 20} height={bottom - top + 30} fill={c.hatch} className="p-con" />
          <path d={`M ${cx - hw} ${bottom} L ${cx} ${bottom + 16} L ${cx + hw} ${bottom}`} className="p-con" />
          <line x1={22} y1={top} x2={cx - hw} y2={top} className="p-con" />
          <line x1={cx + hw} y1={top} x2={212} y2={top} className="p-con" />
          {/* gwintownik: część pełna + nakrój */}
          <rect x={cx - hw + 4} y={top - 20} width={2 * hw - 8} height={gw + 20} className="p-fill-acc" />
          <rect x={cx - hw + 4} y={top - 20} width={2 * hw - 8} height={gw + 20} className="p-acc" />
          <path d={`M ${cx - hw + 4} ${top + gw} L ${cx - 8} ${top + gw + nak} H ${cx + 8} L ${cx + hw - 4} ${top + gw} Z`} className="p-cons" />
          {Array.from({ length: 5 }, (_, i) => <line key={i} x1={cx - hw + 4} y1={top + 14 + i * 18} x2={cx + hw - 4} y2={top + 14 + i * 18} className="p-acc" />)}
          <T x={cx} y={top - 26} anchor="middle" cls="t-acc t-b">gwintownik</T>
          <Dim x1={cx + hw + 18 * ux} y1={top} x2={cx + hw + 18} y2={top + gw} label="L_gw" c={c} lside={-1} cls="t-mono t-acc t-b" />
          <Dim x1={cx + hw + 18} y1={top + gw} x2={cx + hw + 18} y2={top + gw + nak} label="z · P" c={c} lside={-1} />
          <Dim x1={cx + hw + 18} y1={top + gw + nak} x2={cx + hw + 18} y2={bottom} label="zapas" c={c} lside={-1} />
          <Dim x1={cx - hw - 18} y1={top} x2={cx - hw - 18} y2={bottom} label="L_otw" c={c} lside={1} cls="t-mono t-b" />
          <line x1={cx - hw - 24} y1={top + gw} x2={cx + hw + 24} y2={top + gw} className="p-cons" />
          <T x={300} y={top + gw + 4} anchor="middle" cls="t-mut t-sm">koniec pełnego gwintu</T>
          <T x={300} y={bottom + 4} anchor="middle" cls="t-mut t-sm">dno otworu</T>
          <T x={300} y={bottom + 30} anchor="middle" cls="t-mut t-sm">stożek wiertła</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= wejście po rampie ================= */
export function RampDiag() {
  const y0 = 86, ap = 44, x0 = 40, L = 220, r = 16;
  const x1 = x0 + L;
  return (
    <Fig id="ramp" code="rampa" title="Wejście po rampie: kąt, głębokość i długość" h={214} legend={["cut", "tool", "con", "dim"]}
      notes={<><Code k="dim">L = ap / tan α</Code><Code k="cut">G01 X… Z… F…</Code></>}
      caption={<>Frez zjeżdża na głębokość <b>ap</b> ruchem jednocześnie w płaszczyźnie i w Z. Mały kąt <b>α</b> oznacza długą rampę: przy 3° zejście o 3 mm zajmuje około 57 mm. Dopuszczalny kąt podaje producent freza — zależy od średnicy i płytki.</>}>
      {(c) => (
        <g>
          <rect x={14} y={y0} width={332} height={96} fill={c.hatch} className="p-con" />
          <path d={`M ${x0 - r} ${y0} L ${x1 + r} ${y0 + ap} V ${y0} Z`} className="cut-zone" />
          <line x1={x0} y1={y0} x2={x1} y2={y0 + ap} className="p-cut thick" markerEnd={c.a("cut")} />
          <rect x={x0 - r} y={y0 - 60} width={2 * r} height={60} className="tool" />
          <rect x={x1 - r} y={y0 + ap - 60} width={2 * r} height={60} className="tool" />
          <line x1={x0 - r} y1={y0} x2={x1 + r} y2={y0 + ap} className="p-con" />
          <Dim x1={x0} y1={y0 + ap + 36} x2={x1} y2={y0 + ap + 36} label="L" c={c} lside={-1} cls="t-mono t-b" />
          <Dim x1={x1 + r + 14} y1={y0} x2={x1 + r + 14} y2={y0 + ap} label="ap" c={c} lside={-1} cls="t-mono t-acc t-b" />
          <path d={`M ${x0 - r + 60} ${y0} A 60 60 0 0 1 ${x0 - r + 60 * Math.cos(Math.atan2(ap, L + 2 * r))} ${y0 + 60 * Math.sin(Math.atan2(ap, L + 2 * r))}`} className="p-dim" />
          <T x={x0 - r + 66} y={y0 + 16} cls="t-mono t-dim">α</T>
          <T x={180} y={y0 - 68} anchor="middle" cls="t-mut t-sm">frez na początku i na końcu rampy</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= helisa: posuw środka a posuw na obwodzie ================= */
export function HelixFeedDiag() {
  const cx = 120, cy = 112, Rm = 72, Rc = 20, Rv = Rm - Rc;
  return (
    <Fig id="helix-feed" code="Vf" title="Frezowanie otworu po helisie: tor środka i posuw" h={226} legend={["con", "tool", ["cons", "tor środka D_vf"], ["acc", "posuw na obwodzie Vfm"], ["cut", "posuw środka Vf"]]}
      notes={<><Code k="dim">D_vf = D_m − D_c</Code><Code k="cut">Vf = Vfm · (D_m − D_c) / D_m</Code></>}
      caption={<>Ostrza frezu krążą po otworze <b>D_m</b>, a jego środek po mniejszym okręgu <b>D_vf</b>. Na jeden obieg ostrze przebywa dłuższą drogę niż środek, więc żeby utrzymać posuw na ostrze, posuw środka <b>Vf</b> musi być mniejszy od posuwu na obwodzie <b>Vfm</b>. Z korekcją promienia programuje się wprost Vfm.</>}>
      {(c) => (
        <g>
          <rect x={16} y={cy - 92} width={208} height={184} fill={c.hatch} className="p-con" />
          <circle cx={cx} cy={cy} r={Rm} className="hole-top" />
          <circle cx={cx} cy={cy} r={Rv} className="p-cons" />
          <circle cx={cx + Rv} cy={cy} r={Rc} className="tool" />
          <circle cx={cx + Rv} cy={cy} r={2} className="pt" />
          <path d={`M ${cx + Rv} ${cy - 34} A ${Rv} ${Rv} 0 0 0 ${cx + Rv * Math.cos(-1.1)} ${cy + Rv * Math.sin(-1.1)}`} className="p-cut thick" markerEnd={c.a("cut")} />
          <path d={`M ${cx + Rm} ${cy - 30} A ${Rm} ${Rm} 0 0 0 ${cx + Rm * Math.cos(-1.1)} ${cy + Rm * Math.sin(-1.1)}`} className="p-acc thick" markerEnd={c.a("acc")} />
          <T x={cx + Rv - 28} y={cy - 46} anchor="end" cls="t-cut t-b">Vf</T>
          <T x={cx + Rm + 4} y={cy - 36} cls="t-acc t-b">Vfm</T>
          <Dim x1={cx - Rm} y1={cy + Rm + 14} x2={cx + Rm} y2={cy + Rm + 14} label="D_m" c={c} lside={-1} cls="t-mono t-b" />
          <Dim x1={cx - Rv} y1={cy + 30} x2={cx + Rv} y2={cy + 30} label="D_vf" c={c} lside={-1} cls="t-mono" />
          <Dim x1={cx + Rv - Rc} y1={cy + Rc + 12} x2={cx + Rv + Rc} y2={cy + Rc + 12} label="D_c" c={c} lside={1} cls="t-mono" />

          <line x1={244} y1={30} x2={244} y2={194} className="p-cons" />
          <T x={302} y={44} anchor="middle" cls="t-b">przykład</T>
          <T x={302} y={70} anchor="middle" cls="t-mono t-sm">D_m 40, D_c 10</T>
          <T x={302} y={90} anchor="middle" cls="t-mono t-sm">D_vf = 30 → R15</T>
          <T x={302} y={118} anchor="middle" cls="t-mono t-sm t-acc">Vfm 300 mm/min</T>
          <T x={302} y={138} anchor="middle" cls="t-mono t-sm t-cut">Vf = 300 · 30/40</T>
          <T x={302} y={156} anchor="middle" cls="t-mono t-sm t-cut">= 225 mm/min</T>
        </g>
      )}
    </Fig>
  );
}
