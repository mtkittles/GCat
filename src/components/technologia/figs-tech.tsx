import type { ReactNode } from "react";
import { Dim, Fig, Step, T } from "@/components/fig";
import { HV } from "./tech-data";

/*
  Rysunki działu Technologia (V3.0) — ten sam styl co reszta serwisu (fig.tsx): szerokość 360, tekst 11 px,
  kolory o stałym znaczeniu. Klucze z prefiksem „tech-”. Dane liczbowe na rysunkach tylko ze źródeł artykułu.
*/

/* ================= budowa freza trzpieniowego (widok z boku, oś pozioma) ================= */
export function EndMillParts() {
  const ax = 108;                    // oś narzędzia
  const sx0 = 22, sx1 = 136, rs = 17; // chwyt
  const nx1 = 160, rn = 13;           // szyjka
  const cx1 = 292, rc = 22;           // część robocza (do czoła)
  const top = ax - rc, bot = ax + rc;
  const tan = Math.tan((30 * Math.PI) / 180); // linia śrubowa 30° do osi — tylko ilustracja
  const run = (2 * rc) / tan;          // przesunięcie wzdłuż osi na wysokości średnicy
  const xs = [118, 150, 182, 214, 246, 278];
  const hx = 182;                      // linia z kątem (7) i ostrzem obwodowym (4)
  return (
    <Fig id="tfb" code="frez" title="Frez trzpieniowy — budowa" h={248} legend={[["acc", "krawędź skrawająca"], "dim", "cons"]}
      caption={<>Widok z boku, oś narzędzia pozioma. Linie rowków narysowano pod kątem 30° poglądowo.</>}>
      {(c) => (
        <g>
          <defs><clipPath id="tfb-clip"><rect x={nx1} y={top} width={cx1 - nx1} height={2 * rc} /></clipPath></defs>
          <line x1={10} y1={ax} x2={322} y2={ax} className="axis-c" />
          {/* chwyt z fazką */}
          <path d={`M ${sx0 + 4} ${ax - rs} H ${sx1} V ${ax + rs} H ${sx0 + 4} L ${sx0} ${ax + rs - 4} V ${ax - rs + 4} Z`} className="holder" />
          {/* szyjka */}
          <rect x={sx1} y={ax - rn} width={nx1 - sx1} height={2 * rn} className="holder" />
          {/* część robocza */}
          <rect x={nx1} y={top} width={cx1 - nx1} height={2 * rc} className="cutter" />
          <g clipPath="url(#tfb-clip)">
            {xs.map((x) => <line key={x} x1={x} y1={top} x2={x + run} y2={bot} className="p-sym" />)}
            <line x1={hx} y1={top} x2={hx + run} y2={bot} className="p-acc thick" />
          </g>
          {/* ostrze czołowe */}
          <line x1={cx1} y1={top} x2={cx1} y2={bot} className="p-acc thick" />
          {/* kąt linii śrubowej: oś równoległa do osi narzędzia przez punkt na krawędzi */}
          <line x1={hx + 6} y1={top + 9} x2={hx + 52} y2={top + 9} className="p-cons" />
          <path d={`M ${hx + 6 + 26} ${top + 9} A 26 26 0 0 1 ${hx + 6 + 26 * Math.cos(Math.PI / 6)} ${top + 9 + 26 * Math.sin(Math.PI / 6)}`} className="p-dim" />
          {/* odnośniki */}
          <line x1={78} y1={58} x2={78} y2={ax - rs} className="p-ext" /><Step x={78} y={50} n={1} />
          <line x1={148} y1={58} x2={148} y2={ax - rn} className="p-ext" /><Step x={148} y={50} n={2} />
          <line x1={196} y1={58} x2={196} y2={top} className="p-ext" /><Step x={196} y={50} n={3} />
          <line x1={248} y1={58} x2={hx + 5} y2={top + 3} className="p-ext" /><Step x={248} y={50} n={4} />
          <line x1={316} y1={64} x2={cx1 + 1} y2={top + 8} className="p-ext" /><Step x={316} y={56} n={5} />
          <line x1={262} y1={152} x2={258} y2={bot - 4} className="p-ext" /><Step x={262} y={160} n={6} />
          <line x1={222} y1={152} x2={hx + 30} y2={top + 15} className="p-ext" /><Step x={222} y={160} n={7} />
          {/* wymiary */}
          <Dim c={c} x1={cx1 + 18} y1={top} x2={cx1 + 18} y2={bot} label="D" lside={-1} />
          <line x1={cx1} y1={top} x2={cx1 + 22} y2={top} className="p-ext" /><line x1={cx1} y1={bot} x2={cx1 + 22} y2={bot} className="p-ext" />
          <line x1={nx1} y1={bot} x2={nx1} y2={198} className="p-ext" /><line x1={cx1} y1={bot} x2={cx1} y2={226} className="p-ext" /><line x1={sx0} y1={ax + rs} x2={sx0} y2={226} className="p-ext" />
          <Dim c={c} x1={nx1} y1={194} x2={cx1} y2={194} label="długość robocza" lside={-1} />
          <Dim c={c} x1={sx0} y1={222} x2={cx1} y2={222} label="długość całkowita" lside={-1} />
        </g>
      )}
    </Fig>
  );
}

/* ================= twardość materiałów narzędziowych (zakresy HV) ================= */

export function ToolHardness() {
  const x0 = 116, x1 = 342, max = 12000, X = (v: number) => x0 + (v / max) * (x1 - x0);
  const y0 = 30, dy = 27;
  const ticks = [0, 2000, 4000, 6000, 8000, 10000, 12000];
  return (
    <Fig id="tth" code="HV" title="Twardość materiałów narzędziowych — zakresy dla grup" h={226} legend={[["acc", "zakres twardości HV"]]}
      caption={<>Zakresy z tabeli właściwości twardych materiałów narzędziowych producenta (Mitsubishi Materials). Konkretny gatunek ma jedną wartość — z karty katalogowej producenta.</>}>
      {() => (
        <g>
          {ticks.map((t) => <line key={t} x1={X(t)} y1={y0 - 12} x2={X(t)} y2={y0 + dy * HV.length - 8} className="gr-min" />)}
          {HV.map(([name, a, b], i) => {
            const y = y0 + i * dy;
            const label = `${fmt(a)}–${fmt(b)}`;
            const right = X(b) + 4 + label.length * 6 <= 358; // etykieta za paskiem albo — gdy się nie mieści — przed nim
            return (
              <g key={name}>
                <T x={x0 - 8} y={y + 4} anchor="end">{name}</T>
                <rect x={X(a)} y={y - 7} width={Math.max(3, X(b) - X(a))} height={14} rx={3} className="allow" />
                <T x={right ? X(b) + 4 : X(a) - 4} y={y + 4} anchor={right ? "start" : "end"} cls="t-mono t-sm t-mut">{label}</T>
              </g>
            );
          })}
          {ticks.map((t) => <T key={t} x={X(t)} y={y0 + dy * HV.length + 6} anchor="middle" cls="t-tick">{t / 1000}</T>)}
          <T x={x1} y={y0 + dy * HV.length + 22} anchor="end" cls="t-mut t-sm">tys. HV</T>
        </g>
      )}
    </Fig>
  );
}
/** zapis liczby jak w treści: spacja tysięcy od 10 000 */
const fmt = (v: number) => (v >= 10000 ? `${Math.floor(v / 1000)} ${String(v % 1000).padStart(3, "0")}` : String(v));

export const techFigs: Record<string, () => ReactNode> = {
  "tech-frez-budowa": () => <EndMillParts />,
  "tech-twardosc": () => <ToolHardness />,
};
