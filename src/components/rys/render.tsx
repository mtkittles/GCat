import type { CSSProperties, ReactNode } from "react";
import { Pt, Step, T, type Ctx } from "@/components/fig";
import {
  arcPoint, arcSweep, dimGeom, dimrGeom, dimText, FONT_CSS, measureText, polyPath, r6, strokeOf, type Arrow, type DimAItem, type DimItem, type DimRItem, type Fill, type Item, type LineKind, type P2, type PtColor, type TextItem,
} from "@/lib/rys/model";

/*
  Rysowanie elementów rysownika — ten sam kod w edytorze, w miniaturze panelu i na stronie.
  Kolory i kreski z klas rysunków serwisu (globals.css, „rysunki techniczne”); grubość, groty i tekst liczone tutaj.
  Groty są trójkątami w końcu linii (nie markerami SVG): ostry czubek przy każdej grubości,
  linia kończy się wewnątrz grotu, więc jej zaokrąglony koniec nie wystaje poza czubek.
*/

export const LINE_CLASS: Record<LineKind, string> = {
  con: "p-con", cons: "p-cons", dim: "p-dim", axis: "axis-c", faint: "gr-maj", cut: "p-cut", rap: "p-rap", arc: "p-arc",
  acc: "p-acc", bad: "p-bad", stock: "stock-out", tool: "tool", none: "",
};
const MK: Record<LineKind, string> = { con: "mk-con", cons: "mk-dim", dim: "mk-dim", axis: "mk-dim", faint: "mk-dim", cut: "mk-cut", rap: "mk-rap", arc: "mk-arc", acc: "mk-acc", bad: "mk-bad", stock: "mk-dim", tool: "mk-cut", none: "mk-dim" };
const DASHED = new Set<LineKind>(["cons", "axis", "rap", "bad", "stock", "tool"]);
const PT_CLASS: Record<PtColor, string> = { ink: "pt", cut: "pt-cut", rap: "pt-rap", arc: "pt-arc" };

function fillStyle(f: Fill, c: Ctx): CSSProperties {
  switch (f) {
    case "hatch": return { fill: c.hatch };
    case "hole": return { fill: "var(--panel)" };
    case "acc": return { fill: "color-mix(in srgb, var(--accent) 22%, transparent)" };
    case "cut": return { fill: "color-mix(in srgb, var(--green) 16%, transparent)" };
    case "bad": return { fill: "color-mix(in srgb, var(--red) 16%, transparent)" };
    default: return { fill: "none" };
  }
}
/** obrys: klasa rodzaju + grubość; ciągłe linie z zaokrąglonym końcem i narożem (bez szpic przy ostrych kątach) */
function strokeProps(k: LineKind, sw: number, f: CSSProperties = { fill: "none" }) {
  if (k === "none") return { style: { ...f, stroke: "none" } };
  return { className: LINE_CLASS[k], style: { ...f, strokeWidth: sw, strokeLinejoin: "round" as const, strokeLinecap: DASHED.has(k) ? ("butt" as const) : ("round" as const) } };
}

/** długość grotu dla grubości linii */
export const arrowLen = (sw: number) => 6 + sw * 1.6;
/** grot: czubek w `tip`, kierunek `d` (wektor jednostkowy w stronę czubka) */
function head(tip: P2, d: P2, L: number, cls: string, key: string, hw = 0.36): ReactNode {
  const bx = tip[0] - d[0] * L, by = tip[1] - d[1] * L, nx = -d[1] * L * hw, ny = d[0] * L * hw;
  return <path key={key} d={`M ${r6(tip[0])} ${r6(tip[1])} L ${r6(bx + nx)} ${r6(by + ny)} L ${r6(bx - nx)} ${r6(by - ny)} Z`} className={`mk ${cls}`} />;
}
const unit = (a: P2, b: P2): P2 => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1; return [dx / L, dy / L]; };
const back = (p: P2, d: P2, s: number): P2 => [p[0] - d[0] * s, p[1] - d[1] * s];
const ends = (a: Arrow) => ({ s: a === "start" || a === "both", e: a === "end" || a === "both" });

/** linia otwarta z grotami: punkty skrócone o część grotu na końcach z grotem */
function arrowedPoly(pts: P2[], k: LineKind, sw: number, arrow: Arrow): ReactNode {
  const { s, e } = ends(arrow);
  const L = arrowLen(sw), cut = L * 0.7, cls = MK[k];
  const p = pts.map((x): P2 => [x[0], x[1]]);
  const heads: ReactNode[] = [];
  if (e && p.length >= 2) { const d = unit(p[p.length - 2], p[p.length - 1]), tip = p[p.length - 1]; heads.push(head(tip, d, L, cls, "e")); p[p.length - 1] = back(tip, d, Math.min(cut, Math.hypot(tip[0] - p[p.length - 2][0], tip[1] - p[p.length - 2][1]))); }
  if (s && p.length >= 2) { const d = unit(p[1], p[0]), tip = pts[0]; heads.push(head(tip, d, L, cls, "s")); p[0] = back(tip, d, Math.min(cut, Math.hypot(tip[0] - p[1][0], tip[1] - p[1][1]))); }
  return <g>{<path d={polyPath(p, false)} {...strokeProps(k, sw)} />}{heads}</g>;
}

function arcWithArrows(it: Extract<Item, { t: "arc" }>, sw: number): ReactNode {
  const { s, e } = ends(it.arrow);
  const sweep = arcSweep(it.a0, it.a1), L = arrowLen(sw), cls = MK[it.k];
  const dA = Math.min((L * 0.7) / it.r * (180 / Math.PI), sweep / 3); // skrócenie łuku pod grotem, w stopniach
  const a0 = it.a0 + (s ? dA : 0), a1 = it.a0 + sweep - (e ? dA : 0);
  const [sx, sy] = arcPoint(it.cx, it.cy, it.r, a0), [ex, ey] = arcPoint(it.cx, it.cy, it.r, a1);
  const sw2 = a1 - a0;
  const d = sweep === 360 && !s && !e
    ? `M ${sx} ${sy} A ${it.r} ${it.r} 0 1 1 ${arcPoint(it.cx, it.cy, it.r, a0 + 180).join(" ")} A ${it.r} ${it.r} 0 1 1 ${sx} ${sy}`
    : `M ${sx} ${sy} A ${it.r} ${it.r} 0 ${sw2 > 180 ? 1 : 0} 1 ${ex} ${ey}`;
  const heads: ReactNode[] = [];
  const tan = (a: number, dir: 1 | -1): P2 => { const r = (a * Math.PI) / 180; return [-Math.sin(r) * dir, Math.cos(r) * dir]; };
  // grot styczny do łuku: kierunek z cięciwy od punktu skrócenia do końca (dokładniejsze niż styczna przy dużym grocie)
  if (e) { const tip = arcPoint(it.cx, it.cy, it.r, it.a0 + sweep); heads.push(head(tip, dA > 0 ? unit([ex, ey], tip) : tan(it.a1, 1), L, cls, "e")); }
  if (s) { const tip = arcPoint(it.cx, it.cy, it.r, it.a0); heads.push(head(tip, dA > 0 ? unit([sx, sy], tip) : tan(it.a0, -1), L, cls, "s")); }
  return <g><path d={d} {...strokeProps(it.k, sw)} />{heads}</g>;
}

const COLOR_CLASS: Record<TextItem["color"], string> = { ink: "", mut: "t-mut", acc: "t-acc", cut: "t-cut", rap: "t-rap", arc: "t-arc", bad: "t-bad" };
export const textStyle = (size: number, font: TextItem["font"], bold = false): CSSProperties => ({ fontSize: size, fontFamily: FONT_CSS[font], fontWeight: bold ? 700 : undefined });
export const textClass = (it: Pick<TextItem, "bold" | "color">) => [it.bold && "t-b", COLOR_CLASS[it.color]].filter(Boolean).join(" ") || undefined;

/** Wymiar jak w CAD: linie pomocnicze z odstępem od przedmiotu, groty, opis równoległy do linii (albo poziomo). */
export function DimView({ d, k }: { d: DimItem; k: number }) {
  const g = dimGeom(d), { A, B, u } = g;
  const L = Math.hypot(B[0] - A[0], B[1] - A[1]);
  const AL = 8.5, inside = L >= 2 * AL + 3;
  const heads: ReactNode[] = [];
  let a: P2 = A, b: P2 = B;
  if (L > 0.01) {
    if (inside) { heads.push(head(A, [-u[0], -u[1]], AL, "mk-dim", "a", 0.4), head(B, u, AL, "mk-dim", "b", 0.4)); a = back(A, [-u[0], -u[1]], AL * 0.7); b = back(B, u, AL * 0.7); }
    else { heads.push(head(A, u, AL, "mk-dim", "a", 0.4), head(B, [-u[0], -u[1]], AL, "mk-dim", "b", 0.4)); a = back(A, u, AL + 8); b = back(B, [-u[0], -u[1]], AL + 8); } // za mało miejsca: groty z zewnątrz
  }
  // opis: kąt linii sprowadzony do (−90°, 90°], żeby tekst czytać od lewej albo od dołu
  let ang = (Math.atan2(u[1], u[0]) * 180) / Math.PI;
  if (ang >= 90) ang -= 180; else if (ang < -90) ang += 180; // ISO 129: opis czytelny od dołu albo od prawej (pionowy wymiar czytany od dołu do góry)
  const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, gap = 2.5;
  const vertical = Math.abs(u[1]) > Math.abs(u[0]);
  const label = dimText(d, g, k);
  const style = textStyle(d.size, d.font);
  const text = d.hz
    ? (vertical
      ? <text x={r6(mx + (d.side === -1 ? -4 : 4))} y={r6(my + d.size * 0.35)} textAnchor={d.side === -1 ? "end" : "start"} className="t-dim" style={style}>{label}</text>
      : <text x={r6(mx)} y={r6(d.side === -1 ? my - gap : my + d.size + gap - 1)} textAnchor="middle" className="t-dim" style={style}>{label}</text>)
    : <text transform={`translate(${r6(mx)} ${r6(my)}) rotate(${r6(ang)})`} y={d.side === -1 ? -gap : d.size + gap - 1} textAnchor="middle" className="t-dim" style={style}>{label}</text>;
  return (
    <g>
      {g.e1 && <line x1={r6(g.e1[0][0])} y1={r6(g.e1[0][1])} x2={r6(g.e1[1][0])} y2={r6(g.e1[1][1])} className="p-ext" />}
      {g.e2 && <line x1={r6(g.e2[0][0])} y1={r6(g.e2[0][1])} x2={r6(g.e2[1][0])} y2={r6(g.e2[1][1])} className="p-ext" />}
      <line x1={r6(a[0])} y1={r6(a[1])} x2={r6(b[0])} y2={r6(b[1])} className="p-dim" />
      {heads}
      {text}
    </g>
  );
}

const DAL = 8.5; // grot wymiaru

/** Wymiar ⌀/R: linia przez środek (średnica) albo od środka (promień), groty na okręgu, opis poziomo za okręgiem. */
function DimRView({ d, k }: { d: DimRItem; k: number }) {
  const { P, Q, E, u } = dimrGeom(d);
  const out = d.ext >= 0;
  const start: P2 = d.d ? Q : [d.cx, d.cy];
  const heads: ReactNode[] = [head(P, out ? [-u[0], -u[1]] : u, DAL, "mk-dim", "p", 0.4)];
  if (d.d) heads.push(head(Q, out ? u : [-u[0], -u[1]], DAL, "mk-dim", "q", 0.4));
  // linia: od Q (albo środka) do końca opisu; przy opisie na zewnątrz groty wskazują okrąg od środka
  const a = d.d ? back(Q, out ? u : [-u[0], -u[1]], 0) : start;
  const tail: P2 = out ? E : P;
  const style = textStyle(d.size, d.font);
  const right = u[0] >= -1e-9;
  const tx = E[0] + (right ? 2.5 : -2.5), ty = E[1] + d.size * 0.35 + (Math.abs(u[0]) < 0.3 ? (u[1] > 0 ? d.size * 0.6 : -d.size * 0.4) : 0);
  return (
    <g>
      <line x1={r6(a[0])} y1={r6(a[1])} x2={r6(tail[0])} y2={r6(tail[1])} className="p-dim" />
      {heads}
      <text x={r6(tx)} y={r6(ty)} textAnchor={Math.abs(u[0]) < 0.3 ? "middle" : right ? "start" : "end"} className="t-dim" style={style}>{measureText(d, k)}</text>
    </g>
  );
}

/** Wymiar kątowy: łuk wymiarowy z grotami, linie pomocnicze wzdłuż ramion, opis przy środku łuku. */
function DimAView({ d }: { d: DimAItem }) {
  const sweep = arcSweep(d.a1, d.a2);
  const s = arcPoint(d.cx, d.cy, d.r, d.a1), e = arcPoint(d.cx, d.cy, d.r, d.a1 + sweep);
  const len = (sweep * Math.PI / 180) * d.r;
  const inside = len > 2.6 * DAL;
  const tan = (a: number, dir: 1 | -1): P2 => { const r = (a * Math.PI) / 180; return [-Math.sin(r) * dir, Math.cos(r) * dir]; };
  // groty styczne: wewnątrz łuku wskazują jego końce; przy krótkim łuku — od zewnątrz
  const heads = inside ? [head(s, tan(d.a1, -1), DAL, "mk-dim", "s", 0.4), head(e, tan(d.a1 + sweep, 1), DAL, "mk-dim", "e", 0.4)]
    : [head(s, tan(d.a1, 1), DAL, "mk-dim", "s", 0.4), head(e, tan(d.a1 + sweep, -1), DAL, "mk-dim", "e", 0.4)];
  const ext = (a: number) => { const p0 = arcPoint(d.cx, d.cy, Math.max(0, d.r * 0.15), a), p1 = arcPoint(d.cx, d.cy, d.r + 3, a); return <line key={a} x1={p0[0]} y1={p0[1]} x2={p1[0]} y2={p1[1]} className="p-ext" />; };
  const mid = d.a1 + sweep / 2, tp = arcPoint(d.cx, d.cy, d.r + 4 + d.size * 0.55, mid);
  return (
    <g>
      {ext(d.a1)}{ext(d.a1 + sweep)}
      <path d={`M ${s[0]} ${s[1]} A ${d.r} ${d.r} 0 ${sweep > 180 ? 1 : 0} 1 ${e[0]} ${e[1]}`} className="p-dim" fill="none" />
      {heads}
      <text x={r6(tp[0])} y={r6(tp[1] + d.size * 0.35)} textAnchor="middle" className="t-dim" style={textStyle(d.size, d.font)}>{measureText(d, 1)}</text>
    </g>
  );
}

const steps = (a: number, b: number, s: number) => { const r: number[] = []; for (let v = Math.ceil(a / s) * s; v <= b + 1e-9; v += s) r.push(+v.toFixed(3)); return r; };

/** `k` — skala rysunku (jednostek na mm) dla opisu wymiarów „<>”. */
export function renderItem(it: Item, c: Ctx, k = 1): ReactNode {
  switch (it.t) {
    case "line": {
      const sw = strokeOf(it.k, it.sw);
      return it.arrow === "none" || it.k === "none"
        ? <line x1={it.x1} y1={it.y1} x2={it.x2} y2={it.y2} {...strokeProps(it.k, sw)} />
        : arrowedPoly([[it.x1, it.y1], [it.x2, it.y2]], it.k, sw, it.arrow);
    }
    case "poly": {
      const sw = strokeOf(it.k, it.sw);
      if (!it.closed && it.arrow !== "none" && it.k !== "none") return arrowedPoly(it.pts, it.k, sw, it.arrow);
      return <path d={polyPath(it.pts, it.closed)} {...strokeProps(it.k, sw, fillStyle(it.fill, c))} />;
    }
    case "rect": return <rect x={it.x} y={it.y} width={it.w} height={it.h} rx={it.r || undefined} {...strokeProps(it.k, strokeOf(it.k, it.sw), fillStyle(it.fill, c))} />;
    case "circle": return <circle cx={it.cx} cy={it.cy} r={it.r} {...strokeProps(it.k, strokeOf(it.k, it.sw), fillStyle(it.fill, c))} />;
    case "arc": return arcWithArrows(it, strokeOf(it.k, it.sw));
    case "text": return <text x={it.x} y={it.y} textAnchor={it.anchor} className={textClass(it)} style={textStyle(it.size, it.font, it.bold)}>{it.s}</text>;
    case "dim": return <DimView d={it} k={k} />;
    case "dimr": return <DimRView d={it} k={k} />;
    case "dima": return <DimAView d={it} />;
    case "pt": return <Pt x={it.x} y={it.y} label={it.label || undefined} pos={it.pos} dot={PT_CLASS[it.color]} />;
    case "step": return <Step x={it.x} y={it.y} n={it.n} />;
    case "axes": {
      // jak Grid z fig.tsx: osie ze strzałką i nazwą, opisy wartości co `ts`
      // bez opisu tuż przy grocie i nazwie osi (jak Grid w fig.tsx)
      const xs = it.ts > 0 ? steps(it.ts, it.xp - Math.max(it.ts * 0.3, 14), it.ts).concat(steps(it.ts, it.xn - it.ts * 0.3, it.ts).map((v) => -v)) : [];
      const ys = it.ts > 0 ? steps(it.ts, it.yp - Math.max(it.ts * 0.3, 16), it.ts).concat(steps(it.ts, it.yn - it.ts * 0.3, it.ts).map((v) => -v)) : [];
      const val = (v: number) => String(Math.round((v / it.ts) * it.tv * 100) / 100 + 0).replace(".", ",");
      return (
        <g>
          <line x1={it.x - it.xn} y1={it.y} x2={it.x + it.xp} y2={it.y} className="ax" markerEnd={c.a("dim")} />
          <line x1={it.x} y1={it.y + it.yn} x2={it.x} y2={it.y - it.yp} className="ax" markerEnd={c.a("dim")} />
          <T x={it.x + it.xp - 2} y={it.y + 15} anchor="end" cls="t-ax">{it.xl}</T>
          <T x={it.x + 8} y={it.y - it.yp + 8} cls="t-ax">{it.yl}</T>
          {xs.map((v) => <T key={`x${v}`} x={r6(it.x + v)} y={it.y + 12} anchor="middle" cls="t-tick">{val(v)}</T>)}
          {ys.map((v) => <T key={`y${v}`} x={it.x - 4} y={r6(it.y - v + 3.5)} anchor="end" cls="t-tick">{val(v)}</T>)}
        </g>
      );
    }
    case "grid": {
      const isMaj = (v: number) => Math.abs(v / it.major - Math.round(v / it.major)) < 1e-6;
      return (
        <g>
          {steps(0, it.w, it.minor).map((v) => <line key={`x${v}`} x1={it.x + v} y1={it.y} x2={it.x + v} y2={it.y + it.h} className={isMaj(v) ? "gr-maj" : "gr-min"} />)}
          {steps(0, it.h, it.minor).map((v) => <line key={`y${v}`} x1={it.x} y1={it.y + it.h - v} x2={it.x + it.w} y2={it.y + it.h - v} className={isMaj(v) ? "gr-maj" : "gr-min"} />)}
        </g>
      );
    }
  }
}
