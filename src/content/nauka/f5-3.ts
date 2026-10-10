import type { LessonDoc } from "@/lib/lesson";

const starter = `O1005 (GWINTY M6)
G21 G90 G94 G17
G40 G49 G80
G54
T4 M06 (GWINTOWNIK M6X1)
G43 H4 Z50.
S500 M03
(DOPISZ: M29 S500, CYKL G84 DLA CZTERECH OTWOROW,
 Z-15. R5. F500, NA KONIEC G80)

M09
M05
M30`;

const cycle = `M29 S500
M08
G84 X10. Y10. Z-15. R5. F500
X70.
Y40.
X10.
G80`;

export const f5_3: LessonDoc = {
  id: "F5.3",
  slug: "f5-3-g84-gwintowanie",
  title: "G84 — gwintowanie",
  minutes: 15,
  goal: "Dobierzesz otwór pod gwint, obliczysz posuw gwintowania i zaprogramujesz gwintowanie sztywne cyklem G84.",

  theory: [
    { t: "h", x: "Posuw wynika ze skoku", id: "posuw" },
    { t: "p", x: "Gwintownik na każdy obrót wchodzi w materiał dokładnie o skok gwintu P. Posuw nie jest więc parametrem do wyboru — wynika z obrotów:" },
    { t: "code", x: "F = S · P        (G94, mm/min)\nM6×1,  S500:  F = 500 · 1    = 500\nM8×1,25, S400: F = 400 · 1,25 = 500" },
    { t: "diagram", id: "f53-tap" },
    { t: "p", x: "Cykl [[G84]] wchodzi posuwem z obrotami w prawo do Z, na dnie odwraca obroty i wychodzi tym samym torem do R. W trakcie gwintowania korektor posuwu jest zwykle zablokowany na 100% (niektóre sterowania pozwalają go odblokować parametrem): zmiana posuwu bez zmiany obrotów zniszczyłaby gwint." },

    { t: "h", x: "Gwintowanie sztywne", id: "sztywne" },
    { t: "p", x: "Przy [[gwintowanie sztywne|gwintowaniu sztywnym]] sterowanie sprzęga obrót wrzeciona z ruchem osi Z — gwintownik siedzi w zwykłej oprawce. Na Fanucu włącza je kod M ustawiony parametrem — najczęściej `M29 S…` tuż przed G84. Na niektórych maszynach, np. Haas, G84 gwintuje sztywno bez M29 (instrukcja G84 producenta). Sprawdź to w dokumentacji swojej maszyny. Starsze maszyny bez tej funkcji gwintują w oprawce kompensacyjnej, która wybiera różnice między obrotami a posuwem." },
    { t: "note", kind: "info", x: "Gwint lewy na Fanucu frezarskim robi cykl `G74` — obroty w lewo na wejściu, w prawo na wyjściu." },

    { t: "h", x: "Z to koniec gwintownika", id: "glebokosc" },
    { t: "p", x: "Rysunek podaje długość **pełnego gwintu**. Gwintownik ma na końcu nakrój — kilka zwojów ściętych stożkowo, które nie tną jeszcze pełnego zarysu. Żeby pełny zarys sięgnął wymaganej głębokości, koniec gwintownika musi zejść niżej o długość nakroju. Z w bloku G84 to właśnie położenie końca gwintownika." },
    { t: "code", x: "Z (G84)         = −(pełny gwint + nakrój)\npełna średnica  ≥ pełny gwint + nakrój + zapas\nczubek wiertła  = pełna średnica + stożek" },
    { t: "p", x: "Długość nakroju zależy od formy gwintownika: forma C ma zwykle 2–3 zwoje, forma E 1,5–2 (opis geometrii u producentów gwintowników). W lekcji przyjmujemy 3 zwoje — dla M6×1 to 3 mm. Przy innym gwintowniku weź długość z katalogu i przelicz Z oraz otwór." },
    { t: "diagram", id: "f53-depth" },

    { t: "h", x: "Otwór pod gwint", id: "otwor" },
    { t: "p", x: "Dla gwintów metrycznych zwykłych i gwintownika skrawającego średnica wiertła to w przybliżeniu średnica gwintu minus skok. Stąd wiertło Ø5 w lekcji F5.2. Gwintownik wygniatający nie usuwa materiału i potrzebuje większego otworu — średnicę podaje jego producent." },
    { t: "table", head: ["Gwint", "Skok P", "Wiertło"], rows: [
      ["M4", "0,7", "Ø3,3"], ["M5", "0,8", "Ø4,2"], ["M6", "1", "Ø5,0"],
      ["M8", "1,25", "Ø6,8"], ["M10", "1,5", "Ø8,5"], ["M12", "1,75", "Ø10,2"],
    ], caption: "Gwintownik skrawający: D wiertła ≈ d − P, zaokrąglone do typowego wiertła. Tabele producentów mogą podawać nieco inne wartości (np. Ø6,7 lub Ø6,8 pod M8) — rozstrzyga zalecenie dla wybranego gwintownika." },
    { t: "p", x: "Płaszczyznę R przy gwintowaniu ustawia się często wyżej niż przy wierceniu — w tym przykładzie R5. Od R gwintownik i oś Z ruszają razem, a zapas nad materiałem daje im odcinek na rozpędzenie się w zsynchronizowanym ruchu. Ile zapasu potrzeba, zależy od maszyny i obrotów — sprawdź instrukcję." },
  ],

  worked: {
    title: "Gwinty M6 w płytce",
    intro: "Sytuacja: w płytce są cztery otwory Ø5 z lekcji F5.2 — czubek wiertła w Z−18, pełna średnica do Z−17,1. Rysunek wymaga gwintu M6×1 na 12 mm pełnego zarysu. We wrzecionie gwintownik maszynowy z nakrojem 3 zwojów (założenie przykładu), S500. Numery kroków odpowiadają numerom na rysunku.",
    fig: "f53-run",
    steps: [
      { x: "Krok 1: na Fanucu tryb sztywny włącza się przed cyklem — kod ustawia parametr maszyny, najczęściej M29.", code: "M29 S500" },
      { x: "Krok 2: płaszczyzna R5. Od niej obroty i oś Z ruszają razem, a 5 mm nad materiałem daje im odcinek na zsynchronizowany rozbieg.", code: "R5." },
      { x: "Krok 3: wejście. Na jeden obrót gwintownik wchodzi o skok 1 mm, więc posuw wynika z obrotów: 500 · 1.", code: "F500" },
      { x: "Krok 4: koniec gwintownika o nakrój poniżej pełnego gwintu: 12 + 3.", code: "Z-15." },
      { x: "Krok 5: kontrola otworu. Pełna Ø5 kończy się w Z−17,1, czyli pod końcem gwintownika zostaje zapas na wióry.", code: "17,1 − 15 = 2,1" },
      { x: "Krok 6: na dnie cykl odwraca obroty i wykręca gwintownik tym samym torem do R5. Kroki 2–6 robi jeden blok:", code: "G84 X10. Y10. Z-15. R5. F500" },
      { x: "Pozostałe otwory to same współrzędne — cykl jest modalny. Na koniec skasowanie cyklu.", code: "X70. → Y40. → X10. → G80" },
    ],
    result: "Pełny gwint sięga Z−12, koniec gwintownika Z−15, pełna średnica otworu Z−17,1, czubek wiertła Z−18. Przy innym gwintowniku zmienia się tylko długość nakroju — przelicz Z i sprawdź zapas otworu.",
  },

  practice: [
    {
      kind: "task",
      intro: "Dopisz gwintowanie sztywne czterech otworów. Sprawdzane: tor roboczy, G84, G80, M29 i posuw aktywny w cyklu.",
      starter,
      checks: [
        { t: "cut", reference: `G90\nG00 Z50.\n${cycle}`, tolerance: 0.05 },
        { t: "require", codes: ["G84", "G80", "M29"] },
        { t: "tapFeed", pitch: 1, label: "Posuw w cyklu G84 zgodny ze skokiem M6×1 (G94: F = S · P)" },
      ],
      hints: ["Z = −(12 + 3). M29 S500, potem G84 X10. Y10. Z-15. R5. F500.", "Pozostałe otwory: X70., Y40., X10. Na koniec G80."],
      solution: starter.replace("(DOPISZ: M29 S500, CYKL G84 DLA CZTERECH OTWOROW,\n Z-15. R5. F500, NA KONIEC G80)\n", cycle),
    },
    {
      kind: "drill",
      intro: "Posuw gwintowania i otwór pod gwint.",
      questions: [
        { kind: "gap", q: "Gwintujesz M10×1,5 cyklem G84 przy S300, posuw minutowy (G94). Jaki posuw F wpiszesz w bloku?", template: "F{0}", answers: [["450"]], why: "Gwintownik wchodzi o skok na każdy obrót: F = S · P = 300 · 1,5 = 450 mm/min." },
        { kind: "gap", q: "Jaką średnicę wiertła dobierzesz pod gwint M8×1,25 (gwintownik skrawający)?", template: "Ø{0}", answers: [["6.8", "6,8", "6.75", "6,75", "6.7", "6,7"]], why: "d − P = 8 − 1,25 = 6,75 → najbliższe typowe wiertło Ø6,8. Niektóre tabele podają Ø6,7 — rozstrzyga zalecenie producenta gwintownika." },
        { kind: "gap", q: "Gwint M6×1, wymagane 10 mm pełnego gwintu, nakrój gwintownika 3 zwoje. Na jakie Z zaprogramujesz G84?", template: "Z{0}", answers: [["-13", "-13.", "-13.0"]], why: "Nakrój 3 · 1 = 3 mm, więc koniec gwintownika w Z−(10 + 3)." },
        { kind: "choice", q: "Ktoś wpisał `G84 X10. Y10. Z-12. R5. F500`, bo rysunek wymaga 12 mm gwintu M6×1. Gwintownik ma nakrój 3 zwojów. Gdzie skończy się pełny zarys gwintu?", options: ["około Z−9 — gwint o 3 mm za krótki", "w Z−12, jak w programie", "w Z−15", "w Z−17,1, na końcu pełnej średnicy"], answer: 0, why: "Z w G84 to koniec gwintownika. Nad nim pracuje nakrój 3 · 1 = 3 mm, który nie tnie pełnego zarysu — pełny gwint kończy się około 3 mm wyżej, w Z−9." },
        { kind: "choice", q: "Gwintownik M6×1, S600, w programie F500. Co się stanie?", options: ["posuw nie zgadza się ze skokiem — zerwany gwint albo złamany gwintownik", "gwint wyjdzie płytszy", "nic, sterowanie poprawi", "gwint wyjdzie lewy"], answer: 0, why: "Przy S600 potrzeba F600." },
      ],
    },
  ],

  pitfalls: [
    { title: "Posuw niezgodny ze skokiem", danger: true, x: "Zmiana S bez przeliczenia F. Gwintownik jest ciągnięty albo pchany względem zwojów — zrywa gwint albo pęka w otworze, skąd trudno go wyjąć." },
    { title: "Z równe długości gwintu", x: "G84 z Z−12 dla 12 mm gwintu. Pełny zarys kończy się wtedy około Z−9 — o długość nakroju wyżej. Gwint wychodzi za krótki, a sprawdzian tego nie przepuści." },
    { title: "Za płytki otwór", danger: true, x: "Otwór wiercony na głębokość gwintu. Nakrój może dojść do dna, zanim gwint osiągnie pełną głębokość — ryzyko złamania gwintownika w otworze." },
    { title: "Brak M29 na maszynie z gwintowaniem sztywnym", danger: true, x: "Gwintownik w zwykłej oprawce, a G84 bez M29 pracuje jak do oprawki kompensacyjnej. Różnica między obrotami a posuwem nie ma gdzie się podziać." },
    { title: "R za nisko", x: "Zbyt mały zapas między R a materiałem: wrzeciono i oś Z mogą nie zdążyć rozpędzić się razem przed pierwszym zwojem, a pierwsze zwoje wyjdą niedokładne. Zapas dobierz według instrukcji maszyny." },
  ],

  controllers: {
    rows: [
      ["Gwintowanie sztywne", "`M29 S…` + `G84`", "`CYCLE84(…)`"],
      ["Oprawka kompensacyjna", "`G84` bez M29", "`CYCLE840(…)`"],
      ["Gwint lewy", "`G74`", "`CYCLE84` z kierunkiem obrotów w lewo"],
      ["Skok w cyklu", "przez F = S · P (G94)", "wprost jako skok albo typ gwintu"],
    ],
    note: "Sinumerik przyjmuje skok gwintu wprost, a posuw liczy sam. Na Fanucu przeliczasz F samodzielnie albo używasz G95 z F równym skokowi.",
  },

  quiz: [
    { kind: "gap", review: "F5.2", q: "Wiertło 140°, Ø5. Jak długi jest stożek na końcu wiertła (mm, do 0,1)?", template: "{0} mm", answers: [["0.9", "0,9"]], why: "Stożek = (D/2) / tan(140°/2) = 2,5 / 2,75 ≈ 0,9 mm. Skrót 0,18 · D wynika z tego samego wzoru: 1 / (2 · tan 70°) ≈ 0,18 (lekcja F5.2)." },
    { kind: "gap", q: "Gwintownik M6×1, S450, posuw minutowy (G94). Jaki posuw F wpiszesz w G84?", template: "F{0}", answers: [["450"]], why: "450 · 1 = 450." },
    { kind: "choice", q: "Co robi G84 na dnie otworu?", options: ["odwraca obroty i wychodzi posuwem", "wychodzi ruchem szybkim", "zatrzymuje się na czas P", "cofa się o Q"], answer: 0, why: "Gwintownik musi się wykręcić tym samym torem." },
    { kind: "choice", q: "Co włącza `M29` na Fanucu?", options: ["gwintowanie sztywne", "chłodziwo", "wymianę narzędzia", "cykl G83"], answer: 0, why: "Sprzężenie obrotów wrzeciona z osią Z." },
    { kind: "gap", q: "Jaką średnicę wiertła dobierzesz pod gwint M12×1,75 (gwintownik skrawający)?", template: "Ø{0}", answers: [["10.2", "10,2", "10.25", "10,25"]], why: "12 − 1,75 = 10,25 → Ø10,2." },
    { kind: "choice", q: "Dlaczego korektor posuwu zwykle nie działa podczas G84?", options: ["zmiana posuwu zniszczyłaby gwint", "bo G84 jest ruchem szybkim", "przez M29", "działa normalnie"], answer: 0, why: "Posuw musi dokładnie odpowiadać obrotom i skokowi." },
    { kind: "token", q: "Wskaż słowo, które musi być równe **S · P**.", block: "G84 X10. Y10. Z-15. R5. F500", answer: 5, why: "F500 = 500 · 1." },
  ],

  summary: [
    "F = S · P. Posuw gwintowania wynika z obrotów i skoku.",
    "G84: wejście w prawo, obroty odwrócone na dnie, wyjście do R.",
    "Gwintowanie sztywne na Fanucu: zwykle M29 S… przed G84 (kod ustawia parametr; niektóre maszyny go nie wymagają).",
    "Z w G84 = −(pełny gwint + nakrój). Pełna średnica otworu sięga jeszcze niżej, o zapas.",
    "Gwintownik skrawający: wiertło ≈ d − P. Wygniatak — otwór wg producenta.",
  ],

  sources: [
    { id: "haas", where: "G84 — F, R, Z i uruchamianie wrzeciona w tym sterowaniu", url: "https://www.haascnc.com/service/codes-settings.type%3Dgcode.machine%3Dmill.value%3DG84.html" },
    { id: "fanuc", where: "G84, G74, gwintowanie sztywne M29" },
    { id: "sinumerik", where: "CYCLE84 i CYCLE840" },
    { id: "sandvik", where: "gwintowanie, średnice otworów pod gwint" },
    { id: "vergnano", where: "formy nakroju gwintowników (C: 2–3 zwoje, E: 1,5–2)" },
  ],
};
