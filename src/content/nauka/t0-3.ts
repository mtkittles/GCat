import type { LessonDoc } from "@/lib/lesson";

export const t0_3: LessonDoc = {
  id: "T0.3",
  slug: "t0-3-zero-przedmiotu-glowica",
  title: "Zero przedmiotu i położenie głowicy",
  minutes: 13,
  goal: "Ustawisz zero detalu w Z dotknięciem czoła i rozpoznasz, jak położenie głowicy zmienia kierunek +X.",

  theory: [
    { t: "h", x: "M i W na tokarce", id: "punkty" },
    { t: "p", x: "Zero maszyny M leży zwykle na osi wrzeciona, na czole jego końcówki — tam, gdzie mocuje się uchwyt. Zero detalu W leży na tej samej osi, na czole detalu. Oba punkty są na osi obrotu, więc różnią się tylko w Z." },
    { t: "diagram", id: "t03-zero" },
    { t: "p", x: "X0 jest zawsze na osi, niezależnie od detalu — dlatego na tokarce ustala się tylko zero w Z. Przesunięcie Z zależy od tego, jak daleko pręt wystaje z uchwytu, i zmienia się po każdym przełożeniu materiału." },

    { t: "h", x: "Pomiar Z0", id: "pomiar" },
    { t: "ul", items: [
      "Nóż planuje czoło — zbiera cienką warstwę, żeby powierzchnia była płaska i czysta.",
      "Bez odjazdu w Z operator zapisuje bieżącą pozycję jako Z0 — w przesunięciu G54 albo w tabeli korekcji noża, zależnie od maszyny.",
      "Kolejne noże dotykają tego samego czoła i dostają swoje korekcje Z względem niego (lekcja T2.1).",
    ] },
    { t: "note", kind: "info", x: "Średnicę noża do X0 mierzy się podobnie: nóż przetacza krótki odcinek, operator mierzy go mikrometrem i wpisuje zmierzoną średnicę. Sterowanie samo liczy, gdzie wypada oś." },

    { t: "h", x: "Głowica przednia i tylna", id: "glowica" },
    { t: "p", x: "+X zawsze prowadzi od osi w stronę noża. W tokarkach ze skośnym łożem głowica stoi za osią (tylna), więc +X biegnie od operatora. W tokarkach z głowicą przednią nóż jest po stronie operatora i +X biegnie w jego stronę." },
    { t: "diagram", id: "t03-turret" },
    { t: "p", x: "Na typowych tokarkach program dla obu maszyn jest taki sam — kierunki osi ustawia konfiguracja maszyny (szczegóły w dokumentacji producenta). Różni się tylko to, jak ruch wygląda z miejsca operatora, i to ma znaczenie przy łukach: lekcja T3.3 pokazuje, jak nie pomylić G02 z G03." },
  ],

  worked: {
    title: "Zero Z dla wałka",
    intro: "Pręt Ø40 wystaje 70 mm z uchwytu. Czoło jest surowe, po piłowaniu.",
    steps: [
      { x: "Nóż planuje czoło, zbierając około 0,5 mm.", code: "planowanie" },
      { x: "Ostrze stoi na czystym czole — pozycja maszynowa np. Z−312,4.", code: "Z masz. −312,4" },
      { x: "Operator zapisuje ją jako Z0 dla G54.", code: "G54 Z = −312,4" },
      { x: "Od teraz Z w programie liczy się od czoła.", code: "Z0 = czoło" },
    ],
    result: "Po przełożeniu pręta z innym wysięgiem pomiar trzeba powtórzyć — stare przesunięcie opisuje poprzednie położenie czoła.",
  },

  practice: [
    {
      kind: "lathejog",
      setZ: true,
      intro: "Zero Z nie jest jeszcze ustawione — odczyt pokazuje pozycję maszynową. Dotknij ostrzem czoła pręta i zapisz Z0, potem dojedź do punktów w układzie detalu.",
      goals: [
        { kind: "setz", label: "dotknij czoła i zapisz Z0" },
        { kind: "move", x: 44, z: 2, label: "2 mm przed czołem, nad prętem" },
        { kind: "move", x: 0, z: 1, label: "środek czoła, 1 mm przed nim" },
      ],
    },
    {
      kind: "drill",
      intro: "Zero detalu i głowica.",
      questions: [
        { kind: "order", q: "Ułóż ustawianie Z0.", items: ["zapis pozycji jako Z0", "planowanie czoła", "kolejne noże dotykają czoła", "bez odjazdu w Z"], answer: [1, 3, 0, 2], why: "Czyste czoło, nóż zostaje na miejscu, zapis, potem kolejne narzędzia." },
        { kind: "choice", q: "Tokarka ze skośnym łożem, głowica za osią. Dokąd prowadzi +X?", options: ["od operatora", "do operatora", "w stronę uchwytu", "w górę zawsze"], answer: 0, why: "+X od osi w stronę noża, a nóż jest za osią." },
      ],
    },
  ],

  pitfalls: [
    { title: "Z0 na surowym czole", x: "Pomiar na czole po piłowaniu, bez planowania. Czoło ma odchyłki rzędu dziesiątych milimetra — wszystkie długości w Z przesuną się o tyle samo." },
    { title: "Stare Z0 po przełożeniu pręta", x: "Pręt wysunięty z uchwytu o 10 mm więcej, a przesunięcie zostało. Cały program przesuwa się o 10 mm — nóż zaczyna skrawać w powietrzu albo wchodzi za głęboko." },
    { title: "Kierunek łuku oceniany z miejsca operatora", x: "Na tokarce z głowicą przednią łuk z programu wygląda z miejsca operatora na odwrotny. Kierunek G02/G03 ocenia się według rysunku w układzie X w górę, a nie według tego, co widać przez szybę." },
  ],

  controllers: {
    rows: [
      ["Zapis Z0", "WORK SHIFT, G54 Z albo korekcja geometrii noża", "przesunięcie nastawne G54 albo korekcja narzędzia"],
      ["Pomiar", "MEASURE na ekranie korekcji", "JOG → pomiar detalu / narzędzia"],
      ["Położenie głowicy", "parametr maszyny", "dane maszynowe"],
    ],
    note: "Gdzie trafia Z0, zależy od organizacji pracy na danej maszynie. Zasada jest wspólna: zero detalu w Z leży na czole, X0 na osi.",
  },

  quiz: [
    { kind: "gap", review: "T0.2", q: "Toczysz z Ø40 na Ø34 jednym przejściem. Ile wynosi ap?", template: "{0} mm", answers: [["3"]], why: "(40 − 34) / 2 = 3." },
    { kind: "choice", q: "Dlaczego zero detalu na tokarce ustala się zwykle tylko w Z?", options: ["X0 leży na osi obrotu", "bo X nie ma zera", "bo G54 nie ma X", "bo tak wymaga G18"], answer: 0, why: "Oś obrotu wyznacza X0 jednoznacznie. Każdy nóż i tak trzeba zmierzyć w X — to jego korekcja geometrii (lekcja T2.1)." },
    { kind: "choice", q: "Co trzeba zrobić przed pomiarem Z0 na surowym pręcie?", options: ["splanować czoło", "stoczyć średnicę", "wywiercić nakiełek", "nic"], answer: 0, why: "Pomiar na surowym czole przenosi jego nierówności na cały program." },
    { kind: "choice", q: "Pręt wysunięto dalej z uchwytu. Co z Z0?", options: ["zmierzyć ponownie", "zostawić", "zmienić X0", "zmienić program"], answer: 0, why: "Czoło jest w innym miejscu." },
    { kind: "choice", q: "Czy program dla tokarki z głowicą przednią różni się od programu dla tylnej?", options: ["zwykle nie — kierunki osi ustawia konfiguracja maszyny", "tak, trzeba odwrócić X", "tak, trzeba odwrócić Z", "tak, zamienić G02 i G03"], answer: 0, why: "Na typowych tokarkach różni się tylko to, jak ruch wygląda z miejsca operatora. Szczegóły kinematyki podaje dokumentacja producenta maszyny." },
    { kind: "choice", q: "Gdzie leży zero maszyny M na typowej tokarce?", options: ["na osi, na czole końcówki wrzeciona", "na czole detalu", "na koniku", "na narzędziu"], answer: 0, why: "Tam mocuje się uchwyt." },
  ],

  summary: [
    "M na czole wrzeciona, W na czole detalu — oba na osi.",
    "Zero ustala się tylko w Z: czysty, splanowany czoło i zapis Z0.",
    "Po przełożeniu pręta pomiar Z0 trzeba powtórzyć.",
    "+X zawsze od osi w stronę noża. Program jest ten sam dla głowicy przedniej i tylnej.",
  ],

  sources: [
    { id: "fanuc", where: "przesunięcie przedmiotu na tokarce, pomiar korekcji" },
    { id: "sinumerik", where: "punkty M i W tokarki, pomiar detalu i narzędzia" },
  ],
};
