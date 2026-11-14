import { glossary } from "./content";
import { gcodes } from "./gcodes";

/*
  Talia fiszek z treści serwisu. Każda karta ma pytanie (`ask`), przód i tył.
  Identyfikatory `t:<hasło>` i `g:<slug>` są takie jak przed paczką UF — zapisany postęp powtórek zostaje.
*/
export type DeckId = "slownik" | "wzory" | "kody";
export interface Flashcard {
  id: string; deck: DeckId;
  /** pytanie nad przodem karty */
  ask: string;
  front: string; frontMono?: boolean;
  /** wyróżniona pierwsza linia odpowiedzi (nazwa kodu albo sam kod) */
  title?: string; titleMono?: boolean;
  /** tekst odpowiedzi */
  back?: string;
  /** wzory — osobne linie czcionką stałej szerokości */
  lines?: string[];
  /** dopisek pod odpowiedzią (przykład liczbowy) */
  note?: string;
  href: string;
}

export const DECKS: Record<DeckId, string> = { slownik: "Słownik", wzory: "Wzory", kody: "Kody G i M" };

export const FLASHCARDS: Flashcard[] = [
  ...glossary.map((g): Flashcard => ({ id: `t:${g.term}`, deck: "slownik", ask: "Co to znaczy?", front: g.term, back: g.def, href: `/slownik#${g.anchor}` })),
  ...glossary.filter((g) => g.formulas?.length).map((g): Flashcard => ({
    id: `w:${g.anchor}`, deck: "wzory", ask: "Jaki to wzór?", front: g.term,
    lines: g.formulas!.map((f) => f.expr), note: g.formulas!.find((f) => f.example)?.example, href: `/slownik#${g.anchor}`,
  })),
  ...gcodes.map((g): Flashcard => ({ id: `g:${g.slug}`, deck: "kody", ask: "Co robi ten kod?", front: g.code, frontMono: true, title: g.name, back: g.short, href: `/kody/${g.slug}` })),
  ...gcodes.map((g): Flashcard => ({ id: `k:${g.slug}`, deck: "kody", ask: "Jaki to kod?", front: g.name, title: g.code, titleMono: true, back: g.short, href: `/kody/${g.slug}` })),
];

/** Free: tyle pierwszych haseł słownika. */
export const FREE_LIMIT = 15;
export const freeCards = () => FLASHCARDS.filter((c) => c.deck === "slownik").slice(0, FREE_LIMIT);
