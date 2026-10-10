import { Code, Fig, mapper, Step, T } from "@/components/fig";

/* Rysunki modułu F2 — wrzeciono i narzędzie. Styl i kolory z fig.tsx. */

/* ================= F2.1: magazyn i wymiana ================= */
export function ToolChange() {
  const pockets = [1, 2, 3, 4, 5, 6];
  const len = [0, 34, 26, 30, 22, 36];
  return (
    <Fig id="f21tc" code="T M06" title="Magazyn narzędzi i wymiana" h={236} legend={["acc", "cons"]}
      caption={<><b>T2</b> każe magazynowi podać narzędzie nr 2 do pozycji wymiany. Dopiero <b>M06</b> zamienia je z narzędziem we wrzecionie. Gniazdo 1 jest puste, bo T1 pracuje.</>}>
      {(c) => (
        <g>
          <T x={16} y={24} cls="t-mut">magazyn</T>
          {pockets.map((p, i) => {
            const x = 16 + i * 36, on = p === 2;
            return (
              <g key={p}>
                <rect x={x} y={34} width={30} height={20} rx={4} className={on ? "p-fill-acc" : "panel-bg"} style={{ stroke: on ? "var(--accent)" : "var(--line-strong)" }} />
                <T x={x + 15} y={48} anchor="middle" cls={on ? "t-acc t-b t-mono" : "t-mono t-mut"}>{p}</T>
                {len[i] > 0 && <>
                  <rect x={x + 9} y={56} width={12} height={10} className="holder" />
                  <rect x={x + 12} y={66} width={6} height={len[i]} className="cutter" />
                </>}
              </g>
            );
          })}
          <T x={16 + 36 + 15} y={124} anchor="middle" cls="t-acc t-b">T2</T>
          <T x={16 + 36 + 15} y={138} anchor="middle" cls="t-acc t-sm">przygotowane</T>

          <rect x={262} y={20} width={56} height={60} className="spindle" />
          <T x={290} y={14} anchor="middle" cls="t-mut">wrzeciono</T>
          <rect x={279} y={80} width={22} height={16} className="holder" />
          <rect x={286} y={96} width={8} height={40} className="cutter" />
          <T x={304} y={128} cls="t-b t-mono">T1</T>

          <path d="M 70 158 C 120 205, 240 205, 290 146" className="p-acc thick" markerEnd={c.a("acc")} markerStart={c.a("acc")} />
          <T x={180} y={216} anchor="middle" cls="t-acc t-b t-mono">M06 — zamiana T1 ↔ T2</T>
          <line x1={67} y1={100} x2={67} y2={150} className="p-cons" />
        </g>
      )}
    </Fig>
  );
}

/* ================= F2.2: kierunek obrotów ================= */
function Rot({ cx, dir }: { cx: number; dir: 3 | 4 }) {
  const cy = 112, r = 52, cw = dir === 3;
  const end = cw ? [cx - r, cy] : [cx + r, cy];
  const d = `M ${cx} ${cy - r} A ${r} ${r} 0 1 ${cw ? 1 : 0} ${end[0]} ${end[1]}`;
  const flutes = [0, 90, 180, 270].map((a) => {
    const t = (a * Math.PI) / 180, k = cw ? 1 : -1;
    const x1 = cx + Math.cos(t) * 6, y1 = cy + Math.sin(t) * 6;
    const x2 = cx + Math.cos(t + k * 0.9) * 22, y2 = cy + Math.sin(t + k * 0.9) * 22;
    return <path key={a} d={`M ${x1} ${y1} Q ${cx + Math.cos(t + k * 0.3) * 18} ${cy + Math.sin(t + k * 0.3) * 18} ${x2} ${y2}`} className="p-dim" />;
  });
  return (
    <g>
      <circle cx={cx} cy={cy} r={24} className="cutter" />
      {flutes}
      <path d={d} className={cw ? "p-cut thick" : "p-arc thick"} markerEnd={`url(#f22sp-a-${cw ? "cut" : "arc"})`} />
      <T x={cx} y={30} anchor="middle" cls={cw ? "t-cut t-b t-big t-mono" : "t-arc t-b t-big t-mono"}>{cw ? "M03" : "M04"}</T>
      <T x={cx} y={196} anchor="middle" cls="t-b">{cw ? "w prawo (zgodnie z zegarem)" : "w lewo (przeciwnie)"}</T>
    </g>
  );
}

export function SpindleDir() {
  return (
    <Fig id="f22sp" code="M03 M04" title="Kierunek obrotów — widok od strony wrzeciona" h={212} legend={["cut", "arc"]}
      caption={<>Kierunek ocenia się, patrząc od strony wrzeciona w stronę detalu — na frezarce pionowej z góry. Zwykłe frezy i wiertła prawoskrętne pracują na <b>M03</b>. <b>M05</b> zatrzymuje wrzeciono.</>}>
      {() => (
        <g>
          <Rot cx={95} dir={3} />
          <Rot cx={265} dir={4} />
        </g>
      )}
    </Fig>
  );
}


/* ================= F2.3: posuw na ostrze ================= */
export function ToothFeed() {
  /* Widok z góry, skala przesadzona. Okrąg przerywany — tor poprzedniego ostrza,
     okrąg pełny — tor bieżącego ostrza, przesunięty o fz w kierunku posuwu (+X).
     Grubość wióra h mierzona promieniowo: przy kierunku posuwu h = fz,
     pod kątem θ od niego h ≈ fz · cos θ. */
  const r = 86, d = 28, c1 = { x: 118, y: 136 }, c2 = { x: c1.x + d, y: c1.y };
  const th = (58 * Math.PI) / 180;
  const ux = Math.cos(th), uy = -Math.sin(th);
  const t1 = -d * ux + Math.sqrt(d * d * ux * ux - d * d + r * r);  // punkt na torze poprzedniego ostrza
  const P1 = { x: c2.x + t1 * ux, y: c2.y + t1 * uy }, P2 = { x: c2.x + r * ux, y: c2.y + r * uy };
  const ix = c1.x + d / 2, iy = Math.sqrt(r * r - (d / 2) ** 2);
  const yAe = c2.y - r + 22;
  return (
    <Fig id="f23fz" code="fz" title="fz to przesunięcie, h to grubość wióra" h={262} legend={["cut", "acc"]}
      notes={<Code k="acc">vf = fz · z · n</Code>}
      caption={<>Widok z góry, skala przesadzona. Punkty 1 i 2 to środek freza w chwili pracy dwóch kolejnych ostrzy — dzieli je <b>fz</b>, czyli droga, a nie grubość wióra. Ostrze 2 zbiera sierp materiału między swoim torem a torem ostrza 1. Grubość sierpa <b>h</b> zależy od miejsca: w kierunku posuwu h = fz, w stronę boku freza maleje do zera. Przy małym ae ostrza pracują tylko w pasie nad przerywaną linią, więc największe h jest mniejsze niż fz — to pocienianie wióra.</>}>
      {(c) => (
        <g>
          <path d={`M ${ix} ${c1.y - iy} A ${r} ${r} 0 1 1 ${ix} ${c1.y + iy} A ${r} ${r} 0 0 0 ${ix} ${c1.y - iy} Z`} className="p-fill-acc" />
          <circle cx={c1.x} cy={c1.y} r={r} className="p-cons" />
          <circle cx={c2.x} cy={c2.y} r={r} className="p-cut" />
          {/* środki i fz */}
          <circle cx={c1.x} cy={c1.y} r={2.6} className="pt" />
          <circle cx={c2.x} cy={c2.y} r={2.6} className="pt" />
          <line x1={c1.x} y1={c1.y + 14} x2={c2.x} y2={c2.y + 14} className="p-acc" markerStart={c.a("acc")} markerEnd={c.a("acc")} />
          <T x={(c1.x + c2.x) / 2} y={c1.y + 30} anchor="middle" cls="t-acc t-b t-mono">fz</T>
          <T x={c1.x} y={c1.y - 9} anchor="middle" cls="t-mut t-mono">1</T>
          <T x={c2.x} y={c2.y - 9} anchor="middle" cls="t-mono">2</T>
          {/* h w kierunku posuwu = fz */}
          <line x1={c1.x + r} y1={c1.y} x2={c2.x + r} y2={c2.y} className="p-acc thick" />
          <T x={c2.x + r + 6} y={c2.y + 4} cls="t-acc t-b">h = fz</T>
          {/* h pod kątem — mniejsze */}
          <line x1={P1.x} y1={P1.y} x2={P2.x} y2={P2.y} className="p-acc thick" />
          <T x={P2.x + 6} y={P2.y - 2} cls="t-acc t-b">h &lt; fz</T>
          {/* granica małego ae */}
          <line x1={c2.x - 30} y1={yAe} x2={c2.x + r + 70} y2={yAe} className="p-cons" strokeDasharray="5 4" />
          <T x={c2.x + r + 70} y={yAe + 14} anchor="end" cls="t-mut t-sm">granica małego ae</T>
          {/* kierunek posuwu */}
          <line x1={c2.x + r + 14} y1={c2.y + 60} x2={c2.x + r + 84} y2={c2.y + 60} className="p-cut thick" markerEnd={c.a("cut")} />
          <T x={c2.x + r + 49} y={c2.y + 52} anchor="middle" cls="t-cut t-b">posuw vf</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= F2.4: chłodziwo ================= */
export function Coolant() {
  const panel = (x0: number, through: boolean) => (
    <g>
      <rect x={x0 + 50} y={20} width={60} height={44} className="spindle" />
      <rect x={x0 + 66} y={64} width={28} height={18} className="holder" />
      <rect x={x0 + 74} y={82} width={12} height={56} className="cutter" />
      <rect x={x0 + 10} y={150} width={150} height={36} className="solid-hatch" />
      {through ? <>
        <line x1={x0 + 80} y1={24} x2={x0 + 80} y2={136} className="cool-in" />
        {[-14, -6, 6, 14].map((dx) => <line key={dx} x1={x0 + 80} y1={140} x2={x0 + 80 + dx * 1.6} y2={150} className="cool-jet" />)}
      </> : <>
        <path d={`M ${x0 + 8} 70 L ${x0 + 40} 88 L ${x0 + 46} 98`} className="cool-pipe" />
        {[0, 1, 2, 3].map((k) => <line key={k} x1={x0 + 48} y1={100 + k * 2} x2={x0 + 72} y2={128 + k * 5} className="cool-jet" />)}
      </>}
      <T x={x0 + 85} y={206} anchor="middle" cls="t-b">{through ? "przez wrzeciono" : "zalewowe — M08"}</T>
      <T x={x0 + 85} y={220} anchor="middle" cls="t-mut t-sm">{through ? "kod zależy od maszyny" : "dysza obok narzędzia"}</T>
    </g>
  );
  return (
    <Fig id="f24cl" code="M08" title="Chłodziwo zalewowe i przez wrzeciono" h={232}
      caption={<>Chłodziwo zalewowe podaje dysza z zewnątrz. Chłodziwo przez wrzeciono płynie kanałami w narzędziu prosto do ostrza — przydaje się przy głębokich otworach.</>}>
      {() => <g>{panel(4, false)}{panel(184, true)}</g>}
    </Fig>
  );
}

/* ================= F2.3: posuwy w programie płytki — widok z góry =================
   Frez Ø10. Krok 1: zejście w X−20 Y10, obok płytki (w powietrzu), F150.
   Krok 2: dojazd do X−5 — krawędź freza styka się z bokiem płytki X0, F400.
   Krok 3: kontur w górę do Y55 — F400 działa dalej (modalne). */
export function PlateFeeds() {
  const R: [number, number, number, number] = [-32, 88, -8, 62];
  const m = mapper(R, [10, 8, 340, 214]);
  const r = 5;
  const Step = ({ x, y, n }: { x: number; y: number; n: number }) => (
    <g><circle cx={x} cy={y} r={8} className="step" /><text x={x} y={y + 3.8} textAnchor="middle" className="step-n">{n}</text></g>
  );
  return (
    <Fig id="f23pf" code="F" title="Gdzie który posuw — płytka z góry" h={240} legend={["cut", "stock"]}
      notes={<><Code k="cut">1  G01 Z-5. F150</Code><Code k="cut">2  G01 X-5. F400</Code><Code k="cut">3  G01 Y55.</Code></>}
      caption={<>1 — frez Ø10 schodzi na Z−5 w X−20, obok płytki: w powietrzu, z mniejszym posuwem przyjętym w kursie. 2 — dojazd do X−5: krawędź freza staje przy boku płytki w X0, a od następnego ruchu skrawa obwód freza — dlatego F400 pada już w tym bloku. 3 — dalszy kontur: F400 działa dalej, bo F jest modalne.</>}>
      {(c) => (
        <g>
          <rect x={m.X(0)} y={m.Y(50)} width={80 * m.u} height={50 * m.u} fill={c.hatch} className="p-con" />
          <T x={m.X(40)} y={m.Y(25) + 4} anchor="middle" cls="t-mut">płytka 80 × 50</T>
          {/* krok 1: zejście w powietrzu */}
          <circle cx={m.X(-20)} cy={m.Y(10)} r={r * m.u} className="tool" />
          <circle cx={m.X(-20)} cy={m.Y(10)} r={2.2} className="pt" />
          <T x={m.X(-20)} y={m.Y(10) + r * m.u + 13} anchor="middle" cls="t-mono t-sm">X−20 Y10</T>
          <Step x={m.X(-20) - 22} y={m.Y(10)} n={1} />
          {/* krok 2: dojazd */}
          <line x1={m.X(-20) + 4} y1={m.Y(10)} x2={m.X(-5) - 3} y2={m.Y(10)} className="p-cut thick" markerEnd={c.a("cut")} />
          <Step x={m.X(-12.5)} y={m.Y(10) - 16} n={2} />
          <circle cx={m.X(-5)} cy={m.Y(10)} r={r * m.u} className="tool" opacity={0.6} />
          {/* krok 3: kontur */}
          <line x1={m.X(-5)} y1={m.Y(10) - 4} x2={m.X(-5)} y2={m.Y(55) + 3} className="p-cut thick" markerEnd={c.a("cut")} />
          <Step x={m.X(-5) - 18} y={m.Y(35)} n={3} />
          <T x={m.X(-5) + 2} y={m.Y(55) - 6} cls="t-mono t-sm">Y55</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= Oś czasu programu (przykłady F2.1, F2.4) ================= */
type Bar = { row: number; x0: number; x1: number; t: string; cls: string };
function Timeline({ rows, bars, ticks, steps }: { rows: string[]; bars: Bar[]; ticks: [number, string][]; steps: [number, number, number][] }) {
  // x w jednostkach 0–100, wiersze co 34 px
  const X = (v: number) => 104 + v * 2.36, Y = (r: number) => 30 + r * 46;
  return (
    <g>
      {rows.map((r, i) => <T key={r} x={96} y={Y(i) + 18} anchor="end" cls="t-mut t-sm">{r}</T>)}
      {bars.map((b, i) => (
        <g key={i}>
          <rect x={X(b.x0)} y={Y(b.row) + 2} width={X(b.x1) - X(b.x0)} height={24} rx={5} className={b.cls} />
          <T x={(X(b.x0) + X(b.x1)) / 2} y={Y(b.row) + 18} anchor="middle" cls="t-sm t-b">{b.t}</T>
        </g>
      ))}
      <line x1={X(0)} y1={Y(rows.length) + 4} x2={X(100)} y2={Y(rows.length) + 4} className="p-cons" />
      {ticks.map(([x, t]) => (
        <g key={t}>
          <line x1={X(x)} y1={Y(rows.length)} x2={X(x)} y2={Y(rows.length) + 8} className="p-cons" />
          <T x={X(x)} y={Y(rows.length) + 22} anchor="middle" cls="t-mono t-sm">{t}</T>
        </g>
      ))}
      {steps.map(([x, r, n]) => <Step key={n} x={X(x)} y={Y(r) - 9} n={n} />)}
    </g>
  );
}

/* ================= F2.1: przykład — dwa narzędzia, magazyn pracuje w tle ================= */
export function ToolTimeline() {
  return (
    <Fig id="f21tl" code="T M06" title="Wymiana i przygotowanie narzędzia w czasie" h={176}
      notes={<><Code k="acc">T1 M06 → T2 → … M05 → M06</Code></>}
      caption={<>Oś pozioma to kolejność bloków programu. 1 — wymiana na T1. 2 — <code>T2</code> obraca magazyn i ustawia nawiertak w pozycji wymiany, podczas gdy frez T1 już skrawa. 3 — po obróbce odjazd i stop wrzeciona. 4 — <code>M06</code> zamienia narzędzia od razu, bez czekania na magazyn.</>}>
      {() => (
        <Timeline rows={["wrzeciono", "magazyn"]}
          bars={[
            { row: 0, x0: 0, x1: 12, t: "M06", cls: "p-fill-acc" },
            { row: 0, x0: 13, x1: 72, t: "T1 frezuje płytkę", cls: "p-fill-cut" },
            { row: 0, x0: 73, x1: 84, t: "M05", cls: "panel-bg" },
            { row: 0, x0: 85, x1: 100, t: "M06", cls: "p-fill-acc" },
            { row: 1, x0: 13, x1: 40, t: "obrót do T2", cls: "panel-bg" },
          ]}
          ticks={[[0, "T1 M06"], [13, "T2"], [73, "M05"], [92, "M06"]]}
          steps={[[6, 0, 1], [13, 1, 2], [78, 0, 3], [92, 0, 4]]} />
      )}
    </Fig>
  );
}

/* ================= F2.4: przykład — kiedy płynie chłodziwo ================= */
export function CoolantTimeline() {
  return (
    <Fig id="f24tl" code="M08 M09" title="Chłodziwo w programie płytki" h={222}
      notes={<><Code k="acc">S2500 M03 → M08 → … → G00 Z5. → M09 → M05</Code></>}
      caption={<>Oś pozioma to kolejność bloków. 1 — obroty. 2 — chłodziwo płynie, zanim frez dojedzie do materiału. 3 — po konturze odjazd w Z. 4 — najpierw M09, potem M05: wrzeciono nie stoi zalane, a ostatnie obroty zrzucają ciecz z narzędzia.</>}>
      {() => (
        <Timeline rows={["wrzeciono", "ruch", "chłodziwo"]}
          bars={[
            { row: 0, x0: 0, x1: 86, t: "obroty M03", cls: "p-fill-acc" },
            { row: 1, x0: 22, x1: 66, t: "najazd i kontur", cls: "p-fill-cut" },
            { row: 2, x0: 10, x1: 76, t: "M08 — ciecz płynie", cls: "p-fill-cut" },
          ]}
          ticks={[[0, "M03"], [10, "M08"], [22, "najazd"], [66, "Z5."], [76, "M09"], [86, "M05"]]}
          steps={[[3, 0, 1], [10, 2, 2], [66, 1, 3], [76, 2, 4]]} />
      )}
    </Fig>
  );
}

/* ================= F2.2: przykład — obroty wyliczone a limit maszyny ================= */
export function SpindleLimit() {
  const W = 230, max = 10000, X = (v: number) => 96 + (v / max) * W;
  const rows: [string, number, string][] = [["stal C45", 2546, "S2500"], ["aluminium", 9549, "S8000"]];
  return (
    <Fig id="f22lm" code="S" title="Wyliczone S a maksimum wrzeciona" h={150}
      notes={<><Code k="acc">stal: S2500 M03</Code><Code k="acc">aluminium: S8000 M03 → vc ≈ 251</Code></>}
      caption={<>Słupek — obroty z wzoru n = 1000 · vc / (π · D) dla freza Ø10. Pionowa kreska — maksimum maszyny 8000 obr/min. Część ponad limitem (czerwona) jest nieosiągalna, więc w programie stoi S8000, a skrawanie idzie z mniejszą vc.</>}>
      {() => (
        <g>
          {rows.map(([n, v, s], i) => {
            const y = 26 + i * 40, cut = Math.min(v, 8000);
            return (
              <g key={n}>
                <T x={88} y={y + 15} anchor="end" cls="t-sm">{n}</T>
                <rect x={X(0)} y={y} width={X(cut) - X(0)} height={22} rx={4} className="p-fill-acc" />
                {v > 8000 && <rect x={X(8000)} y={y} width={X(v) - X(8000)} height={22} rx={4} className="p-fill-bad" />}
                <T x={X(v) + 6} y={y + 15} cls="t-mono t-sm">{v}</T>
                <T x={X(cut) - 6} y={y + 15} anchor="end" cls="t-acc t-b t-mono t-sm">{s}</T>
              </g>
            );
          })}
          <line x1={X(8000)} y1={14} x2={X(8000)} y2={112} className="p-bad" />
          <T x={X(8000)} y={126} anchor="middle" cls="t-bad t-sm t-b">max 8000</T>
        </g>
      )}
    </Fig>
  );
}

export const f2Figs = {
  "f21-change": () => <ToolChange />,
  "f22-dir": () => <SpindleDir />,
  "f23-fz": () => <ToothFeed />,
  "f23-feeds": () => <PlateFeeds />,
  "f24-coolant": () => <Coolant />,
  "f21-time": () => <ToolTimeline />,
  "f22-limit": () => <SpindleLimit />,
  "f24-time": () => <CoolantTimeline />,
};
