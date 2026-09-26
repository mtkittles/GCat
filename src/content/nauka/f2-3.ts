import type { LessonDoc } from "@/lib/lesson";

export const f2_3: LessonDoc = {
  id: "F2.3",
  slug: "f2-3-posuw-f-g94",
  title: "Posuw F i G94",
  minutes: 13,
  goal: "Obliczysz posuw minutowy z posuwu na ostrze i ustawisz osobny posuw dla wejścia w materiał i dla konturu.",

  theory: [
    { t: "h", x: "F w milimetrach na minutę", id: "f-g94" },
    { t: "p", x: "Adres **F** podaje posuw, czyli prędkość, z jaką narzędzie przesuwa się po torze. Na frezarce domyślnie działa [[G94]] — posuw w mm/min: `F400` to 400 mm na minutę. `G95` zmienia jednostkę na mm na obrót wrzeciona; na frezarce używa się go rzadko, głównie przy gwintowaniu, a na tokarce jest standardem." },

    { t: "h", x: "Skąd wziąć F", id: "obliczanie" },
    { t: "p", x: "Katalog narzędzia podaje [[fz]] — posuw na ostrze, czyli grubość wióra, jaką zbiera jedno ostrze. Posuw minutowy liczy się z niego, z liczby ostrzy z i z obrotów n:" },
    { t: "code", x: "vf = fz · z · n\n\nfz — posuw na ostrze [mm/ostrze]\nz  — liczba ostrzy\nn  — obroty [obr/min]\nvf — posuw minutowy = F [mm/min]", caption: "Kalkulator obróbki w menu liczy to samo." },
    { t: "diagram", id: "f23-fz" },
    { t: "p", x: "Przy małej szerokości skrawania (ae mniejsze niż połowa średnicy) rzeczywista grubość wióra jest mniejsza niż fz — to [[pocienianie wióra]]. Katalogi podają wtedy korektę w górę. Zbyt cienki wiór nie skrawa, tylko trze." },

    { t: "h", x: "Dwa posuwy w jednym programie", id: "dwa-posuwy" },
    { t: "p", x: "Wejście w materiał osią Z obciąża ostrza czołowe, które zbierają materiał całą szerokością. Dlatego zejście programuje się wolniej niż kontur — typowo 30–50% posuwu konturowego. W programie płytki: `F150` na wejście i `F400` na kontur." },
    { t: "note", kind: "info", x: "`G00` nie używa F. Operator może zmienić posuw w trakcie pracy korektorem (override, zwykle 0–150%). Wartość w programie odpowiada 100%." },
  ],

  worked: {
    title: "Posuwy dla płytki",
    intro: "Frez VHM Ø10, 4 ostrza, stal C45. Z lekcji F2.2: S2500. Katalog: fz = 0,04 mm/ostrze.",
    steps: [
      { x: "Posuw konturowy: 0,04 · 4 · 2500 = 400 mm/min.", code: "F400" },
      { x: "Wejście w Z: ok. 40% posuwu konturowego, zaokrąglone.", code: "F150" },
      { x: "Zejście piszesz w bloku G01 Z…, kontur w pierwszym bloku ruchu po obrysie.", code: "G01 Z-5. F150" },
      { x: "F jest modalne, więc dalsze bloki konturu nie muszą go powtarzać.", code: "G01 X-5. F400" },
    ],
    result: "Te same wartości stoją w programie płytki. Przy zmianie narzędzia liczysz je od nowa — zmienia się i n, i z, i fz.",
  },

  practice: [
    {
      kind: "drill",
      intro: "Posuw minutowy i na ostrze.",
      questions: [
        { kind: "gap", q: "fz = 0,05, z = 3, n = 3000. Ile wynosi F?", template: "F{0}", answers: [["450"]], why: "0,05 · 3 · 3000 = 450 mm/min." },
        { kind: "gap", q: "Program ma F600, frez 4-ostrzowy, S3000. Jakie jest fz?", template: "fz = {0}", answers: [["0.05", "0,05", ".05"]], why: "600 / (4 · 3000) = 0,05 mm/ostrze." },
        { kind: "token", q: "Tapnij słowo, które ustawia **posuw**.", block: "G01 X80. Y0. F400", answer: 3, why: "F400 — 400 mm/min." },
        { kind: "choice", q: "Frez 2-ostrzowy zamiast 4-ostrzowego przy tym samym fz i S. Posuw F:", options: ["zostaje taki sam", "maleje o połowę", "rośnie dwukrotnie", "zależy od średnicy"], answer: 1, why: "F jest proporcjonalne do liczby ostrzy." },
      ],
    },
  ],

  pitfalls: [
    { title: "G95 na frezarce", x: "Po programie z gwintowaniem zostało aktywne `G95`. `F400` znaczy wtedy 400 mm na obrót — sterowanie zgłosi przekroczenie posuwu albo wykona ruch z maksymalną prędkością. Blok startowy może zawierać `G94`." },
    { title: "Zła liczba ostrzy", x: "Frez 4-ostrzowy policzony jako 2-ostrzowy daje posuw dwa razy za mały. Ostrza trą zamiast skrawać i szybko się tępią." },
    { title: "Wejście posuwem konturowym", x: "`G01 Z-5.` bez zmiany F wchodzi w materiał posuwem ustawionym na kontur. Ostrza czołowe są przeciążone, a frez może pęknąć." },
    { title: "Za cienki wiór", x: "Przy wąskiej ścieżce (małe ae) fz z tabeli daje wiór cieńszy niż zakładany. Narzędzie się grzeje i ślizga. Stosuj korektę na pocienianie wióra z katalogu." },
  ],

  controllers: {
    rows: [
      ["Posuw na minutę", "`G94`", "`G94`"],
      ["Posuw na obrót", "`G95`", "`G95`"],
      ["Posuw na ostrze w programie", "brak — przeliczasz na F", "`G95 FZ=0.04` przy znanej liczbie ostrzy"],
      ["Ruch szybki", "bez F, prędkość z parametrów", "bez F, prędkość z danych maszynowych"],
    ],
    note: "Sinumerik potrafi przyjąć posuw na ostrze wprost, jeśli liczba ostrzy jest wpisana w dane narzędzia. Na Fanucu liczysz F samodzielnie.",
  },

  quiz: [
    { kind: "gap", review: "F2.2", q: "Frez Ø10, vc = 94 m/min. Obroty w pełnych obr/min:", template: "n = {0}", answers: [["2992", "2991", "2993"]], why: "1000 · 94 / (π · 10) ≈ 2992." },
    { kind: "choice", q: "Co oznacza `F400` przy aktywnym `G94`?", options: ["400 mm/min", "400 mm/obr", "400 obr/min", "400 m/min"], answer: 0, why: "G94 — posuw minutowy." },
    { kind: "gap", q: "fz = 0,06, z = 2, n = 5000. Ile wynosi F?", template: "F{0}", answers: [["600"]], why: "0,06 · 2 · 5000 = 600." },
    { kind: "choice", q: "Dlaczego zejście w Z programuje się wolniej niż kontur?", options: ["ostrza czołowe zbierają materiał całą szerokością", "oś Z jest słabsza", "tak wymaga G01", "żeby oszczędzić chłodziwo"], answer: 0, why: "Przy wejściu pracuje czoło freza, a nie obwód." },
    { kind: "choice", q: "Obroty wzrosły z S2000 do S3000 przy tym samym fz. Co z F?", options: ["zostaje", "rośnie o połowę", "maleje", "rośnie dwukrotnie"], answer: 1, why: "F jest proporcjonalne do n: 3000/2000 = 1,5." },
    { kind: "choice", q: "Korektor posuwu ustawiony na 50%, w programie F400. Z jakim posuwem jedzie maszyna?", options: ["400 mm/min", "200 mm/min", "800 mm/min", "zależy od G00"], answer: 1, why: "Korektor mnoży posuw z programu." },
    { kind: "choice", q: "Który kod ustawia posuw na minutę?", options: ["G94", "G95", "G96", "G97"], answer: 0, why: "G94 — mm/min, G95 — mm/obr." },
  ],

  summary: [
    "F to posuw. W G94 — mm/min, w G95 — mm/obr.",
    "vf = fz · z · n. fz z katalogu, z — liczba ostrzy, n — obroty.",
    "Wejście w Z wolniej niż kontur, typowo 30–50%.",
    "F jest modalne — po zmianie narzędzia licz i wpisuj od nowa.",
  ],

  sources: [
    { id: "sandvik", where: "posuw na ostrze, pocienianie wióra, wzory na vf" },
    { id: "jemielniak", where: "parametry skrawania przy frezowaniu" },
    { id: "fanuc", where: "F, G94 i G95, korektor posuwu" },
    { id: "sinumerik", where: "G94, G95, posuw na ostrze FZ" },
  ],
};
