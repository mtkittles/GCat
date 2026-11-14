/* Indeks słownika: grupa litery dla hasła i odmiana „hasło / hasła / haseł”. */

export const DIGITS = "0–9";

/** Grupa hasła w indeksie: pierwsza litera, a hasła zaczynające się cyfrą razem jako „0–9”. */
export const groupOf = (term: string) => {
  const c = term.trim().charAt(0).toLocaleUpperCase("pl");
  return /[0-9]/.test(c) ? DIGITS : c;
};

/** „1 hasło”, „3 hasła”, „12 haseł”, „22 hasła”. */
export const hasla = (n: number) => {
  const d = n % 10, h = n % 100;
  return `${n} ${n === 1 ? "hasło" : d >= 2 && d <= 4 && !(h >= 12 && h <= 14) ? "hasła" : "haseł"}`;
};
