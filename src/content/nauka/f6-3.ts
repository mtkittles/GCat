import type { LessonDoc } from "@/lib/lesson";

const helix = `G03 I-3. Z-1.
G03 I-3. Z-2.
G03 I-3. Z-3.
G03 I-3. Z-4.
G03 I-3. F400`;

const starter = `O1008 (KIESZEN FI20)
G21 G90 G17
G40 G49 G80
G54
T1 M06 (FREZ FI10)
G43 H1 Z50.
S2500 M03
M08
G00 X63. Y25.
G00 Z5.
G01 Z0. F200
(DOPISZ SPIRALE: 4 OBROTY PO 1 MM WOKOL X60 Y25 I OBROT NA DNIE)

G41 D1 G01 Y18.
G03 X70. Y25. R7.
(DOPISZ PELNY OKRAG WYKANCZAJACY PO SCIANIE FI20)

G03 X63. Y32. R7.
G40 G01 Y25.
G00 Z5.
M09
M05
M30`;

export const f6_3: LessonDoc = {
  id: "F6.3",
  slug: "f6-3-kieszen-okragla",
  title: "Kieszeń okrągła",
  minutes: 15,
  goal: "Zaprogramujesz kieszeń okrągłą z wejściem po spirali i wykończysz jej ścianę pełnym okręgiem z korekcją.",

  theory: [
    { t: "h", x: "Spirala zamiast rampy", id: "spirala" },
    { t: "p", x: "W okrągłej kieszeni naturalnym wejściem jest [[interpolacja śrubowa|spirala]]: blok G02/G03 z dodatkowym ruchem w Z. Frez krąży wokół środka kieszeni i z każdym obrotem schodzi niżej. Tak jak przy rampie skrawa obwodem, ale bez zmian kierunku na końcach." },
    { t: "code", x: "G03 I-3. Z-1.   (PELNY OBROT WOKOL SRODKA, 1 MM NIZEJ)", caption: "Blok bez X i Y z I — pełny okrąg z lekcji F3.4. Dopisane Z zamienia go w zwój spirali." },
    { t: "diagram", id: "helix-z" },
    { t: "p", x: "Kąt spirali liczy się jak kąt rampy: skok na obwód. Promień 3 mm to obwód 18,8 mm, skok 1 mm daje około 3°. Frez bez ostrza przez środek zostawiłby przy zbyt małym promieniu spirali rdzeń w środku — minimalną średnicę otworu dla wejścia po spirali podaje katalog." },

    { t: "h", x: "Wykończenie ściany", id: "wykonczenie" },
    { t: "diagram", id: "f63-circle" },
    { t: "ul", items: [
      "Spirala o promieniu 3 mm frezem Ø10 wybiera środek do promienia 8 mm. Na ścianie zostają 2 mm.",
      "Najazd: odcinek z G41 w dół, potem łuk R7 styczny do ściany. Promień łuku najazdu musi być większy niż promień freza (5) i mniejszy niż promień kieszeni (10).",
      "Ścianę wykańcza pełny okrąg `G03 I-10.` — przeciwnie do zegara, czyli współbieżnie.",
      "Odjazd symetrycznie: łuk R7 i odcinek z G40.",
    ] },

    { t: "h", x: "Średnica w tolerancji", id: "wymiar" },
    { t: "p", x: "Średnicę kieszeni ustawia korekcja D. Zmiana D o x zmienia średnicę o 2x, tak jak wymiar zewnętrzny płytki w F4.2 — tylko w drugą stronę: zwiększenie D daje mniejszą kieszeń. Kieszeń Ø20,04 wymaga zwiększenia D o 0,02." },
  ],

  worked: {
    title: "Kieszeń Ø20 w płytce",
    intro: "Środek X60 Y25, głębokość 4 mm, frez Ø10.",
    steps: [
      { x: "Start spirali 3 mm na prawo od środka.", code: "G00 X63. Y25." },
      { x: "Cztery zwoje po 1 mm i obrót na dnie. I = 60 − 63.", code: "G03 I-3. Z-1. … Z-4." },
      { x: "Najazd: z G41 7 mm w dół, łuk R7 do ściany w X70.", code: "G41 D1 G01 Y18. → G03 X70. Y25. R7." },
      { x: "Okrąg na ścianie: środek 10 mm w lewo od X70.", code: "G03 I-10." },
    ],
    result: "Pięć bloków G03 z tym samym `I-3.` różni się tylko Z. W module F7 zamienisz je na podprogram wywoływany kilka razy.",
  },

  practice: [
    {
      kind: "task",
      intro: "Najazd i odjazd są gotowe. Dopisz spiralę i pełny okrąg wykańczający.",
      starter,
      checks: [
        { t: "cut", reference: `G90\nG00 Z50.\nG00 X63. Y25.\nG00 Z5.\nG01 Z0. F200\n${helix}\nG41 D1 G01 Y18.\nG03 X70. Y25. R7.\nG03 I-10.\nG03 X63. Y32. R7.\nG40 G01 Y25.\nG00 Z5.`, tolerance: 0.05 },
        { t: "require", codes: ["G03", "G41"] },
      ],
      hints: ["Spirala: G03 I-3. Z-1., potem Z-2., Z-3., Z-4. i G03 I-3. F400 na dnie.", "Okrąg na ścianie: G03 I-10."],
      solution: starter
        .replace("(DOPISZ SPIRALE: 4 OBROTY PO 1 MM WOKOL X60 Y25 I OBROT NA DNIE)\n", `${helix}\n`)
        .replace("(DOPISZ PELNY OKRAG WYKANCZAJACY PO SCIANIE FI20)\n", "G03 I-10.\n"),
    },
    {
      kind: "drill",
      intro: "Spirala i łuki najazdu.",
      questions: [
        { kind: "gap", q: "Spirala o promieniu 4 mm, skok 1,5 mm na obrót. Kąt (stopnie, w przybliżeniu):", template: "{0}°", answers: [["3.4", "3,4", "3"]], why: "Obwód 25,1 mm, atan(1,5 / 25,1) ≈ 3,4°." },
        { kind: "choice", q: "Kieszeń Ø30, frez Ø12. Który promień łuku najazdu jest poprawny?", options: ["R10", "R5", "R16", "R6"], answer: 0, why: "Większy niż 6 (promień freza) i mniejszy niż 15 (promień kieszeni)." },
        { kind: "gap", q: "Kieszeń wyszła Ø25,06 zamiast Ø25,00. Zmiana D:", template: "{0}", answers: [["+0.03", "0.03", "+0,03", "0,03"]], why: "Za duża o 0,06 — zwiększasz D o połowę, frez odsuwa się od ściany." },
      ],
    },
  ],

  pitfalls: [
    { title: "Za stroma spirala", x: "Skok 3 mm na promieniu 3 mm to ponad 9°. Frez skrawa czołem prawie jak przy wejściu pionowym." },
    { title: "Łuk najazdu mniejszy niż promień freza", x: "R4 przy frezie R5 z G41: środek freza nie mieści się po wewnętrznej stronie łuku — alarm korekcji." },
    { title: "Zły znak korekcji D", x: "Kieszeń za duża, a operator zmniejsza D jak przy wymiarze zewnętrznym. Frez podchodzi bliżej ściany i kieszeń rośnie jeszcze bardziej." },
    { title: "G02 w kieszeni", x: "Wykończenie zgodnie z zegarem przy M03 to w kieszeni frezowanie przeciwbieżne. Z G41 frez trafi dodatkowo na złą stronę ściany." },
  ],

  controllers: {
    rows: [
      ["Spirala", "`G02`/`G03` z `Z`, każdy zwój osobnym blokiem", "`G2`/`G3` z `Z` i `TURN=` — kilka zwojów w jednym bloku"],
      ["Kieszeń okrągła", "ręcznie albo Manual Guide i / CAM", "`POCKET4(…)`"],
      ["Pełny okrąg", "`G03 I…` bez X i Y", "`G3 I…` bez X i Y"],
    ],
    note: "`TURN=3` na Sinumeriku dopisuje trzy pełne zwoje do łuku. Na Fanucu każdy zwój to osobny blok albo podprogram (F7).",
  },

  quiz: [
    { kind: "choice", review: "F6.2", q: "Kierunek wykańczania ścian kieszeni przy M03 i G41:", options: ["przeciwnie do zegara", "zgodnie z zegarem", "dowolny", "zygzak"], answer: 0, why: "Wewnątrz współbieżnie." },
    { kind: "choice", q: "Czym różni się blok spirali od pełnego okręgu?", options: ["dodatkowym ruchem w Z", "adresem R", "kodem G01", "niczym"], answer: 0, why: "G03 I… z Z to zwój spirali." },
    { kind: "gap", q: "Start spirali X65 Y30, środek kieszeni X60 Y30. I:", template: "I{0}", answers: [["-5"]], why: "60 − 65 = −5." },
    { kind: "choice", q: "Kieszeń za duża. Co z D?", options: ["zwiększyć", "zmniejszyć", "nie zmieniać", "zmienić H"], answer: 0, why: "Większe D odsuwa frez od ściany kieszeni." },
    { kind: "choice", q: "Frez Ø10, spirala R3. Do jakiego promienia sięga materiał usunięty spiralą?", options: ["8 mm", "3 mm", "5 mm", "13 mm"], answer: 0, why: "3 + 5 = 8." },
    { kind: "token", q: "Tapnij blok, który **wykańcza ścianę** kieszeni.", block: "G03 I-3. Z-4. | G03 X70. Y25. R7. | G03 I-10.", answer: 2, why: "Pełny okrąg po ścianie Ø20." },
  ],

  summary: [
    "Spirala: G02/G03 z I, J i Z — wejście obwodem, bez zmian kierunku.",
    "Kąt spirali = atan(skok / obwód). Kilka stopni wystarczy.",
    "Łuk najazdu: promień większy niż freza, mniejszy niż kieszeni.",
    "Średnica kieszeni: większe D — mniejsza kieszeń.",
  ],

  sources: [
    { id: "sandvik", where: "interpolacja śrubowa, minimalna średnica otworu przy wejściu po spirali" },
    { id: "fanuc", where: "interpolacja śrubowa G02/G03 z osią Z" },
    { id: "sinumerik", where: "POCKET4, G2/G3 z TURN" },
  ],
};
