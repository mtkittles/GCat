/** Krótka data do kafelków: „dziś”, „wczoraj”, inaczej „18.11.2026” (pełna data — w `longDate`, np. w dymku). */
export function shortDate(ms: number, now = Date.now()): string {
  const day = (t: number) => { const d = new Date(t); return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); };
  const diff = Math.round((day(now) - day(ms)) / 86_400_000);
  if (diff === 0) return "dziś";
  if (diff === 1) return "wczoraj";
  return new Date(ms).toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/** Pełna data: „18 listopada 2026”. */
export const longDate = (ms: number) => new Date(ms).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" });
