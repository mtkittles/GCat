import type { Block } from "@/lib/article";

/*
  Karta G04 — postój czasowy. Pełny układ referencyjny.
  Źródła: Machining Doctor (G04 – Dwell), CNCCookbook (G04 Pause/Dwell),
  instrukcje programowania Fanuc (G04 X/U/P, parametr DWL), Sinumerik 808D/840D sl (G4 F/S),
  dokumentacja Haas (G04 w trakcie cyklu), LinuxCNC/Tormach (G4 P w sekundach).
*/

export const g04: Block[] = [
  { t: "p", x: "**G04** każe maszynie odczekać zadany czas, zanim wykona następny blok. Stoją wyłącznie osie — **wrzeciono dalej się obraca, a chłodziwo płynie**. Po upływie czasu program rusza sam, bez naciskania przycisku. G04 jest funkcją jednorazową: działa tylko w bloku, w którym ją wpisano." },

  { t: "h", x: "G04 a inne zatrzymania" },
  { t: "p", x: "W programie jest kilka funkcji, które „zatrzymują” maszynę. Różnią się tym, co dokładnie stoi i kto decyduje o wznowieniu." },
  { t: "table", head: ["Funkcja", "Co się zatrzymuje", "Wrzeciono", "Kiedy program rusza dalej"], rows: [
    ["**G04**", "ruch osi", "pracuje", "sam, po zadanym czasie"],
    ["[[M00]]", "cały program", "zwykle staje", "po naciśnięciu CYCLE START"],
    ["[[M01]]", "program — tylko przy włączonym przełączniku", "zwykle staje", "po naciśnięciu CYCLE START"],
    ["[[G09]]", "osie hamują do zera na końcu bloku", "pracuje", "od razu po osiągnięciu pozycji"],
    ["[[G82]] P", "posuw na dnie otworu w cyklu", "pracuje", "sam, po czasie P"],
  ], caption: "G04 jako jedyna daje dokładnie odmierzoną przerwę bez udziału operatora." },

  { t: "h", x: "Jednostki: litera i kropka" },
  { t: "p", x: "Tu kryje się najwięcej błędów. Ta sama liczba znaczy co innego zależnie od **litery** i od tego, czy stoi przy niej **kropka dziesiętna**." },
  { t: "table", head: ["Zapis", "Sterowanie", "Ile trwa postój"], rows: [
    ["`G04 X1.5`", "Fanuc — frezarka i tokarka", "1,5 s. Kropka dozwolona"],
    ["`G04 U1.5`", "Fanuc — tokarka", "1,5 s. Kropka dozwolona"],
    ["`G04 P1500`", "Fanuc", "1500 ms = 1,5 s. **Bez kropki**"],
    ["`G4 F1.5`", "Sinumerik", "1,5 s"],
    ["`G4 S3`", "Sinumerik", "3 obroty wrzeciona"],
    ["`G4 P1.5`", "LinuxCNC, Tormach", "1,5 s — P w sekundach"],
    ["`CYCL DEF 9.0` / `9.1 DWELL 1.5`", "Heidenhain", "1,5 s"],
  ] },
  { t: "note", kind: "warn", x: "**`G04 P1` na Fanucu to jedna milisekunda**, a nie sekunda — postój, którego w praktyce nie ma. Z drugiej strony `G04 X1` bez kropki zostanie odczytane w najmniejszych jednostkach, czyli zwykle jako **0,001 s**. Bezpieczne zapisy to `P1000` albo `X1.0`." },
  { t: "note", kind: "info", x: "Adres **X** w bloku G04 nie jest osią. Oś X nie rusza się, a Fanuc pokazuje odliczanie czasu w polu drogi do przejścia osi X — stąd wrażenie, że „coś się dzieje z iksem”." },

  { t: "h", x: "Postój liczony w obrotach" },
  { t: "p", x: "Na dnie rowka czy otworu nie liczy się czas, tylko to, **ile razy ostrze obejdzie powierzchnię**. Dwa pełne obroty wystarczą, żeby wyrównać dno. Czas jednego obrotu to 60 / n sekund, więc postój k obrotów przy obrotach n [obr/min] trwa:" },
  { t: "code", x: "t = 60 · k / n    [s]\n\nk = 2 obroty, n = 600 obr/min  →  t = 60 · 2 / 600 = 0,2 s\nFanuc:     G04 X0.2   albo   G04 P200\nSinumerik: G4 S2", caption: "Sinumerik liczy obroty sam — G4 S2 odczeka dwa obroty niezależnie od zaprogramowanych obrotów." },
  { t: "table", head: ["Obroty n", "2 obroty trwają", "Zapis Fanuc"], rows: [
    ["300 obr/min", "0,4 s", "`G04 X0.4`"],
    ["600 obr/min", "0,2 s", "`G04 X0.2`"],
    ["1200 obr/min", "0,1 s", "`G04 X0.1`"],
    ["3000 obr/min", "0,04 s", "`G04 P40`"],
  ] },
  { t: "p", x: "Na części tokarek Fanuc producent włącza parametr **DWL**. Wtedy w trybie posuwu na obrót ([[G99]] na tokarce, [[G95]] na frezarce) liczba przy X lub U oznacza **obroty**, a nie sekundy. `G04 U2.0` to wtedy dwa obroty. Adres P zawsze pozostaje w milisekundach." },
  { t: "diagram", id: "g04" },

  { t: "h", x: "Do czego się go używa" },
  { t: "ul", items: [
    "**Dno rowka i przecinanie na tokarce.** Nóż zatrzymany na średnicy dna wykonuje jeszcze jeden–dwa obroty i zbiera nierówność. Przy przecinaniu krótki postój przed końcem przerywa ciągły [[wiór]].",
    "**Dno otworu lub pogłębienia bez cyklu.** Gdy narzędzie schodzi zwykłym G01, a nie cyklem [[G82]], postój na dnie wyrównuje czoło pogłębienia i fazę.",
    "**Łamanie wióra.** Materiały ciągliwe (stal nierdzewna, aluminium) dają długi wiór, który owija się wokół narzędzia. Krótka przerwa w posuwie zmienia grubość wióra do zera i wiór pęka.",
    "**Odprężenie narzędzia.** Na końcu przejścia narzędzie ugięte siłą skrawania wraca do pozycji i zbiera cienką warstwę, która w przeciwnym razie zostałaby na ściance.",
    "**Czekanie na urządzenia.** Gdy maszyna nie czeka sama na sygnał potwierdzenia: narastanie ciśnienia chłodziwa po [[M08]], przedmuch przed pomiarem sondą, zadziałanie zacisku albo podajnika pręta.",
  ] },

  { t: "h", x: "Ile czekać" },
  { t: "p", x: "Tak krótko, jak się da. Ostrze stojące w jednym miejscu nie skrawa, tylko trze: grzeje się, poleruje powierzchnię i zostawia na niej widoczny ślad. Stal nierdzewna i stopy żarowytrzymałe dodatkowo się przy tym utwardzają, więc następne narzędzie trafi na twardszą warstwę." },
  { t: "note", kind: "tip", x: "Zasada z praktyki: **jeden do dwóch obrotów wrzeciona**. Dłuższy postój nie poprawia już powierzchni, a skraca trwałość ostrza." },
  { t: "p", x: "Na starszych maszynach postój wstawiano też przed ostrym narożem, żeby osie zdążyły dojechać do punktu. Nowe sterowania robią to lepiej funkcją dokładnego zatrzymania [[G09]] albo trybem [[G61]], które nie zostawiają śladu postoju na ściance." },

  { t: "h", x: "Przykład — frezarka" },
  { t: "sim", src: "G21 G90 G17 G54\nT01 M06\nG00 G43 Z50 H01\nS1200 M03\nG00 X30 Y20\nG00 Z2\nG01 Z-6 F80\nG04 X0.1\nG00 Z50\nM30", caption: "Pogłębienie na Z−6 i postój 0,1 s — przy 1200 obr/min to dokładnie dwa obroty. Czas postoju widać w statystykach programu." },

  { t: "h", x: "Przykład — tokarka" },
  { t: "sim", mode: "lathe", src: "G21 G18 G54 G95\nG97 S600 M03\nG00 X44 Z-22\nG01 X30 F0.05\nG04 X0.2\nG00 X44\nG00 X100 Z100\nM30", caption: "Rowek do średnicy 30 i dwa obroty postoju na dnie (0,2 s przy 600 obr/min). Obroty są stałe (G97), więc czas obrotu się nie zmienia." },

  { t: "h", x: "Różnice między sterownikami" },
  { t: "table", head: ["Zagadnienie", "Fanuc", "Sinumerik", "Heidenhain"], rows: [
    ["Zapis", "`G04 X_`, `U_` lub `P_`", "`G4 F_` lub `G4 S_`", "cykl 9 CZAS PRZERWY"],
    ["Czas w sekundach", "X, U (z kropką)", "F", "DWELL"],
    ["Milisekundy", "P, bez kropki", "—", "—"],
    ["Obroty wrzeciona", "X/U przy G95/G99 i parametrze DWL", "S", "—"],
    ["Osobny blok", "zalecany", "wymagany", "cykl w osobnym bloku"],
    ["Wpływ na F i S", "—", "F i S w bloku G4 nie zmieniają posuwu ani obrotów", "—"],
  ] },

  { t: "h", x: "Typowe błędy" },
  { t: "ul", items: [
    "**`G04 P1` zamiast `P1000`.** Jedna milisekunda zamiast sekundy.",
    "**`G04 X1` bez kropki na Fanucu.** Zależnie od ustawień sterowania to jedna sekunda albo jedna tysięczna.",
    "**`G04 P0.5` na Fanucu.** Kropka przy P jest niedozwolona — alarm albo zła wartość.",
    "**G04 w jednym bloku z ruchem.** X zostanie potraktowany jako czas, a zamierzony ruch się nie wykona. Pisz G04 w osobnym bloku.",
    "**Za długi postój na dnie.** Ostrze trze, grzeje materiał i zostawia ślad, a w stali nierdzewnej utwardza powierzchnię.",
    "**Postój zamiast dokładnego zatrzymania.** Do ostrych naroży służy G09 lub G61, nie G04.",
    "**Haas: G04 P w trakcie aktywnego cyklu.** Wartość P zostaje przejęta także przez cykl, np. jako postój na dnie kolejnych otworów.",
  ] },
];
