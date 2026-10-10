import type { LessonDoc } from "@/lib/lesson";

const head = `O2006 (PODCIECIE)
G18 G21 G40 G80 G99
G54
T0303 (NOZ DO ROWKOW 3MM, POMIAR NA LEWYM NAROZU)
G50 S3000
G96 S120 M03
M08
G00 X22. Z-19.`;

const cyc = `G75 R0.5
G75 X17. Z-20. P1500 Q1000 F0.05`;

const tail = `G00 X44.
M09
M05
G28 U0.
G28 W0.
M30`;

const starter = `${head}
(DOPISZ CYKL G75: WYCOFANIE 0.5, DNO FI17, DRUGIE WCIECIE W Z-20,
 WCIECIA PO 1.5 MM NA STRONE, PRZESUNIECIE 1 MM, POSUW 0.05)

${tail}`;

export const t6_1: LessonDoc = {
  id: "T6.1",
  slug: "t6-1-g75-rowki",
  title: "G75 — rowki",
  minutes: 14,
  goal: "Zaprogramujesz rowek szerszy niż nóż cyklem G75, z właściwym narożem odniesienia i łamaniem wióra.",

  theory: [
    { t: "h", x: "Rowek i nóż do rowków", id: "rowek" },
    { t: "p", x: "Nóż do rowków ma dwa naroża i ostrze czołowe o znanej szerokości. Mierzy się go na jednym narożu — zwykle lewym, od strony uchwytu. Z w programie to wtedy położenie lewej krawędzi noża, a prawa jest o szerokość płytki dalej w stronę czoła." },
    { t: "diagram", id: "t61-groove" },
    { t: "p", x: "Wałek dostaje podcięcie 4 × Ø17 przy stopniu — wybieg dla noża do gwintów z modułu T7. Rowek jest o 1 mm szerszy niż nóż, więc potrzeba dwóch wcięć." },

    { t: "h", x: "Cykl G75", id: "g75" },
    { t: "code", x: "G75 R0.5\nG75 X17. Z-20. P1500 Q1000 F0.05" },
    { t: "table", head: ["Adres", "Znaczenie"], rows: [
      ["**R** (pierwszy blok)", "wycofanie po każdym wejściu — łamie wiór"],
      ["**X**", "średnica dna rowka"],
      ["**Z**", "położenie ostatniego wcięcia (dla rowka szerszego niż nóż)"],
      ["**P**", "głębokość jednego wejścia na stronę, w mikrometrach, bez kropki"],
      ["**Q**", "przesunięcie w Z między wcięciami, w mikrometrach, bez kropki"],
      ["**F**", "posuw wcinania"],
    ], caption: "Punkt startowy to pierwsze wcięcie: X ponad materiałem, Z pierwszej pozycji noża." },
    { t: "diagram", id: "t61-peck" },

    { t: "h", x: "Parametry rowkowania", id: "parametry" },
    { t: "p", x: "Nóż do rowków pracuje ostrzem czołowym na pełnej szerokości, a wiór nie ma gdzie uciec. Dlatego posuw jest mały — 0,03–0,08 mm/obr — a prędkość skrawania niższa niż przy toczeniu wzdłużnym. Wycofanie R łamie wiór, zanim zapcha rowek." },
    { t: "note", kind: "warn", x: "Odjazd z rowka zawsze najpierw w X. Ruch w Z z nożem w rowku łamie płytkę o ściankę." },
  ],

  worked: {
    title: "Podcięcie przy stopniu wałka",
    intro: "Rowek Z−16…Z−20, dno Ø17, nóż 3 mm zmierzony na lewym narożu. Ø20 przed rowkiem.",
    steps: [
      { x: "Pierwsze wcięcie: lewe naroże w Z−19, prawe w Z−16. Start ponad Ø20.", code: "G00 X22. Z-19." },
      { x: "Głębokość na stronę: (22 − 17) / 2 = 2,5 — dwa wejścia po 1,5 mm.", code: "P1500" },
      { x: "Drugie wcięcie przy stopniu: lewe naroże w Z−20, czyli 1 mm dalej.", code: "Z-20. Q1000" },
      { x: "Cykl i odjazd w X.", code: "G75 R0.5 → G75 X17. Z-20. P1500 Q1000 F0.05 → G00 X44." },
    ],
    result: "Cykl robi oba wcięcia, łamie wiór na każdym i wraca do punktu startowego.",
  },

  practice: [
    {
      kind: "task",
      mode: "lathe",
      intro: "Dopisz oba bloki G75 dla podcięcia. Sprawdzany jest tor noża.",
      starter,
      checks: [
        { t: "cut", reference: `${head}\n${cyc}\n${tail}`, tolerance: 0.05 },
        { t: "require", codes: ["G75"] },
      ],
      hints: ["G75 R0.5", "G75 X17. Z-20. P1500 Q1000 F0.05"],
      solution: starter.replace("(DOPISZ CYKL G75: WYCOFANIE 0.5, DNO FI17, DRUGIE WCIECIE W Z-20,\n WCIECIA PO 1.5 MM NA STRONE, PRZESUNIECIE 1 MM, POSUW 0.05)\n", `${cyc}\n`),
    },
    {
      kind: "drill",
      intro: "Położenie noża i adresy.",
      questions: [
        { kind: "gap", q: "Nóż szerokości 4 mm zmierzony na lewym narożu. Rowek Z−30…Z−26 (szerokość 4). Na jakie Z ustawisz nóż do pojedynczego wcięcia?", template: "Z{0}", answers: [["-30"]], why: "Lewa krawędź noża w Z−30, prawa w Z−26." },
        { kind: "gap", q: "Wejścia po 2 mm na stronę. Jaką wartość P wpiszesz w G75 (µm, bez kropki)?", template: "P{0}", answers: [["2000"]], why: "P w mikrometrach, bez kropki." },
        { kind: "choice", q: "Nóż w rowku na dnie. Jak odjechać?", options: ["najpierw w X", "najpierw w Z", "po skosie", "obojętnie"], answer: 0, why: "Ruch w Z w rowku łamie płytkę." },
      ],
    },
  ],

  pitfalls: [
    { title: "Pomylone naroże odniesienia", x: "Nóż zmierzony na prawym narożu, a program liczony dla lewego. Rowek przesuwa się o szerokość płytki — przy stopniu nóż wcina się w czoło stopnia." },
    { title: "P z kropką", x: "`P1.5` zamiast `P1500`. Na wielu Fanucach to alarm albo 0,0015 mm na wejście — cykl robi setki wejść." },
    { title: "Za duży posuw", x: "F0.2 jak przy toczeniu wzdłużnym. Wiór na pełnej szerokości ostrza nie ma gdzie uciec — płytka pęka." },
  ],

  controllers: {
    rows: [
      ["Rowek promieniowy", "`G75` (dwa bloki)", "`CYCLE93` / `CYCLE930`"],
      ["Głębokość wejścia, przesunięcie", "P, Q w mikrometrach", "parametry cyklu w mm"],
      ["Podcięcie pod gwint", "G75 albo ruchy G01", "`CYCLE96` (podcięcia normalne)"],
    ],
    note: "Sinumerik ma osobne cykle do rowków i do znormalizowanych podcięć pod gwint.",
  },

  quiz: [
    { kind: "choice", review: "T5.3", q: "W czym podawany jest FALX w CYCLE95?", options: ["w promieniu", "w średnicy", "w µm", "w obrotach"], answer: 0, why: "Inaczej niż U w G71." },
    { kind: "choice", q: "Co oznacza X w drugim bloku G75?", options: ["średnicę dna rowka", "przyrost X", "szerokość rowka", "wycofanie"], answer: 0, why: "Cel wcinania." },
    { kind: "choice", q: "Po co wycofanie R w G75?", options: ["żeby złamać wiór", "żeby zmierzyć rowek", "żeby zmienić nóż", "bez powodu"], answer: 0, why: "Wiór nie zapcha rowka." },
    { kind: "gap", q: "Start Ø30, dno Ø24, P1000. Ile wejść w jednym wcięciu?", template: "{0}", answers: [["3"]], why: "(30 − 24) / 2 = 3 mm na stronę, po 1 mm." },
    { kind: "choice", q: "Rowek 6 mm, nóż 3 mm. Ile wcięć przy Q3000?", options: ["2", "1", "3", "6"], answer: 0, why: "Druga pozycja 3 mm dalej pokrywa resztę." },
    { kind: "token", q: "Wskaż słowo, które podaje **przesunięcie między wcięciami**.", block: "G75 X17. Z-20. P1500 Q1000 F0.05", answer: 4, why: "Q1000 — 1 mm w Z." },
  ],

  summary: [
    "Nóż do rowków mierzy się na jednym narożu — Z w programie to ta krawędź.",
    "G75 R / G75 X(dno) Z(ostatnie wcięcie) P(wejście) Q(przesunięcie) F.",
    "P i Q w mikrometrach, bez kropki.",
    "Mały posuw i odjazd z rowka najpierw w X.",
  ],

  sources: [
    { id: "fanuc", where: "cykl G75 na tokarce" },
    { id: "sinumerik", where: "CYCLE93, CYCLE930, CYCLE96" },
    { id: "sandvik", where: "toczenie rowków i przecinanie, parametry" },
  ],
};
