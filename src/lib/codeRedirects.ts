/*
  Przekierowania z pojedynczych kodów na karty zbiorcze: /kody/g81 → /kody/g81-g83, /kody/g41 → /kody/g40-g42 itd.
  (V4, audyt wizualny 2026-11-18). Bierzemy słowa G/M z pola `code` karty; kod z własną kartą nie dostaje
  przekierowania. Gdy kod jest na kilku kartach, wygrywa karta, której adres zaczyna się od tego kodu
  (G94 → g94-g95, nie g90-g94-t), a potem pierwsza alfabetycznie. Kropka w kodzie → myślnik (G68.2 → g68-2),
  zakres „G54–G59” rozwija się na G54…G59.
*/
export function codeRedirects(cards: { slug: string; code: string }[]): Record<string, string> {
  const own = new Set(cards.map((c) => c.slug));
  const cand = new Map<string, string[]>();
  for (const c of cards) {
    // zakres zapisany półpauzą („G54–G59”) rozwijamy na kolejne kody
    const words = c.code.split(/\s+/).flatMap((t) => {
      const r = /^([GM])(\d+)[–-][GM]?(\d+)$/i.exec(t);
      if (!r) return [t];
      const w = r[2].length, a = +r[2], b = +r[3];
      return b > a && b - a < 20 ? Array.from({ length: b - a + 1 }, (_, i) => `${r[1]}${String(a + i).padStart(w, "0")}`) : [t];
    });
    for (const t of words) {
      if (!/^[GM]\d+(\.\d+)?$/i.test(t)) continue;
      const s = t.toLowerCase().replace(".", "-");
      if (own.has(s)) continue;
      const list = cand.get(s) ?? [];
      if (!list.includes(c.slug)) list.push(c.slug);
      cand.set(s, list);
    }
  }
  const out: Record<string, string> = {};
  for (const [s, slugs] of [...cand].sort(([a], [b]) => a.localeCompare(b))) {
    out[s] = slugs.find((x) => x.startsWith(`${s}-`)) ?? [...slugs].sort()[0];
  }
  return out;
}
