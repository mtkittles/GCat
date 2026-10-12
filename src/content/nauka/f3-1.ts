import type { LessonDoc } from "@/lib/lesson";

const starter = `O1000 (PLYTKA)
G21 G90 G94 G17
G40 G49 G80
G54
T1 M06
G00 G43 H1 Z50.
S2500 M03
M08
G00 X40. Y25. (NAD SRODKIEM PLYTKI)
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
    { t: "p", x: "Przy niezależnym ruchu osi G00 nie musi prowadzić po odcinku prostym. Osie mogą zakończyć ruch w różnym czasie, a tor punktu programowanego może być łamaną. Zależy to od drogi, prędkości i dynamiki poszczególnych osi oraz ustawień sterowania. W Fanucu 0i-F sposób interpolacji G00 określa parametr 1401#1 LRP; sprawdź konfigurację konkretnej maszyny." },
    { t: "diagram", id: "rapid-path" },

    { t: "h", x: "Bezpieczna kolejność", id: "kolejnosc" },
    { t: "ul", items: [
      "**Najazd:** najpierw XY na [[wysokość bezpieczna|wysokości bezpiecznej]], ponad wszystkimi dociskami i szczękami, potem sam Z w dół — do płaszczyzny zbliżenia, 2–5 mm nad materiałem.",
      "**Odjazd:** najpierw sam Z w górę, dopiero potem XY.",
      "Ostatnie milimetry przed materiałem pokonuje G01 z posuwem (lekcja F3.2).",
    ] },
    { t: "note", kind: "warn", x: "Ruch szybki prowadzący przez materiał może uszkodzić narzędzie, przesunąć detal lub przeciążyć maszynę. Przed uruchomieniem sprawdź cały tor względem [[półfabrykat|półfabrykatu]] i mocowania — sama bezpieczna pozycja końcowa nie zapewnia bezpiecznego przejazdu." },
  ],

  worked: {
    title: "Najazd na start konturu płytki",
    intro: "Sytuacja: frez stoi nad środkiem płytki. Ma przejechać do X−20 Y10 i obniżyć się do Z5. Przy lewej krawędzi znajduje się docisk. Porównaj przejazd w XY na stałej wysokości z jednoczesnym przejazdem i zjazdem w Z.",
    data: [
      ["Profil", "frezarka pionowa, Fanuc 0i-F; G21, G90, G94, G17, G54"],
      ["Zero W", "narożnik konturu gotowego; Z0 na górnej powierzchni"],
      ["Narzędzie", "frez Ø10, poprawnie zmierzona długość; aktywne G43 H1"],
      ["Stan początkowy", "X40 Y25 Z50 — po osobnym ruchu w Z i przejeździe XY"],
      ["Przejazd", "Z50 zapewnia w tym przykładzie prześwit całego zespołu nad zamocowaniem; docisk na schemacie sięga Z9"],
      ["Rysunek", "rzut toru na XZ; czerwone załamanie to poglądowy wariant niezależnego ruchu osi"],
    ],
    fig: "f31-approach",
    steps: [
      { x: "Krok 1 na rysunku: pozostaw Z50 i przejedź w XY ponad przedmiotem i dociskiem.", code: "G00 X-20. Y10." },
      { x: "Sprawdź odstęp. Promień freza to 5 mm, więc krawędź bliższa płytce leży w X−20 + 5 = X−15, a druga w X−25. Płytka zaczyna się w X0 — zostaje 15 mm. Docisk i szczęki sprawdzasz osobno.", code: "−20 + 5 = −15" },
      { x: "Krok 2: teraz sam Z w dół, do płaszczyzny zbliżenia 5 mm nad powierzchnią.", code: "G00 Z5." },
      { x: "Dalej zejście na głębokość — obok płytki, w powietrzu — już z posuwem (lekcja F3.2).", code: "G01 Z-5. F150" },
    ],
    result: "Dwa bloki zamiast jednego. Zapis `G00 X-20. Y10. Z5.` (czerwona linia) jest krótszy, ale tor zależy wtedy od maszyny: oś Z może skończyć wcześniej, a reszta drogi pobiegnie nisko nad dociskiem.",
  },

  practice: [
    {
      kind: "task",
      intro: "Dopisz najazd w miejscu komentarza. Sprawdzany jest cały dojazd: pozycja, kolejność ruchów i to, czy żaden ruch szybki nie łączy XY ze zjazdem w Z. Zapis może być inny niż we wzorcu.",
      starter,
      checks: [
        { t: "approach", x: -20, y: 10, z: 5, label: "Najpierw XY wysoko, potem osobny zjazd w Z — bez wcześniejszego ruchu szybkiego łączącego XY i Z" },
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
        { kind: "choice", q: "W przykładzie zamieniono kolejność: najpierw `G00 Z5.`, potem `G00 X-20. Y10.`. Co się stanie przy drugim bloku?", options: ["frez przeleci 5 mm nad płytką — prosto w docisk wyższy niż 5 mm", "nic, kolejność bloków nie ma znaczenia", "sterowanie samo podniesie frez nad docisk", "frez pojedzie z posuwem roboczym"], answer: 0, why: "Po pierwszym bloku frez jest już na Z5 nad środkiem płytki. Przejazd w XY odbywa się na tej wysokości, a docisk wystaje wyżej — stąd zasada: XY wysoko, potem Z." },
        { kind: "choice", q: "Frez stoi w Z5. nad detalem, ma przejechać w inne miejsce. Co najpierw?", options: ["G00 w XY", "G00 w Z do góry", "G01 w XY", "wszystko w jednym bloku"], answer: 1, why: "Odjazd: najpierw Z w górę, potem XY." },
        { kind: "token", q: "Który blok jest **niebezpieczny** przy imadle obok detalu? Wskaż go.", block: "G00 Z50. | G00 X-20. Y10. | G00 X-20. Y10. Z5.", answer: 2, why: "Ruch ze zjazdem w Z i przejazdem w XY naraz może pójść nisko nad szczękami." },
      ],
    },
  ],

  pitfalls: [
    { title: "Zjazd w Z razem z XY", danger: true, x: "`G00 X-20. Y10. Z5.` przy niezależnym ruchu osi może zejść nisko jeszcze nad detalem i dalej jechać poziomo, prosto na docisk albo szczękę imadła." },
    { title: "G00 zostawione przed skrawaniem", danger: true, x: "Po `G00 Z5.` programista pisze `Z-5.`, zapominając o G01. G00 jest modalne, więc zjazd będzie ruchem szybkim. Nad pełnym materiałem grozi to kolizją; w X−20 z tego przykładu zjazd odbywa się w powietrzu (lekcja F1.2)." },
    { title: "Za niska wysokość bezpieczna", danger: true, x: "Z10 może zapewnić prześwit nad płytką, lecz nie nad śrubą sięgającą Z25. Współrzędną Z zapisujesz względem W; jej wartość dobierasz do najwyższej przeszkody na trasie, gabarytu całego zespołu i wymaganego zapasu." },
    { title: "Pełna prędkość przy pierwszym uruchomieniu", danger: true, x: "Przy szybkim przejeździe operator może nie zdążyć zareagować na błąd. Pierwsze uruchomienie wykonuj według procedury maszyny, z ograniczonym ruchem szybkim i pracą blok po bloku. 25% jest przykładem ustawienia korektora, nie gwarancją bezpieczeństwa." },
  ],

  controllers: {
    rows: [
      ["Ruch szybki", "`G00`", "`G0`"],
      ["Tor przy ruchu szybkim", "parametr: po prostej albo niezależne osie", "`RTLION` po prostej, `RTLIOF` niezależne osie"],
      ["Prędkość", "parametry maszyny + korektor", "dane maszynowe + korektor"],
    ],
    note: "Na obu sterowaniach tor ruchu szybkiego zależy od ustawień. Osobny ruch w XY i osobny w Z daje tor, który nie zależy od tego ustawienia. Nie zastępuje to sprawdzenia całego zespołu narzędziowego, zamocowania i zakresów osi.",
  },

  quiz: [
    { kind: "choice", review: "F2.4", q: "Gdzie stoi `M08`?", options: ["po włączeniu obrotów, przed najazdem", "przed M06", "po M30", "w bloku startowym"], answer: 0, why: "Chłodziwo ma płynąć przed dotknięciem materiału." },
    { kind: "choice", q: "Z jaką prędkością jedzie `G00 X100.`?", options: ["z posuwem F", "z maksymalną prędkością osi z parametrów, pomnożoną przez korektor", "zawsze 10 m/min", "z prędkością ostatniego G01"], answer: 1, why: "G00 nie używa F." },
    { kind: "choice", q: "W jakiej kolejności bezpiecznie najechać nad detal?", options: ["Z w dół, potem XY", "XY wysoko, potem Z w dół", "XY i Z razem", "kolejność nie ma znaczenia"], answer: 1, why: "Najpierw XY na wysokości bezpiecznej, potem sam Z." },
    { kind: "choice", q: "Dlaczego tor `G00` może nie być odcinkiem prostym?", options: ["osie mogą jechać niezależnie, każda z pełną prędkością", "G00 zawsze jedzie po łuku", "przez korektor posuwu", "przez G17"], answer: 0, why: "Przy niezależnym ruchu osie mogą zakończyć przejazd w różnym czasie. Decydują także ich prędkości i dynamika, nie sama długość drogi." },
    { kind: "choice", q: "Frez stoi nad pełnym materiałem. Po `G00 Z5.` zapisano `Z-5.`. Co się stanie?", options: ["zejście z posuwem F", "zejście ruchem szybkim w materiał", "alarm", "nic"], answer: 1, why: "G00 jest modalne. Bez jawnego G01 zjazd pozostaje ruchem szybkim; w tym położeniu prowadzi w materiał." },
    { kind: "gap", q: "Frez Ø10 ma przejechać obok detalu tak, by jego krawędź była 10 mm od lewej krawędzi detalu (X0). Jaki X środka?", template: "X{0}", answers: [["-15"]], why: "Krawędź w X−10, środek dalej o promień: −10 − 5 = −15." },
    { kind: "choice", q: "Co wyznacza najmniejszą wysokość przejazdu ruchem szybkim?", options: ["górna powierzchnia detalu", "najwyższa przeszkoda na trasie przejazdu, z zapasem", "położenie zera maszyny", "samo Z0 detalu"], answer: 1, why: "Wartość Z zapisujesz względem zera W, ale dobierasz ją tak, żeby cały zespół narzędziowy przeszedł z zapasem nad najwyższą przeszkodą na trasie — dociskiem, szczęką, śrubą." },
  ],

  summary: [
    "G00 to przejazd w powietrzu z maksymalną prędkością osi. F nie działa.",
    "Tor G00 może być łamaną — zależy od parametru maszyny.",
    "Najazd: XY wysoko, potem Z. Odjazd: Z, potem XY.",
    "Do materiału nigdy G00 — ostatnie milimetry z posuwem.",
  ],

  sources: [
    { id: "fanuc", where: "pozycjonowanie G00, interpolacja liniowa i nieliniowa przy ruchu szybkim, korektor", loc: "rozdz. 3.1, tab. 3.1, s. 71; rozdz. 4, s. 79; parametr 1401#1 LRP — rozdz. 7.2.11, s. 171" },
    { id: "sinumerik", where: "G0, RTLION i RTLIOF" },
  ],
};
