import { diagrams } from "@/components/diagrams";
import Rys from "@/components/rys/Rys";
import { rysBySlug } from "@/components/rys/registry";
import type { TechArt } from "@/lib/technologia";
import { DzialIcon } from "./icons";

/** Miniatura artykułu na listach: pierwszy rysunek z treści (bez nagłówka, legendy i podpisu), inaczej ikona działu. */
export default function TechThumb({ a, icon }: { a: TechArt; icon: string }) {
  const t = a.thumb;
  const fig = t?.kind === "diagram" ? diagrams[t.id]?.() : t?.kind === "rys" ? (() => { const f = rysBySlug(t.id); return f ? <Rys fig={f} /> : null; })() : null;
  return fig
    ? <span className="tech-thumb" inert aria-hidden>{fig}</span>
    : <span className="tech-thumb is-icon" aria-hidden><DzialIcon icon={icon} /></span>;
}
