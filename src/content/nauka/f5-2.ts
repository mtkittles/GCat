import type { LessonDoc } from "@/lib/lesson";

const starter = `O1004 (OTWORY POD M6)
G21 G90 G17
G40 G49 G80
G54
T3 M06 (WIERTLO FI5 VHM 140ST)
G43 H3 Z50.
S3800 M03
M08
(DOPISZ: G83 DLA CZTERECH OTWOROW,
 Z-16. R2. Q4. F380, NA KONIEC G80)

M09
M05
M30`;

const cycle = `G83 X10. Y10. Z-16. R2. Q4. F380
X70.
Y40.
X10.
G80`;

export const f5_2: LessonDoc = {
  id: "F5.2",
  slug: "f5-2-g83-g73",
  title: "G83 i G73 — wiercenie z wycofaniem",
  minutes: 15,
  goal: "Dobierzesz cykl do głębokości otworu, ustalisz Q i policzysz Z tak, żeby pełna średnica sięgała tam, gdzie trzeba.",

  theory: [
    { t: "h", x: "Wiór w głębokim otworze", id: "wior" },
    { t: "p", x: "Do głębokości około trzech średnic wiór wychodzi rowkami wiertła sam. Głębiej zaczyna się pakować: rośnie moment, temperatura i ryzyko złamania wiertła. Cykle z wycofaniem dzielą otwór na odcinki o długości **Q**." },
    { t: "diagram", id: "f52-peck" },
    { t: "table", head: ["Cykl", "Po każdym Q", "Kiedy"], rows: [
      ["[[G83]]", "wycofanie do R i szybki powrót tuż nad poprzednie dno", "głębokie otwory, wiór trzeba wyprowadzić z otworu"],
      ["[[G73]]", "cofnięcie o ułamek milimetra", "łamanie długiego wióra w otworach średniej głębokości"],
      ["`G81`", "brak", "otwory płytkie, wiertła VHM z chłodzeniem przez wrzeciono"],
    ] },
    { t: "p", x: "Q podaje się jako dodatnią długość jednego zagłębienia. Obowiązuje ta sama zasada kropki co przy wymiarach: `Q4.` to 4 mm, a na Fanucu bez kropki `Q4000` może oznaczać 4 mm w mikrometrach — zależnie od parametru (lekcja F1.1)." },
    { t: "note", kind: "info", x: "Wiertła VHM z kanałami chłodzącymi często wierci się bez wycofania, nawet na 5–8 średnic — ciśnienie chłodziwa wypłukuje wiór. Każde ponowne wejście to dla węglika uderzenie w dno. Wycofanie ma sens przy wiertłach HSS i bez chłodzenia przez wrzeciono." },

    { t: "h", x: "Z to czubek wiertła", id: "czubek" },
    { t: "p", x: "Z w cyklu opisuje położenie czubka. Pełna średnica kończy się wyżej — o długość stożka. Przy otworze pod gwint liczy się głębokość pełnej średnicy." },
    { t: "diagram", id: "f52-tip" },
    { t: "code", x: "długość stożka = (D / 2) / tan(kąt / 2)\n118°: 0,30 · D\n140°: 0,18 · D" },
  ],

  worked: {
    title: "Otwór pod gwint M6 na 12 mm",
    intro: "Gwint M6×1 na głębokość 12 mm, otwór nieprzelotowy. Wiertło VHM Ø5, kąt 140°. Gwintownik ma nakrój na około 3 zwoje.",
    steps: [
      { x: "Pełna średnica musi sięgać poza gwint o nakrój: 12 + 3 · 1 = 15 mm.", code: "15 mm" },
      { x: "Stożek wiertła: 0,18 · 5 = 0,9 mm. Czubek: 15 + 0,9 = 15,9 — zaokrąglasz.", code: "Z-16." },
      { x: "16 / 5 = 3,2 średnicy — głęboko jak na wiertło bez chłodzenia przez wrzeciono.", code: "G83" },
      { x: "Cztery zagłębienia po 4 mm.", code: "Q4." },
    ],
    result: "`G83 X10. Y10. Z-16. R2. Q4. F380`. Posuw 380 mm/min przy S3800 to 0,1 mm/obr — typowa wartość dla wiertła Ø5 w stali.",
  },

  practice: [
    {
      kind: "task",
      intro: "Dopisz wiercenie czterech otworów cyklem G83. Sprawdzany jest tor roboczy i użycie G83 oraz G80 — możesz spróbować innego Q.",
      starter,
      checks: [
        { t: "cut", reference: `G90\nG00 Z50.\n${cycle}`, tolerance: 0.05 },
        { t: "require", codes: ["G83", "G80"] },
      ],
      hints: ["G83 X10. Y10. Z-16. R2. Q4. F380", "Potem X70., Y40., X10. i G80."],
      solution: starter.replace("(DOPISZ: G83 DLA CZTERECH OTWOROW,\n Z-16. R2. Q4. F380, NA KONIEC G80)\n", cycle),
    },
    {
      kind: "drill",
      intro: "Głębokość i dobór cyklu.",
      questions: [
        { kind: "gap", q: "Wiertło 118°, Ø8. Długość stożka (mm, z dokładnością do 0,1):", template: "{0} mm", answers: [["2.4", "2,4"]], why: "0,3 · 8 = 2,4." },
        { kind: "gap", q: "Z−20, R2, Q5. Ile zagłębień wykona G83?", template: "{0}", answers: [["4"]], why: "20 / 5 = 4." },
        { kind: "choice", q: "Stal długowiórowa, otwór 2,5 × D, wiór owija się wokół wiertła. Który cykl?", options: ["G73", "G83", "G82", "G84"], answer: 0, why: "G73 łamie wiór krótkim cofnięciem, bez straty czasu na wyjazd do R." },
      ],
    },
  ],

  pitfalls: [
    { title: "Q ze znakiem minus albo bez kropki", x: "`Q-4.` daje alarm, a `Q4` na Fanucu ustawionym na najmniejszy przyrost to 0,004 mm — tysiące wycofań na jeden otwór." },
    { title: "Z na czubku zamiast pełnej średnicy", x: "Z−12 dla gwintu na 12 mm. Pełna średnica kończy się w Z−11, a nakrój gwintownika potrzebuje jeszcze kilku milimetrów. Gwintownik dochodzi do dna i pęka." },
    { title: "Wycofanie przy wiertle VHM bez potrzeby", x: "Wiertło węglikowe z chłodzeniem przez wrzeciono wiercone G83 z małym Q. Każde wejście obija krawędzie na dnie — wiertło szybciej się wykrusza." },
  ],

  controllers: {
    rows: [
      ["Wiercenie z wycofaniem do R", "`G83 … Q`", "`CYCLE83(…, FDEP, …, DAM, …)` z usuwaniem wióra"],
      ["Łamanie wióra", "`G73 … Q`, cofnięcie z parametru", "`CYCLE83` z wyborem łamania wióra"],
      ["Głębokość zagłębienia", "Q — stała", "pierwsza głębokość, stopniowe zmniejszanie, minimum"],
    ],
    note: "CYCLE83 na Sinumeriku łączy oba warianty i pozwala zmniejszać kolejne zagłębienia. Na Fanucu Q jest stałe.",
  },

  quiz: [
    { kind: "choice", review: "F5.1", q: "Co robi `G80`?", options: ["kasuje cykl wiercenia", "włącza wiercenie", "ustawia R", "wraca do G54"], answer: 0, why: "Bez G80 kolejny ruch wierci otwór." },
    { kind: "choice", q: "Od jakiej głębokości zwykle warto wiercić z wycofaniem (wiertło bez chłodzenia przez wrzeciono)?", options: ["powyżej ok. 3 × D", "zawsze", "powyżej 10 × D", "nigdy"], answer: 0, why: "Głębiej wiór przestaje sam wychodzić." },
    { kind: "choice", q: "Co robi G83 po każdym zagłębieniu Q?", options: ["wyjeżdża do R", "cofa się o ułamek mm", "zatrzymuje wrzeciono", "zmienia narzędzie"], answer: 0, why: "Pełne wyprowadzenie wióra." },
    { kind: "gap", q: "Wiertło 140°, Ø10. Długość stożka (mm):", template: "{0} mm", answers: [["1.8", "1,8"]], why: "0,18 · 10 = 1,8." },
    { kind: "gap", q: "Pełna średnica Ø6 (118°) ma sięgać 20 mm. Z czubka (mm, do 0,1):", template: "Z{0}", answers: [["-21.8", "-21,8"]], why: "Stożek 0,3 · 6 = 1,8, czubek 20 + 1,8." },
    { kind: "token", q: "Tapnij słowo, które podaje **długość jednego zagłębienia**.", block: "G83 X10. Y10. Z-16. R2. Q4. F380", answer: 5, why: "Q4. — 4 mm na jedno wejście." },
  ],

  summary: [
    "Głęboko (> ok. 3 × D) — G83 z wyprowadzeniem wióra. Długi wiór — G73.",
    "Q to dodatnia długość jednego zagłębienia, z kropką.",
    "Z to czubek. Pełna średnica kończy się wyżej o 0,3 · D (118°) albo 0,18 · D (140°).",
    "Otwór pod gwint: gwint + nakrój + stożek wiertła.",
  ],

  sources: [
    { id: "fanuc", where: "cykle G73 i G83, adres Q" },
    { id: "sinumerik", where: "CYCLE83" },
    { id: "sandvik", where: "wiercenie głębokie, usuwanie wióra, geometria wierteł" },
    { id: "jemielniak", where: "wiercenie, geometria wiertła krętego" },
  ],
};
