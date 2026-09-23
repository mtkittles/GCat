import { Code, Dim, Fig, Grid, mapper, Pt, T } from "./fig";

const deg = (a: number) => (a * Math.PI) / 180;

/* ================= G00: tor wypadkowy ================= */
export function RapidPath() {
  const R: [number, number, number, number] = [-5, 95, -5, 62];
  const m = mapper(R, [28, 10, 322, 226]);
  return (
    <Fig id="rpath" code="G00" title="Dlaczego G00 nie musi jechać po prostej" h={250} legend={["rap", "cons"]}
      notes={<Code k="rap">G00 X80 Y50</Code>}
      caption={<>Każda oś rusza ze swoją maksymalną prędkością. Krótsza droga kończy się pierwsza i dalej jedzie już jedna oś. Część sterowań ma parametr wymuszający G00 po prostej — <b>nie zakładaj tego bez sprawdzenia</b>.</>}>
      {(c) => (
        <g>
          <Grid m={m} range={R} c={c} />
          <line x1={m.X(10)} y1={m.Y(10)} x2={m.X(80)} y2={m.Y(50)} className="p-cons" />
          <T x={m.X(52)} y={m.Y(28)} cls="t-mut">tor „po prostej”</T>
          <polyline points={`${m.X(10)},${m.Y(10)} ${m.X(50)},${m.Y(50)} ${m.X(80)},${m.Y(50)}`} className="p-rap thick" markerEnd={c.a("rap")} />
          <T x={m.X(27)} y={m.Y(33)} anchor="end" cls="t-rap t-b">X i Y razem</T>
          <T x={m.X(65)} y={m.Y(50) - 9} anchor="middle" cls="t-rap t-b">tylko X</T>
          <Pt x={m.X(10)} y={m.Y(10)} label="X10 Y10" pos="se" cls="t-mono t-b" />
          <Pt x={m.X(50)} y={m.Y(50)} dot="pt-rap" />
          <Pt x={m.X(80)} y={m.Y(50)} label="X80 Y50" pos="s" cls="t-mono t-b" />
        </g>
      )}
    </Fig>
  );
}

/* ================= G00: dojazd dookoła zacisku ================= */
export function RapidClamp() {
  const R: [number, number, number, number] = [-5, 105, -5, 82];
  const m = mapper(R, [26, 10, 322, 234]);
  const P1 = { x: 10, y: 10 }, P2 = { x: 90, y: 70 };
  return (
    <Fig id="rclamp" code="G00" title="Dojazd na skos kontra dwa ruchy" h={258} legend={["rap", "bad"]}
      notes={<><Code k="bad">G00 X90 Y70</Code><Code k="rap">G00 X90</Code><Code k="rap">G00 Y70</Code></>}
      caption={<>Ten sam punkt docelowy. Ruch na skos przechodzi przez zacisk. Rozbicie na dwa bloki prowadzi wzdłuż osi, poza przeszkodą — czas przejazdu jest podobny.</>}>
      {(c) => (
        <g>
          <Grid m={m} range={R} c={c} ticks={false} />
          <rect x={m.X(40)} y={m.Y(54)} width={22 * m.u} height={26 * m.u} className="p-fill-bad" />
          <T x={m.X(51)} y={m.Y(54) - 6} anchor="middle" cls="t-bad t-b">zacisk</T>
          <line x1={m.X(P1.x)} y1={m.Y(P1.y)} x2={m.X(P2.x)} y2={m.Y(P2.y)} className="p-bad" markerEnd={c.a("bad")} />
          <path d={`M ${m.X(44) - 6} ${m.Y(35.5) - 6} l 12 12 M ${m.X(44) + 6} ${m.Y(35.5) - 6} l -12 12`} className="p-bad thick" />
          <polyline points={`${m.X(P1.x)},${m.Y(P1.y)} ${m.X(P2.x)},${m.Y(P1.y)} ${m.X(P2.x)},${m.Y(P2.y)}`} className="p-rap thick" markerEnd={c.a("rap")} />
          <T x={m.X(50)} y={m.Y(10) + 16} anchor="middle" cls="t-mono t-rap t-b">G00 X90</T>
          <T x={m.X(90) - 8} y={m.Y(40)} anchor="end" cls="t-mono t-rap t-b">G00 Y70</T>
          <Pt x={m.X(P1.x)} y={m.Y(P1.y)} label="P1" pos="w" />
          <Pt x={m.X(P2.x)} y={m.Y(P2.y)} label="P2" pos="e" />
        </g>
      )}
    </Fig>
  );
}

/* ================= G01: posuw dzielony na osie ================= */
export function Linear() {
  const R: [number, number, number, number] = [-5, 85, -5, 52];
  const m = mapper(R, [28, 10, 322, 216]);
  const A = { x: 10, y: 10 }, B = { x: 70, y: 40 };
  return (
    <Fig id="lin" code="G01" title="Ruch po prostej z posuwem F" h={242} legend={["cut", "dim", "acc"]}
      notes={<><Code>G01 X70 Y40 F400</Code><Code k="acc">X: 358 mm/min</Code><Code k="acc">Y: 179 mm/min</Code></>}
      caption={<>F to prędkość <b>wzdłuż toru</b>. Sterowanie dzieli ją między osie proporcjonalnie do drogi, więc obie kończą ruch w tej samej chwili, a tor jest prosty.</>}>
      {(c) => (
        <g>
          <Grid m={m} range={R} c={c} />
          <line x1={m.X(A.x)} y1={m.Y(A.y)} x2={m.X(B.x)} y2={m.Y(B.y)} className="p-cut thick draw" pathLength={1} markerEnd={c.a("cut")} />
          <Dim x1={m.X(A.x)} y1={m.Y(A.y)} x2={m.X(B.x)} y2={m.Y(A.y)} off={-16} label="ΔX = 60" c={c} lside={1} />
          <Dim x1={m.X(B.x)} y1={m.Y(A.y)} x2={m.X(B.x)} y2={m.Y(B.y)} off={12} label="ΔY = 30" c={c} lside={1} />
          <T x={m.X(36)} y={m.Y(30)} anchor="middle" cls="t-mono t-acc t-b">F400 wzdłuż toru</T>
          <Pt x={m.X(A.x)} y={m.Y(A.y)} label="start" pos="nw" />
          <Pt x={m.X(B.x)} y={m.Y(B.y)} label="X70 Y40" pos="nw" cls="t-mono t-b" />
        </g>
      )}
    </Fig>
  );
}

/* ================= tokarka: X jest średnicą ================= */
export function DiaX() {
  const zx = (v: number) => 290 + v * 3.6, xx = (v: number) => 125 - v * 4;
  return (
    <Fig id="dia" code="X" title="Tokarka: X to średnica, nie promień" h={250} legend={["con", "dim", "acc"]}
      notes={<Code k="acc">G01 X40</Code>}
      caption={<>Ostrze stoi 20 mm od osi obrotu, ale w programie piszesz <b>X40</b> — sterowanie liczy średnicowo. Adresy <b>I</b> i <b>R</b> łuków pozostają promieniowe.</>}>
      {(c) => (
        <g>
          <rect x={zx(-60)} y={xx(20)} width={zx(0) - zx(-60)} height={xx(-20) - xx(20)} fill={c.hatch} className="p-con" />
          <line x1={zx(-66)} y1={xx(0)} x2={zx(12)} y2={xx(0)} className="axis-c" />
          <T x={zx(-56)} y={xx(0) + 15} cls="t-mut">oś obrotu (X0)</T>
          <T x={zx(12)} y={xx(0) + 14} anchor="end" cls="t-ax">Z</T>
          <path d={`M ${zx(-8)} ${xx(20)} l 10 -16 l 20 0 l -6 16 z`} className="cutter" />
          <Pt x={zx(-8)} y={xx(20)} dot="pt-cut" />
          <Dim x1={zx(0)} y1={xx(0)} x2={zx(0)} y2={xx(20)} off={16} label="r = 20" c={c} lside={1} />
          <Dim x1={zx(-60)} y1={xx(-20)} x2={zx(-60)} y2={xx(20)} off={-22} label="Ø40" c={c} lside={1} cls="t-mono t-acc t-b" />
          <T x={zx(-30)} y={xx(-8)} anchor="middle" cls="t-b">detal</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= G96: obroty rosną, gdy średnica maleje ================= */
export function ConstVc() {
  const x0 = 46, x1 = 340, y0 = 212, y1 = 18;
  const D0 = 0, D1 = 100, N1 = 8000;
  const sx = (d: number) => x0 + ((d - D0) / (D1 - D0)) * (x1 - x0);
  const sy = (n: number) => y0 - (n / N1) * (y0 - y1);
  const n = (d: number) => (200 * 1000) / (Math.PI * d);
  const pts = (from: number, to: number) => { const r: string[] = []; for (let d = from; d <= to + 1e-6; d += 0.5) r.push(`${sx(d)},${sy(Math.min(n(d), N1))}`); return r.join(" "); };
  const dClamp = (200 * 1000) / (Math.PI * 3000); // ≈ 21,2 mm
  return (
    <Fig id="vc96" code="G96 G50" title="Stała prędkość skrawania: obroty zależą od średnicy" h={250} legend={["cut", "bad", "acc", "cons"]}
      notes={<><Code k="acc">G50 S3000</Code><Code>G96 S200</Code><Code k="rap">G97 S1500</Code></>}
      caption={<>Przy <b>G96 S200</b> sterowanie trzyma Vc = 200 m/min, więc obroty rosną, gdy nóż zbliża się do osi: n = 1000·Vc / (π·D). <b>G50 S3000</b> obcina je na 3000 obr/min — poniżej Ø21 prędkość skrawania już spada.</>}>
      {(c) => (
        <g>
          {[0, 2000, 4000, 6000, 8000].map((v) => <g key={v}><line x1={x0} y1={sy(v)} x2={x1} y2={sy(v)} className="gr-maj" /><T x={x0 - 4} y={sy(v) + 3.5} anchor="end" cls="t-tick">{v}</T></g>)}
          {[20, 40, 60, 80, 100].map((v) => <g key={v}><line x1={sx(v)} y1={y0} x2={sx(v)} y2={y1} className="gr-min" /><T x={sx(v)} y={y0 + 12} anchor="middle" cls="t-tick">{v}</T></g>)}
          <line x1={x0} y1={y0} x2={x1 + 6} y2={y0} className="ax" markerEnd={c.a("dim")} />
          <line x1={x0} y1={y0} x2={x0} y2={y1 - 6} className="ax" markerEnd={c.a("dim")} />
          <T x={x1} y={y0 + 26} anchor="end" cls="t-ax">średnica D [mm]</T>
          <T x={x0 + 6} y={y1 + 2} cls="t-ax">obr/min</T>
          <polyline points={pts(8, dClamp)} className="p-bad" />
          <polyline points={pts(dClamp, 100)} className="p-cut thick draw" pathLength={1} />
          <line x1={sx(0)} y1={sy(3000)} x2={sx(dClamp)} y2={sy(3000)} className="p-acc thick" />
          <line x1={x0} y1={sy(1500)} x2={x1} y2={sy(1500)} className="p-rap" />
          <T x={sx(dClamp) + 6} y={sy(3000) - 6} cls="t-acc t-b t-mono">limit G50 S3000</T>
          <T x={sx(2)} y={sy(1500) + 14} cls="t-rap t-mono">G97 S1500 — stałe obroty</T>
          <T x={sx(12)} y={sy(7400)} cls="t-bad">bez limitu</T>
          <T x={sx(46)} y={sy(1900)} cls="t-cut t-b">G96 S200</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= G54–G59: przesunięcie bazy ================= */
export function WorkOffset() {
  const R: [number, number, number, number] = [-300, 24, -236, 24];
  const m = mapper(R, [14, 8, 332, 230]);
  const W1 = { x: -250, y: -180 }, W2 = { x: -140, y: -180 };
  return (
    <Fig id="wo" code="G54 G55" title="Zero maszyny i zera detali" h={250} legend={["acc", "dim", "stock"]}
      caption={<><b>M</b> to zero maszyny — stałe. <b>G54</b> i <b>G55</b> przechowują wektory od M do zera każdego detalu. Program pisany od zera detalu działa w obu miejscach bez zmian.</>}>
      {(c) => (
        <g>
          <rect x={m.X(-290)} y={m.Y(-40)} width={270 * m.u} height={190 * m.u} className="panel-bg" />
          <T x={m.X(-286)} y={m.Y(-40) + 14} cls="t-mut">stół</T>
          {[W1, W2].map((w, i) => (
            <g key={i}>
              <rect x={m.X(w.x)} y={m.Y(w.y + 50)} width={80 * m.u} height={50 * m.u} fill={c.hatch} className="p-con" />
              <line x1={m.X(0)} y1={m.Y(0)} x2={m.X(w.x) + 4} y2={m.Y(w.y) - 3} className="p-acc" markerEnd={c.a("acc")} />
              <Pt x={m.X(w.x)} y={m.Y(w.y)} label={i === 0 ? "W1 — G54" : "W2 — G55"} pos="sw" cls="t-acc t-b" />
            </g>
          ))}
          <Dim x1={m.X(0)} y1={m.Y(W1.y)} x2={m.X(W1.x)} y2={m.Y(W1.y)} off={-22} label="G54 X−250" c={c} lside={-1} />
          <Dim x1={m.X(0)} y1={m.Y(0)} x2={m.X(0)} y2={m.Y(W1.y)} off={-10} label="Y−180" c={c} lside={-1} />
          <Pt x={m.X(0)} y={m.Y(0)} label="M — zero maszyny" pos="sw" />
        </g>
      )}
    </Fig>
  );
}

/* ================= G72: planowanie zgrubne ================= */
export function LatheFace() {
  const zx = (v: number) => 262 + v * 16, xx = (v: number) => 230 - v * 4.9;
  const prof: [number, number][] = [[-2, 0], [-2, 12], [-8, 12], [-8, 40]];
  return (
    <Fig id="g72" code="G72" title="Planowanie zgrubne warstwami wzdłuż osi X" h={250} legend={["cut", "rap", "con", "dim"]}
      caption={<>Nóż zbiera materiał z czoła przejściami poprzecznymi, każde głębsze o <b>W</b> w osi Z. Ostatnią warstwę wzdłuż konturu zostawia na <b>G70</b>.</>}>
      {(c) => (
        <g>
          <line x1={zx(-12)} y1={xx(0)} x2={zx(4)} y2={xx(0)} className="axis-c" />
          <T x={zx(4)} y={xx(0) + 14} anchor="end" cls="t-ax">Z</T>
          <rect x={zx(-12)} y={xx(41)} width={zx(0) - zx(-12)} height={xx(0) - xx(41)} className="stock-out" />
          <polygon points={[`${zx(-12)},${xx(0)}`, ...prof.map(([z, r]) => `${zx(z)},${xx(r)}`), `${zx(-12)},${xx(40)}`].join(" ")} fill={c.hatch} className="p-con" />
          {[{ z: -2, to: 0.2 }, { z: -4, to: 12.4 }, { z: -6, to: 12.4 }, { z: -8, to: 12.4 }].map((p, i) => (
            <g key={p.z}>
              <line x1={zx(p.z + 0.15)} y1={xx(43)} x2={zx(p.z + 0.15)} y2={xx(p.to + 0.6)} className="p-cut" markerEnd={i === 0 ? c.a("cut") : undefined} />
              <line x1={zx(p.z + 0.15)} y1={xx(p.to + 0.6)} x2={zx(p.z + 0.15) + 6} y2={xx(p.to + 0.6) - 6} className="p-rap" />
            </g>
          ))}
          <Dim x1={zx(-2)} y1={xx(44.5)} x2={zx(-4)} y2={xx(44.5)} label="W" c={c} lside={-1} cls="t-mono t-acc t-b" />
          <T x={zx(-10)} y={xx(24)} anchor="middle" cls="t-b">detal</T>
          <T x={zx(0) + 6} y={xx(30)} cls="t-mut">półfabrykat</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= G75: rowkowanie ================= */
export function Groove() {
  const zx = (v: number) => 322 + v * 7, xx = (v: number) => 236 - (v - 10) * 14;
  const plunges = [-20, -22.5, -25, -26];
  return (
    <Fig id="g75" code="G75" title="Rowek kilkoma wgłębieniami z łamaniem wióra" h={256} legend={["cut", "rap", "con", "dim"]}
      notes={<><Code k="acc">G75 R0.5</Code><Code>G75 X30 Z−26 P2000 Q2500 F0.08</Code></>}
      caption={<>Nóż wcina się w X krokami <b>P</b>, po każdym cofa o <b>R</b>. Na dnie wraca na średnicę startową, przesuwa się w Z o <b>Q</b> i powtarza. Q mniejsze od szerokości płytki daje ciągłe dno.</>}>
      {(c) => (
        <g>
          <polygon points={[[-40, 21], [-27.5, 21], [-27.5, 15], [-18.5, 15], [-18.5, 21], [0, 21], [0, 10.4], [-40, 10.4]].map(([z, r]) => `${zx(z)},${xx(r)}`).join(" ")} fill={c.hatch} className="p-con" />
          <line x1={zx(-42)} y1={xx(10.4)} x2={zx(2)} y2={xx(10.4)} className="break" />
          <T x={zx(2)} y={xx(10.4) + 14} anchor="end" cls="t-mut">oś detalu niżej</T>
          {/* pierwsze wgłębienie — krokami */}
          {[[21.5, 19], [19.5, 17], [17.5, 15]].map(([a, b], i) => (
            <g key={i}>
              <line x1={zx(plunges[0]) - i * 3} y1={xx(a)} x2={zx(plunges[0]) - i * 3} y2={xx(b)} className="p-cut thick" markerEnd={c.a("cut")} />
              {i < 2 && <line x1={zx(plunges[0]) - i * 3 - 1.5} y1={xx(b)} x2={zx(plunges[0]) - i * 3 - 1.5} y2={xx(b + 0.5)} className="p-rap" />}
            </g>
          ))}
          {plunges.slice(1).map((z) => <line key={z} x1={zx(z)} y1={xx(21.5)} x2={zx(z)} y2={xx(15)} className="p-cut" markerEnd={c.a("cut")} />)}
          <Dim x1={zx(-16)} y1={xx(21.5)} x2={zx(-16)} y2={xx(19)} off={0} label="P" c={c} lside={-1} cls="t-mono t-acc t-b" />
          <Dim x1={zx(plunges[0])} y1={xx(23)} x2={zx(plunges[1])} y2={xx(23)} label="Q" c={c} lside={-1} cls="t-mono t-acc t-b" />
          <T x={zx(-23)} y={xx(15) + 16} anchor="middle" cls="t-mono t-b">dno Ø30</T>
          <T x={zx(-34)} y={xx(17)} anchor="middle" cls="t-b">detal Ø42</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= G76 (frezarka): wytaczanie dokładne ================= */
export function FineBore() {
  const z = (v: number) => 44 - v * 6;
  const L = 130, Rr = 230;
  return (
    <Fig id="g76m" code="G76" title="Wytaczanie z orientacją i odsunięciem ostrza" h={240} legend={["cut", "rap", "acc", "stock"]}
      caption={<>Na dnie wrzeciono staje w stałej pozycji (<b>M19</b>), ostrze odsuwa się od ścianki o <b>Q</b> i narzędzie wyjeżdża szybkim ruchem, nie rysując otworu.</>}>
      {(c) => (
        <g>
          <line x1={40} y1={z(2)} x2={330} y2={z(2)} className="p-cons" />
          <T x={330} y={z(2) - 5} anchor="end" cls="t-mono t-acc">R</T>
          <rect x={60} y={z(0)} width={L - 60} height={z(-24) - z(0)} fill={c.hatch} className="p-con" />
          <rect x={Rr} y={z(0)} width={300 - Rr} height={z(-24) - z(0)} fill={c.hatch} className="p-con" />
          <line x1={L} y1={z(-24)} x2={Rr} y2={z(-24)} className="p-con" />
          <line x1={218} y1={z(2)} x2={218} y2={z(-20)} className="p-cut thick draw" pathLength={1} markerEnd={c.a("cut")} />
          <rect x={196} y={z(-20) - 6} width={30} height={9} className="holder" />
          <path d={`M 226 ${z(-20) - 6} l 4 4 l -4 5 z`} className="cutter" />
          <line x1={212} y1={z(-20) + 12} x2={200} y2={z(-20) + 12} className="p-acc thick" markerEnd={c.a("acc")} />
          <T x={206} y={z(-20) + 26} anchor="middle" cls="t-mono t-acc t-b">Q</T>
          <line x1={200} y1={z(-20)} x2={200} y2={z(4)} className="p-rap" markerEnd={c.a("rap")} />
          <T x={150} y={z(-8)} anchor="middle" cls="t-mono">M19</T>
          <T x={176} y={z(-8)} cls="t-rap">wyjazd</T>
          <T x={236} y={z(-20) + 4} cls="t-mut">ścianka bez rysy</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= G22: strefa zabroniona ================= */
export function Zone() {
  const R: [number, number, number, number] = [-5, 105, -5, 72];
  const m = mapper(R, [26, 10, 322, 220]);
  return (
    <Fig id="g22" code="G22" title="Strefa zabroniona wokół uchwytu" h={244} legend={["rap", "bad"]}
      notes={<Code k="acc">G22 X20 Y40 Z−50 I55 J65 K20</Code>}
      caption={<>Dwa naroża prostopadłościanu (<b>X Y Z</b> i <b>I J K</b>, układ maszyny) wyznaczają obszar, do którego punkt narzędzia nie może wjechać. Ruch zatrzymuje się z alarmem na granicy.</>}>
      {(c) => (
        <g>
          <Grid m={m} range={R} c={c} ticks={false} />
          <rect x={m.X(20)} y={m.Y(65)} width={35 * m.u} height={25 * m.u} className="p-fill-bad" />
          <T x={m.X(37.5)} y={m.Y(52) + 4} anchor="middle" cls="t-bad t-b">uchwyt</T>
          <Pt x={m.X(20)} y={m.Y(40)} label="X Y Z" pos="sw" cls="t-mono t-acc t-b" dot="pt-rap" />
          <Pt x={m.X(55)} y={m.Y(65)} label="I J K" pos="ne" cls="t-mono t-acc t-b" dot="pt-rap" />
          <line x1={m.X(90)} y1={m.Y(10)} x2={m.X(55)} y2={m.Y(45)} className="p-rap thick" />
          <line x1={m.X(55)} y1={m.Y(45)} x2={m.X(40)} y2={m.Y(60)} className="p-bad" />
          <path d={`M ${m.X(55) - 6} ${m.Y(45) - 6} l 12 12 M ${m.X(55) + 6} ${m.Y(45) - 6} l -12 12`} className="p-bad thick" />
          <T x={m.X(58)} y={m.Y(45) + 14} cls="t-bad t-b">alarm — stop</T>
          <Pt x={m.X(90)} y={m.Y(10)} label="narzędzie" pos="s" />
        </g>
      )}
    </Fig>
  );
}

/* ================= G31: pomiar sondą ================= */
export function Probe() {
  const z = (v: number) => 132 - v * 8;
  const ball = z(0) - 5;
  return (
    <Fig id="g31" code="G31" title="Ruch do styku i zapis pozycji" h={236} legend={["cut", "cons", "acc", "stock"]}
      notes={<><Code>G31 Z−5 F150</Code><Code k="acc">#100 = #5063</Code></>}
      caption={<>Sonda jedzie do <b>Z−5</b>, ale zatrzymuje się w chwili styku. Pozycja z tej chwili trafia do <b>#5063</b> (oś Z). Bez styku blok kończy się w punkcie docelowym — makro musi to sprawdzić.</>}>
      {(c) => (
        <g>
          <rect x={60} y={z(0)} width={240} height={z(-11) - z(0)} fill={c.hatch} className="p-con" />
          <T x={66} y={z(0) - 6} cls="t-mono">Z0 — powierzchnia</T>
          <rect x={198} y={ball - 74} width={32} height={30} className="probe" />
          <line x1={214} y1={ball - 44} x2={214} y2={ball - 5} className="p-con" />
          <circle cx={214} cy={ball} r={5} className="ruby" />
          <line x1={246} y1={z(10)} x2={246} y2={z(0) - 2} className="p-cut thick draw" pathLength={1} markerEnd={c.a("cut")} />
          <line x1={214} y1={z(0)} x2={214} y2={z(-5)} className="p-cons" />
          <Pt x={214} y={z(-5)} label="cel Z−5" pos="e" cls="t-mono t-mut" />
          <Pt x={214} y={z(0)} dot="pt-rap" />
          <T x={254} y={z(0) - 8} cls="t-acc t-b t-mono">styk → #5063</T>
          <T x={254} y={z(10) + 4} cls="t-mono t-mut">ruch G31</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= interpolacja śrubowa: rzut z góry ================= */
export function HelixTop() {
  const R: [number, number, number, number] = [0, 80, 0, 52];
  const m = mapper(R, [26, 10, 322, 222]);
  const cx = 45, cy = 25, r = 20;
  return (
    <Fig id="helix" code="G03 Z" title="Śruba: łuk i jednocześnie ruch w Z" h={246} legend={["arc", "acc"]}
      notes={<><Code k="arc">G03 X25 Y25 Z−2 I20 J0</Code><Code k="arc">G03 X25 Y25 Z−4 I20 J0</Code><Code k="arc">G03 X25 Y25 Z−6 I20 J0</Code></>}
      caption={<>Z góry widać zwykły okrąg, ale każdy blok schodzi o 2 mm w Z. Narzędzie wchodzi w materiał łagodnie, bez wiercenia frezem w pionie.</>}>
      {(c) => (
        <g>
          <Grid m={m} range={R} c={c} ticks={false} />
          <circle cx={m.X(cx)} cy={m.Y(cy)} r={r * m.u} className="p-arc thick draw" pathLength={1} />
          <path d={`M ${m.X(cx - r)} ${m.Y(cy) + 1} A ${r * m.u} ${r * m.u} 0 0 0 ${m.X(cx - r * Math.cos(deg(40)))} ${m.Y(cy - r * Math.sin(deg(40)))}`} className="p-arc thick" markerEnd={c.a("arc")} />
          <line x1={m.X(cx - r)} y1={m.Y(cy)} x2={m.X(cx) - 4} y2={m.Y(cy)} className="p-acc" markerEnd={c.a("acc")} />
          <T x={m.X(cx - r / 2)} y={m.Y(cy) - 7} anchor="middle" cls="t-mono t-acc t-b">I20</T>
          <Pt x={m.X(cx - r)} y={m.Y(cy)} label="start X25 Y25" pos="w" cls="t-mono t-b" />
          <Pt x={m.X(cx)} y={m.Y(cy)} label="środek" pos="se" cls="t-arc" dot="pt-arc" />
          <T x={m.X(cx + r) + 8} y={m.Y(cy) + 4} cls="t-mono t-arc">Z0 → −2 → −4 → −6</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= interpolacja śrubowa: dwa rzuty ================= */
export function HelixViews() {
  const cxT = 86, cyT = 130, rT = 56;
  const zs = (v: number) => 56 + (-v) * 24;        // Z0 → 56, Z−6 → 200
  const xs = (v: number) => 272 + v * 2.8;           // rzut boczny: x od −20 do 20
  const side: string[] = [];
  for (let t = 0; t <= 3.0001; t += 0.02) side.push(`${xs(-20 * Math.cos(Math.PI * 2 * t))},${zs(-2 * t)}`);
  return (
    <Fig id="helixz" code="G02 G03 Z" title="Śruba w dwóch rzutach" h={236} legend={["arc", "dim", "stock"]}
      caption={<>Z góry: jeden okrąg, choć narzędzie okrąża go trzy razy. Z boku: każdy obrót schodzi o 2 mm, trzy obroty dają głębokość 6 mm.</>}>
      {(c) => (
        <g>
          <T x={cxT} y={22} anchor="middle" cls="t-b">z góry (XY)</T>
          <circle cx={cxT} cy={cyT} r={rT} className="p-arc thick draw" pathLength={1} />
          <Pt x={cxT} y={cyT} label="środek" pos="s" cls="t-arc" dot="pt-arc" />
          <Pt x={cxT - rT} y={cyT} label="start" pos="s" />
          <line x1={176} y1={30} x2={176} y2={216} className="p-cons" />
          <T x={272} y={22} anchor="middle" cls="t-b">z boku (XZ)</T>
          <rect x={206} y={zs(0)} width={132} height={zs(-7) - zs(0)} fill={c.hatch} className="p-con" />
          <polyline points={side.join(" ")} className="p-arc thick" />
          {[0, -2, -4, -6].map((v) => (
            <g key={v}>
              <line x1={200} y1={zs(v)} x2={344} y2={zs(v)} className="p-cons" />
              <T x={346} y={zs(v) + 4} cls="t-mono t-tick">{v === 0 ? "Z0" : `Z${v}`}</T>
            </g>
          ))}
          <Dim x1={214} y1={zs(0)} x2={214} y2={zs(-2)} label="2 mm" c={c} lside={1} cls="t-mono t-acc t-b" />
        </g>
      )}
    </Fig>
  );
}

/* ================= G41: dojazd, kontur, odjazd ================= */
export function CompEntry() {
  const R: [number, number, number, number] = [-32, 86, -32, 66];
  const m = mapper(R, [22, 8, 330, 232]);
  const r = 8;
  return (
    <Fig id="compin" code="G41 G40" title="Kompensacja: dojazd, kontur, odjazd" h={256} legend={["cut", "con", "stock", "dim"]}
      notes={<><Code>G41 D1 X0 Y0</Code><Code>… kontur …</Code><Code>G40 X−25 Y−25</Code></>}
      caption={<>Kompensację włącza blok dojazdowy, a wyłącza odjazdowy — oba muszą być ruchami liniowymi dłuższymi niż promień narzędzia. Na końcu dojazdu środek freza stoi już <b>r</b> od konturu.</>}>
      {(c) => (
        <g>
          <Grid m={m} range={R} c={c} ticks={false} />
          <rect x={m.X(0)} y={m.Y(50)} width={70 * m.u} height={50 * m.u} fill={c.hatch} className="p-con" />
          <T x={m.X(35)} y={m.Y(25) + 4} anchor="middle" cls="t-b">kontur 70 × 50</T>
          <rect x={m.X(-r)} y={m.Y(50 + r)} width={(70 + 2 * r) * m.u} height={(50 + 2 * r) * m.u} className="p-cut thick draw" pathLength={1} fill="none" />
          <line x1={m.X(-25)} y1={m.Y(-25)} x2={m.X(-r)} y2={m.Y(0)} className="p-cut dashed" markerEnd={c.a("cut")} />
          <line x1={m.X(0)} y1={m.Y(-r)} x2={m.X(-24)} y2={m.Y(-24) - 3} className="p-cut dashed" markerEnd={c.a("cut")} />
          <circle cx={m.X(-r)} cy={m.Y(0)} r={r * m.u} className="tool" />
          <Pt x={m.X(-25)} y={m.Y(-25)} label="X−25 Y−25" pos="se" cls="t-mono t-b" />
          <Dim x1={m.X(50)} y1={m.Y(50)} x2={m.X(50)} y2={m.Y(50 + r)} label="r" c={c} lside={1} cls="t-mono t-acc t-b" />
          <T x={m.X(84)} y={m.Y(58) - 6} anchor="end" cls="t-cut t-b">tor środka narzędzia</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= ap, ae ================= */
export function ApAe() {
  return (
    <Fig id="apae" title="ap i ae — głębokość i szerokość skrawania" h={236} legend={["acc", "stock", "tool"]}
      notes={<><Code k="acc">Vf = n · z · fz</Code><Code k="acc">Q = ap · ae · Vf / 1000</Code></>}
      caption={<><b>ap</b> mierzy się wzdłuż osi narzędzia, <b>ae</b> — prostopadle do kierunku posuwu, w płaszczyźnie obróbki. <b>fz</b> to posuw na jedno ostrze.</>}>
      {(c) => (
        <g>
          <T x={88} y={20} anchor="middle" cls="t-b">z boku</T>
          <rect x={16} y={96} width={144} height={110} fill={c.hatch} className="p-con" />
          <rect x={64} y={96} width={48} height={34} className="p-fill-acc" />
          <rect x={70} y={26} width={36} height={70} className="holder" />
          <rect x={64} y={70} width={48} height={60} className="tool" />
          <Dim x1={40} y1={96} x2={40} y2={130} label="ap" c={c} lside={-1} cls="t-mono t-acc t-b" />
          <line x1={176} y1={30} x2={176} y2={216} className="p-cons" />
          <T x={268} y={20} anchor="middle" cls="t-b">z góry</T>
          <rect x={196} y={40} width={80} height={170} fill={c.hatch} className="p-con" />
          <circle cx={300} cy={126} r={48} className="tool" />
          <path d={`M 276 ${126 - Math.sqrt(48 * 48 - 24 * 24)} A 48 48 0 0 0 276 ${126 + Math.sqrt(48 * 48 - 24 * 24)} Z`} className="p-fill-acc" />
          <line x1={300} y1={196} x2={300} y2={216} className="p-cut" markerEnd={c.a("cut")} />
          <T x={308} y={214} cls="t-mut">posuw</T>
          <Dim x1={252} y1={62} x2={276} y2={62} label="ae" c={c} lside={-1} cls="t-mono t-acc t-b" />
        </g>
      )}
    </Fig>
  );
}

/* ================= pocienianie wióra ================= */
export function Thinning() {
  const panel = (x0: number, ae: number, ok: boolean, title: string) => {
    const R = 40, cx = x0 + 88, cy = 118, edge = cx - R + ae;
    const hy = Math.sqrt(Math.max(R * R - (edge - cx) ** 2, 0));
    return (
      <g>
        <T x={x0 + 80} y={22} anchor="middle" cls={`t-b ${ok ? "t-cut" : "t-bad"}`}>{title}</T>
        <rect x={x0 + 8} y={40} width={edge - x0 - 8} height={170} fill={"url(#thin-h)"} className="p-con" />
        <circle cx={cx} cy={cy} r={R} className="tool" />
        <path d={`M ${edge} ${cy - hy} A ${R} ${R} 0 ${ae > R ? 1 : 0} 0 ${edge} ${cy + hy} Z`} className={ok ? "p-fill-cut" : "p-fill-bad"} />
        <path d={`M ${edge} ${cy - hy} A ${R} ${R} 0 ${ae > R ? 1 : 0} 0 ${edge} ${cy + hy}`} className={ok ? "p-cut thick" : "p-bad thick"} />
        <T x={x0 + 80} y={200} anchor="middle" cls="t-mono">{ok ? "ae = D/2 → hex = fz" : "ae < D/2 → hex < fz"}</T>
      </g>
    );
  };
  return (
    <Fig id="thin" title="Pocienianie wióra przy małym ae" h={216} legend={["tool", "acc"]}
      notes={<Code k="acc">hex = fz · 2·√(ae/D − (ae/D)²)</Code>}
      caption={<>Gdy frez pracuje bokiem płycej niż na połowę średnicy, najgrubszy wiór <b>hex</b> jest cieńszy niż posuw na ostrze <b>fz</b>. Bez podniesienia posuwu ostrze trze zamiast skrawać.</>}>
      {() => (
        <g>
          {panel(0, 40, true, "pełny wiór")}
          <line x1={178} y1={30} x2={178} y2={206} className="p-cons" />
          {panel(180, 10, false, "wiór pocieniony")}
        </g>
      )}
    </Fig>
  );
}

/* ================= Vc ================= */
export function VcDiag() {
  const cx = 130, cy = 120, R = 86, r = 40;
  return (
    <Fig id="vc" title="Vc — prędkość skrawania na obwodzie" h={240} legend={["cut", "arc", "dim"]}
      notes={<Code k="acc">Vc = π · D · n / 1000</Code>}
      caption={<>Vc to prędkość, z jaką powierzchnia przesuwa się względem ostrza. Przy tych samych obrotach punkt na większej średnicy pokonuje dłuższą drogę — Vc rośnie razem z D.</>}>
      {(c) => (
        <g>
          <circle cx={cx} cy={cy} r={R} fill={c.hatch} className="p-con" />
          <circle cx={cx} cy={cy} r={r} className="p-cons" />
          <path d={`M ${cx - 30} ${cy - R - 12} A ${R + 12} ${R + 12} 0 0 1 ${cx + 30} ${cy - R - 12}`} className="rot" markerEnd={c.a("dim")} />
          <T x={cx} y={cy - R - 18} anchor="middle" cls="t-mono">n</T>
          <line x1={cx} y1={cy - R} x2={cx + 62} y2={cy - R} className="p-cut thick" markerEnd={c.a("cut")} />
          <T x={cx + 68} y={cy - R + 4} cls="t-cut t-b">Vc</T>
          <line x1={cx} y1={cy - r} x2={cx + 29} y2={cy - r} className="p-arc thick" markerEnd={c.a("arc")} />
          <T x={cx + 34} y={cy - r + 4} cls="t-arc">mniejsza</T>
          <Dim x1={cx - R} y1={cy + 6} x2={cx + R} y2={cy + 6} label="D" c={c} lside={1} cls="t-mono t-b" />
          <Pt x={cx} y={cy} dot="pt" />
          <T x={242} y={80} cls="t-mut">na zewnątrz:</T>
          <T x={242} y={96} cls="t-cut t-b">duża droga / obrót</T>
          <T x={242} y={140} cls="t-mut">bliżej osi:</T>
          <T x={242} y={156} cls="t-arc t-b">mała droga / obrót</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= frezowanie współbieżne / przeciwbieżne ================= */
function ClimbPanel({ x0, climb, a }: { x0: number; climb: boolean; a: (k: "dim" | "cut") => string }) {
  const cx = x0 + 84, cy = 118, R = 34;
  const matTop = climb ? cy + R - 14 : 40, matH = climb ? 206 - (cy + R - 14) : cy - R + 14 - 40;
  return (
    <g>
      <T x={x0 + 84} y={22} anchor="middle" cls={`t-b ${climb ? "t-cut" : "t-bad"}`}>{climb ? "współbieżne — G41" : "przeciwbieżne — G42"}</T>
      <rect x={x0 + 10} y={matTop} width={148} height={matH} fill="url(#climb-h)" className="p-con" />
      <circle cx={cx} cy={cy} r={R} className="tool" />
      <path d={`M ${cx - 20} ${cy - R - 8} A ${R + 8} ${R + 8} 0 0 1 ${cx + 20} ${cy - R - 8}`} className="rot" markerEnd={a("dim")} />
      <T x={cx} y={cy - R - 14} anchor="middle" cls="t-mono t-sm">M03</T>
      <line x1={x0 + 16} y1={cy} x2={x0 + 44} y2={cy} className="p-cut" markerEnd={a("cut")} />
      <T x={x0 + 16} y={cy - 6} cls="t-mut t-sm">posuw</T>
      <T x={x0 + 84} y={climb ? 60 : 198} anchor="middle" cls="t-mono">{climb ? "wiór: gruby → cienki" : "wiór: cienki → gruby"}</T>
    </g>
  );
}

export function Climb() {
  return (
    <Fig id="climb" title="Frezowanie współbieżne i przeciwbieżne" h={216} legend={["tool", "cut"]}
      caption={<>Przy obrotach M03 i ruchu <b>G41</b> ostrze wchodzi w materiał od grubego wióra — to współbieżne, zwykle lepsze na CNC. Przy <b>G42</b> ostrze zaczyna od zerowej grubości i najpierw gniecie materiał.</>}>
      {(c) => (
        <g>
          <ClimbPanel x0={0} climb a={c.a} />
          <line x1={178} y1={30} x2={178} y2={206} className="p-cons" />
          <ClimbPanel x0={184} climb={false} a={c.a} />
        </g>
      )}
    </Fig>
  );
}

/* ================= Rz ================= */
export function RzDiag() {
  const f = 60, rx = 120, ry = 600, y0 = 104, x0 = 30;
  const sag = ry * (1 - Math.sqrt(1 - (f / 2 / rx) ** 2));   // głębokość wgłębienia w skali rysunku
  const d = [`M ${x0} ${y0}`];
  for (let i = 0; i < 5; i++) d.push(`A ${rx} ${ry} 0 0 0 ${x0 + (i + 1) * f} ${y0}`);
  const body = `${d.join(" ")} L ${x0 + 5 * f} 196 L ${x0} 196 Z`;
  return (
    <Fig id="rz" title="Rz — chropowatość teoretyczna po toczeniu" h={214} legend={["con", "dim", "acc"]}
      notes={<Code k="acc">Rz ≈ f² / (8 · rε) · 1000 [µm]</Code>}
      caption={<>Każdy obrót zostawia ślad naroża płytki. Głębokość wgłębień zależy od posuwu na obrót <b>f</b> i promienia naroża <b>rε</b>, a nie od obrotów. Skala pionowa jest mocno powiększona.</>}>
      {(c) => (
        <g>
          <path d={body} fill={c.hatch} className="p-con" />
          <line x1={x0} y1={y0} x2={x0 + 5 * f} y2={y0} className="p-cons" />
          <line x1={x0} y1={y0 + sag} x2={x0 + 5 * f} y2={y0 + sag} className="p-cons" />
          <Dim x1={x0 + 3.5 * f} y1={y0} x2={x0 + 3.5 * f} y2={y0 + sag} label="Rz" c={c} lside={-1} cls="t-mono t-acc t-b" />
          <Dim x1={x0 + f} y1={y0 - 20} x2={x0 + 2 * f} y2={y0 - 20} label="f" c={c} lside={-1} cls="t-mono t-acc t-b" />
          <T x={x0 + 2.5 * f} y={y0 + sag + 44} anchor="middle" cls="t-mut">materiał (przekrój)</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= naddatek ================= */
export function Allowance() {
  return (
    <Fig id="allow" title="Naddatek na obróbkę wykańczającą" h={220} legend={["cut", "con", "acc", "cons"]}
      caption={<>Przejścia zgrubne zatrzymują się przed wymiarem i zostawiają warstwę <b>naddatku</b>. Przejście wykańczające zbiera ją jednym cienkim wiórem, więc wymiar i chropowatość są pod kontrolą.</>}>
      {(c) => (
        <g>
          <rect x={30} y={30} width={300} height={170} className="stock-out" />
          <T x={326} y={24} anchor="end" cls="t-mut">półfabrykat</T>
          <rect x={60} y={70} width={240} height={130} className="p-fill-acc" />
          <rect x={72} y={82} width={216} height={118} fill={c.hatch} className="p-con" />
          <T x={180} y={148} anchor="middle" cls="t-b">wymiar gotowy</T>
          {[40, 52, 64].map((y, i) => <line key={y} x1={36} y1={y} x2={324} y2={y} className="p-cut" markerEnd={i === 0 ? c.a("cut") : undefined} />)}
          <line x1={72} y1={82} x2={288} y2={82} className="p-cut thick draw" pathLength={1} />
          <Dim x1={300} y1={70} x2={300} y2={82} off={0} label="naddatek" c={c} lside={1} cls="t-acc t-b" lpos={0.5} />
          <T x={40} y={36} cls="t-cut t-sm">zgrubnie</T>
          <T x={78} y={96} cls="t-cut t-sm">wykańczająco</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= rozbieg i wybieg gwintu ================= */
export function Runout() {
  const zx = (v: number) => 300 + v * 6.2, xx = (v: number) => 216 - (v - 6) * 10;
  return (
    <Fig id="runout" code="G33 G76" title="Rozbieg i wybieg gwintu" h={236} legend={["cut", "rap", "con", "bad"]}
      caption={<>Osie potrzebują drogi, żeby rozpędzić się do prędkości zgranej ze skokiem. Bez <b>rozbiegu</b> pierwsze zwoje mają zły skok, bez <b>wybiegu</b> lub podcięcia nóż kończy w materiale.</>}>
      {(c) => (
        <g>
          <polygon points={[[0, 22], [-30, 22], [-30, 19.5], [-34, 19.5], [-34, 24], [-42, 24], [-42, 6.4], [0, 6.4]].map(([z, r]) => `${zx(z)},${xx(r)}`).join(" ")} fill={c.hatch} className="p-con" />
          <line x1={zx(-44)} y1={xx(6.4)} x2={zx(10)} y2={xx(6.4)} className="break" />
          {Array.from({ length: 16 }).map((_, i) => <line key={i} x1={zx(-i * 1.875)} y1={xx(22)} x2={zx(-i * 1.875) - 6} y2={xx(20.4)} className="p-cons" />)}
          <line x1={zx(8)} y1={xx(20.8)} x2={zx(0)} y2={xx(20.8)} className="p-rap thick" />
          <line x1={zx(0)} y1={xx(20.8)} x2={zx(-31)} y2={xx(20.8)} className="p-cut thick draw" pathLength={1} markerEnd={c.a("cut")} />
          <T x={zx(4)} y={xx(20.8) - 10} anchor="middle" cls="t-rap t-b">rozbieg</T>
          <T x={zx(8)} y={xx(20.8) + 16} anchor="end" cls="t-mono t-sm">≥ 2–3 skoki</T>
          <T x={zx(-15)} y={xx(20.8) - 10} anchor="middle" cls="t-cut t-b">gwint</T>
          <T x={zx(-32)} y={xx(19.5) + 16} anchor="middle" cls="t-bad t-b">podcięcie</T>
          <T x={zx(-32)} y={xx(19.5) + 29} anchor="middle" cls="t-mut t-sm">(wybieg)</T>
        </g>
      )}
    </Fig>
  );
}
