import type { LessonDoc } from "@/lib/lesson";

export const f1_5: LessonDoc = {
  id: "F1.5",
  slug: "f1-5-blok-startowy-koniec",
  title: "Blok startowy i koniec programu",
  minutes: 13,
  goal: "Napiszesz bezpieczny początek i koniec programu i ułożysz jego sekcje we właściwej kolejności.",

  theory: [
    { t: "h", x: "Po co blok startowy", id: "po-co" },
    { t: "p", x: "Z lekcji F1.2 wiesz, że stan modalny przechodzi między programami. [[Blok bezpiecznego startu]] ustawia wszystko, od czego zależą dalsze bloki, i kasuje to, co mogło zostać z poprzedniej pracy." },
    { t: "table", head: ["Kod", "Co robi", "Przed czym chroni"], rows: [
      ["`G21`", "milimetry", "programem calowym odczytanym jako metryczny"],
      ["`G90`", "wymiary absolutne", "G91 zostawionym po poprzednim programie"],
      ["`G17`", "płaszczyzna XY", "łukami w złej płaszczyźnie"],
      ["`G40`", "wyłącza korekcję promienia", "torem przesuniętym o promień freza"],
      ["`G49`", "wyłącza korekcję długości", "ruchem z długością poprzedniego narzędzia"],
      ["`G80`", "kasuje cykl wiercenia", "wierceniem otworu przy każdym ruchu"],
    ] },
    { t: "p", x: "Kody z różnych grup mogą stać w jednym bloku. Wielu programistów rozdziela je na dwie linie, żeby łatwiej było je sprawdzić: `G21 G90 G17` i `G40 G49 G80`. Po nich pada `G54` — wybór zera detalu." },

    { t: "h", x: "Szkielet programu", id: "szkielet" },
    { t: "diagram", id: "f15-skeleton" },
    { t: "p", x: "Nagłówek z komentarzami opisuje detal, zero i narzędzia — operator czyta go przed uruchomieniem. Sekcja obróbki to jedyna część, która naprawdę zmienia się z detalu na detal." },

    { t: "h", x: "Zatrzymania i koniec", id: "koniec" },
    { t: "table", head: ["Kod", "Działanie"], rows: [
      ["`M00`", "stop programu. Wznowienie przyciskiem CYCLE START."],
      ["`M01`", "stop warunkowy — tylko przy włączonym przełączniku [[Optional Stop]]."],
      ["`M02`", "koniec programu."],
      ["`M30`", "koniec programu i powrót na jego początek. Standard w nowych programach."],
    ] },
    { t: "p", x: "Przed `M30` narzędzie odjeżdża w Z na bezpieczną wysokość albo do punktu referencyjnego, wrzeciono się zatrzymuje, a wymiary wracają na absolutne. Operator otwiera wtedy drzwi przy narzędziu daleko od detalu." },
    { t: "note", kind: "tip", x: "`M01` po każdym narzędziu to dobry zwyczaj przy pierwszej sztuce. Z włączonym Optional Stop operator sprawdza detal po każdej operacji, przy produkcji wyłącza przełącznik i program idzie bez przerw." },
  ],

  worked: {
    title: "Zbuduj początek i koniec programu płytki",
    intro: "Detal: płytka 80 × 50, zero W w lewym dolnym narożniku, frez Ø10 jako T1, obroty 2500.",
    steps: [
      { x: "Nagłówek: numer programu i opis w komentarzu.", code: "O1000 (PLYTKA)" },
      { x: "Bezpieczny start: jednostki, wymiary, płaszczyzna i kasowanie korekcji oraz cykli.", code: "G21 G90 G17" },
      { x: "Druga linia bezpiecznego startu, potem wybór zera detalu.", code: "G40 G49 G80 → G54" },
      { x: "Koniec: odjazd w Z, stop wrzeciona, powrót do G90, M30.", code: "M05 … M30" },
    ],
    result: "Cały program w obecnym stanie widać w sekcji Program detalu poniżej — po tej lekcji ma już komplet: nagłówek, blok startowy i zakończenie.",
  },

  practice: [
    {
      kind: "drill",
      intro: "Ułóż sekcje programu i znajdź braki.",
      questions: [
        { kind: "order", q: "Ułóż bloki programu w kolejności wykonania.",
          items: ["M30", "S2500 M03", "O1000 (PLYTKA)", "(OBROBKA)", "T1 M06", "G21 G90 G17 G40 G49 G80", "M05"],
          answer: [2, 5, 4, 1, 3, 6, 0],
          why: "Nagłówek, bezpieczny start, narzędzie, obroty, obróbka, stop wrzeciona, koniec. Obroty po wymianie, bo M06 zatrzymuje wrzeciono." },
        { kind: "choice", q: "Początek programu: `O1001` → `T1 M06` → `S3000 M03` → `G00 X0. Y0.`. Czego brakuje?",
          options: ["M30", "bloku startowego z G21 G90 G17 G40 G49 G80 i wyboru G54", "komentarza z nazwą", "niczego"], answer: 1,
          why: "Bez bloku startowego program przejmuje stan po poprzedniej pracy." },
        { kind: "token", q: "Tapnij kod, który zatrzyma program **tylko przy włączonym Optional Stop**.", block: "M00 M01 M02 M30", answer: 1,
          why: "M01 to stop warunkowy." },
      ],
    },
  ],

  pitfalls: [
    { title: "Aktywny cykl z poprzedniego programu", x: "Program z otworami skończył się bez `G80`. Następny program bez bloku startowego pierwszym ruchem w XY wywierci otwór tam, gdzie miał tylko przejechać." },
    { title: "Koniec bez odjazdu w Z", x: "Program kończy się z narzędziem 2 mm nad detalem. Operator wyjmuje detal ręką przy frezie, a następny program startuje ruchem szybkim z niskiej wysokości." },
    { title: "M00 zamiast M01", x: "`M00` zatrzymuje program zawsze. Zostawiony po pierwszej sztuce zatrzymuje każdą następną, aż ktoś go usunie." },
    { title: "G49 po włączeniu korekcji", x: "`G49` stoi w bloku startowym, na początku. Wpisane po `G43` wyłączyłoby korekcję długości, której program właśnie potrzebuje (lekcja F4.1)." },
  ],

  controllers: {
    rows: [
      ["Kasowanie korekcji długości", "`G49`", "`D0` albo brak aktywnego D"],
      ["Kasowanie cyklu", "`G80`", "`MCALL` bez nazwy cyklu"],
      ["Koniec programu", "`M30`", "`M30` lub `M2`"],
      ["Odjazd do punktu referencyjnego", "`G91 G28 Z0.`", "`G74 Z1=0`"],
      ["Znak `%` na początku i końcu pliku", "wymagany przy transmisji", "niepotrzebny"],
    ],
    note: "Idea bloku startowego jest wspólna. Kody kasujące korekcję i cykle różnią się, bo Sinumerik łączy korekcję z numerem ostrza D, a cykle wywołuje jak podprogramy.",
  },

  quiz: [
    { kind: "choice", review: "F1.4", q: "Które kody ustawiają milimetry i płaszczyznę XY?", options: ["`G20 G18`", "`G21 G17`", "`G21 G19`", "`G90 G17`"], answer: 1, why: "G21 — milimetry, G17 — XY." },
    { kind: "choice", q: "Po co w bloku startowym jest `G80`?", options: ["włącza chłodziwo", "kasuje cykl wiercenia, który mógł zostać aktywny", "ustawia wymiary absolutne", "kończy program"], answer: 1, why: "Aktywny cykl wierciłby przy każdym ruchu." },
    { kind: "choice", q: "Różnica między `M30` a `M02` w nowych programach:", options: ["M30 kończy i wraca na początek programu", "M02 nie zatrzymuje wrzeciona", "M30 działa tylko na Fanucu", "nie ma różnicy"], answer: 0, why: "M30 kończy program i przewija go na początek." },
    { kind: "token", q: "Tapnij kod, który **zawsze** zatrzymuje program.", block: "M01 M05 M00 M09", answer: 2, why: "M00 — stop bezwarunkowy. M05 zatrzymuje tylko wrzeciono." },
    { kind: "order", q: "Ułóż zakończenie programu.", items: ["M30", "G00 Z5.", "G90", "M05", "G91 G28 Z0."], answer: [1, 3, 4, 2, 0],
      why: "Odjazd od detalu, stop wrzeciona, odjazd do R, powrót do G90, koniec." },
    { kind: "choice", q: "Dlaczego wrzeciono włącza się dopiero po `M06`?", options: ["wymiana narzędzia zatrzymuje wrzeciono", "M03 nie działa przed M06", "tak wymaga ISO 841", "bez powodu"], answer: 0, why: "Wrzeciono stoi podczas wymiany, więc obroty włącza się dla nowego narzędzia." },
    { kind: "choice", q: "Gdzie w programie stoi `G49`?", options: ["w bloku startowym, przed G43", "zaraz po G43", "przed M30 zamiast M05", "nigdzie"], answer: 0, why: "G49 kasuje stan na starcie. Po G43 wyłączyłoby potrzebną korekcję." },
  ],

  summary: [
    "Blok startowy ustawia G21 G90 G17 i kasuje G40 G49 G80, zanim padnie pierwszy ruch.",
    "Kolejność sekcji: nagłówek, start, układ, narzędzie i obroty, obróbka, zakończenie.",
    "M00 zatrzymuje zawsze, M01 tylko z Optional Stop, M30 kończy i przewija program.",
    "Przed M30: odjazd w Z, M05, powrót do G90.",
  ],

  sources: [
    { id: "fanuc", where: "M00, M01, M02, M30, G80, G49, stan modalny po resecie" },
    { id: "sinumerik", where: "koniec programu, D0, MCALL, G74" },
  ],
};
