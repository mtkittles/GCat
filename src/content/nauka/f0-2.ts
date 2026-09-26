import type { LessonDoc } from "@/lib/lesson";

export const f0_2: LessonDoc = {
  id: "F0.2",
  slug: "f0-2-punkty-zerowe",
  title: "Punkty zerowe M, R i W",
  minutes: 12,
  goal: "Rozróżnisz zero maszyny, punkt referencyjny i zero detalu oraz przeliczysz pozycję maszynową na współrzędną z programu.",

  theory: [
    { t: "h", x: "Dwa układy, kilka punktów", id: "punkty" },
    { t: "p", x: "Na obrabiarce działają jednocześnie dwa układy współrzędnych: **maszynowy**, związany z konstrukcją, i **układ detalu**, w którym piszesz program. Opisują je punkty charakterystyczne:" },
    { t: "table", head: ["Punkt", "Nazwa", "Kto go ustala"], rows: [
      ["**M**", "zero maszyny, początek układu maszynowego", "producent — stały"],
      ["**R**", "punkt referencyjny, na który najeżdża się przy bazowaniu", "producent — krańcówki lub znaczniki liniałów"],
      ["**W**", "[[zero detalu]], początek układu programu", "programista i operator — dla każdego zamocowania"],
      ["**N**", "baza narzędzia na czole wrzeciona", "producent — od niej mierzy się długość narzędzia"],
    ] },
    { t: "diagram", id: "f02-points" },

    { t: "h", x: "Bazowanie osi", id: "bazowanie" },
    { t: "p", x: "Maszyna z enkoderami przyrostowymi po włączeniu nie wie, gdzie są osie. Operator wykonuje **bazowanie**: każda oś dojeżdża do punktu R i dopiero wtedy pozycja maszynowa ma sens. Maszyny z enkoderami absolutnymi pamiętają położenie i bazowania po włączeniu nie wymagają." },
    { t: "note", kind: "warn", x: "Przed bazowaniem nie uruchamiaj programu. Sterowanie nie zna położenia osi, a programowe wyłączniki krańcowe zaczynają działać dopiero po bazowaniu." },

    { t: "h", x: "Dlaczego pozycje maszynowe są ujemne", id: "ujemne" },
    { t: "p", x: "Na wielu centrach pionowych M leży w skrajnym położeniu osi: wrzeciono najwyżej, stół odsunięty maksymalnie w jedną stronę. Każde inne miejsce przestrzeni roboczej leży od M w stronę minusa, więc pozycje maszynowe są ujemne. Na innych obrabiarkach M bywa w innym miejscu — mówi o tym dokumentacja maszyny." },

    { t: "h", x: "Jak łączą się układy", id: "lancuch" },
    { t: "p", x: "Pozycja maszynowa to suma przesunięcia zera detalu i współrzędnej z programu. Dla każdej osi osobno:" },
    { t: "code", x: "X maszyny = X przesunięcia + X z programu\n  −260    =     −320      +     60", caption: "Przesunięcie to wektor od M do W. Zapisuje się je w rejestrze G54 — lekcja F0.3." },
    { t: "diagram", id: "f02-chain" },
    { t: "p", x: "Program zna tylko W. Dzięki temu ten sam program pasuje do detalu w dowolnym miejscu stołu — zmienia się tylko przesunięcie." },

    { t: "h", x: "Gdzie postawić W", id: "gdzie-w" },
    { t: "p", x: "Najlepiej w punkcie, od którego zwymiarowano rysunek, czyli na przecięciu baz. Wymiary przechodzą wtedy do programu bez przeliczania, a tolerancje się nie sumują." },
    { t: "diagram", id: "f02-datum" },
  ],

  worked: {
    title: "Przelicz pozycję maszynową na współrzędną programu",
    intro: "Rejestr G54 ma X−320 Y−260. Ekran pozycji maszynowej pokazuje X−260.000 Y−240.000. Gdzie stoi narzędzie w układzie detalu?",
    steps: [
      { x: "Dla każdej osi: pozycja maszynowa = przesunięcie + współrzędna z programu. Szukasz współrzędnej z programu, więc odejmujesz." },
      { x: "X: −260 − (−320) = 60.", code: "X60" },
      { x: "Y: −240 − (−260) = 20.", code: "Y20" },
      { x: "Porównaj z rysunkiem: to punkt H z lekcji F0.1." },
    ],
    result: "Narzędzie stoi nad punktem H, `X60 Y20`. Ekran ABSOLUTE na Fanucu i WCS na Sinumeriku wykonują to samo odejmowanie i pokazują wynik od razu.",
  },

  practice: [
    {
      kind: "offset",
      intro: "Stół z góry. M jest w prawym tylnym rogu przestrzeni roboczej, zero detalu zapisano w G54. Poruszaj narzędziem i obserwuj oba odczyty. Skok 100 mm skraca drogę.",
      parts: [{ reg: "G54", x: -320, y: -260, label: "detal" }],
      goals: [
        { kind: "move", frame: "M", x: -200, y: -100, label: "pozycja maszynowa X−200 Y−100" },
        { kind: "move", frame: "G54", x: 0, y: 0, label: "stań nad zerem W i porównaj z wartością w G54" },
        { kind: "move", frame: "G54", x: 60, y: 20, label: "punkt H z lekcji F0.1" },
        { kind: "move", frame: "G54", x: 80, y: 50, label: "prawy tylny narożnik detalu" },
      ],
    },
  ],

  pitfalls: [
    { title: "Program przed bazowaniem", x: "Po awarii zasilania albo wyłączeniu maszyny z enkoderami przyrostowymi pozycja maszynowa jest nieznana. Program uruchomiony w takim stanie jedzie od przypadkowego punktu, a krańcówki programowe nie chronią osi." },
    { title: "Pozycja maszynowa w programie", x: "Operator odczytuje z ekranu MACHINE `X-260` i wpisuje to do programu. Program liczy od W, więc potrzebne jest `X60`. Pozycje maszynowe pojawiają się w programie tylko wyjątkowo, z kodem `G53`." },
    { title: "Zero detalu poza bazami", x: "W postawione na środku, choć rysunek wymiarowano od krawędzi A i B. Każdy wymiar trzeba przeliczać, a wynik przeliczenia sumuje tolerancje dwóch wymiarów." },
    { title: "R to nie zawsze M", x: "R to punkt najazdu przy bazowaniu, M to początek układu maszynowego. Często leżą w tym samym miejscu, ale nie muszą — wtedy R ma w układzie maszynowym współrzędne zapisane w parametrach maszyny." },
  ],

  controllers: {
    rows: [
      ["Bazowanie", "tryb REF (ZRN), powrót do punktu referencyjnego", "tryb REF POINT"],
      ["Najazd na R z programu", "`G28` przez punkt pośredni", "`G74`"],
      ["Ruch w układzie maszyny", "`G53`, tylko w jednym bloku", "`G53` lub `SUPA`, tylko w jednym bloku"],
      ["Ekran pozycji", "MACHINE i ABSOLUTE", "MCS i WCS"],
    ],
    note: "Sinumerik w trybie języka ISO rozumie `G28`. W natywnym języku Siemensa najazd na punkt referencyjny to `G74`.",
  },

  quiz: [
    { kind: "choice", review: "F0.1", q: "Z0 leży na górnej powierzchni. Narzędzie ma stać **10 mm nad** detalem:",
      options: ["`Z-10`", "`Z10`", "`Z0`", "`Z100`"], answer: 1, why: "Nad powierzchnią Z jest dodatnie." },
    { kind: "choice", q: "Który punkt ustala się osobno dla każdego zamocowania detalu?",
      options: ["M", "R", "W", "N"], answer: 2, why: "W to zero detalu. M, R i N są stałe i ustala je producent." },
    { kind: "choice", q: "Maszyna z enkoderami przyrostowymi została właśnie włączona. Co najpierw?",
      options: ["uruchomienie programu", "bazowanie osi", "ustawienie G54", "wymiana narzędzia"], answer: 1,
      why: "Bez bazowania sterowanie nie zna położenia osi, więc ani pomiar zera, ani program nie mają sensu." },
    { kind: "gap", q: "G54: X−320 Y−260. Narzędzie stoi w programie w punkcie X30 Y10. Co pokaże ekran **MASZYNA**?",
      template: "X{0} Y{1}", answers: [["-290"], ["-250"]], why: "Przesunięcie + program: −320 + 30 = −290 oraz −260 + 10 = −250." },
    { kind: "gap", q: "G54: X−320 Y−260. Ekran MASZYNA: X−240 Y−215. Gdzie jest narzędzie w układzie **detalu**?",
      template: "X{0} Y{1}", answers: [["80"], ["45"]], why: "Maszyna − przesunięcie: −240 − (−320) = 80 oraz −215 − (−260) = 45." },
    { kind: "choice", q: "Dlaczego na wielu frezarkach pozycje maszynowe w przestrzeni roboczej są ujemne?",
      options: ["sterowanie liczy w calach", "M leży w skrajnym położeniu osi, a przestrzeń robocza jest od niego w stronę minusa", "wymaga tego G54", "to objaw źle wykonanego bazowania"],
      answer: 1, why: "Zero maszyny leży na końcu zakresu ruchu, więc każda inna pozycja ma znak minus." },
    { kind: "choice", q: "Rysunek zwymiarowano od krawędzi A (dolnej) i B (lewej). Gdzie najwygodniej postawić W?",
      options: ["na środku detalu", "na przecięciu A i B", "w punkcie M", "w prawym górnym narożniku"], answer: 1,
      why: "Wymiary z rysunku przechodzą wtedy do programu bez przeliczania." },
  ],

  summary: [
    "M to stałe zero maszyny, R to punkt bazowania, W to zero detalu ustalane dla każdego zamocowania.",
    "Bez bazowania pozycja maszynowa nie ma sensu, więc programu się nie uruchamia.",
    "Pozycja maszynowa = przesunięcie zera detalu + współrzędna z programu.",
    "W stawiaj na bazach z rysunku — wymiary przechodzą do programu bez przeliczania.",
  ],

  sources: [
    { id: "sinumerik", where: "punkty M, R, W i baza narzędzia, bazowanie, G74, G53 i SUPA" },
    { id: "fanuc", where: "powrót do punktu referencyjnego, G28, G53, ekran pozycji" },
  ],
};
