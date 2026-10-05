/* Walidacja treści z content/ (MDX + YAML) przed buildem: schematy, slugi, kotwice, markery [[…]], <Diagram>.
   Uruchamiane automatycznie jako prebuild (npm run build) i ręcznie: npm run tresci.
   Błąd = lista „plik:linia — opis” i kod wyjścia 1. Argument: katalog treści (domyślnie content). */
import { ContentErrors, loadContent } from "../src/lib/mdx/loader";

const root = process.argv[2] ?? "content";
loadContent(root)
  .then((c) => {
    const n = { karty: c.kody.length, hasła: c.slownik.length, lekcje: c.lekcje.length, programy: c.programy.length, zadania: c.zadania.length };
    console.log(`treści (${root}): ${Object.entries(n).map(([k, v]) => `${k} ${v}`).join(" · ")} — OK`);
  })
  .catch((e) => {
    console.error(e instanceof ContentErrors ? e.message : e);
    process.exit(1);
  });
