import type { LessonDoc } from "@/lib/lesson";

const head = `O2002 (PRZYROSTOWO)
G18 G21 G40 G80 G99
G54
G97 S1000 M03
G00 X44. Z2.`;

const starter = `${head}
(DOPISZ PRZEJSCIE TYLKO ADRESAMI U I W:
 NA FI36, WZDLUZ DO Z-55, WYJSCIE NA FI40,
 POWROT RUCHEM SZYBKIM NAD CZOLO)

M05
M30`;

const pass = `G01 U-8. F0.2
W-57.
U4.
G00 W57.`;

export const t1_2: LessonDoc = {
  id: "T1.2",
  slug: "t1-2-g90-g91-u-w",
  title: "G90, G91 oraz U i W",
  minutes: 14,
  goal: "Zapiszesz ruch tokarski absolutnie i przyrostowo i nie pomylisz G90 z tokarki Fanuc z G90 z frezarki.",

  theory: [
    { t: "h", x: "X, Z albo U, W", id: "uw" },
    { t: "p", x: "Na tokarkach Fanuc w podstawowym systemie kodów (system A) nie przełącza się trybu kodem G. Adres sam mówi, jak czytać liczbę: **X** i **Z** to cel absolutny, od zera W, a **U** i **W** to przyrost od bieżącego punktu. W jednym bloku można je mieszać." },
    { t: "diagram", id: "t12-uw" },
    { t: "code", x: "G01 X36. F0.2    (DO SREDNICY 36)\nG01 U-8. F0.2    (8 MM MNIEJSZA SREDNICA NIZ TERAZ)\nG01 X30. W-20.   (DO FI30 I 20 MM W STRONE UCHWYTU)", caption: "U jest w średnicy, tak jak X. U−8 przesuwa nóż 4 mm w stronę osi." },

    { t: "h", x: "Uwaga na G90 na tokarce", id: "g90" },
    { t: "p", x: "W systemie A kody [[G90]], G92 i G94 nie oznaczają trybów, tylko **cykle**: G90 to cykl toczenia wzdłużnego, G92 — cykl gwintowania, G94 — cykl planowania. Blok `G90 X30. Z-20. F0.2` na frezarce ustawia wymiary absolutne i jedzie po prostej, a na tokarce Fanuc wykonuje cały cykl: dojazd, toczenie, wyjście i powrót." },
    { t: "table", head: ["Sterowanie", "Absolutnie", "Przyrostowo", "G90 znaczy"], rows: [
      ["Fanuc, system A (typowy)", "`X Z`", "`U W`", "cykl toczenia"],
      ["Fanuc, system B i C", "`G90` + `X Z`", "`G91` + `X Z`", "wymiary absolutne"],
      ["Sinumerik", "`G90` + `X Z`", "`G91` albo `X=IC(…)`", "wymiary absolutne"],
    ], caption: "System kodów ustawia parametr sterowania. Program pisany pod system A nie zadziała poprawnie w systemie B i odwrotnie." },

    { t: "h", x: "Kiedy przyrostowo", id: "kiedy" },
    { t: "ul", items: [
      "kolejne przejścia o tę samą głębokość — `U-4.` w każdym przejściu zgrubnym,",
      "odjazd o znaną wartość bez liczenia celu — `W2.` odsuwa nóż 2 mm od ścianki,",
      "`G28 U0.` i `G28 W0.` — odjazd do punktu referencyjnego bez ruchu pośredniego, na końcu programu wałka.",
    ] },
    { t: "note", kind: "tip", x: "Kontur wykańczający pisz absolutnie: każdy wymiar da się wtedy sprawdzić z rysunkiem, a błąd w jednym bloku nie przesuwa reszty konturu." },
  ],

  worked: {
    title: "Przejście na Ø36 przyrostowo",
    intro: "Sytuacja: nóż stoi w X44 Z2. Ma przetoczyć Ø36 do Z−55, wyjść na Ø40 i wrócić nad czoło — zapisane samymi przyrostami U i W. Numery na rysunku to numery kroków.",
    fig: "t12-run",
    steps: [
      { x: "Z Ø44 na Ø36: przyrost średnicy 36 − 44.", code: "G01 U-8. F0.2" },
      { x: "Z Z2 do Z−55: przyrost −55 − 2.", code: "W-57." },
      { x: "Wyjście z Ø36 na Ø40: przyrost 40 − 36.", code: "U4." },
      { x: "Powrót ruchem szybkim nad czoło: z Z−55 do Z2.", code: "G00 W57." },
    ],
    result: "Absolutnie ten sam tor to `G01 X36. F0.2` → `Z-55.` → `X40.` → `G00 Z2.`. Kontrola: suma przyrostów W (−57 + 57 = 0) wraca do punktu startu w Z.",
  },

  practice: [
    {
      kind: "task",
      mode: "lathe",
      intro: "Dopisz przejście, używając tylko U i W. Sprawdzany jest tor — ma być taki sam jak zapisany absolutnie.",
      starter,
      checks: [
        { t: "cut", reference: `${head}\nG01 X36. F0.2\nZ-55.\nX40.\nG00 Z2.`, tolerance: 0.05 },
        { t: "require", codes: ["U", "W"] },
      ],
      hints: ["Z Ø44 na Ø36 to U-8.", "Potem W-57., U4. i G00 W57."],
      solution: starter.replace("(DOPISZ PRZEJSCIE TYLKO ADRESAMI U I W:\n NA FI36, WZDLUZ DO Z-55, WYJSCIE NA FI40,\n POWROT RUCHEM SZYBKIM NAD CZOLO)\n", pass),
    },
    {
      kind: "drill",
      intro: "Przeliczanie U i W.",
      questions: [
    {"kind":"choice","q":"Gdzie stanie nóż po tych blokach (X w średnicy)?","code":"G00 X44. Z2.\nG01 U-8. F0.2\nW-20.\nU6.","options":["X42 Z−18","X36 Z−18","X42 Z−20","X38 Z−22"],"answer":0,"why":"U i W to przyrosty: X44 − 8 = X36, Z2 − 20 = Z−18, X36 + 6 = X42."},

        { kind: "gap", q: "W przykładzie w kroku 1 wpisano `U-4.` zamiast `U-8.`, reszta bez zmian. Na jakiej średnicy pojedzie nóż w kroku 2 i na jakiej skończy w kroku 3?", template: "krok 2: X{0}, krok 3: X{1}", answers: [["40"], ["44"]], why: "44 − 4 = 40: nóż jedzie po powierzchni pręta Ø40 i nic nie zbiera. U4. liczy się od tego błędnego punktu, więc wyjście kończy się w X44. Każdy przyrost po błędzie przenosi go dalej — dlatego kontur pisze się absolutnie." },
        { kind: "gap", q: "Nóż w X40. Cel Ø32. Zapisz przyrostowo.", template: "U{0}", answers: [["-8", "-8."]], why: "32 − 40 = −8." },
        { kind: "gap", q: "Nóż w X30 Z-20. Blok `U6. W-15.`. Gdzie stanie?", template: "X{0} Z{1}", answers: [["36"], ["-35"]], why: "30 + 6 = 36, −20 − 15 = −35." },
        { kind: "choice", q: "Tokarka Fanuc, system A. Co zrobi blok `G90 X30. Z-20. F0.2`?", options: ["wykona cykl toczenia wzdłużnego", "ustawi wymiary absolutne i pojedzie po prostej", "alarm", "nic"], answer: 0, why: "W systemie A G90 to cykl." },
      ],
    },
  ],

  pitfalls: [
    { title: "G90 przeniesione z frezarki", danger: true, x: "Programista pisze na początku programu tokarskiego `G90` „dla pewności”. W systemie A sterowanie odczyta to jako cykl toczenia z bieżącymi wartościami albo zgłosi alarm." },
    { title: "U w promieniu", x: "`U-4.` z myślą o zejściu 4 mm na stronę. U jest w średnicy — nóż zejdzie 2 mm. Na 4 mm na stronę potrzeba `U-8.`." },
    { title: "Program z innego systemu kodów", danger: true, x: "Program z tokarki w systemie B (z G90/G91) uruchomiony na maszynie w systemie A. Bloki z G90 staną się cyklami, a współrzędne po G91 — absolutnymi." },
  ],

  controllers: {
    rows: [
      ["Przyrost w X", "`U` (średnica)", "`G91` albo `X=IC(…)`"],
      ["Przyrost w Z", "`W`", "`G91` albo `Z=IC(…)`"],
      ["Znaczenie G90", "system A: cykl toczenia", "wymiary absolutne"],
    ],
    note: "Sinumerik w trybie ISO może pracować z U i W jak Fanuc. W języku Siemensa przyrosty podaje się przez G91 albo IC.",
  },

  quiz: [
    { kind: "choice", review: "T1.1", q: "Które słowo działa tylko w swoim bloku?", options: ["G04", "G01", "F0.2", "G00"], answer: 0, why: "Postój jest jednorazowy." },
    { kind: "choice", q: "Co oznacza `W-10.` na tokarce Fanuc?", options: ["10 mm w stronę uchwytu od bieżącego punktu", "Z−10 od zera W", "średnicę 10", "postój 10 s"], answer: 0, why: "W to przyrost w Z." },
    { kind: "gap", q: "Nóż w X36. Blok `U-6.`. Na jakiej średnicy stanie?", template: "X{0}", answers: [["30"]], why: "36 − 6 = 30." },
    { kind: "choice", q: "O ile milimetrów w stronę osi przesuwa nóż blok `U-6.`?", options: ["3 mm", "6 mm", "12 mm", "zależy od Z"], answer: 0, why: "U jest w średnicy." },
    { kind: "choice", q: "Jak zapisać przyrost w X w natywnym języku Siemensa (SINUMERIK)?", options: ["`X=IC(-6)` albo G91", "`U-6`", "`G90 X-6`", "`W-6`"], answer: 0, why: "IC — przyrostowo dla jednej osi." },
    { kind: "token", q: "Wskaż słowo **absolutne**.", block: "G01 U-4. Z-30. F0.2", answer: 2, why: "Z-30. to cel od zera. U-4. to przyrost." },
  ],

  summary: [
    "Fanuc, system A: X i Z absolutnie, U i W przyrostowo — bez G90/G91.",
    "U jest w średnicy: U−8 to 4 mm w stronę osi.",
    "G90 na tokarce Fanuc (system A) to cykl toczenia, a nie wymiary absolutne.",
    "Kontur pisz absolutnie, przyrosty do powtarzalnych przejść i odjazdów.",
  ],

  sources: [
    { id: "fanuc", where: "systemy kodów G A, B i C, programowanie absolutne i przyrostowe na tokarce" },
    { id: "sinumerik", where: "G90, G91, IC i AC na tokarce" },
  ],
};
