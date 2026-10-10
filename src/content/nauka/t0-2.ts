import type { LessonDoc } from "@/lib/lesson";

export const t0_2: LessonDoc = {
  id: "T0.2",
  slug: "t0-2-programowanie-srednicowe",
  title: "Programowanie średnicowe",
  minutes: 12,
  goal: "Przeliczysz średnicę na promień i głębokość skrawania i zapiszesz fazę w wartościach średnicowych.",

  theory: [
    { t: "h", x: "X to średnica", id: "srednica" },
    { t: "p", x: "Na tokarkach X programuje się zwykle jako **średnicę**: `X30` ustawia nóż 15 mm od osi. Tak wymiaruje się rysunki tokarskie i tak mierzy się detal mikrometrem, więc liczby z rysunku i z pomiaru trafiają do programu bez przeliczania. Parametr sterowania może przełączyć X na promień, ale standardem jest średnica." },
    { t: "diagram", id: "t02-dia" },
    { t: "code", x: "ap = (D przed − D po) / 2\nØ40 → Ø30:  ap = (40 − 30) / 2 = 5 mm", caption: "Głębokość skrawania to połowa różnicy średnic." },

    { t: "h", x: "Co jest w średnicy, a co nie", id: "co" },
    { t: "table", head: ["Adres", "Wartość", "Uwagi"], rows: [
      ["**X**", "średnica", "`X30` = 15 mm od osi"],
      ["**U**", "przyrost średnicy", "`U-2.` = nóż 1 mm bliżej osi (lekcja T1.2)"],
      ["**Z**, **W**", "zwykła długość", "bez zmian"],
      ["**R**", "promień łuku", "promień, nie średnica"],
      ["**I**", "odległość do środka łuku w X", "na Fanucu w promieniu"],
    ], caption: "Pułapka: X jest w średnicy, ale promień łuku R i składowa I — w promieniu." },

    { t: "h", x: "Fazy i stożki", id: "fazy" },
    { t: "p", x: "Faza 1 × 45° zabiera 1 mm w Z i 1 mm promieniowo. W zapisie średnicowym X zmienia się więc o 2 mm na każdy 1 mm w Z." },
    { t: "diagram", id: "t02-chamfer" },
    { t: "code", x: "faza 45°:     |ΔX| = 2 · |ΔZ|\nstożek α:     |ΔX| = 2 · |ΔZ| · tan α     (α — półkąt: kąt tworzącej do osi Z;\n                                          pełny kąt wierzchołkowy = 2α)", caption: "Wartości bezwzględne. Znaki ΔX i ΔZ zależą od kierunku ruchu — w stronę uchwytu Z maleje." },
    { t: "diagram", id: "t02-taper" },
  ],

  worked: {
    title: "Przejścia z Ø40 na Ø30",
    intro: "Sytuacja: czop Ø30 o długości 20 mm ma powstać z pręta Ø40, a nóż zbiera najwyżej 2,5 mm na stronę. Ile przejść i jakie X w każdym z nich? Numery na rysunku to numery kroków.",
    fig: "t02-pass",
    steps: [
      { x: "Materiał na stronę: połowa różnicy średnic.", code: "(40 − 30) / 2 = 5 mm" },
      { x: "5 mm przy 2,5 mm na przejście — dwa przejścia. W średnicy każde to 5 mm.", code: "2 × 2,5 mm" },
      { x: "Pierwsze przejście: z Ø40 na Ø35.", code: "X35." },
      { x: "Drugie: z Ø35 na Ø30.", code: "X30." },
    ],
    result: "Każdy krok o 5 w X to 2,5 mm głębokości skrawania. Gdyby policzyć ap jako różnicę średnic, przejścia byłyby zaplanowane dwa razy płycej, niż wychodzi naprawdę.",
  },

  practice: [
    {
      kind: "lathejog",
      intro: "Obserwuj odczyt X. Przycisk „Pokaż promień” przełącza wyświetlanie i rysuje odległość noża od osi.",
      goals: [
        { kind: "move", x: 50, z: -20, label: "5 mm nad powierzchnią pręta Ø40 — sprawdź, ile to w promieniu" },
        { kind: "move", x: 40, z: 2, label: "nad średnicą pręta, 2 mm przed czołem" },
        { kind: "move", x: 20, z: 2, label: "nad przyszłym czopem Ø20" },
      ],
    },
    {
      kind: "drill",
      intro: "Przeliczenia średnicowe.",
      questions: [
        { kind: "gap", q: "Toczysz z Ø36 na Ø30 jednym przejściem. Ile wynosi głębokość skrawania ap?", template: "{0} mm", answers: [["3"]], why: "(36 − 30) / 2 = 3." },
        { kind: "gap", q: "Faza 1,5 × 45° na czopie Ø24. Na jakiej średnicy faza zaczyna się na czole?", template: "X{0}", answers: [["21"]], why: "24 − 2 · 1,5 = 21." },
        { kind: "gap", q: "W programie czopa Ø30 z pręta Ø40 zamiast `X30.` wpisano promień z rysunku, `X15.`. Jaką średnicę stoczy nóż i jaką głębokość weźmie jednym przejściem?", template: "Ø{0}, ap {1} mm", answers: [["15"], ["12,5", "12.5"]], why: "X15 to średnica 15, czyli 7,5 mm od osi. Z promienia 20 na 7,5 to 12,5 mm na stronę — pięć razy więcej niż zakładane 2,5 mm. Detal do wyrzucenia, a nóż przy takim ap może się złamać." },
        { kind: "choice", q: "Nóż stoi w X40. Ile milimetrów od osi?", options: ["20", "40", "80", "10"], answer: 0, why: "X to średnica, promień to połowa." },
      ],
    },
  ],

  pitfalls: [
    { title: "Promień zamiast średnicy", x: "Programista wpisuje promień z rysunku: `X15.` dla Ø30. Nóż toczy Ø15 — detal do wyrzucenia, a przy głębokim przejściu nóż wchodzi w materiał z ogromnym ap." },
    { title: "ap równe różnicy średnic", x: "Z Ø40 na Ø30 policzone jako 10 mm głębokości. Przejścia są zaplanowane dwa razy płycej, niż myślisz — albo, przy odwrotnej pomyłce, dwa razy głębiej." },
    { title: "Średnica w R łuku", x: "Promień zaokrąglenia R3 wpisany jako `R6.` przez analogię do X. R jest zawsze promieniem łuku." },
    { title: "Faza liczona jak na frezarce", x: "Faza 1 × 45° zapisana jako |ΔX| = 1 przy |ΔZ| = 1. W zapisie średnicowym promień zmienia się wtedy tylko o 0,5 mm na 1 mm długości — to nie faza 45°, tylko stożek o półkącie ok. 26,6° (tan α = 0,5). Dla fazy 1 × 45° potrzeba |ΔX| = 2 przy |ΔZ| = 1." },
  ],

  controllers: {
    rows: [
      ["X średnicowo", "domyślnie, parametr maszyny", "`DIAMON`"],
      ["X promieniowo", "parametr maszyny", "`DIAMOF`"],
      ["Wartości absolutne w średnicy, przyrostowe w promieniu", "—", "`DIAM90`"],
    ],
    note: "Na Sinumeriku tryb średnicowy włącza się w programie. Na Fanucu decyduje parametr — zwykle ustawiony na średnicę i niezmieniany.",
  },

  quiz: [
    { kind: "choice", review: "T0.1", q: "Gdzie leży X0 na tokarce?", options: ["na osi obrotu", "na powierzchni pręta", "na czole", "na szczękach"], answer: 0, why: "X0 to oś." },
    { kind: "choice", q: "Co oznacza `X30` na tokarce z programowaniem średnicowym?", options: ["średnicę 30 mm", "30 mm od osi", "30 mm od czoła", "promień 30"], answer: 0, why: "Nóż stoi 15 mm od osi." },
    { kind: "gap", q: "Toczysz z Ø50 na Ø42 jednym przejściem. Ile wynosi ap?", template: "{0} mm", answers: [["4"]], why: "(50 − 42) / 2 = 4." },
    { kind: "gap", q: "Faza 1 × 45° zaczyna się na czole stopnia w Z−20 i kończy na Ø30 w Z−21. Na jakiej średnicy się zaczyna?", template: "X{0}", answers: [["28"]], why: "30 − 2 · 1 = 28." },
    { kind: "choice", q: "Jak podajesz promień łuku R na tokarce z programowaniem średnicowym?", options: ["jako promień", "jako średnicę", "zależnie od X", "w U"], answer: 0, why: "R to zawsze promień." },
    { kind: "choice", q: "Po co średnice w programie?", options: ["tak wymiaruje się rysunki i mierzy detal", "bo sterowanie liczy szybciej", "bo X nie może być promieniem", "bez powodu"], answer: 0, why: "Liczby z rysunku i pomiaru trafiają do programu bez przeliczeń." },
  ],

  summary: [
    "X na tokarce to średnica: X30 = 15 mm od osi.",
    "ap = (D przed − D po) / 2.",
    "R łuku i I są w promieniu, choć X jest w średnicy.",
    "Faza 45°: |ΔX| = 2 · |ΔZ| (wartości bezwzględne).",
  ],

  sources: [
    { id: "fanuc", where: "programowanie średnicowe i promieniowe osi X" },
    { id: "sinumerik", where: "DIAMON, DIAMOF, DIAM90" },
    { id: "jemielniak", where: "toczenie: głębokość skrawania, średnice" },
  ],
};
