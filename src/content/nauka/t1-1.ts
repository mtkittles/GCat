import type { LessonDoc } from "@/lib/lesson";

export const t1_1: LessonDoc = {
  id: "T1.1",
  slug: "t1-1-blok-adres-modalnosc",
  title: "Blok, adres i modalność",
  minutes: 13,
  goal: "Przeczytasz blok programu tokarskiego słowo po słowie i rozpoznasz, które słowa działają dalej po swoim bloku.",

  theory: [
    { t: "h", x: "Blok, słowo, adres", id: "blok" },
    { t: "p", x: "Program to tekst czytany przez sterowanie linia po linii, od góry. Każda linia to [[blok]], blok składa się ze słów, a słowo to litera — [[adres]] — i liczba. Budowa jest taka sama jak na frezarce; na tokarce zmieniają się znaczenia kilku adresów." },
    { t: "diagram", id: "t11-block" },
    { t: "table", head: ["Adres", "Na tokarce", "Przykład"], rows: [
      ["**O**, **N**", "numer programu, numer bloku", "`O2001`, `N30`"],
      ["**G**", "rodzaj ruchu i tryby", "`G01`"],
      ["**X**", "średnica celu", "`X30.`"],
      ["**Z**", "położenie w osi wrzeciona", "`Z-20.`"],
      ["**U**, **W**", "przyrost średnicy i przyrost w Z (lekcja T1.2)", "`U-2.`, `W-10.`"],
      ["**R**, **I**, **K**", "łuki — promień albo środek w X i Z", "`R5.`"],
      ["**F**", "posuw — zwykle w mm na obrót", "`F0.2`"],
      ["**S**", "obroty albo prędkość skrawania (lekcja T2.2)", "`S1000`"],
      ["**T**", "narzędzie i jego korekcja razem", "`T0101`"],
      ["**M**", "funkcje pomocnicze", "`M03`, `M08`, `M30`"],
    ] },

    { t: "h", x: "Komentarze i kropka", id: "kropka" },
    { t: "p", x: "Komentarz na Fanucu stoi w nawiasach, na Sinumeriku po średniku. Wymiary na Fanucu pisze się z kropką dziesiętną: `X30.`, `Z-20.` — bez niej sterowanie ustawione na najmniejszy przyrost przeczyta `X30` jako 0,030 mm. Na Sinumeriku `X30` znaczy 30 mm." },

    { t: "h", x: "Modalność", id: "modalnosc" },
    { t: "p", x: "Większość kodów G oraz F i S to [[funkcja modalna|funkcje modalne]]: działają w kolejnych blokach, dopóki nie zastąpi ich słowo z tej samej grupy. W jednej grupie aktywny jest zawsze jeden kod — `G00` i `G01` wzajemnie się wyłączają." },
    { t: "code", x: "G01 X30. F0.2   (RUCH ROBOCZY, POSUW 0,2 MM/OBR)\nZ-20.           (DALEJ G01 I F0.2)\nX36.            (DALEJ G01 I F0.2)\nG00 X44.        (G00 ZASTEPUJE G01)\nZ2.             (DALEJ G00)", caption: "Tylko linie 1 i 4 podają G. Reszta dziedziczy ruch z poprzednich bloków." },
    { t: "p", x: "Niektóre kody działają tylko w swoim bloku — np. `G04` (postój) i `G28` (najazd na punkt referencyjny). Kolejny blok wraca do tego, co było aktywne wcześniej." },
  ],

  worked: {
    title: "Przeczytaj fragment programu wałka",
    intro: "Sytuacja: nóż ma przetoczyć pręt Ø40 na Ø36 do Z−55 i wrócić nad czoło. Fragment programu: (1) `G00 X44. Z2.`, (2) `G01 X36. F0.2`, (3) `Z-55.`, (4) `X42.`, (5) `G00 Z2.`. Jakim ruchem i z jakim posuwem wykona się każda linia? Numery na rysunku to numery linii.",
    fig: "t11-run",
    steps: [
      { x: "Linia 1: G00 — szybki najazd 2 mm nad powierzchnię pręta, 2 mm przed czoło.", code: "G00 X44 Z2" },
      { x: "Linia 2: G01 zastępuje G00, F0.2 ustawia posuw 0,2 mm na obrót. Nóż schodzi na Ø36.", code: "G01 F0.2" },
      { x: "Linia 3 nie ma G ani F — dziedziczy G01 i F0.2. Nóż toczy wzdłuż osi do Z−55.", code: "X36 Z-55" },
      { x: "Linia 4: nadal G01 i F0.2 — wyjście promieniowe z materiału na Ø42.", code: "X42" },
      { x: "Linia 5: G00 zmienia ruch na szybki — powrót nad czoło.", code: "G00 Z2." },
    ],
    result: "Pięć bloków ruchu i tylko trzy kody G. Kody modalne padają raz i obowiązują, aż zastąpi je kod z tej samej grupy.",
  },

  practice: [
    {
      kind: "task", mode: "lathe",
      intro: "Dopisz przejście z przykładu rozwiązanego: na Ø36 wzdłuż do Z−55 i wyjście na Ø42. Kody modalne pisz tylko raz — sprawdzany jest tor.",
      starter: "O2001 (WALEK)\nG18 G21 G40 G80 G99\nG54\nT0101 (NOZ ZEWN. CNMG R0.8)\nG50 S3000\nG96 S200 M03\nM08\nG00 X44. Z2.\n(DOPISZ: G01 NA FI36 Z POSUWEM 0,2 MM/OBR, WZDLUZ DO Z-55, WYJSCIE NA FI42)\nG00 Z2.\nG00 X100. Z100.\nM09\nM05\nM30",
      checks: [{"t":"cut","reference":"G18 G99\nG00 X44. Z2.\nG01 X36. F0.2\nZ-55.\nX42.\nG00 Z2.","tolerance":0.05},{"t":"require","codes":["G01"]},{"t":"end","x":100,"z":100,"label":"Koniec w X100 Z100"}],
      hints: ["`G01 X36. F0.2` — wejście na średnicę z posuwem.","`Z-55.` i `X42.` bez G01 i F: oba słowa dziedziczą z poprzedniego bloku."],
      solution: "O2001 (WALEK)\nG18 G21 G40 G80 G99\nG54\nT0101 (NOZ ZEWN. CNMG R0.8)\nG50 S3000\nG96 S200 M03\nM08\nG00 X44. Z2.\nG01 X36. F0.2\nZ-55.\nX42.\nG00 Z2.\nG00 X100. Z100.\nM09\nM05\nM30",
    },
    {
      kind: "drill",
      intro: "Słowa w blokach tokarskich.",
      questions: [
        { kind: "token", q: "Wskaż słowo, które podaje **średnicę**.", block: "N40 G01 X36. Z-55. F0.2", answer: 2, why: "X na tokarce to średnica." },
        { kind: "token", q: "Wskaż słowo, które ustawia **posuw**.", block: "G01 Z-20. F0.15", answer: 2, why: "F0.15 — 0,15 mm na obrót przy G99." },
        { kind: "choice", q: "W przykładzie w linii 5 zabrakło `G00` — zostało samo `Z2.`. Co się zmieni?", options: ["nóż wróci tą samą drogą, ale posuwem 0,2 mm/obr — dużo wolniej", "nóż wróci ruchem szybkim, bez zmian", "sterowanie zgłosi alarm braku kodu G", "nóż pojedzie do Z2 i X0"], answer: 0, why: "G01 z linii 2 wciąż działa, więc powrót jest ruchem roboczym z F0.2. Tor ten sam, nad materiałem, ale kosztuje czas — przy 1000 obr/min 57 mm zajmie ok. 17 s zamiast ułamka sekundy." },
        { kind: "choice", q: "Po `G01 X30. F0.2` stoi blok `Z-20.`. Jakim ruchem pojedzie nóż?", options: ["G01 z F0.2", "G00", "alarm — brak G", "G01 bez posuwu"], answer: 0, why: "G01 i F są modalne." },
        { kind: "gap", q: "Zapisz blok: ruch roboczy na średnicę 30 z posuwem 0,2 mm/obr (Fanuc, z kropką).", template: "G{0} X{1} F{2}", answers: [["01", "1"], ["30.", "30"], ["0.2", ".2"]], why: "G01 X30. F0.2" },
      ],
    },
  ],

  pitfalls: [
    { title: "Brak kropki", x: "`Z-20` bez kropki na Fanucu ustawionym na najmniejszy przyrost to 0,020 mm. Nóż zatrzyma się tuż przy czole zamiast 20 mm dalej." },
    { title: "Zapomniany G00", x: "Po przejściu roboczym programista pisze `Z2.`, myśląc o szybkim powrocie. G01 wciąż działa — nóż wraca posuwem, co kosztuje czas i może porysować powierzchnię." },
    { title: "Posuw z innego narzędzia", x: "F jest modalne. Po zmianie noża z wykańczającego na zgrubny bez nowego F nóż zgrubny jedzie z posuwem wykańczającym — albo odwrotnie." },
  ],

  controllers: {
    rows: [
      ["Komentarz", "`(TEKST)`", "`; TEKST`"],
      ["Numer programu", "`O2001`", "nazwa pliku, np. `WALEK.MPF`"],
      ["`X30` bez kropki", "30 mm albo 0,030 mm — zależy od parametru", "30 mm"],
      ["Narzędzie", "`T0101` — numer i korekcja razem", "`T1 D1`"],
    ],
    note: "Budowa bloku i modalność są wspólne. Różnice dotyczą zapisu narzędzia i domyślnych trybów — o nich w T1.2, T1.3 i module T2.",
  },

  quiz: [
    { kind: "choice", review: "T0.3", q: "Dlaczego zero detalu na tokarce ustala się zwykle tylko w Z?", options: ["X0 leży na osi obrotu", "bo G54 nie ma X", "bo X nie ma zera", "bez powodu"], answer: 0, why: "Oś obrotu wyznacza X0. Noże mierzy się w X osobno — korekcja geometrii." },
    { kind: "choice", q: "Co podaje `X` w bloku tokarskim?", options: ["średnicę", "promień", "długość", "numer narzędzia"], answer: 0, why: "Programowanie średnicowe (T0.2)." },
    { kind: "choice", q: "Które słowo **nie** jest modalne?", options: ["G04", "G01", "F0.2", "S1000"], answer: 0, why: "G04 działa tylko w swoim bloku." },
    { kind: "token", q: "Wskaż słowo, które wybiera **narzędzie**.", block: "N10 T0101 M08", answer: 1, why: "T0101 — narzędzie 1 z korekcją 1." },
    { kind: "choice", q: "Program: `G00 X44. Z2.` → `G01 X36. F0.2` → `Z-55.` → `G00 X44.` → `Z2.`. Jakim ruchem wykona się ostatni blok?", options: ["G00", "G01 z F0.2", "alarm", "G01 bez posuwu"], answer: 0, why: "G00 z czwartego bloku obowiązuje dalej." },
    { kind: "choice", q: "Co oznacza `Z-20` bez kropki na Fanucu z najmniejszym przyrostem 0,001?", options: ["−0,020 mm", "−20 mm", "alarm", "−2 mm"], answer: 0, why: "Wartość liczona w najmniejszych przyrostach." },
  ],

  summary: [
    "Program to bloki, blok to słowa, słowo to adres i wartość — jak na frezarce.",
    "Na tokarce: X to średnica, F zwykle mm/obr, T wybiera narzędzie z korekcją.",
    "Kody modalne działają aż do zmiany w obrębie swojej grupy.",
    "Na Fanucu wymiary z kropką.",
  ],

  sources: [
    { id: "fanuc", where: "format bloku na tokarce, adresy, kody modalne" },
    { id: "sinumerik", where: "struktura programu tokarskiego" },
  ],
};
