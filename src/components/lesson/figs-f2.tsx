import { Fig, T } from "@/components/fig";

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

export const f2Figs = {
  "f21-change": () => <ToolChange />,
  "f22-dir": () => <SpindleDir />,
};
