/**
 * Postęp (mm drogi) na początku bloku `line`: suma długości odcinków przed pierwszym odcinkiem tej linii
 * albo — gdy linia nie ma ruchu (T1 M06, S… M03) — przed pierwszym odcinkiem kolejnej linii z ruchem.
 * Tak samo działa kliknięcie linii w panelu kodu symulatora. null — po tej linii nie ma już ruchu.
 */
export function progressAtLine(segments: readonly { line: number }[], lengths: readonly number[], line: number): number | null {
  let acc = 0;
  for (let i = 0; i < segments.length; i++) {
    if (segments[i].line >= line) return acc + 1e-3;
    acc += lengths[i] ?? 0;
  }
  return null;
}
