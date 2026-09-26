import type { LessonDoc } from "@/lib/lesson";

const starter = `O1001 (ROWEK PIERSCIENIOWY)
G21 G90 G17
G40 G49 G80
G54
T1 M06 (FREZ FI10, OSTRZE PRZEZ SRODEK)
S2500 M03
M08
G00 X50. Y25. Z50.
G00 Z5.
(DOPISZ: G01 Z-2. F100 I PELNY OKRAG WOKOL X40 Y25)

G00 Z5.
M09
M05
M30`;

export const f3_4: LessonDoc = {
  id: "F3.4",
  slug: "f3-4-luki-i-j",
  title: "Łuki przez I i J",
  minutes: 13,
  goal: "Zapiszesz łuk i pełny okrąg przez środek I, J i przeliczysz zapis R na I, J.",

  theory: [
    { t: "h", x: "Środek zamiast promienia", id: "srodek" },
    { t: "p", x: "Zamiast R można podać położenie środka łuku. **I** to odległość w osi X, a **J** w osi Y — liczone od punktu startu łuku do jego środka. Na Fanucu I i J są zawsze przyrostowe, także przy aktywnym G90." },
    { t: "code", x: "I = X środka − X startu\nJ = Y środka − Y startu" },
    { t: "diagram", id: "g03" },

    { t: "h", x: "Pełny okrąg", id: "okrag" },
    { t: "p", x: "Środek wyznacza łuk jednoznacznie, więc I i J pozwalają zapisać pełny okrąg: blok bez X i Y kończy łuk w punkcie startu. Tak frezuje się rowki pierścieniowe, obwiednie otworów i kieszeni okrągłych." },
    { t: "diagram", id: "f34-circle" },

    { t: "h", x: "R czy I, J", id: "r-czy-ij" },
    { t: "ul", items: [
      "**R** jest krótsze i łatwiejsze do sprawdzenia z rysunkiem. Nie zapisze pełnego okręgu.",
      "**I, J** działają dla każdego łuku, także pełnego. Przy łukach bliskich 180° są dokładniejsze — tam małe zaokrąglenie punktu końcowego mocno przesuwa środek wyliczony z R.",
      "Programy z CAM używają zwykle I, J. Przy pisaniu ręcznym wygodniejsze bywa R.",
    ] },
    { t: "widget", id: "rij" },
  ],

  worked: {
    title: "Naroże płytki przez I, J",
    intro: "Ten sam łuk co w F3.3: start X−5 Y40, koniec X10 Y55, środek X10 Y40.",
    steps: [
      { x: "I: X środka − X startu = 10 − (−5).", code: "I15." },
      { x: "J: Y środka − Y startu = 40 − 40.", code: "J0." },
      { x: "Kierunek bez zmian, zgodnie z zegarem.", code: "G02" },
      { x: "Blok kompletny.", code: "G02 X10. Y55. I15. J0." },
    ],
    result: "Ten sam tor co `G02 X10. Y55. R15.`. Zapis `J0.` można pominąć — oś bez przesunięcia ma wartość 0.",
  },

  practice: [
    {
      kind: "task",
      intro: "Rowek pierścieniowy: pełny okrąg o promieniu 10 mm wokół X40 Y25, 2 mm w głąb. Frez stoi już nad punktem X50 Y25.",
      starter,
      checks: [
        { t: "cut", reference: "G90\nG00 X50. Y25.\nG00 Z5.\nG01 Z-2. F100\nG02 I-10. J0. F300\nG00 Z5.", tolerance: 0.05 },
      ],
      hints: ["Start X50 Y25, środek X40 Y25: I = 40 − 50.", "Pełny okrąg: G02 I-10. bez X i Y, z posuwem, np. F300."],
      solution: starter.replace("(DOPISZ: G01 Z-2. F100 I PELNY OKRAG WOKOL X40 Y25)\n", "G01 Z-2. F100\nG02 I-10. J0. F300"),
    },
    {
      kind: "drill",
      intro: "Przeliczanie środka.",
      questions: [
        { kind: "gap", q: "Start X20 Y10, środek X20 Y30. Podaj I i J.", template: "I{0} J{1}", answers: [["0"], ["20"]], why: "I = 20 − 20 = 0, J = 30 − 10 = 20." },
        { kind: "gap", q: "Start X60 Y40, środek X45 Y40. Podaj I.", template: "I{0}", answers: [["-15"]], why: "45 − 60 = −15." },
        { kind: "choice", q: "Start X10 Y0, blok `G03 I-10.`. Gdzie jest środek?", options: ["X0 Y0", "X20 Y0", "X−10 Y0", "X10 Y−10"], answer: 0, why: "10 + (−10) = 0." },
      ],
    },
  ],

  pitfalls: [
    { title: "I, J liczone od zera W", x: "Wpisanie współrzędnych środka zamiast odległości od startu: `I40. J25.` zamiast `I-10. J0.`. Środek ląduje daleko od detalu, a sterowanie zgłasza błąd promienia albo jedzie ogromnym łukiem." },
    { title: "Pominięty znak", x: "Środek na lewo od startu ma ujemne I. Bez minusa środek przeskakuje na drugą stronę i łuk wychodzi po przeciwnej stronie punktu startu." },
    { title: "Punkt końcowy poza okręgiem", x: "Koniec łuku zaokrąglony tak, że nie leży dokładnie na okręgu o danym środku. Małą różnicę sterowanie przyjmie, większą odrzuci alarmem." },
  ],

  controllers: {
    rows: [
      ["Środek łuku", "`I J K`, zawsze przyrostowo od startu", "`I J K`, domyślnie przyrostowo od startu"],
      ["Środek absolutnie", "brak na frezarce", "`I=AC(40) J=AC(25)`"],
      ["Pełny okrąg", "`G02 I… J…` bez X i Y", "`G2 I… J…` bez X i Y"],
    ],
    note: "Na obu sterowaniach I i J domyślnie liczą się od punktu startu. Sinumerik pozwala podać środek w układzie detalu przez `AC`.",
  },

  quiz: [
    { kind: "gap", review: "F3.3", q: "Naroże detalu R5, frez Ø6, obróbka z zewnątrz. Promień toru:", template: "R{0}", answers: [["8"]], why: "5 + 3 = 8." },
    { kind: "choice", q: "Od czego liczy się I i J na Fanucu?", options: ["od punktu startu łuku", "od zera W", "od końca łuku", "zależnie od G90/G91"], answer: 0, why: "I i J są przyrostowe od startu, niezależnie od G90." },
    { kind: "gap", q: "Start X30 Y20, środek X30 Y5. Podaj I i J.", template: "I{0} J{1}", answers: [["0"], ["-15"]], why: "I = 0, J = 5 − 20 = −15." },
    { kind: "choice", q: "Który zapis da pełny okrąg?", options: ["`G02 X50. Y25. R10.` ze startem w X50 Y25", "`G02 I-10.` ze startem w X50 Y25", "`G01 I-10.`", "`G02 R-10.`"], answer: 1, why: "Blok z I i bez X, Y kończy łuk w punkcie startu." },
    { kind: "choice", q: "Kiedy I, J są wyraźnie lepsze od R?", options: ["przy łukach bliskich 180° i pełnych okręgach", "przy krótkich łukach 90°", "nigdy", "tylko w G91"], answer: 0, why: "Środek wyliczany z R jest tam bardzo czuły na zaokrąglenia." },
    { kind: "token", q: "Tapnij słowo, które podaje **odległość do środka w osi Y**.", block: "G03 X20. Y40. I-10. J5.", answer: 4, why: "J — składowa Y wektora od startu do środka." },
  ],

  summary: [
    "I, J — odległość od startu łuku do środka, w osiach X i Y.",
    "Na Fanucu I, J są zawsze przyrostowe.",
    "Pełny okrąg: G02/G03 z I, J, bez X i Y.",
    "R jest wygodne przy ręcznym pisaniu, I, J — dokładniejsze i uniwersalne.",
  ],

  sources: [
    { id: "fanuc", where: "interpolacja kołowa z I, J, K, pełny okrąg" },
    { id: "sinumerik", where: "programowanie środka łuku, I=AC()" },
  ],
};
