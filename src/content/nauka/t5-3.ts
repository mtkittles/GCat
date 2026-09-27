import type { LessonDoc } from "@/lib/lesson";

export const t5_3: LessonDoc = {
  id: "T5.3",
  slug: "t5-3-cycle95-sinumerik",
  title: "CYCLE95 w Sinumeriku",
  minutes: 12,
  goal: "Przeniesiesz obróbkę wałka z G71/G70 na cykl Sinumerika i rozpoznasz jego główne parametry.",

  theory: [
    { t: "h", x: "Jeden cykl, kilka rodzajów obróbki", id: "cycle95" },
    { t: "p", x: "Sinumerik nie ma osobnych kodów G71, G72 i G70. Obróbkę skrawaniem wzdłuż konturu wykonuje jeden cykl — w klasycznej postaci `CYCLE95`, w nowszych wersjach sterowania `CYCLE952`, zwykle generowany w edytorze cykli. Kontur leży w podprogramie albo między etykietami w programie." },
    { t: "diagram", id: "t53-cycle95" },
    { t: "table", head: ["Parametr", "Znaczenie", "Odpowiednik w G71"], rows: [
      ["NPP", "nazwa konturu (podprogram lub etykiety)", "`P… Q…`"],
      ["MID", "maksymalna głębokość skrawania", "`U` w pierwszym bloku"],
      ["FALZ, FALX", "naddatki w Z i w X (X w promieniu)", "`W`, `U` w drugim bloku"],
      ["FF1, FF2, FF3", "posuwy: zgrubny, wcinania, wykańczający", "`F` w G71 i w konturze"],
      ["VARI", "rodzaj obróbki: zgrubnie / na gotowo / całość, wzdłużnie / poprzecznie, zewnętrznie / wewnętrznie", "wybór G71, G72 albo G70"],
    ], caption: "Lista parametrów w starszej składni CYCLE95. Pełny zestaw i ich kolejność podaje instrukcja cykli danej wersji sterowania." },
    { t: "note", kind: "warn", x: "FALX w CYCLE95 jest w promieniu, a U w drugim bloku G71 — w średnicy. Naddatek 0,2 mm na stronę to `U0.4` na Fanucu i FALX = 0,2 na Sinumeriku." },

    { t: "h", x: "Kontur jako podprogram", id: "kontur" },
    { t: "code", x: "; KONTUR.SPF\nG1 X14 Z2\nX20 Z-1\nZ-20\nX28\nX30 Z-21\nZ-39\nG2 X32 Z-40 CR=1\nG1 X35\nG3 X36 Z-40.5 CR=0.5\nG1 Z-55\nX42\nRET", caption: "Ten sam kontur co w bloku N10–N20 na Fanucu, w składni Siemensa: bez kropek, promień łuku przez CR=, koniec przez RET." },

    { t: "h", x: "Przeniesienie wałka", id: "przeniesienie" },
    { t: "ul", items: [
      "bloki N10–N20 → podprogram KONTUR.SPF (albo sekcja między etykietami),",
      "`G71 U2. R0.5` + `G71 P10 Q20 U0.4 W0.1 F0.3` → CYCLE95 z MID = 2, FALX = 0,2, FALZ = 0,1, FF1 = 0,3, VARI = obróbka zgrubna wzdłużna zewnętrzna,",
      "`G70 P10 Q20` → drugie wywołanie CYCLE95 z VARI = wykańczanie, po zmianie narzędzia,",
      "`G50 S3000` → `LIMS=3000`, `T0101` → `T1 D1`.",
    ] },
  ],

  worked: {
    title: "Zamiana naddatków",
    intro: "Program Fanuca: `G71 P10 Q20 U0.4 W0.1 F0.3`. Jakie wartości trafią do cyklu Sinumerika?",
    steps: [
      { x: "U0.4 to naddatek w średnicy — na stronę 0,2.", code: "FALX = 0.2" },
      { x: "W0.1 — naddatek w Z bez zmian.", code: "FALZ = 0.1" },
      { x: "F0.3 — posuw zgrubny.", code: "FF1 = 0.3" },
      { x: "Głębokość z pierwszego bloku G71 U2.", code: "MID = 2" },
    ],
    result: "Najczęstszy błąd przy przenoszeniu to FALX = 0,4 — dwa razy za duży naddatek, który nóż wykańczający musi zdjąć jednym przejściem.",
  },

  practice: [
    {
      kind: "drill",
      intro: "Symulator GCat pracuje w dialekcie Fanuca, więc zapis Sinumerika ćwiczysz na pytaniach.",
      questions: [
        { kind: "gap", q: "Fanuc: `U0.6` w drugim bloku G71. Wartość FALX:", template: "{0}", answers: [["0.3", "0,3"]], why: "0,6 w średnicy to 0,3 na stronę." },
        { kind: "choice", q: "Co zastępuje `G70 P10 Q20` na Sinumeriku?", options: ["drugie wywołanie cyklu z wykańczaniem w VARI", "M98 P10", "G70", "RET"], answer: 0, why: "Rodzaj obróbki wybiera parametr VARI." },
        { kind: "choice", q: "Jak zapisać promień łuku w języku Siemensa?", options: ["CR=1", "R1.", "I1", "K1"], answer: 0, why: "CR — circle radius." },
      ],
    },
  ],

  pitfalls: [
    { title: "FALX w średnicy", x: "U0.4 z Fanuca przepisane jako FALX = 0,4. Naddatek wychodzi dwa razy większy — nóż wykańczający dostaje 0,4 na stronę." },
    { title: "Kontur z kropkami i nawiasami", x: "Kontur skopiowany z Fanuca razem z komentarzami w nawiasach i `R1.` przy łukach. W języku Siemensa nawias nie jest komentarzem, a R nie jest promieniem łuku." },
    { title: "Nieaktualna składnia", x: "Przykład CYCLE95 z internetu dla starszej wersji sterowania uruchomiony na nowszej. Kolejność albo liczba parametrów się różni — cykl zgłasza alarm albo działa inaczej. Parametry wprowadzaj przez edytor cykli." },
  ],

  controllers: {
    rows: [
      ["Zgrubnie wzdłużnie", "`G71`", "`CYCLE95` / `CYCLE952`, VARI"],
      ["Zgrubnie poprzecznie", "`G72`", "ten sam cykl, VARI"],
      ["Wykończenie", "`G70`", "ten sam cykl, VARI"],
      ["Naddatek w X", "`U` — średnica", "FALX — promień"],
      ["Limit obrotów", "`G50 S…`", "`LIMS=…`"],
    ],
    note: "Na Sinumeriku jeden cykl pokrywa to, co na Fanucu robią trzy kody.",
  },

  quiz: [
    { kind: "choice", review: "T5.2", q: "Pierwszy blok konturu dla G72:", options: ["ruch tylko w Z", "ruch tylko w X", "łuk", "dowolny"], answer: 0, why: "W G71 — tylko w X." },
    { kind: "choice", q: "Który parametr CYCLE95 podaje nazwę konturu?", options: ["NPP", "MID", "VARI", "FF1"], answer: 0, why: "NPP — nazwa konturu." },
    { kind: "choice", q: "W czym podawany jest FALX?", options: ["w promieniu", "w średnicy", "w procentach", "w obrotach"], answer: 0, why: "Inaczej niż U w G71." },
    { kind: "choice", q: "Jak na Sinumeriku wybiera się między obróbką zgrubną a wykańczającą?", options: ["parametrem VARI", "kodem G70", "kodem G72", "nazwą konturu"], answer: 0, why: "Jeden cykl, różne warianty." },
    { kind: "choice", q: "Odpowiednik `G50 S3000` na Sinumeriku:", options: ["LIMS=3000", "G50 S3000", "G96 S3000", "MID=3000"], answer: 0, why: "Limit obrotów." },
  ],

  summary: [
    "Sinumerik: jeden cykl (CYCLE95 / CYCLE952) zamiast G71, G72 i G70.",
    "Kontur w podprogramie albo między etykietami. Rodzaj obróbki wybiera VARI.",
    "FALX w promieniu — U z Fanuca dziel przez dwa.",
    "Parametry wprowadzaj przez edytor cykli — składnia zależy od wersji.",
  ],

  sources: [
    { id: "sinumerik", where: "CYCLE95 i CYCLE952 — skrawanie wzdłuż konturu, parametry" },
    { id: "fanuc", where: "G71, G72, G70 — porównanie" },
  ],
};
