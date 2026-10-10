import type { LessonDoc } from "@/lib/lesson";

const head = `O2009 (GWINT G32)
G18 G21 G40 G80 G99
G54
T0404 (NOZ DO GWINTOW 60ST)
G97 S1200 M03
M08
G00 X22. Z5.`;

const passes = [19.4, 18.9, 18.5, 18.25, 18.16];
const block = (x: number) => `G00 X${x}\nG32 Z-17. F1.5\nG00 X22.\nZ5.`;

const tail = `M09
M05
G28 U0.
G28 W0.
M30`;

const starter = `${head}
${block(19.4)}
${block(18.9)}
(DOPISZ TRZY OSTATNIE PRZEJSCIA: FI18.5, FI18.25 I FI18.16)

${tail}`;

export const t7_2: LessonDoc = {
  id: "T7.2",
  slug: "t7-2-g32-g33",
  title: "G32 i G33",
  minutes: 12,
  goal: "Zapiszesz przejścia gwintu ręcznie kodem G32 i zrozumiesz, co cykl G76 robi za programistę.",

  theory: [
    { t: "h", x: "Gwint blok po bloku", id: "g32" },
    { t: "p", x: "[[G32]] to ruch po prostej z posuwem równym skokowi F, zsynchronizowany z obrotem wrzeciona. Jeden blok G32 to jedno przejście gwintu. Wejście w X, powrót w X i Z programuje się osobno — tak jak przy ręcznych przejściach zgrubnych w T3." },
    { t: "diagram", id: "t72-g32" },
    { t: "code", x: "G00 X19.4        (WEJSCIE NA GLEBOKOSC PRZEJSCIA)\nG32 Z-17. F1.5   (PRZEJSCIE GWINTU)\nG00 X22.         (WYJSCIE Z ZWOJU)\nZ5.              (POWROT DO TEGO SAMEGO Z STARTU)" },

    { t: "h", x: "Kiedy G32 zamiast G76", id: "kiedy" },
    { t: "ul", items: [
      "gwinty nietypowe: stożkowe z przerwą, wielozwojne, z niestandardowym zarysem,",
      "gwint kończący się w miejscu, gdzie cykl nie da się dobrze ustawić,",
      "nauka i kontrola: każde przejście widać w programie.",
    ] },
    { t: "p", x: "Na co dzień wygodniejszy jest cykl: G76 sam liczy głębokości, dosuwa nóż wzdłuż boku zarysu i dba o przejście wykańczające. Program z G32 robi dokładnie to, co jest zapisane — przy wejściach prostopadłych obie krawędzie noża tną naraz, więc wejścia muszą być płytsze." },

    { t: "h", x: "G32 czy G33", id: "g33" },
    { t: "p", x: "Na tokarkach Fanuc w systemie A przejście gwintu to G32. W systemach B/C i na Sinumeriku ten sam ruch ma kod G33. Znaczenie jest takie samo: ruch z posuwem równym skokowi, zsynchronizowany z wrzecionem." },
    { t: "note", kind: "warn", x: "Każde przejście musi startować z tego samego Z i przy tych samych obrotach. Sterowanie czeka na znacznik położenia wrzeciona i dopiero wtedy rusza — zmiana Z startu przesuwa zwój." },
  ],

  worked: {
    title: "Pięć przejść M20×1,5",
    intro: "Rdzeń Ø18,16, start X22 Z5. Wejścia prostopadłe, coraz płytsze.",
    steps: [
      { x: "Pierwsze przejście: 0,3 mm na stronę.", code: "X19.4" },
      { x: "Kolejne: 0,25 i 0,2 mm na stronę.", code: "X18.9 → X18.5" },
      { x: "Przedostatnie: 0,125 mm.", code: "X18.25" },
      { x: "Wykańczające na rdzeń.", code: "X18.16" },
    ],
    result: "Pięć razy te same cztery bloki, zmienia się tylko X. Tyle właśnie oszczędza cykl — i dlatego w programie wałka zostaje G76.",
  },

  practice: [
    {
      kind: "task",
      mode: "lathe",
      intro: "Dwa pierwsze przejścia są zapisane. Dopisz trzy ostatnie w tym samym schemacie.",
      starter,
      checks: [
        { t: "cut", reference: `${head}\n${passes.map(block).join("\n")}\n${tail}`, tolerance: 0.05 },
        { t: "require", codes: ["G32"] },
      ],
      hints: ["Każde przejście: G00 X…, G32 Z-17. F1.5, G00 X22., Z5.", "Średnice: 18.5, 18.25, 18.16."],
      solution: starter.replace("(DOPISZ TRZY OSTATNIE PRZEJSCIA: FI18.5, FI18.25 I FI18.16)\n", `${[18.5, 18.25, 18.16].map(block).join("\n")}\n`),
    },
    {
      kind: "drill",
      intro: "G32 w praktyce.",
      questions: [
        { kind: "order", q: "Ułóż jedno przejście gwintu.", items: ["Z5.", "G32 Z-17. F1.5", "G00 X22.", "G00 X19.4"], answer: [3, 1, 2, 0], why: "Wejście, przejście, wyjście w X, powrót w Z." },
        { kind: "choice", q: "Czym na Sinumeriku zastąpisz G32?", options: ["G33", "G76", "G92", "CYCLE95"], answer: 0, why: "G33 — gwint po prostej." },
      ],
    },
  ],

  pitfalls: [
    { title: "Inny Z startu w kolejnym przejściu", x: "Pierwsze przejście z Z5, drugie z Z3. Zwój przesuwa się o część skoku — gwint ma dwa zarysy i nie pasuje do nakrętki." },
    { title: "Powrót w Z bez wyjścia w X", x: "Po G32 od razu `Z5.`. Nóż wraca po zwoju i niszczy go — zawsze najpierw wyjście w X." },
    { title: "Za głębokie wejścia prostopadłe", x: "Wejścia jak w G76 (0,3 i więcej) przy dosuwie prostopadłym. Obie krawędzie noża tną jednocześnie, wiór się klinuje, płytka pęka." },
  ],

  controllers: {
    rows: [
      ["Przejście gwintu", "`G32` (system A), `G33` (B/C)", "`G33`"],
      ["Skok", "`F`", "`K` (w osi Z) albo `I`"],
      ["Cykl", "`G76`, `G92`", "`CYCLE97` / `CYCLE99`"],
    ],
    note: "Na Sinumeriku skok gwintu w G33 podaje się adresem K dla gwintu w osi Z, a nie F.",
  },

  quiz: [
    { kind: "choice", review: "T7.1", q: "Co oznacza P w drugim bloku G76?", options: ["wysokość zwoju w µm", "skok", "liczbę przejść", "kąt"], answer: 0, why: "P920 — 0,92 mm." },
    { kind: "choice", q: "Co robi `G32 Z-17. F1.5`?", options: ["jedno przejście gwintu o skoku 1,5", "cały gwint", "rowek", "postój"], answer: 0, why: "Jeden blok — jedno przejście." },
    { kind: "choice", q: "Po G32 nóż jest w zwoju. Co dalej?", options: ["G00 w X, potem w Z", "G00 w Z", "G32 w Z z powrotem", "M30"], answer: 0, why: "Najpierw wyjście ze zwoju." },
    { kind: "choice", q: "Dlaczego każde przejście startuje z tego samego Z?", options: ["żeby nóż trafił w ten sam zwój", "bo tak jest szybciej", "bo wymaga tego G97", "bez powodu"], answer: 0, why: "Synchronizacja ze znacznikiem wrzeciona." },
    { kind: "choice", q: "Jak na Sinumeriku podaje się skok w G33 dla gwintu w osi Z?", options: ["K", "F", "P", "Q"], answer: 0, why: "K — skok w Z." },
  ],

  summary: [
    "G32 (Fanuc A) / G33 (B/C, Sinumerik) — jedno przejście gwintu.",
    "Przejście: G00 X w głąb, G32 Z, G00 X na zewnątrz, powrót w Z do tego samego startu.",
    "Wejścia prostopadłe muszą być płytsze niż w G76.",
    "Na co dzień — G76, ręcznie tylko gwinty nietypowe.",
  ],

  sources: [
    { id: "fanuc", where: "G32 na tokarce, systemy kodów" },
    { id: "sinumerik", where: "G33, skok K" },
    { id: "sandvik", where: "metody dosuwu przy toczeniu gwintów" },
  ],
};
