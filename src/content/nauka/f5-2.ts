import type { LessonDoc } from "@/lib/lesson";

const starter = `O1004 (OTWORY POD M6)
G21 G90 G94 G17
G40 G49 G80
G54
T3 M06 (WIERTLO FI5 VHM 140ST)
G43 H3 Z50.
S3800 M03
M08
(DOPISZ: G83 DLA CZTERECH OTWOROW,
 Z-18. R2. Q4. F380, NA KONIEC G80)

M09
M05
M30`;

const cycle = `G83 X10. Y10. Z-18. R2. Q4. F380
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
    { t: "table", head: ["Cykl", "Po każdym Q", "Kiedy"], rows: [
      ["[[G83]]", "wycofanie do R i szybki powrót tuż nad poprzednie dno", "głębokie otwory, wiór trzeba wyprowadzić z otworu"],
      ["[[G73]]", "cofnięcie o ułamek milimetra", "łamanie długiego wióra w otworach średniej głębokości"],
      ["`G81`", "brak", "otwory płytkie, wiertła VHM z chłodzeniem przez wrzeciono"],
    ] },
    { t: "p", x: "Zagłębienia liczy się od płaszczyzny **R**, nie od Z0: z R2 do Z−18 jest 20 mm, więc Q4 daje pięć wejść z dnami w Z−2, −6, −10, −14 i −18. Pierwsze zaczyna się 2 mm nad materiałem, więc w materiale zbiera tylko 2 mm. Jeśli droga nie dzieli się przez Q, ostatnie zagłębienie jest krótsze. Ten model stosuje symulator GCat i opis G83 w dokumentacji Haas; odstęp ponownego najazdu nad poprzednie dno ustawia parametr sterowania." },
    { t: "diagram", id: "f52-peck" },
    { t: "p", x: "Q podaje się jako dodatnią długość jednego zagłębienia. Obowiązuje ta sama zasada kropki co przy wymiarach: `Q4.` to 4 mm, a na Fanucu bez kropki `Q4000` może oznaczać 4 mm w mikrometrach — zależnie od parametru (lekcja F1.1)." },
    { t: "note", kind: "info", x: "Wiertła VHM z kanałami chłodzącymi często wierci się bez wycofania, nawet na 5–8 średnic — ciśnienie chłodziwa wypłukuje wiór. Każde ponowne wejście to dla węglika uderzenie w dno. Wycofanie ma sens przy wiertłach HSS i bez chłodzenia przez wrzeciono." },

    { t: "h", x: "Z to czubek wiertła", id: "czubek" },
    { t: "p", x: "Z w cyklu opisuje położenie czubka. Pełna średnica kończy się wyżej — o długość stożka. Przy otworze pod gwint liczy się głębokość pełnej średnicy, a ta zależy od gwintownika (lekcja F5.3)." },
    { t: "diagram", id: "f52-tip" },
    { t: "p", x: "Skąd długość stożka? Przekrój czubka to dwa trójkąty prostokątne. Przyprostokątna pozioma to promień wiertła D/2, kąt przy wierzchołku to połowa kąta wiertła. Wysokość trójkąta — czyli długość stożka — to D/2 podzielone przez tangens tej połowy." },
    { t: "code", x: "długość stożka = (D / 2) / tan(kąt / 2)\n\n118°: tan 59° ≈ 1,66  →  (D/2) / 1,66 ≈ 0,30 · D\n140°: tan 70° ≈ 2,75  →  (D/2) / 2,75 ≈ 0,18 · D\n\nØ5, 140°:  2,5 / 2,75 ≈ 0,9 mm" },
    { t: "p", x: "Współczynniki 0,30 i 0,18 to tylko skróty tego samego wzoru dla dwóch najczęstszych kątów. Przy innym kącie wiertła licz z wzoru." },
  ],

  worked: {
    title: "Otwór pod gwint M6 — 12 mm pełnego gwintu",
    intro: "Gwint M6×1 w otworze nieprzelotowym: 12 mm pełnego zarysu od powierzchni. Gwintownik ma nakrój formy C — w tym przykładzie przyjmujemy 3 zwoje, czyli 3 mm (dla innego gwintownika sprawdź katalog). Wiertło VHM Ø5, kąt 140°, płytka grubości 20 mm.",
    steps: [
      { x: "Koniec gwintownika musi zejść o nakrój poniżej pełnego gwintu: 12 + 3 = 15 mm.", code: "15 mm" },
      { x: "Pod końcem gwintownika zostawiamy zapas na wióry i bicie osiowe — w tym przykładzie 2 mm. Tyle dalej musi sięgać pełna średnica otworu.", code: "17 mm" },
      { x: "Stożek wiertła 140°: (D/2) / tan 70° = 2,5 / 2,75 ≈ 0,9 mm. Czubek: 17 + 0,9 = 17,9 — zaokrąglasz do Z−18. Pełna średnica sięga wtedy Z−17,1.", code: "Z-18." },
      { x: "18 / 5 = 3,6 średnicy — głęboko jak na wiertło bez chłodzenia przez wrzeciono, więc G83.", code: "G83" },
      { x: "Od R2 do Z−18 jest 20 mm: pięć zagłębień po 4 mm, dna w Z−2, −6, −10, −14, −18.", code: "Q4." },
    ],
    result: "`G83 X10. Y10. Z-18. R2. Q4. F380`. Pod czubkiem zostają 2 mm materiału płytki. Posuw 380 mm/min przy S3800 to 0,1 mm/obr — wartość przyjęta w tym przykładzie; zakres dla konkretnego wiertła podaje producent.",
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
      hints: ["G83 X10. Y10. Z-18. R2. Q4. F380", "Potem X70., Y40., X10. i G80."],
      solution: starter.replace("(DOPISZ: G83 DLA CZTERECH OTWOROW,\n Z-18. R2. Q4. F380, NA KONIEC G80)\n", cycle),
    },
    {
      kind: "drill",
      intro: "Głębokość i dobór cyklu.",
      questions: [
        { kind: "gap", q: "Wiertło 118°, Ø8. Jak długi jest stożek na końcu wiertła (mm, do 0,1)?", template: "{0} mm", answers: [["2.4", "2,4"]], why: "Stożek = (D/2) / tan(118°/2) = 4 / tan 59° = 4 / 1,66 ≈ 2,4 mm. Skrót: 0,3 · D." },
        { kind: "gap", q: "Z−20, R2, Q5. Ile zagłębień wykona G83?", template: "{0}", answers: [["5"]], why: "Liczymy od R2: do Z−20 jest 22 mm. Cztery pełne zagłębienia po 5 mm (20 mm) i piąte, krótsze, na 2 mm." },
        { kind: "choice", q: "Stal długowiórowa, otwór 2,5 × D, wiór owija się wokół wiertła. Który cykl?", options: ["G73", "G83", "G82", "G84"], answer: 0, why: "G73 łamie wiór krótkim cofnięciem, bez straty czasu na wyjazd do R." },
      ],
    },
  ],

  pitfalls: [
    { title: "Q ze znakiem minus albo bez kropki", x: "`Q-4.` daje alarm, a `Q4` na Fanucu ustawionym na najmniejszy przyrost to 0,004 mm — tysiące wycofań na jeden otwór." },
    { title: "Z na czubku zamiast pełnej średnicy", x: "Z−12 dla gwintu na 12 mm. Pełna średnica kończy się w Z−11,1, a gwintownik z nakrojem 3 mm musi zejść do Z−15. Gwintownik może dojść do dna i się złamać — bilans głębokości sprawdź przed wierceniem." },
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
    { kind: "gap", q: "Wiertło 140°, Ø10. Jak długi jest stożek na końcu wiertła (mm, do 0,1)?", template: "{0} mm", answers: [["1.8", "1,8"]], why: "Stożek = (D/2) / tan(140°/2) = 5 / tan 70° = 5 / 2,75 ≈ 1,8 mm. Skrót: 0,18 · D." },
    { kind: "gap", q: "Wiertło 118°, Ø6. Pełna średnica ma sięgać 20 mm w głąb. Na jakie Z zaprogramujesz czubek (do 0,1)?", template: "Z{0}", answers: [["-21.8", "-21,8"]], why: "Stożek = 3 / tan 59° = 3 / 1,66 ≈ 1,8 mm. Czubek leży o stożek niżej niż koniec pełnej średnicy: 20 + 1,8 = 21,8, więc Z−21,8." },
    { kind: "token", q: "Wskaż słowo, które podaje **długość jednego zagłębienia**.", block: "G83 X10. Y10. Z-18. R2. Q4. F380", answer: 5, why: "Q4. — 4 mm na jedno wejście." },
  ],

  summary: [
    "Głęboko (> ok. 3 × D) — G83 z wyprowadzeniem wióra. Długi wiór — G73.",
    "Q to dodatnia długość jednego zagłębienia, z kropką. Zagłębienia liczy się od R.",
    "Z to czubek. Pełna średnica kończy się wyżej o 0,3 · D (118°) albo 0,18 · D (140°).",
    "Otwór pod gwint: pełny gwint + nakrój gwintownika + zapas; czubek wiertła jeszcze o stożek niżej.",
  ],

  sources: [
    { id: "fanuc", where: "cykle G73 i G83, adres Q" },
    { id: "haas", where: "G83 — Q jako przyrost liczony od R" },
    { id: "sinumerik", where: "CYCLE83" },
    { id: "sandvik", where: "wiercenie głębokie, usuwanie wióra, geometria wierteł" },
    { id: "jemielniak", where: "wiercenie, geometria wiertła krętego" },
  ],
};
