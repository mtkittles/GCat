import type { ReactNode } from "react";
import { Dim, Fig, T } from "@/components/fig";

/*
  Rysunki działu Płytki ISO (V3.2…) — styl jak figs-noze.tsx: szerokość 360, płytka w szarościach,
  wymiar z oznaczenia kolorem parametru. Proporcje poglądowe.
*/

const rad = (d: number) => (d * Math.PI) / 180;

/* ================= wymiary płytki z oznaczenia: d, l, rε (z góry), s i α (przekrój) ================= */
export function InsertDims() {
  const cx = 104, cy = 108, d = 92, eps = 80;
  const r = d / 2, dA = r / Math.sin(rad(eps / 2)), dO = r / Math.cos(rad(eps / 2));
  const L: [number, number] = [cx - dA, cy], U: [number, number] = [cx, cy - dO], Rr: [number, number] = [cx + dA, cy], D: [number, number] = [cx, cy + dO];
  // przekrój płytki pozytywowej (kąt przyłożenia α)
  const x0 = 244, x1 = 344, y0 = 92, s = 24, al = 11, off = Math.tan(rad(al)) * s * 2.2;
  return (
    <Fig id="tpw" code="ISO 1832" title="Wymiary płytki w oznaczeniu" h={226}
      legend={[["acc", "wymiar z oznaczenia"], ["cons", "okrąg wpisany"]]}
      caption={<>Z lewej płytka rombowa 80° z góry, z prawej przekrój płytki pozytywowej; proporcje poglądowe.</>}>
      {(c) => (
        <g>
          <path d={`M ${L.join(" ")} L ${U.join(" ")} L ${Rr.join(" ")} L ${D.join(" ")} Z`} className="cutter" />
          <circle cx={cx} cy={cy} r={r} className="p-cons" fill="none" />
          {/* d — średnica okręgu wpisanego */}
          <Dim c={c} x1={cx} y1={cy - r} x2={cx} y2={cy + r} label="d" lside={1} />
          {/* l — długość krawędzi (L → U) */}
          <line x1={L[0]} y1={L[1]} x2={U[0]} y2={U[1]} className="p-acc thick" />
          <T x={(L[0] + U[0]) / 2 - 12} y={(L[1] + U[1]) / 2 - 6} anchor="middle" cls="t-acc t-b">l</T>
          {/* rε i kąt naroża ε */}
          <circle cx={L[0] + 3} cy={L[1]} r={8} className="p-acc" fill="none" />
          <T x={L[0] - 4} y={L[1] + 24} anchor="middle" cls="t-acc t-b">rε</T>
          <T x={L[0] + 16} y={L[1] + 4} cls="t-sm t-mut">ε = 80°</T>
          <T x={12} y={16} cls="t-sm t-mut">widok z góry</T>
          {/* przekrój */}
          <T x={x0} y={16} cls="t-sm t-mut">przekrój</T>
          <path d={`M ${x0} ${y0} L ${x1} ${y0} L ${x1 - off} ${y0 + s} L ${x0 + off} ${y0 + s} Z`} className="cutter" />
          <line x1={x0} y1={y0} x2={x0 + off} y2={y0 + s} className="p-acc thick" />
          <line x1={x0} y1={y0} x2={x0} y2={y0 + s + 22} className="p-cons" />
          <T x={x0 + 4} y={y0 + s + 34} cls="t-acc t-b">α</T>
          <Dim c={c} x1={x1 + 6} y1={y0} x2={x1 + 6} y2={y0 + s} label="s" lside={1} />
          <line x1={x1 - 12} y1={y0} x2={x1 + 10} y2={y0} className="p-ext" />
          <line x1={x1 - off} y1={y0 + s} x2={x1 + 10} y2={y0 + s} className="p-ext" />
        </g>
      )}
    </Fig>
  );
}

export const plytkiFigs: Record<string, () => ReactNode> = {
  "tech-plytka-wymiary": () => <InsertDims />,
};
