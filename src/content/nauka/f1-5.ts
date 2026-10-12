import type { LessonDoc } from "@/lib/lesson";

export const f1_5: LessonDoc = {
  id: "F1.5",
  slug: "f1-5-blok-startowy-koniec",
  title: "Blok startowy i koniec programu",
  minutes: 13,
  goal: "Napiszesz bezpieczny początek i koniec programu i ułożysz jego sekcje we właściwej kolejności.",

  theory: [
    { t: "h", x: "Po co blok startowy", id: "po-co" },
    { t: "p", x: "Z lekcji F1.2 wiesz, że stan modalny przechodzi między programami. [[Blok bezpiecznego startu]] ustawia tryby, od których zależą dalsze bloki w profilu kursu, i kasuje typowe stany z poprzedniej pracy: korekcje i cykl wiercenia. Nie obejmuje wszystkiego — obrót układu, skalowanie czy przesunięcie lokalne, jeśli maszyna ich używa, kasuje się osobnymi kodami." },
    { t: "table", head: ["Kod", "Co robi", "Przed czym chroni"], rows: [
      ["`G21`", "milimetry — zgodnie z założeniem programu", "G20 zostawionym po programie calowym — `X60.` czytane jako 60 cali"],
      ["`G90`", "wymiary absolutne", "G91 zostawionym po poprzednim programie"],
      ["`G94`", "posuw w mm/min", "G95 zostawionym po gwintowaniu — F400 czytane jako 400 mm/obr"],
      ["`G17`", "płaszczyzna XY", "łukami w złej płaszczyźnie"],
      ["`G40`", "wyłącza korekcję promienia", "torem przesuniętym o promień freza"],
      ["`G49`", "wyłącza korekcję długości", "ruchem z długością poprzedniego narzędzia"],
      ["`G80`", "kasuje cykl wiercenia", "kolejnym otworem przy ruchu XY zapisanym bez G00/G01"],
    ] },
    { t: "p", x: "Kody z różnych grup mogą stać w jednym bloku. Wielu programistów rozdziela je na dwie linie, żeby łatwiej było je sprawdzić: `G21 G90 G94 G17` i `G40 G49 G80`. Po nich pada `G54` — wybór zera detalu." },
    { t: "p", x: "Blok startowy nie ustawia trybu ruchu (G00 albo G01). Stan grupy 01 po włączeniu zależy od parametru sterowania, a po poprzednim programie może zostać dowolny. Dlatego pierwszy ruch po wymianie narzędzia ma tryb zapisany jawnie: `G00 G43 H1 Z50.` — ruch szybki w Z z włączeniem korekcji długości (lekcja F4.1)." },
    { t: "note", kind: "info", x: "Profil kursu: frezarka pionowa, trzy osie, zapis Fanuc (ISO), milimetry. Ten zestaw kodów to start programów w kursie, a nie lista bezpieczna na każdej obrabiarce. Producent maszyny może wymagać innych kodów albo innej kolejności — sprawdź to w jej instrukcji, zanim przeniesiesz program." },

    { t: "h", x: "Szkielet programu", id: "szkielet" },
    { t: "p", x: "Nagłówek z komentarzami opisuje detal, zero i narzędzia — operator czyta go przed uruchomieniem. Sekcja obróbki to jedyna część, która naprawdę zmienia się z detalu na detal." },

    { t: "h", x: "Zatrzymania i koniec", id: "koniec" },
    { t: "table", head: ["Kod", "Działanie"], rows: [
      ["`M00`", "stop programu. Wznowienie przyciskiem CYCLE START."],
      ["`M01`", "stop warunkowy — tylko przy włączonym przełączniku [[Optional Stop]]."],
      ["`M02`", "koniec programu."],
      ["`M30`", "koniec programu i powrót na jego początek. Standard w nowych programach."],
    ] },
    { t: "p", x: "Przed `M30` narzędzie odjeżdża w Z na bezpieczną wysokość albo do punktu referencyjnego, wrzeciono się zatrzymuje, a jeśli program używał G91 — przywraca G90. Operator otwiera wtedy drzwi przy narzędziu daleko od detalu." },
    { t: "note", kind: "tip", x: "`M01` po każdym narzędziu to dobry zwyczaj przy pierwszej sztuce. Z włączonym Optional Stop operator sprawdza detal po każdej operacji, przy produkcji wyłącza przełącznik i program idzie bez przerw." },
  ],

  worked: {
    title: "Zbuduj początek i koniec programu płytki",
    intro: "Sytuacja: nowy program płytki 80 × 50 ma działać na maszynie, na której poprzedni program mógł zostawić G91, G95 albo aktywną korekcję. Zero W w lewym dolnym narożniku, frez Ø10 jako T1, obroty 2500. Zbuduj początek i koniec programu — rysunek pokazuje kolejność sekcji.",
    fig: "f15-skeleton",
    steps: [
      { x: "Nagłówek: numer programu i opis w komentarzu — operator czyta go przed uruchomieniem.", code: "O1000 (PLYTKA)" },
      { x: "Bezpieczny start, linia 1: milimetry, wymiary absolutne, posuw w mm/min, płaszczyzna XY.", code: "G21 G90 G94 G17" },
      { x: "Linia 2 kasuje korekcje i cykle, potem wybór zera detalu.", code: "G40 G49 G80 → G54" },
      { x: "Pierwszy ruch po wymianie narzędzia z jawnym trybem ruchu: szybko w Z, na wysokość nad przeszkodami.", code: "G00 G43 H1 Z50." },
      { x: "Koniec: odjazd w Z, stop wrzeciona, M30. Jeśli w programie było G91, przed końcem przywróć G90.", code: "M05 … M30" },
    ],
    result: "Cały program w obecnym stanie widać w sekcji Program detalu poniżej — po tej lekcji ma już komplet: nagłówek, blok startowy i zakończenie. Od bloku startowego znane są tryby wymienione w tabeli. Inne funkcje, których maszyna używa, ustawia się według jej instrukcji.",
  },

  practice: [
    {
      kind: "task", mode: "mill",
      intro: "Program ma obróbkę, ale nie ma bezpiecznego początku ani zakończenia. Dopisz oba w miejscu komentarzy.",
      brief: ["Pierwszy komentarz: jednostki, wymiarowanie, posuw mm/min, płaszczyzna; kasowanie korekcji i cykli; zero detalu.", "Drugi komentarz: stop wrzeciona i koniec programu z przewinięciem."],
      starter: "O1000 (PLYTKA)\n(TU START)\nT1 M06 (FREZ FI10)\nG00 G43 H1 Z50.\nS2500 M03\nG00 X-20. Y10.\nG00 Z5.\nG01 Z-5. F150\nG01 X-5. F400\nG01 Y55.\nG00 Z50.\n(TU KONIEC)",
      checks: [{"t":"require","codes":["G21","G90","G94","G17","G40","G49","G80","G54"],"before":"move"},{"t":"require","codes":["M05","M30"]},{"t":"cut","reference":"G90\nG00 X-20. Y10.\nG00 Z5.\nG01 Z-5. F150\nG01 X-5. F400\nG01 Y55.\nG00 Z50.","tolerance":0.05}],
      hints: ["Blok startowy z lekcji: `G21 G90 G94 G17`, potem `G40 G49 G80`, a na końcu wybór zera `G54`.","Zakończenie: `M05` zatrzymuje wrzeciono, `M30` kończy program i przewija go na początek."],
      solution: "O1000 (PLYTKA)\nG21 G90 G94 G17\nG40 G49 G80\nG54\nT1 M06 (FREZ FI10)\nG00 G43 H1 Z50.\nS2500 M03\nG00 X-20. Y10.\nG00 Z5.\nG01 Z-5. F150\nG01 X-5. F400\nG01 Y55.\nG00 Z50.\nM05\nM30",
    },
    {
      kind: "drill",
      intro: "Ułóż sekcje programu i znajdź braki.",
      questions: [
        {"kind":"bughunt","q":"Który blok stoi w innym miejscu niż w kolejności przyjętej w kursie?","program":"O1000 (PLYTKA)\nT1 M06\nG21 G90 G94 G17\nG40 G49 G80\nG54\nG00 G43 H1 Z50.\nS2500 M03","answer":1,"why":"W kursie wymiana narzędzia stoi po bloku startowym: najpierw G21 G90 G94 G17, G40 G49 G80 i G54, potem T1 M06. Niektórzy producenci (np. Haas w swoich przykładach) stawiają T1 M06 na początku — o kolejności decyduje instrukcja maszyny."},

        { kind: "order", q: "Ułóż bloki programu w kolejności wykonania.",
          items: ["M30", "S2500 M03", "O1000 (PLYTKA)", "(OBROBKA)", "T1 M06", "G21 G90 G94 G17 G40 G49 G80", "M05"],
          answer: [2, 5, 4, 1, 3, 6, 0],
          why: "Nagłówek, bezpieczny start, narzędzie, obroty, obróbka, stop wrzeciona, koniec. Obroty po wymianie, bo M06 zatrzymuje wrzeciono." },
        { kind: "choice", q: "Początek programu: `O1001` → `T1 M06` → `S3000 M03` → `G00 X0. Y0.`. Czego brakuje?",
          options: ["M30", "bloku startowego z G21 G90 G94 G17 G40 G49 G80 i wyboru G54", "komentarza z nazwą", "niczego"], answer: 1,
          why: "Bez bloku startowego program przejmuje stan po poprzedniej pracy." },
        { kind: "choice", q: "Poprzedni program skończył się w G91. Nowy program nie ma `G90` w bloku startowym, a pierwszy ruch to `G00 X-20. Y10.`. Co się stanie?", options: ["frez przesunie się o 20 mm w −X i 10 mm w +Y od miejsca, w którym stoi", "pojedzie do X−20 Y10 od zera W", "sterowanie zgłosi alarm", "pojedzie do zera maszyny"], answer: 0, why: "G91 jest modalne i przechodzi między programami. Bez G90 w bloku startowym współrzędne są przyrostami od bieżącej pozycji — stąd G90 w pierwszej linii." },
        { kind: "token", q: "Wskaż kod, który zatrzyma program **tylko przy włączonym Optional Stop**.", block: "M00 M01 M02 M30", answer: 1,
          why: "M01 to stop warunkowy." },
      ],
    },
  ],

  pitfalls: [
    { title: "Aktywny cykl z poprzedniego programu", danger: true, x: "Program z otworami skończył się bez `G80`. W następnym programie bez bloku startowego ruch XY zapisany bez G00/G01 może wywiercić otwór tam, gdzie miał tylko przejechać. Jawne G00 albo G01 kasuje cykl na Fanucu 0i-F, ale na tym nie polegaj — G80 stoi w bloku startowym." },
    { title: "Koniec bez odjazdu w Z", danger: true, x: "Program kończy się z narzędziem 2 mm nad detalem. Operator wyjmuje detal ręką przy frezie, a następny program startuje ruchem szybkim z niskiej wysokości." },
    { title: "M00 zamiast M01", x: "`M00` zatrzymuje program zawsze. Zostawiony po pierwszej sztuce zatrzymuje każdą następną, aż ktoś go usunie." },
    { title: "G49 po włączeniu korekcji", danger: true, x: "`G49` stoi w bloku startowym, na początku. Wpisane po `G43` wyłączyłoby korekcję długości, której program właśnie potrzebuje (lekcja F4.1)." },
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
    { kind: "choice", q: "Po co w bloku startowym jest `G80`?", options: ["włącza chłodziwo", "kasuje cykl wiercenia, który mógł zostać aktywny", "ustawia wymiary absolutne", "kończy program"], answer: 1, why: "Aktywny cykl wierciłby kolejny otwór przy ruchu XY zapisanym bez G00/G01." },
    { kind: "choice", q: "Czym różni się `M30` od `M02` w nowych programach?", options: ["M30 kończy i wraca na początek programu", "M02 nie zatrzymuje wrzeciona", "M30 działa tylko na Fanucu", "nie ma różnicy"], answer: 0, why: "M30 kończy program i przewija go na początek." },
    { kind: "token", q: "Wskaż kod, który **zawsze** zatrzymuje program.", block: "M01 M05 M00 M09", answer: 2, why: "M00 — stop bezwarunkowy. M05 zatrzymuje tylko wrzeciono." },
    { kind: "order", q: "Ułóż zakończenie programu.", items: ["M30", "G00 Z5.", "G90", "M05", "G91 G28 Z0."], answer: [1, 3, 4, 2, 0],
      why: "Odjazd od detalu, stop wrzeciona, odjazd do R, powrót do G90, koniec." },
    { kind: "choice", q: "Dlaczego wrzeciono włącza się dopiero po `M06`?", options: ["wymiana narzędzia zatrzymuje wrzeciono", "M03 nie działa przed M06", "tak wymaga ISO 841", "bez powodu"], answer: 0, why: "Wrzeciono stoi podczas wymiany, więc obroty włącza się dla nowego narzędzia." },
    { kind: "choice", q: "Gdzie w programie stoi `G49`?", options: ["w bloku startowym, przed G43", "zaraz po G43", "przed M30 zamiast M05", "nigdzie"], answer: 0, why: "G49 kasuje stan na starcie. Po G43 wyłączyłoby potrzebną korekcję." },
  ],

  summary: [
    "Blok startowy w kursie ustawia G21 G90 G94 G17 i kasuje G40 G49 G80, zanim padnie pierwszy ruch. Na konkretnej maszynie sprawdź wymagania producenta.",
    "Kolejność sekcji: nagłówek, start, układ, narzędzie i obroty, obróbka, zakończenie.",
    "M00 zatrzymuje zawsze, M01 tylko z Optional Stop, M30 kończy i przewija program.",
    "Przed M30: odjazd w Z, M05, powrót do G90, jeśli program używał G91.",
    "Pierwszy ruch po wymianie ma jawny tryb: `G00 G43 H1 Z50.` — blok startowy nie ustawia G00 ani G01.",
  ],

  sources: [
    { id: "fanuc", where: "kody G jednorazowe i modalne, stan po włączeniu i resecie zależny od parametrów, kasowanie cyklu kodem grupy 01; M30 i przewinięcie programu", loc: "rozdz. 3, s. 69; parametr 3404#4 M30 — rozdz. 7.2.16, s. 201" },
    { id: "haas-workbook", where: "przykład programu z T1 M06 przed blokiem startowym", loc: "s. 42" },
    { id: "sinumerik", where: "koniec programu, D0, MCALL, G74" },
  ],
};
