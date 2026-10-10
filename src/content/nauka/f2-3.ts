import type { LessonDoc } from "@/lib/lesson";

export const f2_3: LessonDoc = {
  id: "F2.3",
  slug: "f2-3-posuw-f-g94",
  title: "Posuw F i G94",
  minutes: 13,
  goal: "Obliczysz posuw minutowy z posuwu na ostrze i ustawisz osobny posuw dla wejścia w materiał i dla konturu.",

  theory: [
    { t: "h", x: "F w milimetrach na minutę", id: "f-g94" },
    { t: "p", x: "Adres **F** podaje posuw, czyli prędkość, z jaką narzędzie przesuwa się po torze. Na frezarce zwykle działa [[G94]] — posuw w mm/min: `F400` to 400 mm na minutę. Programy w kursie ustawiają `G94` jawnie w bloku startowym (lekcja F1.5), bo stan po poprzednim programie może być inny. `G95` zmienia jednostkę na mm na obrót wrzeciona; na frezarce używa się go rzadko, głównie przy gwintowaniu, a na tokarce jest standardem." },

    { t: "h", x: "Skąd wziąć F", id: "obliczanie" },
    { t: "p", x: "Katalog narzędzia podaje [[fz]] — posuw na ostrze. To droga, o którą frez przesuwa się między pracą kolejnych ostrzy. Jeśli frez ma 4 ostrza, w jednym obrocie przesunie się o 4 · fz. Posuw minutowy liczy się z fz, liczby ostrzy z i obrotów n:" },
    { t: "code", x: "vf = fz · z · n\n\nfz — posuw na ostrze [mm/ostrze]\nz  — liczba ostrzy\nn  — obroty [obr/min]\nvf — posuw minutowy = F [mm/min]", caption: "Kalkulator obróbki w menu liczy to samo." },
    { t: "diagram", id: "f23-fz" },
    { t: "p", x: "Grubość wióra h to coś innego niż fz. Zależy od tego, w którym miejscu obwodu ostrze pracuje: w kierunku posuwu h = fz, z boku freza h maleje do zera. Przy małej szerokości skrawania (ae mniejsze niż połowa średnicy) ostrza pracują tylko przy boku, więc największa grubość wióra jest mniejsza niż fz — to [[pocienianie wióra]]. Katalogi podają wtedy korektę fz w górę. Zbyt cienki wiór nie skrawa, tylko trze." },

    { t: "h", x: "Dwa posuwy w jednym programie", id: "dwa-posuwy" },
    { t: "p", x: "Gdy frez zagłębia się pionowo w materiał, skrawają ostrza czołowe. Przy osi freza prędkość skrawania spada do zera, a wiór trudno wychodzi, dlatego posuw wgłębny jest mniejszy niż konturowy. Jego wartość podaje producent freza; frez musi mieć ostrza dochodzące do środka." },
    { t: "p", x: "W programie płytki frez schodzi w X−20, obok detalu — w powietrzu, więc niczego nie skrawa. Mniejszy posuw zejścia (`F150`, ok. 40% z `F400`) to tu przyjęte w kursie zabezpieczenie: jeśli zero Z albo naddatek nie zgadza się z założeniem, frez dotknie materiału wolno. Lekcja F6.2 pokazuje, jak wejść w materiał rampą zamiast pionowo." },
    { t: "note", kind: "info", x: "`G00` nie używa F. Operator może zmienić posuw w trakcie pracy korektorem (override, zwykle 0–150%). Wartość w programie odpowiada 100%." },
  ],

  worked: {
    title: "Posuwy dla płytki",
    intro: "Sytuacja: frez VHM Ø10 z 4 ostrzami stoi nad X−20 Y10, obok płytki ze stali C45. Z lekcji F2.2: S2500. Katalog podaje fz = 0,04 mm/ostrze. Program ma zejść na Z−5 i obrobić bok płytki.",
    fig: "f23-feeds",
    steps: [
      { x: "Posuw konturowy z katalogu: vf = fz · z · n = 0,04 · 4 · 2500 = 400 mm/min.", code: "F400" },
      { x: "Krok 1 na rysunku: zejście w X−20, obok płytki — frez nie skrawa. W kursie zejście idzie z ok. 40% posuwu konturowego, zaokrąglone. To założenie przykładu, nie wartość z katalogu.", code: "G01 Z-5. F150" },
      { x: "Krok 2: dojazd do X−5. Krawędź freza staje przy boku płytki, a od następnego ruchu skrawa obwód — dlatego F400 pada już w tym bloku.", code: "G01 X-5. F400" },
      { x: "Krok 3: kontur wzdłuż boku. F jest modalne, więc dalsze bloki nie muszą go powtarzać.", code: "G01 Y55." },
    ],
    result: "Te same wartości stoją w programie płytki. Przy zmianie narzędzia liczysz je od nowa — zmienia się n, z i fz. Gdyby frez miał wejść pionowo w materiał zamiast obok płytki, posuw wgłębny bierzesz z katalogu freza.",
  },

  practice: [
    {
      kind: "task", mode: "mill",
      intro: "Program ma ruchy robocze bez posuwu. Oblicz posuw konturowy z fz i wpisz osobny posuw zejścia.",
      starter: "O1000 (PLYTKA)\nG21 G90 G94 G17\nG40 G49 G80\nG54\nT1 M06 (FREZ FI10)\nG43 H1 Z50.\nS2500 M03\nM08\nG00 X-20. Y10.\nG00 Z5.\n(FZ = 0,04 MM, 4 OSTRZA, S2500: ZEJSCIE OK. 40% POSUWU KONTUROWEGO, ZAOKRAGLONE DO F150)\nG01 Z-5. (DOPISZ POSUW ZEJSCIA)\nG01 X-5. (DOPISZ POSUW KONTUROWY)\nG01 Y55.\nG00 Z50.\nM09\nM05\nM30",
      checks: [{"t":"feed","on":"plunge","f":150,"label":"Zejście w Z z aktywnym F150"},{"t":"feed","on":"xy","f":400,"label":"Kontur z aktywnym F400"},{"t":"cut","reference":"G90\nG00 X-20. Y10.\nG00 Z5.\nG01 Z-5. F150\nG01 X-5. F400\nG01 Y55.\nG00 Z50.","tolerance":0.05}],
      hints: ["Posuw konturowy: fz · z · n = 0,04 · 4 · 2500 = 400 mm/min.","Zejście w Z: ok. 40 % z 400, zaokrąglone — `F150` w bloku `G01 Z-5.`; `F400` w pierwszym bloku konturu."],
      solution: "O1000 (PLYTKA)\nG21 G90 G94 G17\nG40 G49 G80\nG54\nT1 M06 (FREZ FI10)\nG43 H1 Z50.\nS2500 M03\nM08\nG00 X-20. Y10.\nG00 Z5.\n(FZ = 0,04 MM, 4 OSTRZA, S2500: ZEJSCIE OK. 40% POSUWU KONTUROWEGO, ZAOKRAGLONE DO F150)\nG01 Z-5. F150\nG01 X-5. F400\nG01 Y55.\nG00 Z50.\nM09\nM05\nM30",
    },
    {
      kind: "drill",
      intro: "Posuw minutowy i na ostrze.",
      questions: [
        { kind: "gap", q: "fz = 0,05, z = 3, n = 3000. Ile wynosi F?", template: "F{0}", answers: [["450"]], why: "0,05 · 3 · 3000 = 450 mm/min." },
        { kind: "gap", q: "Program ma F600, frez 4-ostrzowy, S3000. Jakie jest fz?", template: "fz = {0}", answers: [["0.05", "0,05", ".05"]], why: "600 / (4 · 3000) = 0,05 mm/ostrze." },
        { kind: "token", q: "Wskaż słowo, które ustawia **posuw**.", block: "G01 X80. Y0. F400", answer: 3, why: "F400 — 400 mm/min." },
        { kind: "choice", q: "Po bloku `G01 X-5. F400` frez Ø10 stoi w X−5 Y10 Z−5, przy boku płytki (X0). Następny blok to `G01 Y55.`. Co się stanie?", options: ["frez jedzie wzdłuż boku z F400 i skrawa obwodem", "frez jedzie z F150, bo to był pierwszy posuw", "alarm — w bloku brak F", "ruch szybki, bo brak G01 w poprzednim bloku"], answer: 0, why: "G01 i F400 są modalne. Krawędź freza leży na boku płytki, więc ruch wzdłuż Y zbiera materiał obwodem." },
        { kind: "choice", q: "Frez 2-ostrzowy zamiast 4-ostrzowego, to samo fz i S. Co dzieje się z posuwem F?", options: ["zostaje taki sam", "maleje o połowę", "rośnie dwukrotnie", "zależy od średnicy"], answer: 1, why: "F jest proporcjonalne do liczby ostrzy." },
      ],
    },
  ],

  pitfalls: [
    { title: "G95 na frezarce", danger: true, x: "Po programie z gwintowaniem zostało aktywne `G95`. `F400` znaczy wtedy 400 mm na obrót — przy S2500 to 1 000 000 mm/min. Sterowanie ograniczy posuw do maksymalnego posuwu roboczego z parametrów albo zgłosi alarm. Dlatego kompletny program ustawia `G94` na starcie." },
    { title: "Zła liczba ostrzy", x: "Frez 4-ostrzowy policzony jako 2-ostrzowy daje posuw dwa razy za mały. Ostrza trą zamiast skrawać i szybko się tępią." },
    { title: "Zagłębianie posuwem konturowym", danger: true, x: "`G01 Z-5.` nad materiałem z F ustawionym na kontur. Ostrza czołowe dostają posuw kilka razy większy niż dopuszczalny posuw wgłębny — grozi to wykruszeniem ostrzy albo złamaniem freza. Sprawdź posuw wgłębny w katalogu albo zejdź obok detalu." },
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
    { kind: "gap", review: "F2.2", q: "Frez Ø10, vc = 94 m/min. Ile obrotów wpiszesz (w pełnych obr/min)?", template: "n = {0}", answers: [["2992", "2991", "2993"]], why: "1000 · 94 / (π · 10) ≈ 2992." },
    { kind: "choice", q: "Co oznacza `F400` przy aktywnym `G94`?", options: ["400 mm/min", "400 mm/obr", "400 obr/min", "400 m/min"], answer: 0, why: "G94 — posuw minutowy." },
    { kind: "gap", q: "fz = 0,06, z = 2, n = 5000. Ile wynosi F?", template: "F{0}", answers: [["600"]], why: "0,06 · 2 · 5000 = 600." },
    { kind: "choice", q: "Frez zagłębia się pionowo w materiał. Dlaczego posuw zejścia przyjmuje się mniejszy niż konturowy?", options: ["pracują ostrza czołowe: przy osi prędkość skrawania spada do zera, a wiór trudno wychodzi", "oś Z jest słabsza", "tak wymaga G01", "żeby oszczędzić chłodziwo"], answer: 0, why: "Przy zagłębianiu skrawa czoło freza, a nie obwód. Dopuszczalny posuw wgłębny podaje producent freza. Zejście obok detalu, w powietrzu, nie obciąża ostrzy." },
    { kind: "choice", q: "Obroty wzrosły z S2000 do S3000 przy tym samym fz. Co z F?", options: ["zostaje", "rośnie o połowę", "maleje", "rośnie dwukrotnie"], answer: 1, why: "F jest proporcjonalne do n: 3000/2000 = 1,5." },
    { kind: "choice", q: "Korektor posuwu ustawiony na 50%, w programie F400. Z jakim posuwem jedzie maszyna?", options: ["400 mm/min", "200 mm/min", "800 mm/min", "zależy od G00"], answer: 1, why: "Korektor mnoży posuw z programu." },
    { kind: "choice", q: "Który kod ustawia posuw na minutę?", options: ["G94", "G95", "G96", "G97"], answer: 0, why: "G94 — mm/min, G95 — mm/obr." },
  ],

  summary: [
    "F to posuw. W G94 — mm/min, w G95 — mm/obr.",
    "vf = fz · z · n. fz z katalogu, z — liczba ostrzy, n — obroty.",
    "fz to droga między ostrzami, nie grubość wióra. Wiór jest cieńszy niż fz z boku freza i przy małym ae.",
    "Zagłębianie w materiał — posuw wgłębny z katalogu. W kursie zejście obok detalu ok. 40% posuwu konturowego.",
    "F jest modalne — po zmianie narzędzia licz i wpisuj od nowa.",
  ],

  sources: [
    { id: "sandvik", where: "posuw na ostrze, pocienianie wióra, wzory na vf" },
    { id: "jemielniak", where: "parametry skrawania przy frezowaniu" },
    { id: "fanuc", where: "F, G94 i G95, korektor posuwu" },
    { id: "sinumerik", where: "G94, G95, posuw na ostrze FZ" },
  ],
};
