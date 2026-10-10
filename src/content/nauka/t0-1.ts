import type { LessonDoc } from "@/lib/lesson";

export const t0_1: LessonDoc = {
  id: "T0.1",
  slug: "t0-1-uklad-wspolrzednych-tokarki",
  title: "Układ współrzędnych tokarki",
  minutes: 12,
  goal: "Wskażesz kierunki X i Z na tokarce i odczytasz z rysunku współrzędne punktów konturu wałka.",

  theory: [
    { t: "h", x: "Dwie osie", id: "osie" },
    { t: "p", x: "Tokarka CNC ma dwie podstawowe osie. **Z** biegnie wzdłuż osi wrzeciona: +Z prowadzi od uchwytu w stronę konika. **X** jest promieniowa, prostopadła do osi obrotu: +X prowadzi od osi na zewnątrz. Tak jak na frezarce, ruch w kierunku dodatnim oddala nóż od detalu — to zasada normy ISO 841." },
    { t: "diagram", id: "t01-axes" },
    { t: "p", x: "Rysunki w kursie pokazują tokarkę z boku: Z w prawo, X w górę, głowica za osią obrotu (tylna). Przy widoku z innej strony zmienia się wygląd, ale nie znaczenie znaków — +X dalej prowadzi od osi, a +Z od uchwytu." },
    { t: "p", x: "Osi Y zwykła tokarka nie ma: detal się obraca, więc każdy punkt jego powierzchni sam przechodzi przed nożem. Tokarki z narzędziami napędzanymi mają dodatkowo sterowany obrót wrzeciona (oś C), a czasem także oś Y — to temat na osobną ścieżkę." },

    { t: "h", x: "Zero detalu", id: "zero" },
    { t: "p", x: "[[zero detalu|Zero detalu]] W leży na osi obrotu i na czole gotowego detalu. Z0 to więc płaszczyzna czoła, a wszystko w stronę uchwytu ma Z ujemne. X0 to oś — X przy zwykłej obróbce zewnętrznej nie bywa ujemne. Wyjątek to planowanie czoła: nóż przechodzi kawałek za oś, żeby nie zostawić czopka na środku (lekcja T2.3)." },
    { t: "diagram", id: "t01-part" },
    { t: "p", x: "Punkt na tokarce opisują dwie liczby: X i Z. `X30 Z-21` znaczy: średnica 30 mm, 21 mm od czoła w stronę uchwytu. X podaje się jako średnicę — dlaczego i co z tego wynika, pokazuje lekcja T0.2." },
    { t: "note", kind: "info", x: "Rysunek tokarski rysuje zwykle górną połowę detalu jako przekrój, a dolną jako widok. Program opisuje tylko górną połowę konturu — resztę tworzy obrót detalu." },
  ],

  worked: {
    title: "Odczytaj punkty konturu wałka",
    intro: "Sytuacja: masz rysunek wałka z pręta Ø40 i trzeba wypisać punkty konturu do programu. Czop Ø20 ma 20 mm długości i fazę 1 × 45° na czole, dalej jest stopień na Ø30 z fazą 1 × 45°. Zero W leży na osi i na czole. Numery na rysunku to numery kroków.",
    fig: "t01-pts",
    steps: [
      { x: "Zero W: oś obrotu i czoło detalu.", code: "X0 Z0" },
      { x: "Faza na czole zaczyna się na Ø18 w Z0 i kończy na pełnej średnicy czopa, 1 mm od czoła.", code: "X18 Z0 → X20 Z-1" },
      { x: "Czop Ø20 kończy się 20 mm od czoła — tu zaczyna się stopień.", code: "X20 Z-20" },
      { x: "Stopień na Ø30 z fazą: najpierw do Ø28, potem faza do Ø30 o 1 mm dalej.", code: "X28 Z-20 → X30 Z-21" },
    ],
    result: "Kontur górnej połowy to ciąg punktów X, Z od czoła w stronę uchwytu. Każdy punkt ma Z ujemne albo zero, a X równe średnicy z rysunku.",
  },

  practice: [
    {
      kind: "lathejog",
      intro: "Przyciski działają jak ręczny przesuw osi na tokarce. X jest wyświetlany w średnicy, jak na maszynie. Skok 1 mm przyda się przy pierwszym punkcie.",
      goals: [
        { kind: "move", x: 44, z: 2, label: "2 mm przed czołem, 2 mm nad powierzchnią pręta" },
        { kind: "move", x: 0, z: 1, label: "środek czoła, 1 mm przed nim" },
        { kind: "move", x: 40, z: -30, label: "dotknij powierzchni pręta 30 mm od czoła" },
      ],
    },
    {
      kind: "drill",
      intro: "Kierunki i współrzędne.",
      questions: [
        { kind: "choice", q: "W którą stronę prowadzi +Z na tokarce?", options: ["od uchwytu w stronę konika", "do uchwytu", "od osi na zewnątrz", "w stronę operatora"], answer: 0, why: "+Z oddala nóż od uchwytu i detalu." },
        { kind: "choice", q: "Nóż stoi na końcu fazy, w X20 Z−1. Następny blok miał być `G01 X20. Z-20.`, ale wpisano `Z20.`. Gdzie skończy ruch?", options: ["21 mm dalej w stronę konika, przed czołem — w powietrzu", "na końcu czopa, w Z−20", "w uchwycie", "sterowanie odrzuci blok"], answer: 0, why: "Z20 leży 20 mm przed czołem, po stronie +Z. Z Z−1 nóż przejedzie 21 mm w stronę konika i nie zetknie się z detalem — czop zostanie nietoczony." },
        { kind: "gap", q: "Stopień Ø36 zaczyna się 40 mm od czoła (Z0 na czole). Jakie współrzędne ma punkt na krawędzi stopnia?", template: "X{0} Z{1}", answers: [["36"], ["-40"]], why: "Średnica 36, 40 mm w stronę uchwytu." },
      ],
    },
  ],

  pitfalls: [
    { title: "Pomylony znak Z", danger: true, x: "`Z20` zamiast `Z-20`. Nóż jedzie 20 mm przed czoło, w powietrze. Odwrotna pomyłka — `Z-20` zamiast `Z20` przy odjeździe przed czoło — prowadzi nóż w detal albo w stronę uchwytu." },
    { title: "Wymiar od złej bazy", x: "Rysunek wymiaruje stopień od drugiego końca wałka, a Z0 leży na czole. Każdą długość trzeba przeliczyć na odległość od czoła, zanim trafi do programu." },
    { title: "Uchwyt blisko konturu", danger: true, x: "Wysięg 70 mm, a kontur kończy się w Z−55. Między końcem obróbki a szczękami zostaje 15 mm. Każdy ruch w stronę uchwytu sprawdzaj z długością wysięgu." },
  ],

  controllers: {
    rows: [
      ["Osie", "X i Z wg ISO 841", "X i Z wg ISO 841"],
      ["Płaszczyzna pracy", "`G18` (ZX), domyślna na tokarce", "`G18`, domyślna na tokarce"],
      ["Oś C i Y", "opcja tokarek z narzędziami napędzanymi", "opcja tokarek z narzędziami napędzanymi"],
    ],
    note: "Na obu sterowaniach tokarka pracuje w płaszczyźnie ZX, a X jest domyślnie programowane średnicowo.",
  },

  quiz: [
    { kind: "choice", q: "Wzdłuż czego biegnie oś Z na tokarce?", options: ["wzdłuż osi wrzeciona", "promieniowo", "pionowo", "w stronę operatora"], answer: 0, why: "Z pokrywa się z osią obrotu." },
    { kind: "choice", q: "Gdzie zwykle leży zero detalu na tokarce?", options: ["na osi obrotu, na czole detalu", "na szczękach uchwytu", "na końcu pręta w uchwycie", "na powierzchni Ø40"], answer: 0, why: "X0 na osi, Z0 na czole." },
    { kind: "choice", q: "Nóż ma odjechać od detalu promieniowo. W którym kierunku?", options: ["+X", "−X", "+Z", "−Z"], answer: 0, why: "+X prowadzi od osi na zewnątrz." },
    { kind: "gap", q: "Czop Ø20 kończy się 20 mm od czoła. Jakie współrzędne ma jego koniec?", template: "X{0} Z{1}", answers: [["20"], ["-20"]], why: "Średnica 20, Z ujemne w stronę uchwytu." },
    { kind: "choice", q: "Dlaczego zwykła tokarka nie potrzebuje osi Y?", options: ["detal się obraca, więc cała jego powierzchnia przechodzi przed nożem", "bo ma dwie osie Z", "bo X zastępuje Y", "bo tak wymaga G18"], answer: 0, why: "Obrót detalu zastępuje trzecią oś." },
    { kind: "choice", q: "Czy X bywa ujemne przy zwykłej obróbce zewnętrznej?", options: ["nie — X0 to oś obrotu", "tak, po drugiej stronie detalu", "zawsze przy planowaniu", "tylko w G91"], answer: 0, why: "Nóż pracuje po jednej stronie osi. Wyjątek: przy planowaniu czoła nóż przechodzi kawałek za oś, np. X−1,6 (lekcja T2.3)." },
  ],

  summary: [
    "Z — wzdłuż osi wrzeciona, +Z od uchwytu. X — promieniowo, +X od osi.",
    "Zero detalu: oś obrotu i czoło gotowego detalu. W stronę uchwytu Z ujemne.",
    "Punkt to X (średnica) i Z. Program opisuje górną połowę konturu.",
    "Kontur zawsze porównuj z długością wysięgu z uchwytu.",
  ],

  sources: [
    { id: "iso841", where: "osie tokarki, zwroty X i Z" },
    { id: "fanuc", where: "układ współrzędnych tokarki, płaszczyzna G18" },
    { id: "sinumerik", where: "osie i układy współrzędnych tokarki" },
  ],
};
