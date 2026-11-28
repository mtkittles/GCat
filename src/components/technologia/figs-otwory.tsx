import type { ReactNode } from "react";
import { Dim, Fig, Step, T, type Ctx } from "@/components/fig";

/*
  Rysunki V3.1b (dział Narzędzia: otwory) — styl jak figs-frezy.tsx: szerokość 360, materiał kreskowany,
  narzędzie w szarościach, krawędź skrawająca kolorem parametru. Proporcje poglądowe; wartości liczbowe
  tylko w treści artykułu, ze źródłem. Numery części (`Step`) objaśnia lista pod rysunkiem w MDX.
*/

const rad = (d: number) => (d * Math.PI) / 180;
const at = (cx: number, cy: number, r: number, deg: number): [number, number] => [cx + r * Math.cos(rad(deg)), cy - r * Math.sin(rad(deg))];
const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const [x0, y0] = at(cx, cy, r, a0), [x1, y1] = at(cx, cy, r, a1);
  return `M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 0 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
};
const P = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ") + " Z";

/* ================= wiertło kręte — budowa: widok z boku i od czoła ================= */
export function TwistDrill() {
  const ax = 70, rs = 14, rb = 18;          // oś, promień chwytu i części roboczej
  const x0 = 16, x1 = 112, x2 = 268;        // chwyt, część robocza do czoła
  const tip = x2 + rb / Math.tan(rad(59));  // stożek 118° — poglądowo
  const top = ax - rb, bot = ax + rb;
  const run = (2 * rb) / Math.tan(rad(30)); // linia śrubowa — ilustracja
  const xs = [120, 150, 180, 210, 240];
  // widok od czoła
  const cx = 268, cy = 182, R = 34, w = 5;
  const ex = Math.sqrt(R * R - w * w);
  return (
    <Fig id="two" code="wiertło" title="Wiertło kręte — budowa" h={236} legend={[["acc", "krawędź skrawająca"], "cons"]}
      caption={<>U góry widok z boku, u dołu z prawej widok od czoła; kąt wierzchołkowy i pochylenie rowków narysowano poglądowo.</>}>
      {(c) => (
        <g>
          <defs><clipPath id="two-clip"><rect x={x1} y={top} width={x2 - x1} height={2 * rb} /></clipPath></defs>
          <line x1={8} y1={ax} x2={tip + 24} y2={ax} className="axis-c" />
          {/* chwyt */}
          <path d={`M ${x0 + 4} ${ax - rs} H ${x1} V ${ax + rs} H ${x0 + 4} L ${x0} ${ax + rs - 4} V ${ax - rs + 4} Z`} className="holder" />
          {/* część robocza ze stożkiem */}
          <path d={P([[x1, top], [x2, top], [tip, ax], [x2, bot], [x1, bot]])} className="cutter" />
          <g clipPath="url(#two-clip)">
            {xs.map((x) => <line key={x} x1={x} y1={top} x2={x + run} y2={bot} className="p-sym" />)}
          </g>
          <line x1={x2} y1={top} x2={tip} y2={ax} className="p-acc thick" />
          <line x1={x2} y1={bot} x2={tip} y2={ax} className="p-acc thick" />
          {/* kąt wierzchołkowy */}
          <path d={arc(tip, ax, 30, 180 - 59, 180 + 59)} className="p-dim" />
          <T x={tip - 36} y={ax + 4} anchor="end" cls="t-acc t-b">φ</T>
          {/* odnośniki widoku z boku */}
          <line x1={64} y1={34} x2={64} y2={ax - rs} className="p-ext" /><Step x={64} y={26} n={1} />
          <line x1={150} y1={34} x2={150} y2={top} className="p-ext" /><Step x={150} y={26} n={2} />
          <line x1={226} y1={112} x2={212} y2={bot - 4} className="p-ext" /><Step x={226} y={120} n={3} />
          <line x1={300} y1={42} x2={x2 + 6} y2={top + 8} className="p-ext" /><Step x={300} y={34} n={4} />
          <Dim c={c} x1={x1 + 22} y1={top} x2={x1 + 22} y2={bot} label="D" lside={1} />

          {/* widok od czoła */}
          <circle cx={cx} cy={cy} r={R} className="cutter" />
          <path d={`M ${cx + w * 0.6} ${cy - w} L ${cx + ex} ${cy - w} A ${R} ${R} 0 0 1 ${at(cx, cy, R, -70)[0].toFixed(1)} ${at(cx, cy, R, -70)[1].toFixed(1)} Q ${cx + 6} ${cy + 14} ${cx + w * 0.6} ${cy - w} Z`} className="holder" />
          <path d={`M ${cx - w * 0.6} ${cy + w} L ${cx - ex} ${cy + w} A ${R} ${R} 0 0 1 ${at(cx, cy, R, 110)[0].toFixed(1)} ${at(cx, cy, R, 110)[1].toFixed(1)} Q ${cx - 6} ${cy - 14} ${cx - w * 0.6} ${cy + w} Z`} className="holder" />
          <line x1={cx + w * 0.6} y1={cy - w} x2={cx + ex} y2={cy - w} className="p-acc thick" />
          <line x1={cx - w * 0.6} y1={cy + w} x2={cx - ex} y2={cy + w} className="p-acc thick" />
          <line x1={cx - w * 0.6} y1={cy + w} x2={cx + w * 0.6} y2={cy - w} className="p-sym thick" />
          <circle cx={cx} cy={cy} r={w + 3} className="p-cons" />
          <path d={arc(cx, cy, R, 8, 26)} className="p-sym thick" />
          <path d={arc(cx, cy, R, 188, 206)} className="p-sym thick" />
          {/* odnośniki widoku od czoła */}
          <line x1={210} y1={146} x2={cx - 2} y2={cy - 2} className="p-ext" /><Step x={202} y={140} n={5} />
          <line x1={330} y1={150} x2={at(cx, cy, R, 18)[0]} y2={at(cx, cy, R, 18)[1]} className="p-ext" /><Step x={336} y={144} n={6} />
          <line x1={214} y1={222} x2={cx - 4} y2={cy + w + 3} className="p-ext" /><Step x={206} y={224} n={7} />
          <T x={150} y={190} anchor="middle" cls="t-sm t-mut">widok od czoła</T>
          <line x1={186} y1={186} x2={cx - R - 4} y2={cy} className="p-cons" />
        </g>
      )}
    </Fig>
  );
}

/* ================= wiertło z płytkami: płytka środkowa i obwodowa ================= */
export function InsertDrill() {
  const ax = 92, R = 42, x0 = 30, x1 = 222;
  const cen: [number, number] = [x1, ax + 6];   // płytka środkowa: od osi (z małym przejściem) w dół
  return (
    <Fig id="twp" code="wiertło" title="Wiertło z płytkami — dwie płytki dzielą promień" h={226} legend={[["acc", "krawędź skrawająca"], "stock", "cons"]}
      caption={<>Widok z boku w otworze; po prawej zakresy promienia, które skrawa każda z płytek.</>}>
      {(c) => (
        <g>
          {/* ścianki otworu */}
          <rect x={x0 + 40} y={ax - R - 22} width={x1 - x0 - 20} height={22} fill={c.hatch} className="p-con" />
          <rect x={x0 + 40} y={ax + R} width={x1 - x0 - 20} height={22} fill={c.hatch} className="p-con" />
          <rect x={x1 + 4} y={ax - R - 22} width={14} height={2 * R + 44} fill={c.hatch} className="p-con" />
          <line x1={10} y1={ax} x2={300} y2={ax} className="axis-c" />
          {/* korpus z rowkiem i kanałem chłodziwa */}
          <rect x={x0} y={ax - R + 4} width={x1 - x0} height={2 * R - 8} className="holder" />
          <path d={`M ${x0 + 70} ${ax - R + 4} Q ${x0 + 120} ${ax} ${x1 - 6} ${ax - 6}`} className="p-sym" />
          <path d={`M ${x0 + 30} ${ax + R - 4} Q ${x0 + 90} ${ax + 6} ${x1 - 30} ${ax + R - 4}`} className="p-sym" />
          <line x1={x0} y1={ax - 4} x2={x1 - 14} y2={ax - 4} className="p-cons" />
          <line x1={x0} y1={ax + 4} x2={x1 - 14} y2={ax + 4} className="p-cons" />
          {/* płytka obwodowa — u góry, do pełnej średnicy */}
          <rect x={x1 - 12} y={ax - R} width={14} height={26} className="cutter" />
          <line x1={x1 + 2} y1={ax - R} x2={x1 + 2} y2={ax - R + 26} className="p-acc thick" />
          {/* płytka środkowa — u dołu, przez oś */}
          <rect x={cen[0] - 12} y={ax - 4} width={14} height={30} className="cutter" />
          <line x1={x1 + 2} y1={ax - 4} x2={x1 + 2} y2={ax + 26} className="p-acc thick" />
          {/* zakresy promienia: oś → pełny promień */}
          <line x1={300} y1={ax} x2={300} y2={ax - R} className="p-dim" />
          <line x1={294} y1={ax} x2={306} y2={ax} className="p-dim" />
          <rect x={306} y={ax - R} width={8} height={26} className="p-fill-acc" />
          <rect x={318} y={ax - 26} width={8} height={30} className="p-fill-acc" />
          <Step x={310} y={ax - R - 10} n={2} />
          <Step x={322} y={ax + 16} n={1} />
          <T x={296} y={ax + 14} anchor="end" cls="t-sm t-mut">oś</T>
          {/* odnośniki */}
          <line x1={252} y1={150} x2={x1 - 4} y2={ax + 16} className="p-ext" /><Step x={258} y={158} n={1} />
          <line x1={252} y1={34} x2={x1 - 4} y2={ax - R + 10} className="p-ext" /><Step x={258} y={26} n={2} />
          <line x1={110} y1={176} x2={118} y2={ax + 30} className="p-ext" /><Step x={110} y={184} n={3} />
          <line x1={70} y1={34} x2={70} y2={ax - 4} className="p-ext" /><Step x={70} y={26} n={4} />
          <Dim c={c} x1={x1 + 44} y1={ax - R} x2={x1 + 44} y2={ax + R} label="D" lside={1} />
        </g>
      )}
    </Fig>
  );
}

/* ================= nawiertak NC i nawiertak do nakiełków ================= */
export function SpotCenterDrill() {
  const sy = 64;                          // powierzchnia materiału — dwa górne panele
  const spot = (c: Ctx, cx: number, ang: number, drill: number, ok: boolean) => {
    const hs = 22, ds = hs / Math.tan(rad(ang / 2));               // stożek po nawiertaku
    const hd = 14, dd = hd / Math.tan(rad(drill / 2));             // czubek wiertła
    const yd = ok ? sy + ds - dd : sy + ds - dd + 6;
    return (
      <g>
        <path d={P([[cx - 70, sy], [cx - hs, sy], [cx, sy + ds], [cx + hs, sy], [cx + 70, sy], [cx + 70, sy + 50], [cx - 70, sy + 50]])} fill={c.hatch} className="p-con" />
        <path d={P([[cx - hd, yd - 40], [cx + hd, yd - 40], [cx + hd, yd - dd], [cx, yd], [cx - hd, yd - dd]])} className="cutter" />
        <line x1={cx - hd} y1={yd - dd} x2={cx} y2={yd} className="p-acc thick" />
        <line x1={cx + hd} y1={yd - dd} x2={cx} y2={yd} className="p-acc thick" />
        {ok ? <circle cx={cx} cy={sy + ds} r={3} className="p-fill-cut" /> : <>
          <circle cx={cx - hd + 1} cy={sy + (hs - hd) / Math.tan(rad(ang / 2)) + 1} r={3} className="p-fill-bad" />
          <circle cx={cx + hd - 1} cy={sy + (hs - hd) / Math.tan(rad(ang / 2)) + 1} r={3} className="p-fill-bad" />
        </>}
      </g>
    );
  };
  return (
    <Fig id="tnw" code="nawiertak" title="Nawiertak NC i nawiertak do nakiełków" h={244} legend={[["acc", "krawędź skrawająca"], ["bad", "pierwszy styk na narożach"], "stock"]}
      caption={<>U góry nakiełek po nawiertaku NC i wejście wiertła, u dołu nawiertak do nakiełków i nakiełek z kłem; kąty poglądowe.</>}>
      {(c) => (
        <g>
          {spot(c, 90, 120, 118, true)}
          {spot(c, 270, 90, 118, false)}
          <T x={90} y={22} anchor="middle" cls="t-sm">φn ≥ φw: styk czubkiem</T>
          <T x={270} y={22} anchor="middle" cls="t-sm">φn &lt; φw: styk narożami</T>
          <line x1={180} y1={14} x2={180} y2={124} className="p-cons" />
          {/* nawiertak do nakiełków: część prowadząca + stożek 60° */}
          <line x1={10} y1={140} x2={350} y2={140} className="p-cons" />
          <path d={P([[30, 174], [110, 174], [128, 184], [146, 184], [146, 192], [128, 192], [110, 202], [30, 202]])} className="cutter" />
          <line x1={110} y1={174} x2={128} y2={184} className="p-acc thick" />
          <line x1={110} y1={202} x2={128} y2={192} className="p-acc thick" />
          <line x1={146} y1={184} x2={146} y2={192} className="p-acc thick" />
          <line x1={20} y1={188} x2={160} y2={188} className="axis-c" />
          <line x1={128} y1={160} x2={128} y2={182} className="p-ext" /><Step x={128} y={154} n={1} />
          <line x1={104} y1={160} x2={118} y2={178} className="p-ext" /><Step x={98} y={154} n={2} />
          {/* nakiełek w czole wałka i kieł */}
          <path d={P([[300, 160], [300, 172], [264, 172], [252, 182], [244, 182], [244, 194], [252, 194], [264, 204], [300, 204], [300, 216], [340, 216], [340, 160]])} fill={c.hatch} className="p-con" />
          <path d={P([[190, 168], [232, 168], [264, 188], [232, 208], [190, 208]])} className="holder" />
          <line x1={180} y1={188} x2={350} y2={188} className="axis-c" />
          <T x={210} y={230} anchor="middle" cls="t-sm t-mut">kieł</T>
          <T x={320} y={232} anchor="middle" cls="t-sm t-mut">wałek</T>
          <line x1={276} y1={150} x2={258} y2={178} className="p-ext" /><Step x={280} y={146} n={3} />
        </g>
      )}
    </Fig>
  );
}

/* ================= gwintowniki: rowki a kierunek wióra ================= */
export function TapTypes() {
  const xs = [50, 140, 230, 320], y0 = 40, y1 = 160, yc = 136, hw = 18;
  const body = (x: number) => P([[x - hw, y0], [x + hw, y0], [x + hw, yc], [x + hw - 7, y1], [x - hw + 7, y1], [x - hw, yc]]);
  return (
    <Fig id="tgw" code="gwintownik" title="Gwintowniki — rowki i kierunek odprowadzania wióra" h={232} legend={[["acc", "kierunek wióra"], ["cons", "nakrój"]]}
      caption={<>Cztery rodzaje gwintowników w widoku z boku; strzałka pokazuje, dokąd uchodzi wiór.</>}>
      {(c) => (
        <g>
          <defs><clipPath id="tgw-clip"><path d={body(230)} /></clipPath></defs>
          {xs.map((x, i) => (
            <g key={x}>
              <rect x={x - 9} y={16} width={18} height={y0 - 16} className="holder" />
              <path d={body(x)} className="cutter" />
              {Array.from({ length: 13 }, (_, k) => y0 + 8 + k * 9).filter((y) => y < y1 - 3).map((y) => (
                <line key={y} x1={x - hw + (y > yc ? ((y - yc) / (y1 - yc)) * 7 : 0)} y1={y} x2={x + hw - (y > yc ? ((y - yc) / (y1 - yc)) * 7 : 0)} y2={y + 3} className="p-sym" />
              ))}
              <rect x={x - hw - 4} y={yc} width={2 * hw + 8} height={y1 - yc} className="p-cons" fill="none" />
              {i === 0 && <rect x={x - 4} y={y0} width={8} height={y1 - y0 - 2} className="holder" />}
              {i === 1 && <path d={P([[x - 4, y0], [x + 4, y0], [x + 4, yc - 6], [x + 12, y1 - 2], [x + 2, y1 - 2], [x - 4, yc]])} className="holder" />}
              {i === 2 && <g clipPath="url(#tgw-clip)">{[0, 34, 68, 102].map((d) => <path key={d} d={`M ${x - hw} ${y0 + d + 22} L ${x + hw} ${y0 + d}`} className="p-sym thick" />)}</g>}
            </g>
          ))}
          {/* kierunki wióra */}
          <T x={50} y={208} anchor="middle" cls="t-sm t-mut">(wiór w rowkach)</T>
          <line x1={140 + 30} y1={150} x2={140 + 30} y2={182} className="p-acc" markerEnd={c.a("acc")} />
          <line x1={230 + 30} y1={150} x2={230 + 30} y2={50} className="p-acc" markerEnd={c.a("acc")} />
          <T x={320} y={102} anchor="middle" cls="t-sm t-mut">bez</T>
          <T x={320} y={114} anchor="middle" cls="t-sm t-mut">wióra</T>
          <T x={50} y={196} anchor="middle" cls="t-sm">rowki proste</T>
          <T x={140} y={196} anchor="middle" cls="t-sm">ostrze śrubowe</T>
          <T x={140} y={208} anchor="middle" cls="t-sm t-mut">(wiór do przodu)</T>
          <T x={230} y={196} anchor="middle" cls="t-sm">rowki śrubowe</T>
          <T x={230} y={208} anchor="middle" cls="t-sm t-mut">(wiór do chwytu)</T>
          <T x={320} y={196} anchor="middle" cls="t-sm">wygniatający</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= frez do gwintów: tor po helisie ================= */
export function ThreadMill() {
  // widok z góry: otwór Do, frez D, tor środka o promieniu A = (Do − D)/2
  const cx = 92, cy = 116, Ro = 62, Rt = 46, A = Ro - Rt;
  const tx = cx + A, ty = cy;
  // przekrój: ścianki z zarysem gwintu, frez wieloostrzowy dosunięty do lewej ścianki
  const sx = 268, P0 = 14, yt = 40, yb = 194, wl = sx - 52, wr = sx + 52, dep = 8;
  const zig = (x: number, dir: 1 | -1) => {
    let d = "";
    for (let y = yt + 6; y + P0 <= yb; y += P0) d += ` L ${x} ${y} L ${x + dir * dep} ${y + P0 / 2} L ${x} ${y + P0}`;
    return d;
  };
  const tl = wl + dep, tr = tl + 46;    // frez: zęby sięgają dna zarysu lewej ścianki
  return (
    <Fig id="tfg" code="frez do gwintów" title="Frez do gwintów — tor środka po helisie" h={232} legend={["arc", ["cons", "tor środka"], "stock", "dim"]}
      caption={<>Z lewej widok z góry na otwór, z prawej przekrój: w jednym obiegu narzędzie przesuwa się w Z o skok P.</>}>
      {(c) => (
        <g>
          {/* widok z góry */}
          <path d={`M ${cx - Ro - 14} ${cy} a ${Ro + 14} ${Ro + 14} 0 1 0 ${2 * (Ro + 14)} 0 a ${Ro + 14} ${Ro + 14} 0 1 0 ${-2 * (Ro + 14)} 0 Z M ${cx - Ro} ${cy} a ${Ro} ${Ro} 0 1 0 ${2 * Ro} 0 a ${Ro} ${Ro} 0 1 0 ${-2 * Ro} 0 Z`} fill={c.hatch} fillRule="evenodd" className="p-con" />
          <circle cx={tx} cy={ty} r={Rt} className="holder" />
          <circle cx={cx} cy={cy} r={A} className="p-cons" />
          <path d={`M ${cx} ${cy} L ${cx + A / 2} ${cy + A / 2} A ${A / 2} ${A / 2} 0 0 0 ${tx} ${ty}`} className="p-arc thick" />
          <path d={arc(cx, cy, A, 0, 300)} className="p-arc" markerEnd={c.a("arc")} />
          <line x1={cx - 3} y1={cy} x2={cx + 3} y2={cy} className="p-sym" /><line x1={cx} y1={cy - 3} x2={cx} y2={cy + 3} className="p-sym" />
          <Dim c={c} x1={cx - Ro} y1={cy - Ro - 26} x2={cx + Ro} y2={cy - Ro - 26} label="Do" lside={-1} />
          <Dim c={c} x1={tx - Rt} y1={cy + Ro + 26} x2={tx + Rt} y2={cy + Ro + 26} label="D" lside={1} />
          <T x={cx - 6} y={cy - A - 6} anchor="end" cls="t-sm t-mono">A</T>
          {/* przekrój: ścianki z zarysem, dno */}
          <path d={`M ${wl - 22} ${yt} L ${wl} ${yt}${zig(wl, -1)} L ${wl} ${yb} L ${wl - 22} ${yb} Z`} fill={c.hatch} className="p-con" />
          <path d={`M ${wr + 22} ${yt} L ${wr} ${yt}${zig(wr, 1)} L ${wr} ${yb} L ${wr + 22} ${yb} Z`} fill={c.hatch} className="p-con" />
          <rect x={wl - 22} y={yb} width={wr - wl + 44} height={12} fill={c.hatch} className="p-con" />
          <line x1={sx} y1={yt - 6} x2={sx} y2={yb + 4} className="axis-c" />
          {/* frez */}
          <rect x={tl + 12} y={12} width={22} height={yt + 20} className="holder" />
          <rect x={tl} y={yt + 20} width={tr - tl} height={yb - yt - 34} className="cutter" />
          {Array.from({ length: 9 }, (_, k) => yt + 20 + 6 + k * P0).filter((y) => y + P0 <= yb - 14).map((y) => (
            <path key={y} d={`M ${tl} ${y} L ${tl - dep} ${y + P0 / 2} L ${tl} ${y + P0}`} className="p-acc" />
          ))}
          <line x1={(tl + tr) / 2} y1={yt + 14} x2={(tl + tr) / 2} y2={yb - 10} className="axis-c" />
          <Dim c={c} x1={wr + 30} y1={yt + 6 + 4 * P0} x2={wr + 30} y2={yt + 6 + 5 * P0} label="P" lside={1} />
        </g>
      )}
    </Fig>
  );
}

/* ================= rozwiertak: nakrój, część prowadząca, naddatek ================= */
export function Reamer() {
  const ax = 70, r = 20, x0 = 18, x1 = 110, x2 = 280, ch = 7;
  const xs = [130, 160, 190, 220, 250];
  return (
    <Fig id="trw" code="rozwiertak" title="Rozwiertak maszynowy i naddatek na rozwiercanie" h={214} legend={[["acc", "krawędź skrawająca"], "allow", "stock"]}
      caption={<>U góry rozwiertak w widoku z boku, u dołu przekrój otworu przed rozwierceniem i po nim; naddatek przesadzony.</>}>
      {(c) => (
        <g>
          <line x1={8} y1={ax} x2={300} y2={ax} className="axis-c" />
          <path d={`M ${x0 + 4} ${ax - 14} H ${x1} V ${ax + 14} H ${x0 + 4} L ${x0} ${ax + 10} V ${ax - 10} Z`} className="holder" />
          <path d={P([[x1, ax - r], [x2 - ch, ax - r], [x2, ax - r + ch], [x2, ax + r - ch], [x2 - ch, ax + r], [x1, ax + r]])} className="cutter" />
          {xs.map((x) => <line key={x} x1={x} y1={ax - r} x2={x} y2={ax + r} className="p-sym" />)}
          <line x1={x2 - ch} y1={ax - r} x2={x2} y2={ax - r + ch} className="p-acc thick" />
          <line x1={x2 - ch} y1={ax + r} x2={x2} y2={ax + r - ch} className="p-acc thick" />
          <line x1={64} y1={30} x2={64} y2={ax - 14} className="p-ext" /><Step x={64} y={22} n={1} />
          <line x1={196} y1={30} x2={196} y2={ax - r} className="p-ext" /><Step x={196} y={22} n={2} />
          <line x1={300} y1={34} x2={x2 - 3} y2={ax - r + 3} className="p-ext" /><Step x={306} y={28} n={3} />
          {/* przekrój otworu: przed (wiertło) i po (rozwiertak) */}
          <rect x={40} y={124} width={280} height={18} fill={c.hatch} className="p-con" />
          <rect x={40} y={182} width={280} height={18} fill={c.hatch} className="p-con" />
          <rect x={40} y={142} width={280} height={6} className="allow" />
          <rect x={40} y={176} width={280} height={6} className="allow" />
          <line x1={20} y1={162} x2={340} y2={162} className="axis-c" />
          <line x1={300} y1={146} x2={326} y2={118} className="p-ext" /><Step x={332} y={112} n={4} />
          <Dim c={c} x1={90} y1={148} x2={90} y2={176} label="d" lside={1} />
          <Dim c={c} x1={200} y1={142} x2={200} y2={182} label="D" lside={1} />
        </g>
      )}
    </Fig>
  );
}

/* ================= wytaczadło: głowica zgrubna dwuostrzowa i dokładna jednoostrzowa ================= */
export function BoringHeads() {
  const ya = 36, yb = 170;
  const head = (cx: number, edges: "two" | "one") => (
    <g>
      <rect x={cx - 16} y={8} width={32} height={ya - 8} className="holder" />
      <rect x={cx - 34} y={ya} width={68} height={56} className="holder" />
      <rect x={cx - 12} y={ya + 56} width={24} height={yb - ya - 92} className="holder" />
      {edges === "two" ? (
        <>
          <rect x={cx - 50} y={yb - 40} width={100} height={16} className="holder" />
          <path d={P([[cx - 60, yb - 40], [cx - 48, yb - 40], [cx - 48, yb - 26], [cx - 56, yb - 24]])} className="cutter" />
          <path d={P([[cx + 60, yb - 40], [cx + 48, yb - 40], [cx + 48, yb - 26], [cx + 56, yb - 24]])} className="cutter" />
          <line x1={cx - 60} y1={yb - 40} x2={cx - 56} y2={yb - 24} className="p-acc thick" />
          <line x1={cx + 60} y1={yb - 40} x2={cx + 56} y2={yb - 24} className="p-acc thick" />
        </>
      ) : (
        <>
          <rect x={cx - 12} y={yb - 40} width={60} height={16} className="holder" />
          <path d={P([[cx + 58, yb - 40], [cx + 46, yb - 40], [cx + 46, yb - 26], [cx + 54, yb - 24]])} className="cutter" />
          <line x1={cx + 58} y1={yb - 40} x2={cx + 54} y2={yb - 24} className="p-acc thick" />
          {[0, 1, 2, 3, 4, 5, 6].map((k) => <line key={k} x1={cx - 26 + k * 8} y1={ya + 40} x2={cx - 26 + k * 8} y2={ya + (k % 5 === 0 ? 50 : 46)} className="p-sym" />)}
        </>
      )}
      <line x1={cx} y1={4} x2={cx} y2={yb + 6} className="axis-c" />
    </g>
  );
  return (
    <Fig id="tbh" code="wytaczadło" title="Głowica wytaczarska zgrubna i dokładna" h={226} legend={[["acc", "krawędź skrawająca"], "cons"]}
      caption={<>Z lewej głowica zgrubna z dwoma ostrzami, z prawej dokładna z jednym ostrzem i podziałką nastawy; widok z boku, proporcje poglądowe.</>}>
      {() => (
        <g>
          {head(90, "two")}
          {head(260, "one")}
          <line x1={180} y1={10} x2={180} y2={200} className="p-cons" />
          <line x1={30} y1={56} x2={56} y2={60} className="p-ext" /><Step x={24} y={52} n={1} />
          <line x1={22} y1={yb - 52} x2={34} y2={yb - 38} className="p-ext" /><Step x={20} y={yb - 60} n={2} />
          <line x1={338} y1={yb - 52} x2={316} y2={yb - 36} className="p-ext" /><Step x={340} y={yb - 60} n={3} />
          <line x1={214} y1={ya + 64} x2={234} y2={ya + 48} className="p-ext" /><Step x={208} y={ya + 72} n={4} />
          <T x={90} y={212} anchor="middle" cls="t-sm">zgrubna</T>
          <T x={260} y={212} anchor="middle" cls="t-sm">dokładna</T>
        </g>
      )}
    </Fig>
  );
}

export const otworyFigs: Record<string, () => ReactNode> = {
  "tech-wiertlo-budowa": () => <TwistDrill />,
  "tech-wiertlo-plytki": () => <InsertDrill />,
  "tech-nawiertak": () => <SpotCenterDrill />,
  "tech-gwintowniki": () => <TapTypes />,
  "tech-frez-gwint": () => <ThreadMill />,
  "tech-rozwiertak": () => <Reamer />,
  "tech-wytaczadlo": () => <BoringHeads />,
};
