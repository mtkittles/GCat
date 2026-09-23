import type { ReactNode } from "react";

/*
  Jeden styl dla wszystkich rysunków technicznych GCat.
  – format pod telefon: szerokość 360 jednostek, tekst 11 px (na desktopie skaluje się w górę),
  – każdy napis ma „halo” w kolorze tła karty, więc nie ginie na liniach,
  – kolory mają stałe znaczenie: G00 bursztyn przerywany, G01 zielony, G02/G03 niebieski,
    kontur detalu biały, wymiary szare, parametr cyklu pomarańczowy, błąd czerwony.
  Style linii i tekstu siedzą w CSS (.fig …), tutaj tylko geometria.
*/

export type Kind = "rap" | "cut" | "arc" | "con" | "bad" | "dim" | "acc" | "cons";

const LEGEND: Record<string, string> = {
  rap: "G00 — ruch szybki", cut: "G01 — ruch roboczy", arc: "G02/G03 — łuk", con: "kontur detalu",
  bad: "błąd / kolizja", dim: "wymiar", acc: "parametr", stock: "materiał", cons: "linia pomocnicza",
  tool: "narzędzie",
};

export interface Ctx { a: (k: Kind) => string; hatch: string }

export function Fig({ id, code, title, caption, legend, notes, w = 360, h = 250, children }: {
  id: string; code?: string; title: string; caption?: ReactNode; legend?: (Kind | "stock" | "tool")[];
  notes?: ReactNode; w?: number; h?: number; children: (c: Ctx) => ReactNode;
}) {
  const a = (k: Kind) => `url(#${id}-a-${k})`;
  const kinds: Kind[] = ["rap", "cut", "arc", "con", "bad", "dim", "acc"];
  return (
    <figure className="fig">
      <div className="fig-head">{code && <span className="fig-code">{code}</span>}<span>{title}</span></div>
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={title}>
        <defs>
          <pattern id={`${id}-h`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" className="hatch-line" />
          </pattern>
          {kinds.map((k) => (
            <marker key={k} id={`${id}-a-${k}`} markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10"
              refX="8" refY="5" orient="auto-start-reverse" viewBox="0 0 10 10">
              <path d="M0 1.2 L9 5 L0 8.8 z" className={`mk mk-${k}`} />
            </marker>
          ))}
        </defs>
        {children({ a, hatch: `url(#${id}-h)` })}
      </svg>
      {notes && <div className="fig-notes">{notes}</div>}
      {legend && legend.length > 0 && (
        <div className="fig-legend">
          {legend.map((k) => <span key={k}><i className={`lg lg-${k}`} />{LEGEND[k]}</span>)}
        </div>
      )}
      {caption && <figcaption className="fig-cap">{caption}</figcaption>}
    </figure>
  );
}

/* ---------- odwzorowanie współrzędnych rysunku na SVG ---------- */
export interface Map { X: (v: number) => number; Y: (v: number) => number; u: number }

export function mapper(range: [number, number, number, number], box: [number, number, number, number]): Map {
  const [x0, x1, y0, y1] = range;
  const [bx, by, bw, bh] = box;
  const u = Math.min(bw / (x1 - x0), bh / (y1 - y0));
  const ox = bx + (bw - (x1 - x0) * u) / 2;
  const oy = by + bh - (bh - (y1 - y0) * u) / 2;
  return { X: (v) => ox + (v - x0) * u, Y: (v) => oy - (v - y0) * u, u };
}

/** Siatka: drobna co `minor`, gruba co `major` z opisem; osie ze strzałką i nazwą. */
export function Grid({ m, range, minor = 5, major = 10, xl = "X", yl = "Y", ticks = true, c }: {
  m: Map; range: [number, number, number, number]; minor?: number; major?: number; xl?: string; yl?: string; ticks?: boolean; c: Ctx;
}) {
  const [x0, x1, y0, y1] = range;
  const vs = (a: number, b: number, s: number) => { const r: number[] = []; for (let v = Math.ceil(a / s) * s; v <= b + 1e-9; v += s) r.push(+v.toFixed(6)); return r; };
  const isMaj = (v: number) => Math.abs(v / major - Math.round(v / major)) < 1e-6;
  const zx = Math.min(Math.max(0, x0), x1), zy = Math.min(Math.max(0, y0), y1);
  return (
    <g>
      {vs(x0, x1, minor).map((v) => <line key={`x${v}`} x1={m.X(v)} y1={m.Y(y0)} x2={m.X(v)} y2={m.Y(y1)} className={isMaj(v) ? "gr-maj" : "gr-min"} />)}
      {vs(y0, y1, minor).map((v) => <line key={`y${v}`} x1={m.X(x0)} y1={m.Y(v)} x2={m.X(x1)} y2={m.Y(v)} className={isMaj(v) ? "gr-maj" : "gr-min"} />)}
      <line x1={m.X(x0)} y1={m.Y(zy)} x2={m.X(x1) + 6} y2={m.Y(zy)} className="ax" markerEnd={c.a("dim")} />
      <line x1={m.X(zx)} y1={m.Y(y0)} x2={m.X(zx)} y2={m.Y(y1) - 6} className="ax" markerEnd={c.a("dim")} />
      <T x={m.X(x1) + 4} y={m.Y(zy) + 15} anchor="end" cls="t-ax">{xl}</T>
      <T x={m.X(zx) + 8} y={m.Y(y1) + 2} cls="t-ax">{yl}</T>
      {ticks && vs(x0, x1, major).filter((v) => v !== zx && v < x1 - (x1 - x0) * 0.05).map((v) => <T key={`tx${v}`} x={m.X(v)} y={m.Y(zy) + 12} anchor="middle" cls="t-tick">{v}</T>)}
      {ticks && vs(y0, y1, major).filter((v) => v !== zy && v < y1 - (y1 - y0) * 0.06).map((v) => <T key={`ty${v}`} x={m.X(zx) - 4} y={m.Y(v) + 3.5} anchor="end" cls="t-tick">{v}</T>)}
    </g>
  );
}

/** Tekst z halo. `cls`: t-b (pogrubiony), t-mono, t-rap/t-cut/t-arc/t-bad/t-acc/t-mut (kolor). */
export function T({ x, y, children, anchor = "start", cls = "" }: { x: number; y: number; children: ReactNode; anchor?: "start" | "middle" | "end"; cls?: string }) {
  return <text x={x} y={y} textAnchor={anchor} className={cls}>{children}</text>;
}

type Pos = "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";
const OFF: Record<Pos, [number, number, "start" | "middle" | "end"]> = {
  n: [0, -9, "middle"], ne: [7, -7, "start"], e: [9, 4, "start"], se: [7, 14, "start"],
  s: [0, 17, "middle"], sw: [-7, 14, "end"], w: [-9, 4, "end"], nw: [-7, -7, "end"],
};

/** Punkt z opisem ustawionym w wybranym kierunku (bez nachodzenia na linię). */
export function Pt({ x, y, label, pos = "ne", cls = "t-b", dot = "pt" }: { x: number; y: number; label?: ReactNode; pos?: Pos; cls?: string; dot?: string }) {
  const [dx, dy, an] = OFF[pos];
  return (
    <g>
      <circle cx={x} cy={y} r={3.6} className={dot} />
      {label && <T x={x + dx} y={y + dy} anchor={an} cls={cls}>{label}</T>}
    </g>
  );
}

/** Linia wymiarowa między punktami (w pikselach SVG), odsunięta o `off`, z liniami pomocniczymi i opisem. */
export function Dim({ x1, y1, x2, y2, off = 0, label, c, cls = "t-mono t-dim", lpos = 0.5, lside = -1 }: {
  x1: number; y1: number; x2: number; y2: number; off?: number; label: ReactNode; c: Ctx; cls?: string; lpos?: number; lside?: 1 | -1;
}) {
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L, ny = dx / L;
  const ax = x1 + nx * off, ay = y1 + ny * off, bx = x2 + nx * off, by = y2 + ny * off;
  const mx = ax + (bx - ax) * lpos + nx * 9 * lside, my = ay + (by - ay) * lpos + ny * 9 * lside + 4;
  return (
    <g>
      {off !== 0 && <><line x1={x1} y1={y1} x2={ax + nx * 3 * Math.sign(off)} y2={ay + ny * 3 * Math.sign(off)} className="p-ext" />
        <line x1={x2} y1={y2} x2={bx + nx * 3 * Math.sign(off)} y2={by + ny * 3 * Math.sign(off)} className="p-ext" /></>}
      <line x1={ax} y1={ay} x2={bx} y2={by} className="p-dim" markerStart={c.a("dim")} markerEnd={c.a("dim")} />
      <T x={mx} y={my} anchor="middle" cls={cls}>{label}</T>
    </g>
  );
}

/** Numer kroku w kółku (kolejność ruchów). */
export function Step({ x, y, n }: { x: number; y: number; n: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={7.5} className="step" />
      <text x={x} y={y + 3.6} textAnchor="middle" className="step-n">{n}</text>
    </g>
  );
}

/** Kod w podpisie rysunku, w kolorze rodzaju ruchu. */
export function Code({ k = "cut", children }: { k?: Kind; children: ReactNode }) {
  return <code className={`fig-code-line cl-${k}`}>{children}</code>;
}
