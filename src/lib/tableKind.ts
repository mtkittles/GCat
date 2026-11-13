/*
  Układ tabeli na telefonie (paczka Z a, audyt kart cz. 2 §4.3):
  - 2 kolumny (adres–znaczenie, słownik) — zwykła tabela, bez rozbijania na karty,
  - 3 kolumny z krótkimi wartościami (porównanie Fanuc/Sinumerik, „co — kod — kod”) — `tbl-pair`:
    etykieta wiersza nad parą wartości obok siebie,
  - pozostałe — `tbl-stack`: wiersz jako karta z etykietami kolumn.
  Ta sama funkcja dla tabel MDX (remark.ts) i bloków `table` (Article.tsx).
*/
export const PAIR_MAX = 40; // średnia długość wartości w kolumnach 2–3, powyżej której para jest za ciasna

export function tableClass(cols: number, rows: string[][]): string {
  if (cols <= 2) return "tbl-2";
  if (cols === 3) {
    const cells = rows.flatMap((r) => r.slice(1, 3)).map((c) => c.replace(/\*\*|`|\[\[([^|\]]*\|)?|\]\]/g, "").trim());
    const avg = cells.reduce((s, c) => s + c.length, 0) / Math.max(1, cells.length);
    if (avg <= PAIR_MAX) return "tbl-pair";
  }
  return "tbl-stack";
}
