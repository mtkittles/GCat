import { Code, Dim, Fig, T } from "@/components/fig";

/* Rysunki lekcji wstępnych (moduł P, issue #31 §6): budowa frezarki, zespół narzędziowy, ustawienie. */

/* ================= P.1 — frezarka pionowa: co się obraca, co przesuwa ================= */
export function MillMachine() {
  return (
    <Fig id="p1mill" code="XYZ" title="Frezarka pionowa — z czego się składa (widok z przodu)" h={268} legend={["acc", "stock"]}
      notes={<><Code k="con">obraca się: wrzeciono z narzędziem</Code><Code k="acc">przesuwa się: stół w X i Y, wrzeciennik w Z</Code></>}
      caption={<>Wrzeciono obraca narzędzie. Na tej konstrukcji stół z imadłem i detalem jeździ w X (w prawo i w lewo) i w Y (w głąb maszyny), a wrzeciennik po kolumnie w Z. Są też frezarki z ruchomą kolumną albo bramą — program wygląda tak samo, bo opisuje ruch narzędzia względem detalu.</>}>
      {(c) => (
        <g>
          {/* łoże i kolumna */}
          <rect x={40} y={226} width={280} height={18} rx={3} className="clamp" />
          <rect x={250} y={30} width={56} height={196} rx={3} className="holder" />
          {/* wrzeciennik, wrzeciono, oprawka, frez */}
          <rect x={150} y={44} width={104} height={50} rx={4} className="holder" />
          <rect x={176} y={94} width={30} height={22} className="clamp" />
          <rect x={181} y={116} width={20} height={20} className="holder" />
          <rect x={185} y={136} width={12} height={34} className="cutter" />
          <path d="M 170 104 a 22 8 0 1 0 42 0" className="p-acc" fill="none" markerEnd={c.a("acc")} />
          {/* stół, imadło, detal */}
          <rect x={60} y={204} width={240} height={14} className="clamp" />
          <rect x={120} y={186} width={16} height={18} className="holder" />
          <rect x={248} y={186} width={16} height={18} className="holder" />
          <rect x={136} y={176} width={112} height={28} fill={c.hatch} className="p-con" />
          {/* strzałki ruchów */}
          <line x1={44} y1={196} x2={112} y2={196} className="p-acc thick" markerStart={c.a("acc")} markerEnd={c.a("acc")} />
          <T x={46} y={188} cls="t-acc t-b">X</T>
          <circle cx={78} cy={160} r={7} className="p-acc" fill="none" />
          <circle cx={78} cy={160} r={2} className="pt-rap" />
          <T x={90} y={164} cls="t-acc t-b">Y</T>
          <line x1={266} y1={84} x2={266} y2={48} className="p-acc thick" markerEnd={c.a("acc")} />
          <T x={272} y={60} cls="t-acc t-b">Z</T>

          <T x={202} y={38} anchor="middle" cls="t-sm">wrzeciennik</T>
          <T x={278} y={130} anchor="middle" cls="t-sm">kolumna</T>
          <T x={218} y={128} cls="t-sm">oprawka</T>
          <T x={204} y={164} cls="t-sm">frez</T>
          <T x={166} y={100} anchor="end" cls="t-sm t-acc">obrót</T>
          <T x={192} y={194} anchor="middle" cls="t-sm t-b">detal</T>
          <T x={256} y={182} cls="t-sm">imadło</T>
          <T x={60} y={226} cls="t-sm t-mut">stół</T>
          <T x={180} y={258} anchor="middle" cls="t-sm t-mut">łoże</T>
          <T x={96} y={152} cls="t-mut t-sm">w głąb</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= P.2 — zespół narzędziowy: punkt prowadzony a cała bryła ================= */
export function ToolAssembly() {
  return (
    <Fig id="p2asm" code="L Ø" title="Zespół narzędziowy — co ma wymiary, a co prowadzi program" h={262} legend={["acc", "dim"]}
      notes={<><Code k="acc">program prowadzi jeden punkt: czubek na osi</Code><Code k="dim">L — długość od czoła wrzeciona N</Code><Code k="dim">wysięg i Ø decydują o prześwicie</Code></>}
      caption={<>Czoło wrzeciona <b>N</b> to baza, od której mierzy się długość narzędzia <b>L</b>. Program opisuje położenie jednego punktu — czubka na osi narzędzia. Oprawka, chwyt i ostrza mają swoje wymiary, ale współrzędne ich nie opisują: o prześwicie nad dociskiem czy imadłem decyduje cała bryła.</>}>
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
          <T x={188} y={134} cls="t-sm">chwyt</T>
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
      notes={<><Code k="acc">W — X0 Z0 na lewym górnym narożniku</Code><Code k="dim">szczęki od Z−6 w dół</Code><Code k="bad">kontur na Z−8 — frez w szczęce</Code></>}
      caption={<>Płytka 80 × 50 × 20 trzymana w imadle na 14 mm wysokości: górna krawędź szczęk leży 6 mm pod górną powierzchnią, czyli na Z−6. Kontur zewnętrzny frezem Ø12 prowadzi frez tuż obok płytki — nad szczęką. Na głębokości Z−5 zostaje 1 mm zapasu (z lewej). Ten sam kontur na Z−8 przechodzi frezem przez szczękę (z prawej).</>}>
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
