import type { ArtTyp } from "@/lib/technologia";
import { pairYaml } from "./plik";

/*
  Szablony artykułów Technologii (wybór przy „Nowy artykuł” w edytorze): sekcje z planu działu
  (claude/gcat-baza-wiedzy-plan.md → „Szablony artykułów”). Treść w formacie zapisu edytora
  (test round-trip w tests/technologia.test.ts) — pierwszy zapis nie przeformatuje pliku.
  Kotwice nagłówków jak w edytorze (slugAnchor: małe litery, polskie znaki zostają, spacje → „-”).
*/

export interface Szablon { label: string; opis: string; sekcje: string[]; body: string }

const NARZEDZIE = `## Budowa \\{#budowa}

Części narzędzia i ich zadania. Wstaw rysunek budowy z numerami części: pasek u góry → Rysunek.

## Rodzaje \\{#rodzaje}

* Rodzaj — czym się różni i do czego służy.

## Zastosowanie \\{#zastosowanie}

Do jakich zabiegów i materiałów.

## Dobór \\{#dobór}

Na co patrzeć przy wyborze: średnica, długość robocza, liczba ostrzy, materiał ostrza.

## Parametry startowe \\{#parametry-startowe}

<Note kind="warn">
  Wartości z katalogu producenta dla konkretnego narzędzia i materiału. Każda liczba ze źródłem w polu „Źródła”; bez źródła — „zależy od narzędzia”.
</Note>

## Typowe błędy \\{#typowe-błędy}

* Błąd — skutek i jak go uniknąć.

## W G-kodzie \\{#w-g-kodzie}

Kody i adresy, które dotyczą tego narzędzia, i program do sprawdzenia w symulatorze.
`;

const TEMAT = `Wstęp: o czym jest temat i po co go znać przy programowaniu.

## Teoria \\{#teoria}

Wyjaśnienie zjawiska. Wstaw rysunek: pasek u góry → Rysunek.

## Wzór i przykład \\{#wzór-i-przykład}

Wzór z objaśnieniem symboli i jednostek, potem przykład liczbowy krok po kroku.

## Na co uważać \\{#na-co-uważać}

* Typowa pomyłka — skutek.
`;

const POROWNANIE = `Co porównujemy i według jakich cech.

<Table caption="Porównanie — kliknij nagłówek kolumny, żeby posortować" sort="true">
  | Cecha | Wariant A | Wariant B |
  | ----- | --------- | --------- |
  | …     | …         | …         |
</Table>

## Wnioski \\{#wnioski}

* Kiedy wybrać który wariant.
`;

export const SZABLONY: Record<ArtTyp, Szablon> = {
  narzedzie: { label: "Karta narzędzia", opis: "Budowa z rysunkiem, rodzaje, zastosowanie, dobór, parametry startowe, typowe błędy, W G-kodzie.", sekcje: ["Budowa", "Rodzaje", "Zastosowanie", "Dobór", "Parametry startowe", "Typowe błędy", "W G-kodzie"], body: NARZEDZIE },
  temat: { label: "Temat", opis: "Wstęp, rysunek, teoria, wzór z przykładem, na co uważać.", sekcje: ["Wstęp", "Teoria", "Wzór i przykład", "Na co uważać"], body: TEMAT },
  porownanie: { label: "Porównanie", opis: "Tabela z sortowaniem i krótkie wnioski.", sekcje: ["Tabela", "Wnioski"], body: POROWNANIE },
};

/** Slug z tytułu: małe litery bez polskich znaków, cyfry, pojedyncze myślniki. */
export function slugTytulu(t: string): string {
  const pl: Record<string, string> = { ą: "a", ć: "c", ę: "e", ł: "l", ń: "n", ó: "o", ś: "s", ź: "z", ż: "z" };
  return t.toLowerCase().replace(/[ąćęłńóśźż]/g, (c) => pl[c]).normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60).replace(/-+$/, "");
}

/** Plik nowego artykułu: frontmatter (pola w kolejności schematu, zapis jak w edytorze) + treść szablonu. */
export function nowyArtykul(o: { dzial: string; typ: ArtTyp; title: string; slug: string; order: number; dodano: string; obrobka?: string[] }): string {
  const data: Record<string, unknown> = {
    title: o.title, slug: o.slug, dzial: o.dzial, typ: o.typ, order: o.order,
    short: "Jedno zdanie o tym, czego dotyczy artykuł.",
    obrobka: o.obrobka?.length ? o.obrobka : ["frezowanie"], poziom: 1, normy: [], stan: "szkic", plan: "free", dodano: o.dodano,
    sources: [], powiazane: { kody: [], lekcje: [], hasla: [], artykuly: [], kalkulator: false },
  };
  return `---\n${Object.entries(data).map(([k, v]) => pairYaml(k, v)).join("")}---\n${SZABLONY[o.typ].body}`;
}
