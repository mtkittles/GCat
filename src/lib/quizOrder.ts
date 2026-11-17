/*
  Kolejność odpowiedzi w pytaniach wyboru. W treści lekcji poprawna odpowiedź stoi najczęściej na pierwszym miejscu
  (audyt toczenia §3.4: 139 ze 152 pytań), więc test dałoby się zaliczyć bez czytania. Opcje pokazujemy w kolejności
  wylosowanej raz dla pytania: ziarno z treści pytania i opcji, więc ta sama kolejność po odświeżeniu, na serwerze
  i w przeglądarce (bez różnic przy hydratacji), a sprawdzanie dalej porównuje indeksy z pliku.
*/

/** FNV-1a (32 bity) — ziarno z tekstu. */
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}
/** mulberry32 — prosty generator liczb pseudolosowych z ziarna. */
function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Indeksy opcji w kolejności wyświetlania (Fisher–Yates z ziarnem z pytania). */
export function optionOrder(q: string, options: string[]): number[] {
  const r = rng(hash(`${q}\u0000${options.join("\u0000")}`));
  const out = options.map((_, i) => i);
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}
