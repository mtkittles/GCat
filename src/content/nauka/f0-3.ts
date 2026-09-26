import type { LessonDoc } from "@/lib/lesson";

export const f0_3: LessonDoc = {
  id: "F0.3",
  slug: "f0-3-przesuniecia-g54-g59",
  title: "Przesunięcia G54–G59",
  minutes: 14,
  goal: "Zmierzysz zero detalu na maszynie, zapiszesz je w G54 i obrobisz dwa detale jednym programem z G54 i G55.",

  theory: [
    { t: "h", x: "Rejestr przesunięcia", id: "rejestr" },
    { t: "p", x: "Sterowanie musi wiedzieć, gdzie leży [[zero detalu]]. Służy do tego tablica przesunięć: rejestry `G54`–`G59`, a w każdym współrzędne maszynowe jednego zera W. Słowo `G54` w programie znaczy: licz od zera zapisanego w rejestrze G54." },
    { t: "table", head: ["Rejestr", "X", "Y", "Z"], rows: [
      ["`G54`", "−320.000", "−260.000", "—"],
      ["`G55`", "−150.000", "−260.000", "—"],
      ["`G56`–`G59`", "0.000", "0.000", "0.000"],
    ], caption: "Tablica przesunięć z przykładu. Kolumnę Z omawia lekcja F4.1." },
    { t: "p", x: "`G54` jest [[funkcja modalna|modalne]]: działa, dopóki program nie wywoła innego rejestru." },

    { t: "h", x: "Pomiar zera w X i Y", id: "pomiar" },
    { t: "p", x: "Operator dojeżdża do krawędzi detalu przyrządem o znanej średnicy — czujnikiem krawędzi, sondą albo trzpieniem — i odczytuje pozycję maszynową w chwili styku. Środek przyrządu jest wtedy o promień od krawędzi, więc promień trzeba uwzględnić." },
    { t: "diagram", id: "f03-edge" },
    { t: "code", x: "od lewej:  X kraw. = X masz. + r\nod prawej: X kraw. = X masz. − r", caption: "Dotyk od lewej to przyrząd po stronie −X. W osi Y tak samo: od przodu dodajesz r, od tyłu odejmujesz." },
    { t: "p", x: "Sterowania mają do tego funkcję pomiaru: po dotknięciu wpisujesz, jaką współrzędną ma środek przyrządu w układzie detalu (np. `X-5` dla Ø10 stojącego z lewej), a sterowanie samo liczy i zapisuje przesunięcie." },
    { t: "note", kind: "info", x: "Wartość Z w rejestrze zależy od sposobu pomiaru długości narzędzi. Omówimy ją razem z korekcją długości w F4.1. Do tego czasu przyjmujemy Z0 na górnej powierzchni detalu." },

    { t: "h", x: "Dwa detale, jeden program", id: "dwa-detale" },
    { t: "p", x: "Dwa imadła na stole to dwa zera: W1 w G54 i W2 w G55. Program obróbki jest ten sam, zmienia się tylko wywołany rejestr." },
    { t: "diagram", id: "f03-two" },
    { t: "code", x: "G54\n(OBROBKA DETALU 1)\nG55\n(TA SAMA OBROBKA DETALU 2)" },
  ],

  worked: {
    title: "Ustal G54 czujnikiem krawędzi",
    intro: "Czujnik Ø10. Dotknięcie lewej krawędzi od lewej strony: MASZYNA X−325.000. Dotknięcie przedniej krawędzi od przodu: MASZYNA Y−265.000.",
    steps: [
      { x: "W chwili styku środek czujnika jest 5 mm od krawędzi, po stronie ujemnej osi." },
      { x: "X krawędzi: −325 + 5 = −320.", code: "X−320" },
      { x: "Y krawędzi: −265 + 5 = −260.", code: "Y−260" },
      { x: "Wpisz obie wartości do wiersza G54 tablicy przesunięć." },
    ],
    result: "Od teraz punkt `X0 Y0` w programie z `G54` to lewy przedni narożnik płytki — dokładnie W z lekcji F0.1.",
  },

  practice: [
    {
      kind: "offset",
      set: true,
      intro: "Rejestry są puste. Ustaw środek narzędzia nad narożnikiem detalu — jak wskaźnikiem centrującym, bez promienia do doliczenia — i zapisz pozycję. Potem to samo dla drugiego detalu w G55.",
      parts: [
        { reg: "G54", x: -320, y: -260, label: "detal 1" },
        { reg: "G55", x: -150, y: -260, label: "detal 2" },
      ],
      goals: [
        { kind: "move", frame: "M", x: -320, y: -260, label: "stań nad lewym przednim narożnikiem detalu 1" },
        { kind: "set", reg: "G54", x: -320, y: -260, label: "zapisz pozycję do G54" },
        { kind: "move", frame: "G54", x: 80, y: 50, label: "sprawdź: prawy tylny narożnik detalu 1" },
        { kind: "set", reg: "G55", x: -150, y: -260, label: "przełącz na G55, stań nad narożnikiem detalu 2 i zapisz" },
        { kind: "move", frame: "G55", x: 40, y: 25, label: "środek detalu 2 w układzie G55" },
      ],
    },
  ],

  pitfalls: [
    { title: "Program bez wywołania rejestru", x: "Na Fanucu po włączeniu aktywne jest zwykle `G54`, ale poprzedni program mógł zostawić `G55`. Na Sinumeriku domyślne jest `G500` i program liczy od zera maszyny. Każdy program powinien sam wywołać swój rejestr." },
    { title: "Promień przyrządu w złą stronę", x: "Dotyk od lewej — dodajesz promień, od prawej — odejmujesz. Pomyłka przesuwa cały detal o średnicę przyrządu, a pierwsze przejście trafia obok konturu." },
    { title: "Pomiar w złym wierszu", x: "Pomiar detalu 2 zapisany do G54 nadpisuje zero detalu 1. Po każdym pomiarze sprawdź, który wiersz tablicy się zmienił." },
    { title: "Stare przesunięcie po przezbrojeniu", x: "Nowe imadło albo przełożony detal to nowe zero. Wartości w G54 pasują tylko do zamocowania, na którym je zmierzono." },
  ],

  controllers: {
    rows: [
      ["Rejestry przesunięć", "`G54`–`G59`, dodatkowe `G54.1 P1`…", "`G54`–`G57`, dodatkowe `G505`–`G599`"],
      ["Po włączeniu", "zwykle `G54`", "`G500` — bez przesunięcia nastawnego"],
      ["Przesunięcie wspólne dla wszystkich", "EXT (wiersz 00)", "frame bazowy"],
      ["Pomiar krawędzi", "MEASURE w tablicy przesunięć", "JOG → pomiar detalu"],
    ],
    note: "`G54` działa tak samo na obu sterowaniach. Różni się to, co się dzieje, gdy program go nie wywoła.",
  },

  quiz: [
    { kind: "gap", review: "F0.2", q: "G54: X−320 Y−260. Ekran MASZYNA: X−300 Y−230. Współrzędne w układzie detalu:",
      template: "X{0} Y{1}", answers: [["20"], ["30"]], why: "−300 − (−320) = 20 oraz −230 − (−260) = 30." },
    { kind: "choice", q: "Ile rejestrów obejmuje grupa `G54`–`G59`?",
      options: ["4", "6", "9", "99"], answer: 1, why: "G54, G55, G56, G57, G58, G59 — sześć." },
    { kind: "gap", q: "Czujnik **Ø6** dotyka lewej krawędzi od lewej strony przy MASZYNA X−412. Jaki X wpiszesz do G54?",
      template: "X{0}", answers: [["-409"]], why: "Promień 3 mm, przyrząd po stronie −X, więc dodajesz: −412 + 3 = −409." },
    { kind: "gap", q: "Czujnik Ø10 dotyka **prawej** krawędzi od prawej strony przy MASZYNA X−235. Detal ma 80 mm, zero w lewym narożniku. Jaki X wpiszesz do G54?",
      template: "X{0}", answers: [["-320"]], why: "Prawa krawędź: −235 − 5 = −240. Lewa krawędź jest 80 mm dalej w minus: −240 − 80 = −320." },
    { kind: "choice", q: "Program bez `G54` uruchomiony na Sinumeriku zaraz po włączeniu liczy współrzędne od:",
      options: ["zera detalu z G54", "zera maszyny, bo aktywne jest G500", "ostatnio użytego rejestru", "punktu referencyjnego R"], answer: 1,
      why: "Stan domyślny Sinumerika to G500 — przesunięcie nastawne wyłączone." },
    { kind: "choice", q: "Dwa identyczne detale w G54 i G55. Co zmieniasz w programie, żeby obrobić drugi?",
      options: ["wszystkie współrzędne X", "wywołanie rejestru na `G55`", "wartości w rejestrze G54", "nic, sterowanie samo wybierze"], answer: 1,
      why: "Współrzędne w programie liczą się od W, a W wybiera wywołany rejestr." },
    { kind: "choice", q: "Czujnik dotyka krawędzi **od przodu** (stoi po stronie −Y). Promień:",
      options: ["dodajesz", "odejmujesz", "pomijasz", "zależy od sterowania"], answer: 0,
      why: "Krawędź leży od środka przyrządu w stronę plus, więc Y krawędzi = Y maszyny + r." },
  ],

  summary: [
    "Rejestr G54–G59 przechowuje współrzędne maszynowe zera detalu.",
    "Krawędź = pozycja maszynowa ± promień przyrządu. Znak zależy od strony dotyku.",
    "Dwa detale na stole to dwa rejestry i jeden program.",
    "Program zawsze wywołuje swój rejestr — Sinumerik po włączeniu ma G500.",
  ],

  sources: [
    { id: "fanuc", where: "tablica przesunięć, G54–G59, G54.1, pomiar MEASURE" },
    { id: "sinumerik", where: "przesunięcia nastawne G54–G57 i G505–G599, G500, frame bazowy" },
  ],
};
