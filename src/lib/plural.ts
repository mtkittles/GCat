/** Polska odmiana po liczebniku: 1 detal, 2–4 detale, 5+ detali (12–14 → detali). */
export function plural(n: number, one: string, few: string, many: string) {
  const a = Math.abs(n), d = a % 10, dd = a % 100;
  if (a === 1) return one;
  if (d >= 2 && d <= 4 && !(dd >= 12 && dd <= 14)) return few;
  return many;
}
export const pl = (n: number, one: string, few: string, many: string) => `${n} ${plural(n, one, few, many)}`;
