/*
  Rozwiązywanie markerów [[klucz]] przy kompilacji MDX — ta sama kolejność co lookup() w ui/Term.tsx:
  najpierw karta kodu, potem hasło słownika (w kolejności `order`). Źródła pochodzą z content/
  (loader buduje je z wczytanych plików), więc moduł nie importuje danych strony.
*/

export type Resolved = { kind: "kod"; slug: string } | { kind: "pojęcie"; anchor: string };

export interface TermSources {
  gcodes: { code: string; slug: string }[];
  glossary: { term: string; aliases: string[] }[];
}

/** Źródła z treści (karty i hasła posortowane po `order`). */
export function sourcesFrom(kody: { code: string; slug: string; order: number }[], slownik: { term: string; aliases: string[]; order: number }[]): TermSources {
  const byOrder = <T extends { order: number }>(a: T[]) => [...a].sort((x, y) => x.order - y.order);
  return { gcodes: byOrder(kody), glossary: byOrder(slownik) };
}

/** Kotwica hasła liczona dziś z tekstu (`/slownik#…`). W content/slownik jest zapisana jawnie w polu `anchor`. */
export const glossaryAnchor = (term: string) => term.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-");

export function resolveKey(key: string, src: TermSources): Resolved | null {
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
export function knownCodes(src: Pick<TermSources, "gcodes">): Set<string> {
  const out = new Set<string>();
  for (const g of src.gcodes) for (const c of g.code.toUpperCase().split(/[\s/–-]+/)) if (/^[GM]\d/.test(c)) out.add(c);
  return out;
}

/** Kody bieżącej karty (wyróżnione, bez linku) — jak `self` na stronie /kody/[slug]. */
export const selfCodes = (code: string) => code.toUpperCase().split(/[\s/–-]+/).filter((c) => /^[GM]\d/.test(c));
