import type { LessonDoc } from "@/lib/lesson";

export const t0_3: LessonDoc = {
  id: "T0.3",
  slug: "t0-3-zero-przedmiotu-glowica",
  title: "Zero przedmiotu i położenie głowicy",
  minutes: 13,
  goal: "Ustawisz zero detalu w Z dotknięciem czoła i rozpoznasz, jak położenie głowicy zmienia kierunek +X.",

  theory: [
    { t: "h", x: "M i W na tokarce", id: "punkty" },
    { t: "p", x: "W podręcznikach zero maszyny M leży na osi wrzeciona, na czole jego końcówki — tam, gdzie mocuje się uchwyt. Zero detalu W leży na tej samej osi, na czole detalu. Oba punkty są na osi obrotu, więc różnią się tylko w Z." },
    { t: "note", kind: "info", x: "Gdzie producent ustawia zero współrzędnych maszynowych, zależy od maszyny. Na wielu tokarkach pozycja maszynowa jest liczona od punktu referencyjnego na końcu przesuwu, więc ekran pokazuje wartości ujemne, np. Z−312,4. Zasada pomiaru się nie zmienia." },
    { t: "diagram", id: "t03-zero" },
    { t: "p", x: "X0 leży na osi obrotu, niezależnie od detalu — dlatego w metodzie z tej lekcji zero detalu ustala się tylko w Z. Każdy nóż trzeba jednak zmierzyć także w X — to jego korekcja geometrii (lekcja T2.1). Przesunięcie Z zależy od tego, jak daleko pręt wystaje z uchwytu, i zmienia się po każdym przełożeniu materiału." },

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
    { t: "p", x: "Na typowych tokarkach program dla obu maszyn jest taki sam — kierunki osi ustawia producent w konfiguracji maszyny, więc przy nowej maszynie sprawdź to w jej dokumentacji. Różni się tylko to, jak ruch wygląda z miejsca operatora, i to ma znaczenie przy łukach: lekcja T3.3 pokazuje, jak nie pomylić G02 z G03." },
  ],

  worked: {
    title: "Zero Z dla wałka",
    intro: "Sytuacja: pręt Ø40 wystaje 70 mm z uchwytu, czoło jest surowe, po piłowaniu. Zanim ruszy program wałka, trzeba ustawić Z0 na czole. Numery na rysunku to numery kroków.",
    fig: "t03-touch",
    steps: [
      { x: "Nóż planuje czoło, zbierając około 0,5 mm — powierzchnia staje się płaska i czysta.", code: "planowanie" },
      { x: "Bez odjazdu w Z ostrze stoi na czystym czole. Ekran pokazuje pozycję maszynową, np. Z−312,4.", code: "Z masz. −312,4" },
      { x: "Operator zapisuje tę pozycję jako Z0 dla G54.", code: "G54 Z = −312,4" },
      { x: "Od teraz Z w programie liczy się od czoła: Z0 to czoło, Z ujemne — w stronę uchwytu.", code: "Z0 = czoło" },
    ],
    result: "Każdy blok programu dostaje Z liczone od czystego czoła. Po przełożeniu pręta z innym wysięgiem pomiar trzeba powtórzyć — stare przesunięcie opisuje poprzednie położenie czoła.",
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
        { kind: "choice", q: "Pręt wysunięto z uchwytu o 10 mm dalej, a w G54 zostało Z −312,4 z poprzedniego pomiaru. Program zaczyna od `G00 X44. Z2.`, potem `G00 X38.`. Co się stanie?", options: ["nóż wjedzie ruchem szybkim w pręt, 8 mm za nowym czołem", "nóż stanie 2 mm przed czołem, jak w programie", "nóż stanie 12 mm przed czołem i zacznie skrawać w powietrzu", "sterowanie samo wykryje nowe czoło"], answer: 0, why: "Czoło przesunęło się o 10 mm w stronę +Z, a Z0 nie. Z2 z programu leży więc 8 mm za nowym czołem, w stronę uchwytu. X44 jest jeszcze nad prętem Ø40, ale `X38.` prowadzi nóż ruchem szybkim w materiał." },
        { kind: "choice", q: "Tokarka ze skośnym łożem, głowica za osią. Dokąd prowadzi +X?", options: ["od operatora", "do operatora", "w stronę uchwytu", "w górę zawsze"], answer: 0, why: "+X od osi w stronę noża, a nóż jest za osią." },
      ],
    },
  ],

  pitfalls: [
    { title: "Z0 na surowym czole", x: "Pomiar na czole po piłowaniu, bez planowania. Czoło ma odchyłki rzędu dziesiątych milimetra — wszystkie długości w Z przesuną się o tyle samo." },
    { title: "Stare Z0 po przełożeniu pręta", danger: true, x: "Pręt wysunięty z uchwytu o 10 mm więcej, a przesunięcie zostało. Cały program przesuwa się o 10 mm — nóż zaczyna skrawać w powietrzu albo wchodzi za głęboko." },
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
    { kind: "choice", q: "Gdzie podręczniki umieszczają zero maszyny M na tokarce?", options: ["na osi, na czole końcówki wrzeciona", "na czole detalu", "na koniku", "na narzędziu"], answer: 0, why: "Tam mocuje się uchwyt. Od czego liczy pozycje maszynowe konkretna maszyna, ustala producent — często od punktu referencyjnego." },
  ],

  summary: [
    "M (w podręcznikach) na czole wrzeciona, W na czole detalu — oba na osi. Zero współrzędnych maszynowych ustala producent.",
    "Zero detalu ustala się tu tylko w Z: planowanie czoła i zapis Z0. Każdy nóż mierzy się jeszcze w X.",
    "Po przełożeniu pręta pomiar Z0 trzeba powtórzyć.",
    "+X zawsze od osi w stronę noża. Program jest ten sam dla głowicy przedniej i tylnej.",
  ],

  sources: [
    { id: "fanuc", where: "przesunięcie przedmiotu na tokarce, pomiar korekcji" },
    { id: "sinumerik", where: "punkty M i W tokarki, pomiar detalu i narzędzia" },
  ],
};
