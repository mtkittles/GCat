import type { ReactNode } from "react";
import { Dim, Fig, Pt, Step, T, type Ctx } from "@/components/fig";

/*
  Rysunki V3.1a (dział Narzędzia: geometria ostrza i frezy) — styl jak figs-tech.tsx (fig.tsx): szerokość 360,
  tekst 11 px, materiał kreskowany, narzędzie w szarościach, krawędź skrawająca i mierzony kąt — kolor parametru.
  Kąty i proporcje poglądowe; liczby tylko symbolami (wartości w treści artykułu, ze źródłem).
*/

const rad = (d: number) => (d * Math.PI) / 180;
/** punkt na okręgu: kąt matematyczny (0° = w prawo, rośnie przeciwnie do zegara; oś y SVG w dół) */
const at = (cx: number, cy: number, r: number, deg: number): [number, number] => [cx + r * Math.cos(rad(deg)), cy - r * Math.sin(rad(deg))];
/** łuk od kąta a0 do a1 (a1 > a0, przeciwnie do zegara) */
const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const [x0, y0] = at(cx, cy, r, a0), [x1, y1] = at(cx, cy, r, a1);
  return `M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 0 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
};
const P = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ") + " Z";

/* ================= klin ostrza w płaszczyźnie ortogonalnej (γ, β, α) ================= */
export function WedgeAngles() {
  const px = 178, py = 150;                 // wierzchołek ostrza
  const g = 10, a = 8;                       // kąty poglądowe: natarcia i przyłożenia
  const rake = at(px, py, 112, 90 - g), flank = at(px, py, 150, a);
  const chip0: [number, number] = [146, 128], chipC = at(px, py, 74, 90 - g);
  const n: [number, number] = [-Math.cos(rad(g)), -Math.sin(rad(g))]; // normalna do powierzchni natarcia, w stronę wióra
  const chipD: [number, number] = [chipC[0] + 30 * n[0], chipC[1] + 30 * n[1]];
  return (
    <Fig id="tkl" code="γ α β" title="Klin ostrza — kąty w płaszczyźnie ortogonalnej" h={236}
      legend={[["acc", "kąt narzędzia"], ["cons", "płaszczyzny odniesienia"], "stock"]}
      caption={<><b>Pr</b> płaszczyzna podstawowa (prostopadła do kierunku skrawania) · <b>Ps</b> płaszczyzna krawędzi skrawającej · <b>γ</b> kąt natarcia — między powierzchnią natarcia a Pr · <b>β</b> kąt ostrza — między powierzchnią natarcia a przyłożenia · <b>α</b> kąt przyłożenia — między powierzchnią przyłożenia a Ps. Wszystkie trzy mierzy się w płaszczyźnie ortogonalnej Po i dają razem 90°. Kąty narysowano poglądowo.</>}>
      {(c) => (
        <g>
          {/* przedmiot z warstwą skrawaną */}
          <path d={P([[14, 128], chip0, [px, py], [346, py], [346, 214], [14, 214]])} fill={c.hatch} className="p-con" />
          {/* wiór */}
          <path d={P([chip0, [px, py], chipC, chipD])} className="holder" />
          {/* nóż */}
          <path d={P([[px, py], rake, [342, rake[1]], [342, flank[1]], flank])} className="cutter" />
          <line x1={px} y1={py} x2={rake[0]} y2={rake[1]} className="p-acc thick" />
          {/* płaszczyzny odniesienia */}
          <line x1={px} y1={py + 10} x2={px} y2={28} className="p-cons" />
          <line x1={px - 30} y1={py} x2={350} y2={py} className="p-cons" />
          <T x={px - 6} y={36} anchor="end" cls="t-mut">Pr</T>
          <T x={350} y={py - 6} anchor="end" cls="t-mut">Ps</T>
          {/* kąty */}
          <path d={arc(px, py, 64, 90 - g, 90)} className="p-acc" />
          <path d={arc(px, py, 36, a, 90 - g)} className="p-acc" />
          <path d={arc(px, py, 96, 0, a)} className="p-acc" />
          {(() => { const [x, y] = at(px, py, 76, 85); return <T x={x} y={y} anchor="middle" cls="t-acc t-b">γ</T>; })()}
          {(() => { const [x, y] = at(px, py, 48, 44); return <T x={x} y={y + 4} anchor="middle" cls="t-acc t-b">β</T>; })()}
          {(() => { const [x, y] = at(px, py, 108, 4); return <T x={x} y={y + 4} anchor="start" cls="t-acc t-b">α</T>; })()}
          {/* opisy */}
          <T x={250} y={60} cls="t-sm">nóż</T>
          <T x={108} y={70} anchor="end" cls="t-sm">wiór</T>
          <line x1={112} y1={67} x2={156} y2={96} className="p-ext" />
          <T x={56} y={196} cls="t-sm">przedmiot</T>
          <T x={226} y={100} cls="t-sm t-mut">powierzchnia natarcia</T>
          <line x1={224} y1={97} x2={196} y2={88} className="p-ext" />
          <T x={262} y={180} anchor="middle" cls="t-sm t-mut">powierzchnia przyłożenia</T>
          <line x1={262} y1={169} x2={262} y2={140} className="p-ext" />
          <Pt x={px} y={py} />
          {/* kierunek skrawania (ruch noża względem przedmiotu) */}
          <line x1={120} y1={36} x2={60} y2={36} className="p-dim" markerEnd={c.a("dim")} />
          <T x={90} y={28} anchor="middle" cls="t-sm t-mut">kierunek skrawania</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= kąty w rzucie na płaszczyznę podstawową (κr, εr, κr′) — toczenie wzdłużne ================= */
export function PlanAngles() {
  const tx = 196, ty = 104, ap = 30, kr = 75, krp = 25, L = 70;
  const d1: [number, number] = [-Math.cos(rad(kr)), Math.sin(rad(kr))];   // krawędź główna: w dół i w lewo
  const d2: [number, number] = [Math.cos(rad(krp)), Math.sin(rad(krp))];  // krawędź pomocnicza: w dół i w prawo
  const q: [number, number] = [tx - ap / Math.tan(rad(kr)), ty + ap];
  const v1: [number, number] = [tx + L * d1[0], ty + L * d1[1]], v2: [number, number] = [tx + L * d2[0], ty + L * d2[1]];
  const v3: [number, number] = [v1[0] + L * d2[0], v1[1] + L * d2[1]];
  return (
    <Fig id="tkr" code="κr εr" title="Kąty w rzucie na płaszczyznę podstawową — toczenie wzdłużne" h={250}
      legend={[["acc", "krawędź główna i kąty"], ["cons", "kierunek posuwu"], "stock"]}
      caption={<>Widok z góry na nóż i wałek. <b>κr</b> kąt przystawienia — między krawędzią główną S a kierunkiem posuwu · <b>κr′</b> kąt przystawienia krawędzi pomocniczej S′ · <b>εr</b> kąt naroża między krawędziami. W płaszczyźnie podstawowej κr + εr + κr′ = 180°, a kąt ψr = 90° − κr (w katalogach amerykańskich „lead angle”). Na rysunku płytka rombowa o kącie naroża 80°.</>}>
      {(c) => (
        <g>
          <line x1={10} y1={24} x2={350} y2={24} className="axis-c" />
          <T x={14} y={18} cls="t-sm t-mut">oś przedmiotu</T>
          <path d={P([[14, 30], [346, 30], [346, ty], [tx, ty], q, [14, q[1]]])} fill={c.hatch} className="p-con" />
          {/* oprawka i płytka */}
          <rect x={206} y={190} width={140} height={44} className="holder" />
          <path d={P([[tx, ty], v2, v3, v1])} className="cutter" />
          <line x1={tx} y1={ty} x2={q[0] + (q[0] - tx) * 0.9} y2={q[1] + (q[1] - ty) * 0.9} className="p-acc thick" />
          {/* kierunek posuwu i kąty */}
          <line x1={tx} y1={ty} x2={tx - 92} y2={ty} className="p-cons" />
          <path d={arc(tx, ty, 28, 180, 180 + kr)} className="p-acc" />
          <path d={arc(tx, ty, 46, 360 - krp, 360)} className="p-acc" />
          <path d={arc(tx, ty, 17, 180 + kr, 360 - krp)} className="p-acc" />
          {(() => { const [x, y] = at(tx, ty, 40, 180 + kr / 2); return <T x={x} y={y + 4} anchor="middle" cls="t-acc t-b">κr</T>; })()}
          {(() => { const [x, y] = at(tx, ty, 60, 360 - krp / 2); return <T x={x} y={y + 4} anchor="start" cls="t-acc t-b">κr′</T>; })()}
          {(() => { const [x, y] = at(tx, ty, 31, 180 + kr + (180 - kr - krp) / 2); return <T x={x} y={y + 4} anchor="middle" cls="t-acc t-b">εr</T>; })()}
          <T x={q[0] - 18} y={q[1] + 34} anchor="end" cls="t-sm">S</T>
          <T x={v2[0] + 6} y={v2[1] + 2} cls="t-sm">S′</T>
          <Dim c={c} x1={150} y1={ty} x2={150} y2={q[1]} label="ap" lside={-1} />
          <T x={346} y={ty - 8} anchor="end" cls="t-sm t-mut">powierzchnia obrobiona</T>
          <T x={18} y={q[1] + 16} cls="t-sm t-mut">powierzchnia obrabiana</T>
          <line x1={140} y1={226} x2={60} y2={226} className="p-dim" markerEnd={c.a("dim")} />
          <T x={100} y={218} anchor="middle" cls="t-sm t-mut">posuw f</T>
          <T x={276} y={216} anchor="middle" cls="t-sm">oprawka</T>
          <Pt x={tx} y={ty} />
        </g>
      )}
    </Fig>
  );
}

/* ================= frez kulisty i z promieniem naroża — średnica efektywna ================= */
export function BallBullDe() {
  const y0 = 150;
  // kulisty: R 40, ap 16 → połowa cięciwy √(ap(2R − ap)) = 32
  const bx = 100, R = 40, apB = 16, hb = Math.sqrt(apB * (2 * R - apB));
  // z promieniem naroża: D 80, rε 24, ap 12 → połowa = (R − rε) + √(ap(2rε − ap)) ≈ 16 + 20,8
  const ux = 260, re = 24, apT = 12, ht = R - re + Math.sqrt(apT * (2 * re - apT));
  const bc = y0 + apB - R, tc = y0 + apT - re;
  return (
    <Fig id="tkb" code="De" title="Frez kulisty i z promieniem naroża — średnica skrawania" h={240}
      legend={[["acc", "część ostrza w materiale"], "dim", "stock"]}
      caption={<>Przy głębokości <b>ap</b> mniejszej niż promień czoła frez skrawa na średnicy <b>De</b> mniejszej niż nominalna <b>D</b>. Obroty liczy się z De, nie z D. W osi freza kulistego prędkość skrawania spada do zera. Lewo: frez kulisty (promień czoła D/2), prawo: frez z promieniem naroża rε.</>}>
      {(c) => (
        <g>
          <path d={`M 14 ${y0} H ${bx - hb} A ${R} ${R} 0 0 0 ${bx + hb} ${y0} H ${ux - ht} A ${re} ${re} 0 0 0 ${ux - R + re} ${y0 + apT} H ${ux + R - re} A ${re} ${re} 0 0 0 ${ux + ht} ${y0} H 346 V 226 H 14 Z`} fill={c.hatch} className="p-con" />
          {/* frez kulisty */}
          <path d={`M ${bx - R} 46 V ${bc} A ${R} ${R} 0 0 0 ${bx + R} ${bc} V 46 Z`} className="cutter" />
          <path d={`M ${bx - hb} ${y0} A ${R} ${R} 0 0 0 ${bx + hb} ${y0}`} className="p-acc thick" />
          <line x1={bx} y1={34} x2={bx} y2={y0 + apB + 14} className="axis-c" />
          {/* frez z promieniem naroża */}
          <path d={`M ${ux - R} 46 V ${tc} A ${re} ${re} 0 0 0 ${ux - R + re} ${y0 + apT} H ${ux + R - re} A ${re} ${re} 0 0 0 ${ux + R} ${tc} V 46 Z`} className="cutter" />
          <path d={`M ${ux - ht} ${y0} A ${re} ${re} 0 0 0 ${ux - R + re} ${y0 + apT} H ${ux + R - re} A ${re} ${re} 0 0 0 ${ux + ht} ${y0}`} className="p-acc thick" />
          <line x1={ux} y1={34} x2={ux} y2={y0 + apT + 14} className="axis-c" />
          {/* wymiary */}
          <Dim c={c} x1={bx - R} y1={40} x2={bx + R} y2={40} label="D" lside={-1} />
          <Dim c={c} x1={ux - R} y1={40} x2={ux + R} y2={40} label="D" lside={-1} />
          <Dim c={c} x1={bx - hb} y1={y0} x2={bx + hb} y2={y0} off={48} label="De" lside={1} />
          <Dim c={c} x1={ux - ht} y1={y0} x2={ux + ht} y2={y0} off={48} label="De" lside={1} />
          <line x1={bx} y1={y0 + apB} x2={bx + 62} y2={y0 + apB} className="p-ext" />
          <Dim c={c} x1={bx + 56} y1={y0} x2={bx + 56} y2={y0 + apB} label="ap" lside={1} />
          <line x1={ux + R - re} y1={y0 + apT} x2={ux + R + 20} y2={y0 + apT} className="p-ext" />
          <Dim c={c} x1={ux + R + 14} y1={y0} x2={ux + R + 14} y2={y0 + apT} label="ap" lside={1} />
          <line x1={ux - R + re} y1={tc} x2={ux - R + re - re * Math.cos(rad(45))} y2={tc + re * Math.sin(rad(45))} className="p-dim" markerEnd={c.a("dim")} />
          <T x={ux - R + re - 2} y={tc - 6} anchor="middle" cls="t-mono t-dim">rε</T>
          <T x={bx} y={y0 + apB + 20} anchor="middle" cls="t-sm t-mut">Vc = 0 w osi</T>
          <Pt x={bx} y={y0 + apB} />
        </g>
      )}
    </Fig>
  );
}

/* ================= grzbiety między przejściami freza kulistego ================= */
export function Scallops() {
  const R = 44, ae = 70, cy = 126, xs = [60, 130, 200, 270];
  const yc = cy + Math.sqrt(R * R - (ae / 2) ** 2);  // wierzchołek grzbietu
  const yb = cy + R;
  let d = `M ${xs[0] - ae / 2} ${yc.toFixed(1)}`;
  for (const x of xs) d += ` A ${R} ${R} 0 0 0 ${x + ae / 2} ${yc.toFixed(1)}`;
  d += ` V 214 H ${xs[0] - ae / 2} Z`;
  const t = xs[3], a0 = xs[0], a1 = xs[1], xc = (a0 + a1) / 2;
  return (
    <Fig id="tks" code="h" title="Grzbiety między przejściami freza kulistego" h={226}
      legend={[["cons", "poprzednie przejścia"], "dim", "stock"]}
      caption={<>Przekrój w poprzek przejść. Każde przejście zostawia łuk o promieniu czoła <b>R</b>. Między łukami zostają grzbiety o wysokości <b>h</b>, która rośnie z krokiem bocznym <b>ae</b> i maleje z promieniem: h ≈ ae² / (8 · R).</>}>
      {(c) => (
        <g>
          <path d={d} fill={c.hatch} className="p-con" />
          {xs.filter((x) => x !== t).map((x) => <circle key={x} cx={x} cy={cy} r={R} className="p-cons" />)}
          <path d={`M ${t - R} 36 V ${cy} A ${R} ${R} 0 0 0 ${t + R} ${cy} V 36 Z`} className="cutter" />
          <line x1={t} y1={30} x2={t} y2={yb + 8} className="axis-c" />
          <line x1={a0} y1={56} x2={a0} y2={cy} className="p-ext" /><line x1={a1} y1={56} x2={a1} y2={cy} className="p-ext" />
          <Dim c={c} x1={a0} y1={60} x2={a1} y2={60} label="ae" lside={-1} />
          <line x1={a1} y1={cy} x2={a1 + R * Math.cos(rad(60))} y2={cy + R * Math.sin(rad(60))} className="p-dim" markerEnd={c.a("dim")} />
          <T x={a1 + 20} y={cy + 10} anchor="middle" cls="t-mono t-dim">R</T>
          <line x1={a0} y1={yb} x2={a1} y2={yb} className="p-cons" />
          <Dim c={c} x1={xc} y1={yc} x2={xc} y2={yb} label="h" lside={-1} />
          <Pt x={xc} y={yc} />
        </g>
      )}
    </Fig>
  );
}

/* ================= kąt przystawienia głowicy: grubość wióra i kierunek siły ================= */
function EnteringPanel({ x0, kr, ap, c, label, force }: { x0: number; kr: number; ap: number; c: Ctx; label: string; force: string }) {
  const top = 70, fz = 16, cx = x0 + 78;
  const u: [number, number] = [-Math.cos(rad(kr)), -Math.sin(rad(kr))];   // krawędź: od naroża w górę i na zewnątrz
  const n: [number, number] = [Math.sin(rad(kr)), -Math.cos(rad(kr))];    // normalna w stronę narzędzia
  const run = ap / Math.tan(rad(kr));
  const C: [number, number] = [cx, top + ap], Cp: [number, number] = [cx + fz, top + ap];
  const Tc: [number, number] = [cx - run, top], Tp: [number, number] = [cx + fz - run, top];
  const m: [number, number] = [(C[0] + Tc[0]) / 2, (C[1] + Tc[1]) / 2];
  const hex = fz * Math.sin(rad(kr));
  const ext = 10; // krawędź wystaje nad materiał
  return (
    <g>
      <T x={x0 + 60} y={24} anchor="middle" cls="t-b">κr = {kr}°</T>
      <path d={P([[x0 + 6, top], Tp, Cp, [x0 + 114, top + ap], [x0 + 114, 186], [x0 + 6, 186]])} fill={c.hatch} className="p-con" />
      <path d={P([Tc, Tp, Cp, C])} className="p-fill-acc" />
      <line x1={C[0]} y1={C[1]} x2={Tc[0] + u[0] * ext} y2={Tc[1] + u[1] * ext} className="p-acc thick" />
      <path d={arc(C[0], C[1], 18, 180 - kr, 180)} className="p-dim" />
      <line x1={m[0] - n[0] * 4} y1={m[1] - n[1] * 4} x2={m[0] - n[0] * 30} y2={m[1] - n[1] * 30} className="p-dim" markerEnd={c.a("dim")} />
      <T x={m[0] - n[0] * 38} y={m[1] - n[1] * 38 + 4} anchor="middle" cls="t-mono t-dim">F</T>
      <line x1={Tc[0]} y1={top} x2={Tc[0]} y2={top - 14} className="p-ext" />
      <line x1={Tp[0]} y1={top} x2={Tp[0]} y2={top - 14} className="p-ext" />
      <Dim c={c} x1={Tc[0]} y1={top - 10} x2={Tp[0]} y2={top - 10} label="fz" lside={-1} />
      <T x={x0 + 60} y={204} anchor="middle" cls="t-mono t-sm">hex {hex >= fz - 0.01 ? "= fz" : `≈ ${(hex / fz).toFixed(2).replace(".", ",")} · fz`}</T>
      <T x={x0 + 60} y={220} anchor="middle" cls="t-sm t-mut">{label}</T>
      <T x={x0 + 60} y={234} anchor="middle" cls="t-sm t-mut">{force}</T>
    </g>
  );
}
export function EnteringAngles() {
  return (
    <Fig id="tka" code="κr" title="Kąt przystawienia głowicy — grubość wióra i kierunek siły" h={244}
      legend={[["acc", "krawędź i przekrój wióra"], "dim", "stock"]}
      caption={<>Przekrój wzdłuż posuwu (posuw w lewo). Przy tym samym posuwie na ostrze <b>fz</b> grubość wióra <b>hex</b> = fz · sin κr maleje razem z kątem przystawienia, a siła <b>F</b> na przedmiot obraca się z kierunku poprzecznego do osiowego. Głębokość przy 10° narysowano mniejszą: takie głowice pracują przy małym ap.</>}>
      {(c) => (
        <g>
          <EnteringPanel x0={0} kr={90} ap={40} c={c} label="ścianka 90°" force="mała siła osiowa" />
          <EnteringPanel x0={120} kr={45} ap={40} c={c} label="planowanie ogólne" force="siły wyrównane" />
          <EnteringPanel x0={240} kr={10} ap={12} c={c} label="duży posuw, małe ap" force="duża siła osiowa" />
        </g>
      )}
    </Fig>
  );
}

/* ================= położenie głowicy względem przedmiotu (widok z góry) ================= */
export function FaceMillPosition() {
  const y0 = 70, y1 = 150, cx = 200, cy = 122, r = 55;
  const inX = cx - Math.sqrt(r * r - (y1 - cy) ** 2), outX = cx - Math.sqrt(r * r - (cy - y0) ** 2);
  return (
    <Fig id="tkp" code="Dc ae" title="Położenie głowicy względem przedmiotu — widok z góry" h={244}
      legend={[["cut", "wejście i wyjście ostrza"], ["cons", "oś przedmiotu"], "dim"]}
      caption={<>Średnica głowicy <b>Dc</b> większa od szerokości frezowania <b>ae</b>, a oś głowicy przesunięta względem osi przedmiotu. Ostrze wchodzi w materiał przy grubym wiórze, a wychodzi przy cienkim. Obroty M03 (w prawo, patrząc od wrzeciona), posuw w lewo.</>}>
      {(c) => (
        <g>
          <rect x={30} y={y0} width={cx - 30} height={y1 - y0} fill={c.hatch} className="p-con" />
          <rect x={cx} y={y0} width={330 - cx} height={y1 - y0} className="panel-bg" />
          <line x1={cx} y1={y0} x2={330} y2={y0} className="p-con" /><line x1={cx} y1={y1} x2={330} y2={y1} className="p-con" />
          <line x1={330} y1={y0} x2={330} y2={y1} className="p-con" />
          <line x1={16} y1={(y0 + y1) / 2} x2={344} y2={(y0 + y1) / 2} className="axis-c" />
          <T x={300} y={y0 + 18} anchor="middle" cls="t-sm t-mut">obrobione</T>
          <circle cx={cx} cy={cy} r={r} className="cutter" />
          {[0, 60, 120, 180, 240, 300].map((a) => { const [x, y] = at(cx, cy, r - 6, a); return <rect key={a} x={x - 4} y={y - 4} width={8} height={8} rx={1} className="holder" />; })}
          <line x1={cx - 5} y1={cy} x2={cx + 5} y2={cy} className="p-dim" /><line x1={cx} y1={cy - 5} x2={cx} y2={cy + 5} className="p-dim" />
          <path d={arc(cx, cy, r + 9, 20, 70)} className="rot" markerStart={c.a("dim")} />
          <Pt x={inX} y={y1} dot="pt-cut" />
          <Pt x={outX} y={y0} dot="pt-cut" />
          <T x={inX - 6} y={y1 + 18} anchor="end" cls="t-sm">wejście: gruby wiór</T>
          <T x={outX - 6} y={y0 - 10} anchor="end" cls="t-sm">wyjście: cienki wiór</T>
          <Dim c={c} x1={24} y1={y0} x2={24} y2={y1} label="ae" lside={1} />
          <line x1={cx - r} y1={cy} x2={cx - r} y2={214} className="p-ext" /><line x1={cx + r} y1={cy} x2={cx + r} y2={214} className="p-ext" />
          <Dim c={c} x1={cx - r} y1={208} x2={cx + r} y2={208} label="Dc" lside={-1} />
          <line x1={120} y1={228} x2={60} y2={228} className="p-dim" markerEnd={c.a("dim")} />
          <T x={128} y={232} cls="t-sm t-mut">posuw</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= frez tarczowy i frez teowy ================= */
export function DiscTSlot() {
  return (
    <Fig id="tkt" code="T" title="Frez tarczowy i frez teowy" h={240}
      legend={[["acc", "krawędzie skrawające"], "stock"]}
      caption={<>Lewo: frez tarczowy na trzpieniu frezarskim w rowku (widok wzdłuż posuwu). Prawo: frez teowy w rowku teowym. <b>1</b> tarcza · <b>2</b> ostrza na obwodzie · <b>3</b> ostrza boczne · <b>4</b> trzpień frezarski · <b>5</b> szyjka · <b>6</b> rowek wykonany wcześniej frezem walcowym · <b>7</b> podcięcie wykonane frezem teowym.</>}>
      {(c) => (
        <g>
          {/* frez tarczowy */}
          <path d={P([[20, 120], [78, 120], [78, 160], [102, 160], [102, 120], [160, 120], [160, 220], [20, 220]])} fill={c.hatch} className="p-con" />
          <rect x={10} y={94} width={156} height={12} className="holder" />
          <line x1={6} y1={100} x2={170} y2={100} className="axis-c" />
          <rect x={78} y={40} width={24} height={120} rx={2} className="cutter" />
          <line x1={78} y1={160} x2={102} y2={160} className="p-acc thick" />
          <line x1={78} y1={138} x2={78} y2={160} className="p-acc thick" /><line x1={102} y1={138} x2={102} y2={160} className="p-acc thick" />
          <line x1={90} y1={34} x2={90} y2={58} className="p-ext" /><Step x={90} y={26} n={1} />
          <line x1={128} y1={172} x2={100} y2={160} className="p-ext" /><Step x={136} y={176} n={2} />
          <line x1={50} y1={148} x2={78} y2={150} className="p-ext" /><Step x={42} y={146} n={3} />
          <line x1={30} y1={86} x2={30} y2={94} className="p-ext" /><Step x={30} y={78} n={4} />
          {/* frez teowy */}
          <path d={P([[190, 90], [258, 90], [258, 160], [238, 160], [238, 188], [302, 188], [302, 160], [282, 160], [282, 90], [350, 90], [350, 220], [190, 220]])} fill={c.hatch} className="p-con" />
          <rect x={255} y={14} width={30} height={52} className="holder" />
          <rect x={263} y={66} width={14} height={98} className="cutter" />
          <rect x={240} y={163} width={60} height={22} rx={2} className="cutter" />
          <line x1={240} y1={163} x2={240} y2={185} className="p-acc thick" /><line x1={300} y1={163} x2={300} y2={185} className="p-acc thick" />
          <line x1={240} y1={163} x2={263} y2={163} className="p-acc" /><line x1={277} y1={163} x2={300} y2={163} className="p-acc" />
          <line x1={240} y1={185} x2={300} y2={185} className="p-acc" />
          <line x1={270} y1={8} x2={270} y2={200} className="axis-c" />
          <line x1={300} y1={60} x2={277} y2={78} className="p-ext" /><Step x={308} y={54} n={5} />
          <line x1={226} y1={112} x2={258} y2={120} className="p-ext" /><Step x={218} y={110} n={6} />
          <line x1={326} y1={200} x2={302} y2={182} className="p-ext" /><Step x={334} y={206} n={7} />
        </g>
      )}
    </Fig>
  );
}

/* ================= frez fazowy na krawędzi ================= */
export function ChamferMill() {
  const top = 100, wall = 200, cc = 20;           // faza c × 45°
  const ax = 216, tip = 130, rt = 6, rMax = 40;    // oś, wierzchołek, promień czoła, największy promień stożka
  const coneTop = tip - (rMax - rt);
  const ym = top + cc / 2, rm = rt + (tip - ym);   // średnica skrawania w połowie fazy
  return (
    <Fig id="tkf" code="45°" title="Frez fazowy na krawędzi — średnica skrawania" h={228}
      legend={[["acc", "krawędź skrawająca"], "dim", "stock"]}
      caption={<>Frez fazowy 90° (kąt przystawienia 45°) z płaskim czołem o średnicy <b>dt</b>. Wierzchołek schodzi na głębokość <b>h</b> poniżej górnej powierzchni, poza ścianą detalu. Wielkość fazy <b>c</b> zależy od położenia narzędzia w Z i w XY. Średnica skrawania <b>De</b> zmienia się wzdłuż fazy — obroty liczy się dla średnicy w miejscu skrawania.</>}>
      {(c) => (
        <g>
          <path d={P([[14, top], [wall - cc, top], [wall, top + cc], [wall, 214], [14, 214]])} fill={c.hatch} className="p-con" />
          <rect x={ax - rMax} y={24} width={2 * rMax} height={coneTop - 24} className="holder" />
          <path d={P([[ax - rMax, coneTop], [ax + rMax, coneTop], [ax + rt, tip], [ax - rt, tip]])} className="cutter" />
          <line x1={ax - rMax} y1={coneTop} x2={ax - rt} y2={tip} className="p-acc thick" />
          <line x1={ax} y1={16} x2={ax} y2={tip + 16} className="axis-c" />
          <line x1={wall - cc} y1={top} x2={wall} y2={top + cc} className="p-con thick" />
          {/* wymiary */}
          <line x1={wall - cc} y1={top} x2={wall - cc} y2={top - 22} className="p-ext" /><line x1={wall} y1={top + cc} x2={wall} y2={top - 22} className="p-ext" />
          <Dim c={c} x1={wall - cc} y1={top - 16} x2={wall} y2={top - 16} label="c" lside={-1} />
          <line x1={ax + rt} y1={tip} x2={ax + rMax + 26} y2={tip} className="p-ext" /><line x1={ax + rMax} y1={top} x2={ax + rMax + 26} y2={top} className="p-ext" />
          <line x1={wall} y1={top} x2={ax - rMax} y2={top} className="p-ext" />
          <Dim c={c} x1={ax + rMax + 20} y1={top} x2={ax + rMax + 20} y2={tip} label="h" lside={1} />
          <Dim c={c} x1={ax - rt} y1={tip} x2={ax + rt} y2={tip} off={16} label="dt" lside={1} />
          <Dim c={c} x1={ax - rm} y1={ym} x2={ax + rm} y2={ym} label="De" lside={-1} />
          <T x={60} y={190} cls="t-sm">detal</T>
          <T x={ax + rMax + 8} y={56} cls="t-sm">frez fazowy</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= sylwetki frezów (porównanie) ================= */
function Sil({ x, y, kind, label }: { x: number; y: number; kind: string; label: string }) {
  const shank = <rect x={x - 9} y={y} width={18} height={30} className="holder" />;
  let head: ReactNode = null;
  switch (kind) {
    case "walcowy": head = <><rect x={x - 14} y={y + 30} width={28} height={50} className="cutter" /><line x1={x - 14} y1={y + 80} x2={x + 14} y2={y + 80} className="p-acc thick" /><line x1={x - 14} y1={y + 44} x2={x + 2} y2={y + 80} className="p-sym" /><line x1={x - 2} y1={y + 30} x2={x + 14} y2={y + 64} className="p-sym" /></>; break;
    case "kulisty": head = <><path d={`M ${x - 14} ${y + 30} V ${y + 66} A 14 14 0 0 0 ${x + 14} ${y + 66} V ${y + 30} Z`} className="cutter" /><path d={`M ${x - 14} ${y + 66} A 14 14 0 0 0 ${x + 14} ${y + 66}`} className="p-acc thick" /></>; break;
    case "naroze": head = <><path d={`M ${x - 14} ${y + 30} V ${y + 72} A 6 6 0 0 0 ${x - 8} ${y + 78} H ${x + 8} A 6 6 0 0 0 ${x + 14} ${y + 72} V ${y + 30} Z`} className="cutter" /><path d={`M ${x - 14} ${y + 72} A 6 6 0 0 0 ${x - 8} ${y + 78} H ${x + 8} A 6 6 0 0 0 ${x + 14} ${y + 72}`} className="p-acc thick" /></>; break;
    case "fazowy": head = <><path d={P([[x - 18, y + 30], [x + 18, y + 30], [x + 18, y + 44], [x + 3, y + 72], [x - 3, y + 72], [x - 18, y + 44]])} className="cutter" /><line x1={x - 18} y1={y + 44} x2={x - 3} y2={y + 72} className="p-acc thick" /><line x1={x + 18} y1={y + 44} x2={x + 3} y2={y + 72} className="p-acc thick" /></>; break;
    case "glowica": head = <><rect x={x - 32} y={y + 40} width={64} height={26} rx={2} className="cutter" />{[-28, 20].map((dx) => <rect key={dx} x={x + dx} y={y + 58} width={8} height={10} className="holder" />)}<line x1={x - 32} y1={y + 68} x2={x - 24} y2={y + 68} className="p-acc thick" /><line x1={x + 24} y1={y + 68} x2={x + 32} y2={y + 68} className="p-acc thick" /></>; break;
    case "tarczowy": head = <><circle cx={x} cy={y + 46} r={32} className="cutter" /><circle cx={x} cy={y + 46} r={32} className="p-acc" /><circle cx={x} cy={y + 46} r={8} className="holder" /></>; break;
    case "teowy": head = <><rect x={x - 5} y={y + 30} width={10} height={36} className="cutter" /><rect x={x - 24} y={y + 66} width={48} height={12} rx={1.5} className="cutter" /><line x1={x - 24} y1={y + 66} x2={x - 24} y2={y + 78} className="p-acc thick" /><line x1={x + 24} y1={y + 66} x2={x + 24} y2={y + 78} className="p-acc thick" /></>; break;
  }
  return <g>{kind !== "tarczowy" && shank}{head}<T x={x} y={y + 96} anchor="middle" cls="t-sm">{label}</T></g>;
}
export function MillTypes() {
  return (
    <Fig id="tkm" code="frezy" title="Rodzaje frezów — sylwetki" h={228} legend={[["acc", "krawędzie skrawające"]]}
      caption={<>Górny rząd: frezy trzpieniowe różniące się kształtem czoła. Dolny rząd: głowica frezowa z płytkami, frez tarczowy (na trzpieniu frezarskim, widok z boku) i frez teowy. Proporcje poglądowe.</>}>
      {() => (
        <g>
          <Sil x={45} y={10} kind="walcowy" label="walcowy" />
          <Sil x={135} y={10} kind="kulisty" label="kulisty" />
          <Sil x={225} y={10} kind="naroze" label="z promieniem naroża" />
          <Sil x={315} y={10} kind="fazowy" label="fazowy" />
          <Sil x={90} y={118} kind="glowica" label="głowica frezowa" />
          <Sil x={180} y={118} kind="tarczowy" label="tarczowy" />
          <Sil x={270} y={118} kind="teowy" label="teowy" />
        </g>
      )}
    </Fig>
  );
}

export const frezyFigs: Record<string, () => ReactNode> = {
  "tech-klin": () => <WedgeAngles />,
  "tech-katy-rzut": () => <PlanAngles />,
  "tech-frez-kulisty": () => <BallBullDe />,
  "tech-grzbiety": () => <Scallops />,
  "tech-glowica-katy": () => <EnteringAngles />,
  "tech-glowica-pozycja": () => <FaceMillPosition />,
  "tech-frez-tarczowy": () => <DiscTSlot />,
  "tech-frez-fazowy": () => <ChamferMill />,
  "tech-frezy": () => <MillTypes />,
};
