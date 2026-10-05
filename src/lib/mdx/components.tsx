import type { MDXComponents } from "mdx/types";
import { diagrams } from "@/components/diagrams";
import Term from "@/components/ui/Term";

/*
  Komponenty dostępne w treści MDX. Istniejące komponenty strony (Term, rejestr rysunków)
  są tylko używane — bez zmian. Kolejne (Note, Code, Sim, Demo, Widget) dojdą w pilocie (krok 3).
*/

/** <Diagram id="g01" /> — rysunek z rejestru diagrams.tsx, opakowany jak blok `diagram` w Article.tsx. */
export function Diagram({ id }: { id: string }) {
  return <div>{diagrams[id]?.()}</div>;
}

export const mdxComponents = { Term, Diagram } satisfies MDXComponents;

export const componentNames = Object.keys(mdxComponents);
export const diagramIds = new Set(Object.keys(diagrams));
