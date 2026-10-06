/* Eksport kart ze starych źródeł (gcodes.json + articles*.ts) do content/kody/<slug>.mdx — deterministyczny.
   Użycie: npm run eksport -- g01 g02 …   (bez argumentów: karty z przełącznika MDX_KODY).
   Stare pliki zostają bez zmian. Test tests/pilot.test.ts sprawdza, że pliki = eksport. */
import { writeFileSync } from "node:fs";
import { articles, CURATED } from "../src/content/articles";
import { bySlug } from "../src/lib/gcodes";
import { exportKod } from "../src/lib/mdx/export";
import { MDX_KODY } from "../src/lib/mdx/kody";

const slugs = process.argv.slice(2).length ? process.argv.slice(2) : [...MDX_KODY];
for (const s of slugs) {
  const g = bySlug(s);
  if (!g) throw new Error(`nie ma karty „${s}”`);
  writeFileSync(`content/kody/${s}.mdx`, exportKod(g, CURATED.has(s), articles[s]));
  console.log(`content/kody/${s}.mdx`);
}
