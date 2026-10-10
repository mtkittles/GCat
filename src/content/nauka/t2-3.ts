import type { LessonDoc } from "@/lib/lesson";

const head = `O2001 (WALEK - PLANOWANIE)
G18 G21 G40 G80 G99
G54
T0101 (NOZ ZEWN. CNMG R0.8)
G50 S3000
G96 S200 M03
M08`;

const face = `G00 X44. Z0.
G01 X-1.6 F0.15
G00 Z2.`;

const starter = `${head}
(DOPISZ PLANOWANIE CZOLA: DOJAZD NA Z0 POZA PRETEM,
 PRZEJSCIE PRZEZ OS Z F0.15, ODJAZD OD CZOLA)

M09
M05
G28 U0.
G28 W0.
M30`;

export const t2_3: LessonDoc = {
  id: "T2.3",
  slug: "t2-3-posuw-na-obrot",
  title: "Posuw na obrót: G99 i G95",
  minutes: 14,
  goal: "Dobierzesz posuw na obrót do obróbki zgrubnej i wykańczającej, oszacujesz chropowatość i splanujesz czoło wałka.",

  theory: [
    { t: "h", x: "Posuw na obrót", id: "posuw" },
    { t: "p", x: "Na tokarce posuw podaje się zwykle na obrót wrzeciona: `F0.2` to 0,2 mm przesunięcia noża na każdy obrót. Na Fanucu w systemie A włącza to [[G99]], na Sinumeriku i w systemach B/C — `G95`. Posuw na obrót nie zależy od obrotów, więc przy G96 grubość wióra zostaje stała, choć obroty się zmieniają." },
    { t: "code", x: "vf = f · n        (mm/min — do liczenia czasu)\nf = 0,2, n = 1592:  vf ≈ 318 mm/min" },

    { t: "h", x: "Posuw a powierzchnia", id: "chropowatosc" },
    { t: "diagram", id: "t23-rt" },
    { t: "p", x: "Chropowatość teoretyczna rośnie z kwadratem posuwu. Dwa razy większy posuw to cztery razy większe Rt. Średnia arytmetyczna Ra wynosi w przybliżeniu jedną czwartą Rt." },
    { t: "table", head: ["Obróbka", "Posuw f", "Promień naroża rε", "Rt teoretyczne"], rows: [
      ["zgrubna", "0,25–0,4 mm/obr", "0,8–1,2", "powierzchnia nieistotna"],
      ["wykańczająca", "0,08–0,15 mm/obr", "0,4–0,8", "f 0,1, rε 0,4 → Rt ≈ 3,1 µm, Ra ≈ 0,8"],
    ], caption: "Wartości orientacyjne dla stali. Zakres posuwu dla danej płytki i łamacza wióra podaje katalog." },
    { t: "note", kind: "info", x: "Płytka wiór łamie tylko w swoim zakresie posuwu i głębokości. Za mały posuw daje długi, splątany wiór, który owija się wokół detalu — to częsty problem przy wykańczaniu." },

    { t: "h", x: "Planowanie czoła", id: "planowanie" },
    { t: "p", x: "Pierwsza operacja na wałku to planowanie czoła: nóż jedzie w X od średnicy pręta do osi, na Z0. Program prowadzi teoretyczny wierzchołek ostrza, a naroże o promieniu rε kończy się wcześniej — przy X0 w środku zostałby mały czop. Dlatego przejście kończy się za osią, na X = −2 · rε." },
    { t: "diagram", id: "t23-face" },
    { t: "p", x: "Chłodziwo na tokarce działa jak na frezarce: `M08` włącza je przed skrawaniem, `M09` wyłącza po nim." },
  ],

  worked: {
    title: "Planowanie czoła wałka",
    intro: "Pręt Ø40, nóż CNMG z narożem R0,8, G96 S200, G50 S3000.",
    steps: [
      { x: "Dojazd na Z0, poza średnicą pręta.", code: "G00 X44. Z0." },
      { x: "Koniec za osią: −2 · 0,8.", code: "X-1.6" },
      { x: "Posuw wykańczający dla czoła.", code: "G01 X-1.6 F0.15" },
      { x: "Odjazd od czoła w Z.", code: "G00 Z2." },
    ],
    result: "Czas przejścia rośnie ku osi dopiero wtedy, gdy obroty dojdą do limitu: od Ø21 w dół vf = 0,15 · 3000 = 450 mm/min zostaje stałe.",
  },

  practice: [
    {
      kind: "task",
      mode: "lathe",
      intro: "Dopisz planowanie czoła. To pierwsze skrawanie w programie wałka — sprawdzany jest tor.",
      starter,
      checks: [
        { t: "cut", reference: `${head}\n${face}`, tolerance: 0.05 },
        { t: "require", codes: ["G01"] },
      ],
      hints: ["G00 X44. Z0., potem G01 X-1.6 F0.15.", "Na koniec G00 Z2."],
      solution: starter.replace("(DOPISZ PLANOWANIE CZOLA: DOJAZD NA Z0 POZA PRETEM,\n PRZEJSCIE PRZEZ OS Z F0.15, ODJAZD OD CZOLA)\n", `${face}\n`),
    },
    {
      kind: "drill",
      intro: "Posuw, chropowatość i czas.",
      questions: [
        { kind: "gap", q: "f = 0,15 mm/obr, naroże rε = 0,8 mm. Ile wynosi teoretyczna wysokość nierówności Rt (µm, do 0,1)?", template: "{0} µm", answers: [["3.5", "3,5"]], why: "0,15² / (8 · 0,8) · 1000 ≈ 3,5 µm." },
        { kind: "gap", q: "f = 0,25 mm/obr, n = 1200 obr/min. Ile wynosi posuw minutowy vf (mm/min)?", template: "{0}", answers: [["300"]], why: "0,25 · 1200 = 300." },
        { kind: "gap", q: "Nóż z narożem R1,2 planuje czoło do osi (model z lekcji, bez korekcji). Do jakiego X ma dojechać punkt P?", template: "X{0}", answers: [["-2.4", "-2,4"]], why: "−2 · 1,2." },
      ],
    },
  ],

  pitfalls: [
    { title: "Posuw na obrót przy G98", x: "`F0.2` przy aktywnym posuwie minutowym to 0,2 mm/min — nóż prawie stoi w materiale. Blok startowy z G99 (T1.3) chroni przed tym." },
    { title: "Planowanie tylko do X0", x: "Przejście kończy się w X0. Naroże R0,8 zostawia w środku czoła czop Ø1,6 — widoczny i wyczuwalny, a przy nakiełku przeszkadza." },
    { title: "Za mały posuw wykańczający", x: "f = 0,03 dla gładszej powierzchni. Płytka przestaje łamać wiór, a ostrze zaczyna trzeć zamiast skrawać — powierzchnia bywa gorsza niż przy f = 0,1." },
  ],

  controllers: {
    rows: [
      ["Posuw na obrót", "`G99` (system A), `G95` (B/C)", "`G95`"],
      ["Posuw na minutę", "`G98` (system A), `G94` (B/C)", "`G94`"],
      ["Chłodziwo", "`M08` / `M09`", "`M8` / `M9`"],
    ],
    note: "Te same liczby F znaczą co innego w zależności od aktywnego trybu — tryb ustawia zawsze blok startowy.",
  },

  quiz: [
    { kind: "choice", review: "T2.2", q: "Po co G50 przed G96?", options: ["ogranicza obroty przy małych średnicach", "ustawia posuw", "wybiera nóż", "włącza chłodziwo"], answer: 0, why: "Przy osi obroty rosłyby bez końca." },
    { kind: "choice", q: "Co znaczy `F0.2` przy G99?", options: ["0,2 mm na obrót", "0,2 mm/min", "200 mm/min", "0,2 obr/min"], answer: 0, why: "G99 — posuw na obrót (system A)." },
    { kind: "choice", q: "Posuw wzrósł dwukrotnie. Co dzieje się z teoretycznym Rt?", options: ["rośnie czterokrotnie", "rośnie dwukrotnie", "bez zmian", "maleje"], answer: 0, why: "Rt ∼ f²." },
    { kind: "gap", q: "f = 0,1 mm/obr, rε = 0,4 mm. Ile wynosi teoretyczne Rt (µm, do 0,1)?", template: "{0} µm", answers: [["3.1", "3,1"]], why: "0,01 / 3,2 · 1000 ≈ 3,1." },
    { kind: "choice", q: "Dlaczego planowanie kończy się na X ujemnym?", options: ["żeby naroże zebrało materiał w środku czoła", "bo X0 jest niedostępne", "bo tak wymaga G96", "żeby odjechać szybciej"], answer: 0, why: "Wierzchołek teoretyczny i naroże to nie ten sam punkt." },
    { kind: "token", q: "Wskaż kod posuwu **na obrót** w natywnym języku Siemensa.", block: "G94 | G95 | G96", answer: 1, why: "G95." },
  ],

  summary: [
    "F na tokarce: mm/obr — G99 na Fanucu (system A), G95 na Sinumeriku.",
    "Rt ≈ f² / (8 · rε) · 1000 µm, Ra ≈ Rt / 4.",
    "Zgrubnie 0,25–0,4, na gotowo 0,08–0,15 mm/obr — w zakresie łamacza wióra.",
    "Planowanie do osi kończy się na X = −2 · rε.",
  ],

  sources: [
    { id: "sandvik", where: "posuw przy toczeniu, chropowatość teoretyczna, zakresy łamaczy wióra" },
    { id: "jemielniak", where: "chropowatość powierzchni po toczeniu" },
    { id: "fanuc", where: "G98 i G99 na tokarce" },
    { id: "sinumerik", where: "G94 i G95" },
  ],
};
