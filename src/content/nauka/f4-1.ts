import type { LessonDoc } from "@/lib/lesson";

export const f4_1: LessonDoc = {
  id: "F4.1",
  slug: "f4-1-g43-korekcja-dlugosci",
  title: "G43 — korekcja długości",
  minutes: 13,
  goal: "Włączysz korekcję długości narzędzia i zrozumiesz, jak łączy się ona z wartością Z w przesunięciu G54.",

  theory: [
    { t: "h", x: "Każde narzędzie ma inną długość", id: "dlugosc" },
    { t: "p", x: "Program podaje położenie **czubka** narzędzia: `Z5.` znaczy 5 mm nad detalem. Maszyna porusza jednak czołem wrzeciona — bazą narzędzia N z lekcji F0.2. Frez o długości 85 mm i wiertło o długości 103 mm w tym samym położeniu wrzeciona mają czubki w różnych miejscach." },
    { t: "p", x: "Długość każdego narzędzia, mierzona od N do czubka, jest zapisana w tabeli korekcji. [[G43]] z adresem **H** włącza korekcję: sterowanie dodaje długość z rejestru i ustawia wrzeciono tak, żeby czubek trafił w Z z programu." },
    { t: "diagram", id: "f41-length" },
    { t: "code", x: "T1 M06\nG43 H1 Z50.   (KOREKCJA DLUGOSCI T1, CZUBEK NA Z50)", caption: "G43 włącza się razem z ruchem w Z — pierwszym po wymianie narzędzia, na bezpiecznej wysokości." },

    { t: "h", x: "Jak mierzy się długość", id: "pomiar" },
    { t: "ul", items: [
      "**Poza maszyną** — na przyrządzie do ustawiania narzędzi (presetterze). Wynik trafia do tabeli ręcznie albo przez sieć.",
      "**Na maszynie** — sondą narzędziową albo laserem. Maszyna sama wpisuje długość do rejestru H.",
      "**Dotykiem detalu** — narzędzie dotyka powierzchni, a operator zapisuje pozycję. To metoda awaryjna, obarczona błędem odczytu.",
    ] },

    { t: "h", x: "Z w przesunięciu G54", id: "z-g54" },
    { t: "p", x: "Z lekcji F0.3 zostało pytanie, co wpisać w kolumnie Z rejestru G54. Przy długościach mierzonych od N wpisuje się tam pozycję maszynową, jaką miałoby czoło wrzeciona N, gdyby dotykało górnej powierzchni detalu. Wtedy dla każdego narzędzia:" },
    { t: "code", x: "Z maszyny (N) = Z z G54 + Z z programu + H\n       −309,8 =  −400,0  +     5,0      + 85,2" },
    { t: "note", kind: "info", x: "Niektóre zakłady stosują drugą metodę: długość każdego narzędzia mierzy się od powierzchni detalu, rejestr H jest wtedy ujemny, a Z w G54 zostaje zerem. Zasada G43 się nie zmienia — różni się tylko to, gdzie leży liczba." },
  ],

  worked: {
    title: "Pozycja wrzeciona dla dwóch narzędzi",
    intro: "G54 Z = −400,0. Frez T1: H1 = 85,2. Wiertło T2: H2 = 102,7. Program każe obu stanąć czubkiem na Z5.",
    steps: [
      { x: "T1: −400 + 5 + 85,2.", code: "N w Z−309,8" },
      { x: "T2: −400 + 5 + 102,7.", code: "N w Z−292,3" },
      { x: "Różnica pozycji wrzeciona to różnica długości: 102,7 − 85,2.", code: "17,5 mm" },
      { x: "W obu programach zapis jest identyczny, zmienia się tylko numer H.", code: "G43 H2 Z5." },
    ],
    result: "Dłuższe wiertło ustawia wrzeciono 17,5 mm wyżej. Program o tym nie wie — liczy się tylko to, że H odpowiada narzędziu we wrzecionie.",
  },

  practice: [
    {
      kind: "drill",
      intro: "Korekcja długości w liczbach i w zapisie.",
      questions: [
        { kind: "gap", q: "G54 Z = −380, H3 = 92,5, program: `G43 H3 Z10.`. Gdzie stanie N (pozycja maszynowa Z)?", template: "Z{0}", answers: [["-277.5", "-277,5"]], why: "−380 + 10 + 92,5 = −277,5." },
        { kind: "token", q: "Tapnij słowo, które wskazuje **rejestr długości**.", block: "G43 H1 Z50.", answer: 1, why: "H1 — rejestr korekcji długości nr 1." },
        { kind: "choice", q: "We wrzecionie jest T2, a program ma `G43 H1`. Co się stanie?", options: ["sterowanie użyje długości T1 — czubek trafi w złe miejsce", "sterowanie samo weźmie H2", "alarm", "nic, H nie ma znaczenia"], answer: 0, why: "Sterowanie nie sprawdza, czy H pasuje do narzędzia." },
        { kind: "order", q: "Ułóż początek pracy narzędzia.", items: ["S2500 M03", "G43 H1 Z50.", "T1 M06", "G00 X-20. Y10."], answer: [2, 1, 0, 3], why: "Wymiana, korekcja z ruchem na bezpieczną wysokość, obroty, najazd." },
      ],
    },
  ],

  pitfalls: [
    { title: "H innego narzędzia", x: "`T2 M06`, a potem `G43 H1`. Wiertło dłuższe o 17,5 mm od frezu jedzie z długością frezu — czubek zejdzie 17,5 mm niżej, niż mówi program. Zasada: numer H równy numerowi T." },
    { title: "Brak G43 po wymianie", x: "Program pominął `G43`. Sterowanie liczy bez długości narzędzia, a Z z programu odnosi się do czoła wrzeciona. Przy metodzie z długościami od N narzędzie wbije się w detal." },
    { title: "G49 po G43", x: "`G49` wpisane w środek programu wyłącza korekcję. Następny ruch w Z przesunie wrzeciono o całą długość narzędzia." },
    { title: "Nowe narzędzie bez pomiaru", x: "Wymiana płytki albo przezbrojenie oprawki zmienia długość. Stara wartość w H daje błąd głębokości równy różnicy długości." },
  ],

  controllers: {
    rows: [
      ["Włączenie korekcji długości", "`G43 H1`", "automatycznie z `T1 D1`"],
      ["Wyłączenie", "`G49`", "`D0`"],
      ["Gdzie jest długość", "rejestr H w tabeli korekcji", "dane narzędzia, ostrze D"],
    ],
    note: "Sinumerik nie ma G43: długość działa, gdy aktywne jest narzędzie z numerem ostrza D. Na Fanucu frezarskim korekcję włącza się jawnie w programie.",
  },

  quiz: [
    { kind: "choice", review: "F3.5", q: "Co robi `G04 X0.3`?", options: ["postój 0,3 s", "ruch do X0.3", "postój 3 obroty", "zmianę korekcji"], answer: 0, why: "G04 z X z kropką — sekundy." },
    { kind: "choice", q: "Co włącza `G43 H1`?", options: ["korekcję długości z rejestru 1", "korekcję promienia", "przesunięcie G54", "narzędzie nr 1"], answer: 0, why: "G43 — korekcja długości, H — numer rejestru." },
    { kind: "choice", q: "Od czego mierzy się długość narzędzia przy metodzie z presetterem?", options: ["od bazy N na czole wrzeciona do czubka", "od zera W", "od zera maszyny M", "od stołu"], answer: 0, why: "Długość to odległość N — czubek." },
    { kind: "gap", q: "G54 Z = −420, H5 = 110, program `G43 H5 Z2.`. Pozycja maszynowa N:", template: "Z{0}", answers: [["-308"]], why: "−420 + 2 + 110 = −308." },
    { kind: "choice", q: "Kiedy zwykle włącza się G43?", options: ["zaraz po wymianie narzędzia, z ruchem na bezpieczną wysokość", "na końcu programu", "przed M06", "w bloku startowym"], answer: 0, why: "Korekcja musi być aktywna przed pierwszym ruchem w stronę detalu." },
    { kind: "choice", q: "Po wymianie płytki w głowicy frezowej trzeba:", options: ["zmierzyć długość i zaktualizować H", "zmienić G54", "zmienić program", "nic"], answer: 0, why: "Nowa płytka może zmienić długość narzędzia." },
    { kind: "token", q: "Tapnij kod, który **wyłącza** korekcję długości.", block: "G43 G49 G41 G40", answer: 1, why: "G49 — wyłączenie korekcji długości." },
  ],

  summary: [
    "Program podaje położenie czubka, a długość narzędzia dolicza G43 z rejestru H.",
    "G43 H… włącza się po wymianie, razem z ruchem na bezpieczną wysokość.",
    "Numer H = numer T. Zły rejestr to błąd głębokości równy różnicy długości.",
    "Przy długościach od N: Z maszyny = G54 Z + Z programu + H.",
  ],

  sources: [
    { id: "fanuc", where: "korekcja długości narzędzia G43/G44/G49, tabela korekcji" },
    { id: "sinumerik", where: "korekcja narzędzia, ostrza D, D0" },
  ],
};
