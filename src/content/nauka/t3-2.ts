import type { LessonDoc } from "@/lib/lesson";
import { T3_FIN_HEAD } from "./t3-common";

const contour = `G01 X20. Z-1. F0.1
Z-20.
X28.
X30. Z-21.
Z-40.
X36.
Z-55.
X42.`;

const starter = `${T3_FIN_HEAD}
G00 X14. Z2.
(DOPISZ KONTUR WYKANCZAJACY Z FAZAMI, F0.1:
 FAZA DO X20 Z-1, CZOP FI20 DO Z-20, FAZA NA FI30,
 FI30 DO Z-40, STOPIEN NA FI36, FI36 DO Z-55, WYJSCIE NA X42)

G00 Z2.
M09
M05
G28 U0.
G28 W0.
M30`;

export const t3_2: LessonDoc = {
  id: "T3.2",
  slug: "t3-2-g01-fazy-promienie",
  title: "G01, fazy i promienie",
  minutes: 16,
  goal: "Zaprogramujesz przejścia zgrubne i kontur wykańczający z fazami, z naddatkiem i właściwym punktem wejścia.",

  theory: [
    { t: "h", x: "G01 na tokarce", id: "g01" },
    { t: "p", x: "[[G01]] prowadzi nóż po odcinku z posuwem na obrót. Ruch tylko w Z to toczenie wzdłużne, tylko w X — toczenie poprzeczne (czoło, stopień), a w obu osiach naraz — stożek albo faza." },

    { t: "h", x: "Przejścia zgrubne", id: "zgrubne" },
    { t: "p", x: "Pręt Ø40 trzeba zdjąć warstwami. Głębokość jednego przejścia (ap) wynika z płytki i sztywności detalu — dla wałka Ø40 i płytki CNMG około 2–2,5 mm na stronę. Każdy stopień kończy się naddatkiem na obróbkę wykańczającą." },
    { t: "diagram", id: "t32-rough" },
    { t: "table", head: ["Przejście", "Średnica", "ap", "Do Z"], rows: [
      ["1", "Ø36,4", "1,8", "−54,8"],
      ["2", "Ø32", "2,2", "−39,8"],
      ["3", "Ø30,4", "0,8", "−39,8"],
      ["4", "Ø25,5", "2,45", "−19,8"],
      ["5", "Ø20,4", "2,55", "−19,8"],
    ], caption: "Naddatek: 0,4 mm na średnicy (0,2 na stronę) i 0,2 mm w Z przy każdym stopniu." },

    { t: "h", x: "Kontur wykańczający", id: "wykanczanie" },
    { t: "p", x: "Nóż wykańczający przechodzi kontur jeden raz, od czoła w stronę uchwytu, dokładnie po wymiarach z rysunku. Wejście najlepiej po przedłużeniu pierwszego elementu — tutaj fazy: z X14 Z2 linia pod 45° trafia w początek fazy na czole." },
    { t: "p", x: "Liczby w konturze wykańczającym to wymiary z rysunku wałka (T0.1): Ø20, Ø30, Ø36, długości 20, 40 i 55 od czoła, fazy 1 × 45°. Przejścia zgrubne leżą o naddatek dalej — Ø36,4 czy Z−54,8 to tor noża zgrubnego, a nie wymiar detalu." },

    { t: "h", x: "Fazy i stożki", id: "fazy" },
    { t: "p", x: "Faza to G01 w obu osiach naraz. Z lekcji T0.2: przy 45° X zmienia się o dwa razy więcej niż Z. Stożek liczy się tak samo, tylko z tangensem kąta." },
    { t: "code", x: "faza 1 × 45° na Ø30:  X28. → X30. Z-21.\nstożek 1:10 na długości 20:  ΔX = 20 / 10 = 2" },
    { t: "note", kind: "info", x: "Program prowadzi teoretyczny wierzchołek ostrza. Na fazach i stożkach naroże o promieniu rε daje przez to niewielki błąd kształtu — usuwa go korekcja promienia ostrza z modułu T4. W tej lekcji zostawiamy go świadomie." },
  ],

  worked: {
    title: "Kontur wykańczający wałka",
    intro: "Sytuacja: zgrubnie zostało 0,2 mm na stronę. Nóż wykańczający T0202 R0,4 stoi w X14 Z2 i ma przejść kontur z rysunku z fazami 1 × 45° — od czoła do Ø36 i wyjście ponad pręt. Numery na rysunku to numery kroków.",
    fig: "t32-contour",
    steps: [
      { x: "Faza na czopie Ø20 — z X14 Z2 po linii 45°, w której przedłużeniu leży faza.", code: "G01 X20. Z-1. F0.1" },
      { x: "Czop Ø20 do długości 20 i czoło stopnia do początku fazy: 30 − 2 · 1.", code: "Z-20. → X28." },
      { x: "Faza 1 × 45° na Ø30: 1 mm w Z, 2 mm na średnicy.", code: "X30. Z-21." },
      { x: "Ø30 do Z−40, stopień na Ø36, Ø36 do Z−55 i wyjście ponad pręt.", code: "Z-40. → X36. → Z-55. → X42." },
    ],
    result: "Wszystkie liczby da się odczytać z rysunku — dlatego kontur wykańczający pisze się absolutnie (T1.2).",
  },

  practice: [
    {
      kind: "task",
      mode: "lathe",
      intro: "Dopisz kontur wykańczający. Sprawdzany jest tor — kolejność i zapis bloków możesz wybrać sam, geometria musi się zgadzać.",
      starter,
      checks: [
        { t: "cut", reference: `${T3_FIN_HEAD}\nG00 X14. Z2.\n${contour}\nG00 Z2.`, tolerance: 0.05 },
      ],
      hints: ["Pierwszy blok: G01 X20. Z-1. F0.1.", "Dalej Z-20., X28., X30. Z-21., Z-40., X36., Z-55., X42."],
      solution: starter.replace("(DOPISZ KONTUR WYKANCZAJACY Z FAZAMI, F0.1:\n FAZA DO X20 Z-1, CZOP FI20 DO Z-20, FAZA NA FI30,\n FI30 DO Z-40, STOPIEN NA FI36, FI36 DO Z-55, WYJSCIE NA X42)\n", `${contour}\n`),
    },
    {
      kind: "drill",
      intro: "Średnice przejść i fazy.",
      questions: [
        { kind: "choice", q: "W przykładzie fazę na Ø30 wpisano `X30. Z-22.` zamiast `X30. Z-21.`. Co powstanie na krawędzi stopnia?", options: ["stożek 2 mm długości o kącie ok. 26,6° do osi zamiast fazy 1 × 45°", "faza 1 × 45°, tylko przesunięta o 1 mm", "faza 2 × 45°", "nic — sterowanie poprawi kąt"], answer: 0, why: "ΔX = 2 w średnicy to 1 mm na stronę, a ΔZ = 2. tan α = 1 / 2, α ≈ 26,6°. Dla 45° potrzeba ΔZ równego połowie ΔX (T0.2)." },
        { kind: "gap", q: "Stopień Ø24, naddatek 0,4 mm na średnicy. Na jaką średnicę toczy ostatnie przejście zgrubne?", template: "Ø{0}", answers: [["24.4", "24,4"]], why: "24 + 0,4." },
        { kind: "gap", q: "Faza 1,5 × 45° na Ø40 zaczyna się na czole stopnia w Z−30. W jakim punkcie się kończy?", template: "X{0} Z{1}", answers: [["40"], ["-31.5", "-31,5"]], why: "Pełna średnica 1,5 mm dalej w Z." },
        { kind: "gap", q: "Faza 1 × 45° kończy się w X20 Z−1. Nóż startuje na przedłużeniu fazy w Z2. Na jakiej średnicy?", template: "X{0}", answers: [["14"]], why: "Z2 to 3 mm przed końcem fazy: X = 20 − 2 · 3." },
      ],
    },
  ],

  pitfalls: [
    { title: "Za głębokie przejście", danger: true, x: "Z Ø40 od razu na Ø30 — ap = 5 mm. Płytka CNMG i wałek na wysięgu 70 mm nie wytrzymają: drgania, ugięcie, wykruszenie ostrza." },
    { title: "Brak naddatku", x: "Obróbka zgrubna na wymiar. Nóż wykańczający nie ma czego skrawać albo trze po powierzchni — wymiar i chropowatość zależą wtedy od noża zgrubnego." },
    { title: "Wejście na fazę prostopadle", danger: true, x: "`G00 X18. Z0.`, potem faza. Nóż dojeżdża ruchem szybkim prosto do czoła — lepiej wejść na przedłużeniu fazy, z posuwem." },
  ],

  controllers: {
    rows: [
      ["Ruch liniowy", "`G01`", "`G1`"],
      ["Faza w bloku", "`,C1.` — opcja", "`CHR=1` / `CHF=…`"],
      ["Zaokrąglenie w bloku", "`,R1.` — opcja", "`RND=1`"],
    ],
    note: "Faza i zaokrąglenie naroża w jednym bloku to wygoda, nie konieczność — na każdym sterowaniu można je zapisać zwykłymi ruchami, jak w tej lekcji.",
  },

  quiz: [
    { kind: "choice", review: "T3.1", q: "Którym ruchem nóż wychodzi z materiału przy stopniu?", options: ["G01", "G00", "G28", "dowolnym"], answer: 0, why: "Ostrze wciąż styka się z czołem stopnia." },
    { kind: "choice", q: "Jak nazywa się ruch G01 tylko w osi X?", options: ["toczenie poprzeczne", "toczenie wzdłużne", "stożek", "gwint"], answer: 0, why: "Czoło albo stopień." },
    { kind: "gap", q: "Toczysz z Ø36 na Ø31 jednym przejściem. Ile wynosi ap?", template: "{0} mm", answers: [["2.5", "2,5"]], why: "(36 − 31) / 2." },
    { kind: "choice", q: "Po co naddatek po obróbce zgrubnej?", options: ["żeby nóż wykańczający zdjął równą, cienką warstwę", "żeby skrócić program", "bo wymaga tego G96", "bez powodu"], answer: 0, why: "Wymiar i powierzchnia zależą od noża wykańczającego." },
    { kind: "gap", q: "Faza 2 × 45° na krawędzi czopa Ø30 przy czole Z0. Na jakiej średnicy faza zaczyna się na czole?", template: "X{0}", answers: [["26"]], why: "30 − 2 · 2." },
    { kind: "choice", q: "Dlaczego kontur wykańczający pisze się absolutnie?", options: ["każdą liczbę da się sprawdzić z rysunkiem", "bo U i W są zabronione", "bo szybciej", "bez powodu"], answer: 0, why: "Błąd nie przesuwa reszty konturu." },
  ],

  summary: [
    "G01: w Z — wzdłużnie, w X — poprzecznie, w obu naraz — faza lub stożek.",
    "Zgrubnie warstwami po ap ~2–2,5 mm, z naddatkiem 0,4 na średnicy.",
    "Kontur wykańczający raz, absolutnie, wejście na przedłużeniu pierwszego elementu.",
    "Faza 45°: |ΔX| = 2 · |ΔZ| (wartości bezwzględne).",
  ],

  sources: [
    { id: "sandvik", where: "toczenie zgrubne i wykańczające, głębokość skrawania" },
    { id: "fanuc", where: "G01, fazowanie i zaokrąglanie naroży" },
    { id: "sinumerik", where: "G1, CHR, CHF, RND" },
  ],
};
