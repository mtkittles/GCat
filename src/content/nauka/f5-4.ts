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
    { t: "p", x: "Płytka: cztery otwory, R2, poziom początkowy Z50. Z G98 każdy otwór to dodatkowe 2 × 48 = 96 mm ruchu szybkiego w Z. Przy trzech operacjach i czterech otworach to ponad metr drogi na każdej sztuce. W programie płytki nic nie wystaje nad detal, więc wszystkie cykle dostają G99." },

    { t: "h", x: "G80 i koniec cyklu", id: "g80" },
    { t: "p", x: "[[G80]] kasuje cykl. Na Fanucu robią to też kody ruchu G00–G03, ale jawne G80 po ostatnim otworze to zasada: program jest czytelny, a następny blok na pewno nie wierci. Blok startowy z lekcji F1.5 zawiera G80 na wypadek cyklu zostawionego przez inny program." },
  ],

  worked: {
    title: "Trzy otwory i docisk",
    intro: "Otwory w X15, X45 i X75 w jednej linii, Y20. Między X45 a X75 stoi docisk wysoki na 25 mm nad detalem. R2, dno Z−7.",
    steps: [
      { x: "Poziom początkowy nad dociskiem, z zapasem.", code: "G00 Z30." },
      { x: "Pierwszy otwór z G99 — do następnego nie ma przeszkody.", code: "G99 G81 X15. Y20. Z-7. R2. F120" },
      { x: "Drugi otwór z G98 — potem przejazd nad dociskiem.", code: "G98 X45." },
      { x: "Trzeci otwór i koniec cyklu.", code: "X75. → G80" },
    ],
    result: "Tylko jeden powrót na Z30 — dokładnie tam, gdzie jest potrzebny. Pozostałe przejazdy idą na R2.",
  },

  practice: [
    {
      kind: "drill",
      intro: "Wysokości powrotu i kasowanie cyklu.",
      questions: [
        { kind: "choice", q: "Cztery otwory na płaskiej płycie, nic nie wystaje. Który kod powrotu?", options: ["G99", "G98", "bez znaczenia", "G80"], answer: 0, why: "G99 skraca drogę — nie ma nad czym przeskakiwać." },
        { kind: "choice", q: "Po którym otworze trzeba wrócić wyżej, jeśli docisk stoi między otworem 2 a 3?", options: ["po otworze 2", "po otworze 3", "po otworze 1", "po każdym"], answer: 0, why: "Wysokość powrotu po otworze 2 decyduje o przejeździe nad dociskiem." },
        { kind: "gap", q: "Poziom początkowy Z40, R3, 6 otworów. O ile milimetrów dłuższa jest droga w Z z G98 niż z G99 (dla wszystkich otworów)?", template: "{0} mm", answers: [["444"]], why: "Na każdy otwór 2 × (40 − 3) = 74 mm, razy 6 = 444 mm." },
        { kind: "order", q: "Ułóż wiercenie z przeskokiem nad dociskiem po drugim otworze.", items: ["G80", "G98 X45.", "G00 Z30.", "G99 G81 X15. Y20. Z-7. R2. F120", "G99 X75."], answer: [2, 3, 1, 4, 0], why: "Poziom początkowy, otwór 1 z G99, otwór 2 z G98, otwór 3, G80." },
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
    note: "Sinumerik nie ma G98/G99 — wysokość powrotu podaje się parametrem cyklu RTP. Przeskok nad przeszkodą programuje się ruchem między wywołaniami cyklu.",
  },

  quiz: [
    { kind: "gap", review: "F5.3", q: "M8×1,25 przy S400. F:", template: "F{0}", answers: [["500"]], why: "400 · 1,25 = 500." },
    { kind: "choice", q: "Dokąd wraca narzędzie po otworze z G98?", options: ["do poziomu początkowego", "do płaszczyzny R", "do Z0", "do punktu referencyjnego"], answer: 0, why: "G98 — poziom sprzed cyklu." },
    { kind: "choice", q: "Co wyznacza poziom początkowy?", options: ["ostatnie Z przed cyklem", "adres R", "G54", "parametr maszyny"], answer: 0, why: "To wysokość, na której narzędzie stało przed cyklem." },
    { kind: "choice", q: "Czy G98/G99 można zmieniać między otworami w trakcie cyklu?", options: ["tak, oba są modalne", "nie, tylko przed cyklem", "tylko na Sinumeriku", "tylko z G80"], answer: 0, why: "Wystarczy dopisać G98 lub G99 do bloku z pozycją otworu." },
    { kind: "choice", q: "Które kody na Fanucu też kasują cykl?", options: ["G00–G03", "G98 i G99", "M08", "G54"], answer: 0, why: "Kody grupy ruchu kasują cykl, ale jawne G80 jest czytelniejsze." },
    { kind: "token", q: "Tapnij blok, po którym narzędzie **przeskoczy nad dociskiem**.", block: "G99 G81 X15. Y20. Z-7. R2. F120 | G98 X45. | G99 X75.", answer: 1, why: "G98 po otworze w X45 wraca na poziom początkowy." },
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
