import type { CSSProperties, ReactNode } from "react";
import { Dim, Pt, Step, T, type Ctx, type Kind } from "@/components/fig";
import { arcPath, polyPath, type Arrow, type Fill, type Item, type LineKind, type PtColor } from "@/lib/rys/model";

/*
  Rysowanie elementów rysownika — ten sam kod w edytorze i na stronie.
  Wygląd bierze się z klas rysunków serwisu (globals.css, sekcja „rysunki techniczne”), tu tylko geometria.
*/

export const LINE_CLASS: Record<LineKind, string> = {
  con: "p-con", cons: "p-cons", dim: "p-dim", axis: "axis-c", cut: "p-cut", rap: "p-rap", arc: "p-arc",
  acc: "p-acc", bad: "p-bad", stock: "stock-out", tool: "tool",
};
/** grot w kolorze rodzaju linii; rodzaje bez własnego grota biorą szary wymiarowy */
const MARKER: Record<LineKind, Kind> = { con: "con", cons: "dim", dim: "dim", axis: "dim", cut: "cut", rap: "rap", arc: "arc", acc: "acc", bad: "bad", stock: "dim", tool: "cut" };
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
const cls = (k: LineKind, thick: boolean) => LINE_CLASS[k] + (thick ? " thick" : "");
const marks = (k: LineKind, a: Arrow, c: Ctx) => ({
  markerStart: a === "start" || a === "both" ? c.a(MARKER[k]) : undefined,
  markerEnd: a === "end" || a === "both" ? c.a(MARKER[k]) : undefined,
});

export function textClass(it: { size: "sm" | "md" | "lg"; bold: boolean; mono: boolean; color: string }): string {
  return [it.bold && "t-b", it.mono && "t-mono", it.size === "sm" && "t-sm", it.size === "lg" && "t-big", it.color !== "ink" && `t-${it.color}`].filter(Boolean).join(" ");
}

const steps = (a: number, b: number, s: number) => { const r: number[] = []; for (let v = Math.ceil(a / s) * s; v <= b + 1e-9; v += s) r.push(+v.toFixed(3)); return r; };

export function renderItem(it: Item, c: Ctx): ReactNode {
  switch (it.t) {
    case "line": return <line x1={it.x1} y1={it.y1} x2={it.x2} y2={it.y2} className={cls(it.k, it.thick)} style={{ fill: "none" }} {...marks(it.k, it.arrow, c)} />;
    case "poly": return <path d={polyPath(it.pts, it.closed)} className={cls(it.k, it.thick)} style={fillStyle(it.fill, c)} {...marks(it.k, it.closed ? "none" : it.arrow, c)} />;
    case "rect": return <rect x={it.x} y={it.y} width={it.w} height={it.h} rx={it.r || undefined} className={cls(it.k, it.thick)} style={fillStyle(it.fill, c)} />;
    case "circle": return <circle cx={it.cx} cy={it.cy} r={it.r} className={cls(it.k, it.thick)} style={fillStyle(it.fill, c)} />;
    case "arc": return <path d={arcPath(it)} className={cls(it.k, it.thick)} style={{ fill: "none" }} {...marks(it.k, it.arrow, c)} />;
    case "text": return <T x={it.x} y={it.y} anchor={it.anchor} cls={textClass(it)}>{it.s}</T>;
    case "dim": return <Dim x1={it.x1} y1={it.y1} x2={it.x2} y2={it.y2} off={it.off} label={it.label} c={c} lside={it.side} />;
    case "pt": return <Pt x={it.x} y={it.y} label={it.label || undefined} pos={it.pos} dot={PT_CLASS[it.color]} />;
    case "step": return <Step x={it.x} y={it.y} n={it.n} />;
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
