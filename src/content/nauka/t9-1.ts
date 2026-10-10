import type { LessonDoc } from "@/lib/lesson";

/*
  Zadanie końcowe ścieżki toczenia: inny wałek (pręt Ø50, średnice Ø26/Ø36/Ø46)
  i nóż zgrubny o innym promieniu ostrza (R0,4 zamiast R0,8). Uczeń pisze cały program.
*/

const solution = `O2002 (WALEK 2 - ZADANIE KONCOWE)
G18 G21 G40 G80 G99
G54
T0101 (NOZ ZEWN. CNMG R0.4)
G50 S3000
G96 S200 M03
M08
G00 X54. Z0.
G01 X-0.8 F0.15
G00 Z2.
G00 X52.
G71 U1.5 R0.5
G71 P10 Q20 U0.4 W0.1 F0.25
N10 G00 X19.
G01 X26. Z-1.5 F0.1
Z-22.
X34.
X36. Z-23.
Z-38.
X44.
G03 X46. Z-39. R1.
G01 Z-50.
N20 X52.
G28 U0.
G28 W0.
T0202 (NOZ WYKANCZAJACY VBMT R0.2)
G96 S250 M03
G42 G00 X52. Z2.
G70 P10 Q20
G40 G00 X54. Z5.
M09
M05
G28 U0.
G28 W0.
M30`;

const starter = `O2002 (WALEK 2 - ZADANIE KONCOWE)
(SUROWKA: PRET FI50, ZERO W: OS OBROTU, CZOLO DETALU)
(T0101: NOZ ZGRUBNY CNMG R0.4, KIERUNEK OSTRZA 3)
(T0202: NOZ WYKANCZAJACY VBMT R0.2, KIERUNEK OSTRZA 3)
(NAPISZ CALY PROGRAM: PLANOWANIE, G71, G70 Z KOREKCJA, KONIEC)
M30`;

export const t9_1: LessonDoc = {
  id: "T9.1",
  slug: "t9-1-zadanie-koncowe-walek",
  title: "Zadanie końcowe: nowy wałek",
  minutes: 25,
  goal: "Samodzielnie napiszesz program toczenia wałka o innych średnicach i z nożem o innym promieniu ostrza niż wałek z kursu.",

  theory: [
    { t: "h", x: "Co się zmienia", id: "zmiany" },
    { t: "p", x: "Program wałka z kursu powstawał po kawałku. Tu dostajesz nowy rysunek i piszesz program od pustej strony: planowanie czoła, cykl zgrubny G71 i wykańczanie G70 z korekcją promienia ostrza. Układ programu jest znany, liczby — nowe." },
    { t: "table", head: ["", "Wałek z kursu", "Nowy wałek"], rows: [
      ["Surówka", "pręt Ø40", "pręt Ø50"],
      ["Średnice", "Ø20, Ø30, Ø36", "Ø26, Ø36, Ø46"],
      ["Fazy i promienie", "1 × 45°, R1, R0,5", "1,5 × 45°, 1 × 45°, R1"],
      ["Nóż zgrubny", "CNMG R0,8", "CNMG R0,4"],
      ["Nóż wykańczający", "VBMT R0,4", "VBMT R0,2"],
    ] },
    { t: "diagram", id: "t91-part" },

    { t: "h", x: "Planowanie a promień ostrza", id: "planowanie" },
    { t: "p", x: "Planowanie czoła idzie bez korekcji promienia ostrza, więc nóż musi przejechać za oś o 2·rε, żeby zaokrąglone ostrze zdjęło materiał w środku (lekcja T2.3). Przy R0,8 było to `X-1.6`, przy R0,4 wystarczy `X-0.8`. Przejazd dalej za oś nie poprawia czoła, tylko wydłuża ruch. Za krótki zostawia w środku czopek." },
    { t: "note", kind: "info", x: "Wzór −2·rε dotyczy noża z kierunkiem ostrza 3 i programowania bez korekcji. Przy innym położeniu noża i innym kierunku ostrza sprawdź geometrię na rysunku narzędzia." },

    { t: "h", x: "Kontur dla G71", id: "kontur" },
    { t: "p", x: "Kontur między N10 i N20 zaczyna się w punkcie startu cyklu — tu Z2 — dlatego faza przy czole jest przedłużona do Z2. Faza 1,5 × 45° na Ø26 kończy się w Z−1,5; na każdy 1 mm w Z średnica zmienia się o 2 mm, więc w Z2 wypada X19 (lekcja T0.2). Kontur jest monotoniczny — X tylko rośnie, Z tylko maleje — jak wymaga G71 typu I (lekcja T5.1)." },
    { t: "diagram", id: "t91-contour" },

    { t: "h", x: "Plan programu", id: "plan" },
    { t: "ul", items: [
      "Blok startowy: G18, jednostki, kasowanie korekcji i cykli, posuw na obrót (lekcja T1.3), G54.",
      "Nóż zgrubny `T0101`, limit obrotów `G50 S3000`, stała prędkość skrawania `G96 S200 M03`, chłodziwo (lekcje T2.1 i T2.2).",
      "Planowanie czoła z X54 do `X-0.8`, odjazd w Z.",
      "Start cyklu X52 Z2, dwa bloki G71, kontur N10–N20 (lekcja T5.1).",
      "Powrót, nóż wykańczający `T0202`, najazd z G42 i `G70 P10 Q20`, odjazd z G40 (lekcja T4.1).",
      "Chłodziwo, wrzeciono, powrót i M30.",
    ] },
  ],

  worked: {
    title: "Kontur N10–N20",
    intro: "Sytuacja: cykl G71 startuje z X52 Z2. Kontur ma opisać gotowy wałek z rysunku od przedłużenia fazy przy czole do wyjścia nad pręt. Policz punkty po kolei. Numery na rysunku to numery kroków.",
    fig: "t91-contour",
    steps: [
      { x: "Początek konturu: faza 1,5 × 45° przedłużona do Z2. Na 3,5 mm drogi w Z średnica zmienia się o 7 mm: 26 − 7 = 19.", code: "N10 G00 X19." },
      { x: "Faza do Ø26 w Z−1,5, potem walec Ø26 do Z−22.", code: "G01 X26. Z-1.5 F0.1  Z-22." },
      { x: "Czoło stopnia do początku fazy 1 × 45° i faza do Ø36.", code: "X34.  X36. Z-23." },
      { x: "Walec Ø36 do Z−38, czoło stopnia do X44 i łuk R1 na krawędzi Ø46.", code: "Z-38.  X44.  G03 X46. Z-39. R1." },
      { x: "Walec Ø46 do Z−50 i wyjście nad pręt Ø50.", code: "G01 Z-50.  N20 X52." },
    ],
    result: "Każdy punkt to wymiar z rysunku albo różnica wymiarów: średnice wprost, a fazy i łuk — z ich długości. Ten sam kontur obsłuży G71 i G70.",
  },

  practice: [
    {
      kind: "drill",
      intro: "Zanim napiszesz program — przewiduj.",
      questions: [
        { kind: "choice", q: "Program planowania napisano dla noża R0,4 (`X-0.8`), ale w głowicy jest nóż R0,8 z kursu. Co zobaczysz na czole?", options: ["czopek w środku czoła, o średnicy ok. 0,8 mm", "czyste czoło", "wgłębienie w środku", "alarm sterowania"], answer: 0, why: "Nóż R0,8 potrzebuje przejazdu do X−1,6. Kończąc w X−0,8, zostawia w środku nietoczony czopek o średnicy ok. 2 · (0,8 − 0,4) = 0,8 mm. Odwrotna sytuacja — X−1,6 przy nożu R0,4 — tylko wydłuża ruch za osią." },
        { kind: "gap", q: "Faza 1,5 × 45° na Ø26 przedłużona do Z2. Jaki X zapiszesz w N10?", template: "X{0}", answers: [["19"]], why: "Od Z2 do Z−1,5 jest 3,5 mm. Średnica zmienia się o 2 · 3,5 = 7 mm: 26 − 7 = 19." },
        { kind: "choice", q: "Kontur ma zostać obrobiony nożem R0,2 zamiast R0,4. Co zmieniasz w programie z G42?", options: ["nic w konturze — promień i kierunek ostrza są w korekcji narzędzia", "wszystkie współrzędne fazy", "G42 na G41", "X w N10"], answer: 0, why: "Z korekcją promienia ostrza program opisuje kontur z rysunku, a sterowanie liczy przesunięcie z danych narzędzia (lekcja T4.1)." },
      ],
    },
    {
      kind: "task",
      mode: "lathe",
      intro: "Napisz cały program wałka z rysunku. Dane: T0101 — nóż zgrubny R0,4 (G50 S3000, G96 S200), T0202 — nóż wykańczający (G96 S250), chłodziwo. Planowanie z X54 Z0 do osi z F0,15, z przejazdem za oś o 2·rε. Cykl z X52 Z2: G71 U1,5 R0,5 i G71 P10 Q20 U0,4 W0,1 F0,25, kontur N10–N20 z F0,1. Wykańczanie: G42 G00 X52 Z2, G70 P10 Q20, odjazd G40 do X54 Z5. Sprawdzany jest tor całego programu.",
      starter,
      checks: [
        { t: "cut", reference: solution, tolerance: 0.05 },
        { t: "require", codes: ["G50", "G96", "G71", "G70", "G42", "G40"] },
        { t: "coolant", label: "Chłodziwo na ruchach roboczych", offBeforeStop: true },
      ],
      hints: [
        "Planowanie: `G00 X54. Z0.`, `G01 X-0.8 F0.15`, `G00 Z2.` — 2 · 0,4 = 0,8 za osią.",
        "Cykl: `G00 X52.`, `G71 U1.5 R0.5`, `G71 P10 Q20 U0.4 W0.1 F0.25`.",
        "Kontur: `N10 G00 X19.`, `G01 X26. Z-1.5 F0.1`, `Z-22.`, `X34.`, `X36. Z-23.`, `Z-38.`, `X44.`, `G03 X46. Z-39. R1.`, `G01 Z-50.`, `N20 X52.`",
        "Wykańczanie: `T0202`, `G96 S250 M03`, `G42 G00 X52. Z2.`, `G70 P10 Q20`, `G40 G00 X54. Z5.`",
      ],
      solution,
    },
  ],

  pitfalls: [
    { title: "Stare liczby z poprzedniego wałka", x: "Program przerobiony z wałka z kursu: zostało `X-1.6` w planowaniu albo `G00 X42.` przed cyklem przy pręcie Ø50. Przy X42 punkt startu cyklu leży w materiale — patrz niżej. Pisząc od nowa, bierz każdą liczbę z nowego rysunku i nowej karty narzędzi." },
    { title: "Start cyklu poniżej średnicy pręta", danger: true, x: "Cykl liczy przejścia od punktu startu, jakby tam kończyła się surówka. Przy pręcie Ø50 i starcie w X42 pierwsze przejście schodzi do X39, czyli bierze 5,5 mm na stronę zamiast 1,5. Start w X52 leży 1 mm nad prętem." },
    { title: "Kontur niemonotoniczny w G71 typu I", x: "Podcięcie albo rowek wpisane między N10 i N20. G71 typu I wymaga, żeby X tylko rósł, a Z tylko malał — inaczej sterowanie zgłasza alarm albo, zależnie od wersji, wymaga typu II. Rowki toczy się osobną operacją (lekcja T6.1)." },
  ],

  controllers: {
    rows: [
      ["Cykl zgrubny", "`G71` dwa bloki + kontur N10–N20", "`CYCLE95` z konturem w podprogramie"],
      ["Wykańczanie", "`G70 P10 Q20`", "`CYCLE95` w trybie wykańczania"],
      ["Korekcja promienia ostrza", "`G42` + dane narzędzia (R, T)", "`G42` + dane ostrza D"],
      ["Stała prędkość skrawania", "`G96 S200`, limit `G50 S3000`", "`G96 S200`, limit `LIMS=3000`"],
    ],
    note: "Plan programu jest taki sam. Sinumerik zapisuje kontur i cykl inaczej — szczegóły w lekcji T5.3.",
  },

  quiz: [
    { kind: "choice", review: "T2.3", q: "Do jakiego X planujesz czoło nożem R0,4 z kierunkiem ostrza 3, bez korekcji?", options: ["X−0,8", "X0", "X−0,4", "X−1,6"], answer: 0, why: "Za oś o 2·rε, a X jest w średnicy: 2 · 0,4 = 0,8." },
    { kind: "choice", review: "T5.1", q: "Dlaczego kontur N10–N20 zaczyna się na Z2, a nie na Z0?", options: ["bo cykl startuje z Z2, a kontur musi zacząć się w punkcie startu w Z", "bo Z0 jest zajęte przez G54", "bo faza wymaga Z2", "bez powodu"], answer: 0, why: "G71 prowadzi przejścia od punktu startu. Przedłużenie fazy do Z2 daje ciągły kontur od tego punktu." },
    { kind: "gap", q: "Faza 1 × 45° na krawędzi Ø36 zaczyna się na czole stopnia w Z−22. Jaki X ma początek fazy?", template: "X{0}", answers: [["34"]], why: "36 − 2 · 1 = 34." },
    { kind: "choice", q: "Gdzie ustawisz punkt startu cyklu przy pręcie Ø50?", options: ["nad prętem, np. X52", "na Ø46", "na osi", "na Ø26"], answer: 0, why: "Start nad surówką, z zapasem — tak jak X42 nad prętem Ø40 w kursie." },
    { kind: "choice", q: "Co zmieni się w programie z G42, gdy nóż wykańczający R0,2 zastąpisz R0,4?", options: ["nic w programie — zmieniają się dane narzędzia", "współrzędne konturu", "G70 na G71", "punkt startu cyklu"], answer: 0, why: "Kontur jest zapisany z rysunku; promień i kierunek ostrza siedzą w korekcji." },
  ],

  summary: [
    "Nowy wałek: każda liczba z nowego rysunku i nowej karty narzędzi.",
    "Planowanie bez korekcji: za oś o 2·rε — przy R0,4 do X−0,8.",
    "Kontur G71 zaczyna się w punkcie startu cyklu i jest monotoniczny w X i Z.",
    "Z G42 promień ostrza wykańczającego nie zmienia programu — zmienia się korekcja.",
  ],

  sources: [
    { id: "fanuc", where: "G71, G70, G96, G50, korekcja promienia ostrza G41/G42" },
    { id: "sinumerik", where: "G96 z limitem LIMS, korekcja promienia ostrza — porównanie" },
  ],
};
