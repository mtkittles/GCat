import type { LessonDoc } from "@/lib/lesson";

const starter = `O1003 (NAWIERCENIE PLYTKI)
G21 G90 G17
G40 G49 G80
G54
T2 M06 (NAWIERTAK FI10 90ST)
G43 H2 Z50.
S1900 M03
M08
(DOPISZ: G82 DLA CZTERECH OTWOROW Z RYSUNKU,
 Z-3. R2. P200 F150, NA KONIEC G80)

M09
M05
M30`;

const cycle = `G82 X10. Y10. Z-3. R2. P200 F150
X70.
Y40.
X10.
G80`;

export const f5_1: LessonDoc = {
  id: "F5.1",
  slug: "f5-1-g81-g82",
  title: "G81 i G82",
  minutes: 15,
  goal: "Zaprogramujesz nawiercanie i wiercenie płytkich otworów cyklem, z płaszczyzną R i postojem na dnie.",

  theory: [
    { t: "h", x: "Jeden otwór — cztery ruchy", id: "po-co" },
    { t: "p", x: "Wiercenie ręcznie to zawsze ta sama sekwencja: ruch szybki nad otwór, szybko w dół nad materiał, posuwem do dna, szybko w górę. Dla czterech otworów to szesnaście bloków. [[cykl stały|Cykl wiercenia]] zamyka całą sekwencję w jednym bloku, a każdy następny otwór to już tylko jego współrzędne." },
    { t: "code", x: "G00 X10. Y10.\nG00 Z2.\nG01 Z-10. F120\nG00 Z50.", caption: "Jeden otwór bez cyklu." },
    { t: "code", x: "G81 X10. Y10. Z-10. R2. F120\nX70.\nY40.\nX10.\nG80", caption: "Cztery otwory cyklem [[G81]]." },

    { t: "h", x: "Przebieg cyklu", id: "przebieg" },
    { t: "diagram", id: "f51-cycle" },
    { t: "table", head: ["Adres", "Znaczenie", "Uwagi"], rows: [
      ["**X Y**", "położenie otworu", "ruch szybki na poziomie początkowym"],
      ["**R**", "płaszczyzna R — wysokość, od której zaczyna się posuw", "zwykle 2–5 mm nad materiałem"],
      ["**Z**", "dno otworu", "przy G90 współrzędna absolutna od W"],
      ["**F**", "posuw wiercenia", "mm/min przy G94"],
      ["**P**", "postój na dnie (tylko G82)", "milisekundy, bez kropki"],
    ] },
    { t: "p", x: "**Poziom początkowy** to Z, na którym narzędzie stało przed cyklem — w programie płytki Z50 z bloku `G43 H2 Z50.`. Na tym poziomie narzędzie przejeżdża między otworami, chyba że wybierzesz inaczej (lekcja F5.4)." },

    { t: "h", x: "Cykl jest modalny", id: "modalny" },
    { t: "p", x: "Po bloku z G81 każdy następny blok z X lub Y wierci otwór w nowym miejscu — Z, R i F obowiązują dalej. [[G80]] kasuje cykl. Bez niego pierwszy ruch po cyklu, nawet przejazd do wymiany narzędzia, zakończy się kolejnym otworem." },

    { t: "h", x: "G82 — z postojem na dnie", id: "g82" },
    { t: "p", x: "[[G82]] działa jak G81, ale na dnie zatrzymuje posuw na czas P, tak jak G04 z lekcji F3.5. Postój wyrównuje dno i fazkę, więc G82 służy do nawiercania, pogłębiania i fazowania otworów." },

    { t: "h", x: "Nawiercenie przed wierceniem", id: "nawiercanie" },
    { t: "p", x: "Nawiertak robi krótki stożek, w który trafia potem wiertło. Wiertło nie ucieka na boki przy wejściu, a otwór ma właściwe położenie. Stożek zostaje jako fazka — pod gwint robi się ją nieco większą niż średnica gwintu." },
    { t: "diagram", id: "f51-spot" },
    { t: "diagram", id: "f51-holes" },
  ],

  worked: {
    title: "Nawiercenie czterech otworów płytki",
    intro: "Nawiertak Ø10 90°, fazka Ø6 pod gwint M6. Otwory: X10 Y10, X70 Y10, X70 Y40, X10 Y40. Z0 na górnej powierzchni.",
    steps: [
      { x: "Głębokość: połowa średnicy fazki, 6 / 2 = 3.", code: "Z-3." },
      { x: "Płaszczyzna R 2 mm nad materiałem, postój 0,2 s, posuw 150 mm/min.", code: "R2. P200 F150" },
      { x: "Pierwszy otwór w bloku cyklu, kolejne — tylko zmieniona współrzędna.", code: "X70. → Y40. → X10." },
      { x: "Skasowanie cyklu.", code: "G80" },
    ],
    result: "`G82 X10. Y10. Z-3. R2. P200 F150`, potem `X70.`, `Y40.`, `X10.` i `G80`. Pięć krótkich bloków zamiast szesnastu.",
  },

  practice: [
    {
      kind: "task",
      intro: "Dopisz cykl nawiercania. Sprawdzany jest tor roboczy (cztery wejścia z R2 do Z−3) i użycie G82 oraz G80.",
      starter,
      checks: [
        { t: "cut", reference: `G90\nG00 Z50.\n${cycle}`, tolerance: 0.05 },
        { t: "require", codes: ["G82", "G80"] },
      ],
      hints: ["Pierwszy blok: G82 X10. Y10. Z-3. R2. P200 F150.", "Dalej X70., Y40., X10. i G80."],
      solution: starter.replace("(DOPISZ: G82 DLA CZTERECH OTWOROW Z RYSUNKU,\n Z-3. R2. P200 F150, NA KONIEC G80)\n", cycle),
    },
    {
      kind: "drill",
      intro: "Adresy cyklu i głębokość fazki.",
      questions: [
        { kind: "token", q: "Tapnij słowo, które podaje **płaszczyznę R**.", block: "G81 X20. Y15. Z-8. R3. F100", answer: 4, why: "R3. — posuw zaczyna się 3 mm nad Z0." },
        { kind: "gap", q: "Nawiertak 90°, fazka Ø8. Podaj Z dna.", template: "Z{0}", answers: [["-4"]], why: "8 / 2 = 4." },
        { kind: "choice", q: "Czym G82 różni się od G81?", options: ["postojem na dnie przez czas P", "wycofaniem co Q", "gwintowaniem", "niczym"], answer: 0, why: "G82 = G81 + postój P." },
      ],
    },
  ],

  pitfalls: [
    { title: "Brak G80 po cyklu", x: "Po ostatnim otworze program jedzie `G00 X-20. Y10.` do następnej operacji. Cykl jest wciąż aktywny, więc w X−20 Y10 powstaje otwór — często w imadle." },
    { title: "Z dodatnie w cyklu", x: "`Z3.` zamiast `Z-3.` — dno nad powierzchnią. Sterowanie zgłosi alarm albo narzędzie nic nie zrobi, zależnie od położenia R." },
    { title: "R poniżej powierzchni", x: "`R-2.` na nierównym odlewie albo przy pomyłce znaku: ruch szybki do R kończy się w materiale. R zawsze nad najwyższym punktem powierzchni." },
    { title: "P z kropką", x: "`P0.2` zamiast `P200`. Na wielu Fanucach P nie przyjmuje kropki — alarm albo postój liczony inaczej, niż zamierzałeś." },
  ],

  controllers: {
    rows: [
      ["Wiercenie", "`G81 X Y Z R F`", "`CYCLE81(RTP, RFP, SDIS, DP)`"],
      ["Z postojem", "`G82 … P`", "`CYCLE82(…, DTB)` — postój w sekundach"],
      ["Kolejne otwory", "same X, Y po bloku cyklu", "`MCALL CYCLE81(…)`, potem pozycje"],
      ["Koniec cyklu", "`G80`", "`MCALL` bez nazwy cyklu"],
    ],
    note: "Sinumerik opisuje otwór innymi parametrami: płaszczyzna odniesienia RFP, odstęp bezpieczeństwa SDIS i płaszczyzna powrotu RTP. Zasada przebiegu jest ta sama.",
  },

  quiz: [
    { kind: "choice", review: "F4.3", q: "Czym włącza się korekcję przy najeździe po łuku?", options: ["odcinkiem przed łukiem", "samym łukiem", "G43", "G80"], answer: 0, why: "Korekcję promienia włącza ruch liniowy." },
    { kind: "choice", q: "Od jakiej wysokości cykl G81 jedzie posuwem?", options: ["od płaszczyzny R", "od poziomu początkowego", "od Z0", "od dna"], answer: 0, why: "Do R ruch szybki, dalej posuw." },
    { kind: "order", q: "Ułóż ruchy cyklu G81.", items: ["posuw do Z", "ruch szybki nad otwór", "ruch szybki w górę", "ruch szybki do R"], answer: [1, 3, 0, 2], why: "XY, R, dno, powrót." },
    { kind: "choice", q: "Po `G81 X10. Y10. Z-10. R2. F120` stoi blok `X40.`. Co się stanie?", options: ["kolejny otwór w X40 Y10", "ruch szybki bez wiercenia", "alarm", "ruch G01"], answer: 0, why: "Cykl jest modalny." },
    { kind: "gap", q: "Nawiertak 90°, fazka Ø10. Z dna:", template: "Z{0}", answers: [["-5"]], why: "10 / 2 = 5." },
    { kind: "token", q: "Tapnij słowo, które podaje **postój na dnie**.", block: "G82 X10. Y10. Z-3. R2. P300 F150", answer: 6, why: "P300 — 0,3 s." },
    { kind: "choice", q: "Po co nawiercać przed wierceniem?", options: ["wiertło nie ucieka i otwór ma właściwe położenie", "żeby otwór był głębszy", "bo wymaga tego G81", "żeby ominąć G80"], answer: 0, why: "Stożek prowadzi wiertło przy wejściu." },
  ],

  summary: [
    "Cykl wiercenia to cztery ruchy w jednym bloku: XY, R, dno, powrót.",
    "R — początek posuwu, Z — dno, F — posuw, P — postój w G82.",
    "Cykl jest modalny: kolejne X, Y to kolejne otwory. G80 go kasuje.",
    "Nawiertak 90°: głębokość = połowa średnicy fazki.",
  ],

  sources: [
    { id: "fanuc", where: "cykle stałe G81 i G82, płaszczyzna R, poziom początkowy, G80" },
    { id: "sinumerik", where: "CYCLE81, CYCLE82, MCALL" },
    { id: "sandvik", where: "nawiercanie i dobór parametrów wiercenia" },
  ],
};
