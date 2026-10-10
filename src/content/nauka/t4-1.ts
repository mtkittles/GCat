import type { LessonDoc } from "@/lib/lesson";
import { T3_FIN_HEAD } from "./t3-common";

const contour = `G01 X20. Z-1. F0.1
Z-20.
X28.
X30. Z-21.
Z-39.
G02 X32. Z-40. R1.
G01 X35.
G03 X36. Z-40.5 R0.5
G01 Z-55.
X42.`;

const demo = (comp: boolean) => `G18 G21 G40 G80 G99
G54
T0101 (NOZ R0.8, KIERUNEK OSTRZA 3)
G96 S200 M03
${comp ? "G42 " : ""}G00 X14. Z2.
G01 X20. Z-1. F0.1
Z-5.
G02 X24. Z-7. R2.
G01 X26.
G03 X28. Z-8. R1.
G01 Z-12.
${comp ? "G40 " : ""}G00 X32.
M30`;

const starter = `${T3_FIN_HEAD}
(DOPISZ DOJAZD DO X14 Z2 Z WLACZENIEM KOREKCJI)

${contour}
(DOPISZ ODJAZD NA Z2 Z WYLACZENIEM KOREKCJI)

M09
M05
G28 U0.
G28 W0.
M30`;

export const t4_1: LessonDoc = {
  id: "T4.1",
  slug: "t4-1-g41-g42-tokarka",
  title: "G41 i G42 na tokarce",
  minutes: 15,
  goal: "Wyjaśnisz, skąd bierze się błąd kształtu na fazach i łukach, i włączysz korekcję promienia ostrza dla konturu wałka.",

  theory: [
    { t: "h", x: "Punkt, którego nie ma", id: "punkt" },
    { t: "p", x: "Płytka tokarska ma zaokrąglone naroże o promieniu rε — 0,4, 0,8 albo 1,2 mm. Nóż mierzy się jednak do punktu P, w którym przecinają się styczne do naroża w osiach X i Z. Tego punktu na płytce nie ma — ale to on jedzie po torze z programu." },
    { t: "diagram", id: "t41-point" },
    { t: "p", x: "Na średnicach (ruch w Z) i czołach (ruch w X) naroże dotyka detalu dokładnie na wysokości P, więc wymiar się zgadza. Na fazach, stożkach i łukach naroże styka się z materiałem gdzie indziej niż P i kształt wychodzi przesunięty." },
    { t: "diagram", id: "t41-chamfer" },
    { t: "code", x: "faza 45°:  błąd ≈ 0,414 · rε\nrε 0,8  →  0,33 mm\nrε 0,4  →  0,17 mm", caption: "Błąd mierzony prostopadle do fazy. Przy tolerancjach rzędu setnych to dużo." },
    { t: "demo", mode: "lathe", title: "Bez korekcji: G40", src: demo(false), caption: "Pomarańczowy pas to ślad naroża R0,8. Na średnicach i czole dotyka konturu (linia), na fazie i obu promieniach zostaje od niego z daleka." },

    { t: "h", x: "Korekcja promienia ostrza", id: "g41-g42" },
    { t: "p", x: "Z [[G42]] lub [[G41]] sterowanie prowadzi środek naroża w odległości rε od konturu z programu — jak przy frezie w module F4, tylko promieniem jest naroże płytki. Program opisuje wtedy kontur z rysunku, a kształt faz i łuków wychodzi poprawny." },
    { t: "diagram", id: "t41-sides" },
    { t: "demo", mode: "lathe", title: "Z korekcją: G42", src: demo(true), caption: "Ten sam program z G42 i G40. Przerywana linia to kontur z programu, zielony tor to droga punktu P. Ślad naroża przylega do konturu na całej długości — także na fazie i promieniach." },
    { t: "table", head: ["Obróbka", "Kierunek", "Kod"], rows: [
      ["zewnętrzna", "w stronę uchwytu", "`G42`"],
      ["wewnętrzna (wytaczanie)", "w stronę uchwytu", "`G41`"],
      ["dowolna", "wyłączenie", "`G40`"],
    ] },

    { t: "h", x: "Włączanie i wyłączanie", id: "wlaczanie" },
    { t: "ul", items: [
      "korekcję włącza i wyłącza ruch liniowy (G00 albo G01), nigdy łuk,",
      "ruch włączający musi być dłuższy niż rε i zaczynać się z dala od detalu — najlepiej dojazd do punktu startowego konturu,",
      "wyłączenie na odjeździe od detalu, gdy nóż jest już w powietrzu,",
      "sterowanie potrzebuje w tabeli korekcji promienia naroża R i kierunku ostrza T (lekcja T4.2).",
    ] },
  ],

  worked: {
    title: "Korekcja w programie wałka",
    intro: "Kontur wykańczający z T3.3, nóż T0202 R0,4. Dojazd z punktu wymiany na X14 Z2, odjazd po wyjściu na X42.",
    steps: [
      { x: "Nóż zewnętrzny jedzie w stronę uchwytu — G42 na dojeździe.", code: "G42 G00 X14. Z2." },
      { x: "Kontur bez zmian — wymiary z rysunku.", code: "G01 X20. Z-1. F0.1 …" },
      { x: "Po wyjściu na X42 nóż jest ponad detalem.", code: "X42." },
      { x: "Wyłączenie korekcji na odjeździe w Z.", code: "G40 G00 Z2." },
    ],
    result: "Dwa słowa w programie — G42 i G40 — usuwają błąd 0,17 mm na fazach i poprawiają kształt obu promieni przy stopniu.",
  },

  practice: [
    {
      kind: "task",
      mode: "lathe",
      intro: "Dopisz dojazd z włączeniem korekcji i odjazd z jej wyłączeniem. Kontur zostaje bez zmian — sprawdzany jest tor programowany i użycie G42 oraz G40. Po dopisaniu przełącz w symulatorze „Tor ostrza P” i „Tor programowany”, żeby zobaczyć różnicę.",
      starter,
      checks: [
        { t: "cut", reference: `${T3_FIN_HEAD}\nG00 X14. Z2.\n${contour}\nG00 Z2.`, tolerance: 0.05 },
        { t: "require", codes: ["G42", "G40"] },
      ],
      hints: ["Dojazd: G42 G00 X14. Z2.", "Odjazd: G40 G00 Z2."],
      solution: starter
        .replace("(DOPISZ DOJAZD DO X14 Z2 Z WLACZENIEM KOREKCJI)\n", "G42 G00 X14. Z2.\n")
        .replace("(DOPISZ ODJAZD NA Z2 Z WYLACZENIEM KOREKCJI)\n", "G40 G00 Z2.\n"),
    },
    {
      kind: "drill",
      intro: "Strona korekcji i wielkość błędu.",
      questions: [
        { kind: "gap", q: "Faza 45°, naroże R1,2, program bez korekcji promienia. O ile kontur fazy odbiega od rysunku, mierząc prostopadle (mm, do 0,01)?", template: "{0}", answers: [["0.5", "0,5", "0.50", "0,50"]], why: "0,414 · 1,2 ≈ 0,50." },
        { kind: "choice", q: "Wytaczanie otworu w stronę uchwytu. Który kod?", options: ["G41", "G42", "G40", "G43"], answer: 0, why: "Nóż pod konturem — po lewej stronie kierunku ruchu." },
        { kind: "choice", q: "Na którym elemencie konturu brak korekcji **nie** daje błędu kształtu?", options: ["średnica wzdłuż Z", "faza 45°", "stożek", "promień R1"], answer: 0, why: "Na średnicach i czołach naroże styka się na wysokości P." },
      ],
    },
  ],

  pitfalls: [
    { title: "G42 włączone na łuku", x: "`G42 G02 …` — sterowanie zgłosi alarm albo potraktuje łuk jak ruch włączający i zniekształci go. Korekcję włącza ruch liniowy." },
    { title: "Włączenie tuż przy detalu", x: "`G42 G01 X20. Z0.` z nożem stojącym 0,2 mm od czoła. Na ruchu włączającym nie ma miejsca na przesunięcie o rε — nóż wcina się w naroże." },
    { title: "Brak R w tabeli", x: "Promień naroża w tabeli korekcji = 0. G42 niczego nie zmienia — program wygląda na poprawny, a fazy nadal mają błąd." },
    { title: "G41 i G42 zamienione", x: "Nóż zewnętrzny z G41: sterowanie odsuwa naroże w stronę materiału. Kontur wychodzi mniejszy o dwa promienie naroża na fazach i promieniach." },
  ],

  controllers: {
    rows: [
      ["Korekcja z lewej / prawej", "`G41` / `G42`", "`G41` / `G42`"],
      ["Wyłączenie", "`G40`", "`G40`"],
      ["Promień i kierunek ostrza", "tabela korekcji: R i T", "dane ostrza: promień i położenie ostrza"],
    ],
    note: "Kody są wspólne. Sterowanie musi znać zarówno promień naroża, jak i kierunek ostrza — o nim lekcja T4.2.",
  },

  quiz: [
    { kind: "choice", review: "T3.3", q: "Ruch w stronę uchwytu (głowica za osią). Którym kodem zaprogramujesz promień wklęsły między średnicą a czołem stopnia?", options: ["G02", "G03", "G01", "zależy od głowicy"], answer: 0, why: "Przy X w górę — zgodnie z zegarem." },
    { kind: "choice", q: "Czym jest punkt P noża tokarskiego?", options: ["przecięciem stycznych do naroża w X i Z", "środkiem naroża", "końcem oprawki", "punktem bazowym głowicy"], answer: 0, why: "Do niego mierzy się nóż i jego prowadzi program." },
    { kind: "choice", q: "Toczenie zewnętrzne w stronę uchwytu. Który kod korekcji?", options: ["G42", "G41", "G40", "G43"], answer: 0, why: "Nóż nad konturem — po prawej stronie kierunku ruchu." },
    { kind: "gap", q: "Naroże R0,8, faza 45°, bez korekcji. O ile kontur fazy odbiega od rysunku (mm, do 0,01)?", template: "{0}", answers: [["0.33", "0,33"]], why: "0,414 · 0,8 ≈ 0,33." },
    { kind: "choice", q: "Czym włącza się korekcję promienia ostrza?", options: ["ruchem liniowym G00 lub G01", "łukiem", "blokiem bez ruchu", "G96"], answer: 0, why: "Na odcinku sterowanie buduje przesunięcie." },
    { kind: "token", q: "Wskaż blok, który **wyłącza** korekcję.", block: "G42 G00 X14. Z2. | G01 X20. Z-1. F0.1 | G40 G00 Z2.", answer: 2, why: "G40 na odjeździe." },
  ],

  summary: [
    "Program prowadzi punkt P, a skrawa łuk naroża — na fazach i łukach powstaje błąd.",
    "Faza 45° bez korekcji: błąd ≈ 0,414 · rε.",
    "Zewnętrznie w stronę uchwytu G42, wewnątrz G41, wyłączenie G40.",
    "Włączanie i wyłączanie ruchem liniowym w powietrzu. R i T muszą być w tabeli.",
  ],

  sources: [
    { id: "fanuc", where: "korekcja promienia ostrza na tokarce, punkt teoretyczny ostrza" },
    { id: "sinumerik", where: "korekcja promienia ostrza G41/G42 na tokarce" },
    { id: "sandvik", where: "promień naroża i dokładność kształtu przy toczeniu" },
  ],
};
