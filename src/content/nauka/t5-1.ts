import type { LessonDoc } from "@/lib/lesson";

const head = `O2001 (WALEK)
G18 G21 G40 G80 G99
G54
T0101 (NOZ ZEWN. CNMG R0.8)
G50 S3000
G96 S200 M03
M08
G00 X44. Z0.
G01 X-1.6 F0.15
G00 Z2.
G00 X42.`;

const profile = `N10 G00 X14.
G01 X20. Z-1. F0.1
Z-20.
X28.
X30. Z-21.
Z-39.
G02 X32. Z-40. R1.
G01 X35.
G03 X36. Z-40.5 R0.5
G01 Z-55.
N20 X42.`;

const finish = `G28 U0.
G28 W0.
T0202 (NOZ WYKANCZAJACY VBMT R0.4)
G96 S250 M03
G42 G00 X42. Z2.`;

const tail = `G40 G00 X44. Z5.
M09
M05
G28 U0.
G28 W0.
M30`;

const starter = `${head}
(DOPISZ DWA BLOKI G71: GLEBOKOSC 2, WYCOFANIE 0.5,
 KONTUR N10-N20, NADDATEK 0.4 NA SREDNICY I 0.1 W Z, F0.3)

${profile}
${finish}
(DOPISZ G70 DLA KONTURU N10-N20)

${tail}`;

export const t5_1: LessonDoc = {
  id: "T5.1",
  slug: "t5-1-g71-g70",
  title: "G71 i G70",
  minutes: 18,
  goal: "Zastąpisz ręczne przejścia zgrubne cyklem G71, a kontur wykańczający cyklem G70 — z tym samym konturem zapisanym jeden raz.",

  theory: [
    { t: "h", x: "Po co cykl", id: "po-co" },
    { t: "p", x: "W T3.2 pięć przejść zgrubnych zajęło 20 bloków, a każde przejście trzeba było policzyć ręcznie. Zmiana naddatku albo głębokości skrawania oznaczała przeliczenie wszystkiego. [[G71]] liczy przejścia sam: wystarczy mu kontur gotowego detalu, głębokość skrawania i naddatki." },
    { t: "diagram", id: "t51-g71" },

    { t: "h", x: "Zapis — dwa bloki", id: "zapis" },
    { t: "code", x: "G71 U2. R0.5\nG71 P10 Q20 U0.4 W0.1 F0.3" },
    { t: "table", head: ["Adres", "Blok", "Znaczenie"], rows: [
      ["**U**", "pierwszy", "głębokość skrawania na stronę (promień)"],
      ["**R**", "pierwszy", "wycofanie po każdym przejściu"],
      ["**P**, **Q**", "drugi", "numery N pierwszego i ostatniego bloku konturu"],
      ["**U**", "drugi", "naddatek na wykończenie w X — w średnicy"],
      ["**W**", "drugi", "naddatek na wykończenie w Z"],
      ["**F**", "drugi", "posuw obróbki zgrubnej"],
    ], caption: "Ta sama litera U znaczy w dwóch blokach co innego: w pierwszym głębokość (promień), w drugim naddatek (średnica). Starsze sterowania Fanuc używają zapisu jednoblokowego z adresem D." },

    { t: "h", x: "Wymagania dla konturu", id: "kontur" },
    { t: "ul", items: [
      "**Punkt startowy A** — przed wywołaniem cyklu nóż stoi ponad surówką i przed czołem, np. X42 Z2. Z niego cykl zaczyna i do niego wraca.",
      "**Pierwszy blok konturu (N10)** — ruch tylko w X, z A do początku konturu. Tak cykl rozpoznaje kierunek.",
      "**Kontur monotoniczny** — w podstawowym wariancie X nie może maleć w stronę uchwytu. Podcięcia i kieszenie wymagają innego wariantu cyklu.",
      "**F, S, T w konturze** działają dopiero w G70. G71 używa F z własnego bloku.",
    ] },

    { t: "h", x: "G70 — wykończenie", id: "g70" },
    { t: "diagram", id: "t51-layout" },
    { t: "p", x: "[[G70]] `P10 Q20` wykonuje bloki konturu jeden raz, z posuwem i korekcją aktywnymi w konturze, i wraca do punktu startowego. Zwykle stoi po zmianie na nóż wykańczający — kontur zapisany raz służy obu narzędziom." },
  ],

  worked: {
    title: "Wałek cyklem G71 i G70",
    intro: "Kontur z T3.3, pręt Ø40, nóż zgrubny T0101 i wykańczający T0202. Naddatek jak w ręcznej wersji: 0,4 na średnicy, 0,1 w Z.",
    steps: [
      { x: "Punkt startowy ponad prętem, przed czołem.", code: "G00 X42. Z2." },
      { x: "Głębokość 2 mm na stronę, wycofanie 0,5.", code: "G71 U2. R0.5" },
      { x: "Kontur N10–N20, naddatki, posuw zgrubny.", code: "G71 P10 Q20 U0.4 W0.1 F0.3" },
      { x: "Po zmianie noża: dojazd z G42 i wykończenie.", code: "G70 P10 Q20" },
    ],
    result: "Program skrócił się o ponad 20 bloków. Zmiana naddatku albo głębokości to teraz jedna liczba, a nie przeliczanie pięciu przejść.",
  },

  practice: [
    {
      kind: "task",
      mode: "lathe",
      intro: "Kontur N10–N20 jest gotowy. Dopisz oba bloki G71 i blok G70. Sprawdzany jest tor całego programu — przejścia zgrubne i wykańczanie.",
      starter,
      checks: [
        { t: "cut", reference: `${head}\nG71 U2. R0.5\nG71 P10 Q20 U0.4 W0.1 F0.3\n${profile}\n${finish}\nG70 P10 Q20\n${tail}`, tolerance: 0.05 },
        { t: "require", codes: ["G71", "G70"] },
      ],
      hints: ["G71 U2. R0.5, a pod nim G71 P10 Q20 U0.4 W0.1 F0.3.", "Wykończenie: G70 P10 Q20."],
      solution: starter
        .replace("(DOPISZ DWA BLOKI G71: GLEBOKOSC 2, WYCOFANIE 0.5,\n KONTUR N10-N20, NADDATEK 0.4 NA SREDNICY I 0.1 W Z, F0.3)\n", "G71 U2. R0.5\nG71 P10 Q20 U0.4 W0.1 F0.3\n")
        .replace("(DOPISZ G70 DLA KONTURU N10-N20)\n", "G70 P10 Q20\n"),
    },
    {
      kind: "drill",
      intro: "Adresy G71 i wymagania konturu.",
      questions: [
        { kind: "token", q: "W drugim bloku tapnij **naddatek w X**.", block: "G71 P10 Q20 U0.4 W0.1 F0.3", answer: 3, why: "U0.4 — naddatek w średnicy." },
        { kind: "choice", q: "Pręt Ø40, U2. w pierwszym bloku G71. Średnica pierwszego przejścia przy starcie z X42?", options: ["Ø38", "Ø40", "Ø36", "Ø41"], answer: 0, why: "Cykl schodzi z X42 o 2 mm na stronę: 42 − 4 = 38." },
        { kind: "choice", q: "Pierwszy blok konturu to `N10 G01 X14. Z0.`. Co jest nie tak?", options: ["pierwszy blok G71 może mieć ruch tylko w X", "brak F", "N10 musi być G00", "nic"], answer: 0, why: "Blok ns wyznacza dojście z A do konturu w jednej osi." },
      ],
    },
  ],

  pitfalls: [
    { title: "Punkt startowy w materiale", x: "Cykl wywołany z X38 Z2 przy pręcie Ø40. Pierwsza warstwa zaczyna się ruchem szybkim w X na średnicę mniejszą niż pręt, a start leży w materiale — cykl nie ma skąd bezpiecznie ruszyć." },
    { title: "Pomylone znaczenia U", x: "`G71 U0.4 R0.5` — w pierwszym bloku U to głębokość. Cykl robi przejścia po 0,4 mm i trwa pięć razy dłużej." },
    { title: "Kontur z podcięciem", x: "Rowek pod gwint wpisany do konturu G71. W podstawowym wariancie X nie może maleć — cykl zgłosi alarm. Rowek robi się osobnym nożem (moduł T6)." },
    { title: "Brak N w konturze", x: "`P10 Q20`, a w programie nie ma bloku N20 — alarm. Numery N w konturze to jedyne, po czym cykl go znajduje." },
  ],

  controllers: {
    rows: [
      ["Zgrubnie wzdłużnie", "`G71` (dwa bloki)", "`CYCLE95` / `CYCLE952`"],
      ["Wykończenie po konturze", "`G70 P… Q…`", "ten sam cykl w trybie wykańczania"],
      ["Kontur", "bloki N… w programie", "podprogram albo etykiety"],
    ],
    note: "Idea jest wspólna: kontur gotowego detalu opisany raz, obróbka zgrubna i wykańczająca liczona przez sterowanie. Sinumerik — lekcja T5.3.",
  },

  quiz: [
    { kind: "choice", review: "T4.2", q: "Kierunek ostrza dla noża zewnętrznego:", options: ["3", "2", "8", "0"], answer: 0, why: "P niżej i bliżej uchwytu niż środek naroża." },
    { kind: "choice", q: "Co oznacza U w **pierwszym** bloku G71?", options: ["głębokość skrawania na stronę", "naddatek w średnicy", "przyrost X", "posuw"], answer: 0, why: "W drugim bloku U to naddatek." },
    { kind: "choice", q: "Co robi G71 z blokami konturu N10–N20 podczas obróbki zgrubnej?", options: ["odczytuje je, ale nie wykonuje", "wykonuje je po każdym przejściu", "ignoruje je", "kasuje je"], answer: 0, why: "Wykonuje je dopiero G70." },
    { kind: "gap", q: "Naddatek 0,2 mm na stronę. Co wpisać w drugim bloku G71?", template: "U{0}", answers: [["0.4", "0,4", ".4"]], why: "U w drugim bloku jest w średnicy." },
    { kind: "choice", q: "Gdzie kończy się G70?", options: ["w punkcie startowym cyklu", "na końcu konturu", "w zerze W", "w punkcie referencyjnym"], answer: 0, why: "Cykl wraca do A." },
    { kind: "order", q: "Ułóż fragment programu.", items: ["G70 P10 Q20", "G71 P10 Q20 U0.4 W0.1 F0.3", "N10 G00 X14.", "G71 U2. R0.5", "N20 X42."], answer: [3, 1, 2, 4, 0], why: "Dwa bloki G71, kontur N10–N20, później G70." },
  ],

  summary: [
    "G71 U(głębokość) R(wycofanie) / G71 P Q U(naddatek Ø) W F — przejścia liczy sterowanie.",
    "Kontur N10–N20: pierwszy blok tylko w X, X nie maleje w stronę uchwytu.",
    "G70 P Q wykonuje kontur na gotowo i wraca do punktu startowego.",
    "Kontur zapisany raz służy obróbce zgrubnej i wykańczającej.",
  ],

  sources: [
    { id: "fanuc", where: "cykle wielokrotne G71 i G70 na tokarce" },
    { id: "sinumerik", where: "CYCLE95, CYCLE952 — porównanie" },
  ],
};
