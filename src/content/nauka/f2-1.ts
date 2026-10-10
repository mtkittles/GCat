import type { LessonDoc } from "@/lib/lesson";

export const f2_1: LessonDoc = {
  id: "F2.1",
  slug: "f2-1-wymiana-narzedzia",
  title: "Wymiana narzędzia: T i M06",
  minutes: 11,
  goal: "Wywołasz narzędzie z magazynu, wymienisz je i przygotujesz następne, zanim będzie potrzebne.",

  theory: [
    { t: "h", x: "T wybiera, M06 wymienia", id: "t-m06" },
    { t: "p", x: "Adres **T** podaje numer narzędzia. Na centrum z magazynem samo `T2` każe tylko przygotować narzędzie nr 2: magazyn obraca się i ustawia je w pozycji wymiany. Dopiero [[M06]] zamienia narzędzie we wrzecionie z przygotowanym." },
    { t: "diagram", id: "f21-change" },
    { t: "code", x: "T1 M06      (WYMIANA NA T1)\nT2          (PRZYGOTUJ T2 W TRAKCIE PRACY T1)\n…           (OBROBKA NARZEDZIEM T1)\nM06         (WYMIANA NA T2 — BEZ CZEKANIA NA MAGAZYN)", caption: "Przygotowanie następnego narzędzia skraca przestój przy wymianie." },

    { t: "h", x: "Co maszyna robi przy M06", id: "przebieg" },
    { t: "p", x: "Wymianę wykonuje makro producenta. Zwykle: wrzeciono się zatrzymuje i ustawia w określonym położeniu kątowym, oś Z odjeżdża do pozycji wymiany, ramię zamienia narzędzia, chłodziwo się wyłącza. Po wymianie wrzeciono **stoi** — obroty trzeba włączyć od nowa (lekcja F2.2)." },
    { t: "note", kind: "warn", x: "Na starszych maszynach makro nie odjeżdża samo w Z. Wtedy przed `M06` program musi wysłać oś Z do punktu wymiany, np. `G91 G28 Z0.`. Sprawdź to w dokumentacji maszyny." },

    { t: "h", x: "Numer narzędzia i tabela", id: "tabela" },
    { t: "p", x: "Numer T wskazuje narzędzie w tabeli sterowania, gdzie zapisane są jego wymiary: długość i promień. Programista i operator muszą mieć ten sam spis narzędzi — wpisuje się go do nagłówka programu." },
    { t: "table", head: ["T", "Narzędzie", "Ø", "Rejestr długości"], rows: [
      ["`T1`", "frez walcowo-czołowy VHM, 4 ostrza", "10", "`H1`"],
      ["`T2`", "nawiertak 90°", "10", "`H2`"],
      ["`T3`", "wiertło VHM 140° (pod gwint M6)", "5", "`H3`"],
      ["`T4`", "gwintownik maszynowy M6×1", "6", "`H4`"],
      ["`T5`", "głowica do planowania, 5 płytek 45°", "63", "`H5`"],
    ], caption: "Spis narzędzi płytki, która powstaje w tej ścieżce. Numer rejestru długości zwykle równa się numerowi narzędzia — rejestry omawia lekcja F4.1." },
  ],

  worked: {
    title: "Program na dwa narzędzia",
    intro: "Sytuacja: płytkę najpierw obrabia frez T1, potem nawiertak T2. Maszyna ma magazyn z ramieniem wymiany: narzędzie z kolejnego gniazda może czekać w pozycji wymiany, zanim padnie M06. Magazyn ma się obrócić, zanim frez skończy. Numery kroków odpowiadają numerom na osi czasu.",
    fig: "f21-time",
    steps: [
      { x: "Krok 1: wymiana na frez.", code: "T1 M06" },
      { x: "Krok 2: zaraz po niej przygotowanie nawiertaka — magazyn obraca się, a frez w tym czasie skrawa.", code: "T2" },
      { x: "Krok 3: obróbka frezem, odjazd w Z, stop wrzeciona.", code: "… M05" },
      { x: "Krok 4: wymiana na przygotowane T2 i ponowne włączenie obrotów.", code: "M06 → S… M03" },
    ],
    result: "Zapis `M06` bez T wymienia na ostatnio przygotowane narzędzie. Wiele osób woli jednak pisać `T2 M06` przy każdej wymianie — program jest wtedy czytelny od razu. Czy T przygotowuje narzędzie z wyprzedzeniem, zależy od budowy magazynu — sprawdź instrukcję maszyny.",
  },

  practice: [
    {
      kind: "task", mode: "mill",
      intro: "Po frezowaniu program ma przejść na nawiertak T2. Dopisz wymianę narzędzia razem z tym, co musi jej towarzyszyć.",
      starter: "O1000 (PLYTKA)\nG21 G90 G94 G17\nG40 G49 G80\nG54\nT1 M06 (FREZ FI10)\nG43 H1 Z50.\nS2500 M03\nM08\nG00 X-20. Y10.\nG00 Z5.\nG01 Z-5. F150\nG01 X-5. F400\nG01 Y55.\nG00 Z50.\nM09\n(DOPISZ: STOP WRZECIONA, WYMIANA NA T2, KOREKCJA DLUGOSCI H2 Z DOJAZDEM NA Z50, OBROTY S1800 W PRAWO)\nG00 X12. Y10.\nG00 Z2.\nG01 Z-3. F100\nG00 Z50.\nM05\nM30",
      checks: [{"t":"require","codes":["T2","M06","H2","S1800","M03"]},{"t":"cut","reference":"G90\nG00 X-20. Y10.\nG00 Z5.\nG01 Z-5. F150\nG01 X-5. F400\nG01 Y55.\nG00 Z50.\nG00 X12. Y10.\nG00 Z2.\nG01 Z-3. F100\nG00 Z50.","tolerance":0.05}],
      hints: ["Kolejność: `M05` (wrzeciono stoi przy wymianie), `T2 M06`, `G43 H2 Z50.`, `S1800 M03`.","W kursie przyjęto, że numer H jest równy numerowi narzędzia — tu H2 dla T2. G43 użyje tego rejestru, który wskażesz."],
      solution: "O1000 (PLYTKA)\nG21 G90 G94 G17\nG40 G49 G80\nG54\nT1 M06 (FREZ FI10)\nG43 H1 Z50.\nS2500 M03\nM08\nG00 X-20. Y10.\nG00 Z5.\nG01 Z-5. F150\nG01 X-5. F400\nG01 Y55.\nG00 Z50.\nM09\nM05\nT2 M06 (NAWIERTAK)\nG43 H2 Z50.\nS1800 M03\nG00 X12. Y10.\nG00 Z2.\nG01 Z-3. F100\nG00 Z50.\nM05\nM30",
    },
    {
      kind: "drill",
      intro: "Wymiana i przygotowanie narzędzi.",
      questions: [
        { kind: "token", q: "Wskaż słowo, które **wykonuje** wymianę.", block: "N20 T3 M06", answer: 2, why: "T3 wybiera, M06 wymienia." },
        { kind: "gap", q: "Wywołaj narzędzie nr 5 z wymianą.", template: "T{0} M{1}", answers: [["5"], ["06", "6"]], why: "T5 M06." },
        { kind: "choice", q: "We wrzecionie jest T1. Program wykonuje blok `T4`. Czym skrawa maszyna w następnym bloku?", options: ["T4", "T1", "żadnym — alarm", "zależy od S"], answer: 1, why: "Samo T przygotowuje narzędzie w magazynie. Wymiany nie było." },
        { kind: "choice", q: "Na maszynie z przykładu ktoś usunął samotne `T2` po `T1 M06`, a po obróbce napisał `T2 M06`. Co się zmieni?", options: ["wymiana potrwa dłużej — magazyn obróci się dopiero przy M06", "do wrzeciona trafi T1", "alarm — brak przygotowania", "nic, czas ten sam"], answer: 0, why: "Bez wcześniejszego T magazyn szuka nawiertaka dopiero przy wymianie, a wrzeciono w tym czasie stoi. Program działa poprawnie, tylko wolniej." },
        { kind: "order", q: "Ułóż zmianę z T1 na T2.", items: ["S3000 M03", "M05", "T2 M06", "G00 Z5."], answer: [3, 1, 2, 0], why: "Odjazd, stop wrzeciona, wymiana, obroty dla nowego narzędzia." },
      ],
    },
  ],

  pitfalls: [
    { title: "T bez M06", danger: true, x: "`T2` zamiast `T2 M06`. Magazyn przygotował nawiertak, ale we wrzecionie dalej jest frez — program nawierca frezem z posuwami nawiertaka." },
    { title: "Numer z innej tabeli", danger: true, x: "Program pisany pod spis narzędzi, w którym T3 to wiertło Ø6,8, uruchomiony na maszynie, gdzie T3 to frez Ø20. Nagłówek z listą narzędzi pozwala to wychwycić przed startem." },
    { title: "Brak obrotów po wymianie", danger: true, x: "Po `M06` wrzeciono stoi. Ruch roboczy bez `M03` kończy się alarmem albo wejściem stojącego narzędzia w materiał." },
  ],

  controllers: {
    rows: [
      ["Wybór narzędzia", "`T1`", "`T1` albo nazwa: `T=\"FREZ_FI10\"`"],
      ["Wymiana", "`M06`", "`M6`"],
      ["Korekcja narzędzia", "osobno: `G43 H1` (F4.1)", "`D1` razem z narzędziem"],
      ["Przygotowanie następnego", "`T2` w trakcie obróbki", "`T2` w trakcie obróbki, zależnie od konfiguracji"],
    ],
    note: "Na Sinumeriku numer ostrza `D` włącza korekcję razem z narzędziem. Na Fanucu frezarskim korekcję długości włącza osobny kod `G43`.",
  },

  quiz: [
    { kind: "choice", review: "F1.5", q: "Które kody stoją w bloku startowym?", options: ["`G21 G90 G94 G17 G40 G49 G80`", "`T1 M06 S2500 M03`", "`G43 H1 Z50.`", "`M05 M30`"], answer: 0, why: "Blok startowy ustawia tryby i kasuje korekcje oraz cykle." },
    { kind: "choice", q: "Co robi samo `T2` na centrum z magazynem?", options: ["wymienia narzędzie na T2", "przygotowuje T2 w pozycji wymiany", "włącza korekcję T2", "nic"], answer: 1, why: "Wymianę wykonuje dopiero M06." },
    { kind: "token", q: "Wskaż słowo, które **wybiera** narzędzie.", block: "N40 M06 T7", answer: 2, why: "T7 wybiera narzędzie nr 7." },
    { kind: "choice", q: "W jakim stanie jest wrzeciono tuż po `M06`?", options: ["obraca się jak przed wymianą", "stoi", "obraca się w lewo", "zależy od T"], answer: 1, why: "Wymiana wymaga zatrzymanego wrzeciona." },
    { kind: "gap", q: "Wymień narzędzie na nr 12.", template: "T{0} M{1}", answers: [["12"], ["06", "6"]], why: "T12 M06." },
    { kind: "choice", q: "Po co przygotowywać następne narzędzie zaraz po wymianie?", options: ["żeby magazyn obracał się w trakcie obróbki i wymiana trwała krócej", "bo tak wymaga M06", "żeby włączyć korekcję", "bez powodu"], answer: 0, why: "Magazyn zdąży ustawić narzędzie, zanim będzie potrzebne." },
    { kind: "choice", q: "Gdzie operator sprawdza, jakie narzędzie kryje się pod T3?", options: ["w nagłówku programu i tabeli narzędzi", "w rejestrze G54", "w parametrze M06", "nigdzie"], answer: 0, why: "Numer T wskazuje pozycję w tabeli narzędzi." },
  ],

  summary: [
    "T wybiera i przygotowuje narzędzie, M06 je wymienia.",
    "Po M06 wrzeciono stoi — obroty trzeba włączyć ponownie.",
    "Przygotowanie następnego narzędzia w trakcie obróbki skraca wymianę.",
    "Spis narzędzi w nagłówku programu musi zgadzać się z tabelą maszyny.",
  ],

  sources: [
    { id: "fanuc", where: "funkcja T, M06, tabela korekcji narzędzi" },
    { id: "sinumerik", where: "wywołanie T i M6, ostrza D, zarządzanie narzędziami" },
  ],
};
