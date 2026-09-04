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
