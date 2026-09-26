import type { LessonDoc } from "@/lib/lesson";

export const f0_1: LessonDoc = {
  id: "F0.1",
  slug: "f0-1-uklad-wspolrzednych",
  title: "Układ współrzędnych frezarki",
  minutes: 12,
  goal: "Wskażesz kierunki X, Y i Z na frezarce i odczytasz z rysunku współrzędne dowolnego punktu detalu.",

  theory: [
    { t: "h", x: "Trzy osie liniowe", id: "osie" },
    { t: "p", x: "Frezarka pionowa ma trzy osie liniowe. **X** to ruch w prawo i w lewo, zwykle najdłuższy przesuw. **Y** to ruch do operatora i od niego. **Z** to ruch w górę i w dół, wzdłuż osi wrzeciona." },
    { t: "diagram", id: "f01-axes" },
    { t: "p", x: "Zwroty dodatnie wyznacza [[reguła prawej dłoni]]: kciuk to +X, palec wskazujący +Y, środkowy +Z. Tak ustawione osie tworzą [[układ współrzędnych|układ prawoskrętny]] opisany w normie ISO 841. Obowiązuje on na każdym sterowaniu, więc na Fanucu i na Sinumeriku kierunki są te same." },

    { t: "h", x: "+Z znaczy: od detalu", id: "plus-z" },
    { t: "p", x: "Najważniejsza zasada tej lekcji: **ruch w +Z zwiększa odległość narzędzia od detalu**. Z0 kładzie się zwykle na górnej powierzchni, więc każda wartość Z z minusem leży już w materiale." },
    { t: "diagram", id: "f01-side" },

    { t: "h", x: "Programujesz ruch narzędzia", id: "ruch-narzedzia" },
    { t: "p", x: "Na wielu frezarkach w X i Y jeździ stół, a wrzeciono stoi w miejscu. Program pisze się jednak zawsze tak, jakby ruszało się narzędzie, a detal stał. Dzięki temu ten sam program działa na maszynie z ruchomym stołem i na maszynie z ruchomą kolumną." },

    { t: "h", x: "Współrzędne punktu", id: "wspolrzedne" },
    { t: "p", x: "Położenie punktu to trzy liczby: odległości od [[zero detalu|zera detalu]] mierzone wzdłuż X, Y i Z. Zapis `X60 Y20 Z5` znaczy: 60 mm w prawo od zera, 20 mm w głąb i 5 mm nad górną powierzchnią." },
    { t: "diagram", id: "f01-zero" },
    { t: "p", x: "Miejsce zera wybiera programista. Narożnik daje same dodatnie X i Y, więc łatwo czytać program. Środek wymaga minusów, ale jest wygodny przy detalach symetrycznych i okrągłych. Jak zero ustawia się na maszynie — w lekcji F0.2." },
    { t: "note", kind: "info", x: "Obroty wokół X, Y i Z to osie **A**, **B** i **C**. Spotkasz je na maszynach 4- i 5-osiowych. Ten kurs zostaje przy trzech osiach liniowych." },
  ],

  worked: {
    title: "Odczytaj pozycję nad punktem H",
    intro: "Płytka 80 × 50 × 20, zero W w lewym dolnym narożniku, Z0 na górnej powierzchni. Frez ma stanąć 5 mm nad punktem H.",
    fig: "f01-top",
    steps: [
      { x: "Znajdź zero **W**. Od niego liczysz wszystkie trzy współrzędne." },
      { x: "Idź wzdłuż X do rzutu punktu H: 60 mm w prawo.", code: "X60" },
      { x: "Idź wzdłuż Y: 20 mm od dolnej krawędzi płytki.", code: "Y20" },
      { x: "Wysokość: 5 mm nad powierzchnią, na której leży Z0.", code: "Z5" },
    ],
    result: "Pozycja nad H to `X60 Y20 Z5`. Tak samo odczytasz naroża: P2 `X80 Y0`, P3 `X80 Y50`, P4 `X0 Y50`.",
  },

  practice: [
    {
      kind: "jog",
      intro: "Przyciski działają jak ręczny przesuw osi na maszynie. Dojedź narzędziem do kolejnych punktów; skok 1 mm przyda się przy ostatnim.",
      goals: [
        { x: 80, y: 0, z: 10, label: "10 mm nad prawym przednim narożnikiem" },
        { x: 0, y: 50, z: 0, label: "dotknij lewego tylnego narożnika" },
        { x: 40, y: 20, z: -5, label: "zejdź 5 mm w materiał" },
      ],
    },
    {
      kind: "points",
      intro: "Zaznacz punkty na widoku z góry. Pierwszy z liniami pomocniczymi, kolejne bez.",
      tasks: [
        { target: [30, 40], prompt: "Zaznacz X30 Y40.", guides: true },
        { target: [80, 20], prompt: "Zaznacz X80 Y20." },
        { target: [-10, 10], prompt: "Zaznacz X−10 Y10. Uwaga na znak." },
      ],
    },
  ],

  pitfalls: [
    {
      title: "Zgubiony minus przy Z",
      x: "`Z2` zamiast `Z-2` i frez przejdzie nad detalem, niczego nie zbierając. Odwrotna pomyłka, `Z-20` zamiast `Z-2`, to wejście w materiał na całą grubość płytki. Przy każdej wartości Z zadaj sobie pytanie: powietrze czy materiał?",
      fig: "f01-zsign",
    },
    {
      title: "Ruch stołu a ruch narzędzia",
      x: "Stół jedzie w lewo, a na ekranie rośnie X. To nie usterka: sterowanie pokazuje położenie narzędzia względem detalu, a ono przesuwa się po detalu w prawo.",
      fig: "f01-table",
    },
    {
      title: "Wymiar od innej bazy niż zero",
      x: "Rysunek bywa zwymiarowany od prawej krawędzi albo od osi otworu, a zero programu leży w lewym narożniku. Wtedy trzeba przeliczyć: otwór 20 mm od prawej krawędzi płytki o długości 80 mm ma `X60`, a nie `X20`.",
    },
    {
      title: "Minusy przy zerze na środku",
      x: "Przy zerze na środku lewy dolny narożnik płytki 80 × 50 to `X-40 Y-25`. Pominięty minus przenosi punkt do innej ćwiartki, po drugiej stronie detalu.",
    },
  ],

  controllers: {
    rows: [
      ["Kierunki osi", "wg ISO 841, układ prawoskrętny", "wg ISO 841, układ prawoskrętny"],
      ["Ekran pozycji", "ABSOLUTE, RELATIVE, MACHINE", "przełącznik WCS / MCS (po niemiecku WKS / MKS)"],
      ["Komentarz w programie", "`(TEKST)`", "`; TEKST`"],
    ],
    note: "W tej lekcji sterowania się nie różnią. Różnice w zapisie programu zaczynają się w module F1.",
  },

  quiz: [
    { kind: "choice", q: "Na frezarce pionowej ruch w **+Z** oznacza, że narzędzie:",
      options: ["zbliża się do detalu", "odjeżdża od detalu w górę", "przesuwa się w prawo", "przesuwa się w stronę operatora"],
      answer: 1, why: "+Z zawsze zwiększa odległość między narzędziem a detalem. Na frezarce pionowej to ruch w górę." },
    { kind: "choice", q: "Z0 leży na górnej powierzchni. Frez ma zejść **3 mm** w materiał. Która wartość jest poprawna?",
      options: ["`Z3`", "`Z-3`", "`Z0.3`", "`Z-0.3`"],
      answer: 1, why: "Materiał jest pod Z0, więc głębokość ma minus: `Z-3`. `Z3` to 3 mm nad powierzchnią." },
    { kind: "gap", q: "Płytka 80 × 50, zero w lewym dolnym narożniku. Podaj współrzędne prawego górnego narożnika.",
      template: "X{0} Y{1}", answers: [["80"], ["50"]],
      why: "Prawy górny narożnik leży na końcu obu wymiarów: 80 mm w X i 50 mm w Y." },
    { kind: "point", q: "Zaznacz punkt **X50 Y10**.", target: [50, 10],
      why: "Od W 50 mm w prawo, potem 10 mm w górę rysunku." },
    { kind: "choice", q: "Zero leży na środku płytki 80 × 50. Jakie współrzędne ma **lewy dolny** narożnik?",
      options: ["`X40 Y25`", "`X0 Y0`", "`X-40 Y-25`", "`X-80 Y-50`"],
      answer: 2, why: "Od środka do lewej krawędzi jest połowa długości (40 mm), do dolnej połowa szerokości (25 mm). Oba kierunki są ujemne." },
    { kind: "choice", q: "Stół frezarki przesuwa się w lewo. W którą stronę porusza się narzędzie **względem detalu**?",
      options: ["w lewo, −X", "w prawo, +X", "nie porusza się", "zależy od sterowania"],
      answer: 1, why: "Ruch stołu w jedną stronę to ruch narzędzia względem detalu w przeciwną. Program opisuje ruch narzędzia, więc to +X." },
    { kind: "gap", q: "Otwór leży **20 mm od prawej** krawędzi płytki o długości 80 mm i 15 mm od dolnej. Zero w lewym dolnym narożniku. Podaj pozycję otworu.",
      template: "X{0} Y{1}", answers: [["60"], ["15"]],
      why: "Wymiar od prawej krawędzi trzeba przeliczyć na odległość od zera: 80 − 20 = 60." },
  ],

  summary: [
    "X w prawo, Y od operatora, Z w górę. Zwroty dodatnie daje reguła prawej dłoni.",
    "+Z odsuwa narzędzie od detalu. Przy Z0 na górze minus oznacza materiał.",
    "Program opisuje ruch narzędzia, nawet jeśli na maszynie jeździ stół.",
    "Współrzędne liczysz od zera detalu, a nie od krawędzi, od której zwymiarowano rysunek.",
  ],

  sources: [
    { id: "iso841", where: "nazewnictwo osi, układ prawoskrętny, zwrot +Z" },
    { id: "fanuc", where: "ekran pozycji: układ absolutny, względny i maszynowy" },
    { id: "sinumerik", where: "układy MCS i WCS, komentarze w programie" },
  ],
};
