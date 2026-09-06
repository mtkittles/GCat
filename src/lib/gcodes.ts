import data from "../../content/gcodes.json";

export interface GCode {
  code: string; slug: string; name: string; group: string; modal: boolean;
  milling: boolean; turning: boolean; level: 1 | 2 | 3;
  short: string; desc: string;
  syntax: { fanuc: string; sinumerik: string };
  params: { key: string; desc: string }[];
  example: string; sinumerik: string; pitfalls: string[];
}

export const gcodes = data as GCode[];
export const bySlug = (slug: string) => gcodes.find((g) => g.slug === slug);
export const levelName = (l: number) => (l === 1 ? "podstawy" : l === 2 ? "średni" : "zaawansowany");

/** Baner pasujący do rodzaju obróbki opisywanego przez kod. */
export function bannerFor(g: { slug: string; turning: boolean; milling: boolean; group: string }): string {
  if (/g84|g33|g76/.test(g.slug)) return "/img/banner-thread.jpg";
  if (/g81-g83|g85-g86/.test(g.slug)) return "/img/banner-drill.jpg";
  if (g.turning && !g.milling) return "/img/banner-turn.jpg";
  return "/img/banner-mill.jpg";
}
