import type { ReactElement } from "react";
import type { GCode } from "@/lib/gcodes";
import { renderContent } from "./compile";
import { mdxComponents } from "./components";
import { kodToGcode } from "./export";
import { loadContent, type Content } from "./loader";

/*
  Przełącznik źródła kart (krok 3 — pilot). Karty z tej listy strona /kody/[slug] czyta z content/kody/<slug>.mdx,
  pozostałe dalej z gcodes.json + articles*.ts (stare pliki bez zmian). Cofnięcie pilota = pusta lista.
*/
export const MDX_KODY: ReadonlySet<string> = new Set(["g01", "g02", "g03", "g84"]);

let cache: Promise<Content> | null = null;
/** Cała treść z content/ — wczytana i zwalidowana raz na proces (build). */
export const tresci = () => (cache ??= loadContent("content"));

export interface KodMdx {
  g: GCode;
  /** nagłówki artykułu (spis treści) — kotwice jawne z pliku */
  headings: { id: string; label: string }[];
  hasDiagram: boolean;
  render: () => Promise<ReactElement>;
}

export async function kodMdx(slug: string): Promise<KodMdx | null> {
  if (!MDX_KODY.has(slug)) return null;
  const k = (await tresci()).kody.find((x) => x.data.slug === slug);
  if (!k) throw new Error(`MDX_KODY zawiera „${slug}”, ale nie ma pliku content/kody/${slug}.mdx`);
  return { g: kodToGcode(k.data), headings: k.meta.headings, hasDiagram: k.meta.diagrams > 0, render: () => renderContent(k.body, mdxComponents) };
}
