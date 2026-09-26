import type { LessonDoc } from "@/lib/lesson";

export const f1_4: LessonDoc = {
  id: "F1.4",
  slug: "f1-4-jednostki-plaszczyzny",
  title: "Jednostki i płaszczyzny: G21, G17",
  minutes: 11,
  goal: "Ustawisz jednostki i płaszczyznę pracy i będziesz wiedzieć, na co wpływa każda z nich.",

  theory: [
    { t: "h", x: "Milimetry czy cale", id: "jednostki" },
    { t: "p", x: "[[G21]] przełącza sterowanie na milimetry, [[G20]] na cale. Kod decyduje, jak sterowanie odczyta każdą liczbę wymiarową — X, Y, Z, I, J, K, R — oraz posuw F: w mm/min albo w calach na minutę." },
    { t: "diagram", id: "f14-units" },
    { t: "code", x: "1 cal = 25,4 mm\nG20 X2.    →  2 × 25,4 = 50,8 mm\nG20 F10.   →  10 × 25,4 = 254 mm/min" },
    { t: "p", x: "W Polsce rysunki są prawie zawsze w milimetrach, więc programy zaczynają się od `G21`. Cale spotkasz przy detalach z rysunków amerykańskich, np. w lotnictwie." },
    { t: "note", kind: "warn", x: "Jednostki ustawia się raz, na początku programu, zanim padnie pierwsza współrzędna. Zmiana w środku programu dotyczy wszystkich dalszych liczb, także tych w rejestrach, które program wywołuje." },

    { t: "h", x: "Płaszczyzna pracy", id: "plaszczyzny" },
    { t: "p", x: "Trzy kody wybierają płaszczyznę: `G17` — XY, `G18` — ZX, `G19` — YZ. Płaszczyzna nie wpływa na ruchy po prostej (G00, G01). Decyduje o trzech rzeczach:" },
    { t: "ul", items: [
      "w której płaszczyźnie leżą łuki `G02` i `G03`,",
      "w której płaszczyźnie działa korekcja promienia `G41`/`G42`,",
      "wzdłuż której osi pracują cykle wiercenia — prostopadle do płaszczyzny.",
    ] },
    { t: "diagram", id: "g17-g19" },
    { t: "p", x: "Na frezarce pionowej niemal zawsze pracujesz w `G17`: łuki w widoku z góry, wiercenie w osi Z. `G18` to płaszczyzna tokarki (ścieżka Toczenie) i rzadkich łuków w pionie na frezarce." },
    { t: "note", kind: "info", x: "Kierunek łuku G02/G03 ocenia się, patrząc na płaszczyznę od strony dodatniej osi do niej prostopadłej: dla G17 z góry, od +Z." },
  ],

  worked: {
    title: "Rysunek w calach",
    intro: "Otwór na rysunku: 1.5\" od lewej krawędzi i 0.75\" od dolnej. Zero W w lewym dolnym narożniku. Możesz programować w calach albo przeliczyć na milimetry.",
    steps: [
      { x: "Wariant calowy: program zaczyna się od G20, wartości przepisujesz z rysunku.", code: "G20 … X1.5 Y0.75" },
      { x: "Wariant metryczny, X: 1,5 × 25,4 = 38,1 mm.", code: "X38.1" },
      { x: "Wariant metryczny, Y: 0,75 × 25,4 = 19,05 mm.", code: "Y19.05" },
      { x: "Program metryczny zaczyna się od G21.", code: "G21 … X38.1 Y19.05" },
    ],
    result: "Oba programy trafią w ten sam punkt. Wybierz jeden system dla całego programu — mieszanie jednostek to prosta droga do detalu 25 razy za małego albo za dużego.",
  },

  practice: [
    {
      kind: "drill",
      intro: "Przeliczenia i wybór płaszczyzny.",
      questions: [
        { kind: "token", q: "Tapnij słowo, które ustawia **jednostki**.", block: "G90 G21 G17 G54", answer: 1, why: "G21 — milimetry." },
        { kind: "gap", q: "G20 jest aktywne. Ile milimetrów to `X3.`?", template: "{0} mm", answers: [["76.2", "76,2"]], why: "3 × 25,4 = 76,2 mm." },
        { kind: "gap", q: "Rysunek w calach: 2.0\". Zapisz to w programie z G21.", template: "X{0}", answers: [["50.8", "50,8"]], why: "2 × 25,4 = 50,8." },
        { kind: "choice", q: "Frezarka pionowa, kontur w widoku z góry z łukami. Jaka płaszczyzna?", options: ["G17", "G18", "G19", "bez znaczenia"], answer: 0, why: "Widok z góry to płaszczyzna XY — G17." },
      ],
    },
  ],

  pitfalls: [
    { title: "Program calowy bez G20", x: "Program przepisany z rysunku w calach, ale bez `G20`, a sterowanie jest w G21. `X2.` to wtedy 2 mm zamiast 50,8 mm — detal wychodzi ponad 25 razy mniejszy. Odwrotny błąd daje ruchy 25 razy dłuższe." },
    { title: "G18 zostawione przez poprzedni program", x: "Po programie z łukami w pionie aktywne zostało `G18`. Łuk `G02 X… Y…` w nowym programie leży wtedy w złej płaszczyźnie: sterowanie zgłosi alarm albo pojedzie innym torem. Blok startowy zawsze ustawia `G17`." },
    { title: "Posuw w calach", x: "Przy G20 `F10.` to 10 cali na minutę, czyli 254 mm/min. Posuw przepisany z tabeli metrycznej do programu calowego jest 25 razy za duży." },
  ],

  controllers: {
    rows: [
      ["Milimetry", "`G21`", "`G71` lub `G710`"],
      ["Cale", "`G20`", "`G70` lub `G700`"],
      ["Posuw przy calach", "zmienia się razem z G20", "`G70` — posuw bez zmian, `G700` — posuw też w calach"],
      ["Płaszczyzny", "`G17` `G18` `G19`", "`G17` `G18` `G19`"],
    ],
    note: "Sinumerik w trybie języka ISO rozumie `G20`/`G21`. W natywnym języku Siemensa jednostki to `G70`/`G71` i `G700`/`G710`.",
  },

  quiz: [
    { kind: "gap", review: "F1.3", q: "Frez w X40. Y10. (G90). Cel X15. Y30. Zapisz ruch w G91.", template: "X{0} Y{1}", answers: [["-25"], ["20"]], why: "15 − 40 = −25 oraz 30 − 10 = 20." },
    { kind: "choice", q: "Co ustawia `G21`?", options: ["płaszczyznę XY", "milimetry", "wymiary absolutne", "zero detalu"], answer: 1, why: "G21 — milimetry, G20 — cale." },
    { kind: "gap", q: "G20 aktywne. Ile mm to `Y0.5`?", template: "{0} mm", answers: [["12.7", "12,7"]], why: "0,5 × 25,4 = 12,7." },
    { kind: "choice", q: "Na co **nie** wpływa wybór płaszczyzny G17/G18/G19?", options: ["łuki G02/G03", "korekcję promienia", "ruch po prostej G01", "oś cyklu wiercenia"], answer: 2, why: "Ruch po prostej przebiega tak samo w każdej płaszczyźnie." },
    { kind: "choice", q: "W G17 wiercenie cyklem odbywa się wzdłuż osi:", options: ["X", "Y", "Z", "wybranej w bloku"], answer: 2, why: "Oś wiercenia jest prostopadła do płaszczyzny, dla XY to Z." },
    { kind: "choice", q: "Program calowy uruchomiony w G21 bez zmiany wartości. Detal wyjdzie:", options: ["25,4 razy za duży", "25,4 razy za mały", "w porządku", "sterowanie przeliczy samo"], answer: 1, why: "Wartości w calach czytane jako milimetry są 25,4 razy za małe." },
    { kind: "choice", q: "Z której strony patrzy się na płaszczyznę XY, oceniając kierunek G02?", options: ["od +Z, z góry", "od −Z, z dołu", "od +X", "zależy od sterowania"], answer: 0, why: "Od strony dodatniej osi prostopadłej do płaszczyzny." },
  ],

  summary: [
    "G21 — milimetry, G20 — cale. Ustawia się je raz, na początku programu.",
    "1 cal = 25,4 mm. Jednostki zmieniają też znaczenie posuwu F.",
    "G17 (XY), G18 (ZX), G19 (YZ) decydują o łukach, korekcji promienia i osi wiercenia.",
    "Na frezarce pionowej pracujesz w G17 — blok startowy zawsze to ustawia.",
  ],

  sources: [
    { id: "fanuc", where: "G20/G21, wybór płaszczyzny G17–G19" },
    { id: "sinumerik", where: "G70/G71, G700/G710, płaszczyzny robocze" },
  ],
};
