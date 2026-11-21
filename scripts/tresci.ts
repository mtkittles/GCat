/* Treść z content/ → dane strony. Waliduje całe content/ (schematy, slugi, kotwice, markery [[…]], <Diagram>)
   i zapisuje content/.generated/*.json (poza gitem), które importują @/lib/gcodes, @/lib/content i wyszukiwarka:
   • kody.json    — karty (kolejność wg `order`), z polami star i hasArticle,
   • slownik.json — hasła (kolejność wg `order`), z jawną kotwicą,
   • szukaj.json  — tekst artykułów kart do wyszukiwarki,
   • diagramy.json — id rysunków z diagrams.tsx (lista wyboru w panelu Keystatic),
   • rysunki.json — rysunki z rysownika (content/rysunki/*.yaml) dla <Rys> i słownika,
   • technologia.json — działy i artykuły Technologii (frontmatter, spis, miniatura, czas czytania),
   • szukaj-technologia.json — tekst artykułów Technologii do wyszukiwarki,
   • lekcje.json — gotowe lekcje (id, tytuł, adres) do powiązań w Technologii i kontroli w edytorze.
   Uruchamiane automatycznie: postinstall, predev, pretest, prebuild; ręcznie: npm run tresci.
   Błąd treści = lista „plik:linia — opis” i kod wyjścia 1. Argument: katalog treści (domyślnie content). */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { flat, lessonHref, type Track } from "../src/lib/course";
import { artykulToEntry, hasloToEntry, kodToGcode } from "../src/lib/mdx/gcode";
import { ContentErrors, loadContent } from "../src/lib/mdx/loader";
import { diagramIds } from "../src/lib/mdx/names";

const root = process.argv[2] ?? "content";
// gotowe lekcje (z treścią) — powiązania artykułów Technologii wskazują je po id
const lekcje = (["frezowanie", "toczenie"] as Track[]).flatMap((t) => flat(t).filter((l) => l.doc && l.slug).map((l) => ({ id: l.id, title: l.title, href: lessonHref(t, l.slug!), track: t })));
loadContent(root, { lessonIds: new Set(lekcje.map((l) => l.id)) })
  .then((c) => {
    const out = path.join(root, ".generated");
    mkdirSync(out, { recursive: true });
    const write = (f: string, v: unknown) => writeFileSync(path.join(out, f), JSON.stringify(v) + "\n");
    write("kody.json", c.kody.map((k) => kodToGcode(k.data, k.meta.headings.length > 0 || k.meta.text.trim() !== "")));
    write("slownik.json", c.slownik.map((h) => hasloToEntry(h.data)));
    write("szukaj.json", Object.fromEntries(c.kody.map((k) => [k.data.slug, k.meta.text])));
    write("diagramy.json", [...diagramIds].sort());
    write("rysunki.json", c.rysunki.map((r) => r.data));
    write("technologia.json", { dzialy: c.technologia.dzialy, artykuly: c.technologia.artykuly.map(artykulToEntry) });
    write("szukaj-technologia.json", Object.fromEntries(c.technologia.artykuly.map((a) => [`${a.data.dzial}/${a.data.slug}`, a.meta.text])));
    write("lekcje.json", lekcje);
    const n = { karty: c.kody.length, hasła: c.slownik.length, lekcje: c.lekcje.length, programy: c.programy.length, zadania: c.zadania.length, rysunki: c.rysunki.length, artykuły: c.technologia.artykuly.length };
    console.log(`treści (${root}): ${Object.entries(n).map(([k, v]) => `${k} ${v}`).join(" · ")} — OK → ${out}`);
  })
  .catch((e) => {
    console.error(e instanceof ContentErrors ? e.message : e);
    process.exit(1);
  });
