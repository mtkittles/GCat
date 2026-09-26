import type { LessonDoc } from "@/lib/lesson";

const rough = `G00 X23. Y25.
G00 Z5.
G01 Z0. F200
G01 X37. Z-1.
X23. Z-2.
X37. Z-3.
X23. Z-4.
X37. F400
Y29.
X23.
Y21.
X37.
Y25.`;

const finish = `G41 D1 G01 X24. Y21.
G03 X30. Y15. R6.
G01 X37.
G03 X43. Y21. R6.
G01 Y29.
G03 X37. Y35. R6.
G01 X23.
G03 X17. Y29. R6.
G01 Y21.
G03 X23. Y15. R6.
G01 X30.
G03 X36. Y21. R6.
G40 G01 X30. Y25.`;

const starter = `O1007 (KIESZEN 26X20)
G21 G90 G17
G40 G49 G80
G54
T1 M06 (FREZ FI10)
G43 H1 Z50.
S2500 M03
M08
${rough}
(DOPISZ WYKANCZANIE SCIAN: G41, NAJAZD PO LUKU R6 NA SRODEK DOLNEJ SCIANY,
 OBIEG PRZECIWNIE DO ZEGARA, ODJAZD PO LUKU, G40)

G00 Z5.
M09
M05
M30`;

export const f6_2: LessonDoc = {
  id: "F6.2",
  slug: "f6-2-kieszen-prostokatna",
  title: "Kieszeń prostokątna",
  minutes: 18,
  goal: "Zaprogramujesz kieszeń: wejście po rampie, obróbkę zgrubną z naddatkiem i wykończenie ścian z korekcją promienia.",

  theory: [
    { t: "h", x: "Co jest trudne w kieszeni", id: "trudnosci" },
    { t: "ul", items: [
      "**Wejście** — nie ma miejsca obok detalu, frez musi zejść w pełny materiał.",
      "**Naroża** — frez nie zrobi naroża ostrzejszego niż jego promień. Naroże kieszeni musi mieć promień większy niż promień freza.",
      "**Wiór** — zostaje w kieszeni i może być przecinany drugi raz. Chłodziwo albo nadmuch musi go wypłukać.",
    ] },

    { t: "h", x: "Wejście po rampie", id: "rampa" },
    { t: "p", x: "Zamiast wejścia pionowego frez schodzi ukośnie, skrawając obwodem. Kąt rampy podaje katalog narzędzia — dla frezów VHM zwykle kilka stopni. W kieszeni płytki frez zjeżdża o 1 mm na każde 14 mm drogi, wahadłowo po osi kieszeni." },
    { t: "diagram", id: "f62-ramp" },

    { t: "h", x: "Zgrubnie i na gotowo", id: "kolejnosc" },
    { t: "p", x: "Obróbka zgrubna usuwa materiał z wnętrza i zostawia na ścianach naddatek — tu 1 mm. Obróbka wykańczająca zbiera ten naddatek jednym przejściem z korekcją promienia, dzięki czemu ściany wychodzą w wymiarze i z dobrą powierzchnią." },
    { t: "diagram", id: "f62-pocket" },
    { t: "table", head: ["Etap", "Tor środka freza", "Uwagi"], rows: [
      ["rampa i oś", "X23…X37, Y25", "pierwsze przejście to pełny rowek: ae = 100% D, ap = 4 mm"],
      ["pętla zgrubna", "X23…X37, Y21…Y29", "ściana − promień 5 − naddatek 1"],
      ["wykończenie", "kontur z rysunku z G41 D1", "obieg przeciwnie do zegara = współbieżnie w kieszeni"],
    ] },
    { t: "note", kind: "info", x: "W kieszeni kierunki się odwracają: przy obróbce zewnętrznej współbieżnie jedzie się zgodnie z zegarem (F4.2), wewnątrz — przeciwnie. Frez zawsze ma ścianę po prawej stronie, patrząc w kierunku ruchu." },

    { t: "h", x: "Naroża kieszeni", id: "naroza" },
    { t: "p", x: "Naroże R6 przy frezie R5 zostawia środkowi freza łuk o promieniu 1 mm — frez przechodzi płynnie. Gdy promień naroża jest równy promieniowi freza, frez w narożu obejmuje ścianę ćwiartką obwodu naraz: rośnie obciążenie i pojawiają się drgania. Konstruktorom zaleca się naroża kieszeni o promieniu wyraźnie większym niż promień przewidywanego freza." },
  ],

  worked: {
    title: "Tor pętli zgrubnej",
    intro: "Ściany kieszeni: X17…X43, Y15…Y35. Frez Ø10, naddatek na ściany 1 mm.",
    steps: [
      { x: "Odsunięcie środka freza od ściany: promień + naddatek, 5 + 1.", code: "6 mm" },
      { x: "X: 17 + 6 i 43 − 6.", code: "X23…X37" },
      { x: "Y: 15 + 6 i 35 − 6.", code: "Y21…Y29" },
      { x: "Pętla przeciwnie do zegara z osi kieszeni: w górę, w lewo, w dół, w prawo.", code: "Y29. → X23. → Y21. → X37." },
    ],
    result: "Pętla przykrywa całe wnętrze — frez Ø10 na torze odsuniętym o 4 mm od osi sięga aż do osi. Na ścianach zostaje dokładnie 1 mm dla przejścia wykańczającego.",
  },

  practice: [
    {
      kind: "task",
      intro: "Rampa i obróbka zgrubna są gotowe. Dopisz wykończenie ścian z korekcją promienia.",
      starter,
      checks: [
        { t: "cut", reference: `G90\nG00 Z50.\n${rough}\n${finish}\nG00 Z5.`, tolerance: 0.05 },
        { t: "require", codes: ["G41", "G40", "G03"] },
      ],
      hints: ["Najazd: G41 D1 G01 X24. Y21., potem G03 X30. Y15. R6.", "Ściany przeciwnie do zegara: X37 → G03 X43. Y21. R6. → Y29 → G03 X37. Y35. R6. → X23 → G03 X17. Y29. R6. → Y21 → G03 X23. Y15. R6. → X30.", "Odjazd: G03 X36. Y21. R6., potem G40 G01 X30. Y25."],
      solution: starter.replace("(DOPISZ WYKANCZANIE SCIAN: G41, NAJAZD PO LUKU R6 NA SRODEK DOLNEJ SCIANY,\n OBIEG PRZECIWNIE DO ZEGARA, ODJAZD PO LUKU, G40)\n", finish),
    },
    {
      kind: "drill",
      intro: "Geometria kieszeni.",
      questions: [
        { kind: "gap", q: "Kieszeń X10…X50, frez Ø12, naddatek 0,5. Zakres X pętli zgrubnej:", template: "X{0}…X{1}", answers: [["16.5", "16,5"], ["43.5", "43,5"]], why: "Odsunięcie 6 + 0,5 = 6,5: 10 + 6,5 i 50 − 6,5." },
        { kind: "choice", q: "Kieszeń z narożami R4. Który frez wykończy naroża?", options: ["Ø6", "Ø8", "Ø10", "każdy"], answer: 0, why: "Promień freza (3) musi być mniejszy niż promień naroża (4)." },
        { kind: "choice", q: "Wykańczanie ścian kieszeni przy M03 i G41 — kierunek obiegu:", options: ["przeciwnie do zegara", "zgodnie z zegarem", "bez znaczenia", "zygzakiem"], answer: 0, why: "Wewnątrz współbieżnie znaczy przeciwnie do zegara." },
      ],
    },
  ],

  pitfalls: [
    { title: "Obieg zgodny z zegarem w kieszeni", x: "Nawyk z konturu zewnętrznego. Z G41 frez znajdzie się po złej stronie ścieżki, a z G42 pojedzie przeciwbieżnie — gorsza ściana i większe ugięcie freza." },
    { title: "Naroże równe promieniowi freza", x: "Naroże R5 frezem Ø10: środek freza zatrzymuje się w punkcie, a ostrza obejmują ćwiartkę ściany naraz. Ślad drgań w narożu albo alarm korekcji." },
    { title: "Zgrubnie od razu na wymiar", x: "Pętla zgrubna dokładnie przy ścianie, bez naddatku. Frez obciążony na pełnym ae ugina się i zostawia ścianę ze stopniem i złą powierzchnią." },
    { title: "Wiór w kieszeni", x: "Bez chłodziwa albo nadmuchu wiór zostaje na dnie i trafia pod ostrza przy wykańczaniu — rysy na ścianie i dnie." },
  ],

  controllers: {
    rows: [
      ["Kieszeń prostokątna", "ręcznie albo Manual Guide i / CAM", "`POCKET3(…)`"],
      ["Wejście w materiał", "programowane: rampa albo spirala", "parametr cyklu: pionowo, rampa, spirala"],
      ["Naddatek na wykończenie", "osobna pętla i przejście z G41", "parametr cyklu i drugie wywołanie w trybie wykańczania"],
    ],
    note: "POCKET3 liczy przejścia, rampę i naddatki sam. Ręczny program z tej lekcji pokazuje, co cykl robi pod spodem — i przydaje się tam, gdzie cyklu nie ma.",
  },

  quiz: [
    { kind: "gap", review: "F6.1", q: "Głowica Ø63, zapas 8,5 mm. X startu przed detalem zaczynającym się w X0:", template: "X{0}", answers: [["-40"]], why: "−(31,5 + 8,5)." },
    { kind: "choice", q: "Po co rampa zamiast wejścia pionowego?", options: ["frez skrawa obwodem, a nie samym czołem", "rampa jest krótsza", "tak wymaga G41", "żeby zmniejszyć obroty"], answer: 0, why: "Ostrza na obwodzie są do tego przeznaczone." },
    { kind: "gap", q: "Rampa: 1 mm w dół na 20 mm drogi. Kąt (stopnie, w przybliżeniu całkowitym):", template: "{0}°", answers: [["3", "2.9", "2,9"]], why: "atan(1/20) ≈ 2,9°." },
    { kind: "choice", q: "Promień naroża kieszeni względem promienia freza:", options: ["większy", "równy", "mniejszy", "bez znaczenia"], answer: 0, why: "Tylko wtedy frez przejdzie naroże płynnie." },
    { kind: "choice", q: "Po co naddatek po obróbce zgrubnej?", options: ["żeby przejście wykańczające zdjęło równą, cienką warstwę", "żeby skrócić program", "bo G41 tego wymaga", "żeby oszczędzić chłodziwo"], answer: 0, why: "Małe, stałe obciążenie daje dokładną ścianę." },
    { kind: "order", q: "Ułóż etapy kieszeni.", items: ["wykończenie ścian z G41", "pętla zgrubna z naddatkiem", "rampa do głębokości", "przejście po osi"], answer: [2, 3, 1, 0], why: "Wejście, oś, pętla, wykończenie." },
  ],

  summary: [
    "Kieszeń: rampa albo spirala, zgrubnie z naddatkiem, na gotowo z korekcją.",
    "Wewnątrz współbieżnie = przeciwnie do zegara przy M03.",
    "Naroże kieszeni ma promień większy niż promień freza.",
    "Tor zgrubny: ściana − (promień + naddatek).",
  ],

  sources: [
    { id: "sandvik", where: "frezowanie kieszeni, wejście po rampie, promienie naroży" },
    { id: "sinumerik", where: "POCKET3" },
    { id: "fanuc", where: "korekcja promienia na konturach wewnętrznych" },
  ],
};
