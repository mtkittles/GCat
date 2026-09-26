import type { LessonDoc } from "@/lib/lesson";

const starter = `O1006 (PLANOWANIE)
G21 G90 G17
G40 G49 G80
G54
T5 M06 (GLOWICA FI63 5Z 45ST)
G43 H5 Z50.
S1000 M03
M08
(DOPISZ: NAJAZD NAD X-40 Y25, ZEJSCIE NA Z0 OBOK DETALU,
 JEDNO PRZEJSCIE DO X120 Z F800, ODJAZD NA Z50)

M09
M05
M30`;

const pass = `G00 X-40. Y25.
G00 Z5.
G01 Z0. F200
G01 X120. F800
G00 Z50.`;

export const f6_1: LessonDoc = {
  id: "F6.1",
  slug: "f6-1-planowanie",
  title: "Planowanie",
  minutes: 14,
  goal: "Zaplanujesz powierzchnię czołową głowicą: dobierzesz położenie osi, punkty startu i końca oraz posuw z uwzględnieniem kąta przystawienia.",

  theory: [
    { t: "h", x: "Pierwsza operacja", id: "po-co" },
    { t: "p", x: "Planowanie zbiera naddatek z górnej powierzchni i robi z niej płaszczyznę, od której liczy się Z0 i wszystkie głębokości. Dlatego zwykle idzie pierwsze. Surówka płytki ma 1 mm naddatku — program planuje ją do Z0." },
    { t: "diagram", id: "f61-face" },

    { t: "h", x: "Położenie głowicy", id: "polozenie" },
    { t: "p", x: "Szerokość skrawania **ae** najlepiej dobrać na około 70–80% średnicy głowicy, z osią nad detalem. Płytka ma 50 mm szerokości, głowica Ø63: jedno przejście środkiem daje ae = 50 mm, czyli 79% D." },
    { t: "diagram", id: "f61-pos" },
    { t: "p", x: "Start i koniec poza detalem: głowica wchodzi w materiał bokiem, a nie czołem, i nie zostawia śladu po zatrzymaniu. Odległość osi od krawędzi to promień głowicy plus kilka milimetrów zapasu." },
    { t: "code", x: "X startu = 0  − (63 / 2 + 8,5) = −40\nX końca  = 80 + (63 / 2 + 8,5) = 120" },

    { t: "h", x: "Kąt przystawienia i posuw", id: "posuw" },
    { t: "p", x: "Głowice do planowania mają zwykle płytki o kącie przystawienia 45°. Wiór jest wtedy cieńszy niż posuw na ostrze — grubość wióra to fz · sin 45° ≈ 0,7 · fz. Katalog podaje więc dla takich głowic wyższe fz niż dla frezów 90°." },
    { t: "code", x: "S = 1000 · 198 / (π · 63) ≈ 1000\nF = fz · z · n = 0,16 · 5 · 1000 = 800\nwiór = 0,16 · 0,71 ≈ 0,11 mm" },
    { t: "p", x: "Wydajność, czyli objętość zdejmowanego materiału na minutę:" },
    { t: "code", x: "Q = ap · ae · vf / 1000 = 1 · 50 · 800 / 1000 = 40 cm³/min" },

    { t: "h", x: "Szersze powierzchnie", id: "szersze" },
    { t: "diagram", id: "f61-strategy" },
    { t: "note", kind: "tip", x: "Chropowatość po planowaniu zależy głównie od posuwu na obrót. Płytki wygładzające (wiper) mają krótką płaską krawędź, która pozwala zwiększyć posuw bez pogorszenia powierzchni." },
  ],

  worked: {
    title: "Planowanie płytki",
    intro: "Płytka 80 × 50, naddatek 1 mm. Głowica Ø63, 5 płytek 45°, vc = 200 m/min, fz = 0,16.",
    steps: [
      { x: "Oś na środku płytki: Y25, ae = 50 mm.", code: "Y25." },
      { x: "Start poza detalem: promień 31,5 + zapas.", code: "X-40." },
      { x: "Obroty i posuw: S = 1000 · 200 / (π · 63) ≈ 1010, F = 0,16 · 5 · 1000.", code: "S1000 F800" },
      { x: "Jedno przejście na Z0 do punktu za detalem.", code: "G01 X120. F800" },
    ],
    result: "`G00 X-40. Y25.` → `G00 Z5.` → `G01 Z0. F200` → `G01 X120. F800` → `G00 Z50.`. Ta operacja otwiera teraz program płytki.",
  },

  practice: [
    {
      kind: "task",
      intro: "Dopisz przejście planujące. Sprawdzane: tor roboczy, bezpieczny najazd poza detalem i położenie końcowe.",
      starter,
      checks: [
        { t: "approach", x: -40, y: 25, z: 5, label: "Najazd w XY wysoko, potem zjazd na Z5 poza detalem" },
        { t: "cut", reference: `G90\nG00 Z50.\n${pass}`, tolerance: 0.05 },
        { t: "end", x: 120, y: 25, z: 50, label: "Głowica kończy za detalem na Z50" },
      ],
      hints: ["G00 X-40. Y25., potem G00 Z5.", "G01 Z0. F200, G01 X120. F800, G00 Z50."],
      solution: starter.replace("(DOPISZ: NAJAZD NAD X-40 Y25, ZEJSCIE NA Z0 OBOK DETALU,\n JEDNO PRZEJSCIE DO X120 Z F800, ODJAZD NA Z50)\n", pass),
    },
    {
      kind: "drill",
      intro: "Położenie głowicy i parametry.",
      questions: [
        { kind: "gap", q: "Głowica Ø80, detal długi na 120 mm, zapas 10 mm. X końca przejścia:", template: "X{0}", answers: [["170"]], why: "120 + 40 + 10 = 170." },
        { kind: "gap", q: "ap = 2, ae = 40, vf = 600. Wydajność Q (cm³/min):", template: "{0}", answers: [["48"]], why: "2 · 40 · 600 / 1000 = 48." },
        { kind: "choice", q: "Detal szeroki na 60 mm. Która głowica pasuje do jednego przejścia?", options: ["Ø80 (ae 75%)", "Ø63 (ae 95%)", "Ø50 (za mała)", "Ø125 (ae 48%)"], answer: 0, why: "ae około 70–80% D." },
      ],
    },
  ],

  pitfalls: [
    { title: "Start nad detalem", x: "Głowica zjeżdża na Z0 nad materiałem i wchodzi czołem na pełnej szerokości. Płytki dostają uderzenie, a w miejscu wejścia zostaje ślad." },
    { title: "Oś na krawędzi detalu", x: "Detal szeroki na połowę średnicy, oś na jego krawędzi. Każda płytka wchodzi w materiał na najgrubszym wiórze — płytki wykruszają się szybciej." },
    { title: "Za mały posuw przy 45°", x: "fz z tabeli dla frezu 90° użyte w głowicy 45°. Wiór jest o 30% cieńszy niż planowano, płytki trą i się grzeją." },
    { title: "Za krótki wybieg", x: "Przejście kończy się, zanim cała głowica opuści detal. Na końcu zostaje nieobrobiony sierp albo ślad po zatrzymaniu." },
  ],

  controllers: {
    rows: [
      ["Planowanie", "ręcznie, jak w tej lekcji", "ręcznie albo `CYCLE61`"],
      ["Strategia wielu przejść", "programowana ruchami", "parametr cyklu: jeden kierunek albo zygzak"],
    ],
    note: "Sinumerik ma cykl planowania, który sam liczy przejścia i wybiegi. Na Fanucu bez dodatkowego oprogramowania planowanie pisze się ręcznie albo w CAM.",
  },

  quiz: [
    { kind: "choice", review: "F5.4", q: "Kiedy G98 zamiast G99?", options: ["przed przejazdem nad przeszkodą", "zawsze", "na płaskiej płycie", "nigdy"], answer: 0, why: "G98 wraca na poziom początkowy." },
    { kind: "choice", q: "Dlaczego planowanie idzie zwykle jako pierwsze?", options: ["tworzy powierzchnię, od której liczy się Z0 i głębokości", "bo głowica jest najcięższa", "bo tak wymaga G54", "bez powodu"], answer: 0, why: "Powierzchnia planowana to baza dla kolejnych operacji." },
    { kind: "choice", q: "Najlepsza szerokość skrawania dla głowicy:", options: ["ok. 70–80% D", "100% D", "10% D", "dokładnie D/2 z osią na krawędzi"], answer: 0, why: "Łagodne wejście ostrza i dobra wydajność." },
    { kind: "gap", q: "Głowica Ø50, fz = 0,12, 4 płytki, S1200. F:", template: "F{0}", answers: [["576"]], why: "0,12 · 4 · 1200 = 576." },
    { kind: "gap", q: "Płytka 45°, fz = 0,2. Grubość wióra (mm, do 0,01):", template: "{0}", answers: [["0.14", "0,14"]], why: "0,2 · sin 45° ≈ 0,14." },
    { kind: "choice", q: "Gdzie zaczyna się przejście planujące?", options: ["poza detalem, z odstępem większym niż promień głowicy", "nad środkiem detalu", "na krawędzi detalu", "w zerze W"], answer: 0, why: "Głowica wchodzi w materiał bokiem." },
  ],

  summary: [
    "Planowanie tworzy płaską bazę — zwykle pierwsza operacja.",
    "ae ≈ 70–80% D, oś nad detalem, start i koniec poza detalem.",
    "Przy kącie 45° wiór = fz · 0,71 — fz dobierasz wyższe.",
    "Q = ap · ae · vf / 1000 [cm³/min].",
  ],

  sources: [
    { id: "sandvik", where: "planowanie: położenie freza, kąt przystawienia, pocienianie wióra, płytki wygładzające" },
    { id: "jemielniak", where: "frezowanie czołowe, wydajność skrawania" },
    { id: "sinumerik", where: "CYCLE61 — frezowanie płaszczyzn" },
  ],
};
