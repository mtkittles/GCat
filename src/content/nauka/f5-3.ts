import type { LessonDoc } from "@/lib/lesson";

const starter = `O1005 (GWINTY M6)
G21 G90 G17
G40 G49 G80
G54
T4 M06 (GWINTOWNIK M6X1)
G43 H4 Z50.
S500 M03
(DOPISZ: M29 S500, CYKL G84 DLA CZTERECH OTWOROW,
 Z-12. R5. F500, NA KONIEC G80)

M09
M05
M30`;

const cycle = `M29 S500
M08
G84 X10. Y10. Z-12. R5. F500
X70.
Y40.
X10.
G80`;

export const f5_3: LessonDoc = {
  id: "F5.3",
  slug: "f5-3-g84-gwintowanie",
  title: "G84 — gwintowanie",
  minutes: 15,
  goal: "Dobierzesz otwór pod gwint, obliczysz posuw gwintowania i zaprogramujesz gwintowanie sztywne cyklem G84.",

  theory: [
    { t: "h", x: "Posuw wynika ze skoku", id: "posuw" },
    { t: "p", x: "Gwintownik na każdy obrót wchodzi w materiał dokładnie o skok gwintu P. Posuw nie jest więc parametrem do wyboru — wynika z obrotów:" },
    { t: "code", x: "F = S · P        (G94, mm/min)\nM6×1,  S500:  F = 500 · 1    = 500\nM8×1,25, S400: F = 400 · 1,25 = 500" },
    { t: "diagram", id: "f53-tap" },
    { t: "p", x: "Cykl [[G84]] wchodzi posuwem z obrotami w prawo do Z, na dnie odwraca obroty i wychodzi tym samym torem do R. W trakcie gwintowania korektor posuwu jest zablokowany na 100% — każda zmiana posuwu zniszczyłaby gwint." },

    { t: "h", x: "Gwintowanie sztywne", id: "sztywne" },
    { t: "p", x: "Przy [[gwintowanie sztywne|gwintowaniu sztywnym]] sterowanie sprzęga obrót wrzeciona z ruchem osi Z — gwintownik siedzi w zwykłej oprawce. Na Fanucu włącza je `M29 S…` tuż przed G84. Starsze maszyny bez tej funkcji gwintują w oprawce kompensacyjnej, która wybiera różnice między obrotami a posuwem." },
    { t: "note", kind: "info", x: "Gwint lewy na Fanucu frezarskim robi cykl `G74` — obroty w lewo na wejściu, w prawo na wyjściu." },

    { t: "h", x: "Otwór pod gwint", id: "otwor" },
    { t: "p", x: "Dla gwintów metrycznych zwykłych średnica wiertła to w przybliżeniu średnica gwintu minus skok. Stąd wiertło Ø5 w lekcji F5.2." },
    { t: "table", head: ["Gwint", "Skok P", "Wiertło"], rows: [
      ["M4", "0,7", "Ø3,3"], ["M5", "0,8", "Ø4,2"], ["M6", "1", "Ø5,0"],
      ["M8", "1,25", "Ø6,8"], ["M10", "1,5", "Ø8,5"], ["M12", "1,75", "Ø10,2"],
    ], caption: "D wiertła ≈ d − P. Dla gwintów drobnozwojnych liczy się tak samo z ich skokiem." },
    { t: "p", x: "Płaszczyzna R przy gwintowaniu jest wyższa niż przy wierceniu, np. R5: gwintownik musi osiągnąć synchronizację obrotów i posuwu, zanim dotknie materiału." },
  ],

  worked: {
    title: "Gwinty M6 w płytce",
    intro: "Otwory Ø5 wywiercone na Z−16 (lekcja F5.2). Gwint M6×1 na głębokość 12 mm, gwintownik maszynowy, S500.",
    steps: [
      { x: "Posuw z obrotów i skoku: 500 · 1.", code: "F500" },
      { x: "Na Fanucu — tryb sztywny przed cyklem.", code: "M29 S500" },
      { x: "Cykl na pierwszym otworze, R wyżej niż przy wierceniu.", code: "G84 X10. Y10. Z-12. R5. F500" },
      { x: "Pozostałe otwory i skasowanie cyklu.", code: "X70. → Y40. → X10. → G80" },
    ],
    result: "Pełna średnica wiertła sięga 15 mm, gwint 12 mm — nakrój gwintownika ma 3 mm zapasu nad dnem.",
  },

  practice: [
    {
      kind: "task",
      intro: "Dopisz gwintowanie sztywne czterech otworów. Sprawdzane: tor roboczy, G84, G80, M29 i poprawny posuw.",
      starter,
      checks: [
        { t: "cut", reference: `G90\nG00 Z50.\n${cycle}`, tolerance: 0.05 },
        { t: "require", codes: ["G84", "G80", "M29", "F500"] },
      ],
      hints: ["M29 S500, potem G84 X10. Y10. Z-12. R5. F500.", "Pozostałe otwory: X70., Y40., X10. Na koniec G80."],
      solution: starter.replace("(DOPISZ: M29 S500, CYKL G84 DLA CZTERECH OTWOROW,\n Z-12. R5. F500, NA KONIEC G80)\n", cycle),
    },
    {
      kind: "drill",
      intro: "Posuw gwintowania i otwór pod gwint.",
      questions: [
        { kind: "gap", q: "M10×1,5 przy S300. Posuw F (mm/min):", template: "F{0}", answers: [["450"]], why: "300 · 1,5 = 450." },
        { kind: "gap", q: "Średnica wiertła pod M8×1,25:", template: "Ø{0}", answers: [["6.8", "6,8", "6.75", "6,75"]], why: "8 − 1,25 = 6,75 → wiertło Ø6,8." },
        { kind: "choice", q: "Gwintownik M6×1, S600, w programie F500. Co się stanie?", options: ["posuw nie zgadza się ze skokiem — zerwany gwint albo złamany gwintownik", "gwint wyjdzie płytszy", "nic, sterowanie poprawi", "gwint wyjdzie lewy"], answer: 0, why: "Przy S600 potrzeba F600." },
      ],
    },
  ],

  pitfalls: [
    { title: "Posuw niezgodny ze skokiem", x: "Zmiana S bez przeliczenia F. Gwintownik jest ciągnięty albo pchany względem zwojów — zrywa gwint albo pęka w otworze, skąd trudno go wyjąć." },
    { title: "Za płytki otwór", x: "Otwór wiercony na głębokość gwintu. Nakrój gwintownika dochodzi do dna, zanim gwint osiągnie pełną głębokość — gwintownik się łamie." },
    { title: "Brak M29 na maszynie z gwintowaniem sztywnym", x: "Gwintownik w zwykłej oprawce, a G84 bez M29 pracuje jak do oprawki kompensacyjnej. Różnica między obrotami a posuwem nie ma gdzie się podziać." },
    { title: "R za nisko", x: "R2 przy gwintowaniu: wrzeciono nie zdąży zsynchronizować się z osią Z przed materiałem. Pierwsze zwoje wychodzą poszarpane." },
  ],

  controllers: {
    rows: [
      ["Gwintowanie sztywne", "`M29 S…` + `G84`", "`CYCLE84(…)`"],
      ["Oprawka kompensacyjna", "`G84` bez M29", "`CYCLE840(…)`"],
      ["Gwint lewy", "`G74`", "`CYCLE84` z kierunkiem obrotów w lewo"],
      ["Skok w cyklu", "przez F = S · P (G94)", "wprost jako skok albo typ gwintu"],
    ],
    note: "Sinumerik przyjmuje skok gwintu wprost, a posuw liczy sam. Na Fanucu przeliczasz F samodzielnie albo używasz G95 z F równym skokowi.",
  },

  quiz: [
    { kind: "gap", review: "F5.2", q: "Wiertło 140°, Ø5. Długość stożka (mm):", template: "{0} mm", answers: [["0.9", "0,9"]], why: "0,18 · 5 = 0,9." },
    { kind: "gap", q: "M6×1 przy S450. F:", template: "F{0}", answers: [["450"]], why: "450 · 1 = 450." },
    { kind: "choice", q: "Co robi G84 na dnie otworu?", options: ["odwraca obroty i wychodzi posuwem", "wychodzi ruchem szybkim", "zatrzymuje się na czas P", "cofa się o Q"], answer: 0, why: "Gwintownik musi się wykręcić tym samym torem." },
    { kind: "choice", q: "Co włącza `M29` na Fanucu?", options: ["gwintowanie sztywne", "chłodziwo", "wymianę narzędzia", "cykl G83"], answer: 0, why: "Sprzężenie obrotów wrzeciona z osią Z." },
    { kind: "gap", q: "Wiertło pod M12×1,75:", template: "Ø{0}", answers: [["10.2", "10,2", "10.25", "10,25"]], why: "12 − 1,75 = 10,25 → Ø10,2." },
    { kind: "choice", q: "Dlaczego korektor posuwu nie działa podczas G84?", options: ["zmiana posuwu zniszczyłaby gwint", "bo G84 jest ruchem szybkim", "przez M29", "działa normalnie"], answer: 0, why: "Posuw musi dokładnie odpowiadać obrotom i skokowi." },
    { kind: "token", q: "Tapnij słowo, które musi być równe **S · P**.", block: "G84 X10. Y10. Z-12. R5. F500", answer: 5, why: "F500 = 500 · 1." },
  ],

  summary: [
    "F = S · P. Posuw gwintowania wynika z obrotów i skoku.",
    "G84: wejście w prawo, obroty odwrócone na dnie, wyjście do R.",
    "Gwintowanie sztywne na Fanucu: M29 S… przed G84.",
    "Wiertło pod gwint ≈ d − P, otwór głębszy o nakrój i stożek wiertła.",
  ],

  sources: [
    { id: "fanuc", where: "G84, G74, gwintowanie sztywne M29" },
    { id: "sinumerik", where: "CYCLE84 i CYCLE840" },
    { id: "sandvik", where: "gwintowanie, średnice otworów pod gwint" },
  ],
};
