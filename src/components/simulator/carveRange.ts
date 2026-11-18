/*
  Przyrostowe wycinanie warstwy materiału w widoku 2D (Simulator.tsx): które części odcinków dochodzą
  przy przejściu postępu z `from` do `to` (mm toru). Dla każdego odcinka [d0, d1] w ułamku jego długości;
  odcinki bez zmiany pomijamy. Suma kawałków z kolejnych klatek pokrywa dokładnie to samo co jedno
  wycięcie od zera do `to` — test: tests/carve-range.test.ts.
*/
export interface CarvePiece { i: number; d0: number; d1: number }

export function carveRange(lengths: number[], from: number, to: number): CarvePiece[] {
  const out: CarvePiece[] = [];
  let acc = 0;
  for (let i = 0; i < lengths.length; i++) {
    const len = lengths[i];
    const d0 = Math.min(1, Math.max(0, (from - acc) / (len || 1)));
    const d1 = Math.min(1, Math.max(0, (to - acc) / (len || 1)));
    acc += len;
    if (d1 > 0 && d1 > d0) out.push({ i, d0, d1 });
  }
  return out;
}
