import type { LessonDoc } from "@/lib/lesson";

/*
  Zadanie końcowe ścieżki frezowania: ten sam typ operacji co w płytce 80 × 50,
  ale inny wymiar, zero na środku detalu i inny promień narzędzia.
  Uczeń pisze cały program, a nie uzupełnia gotowy szablon.
*/

const solution = `O3000 (PLYTKA 60X40 - ZADANIE KONCOWE)
(ZERO W: SRODEK PLYTKI, Z0 NA GORZE)
G21 G90 G94 G17
G40 G49 G80
G54
T1 M06 (FREZ FI12)
G43 H1 Z50.
S2000 M03
M08
G00 X-46. Y-8.
G00 Z5.
G01 Z-4. F150
G41 D1 G01 X-38. F400
G03 X-30. Y0. R8.
G01 Y14.
G02 X-24. Y20. R6.
G01 X24.
G02 X30. Y14. R6.
G01 Y-14.
G02 X24. Y-20. R6.
G01 X-24.
G02 X-30. Y-14. R6.
G01 Y0.
G03 X-38. Y8. R8.
G40 G01 X-46.
G00 Z50.
M09
M05
G91 G28 Z0.
G90
M30`;

const starter = `O3000 (PLYTKA 60X40 - ZADANIE KONCOWE)
(ZERO W: SRODEK PLYTKI, Z0 NA GORZE)
(FREZ FI12: T1, H1, D1)
(NAPISZ CALY PROGRAM: BLOK STARTOWY, NARZEDZIE, OBROTY,)
(ZEJSCIE, NAJAZD, KONTUR, ODJAZD, KONIEC)
M30`;

export const f8_1: LessonDoc = {
  id: "F8.1",
  slug: "f8-1-zadanie-koncowe-plytka",
  title: "Zadanie końcowe: nowa płytka",
  minutes: 25,
  goal: "Samodzielnie napiszesz program konturu detalu o innym wymiarze, innym położeniu zera i innym promieniu narzędzia niż płytka z kursu.",

  theory: [
    { t: "h", x: "Co się zmienia", id: "zmiany" },
    { t: "p", x: "Program płytki 80 × 50 powstawał po kawałku, z podpowiedziami w każdej lekcji. Tu dostajesz nowy rysunek i piszesz program od pustej strony. Rodzaj operacji jest ten sam — kontur zewnętrzny z korekcją promienia — ale trzy rzeczy są inne niż w kursie." },
    { t: "table", head: ["", "Płytka z kursu", "Nowy detal"], rows: [
      ["Wymiar", "80 × 50, naroża R10", "60 × 40, naroża R6"],
      ["Zero W", "lewy dolny narożnik", "środek górnej powierzchni"],
      ["Narzędzie", "frez Ø10, r = 5", "frez Ø12, r = 6"],
      ["Głębokość konturu", "5 mm", "4 mm"],
    ] },
    { t: "diagram", id: "f81-part" },

    { t: "h", x: "Współrzędne od środka", id: "srodek" },
    { t: "p", x: "Przy zerze na środku krawędzie leżą symetrycznie: X−30 i X30, Y−20 i Y20. Łuk naroża R6 zaczyna się 6 mm przed narożnikiem, więc odcinki proste kończą się w X±24 albo Y±14. Zero na środku ustawia się zwykle przez pomiar dwóch przeciwległych krawędzi i wzięcie środka — sposób zależy od sondy i cyklu pomiarowego maszyny (lekcja F0.3)." },
    { t: "note", kind: "info", x: "Promień naroża równy promieniowi freza (R6 przy Ø12) nie przeszkadza: naroże jest **wypukłe**, frez obchodzi je z zewnątrz. Na narożu wklęsłym frez nie wykona promienia mniejszego niż własny." },

    { t: "h", x: "Plan programu", id: "plan" },
    { t: "ul", items: [
      "Blok startowy: jednostki, wymiary absolutne, posuw na minutę, płaszczyzna, kasowanie korekcji, G54 (lekcja F1.5).",
      "Narzędzie i korekcja długości: `T1 M06`, `G43 H1` (lekcja F4.1).",
      "Obroty i chłodziwo: `S2000 M03`, `M08` (lekcje F2.2 i F2.4).",
      "Dojazd szybki obok detalu i zejście na głębokość posuwem dla wejścia (lekcja F3.2).",
      "Najazd z korekcją G41 po łuku stycznym, obieg, odjazd i G40 (lekcja F4.3).",
      "Odjazd w Z, wyłączenie chłodziwa i wrzeciona, koniec programu.",
    ] },
    { t: "diagram", id: "f81-path" },
    { t: "p", x: "Łuk najazdu musi mieć promień większy niż frez. Przy frezie Ø12 łuk R8 zostawia 2 mm zapasu. Odcinek z G41 przed łukiem ma 8 mm — więcej niż promień 6, więc sterowanie zdąży odsunąć środek freza." },
  ],

  worked: {
    title: "Najazd i pierwsze naroże",
    intro: "Sytuacja: frez Ø12 ma zejść obok płytki w X−46 Y−8, wejść na środek lewej krawędzi łukiem R8 i obejść kontur zgodnie z zegarem. Policz punkty najazdu i pierwszego naroża. Numery na rysunku to numery kroków.",
    fig: "f81-path",
    steps: [
      { x: "Zejście obok detalu: X−46 leży 16 mm od krawędzi X−30, czyli 10 mm poza zasięgiem freza o promieniu 6.", code: "G00 X-46. Y-8.  G00 Z5.  G01 Z-4. F150" },
      { x: "Odcinek w powietrzu z włączeniem korekcji. Łuk R8 kończy się w X−30 Y0, więc jego środek leży 8 mm na lewo od krawędzi, w X−38 Y0. Łuk zaczyna się 8 mm pod środkiem — w X−38 Y−8.", code: "G41 D1 G01 X-38. F400" },
      { x: "Łuk styczny do lewej krawędzi — na jej środku frez porusza się już w kierunku +Y.", code: "G03 X-30. Y0. R8." },
      { x: "Lewa krawędź do początku naroża i naroże R6 do górnej krawędzi.", code: "G01 Y14.  G02 X-24. Y20. R6." },
      { x: "Po obiegu powrót do Y0, odjazd lustrzanym łukiem i wyłączenie korekcji w powietrzu.", code: "G03 X-38. Y8. R8.  G40 G01 X-46." },
    ],
    result: "Pozostałe naroża liczy się tak samo: odcinek kończy się 6 mm przed narożnikiem, łuk G02 R6 dochodzi do kolejnej krawędzi. Każda liczba w programie jest wymiarem z rysunku albo różnicą dwóch wymiarów.",
  },

  practice: [
    {
      kind: "drill",
      intro: "Zanim napiszesz program — przewiduj.",
      questions: [
        { kind: "choice", q: "Program jest liczony od środka płytki, ale operator ustawił G54 w lewym dolnym narożniku, jak w kursie. Co się stanie po starcie?", options: ["zejście wypadnie w powietrzu, ale obieg przetnie płytkę — cały tor jest przesunięty o 30 mm w X i 20 mm w Y", "frez obrobi kontur poprawnie, bo G41 sam znajdzie krawędź", "sterowanie zgłosi alarm braku zera", "frez obrobi tylko lewą połowę konturu"], answer: 0, why: "Sterowanie liczy współrzędne od ustawionego zera. Prostokąt X−30…30, Y−20…20 trafi wtedy na X−30…30, Y−20…20 od narożnika — jego prawa i górna część przechodzi przez materiał płytki." },
        { kind: "gap", q: "Górna krawędź prowadzi w prawo do początku prawego górnego naroża R6. Jaki X kończy ten odcinek?", template: "X{0}", answers: [["24"]], why: "Krawędź X30 minus promień naroża 6." },
        { kind: "choice", q: "Ktoś zmienił łuk najazdu na R5, zostawiając frez Ø12. Czego się spodziewasz?", options: ["frez nie zmieści się w łuku mniejszym niż jego promień — sterowanie zwykle zgłosi alarm korekcji", "łuk zostanie wykonany, tylko szybciej", "nic się nie zmieni", "frez wejdzie na kontur prostopadle"], answer: 0, why: "Przy korekcji środek freza jedzie po łuku o promieniu 8 − 6 = 2 mm. Przy R5 wychodzi promień ujemny. Sterowanie zwykle przerywa wtedy program alarmem korekcji — dokładna reakcja zależy od sterowania." },
      ],
    },
    {
      kind: "task",
      intro: "Napisz cały program konturu płytki 60 × 40 z rysunku, na głębokość 4 mm. Dane: frez Ø12 jako T1 z korekcjami H1 i D1, S2000 M03, chłodziwo. Zejście z Z5 na Z−4 w punkcie X−46 Y−8 z F150. Najazd z G41 po odcinku w kierunku +X i łukiem R8 stycznie do środka lewej krawędzi, kontur zgodnie z zegarem z F400, odjazd lustrzanym łukiem R8 i G40 do X−46. Sprawdzanie porównuje tor roboczy z wymaganym konturem.",
      starter,
      mode: "mill",
      checks: [
        { t: "cut", reference: solution, tolerance: 0.05 },
        { t: "approach", x: -46, y: -8, z: 5, label: "Ruch szybki nad X−46 Y−8, potem w dół na Z5" },
        { t: "feed", on: "plunge", f: 150, label: "Zejście w Z z F150" },
        { t: "feed", on: "xy", f: 400, label: "Kontur z F400" },
        { t: "coolant", label: "Chłodziwo na ruchach roboczych", offBeforeStop: true },
        { t: "require", codes: ["G43", "G41", "G40", "M03"] },
      ],
      hints: [
        "Krawędzie: X±30 i Y±20. Odcinki proste kończą się 6 mm przed narożnikiem — w X±24 albo Y±14.",
        "Najazd: `G41 D1 G01 X-38. F400`, potem `G03 X-30. Y0. R8.`",
        "Obieg: `G01 Y14.`, `G02 X-24. Y20. R6.`, `G01 X24.`, `G02 X30. Y14. R6.` — dalej tak samo do `G01 Y0.`",
        "Odjazd: `G03 X-38. Y8. R8.`, `G40 G01 X-46.`, potem `G00 Z50.`",
      ],
      solution,
    },
  ],

  pitfalls: [
    { title: "Program od środka, zero w narożniku", danger: true, x: "Najczęstszy błąd przy zmianie detalu: program liczony od środka, a G54 ustawione jak w poprzednim zleceniu. Tor przesuwa się o połowę wymiarów i przechodzi przez materiał. Przed startem porównaj komentarz z zerem w programie z tym, co jest w G54." },
    { title: "Stare liczby z poprzedniego detalu", x: "Program przerobiony z płytki 80 × 50: zostały `R10.` w jednym narożu albo `X80.` w jednej krawędzi. Symulacja pokazuje wtedy kontur z wyraźnym schodkiem. Pisząc od nowa, bierz każdą liczbę z nowego rysunku." },
    { title: "Łuk najazdu dobrany do starego freza", danger: true, x: "Łuk R6 był dobry przy frezie Ø10, a przy Ø12 jest równy promieniowi narzędzia. Środek freza nie ma po czym jechać — sterowanie przerywa program albo frez zatrzymuje się na ścianie. Promień łuku najazdu dobieraj do narzędzia, które naprawdę jest w programie." },
  ],

  controllers: {
    rows: [
      ["Zero na środku detalu", "`G54` ustawione na środku, pomiar dwóch krawędzi", "`G54` — przesunięcie nastawne, pomiar w JOG"],
      ["Korekcja promienia", "`G41 D1`", "`G41` z aktywnym `D1` narzędzia T1"],
      ["Łuk z promieniem", "`G03 X-30. Y0. R8.`", "`G3 X-30 Y0 CR=8`"],
      ["Koniec programu", "`M30`", "`M30`"],
    ],
    note: "Plan programu jest taki sam na obu sterowaniach. Różni się zapis łuku z promieniem i sposób pomiaru zera.",
  },

  quiz: [
    { kind: "choice", review: "F0.3", q: "Gdzie operator ustawia przesunięcie G54 dla programu z tej lekcji?", options: ["na środku górnej powierzchni płytki", "w lewym dolnym narożniku", "na stole maszyny", "w punkcie wymiany narzędzia"], answer: 0, why: "Zero w programie i zero w G54 muszą leżeć w tym samym punkcie detalu." },
    { kind: "choice", review: "F4.2", q: "Co trzeba zmienić, gdy zamiast freza Ø12 użyjesz Ø10?", options: ["wartość w rejestrze D (i sprawdzić łuk najazdu)", "wszystkie współrzędne konturu", "G41 na G42", "nic"], answer: 0, why: "Kontur jest zapisany wymiarami z rysunku, promień narzędzia siedzi w rejestrze D. Łuk R8 przy r = 5 nadal jest poprawny." },
    { kind: "gap", q: "Prawa krawędź prowadzi w dół do początku prawego dolnego naroża. Jaki Y kończy ten odcinek?", template: "Y{0}", answers: [["-14", "−14"]], why: "Krawędź Y−20 plus promień naroża 6." },
    { kind: "choice", q: "Dlaczego zejście na głębokość jest w X−46, a nie w X−36?", options: ["w X−36 frez o promieniu 6 sięgałby do X−30 i zszedłby na krawędź detalu", "bo G41 wymaga X−46", "bo tak było w płytce z kursu", "bez znaczenia"], answer: 0, why: "Zejście robi się w powietrzu: odległość od krawędzi musi być większa niż promień freza, z zapasem." },
    { kind: "choice", q: "Który kierunek obiegu daje frezowanie współbieżne przy M03 i konturze zewnętrznym?", options: ["zgodnie z zegarem", "przeciwnie do zegara", "oba tak samo", "zależy od G54"], answer: 0, why: "Jak w płytce z kursu: kontur zewnętrzny, obroty w prawo, obieg zgodnie z zegarem." },
  ],

  summary: [
    "Nowy detal: każda liczba z nowego rysunku, zero w programie zgodne z G54.",
    "Przy zerze na środku krawędzie leżą symetrycznie, np. X±30 i Y±20.",
    "Promień narzędzia siedzi w rejestrze D; łuk najazdu dobiera się do niego.",
    "Plan programu jest stały: start, narzędzie, obroty, zejście, najazd, kontur, odjazd, koniec.",
  ],

  sources: [
    { id: "fanuc", where: "korekcja promienia G41/G40, interpolacja kołowa z R" },
    { id: "sinumerik", where: "G41 z D narzędzia, łuk z promieniem CR=" },
  ],
};
