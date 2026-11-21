/* Technologia z content/technologia/ — przez content/.generated/technologia.json (npm run tresci). */
import data from "../../content/.generated/technologia.json";
import lekcjeData from "../../content/.generated/lekcje.json";
import type { Dzial } from "@/lib/mdx/schema";
import { pl } from "@/lib/plural";

export type { Dzial };
export type ArtTyp = "narzedzie" | "temat" | "porownanie";
export type Obrobka = "frezowanie" | "toczenie" | "wiercenie";

export interface TechArt {
  /** <dział>/<slug> */
  key: string;
  title: string; slug: string; dzial: string; typ: ArtTyp; order: number; short: string;
  obrobka: Obrobka[]; poziom: 1 | 2 | 3; normy: string[];
  stan: "szkic" | "sprawdzony"; plan: "free" | "pro"; dodano: string;
  sources: { id: string; where: string; loc?: string; url?: string }[];
  powiazane: { kody: string[]; lekcje: string[]; hasla: string[]; artykuly: string[]; kalkulator: boolean };
  headings: { id: string; label: string }[];
  /** miniatura: pierwszy rysunek artykułu */
  thumb: { kind: "diagram" | "rys"; id: string } | null;
  minutes: number;
}

export interface LekcjaRef { id: string; title: string; href: string; track: "frezowanie" | "toczenie" }

const d = data as unknown as { dzialy: Dzial[]; artykuly: TechArt[] };
export const dzialy = d.dzialy;
/** wszystkie artykuły (także Pro — filtruj przez `visible`) */
export const artykuly = d.artykuly;
export const lekcje = lekcjeData as LekcjaRef[];

export const TYP_LABEL: Record<ArtTyp, string> = { narzedzie: "Karta narzędzia", temat: "Temat", porownanie: "Porównanie" };
export const OBROBKA_LABEL: Record<Obrobka, string> = { frezowanie: "frezowanie", toczenie: "toczenie", wiercenie: "wiercenie" };

export const dzialBySlug = (s: string) => dzialy.find((x) => x.slug === s);
export const artByKey = (k: string) => artykuly.find((a) => a.key === k);
export const artHref = (a: { dzial: string; slug: string }) => `/technologia/${a.dzial}/${a.slug}`;
export const lekcjaById = (id: string) => lekcje.find((l) => l.id === id);

/** Artykuły widoczne dla gościa (bez Pro). Lista dla redakcji/Pro: `artykuly`. */
export const publicArts = artykuly.filter((a) => a.plan === "free");
export const artsOf = (dzial: string, list: TechArt[] = artykuly) => list.filter((a) => a.dzial === dzial).sort((x, y) => x.order - y.order);
/** Najnowsze po dacie dodania (potem kolejność działów). */
export const recent = (list: TechArt[], n = 6) => [...list].sort((x, y) => y.dodano.localeCompare(x.dodano) || x.key.localeCompare(y.key)).slice(0, n);

/** „1 artykuł”, „3 artykuły”, „5 artykułów”. */
export const artykulow = (n: number) => pl(n, "artykuł", "artykuły", "artykułów");
