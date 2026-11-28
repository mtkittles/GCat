import type { ReactNode } from "react";
import { Dim, Fig, Step, T } from "@/components/fig";

/*
  Rysunki V3.1c (dział Narzędzia: noże tokarskie) — styl jak figs-otwory.tsx: szerokość 360, materiał kreskowany,
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

/* ================= nóż tokarski zewnętrzny: oprawka, płytka, docisk, podkładka; κr ================= */
export function ExternalTool() {
  const tx = 132, ty = 92, ap = 26, kr = 95, krp = 5, L = 62;
  const d1: [number, number] = [-Math.cos(rad(kr)), Math.sin(rad(kr))];   // krawędź główna
  const d2: [number, number] = [Math.cos(rad(krp)), Math.sin(rad(krp))];  // krawędź pomocnicza
  const v1: [number, number] = [tx + L * d1[0], ty + L * d1[1]], v2: [number, number] = [tx + L * d2[0], ty + L * d2[1]];
  const v3: [number, number] = [v1[0] + L * d2[0], v1[1] + L * d2[1]];
  const cx = (tx + v3[0]) / 2, cy = (ty + v3[1]) / 2;
  const q: [number, number] = [tx + (ap / d1[1]) * d1[0], ty + ap];
  const grow = (p: [number, number], k: number): [number, number] => [cx + (p[0] - cx) * k, cy + (p[1] - cy) * k];
  return (
    <Fig id="tnz" code="nóż zewnętrzny" title="Nóż tokarski zewnętrzny — budowa" h={244}
      legend={[["acc", "krawędź skrawająca i κr"], ["cons", "kierunek posuwu"], "stock"]}
      caption={<>Widok z góry na nóż z płytką rombową 80° przy toczeniu wzdłużnym; proporcje poglądowe.</>}>
      {(c) => (
        <g>
          <line x1={10} y1={22} x2={350} y2={22} className="axis-c" />
          <T x={14} y={16} cls="t-sm t-mut">oś przedmiotu</T>
          <path d={P([[14, 28], [346, 28], [346, ty], [tx, ty], q, [14, q[1]]])} fill={c.hatch} className="p-con" />
          {/* oprawka: głowica pod płytką i trzonek */}
          <path d={P([[tx + 6, ty + 10], [v2[0] + 10, v2[1] - 2], [v3[0] + 22, v3[1] - 8], [350, v3[1] - 8], [350, 236], [v1[0] + 2, 236], [v1[0] - 2, v1[1] + 6]])} className="holder" />
          {/* podkładka (obrys większy od płytki) */}
          <path d={P([grow([tx, ty], 1.08), grow(v2, 1.08), grow(v3, 1.08), grow(v1, 1.08)])} className="p-cons" fill="none" />
          {/* płytka i docisk */}
          <path d={P([[tx, ty], v2, v3, v1])} className="cutter" />
          <circle cx={cx} cy={cy} r={8} className="holder" />
          <circle cx={cx} cy={cy} r={3} className="p-sym" fill="none" />
          <line x1={tx} y1={ty} x2={tx + (q[0] - tx) * 1.5} y2={ty + (q[1] - ty) * 1.5} className="p-acc thick" />
          {/* κr: od kierunku posuwu do krawędzi głównej */}
          <line x1={tx} y1={ty} x2={tx - 70} y2={ty} className="p-cons" />
          <path d={arc(tx, ty, 26, 180, 180 + kr)} className="p-acc" />
          {(() => { const [x, y] = at(tx, ty, 40, 180 + kr * 0.7); return <T x={x - 4} y={y + 8} anchor="middle" cls="t-acc t-b">κr</T>; })()}
          <Dim c={c} x1={64} y1={ty} x2={64} y2={q[1]} label="ap" lside={-1} />
          <line x1={110} y1={206} x2={40} y2={206} className="p-dim" markerEnd={c.a("dim")} />
          <T x={75} y={198} anchor="middle" cls="t-sm t-mut">posuw f</T>
          {/* odnośniki */}
          <line x1={316} y1={170} x2={300} y2={190} className="p-ext" /><Step x={322} y={162} n={1} />
          <line x1={226} y1={70} x2={v2[0] - 12} y2={v2[1] + 14} className="p-ext" /><Step x={232} y={62} n={2} />
          <line x1={272} y1={118} x2={cx + 7} y2={cy - 3} className="p-ext" /><Step x={280} y={112} n={3} />
          <line x1={250} y1={214} x2={grow(v3, 1.08)[0] - 4} y2={grow(v3, 1.08)[1] - 2} className="p-ext" /><Step x={256} y={222} n={4} />
          <line x1={160} y1={50} x2={tx + 2} y2={ty - 2} className="p-ext" /><Step x={166} y={44} n={5} />
        </g>
      )}
    </Fig>
  );
}

/* ================= nóż wewnętrzny (wytaczak): wysięg L i średnica trzonka D ================= */
export function BoringBar() {
  const yt = 64, yb = 140, ax = (yt + yb) / 2, rb = 22;     // otwór i trzonek
  const xt = 92, xc = 270;                                    // ostrze, czoło tulei mocującej
  return (
    <Fig id="tbb" code="nóż wewnętrzny" title="Nóż wewnętrzny (wytaczak) — wysięg i średnica trzonka" h={236}
      legend={[["acc", "krawędź skrawająca"], "allow", "stock", "dim"]}
      caption={<>Przekrój przez otwór; wytaczak skrawa od czoła w głąb, a sztywność zależy od stosunku wysięgu L do średnicy D.</>}>
      {(c) => (
        <g>
          {/* ścianki otworu (przedmiot w uchwycie z lewej) */}
          <rect x={20} y={24} width={190} height={yt - 24} fill={c.hatch} className="p-con" />
          <rect x={20} y={yb} width={190} height={40} fill={c.hatch} className="p-con" />
          <rect x={20} y={yt} width={xt - 20} height={6} className="allow" />
          <line x1={10} y1={ax} x2={350} y2={ax} className="axis-c" />
          {/* trzonek z kanałem chłodziwa i tuleja */}
          <rect x={xt + 6} y={ax - rb} width={330 - xt} height={2 * rb} className="holder" />
          <line x1={xt + 14} y1={ax - 8} x2={340} y2={ax - 8} className="p-cons" />
          <path d={`M ${xt + 14} ${ax - 8} L ${xt + 8} ${yt + 14}`} className="p-cons" />
          <rect x={xc} y={ax - rb - 12} width={80} height={2 * rb + 24} className="holder" />
          {/* płytka u góry, przy ściance */}
          <path d={P([[xt, yt], [xt + 22, yt], [xt + 22, yt + 14], [xt + 8, yt + 18]])} className="cutter" />
          <line x1={xt} y1={yt} x2={xt + 8} y2={yt + 18} className="p-acc thick" />
          <line x1={xt - 30} y1={yt + 30} x2={xt - 60} y2={yt + 30} className="p-dim" markerEnd={c.a("dim")} />
          <T x={xt - 45} y={yt + 46} anchor="middle" cls="t-sm t-mut">posuw f</T>
          {/* wymiary */}
          <Dim c={c} x1={xt} y1={206} x2={xc} y2={206} label="L" lside={1} />
          <line x1={xt} y1={yt + 20} x2={xt} y2={210} className="p-ext" />
          <line x1={xc} y1={ax + rb + 12} x2={xc} y2={210} className="p-ext" />
          <Dim c={c} x1={236} y1={ax - rb} x2={236} y2={ax + rb} label="D" lside={-1} />
          {/* odnośniki */}
          <line x1={180} y1={ax + 40} x2={172} y2={ax + rb - 2} className="p-ext" /><Step x={184} y={ax + 50} n={1} />
          <line x1={128} y1={40} x2={xt + 14} y2={yt + 4} className="p-ext" /><Step x={132} y={14} n={2} />
          <line x1={204} y1={40} x2={200} y2={ax - 10} className="p-ext" /><Step x={226} y={14} n={3} />
          <line x1={330} y1={40} x2={318} y2={ax - rb - 12} className="p-ext" /><Step x={334} y={30} n={4} />
        </g>
      )}
    </Fig>
  );
}

/* ================= przecinak: widok z boku i od czoła (wysokość osi, czop) ================= */
export function PartingTool() {
  // widok z boku: pręt, rowek szerokości w, ostrze nożowe od dołu
  const yt = 34, yb = 154, ax = (yt + yb) / 2, gx = 92, w = 14, ytip = ax + 10;
  // widok od czoła
  const cx = 268, cy = 94, R = 60;
  return (
    <Fig id="tpc" code="przecinak" title="Przecinak — budowa i ustawienie na wysokości osi" h={246}
      legend={[["acc", "krawędź skrawająca"], ["cons", "strefa zmniejszonego posuwu"], "stock", "dim"]}
      caption={<>Z lewej widok z boku na przecinanie pręta, z prawej widok od czoła; proporcje poglądowe.</>}>
      {(c) => (
        <g>
          {/* widok z boku */}
          <path d={P([[20, yt], [170, yt], [170, yb], [gx + w, yb], [gx + w, ytip], [gx, ytip], [gx, yb], [20, yb]])} fill={c.hatch} className="p-con" />
          <line x1={10} y1={ax} x2={180} y2={ax} className="axis-c" />
          <rect x={gx - 4} y={ax - 12} width={w + 8} height={24} className="p-cons" fill="none" />
          <path d={P([[gx, ytip], [gx + w, ytip], [gx + w, ytip + 14], [gx + w - 2, ytip + 16], [gx + 2, ytip + 16], [gx, ytip + 14]])} className="cutter" />
          <line x1={gx} y1={ytip} x2={gx + w} y2={ytip} className="p-acc thick" />
          <rect x={gx + 2} y={ytip + 16} width={w - 4} height={196 - ytip - 16} className="holder" />
          <rect x={56} y={196} width={86} height={30} className="holder" />
          <line x1={150} y1={214} x2={150} y2={176} className="p-dim" markerEnd={c.a("dim")} />
          <T x={154} y={232} cls="t-sm t-mut">posuw f</T>
          <Dim c={c} x1={gx} y1={yt - 12} x2={gx + w} y2={yt - 12} label="w" lside={-1} />
          <line x1={gx} y1={yt - 16} x2={gx} y2={yt} className="p-ext" />
          <line x1={gx + w} y1={yt - 16} x2={gx + w} y2={yt} className="p-ext" />
          {/* widok od czoła */}
          <circle cx={cx} cy={cy} r={R} fill={c.hatch} className="p-con" />
          <line x1={cx - R - 18} y1={cy} x2={cx + R + 18} y2={cy} className="axis-c" />
          <line x1={cx} y1={cy - R - 10} x2={cx} y2={cy + R + 10} className="axis-c" />
          <rect x={cx - 10} y={cy + 8} width={20} height={14} className="cutter" />
          <line x1={cx - 10} y1={cy + 8} x2={cx + 10} y2={cy + 8} className="p-acc thick" />
          <rect x={cx - 8} y={cy + 22} width={16} height={196 - cy - 22} className="holder" />
          <rect x={cx - 34} y={196} width={68} height={30} className="holder" />
          <circle cx={cx} cy={cy} r={5} className="p-fill-acc" />
          <T x={cx + R + 4} y={cy - 6} cls="t-sm t-mut">oś</T>
          {/* odnośniki */}
          <line x1={34} y1={226} x2={56} y2={214} className="p-ext" /><Step x={28} y={232} n={1} />
          <line x1={40} y1={180} x2={gx + 2} y2={186} className="p-ext" /><Step x={34} y={176} n={2} />
          <line x1={58} y1={ytip + 28} x2={gx} y2={ytip + 8} className="p-ext" /><Step x={52} y={ytip + 34} n={3} />
          <line x1={340} y1={40} x2={cx + 4} y2={cy - 4} className="p-ext" /><Step x={344} y={32} n={4} />
        </g>
      )}
    </Fig>
  );
}

/* ================= nóż do gwintów: oprawka, płytka, podkładka; kąt wzniosu zwoju ================= */
export function ThreadingTool() {
  const sy = 70, H = 22, half = H * Math.tan(rad(30));
  const xs = [26, 52, 78, 104, 130, 156, 182];
  const tip = 104;                          // płytka w zwoju nr 4
  // rozwinięcie zwoju: podstawa π·d2, wysokość P
  const bx = 228, by = 196, bw = 112, bh = 40;
  return (
    <Fig id="tng" code="nóż do gwintów" title="Nóż do gwintów — budowa i kąt wzniosu zwoju" h={236}
      legend={[["acc", "zarys płytki i kąty"], "stock", "dim"]}
      caption={<>Z lewej nóż w zwoju gwintu zewnętrznego, z prawej rozwinięcie jednego zwoju na średnicy podziałowej.</>}>
      {(c) => (
        <g>
          {/* przedmiot z zarysem gwintu (od góry) */}
          <path d={`M 14 22 L 200 22 L 200 ${sy} ${xs.map((x) => `L ${x + half} ${sy} L ${x} ${sy + H} L ${x - half} ${sy}`).reverse().join(" ")} L 14 ${sy} Z`} fill={c.hatch} className="p-con" />
          <line x1={10} y1={30} x2={206} y2={30} className="axis-c" />
          {/* oprawka, podkładka, płytka */}
          <path d={P([[tip - 34, sy + H + 40], [tip + 40, sy + H + 40], [tip + 40, 228], [tip - 34, 228]])} className="holder" />
          <rect x={tip - 30} y={sy + H + 30} width={66} height={10} className="p-cons" fill="none" />
          <path d={P([[tip, sy + H], [tip + half + 8, sy + H + 30], [tip - half - 8, sy + H + 30]])} className="cutter" />
          <path d={`M ${tip - half - 8} ${sy + H + 30} L ${tip} ${sy + H} L ${tip + half + 8} ${sy + H + 30}`} className="p-acc thick" fill="none" />
          <circle cx={tip} cy={sy + H + 22} r={4} className="holder" />
          <path d={arc(tip, sy + H, 16, 60, 120)} className="p-acc" />
          <T x={tip} y={sy + H - 20} anchor="middle" cls="t-acc t-b">60°</T>
          <Dim c={c} x1={xs[1]} y1={sy - 16} x2={xs[2]} y2={sy - 16} label="P" lside={-1} />
          <line x1={xs[1]} y1={sy - 20} x2={xs[1]} y2={sy + H} className="p-ext" />
          <line x1={xs[2]} y1={sy - 20} x2={xs[2]} y2={sy + H} className="p-ext" />
          {/* odnośniki */}
          <line x1={176} y1={214} x2={tip + 40} y2={206} className="p-ext" /><Step x={182} y={220} n={1} />
          <line x1={176} y1={124} x2={tip + 12} y2={sy + H + 18} className="p-ext" /><Step x={182} y={120} n={2} />
          <line x1={40} y1={140} x2={tip - 30} y2={sy + H + 36} className="p-ext" /><Step x={34} y={144} n={3} />
          <line x1={40} y1={176} x2={tip - 4} y2={sy + H + 22} className="p-ext" /><Step x={34} y={182} n={4} />
          {/* rozwinięcie zwoju */}
          <path d={P([[bx, by], [bx + bw, by], [bx + bw, by - bh]])} className="p-cons" fill="none" />
          <line x1={bx} y1={by} x2={bx + bw} y2={by - bh} className="p-acc thick" />
          <path d={arc(bx, by, 34, 0, Math.atan(bh / bw) * 180 / Math.PI)} className="p-acc" />
          <T x={bx + 42} y={by - 5} cls="t-acc t-b">φ</T>
          <T x={bx + bw / 2} y={by + 16} anchor="middle" cls="t-sm t-mono">π · d2</T>
          <T x={bx + bw + 6} y={by - bh / 2 + 4} cls="t-sm t-mono">P</T>
          <T x={bx + bw / 2} y={by - bh - 22} anchor="middle" cls="t-sm t-mut">rozwinięcie zwoju</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= sposoby dosuwu przy toczeniu gwintu ================= */
export function ThreadInfeed() {
  const sy = 46, H = 64, t30 = Math.tan(rad(30)), t27 = Math.tan(rad(26)), cxs = [48, 136, 224, 312];
  const ds = [16, 32, 48, 64];
  const v = (ax: number, ay: number) => `M ${ax - (ay - sy) * t30 - 6} ${sy - 8} L ${ax} ${ay} L ${ax + (ay - sy) * t30 + 6} ${sy - 8}`;
  const apex = (k: number, cx: number, d: number, i: number): [number, number] => {
    const y = sy + d;
    if (k === 0) return [cx, y];
    if (k === 1) return [cx - (H - d) * t30, y];
    if (k === 2) return [cx - (H - d) * t27, y];
    return [cx + (i % 2 ? 1 : -1) * (H - d) * t30 * 0.5, y];
  };
  const names = ["promieniowy", "wzdłuż boku", "zmodyfikowany", "naprzemienny"];
  return (
    <Fig id="tdg" code="dosuw" title="Sposoby dosuwu przy toczeniu gwintu" h={196}
      legend={[["acc", "kierunek dosuwu"], ["cons", "kolejne przejścia"], "stock"]}
      caption={<>Zarys bruzdy gwintu zewnętrznego i położenia wierzchołka płytki w kolejnych przejściach; proporcje poglądowe.</>}>
      {(c) => (
        <g>
          {cxs.map((cx, k) => {
            const w = H * t30;
            const pts = ds.map((d, i) => apex(k, cx, d, i));
            return (
              <g key={cx}>
                <defs><clipPath id={`tdg-clip-${k}`}><path d={P([[cx - w, sy], [cx, sy + H], [cx + w, sy]])} /></clipPath></defs>
                <path d={P([[cx - 42, sy], [cx - w, sy], [cx, sy + H], [cx + w, sy], [cx + 42, sy], [cx + 42, sy + H + 30], [cx - 42, sy + H + 30]])} fill={c.hatch} className="p-con" />
                <g clipPath={`url(#tdg-clip-${k})`}>{pts.map(([x, y], i) => <path key={i} d={v(x, y)} className="p-cons" fill="none" />)}</g>
                {k === 3
                  ? pts.slice(1).map(([x, y], i) => <line key={i} x1={pts[i][0]} y1={pts[i][1]} x2={x} y2={y} className="p-acc" markerEnd={c.a("acc")} />)
                  : <line x1={pts[0][0]} y1={pts[0][1] - 14} x2={pts[3][0]} y2={pts[3][1]} className="p-acc" markerEnd={c.a("acc")} />}
                <T x={cx} y={sy + H + 48} anchor="middle" cls="t-sm">{names[k]}</T>
              </g>
            );
          })}
        </g>
      )}
    </Fig>
  );
}

export const nozeFigs: Record<string, () => ReactNode> = {
  "tech-noz-zewnetrzny": () => <ExternalTool />,
  "tech-noz-wewnetrzny": () => <BoringBar />,
  "tech-przecinak": () => <PartingTool />,
  "tech-noz-gwint": () => <ThreadingTool />,
  "tech-dosuw-gwint": () => <ThreadInfeed />,
};
