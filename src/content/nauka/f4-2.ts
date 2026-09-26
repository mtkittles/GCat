import type { LessonDoc } from "@/lib/lesson";

const starter = `O1000 (PLYTKA)
G21 G90 G17
G40 G49 G80
G54
T1 M06 (FREZ FI10)
G43 H1 Z50.
S2500 M03
M08
G00 X-20. Y10.
G00 Z5.
G01 Z-5. F150
(DOPISZ: G41 D1 NA DOJEZDZIE DO X0,
 KONTUR 80X50 Z NAROZAMI R10 WYMIARAMI Z RYSUNKU,
 G40 NA ODJEZDZIE DO X-20)

G00 Z5.
M09
M05
M30`;

const contour = `G41 D1 G01 X0. F400
G01 Y40.
G02 X10. Y50. R10.
G01 X70.
G02 X80. Y40. R10.
G01 Y10.
G02 X70. Y0. R10.
G01 X10.
G02 X0. Y10. R10.
G40 G01 X-20.`;

export const f4_2: LessonDoc = {
  id: "F4.2",
  slug: "f4-2-g41-g42-korekcja-promienia",
  title: "G41, G42, G40 — korekcja promienia",
  minutes: 16,
  goal: "Zaprogramujesz kontur wymiarami z rysunku z korekcją promienia i skorygujesz wymiar detalu bez zmiany programu.",

  theory: [
    { t: "h", x: "Program opisuje detal", id: "idea" },
    { t: "p", x: "W F3.2 i F3.3 liczyłeś tor środka freza: X−5, Y55, łuki R15. Z korekcją promienia program podaje sam kontur z rysunku, a sterowanie odsuwa środek freza o promień zapisany w rejestrze **D**. Ten sam program pasuje do freza Ø10 i Ø12 — zmienia się tylko wartość w rejestrze." },
    { t: "diagram", id: "f42-comp" },

    { t: "h", x: "Lewa czy prawa", id: "strona" },
    { t: "p", x: "[[G41]] — frez po **lewej** stronie konturu, patrząc w kierunku ruchu. [[G42]] — po **prawej**. [[G40]] wyłącza korekcję. Przy obrotach M03 i zwykłym frezie prawoskrętnym G41 daje [[frezowanie współbieżne]], a G42 — przeciwbieżne." },
    { t: "diagram", id: "g40-g42" },
    { t: "p", x: "Płytka obiegana zgodnie z zegarem ma materiał po prawej stronie ruchu, więc frez jedzie po lewej: `G41`." },

    { t: "h", x: "Włączanie i wyłączanie", id: "wlaczanie" },
    { t: "ul", items: [
      "Korekcję włącza i wyłącza **ruch liniowy** (G00 lub G01), nigdy łuk.",
      "Ruch włączający musi być dłuższy niż promień freza i odbywać się w powietrzu, poza konturem.",
      "Na końcu tego ruchu środek freza stoi już odsunięty o promień. Przy wyłączaniu — odwrotnie, frez wraca na tor programowany.",
    ] },

    { t: "h", x: "Korekcja zużycia — wymiar bez zmiany programu", id: "zuzycie" },
    { t: "p", x: "Rejestr D ma zwykle dwie kolumny: wymiar narzędzia i zużycie. Sterowanie odsuwa środek freza o ich sumę. Jeśli płytka wyszła za duża, zmniejszasz D, a frez podchodzi bliżej konturu z każdej strony." },
    { t: "table", head: ["Pomiar", "Odchyłka", "Zmiana D", "Efekt"], rows: [
      ["80,04", "+0,04", "−0,02", "frez 0,02 bliżej z każdej strony, wymiar −0,04"],
      ["49,97", "−0,03", "+0,015", "frez 0,015 dalej z każdej strony, wymiar +0,03"],
    ], caption: "Wymiar zewnętrzny zmienia się o podwójną zmianę D, bo korekcja działa po obu stronach." },
  ],

  worked: {
    title: "Program płytki z korekcją",
    intro: "Kontur z F3.3 zapisany wymiarami z rysunku. Frez stoi na Z−5 w X−20 Y10.",
    steps: [
      { x: "Włączenie korekcji na dojeździe do lewej krawędzi. 20 mm drogi — więcej niż promień 5.", code: "G41 D1 G01 X0. F400" },
      { x: "Naroża z rysunku: R10 zamiast R15, punkty końcowe na konturze.", code: "G02 X10. Y50. R10." },
      { x: "Pozostałe naroża tak samo: X80 Y40, X70 Y0, X0 Y10.", code: "R10." },
      { x: "Wyłączenie korekcji na odjeździe od konturu.", code: "G40 G01 X-20." },
    ],
    result: "Program jest krótszy do sprawdzenia: każdą liczbę widać na rysunku. Promień freza siedzi w rejestrze D1, gdzie operator koryguje wymiar.",
  },

  practice: [
    {
      kind: "task",
      intro: "Dopisz kontur z korekcją promienia, wymiarami z rysunku. Sprawdzany jest tor programowany — czyli sam kontur detalu.",
      starter,
      checks: [
        { t: "cut", reference: `G90\nG00 X-20. Y10.\nG00 Z5.\nG01 Z-5. F150\n${contour}\nG00 Z5.`, tolerance: 0.05 },
        { t: "require", codes: ["G41", "G40"] },
      ],
      hints: ["Pierwszy blok: G41 D1 G01 X0. F400.", "Kontur jak w F3.3, ale X0/X80/Y0/Y50 i R10. Na koniec G40 G01 X-20."],
      solution: starter.replace("(DOPISZ: G41 D1 NA DOJEZDZIE DO X0,\n KONTUR 80X50 Z NAROZAMI R10 WYMIARAMI Z RYSUNKU,\n G40 NA ODJEZDZIE DO X-20)\n", contour),
    },
    {
      kind: "drill",
      intro: "Strona korekcji i korekcja zużycia.",
      questions: [
        { kind: "gap", q: "Płytka zmierzona: 50,06 zamiast 50,00. O ile zmienić D?", template: "{0}", answers: [["-0.03", "-0,03"]], why: "Odchyłka +0,06, połowa na każdą stronę: D − 0,03." },
        { kind: "choice", q: "Kieszeń obiegana przeciwnie do zegara, frez ma być po lewej stronie ruchu. Który kod?", options: ["G41", "G42", "G40", "G43"], answer: 0, why: "Lewa strona — G41." },
        { kind: "choice", q: "Czy można włączyć korekcję blokiem `G41 D1 G02 X10. Y50. R10.`?", options: ["nie — tylko ruchem liniowym", "tak", "tylko na Sinumeriku", "tylko z G91"], answer: 0, why: "Włączanie i wyłączanie korekcji odbywa się na odcinku prostym." },
      ],
    },
  ],

  pitfalls: [
    { title: "Ruch włączający za krótki", x: "Frez stoi 3 mm od konturu, a promień ma 5 mm. Sterowanie nie ma gdzie przesunąć środka — alarm albo wcięcie w detal." },
    { title: "G42 zamiast G41", x: "Frez przejeżdża po stronie materiału: tor środka leży 5 mm w detalu, a nie 5 mm od niego. Płytka wychodzi o 20 mm mniejsza w każdym kierunku." },
    { title: "Promień wewnętrzny mniejszy od freza", x: "Naroże wklęsłe R3 frezem Ø10. Środek freza nie zmieści się w takim łuku — alarm. Promień wewnętrzny musi być większy niż promień narzędzia." },
    { title: "Średnica w rejestrze promienia", x: "Operator wpisuje 10 zamiast 5. Środek freza odsuwa się o 10 mm, płytka wychodzi o 10 mm większa. Sprawdź, czy maszyna trzyma w D promień, czy średnicę." },
  ],

  controllers: {
    rows: [
      ["Korekcja z lewej / prawej", "`G41` / `G42` z `D`", "`G41` / `G42`, promień z aktywnego ostrza D"],
      ["Wyłączenie", "`G40`", "`G40`"],
      ["Rejestr", "D w tabeli korekcji: wymiar + zużycie", "dane ostrza: promień + zużycie"],
    ],
    note: "Na Fanucu numer D podaje się w bloku z G41/G42. Na Sinumeriku D jest zwykle aktywne od wymiany narzędzia i G41 wystarczy.",
  },

  quiz: [
    { kind: "choice", review: "F4.1", q: "Co włącza `G43 H1`?", options: ["korekcję długości z rejestru 1", "korekcję promienia", "G54", "narzędzie nr 1"], answer: 0, why: "G43 — długość." },
    { kind: "choice", q: "Co opisuje program z G41?", options: ["kontur detalu z rysunku", "tor środka freza", "zero maszyny", "długość narzędzia"], answer: 0, why: "Przesunięcie o promień robi sterowanie." },
    { kind: "choice", q: "G41 oznacza frez:", options: ["po lewej stronie konturu, patrząc w kierunku ruchu", "po prawej stronie", "nad konturem", "po lewej stronie maszyny"], answer: 0, why: "Stronę ocenia się względem kierunku ruchu." },
    { kind: "gap", q: "Wymiar zewnętrzny wyszedł 79,96 zamiast 80,00. O ile zmienić D?", template: "{0}", answers: [["+0.02", "0.02", "+0,02", "0,02"]], why: "Za mało o 0,04 — frez dalej o 0,02 z każdej strony." },
    { kind: "choice", q: "Dlaczego korekcję włącza się ruchem w powietrzu, dłuższym niż promień?", options: ["na tym ruchu sterowanie odsuwa środek freza", "bo G41 działa wolniej", "bo tak wymaga G43", "bez powodu"], answer: 0, why: "Przesunięcie musi się zmieścić przed dojściem do konturu." },
    { kind: "choice", q: "Obróbka zewnętrzna zgodnie z zegarem przy M03 — który kod daje frezowanie współbieżne?", options: ["G41", "G42", "G40", "oba"], answer: 0, why: "Materiał po prawej, frez po lewej." },
    { kind: "token", q: "Tapnij słowo, które podaje **rejestr promienia**.", block: "G41 D1 G01 X0. F400", answer: 1, why: "D1 — rejestr korekcji promienia." },
  ],

  summary: [
    "Z G41/G42 program opisuje kontur z rysunku, sterowanie odsuwa środek freza o D.",
    "G41 — frez po lewej, G42 — po prawej, patrząc w kierunku ruchu. G40 — wyłączenie.",
    "Włączanie i wyłączanie: ruchem liniowym w powietrzu, dłuższym niż promień.",
    "Wymiar koryguje się w D: zmiana D o x zmienia wymiar zewnętrzny o 2x.",
  ],

  sources: [
    { id: "fanuc", where: "korekcja promienia G40/G41/G42, włączanie i wyłączanie korekcji, tabela korekcji" },
    { id: "sinumerik", where: "korekcja promienia narzędzia G40/G41/G42" },
    { id: "sandvik", where: "frezowanie współbieżne i przeciwbieżne" },
  ],
};
