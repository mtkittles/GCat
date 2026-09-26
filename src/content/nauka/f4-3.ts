import type { LessonDoc } from "@/lib/lesson";

const body = `G01 Y40.
G02 X10. Y50. R10.
G01 X70.
G02 X80. Y40. R10.
G01 Y10.
G02 X70. Y0. R10.
G01 X10.
G02 X0. Y10. R10.`;

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
(DOPISZ NAJAZD: G41 D1 G01 X-10. Y0. F400 I LUK G03 DO X0 Y10 R10)
${body}
(DOPISZ ODJAZD: LUK G03 DO X-10 Y20 R10 I G40 G01 X-20. Y10.)
G00 Z5.
M09
M05
M30`;

const lead = { in: "G41 D1 G01 X-10. Y0. F400\nG03 X0. Y10. R10.", out: "G03 X-10. Y20. R10.\nG40 G01 X-20. Y10." };

export const f4_3: LessonDoc = {
  id: "F4.3",
  slug: "f4-3-najazd-odjazd",
  title: "Najazd i odjazd od konturu",
  minutes: 12,
  goal: "Zaprogramujesz styczny najazd i odjazd z korekcją promienia, bez śladu w miejscu wejścia na kontur.",

  theory: [
    { t: "h", x: "Ślad w miejscu wejścia", id: "slad" },
    { t: "p", x: "Przy najeździe prostopadłym frez dochodzi do ściany, na chwilę się zatrzymuje i zmienia kierunek o 90°. Obciążenie skacze, narzędzie ugina się inaczej niż na reszcie konturu i w miejscu wejścia zostaje widoczny ślad — często poza tolerancją chropowatości." },
    { t: "diagram", id: "comp-entry" },

    { t: "h", x: "Najazd po łuku", id: "luk" },
    { t: "p", x: "Rozwiązanie: wejść na kontur po łuku stycznym. Frez zaczyna skrawać płynnie, bez zatrzymania, a kierunek ruchu na końcu łuku jest już zgodny z kierunkiem konturu. Odjazd robi się symetrycznie." },
    { t: "diagram", id: "f43-leadin" },
    { t: "ul", items: [
      "Korekcja włącza się na odcinku **przed** łukiem, w powietrzu.",
      "Promień łuku najazdu musi być większy niż promień freza — tu R10 przy frezie R5.",
      "Kierunek łuku najazdu wynika z kierunku konturu: przy G41 i obiegu zgodnym z zegarem łuk wejściowy idzie przeciwnie, `G03`.",
      "Wejście najlepiej na odcinku prostym, z dala od naroży wklęsłych.",
    ] },

    { t: "h", x: "Punkt wejścia", id: "punkt" },
    { t: "p", x: "Na konturze zamkniętym punkt wejścia jest też punktem wyjścia. Najlepiej wybrać go na długim odcinku prostym albo w narożu wypukłym, gdzie ewentualny ślad nie przecina ważnej powierzchni. W płytce to lewa krawędź, 10 mm nad dolnym narożem." },
  ],

  worked: {
    title: "Najazd i odjazd płytki",
    intro: "Kontur zaczyna się i kończy w X0 Y10, obieg zgodnie z zegarem, G41. Frez stoi na głębokości w X−20 Y10.",
    steps: [
      { x: "Odcinek w powietrzu z włączeniem korekcji — do początku łuku.", code: "G41 D1 G01 X-10. Y0. F400" },
      { x: "Łuk styczny do lewej krawędzi, środek X−10 Y10. Kierunek przeciwny do zegara.", code: "G03 X0. Y10. R10." },
      { x: "Po obiegu konturu — łuk wyjścia, dalej w górę i w lewo od krawędzi.", code: "G03 X-10. Y20. R10." },
      { x: "Odcinek w powietrzu z wyłączeniem korekcji.", code: "G40 G01 X-20. Y10." },
    ],
    result: "Frez wchodzi i schodzi z konturu stycznie w tym samym punkcie X0 Y10. Program płytki ma teraz docelową postać — zobacz ją poniżej.",
  },

  practice: [
    {
      kind: "task",
      intro: "Kontur jest gotowy. Dopisz najazd i odjazd po łukach w miejscach komentarzy.",
      starter,
      checks: [
        { t: "cut", reference: `G90\nG00 X-20. Y10.\nG00 Z5.\nG01 Z-5. F150\n${lead.in}\n${body}\n${lead.out}\nG00 Z5.`, tolerance: 0.05 },
        { t: "require", codes: ["G41", "G40", "G03"] },
      ],
      hints: ["Najazd: G41 D1 G01 X-10. Y0. F400, potem G03 X0. Y10. R10.", "Odjazd: G03 X-10. Y20. R10., potem G40 G01 X-20. Y10."],
      solution: starter
        .replace("(DOPISZ NAJAZD: G41 D1 G01 X-10. Y0. F400 I LUK G03 DO X0 Y10 R10)", lead.in)
        .replace("(DOPISZ ODJAZD: LUK G03 DO X-10 Y20 R10 I G40 G01 X-20. Y10.)", lead.out),
    },
    {
      kind: "drill",
      intro: "Warunki poprawnego najazdu.",
      questions: [
        { kind: "choice", q: "Frez Ø16. Który łuk najazdu jest za mały?", options: ["R6", "R10", "R12", "R20"], answer: 0, why: "Promień łuku najazdu musi być większy niż promień freza (8)." },
        { kind: "choice", q: "Gdzie najlepiej wejść na kontur?", options: ["na długim odcinku prostym", "w narożu wklęsłym", "na krótkim łuku", "w dowolnym miejscu"], answer: 0, why: "Tam styczne wejście ma miejsce, a ślad nie trafia w krytyczną powierzchnię." },
      ],
    },
  ],

  pitfalls: [
    { title: "Korekcja włączana na łuku", x: "`G41` w bloku `G03`. Sterowanie zgłosi alarm albo potraktuje łuk jak prosty ruch włączający. Najpierw odcinek z G41, dopiero potem łuk." },
    { title: "Łuk najazdu mniejszy niż promień freza", x: "Przy G41 frez jedzie po wewnętrznej stronie łuku najazdu. Łuk R4 przy frezie R5 — środek freza nie ma gdzie się zmieścić, alarm." },
    { title: "Wejście w narożu wklęsłym", x: "Łuk najazdu wchodzący w naroże wklęsłe tnie ścianę obok. Wybieraj punkt wejścia na prostej albo na narożu wypukłym." },
  ],

  controllers: {
    rows: [
      ["Najazd styczny", "programowany ręcznie: odcinek + łuk", "ręcznie albo `G247`/`G347` z `DISR=`"],
      ["Odjazd styczny", "programowany ręcznie", "ręcznie albo `G248`/`G348`"],
    ],
    note: "Sinumerik ma gotowe polecenia miękkiego najazdu i odjazdu. Na Fanucu programuje się je ręcznie, tak jak w tej lekcji.",
  },

  quiz: [
    { kind: "choice", review: "F4.2", q: "Płytka obiegana zgodnie z zegarem, M03. Który kod korekcji?", options: ["G41", "G42", "G40", "G43"], answer: 0, why: "Materiał po prawej, frez po lewej — współbieżnie." },
    { kind: "choice", q: "Dlaczego najazd prostopadły zostawia ślad?", options: ["frez zatrzymuje się i zmienia kierunek na ścianie", "bo G01 jest wolniejsze", "przez chłodziwo", "nie zostawia"], answer: 0, why: "Zmiana obciążenia i ugięcia w jednym punkcie." },
    { kind: "choice", q: "Czym włącza się korekcję przy najeździe po łuku?", options: ["odcinkiem przed łukiem", "samym łukiem", "blokiem G40", "G43"], answer: 0, why: "Korekcję włącza i wyłącza tylko ruch liniowy." },
    { kind: "choice", q: "Frez Ø10. Najmniejszy sensowny promień łuku najazdu:", options: ["większy niż 5 mm", "dokładnie 5 mm", "2 mm", "dowolny"], answer: 0, why: "Środek freza musi zmieścić się po wewnętrznej stronie łuku." },
    { kind: "order", q: "Ułóż wejście i wyjście z konturu.", items: ["G40 G01 X-20. Y10.", "G41 D1 G01 X-10. Y0. F400", "(KONTUR)", "G03 X0. Y10. R10.", "G03 X-10. Y20. R10."], answer: [1, 3, 2, 4, 0], why: "Włączenie korekcji, łuk najazdu, kontur, łuk odjazdu, wyłączenie korekcji." },
  ],

  summary: [
    "Najazd prostopadły zostawia ślad — wchodź po łuku stycznym.",
    "Korekcję włącza i wyłącza odcinek w powietrzu, przed i po łuku.",
    "Promień łuku najazdu > promień freza.",
    "Punkt wejścia: długi odcinek prosty albo naroże wypukłe.",
  ],

  sources: [
    { id: "fanuc", where: "włączanie i wyłączanie korekcji promienia, przykłady najazdu" },
    { id: "sinumerik", where: "miękki najazd i odjazd G247/G347, G248/G348" },
    { id: "sandvik", where: "wejście narzędzia w materiał przy frezowaniu konturu" },
  ],
};
