import type { MDXComponents } from "mdx/types";
import * as runtime from "react/jsx-runtime";
import type { ReactElement } from "react";
import remarkGfm from "remark-gfm";
import { ContentError, prepareSource, remarkGcat, type GcatMeta, type GcatRemarkOptions } from "./remark";

/*
  Kompilacja treści MDX po stronie serwera (build / Server Component), bez CMS.
  compileContent → kod funkcji (można cache'ować po hashu pliku), renderContent → element React.
  Nazwy komponentów dozwolonych w treści podaje wywołujący (mapa z components.tsx).
  @mdx-js/mdx jest ładowany przez import(): pakiet (i jego zależności) jest tylko-ESM,
  a skrypty uruchamiane przez tsx (prebuild) działają w trybie CommonJS.
*/

const mdx = () => import("@mdx-js/mdx");

export type CompileOptions = Omit<GcatRemarkOptions, "components" | "diagramIds"> & {
  /** ścieżka pliku do komunikatów błędów */
  file: string;
  components: string[];
  diagramIds: Set<string> | string[];
};

/** Kontenery blokowe, w których MDX wstawia "\n" między dziećmi — Article.tsx renderuje je bez odstępów. */
const BLOCK = new Set(["ul", "ol", "table", "thead", "tbody", "tr", "figure"]);
type HNode = { type: string; tagName?: string; name?: string; value?: string; children?: HNode[] };

/** rehype: usuwa tekst złożony z samych białych znaków między blokami (HTML 1:1 z Article.tsx). */
function rehypeTrimBlocks() {
  const walk = (n: HNode) => {
    if (!n.children) return;
    const block = n.type === "root" || n.type === "mdxJsxFlowElement" || (n.type === "element" && BLOCK.has(n.tagName ?? ""));
    if (block) n.children = n.children.filter((c) => !(c.type === "text" && !/\S/.test(c.value ?? "")));
    n.children.forEach(walk);
  };
  return (tree: HNode) => walk(tree);
}

export async function compileContentMeta(source: string, o: CompileOptions): Promise<{ code: string; meta: GcatMeta }> {
  const plugin: GcatRemarkOptions = { ...o, diagramIds: o.diagramIds instanceof Set ? o.diagramIds : new Set(o.diagramIds) };
  try {
    const { compile } = await mdx();
    const out = await compile({ value: prepareSource(source), path: o.file }, {
      outputFormat: "function-body",
      remarkPlugins: [remarkGfm, [remarkGcat, plugin]],
      rehypePlugins: [rehypeTrimBlocks],
      development: false,
    });
    return { code: String(out), meta: out.data.gcat as GcatMeta };
  } catch (e) {
    if (e instanceof ContentError) throw e;
    // błąd składni MDX (np. niedomknięty tag): pozycja z vfile-message
    const m = e as { line?: number; column?: number; reason?: string; message?: string };
    throw new ContentError(o.file, [{ line: m.line, column: m.column, message: `błąd składni MDX: ${m.reason ?? m.message}` }]);
  }
}

export async function compileContent(source: string, o: CompileOptions): Promise<string> {
  return (await compileContentMeta(source, o)).code;
}

export async function renderContent(code: string, components: MDXComponents): Promise<ReactElement> {
  const { run } = await mdx();
  const { default: Content } = await run(code, { ...runtime });
  return Content({ components }) as ReactElement;
}
