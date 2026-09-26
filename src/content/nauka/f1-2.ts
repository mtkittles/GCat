import type { LessonDoc } from "@/lib/lesson";

export const f1_2: LessonDoc = {
  id: "F1.2",
  slug: "f1-2-modalnosc",
  title: "Modalność",
  minutes: 12,
  goal: "Rozpoznasz słowa modalne i jednorazowe i odczytasz, co jest aktywne w dowolnej linii programu.",

  theory: [
    { t: "h", x: "Słowa, które zostają", id: "zostaja" },
    { t: "p", x: "Większość kodów G, a także F i S, to [[funkcja modalna|funkcje modalne]]: po wywołaniu działają w kolejnych blokach, dopóki nie zastąpi ich inne słowo z tej samej grupy. Dzięki temu nie trzeba powtarzać `G01` i `F200` w każdej linii." },
    { t: "diagram", id: "f12-carry" },
    { t: "code", x: "G01 X10. Y0. F200\nG01 X50. Y0. F200\nG01 X50. Y30. F200", caption: "Pełny zapis." },
    { t: "code", x: "G01 X10. Y0. F200\nX50.\nY30.", caption: "To samo krócej. Współrzędna, która się nie zmienia, też nie musi być powtarzana." },

    { t: "h", x: "Grupy", id: "grupy" },
    { t: "p", x: "Kody G są podzielone na grupy. W każdej grupie aktywny jest dokładnie jeden kod, a nowy wyłącza poprzedni. Kody z różnych grup mogą stać w jednym bloku." },
    { t: "table", head: ["Grupa", "Kody", "Co wybiera"], rows: [
      ["ruch", "`G00` `G01` `G02` `G03`", "rodzaj ruchu"],
      ["wymiary", "`G90` `G91`", "absolutne czy przyrostowe"],
      ["płaszczyzna", "`G17` `G18` `G19`", "płaszczyzna łuków i korekcji"],
      ["jednostki", "`G20` `G21`", "cale czy milimetry"],
      ["układ", "`G54`–`G59`", "zero detalu"],
      ["korekcja promienia", "`G40` `G41` `G42`", "strona konturu"],
    ], caption: "Fanuc numeruje grupy (01 — ruch, 02 — płaszczyzna, 03 — wymiary…). Numeracja różni się między sterowaniami, zasada jest ta sama." },

    { t: "h", x: "Słowa jednorazowe", id: "jednorazowe" },
    { t: "p", x: "Niektóre kody działają tylko w swoim bloku: `G04` (postój), `G28` (najazd na punkt referencyjny), `G53` (ruch w układzie maszyny). W następnym bloku znowu obowiązuje to, co było aktywne wcześniej." },

    { t: "h", x: "Stan po włączeniu", id: "stan" },
    { t: "p", x: "Po włączeniu sterowanie ustawia stan domyślny, np. `G17`, `G90`, `G54` i `G00` albo `G01`. Który dokładnie — decydują parametry maszyny. Stan może też zostać zmieniony przez poprzedni program albo operatora. Dlatego każdy program ustawia potrzebne tryby sam, w pierwszych blokach (lekcja F1.5)." },
  ],

  worked: {
    title: "Ustal stan w linii 5",
    intro: "Fragment programu płytki: (1) `G90 G54 G17`, (2) `G00 X-20. Y10.`, (3) `Z5.`, (4) `G01 Z-5. F150`, (5) `X-5. F400`. Co obowiązuje w linii 5?",
    steps: [
      { x: "Ruch: ostatni kod z grupy ruchu przed linią 5 to G01 z linii 4.", code: "G01" },
      { x: "Posuw: linia 5 sama podaje F400, które zastępuje F150.", code: "F400" },
      { x: "Wymiary i układ: G90 i G54 z linii 1, nic ich nie zmieniło.", code: "G90 G54" },
      { x: "Pozycja: X z linii 5, Y z linii 2, Z z linii 4.", code: "X−5 Y10 Z−5" },
    ],
    result: "W linii 5 frez jedzie ruchem roboczym z F400 do X−5, a Y10 i Z−5 zostają z wcześniejszych bloków.",
  },

  practice: [
    {
      kind: "state",
      intro: "Tapnij dowolną linię, żeby zobaczyć stan sterowania po jej wykonaniu. Wyróżnione pola zmieniły się właśnie w tej linii.",
      program: "G90 G54 G17\nT1 M06\nS2500 M03\nG00 X-20. Y10.\nZ5.\nG01 Z-5. F150\nX-5. F400\nY40.\nG02 X10. Y55. R15.\nG01 X70.\nG00 Z5.\nG91 G28 Z0.\nG90\nM05",
    },
    {
      kind: "drill",
      intro: "Sprawdź, czy przewidzisz stan bez podglądu.",
      questions: [
        { kind: "choice", q: "Po `G01 Z-5. F150` stoi blok `X-5.`. Jakim ruchem pojedzie frez?",
          options: ["G00", "G01 z F150", "alarm — brak G w bloku", "G01 bez posuwu"], answer: 1, why: "G01 i F150 są modalne i obowiązują dalej." },
        { kind: "token", q: "W bloku `X-5. F400` tapnij słowo, które **zmienia stan modalny**.", block: "X-5. F400", answer: 1,
          why: "F400 zastępuje poprzedni posuw. X-5. to tylko cel ruchu." },
        { kind: "token", q: "Tapnij słowo, które działa **tylko w swoim bloku**.", block: "G91 G28 Z0.", answer: 1,
          why: "G28 jest jednorazowe. G91 zostaje aktywne — dlatego w programie płytki zaraz potem stoi G90." },
        { kind: "choice", q: "Fanuc, blok `G00 G01 X10.`. Który kod zadziała?",
          options: ["G00", "G01 — ostatni z tej samej grupy", "oba po kolei", "żaden"], answer: 1,
          why: "Fanuc wykonuje ostatni kod z grupy. Taki zapis to jednak prawie zawsze pomyłka." },
      ],
    },
  ],

  pitfalls: [
    { title: "Zapomniany tryb z poprzedniej linii", x: "Po `G00 Z5.` programista dopisuje `X30.`, myśląc o skrawaniu. Frez pojedzie ruchem szybkim, bo G00 wciąż działa. Przed każdym wejściem w materiał sprawdź, jaki ruch jest aktywny." },
    { title: "Stan zostawiony przez poprzedni program", x: "Program skończył się w `G91` albo z włączoną korekcją `G41`. Część sterowań nie przywraca wszystkich trybów domyślnych po M30 lub resecie, a następny program bez bloku startowego je przejmie." },
    { title: "Posuw poprzedniego narzędzia", x: "F jest modalne. Po wymianie narzędzia bez nowego F frez jedzie z posuwem ustawionym dla poprzedniego narzędzia." },
    { title: "Dwa kody z jednej grupy w bloku", x: "`G00 G01` w jednym bloku: Fanuc weźmie ostatni, inne sterowania mogą zgłosić alarm. W bloku stawiaj najwyżej jeden kod z każdej grupy." },
  ],

  controllers: {
    rows: [
      ["Grupy kodów G", "numerowane: 01 ruch, 02 płaszczyzna, 03 wymiary…", "opisane w tabeli funkcji G w dokumentacji"],
      ["Stan po włączeniu", "ustawiany parametrami", "ustawiany danymi maszynowymi"],
      ["Podgląd aktywnych kodów", "ekran z aktywnymi kodami G (MODAL)", "okno aktywnych funkcji G"],
    ],
    note: "Zasada modalności jest wspólna. Różnią się stany domyślne — tryby zawsze ustawia program.",
  },

  quiz: [
    { kind: "choice", review: "F1.1", q: "`X60` bez kropki na Sinumeriku to:",
      options: ["60 mm", "0,060 mm", "zależy od parametru", "błąd składni"], answer: 0, why: "Sinumerik czyta wartość bez kropki jako milimetry." },
    { kind: "choice", q: "Co znaczy, że `G01` jest modalne?",
      options: ["działa tylko w swoim bloku", "działa, dopóki nie zastąpi go inny kod z tej samej grupy", "działa do końca programu bez względu na inne kody", "musi stać w każdym bloku ruchu"], answer: 1,
      why: "Modalny kod obowiązuje aż do zmiany w obrębie swojej grupy." },
    { kind: "choice", q: "Program: `G01 X10. F200` → `G00 Z5.` → `X0.`. Jakim ruchem wykona się ostatni blok?",
      options: ["G01 z F200", "G00", "alarm — brak G", "G01 bez posuwu"], answer: 1, why: "G00 z drugiego bloku zastąpiło G01." },
    { kind: "gap", q: "Program: `G01 X10. F200` → `Y20.` → `X40. F350` → `Y0.`. Jaki posuw obowiązuje w ostatnim bloku?",
      template: "F{0}", answers: [["350"]], why: "F350 z trzeciego bloku zastąpiło F200 i obowiązuje dalej." },
    { kind: "token", q: "Tapnij słowo, które działa **tylko w tym bloku**.", block: "G90 G04 X2.", answer: 1,
      why: "G04 to postój jednorazowy. G90 jest modalne." },
    { kind: "choice", q: "Które kody mogą stać razem w jednym bloku?",
      options: ["`G00 G01`", "`G90 G91`", "`G90 G54 G17`", "`G17 G18`"], answer: 2, why: "G90, G54 i G17 należą do trzech różnych grup." },
    { kind: "choice", q: "Dlaczego program ustawia tryby w pierwszych blokach zamiast polegać na stanie sterowania?",
      options: ["tak wymaga ISO 841", "stan mógł zmienić poprzedni program albo operator", "bez tego sterowanie nie wczyta programu", "bez powodu"], answer: 1,
      why: "Stan modalny przechodzi między programami i zależy od parametrów." },
  ],

  summary: [
    "Modalne słowo działa, dopóki nie zastąpi go słowo z tej samej grupy.",
    "W grupie aktywny jest zawsze jeden kod. Kody z różnych grup łączysz w jednym bloku.",
    "`G04`, `G28` i `G53` działają tylko w swoim bloku.",
    "Nie polegaj na stanie sterowania — tryby ustawia program.",
  ],

  sources: [
    { id: "fanuc", where: "grupy kodów G, kody modalne i jednorazowe, stan po włączeniu" },
    { id: "sinumerik", where: "tabela funkcji G, działanie modalne i blokowe" },
  ],
};
