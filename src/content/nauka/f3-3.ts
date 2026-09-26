import type { LessonDoc } from "@/lib/lesson";

const starter = `O1000 (PLYTKA)
G21 G90 G17
G40 G49 G80
G54
T1 M06
S2500 M03
M08
G00 X40. Y25. Z50.
G00 X-20. Y10.
G00 Z5.
G01 Z-5. F150
G01 X-5. F400
(DOPISZ KONTUR Z NAROZAMI R10 NA DETALU)

G00 Z5.
M09
M05
M30`;

const contour = `G01 Y40.
G02 X10. Y55. R15.
G01 X70.
G02 X85. Y40. R15.
G01 Y10.
G02 X70. Y-5. R15.
G01 X10.
G02 X-5. Y10. R15.`;

export const f3_3: LessonDoc = {
  id: "F3.3",
  slug: "f3-3-g02-g03-promien-r",
  title: "G02 i G03 z promieniem R",
  minutes: 15,
  goal: "Zaprogramujesz łuk przez punkt końcowy i promień, wybierzesz kierunek i znak R i zaokrąglisz naroża konturu.",

  theory: [
    { t: "h", x: "Kierunek łuku", id: "kierunek" },
    { t: "p", x: "[[G02]] to łuk zgodnie z ruchem wskazówek zegara, [[G03]] — przeciwnie. W płaszczyźnie G17 kierunek ocenia się, patrząc z góry, od +Z (lekcja F1.4). Łuk zaczyna się tam, gdzie narzędzie stoi, i kończy w punkcie podanym w bloku." },
    { t: "code", x: "G02 X10. Y55. R15.\n│   │         └─ promień łuku\n│   └─ punkt końcowy\n└─ kierunek: zgodnie z zegarem", caption: "Start łuku to bieżąca pozycja narzędzia." },
    { t: "diagram", id: "g02" },

    { t: "h", x: "Znak R", id: "znak-r" },
    { t: "p", x: "Między dwoma punktami przechodzą dwa łuki o tym samym promieniu i kierunku: krótki i długi. Dodatnie R wybiera łuk do 180°, ujemne — ponad 180°." },
    { t: "diagram", id: "f33-rsign" },
    { t: "p", x: "Jeśli odległość między punktami jest większa niż średnica 2R, takiego łuku nie ma — sterowanie zgłosi alarm. Pełnego okręgu przez R zapisać się nie da, bo start i koniec są w tym samym miejscu. Do tego służą I i J (lekcja F3.4)." },

    { t: "h", x: "Naroża płytki", id: "naroza" },
    { t: "p", x: "Płytka dostaje naroża R10. Frez Ø10 jedzie środkiem o 5 mm dalej od konturu, więc na narożu wypukłym promień jego toru to 10 + 5 = 15. Środek łuku narzędzia pokrywa się ze środkiem naroża detalu." },
    { t: "diagram", id: "f33-corner" },
    { t: "p", x: "Przy obiegu zgodnym z zegarem wszystkie cztery naroża zewnętrzne to `G02`. Proste odcinki kończą się tam, gdzie zaczyna się łuk: lewa krawędź w Y40, a nie w Y55." },
    { t: "widget", id: "arc" },
  ],

  worked: {
    title: "Pierwsze naroże konturu",
    intro: "Frez jedzie w górę lewą krawędzią, X−5. Naroże detalu R10 ma środek w X10 Y40.",
    steps: [
      { x: "Odcinek kończy się na wysokości środka naroża.", code: "G01 Y40." },
      { x: "Łuk zgodnie z zegarem, patrząc z góry.", code: "G02" },
      { x: "Koniec łuku: nad środkiem naroża, 15 mm wyżej.", code: "X10. Y55." },
      { x: "Promień toru: 10 + 5. Łuk ma 90°, więc R dodatnie.", code: "R15." },
    ],
    result: "`G02 X10. Y55. R15.` Pozostałe trzy naroża idą tak samo — zmieniają się tylko punkty końcowe.",
  },

  practice: [
    {
      kind: "task",
      intro: "Dopisz kontur z zaokrąglonymi narożami w miejscu komentarza. Sprawdzany jest tor roboczy, nie zapis.",
      starter,
      checks: [
        { t: "cut", reference: `G90\nG00 X-20. Y10.\nG00 Z5.\nG01 Z-5. F150\nG01 X-5. F400\n${contour}\nG00 Z5.`, tolerance: 0.05 },
        { t: "require", codes: ["G02"] },
      ],
      hints: ["Lewa krawędź kończy się w Y40, potem G02 X10. Y55. R15.", "Kolejne naroża: X85 Y40, X70 Y−5, X−5 Y10 — każde z R15."],
      solution: starter.replace("(DOPISZ KONTUR Z NAROZAMI R10 NA DETALU)\n", contour),
    },
    {
      kind: "drill",
      intro: "Kierunek i znak R.",
      questions: [
        { kind: "choice", q: "Obieg konturu zewnętrznego zgodnie z zegarem. Naroża wypukłe to:", options: ["G02", "G03", "raz G02, raz G03", "G01"], answer: 0, why: "Przy obiegu zgodnym z zegarem łuki wypukłe też idą zgodnie z zegarem." },
        { kind: "gap", q: "Naroże detalu R6, frez Ø8, obróbka z zewnątrz. Promień toru:", template: "R{0}", answers: [["10"]], why: "6 + 4 = 10." },
        { kind: "choice", q: "Łuk ma 270°. Jaki znak R na Fanucu?", options: ["dodatni", "ujemny", "bez znaczenia", "łuku ponad 180° nie da się zapisać"], answer: 1, why: "Ujemne R wybiera łuk dłuższy niż 180°." },
      ],
    },
  ],

  pitfalls: [
    { title: "G02 zamiast G03", x: "Pomylony kierunek daje łuk wygięty w drugą stronę — na narożu wypukłym frez wcina się w detal. Sprawdzaj kierunek, patrząc z góry." },
    { title: "Promień naroża zamiast toru", x: "`R10.` zamiast `R15.` przy torze odsuniętym o promień freza. Punkt końcowy i promień do siebie nie pasują — alarm albo łuk o innym środku." },
    { title: "Odcinek do rogu przed łukiem", x: "`G01 Y55.` zamiast `G01 Y40.`, a potem łuk. Frez dojechał już do narożnika toru, więc łuk zaczyna się w złym miejscu." },
    { title: "Pełny okrąg przez R", x: "`G02 X50. Y25. R10.` ze startem w X50 Y25 — start i koniec w tym samym punkcie. Sterowanie nie wykona okręgu. Pełny okrąg zapisuje się przez I i J." },
  ],

  controllers: {
    rows: [
      ["Łuk zgodnie z zegarem", "`G02`", "`G2`"],
      ["Łuk przeciwnie", "`G03`", "`G3`"],
      ["Promień", "`R15.`, ujemny dla łuku > 180°", "`CR=15`, ujemny dla łuku > 180°"],
    ],
    note: "Sinumerik w języku Siemensa zapisuje promień jako `CR=`. W trybie ISO rozumie też `R`.",
  },

  quiz: [
    { kind: "gap", review: "F3.2", q: "Frez Ø10, lewa krawędź detalu w X0. Jaki X środka przy obróbce z zewnątrz?", template: "X{0}", answers: [["-5"]], why: "0 − 5 = −5." },
    { kind: "choice", q: "Co oznacza `G03`?", options: ["łuk zgodnie z zegarem", "łuk przeciwnie do zegara", "ruch szybki", "postój"], answer: 1, why: "G02 — zgodnie, G03 — przeciwnie, patrząc z góry." },
    { kind: "choice", q: "Gdzie zaczyna się łuk `G02 X10. Y55. R15.`?", options: ["w X10 Y55", "w bieżącej pozycji narzędzia", "w zerze W", "w środku łuku"], answer: 1, why: "Blok podaje tylko koniec i promień." },
    { kind: "gap", q: "Naroże detalu R8, frez Ø12, obróbka z zewnątrz. Promień toru:", template: "R{0}", answers: [["14"]], why: "8 + 6 = 14." },
    { kind: "choice", q: "Odległość między startem a końcem łuku wynosi 40 mm, w bloku R15. Co się stanie?", options: ["alarm — punkty są dalej niż 2R", "łuk o promieniu 20", "odcinek prosty", "pełny okrąg"], answer: 0, why: "Łuk R15 łączy punkty odległe najwyżej o 30 mm." },
    { kind: "choice", q: "Jak zapisać pełny okrąg?", options: ["przez R ze startem równym końcowi", "przez I i J", "dwoma G01", "nie da się"], answer: 1, why: "R nie określa środka, gdy start i koniec się pokrywają." },
    { kind: "token", q: "Tapnij słowo, które podaje **promień**.", block: "G02 X85. Y40. R15.", answer: 3, why: "R15. — promień łuku." },
  ],

  summary: [
    "G02 zgodnie z zegarem, G03 przeciwnie — patrząc z góry przy G17.",
    "Blok podaje koniec i promień, start to bieżąca pozycja.",
    "R dodatnie: łuk do 180°. R ujemne: ponad 180°. Pełny okrąg — tylko przez I i J.",
    "Naroże wypukłe z zewnątrz: promień toru = promień naroża + promień freza.",
  ],

  sources: [
    { id: "fanuc", where: "interpolacja kołowa G02/G03, programowanie promieniem R" },
    { id: "sinumerik", where: "G2/G3, CR=" },
  ],
};
