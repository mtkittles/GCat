/* Treść z content/ → dane strony. Waliduje całe content/ (schematy, slugi, kotwice, markery [[…]], <Diagram>)
   i zapisuje content/.generated/*.json (poza gitem), które importują @/lib/gcodes, @/lib/content i wyszukiwarka:
   • kody.json    — karty (kolejność wg `order`), z polami star i hasArticle,
   • slownik.json — hasła (kolejność wg `order`), z jawną kotwicą,
   • szukaj.json  — tekst artykułów kart do wyszukiwarki.
   Uruchamiane automatycznie: postinstall, predev, pretest, prebuild; ręcznie: npm run tresci.
   Błąd treści = lista „plik:linia — opis” i kod wyjścia 1. Argument: katalog treści (domyślnie content). */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { hasloToEntry, kodToGcode } from "../src/lib/mdx/gcode";
import { ContentErrors, loadContent } from "../src/lib/mdx/loader";

const root = process.argv[2] ?? "content";
loadContent(root)
  .then((c) => {
    const out = path.join(root, ".generated");
    mkdirSync(out, { recursive: true });
    const write = (f: string, v: unknown) => writeFileSync(path.join(out, f), JSON.stringify(v) + "\n");
    write("kody.json", c.kody.map((k) => kodToGcode(k.data, k.meta.headings.length > 0 || k.meta.text.trim() !== "")));
    write("slownik.json", c.slownik.map((h) => hasloToEntry(h.data)));
    write("szukaj.json", Object.fromEntries(c.kody.map((k) => [k.data.slug, k.meta.text])));
    const n = { karty: c.kody.length, hasła: c.slownik.length, lekcje: c.lekcje.length, programy: c.programy.length, zadania: c.zadania.length };
    console.log(`treści (${root}): ${Object.entries(n).map(([k, v]) => `${k} ${v}`).join(" · ")} — OK → ${out}`);
  })
  .catch((e) => {
    console.error(e instanceof ContentErrors ? e.message : e);
    process.exit(1);
  });
