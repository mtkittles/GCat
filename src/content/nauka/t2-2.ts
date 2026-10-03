import type { LessonDoc } from "@/lib/lesson";

export const t2_2: LessonDoc = {
  id: "T2.2",
  slug: "t2-2-g96-g97-limit-obrotow",
  title: "G96, G97 i limit obrotów",
  minutes: 14,
  goal: "Wybierzesz między stałą prędkością skrawania a stałymi obrotami i zabezpieczysz wrzeciono limitem G50.",

  theory: [
    { t: "h", x: "Stałe obroty", id: "g97" },
    { t: "p", x: "[[G97]] działa jak na frezarce: `G97 S1200` to 1200 obr/min bez względu na średnicę. Na tokarce ma to wadę — przy tych samych obrotach ostrze na Ø40 jedzie dwa razy szybciej niż na Ø20." },

    { t: "h", x: "Stała prędkość skrawania", id: "g96" },
    { t: "p", x: "[[G96]] zamienia znaczenie S: `G96 S200` to prędkość skrawania 200 m/min. Sterowanie samo liczy obroty z bieżącej średnicy i zmienia je w trakcie ruchu w X, żeby ostrze pracowało zawsze z tą samą prędkością." },
    { t: "code", x: "n = 1000 · vc / (π · D)\nØ40: n = 1000 · 200 / (π · 40) ≈ 1592\nØ20: n = 1000 · 200 / (π · 20) ≈ 3183" },
    { t: "p", x: "Korzyści: równa powierzchnia na wszystkich średnicach, przewidywalne zużycie płytki i krótszy czas — małe średnice nie są toczone za wolno." },

    { t: "h", x: "Limit obrotów G50", id: "g50" },
    { t: "diagram", id: "t22-css" },
    { t: "p", x: "Gdy nóż zbliża się do osi, średnica dąży do zera, a obroty z wzoru — do nieskończoności. `G50 S3000` przed G96 ogranicza je do 3000 obr/min. Poniżej średnicy, przy której wzór daje 3000, sterowanie trzyma limit, a prędkość skrawania spada." },
    { t: "note", kind: "warn", x: "Limit dobiera się do uchwytu i detalu, a nie tylko do maszyny. Szczęki uchwytu przy wysokich obrotach tracą siłę mocowania od siły odśrodkowej — długi albo niewyważony detal może się wysunąć." },

    { t: "h", x: "Kiedy G97", id: "kiedy-g97" },
    { t: "ul", items: [
      "**wiercenie i gwintowanie w osi** — D = 0, więc G96 dałby od razu limit; obroty liczy się dla średnicy wiertła i ustawia G97,",
      "**toczenie gwintów** — obroty muszą być stałe w całym przejściu (moduł T7),",
      "**toczenie na małych średnicach**, poniżej progu limitu — G97 z tymi samymi obrotami jest wtedy czytelniejsze.",
    ] },
  ],

  worked: {
    title: "Obroty przy planowaniu czoła wałka",
    intro: "Planowanie z Ø44 do osi, G96 S200, G50 S3000.",
    steps: [
      { x: "Na Ø44: 1000 · 200 / (π · 44).", code: "≈ 1447 obr/min" },
      { x: "Średnica, przy której wzór daje 3000: 1000 · 200 / (π · 3000).", code: "Ø21,2" },
      { x: "Od Ø21,2 do osi obroty stoją na limicie.", code: "3000 obr/min" },
      { x: "Zapis w programie — limit przed G96.", code: "G50 S3000 → G96 S200 M03" },
    ],
    result: "Połowa czoła (od Ø21 w dół) jest toczona z mniejszą prędkością skrawania niż 200 m/min. Tak ma być — to cena bezpiecznego limitu.",
  },

  practice: [
    {
      kind: "task", mode: "lathe",
      intro: "Dopisz ustawienie wrzeciona do planowania czoła: limit obrotów, stała prędkość skrawania i kierunek obrotów.",
      starter: "O2001 (WALEK)\nG18 G21 G40 G80 G99\nG54\nT0101 (NOZ ZEWN. CNMG R0.8)\n(DOPISZ: LIMIT 3000 OBR/MIN, STALA PREDKOSC SKRAWANIA 200 M/MIN, WRZECIONO W PRAWO)\nM08\nG00 X44. Z0.\nG01 X-1.6 F0.15\nG00 Z2.\nG00 X100. Z100.\nM09\nM05\nM30",
      checks: [{"t":"require","codes":["G50","S3000","G96","S200","M03"]},{"t":"cut","reference":"G18 G99\nG00 X44. Z0.\nG01 X-1.6 F0.15\nG00 Z2.","tolerance":0.05}],
      hints: ["Limit przed G96: `G50 S3000`.","`G96 S200 M03` — S to teraz m/min, nie obr/min."],
      solution: "O2001 (WALEK)\nG18 G21 G40 G80 G99\nG54\nT0101 (NOZ ZEWN. CNMG R0.8)\nG50 S3000\nG96 S200 M03\nM08\nG00 X44. Z0.\nG01 X-1.6 F0.15\nG00 Z2.\nG00 X100. Z100.\nM09\nM05\nM30",
    },
    {
      kind: "css",
      intro: "Przesuwaj średnicę i obserwuj obroty. Zmień vc i limit, żeby zobaczyć, gdzie zaczyna działać G50.",
      vc: 200, limit: 3000,
    },
    {
      kind: "drill",
      intro: "Obroty przy G96.",
      questions: [
    {"kind":"bughunt","q":"Planowanie czoła do osi. Który blok jest w złej kolejności?","program":"T0101\nG96 S200 M03\nG50 S3000\nG00 X44. Z0.\nG01 X-1.6 F0.15","answer":2,"why":"Limit obrotów musi stać PRZED G96 — tu wrzeciono rozpędza się bez ograniczenia, zanim limit zadziała. Kolejność: G50 S3000, potem G96 S200 M03."},

        { kind: "gap", q: "G96 S180, średnica Ø30. Obroty (pełne obr/min):", template: "n = {0}", answers: [["1910", "1909", "1911"]], why: "1000 · 180 / (π · 30) ≈ 1910." },
        { kind: "gap", q: "G96 S150, G50 S2500. Poniżej jakiej średnicy działa limit (mm, do 0,1)?", template: "Ø{0}", answers: [["19.1", "19,1"]], why: "1000 · 150 / (π · 2500) ≈ 19,1." },
        { kind: "choice", q: "Wiercenie w osi wiertłem Ø8. Który tryb obrotów?", options: ["G97 z obrotami dla Ø8", "G96", "G50", "bez znaczenia"], answer: 0, why: "Przy D = 0 G96 dałby od razu limit." },
      ],
    },
  ],

  pitfalls: [
    { title: "G96 bez G50", x: "Planowanie do osi przy G96 bez limitu: obroty rosną do maksimum maszyny. Szczęki tracą siłę mocowania, a detal może wypaść z uchwytu." },
    { title: "G50 po G96", x: "Limit wpisany za blokiem z G96 M03. Wrzeciono rozpędza się przez chwilę bez ograniczenia — przy małej średnicy startu od razu do maksimum." },
    { title: "S po zmianie trybu", x: "Po `G97` zostaje `S200` z G96 — wrzeciono kręci się 200 obr/min zamiast 200 m/min. Przy wierceniu czy gwintowaniu to kilkukrotnie za wolno." },
    { title: "Złe X0", x: "G96 liczy obroty z aktualnego X. Jeśli korekcja X noża jest błędna, sterowanie liczy obroty dla innej średnicy, niż toczy." },
  ],

  controllers: {
    rows: [
      ["Stała prędkość skrawania", "`G96 S200`", "`G96 S200`"],
      ["Stałe obroty", "`G97 S1200`", "`G97 S1200`"],
      ["Limit obrotów", "`G50 S3000` (system A), `G92 S…` (B/C)", "`LIMS=3000`"],
    ],
    note: "G96 i G97 są wspólne. Limit ma różny zapis: na Sinumeriku to osobne polecenie LIMS.",
  },

  quiz: [
    { kind: "choice", review: "T2.1", q: "Co oznacza `T0303`?", options: ["pozycja 3, korekcja 3", "nóż 303", "3 obroty głowicy", "korekcja 30"], answer: 0, why: "Dwie cyfry pozycji, dwie korekcji." },
    { kind: "choice", q: "Co oznacza `S200` przy aktywnym G96?", options: ["200 m/min prędkości skrawania", "200 obr/min", "200 mm/obr", "limit 200"], answer: 0, why: "G96 zmienia znaczenie S." },
    { kind: "gap", q: "G96 S200, Ø50. Obroty (pełne):", template: "n = {0}", answers: [["1273", "1274"]], why: "1000 · 200 / (π · 50) ≈ 1273." },
    { kind: "choice", q: "Po co G50 przed G96?", options: ["ogranicza obroty przy małych średnicach", "zmienia posuw", "wybiera narzędzie", "ustawia zero"], answer: 0, why: "Przy osi obroty z wzoru rosłyby bez końca." },
    { kind: "choice", q: "Kiedy używać G97 na tokarce?", options: ["przy wierceniu w osi i toczeniu gwintów", "zawsze przy planowaniu", "nigdy", "tylko z G50"], answer: 0, why: "Tam obroty muszą być stałe albo D = 0." },
    { kind: "choice", q: "Co dzieje się z prędkością skrawania poniżej średnicy limitu?", options: ["spada, bo obroty już nie rosną", "rośnie", "zostaje stała", "zmienia się posuw"], answer: 0, why: "Sterowanie trzyma limit obrotów." },
  ],

  summary: [
    "G97 — stałe obroty. G96 — stała prędkość skrawania, S w m/min.",
    "n = 1000 · vc / (π · D) — sterowanie liczy to na bieżąco.",
    "G50 S… przed G96 ogranicza obroty przy osi. Limit dobieraj do uchwytu i detalu.",
    "Wiercenie w osi i gwinty — G97.",
  ],

  sources: [
    { id: "fanuc", where: "G96, G97, G50 na tokarce" },
    { id: "sinumerik", where: "G96, G97, LIMS" },
    { id: "sandvik", where: "prędkość skrawania przy toczeniu" },
  ],
};
