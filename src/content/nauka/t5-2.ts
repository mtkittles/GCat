import type { LessonDoc } from "@/lib/lesson";

const head = `O2005 (KOLNIERZ)
G18 G21 G40 G80 G99
G54
T0101 (NOZ ZEWN. CNMG R0.8)
G50 S2500
G96 S180 M03
M08
G00 X64. Z2.`;

const profile = `N10 G00 Z-15.
G01 X30. F0.1
Z-1.
N20 X28. Z0.`;

const tail = `G28 U0.
G28 W0.
T0202 (NOZ WYKANCZAJACY VBMT R0.4)
G96 S220 M03
G00 X64. Z2.
G70 P10 Q20
M09
M05
G28 U0.
G28 W0.
M30`;

const program = `${head}\nG72 W2. R0.5\nG72 P10 Q20 U0.4 W0.1 F0.25\n${profile}\n${tail}`;

const starter = `${head}
(DOPISZ DWA BLOKI G72: GLEBOKOSC 2 W Z, WYCOFANIE 0.5,
 KONTUR N10-N20, NADDATEK 0.4 NA SREDNICY I 0.1 W Z, F0.25)

${profile}
${tail}`;

export const t5_2: LessonDoc = {
  id: "T5.2",
  slug: "t5-2-g72-planowanie",
  title: "G72 — planowanie",
  minutes: 13,
  goal: "Rozpoznasz detal, dla którego obróbka poprzeczna G72 jest lepsza niż G71, i zaprogramujesz ją.",

  theory: [
    { t: "h", x: "Przejścia poprzeczne", id: "g72" },
    { t: "p", x: "[[G72]] to odpowiednik G71 obrócony o 90°: warstwy schodzą w Z, a każda warstwa jest toczona poprzecznie, w X — od zewnątrz w stronę osi. Pasuje do detali krótkich i szerokich: kołnierzy, tarcz, pierścieni." },
    { t: "diagram", id: "t52-g72" },
    { t: "code", x: "G72 W2. R0.5\nG72 P10 Q20 U0.4 W0.1 F0.25", caption: "W pierwszym bloku W to głębokość warstwy w Z. W drugim — jak w G71: naddatki U (średnica) i W, posuw F." },

    { t: "h", x: "G71 czy G72", id: "wybor" },
    { t: "table", head: ["Kryterium", "G71 — wzdłużnie", "G72 — poprzecznie"], rows: [
      ["kształt materiału do zdjęcia", "długi i płytki", "krótki i głęboki"],
      ["przykład", "wałek stopniowany", "kołnierz, tarcza"],
      ["pierwszy blok konturu", "ruch tylko w X", "ruch tylko w Z"],
      ["głębokość warstwy", "U w pierwszym bloku", "W w pierwszym bloku"],
    ] },
    { t: "p", x: "O wyborze decyduje kierunek, w którym zdejmuje się naddatek. G71 zbiera warstwy równoległe do osi: każde przejście biegnie wzdłuż Z, a cykl schodzi w X. G72 zbiera warstwy równoległe do czoła: przejście biegnie w X, a cykl schodzi w Z. Materiał długi i płytki zbiera się więc wzdłużnie, krótki i głęboki — poprzecznie." },
    { t: "p", x: "Liczba przejść jest skutkiem tego wyboru. Kołnierz z przykładu to przypadek graniczny: 15 mm materiału na stronę na długości 15 mm, więc oba cykle zrobią po osiem warstw. Tarcza Ø120 z piastą Ø40 grubości 20: G71 robi 20 warstw po ok. 20 mm długości, G72 — 10 warstw po ok. 40 mm, na całą wysokość tarczy." },
    { t: "demo", mode: "lathe", title: "Kołnierz cyklem G72 i G70", src: program, caption: "Zielone — przejścia poprzeczne, na końcu przejście po konturze z naddatkiem i wykończenie G70." },

    { t: "h", x: "Kontur dla G72", id: "kontur" },
    { t: "ul", items: [
      "pierwszy blok (N10) — ruch tylko w Z, z punktu startowego na głębokość konturu,",
      "kontur monotoniczny w Z — nie może wracać w stronę uchwytu,",
      "punkt startowy ponad średnicą pręta i przed czołem, jak w G71.",
    ] },
  ],

  worked: {
    title: "Kołnierz z pręta Ø60",
    intro: "Sytuacja: piasta Ø30 długa na 15 mm z fazą 1 × 45°, kołnierz zostaje z pręta Ø60, czoło pręta na Z0. Materiału jest 15 mm na stronę na długości 15 mm — zdejmie go G72. Start w X64 Z2. Numery na rysunku to numery kroków.",
    fig: "t52-layers",
    steps: [
      { x: "Pierwszy blok konturu: ruch tylko w Z na głębokość kołnierza.", code: "N10 G00 Z-15." },
      { x: "Czoło kołnierza do piasty i piasta w stronę czoła.", code: "G01 X30. F0.1 → Z-1." },
      { x: "Faza i koniec konturu.", code: "N20 X28. Z0." },
      { x: "Cykl: warstwy po 2 mm w Z, naddatki jak w G71.", code: "G72 W2. R0.5 → G72 P10 Q20 U0.4 W0.1 F0.25" },
    ],
    result: "Kontur G72 czyta się „od głębi do czoła” — odwrotnie niż kontur G71, który biegnie od czoła w stronę uchwytu. Po G72 zostaje pomarańczowy pas naddatku na nóż wykańczający i G70.",
  },

  practice: [
    {
      kind: "task",
      mode: "lathe",
      intro: "Kontur kołnierza i wykończenie G70 są gotowe. Dopisz oba bloki G72.",
      starter,
      checks: [
        { t: "cut", reference: program, tolerance: 0.05 },
        { t: "require", codes: ["G72"] },
      ],
      hints: ["G72 W2. R0.5", "G72 P10 Q20 U0.4 W0.1 F0.25"],
      solution: program,
    },
    {
      kind: "drill",
      intro: "Wybór cyklu.",
      questions: [
        { kind: "choice", q: "Tarcza Ø120 grubości 20 z piastą Ø40. Który cykl zgrubny?", options: ["G72", "G71", "G70", "G76"], answer: 0, why: "Materiał krótki i głęboki — przejścia poprzeczne." },
        { kind: "choice", q: "Jaki ruch ma pierwszy blok konturu dla G72?", options: ["ruch tylko w Z", "ruch tylko w X", "łuk", "dowolny"], answer: 0, why: "Odwrotnie niż w G71." },
      ],
    },
  ],

  pitfalls: [
    { title: "Kontur G71 w G72", x: "Kontur przepisany z G71, zaczynający się ruchem w X. G72 wymaga pierwszego ruchu w Z — alarm albo przejścia w złym kierunku." },
    { title: "W pomylone w blokach", x: "Pierwszy blok: W to głębokość warstwy. Drugi blok: W to naddatek w Z. `G72 W0.1 R0.5` robi warstwy po 0,1 mm." },
    { title: "Za mały zapas startu w X", x: "Start w X61 przy pręcie Ø60. Ruch szybki w Z na głębokość konturu przechodzi 0,5 mm od powierzchni pręta — przy biciu pręta ociera o materiał." },
  ],

  controllers: {
    rows: [
      ["Zgrubnie poprzecznie", "`G72` (dwa bloki)", "`CYCLE95` / `CYCLE952` w wariancie poprzecznym"],
      ["Głębokość warstwy", "W w pierwszym bloku", "parametr cyklu"],
    ],
    note: "Na Sinumeriku kierunek obróbki (wzdłużnie czy poprzecznie) to parametr tego samego cyklu, a nie osobny kod.",
  },

  quiz: [
    { kind: "choice", review: "T5.1", q: "Co oznacza U w drugim bloku G71?", options: ["naddatek w X w średnicy", "głębokość skrawania", "przyrost X", "prędkość"], answer: 0, why: "W pierwszym bloku U to głębokość." },
    { kind: "choice", q: "W którą stronę idą przejścia G72?", options: ["w X, od zewnątrz do osi", "w Z, w stronę uchwytu", "po łuku", "w obu osiach naraz"], answer: 0, why: "Toczenie poprzeczne warstwami w Z." },
    { kind: "choice", q: "Co oznacza W w pierwszym bloku G72?", options: ["głębokość warstwy w Z", "naddatek w Z", "przyrost Z", "posuw"], answer: 0, why: "W drugim bloku W to naddatek." },
    { kind: "choice", q: "Dla którego detalu G72 jest lepszy niż G71?", options: ["krótki i szeroki kołnierz", "długi wałek", "cienki pręt", "gwint"], answer: 0, why: "Materiał do zdjęcia jest krótki i głęboki." },
    { kind: "choice", q: "Czy G70 działa z konturem cyklu G72?", options: ["tak, tak samo jak z G71", "nie", "tylko na Sinumeriku", "tylko bez naddatków"], answer: 0, why: "G70 wykonuje kontur P–Q niezależnie od cyklu zgrubnego." },
  ],

  summary: [
    "G72 — przejścia poprzeczne, warstwy w Z. Do kołnierzy i tarcz.",
    "G72 W(głębokość) R / G72 P Q U W F.",
    "Pierwszy blok konturu — ruch tylko w Z.",
    "Wykończenie tak samo: G70 P Q.",
  ],

  sources: [
    { id: "fanuc", where: "cykl wielokrotny G72" },
    { id: "sandvik", where: "planowanie i toczenie poprzeczne" },
  ],
};
