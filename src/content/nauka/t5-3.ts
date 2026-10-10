import type { LessonDoc } from "@/lib/lesson";

export const t5_3: LessonDoc = {
  id: "T5.3",
  slug: "t5-3-cycle95-sinumerik",
  title: "CYCLE95 w Sinumeriku",
  dialect: "sinumerik",
  minutes: 12,
  goal: "Przeniesiesz obróbkę wałka z G71/G70 na cykl Sinumerika i rozpoznasz jego główne parametry.",

  theory: [
    { t: "h", x: "Jeden cykl, kilka rodzajów obróbki", id: "cycle95" },
    { t: "p", x: "W natywnym języku Siemensa nie ma osobnych kodów G71, G72 i G70 (w trybie ISO SINUMERIK je rozumie — dokumentacja ISO Turning, zależnie od wersji). Obróbkę skrawaniem wzdłuż konturu wykonuje jeden cykl — w klasycznej postaci `CYCLE95`, w nowszych wersjach sterowania `CYCLE952`, zwykle generowany w edytorze cykli. Kontur leży w podprogramie albo między etykietami w programie." },
    { t: "diagram", id: "t53-cycle95" },
    { t: "table", head: ["Parametr", "Znaczenie", "Odpowiednik w G71"], rows: [
      ["NPP", "nazwa konturu (podprogram lub etykiety)", "`P… Q…`"],
      ["MID", "maksymalna głębokość skrawania", "`U` w pierwszym bloku"],
      ["FALZ, FALX", "naddatki w osi wzdłużnej Z i poprzecznej X", "`W`, `U` w drugim bloku"],
      ["FAL", "naddatek wzdłuż konturu", "—"],
      ["FF1, FF2, FF3", "posuwy: zgrubny, wcinania, wykańczający", "`F` w G71 i w konturze"],
      ["VARI", "rodzaj obróbki (1–12): zgrubnie / na gotowo / całość, wzdłużnie / poprzecznie, zewnętrznie / wewnętrznie", "wybór G71, G72 albo G70"],
      ["DT, DAM", "postój i długość drogi do łamania wióra", "—"],
      ["_VRT", "odsunięcie od konturu przy obróbce zgrubnej", "`R` w pierwszym bloku"],
    ], caption: "Starsza składnia według SINUMERIK 840D/810D Programming Guide Cycles, wydanie 04/2000, rozdz. 4, podrozdział o CYCLE95:(NPP, MID, FALZ, FALX, FAL, FF1, FF2, FF3, VARI, DT, DAM, _VRT). Nowsze wydania dla 840D sl dodają parametry _GMODE i _DMODE. Pełny zestaw i kolejność sprawdź w instrukcji cykli swojej wersji." },
    { t: "note", kind: "warn", x: "U w drugim bloku G71 jest w średnicy. Czy FALX podaje się w promieniu, czy w średnicy, zależy od wersji i ustawień cyklu — sprawdź w instrukcji cykli swojego sterowania. W przykładach tej lekcji przyjmujemy promień: naddatek 0,2 mm na stronę to `U0.4` na Fanucu i FALX = 0,2 na Sinumeriku." },

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
    intro: "Sytuacja: program wałka z Fanuca trzeba przenieść na Sinumerik. Zgrubnie robi `G71 U2. R0.5` i `G71 P10 Q20 U0.4 W0.1 F0.3`. Jakie wartości trafią do CYCLE95? Przyjmujemy wersję cyklu, w której FALX podaje się w promieniu. Numery na rysunku to numery kroków.",
    fig: "t53-map",
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
        { kind: "gap", q: "Na Fanucu w drugim bloku G71 jest `U0.6`. Cykl CYCLE95 przyjmuje naddatek w promieniu. Jaką wartość wpiszesz w FALX?", template: "{0}", answers: [["0.3", "0,3"]], why: "0,6 w średnicy to 0,3 na stronę." },
        { kind: "gap", q: "W przykładzie FALX przepisano wprost: FALX = 0,4. Ile milimetrów na stronę dostanie nóż wykańczający?", template: "{0} mm", answers: [["0,4", "0.4"]], why: "Cykl czyta FALX w promieniu, więc zostawia 0,4 na stronę — dwa razy więcej niż 0,2 z programu Fanuca." },
        { kind: "choice", q: "Co zastępuje `G70 P10 Q20` w natywnym języku Siemensa (SINUMERIK)?", options: ["drugie wywołanie cyklu z wykańczaniem w VARI", "M98 P10", "G70", "RET"], answer: 0, why: "Rodzaj obróbki wybiera parametr VARI." },
        { kind: "choice", q: "Jak zapisać promień łuku w języku Siemensa?", options: ["CR=1", "R1.", "I1", "K1"], answer: 0, why: "CR — circle radius." },
      ],
    },
  ],

  pitfalls: [
    { title: "Promień pomylony ze średnicą", x: "U0.4 z Fanuca przepisane jako FALX = 0,4 w cyklu, który przyjmuje naddatek w promieniu. Naddatek wychodzi dwa razy większy — nóż wykańczający dostaje 0,4 na stronę." },
    { title: "Kontur z kropkami i nawiasami", x: "Kontur skopiowany z Fanuca razem z komentarzami w nawiasach i `R1.` przy łukach. W języku Siemensa nawias nie jest komentarzem, a R nie jest promieniem łuku." },
    { title: "Nieaktualna składnia", x: "Przykład CYCLE95 z internetu dla starszej wersji sterowania uruchomiony na nowszej. Kolejność albo liczba parametrów się różni — cykl zgłasza alarm albo działa inaczej. Parametry wprowadzaj przez edytor cykli." },
  ],

  controllers: {
    rows: [
      ["Zgrubnie wzdłużnie", "`G71`", "`CYCLE95` / `CYCLE952`, VARI"],
      ["Zgrubnie poprzecznie", "`G72`", "ten sam cykl, VARI"],
      ["Wykończenie", "`G70`", "ten sam cykl, VARI"],
      ["Naddatek w X", "`U` — średnica", "FALX — promień albo średnica według instrukcji cyklu"],
      ["Limit obrotów", "`G50 S…`", "`LIMS=…`"],
    ],
    note: "W natywnym języku Siemensa jeden cykl pokrywa to, co na Fanucu robią trzy kody.",
  },

  quiz: [
    { kind: "choice", review: "T5.2", q: "Jaki ruch ma pierwszy blok konturu dla G72?", options: ["ruch tylko w Z", "ruch tylko w X", "łuk", "dowolny"], answer: 0, why: "W G71 — tylko w X." },
    { kind: "choice", q: "Który parametr CYCLE95 podaje nazwę konturu?", options: ["NPP", "MID", "VARI", "FF1"], answer: 0, why: "NPP — nazwa konturu." },
    { kind: "choice", q: "Skąd wiesz, czy FALX w twoim sterowaniu jest w promieniu, czy w średnicy?", options: ["z instrukcji cykli dla tej wersji sterowania", "zawsze w promieniu", "zawsze w średnicy", "z G71 na Fanucu"], answer: 0, why: "To zależy od wersji i ustawień cyklu. U w drugim bloku G71 jest w średnicy." },
    { kind: "choice", q: "Jak w cyklu CYCLE95 (SINUMERIK, język natywny) wybiera się między obróbką zgrubną a wykańczającą?", options: ["parametrem VARI", "kodem G70", "kodem G72", "nazwą konturu"], answer: 0, why: "Jeden cykl, różne warianty." },
    { kind: "choice", q: "Czym w natywnym języku Siemensa (SINUMERIK) zastąpisz `G50 S3000`?", options: ["LIMS=3000", "G50 S3000", "G96 S3000", "MID=3000"], answer: 0, why: "Limit obrotów." },
  ],

  summary: [
    "Sinumerik: jeden cykl (CYCLE95 / CYCLE952) zamiast G71, G72 i G70.",
    "Kontur w podprogramie albo między etykietami. Rodzaj obróbki wybiera VARI.",
    "U z Fanuca jest w średnicy. Jednostkę FALX sprawdź w instrukcji cyklu — przy promieniu dziel przez dwa.",
    "Parametry wprowadzaj przez edytor cykli — składnia zależy od wersji.",
  ],

  sources: [
    { id: "sinumerik", where: "Programming Guide Cycles 840D/810D, wyd. 04.00, rozdz. 4.5 CYCLE95, s. 4-227 — składnia i parametry; nowsze wydania 840D sl — CYCLE95 z _GMODE i _DMODE, CYCLE952" },
    { id: "fanuc", where: "G71, G72, G70 — porównanie" },
    { id: "sinumerik-iso-t", where: "rozdz. 4.1.2, s. 79–85: G70–G76 w trybie ISO" },
  ],
};
