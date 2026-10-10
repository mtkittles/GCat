import type { LessonDoc } from "@/lib/lesson";

export const t4_2: LessonDoc = {
  id: "T4.2",
  slug: "t4-2-kierunek-ostrza",
  title: "Kierunek ostrza",
  minutes: 11,
  goal: "Wpiszesz do tabeli korekcji właściwy kierunek ostrza dla noża zewnętrznego, wytaczaka i noża do czoła i rozpoznasz skutki pomyłki.",

  theory: [
    { t: "h", x: "Po co kierunek ostrza", id: "po-co" },
    { t: "p", x: "Do korekcji promienia sterowanie potrzebuje środka naroża, a zna tylko punkt P, do którego zmierzono nóż. Kierunek ostrza T mówi, w którą stronę od środka naroża leży P. Dopiero z R i T sterowanie wyznacza środek i prowadzi go w odległości rε od konturu." },
    { t: "diagram", id: "t42-tips" },
    { t: "table", head: ["Nóż", "Gdzie jest P względem środka naroża", "T"], rows: [
      ["zewnętrzny, toczenie w stronę uchwytu", "niżej i bliżej uchwytu", "3"],
      ["wytaczak, toczenie w stronę uchwytu", "wyżej i bliżej uchwytu", "2"],
      ["zewnętrzny, toczenie od uchwytu (nóż lewy)", "niżej i dalej od uchwytu", "4"],
      ["nóż mierzony w środku naroża", "w środku", "0 albo 9"],
    ], caption: "Numery w układzie z rysunku: Z w prawo, X w górę — według instrukcji Fanuc ten sam numer obowiązuje przy głowicy przedniej i tylnej. Przy nowej maszynie porównaj rysunek kierunków w jej dokumentacji." },
    { t: "p", x: "Numeru nie trzeba pamiętać. Wystarczy narysować naroże w widoku Z w prawo, X w górę, zaznaczyć część naroża, która skrawa, i znaleźć P na przecięciu stycznych w X i Z. Strona, po której wypada P względem środka, daje numer z mapy kierunków." },

    { t: "h", x: "Tabela korekcji noża", id: "tabela" },
    { t: "p", x: "W jednym wierszu tabeli stoją: geometria X i Z, zużycie X i Z, promień naroża R i kierunek ostrza T. Numer wiersza to dwie ostatnie cyfry słowa T z programu — dla `T0202` wiersz 2." },
    { t: "code", x: "wiersz  X geom.    Z geom.    R     T\n  01    −162.450   −48.210   0.8   3\n  02    −158.930   −51.775   0.4   3", caption: "Przykładowe wartości. X w średnicy, R w promieniu." },
    { t: "note", kind: "info", x: "R wpisuje się z oznaczenia płytki: w kodzie ISO płytki CNMG 120408 ostatnie dwie cyfry „08” to rε = 0,8 mm, a VBMT 160404 ma „04” — rε = 0,4 mm." },
  ],

  worked: {
    title: "Wpis dla noża wykańczającego wałka",
    intro: "Sytuacja: nóż T0202 z płytką VBMT 160404 toczy zewnętrzny kontur wałka w stronę uchwytu z korekcją G42 (T4.1). Co trzeba wpisać w wierszu tabeli, żeby sterowanie znalazło środek naroża? Numery na rysunku to numery kroków.",
    fig: "t42-nose",
    steps: [
      { x: "Promień naroża z kodu płytki: ostatnie cyfry 04.", code: "R 0.4" },
      { x: "Nóż zewnętrzny skrawa dolną częścią naroża: P leży w dół i w lewo od środka (w widoku Z w prawo, X w górę).", code: "T 3" },
      { x: "Wiersz korekcji z programu: dwie ostatnie cyfry `T0202`.", code: "wiersz 02" },
      { x: "W programie korekcja z T4.1 działa, bo sterowanie ma już R i kierunek ostrza.", code: "G42 G00 X14. Z2." },
    ],
    result: "Komentarz `(T0202: R0.4, KIERUNEK OSTRZA 3)` w programie wałka przypomina operatorowi, co ma być w tabeli.",
  },

  practice: [
    {
      kind: "drill",
      intro: "Kierunki ostrza i odczyt płytek.",
      questions: [
        { kind: "choice", q: "Wytaczak toczy otwór w stronę uchwytu. Jaki kierunek ostrza wpiszesz w tabeli korekcji?", options: ["2", "3", "8", "0"], answer: 0, why: "P wyżej i bliżej uchwytu niż środek naroża." },
        { kind: "gap", q: "W przykładzie w wierszu 02 wpisano kierunek 2 zamiast 3, R 0,4 bez zmian. Jaką średnicę da przy G42 odcinek Ø36 z programu?", template: "Ø{0}", answers: [["37,6", "37.6"]], why: "Sterowanie sądzi, że P leży nad środkiem naroża, a leży pod nim. Środek wychodzi o 2 · 0,4 = 0,8 mm za wysoko na promieniu — średnica o 1,6 mm za duża: Ø37,6. Przesuwa się cały kontur, nie tylko fazy." },
        { kind: "gap", q: "Jaki promień naroża ma płytka DNMG 150612?", template: "R{0}", answers: [["1.2", "1,2"]], why: "Ostatnie cyfry 12 → 1,2 mm." },
        { kind: "choice", q: "Nóż zewnętrzny ma w tabeli T = 2 zamiast 3. Co się stanie z G42?", options: ["sterowanie źle wyznaczy środek naroża i przesunie kontur", "nic", "alarm przy każdym bloku", "wyłączy się G96"], answer: 0, why: "Kierunek ostrza decyduje, gdzie leży środek naroża względem P. Przy 2 zamiast 3 cały kontur przesuwa się o 2 · rε promieniowo." },
      ],
    },
  ],

  pitfalls: [
    { title: "Zły kierunek ostrza", x: "T = 2 zamiast 3 dla noża zewnętrznego. Sterowanie liczy środek naroża po złej stronie P — cały kontur przesuwa się o 2 · rε promieniowo, średnice wychodzą o 4 · rε za duże." },
    { title: "Stary promień po zmianie płytki", x: "Płytka R0,8 wymieniona na R0,4, w tabeli zostało 0,8. Korekcja przesuwa naroże o 0,4 za dużo — kontur na fazach i łukach wychodzi za mały." },
    { title: "R wpisany jako średnica", x: "Z oznaczenia „08” operator wpisuje 1,6. Korekcja odsuwa naroże dwa razy za daleko." },
  ],

  controllers: {
    rows: [
      ["Kierunek ostrza", "T w tabeli korekcji (0–9)", "położenie ostrza w danych narzędzia (0–9)"],
      ["Promień naroża", "R w tabeli korekcji", "promień ostrza w danych narzędzia"],
      ["Wiersz korekcji", "dwie ostatnie cyfry słowa T", "numer ostrza D"],
    ],
    note: "W dokumentacji obu producentów rysunek położeń 1–9 jest taki sam, różnią się nazwy pól w tabeli narzędzi. Przed pierwszym wpisem porównaj rysunek z instrukcją swojego sterowania.",
  },

  quiz: [
    { kind: "choice", review: "T4.1", q: "Toczenie zewnętrzne w stronę uchwytu. Którym kodem włączysz korekcję?", options: ["G42", "G41", "G40", "G96"], answer: 0, why: "Nóż po prawej stronie kierunku ruchu." },
    { kind: "choice", q: "Co mówi sterowaniu kierunek ostrza T?", options: ["gdzie leży punkt P względem środka naroża", "w którą stronę kręci się wrzeciono", "numer pozycji w głowicy", "kierunek posuwu"], answer: 0, why: "Z R i T sterowanie wyznacza środek naroża." },
    { kind: "choice", q: "Jaki kierunek ostrza ma typowy nóż zewnętrzny (głowica za osią)?", options: ["3", "2", "8", "5"], answer: 0, why: "P niżej i bliżej uchwytu." },
    { kind: "gap", q: "Jaki promień naroża ma płytka CNMG 120404?", template: "R{0}", answers: [["0.4", "0,4"]], why: "04 → 0,4 mm." },
    { kind: "choice", q: "Z którego wiersza tabeli korzysta `T0303`?", options: ["03", "30", "33", "01"], answer: 0, why: "Dwie ostatnie cyfry." },
  ],

  summary: [
    "Korekcja potrzebuje R (promień naroża) i T (kierunek ostrza).",
    "T mówi, gdzie leży P względem środka naroża: zewnętrzny 3, wytaczak 2.",
    "R z kodu płytki: ostatnie dwie cyfry, np. 08 → 0,8 mm.",
    "Po zmianie płytki sprawdź R w tabeli.",
  ],

  sources: [
    { id: "fanuc", where: "kierunek ostrza teoretycznego, tabela korekcji" },
    { id: "sinumerik", where: "położenie ostrza w danych narzędzia tokarskiego" },
    { id: "sandvik", where: "oznaczenia ISO płytek tokarskich" },
  ],
};
