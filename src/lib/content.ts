import ref from "../../content/reference.json";

export type RefRow = [string, string, string | null, number, number];
export type RefM = [string, string, string | null];
export const reference = ref as { g: RefRow[]; m: RefM[]; letters: [string, string][] };
import exData from "../../content/exercises.json";

export interface Exercise {
  slug: string; title: string; level: 1 | 2 | 3; mode: "mill" | "lathe";
  brief: string; hints: string[]; starter: string; reference: string;
  tolerance?: number; requireCodes?: string[]; forbidCodes?: string[]; maxCutLength?: number;
  /** półfabrykat: frezarka — prostopadłościan z położeniem zera, tokarka — pręt */
  stock?: { x?: number; y?: number; z?: number; ox?: number; oy?: number; oz?: number; d?: number; len?: number };
  /** narzędzia dobrane do zadania (klucz = numer T) */
  tools?: Record<string, { kind: string; name: string } & Record<string, unknown>>;
}
export const exercises = exData as unknown as Exercise[];
export const exerciseBySlug = (s: string) => exercises.find((e) => e.slug === s);

/* Słownik z content/slownik/*.yaml — przez content/.generated/slownik.json (npm run tresci). */
import glossaryData from "../../content/.generated/slownik.json";

export interface GlossaryEntry {
  term: string;
  /** kotwica /slownik#… — jawna, zapisana w pliku hasła (zmiana `term` jej nie zmienia) */
  anchor: string;
  aliases: string[]; def: string; see: string[]; diagram?: string;
}
export const glossary = glossaryData as GlossaryEntry[];
