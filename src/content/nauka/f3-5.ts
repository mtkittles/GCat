import type { LessonDoc } from "@/lib/lesson";

const starter = `O1002 (NAWIERCENIE)
G21 G90 G94 G17
G40 G49 G80
G54
T2 M06 (NAWIERTAK 90ST)
G00 G43 H2 Z50.
S1500 M03
M08
G00 X20. Y25.
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
    { t: "diagram", id: "f35-dwell" },
    { t: "more", title: "Porównanie z toczeniem rowka", blocks: [{ t: "diagram", id: "g04" }] },

    { t: "h", x: "Do czego służy", id: "zastosowania" },
    { t: "ul", items: [
      "**Dno nawiercenia, pogłębienia lub wytoczenia** — postój może pomagać w uzyskaniu wymaganej powierzchni; jego czas dobiera się do operacji i narzędzia.",
      "**Przerwanie posuwu przy wierceniu** — może pomagać w łamaniu wióra, lecz samo zatrzymanie nie gwarantuje jego przerwania w każdym materiale.",
      "**Oczekiwanie po M03 lub M08** — tylko jeśli wymaga tego procedura konkretnej maszyny. G04 odmierza czas, ale nie potwierdza osiągnięcia obrotów ani dopływu chłodziwa.",
    ] },
    { t: "demo", mode: "mill", title: "Nawiercenie z postojem na dnie", src: "G21 G90 G94 G17 G54\nG00 Z50.\nG00 X20. Y25.\nG00 Z5.\nG01 Z-2. F80\nG04 X0.5\nG00 Z5.\nM30", caption: "Symulator zaznacza postój pierścieniem i odlicza czas." },

    { t: "h", x: "Ile czekać", id: "ile" },
    { t: "p", x: "W przykładzie wymagamy co najmniej trzech obrotów na dnie. Przy S1500 jeden obrót trwa 60 / 1500 = 0,04 s, więc trzy obroty to 0,12 s. Przyjmujemy 0,2 s, czyli pięć obrotów. To warunek dydaktyczny, nie uniwersalne zalecenie technologiczne. Niepotrzebne wydłużanie postoju może zwiększać nagrzewanie i pozostawiać ślady." },
    { t: "note", kind: "warn", x: "Postój freza stykającego się ze ścianą konturu może pozostawić ślad miejscowej obróbki. Nie dodawaj go w celu „poprawienia” łuku bez uzasadnienia technologicznego — poprawna geometria łuku nie wymaga postoju." },
  ],

  worked: {
    title: "Postój na trzy obroty",
    intro: "Sytuacja: nawiertak przy S1500 schodzi na Z−2. Dno nawiercenia ma być gładkie, więc narzędzie ma na dnie wykonać co najmniej trzy pełne obroty bez posuwu. Rysunek pokazuje Z w czasie: wejście, postój i wyjście.",
    data: [
      ["Profil", "Fanuc 0i-F; G21, G90, G94, G17, G54; G43 H2"],
      ["Narzędzie i pozycja", "nawiertak T2, S1500 M03; X20 Y25; Z0 na górze przedmiotu"],
      ["Wejście", "z Z5 do Z−2 z F80; chłodziwo włączone"],
      ["Postój przykładu", "minimum 3 obroty: 0,12 s; przyjęto 0,2 s = 5 obrotów"],
      ["Zadanie poniżej", "co najmniej 0,5 s na dnie — osobny warunek zadania, nie czas trzech obrotów"],
    ],
    fig: "f35-dwell",
    steps: [
      { x: "Czas jednego obrotu: 60 s / 1500 obr.", code: "0,04 s" },
      { x: "Trzy obroty: 3 · 0,04.", code: "0,12 s" },
      { x: "Zaokrąglenie w górę do pełnej dziesiątej — na rysunku to 5 obrotów.", code: "G04 X0.2" },
      { x: "Wersja w milisekundach.", code: "G04 P200" },
    ],
    result: "`G04 X0.2` po `G01 Z-2. F80`, potem odjazd `G00 Z5.`. W cyklach wiercenia ten sam postój podaje się adresem P w bloku cyklu (moduł F5).",
  },

  practice: [
    {
      kind: "task",
      intro: "Dopisz nawiercenie z postojem na dnie i odjazdem. Sprawdzany jest tor, postój co najmniej 0,5 s na dnie (Z−2) i położenie końcowe. 0,5 s to warunek tego zadania — dłużej niż minimum trzech obrotów z przykładu (0,12 s).",
      starter,
      checks: [
        { t: "cut", reference: "G90\nG00 X20. Y25.\nG00 Z5.\nG01 Z-2. F80\nG00 Z5.", tolerance: 0.05 },
        { t: "dwell", x: 20, y: 25, z: -2, min: 0.5, label: "Postój co najmniej 0,5 s na dnie, w X20 Y25 Z−2" },
        { t: "end", x: 20, y: 25, z: 5, label: "Narzędzie kończy nad otworem na Z5" },
      ],
      hints: ["Trzy bloki: G01 Z-2. F80, G04 X0.5, G00 Z5."],
      solution: starter.replace("(DOPISZ: G01 Z-2. F80, POSTOJ 0,5 S, ODJAZD G00 Z5.)\n", "G01 Z-2. F80\nG04 X0.5\nG00 Z5."),
    },
    {
      kind: "drill",
      intro: "Przewidź skutek zmiany obrotów.",
      questions: [
        { kind: "gap", q: "Ten sam program z `G04 X0.2` uruchomiono przy S3000 zamiast S1500. Ile pełnych obrotów wykona nawiertak na dnie?", template: "{0} obrotów", answers: [["10"]], why: "Jeden obrót przy S3000 trwa 60 / 3000 = 0,02 s, więc 0,2 s to 10 obrotów. Postój w sekundach nie zmienia się z obrotami — liczba obrotów tak." },
      ],
    },
  ],

  pitfalls: [
    { title: "P z kropką albo X bez kropki", x: "`G04 P0.5` albo `G04 X500` na Fanucu z najmniejszym przyrostem wejściowym — czas zupełnie inny niż zamierzony. Zapamiętaj: X z kropką w sekundach, P bez kropki w milisekundach." },
    { title: "Postój na konturze", x: "`G04` w narożu nie koryguje błędnego promienia ani środka łuku. Frez pozostający przy ścianie może zostawić ślad; usuń nieuzasadniony postój i sprawdź geometrię." },
    { title: "Za długo na dnie", x: "Nie wydłużaj postoju bez potrzeby. Może zwiększyć nagrzewanie, tarcie i zużycie ostrza. Dopuszczalny czas ustala się dla konkretnego materiału, narzędzia i wymaganej powierzchni." },
  ],

  controllers: {
    rows: [
      ["Postój w sekundach", "`G04 X0.5`", "`G4 F0.5`"],
      ["Postój w milisekundach", "`G04 P500`", "—"],
      ["Postój w obrotach wrzeciona", "zależny od G95 i parametru 3405#1 DWL; kurs używa G94 i czasu", "`G4 S3`"],
    ],
    note: "Uwaga na adres F w Sinumeriku: w bloku `G4` oznacza czas postoju, a nie posuw. Posuw modalny nie zmienia się.",
  },

  quiz: [
    { kind: "gap", review: "F3.4", q: "Start X50 Y25, środek X40 Y25. Podaj I.", template: "I{0}", answers: [["-10"]], why: "40 − 50 = −10." },
    { kind: "choice", q: "Co robi `G04 X1.`?", options: ["postój 1 s", "ruch do X1", "postój 1 obrót", "zmianę osi X"], answer: 0, why: "Z kropką X w bloku G04 to sekundy." },
    { kind: "choice", q: "Czy `G04` jest modalne?", options: ["nie, działa tylko w swoim bloku", "tak, do G00", "tak, do końca programu", "zależy od P"], answer: 0, why: "Postój jest jednorazowy." },
    { kind: "gap", q: "S2000. Ile sekund trwają 4 obroty?", template: "{0} s", answers: [["0.12", "0,12"]], why: "60 / 2000 = 0,03 s na obrót, razy 4." },
    { kind: "choice", q: "Gdzie nieuzasadniony postój może zostawić ślad na powierzchni bocznej?", options: ["na ścianie konturu", "na dnie nawiercenia", "przy łamaniu wióra", "po M08 przed dojazdem"], answer: 0, why: "Frez pozostaje przy ścianie i obrabia miejscowo tę samą powierzchnię. Postój nie naprawia błędnej geometrii łuku." },
    { kind: "token", q: "Wskaż zapis postoju **500 ms**.", block: "G04 X500 | G04 P500 | G04 X5.", answer: 1, why: "P bez kropki — milisekundy." },
  ],

  summary: [
    "G04 zatrzymuje osie, wrzeciono pracuje dalej. Działa tylko w swoim bloku.",
    "Fanuc: X z kropką w sekundach, P w milisekundach.",
    "Czas dobierasz do operacji. W przykładzie 0,2 s przy S1500 daje pięć obrotów; zadanie osobno wymaga co najmniej 0,5 s.",
    "Nieuzasadniony postój przy ścianie konturu może pozostawić ślad i nie poprawia geometrii łuku.",
  ],

  sources: [
    { id: "fanuc", where: "G04, adresy X i P", loc: "rozdz. 3.1, tab. 3.1, s. 71; rozdz. 4, s. 79; parametr 3405#1 DWL — rozdz. 7.2.16, s. 201" },
    { id: "sinumerik", where: "G4 z F i S" },
  ],
};
