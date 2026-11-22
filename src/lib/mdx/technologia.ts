import { existsSync, readFileSync } from "node:fs";
import type { ReactElement } from "react";
import { compileContentMeta, renderContent } from "./compile";
import { mdxComponents } from "./components";
import { liveSources } from "./live";
import { splitFrontmatter } from "./loader";
import { componentNames, diagramIds } from "./names";

/* Treść artykułu Technologii z content/technologia/<dział>/<slug>.mdx dla strony (render w trakcie builda). */
export async function artykulMdx(dzial: string, slug: string): Promise<{ render: () => Promise<ReactElement> } | null> {
  const file = `content/technologia/${dzial}/${slug}.mdx`;
  if (!existsSync(file)) return null;
  const fm = splitFrontmatter(readFileSync(file, "utf8"));
  if (!fm) throw new Error(`${file}: brak frontmattera`);
  const { code } = await compileContentMeta(fm.body, { file, sources: liveSources, components: componentNames, diagramIds, programLinks: true });
  return { render: () => renderContent(code, mdxComponents) };
}
