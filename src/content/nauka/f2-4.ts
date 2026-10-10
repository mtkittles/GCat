import type { LessonDoc } from "@/lib/lesson";

export const f2_4: LessonDoc = {
  id: "F2.4",
  slug: "f2-4-chlodziwo-m08-m09",
  title: "Chłodziwo: M08 i M09",
  minutes: 8,
  goal: "Włączysz i wyłączysz chłodziwo we właściwych miejscach programu i ocenisz, kiedy lepiej pracować na sucho.",

  theory: [
    { t: "h", x: "Kody chłodziwa", id: "kody" },
    { t: "p", x: "[[M08]] włącza chłodziwo zalewowe, [[M09]] je wyłącza. Na wielu maszynach `M07` włącza mgłę olejową. Chłodzenie przez wrzeciono ma kody zależne od producenta — sprawdza się je w dokumentacji maszyny." },
    { t: "diagram", id: "f24-coolant" },

    { t: "h", x: "Po co chłodziwo", id: "po-co" },
    { t: "ul", items: [
      "odbiera ciepło z ostrza i detalu — detal nie rośnie od temperatury w trakcie pomiaru,",
      "smaruje strefę skrawania i ogranicza narost na ostrzu, zwłaszcza w aluminium,",
      "wypłukuje wióry z otworów i kieszeni, zanim zostaną przecięte drugi raz.",
    ] },

    { t: "h", x: "Kiedy na sucho", id: "sucho" },
    { t: "p", x: "Żeliwo szare, materiały hartowane obrabiane płytkami ceramicznymi albo CBN i wiele operacji frezowania stali węglikiem idzie na sucho lub z nadmuchem powietrza. Stopy tytanu i niklu — typowe w lotnictwie — przeciwnie: wymagają obfitego chłodzenia, często pod wysokim ciśnieniem." },
    { t: "note", kind: "warn", x: "Przy frezowaniu węglikiem z chłodziwem zalewowym podawaj je stałym, obfitym strumieniem przez cały czas skrawania. Ostrze nagrzewa się i stygnie z każdym obrotem, a strumień, który raz dochodzi do ostrza, a raz nie, pogłębia te skoki temperatury — węglik może pękać drobnymi rysami prostopadłymi do krawędzi. Jeśli strumień nie dociera stabilnie, producenci narzędzi często zalecają pracę na sucho z nadmuchem albo mgłę (MQL). Rozstrzyga zalecenie producenta narzędzia." },

    { t: "h", x: "Miejsce w programie", id: "miejsce" },
    { t: "p", x: "`M08` stoi po włączeniu obrotów, przed dojazdem do detalu. `M09` — po zakończeniu skrawania, przed wymianą narzędzia albo końcem programu. `M30` na większości maszyn i tak wyłącza chłodziwo, ale jawne `M09` czyni program czytelnym." },
  ],

  worked: {
    title: "Chłodziwo w programie płytki",
    intro: "Stal C45, frez VHM, kontur z pełnym zanurzeniem 5 mm — chłodziwo zalewowe.",
    steps: [
      { x: "Po wymianie narzędzia i włączeniu obrotów.", code: "S2500 M03" },
      { x: "Chłodziwo włączone przed najazdem.", code: "M08" },
      { x: "Po konturze odjazd w Z.", code: "G00 Z5." },
      { x: "Chłodziwo wyłączone przed zatrzymaniem wrzeciona.", code: "M09 → M05" },
    ],
    result: "Oba kody są już w programie płytki poniżej.",
  },

  practice: [
    {
      kind: "task", mode: "mill",
      intro: "Włącz chłodziwo zalewowe przed obróbką i wyłącz je przed zatrzymaniem wrzeciona.",
      starter: "O1000 (PLYTKA)\nG21 G90 G94 G17\nG40 G49 G80\nG54\nT1 M06 (FREZ FI10)\nG43 H1 Z50.\nS2500 M03\n(DOPISZ WLACZENIE CHLODZIWA ZALEWOWEGO)\nG00 X-20. Y10.\nG00 Z5.\nG01 Z-5. F150\nG01 X-5. F400\nG01 Y55.\nG00 Z50.\n(DOPISZ WYLACZENIE CHLODZIWA)\nM05\nM30",
      checks: [{"t":"coolant","label":"Chłodziwo włączone (M08) podczas każdego ruchu roboczego","offBeforeStop":true},{"t":"cut","reference":"G90\nG00 X-20. Y10.\nG00 Z5.\nG01 Z-5. F150\nG01 X-5. F400\nG01 Y55.\nG00 Z50.","tolerance":0.05}],
      hints: ["`M08` po włączeniu obrotów, przed najazdem — chłodziwo ma płynąć, zanim ostrze dotknie materiału.","`M09` po odjeździe w Z, przed `M05`."],
      solution: "O1000 (PLYTKA)\nG21 G90 G94 G17\nG40 G49 G80\nG54\nT1 M06 (FREZ FI10)\nG43 H1 Z50.\nS2500 M03\nM08\nG00 X-20. Y10.\nG00 Z5.\nG01 Z-5. F150\nG01 X-5. F400\nG01 Y55.\nG00 Z50.\nM09\nM05\nM30",
    },
    {
      kind: "drill",
      intro: "Chłodziwo w kolejności programu.",
      questions: [
        { kind: "order", q: "Ułóż w typowej kolejności.", items: ["M09", "(OBROBKA)", "T1 M06", "M08", "S2500 M03"], answer: [2, 4, 3, 1, 0], why: "Wymiana, obroty, chłodziwo, obróbka, wyłączenie chłodziwa." },
        { kind: "token", q: "Wskaż kod, który **włącza** chłodziwo zalewowe.", block: "M05 M09 M08 M03", answer: 2, why: "M08 — chłodziwo włączone." },
        { kind: "choice", q: "Frezowanie węglikiem, chłodziwo raz dochodzi do ostrza, raz nie. Co grozi ostrzu?", options: ["pęknięcia cieplne", "nic — lepsze niż brak chłodzenia", "korozja", "wolniejsze obroty"], answer: 0, why: "Przerywany strumień pogłębia skoki temperatury." },
      ],
    },
  ],

  pitfalls: [
    { title: "Przerywany strumień przy frezowaniu", x: "Dysza ustawiona tak, że strumień trafia w ostrze tylko co jakiś czas. Lepiej pracować na sucho niż z takim chłodzeniem." },
    { title: "Dysza ustawiona pod inne narzędzie", x: "Po wymianie na dłuższe albo krótsze narzędzie strumień trafia obok ostrza. Na maszynach z ręcznymi dyszami sprawdź ich ustawienie przy pierwszej sztuce." },
    { title: "Chłodziwo przy pomiarze", x: "Detal zmierzony zaraz po obróbce na sucho jest cieplejszy i większy niż w temperaturze odniesienia 20 °C. Przy wąskich tolerancjach to różnica, którą widać na maszynie pomiarowej." },
  ],

  controllers: {
    rows: [
      ["Chłodziwo zalewowe", "`M08`", "`M8`"],
      ["Mgła", "`M07`, zależnie od maszyny", "`M7`, zależnie od maszyny"],
      ["Wyłączenie", "`M09`", "`M9`"],
      ["Przez wrzeciono", "kod producenta", "kod producenta"],
    ],
    note: "Kody M08 i M09 są wspólne. Chłodzenie przez wrzeciono i nadmuch mają numery nadane przez producenta maszyny.",
  },

  quiz: [
    { kind: "gap", review: "F2.3", q: "fz = 0,04, z = 4, n = 3000. Ile wynosi F?", template: "F{0}", answers: [["480"]], why: "0,04 · 4 · 3000 = 480." },
    { kind: "choice", q: "Co robi `M09`?", options: ["włącza chłodziwo", "wyłącza chłodziwo", "włącza mgłę", "zatrzymuje wrzeciono"], answer: 1, why: "M09 — chłodziwo wyłączone." },
    { kind: "choice", q: "Gdzie w programie stoi `M08`?", options: ["po włączeniu obrotów, przed najazdem", "przed M06", "po M30", "w bloku startowym"], answer: 0, why: "Chłodziwo ma płynąć, zanim narzędzie dotknie materiału." },
    { kind: "choice", q: "Który materiał zwykle obrabia się na sucho?", options: ["żeliwo szare", "stop tytanu", "aluminium", "stal nierdzewna przy wierceniu"], answer: 0, why: "Żeliwo szare daje suchy, kruchy wiór." },
    { kind: "choice", q: "Dlaczego stopy tytanu wymagają obfitego chłodzenia?", options: ["słabo przewodzą ciepło, więc gromadzi się ono przy ostrzu", "łatwo się palą przy każdej obróbce", "tak wymaga M08", "żeby zmniejszyć obroty"], answer: 0, why: "Mniej ciepła odpływa w detal i wiór niż przy stali, więc więcej zostaje przy ostrzu." },
    { kind: "token", q: "Wskaż kod, który zwykle włącza **mgłę**.", block: "M08 M07 M09", answer: 1, why: "M07 — mgła, na maszynach, które ją mają." },
  ],

  summary: [
    "M08 — chłodziwo zalewowe, M09 — wyłączone, M07 — mgła na wielu maszynach.",
    "M08 po obrotach, przed najazdem. M09 po skrawaniu.",
    "Chłodziwo zalewowe przy frezowaniu węglikiem — stałym strumieniem. Przerywany strumień grozi pęknięciami cieplnymi; inne sposoby chłodzenia według zaleceń producenta narzędzia.",
    "Tytan i nikiel: dużo chłodziwa. Żeliwo, ceramika, CBN: często na sucho.",
  ],

  sources: [
    { id: "sandvik", where: "chłodzenie przy frezowaniu, pęknięcia cieplne, obróbka na sucho" },
    { id: "jemielniak", where: "ciecze obróbkowe i ich funkcje" },
    { id: "fanuc", where: "funkcje M07, M08, M09" },
  ],
};
