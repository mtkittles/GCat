/**
 * Normalizacja tekstu do wyszukiwania: małe litery, bez polskich znaków.
 * Każdy znak przechodzi na jeden znak, więc pozycje w tekście znormalizowanym
 * odpowiadają pozycjom w oryginale (wykorzystuje to podświetlanie trafień).
 */
export const norm = (s: string) => s.toLowerCase()
  .replace(/[ąàâ]/g, "a").replace(/[ćč]/g, "c").replace(/[ęèé]/g, "e").replace(/ł/g, "l")
  .replace(/ń/g, "n").replace(/[óô]/g, "o").replace(/[śš]/g, "s").replace(/[żź]/g, "z");

/** Słowa zapytania po normalizacji — te same, którymi punktuje `search()`. */
export const queryTerms = (query: string) => norm(query.trim()).split(/\s+/).filter(Boolean);

/**
 * Zakresy [od, do) w `text`, które pasują do słów zapytania według reguł `search()`:
 * bez rozróżniania wielkości liter i polskich znaków, każde słowo osobno.
 * Słowa jednoznakowe pomijamy (podświetliłyby pół tekstu). Nakładające się zakresy są scalane.
 */
export function matchRanges(text: string, query: string): [number, number][] {
  const terms = queryTerms(query).filter((t) => t.length >= 2);
  if (!terms.length || !text) return [];
  // norm znak po znaku: map[i] = pozycja w oryginale znaku i tekstu znormalizowanego
  let n = "";
  const map: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const c = norm(text[i]);
    for (let k = 0; k < c.length; k++) { n += c[k]; map.push(i); }
  }
  const found: [number, number][] = [];
  for (const t of terms) {
    for (let i = n.indexOf(t); i >= 0; i = n.indexOf(t, i + t.length)) {
      found.push([map[i], map[i + t.length - 1] + 1]);
    }
  }
  found.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
  const out: [number, number][] = [];
  for (const [a, b] of found) {
    const last = out[out.length - 1];
    if (last && a <= last[1]) last[1] = Math.max(last[1], b);
    else out.push([a, b]);
  }
  return out;
}
