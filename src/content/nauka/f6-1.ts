import type { LessonDoc } from "@/lib/lesson";

const starter = `O1006 (PLANOWANIE)
G21 G90 G94 G17
G40 G49 G80
G54
T5 M06 (GLOWICA FI63 5Z 45ST)
G00 G43 H5 Z50.
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

const solution = starter.replace("(DOPISZ: NAJAZD NAD X-40 Y25, ZEJSCIE NA Z0 OBOK DETALU,\n JEDNO PRZEJSCIE DO X120 Z F800, ODJAZD NA Z50)\n", pass);

/** Program przykładu przewijanego (Etap 12, B3) — kroki wskazują jego linie. */
const story = solution;

export const f6_1: LessonDoc = {
  id: "F6.1",
  slug: "f6-1-planowanie",
  title: "Planowanie",
  minutes: 14,
  goal: "Zaplanujesz powierzchnię czołową głowicą: dobierzesz położenie osi, punkty startu i końca oraz posuw z uwzględnieniem kąta przystawienia.",

  theory: [
    { t: "h", x: "Pierwsza operacja", id: "po-co" },
    { t: "p", x: "Planowanie zbiera naddatek z górnej powierzchni i robi z niej płaszczyznę, od której liczy się Z0 i wszystkie głębokości. Dlatego zwykle idzie pierwsze. Surówka płytki ma 1 mm naddatku — program planuje ją do Z0." },

    { t: "h", x: "Położenie głowicy", id: "polozenie" },
    { t: "p", x: "[[ae — szerokość skrawania|Szerokość skrawania]] **ae** najlepiej dobrać na około 70–80% średnicy głowicy, z osią nad detalem. Płytka ma 50 mm szerokości, głowica Ø63: jedno przejście środkiem daje ae = 50 mm, czyli 79% D." },
    { t: "diagram", id: "f61-pos" },
    { t: "p", x: "Start i koniec poza detalem: głowica wchodzi w materiał bokiem, a nie czołem, i nie zostawia śladu po zatrzymaniu. Odległość osi od krawędzi to promień głowicy plus kilka milimetrów zapasu." },
    { t: "wzor", f: "X = 0 - \\left(\\frac{63}{2} + 8,5\\right) = -40 \\\\ X = 80 + \\left(\\frac{63}{2} + 8,5\\right) = 120", caption: "Start przed detalem; Koniec za detalem", kind: "obliczenie" },

    { t: "h", x: "Kąt przystawienia i posuw", id: "posuw" },
    { t: "p", x: "Głowice do planowania mają zwykle płytki o [[kąt przystawienia|kącie przystawienia]] 45°. Wiór jest wtedy cieńszy niż posuw na ostrze — grubość wióra to fz · sin 45° ≈ 0,7 · fz. Katalog podaje więc dla takich głowic wyższe fz niż dla frezów 90°." },
    { t: "wzor", f: "S = \\frac{1000 \\cdot 198}{\\pi \\cdot 63} \\approx 1000\\ \\text{obr/min} \\\\ F = 0,16 \\cdot 5 \\cdot 1000 = 800\\ \\text{mm/min} \\\\ h_{ex} = 0,16 \\cdot 0,71 \\approx 0,11\\ \\text{mm}", caption: "Obroty; Posuw; Grubość wióra przy 45°", kind: "obliczenie" },
    { t: "p", x: "Wydajność, czyli objętość zdejmowanego materiału na minutę:" },
    { t: "wzor", f: "Q = \\frac{a_p \\cdot a_e \\cdot v_f}{1000}", legend: "Q — wydajność skrawania [cm³/min]; a_p — głębokość skrawania [mm]; a_e — szerokość skrawania [mm]; v_f — posuw minutowy [mm/min]", caption: "Wydajność skrawania" },
    { t: "wzor", f: "Q = \\frac{1 \\cdot 50 \\cdot 800}{1000} = 40\\ \\text{cm}^3\\text{/min}", kind: "obliczenie" },

    { t: "h", x: "Szersze powierzchnie", id: "szersze" },
    { t: "diagram", id: "f61-strategy" },
    { t: "note", kind: "tip", x: "Chropowatość po planowaniu zależy głównie od posuwu na obrót. Płytki wygładzające (wiper) mają krótką płaską krawędź, która pozwala zwiększyć posuw bez pogorszenia powierzchni." },
  ],

  worked: {
    title: "Planowanie płytki",
    intro: "Sytuacja: górna powierzchnia płytki 80 × 50 ma 1 mm naddatku i trzeba ją zebrać jednym przejściem. Głowica Ø63 z 5 płytkami 45°, vc = 200 m/min, fz = 0,16. Gdzie ustawić oś głowicy, skąd zacząć i dokąd jechać? Rysunek pokazuje płytkę z góry i oba położenia głowicy.",
    fig: "f61-face",
    steps: [
      { x: "Oś na środku płytki: Y25, ae = 50 mm.", code: "Y25.", line: 9 },
      { x: "Start poza detalem (lewy okrąg na rysunku): promień 31,5 + zapas — krawędź głowicy w X−8,5.", code: "X-40.", line: 9 },
      { x: "Obroty i posuw: \\(S = \\frac{1000 \\cdot 200}{\\pi \\cdot 63} \\approx 1010\\), \\(F = 0,16 \\cdot 5 \\cdot 1000\\).", code: "S1000 F800" },
      { x: "Jedno przejście na Z0 do punktu za detalem.", code: "G01 X120. F800", line: 12 },
    ],
    result: "`G00 X-40. Y25.` → `G00 Z5.` → `G01 Z0. F200` → `G01 X120. F800` → `G00 Z50.`. Ta operacja otwiera teraz program płytki.",
    story: { program: story, from: 8, part: { x: [0, 80], y: [0, 50] }, tool: 63 },
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
      solution,
    },
    {
      kind: "drill",
      intro: "Położenie głowicy i parametry.",
      questions: [
        { kind: "gap", q: "Głowica Ø80 planuje detal od X0 do X120. Za detalem ma zostać 10 mm odstępu. Do jakiego X dojeżdża środek głowicy?", template: "X{0}", answers: [["170"]], why: "Środek głowicy musi minąć koniec detalu o promień głowicy i odstęp: 120 + 40 + 10 = 170." },
        { kind: "gap", q: "ap = 2 mm, ae = 40 mm, vf = 600 mm/min. Ile wynosi wydajność Q (cm³/min)?", template: "{0}", answers: [["48"]], why: "\\(Q = \\frac{2 \\cdot 40 \\cdot 600}{1000} = 48\\) cm³/min." },
        { kind: "choice", q: "W przykładzie zmieniono start na `G00 X-20. Y25.`. Co się stanie przy zejściu `G01 Z0.`?", options: ["głowica zejdzie pionowo w naddatek — jej krawędź sięga X11,5", "nic, głowica jest jeszcze w powietrzu", "sterowanie przesunie start", "głowica zatrzyma się nad krawędzią X0"], answer: 0, why: "Promień głowicy to 31,5 mm: −20 + 31,5 = 11,5. Płytka zaczyna się w X0, więc zejście z Z5 na Z0 wbija głowicę pionowo w 1 mm naddatku na pasie 11,5 mm — zamiast łagodnego wejścia z boku." },
        { kind: "choice", q: "Detal szeroki na 60 mm. Która głowica pasuje do jednego przejścia?", options: ["Ø80 (ae 75%)", "Ø63 (ae 95%)", "Ø50 (za mała)", "Ø125 (ae 48%)"], answer: 0, why: "Typowe zalecenie producentów głowic to ae ok. 70–80% D: 60 / 80 = 75%." },
      ],
    },
  ],

  pitfalls: [
    { title: "Start nad detalem", danger: true, x: "Głowica zjeżdża na Z0 nad materiałem i wchodzi czołem na pełnej szerokości. Płytki dostają uderzenie, a w miejscu wejścia zostaje ślad." },
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
    { kind: "choice", q: "Jaką szerokość skrawania ae zwykle zaleca się dla głowicy?", options: ["ok. 70–80% D", "100% D", "10% D", "dokładnie D/2 z osią na krawędzi"], answer: 0, why: "Typowe zalecenie producentów głowic: łagodne wejście ostrza i dobra wydajność." },
    { kind: "gap", q: "Głowica Ø50, 4 płytki, fz = 0,12 mm, S1200. Jaki posuw F (mm/min) wpiszesz?", template: "F{0}", answers: [["576"]], why: "\\(F = 0,12 \\cdot 4 \\cdot 1200 = 576\\) mm/min." },
    { kind: "gap", q: "Płytka o kącie przystawienia 45°, fz = 0,2 mm. Ile wynosi największa grubość wióra hex (mm, do 0,01)?", template: "{0}", answers: [["0.14", "0,14"]], why: "\\(h_{ex} \\approx f_z \\cdot \\sin \\kappa_r = 0,2 \\cdot 0,707 \\approx 0,14\\) mm — przy zaangażowaniu ae co najmniej 50% D." },
    { kind: "choice", q: "Gdzie zaczyna się przejście planujące?", options: ["poza detalem, z odstępem większym niż promień głowicy", "nad środkiem detalu", "na krawędzi detalu", "w zerze W"], answer: 0, why: "Głowica wchodzi w materiał bokiem." },
  ],

  summary: [
    "Planowanie tworzy płaską bazę — zwykle pierwsza operacja.",
    "ae ≈ 70–80% D, oś nad detalem, start i koniec poza detalem.",
    "Przy kącie 45° wiór \\(h_{ex} = f_z \\cdot 0,71\\) — fz dobierasz wyższe.",
    "\\(Q = \\frac{a_p \\cdot a_e \\cdot v_f}{1000}\\) [cm³/min].",
  ],

  sources: [
    { id: "sandvik", where: "planowanie: położenie freza, kąt przystawienia, pocienianie wióra, płytki wygładzające" },
    { id: "jemielniak", where: "frezowanie czołowe, wydajność skrawania" },
    { id: "sinumerik", where: "CYCLE61 — frezowanie płaszczyzn" },
  ],
};
