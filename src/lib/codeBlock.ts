/* Rozpoznanie bloku programu w treści (server i klient) — używane przez Article przed wyborem CodeBlock. */

/** Każda niepusta linia zaczyna się jak blok programu: adres z liczbą, komentarz albo słowo kluczowe Sinumerika. */
export const isProgram = (src: string) =>
  src.split("\n").every((l) => !l.trim() || /^\s*([(;%]|[A-Z]{1,2}=?[-+]?[\d.#]|[A-Z_$]{3,}[A-Z0-9_$]*(\s*\(|\s|$))/.test(l));
