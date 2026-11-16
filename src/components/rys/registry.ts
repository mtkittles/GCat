/* Rysunki z rysownika: content/rysunki/*.yaml → content/.generated/rysunki.json (npm run tresci). */
import data from "../../../content/.generated/rysunki.json";
import type { RysFigure } from "@/lib/rys/model";

export const rysunki = data as unknown as RysFigure[];
/** Rysunki jeszcze nieopublikowane — podgląd w edytorze treści (ramka podglądu) podaje je tutaj. */
const extra = new Map<string, RysFigure>();
export function provideRys(list: RysFigure[]) { extra.clear(); for (const f of list) extra.set(f.slug, f); }
export const rysBySlug = (slug: string): RysFigure | undefined => extra.get(slug) ?? rysunki.find((r) => r.slug === slug);
