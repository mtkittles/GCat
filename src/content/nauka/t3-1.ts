import type { LessonDoc } from "@/lib/lesson";
import { T3_HEAD, T3_TAIL } from "./t3-common";

const pass = `G00 X36.4
G01 Z-54.8 F0.3
X42.
G00 Z2.`;

const starter = `${T3_HEAD}
(DOPISZ PIERWSZE PRZEJSCIE ZGRUBNE NA FI36.4 DO Z-54.8,
 WYJSCIE NA FI42 I POWROT NAD CZOLO)

${T3_TAIL}`;

export const t3_1: LessonDoc = {
  id: "T3.1",
  slug: "t3-1-g00-ruch-szybki",
  title: "G00 — ruch szybki",
  minutes: 12,
  goal: "Zaprogramujesz przejście toczenia z bezpiecznymi ruchami szybkimi: wejście na średnicę przed czołem i powrót dopiero po wyjściu z materiału.",

  theory: [
    { t: "h", x: "G00 na tokarce", id: "g00" },
    { t: "p", x: "[[G00]] przesuwa nóż z maksymalną prędkością osi, bez posuwu F. Na tokarce ruch szybki wraca między przejściami tyle razy, że decyduje o dużej części czasu cyklu. Każdy ruch szybki przy detalu trzeba więc sprawdzić pod kątem kolizji." },
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
    { t: "p", x: "Prześwit liczy się od tego, co naprawdę stoi na drodze: od surowego pręta i od szczęk uchwytu, a nie od gotowego konturu. Surowy pręt ma odchyłki średnicy i bicie, więc w kursie powrót nad surówką idzie 1 mm na stronę nad nią — dla pręta Ø40 w X42. Koniec toczenia w Z porównuje się z wysięgiem pręta ze szczęk." },
    { t: "note", kind: "warn", x: "Konik, szczęki uchwytu i długie wiertło w głowicy to typowe przeszkody na drodze ruchu szybkiego. Przy pierwszym uruchomieniu programu ustaw korektor ruchu szybkiego na 25% i pracuj blok po bloku." },
  ],

  worked: {
    title: "Pierwsze przejście zgrubne wałka",
    intro: "Sytuacja: po planowaniu nóż stoi w X−1,6 Z2. Pręt Ø40 wystaje 70 mm ze szczęk. Pierwsze przejście ma zdjąć pręt na Ø36,4 do Z−54,8 (0,2 mm naddatku w Z przed stopniem Ø36). Gdzie można jechać ruchem szybkim i ile zostaje miejsca? Numery na rysunku to numery kroków.",
    fig: "t31-clear",
    steps: [
      { x: "Ruch szybki w X na średnicę przejścia — przed czołem, w powietrzu.", code: "G00 X36.4" },
      { x: "Toczenie wzdłużne z posuwem zgrubnym. Koniec w Z−54,8: do szczęk w Z−70 zostaje 15,2 mm.", code: "G01 Z-54.8 F0.3" },
      { x: "Wyjście w X na posuwie, 1 mm na stronę nad surowym prętem Ø40.", code: "X42." },
      { x: "Powrót ruchem szybkim nad czoło — nóż jest już ponad surówką.", code: "G00 Z2." },
    ],
    result: "Cztery bloki, dwa kody G. Oba prześwity — nad surówką i do szczęk — wynikają z półfabrykatu i zamocowania, a nie z rysunku detalu. W T3.2 dojdą kolejne przejścia według tego samego wzoru.",
  },

  practice: [
    {
      kind: "task",
      mode: "lathe",
      intro: "Dopisz pierwsze przejście zgrubne. Sprawdzany jest tor i położenie końcowe noża.",
      starter,
      checks: [
        { t: "cut", reference: `${T3_HEAD}\n${pass}`, tolerance: 0.05 },
        { t: "end", x: 42, z: 2, label: "Nóż kończy nad czołem, ponad prętem (X42 Z2)" },
      ],
      hints: ["G00 X36.4, potem G01 Z-54.8 F0.3.", "Wyjście X42. i powrót G00 Z2."],
      solution: starter.replace("(DOPISZ PIERWSZE PRZEJSCIE ZGRUBNE NA FI36.4 DO Z-54.8,\n WYJSCIE NA FI42 I POWROT NAD CZOLO)\n", `${pass}\n`),
    },
    {
      kind: "drill",
      intro: "Ruch szybki przy przejściach.",
      questions: [
        { kind: "order", q: "Ułóż ruchy jednego przejścia.", items: ["G00 Z2.", "G01 Z-30. F0.3", "G00 X34.", "X41."], answer: [2, 1, 3, 0], why: "Wejście, toczenie, wyjście, powrót." },
        { kind: "gap", q: "Następny pręt zamocowano z wysięgiem 60 mm zamiast 70 mm, Z0 zmierzono ponownie na czole, program bez zmian. Ile zostanie między końcem przejścia `Z-54.8` a szczękami?", template: "{0} mm", answers: [["5,2", "5.2"]], why: "Szczęki zaczynają się teraz w Z−60, a toczenie kończy się w Z−54,8: zostaje 5,2 mm zamiast 15,2 mm. Program się nie zmienił, a prześwit spadł o 10 mm — dlatego wysięg sprawdza się przy każdym zamocowaniu." },
        { kind: "choice", q: "Po `G01 Z-30.` nóż stoi przy stopniu. Który blok jest błędem?", options: ["`G00 Z2.`", "`G01 X41.`", "`X41.`", "`G00 X41.`"], answer: 0, why: "Powrót w Z bez wyjścia w X przeciąga ostrze po powierzchni." },
      ],
    },
  ],

  pitfalls: [
    { title: "Powrót bez wyjścia w X", x: "`G00 Z2.` zaraz po toczeniu. Nóż jedzie ruchem szybkim wzdłuż świeżo toczonej średnicy — rysa na powierzchni, a przy stopniu uderzenie." },
    { title: "Wejście ruchem szybkim w materiał", x: "`G00 X36.4` z nożem ustawionym za czołem (Z ujemne). Ruch szybki promieniowy wprost w pręt." },
    { title: "Wyjście ruchem szybkim", x: "`G00 X42.` zamiast `G01`. Przy stopniu nóż jeszcze styka się z czołem stopnia — ruch szybki wyrywa ostrze albo zostawia ślad." },
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
    { kind: "token", q: "Wskaż blok, który **wraca nad czoło**.", block: "G00 X36.4 | G01 Z-54.8 F0.3 | X42. | G00 Z2.", answer: 3, why: "G00 Z2. — po wyjściu w X." },
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
