import { existsSync, readFileSync } from "node:fs";
import type { ReactElement } from "react";
import { compileContentMeta, renderContent } from "./compile";
import { mdxComponents } from "./components";
import { liveSources } from "./live";
import { splitFrontmatter } from "./loader";
import { componentNames, diagramIds } from "./names";

/*
  Artykuł karty z content/kody/<slug>.mdx dla strony /kody/[slug] (render w trakcie builda).
  Dane karty (frontmatter) strona bierze z @/lib/gcodes — to te same pliki, przetworzone przez npm run tresci,
  które też waliduje całą treść przed buildem.
*/

export interface KartaMdx {
  /** nagłówki artykułu (spis treści) — kotwice jawne z pliku */
  headings: { id: string; label: string }[];
  hasDiagram: boolean;
  render: () => Promise<ReactElement>;
}

export async function kartaMdx(slug: string): Promise<KartaMdx | null> {
  const file = `content/kody/${slug}.mdx`;
  if (!existsSync(file)) return null;
  const fm = splitFrontmatter(readFileSync(file, "utf8"));
  if (!fm) throw new Error(`${file}: brak frontmattera`);
  const { code, meta } = await compileContentMeta(fm.body, { file, sources: liveSources, components: componentNames, diagramIds });
  return { headings: meta.headings, hasDiagram: meta.diagrams > 0, render: () => renderContent(code, mdxComponents) };
}
