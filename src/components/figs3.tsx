import { Code, Fig, Grid, mapper, Pt, T } from "@/components/fig";

/*
  Rysunki kart kodów dodane w paczce Y3 (audyt sekcji Kody G i M, §5.3 — nowe rysunki).
  Styl i kolory z fig.tsx: 360 jednostek szerokości, etykieta 11 px, legenda wg znaczenia.
  Dane rysunków pochodzą z przykładów tych samych kart (frontmatter albo blok kodu obok rysunku).
*/

const rad = (d: number) => (d * Math.PI) / 180;
type P2 = [number, number];
const pts = (a: P2[]) => a.map(([x, y]) => `${x},${y}`).join(" ");

/* ================= G09 / G61 / G64: naroże przy dokładnym zatrzymaniu i w trybie ciągłym =================
   Przykład karty: G61 → G01 X40. → G01 Y30. → G64 → G01 X0. → G01 Y0. (prostokąt 40 × 30 od zera).
   Naroża po blokach X40. i Y30. (G61) — ostre z zatrzymaniem; naroże po X0. (G64) — zaokrąglone.
   Promień zaokrąglenia na rysunku przesadzony (5 mm), wykres posuwu bez skali. */
export function CornerStop() {
  const R: [number, number, number, number] = [-34, 74, -5, 33];
  const m = mapper(R, [10, 4, 340, 146]);
  const r = 5;
  const path = `M ${m.X(0)} ${m.Y(0)} L ${m.X(40)} ${m.Y(0)} L ${m.X(40)} ${m.Y(30)} L ${m.X(r)} ${m.Y(30)}
    A ${r * m.u} ${r * m.u} 0 0 0 ${m.X(0)} ${m.Y(30 - r)} L ${m.X(0)} ${m.Y(0)}`;
  // wykres posuwu wzdłuż drogi: X40 | Y30 | X0 | Y0 (140 mm)
  const gx = (s: number) => 46 + s * 2.1, top = 186, base = 244;
  const v = (f: number) => base - (base - top) * f;
  const prof: P2[] = [
    [0, 0], [4, 1], [36, 1], [40, 0], [44, 1], [66, 1], [70, 0], [74, 1], [106, 1], [110, 0.55], [114, 1], [136, 1], [140, 0],
  ];
  return (
    <Fig id="g61c" code="G09 G61 G64" title="Naroże z zatrzymaniem i bez" h={268}
      legend={[["cut", "tor i posuw (G01)"], ["cons", "naroże z programu"]]}
      notes={<><Code>G61</Code><Code>G64</Code></>}
      caption={<>Przykład karty. Przy <b>G61</b> oś hamuje do zera na końcu bloków X40. i Y30., więc te naroża są ostre. Po <b>G64</b> sterowanie przechodzi do bloku Y0. bez zatrzymania i zaokrągla naroże. Łuk powiększony; jego wielkość zależy od posuwu i sterowania.</>}>
      {(c) => (
        <g>
          <rect x={m.X(0)} y={m.Y(30)} width={40 * m.u} height={30 * m.u} className="panel-bg" />
          <polyline points={pts([[m.X(r), m.Y(30)], [m.X(0), m.Y(30)], [m.X(0), m.Y(30 - r)]])} className="p-cons" />
          <path d={path} className="p-cut thick" />
          <line x1={m.X(14)} y1={m.Y(0)} x2={m.X(24)} y2={m.Y(0)} className="p-cut" markerEnd={c.a("cut")} />
          <line x1={m.X(40)} y1={m.Y(10)} x2={m.X(40)} y2={m.Y(18)} className="p-cut" markerEnd={c.a("cut")} />
          <line x1={m.X(26)} y1={m.Y(30)} x2={m.X(16)} y2={m.Y(30)} className="p-cut" markerEnd={c.a("cut")} />
          <T x={m.X(20)} y={m.Y(0) + 15} anchor="middle" cls="t-mono t-mut">X40.</T>
          <T x={m.X(40) + 8} y={m.Y(15) + 4} cls="t-mono t-mut">Y30.</T>
          <T x={m.X(22)} y={m.Y(30) - 7} anchor="middle" cls="t-mono t-mut">X0.</T>
          <T x={m.X(0) - 8} y={m.Y(12) + 4} anchor="end" cls="t-mono t-mut">Y0.</T>
          <Pt x={m.X(40)} y={m.Y(0)} label="G61: v = 0" pos="e" cls="t-acc t-b" />
          <T x={m.X(40) + 9} y={m.Y(0) + 17} cls="t-mut">naroże ostre</T>
          <Pt x={m.X(40)} y={m.Y(30)} label="G61: v = 0" pos="e" cls="t-acc t-b" />
          <T x={m.X(-1)} y={m.Y(30) - 18} anchor="end" cls="t-acc t-b">G64</T>
          <T x={m.X(-1)} y={m.Y(30) - 5} anchor="end" cls="t-mut">bez zatrzymania</T>
          <Pt x={m.X(0)} y={m.Y(0)} label="start" pos="sw" cls="t-mut" />

          {/* wykres posuwu */}
          <line x1={gx(0)} y1={base} x2={gx(140) + 12} y2={base} className="ax" markerEnd={c.a("dim")} />
          <line x1={gx(0)} y1={base} x2={gx(0)} y2={top - 14} className="ax" markerEnd={c.a("dim")} />
          <T x={gx(0) - 5} y={top - 4} anchor="end" cls="t-ax">F</T>
          <T x={gx(140) + 14} y={base - 6} anchor="end" cls="t-mut">droga</T>
          {[40, 70, 110].map((s) => <line key={s} x1={gx(s)} y1={base} x2={gx(s)} y2={top - 6} className="p-cons" />)}
          {[["X40.", 20], ["Y30.", 55], ["X0.", 90], ["Y0.", 125]].map(([l, s]) => (
            <T key={l} x={gx(+s)} y={base + 15} anchor="middle" cls="t-mono t-mut">{l}</T>
          ))}
          <polyline points={pts(prof.map(([s, f]) => [gx(s), v(f)]))} className="p-cut" />
          <T x={gx(55)} y={v(0) - 5} anchor="middle" cls="t-acc t-b">v = 0</T>
          {[40, 70].map((s) => <circle key={s} cx={gx(s)} cy={base} r={3.2} className="pt" />)}
          <T x={gx(35)} y={top - 6} anchor="middle" cls="t-acc t-b">G61</T>
          <T x={gx(105)} y={top - 6} anchor="middle" cls="t-acc t-b">G64</T>
          <T x={gx(110)} y={v(0.55) + 16} anchor="middle" cls="t-mut">spadek</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= G52: układ lokalny =================
   Blok kodu z artykułu karty: G52 X0. Y0. / X60. Y0. / X60. Y40. + M98 P1001.
   Element z podprogramu narysowany jak w przykładzie karty: rowek X20., potem Y10. od zera. */
export function LocalZero() {
  const R: [number, number, number, number] = [-12, 92, -12, 60];
  const m = mapper(R, [14, 6, 336, 232]);
  const zeros: P2[] = [[0, 0], [60, 0], [60, 40]];
  return (
    <Fig id="g52l" code="G52" title="Trzy zera lokalne, jeden podprogram" h={250}
      legend={[["cut", "rowek z podprogramu O1001"], ["acc", "przesunięcie G52 od zera G54"]]}
      notes={<><Code k="acc">G52 X60. Y0.</Code><Code k="acc">G52 X60. Y40.</Code></>}
      caption={<>Podprogram O1001 jest napisany od zera (tu: rowek X20., potem Y10.). <b>G52</b> przesuwa zero względem G54, więc ten sam podprogram frezuje trzy rowki. <b>G52 X0. Y0.</b> wraca do zera G54.</>}>
      {(c) => (
        <g>
          <Grid m={m} range={R} c={c} minor={10} major={20} />
          {zeros.slice(1).map(([x, y]) => (
            <line key={`v${x}${y}`} x1={m.X(0)} y1={m.Y(0)} x2={m.X(x) - (y ? 5 : 6)} y2={m.Y(y) + (y ? 3.5 : 0)} className="p-acc" markerEnd={c.a("acc")} />
          ))}
          {zeros.map(([x, y], i) => (
            <g key={i}>
              <polyline points={pts([[m.X(x), m.Y(y)], [m.X(x + 20), m.Y(y)], [m.X(x + 20), m.Y(y + 10)]])} className="p-cut thick" markerEnd={c.a("cut")} />
              {i > 0 && <>
                <line x1={m.X(x)} y1={m.Y(y)} x2={m.X(x)} y2={m.Y(y + 9)} className="p-acc" />
                <T x={m.X(x) - 3} y={m.Y(y + 9) - 3} anchor="middle" cls="t-acc t-sm">Y</T>
              </>}
              <Pt x={m.X(x)} y={m.Y(y)} dot="pt" />
            </g>
          ))}
          <T x={m.X(0) + 5} y={m.Y(0) + 16} cls="t-b">W — G54</T>
          <T x={m.X(44)} y={m.Y(0) - 7} anchor="middle" cls="t-mono t-acc t-b">X60. Y0.</T>
          <T x={m.X(60) - 6} y={m.Y(40) - 7} anchor="end" cls="t-mono t-acc t-b">X60. Y40.</T>
          <T x={m.X(20) + 7} y={m.Y(5) + 4} cls="t-mut">O1001</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= G68: obrót układu =================
   Przykład i symulacja karty: rowek X15.–X35. przy G68 X0. Y0. R0. / R60. / R120. */
export function RotationG68() {
  const R: [number, number, number, number] = [-26, 44, -9, 40];
  const m = mapper(R, [10, 6, 340, 232]);
  const angs = [0, 60, 120];
  const at = (rr: number, a: number): P2 => [m.X(rr * Math.cos(rad(a))), m.Y(rr * Math.sin(rad(a)))];
  const arc = (rr: number, a0: number, a1: number) => {
    const [x0, y0] = at(rr, a0), [x1, y1] = at(rr, a1);
    return `M ${x0} ${y0} A ${rr * m.u} ${rr * m.u} 0 0 0 ${x1} ${y1}`;
  };
  return (
    <Fig id="g68r" code="G68" title="Ten sam rowek przy R0., R60. i R120." h={250}
      legend={[["cut", "rowek G01 X35. (od X15.)"], ["acc", "kąt obrotu R"], ["cons", "oś X′ układu obróconego"]]}
      notes={<Code k="acc">G68 X0. Y0. R60.</Code>}
      caption={<>Ten sam blok G01 X35. daje rowek wzdłuż obróconej osi X′. Kąt <b>R</b> liczy się od osi X; dodatni oznacza obrót przeciwnie do wskazówek zegara. Środek obrotu to X0. Y0. z bloku G68.</>}>
      {(c) => (
        <g>
          <Grid m={m} range={R} c={c} ticks={false} />
          {angs.slice(1).map((a) => { const [x, y] = at(40, a); return <line key={a} x1={m.X(0)} y1={m.Y(0)} x2={x} y2={y} className="p-cons" />; })}
          {angs.map((a) => { const [x0, y0] = at(15, a), [x1, y1] = at(35, a); return <line key={a} x1={x0} y1={y0} x2={x1} y2={y1} className="p-cut thick" markerEnd={c.a("cut")} />; })}
          <path d={arc(10, 3, 57)} className="p-acc" markerEnd={c.a("acc")} />
          <path d={arc(19, 3, 117)} className="p-acc" markerEnd={c.a("acc")} />
          <T x={at(10, 30)[0] + 6} y={at(10, 30)[1] + 2} cls="t-mono t-acc t-b">R60.</T>
          <T x={at(19, 92)[0] - 4} y={at(19, 92)[1] - 6} anchor="end" cls="t-mono t-acc t-b">R120.</T>
          {[60, 120].map((a) => { const [x, y] = at(41, a); return <T key={a} x={x + (a === 60 ? 4 : -4)} y={y + 4} anchor={a === 60 ? "start" : "end"} cls="t-mut t-b">X′</T>; })}
          <T x={at(25, 0)[0]} y={at(25, 0)[1] - 8} anchor="middle" cls="t-mono t-mut">R0.</T>
          <Pt x={m.X(15)} y={m.Y(0)} label="X15." pos="s" cls="t-mono t-mut" dot="pt-cut" />
          <Pt x={m.X(35)} y={m.Y(0)} label="X35." pos="s" cls="t-mono t-mut" dot="pt-cut" />
          <Pt x={m.X(0)} y={m.Y(0)} label="X0. Y0." pos="sw" cls="t-mono t-b" />
        </g>
      )}
    </Fig>
  );
}

/* ================= G85 / G86: wyjście z otworu =================
   Blok kodu „Zapis bloku” z artykułu: G99 G85 X30. Y30. Z-25. R2. F80 i G99 G86 X70. … F120.
   Przekrój XZ, średnica otworu przyjęta do rysunku (16 mm). */
export function BoreExit() {
  const R: [number, number, number, number] = [10, 90, -31, 13];
  const m = mapper(R, [10, 14, 340, 222]);
  const holes = [{ x: 30, k: "G85" }, { x: 70, k: "G86" }];
  const hr = 8, zb = -27;
  return (
    <Fig id="g85x" code="G85 G86" title="Dwa sposoby wyjścia z otworu" h={250}
      legend={[["cut", "ruch na posuwie"], ["rap", "ruch szybki"], ["bad", "możliwa rysa"], "stock"]}
      notes={<><Code>G99 G85 X30. Y30. Z-25. R2. F80</Code><Code>G99 G86 X70. Y30. Z-25. R2. F120</Code></>}
      caption={<>Oba cykle wchodzą do Z−25 na posuwie. <b>G85</b> wyjeżdża też na posuwie, przy obracającym się wrzecionie. <b>G86</b> zatrzymuje wrzeciono na dnie i wyjeżdża ruchem szybkim do R2; ostrze może zostawić rysę na ściance.</>}>
      {(c) => (
        <g>
          <rect x={m.X(12)} y={m.Y(0)} width={76 * m.u} height={30 * m.u} fill={c.hatch} className="p-con" />
          {holes.map((h) => (
            <g key={h.x}>
              <rect x={m.X(h.x - hr)} y={m.Y(0) - 2} width={2 * hr * m.u} height={-zb * m.u + 2} style={{ fill: "var(--panel)" }} />
              <polyline points={pts([[m.X(h.x - hr), m.Y(0)], [m.X(h.x - hr), m.Y(zb)], [m.X(h.x + hr), m.Y(zb)], [m.X(h.x + hr), m.Y(0)]])} className="p-con" fill="none" />
            </g>
          ))}
          <line x1={m.X(12)} y1={m.Y(2)} x2={m.X(88)} y2={m.Y(2)} className="p-cons" />
          <T x={m.X(88)} y={m.Y(2) - 5} anchor="end" cls="t-mono t-acc t-b">R2.</T>
          <line x1={m.X(12)} y1={m.Y(-25)} x2={m.X(88)} y2={m.Y(-25)} className="p-ext" />
          <T x={m.X(88)} y={m.Y(-25) - 4} anchor="end" cls="t-mono t-dim">Z-25.</T>
          {holes.map((h) => {
            const xi = m.X(h.x - 2.2), xo = m.X(h.x + 2.2);
            return (
              <g key={h.k}>
                <T x={m.X(h.x)} y={m.Y(12) - 2} anchor="middle" cls="t-b t-big">{h.k}</T>
                <line x1={xi} y1={m.Y(9)} x2={xi} y2={m.Y(2.6)} className="p-rap" markerEnd={c.a("rap")} />
                <line x1={xi} y1={m.Y(2)} x2={xi} y2={m.Y(-24.4)} className="p-cut" markerEnd={c.a("cut")} />
                {h.k === "G85"
                  ? <line x1={xo} y1={m.Y(-25)} x2={xo} y2={m.Y(1.4)} className="p-cut" markerEnd={c.a("cut")} />
                  : <line x1={xo} y1={m.Y(-25)} x2={xo} y2={m.Y(1.4)} className="p-rap" markerEnd={c.a("rap")} />}
                <line x1={xi} y1={m.Y(-25)} x2={xo} y2={m.Y(-25)} className="p-cut" />
              </g>
            );
          })}
          <line x1={m.X(70 + hr) - 1.5} y1={m.Y(-24)} x2={m.X(70 + hr) - 1.5} y2={m.Y(-1)} className="p-bad thick" />
          <T x={m.X(70 + hr) + 5} y={m.Y(-9)} cls="t-bad t-b">rysa</T>
          <T x={m.X(70 - hr) - 4} y={m.Y(-25) + 4} anchor="end" cls="t-acc t-b">stop wrzeciona</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= G92 a G54 =================
   Artykuł karty „Jak to działa”: G92 X0. Y0. przypisuje zero miejscu, w którym stoi narzędzie;
   G54 to wektor od zera maszyny zapisany w rejestrze. Dwa panele, ten sam detal z rowkiem. */
export function G92vsG54() {
  /** detal 150 × 58 px z rowkiem; (x, y) — lewy dolny narożnik = zero W */
  const part = (x: number, y: number, fill: string) => (
    <g>
      <rect x={x} y={y - 58} width={150} height={58} fill={fill} className="p-con" />
      <line x1={x + 22} y1={y - 18} x2={x + 118} y2={y - 18} className="p-cut thick" />
    </g>
  );
  return (
    <Fig id="g92s" code="G92" title="Zero z rejestru a zero od narzędzia" h={272}
      legend={[["acc", "G54: wektor z rejestru"], ["cut", "rowek tam, gdzie ma być"], ["bad", "rowek przesunięty"], "stock"]}
      notes={<Code k="acc">G92 X0. Y0.</Code>}
      caption={<><b>G54</b> to wektor od zera maszyny M zapisany w rejestrze: zero W nie zależy od tego, gdzie stoi narzędzie. <b>G92 X0. Y0.</b> ustawia zero tam, gdzie narzędzie stoi w chwili tego bloku. Inne miejsce startu przesuwa całą obróbkę.</>}>
      {(c) => (
        <g>
          {/* panel G54 */}
          <rect x={4} y={4} width={352} height={124} rx={6} className="panel-bg" />
          <T x={14} y={22} cls="t-b t-big">G54</T>
          {part(176, 102, c.hatch)}
          <Pt x={34} y={44} label="M" pos="ne" />
          <line x1={34} y1={44} x2={172} y2={100} className="p-acc" markerEnd={c.a("acc")} />
          <T x={92} y={58} cls="t-acc t-b">rejestr G54</T>
          <circle cx={262} cy={28} r={7} className="tool" />
          <T x={274} y={32} cls="t-mut">narzędzie</T>
          <Pt x={176} y={102} label="W" pos="sw" cls="t-acc t-b" />

          {/* panel G92 */}
          <rect x={4} y={140} width={352} height={128} rx={6} className="panel-bg" />
          <T x={14} y={158} cls="t-b t-big">G92 X0. Y0.</T>
          {part(176, 240, c.hatch)}
          <line x1={212} y1={212} x2={308} y2={212} className="p-bad thick" />
          <circle cx={176} cy={240} r={7} className="tool" />
          <Pt x={176} y={240} label="W" pos="sw" cls="t-acc t-b" />
          <circle cx={190} cy={230} r={7} className="tool" style={{ stroke: "var(--red)" }} />
          <Pt x={190} y={230} dot="pt" />
          <line x1={185} y1={224} x2={150} y2={196} className="p-ext" />
          <T x={14} y={186} cls="t-bad t-b">narzędzie stało obok:</T>
          <T x={14} y={200} cls="t-bad">zero i rowek przesunięte</T>
          <T x={14} y={232} cls="t-mut">narzędzie w narożniku:</T>
          <T x={14} y={246} cls="t-mut">rowek na miejscu</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= osie A, B, C wg ISO 841 =================
   ISO 841: dodatnie A, B, C — w kierunku, w którym prawoskrętna śruba posuwa się w +X, +Y, +Z;
   norma opisuje ruch narzędzia względem nieruchomego detalu; ruch detalu oznacza litera z primem,
   o kierunku dodatnim przeciwnym (C′). */
export function RotaryAxes() {
  const O = { x: 110, y: 178 };
  const C = Math.cos(rad(35)), S = Math.sin(rad(35)), k = 0.72;
  type V = [number, number, number];
  const P = (x: number, y: number, z: number, d: P2 = [0, 0]): P2 => [O.x + d[0] + x + C * y * k, O.y + d[1] - S * y * k - z];
  /** łuk wokół osi: środek ce, obrót od u do v = kierunek dodatni (prawa dłoń) */
  const ring = (ce: V, u: V, v: V, r: number, t0: number, t1: number, d: P2 = [0, 0]) => {
    const p: P2[] = [], st = t1 > t0 ? 5 : -5;
    for (let t = t0; st > 0 ? t <= t1 : t >= t1; t += st) {
      const q = [0, 1, 2].map((i) => ce[i] + u[i] * r * Math.cos(rad(t)) + v[i] * r * Math.sin(rad(t))) as V;
      p.push(P(...q, d));
    }
    return `M ${p.map(([x, y]) => `${x} ${y}`).join(" L ")}`;
  };
  const X: V = [1, 0, 0], Y: V = [0, 1, 0], Z: V = [0, 0, 1], o: V = [0, 0, 0];
  const ex = P(185, 0, 0), ey = P(0, 190, 0), ez = P(0, 0, 150);
  const cA = P(140, 0, 0), cC = P(0, 0, 118);
  const dT: P2 = [-40, 48]; // stół obrotowy w lewym dolnym rogu
  const cT = P(0, 0, 0, dT);
  return (
    <Fig id="abc" code="A B C" title="Dodatnie obroty wg ISO 841" h={262}
      legend={[["acc", "kierunek dodatni wg normy"], ["dim", "ruch stołu C′"]]}
      caption={<>Kciuk prawej dłoni wzdłuż +X, +Y albo +Z: palce zginają się w stronę +A, +B, +C. Norma opisuje ruch narzędzia względem detalu. Gdy obraca się stół, jego dodatni ruch C′ jest przeciwny. Kierunki na maszynie sprawdź w dokumentacji.</>}>
      {(c) => (
        <g>
          {[ex, ey, ez].map(([x, y], i) => <line key={i} x1={O.x} y1={O.y} x2={x} y2={y} className="p-con thick" markerEnd={c.a("con")} />)}
          <T x={ex[0] + 6} y={ex[1] + 5} cls="t-b t-big">+X</T>
          <T x={ey[0] + 6} y={ey[1] + 2} cls="t-b t-big">+Y</T>
          <T x={ez[0] + 8} y={ez[1] + 6} cls="t-b t-big">+Z</T>
          <path d={ring([140, 0, 0], Y, Z, 22, 20, 320)} className="p-acc thick" markerEnd={c.a("acc")} />
          <path d={ring([0, 100, 0], Z, X, 20, 20, 320)} className="p-acc thick" markerEnd={c.a("acc")} />
          <path d={ring([0, 0, 118], X, Y, 24, 20, 320)} className="p-acc thick" markerEnd={c.a("acc")} />
          <T x={cA[0]} y={cA[1] + 44} anchor="middle" cls="t-acc t-b t-big">+A</T>
          <T x={cA[0]} y={cA[1] + 58} anchor="middle" cls="t-mut">wokół X</T>
          <T x={124} y={96} cls="t-acc t-b t-big">+B</T>
          <T x={148} y={96} cls="t-mut">wokół Y</T>
          <T x={cC[0] - 32} y={cC[1] - 2} anchor="end" cls="t-acc t-b t-big">+C</T>
          <T x={cC[0] - 32} y={cC[1] + 12} anchor="end" cls="t-mut">wokół Z</T>
          <Pt x={O.x} y={O.y} />

          {/* stół obrotowy: +C (narzędzie względem detalu) i +C′ (ruch stołu, przeciwnie) */}
          <path d={ring(o, X, Y, 34, 0, 360, dT)} className="panel-bg" />
          <path d={ring(o, X, Y, 24, 210, 330, dT)} className="p-acc" markerEnd={c.a("acc")} />
          <path d={ring(o, X, Y, 42, 330, 210, dT)} className="p-dim" markerEnd={c.a("dim")} />
          <T x={cT[0]} y={cT[1] - 2} anchor="middle" cls="t-mut">stół</T>
          <T x={cT[0] + 30} y={cT[1] + 2} cls="t-acc t-b">+C</T>
          <T x={cT[0] - 54} y={cT[1] + 26} anchor="start" cls="t-dim t-b">+C′</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= G68.2 + G53.1: płaszczyzna pochylona (3+2) =================
   Przykład karty: G68.2 X15. Y0. Z0. I90. J30. K-90. = 30° wokół +Y (Euler Z, nowa X, nowa Z),
   detal 60 × 60 × 40, zero na środku górnej powierzchni; przejścia frezu Ø16 w X′4. i X′13.
   Przekrój XZ (widok od −Y): obrót dodatni wokół +Y pochyla Z′ w stronę +X.
   Rysunek w układzie detalu: obrót stołu wygląda jak pochylenie narzędzia. */
export function TiltPlane() {
  const R: [number, number, number, number] = [-31, 56, -21, 34];
  const m = mapper(R, [8, 6, 344, 232]);
  const a = rad(30);
  const ux: P2 = [Math.cos(a), -Math.sin(a)], uz: P2 = [Math.sin(a), Math.cos(a)];
  const o: P2 = [15, 0];
  const pl = (xp: number, zp: number): P2 => [o[0] + ux[0] * xp + uz[0] * zp, o[1] + ux[1] * xp + uz[1] * zp];
  const M = ([x, z]: P2): P2 => [m.X(x), m.Y(z)];
  const zc = -15 * Math.tan(a);
  const tip = pl(13, 0);
  const tool = [pl(5, 0), pl(21, 0), pl(21, 24), pl(5, 24)].map(M);
  const [ox, oy] = M(o);
  const arcR = 13 * m.u;
  return (
    <Fig id="g682" code="G68.2 G53.1" title="Skos 30° i oś narzędzia" h={250}
      legend={[["allow", "skos do zdjęcia"], ["acc", "osie płaszczyzny X′ Z′"], ["bad", "oś narzędzia bez G53.1"], "stock"]}
      notes={<><Code k="acc">G68.2 X15. Y0. Z0. I90. J30. K-90.</Code><Code k="acc">G53.1</Code></>}
      caption={<>Przekrój XZ przykładu karty. Płaszczyzna zaczyna się w X15. Z0. i jest pochylona o 30° wokół Y. Po <b>G53.1</b> oś narzędzia jest prostopadła do skosu. Rysunek pokazuje układ detalu: obrót stołu wygląda tu jak pochylenie narzędzia.</>}>
      {(c) => (
        <g>
          <polygon points={pts(([[-30, -19], [-30, 0], [15, 0], [30, zc], [30, -19]] as P2[]).map(M))} fill={c.hatch} className="p-con" />
          <polygon points={pts(([[15, 0], [30, 0], [30, zc]] as P2[]).map(M))} className="allow" />
          <line x1={m.X(-32)} y1={m.Y(-19)} x2={m.X(32)} y2={m.Y(-19)} className="break" />
          <T x={m.X(-28)} y={m.Y(-12)} cls="t-mut">detal</T>
          {/* oś narzędzia bez G53.1: pionowa */}
          <line x1={M(tip)[0]} y1={M(tip)[1]} x2={M(tip)[0]} y2={m.Y(30)} className="p-bad" />
          <T x={M(tip)[0] - 4} y={m.Y(30) + 4} anchor="end" cls="t-bad t-b">bez G53.1</T>
          {/* narzędzie po G53.1 */}
          <polygon points={pts(tool)} className="cutter" />
          <line x1={M(tip)[0]} y1={M(tip)[1]} x2={M(pl(13, 30))[0]} y2={M(pl(13, 30))[1]} className="p-cons" />
          <T x={M(pl(21, 12))[0] + 6} y={M(pl(21, 12))[1] + 4} cls="t-b">po G53.1</T>
          {/* osie płaszczyzny */}
          <line x1={ox} y1={oy} x2={M(pl(28, 0))[0]} y2={M(pl(28, 0))[1]} className="p-acc thick" markerEnd={c.a("acc")} />
          <line x1={ox} y1={oy} x2={M(pl(0, 26))[0]} y2={M(pl(0, 26))[1]} className="p-acc thick" markerEnd={c.a("acc")} />
          <T x={M(pl(28, 0))[0] - 2} y={M(pl(28, 0))[1] + 16} anchor="middle" cls="t-acc t-b t-big">X′</T>
          <T x={M(pl(0, 26))[0] - 6} y={M(pl(0, 26))[1] - 2} anchor="end" cls="t-acc t-b t-big">Z′</T>
          <line x1={ox} y1={oy} x2={ox} y2={oy - 16 * m.u} className="p-cons" />
          <path d={`M ${ox} ${oy - arcR} A ${arcR} ${arcR} 0 0 1 ${ox + arcR * Math.sin(a)} ${oy - arcR * Math.cos(a)}`} className="p-acc" />
          <T x={ox + 3} y={oy - arcR - 5} cls="t-acc t-b">30°</T>
          {[4, 13].map((xp) => { const [x, y] = M(pl(xp, 0)); return <circle key={xp} cx={x} cy={y} r={3} className="pt-cut" />; })}
          <T x={M(pl(4, 0))[0] - 4} y={M(pl(4, 0))[1] + 15} anchor="end" cls="t-mono t-mut">X′4.</T>
          <T x={M(pl(13, 0))[0] - 4} y={M(pl(13, 0))[1] + 15} anchor="end" cls="t-mono t-mut">X′13.</T>
          <Pt x={ox} y={oy} label="X15. Z0." pos="nw" cls="t-mono t-b" />
          {/* osie maszyny */}
          <line x1={m.X(-30)} y1={m.Y(24)} x2={m.X(-20)} y2={m.Y(24)} className="ax" markerEnd={c.a("dim")} />
          <line x1={m.X(-30)} y1={m.Y(24)} x2={m.X(-30)} y2={m.Y(33)} className="ax" markerEnd={c.a("dim")} />
          <T x={m.X(-19)} y={m.Y(24) + 4} cls="t-ax">X</T>
          <T x={m.X(-30) + 6} y={m.Y(33) + 4} cls="t-ax">Z</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= G43.4: TCP — blok C90. z TCP i bez =================
   Przykład karty: rowek G01 X28. przy Y28., potem G01 C90. przy G43.4 (wierzchołek stoi).
   Widok z góry w układzie detalu, oś C stołu w zerze G54 (tak liczy symulator).
   Bez TCP stół obraca detal pod nieruchomym narzędziem: wierzchołek zatacza względem detalu
   łuk 90° wokół osi C. Kierunek obrotu na rysunku przyjęty — zależy od maszyny. */
export function TcpC90() {
  const R: [number, number, number, number] = [-48, 48, -34, 46];
  const m = mapper(R, [8, 6, 344, 236]);
  const r = Math.hypot(28, 28);
  const P: P2 = [m.X(28), m.Y(28)], Q: P2 = [m.X(-28), m.Y(28)];
  const rr = r * m.u;
  return (
    <Fig id="g434" code="G43.4" title="Blok C90. z TCP i bez TCP" h={254}
      legend={[["cut", "rowek G01 X28."], ["bad", "tor wierzchołka bez TCP"], ["cons", "oś C i promień"], "stock"]}
      notes={<><Code k="acc">G43.4 H1</Code><Code>G01 C90.</Code></>}
      caption={<>Widok z góry przykładu karty. Przy <b>G43.4</b> blok G01 C90. obraca stół, a X i Y nadążają za punktem P: wierzchołek stoi w miejscu detalu. Bez TCP stół obraca detal pod narzędziem. W 3+2 (G68.2) osie obrotowe stoją podczas skrawania.</>}>
      {(c) => (
        <g>
          <circle cx={m.X(0)} cy={m.Y(0)} r={44 * m.u} className="p-cons" />
          <rect x={m.X(-30)} y={m.Y(30)} width={60 * m.u} height={60 * m.u} fill={c.hatch} className="p-con" />
          <line x1={m.X(-30)} y1={m.Y(28)} x2={P[0] - 3} y2={P[1]} className="p-cut thick" markerEnd={c.a("cut")} />
          <line x1={m.X(0)} y1={m.Y(0)} x2={P[0]} y2={P[1]} className="p-cons" />
          <line x1={m.X(0)} y1={m.Y(0)} x2={Q[0]} y2={Q[1]} className="p-cons" />
          <path d={`M ${P[0]} ${P[1]} A ${rr} ${rr} 0 0 0 ${Q[0] + 3} ${Q[1] - 3}`} className="p-bad thick" markerEnd={c.a("bad")} />
          <path d={`M ${m.X(0) + 9 * m.u * Math.cos(rad(45))} ${m.Y(0) - 9 * m.u * Math.sin(rad(45))} A ${9 * m.u} ${9 * m.u} 0 0 0 ${m.X(0) - 9 * m.u * Math.cos(rad(45))} ${m.Y(0) - 9 * m.u * Math.sin(rad(45))}`} className="p-cons" />
          <T x={m.X(0)} y={m.Y(10) - 4} anchor="middle" cls="t-mut">90°</T>
          <circle cx={P[0]} cy={P[1]} r={5 * m.u} className="tool" />
          <Pt x={P[0]} y={P[1]} dot="pt-cut" />
          <T x={P[0] + 7} y={P[1] - 7} cls="t-b">P</T>
          <T x={m.X(30) + 6} y={P[1] + 26} cls="t-cut t-b">TCP:</T>
          <T x={m.X(30) + 6} y={P[1] + 40} cls="t-mut">wierzchołek</T>
          <T x={m.X(30) + 6} y={P[1] + 54} cls="t-mut">stoi w P</T>
          <Pt x={Q[0]} y={Q[1]} label="P′" pos="sw" cls="t-bad t-b" dot="pt" />
          <T x={m.X(0)} y={m.Y(r) - 10} anchor="middle" cls="t-bad t-b">bez TCP: łuk wokół osi C</T>
          <Pt x={m.X(0)} y={m.Y(0)} label="oś C = zero G54" pos="s" cls="t-mut" />
          <T x={m.X(0)} y={m.Y(-25)} anchor="middle" cls="t-mut t-sm">kierunek obrotu zależy od maszyny</T>
        </g>
      )}
    </Fig>
  );
}
