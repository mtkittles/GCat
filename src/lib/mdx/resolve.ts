import { glossary, type GlossaryEntry } from "@/lib/content";
import { gcodes, type GCode } from "@/lib/gcodes";

/*
  Rozwiązywanie markerów [[klucz]] przy kompilacji MDX — ta sama kolejność co lookup() w ui/Term.tsx:
  najpierw karta kodu, potem hasło słownika. Term.tsx (komponent współdzielony) zostaje bez zmian
  i sam rozwiązuje klucz w przeglądarce; tutaj sprawdzamy tylko, że klucz istnieje (inaczej błąd builda).
*/

export type Resolved = { kind: "kod"; slug: string } | { kind: "pojęcie"; anchor: string };

export interface TermSources {
  gcodes: Pick<GCode, "code" | "slug">[];
  glossary: Pick<GlossaryEntry, "term" | "aliases">[];
}

export const liveSources: TermSources = { gcodes, glossary };

/** Kotwica hasła liczona dziś z tekstu (`/slownik#…`). W content/slownik jest zapisana jawnie w polu `anchor`. */
export const glossaryAnchor = (term: string) => term.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-");

export function resolveKey(key: string, src: TermSources = liveSources): Resolved | null {
  const k = key.trim().toLowerCase();
  const code = src.gcodes.find((g) =>
    g.code.toLowerCase() === k ||
    g.code.toLowerCase().split(/[\s/]+/).includes(k) ||
    g.slug === k.replace(/\s+/g, "-"));
  if (code) return { kind: "kod", slug: code.slug };
  const term = src.glossary.find((g) =>
    g.term.toLowerCase() === k ||
    g.term.toLowerCase().startsWith(k + " ") ||
    g.aliases.some((a) => a.toLowerCase() === k));
  if (term) return { kind: "pojęcie", anchor: glossaryAnchor(term.term) };
  return null;
}

/** Kody G/M, które mają kartę — jak KNOWN w CodeText.tsx (auto-linki w kartach). */
export function knownCodes(src: Pick<TermSources, "gcodes"> = liveSources): Set<string> {
  const out = new Set<string>();
  for (const g of src.gcodes) for (const c of g.code.toUpperCase().split(/[\s/–-]+/)) if (/^[GM]\d/.test(c)) out.add(c);
  return out;
}

/** Kody bieżącej karty (wyróżnione, bez linku) — jak `self` na stronie /kody/[slug]. */
export const selfCodes = (code: string) => code.toUpperCase().split(/[\s/–-]+/).filter((c) => /^[GM]\d/.test(c));
