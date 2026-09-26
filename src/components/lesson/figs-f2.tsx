import { Code, Fig, T } from "@/components/fig";

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
  const c1 = { x: 136, y: 122 }, d = 18, r = 44;
  const ix = c1.x + d / 2, iy = Math.sqrt(r * r - (d / 2) ** 2);
  return (
    <Fig id="f23fz" code="fz" title="Posuw na ostrze — widok z góry, skala przesadzona" h={236} legend={["cut", "acc"]}
      notes={<Code k="acc">vf = fz · z · n</Code>}
      caption={<>Między wejściami dwóch kolejnych ostrzy frez przesuwa się o <b>fz</b>. Każde ostrze zbiera sierp materiału o grubości do fz. Posuw minutowy F to fz razy liczba ostrzy razy obroty.</>}>
      {(c) => (
        <g>
          <path d={`M ${ix} ${c1.y - iy} A ${r} ${r} 0 1 1 ${ix} ${c1.y + iy} A ${r} ${r} 0 0 0 ${ix} ${c1.y - iy} Z`} className="p-fill-acc" />
          <circle cx={c1.x} cy={c1.y} r={r} className="p-cons" />
          <circle cx={c1.x + d} cy={c1.y} r={r} className="tool" />
          {[0, 90, 180, 270].map((a) => { const t = (a * Math.PI) / 180; return <line key={a} x1={c1.x + d} y1={c1.y} x2={c1.x + d + Math.cos(t) * r} y2={c1.y + Math.sin(t) * r} className="p-dim" />; })}
          <line x1={c1.x + r} y1={c1.y - 60} x2={c1.x + r + d} y2={c1.y - 60} className="p-acc" markerStart={c.a("acc")} markerEnd={c.a("acc")} />
          <line x1={c1.x + r} y1={c1.y - 64} x2={c1.x + r} y2={c1.y} className="p-cons" />
          <line x1={c1.x + r + d} y1={c1.y - 64} x2={c1.x + r + d} y2={c1.y} className="p-cons" />
          <T x={c1.x + r + d / 2} y={c1.y - 68} anchor="middle" cls="t-acc t-b t-mono">fz</T>
          <line x1={c1.x + d + r + 30} y1={c1.y + 30} x2={c1.x + d + r + 90} y2={c1.y + 30} className="p-cut thick" markerEnd={c.a("cut")} />
          <T x={c1.x + d + r + 60} y={c1.y + 22} anchor="middle" cls="t-cut t-b">vf</T>
          <T x={c1.x + d + r + 6} y={c1.y + 4} cls="t-acc">wiór</T>
          <T x={c1.x - r - 6} y={c1.y + 4} anchor="end" cls="t-mut">poprzednie</T>
          <T x={c1.x - r - 6} y={c1.y + 17} anchor="end" cls="t-mut">ostrze</T>
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

export const f2Figs = {
  "f21-change": () => <ToolChange />,
  "f22-dir": () => <SpindleDir />,
  "f23-fz": () => <ToothFeed />,
  "f24-coolant": () => <Coolant />,
};
