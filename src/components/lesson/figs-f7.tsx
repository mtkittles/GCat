import { Fig, T } from "@/components/fig";

/* Rysunki modułu F7 — podprogramy. Styl i kolory z fig.tsx. */

interface FlowProps {
  id: string; code: string; title: string; caption: React.ReactNode;
  main: { name: string; lines: string[]; call: number };
  sub: { name: string; lines: string[] };
  callLabel: string; retLabel: string; times: string;
}

function Flow({ id, code, title, caption, main, sub, callLabel, retLabel, times }: FlowProps) {
  const lh = 19, top = 40, mx = 8, mw = 150, sx = 194, sw = 140;
  const ly = (i: number) => top + 22 + i * lh;
  const mh = 30 + main.lines.length * lh, sh = 30 + sub.lines.length * lh;
  const subTop = top + 34;
  const sy = (i: number) => subTop + 22 + i * lh;
  const callY = ly(main.call) - 4, retY = ly(main.call + 1) - 4;
  return (
    <Fig id={id} code={code} title={title} h={top + mh + 26} legend={["acc", "arc"]} caption={caption}>
      {(c) => (
        <g>
          <rect x={mx} y={top} width={mw} height={mh} rx={8} className="panel-bg" />
          <T x={mx + 10} y={top - 8} cls="t-b">{main.name}</T>
          {main.lines.map((l, i) => (
            <g key={i}>
              {i === main.call && <rect x={mx + 4} y={ly(i) - 14} width={mw - 8} height={18} rx={4} className="p-fill-acc" />}
              <T x={mx + 12} y={ly(i)} cls={i === main.call ? "t-mono t-acc t-b" : "t-mono"}>{l}</T>
            </g>
          ))}
          <rect x={sx} y={subTop} width={sw} height={sh} rx={8} className="panel-bg" style={{ stroke: "var(--cm-t)" }} />
          <T x={sx + 10} y={subTop - 8} cls="t-b">{sub.name}</T>
          {sub.lines.map((l, i) => <T key={i} x={sx + 12} y={sy(i)} cls="t-mono">{l}</T>)}
          <path d={`M ${mx + mw - 2} ${callY} C ${mx + mw + 26} ${callY}, ${sx - 26} ${sy(0) - 4}, ${sx - 2} ${sy(0) - 4}`} className="p-acc thick" markerEnd={c.a("acc")} />
          <T x={sx - 4} y={sy(0) - 16} anchor="end" cls="t-acc t-b t-sm">{callLabel}</T>
          <path d={`M ${sx - 2} ${sy(sub.lines.length - 1) - 4} C ${sx - 30} ${sy(sub.lines.length - 1)}, ${mx + mw + 30} ${retY}, ${mx + mw - 2} ${retY}`} className="p-arc" markerEnd={c.a("arc")} />
          <T x={sx - 4} y={retY + 17} anchor="end" cls="t-arc t-b t-sm">{retLabel}</T>
          <path d={`M ${sx + sw + 2} ${sy(sub.lines.length - 1) - 4} C ${sx + sw + 16} ${sy(sub.lines.length - 1)}, ${sx + sw + 16} ${sy(0) - 8}, ${sx + sw + 2} ${sy(0) - 8}`} className="p-acc" markerEnd={c.a("acc")} />
          <T x={sx + sw - 4} y={subTop + sh + 16} anchor="end" cls="t-acc t-b t-sm">{times}</T>
        </g>
      )}
    </Fig>
  );
}

export function FanucSub() {
  return (
    <Flow id="f71fl" code="M98 M99" title="Program główny i podprogram — Fanuc"
      caption={<>M98 przekazuje sterowanie do podprogramu O2000. Ten wykonuje się cztery razy, a M99 wraca za każdym razem — po ostatnim przebiegu do bloku następnego po M98.</>}
      main={{ name: "O1000 — program główny", lines: ["G00 X63. Y25.", "G00 Z5.", "G01 Z0. F200", "M98 P2000 L4", "G03 I-3. F400", "…", "M30"], call: 3 }}
      sub={{ name: "O2000 — podprogram", lines: ["G91 G03 I-3. Z-1.", "G90", "M99"] }}
      callLabel="wywołanie" retLabel="powrót" times="× 4" />
  );
}

export function SinumerikSub() {
  return (
    <Flow id="f72fl" code="MPF SPF" title="Program główny i podprogram — Sinumerik"
      caption={<>Na Sinumeriku podprogram to osobny plik .SPF, wywoływany nazwą. P podaje liczbę przebiegów, a RET (albo M17) kończy podprogram.</>}
      main={{ name: "PLYTKA.MPF", lines: ["G0 X63 Y25", "G0 Z5", "G1 Z0 F200", "SPIRALA P4", "G3 I-3 F400", "…", "M30"], call: 3 }}
      sub={{ name: "SPIRALA.SPF", lines: ["G91 G3 I-3 Z-1", "G90", "RET"] }}
      callLabel="wywołanie" retLabel="powrót" times="P4" />
  );
}

export const f7Figs = {
  "f71-flow": () => <FanucSub />,
  "f72-flow": () => <SinumerikSub />,
};
