import type { LessonDoc } from "@/lib/lesson";

const head = `O2007 (OTWOR OSIOWY)
G18 G21 G40 G80 G99
G54
T0505 (WIERTLO FI8)
G97 S1200 M03
M08
G00 X0. Z2.`;

const cyc = `G74 R0.5
G74 Z-15. Q3000 F0.08`;

const tail = `G00 Z5.
M09
M05
G28 U0.
G28 W0.
M30`;

const starter = `${head}
(DOPISZ CYKL G74: WYCOFANIE 0.5, WIERCENIE DO Z-15,
 WEJSCIA PO 3 MM, POSUW 0.08)

${tail}`;

export const t6_2: LessonDoc = {
  id: "T6.2",
  slug: "t6-2-g74-wiercenie-osiowe",
  title: "G74 — wiercenie osiowe",
  minutes: 12,
  goal: "Wywiercisz otwór w osi detalu cyklem G74 ze stałymi obrotami i łamaniem wióra.",

  theory: [
    { t: "h", x: "Wiercenie na tokarce", id: "tokarka" },
    { t: "p", x: "Na tokarce wiertło stoi w głowicy nieruchomo, w osi detalu (X0), a obraca się detal. Ruch posuwowy jest tylko w Z. To samo wiertło i te same zasady co na frezarce — zmieniają się tylko zapis i tryb obrotów." },
    { t: "diagram", id: "t62-drill" },

    { t: "h", x: "Obroty — G97", id: "obroty" },
    { t: "p", x: "W osi średnica jest równa zeru. Przy G96 sterowanie od razu podniosłoby obroty do limitu G50 (lekcja T2.2). Wiercenie w osi programuje się więc zawsze w G97, z obrotami liczonymi dla średnicy wiertła." },
    { t: "code", x: "wiertło HSS Ø8, vc ≈ 30 m/min:\nn = 1000 · 30 / (π · 8) ≈ 1194  →  G97 S1200" },

    { t: "h", x: "Cykl G74", id: "g74" },
    { t: "code", x: "G74 R0.5\nG74 Z-15. Q3000 F0.08" },
    { t: "table", head: ["Adres", "Znaczenie"], rows: [
      ["**R** (pierwszy blok)", "wycofanie po każdym wejściu"],
      ["**Z**", "głębokość — położenie czubka wiertła"],
      ["**Q**", "głębokość jednego wejścia, w mikrometrach, bez kropki"],
      ["**F**", "posuw na obrót"],
    ], caption: "G74 działa jak G73 z frezarki: krótkie wycofanie łamie wiór, ale go nie wyprowadza. Przy głębokich otworach operator dodaje pełne wyjście albo używa cyklu wiercenia z wyprowadzeniem wióra." },
    { t: "p", x: "Z tym samym cyklem, z adresami X i P, wykonuje się rowki czołowe — nóż wcina się w czoło w kolejnych średnicach. W tej lekcji używamy go tylko do wiercenia." },
    { t: "note", kind: "info", x: "Z w programie to czubek wiertła. Stożek wiertła 118° ma długość około 0,3 · D, więc pełna średnica Ø8 kończy się 2,4 mm wyżej — przy otworze pod gwint liczy się właśnie ta głębokość." },
  ],

  worked: {
    title: "Otwór Ø8 w czole wałka",
    intro: "Wiertło HSS Ø8 w pozycji 5, głębokość czubka 15 mm.",
    steps: [
      { x: "Obroty stałe dla Ø8.", code: "G97 S1200 M03" },
      { x: "Nad osią, 2 mm przed czołem.", code: "G00 X0. Z2." },
      { x: "Wycofanie 0,5 po każdym wejściu.", code: "G74 R0.5" },
      { x: "Do Z−15 po 3 mm, posuw 0,08 mm/obr.", code: "G74 Z-15. Q3000 F0.08" },
    ],
    result: "Z2 do Z−15 to 17 mm — sześć wejść po 3 mm, ostatnie krótsze. Cykl sam dzieli głębokość i wraca do Z2. Odjazd w Z od czoła, potem zmiana narzędzia.",
  },

  practice: [
    {
      kind: "task",
      mode: "lathe",
      intro: "Dopisz oba bloki G74. Sprawdzany jest tor wiertła.",
      starter,
      checks: [
        { t: "cut", reference: `${head}\n${cyc}\n${tail}`, tolerance: 0.05 },
        { t: "require", codes: ["G74"] },
      ],
      hints: ["G74 R0.5", "G74 Z-15. Q3000 F0.08"],
      solution: starter.replace("(DOPISZ CYKL G74: WYCOFANIE 0.5, WIERCENIE DO Z-15,\n WEJSCIA PO 3 MM, POSUW 0.08)\n", `${cyc}\n`),
    },
    {
      kind: "drill",
      intro: "Wiercenie w osi.",
      questions: [
        { kind: "gap", q: "Wiertło Ø10, vc = 25 m/min. Jakie obroty wpiszesz przy G97 (pełne obr/min)?", template: "S{0}", answers: [["796", "795", "800"]], why: "1000 · 25 / (π · 10) ≈ 796." },
        { kind: "choice", q: "Dlaczego wiercenie w osi w G97?", options: ["przy D = 0 G96 dałby od razu limit obrotów", "G96 nie działa z G74", "bo tak jest szybciej", "bez powodu"], answer: 0, why: "Obroty z G96 dążą do nieskończoności przy osi." },
        { kind: "gap", q: "Wejścia po 4 mm. Jaką wartość Q wpiszesz w G74 (µm, bez kropki)?", template: "Q{0}", answers: [["4000"]], why: "Mikrometry, bez kropki." },
      ],
    },
  ],

  pitfalls: [
    { title: "Wiercenie w G96", x: "Po toczeniu z G96 program przechodzi do wiertła bez G97. Wrzeciono rozpędza się do limitu G50, a wiertło pracuje z prędkością kilkakrotnie za dużą." },
    { title: "Wiertło poza osią", x: "Błędna korekcja X wiertła — X0 w programie nie trafia w oś. Wiertło wchodzi mimośrodowo, otwór jest za duży albo wiertło pęka." },
    { title: "Q z kropką", x: "`Q3.` zamiast `Q3000`. Zależnie od parametru — alarm albo wejścia po 0,003 mm." },
  ],

  controllers: {
    rows: [
      ["Wiercenie z łamaniem wióra", "`G74` na tokarce (system A)", "`CYCLE83` na tokarce"],
      ["Obroty", "`G97 S…`", "`G97 S…`"],
      ["Q", "mikrometry, bez kropki", "parametry cyklu w mm"],
    ],
    note: "Na Sinumeriku wiercenie na tokarce używa tych samych cykli co na frezarce, w płaszczyźnie tokarskiej.",
  },

  quiz: [
    { kind: "choice", review: "T6.1", q: "Co oznacza P w drugim bloku G75?", options: ["głębokość jednego wejścia na stronę", "średnicę dna", "przesunięcie w Z", "posuw"], answer: 0, why: "W mikrometrach." },
    { kind: "choice", q: "Gdzie stoi wiertło przy wierceniu w osi?", options: ["w X0", "w X8", "w Z0", "dowolnie"], answer: 0, why: "Oś obrotu." },
    { kind: "choice", q: "Który tryb obrotów przy wierceniu w osi?", options: ["G97", "G96", "G50", "G99"], answer: 0, why: "Stałe obroty dla średnicy wiertła." },
    { kind: "gap", q: "Głębokość Z−12, Q3000. Ile pełnych wejść po 3 mm (start Z0)?", template: "{0}", answers: [["4"]], why: "12 / 3 = 4." },
    { kind: "choice", q: "Czym jest Z w bloku G74 przy wierceniu?", options: ["położeniem czubka wiertła", "końcem pełnej średnicy", "wycofaniem", "punktem startu"], answer: 0, why: "Jak na frezarce." },
    { kind: "token", q: "Wskaż słowo, które podaje **głębokość wejścia**.", block: "G74 Z-15. Q3000 F0.08", answer: 2, why: "Q3000 — 3 mm." },
  ],

  summary: [
    "Na tokarce wiertło stoi w osi (X0), obraca się detal.",
    "Wiercenie w osi zawsze w G97.",
    "G74 R / G74 Z Q F — wejścia po Q z krótkim wycofaniem.",
    "Q w mikrometrach, bez kropki. Z to czubek wiertła.",
  ],

  sources: [
    { id: "fanuc", where: "cykl G74 na tokarce" },
    { id: "sinumerik", where: "cykle wiercenia na tokarce" },
    { id: "sandvik", where: "wiercenie na tokarce, prędkości skrawania" },
  ],
};
