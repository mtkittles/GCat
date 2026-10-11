import type { LessonDoc } from "@/lib/lesson";

export const t2_1: LessonDoc = {
  id: "T2.1",
  slug: "t2-1-narzedzie-t0101",
  title: "Narzędzie: T0101 i T/D",
  minutes: 13,
  goal: "Wywołasz nóż z głowicy z właściwą korekcją i skorygujesz średnicę detalu korekcją zużycia.",

  theory: [
    { t: "h", x: "Słowo T na tokarce", id: "t" },
    { t: "p", x: "Na tokarce Fanuc słowo T ma cztery cyfry: dwie pierwsze wybierają **pozycję w głowicy**, dwie ostatnie — **numer rejestru korekcji**. `T0101` to nóż z pozycji 1 z korekcją 1. Nie ma M06: [[głowica rewolwerowa|głowica]] obraca się od razu po odczytaniu bloku." },
    { t: "note", kind: "info", x: "Format czterocyfrowy to profil przyjęty w kursie i najczęstszy na tokarkach Fanuc. Liczbę cyfr i podział na pozycję i korekcję ustawia parametr sterowania — na innej maszynie sprawdź go w jej dokumentacji." },
    { t: "diagram", id: "t21-turret" },
    { t: "note", kind: "warn", x: "Głowica obraca się tam, gdzie akurat stoi. Przed każdym T nóż musi być w bezpiecznym miejscu — w punkcie referencyjnym albo w punkcie wymiany, daleko od detalu i konika. Inaczej inny nóż w głowicy może uderzyć w detal podczas obrotu." },

    { t: "h", x: "Korekcje noża", id: "korekcje" },
    { t: "p", x: "Każdy nóż ma w tabeli dwie grupy wartości. **Geometria** — odległość ostrza od punktu bazowego głowicy w X i Z, mierzona przy ustawianiu narzędzia. **Zużycie** — małe poprawki, którymi operator ustawia wymiar detalu bez zmiany programu." },
    { t: "diagram", id: "t21-offsets" },
    { t: "p", x: "W tym samym wierszu tabeli stoją jeszcze promień naroża płytki R i kierunek ostrza (kolumna T, lekcja T4.2). Oba są potrzebne do korekcji promienia ostrza (moduł T4). Jeden wiersz opisuje więc cały nóż: pozycję w głowicy wybiera słowo T, a wiersz — geometrię, zużycie, R i kierunek ostrza." },

    { t: "h", x: "Korekcja zużycia a wymiar", id: "zuzycie" },
    { t: "p", x: "Korekcja X na tokarce jest zwykle w średnicy, tak jak programowanie. Zmierzona średnica trafia do korekcji wprost, bez dzielenia na pół." },
    { t: "table", head: ["Pomiar", "Rysunek", "Zużycie X"], rows: [
      ["Ø30,04", "Ø30,00", "−0,04"],
      ["Ø29,97", "Ø30,00", "+0,03"],
    ], caption: "Za duża średnica — korekcja w minus, nóż podejdzie bliżej osi. Inaczej niż przy korekcji promienia frezu, tu nie dzieli się odchyłki na pół." },

    { t: "h", x: "Plan narzędzi wałka", id: "plan" },
    { t: "table", head: ["T", "Narzędzie", "Moduł"], rows: [
      ["`T0101`", "nóż zewnętrzny CNMG R0,8 — planowanie i zgrubnie", "T2, T3, T5"],
      ["`T0202`", "nóż wykańczający VBMT R0,4", "T3–T5"],
      ["`T0303`", "nóż do rowków 3 mm", "T6"],
      ["`T0404`", "nóż do gwintów 60°, płytka 1,5 mm", "T7"],
      ["`T0505`", "wiertło Ø8", "T6"],
    ] },
  ],

  worked: {
    title: "Zmiana noża w programie wałka",
    intro: "Sytuacja: nóż zgrubny T0101 skończył przejście i stoi w X42 Z2, tuż przy detalu. Dalej ma pracować nóż wykańczający T0202. Numery na rysunku to numery kroków.",
    fig: "t21-change",
    steps: [
      { x: "Odjazd do punktu referencyjnego: najpierw X, potem Z. Głowica ma się obrócić daleko od detalu i konika.", code: "G28 U0. → G28 W0." },
      { x: "Obrót głowicy na pozycję 2 i wczytanie rejestru korekcji 2.", code: "T0202" },
      { x: "Obroty dla nowego noża — po zmianie narzędzia ustawia się je od nowa, bo nóż wykańczający pracuje z inną prędkością.", code: "G96 S250 M03" },
      { x: "Dojazd ruchem szybkim przed czoło, nad pręt.", code: "G00 X44. Z2." },
    ],
    result: "Numer korekcji równy numerowi pozycji — T0202, T0303 — od razu pokazuje, czy korekcja pasuje do noża. Limit `G50 S3000` z początku programu dalej obowiązuje, bo jest modalny.",
  },

  practice: [
    {
      kind: "task", mode: "lathe",
      intro: "Po toczeniu nożem T0101 program ma przejść na nóż wykańczający T0202. Dopisz zmianę noża z odjazdem i nowymi obrotami.",
      starter: "O2001 (WALEK)\nG18 G21 G40 G80 G99\nG54\nT0101 (NOZ ZEWN. CNMG R0.8)\nG50 S3000\nG96 S200 M03\nM08\nG00 X44. Z2.\nG01 X36.4 F0.3\nZ-54.8\nX42.\nG00 Z2.\n(DOPISZ: ODJAZD DO PUNKTU REFERENCYJNEGO G28 U0. I G28 W0., NOZ T0202, G96 S250 M03, DOJAZD G00 X44. Z2.)\nG01 X36. F0.15\nZ-55.\nX42.\nG00 Z2.\nG00 X100. Z100.\nM09\nM05\nM30",
      checks: [{"t":"require","codes":["T0202","G96","S250","M03"]},{"t":"cut","reference":"G18 G99\nG00 X44. Z2.\nG01 X36.4 F0.3\nZ-54.8\nX42.\nG00 Z2.\nG00 X44. Z2.\nG01 X36. F0.15\nZ-55.\nX42.\nG00 Z2.","tolerance":0.05}],
      hints: ["Najpierw odjazd: `G28 U0.` (X), potem `G28 W0.` (Z) — osobno, żeby nóż nie zahaczył o detal.","`T0202`, potem obroty od nowa `G96 S250 M03` i dojazd `G00 X44. Z2.`."],
      solution: "O2001 (WALEK)\nG18 G21 G40 G80 G99\nG54\nT0101 (NOZ ZEWN. CNMG R0.8)\nG50 S3000\nG96 S200 M03\nM08\nG00 X44. Z2.\nG01 X36.4 F0.3\nZ-54.8\nX42.\nG00 Z2.\nG28 U0.\nG28 W0.\nT0202 (NOZ WYKANCZAJACY)\nG96 S250 M03\nG00 X44. Z2.\nG01 X36. F0.15\nZ-55.\nX42.\nG00 Z2.\nG00 X100. Z100.\nM09\nM05\nM30",
    },
    {
      kind: "drill",
      intro: "Słowo T i korekcja zużycia.",
      questions: [
        { kind: "gap", q: "Wywołaj nóż z pozycji 4 z korekcją 4.", template: "T{0}", answers: [["0404"]], why: "Dwie cyfry pozycji, dwie cyfry korekcji." },
        { kind: "gap", q: "Średnica wyszła Ø25,06 zamiast Ø25,00. O ile zmienisz zużycie X (korekcja w średnicy)?", template: "{0}", answers: [["-0.06", "-0,06", "-.06"]], why: "Korekcja X w średnicy — cała odchyłka, w minus." },
        { kind: "gap", q: "W przykładzie zamiast `T0202` wpisano `T0201`. W tabeli geometria X noża 1 to −182,400, noża 2 to −176,100 (w średnicy). O ile w średnicy rozminie się tor noża 2 z programem?", template: "{0} mm", answers: [["6,3", "6.3"]], why: "Nóż 2 jedzie z przesunięciem zmierzonym dla noża 1. Błąd to różnica geometrii: 182,4 − 176,1 = 6,3 mm w średnicy, czyli 3,15 mm na stronę. Każdy wymiar w X wyjdzie przesunięty o tyle samo." },
        { kind: "choice", q: "Co robi `T0100`?", options: ["zostawia nóż 1 i wyłącza korekcję", "wybiera nóż 100", "wymienia nóż na 1 z korekcją 100", "alarm"], answer: 0, why: "Korekcja 00 oznacza brak korekcji." },
        { kind: "order", q: "Ułóż zmianę noża.", items: ["T0202", "G28 W0.", "G00 X44. Z2.", "G28 U0.", "G96 S250 M03"], answer: [3, 1, 0, 4, 2], why: "Odjazd X, odjazd Z, obrót głowicy, obroty, dojazd." },
      ],
    },
  ],

  pitfalls: [
    { title: "T przy detalu", danger: true, x: "`T0303` wpisane zaraz po przejściu, bez odjazdu. Głowica obraca się tuż przy detalu i dłuższe narzędzie — np. wiertło — zahacza o niego albo o konik." },
    { title: "Korekcja innego noża", x: "`T0201` — nóż 2 z korekcją noża 1. Każdy wymiar wychodzi przesunięty o różnicę geometrii obu noży. Zasada: numer korekcji = numer pozycji." },
    { title: "Korekcja zużycia dzielona na pół", x: "Średnica za duża o 0,04, operator wpisuje −0,02, bo tak robił przy frezowaniu. Przy korekcji X w średnicy wymiar poprawi się tylko o połowę." },
  ],

  controllers: {
    rows: [
      ["Wybór narzędzia", "`T0101` — pozycja i korekcja", "`T1 D1` albo `T=\"NOZ_ZGR\" D1`"],
      ["Wymiana", "od razu po T", "po T albo po `M6` — zależnie od konfiguracji"],
      ["Wyłączenie korekcji", "`T0100`", "`D0`"],
      ["Korekcja X", "zwykle w średnicy", "zależnie od ustawień, zwykle w średnicy przy DIAMON"],
    ],
    note: "Na Sinumeriku numer ostrza D pełni tę rolę, co dwie ostatnie cyfry T na Fanucu.",
  },

  quiz: [
    { kind: "choice", review: "T1.3", q: "Dlaczego po toczeniu zewnętrznym odjazd zaczyna się od X?", options: ["nóż wychodzi ponad detal, zanim pojedzie wzdłuż osi", "X jest szybsze", "tak wymaga G28", "bez powodu"], answer: 0, why: "Ruch w Z przy detalu grozi kolizją. Narzędzie wewnętrzne najpierw wychodzi z otworu w Z." },
    { kind: "choice", q: "Co oznaczają ostatnie dwie cyfry w `T0305`?", options: ["numer rejestru korekcji", "pozycję w głowicy", "obroty", "promień naroża"], answer: 0, why: "Pozycja 03, korekcja 05." },
    { kind: "choice", q: "Czy tokarka Fanuc potrzebuje M06 do zmiany noża?", options: ["nie, głowica obraca się po T", "tak, zawsze", "tylko przy T0101", "tylko w G99"], answer: 0, why: "Słowo T od razu obraca głowicę." },
    { kind: "gap", q: "Zmierzono Ø40,05, rysunek wymaga Ø40,00. O ile zmienisz zużycie X?", template: "{0}", answers: [["-0.05", "-0,05", "-.05"]], why: "Cała odchyłka, bo korekcja X jest w średnicy." },
    { kind: "choice", q: "Co zawiera korekcja geometrii noża?", options: ["odległość ostrza od punktu bazowego głowicy w X i Z", "obroty", "posuw", "numer programu"], answer: 0, why: "Dzięki niej każdy nóż trafia w wymiar z programu." },
    { kind: "token", q: "Wskaż słowo, które **obraca głowicę**.", block: "G28 W0. | T0202 | G96 S250 M03", answer: 1, why: "T0202." },
  ],

  summary: [
    "T0101: pozycja w głowicy i numer korekcji. Bez M06.",
    "Przed T nóż musi stać z dala od detalu.",
    "Geometria z ustawienia narzędzia, zużycie — do poprawiania wymiaru.",
    "Korekcja X w średnicy: cała odchyłka średnicy, ze znakiem przeciwnym.",
  ],

  sources: [
    { id: "fanuc", where: "funkcja T na tokarce, korekcje geometrii i zużycia" },
    { id: "sinumerik", where: "T i D na tokarce, dane narzędzia" },
  ],
};
