/*
  audit:technologia — kontrola działu Technologia (content/technologia/). Uruchom: npm run audit:technologia
  Błędy (kod wyjścia 1):
   • treść nie przechodzi loadera (schemat, dział, slug, kotwice, markery [[…]], rysunki <Diagram>/<Rys>, powiązania),
   • źródło spoza rejestru albo bez opisu „co potwierdza”, artykuł z wartościami liczbowymi bez źródeł,
   • program z <Sim>/<Demo> z błędem parsera albo z ostrzeżeniem walidatora,
   • odnośnik wewnętrzny [tekst](/…) do strony, której nie ma (artykuły, działy, kody, słownik, lekcje).
  Raport (bez błędu): sekcje szablonu, których brakuje, artykuły bez rysunku, szkice do weryfikacji, artykuły Pro,
  źródła z rejestru bez wydania lub adresu, liczba wartości liczbowych do sprawdzenia ze źródłem.
*/
import { readFileSync } from "node:fs";
import { flat, lessonHref, type Track } from "@/lib/course";
import { ContentErrors, loadContent, splitFrontmatter, type ArtykulEntry } from "@/lib/mdx/loader";
import { mdxPrograms } from "@/lib/mdx/programs";
import { parseProgram } from "@/lib/parser";
import { validate } from "@/lib/parser/validate";
import { sources } from "@/content/nauka/sources";
import { pl } from "@/lib/plural";

/** Sekcje szablonów (src/lib/edytor/szablony.ts) — kotwice, których szukamy w artykule danego typu. */
const SEKCJE: Record<string, string[]> = {
  narzedzie: ["budowa", "rodzaje", "zastosowanie", "dobór", "parametry-startowe", "typowe-błędy", "w-g-kodzie"],
  temat: ["teoria", "na-co-uważać"],
  porownanie: ["wnioski"],
};
/** Liczba z jednostką technologiczną — każda wymaga źródła (CLAUDE.md, zasada 1). */
const LICZBA = /\d+(?:[,.]\d+)?\s?(?:mm|m\/min|obr\/min|mm\/min|mm\/obr|µm|°|HV|HRC|%|kW|Nm|N\/mm²)(?![\p{L}])/gu;

const lessons = (["frezowanie", "toczenie"] as Track[]).flatMap((t) => flat(t).filter((l) => l.doc && l.slug).map((l) => ({ id: l.id, href: lessonHref(t, l.slug!) })));

async function main() {
  let c;
  try { c = await loadContent("content", { lessonIds: new Set(lessons.map((l) => l.id)) }); } catch (e) {
    console.error(e instanceof ContentErrors ? e.message : e);
    process.exit(1);
  }
  const { dzialy, artykuly } = c.technologia;
  const errors: string[] = [];
  const notes: string[] = [];
  const known = new Set<string>([
    "/technologia", ...dzialy.map((d) => `/technologia/${d.slug}`), ...artykuly.map((a) => `/technologia/${a.data.dzial}/${a.data.slug}`),
    ...c.kody.map((k) => `/kody/${k.data.slug}`), ...lessons.map((l) => l.href),
    "/kalkulator", "/slownik", "/symulator", "/kody", "/nauka", "/zadania", "/programy", "/fiszki",
  ]);
  const anchors = new Set(c.slownik.map((h) => h.data.anchor));
  let liczbyAll = 0;

  const per = (a: ArtykulEntry) => {
    const key = `${a.data.dzial}/${a.data.slug}`;
    const body = splitFrontmatter(readFileSync(a.file, "utf8"))!.body;
    const err = (m: string) => errors.push(`${key}: ${m}`);
    // źródła
    a.data.sources.forEach((s, i) => {
      if (!sources[s.id]) err(`źródło ${i + 1}: „${s.id}” nie ma w rejestrze (src/content/nauka/sources.ts)`);
      else if (!s.where.trim()) err(`źródło ${i + 1}: brak opisu „co potwierdza”`);
    });
    // wartości liczbowe (poza programami)
    const prose = body.replace(/```[\s\S]*?```/g, "");
    const liczby = [...prose.matchAll(LICZBA)].length;
    liczbyAll += liczby;
    if (liczby && !a.data.sources.length) err(`${liczby} wartości liczbowych bez żadnego źródła (pole sources)`);
    // programy
    for (const [i, p] of mdxPrograms(body).entries()) {
      const prog = parseProgram(p.src, { diameterX: p.mode === "lathe" });
      const errs = prog.lines.flatMap((l) => l.errors.map((e) => `L${l.index + 1}: ${e}`));
      const issues = validate(prog, "fanuc").map((x) => `L${x.line + 1}: ${x.msg}`);
      if (errs.length || issues.length) err(`program ${i + 1}: ${[...errs, ...issues].join("; ")}`);
    }
    // odnośniki wewnętrzne
    for (const m of body.matchAll(/\]\((\/[^)\s]*)\)/g)) {
      const [path, hash] = m[1].split("#");
      if (path === "/slownik" && hash) { if (!anchors.has(decodeURIComponent(hash))) err(`odnośnik ${m[1]} — nie ma takiego hasła`); }
      else if (!known.has(path.replace(/\/$/, ""))) err(`odnośnik ${m[1]} — nie ma takiej strony`);
    }
    // raport
    const ids = new Set(a.meta.headings.map((h) => h.id));
    const brak = (SEKCJE[a.data.typ] ?? []).filter((s) => !ids.has(s));
    if (brak.length) notes.push(`${key}: brak sekcji szablonu — ${brak.join(", ")}`);
    if (a.data.typ === "porownanie" && !/<Table[^>]*\ssort="true"/.test(body)) notes.push(`${key}: porównanie bez tabeli sortowanej (<Table sort="true">)`);
    if (a.data.typ !== "porownanie" && !a.thumb) notes.push(`${key}: brak rysunku (miniatura na liście = ikona działu)`);
    for (const s of a.data.sources) { const r = sources[s.id]; if (r && !r.edition && !r.url) notes.push(`${key}: źródło „${s.id}” w rejestrze bez wydania i adresu`); }
    return liczby;
  };

  console.log(`Technologia: ${pl(dzialy.length, "dział", "działy", "działów")}, ${pl(artykuly.length, "artykuł", "artykuły", "artykułów")}\n`);
  for (const d of dzialy) {
    const arts = artykuly.filter((a) => a.data.dzial === d.slug);
    console.log(`${d.title.padEnd(20)} ${arts.length ? arts.map((a) => `${a.data.slug} (${a.data.typ}${a.data.stan === "szkic" ? ", szkic" : ""}${a.data.plan === "pro" ? ", Pro" : ""})`).join(" · ") : "—"}`);
  }
  const liczby = artykuly.map((a) => [a, per(a)] as const);
  const szkice = artykuly.filter((a) => a.data.stan === "szkic");
  const pro = artykuly.filter((a) => a.data.plan === "pro");
  console.log(`\nDo weryfikacji merytorycznej (stan: szkic): ${szkice.length || "brak"}`);
  for (const [a, n] of liczby) if (a.data.stan === "szkic") console.log(`  • ${a.data.dzial}/${a.data.slug} — ${a.data.title}: ${pl(a.data.sources.length, "źródło", "źródła", "źródeł")}, wartości liczbowe do sprawdzenia ze źródłem: ${n}`);
  if (pro.length) console.log(`\nArtykuły Pro (widoczne tylko dla redakcji i planu Pro): ${pro.map((a) => `${a.data.dzial}/${a.data.slug}`).join(", ")}`);
  if (notes.length) { console.log("\nUwagi:"); notes.forEach((n) => console.log("  ~ " + n)); }
  if (errors.length) { console.log("\nBłędy:"); errors.forEach((e) => console.log("  ✗ " + e)); }
  console.log(`\n${pl(artykuly.length, "artykuł", "artykuły", "artykułów")} · wartości liczbowe: ${liczbyAll} · błędy: ${errors.length} · uwagi: ${notes.length}`);
  process.exit(errors.length ? 1 : 0);
}
void main();
