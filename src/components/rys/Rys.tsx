import { Fig, type LegendItem } from "@/components/fig";
import { rich } from "@/components/Rich";
import { autoLegend, LEGEND_LABEL, parseDoc, type LegendKey, type RysFigure } from "@/lib/rys/model";
import { renderItem } from "./render";

/** klucz legendy → klasa znaczka .lg-… (stock = kreskowany materiał z rysunków kodowych, outline = obrys półfabrykatu) */
const LG: Partial<Record<LegendKey, string>> = { stock: "outline", hatch: "stock" };
export const legendItems = (keys: { k: LegendKey; label: string }[]): LegendItem[] => keys.map(({ k, label }) => [LG[k] ?? k, label || LEGEND_LABEL[k]]);

/** Rysunek z rysownika (content/rysunki/<slug>.yaml) w ramce rysunków serwisu. */
export default function Rys({ fig }: { fig: RysFigure }) {
  const doc = parseDoc(fig);
  const legend = fig.legend.length ? fig.legend : autoLegend(doc).map((k) => ({ k, label: "" }));
  return (
    <Fig id={`rys-${fig.slug}`} code={fig.code || undefined} title={fig.title} h={doc.h} legend={legendItems(legend)} caption={fig.caption ? rich(fig.caption) : undefined}>
      {(c) => <g>{doc.items.map((it, i) => <g key={i}>{renderItem(it, c)}</g>)}</g>}
    </Fig>
  );
}
