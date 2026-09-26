import type { LessonDoc } from "@/lib/lesson";

const starter = `O1002 (NAWIERCENIE)
G21 G90 G17
G40 G49 G80
G54
T2 M06 (NAWIERTAK 90ST)
S1500 M03
M08
G00 X20. Y25. Z50.
G00 Z5.
(DOPISZ: G01 Z-2. F80, POSTOJ 0,5 S, ODJAZD G00 Z5.)

M09
M05
M30`;

export const f3_5: LessonDoc = {
  id: "F3.5",
  slug: "f3-5-g04-postoj",
  title: "G04 — postój",
  minutes: 8,
  goal: "Zatrzymasz ruch osi na zadany czas i będziesz wiedzieć, gdzie postój pomaga, a gdzie szkodzi.",

  theory: [
    { t: "h", x: "Czekanie w miejscu", id: "postoj" },
    { t: "p", x: "[[G04]] zatrzymuje ruch osi na podany czas. Wrzeciono i chłodziwo pracują dalej. Kod jest jednorazowy — działa tylko w swoim bloku (lekcja F1.2)." },
    { t: "code", x: "G04 X0.5    (0,5 s — X z kropką to sekundy)\nG04 P500    (500 ms — P bez kropki)", caption: "Na Fanucu X albo P. Przy X bez kropki wartość zależy od parametru, tak jak przy wymiarach (lekcja F1.1)." },
    { t: "diagram", id: "g04" },

    { t: "h", x: "Do czego służy", id: "zastosowania" },
    { t: "ul", items: [
      "**Dno nawiercenia, pogłębienia, wytoczenia** — kilka obrotów w miejscu wyrównuje powierzchnię dna.",
      "**Łamanie wióra** przy wierceniu bez cyklu — krótkie zatrzymanie przerywa ciągły wiór.",
      "**Czekanie na maszynę** — na starszych obrabiarkach po M03 albo M08, żeby wrzeciono osiągnęło obroty, a chłodziwo doszło do ostrza.",
    ] },
    { t: "demo", mode: "mill", title: "Nawiercenie z postojem na dnie", src: "G21 G90 G17 G54\nG00 X20. Y25. Z50.\nG00 Z5.\nG01 Z-2. F80\nG04 X0.5\nG00 Z5.\nM30", caption: "Symulator zaznacza postój pierścieniem i odlicza czas." },

    { t: "h", x: "Ile czekać", id: "ile" },
    { t: "p", x: "Na dnie wystarczą 2–3 obroty wrzeciona. Przy S1500 jeden obrót trwa 60 / 1500 = 0,04 s, więc trzy obroty to około 0,12 s. Dłuższy postój nie poprawia dna, tylko grzeje ostrze i materiał." },
    { t: "note", kind: "warn", x: "Postój z narzędziem opartym o ścianę konturu zostawia na niej ślad — przyciemnienie albo wgłębienie. Na konturze G04 nie stosuje się." },
  ],

  worked: {
    title: "Postój na trzy obroty",
    intro: "Nawiertak, S1500, dno nawiercenia ma być gładkie. Postój liczony w obrotach wrzeciona.",
    steps: [
      { x: "Czas jednego obrotu: 60 s / 1500 obr.", code: "0,04 s" },
      { x: "Trzy obroty: 3 · 0,04.", code: "0,12 s" },
      { x: "Zaokrąglenie w górę do pełnej dziesiątej.", code: "G04 X0.2" },
      { x: "Wersja w milisekundach.", code: "G04 P200" },
    ],
    result: "`G04 X0.2` po `G01 Z-2. F80`, potem odjazd `G00 Z5.`. W cyklach wiercenia ten sam postój podaje się adresem P w bloku cyklu (moduł F5).",
  },

  practice: [
    {
      kind: "task",
      intro: "Dopisz nawiercenie z postojem na dnie i odjazdem. Sprawdzany jest tor, użycie G04 i położenie końcowe.",
      starter,
      checks: [
        { t: "cut", reference: "G90\nG00 X20. Y25.\nG00 Z5.\nG01 Z-2. F80\nG00 Z5.", tolerance: 0.05 },
        { t: "require", codes: ["G04"] },
        { t: "end", x: 20, y: 25, z: 5, label: "Narzędzie kończy nad otworem na Z5" },
      ],
      hints: ["Trzy bloki: G01 Z-2. F80, G04 X0.5, G00 Z5."],
      solution: starter.replace("(DOPISZ: G01 Z-2. F80, POSTOJ 0,5 S, ODJAZD G00 Z5.)\n", "G01 Z-2. F80\nG04 X0.5\nG00 Z5."),
    },
  ],

  pitfalls: [
    { title: "P z kropką albo X bez kropki", x: "`G04 P0.5` albo `G04 X500` na Fanucu z najmniejszym przyrostem wejściowym — czas zupełnie inny niż zamierzony. Zapamiętaj: X z kropką w sekundach, P bez kropki w milisekundach." },
    { title: "Postój na konturze", x: "`G04` wpisane w narożu konturu, żeby „wyrównać” łuk. Frez oparty o ścianę wypala na niej ślad." },
    { title: "Za długo na dnie", x: "Kilka sekund postoju w stali nierdzewnej umacnia materiał na dnie — następne narzędzie wchodzi w warstwę twardszą niż rdzeń." },
  ],

  controllers: {
    rows: [
      ["Postój w sekundach", "`G04 X0.5`", "`G4 F0.5`"],
      ["Postój w milisekundach", "`G04 P500`", "—"],
      ["Postój w obrotach wrzeciona", "—", "`G4 S3`"],
    ],
    note: "Uwaga na adres F w Sinumeriku: w bloku `G4` oznacza czas postoju, a nie posuw. Posuw modalny nie zmienia się.",
  },

  quiz: [
    { kind: "gap", review: "F3.4", q: "Start X50 Y25, środek X40 Y25. Podaj I.", template: "I{0}", answers: [["-10"]], why: "40 − 50 = −10." },
    { kind: "choice", q: "Co robi `G04 X1.`?", options: ["postój 1 s", "ruch do X1", "postój 1 obrót", "zmianę osi X"], answer: 0, why: "Z kropką X w bloku G04 to sekundy." },
    { kind: "choice", q: "Czy `G04` jest modalne?", options: ["nie, działa tylko w swoim bloku", "tak, do G00", "tak, do końca programu", "zależy od P"], answer: 0, why: "Postój jest jednorazowy." },
    { kind: "gap", q: "S2000. Ile sekund trwają 4 obroty?", template: "{0} s", answers: [["0.12", "0,12"]], why: "60 / 2000 = 0,03 s na obrót, razy 4." },
    { kind: "choice", q: "Gdzie postój G04 szkodzi?", options: ["na ścianie konturu", "na dnie nawiercenia", "przy łamaniu wióra", "po M08 na starszej maszynie"], answer: 0, why: "Frez oparty o ścianę zostawia ślad." },
    { kind: "token", q: "Tapnij zapis postoju **500 ms**.", block: "G04 X500 | G04 P500 | G04 X5.", answer: 1, why: "P bez kropki — milisekundy." },
  ],

  summary: [
    "G04 zatrzymuje osie, wrzeciono pracuje dalej. Działa tylko w swoim bloku.",
    "Fanuc: X z kropką w sekundach, P w milisekundach.",
    "Na dnie wystarczą 2–3 obroty wrzeciona.",
    "Na ścianie konturu postoju nie stosuje się.",
  ],

  sources: [
    { id: "fanuc", where: "G04, adresy X, U i P" },
    { id: "sinumerik", where: "G4 z F i S" },
  ],
};
