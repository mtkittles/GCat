/*
  Zapis kodów karty na liście /kody (paczka Z c, audyt kart cz. 2 §4.1): trzy lub więcej kolejnych
  kodów tej samej litery jako zakres („G40 G41 G42” → „G40–G42”, „G54 … G59” → „G54–G59”),
  pozostałe bez zmian. Wynik to lista części, z których każda nie łamie się w środku.
*/
export function codeParts(code: string): string[] {
  const toks = code.trim().split(/\s+/);
  const num = (t: string) => { const m = /^([GM])(\d+)$/.exec(t); return m ? { l: m[1], n: +m[2], w: m[2].length } : null; };
  const out: string[] = [];
  for (let i = 0; i < toks.length; ) {
    const a = num(toks[i]);
    let j = i;
    if (a) while (j + 1 < toks.length) { const b = num(toks[j + 1]); if (b && b.l === a.l && b.n === a.n + (j + 1 - i)) j++; else break; }
    out.push(j - i >= 2 ? `${toks[i]}–${toks[j]}` : toks[i]);
    if (j - i < 2) { i++; continue; }
    i = j + 1;
  }
  return out;
}

/** Identyfikator grupy do kotwicy (#grupa-cykle). */
export const groupId = (g: string) => "grupa-" + g.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ł/g, "l").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
