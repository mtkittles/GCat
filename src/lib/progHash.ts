/*
  Wspólny identyfikator programu na stronie (standard treści, pilotaż 2026-11-22):
  fragment kodu w opisie (`G01 X60.`) wskazuje linię programu z <Sim>/<Demo> tej samej strony.
  Plugin remark nadaje fragmentowi data-prog = hash programu i data-prog-line = numer linii,
  figura symulatora ma ten sam data-prog, a symulator nasłuchuje zdarzenia PROG_LINE_EVENT.
*/

/** Krótki, stabilny hash tekstu programu (djb2, base36). */
export function progHash(src: string): string {
  let h = 5381;
  for (let i = 0; i < src.length; i++) h = ((h << 5) + h + src.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

/** Zdarzenie okna: { hash, line } — symulator z tym programem ustawia się na linii. */
export const PROG_LINE_EVENT = "gcat:prog-line";
export interface ProgLineDetail { hash: string; line: number }

/** Linia programu do porównania z fragmentem w tekście: bez komentarzy, wielkie litery, pojedyncze spacje. */
export const normLine = (s: string) => s.replace(/\([^)]*\)/g, " ").replace(/;.*$/, "").toUpperCase().replace(/\s+/g, " ").trim();
