import type { LessonDoc } from "@/lib/lesson";

export const f5_4: LessonDoc = {
  id: "F5.4",
  slug: "f5-4-g98-g99-g80",
  title: "G98, G99 i G80",
  minutes: 12,
  goal: "Wybierzesz wysokość powrotu między otworami, ominiesz dociski i bezpiecznie zakończysz cykl.",

  theory: [
    { t: "h", x: "Dwie wysokości powrotu", id: "powrot" },
    { t: "p", x: "Po każdym otworze cykl wraca w górę. [[G98]] — do **poziomu początkowego**, czyli Z sprzed cyklu. [[G99]] — tylko do **płaszczyzny R**. Kody są modalne i można je zmieniać między otworami w trakcie cyklu." },
    { t: "diagram", id: "g98-g99" },
    { t: "diagram", id: "f54-levels" },

    { t: "h", x: "Kiedy który", id: "wybor" },
    { t: "ul", items: [
      "**G99** — między otworami na płaskiej powierzchni, bez przeszkód. Krótsza droga, krótszy czas.",
      "**G98** — przed przejazdem nad dociskiem, szczęką, wyższą częścią detalu. Także na ostatnim otworze, jeśli potem narzędzie jedzie daleko.",
      "Poziom początkowy ustawia ostatni ruch w Z przed cyklem. Zbyt wysoki wydłuża każdy powrót G98 — lepiej zjechać np. na Z10 tuż przed cyklem.",
    ] },
    { t: "code", x: "G00 Z30.                        (POZIOM POCZATKOWY NAD DOCISKIEM)\nG99 G81 X15. Y20. Z-7. R2. F120 (POWROT DO R2)\nG98 X45.                        (PO TYM OTWORZE DO Z30)\nG99 X75.\nG80", caption: "Otwór przed dociskiem wiercony z G98 — przejazd nad dociskiem idzie na Z30." },

    { t: "h", x: "Czas cyklu", id: "czas" },
    { t: "p", x: "Płytka: cztery otwory, R2, poziom początkowy Z50. Z G98 każdy przejazd między otworami to dodatkowe 2 × 48 = 96 mm ruchu szybkiego w Z — w górę do Z50 i z powrotem do R2. Cztery otwory to trzy przejazdy, czyli 288 mm na operację, a przy trzech operacjach (nawiercanie, wiercenie, gwintowanie) 864 mm na każdej sztuce. W programie płytki nic nie wystaje nad detal, więc wszystkie cykle dostają G99." },

    { t: "h", x: "G80 i koniec cyklu", id: "g80" },
    { t: "p", x: "[[G80]] kasuje cykl. Na Fanucu robią to też kody ruchu G00–G03, ale jawne G80 po ostatnim otworze to zasada: program jest czytelny, a następny blok na pewno nie wierci. Blok startowy z lekcji F1.5 zawiera G80 na wypadek cyklu zostawionego przez inny program." },
  ],

  worked: {
    title: "Trzy otwory i docisk",
    intro: "Sytuacja: trzy otwory w X15, X45 i X75 w jednej linii, Y20, R2, dno Z−7. Między X45 a X75 stoi docisk wysoki na 25 mm nad detalem. Między X15 a X45 nic nie wystaje. Numery kroków odpowiadają numerom na rysunku.",
    fig: "f54-run",
    steps: [
      { x: "Krok 1: nad pierwszym otworem narzędzie stoi na Z30 — 5 mm nad dociskiem. Ta wysokość, ostatnie Z przed cyklem, staje się poziomem początkowym dla G98.", code: "G00 Z30." },
      { x: "Krok 2: otwór X15 z G99. Do następnego otworu nie ma przeszkody, więc wystarczy powrót do R2 i przejazd tuż nad detalem.", code: "G99 G81 X15. Y20. Z-7. R2. F120" },
      { x: "Krok 3: otwór X45 z G98. Po nim jest przejazd nad dociskiem, więc narzędzie wraca na Z30 i dopiero na tej wysokości jedzie do X75.", code: "G98 X45." },
      { x: "Krok 4: otwór X75 z G99. G98 z poprzedniego bloku jest modalne — bez jawnego G99 narzędzie po trzecim otworze też wróciłoby na Z30.", code: "G99 X75." },
      { x: "Krok 5: koniec cyklu.", code: "G80" },
    ],
    result: "Tylko jeden powrót na Z30 — po drugim otworze, przed przejazdem nad dociskiem. Po pierwszym i trzecim otworze narzędzie wraca do R2. O wysokości powrotu decyduje kod aktywny w bloku danego otworu, a o wysokości G98 — Z, z którego cykl wystartował.",
  },

  practice: [
    {
      kind: "task", mode: "mill",
      intro: "Trzy otwory z przykładu rozwiązanego: X15, X45, X75 w Y20, R2, dno Z−7. Między X45 a X75 stoi docisk. Dopisz cykl z właściwymi poziomami powrotu.",
      starter: "O1000 (PLYTKA)\nG21 G90 G94 G17\nG40 G49 G80\nG54\nT2 M06 (WIERTLO FI6)\nG43 H2 Z30.\nS1500 M03\nM08\nG00 X15. Y20.\n(DOPISZ CYKL G81 NA TRZY OTWORY: PO PIERWSZYM POWROT DO R, PO DRUGIM DO POZIOMU POCZATKOWEGO (DOCISK), POTEM TRZECI Z POWROTEM DO R I KASOWANIE CYKLU; F120)\nG00 Z50.\nM09\nM05\nM30",
      checks: [{"t":"require","codes":["G81","G98","G99","G80"]},{"t":"rapidAbove","x0":45,"x1":75,"z":25,"label":"Przejazd nad dociskiem (między X45 a X75) wyżej niż Z25"},{"t":"cut","reference":"G90\nG00 X15. Y20. Z30.\nG99 G81 X15. Y20. Z-7. R2. F120\nG98 X45.\nG99 X75.\nG80\nG00 Z50.","tolerance":0.05}],
      hints: ["Pierwszy otwór: `G99 G81 X15. Y20. Z-7. R2. F120` — do następnego nie ma przeszkody.","Drugi otwór z `G98 X45.`, bo po nim przejazd nad dociskiem; trzeci `G99 X75.` — bez G99 zostałoby aktywne G98; na końcu `G80`."],
      solution: "O1000 (PLYTKA)\nG21 G90 G94 G17\nG40 G49 G80\nG54\nT2 M06 (WIERTLO FI6)\nG43 H2 Z30.\nS1500 M03\nM08\nG00 X15. Y20.\nG99 G81 X15. Y20. Z-7. R2. F120\nG98 X45.\nG99 X75.\nG80\nG00 Z50.\nM09\nM05\nM30",
    },
    {
      kind: "drill",
      intro: "Wysokości powrotu i kasowanie cyklu.",
      questions: [
    {"kind":"bughunt","q":"Między otworem 2 a 3 stoi docisk wysoki na 25 mm. Który blok jest niebezpieczny?","program":"G00 X15. Y20. Z30.\nG99 G81 X15. Y20. Z-7. R2. F120\nG99 X45.\nX75.\nG80","answer":2,"why":"Po otworze 2 powrót do R (2 mm nad detalem) i przejazd do X75 uderzy w docisk. Tu potrzebny G98 — powrót do poziomu początkowego Z30."},

        { kind: "choice", q: "W przykładzie ktoś zmienił pierwszy blok na `G00 Z20.`, a resztę zostawił bez zmian. Co się stanie przy przejeździe z X45 do X75?", options: ["narzędzie uderzy w docisk — G98 wraca tylko na Z20", "G98 podniesie narzędzie na Z30 jak wcześniej", "G98 podniesie narzędzie nad najwyższy punkt mocowania", "nic — R2 jest powyżej detalu"], answer: 0, why: "G98 wraca do poziomu początkowego, czyli Z sprzed cyklu — tu Z20. Docisk ma 25 mm, więc przejazd na Z20 trafia w niego. Cykl nie omija docisku sam — wysokość przejazdu wynika tylko z programu." },
        { kind: "choice", q: "Cztery otwory na płaskiej płycie, nic nie wystaje. Który kod powrotu?", options: ["G99", "G98", "bez znaczenia", "G80"], answer: 0, why: "G99 skraca drogę — nie ma nad czym przeskakiwać." },
        { kind: "choice", q: "Po którym otworze trzeba wrócić wyżej, jeśli docisk stoi między otworem 2 a 3?", options: ["po otworze 2", "po otworze 3", "po otworze 1", "po każdym"], answer: 0, why: "Wysokość powrotu po otworze 2 decyduje o przejeździe nad dociskiem." },
        { kind: "gap", q: "Poziom początkowy Z40, R3, 6 otworów. W obu wariantach narzędzie startuje z Z40 i po ostatnim otworze wraca na Z40. O ile milimetrów dłuższa jest droga w Z z G98 niż z G99?", template: "{0} mm", answers: [["370"]], why: "Różnica powstaje tylko na przejazdach między otworami: z G98 narzędzie wraca z R3 na Z40 i zjeżdża z powrotem, czyli 2 × 37 = 74 mm więcej. Przejazdów między 6 otworami jest 5: 5 × 74 = 370 mm. Start i koniec są w obu wariantach takie same." },
        { kind: "order", q: "Ułóż wiercenie z przeskokiem nad dociskiem po drugim otworze.", items: ["G80", "G98 X45.", "G00 Z30.", "G99 G81 X15. Y20. Z-7. R2. F120", "G99 X75."], answer: [2, 3, 1, 4, 0], why: "Poziom początkowy, otwór 1 z G99, otwór 2 z G98, otwór 3 znów z G99, na końcu G80." },
      ],
    },
  ],

  pitfalls: [
    { title: "G99 przed przeszkodą", x: "Przejazd na wysokości R2 do otworu za dociskiem — ruch szybki prosto w docisk. Przed każdym przejazdem nad przeszkodą: G98 i poziom początkowy nad nią." },
    { title: "Poziom początkowy za nisko", x: "Cykl zaczęty z Z5 — G98 wraca tylko na Z5. Poziom początkowy to Z sprzed cyklu, więc ustaw go świadomie ruchem `G00 Z…` przed pierwszym otworem." },
    { title: "Poziom początkowy za wysoko", x: "Cykl zaczęty zaraz po `G43 H2 Z200.` z G98: każdy otwór to 400 mm drogi w Z. Program działa, ale sztuka trwa niepotrzebnie długo." },
    { title: "Brak G80 przed zmianą narzędzia", x: "Przejazd do wymiany po cyklu bez G80 może wywołać otwór w miejscu, w którym nikt go nie planował." },
  ],

  controllers: {
    rows: [
      ["Powrót do poziomu początkowego", "`G98`", "płaszczyzna powrotu RTP w cyklu"],
      ["Powrót do R", "`G99`", "RTP ustawione na RFP + SDIS"],
      ["Kasowanie cyklu", "`G80` albo kod ruchu G00–G03", "`MCALL` bez nazwy"],
    ],
    note: "W natywnym języku Siemensa nie ma G98/G99 — wysokość powrotu podaje się parametrem cyklu RTP. W trybie ISO SINUMERIK obsługuje cykle G81–G89 z G98/G99 — zależnie od wersji i opcji sterowania. Przeskok nad przeszkodą programuje się ruchem między wywołaniami cyklu.",
  },

  quiz: [
    { kind: "gap", review: "F5.1", q: "Nawiertak 90° ma zrobić fazkę Ø6 pod gwint M6. Na jakie Z zaprogramujesz dno w G82?", template: "Z{0}", answers: [["-3", "-3."]], why: "Przy kącie 90° wysokość stożka równa się promieniowi fazki: 6 / 2 = 3, więc Z−3 — tak jak w programie płytki." },
    { kind: "choice", q: "Dokąd wraca narzędzie po otworze z G98?", options: ["do poziomu początkowego", "do płaszczyzny R", "do Z0", "do punktu referencyjnego"], answer: 0, why: "G98 — poziom sprzed cyklu." },
    { kind: "choice", q: "Co wyznacza poziom początkowy?", options: ["ostatnie Z przed cyklem", "adres R", "G54", "parametr maszyny"], answer: 0, why: "To wysokość, na której narzędzie stało przed cyklem." },
    { kind: "choice", q: "Czy G98/G99 można zmieniać między otworami w trakcie cyklu?", options: ["tak, oba są modalne", "nie, tylko przed cyklem", "tylko na Sinumeriku", "tylko z G80"], answer: 0, why: "Wystarczy dopisać G98 lub G99 do bloku z pozycją otworu." },
    { kind: "choice", q: "Które kody na Fanucu też kasują cykl?", options: ["G00–G03", "G98 i G99", "M08", "G54"], answer: 0, why: "Kody grupy ruchu kasują cykl, ale jawne G80 jest czytelniejsze." },
    { kind: "token", q: "Wskaż blok, po którym narzędzie **przeskoczy nad dociskiem**.", block: "G99 G81 X15. Y20. Z-7. R2. F120 | G98 X45. | G99 X75.", answer: 1, why: "G98 po otworze w X45 wraca na poziom początkowy." },
  ],

  summary: [
    "G98 — powrót do poziomu początkowego, G99 — do płaszczyzny R.",
    "G99 między otworami bez przeszkód, G98 przed przejazdem nad przeszkodą.",
    "Poziom początkowy to ostatnie Z przed cyklem — ustaw go świadomie.",
    "Po ostatnim otworze zawsze G80.",
  ],

  sources: [
    { id: "fanuc", where: "G98 i G99, poziom początkowy, kasowanie cyklu" },
    { id: "sinumerik", where: "parametry RTP, RFP, SDIS, MCALL" },
  ],
};
