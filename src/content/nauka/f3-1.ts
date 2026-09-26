import type { LessonDoc } from "@/lib/lesson";

const starter = `O1000 (PLYTKA)
G21 G90 G17
G40 G49 G80
G54
T1 M06
S2500 M03
M08
G00 X40. Y25. Z50. (NAD SRODKIEM PLYTKI)
(DOPISZ NAJAZD NAD X-20 Y10 I ZJAZD NA Z5)

M09
M05
M30`;

export const f3_1: LessonDoc = {
  id: "F3.1",
  slug: "f3-1-g00-ruch-szybki",
  title: "G00 — ruch szybki",
  minutes: 13,
  goal: "Zaprogramujesz bezpieczny najazd i odjazd ruchem szybkim, w kolejności, która nie prowadzi przez imadło.",

  theory: [
    { t: "h", x: "Najszybciej, jak maszyna potrafi", id: "szybko" },
    { t: "p", x: "[[G00]] przesuwa narzędzie z maksymalną prędkością osi, zapisaną w parametrach maszyny — zwykle 20–50 m/min. Adres F nie ma tu znaczenia. Operator może ograniczyć ruch szybki korektorem, np. do 25% przy pierwszym uruchomieniu programu." },
    { t: "p", x: "G00 służy wyłącznie do przejazdów w powietrzu: dojazd nad miejsce pracy, odjazd, przejście między operacjami. Każdy ruch w materiale to G01, G02 albo G03 z posuwem." },

    { t: "h", x: "Tor nie zawsze jest prosty", id: "tor" },
    { t: "p", x: "Na wielu maszynach przy G00 każda oś jedzie niezależnie, z własną pełną prędkością. Oś z krótszą drogą kończy wcześniej, a narzędzie dojeżdża do celu po łamanej, a nie po odcinku. Czy tak jest na Twojej maszynie, decyduje parametr sterowania." },
    { t: "diagram", id: "rapid-path" },
    { t: "diagram", id: "f31-approach" },

    { t: "h", x: "Bezpieczna kolejność", id: "kolejnosc" },
    { t: "ul", items: [
      "**Najazd:** najpierw XY na [[wysokość bezpieczna|wysokości bezpiecznej]], ponad wszystkimi dociskami i szczękami, potem sam Z w dół — do płaszczyzny zbliżenia, 2–5 mm nad materiałem.",
      "**Odjazd:** najpierw sam Z w górę, dopiero potem XY.",
      "Ostatnie milimetry przed materiałem pokonuje G01 z posuwem (lekcja F3.2).",
    ] },
    { t: "note", kind: "warn", x: "Nigdy G00 w materiał. Nawet 1 mm wejścia ruchem szybkim łamie narzędzie albo przesuwa detal w imadle." },
  ],

  worked: {
    title: "Najazd na start konturu płytki",
    intro: "Frez Ø10 stoi w X40. Y25. Z50., nad środkiem płytki. Kontur zaczyna się obok lewej krawędzi, w X−20 Y10.",
    steps: [
      { x: "Zostaw Z50 i przejedź w XY. Frez leci wysoko nad detalem i dociskami.", code: "G00 X-20. Y10." },
      { x: "Sprawdź odstęp: środek freza w X−20, jego krawędź w X−15 — 15 mm od detalu.", code: "X−20 − 5 = −15" },
      { x: "Teraz sam Z w dół, do płaszczyzny zbliżenia 5 mm nad powierzchnią.", code: "G00 Z5." },
      { x: "Dalej zejście w materiał już z posuwem — lekcja F3.2.", code: "G01 Z-5. F150" },
    ],
    result: "Dwa bloki zamiast jednego. Zapis `G00 X-20. Y10. Z5.` jest krótszy, ale tor zależy wtedy od parametru maszyny i może przejść nisko nad dociskami.",
  },

  practice: [
    {
      kind: "task",
      intro: "Dopisz najazd w miejscu komentarza. Sprawdzanie ocenia pozycję i kolejność ruchów, a nie identyczny zapis.",
      starter,
      checks: [
        { t: "approach", x: -20, y: 10, z: 5, label: "Najpierw XY wysoko, potem osobny zjazd w Z" },
        { t: "end", x: -20, y: 10, z: 5, label: "Narzędzie kończy nad X−20 Y10 na Z5" },
        { t: "forbid", codes: ["G01"] },
      ],
      hints: ["Pierwszy blok: G00 z samymi X i Y. Z zostaje na 50.", "Drugi blok: G00 z samym Z."],
      solution: starter.replace("(DOPISZ NAJAZD NAD X-20 Y10 I ZJAZD NA Z5)\n", "G00 X-20. Y10.\nG00 Z5."),
    },
    {
      kind: "drill",
      intro: "Krótkie pytania o ruch szybki.",
      questions: [
        { kind: "choice", q: "Frez stoi w Z5. nad detalem, ma przejechać w inne miejsce. Co najpierw?", options: ["G00 w XY", "G00 w Z do góry", "G01 w XY", "wszystko w jednym bloku"], answer: 1, why: "Odjazd: najpierw Z w górę, potem XY." },
        { kind: "token", q: "Który blok jest **niebezpieczny** przy imadle obok detalu? Tapnij go.", block: "G00 Z50. | G00 X-20. Y10. | G00 X-20. Y10. Z5.", answer: 2, why: "Ruch ze zjazdem w Z i przejazdem w XY naraz może pójść nisko nad szczękami." },
      ],
    },
  ],

  pitfalls: [
    { title: "Zjazd w Z razem z XY", x: "`G00 X-20. Y10. Z5.` przy niezależnym ruchu osi schodzi nisko jeszcze nad detalem i dalej jedzie poziomo, prosto na docisk albo szczękę imadła." },
    { title: "G00 zostawione przed skrawaniem", x: "Po `G00 Z5.` programista pisze `Z-5.`, zapominając o G01. G00 jest modalne, więc frez wejdzie w materiał ruchem szybkim (lekcja F1.2)." },
    { title: "Za niska wysokość bezpieczna", x: "Z10 wystarcza nad płytką, ale nie nad śrubą docisku wystającą 25 mm. Wysokość bezpieczna liczy się od najwyższej przeszkody na stole, a nie od detalu." },
    { title: "Pełna prędkość przy pierwszym uruchomieniu", x: "Nowy program odpalony z korektorem ruchu szybkiego na 100% nie daje czasu na reakcję. Pierwsza sztuka: 25% i praca blok po bloku." },
  ],

  controllers: {
    rows: [
      ["Ruch szybki", "`G00`", "`G0`"],
      ["Tor przy ruchu szybkim", "parametr: po prostej albo niezależne osie", "`RTLION` po prostej, `RTLIOF` niezależne osie"],
      ["Prędkość", "parametry maszyny + korektor", "dane maszynowe + korektor"],
    ],
    note: "Na obu sterowaniach tor ruchu szybkiego zależy od ustawień. Program bezpieczny na każdej maszynie rozdziela ruch w XY i w Z.",
  },

  quiz: [
    { kind: "choice", review: "F2.4", q: "Gdzie stoi `M08`?", options: ["po włączeniu obrotów, przed najazdem", "przed M06", "po M30", "w bloku startowym"], answer: 0, why: "Chłodziwo ma płynąć przed dotknięciem materiału." },
    { kind: "choice", q: "Z jaką prędkością jedzie `G00 X100.`?", options: ["z posuwem F", "z maksymalną prędkością osi z parametrów, pomnożoną przez korektor", "zawsze 10 m/min", "z prędkością ostatniego G01"], answer: 1, why: "G00 nie używa F." },
    { kind: "choice", q: "Najazd nad detal w bezpiecznej kolejności:", options: ["Z w dół, potem XY", "XY wysoko, potem Z w dół", "XY i Z razem", "kolejność nie ma znaczenia"], answer: 1, why: "Najpierw XY na wysokości bezpiecznej, potem sam Z." },
    { kind: "choice", q: "Dlaczego tor `G00` może nie być odcinkiem prostym?", options: ["osie mogą jechać niezależnie, każda z pełną prędkością", "G00 zawsze jedzie po łuku", "przez korektor posuwu", "przez G17"], answer: 0, why: "Oś z krótszą drogą kończy wcześniej." },
    { kind: "choice", q: "Po `G00 Z5.` stoi blok `Z-5.`. Co się stanie?", options: ["zejście z posuwem F", "zejście ruchem szybkim w materiał", "alarm", "nic"], answer: 1, why: "G00 jest modalne. Przed wejściem w materiał musi paść G01." },
    { kind: "gap", q: "Frez Ø10 ma przejechać obok detalu tak, by jego krawędź była 10 mm od lewej krawędzi detalu (X0). Jaki X środka?", template: "X{0}", answers: [["-15"]], why: "Krawędź w X−10, środek dalej o promień: −10 − 5 = −15." },
    { kind: "choice", q: "Od czego liczy się wysokość bezpieczna?", options: ["od górnej powierzchni detalu", "od najwyższej przeszkody na stole", "od zera maszyny", "od Z0"], answer: 1, why: "Ruch szybki musi przejść ponad dociskami i szczękami." },
  ],

  summary: [
    "G00 to przejazd w powietrzu z maksymalną prędkością osi. F nie działa.",
    "Tor G00 może być łamaną — zależy od parametru maszyny.",
    "Najazd: XY wysoko, potem Z. Odjazd: Z, potem XY.",
    "Do materiału nigdy G00 — ostatnie milimetry z posuwem.",
  ],

  sources: [
    { id: "fanuc", where: "pozycjonowanie G00, interpolacja liniowa i nieliniowa przy ruchu szybkim, korektor" },
    { id: "sinumerik", where: "G0, RTLION i RTLIOF" },
  ],
};
