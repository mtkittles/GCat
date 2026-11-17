import type { ReactNode } from "react";
import { FONT_CSS, r6, type DatumItem, type GdtItem, type P2, type RoughItem } from "@/lib/rys/model";
import { datumLayout, gdtGlyph, gdtLayout, roughLocal, textW } from "@/lib/rys/symbols";

/*
  Rysowanie symboli rysunku technicznego (RB6a): ramka tolerancji geometrycznej, symbol bazy, znak chropowatości.
  Ten sam kod w edytorze, w miniaturze i na stronie (render.tsx → renderItem). Geometria i źródła: lib/rys/symbols.ts.
  Kreski cienkie jak wymiary (klasa p-sym), tekst w kolorze pisma rysunku (t-sym).
*/

const font = (size: number, f: GdtItem["font"]) => ({ fontSize: size, fontFamily: FONT_CSS[f] });
function tip(p: P2, u: P2, L: number, key: string): ReactNode {
  const bx = p[0] - u[0] * L, by = p[1] - u[1] * L, nx = -u[1] * L * 0.33, ny = u[0] * L * 0.33;
  return <path key={key} d={`M ${r6(p[0])} ${r6(p[1])} L ${r6(bx + nx)} ${r6(by + ny)} L ${r6(bx - nx)} ${r6(by - ny)} Z`} className="f-sym" />;
}

export function GdtView({ it }: { it: GdtItem }) {
  const L = gdtLayout(it), cy = it.y, e = L.h * 0.31;
  const g = gdtGlyph(it.sym, L.cells[0].x0 + L.h / 2, cy, e);
  const lead = L.lead;
  let leadNode: ReactNode = null;
  if (lead) {
    const dx = lead.b[0] - lead.a[0], dy = lead.b[1] - lead.a[1], l = Math.hypot(dx, dy);
    if (l > 1) {
      const u: P2 = [dx / l, dy / l], AL = Math.min(7, l * 0.6);
      leadNode = <g><line x1={lead.a[0]} y1={lead.a[1]} x2={r6(lead.b[0] - u[0] * AL * 0.8)} y2={r6(lead.b[1] - u[1] * AL * 0.8)} className="p-sym" />{tip(lead.b, u, AL, "lt")}</g>;
    }
  }
  return (
    <g>
      {leadNode}
      <rect x={L.x} y={L.y0} width={L.w} height={L.h} className="p-sym" style={{ fill: "var(--panel)" }} />
      {L.cells.slice(1).map((c) => <line key={`d${c.x0}`} x1={c.x0} y1={L.y0} x2={c.x0} y2={L.y1} className="p-sym" />)}
      <g>
        {g.lines.map(([x1, y1, x2, y2], i) => <line key={`l${i}`} x1={x1} y1={y1} x2={x2} y2={y2} className="p-sym" />)}
        {g.circles.map(([cx, cyy, r], i) => <circle key={`c${i}`} cx={cx} cy={cyy} r={r} className="p-sym" />)}
        {g.paths.map((d, i) => <path key={`p${i}`} d={d} className="p-sym" />)}
        {g.heads.map(([p, u], i) => tip(p, u, e * 0.55, `h${i}`))}
      </g>
      {L.cells.slice(1).map((c, i) => {
        const tw = textW(c.text ?? "", it.size, it.font), mw = c.mod ? it.size * 1.15 : 0, x0 = (c.x0 + c.x1) / 2 - (tw + mw) / 2;
        return (
          <g key={`t${c.x0}`}>
            <text x={r6(x0 + tw / 2)} y={r6(cy + it.size * 0.36)} textAnchor="middle" className="t-sym" style={font(it.size, it.font)}>{c.text}</text>
            {i === 0 && c.mod && (
              <g>
                <circle cx={r6(x0 + tw + mw / 2 + it.size * 0.05)} cy={cy} r={r6(it.size * 0.48)} className="p-sym" />
                <text x={r6(x0 + tw + mw / 2 + it.size * 0.05)} y={r6(cy + it.size * 0.26)} textAnchor="middle" className="t-sym" style={font(it.size * 0.68, it.font)}>{c.mod}</text>
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}

export function DatumView({ it }: { it: DatumItem }) {
  const L = datumLayout(it), [x0, y0, x1, y1] = L.box;
  return (
    <g>
      {L.lead && <line x1={L.lead[0][0]} y1={L.lead[0][1]} x2={L.lead[1][0]} y2={L.lead[1][1]} className="p-sym" />}
      <path d={`M ${L.tri[0][0]} ${L.tri[0][1]} L ${L.tri[1][0]} ${L.tri[1][1]} L ${L.tri[2][0]} ${L.tri[2][1]} Z`} className={it.solid ? "p-sym f-sym" : "p-sym"} />
      <rect x={x0} y={y0} width={r6(x1 - x0)} height={r6(y1 - y0)} className="p-sym" style={{ fill: "var(--panel)" }} />
      <text x={r6((x0 + x1) / 2)} y={r6((y0 + y1) / 2 + it.size * 0.36)} textAnchor="middle" className="t-sym" style={font(it.size, it.font)}>{it.s}</text>
    </g>
  );
}

export function RoughView({ it }: { it: RoughItem }) {
  const g = roughLocal(it), P = (p: P2) => `${r6(p[0])} ${r6(p[1])}`;
  return (
    <g transform={`translate(${it.x} ${it.y})${it.a ? ` rotate(${it.a})` : ""}`}>
      <path d={`M ${P(g.Lp)} L 0 0 L ${P(g.R)}${g.ext ? ` L ${P(g.ext[1])}` : ""}`} className="p-sym" />
      {it.kind === "mrr" && <line x1={r6(g.bar[0][0])} y1={r6(g.bar[0][1])} x2={r6(g.bar[1][0])} y2={r6(g.bar[1][1])} className="p-sym" />}
      {it.kind === "nmr" && <circle cx={r6(g.circle.c[0])} cy={r6(g.circle.c[1])} r={r6(g.circle.r)} className="p-sym" />}
      {it.s && <text x={r6(g.text[0])} y={r6(g.text[1])} className="t-sym" style={font(it.size, it.font)}>{it.s}</text>}
    </g>
  );
}
