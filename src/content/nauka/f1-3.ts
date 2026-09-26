import type { LessonDoc } from "@/lib/lesson";

export const f1_3: LessonDoc = {
  id: "F1.3",
  slug: "f1-3-g90-g91",
  title: "G90 i G91",
  minutes: 14,
  goal: "Napiszesz ten sam kontur w wymiarach absolutnych i przyrostowych i przeliczysz jeden zapis na drugi.",

  theory: [
    { t: "h", x: "Dwa sposoby podawania celu", id: "dwa-sposoby" },
    { t: "p", x: "[[G90]] — **wymiary absolutne**: każda współrzędna to położenie punktu względem zera detalu W. [[G91]] — **wymiary przyrostowe**: każda współrzędna to odległość od miejsca, w którym narzędzie stoi w tej chwili." },
    { t: "p", x: "Analogia: G90 to adres „Polna 80”, który prowadzi w to samo miejsce bez względu na to, skąd wychodzisz. G91 to „idź 80 m prosto”, więc cel zależy wyłącznie od punktu startu." },
    { t: "diagram", id: "f13-absinc" },
    { t: "table", head: ["Odcinek", "G90 — cel", "G91 — przyrost"], rows: [
      ["W → prawy przedni", "`X80. Y0.`", "`X80.`"],
      ["→ prawy tylny", "`X80. Y50.`", "`Y50.`"],
      ["→ lewy tylny", "`X0. Y50.`", "`X-80.`"],
      ["→ powrót do W", "`X0. Y0.`", "`Y-50.`"],
    ], caption: "W G91 oś, która się nie przesuwa, ma przyrost 0 i można ją pominąć." },

    { t: "h", x: "Przeliczanie", id: "przeliczanie" },
    { t: "code", x: "przyrost = cel − pozycja bieżąca\ncel      = pozycja bieżąca + przyrost" },
    { t: "p", x: "Frez stoi w X80. Y50. i ma dojechać do X20. Y50. Przyrost w X: 20 − 80 = −60, czyli `G91 X-60.`" },
    { t: "demo", mode: "mill", title: "Obieg płytki w G91",
      src: "G21 G90 G17 G54\nG00 X0. Y0. Z5.\nG01 Z-1. F150\nG91\nG01 X80. F400\nY50.\nX-80.\nY-50.\nG90\nG00 Z5.\nM30",
      caption: "Po `G91` każdy ruch zaczyna się tam, gdzie skończył się poprzedni. `G90` przywraca wymiary absolutne przed odjazdem." },

    { t: "h", x: "Kiedy G91", id: "kiedy" },
    { t: "ul", items: [
      "Powtarzalne wzory, czyli ten sam ruch w kilku miejscach — najczęściej w podprogramach (moduł F7).",
      "Odjazd o znaną wartość. `G91 G28 Z0.` z programu płytki znaczy: odjedź osią Z do punktu referencyjnego prosto w górę, bez ruchu w bok.",
      "Ruchy ustawiane przy maszynie krok po kroku od aktualnej pozycji.",
    ] },
    { t: "note", kind: "tip", x: "Domyślnie pisz w G90. Błąd w jednym bloku G90 psuje jeden punkt, a w G91 przesuwa wszystkie następne." },

    { t: "h", x: "Tryb jest modalny", id: "modalny" },
    { t: "p", x: "G90 i G91 tworzą jedną grupę, więc obowiązuje ostatnio wywołany kod (lekcja F1.2). Po odcinku w G91 wróć do `G90`, zanim kolejne bloki zaczną podawać współrzędne od W." },
  ],

  worked: {
    title: "Zamień kontur z G90 na G91",
    intro: "Frez stoi w X0. Y0. Kolejne cele w G90: `X20. Y0.` → `X20. Y30.` → `X50. Y30.` → `X50. Y0.`",
    steps: [
      { x: "Pierwszy cel X20 Y0. Przyrost X: 20 − 0 = 20, Y bez zmian.", code: "X20." },
      { x: "Cel X20 Y30. X bez zmian, przyrost Y: 30 − 0 = 30.", code: "Y30." },
      { x: "Cel X50 Y30. Przyrost X: 50 − 20 = 30.", code: "X30." },
      { x: "Cel X50 Y0. Przyrost Y: 0 − 30 = −30.", code: "Y-30." },
    ],
    result: "W G91: `X20.` → `Y30.` → `X30.` → `Y-30.`. Kontrola: suma przyrostów w X (20 + 30 = 50) daje końcowe X50, a w Y (30 − 30 = 0) końcowe Y0.",
  },

  practice: [
    {
      kind: "drill",
      intro: "Przeliczaj w obie strony. Minus wpisuj zwykłym znakiem „-”.",
      questions: [
        { kind: "gap", q: "Frez w X10. Y10., cel X60. Y10. Zapisz ruch w G91.", template: "G91 X{0}", answers: [["50"]], why: "60 − 10 = 50. Y się nie zmienia, więc go pomijasz." },
        { kind: "gap", q: "Frez w X60. Y40., cel X20. Y15. Zapisz ruch w G91.", template: "G91 X{0} Y{1}", answers: [["-40"], ["-25"]], why: "20 − 60 = −40 oraz 15 − 40 = −25." },
        { kind: "gap", q: "Frez w X30. Y20. wykonuje `G91 X-15. Y25.`. Gdzie stanie w G90?", template: "X{0} Y{1}", answers: [["15"], ["45"]], why: "30 − 15 = 15 oraz 20 + 25 = 45." },
        { kind: "choice", q: "Start w X0. Bloki: `G91` → `X10.` → `X10.` → `X10.`. Gdzie kończy frez?", options: ["X10", "X30", "X0", "X20"], answer: 1, why: "Każdy blok dodaje 10 mm do bieżącej pozycji." },
      ],
    },
  ],

  pitfalls: [
    { title: "Zapomniane G90 po G91", x: "Po `G91 G28 Z0.` program wraca do skrawania blokiem `X20.`, myśląc o punkcie od W. Sterowanie odmierzy 20 mm od bieżącej pozycji. Dlatego w programie płytki zaraz po G28 stoi `G90`." },
    { title: "Błędy się sumują", x: "W G91 każdy blok zaczyna się tam, gdzie skończył poprzedni. Pomyłka w jednym bloku przesuwa cały dalszy tor, a nie tylko jeden punkt." },
    { title: "Z w G91", x: "`G91 Z-5.` to zejście o 5 mm od miejsca, w którym frez stoi, a nie na głębokość 5 mm pod Z0. Frez stojący na Z5. skończy na Z0." },
    { title: "Zaokrąglenia w długich łańcuchach", x: "Przyrosty zaokrąglane do 0,001 mm w wielu blokach mogą się zsumować do wartości innej niż wymiar z rysunku. Wymiary tolerowane programuj w G90, od bazy." },
  ],

  controllers: {
    rows: [
      ["Tryb dla całego bloku", "`G90` / `G91`", "`G90` / `G91`"],
      ["Tryb dla jednej osi", "brak na frezarce", "`X=IC(10)` przyrostowo, `X=AC(10)` absolutnie"],
      ["Stan po włączeniu", "parametr, zwykle G90", "dane maszynowe, zwykle G90"],
    ],
    note: "Sinumerik pozwala mieszać tryby w jednym bloku przez `AC` i `IC`. Na Fanucu frezarskim tryb dotyczy całego bloku.",
  },

  quiz: [
    { kind: "choice", review: "F1.2", q: "Po `G91` w linii 10 program nie zawiera już G90 ani G91. W jakim trybie jest linia 20?",
      options: ["G90", "G91", "zależy od parametru", "alarm"], answer: 1, why: "G91 jest modalne i obowiązuje do wywołania G90." },
    { kind: "choice", q: "`G91 X20.` znaczy:",
      options: ["jedź do X20 od zera W", "przesuń się o 20 mm w +X od bieżącej pozycji", "ustaw X20 jako nowe zero", "jedź 20 mm w −X"], answer: 1,
      why: "W G91 wartość jest przyrostem od bieżącej pozycji." },
    { kind: "gap", q: "Frez w X80. Y50. (G90). Cel X20. Y50. Podaj przyrost w G91.", template: "X{0}", answers: [["-60"]], why: "20 − 80 = −60." },
    { kind: "gap", q: "Start X0 Y0. Bloki w G91: `X30.` → `Y20.` → `X-10.`. Gdzie stoi frez w G90?", template: "X{0} Y{1}", answers: [["20"], ["20"]], why: "X: 30 − 10 = 20, Y: 20." },
    { kind: "choice", q: "Frez stoi na Z5. Blok `G91 G01 Z-5.`. Gdzie skończy?",
      options: ["Z−5", "Z0", "Z−10", "Z5"], answer: 1, why: "5 − 5 = 0. Przyrost liczy się od bieżącej pozycji." },
    { kind: "choice", q: "Kiedy G91 ma najwięcej sensu?",
      options: ["przy wymiarach tolerowanych od bazy", "przy powtarzalnym wzorze, np. w podprogramie", "zawsze, jest dokładniejszy", "nigdy"], answer: 1,
      why: "Ten sam przyrostowy ruch pasuje w każdym miejscu, z którego się go wywoła." },
    { kind: "choice", q: "Dlaczego w programie płytki po `G91 G28 Z0.` stoi `G90`?",
      options: ["G28 wymaga G90", "żeby dalsze bloki nie liczyły od bieżącej pozycji", "G90 wyłącza wrzeciono", "bez powodu"], answer: 1,
      why: "G91 jest modalne, więc bez G90 kolejne współrzędne byłyby przyrostami." },
  ],

  summary: [
    "G90: cel liczony od zera W. G91: przesunięcie od bieżącej pozycji.",
    "Przyrost = cel − pozycja bieżąca.",
    "G91 do wzorów i odjazdów, G90 do wymiarów z rysunku.",
    "Po G91 wracaj do G90 — tryb jest modalny.",
  ],

  sources: [
    { id: "fanuc", where: "programowanie absolutne i przyrostowe, G90 i G91" },
    { id: "sinumerik", where: "G90 i G91, wymiary AC i IC dla pojedynczej osi" },
  ],
};
