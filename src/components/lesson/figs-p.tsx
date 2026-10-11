import { Code, Dim, Fig, T } from "@/components/fig";

/* Rysunki lekcji wstępnych (moduł P, issue #31 §6): budowa frezarki, zespół narzędziowy, ustawienie. */

/* ================= P.1 — frezarka: dwie budowy, ten sam ruch główny ================= */
function Spindle({ x, y, c }: { x: number; y: number; c: { a: (k: "acc") => string } }) {
  return (
    <g>
      <rect x={x - 11} y={y} width={22} height={14} className="clamp" />
      <rect x={x - 7} y={y + 14} width={14} height={12} className="holder" />
      <rect x={x - 4} y={y + 26} width={8} height={22} className="cutter" />
      <path d={`M ${x - 16} ${y + 6} a 16 6 0 1 0 32 0`} className="p-acc" fill="none" markerEnd={c.a("acc")} />
    </g>
  );
}

export function MillMachine() {
  return (
    <Fig id="p1mill" code="XYZ" title="Frezarka pionowa — dwie budowy, ten sam program" h={250} legend={["acc", "stock"]}
      notes={<><Code k="con">ruch główny: obrót wrzeciona z narzędziem</Code><Code k="acc">A: stół — X i Y, wrzeciennik — Z</Code><Code k="acc">B: stół nieruchomy, stojak — X i Y, wrzeciennik — Z</Code></>}
      caption={<>W obu budowach ruch główny wykonuje wrzeciono z narzędziem. Różnią się ruchy posuwowe: <b>A</b> — frezarka ze stołem krzyżowym, stół przesuwa się w X i Y, wrzeciennik w Z; <b>B</b> — frezarka z ruchomym stojakiem: stół jest nieruchomy, stojak przesuwa się w X i Y, a wrzeciennik w Z. Program jest w obu przypadkach taki sam.</>}>
      {(c) => (
        <g>
          {/* A — stół krzyżowy */}
          <T x={14} y={20} cls="t-b">A — stół krzyżowy</T>
          <rect x={14} y={214} width={156} height={12} rx={2} className="clamp" />
          <rect x={128} y={34} width={30} height={180} rx={2} className="holder" />
          <rect x={70} y={52} width={62} height={34} rx={3} className="holder" />
          <Spindle x={94} y={86} c={c} />
          <rect x={22} y={192} width={130} height={10} className="clamp" />
          <rect x={56} y={170} width={70} height={22} fill={c.hatch} className="p-con" />
          <line x1={24} y1={182} x2={52} y2={182} className="p-acc thick" markerStart={c.a("acc")} markerEnd={c.a("acc")} />
          <T x={30} y={176} cls="t-acc t-b t-sm">X</T>
          <circle cx={36} cy={154} r={6} className="p-acc" fill="none" /><circle cx={36} cy={154} r={1.8} className="pt-rap" />
          <T x={46} y={158} cls="t-acc t-b t-sm">Y</T>
          <line x1={143} y1={88} x2={143} y2={56} className="p-acc thick" markerStart={c.a("acc")} markerEnd={c.a("acc")} />
          <T x={148} y={70} cls="t-acc t-b t-sm">Z</T>
          <T x={101} y={48} anchor="middle" cls="t-sm">wrzeciennik</T>
          <T x={91} y={185} anchor="middle" cls="t-sm t-b">przedmiot</T>
          <T x={22} y={212} cls="t-sm t-mut">stół</T>
          <T x={143} y={124} anchor="middle" cls="t-sm" >stojak</T>

          {/* B — ruchomy stojak */}
          <T x={192} y={20} cls="t-b">B — ruchomy stojak</T>
          <rect x={190} y={214} width={156} height={12} rx={2} className="clamp" />
          <rect x={196} y={192} width={90} height={22} className="clamp" />
          <rect x={214} y={170} width={56} height={22} fill={c.hatch} className="p-con" />
          <T x={242} y={185} anchor="middle" cls="t-sm t-b">przedmiot</T>
          <T x={200} y={210} cls="t-sm t-mut">stół nieruchomy</T>
          <rect x={300} y={34} width={30} height={170} rx={2} className="holder" />
          <rect x={232} y={52} width={72} height={34} rx={3} className="holder" />
          <Spindle x={258} y={86} c={c} />
          <line x1={294} y1={206} x2={338} y2={206} className="p-acc thick" markerStart={c.a("acc")} markerEnd={c.a("acc")} />
          <T x={340} y={200} anchor="end" cls="t-acc t-b t-sm">X</T>
          <circle cx={322} cy={180} r={6} className="p-acc" fill="none" /><circle cx={322} cy={180} r={1.8} className="pt-rap" />
          <T x={332} y={184} cls="t-acc t-b t-sm">Y</T>
          <line x1={315} y1={88} x2={315} y2={56} className="p-acc thick" markerStart={c.a("acc")} markerEnd={c.a("acc")} />
          <T x={320} y={70} cls="t-acc t-b t-sm">Z</T>
          <T x={268} y={48} anchor="middle" cls="t-sm">wrzeciennik</T>
          <line x1={180} y1={30} x2={180} y2={230} className="p-cons" />
        </g>
      )}
    </Fig>
  );
}

/* ================= P.2 — zespół narzędziowy: punkt prowadzony a cała bryła ================= */
export function ToolAssembly() {
  return (
    <Fig id="p2asm" code="L Ø" title="Zespół narzędziowy — wymiary i punkt opisany w programie" h={262} legend={["acc", "dim"]}
      notes={<><Code k="acc">program opisuje czubek na osi narzędzia</Code><Code k="dim">L — od czoła wrzeciona N do czubka</Code><Code k="dim">wysięg i Ø — odstęp od przeszkód</Code></>}
      caption={<>Czoło wrzeciona <b>N</b> to punkt bazowy, od którego mierzy się długość narzędzia <b>L</b>. Program opisuje położenie jednego punktu — czubka na osi narzędzia. Oprawka, część chwytowa i ostrza mają swoje wymiary, ale współrzędne ich nie opisują: o odstępie od docisku czy imadła decyduje cały zespół.</>}>
      {(c) => (
        <g>
          <rect x={120} y={10} width={100} height={46} rx={3} className="holder" />
          <line x1={104} y1={56} x2={236} y2={56} className="p-acc thick" />
          <T x={240} y={60} cls="t-acc t-b">N</T>
          <rect x={136} y={56} width={68} height={40} rx={3} className="clamp" />
          <rect x={156} y={96} width={28} height={16} className="holder" />
          <rect x={160} y={112} width={20} height={44} className="holder" />
          <rect x={160} y={156} width={20} height={58} className="cutter" />
          {[164, 176, 188, 200].map((y) => <line key={y} x1={160} y1={y} x2={180} y2={y + 10} className="p-cons" />)}
          <circle cx={170} cy={214} r={3.4} className="pt-rap" />
          <T x={178} y={230} cls="t-acc t-b t-sm">czubek — punkt z programu</T>
          <Dim c={c} x1={92} y1={56} x2={92} y2={214} label="L" lside={-1} />
          <Dim c={c} x1={250} y1={112} x2={250} y2={214} label="wysięg" lside={1} />
          <Dim c={c} x1={160} y1={246} x2={180} y2={246} label="Ø" />
          <line x1={170} y1={4} x2={170} y2={222} className="p-cons" strokeDasharray="8 3 2 3" />
          <T x={226} y={30} cls="t-sm">wrzeciono</T>
          <T x={210} y={80} cls="t-sm">oprawka</T>
          <T x={188} y={134} cls="t-sm">część chwytowa</T>
          <T x={188} y={186} cls="t-sm">część robocza</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= P.3 — ustawienie: zero, imadło, prześwit ================= */
export function SetupSide() {
  const k = 2.6, X = (x: number) => 74 + x * k, Y = (z: number) => 18 + (46 - z) * k;
  const jaw = (x0: number) => <rect x={X(x0)} y={Y(-6)} width={12 * k} height={22 * k} className="clamp" />;
  return (
    <Fig id="p3set" code="W" title="Płytka w imadle — zero, szczęki i głębokość (widok z przodu)" h={236} legend={["acc", "dim", "stock", "bad"]}
      notes={<><Code k="acc">W — punkt zerowy w lewym górnym narożniku</Code><Code k="dim">szczęki od Z−6 w dół</Code><Code k="bad">kontur na Z−8 przecina szczękę</Code></>}
      caption={<>Płytka 80 × 50 × 20 zamocowana w imadle na wysokości 14 mm: górna krawędź szczęk leży 6 mm pod górną powierzchnią, czyli na Z−6. Przy konturze zewnętrznym frez Ø12 przechodzi tuż obok płytki, nad szczęką. Na głębokości Z−5 zostaje 1 mm odstępu (po lewej). Ten sam kontur na Z−8 przecina szczękę (po prawej).</>}>
      {(c) => (
        <g>
          <rect x={X(-12)} y={Y(-28)} width={104 * k} height={4 * k} className="clamp" />
          {jaw(-12)}{jaw(80)}
          <rect x={X(0)} y={Y(0)} width={80 * k} height={20 * k} fill={c.hatch} className="p-con" />
          <line x1={X(-14)} y1={Y(-6)} x2={X(104)} y2={Y(-6)} className="p-cons" />
          <T x={X(6)} y={Y(-6) - 4} cls="t-mono t-sm t-mut">szczęki od Z−6</T>

          <rect x={X(-12)} y={Y(40)} width={12 * k} height={45 * k} className="cutter" />
          <line x1={X(-6)} y1={Y(44)} x2={X(-6)} y2={Y(-7)} className="p-cons" strokeDasharray="6 3 2 3" />
          <T x={X(-14)} y={Y(-5) + 4} anchor="end" cls="t-mono t-sm t-acc">Z−5</T>

          <rect x={X(80)} y={Y(37)} width={12 * k} height={45 * k} className="cutter" style={{ opacity: .6 }} />
          <rect x={X(80)} y={Y(-6)} width={12 * k} height={2 * k} style={{ fill: "color-mix(in srgb, var(--red) 55%, transparent)", stroke: "var(--red)" }} />
          <T x={X(94)} y={Y(-8) + 4} cls="t-mono t-sm t-bad">Z−8</T>

          <circle cx={X(0)} cy={Y(0)} r={3.4} className="pt-rap" />
          <T x={X(2)} y={Y(0) - 6} cls="t-acc t-b">W</T>
          <Dim c={c} x1={X(40)} y1={Y(0)} x2={X(40)} y2={Y(-20)} label="20" lside={1} />
          <Dim c={c} x1={X(102)} y1={Y(-6)} x2={X(102)} y2={Y(-20)} label="14" lside={1} />
          <T x={X(-6)} y={Y(-28) + 16} anchor="middle" cls="t-sm t-mut">szczęka</T>
          <T x={X(86)} y={Y(-28) + 16} anchor="middle" cls="t-sm t-mut">szczęka</T>
          <T x={X(-6)} y={Y(44) - 4} anchor="middle" cls="t-sm">frez Ø12</T>
        </g>
      )}
    </Fig>
  );
}

export const pFigs = {
  "p1-mill": () => <MillMachine />,
  "p2-assembly": () => <ToolAssembly />,
  "p3-setup": () => <SetupSide />,
};
