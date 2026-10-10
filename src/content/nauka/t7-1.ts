import type { LessonDoc } from "@/lib/lesson";

const head = `O2008 (GWINT M20X1.5)
G18 G21 G40 G80 G99
G54
T0404 (NOZ DO GWINTOW 60ST)
G97 S1200 M03
M08
G00 X22. Z5.`;

const cyc = `G76 P010060 Q50 R0.05
G76 X18.16 Z-17. P920 Q300 F1.5`;

const tail = `G00 X44.
M09
M05
G28 U0.
G28 W0.
M30`;

const starter = `${head}
(DOPISZ CYKL G76: 1 PRZEJSCIE WYKANCZAJACE, KAT 60, MIN. WEJSCIE 0.05, NADDATEK 0.05;
 RDZEN FI18.16, KONIEC Z-17, WYSOKOSC ZWOJU 0.92, PIERWSZE WEJSCIE 0.3, SKOK 1.5)

${tail}`;

export const t7_1: LessonDoc = {
  id: "T7.1",
  slug: "t7-1-g76-gwintowanie",
  title: "G76 — cykl gwintowania",
  minutes: 18,
  goal: "Policzysz średnicę rdzenia i wysokość zwoju gwintu metrycznego i zaprogramujesz go cyklem G76.",

  theory: [
    { t: "h", x: "Gwint na tokarce", id: "gwint" },
    { t: "p", x: "Nóż do gwintów ma zarys zwoju — dla gwintu metrycznego 60°. Posuw w Z równa się skokowi gwintu i jest zsynchronizowany z obrotem wrzeciona: na każdy obrót nóż przesuwa się dokładnie o skok. Gwintu nie da się wyciąć jednym przejściem — nóż wchodzi w kilku, coraz płytszych przejściach, każde dokładnie w ten sam zwój." },
    { t: "diagram", id: "t71-profile" },
    { t: "code", x: "h3 = 0,6134 · P = 0,6134 · 1,5 ≈ 0,92 mm\nrdzeń = 20 − 2 · 0,92 = 18,16 mm", caption: "Wysokość zwoju gwintu zewnętrznego ISO — wymiar podstawowy. Wymiar wykonawczy z tolerancją (np. klasa 6g) bierze się z tabel; w praktyce gwint sprawdza się pierścieniem albo mikrometrem do gwintów i koryguje zużyciem X." },

    { t: "h", x: "Cykl G76 — dwa bloki", id: "g76" },
    { t: "code", x: "G76 P010060 Q50 R0.05\nG76 X18.16 Z-17. P920 Q300 F1.5" },
    { t: "table", head: ["Adres", "Blok", "Znaczenie"], rows: [
      ["**P**`01 00 60`", "pierwszy", "liczba przejść wykańczających (01), wyjście skośne (00 — brak), kąt noża (60)"],
      ["**Q**", "pierwszy", "najmniejsze wejście, µm"],
      ["**R**", "pierwszy", "naddatek na przejście wykańczające, mm"],
      ["**X**", "drugi", "średnica rdzenia"],
      ["**Z**", "drugi", "koniec gwintu"],
      ["**P**", "drugi", "wysokość zwoju na stronę, µm"],
      ["**Q**", "drugi", "głębokość pierwszego wejścia na stronę, µm"],
      ["**F**", "drugi", "skok gwintu"],
    ], caption: "P i Q w mikrometrach, bez kropki. R i X, Z — w milimetrach." },
    { t: "diagram", id: "t71-passes" },
    { t: "p", x: "Cykl wchodzi coraz płycej, żeby przekrój wióra był podobny w każdym przejściu. Nóż wchodzi przy tym wzdłuż boku zarysu, a nie prostopadle — tnie wtedy jedną krawędzią i łatwiej odprowadza wiór." },

    { t: "h", x: "Start i koniec", id: "start" },
    { t: "ul", items: [
      "**Start w Z** kilka skoków przed czołem — oś Z musi się rozpędzić do prędkości posuwu, zanim nóż dotknie materiału. Tu Z5, czyli ponad trzy skoki.",
      "**Koniec w Z** w podcięciu z lekcji T6.1: gwint kończy się w Z−17, a podcięcie zaczyna w Z−16. Nóż wychodzi z materiału, zanim cofnie się w X.",
      "**Obroty stałe** — G97. Przy G96 obroty zmieniałyby się między przejściami i nóż nie trafiałby w ten sam zwój.",
    ] },
    { t: "note", kind: "warn", x: "Na wielu sterowaniach podczas przejścia gwintu korektor posuwu nie działa, a STOP posuwu zadziała dopiero po zakończeniu przejścia — zatrzymanie w połowie zniszczyłoby zwój. Dokładne zachowanie zależy od sterowania i jego parametrów." },
  ],

  worked: {
    title: "Gwint M20×1,5 na wałku",
    intro: "Sytuacja: czop Ø20 od Z0 do Z−16 ma dostać gwint M20×1,5. Za nim jest podcięcie Z−16…Z−20 z lekcji T6.1, a dalej stopień Ø30. Nóż 60°, G97 S1200, start w X22 Z5. Numery na rysunku to numery kroków.",
    fig: "t71-job",
    steps: [
      { x: "Wysokość zwoju 0,6134 · 1,5 i średnica rdzenia.", code: "P920 · X18.16" },
      { x: "Koniec gwintu w podcięciu.", code: "Z-17." },
      { x: "Pierwsze wejście 0,3 mm, najmniejsze 0,05, naddatek 0,05.", code: "Q300 · Q50 · R0.05" },
      { x: "Jedno przejście wykańczające, bez wyjścia skośnego, 60°.", code: "P010060" },
    ],
    result: "W symulatorze GCat cykl wykonuje 10 przejść: od Ø19,4 do rdzenia Ø18,16. Symulator rozkłada wejścia tak jak opis G76 w instrukcji Fanuc — kolejne głębokości rosną z pierwiastkiem numeru przejścia, nie mniej niż Q. Na konkretnej maszynie liczbę przejść sprawdź w symulacji sterowania. Wszystkie przejścia zaczynają się w Z5, więc nóż trafia za każdym razem w ten sam zwój.",
  },

  practice: [
    {
      kind: "task",
      mode: "lathe",
      intro: "Dopisz oba bloki G76. Sprawdzany jest tor wszystkich przejść.",
      starter,
      checks: [
        { t: "cut", reference: `${head}\n${cyc}\n${tail}`, tolerance: 0.05 },
        { t: "require", codes: ["G76"] },
      ],
      hints: ["Pierwszy blok: G76 P010060 Q50 R0.05.", "Drugi: G76 X18.16 Z-17. P920 Q300 F1.5."],
      solution: starter.replace("(DOPISZ CYKL G76: 1 PRZEJSCIE WYKANCZAJACE, KAT 60, MIN. WEJSCIE 0.05, NADDATEK 0.05;\n RDZEN FI18.16, KONIEC Z-17, WYSOKOSC ZWOJU 0.92, PIERWSZE WEJSCIE 0.3, SKOK 1.5)\n", `${cyc}\n`),
    },
    {
      kind: "drill",
      intro: "Wymiary gwintu i adresy G76.",
      questions: [
        { kind: "choice", q: "W przykładzie koniec gwintu wpisano `Z-21.` zamiast `Z-17.`. Co się stanie w pierwszym przejściu?", options: ["nóż wjedzie z posuwem 1,5 mm/obr w czoło stopnia Ø30 w Z−20", "gwint wyjdzie dłuższy o 4 mm, bez innych skutków", "cykl skróci przejście do podcięcia", "sterowanie odrzuci Z poza czopem"], answer: 0, why: "Stopień Ø30 zaczyna się w Z−20, a pierwsze przejście idzie na Ø19,4 — poniżej jego średnicy. Ruch gwintowania trwa do Z−21, więc nóż uderza w czoło stopnia przy pełnym posuwie gwintu." },
        { kind: "gap", q: "Gwint M12×1,75. Ile wynosi wysokość zwoju h3 (mm, do 0,01)?", template: "{0}", answers: [["1.07", "1,07"]], why: "0,6134 · 1,75 ≈ 1,07." },
        { kind: "gap", q: "Gwint M12×1,75. Ile wynosi podstawowa średnica rdzenia (mm, do 0,01)?", template: "X{0}", answers: [["9.86", "9,86", "9.85", "9,85"]], why: "h3 = 0,6134 · 1,75 = 1,073 mm, więc 12 − 2 · 1,073 ≈ 9,85 mm. To wymiar podstawowy — wymiar wykonawczy z tolerancją sprawdza się sprawdzianem." },
        { kind: "gap", q: "Wysokość zwoju 1,07 mm. Jaką wartość P wpiszesz w drugim bloku G76 (µm, bez kropki)?", template: "P{0}", answers: [["1070"]], why: "Mikrometry, bez kropki." },
        { kind: "choice", q: "Dlaczego gwintuje się przy G97?", options: ["obroty muszą być stałe, żeby nóż trafiał w ten sam zwój", "G96 nie działa na tokarce", "G97 jest szybsze", "bez powodu"], answer: 0, why: "Synchronizacja przejść." },
      ],
    },
  ],

  pitfalls: [
    { title: "Start za blisko czoła", x: "`G00 X22. Z1.` przy skoku 1,5. Oś Z nie zdąży się rozpędzić — pierwszy zwój wychodzi z innym skokiem niż reszta i sprawdzian nie wchodzi." },
    { title: "Koniec gwintu na stopniu", danger: true, x: "Z−20 zamiast Z−17: nóż dochodzi do stopnia z pełną prędkością posuwu i uderza w czoło. Koniec gwintu kładzie się w podcięciu albo przed stopniem, z zapasem." },
    { title: "Wysokość zwoju w milimetrach", x: "`P0.92` zamiast `P920`. Zależnie od parametru — alarm albo gwint głęboki na 0,00092 mm." },
    { title: "Zmiana S między przejściami", x: "Operator zmienia korektor obrotów w trakcie gwintowania. Kolejne przejście trafia obok zwoju — gwint do wyrzucenia." },
  ],

  controllers: {
    rows: [
      ["Cykl gwintowania", "`G76` (dwa bloki)", "`CYCLE97` / `CYCLE99`"],
      ["Prosty cykl gwintu", "`G92` (system A)", "—"],
      ["Wysokość zwoju, wejścia", "P, Q w µm", "parametry cyklu w mm"],
    ],
    note: "Uwaga: G92 na tokarce Fanuc w systemie A to prosty cykl gwintowania, a nie ustawienie układu współrzędnych ani limit obrotów.",
  },

  quiz: [
    { kind: "choice", review: "T6.2", q: "Który tryb obrotów przy wierceniu w osi?", options: ["G97", "G96", "G50", "G98"], answer: 0, why: "Stałe obroty dla średnicy wiertła." },
    { kind: "choice", q: "Czemu równa się posuw przy gwintowaniu?", options: ["skokowi gwintu na obrót", "0,1 mm/obr", "prędkości skrawania", "wysokości zwoju"], answer: 0, why: "Na każdy obrót — jeden skok." },
    { kind: "gap", q: "Gwint M16×2. Ile wynosi wysokość zwoju h3 (mm, do 0,01)?", template: "{0}", answers: [["1.23", "1,23"]], why: "0,6134 · 2 ≈ 1,23." },
    { kind: "choice", q: "Co oznacza X w drugim bloku G76?", options: ["średnicę rdzenia", "średnicę nominalną", "przyrost X", "skok"], answer: 0, why: "Dno zwoju." },
    { kind: "choice", q: "Dlaczego kolejne wejścia G76 są coraz płytsze?", options: ["żeby przekrój wióra był podobny", "żeby skrócić program", "bo tak wymaga G97", "bez powodu"], answer: 0, why: "Wraz z głębokością rośnie szerokość styku ostrza." },
    { kind: "choice", q: "Gdzie powinien kończyć się gwint zewnętrzny przed stopniem?", options: ["w podcięciu albo z zapasem przed stopniem", "na czole stopnia", "za stopniem", "obojętnie"], answer: 0, why: "Nóż musi wyjść z materiału." },
  ],

  summary: [
    "Posuw gwintowania = skok, zsynchronizowany z wrzecionem, obroty stałe (G97).",
    "Gwint zewnętrzny ISO: h3 ≈ 0,6134 · P, rdzeń = d − 2 · h3.",
    "G76 P(m r a) Q(min) R(naddatek) / G76 X(rdzeń) Z P(h3) Q(1. wejście) F(skok).",
    "Start kilka skoków przed czołem, koniec w podcięciu.",
  ],

  sources: [
    { id: "fanuc", where: "cykl gwintowania G76, G32, G92 na tokarce" },
    { id: "sinumerik", where: "CYCLE97 / CYCLE99" },
    { id: "sandvik", where: "toczenie gwintów: wejścia, profil, metody dosuwu" },
  ],
};
