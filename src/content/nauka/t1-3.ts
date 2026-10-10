import type { LessonDoc } from "@/lib/lesson";

const motion = `G97 S1000 M03
G00 X44. Z2.
G01 X36. F0.2
Z-55.
X42.
G00 Z2.
M05`;

const starter = `O2003 (BLOK STARTOWY)
(DOPISZ BLOK STARTOWY I ZERO DETALU)

${motion}
(DOPISZ ODJAZD: NAJPIERW X, POTEM Z, I KONIEC PROGRAMU)
`;

export const t1_3: LessonDoc = {
  id: "T1.3",
  slug: "t1-3-blok-startowy-tokarki",
  title: "Blok startowy tokarki",
  minutes: 12,
  goal: "Napiszesz bezpieczny początek i koniec programu tokarskiego i uzasadnisz kolejność odjazdu: najpierw X, potem Z.",

  theory: [
    { t: "h", x: "Co ustawia blok startowy", id: "start" },
    { t: "p", x: "Stan modalny przechodzi z programu na program, więc każdy program tokarski zaczyna od ustawienia trybów i skasowania tego, co mogło zostać. Typowy [[blok bezpiecznego startu]] na tokarce Fanuc:" },
    { t: "table", head: ["Kod", "Co robi", "Przed czym chroni"], rows: [
      ["`G18`", "płaszczyzna ZX", "łukami i korekcją w złej płaszczyźnie"],
      ["`G21`", "milimetry", "programem calowym czytanym jako metryczny"],
      ["`G40`", "wyłącza korekcję promienia ostrza", "przesuniętym torem z poprzedniego programu"],
      ["`G80`", "kasuje cykl wiercenia", "wierceniem przy pierwszym ruchu"],
      ["`G99`", "posuw w mm/obr", "posuwem minutowym, 0,2 mm/min zamiast 0,2 mm/obr"],
    ] },
    { t: "p", x: "Po nim `G54` — zero detalu z lekcji T0.3. Wybór narzędzia i obrotów to moduł T2. Który z tych trybów maszyna ma aktywny zaraz po włączeniu, ustawiają parametry — dlatego program nie zakłada stanu domyślnego, tylko ustawia go sam." },
    { t: "p", x: "G40 wyłącza tylko korekcję promienia ostrza (lekcja T4.1). Korekcja geometrii noża, czyli jego wymiary w X i Z, wchodzi z wywołaniem `T0101`. Czy maszyna wykonuje to przesunięcie od razu, czy przy pierwszym ruchu po wywołaniu, zależy od parametru sterowania (lekcja T2.1)." },
    { t: "diagram", id: "t13-skeleton" },

    { t: "h", x: "Odjazd: najpierw X", id: "odjazd" },
    { t: "p", x: "Po obróbce nóż stoi blisko detalu, często przy stopniu albo w rowku. Ruch w Z od razu mógłby przeciągnąć ostrze po ściance albo uderzyć w wyższy stopień. Dlatego przy obróbce zewnętrznej odjazd zaczyna się od X — nóż wychodzi promieniowo ponad detal — a dopiero potem jedzie w Z." },
    { t: "note", kind: "warn", x: "Przy narzędziu wewnętrznym — wytaczaku, wiertle — kolejność jest odwrotna: najpierw wyjście z otworu w Z, potem X. Ruch w X z ostrzem w otworze wbiłby je w ściankę." },
    { t: "code", x: "G28 U0.   (NAJPIERW X DO PUNKTU REFERENCYJNEGO)\nG28 W0.   (POTEM Z)\nM30", caption: "U0 i W0 to przyrost zero — sterowanie jedzie do punktu referencyjnego bez punktu pośredniego (lekcja T1.2)." },
    { t: "note", kind: "info", x: "Wiele zakładów zamiast G28 używa odjazdu do stałego punktu wymiany narzędzia, np. `G00 X200. Z150.`. Zasada kolejności jest ta sama: jeśli jest ryzyko kolizji w Z, najpierw X." },

    { t: "h", x: "Stop i koniec", id: "koniec" },
    { t: "p", x: "Przed końcem programu wrzeciono zatrzymuje `M05`, chłodziwo `M09`. `M30` kończy program i przewija go na początek. `M00` i `M01` działają jak na frezarce: stop bezwarunkowy i stop przy włączonym Optional Stop." },
  ],

  worked: {
    title: "Początek i koniec programu wałka",
    intro: "Sytuacja: program wałka ma już komentarze z zerem i surówką, obroty i jedno przejście na Ø36. Brakuje trybów na starcie, zera detalu i zakończenia. Numery na rysunku to numery kroków — kroki 1 i 2 nie ruszają osiami, więc na rysunku są tylko 3 i 4.",
    fig: "t13-exit",
    steps: [
      { x: "Tryby: płaszczyzna, jednostki, kasowanie korekcji i cykli, posuw na obrót.", code: "G18 G21 G40 G80 G99" },
      { x: "Zero detalu.", code: "G54" },
      { x: "Na końcu: odjazd w X, potem w Z.", code: "G28 U0. → G28 W0." },
      { x: "Stop wrzeciona (już jest w programie) i koniec z przewinięciem.", code: "M05 · M30" },
    ],
    result: "Program wałka ma komplet początku i końca. Moduł T2 doda wybór narzędzia, obroty zależne od średnicy i posuw.",
  },

  practice: [
    {
      kind: "task",
      mode: "lathe",
      intro: "Dopisz blok startowy z zerem detalu i zakończenie programu. Sprawdzane są kody startu, kolejność odjazdu i niezmieniony tor.",
      starter,
      checks: [
        { t: "cut", reference: `G18 G21 G40 G80 G99\nG54\n${motion}`, tolerance: 0.05 },
        { t: "require", codes: ["G18", "G21", "G40", "G80", "G99", "G54", "G28", "M30"] },
      ],
      hints: ["Start: G18 G21 G40 G80 G99, potem G54.", "Koniec: G28 U0., G28 W0., M30."],
      solution: starter
        .replace("(DOPISZ BLOK STARTOWY I ZERO DETALU)\n", "G18 G21 G40 G80 G99\nG54\n")
        .replace("(DOPISZ ODJAZD: NAJPIERW X, POTEM Z, I KONIEC PROGRAMU)\n", "G28 U0.\nG28 W0.\nM30\n"),
    },
    {
      kind: "drill",
      intro: "Kolejność i znaczenie kodów startowych.",
      questions: [
        { kind: "order", q: "Ułóż zakończenie programu tokarskiego.", items: ["M30", "G28 W0.", "M05", "G28 U0."], answer: [2, 3, 1, 0], why: "Stop wrzeciona, odjazd X, odjazd Z, koniec." },
        { kind: "gap", q: "Poprzedni program zostawił `G98` (posuw na minutę), a w bloku startowym brakuje `G99`. Ile razy wolniej niż zakładano pojedzie `G01 X36. F0.2` przy `G97 S1000`?", template: "{0} razy", answers: [["1000"]], why: "Zakładano 0,2 mm/obr · 1000 obr/min = 200 mm/min. Przy G98 F0.2 to 0,2 mm/min — tysiąc razy wolniej. Nóż prawie stoi w materiale i go grzeje." },
        { kind: "choice", q: "Po co `G99` w bloku startowym tokarki Fanuc?", options: ["ustawia posuw w mm/obr", "kasuje cykl", "wybiera płaszczyznę", "kończy program"], answer: 0, why: "F0.2 ma znaczyć 0,2 mm na obrót." },
      ],
    },
  ],

  pitfalls: [
    { title: "Odjazd w Z przy stopniu", x: "Nóż kończy toczenie Ø30 tuż przy stopniu Ø36 i program jedzie `G28 W0.` jako pierwszy. Ostrze trze po czole stopnia albo w nie uderza. Najpierw X." },
    { title: "Brak G99", x: "Poprzedni program zostawił G98 (mm/min). `F0.2` to wtedy 0,2 mm na minutę — nóż prawie stoi w materiale i go grzeje, a obróbka trwa godziny." },
    { title: "G17 z frezarki", x: "Blok startowy przepisany z programu frezarskiego: `G17` zamiast `G18`. Łuki i korekcja ostrza trafiają do złej płaszczyzny." },
  ],

  controllers: {
    rows: [
      ["Płaszczyzna", "`G18`", "`G18`"],
      ["Posuw na obrót", "`G99` (system A)", "`G95`"],
      ["Odjazd do punktu referencyjnego", "`G28 U0.` / `G28 W0.`", "`G74 X1=0 Z1=0` albo punkt wymiany"],
      ["Koniec", "`M30`", "`M30`"],
    ],
    note: "Kody posuwu różnią się najbardziej: Fanuc w systemie A to G98/G99, Sinumerik i Fanuc w systemach B/C — G94/G95.",
  },

  quiz: [
    { kind: "gap", review: "T1.2", q: "Nóż w X40. Zapisz przyrost do Ø34.", template: "U{0}", answers: [["-6", "-6."]], why: "34 − 40 = −6." },
    { kind: "choice", q: "Którą płaszczyznę ustawia blok startowy tokarki?", options: ["G18", "G17", "G19", "żadną"], answer: 0, why: "Tokarka pracuje w płaszczyźnie ZX." },
    { kind: "choice", q: "Dlaczego po toczeniu zewnętrznym odjazd zaczyna się od X?", options: ["nóż wychodzi ponad detal, zanim pojedzie wzdłuż osi", "X jest szybsze", "tak wymaga G28", "bez powodu"], answer: 0, why: "Ruch w Z przy detalu grozi kolizją ze stopniem. Przy narzędziu wewnętrznym (wytaczak, wiertło) kolejność jest inna — najpierw wyjście z otworu w Z." },
    { kind: "choice", q: "Co znaczy `F0.2` przy aktywnym `G98` na tokarce Fanuc?", options: ["0,2 mm/min", "0,2 mm/obr", "20 mm/min", "alarm"], answer: 0, why: "G98 — posuw minutowy." },
    { kind: "token", q: "Wskaż kod, który **kasuje korekcję promienia ostrza**.", block: "G18 G21 G40 G80 G99", answer: 2, why: "G40." },
    { kind: "choice", q: "Co oznacza `G28 U0.`?", options: ["odjazd do punktu referencyjnego w X bez punktu pośredniego", "ruch do X0", "postój", "zerowanie U"], answer: 0, why: "Przyrost zero jako punkt pośredni." },
  ],

  summary: [
    "Start tokarki Fanuc: G18 G21 G40 G80 G99, potem G54.",
    "G99 — posuw na obrót. Bez niego F0.2 może znaczyć mm/min.",
    "Odjazd: najpierw X (G28 U0.), potem Z (G28 W0.).",
    "Koniec: M05, M09, M30.",
  ],

  sources: [
    { id: "fanuc", where: "stan modalny, G98/G99 na tokarce, G28" },
    { id: "sinumerik", where: "G95, G74, koniec programu" },
  ],
};
