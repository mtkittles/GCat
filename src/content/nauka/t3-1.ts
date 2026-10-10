import type { LessonDoc } from "@/lib/lesson";
import { T3_HEAD, T3_TAIL } from "./t3-common";

const pass = `G00 X36.4
G01 Z-54.8 F0.3
X40.5
G00 Z2.`;

const starter = `${T3_HEAD}
(DOPISZ PIERWSZE PRZEJSCIE ZGRUBNE NA FI36.4 DO Z-54.8,
 WYJSCIE NA FI40.5 I POWROT NAD CZOLO)

${T3_TAIL}`;

export const t3_1: LessonDoc = {
  id: "T3.1",
  slug: "t3-1-g00-ruch-szybki",
  title: "G00 — ruch szybki",
  minutes: 12,
  goal: "Zaprogramujesz przejście toczenia z bezpiecznymi ruchami szybkimi: wejście na średnicę przed czołem i powrót dopiero po wyjściu z materiału.",

  theory: [
    { t: "h", x: "G00 na tokarce", id: "g00" },
    { t: "p", x: "[[G00]] przesuwa nóż z maksymalną prędkością osi, bez posuwu F. Na tokarce ruch szybki wraca między przejściami tyle razy, że decyduje o dużej części czasu cyklu — i o większości kolizji." },
    { t: "p", x: "Tor ruchu szybkiego zależy od parametru: osie mogą jechać razem po prostej albo niezależnie, każda z pełną prędkością. Ruch w obu osiach naraz wykonuj więc tylko tam, gdzie nic nie stoi na drodze w żadnym wariancie toru." },

    { t: "h", x: "Przejście toczenia", id: "przejscie" },
    { t: "diagram", id: "t31-pass" },
    { t: "ul", items: [
      "**Wejście** — ruch szybki w X na średnicę przejścia, przed czołem (Z2). Nóż nie dotyka materiału, bo stoi przed nim.",
      "**Toczenie** — G01 wzdłuż osi, z posuwem.",
      "**Wyjście** — G01 w X ponad toczoną średnicę. Na posuwie, bo nóż jeszcze styka się z materiałem przy stopniu.",
      "**Powrót** — G00 w Z nad czoło. Nóż jest już ponad detalem.",
    ] },

    { t: "h", x: "Punkt startowy i punkt wymiany", id: "punkty" },
    { t: "p", x: "Najazd z punktu referencyjnego albo wymiany narzędzia może iść w X i Z naraz, jeśli z tamtej strony nic nie wystaje. Przy detalu obowiązuje reguła z T1.3: odjazd najpierw w X, potem w Z. Punkt nad czołem, np. X44 Z2, to bezpieczne miejsce, z którego zaczyna się każde przejście." },
    { t: "note", kind: "warn", x: "Konik i długie wiertło w głowicy to najczęstsze przeszkody na drodze ruchu szybkiego. Przy pierwszym uruchomieniu programu ustaw korektor ruchu szybkiego na 25% i pracuj blok po bloku." },
  ],

  worked: {
    title: "Pierwsze przejście zgrubne wałka",
    intro: "Po planowaniu nóż stoi w X−1,6 Z2. Pierwsze przejście ma zdjąć pręt Ø40 na Ø36,4 na długości całego detalu (z naddatkiem 0,2 mm w Z).",
    steps: [
      { x: "Ruch szybki w X na średnicę przejścia — przed czołem.", code: "G00 X36.4" },
      { x: "Toczenie wzdłużne do Z−54,8 z posuwem zgrubnym.", code: "G01 Z-54.8 F0.3" },
      { x: "Wyjście w X ponad pręt, na posuwie.", code: "X40.5" },
      { x: "Powrót ruchem szybkim nad czoło.", code: "G00 Z2." },
    ],
    result: "Cztery bloki, dwa kody G. W T3.2 dojdą kolejne przejścia — każde według tego samego wzoru.",
  },

  practice: [
    {
      kind: "task",
      mode: "lathe",
      intro: "Dopisz pierwsze przejście zgrubne. Sprawdzany jest tor i położenie końcowe noża.",
      starter,
      checks: [
        { t: "cut", reference: `${T3_HEAD}\n${pass}`, tolerance: 0.05 },
        { t: "end", x: 40.5, z: 2, label: "Nóż kończy nad czołem, ponad prętem (X40.5 Z2)" },
      ],
      hints: ["G00 X36.4, potem G01 Z-54.8 F0.3.", "Wyjście X40.5 i powrót G00 Z2."],
      solution: starter.replace("(DOPISZ PIERWSZE PRZEJSCIE ZGRUBNE NA FI36.4 DO Z-54.8,\n WYJSCIE NA FI40.5 I POWROT NAD CZOLO)\n", `${pass}\n`),
    },
    {
      kind: "drill",
      intro: "Ruch szybki przy przejściach.",
      questions: [
        { kind: "order", q: "Ułóż ruchy jednego przejścia.", items: ["G00 Z2.", "G01 Z-30. F0.3", "G00 X34.", "X41."], answer: [2, 1, 3, 0], why: "Wejście, toczenie, wyjście, powrót." },
        { kind: "choice", q: "Po `G01 Z-30.` nóż stoi przy stopniu. Który blok jest błędem?", options: ["`G00 Z2.`", "`G01 X41.`", "`X41.`", "`G00 X41.`"], answer: 0, why: "Powrót w Z bez wyjścia w X przeciąga ostrze po powierzchni." },
      ],
    },
  ],

  pitfalls: [
    { title: "Powrót bez wyjścia w X", x: "`G00 Z2.` zaraz po toczeniu. Nóż jedzie ruchem szybkim wzdłuż świeżo toczonej średnicy — rysa na powierzchni, a przy stopniu uderzenie." },
    { title: "Wejście ruchem szybkim w materiał", x: "`G00 X36.4` z nożem ustawionym za czołem (Z ujemne). Ruch szybki promieniowy wprost w pręt." },
    { title: "Wyjście ruchem szybkim", x: "`G00 X40.5` zamiast `G01`. Przy stopniu nóż jeszcze styka się z czołem stopnia — ruch szybki wyrywa ostrze albo zostawia ślad." },
  ],

  controllers: {
    rows: [
      ["Ruch szybki", "`G00`", "`G0`"],
      ["Tor przy ruchu w dwóch osiach", "parametr: po prostej albo niezależnie", "`RTLION` / `RTLIOF`"],
    ],
    note: "Na obu sterowaniach bezpieczniej rozdzielać ruch szybki na osobne bloki w X i w Z, gdy nóż jest blisko detalu.",
  },

  quiz: [
    { kind: "choice", review: "T2.3", q: "Dlaczego planowanie kończy się na X ujemnym?", options: ["żeby naroże zebrało materiał w środku czoła", "bo X0 jest zabronione", "bo tak wymaga G96", "bez powodu"], answer: 0, why: "Wierzchołek teoretyczny i naroże to nie ten sam punkt." },
    { kind: "choice", q: "Którym ruchem nóż wchodzi na średnicę przejścia przed czołem?", options: ["G00", "G01", "G02", "G04"], answer: 0, why: "Nóż stoi przed czołem, w powietrzu." },
    { kind: "choice", q: "Którym ruchem nóż wychodzi z materiału przy stopniu?", options: ["G01", "G00", "G28", "dowolnym"], answer: 0, why: "Ostrze styka się jeszcze z czołem stopnia." },
    { kind: "choice", q: "Czy F wpływa na G00?", options: ["nie", "tak", "tylko przy G99", "tylko przy G96"], answer: 0, why: "Prędkość ruchu szybkiego ustawiają parametry i korektor." },
    { kind: "token", q: "Wskaż blok, który **wraca nad czoło**.", block: "G00 X36.4 | G01 Z-54.8 F0.3 | X40.5 | G00 Z2.", answer: 3, why: "G00 Z2. — po wyjściu w X." },
  ],

  summary: [
    "Przejście: G00 w X przed czołem, G01 w Z, G01 wyjście w X, G00 powrót w Z.",
    "Z materiału wychodzi się posuwem, ruch szybki tylko w powietrzu.",
    "Przy detalu ruch szybki w jednej osi naraz.",
    "Pierwsze uruchomienie: korektor ruchu szybkiego 25%, praca blok po bloku.",
  ],

  sources: [
    { id: "fanuc", where: "G00 na tokarce, tor ruchu szybkiego" },
    { id: "sinumerik", where: "G0, RTLION/RTLIOF" },
  ],
};
