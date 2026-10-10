import type { LessonDoc } from "@/lib/lesson";

const starter = `O1000 (PLYTKA)
G21 G90 G94 G17
G40 G49 G80
G54
T1 M06
S2500 M03
M08
G00 X40. Y25. Z50.
G00 X-20. Y10.
G00 Z5.
(DOPISZ: ZEJSCIE NA Z-5, DOJAZD DO X-5 I OBIEG KONTURU)

G00 Z5.
M09
M05
M30`;

const cut = `G01 Z-5. F150
G01 X-5. F400
G01 Y55.
G01 X85.
G01 Y-5.
G01 X-5.
G01 Y10.`;

export const f3_2: LessonDoc = {
  id: "F3.2",
  slug: "f3-2-g01-interpolacja-liniowa",
  title: "G01 — interpolacja liniowa",
  minutes: 14,
  goal: "Zaprogramujesz wejście w materiał i kontur z odcinków prostych, prowadząc środek freza w odległości promienia od detalu.",

  theory: [
    { t: "h", x: "Ruch po prostej z posuwem", id: "g01" },
    { t: "p", x: "[[G01]] prowadzi narzędzie po odcinku prostym z posuwem F. Wszystkie osie podane w bloku ruszają i kończą razem, więc tor jest prosty także przy ruchu ukośnym albo w trzech osiach naraz. To podstawowy ruch skrawający." },
    { t: "diagram", id: "g01" },
    { t: "p", x: "G01 potrzebuje posuwu. Jeśli w programie nie padło jeszcze żadne F, pierwszy blok G01 kończy się alarmem. Dalej F jest modalne — obowiązuje, dopóki nie wpiszesz nowego." },

    { t: "h", x: "Wejście w materiał", id: "wejscie" },
    { t: "p", x: "Zejście na głębokość programuje się obok detalu, w powietrzu, z posuwem zmniejszonym dla ostrzy czołowych (lekcja F2.3). W programie płytki frez schodzi w X−20, 15 mm od krawędzi, na `Z-5.` z `F150`, i dopiero potem dojeżdża do konturu z `F400`." },

    { t: "h", x: "Tor środka freza", id: "tor-srodka" },
    { t: "p", x: "Program prowadzi **środek** narzędzia. Żeby frez Ø10 obrobił krawędź płytki, jego środek musi jechać 5 mm od niej — o promień na zewnątrz. Kontur 80 × 50 daje tor środka od X−5 do X85 i od Y−5 do Y55. Lekcja F4.2 pokaże, jak przerzucić to przesunięcie na sterowanie." },
    { t: "table", head: ["Krawędź detalu", "Tor środka", "Blok"], rows: [
      ["lewa, X0", "X−5", "`G01 Y55.`"],
      ["górna, Y50", "Y55", "`G01 X85.`"],
      ["prawa, X80", "X85", "`G01 Y-5.`"],
      ["dolna, Y0", "Y−5", "`G01 X-5.`"],
    ] },
    { t: "p", x: "Kierunek obiegu zgodny z ruchem wskazówek zegara przy obrotach M03 daje [[frezowanie współbieżne]] — lepszą powierzchnię i dłuższą trwałość ostrza przy obróbce konturu zewnętrznego." },
    { t: "demo", mode: "mill", title: "Kontur płytki z odcinków", src: "G21 G90 G94 G17 G54\nG00 X-20. Y10. Z50.\nG00 Z5.\nG01 Z-5. F150\nG01 X-5. F400\nY55.\nX85.\nY-5.\nX-5.\nY10.\nG00 Z5.\nM30",
      caption: "Zielone odcinki to G01, bursztynowe przerywane — G00." },
  ],

  worked: {
    title: "Policz tor środka dla konturu płytki",
    intro: "Sytuacja: płytka 80 × 50, zero W w lewym dolnym narożniku. Frez Ø10 (r = 5) zszedł obok płytki w X−20 Y10 na Z−5. Ma obejść cały obwód zgodnie z zegarem. Program podaje środek freza, a rysunek ma wymiary krawędzi — trzeba je przeliczyć. Numery odpowiadają krawędziom na rysunku.",
    fig: "f32-path",
    steps: [
      { x: "Krok 1, lewa krawędź X0: frez na zewnątrz, czyli 0 − 5.", code: "X-5." },
      { x: "Krok 2, górna krawędź Y50: 50 + 5.", code: "Y55." },
      { x: "Krok 3, prawa krawędź X80: 80 + 5.", code: "X85." },
      { x: "Krok 4, dolna krawędź Y0: 0 − 5.", code: "Y-5." },
    ],
    result: "Obieg: `Y55.` → `X85.` → `Y-5.` → `X-5.` → `Y10.` (domknięcie do punktu wejścia). Naroża toru są ostre — detal też. Zaokrąglenia R10 doda lekcja F3.3.",
  },

  practice: [
    {
      kind: "task",
      intro: "Dopisz zejście, dojazd i obieg konturu w miejscu komentarza. Sprawdzanie porównuje tor roboczy z wzorcem — kolejność bloków i kierunek obiegu możesz wybrać sam.",
      starter,
      checks: [
        { t: "cut", reference: `G90\nG00 X-20. Y10.\nG00 Z5.\n${cut}\nG00 Z5.`, tolerance: 0.05 },
        { t: "require", codes: ["G01"] },
      ],
      hints: ["Zejście: G01 Z-5. F150 — frez stoi już nad X−20 Y10.", "Kontur: X−5, potem Y55, X85, Y−5, X−5 i powrót do Y10. Posuw F400 wpisz w pierwszym bloku konturu."],
      solution: starter.replace("(DOPISZ: ZEJSCIE NA Z-5, DOJAZD DO X-5 I OBIEG KONTURU)\n", cut),
    },
    {
      kind: "drill",
      intro: "Przewidź, zanim uruchomisz symulator.",
      questions: [
        { kind: "choice", q: "W obiegu z przykładu pomylono znak: zamiast `Y-5.` jest `Y5.`. Co się stanie na prawej krawędzi i potem?", options: ["frez zatrzyma się w X85 Y5, a powrót do X−5 przetnie płytkę na głębokości 5 mm", "nic, sterowanie poprawi znak", "frez obejdzie płytkę 10 mm wyżej", "alarm — ujemny wymiar"], answer: 0, why: "Środek w Y5 to 5 mm nad krawędzią Y0, więc frez Ø10 sięga Y0–Y10. Ruch w X wzdłuż Y5 przechodzi przez materiał płytki — zamiast obejścia jest cięcie." },
      ],
    },
  ],

  pitfalls: [
    { title: "G01 bez F", x: "Pierwszy G01 w programie bez posuwu: alarm. Gorzej, gdy F zostało z poprzedniego narzędzia — maszyna pojedzie, ale z posuwem, który do tego narzędzia nie pasuje." },
    { title: "Zapomniany promień", x: "Tor poprowadzony po samym konturze, X0…X80, a nie X−5…X85. Frez zbiera po 5 mm z każdej strony i detal wychodzi 10 mm mniejszy." },
    { title: "Wejście nad detalem", danger: true, x: "`G01 Z-5.` wpisane, gdy frez stoi nad płytką, a nie obok niej. Frez wchodzi pionowo w pełny materiał — wiele frezów nie ma ostrza przez środek i tak nie skrawa." },
    { title: "Wejście z posuwem konturowym", danger: true, x: "Jedno F400 dla całego ruchu, także dla zejścia w Z. Ostrza czołowe są przeciążone." },
  ],

  controllers: {
    rows: [
      ["Interpolacja liniowa", "`G01`", "`G1`"],
      ["Posuw", "`F` w mm/min przy G94", "`F` w mm/min przy G94"],
      ["Faza i zaokrąglenie w bloku", "`,C` i `,R` — opcja sterowania", "`CHF=` / `CHR=` i `RND=`"],
    ],
    note: "Ruch liniowy działa tak samo. Sinumerik ma wbudowane fazowanie i zaokrąglanie naroży w bloku, na Fanucu to funkcja opcjonalna.",
  },

  quiz: [
    {"kind":"bughunt","q":"Pierwszy ruch roboczy w programie. Który blok zgłosi alarm?","program":"G00 X-20. Y10.\nG00 Z5.\nG01 Z-5.\nG01 X-5. F400\nG01 Y55.","answer":2,"why":"Pierwszy G01 bez posuwu F — sterowanie nie wie, jak szybko zejść i zgłasza alarm. Zejście potrzebuje własnego F, np. F150."},
    {"kind":"choice","q":"Gdzie skończy frez po tym fragmencie?","code":"G90 G00 X10. Y10. Z5.\nG01 Z-2. F100\nX40.\nY30.\nG00 Z5.","options":["X40 Y30 Z5","X40 Y30 Z−2","X10 Y30 Z5","X40 Y10 Z5"],"answer":0,"why":"Bloki `X40.` i `Y30.` dziedziczą G01; ostatni blok podnosi Z do 5, X i Y zostają."},

    { kind: "choice", review: "F3.1", q: "Po `G00 Z5.` programista chce zejść na Z−5. Który blok?", options: ["`Z-5.`", "`G01 Z-5. F150`", "`G00 Z-5.`", "`G28 Z-5.`"], answer: 1, why: "Bez G01 obowiązuje G00 z poprzedniego bloku." },
    { kind: "choice", q: "Czym G01 różni się od G00?", options: ["jedzie z posuwem F po odcinku prostym", "jedzie szybciej", "działa tylko w Z", "nie wymaga współrzędnych"], answer: 0, why: "G01 to ruch roboczy z posuwem." },
    { kind: "gap", q: "Frez Ø12, prawa krawędź detalu w X60. Jaki X środka dla obróbki tej krawędzi z zewnątrz?", template: "X{0}", answers: [["66"]], why: "60 + 6 = 66." },
    { kind: "choice", q: "Program bez żadnego F ma blok `G01 X50.`. Co się stanie?", options: ["alarm — brak posuwu", "ruch z maksymalną prędkością", "ruch z F100", "ruch G00"], answer: 0, why: "G01 wymaga posuwu." },
    { kind: "choice", q: "Obieg konturu zewnętrznego zgodnie z zegarem przy M03 — jakie to frezowanie?", options: ["frezowanie współbieżne", "frezowanie przeciwbieżne", "wiercenie", "bez znaczenia"], answer: 0, why: "Ostrze wchodzi w materiał od najgrubszego wióra." },
    { kind: "token", q: "Wskaż blok, który **wchodzi w materiał**.", block: "G00 Z5. | G01 Z-5. F150 | G01 X-5. F400", answer: 1, why: "Zejście na Z−5 z posuwem wgłębnym." },
    { kind: "choice", q: "Program prowadzi środek freza Ø10 po samym konturze X0…X80. Jaki wyjdzie detal?", options: ["o 10 mm krótszy", "o 5 mm krótszy", "w wymiarze", "o 10 mm dłuższy"], answer: 0, why: "Frez zbiera promień z każdej strony: 2 × 5 = 10 mm." },
  ],

  summary: [
    "G01 — odcinek prosty z posuwem F. Wszystkie osie ruszają i kończą razem.",
    "Pierwsze G01 potrzebuje F, dalej F jest modalne.",
    "Wejście w Z obok detalu, z mniejszym posuwem.",
    "Program prowadzi środek freza — o promień od krawędzi detalu.",
  ],

  sources: [
    { id: "fanuc", where: "interpolacja liniowa G01, posuw" },
    { id: "sinumerik", where: "G1, CHF/CHR i RND" },
    { id: "sandvik", where: "frezowanie współbieżne i przeciwbieżne" },
  ],
};
