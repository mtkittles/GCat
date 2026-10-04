/*
  Dane do stron prawnych — jedno miejsce do uzupełnienia przez właściciela serwisu.
  Placeholdery w nawiasach kwadratowych są celowo widoczne na stronie, dopóki ich nie zastąpisz.
*/
export const LEGAL = {
  /** Administrator danych: imię i nazwisko lub firma, adres, e‑mail kontaktowy. */
  admin: "[IMIĘ I NAZWISKO / KONTAKT]",
  /** Data wejścia w życie obu dokumentów, np. „1 listopada 2026”. */
  effective: "[DATA WEJŚCIA W ŻYCIE]",
  /** Region bazy Supabase (ustawiony przy zakładaniu projektu). */
  supabaseRegion: "UE — Frankfurt (eu-central-1)",
} as const;
