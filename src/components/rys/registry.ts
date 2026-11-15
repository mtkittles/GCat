/* Rysunki z rysownika: content/rysunki/*.yaml → content/.generated/rysunki.json (npm run tresci). */
import data from "../../../content/.generated/rysunki.json";
import type { RysFigure } from "@/lib/rys/model";

export const rysunki = data as unknown as RysFigure[];
export const rysBySlug = (slug: string): RysFigure | undefined => rysunki.find((r) => r.slug === slug);
