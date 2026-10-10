import type { LessonDoc } from "@/lib/lesson";

const head = `O2010 (TRZY ROWKI)
G18 G21 G40 G80 G99
G54
T0303 (NOZ DO ROWKOW 3MM, POMIAR NA LEWYM NAROZU)
G50 S3000
G96 S120 M03
M08
G00 X34. Z-10.`;

const tail = `G00 X44.
M09
M05
G28 U0.
G28 W0.
M30`;

const sub = `O3000 (ROWEK I PRZESUNIECIE)
G01 X26. F0.05
G00 X34.
W-10.
M99`;

const starter = `${head}
(DOPISZ WYWOLANIE PODPROGRAMU O3000 TRZY RAZY)

${tail}
(DOPISZ PODPROGRAM O3000: WCIECIE DO FI26 Z F0.05, WYJSCIE NA FI34, PRZESUNIECIE W-10, M99)
`;

export const t8_1: LessonDoc = {
  id: "T8.1",
  slug: "t8-1-podprogramy-tokarka",
  title: "Podprogramy na tokarce",
  minutes: 13,
  goal: "Wyniesiesz powtarzalną operację tokarską do podprogramu i przesuniesz ją adresem W bez przełączania trybów.",

  theory: [
    { t: "h", x: "Te same zasady, inne zastosowania", id: "zasady" },
    { t: "p", x: "[[Podprogram]] to fragment programu zapisany raz i wywoływany wiele razy. Na Fanucu podprogram ma własny numer O…, `M98 P… L…` wywołuje go L razy, a `M99` na jego końcu wraca do bloku po wywołaniu. W symulatorze GCat podprogram zapisuje się pod M30 programu głównego. Na tokarce typowe zastosowania to:" },
    { t: "ul", items: [
      "**powtarzalne elementy wzdłuż osi** — kilka jednakowych rowków, podcięć, fazek w odstępach,",
      "**ten sam kontur na kilku detalach** — przy obróbce z pręta, gdy z jednego wysięgu powstaje kilka sztuk,",
      "**praca z podajnikiem pręta** — program główny bywa zakończony `M99` zamiast `M30`, żeby maszyna zaczynała kolejną sztukę bez zatrzymania; pętlę przerywa licznik sztuk albo koniec pręta. Czy i jak to się robi, zależy od organizacji automatycznej pracy i ustawień maszyny — podajnik, licznik i sposób zatrzymania opisuje dokumentacja producenta.",
    ] },

    { t: "h", x: "Przesunięcie adresem W", id: "w" },
    { t: "p", x: "Na frezarce powtarzany podprogram potrzebował `G91` i powrotu do `G90` przed M99. Na tokarce Fanuc w systemie A wystarczy adres **W**: przyrost w Z w jednym bloku, bez zmiany trybu. Podprogram nie zostawia więc po sobie przyrostowego trybu." },
    { t: "diagram", id: "t81-grooves" },
    { t: "code", x: "M98 P3000 L3          (TRZY ROWKI)\n…\nM30\nO3000 (ROWEK I PRZESUNIECIE)\nG01 X26. F0.05        (WCIECIE)\nG00 X34.              (WYJSCIE)\nW-10.                 (NASTEPNY ROWEK)\nM99" },
    { t: "note", kind: "warn", x: "Ostatni przebieg też wykona `W-10.` — po trzecim rowku nóż stoi w Z−40. Program główny musi to uwzględnić przy odjeździe albo dojeździe do kolejnej operacji." },

    { t: "h", x: "Sinumerik", id: "sinumerik" },
    { t: "p", x: "Na Sinumeriku ten sam podprogram leży w pliku .SPF i jest wywoływany nazwą z liczbą przebiegów: `ROWEK P3`. Przesunięcie w Z zapisuje się przyrostowo: `Z=IC(-10)`, a koniec podprogramu — `RET` albo `M17`." },
    { t: "note", kind: "tip", x: "To ostatnia lekcja ścieżki toczenia. Program wałka poniżej jest kompletny: planowanie, cykl G71 i G70 z korekcją ostrza, podcięcie, gwint M20×1,5 i otwór osiowy. Rozwiń go i uruchom w symulatorze." },
  ],

  worked: {
    title: "Trzy rowki na wałku Ø30",
    intro: "Sytuacja: wałek Ø30 dostaje trzy jednakowe rowki 3 mm do Ø26, z lewą krawędzią w Z−10, Z−20 i Z−30. Nóż 3 mm zmierzony na lewym narożu. Zamiast trzech kopii tych samych bloków — jeden podprogram wywołany trzy razy. Numery na rysunku to numery kroków.",
    fig: "t81-count",
    steps: [
      { x: "Start nad pierwszym rowkiem, ponad średnicą wałka.", code: "G00 X34. Z-10." },
      { x: "Podprogram: wcięcie, wyjście, przesunięcie o 10 mm w stronę uchwytu.", code: "G01 X26. → G00 X34. → W-10." },
      { x: "Koniec podprogramu.", code: "M99" },
      { x: "Wywołanie trzy razy.", code: "M98 P3000 L3" },
    ],
    result: "Po trzecim przebiegu nóż stoi w Z−40, bo ostatnie `W-10.` też się wykonuje. Czwarty i piąty rowek to tylko `L5` zamiast `L3` — o ile wałek jest wystarczająco długi.",
  },

  practice: [
    {
      kind: "task",
      mode: "lathe",
      intro: "Dopisz wywołanie i podprogram O3000 pod M30. Sprawdzany jest tor noża — trzy rowki.",
      starter,
      checks: [
        { t: "cut", reference: `${head}\nG01 X26. F0.05\nG00 X34.\nW-10.\nG01 X26.\nG00 X34.\nW-10.\nG01 X26.\nG00 X34.\nW-10.\n${tail}`, tolerance: 0.05 },
        { t: "require", codes: ["M98", "M99"] },
      ],
      hints: ["Wywołanie: M98 P3000 L3.", "Podprogram: O3000, G01 X26. F0.05, G00 X34., W-10., M99."],
      solution: starter
        .replace("(DOPISZ WYWOLANIE PODPROGRAMU O3000 TRZY RAZY)\n", "M98 P3000 L3\n")
        .replace("(DOPISZ PODPROGRAM O3000: WCIECIE DO FI26 Z F0.05, WYJSCIE NA FI34, PRZESUNIECIE W-10, M99)\n", `${sub}\n`),
    },
    {
      kind: "drill",
      intro: "Podprogramy na tokarce.",
      questions: [
        { kind: "gap", q: "W przykładzie w podprogramie przeniesiono `W-10.` na początek, przed `G01 X26.`. Start dalej w Z−10, `L3`. Gdzie powstaną rowki (lewa krawędź)?", template: "Z{0}, Z{1}, Z{2}", answers: [["-20"], ["-30"], ["-40"]], why: "Każdy przebieg najpierw przesuwa nóż o 10 mm, a dopiero potem wcina. Rowki wypadają o jedną podziałkę dalej: Z−20, Z−30, Z−40 — rowka w Z−10 nie ma." },
        { kind: "gap", q: "Start Z−5, podprogram kończy się `W-8.`, wywołanie `L4`. Gdzie stoi nóż po ostatnim przebiegu?", template: "Z{0}", answers: [["-37"]], why: "−5 − 4 · 8 = −37." },
        { kind: "choice", q: "Czy podprogram z `W-10.` musi przywracać G90 przed M99?", options: ["nie — W jest przyrostem tylko w swoim bloku", "tak, zawsze", "tylko na Sinumeriku", "tylko przy L > 1"], answer: 0, why: "W systemie A tryb się nie zmienia." },
        { kind: "choice", q: "Po co program z podajnikiem pręta kończy się czasem M99?", options: ["żeby zaczynać kolejną sztukę bez zatrzymania", "żeby wyłączyć wrzeciono", "bo M30 nie działa na tokarce", "bez powodu"], answer: 0, why: "Pętlę przerywa licznik albo koniec pręta." },
      ],
    },
  ],

  pitfalls: [
    { title: "Zapomniane przesunięcie po ostatnim przebiegu", x: "Po trzecim rowku nóż stoi 10 mm dalej niż ostatni rowek. Następny blok `G00 Z-30.` myśli, że nóż jest nad trzecim rowkiem — tor odjazdu przechodzi inaczej niż zakładano." },
    { title: "Wyjście z rowka w Z", x: "Podprogram z `W-10.` zaraz po `G01 X26.`, bez wyjścia w X. Nóż jedzie w rowku w stronę uchwytu i łamie się o ściankę." },
    { title: "M99 w programie bez podajnika", x: "Program główny zakończony M99 na maszynie bez podajnika i bez licznika. Maszyna startuje kolejny cykl na tym samym, gotowym już detalu." },
  ],

  controllers: {
    rows: [
      ["Wywołanie", "`M98 P3000 L3`", "`ROWEK P3`"],
      ["Przesunięcie w podprogramie", "`W-10.`", "`Z=IC(-10)`"],
      ["Koniec podprogramu", "`M99`", "`RET` / `M17`"],
      ["Pętla programu głównego", "`M99` w programie głównym", "skok do etykiety albo ustawienie maszyny"],
    ],
    note: "Zasada jest wspólna z frezarką. Na tokarce Fanuc wygodniej, bo przyrosty U i W nie zmieniają trybu.",
  },

  quiz: [
    { kind: "choice", review: "T7.2", q: "Po G32 nóż jest w zwoju. Co dalej?", options: ["G00 w X, potem w Z", "G00 w Z", "G32 z powrotem", "M30"], answer: 0, why: "Najpierw wyjście ze zwoju." },
    { kind: "choice", q: "Co robi `M98 P3000 L3`?", options: ["wywołuje podprogram O3000 trzy razy", "wywołuje O3 trzy tysiące razy", "kończy program", "przesuwa nóż o 3000"], answer: 0, why: "P — numer, L — powtórzenia." },
    { kind: "choice", q: "Jak w podprogramie tokarskim Fanuc przesunąć nóż o 10 mm w stronę uchwytu bez zmiany trybu?", options: ["`W-10.`", "`G91 Z-10.`", "`Z-10.`", "`U-10.`"], answer: 0, why: "W to przyrost w Z." },
    { kind: "gap", q: "Start w Z−12, podprogram kończy się `W-6.`, wywołanie `L5`. W jakim Z stanie nóż?", template: "Z{0}", answers: [["-42"]], why: "−12 − 5 · 6 = −42." },
    { kind: "choice", q: "Jak w natywnym języku Siemensa (SINUMERIK) wywołasz podprogram trzy razy, tak jak `M98 P3000 L3`?", options: ["nazwa podprogramu z P3", "M98 P3000", "G65 P3", "CYCLE95"], answer: 0, why: "Wywołanie nazwą, P — liczba przebiegów." },
  ],

  summary: [
    "M98 P… L… i M99 działają na tokarce jak na frezarce.",
    "Przesunięcie w podprogramie adresem W — bez G91 i bez powrotu do G90.",
    "Ostatni przebieg też wykonuje przesunięcie — pamiętaj o tym przy odjeździe.",
    "M99 w programie głównym to pętla, np. przy pracy z podajnikiem pręta.",
  ],

  sources: [
    { id: "fanuc", where: "podprogramy na tokarce, przyrosty U i W" },
    { id: "sinumerik", where: "podprogramy, P, IC, RET" },
  ],
};
