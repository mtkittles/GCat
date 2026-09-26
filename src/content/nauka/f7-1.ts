import type { LessonDoc } from "@/lib/lesson";

const tail = `G03 I-3. F400
G41 D1 G01 Y18.
G03 X70. Y25. R7.
G03 I-10.
G03 X63. Y32. R7.
G40 G01 Y25.
G00 Z5.
M09
M05
M30`;

const starter = `O1009 (KIESZEN FI20 Z PODPROGRAMEM)
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
(DOPISZ WYWOLANIE: 4 ZWOJE SPIRALI Z PODPROGRAMU O2000)

${tail}
(DOPISZ PODPROGRAM O2000: JEDEN ZWOJ PRZYROSTOWO I M99)
`;

const sub = `O2000 (ZWOJ SPIRALI)
G91 G03 I-3. Z-1.
G90
M99`;

export const f7_1: LessonDoc = {
  id: "F7.1",
  slug: "f7-1-m98-m99",
  title: "M98 i M99",
  minutes: 15,
  goal: "Wyniesiesz powtarzalny fragment do podprogramu, wywołasz go z liczbą powtórzeń i wrócisz do programu głównego w dobrym stanie modalnym.",

  theory: [
    { t: "h", x: "Po co podprogram", id: "po-co" },
    { t: "p", x: "W lekcji F6.3 spirala zajęła cztery bloki różniące się tylko wartością Z. Takie powtórzenia to miejsce na literówkę i utrudnienie przy każdej zmianie. [[Podprogram]] zapisuje powtarzalny fragment raz, a program główny wywołuje go tyle razy, ile trzeba." },
    { t: "ul", items: [
      "ten sam ruch powtórzony kilka razy — zwoje spirali, przejścia na kolejnych głębokościach,",
      "ten sam element w kilku miejscach — rowki co 15 mm, kieszeń na dwóch detalach w G54 i G55,",
      "jedna poprawka w podprogramie zmienia wszystkie wystąpienia.",
    ] },

    { t: "h", x: "Wywołanie i powrót", id: "budowa" },
    { t: "diagram", id: "f71-flow" },
    { t: "table", head: ["Zapis", "Znaczenie"], rows: [
      ["`M98 P2000`", "jedno wywołanie podprogramu O2000"],
      ["`M98 P2000 L4`", "cztery wywołania — powtórzenia w adresie L"],
      ["`M98 P42000`", "cztery wywołania — powtórzenia w cyfrach przed czterocyfrowym numerem"],
      ["`M99`", "koniec podprogramu i powrót do bloku po M98"],
    ], caption: "Który zapis powtórzeń przyjmuje maszyna, mówi instrukcja sterowania. Karta M98 w dziale Kody pokazuje więcej przykładów." },
    { t: "p", x: "W sterowaniu podprogram jest osobnym programem w pamięci, z własnym numerem O. W symulatorze GCat zapisujesz go w tym samym pliku, pod M30 programu głównego." },

    { t: "h", x: "Podprogram przyrostowy", id: "g91" },
    { t: "p", x: "Żeby powtórzenia robiły coś innego za każdym razem, podprogram pracuje w [[G91]]: każdy przebieg zaczyna się tam, gdzie skończył poprzedni. Zwój spirali `G91 G03 I-3. Z-1.` wykonany cztery razy schodzi z Z0 na Z−4." },
    { t: "note", kind: "warn", x: "Tryby modalne wracają z podprogramu do programu głównego (lekcja F1.2). Podprogram, który włącza G91, przed M99 przywraca G90 — inaczej następne współrzędne w programie głównym zostaną policzone przyrostowo." },
    { t: "code", x: "G54\nM98 P3000     (KONTUR NA DETALU 1)\nG55\nM98 P3000     (TEN SAM KONTUR NA DETALU 2)\nM30\nO3000 (KONTUR)\n…\nM99", caption: "Ten sam podprogram w dwóch układach — połączenie z lekcją F0.3." },

    { t: "h", x: "Zagnieżdżanie", id: "zagniezdzanie" },
    { t: "p", x: "Podprogram może wywołać kolejny podprogram. Liczba poziomów jest ograniczona i podana w instrukcji sterowania — na starszych Fanucach to cztery. Symulator GCat też przyjmuje cztery." },
  ],

  worked: {
    title: "Spirala z F6.3 jako podprogram",
    intro: "Cztery bloki `G03 I-3. Z-1.` … `Z-4.` mają zastąpić jedno wywołanie. Frez stoi w X63 Y25 na Z0.",
    steps: [
      { x: "Jeden zwój przyrostowo: pełny obrót i 1 mm w dół.", code: "G91 G03 I-3. Z-1." },
      { x: "Powrót do wymiarów absolutnych przed wyjściem.", code: "G90" },
      { x: "Koniec podprogramu.", code: "M99" },
      { x: "W programie głównym: cztery wywołania.", code: "M98 P2000 L4" },
    ],
    result: "Cztery bloki spirali zamieniają się w jeden. Zmiana głębokości kieszeni na 6 mm to już tylko `L6` zamiast dopisywania dwóch bloków.",
  },

  practice: [
    {
      kind: "task",
      intro: "Dopisz wywołanie spirali i podprogram O2000 pod M30. Sprawdzany jest tor — musi być taki sam jak w F6.3 — oraz użycie M98, M99 i G91.",
      starter,
      checks: [
        { t: "cut", reference: `G90\nG00 Z50.\nG00 X63. Y25.\nG00 Z5.\nG01 Z0. F200\nG03 I-3. Z-1.\nG03 I-3. Z-2.\nG03 I-3. Z-3.\nG03 I-3. Z-4.\n${tail}`, tolerance: 0.05 },
        { t: "require", codes: ["M98", "M99", "G91"] },
      ],
      hints: ["Wywołanie: M98 P2000 L4.", "Podprogram: O2000, G91 G03 I-3. Z-1., G90, M99."],
      solution: starter
        .replace("(DOPISZ WYWOLANIE: 4 ZWOJE SPIRALI Z PODPROGRAMU O2000)\n", "M98 P2000 L4\n")
        .replace("(DOPISZ PODPROGRAM O2000: JEDEN ZWOJ PRZYROSTOWO I M99)\n", `${sub}\n`),
    },
    {
      kind: "drill",
      intro: "Zapis wywołań i budowa podprogramu.",
      questions: [
        { kind: "gap", q: "`M98 P31500` — ile przebiegów i który podprogram?", template: "{0} × O{1}", answers: [["3"], ["1500"]], why: "Ostatnie cztery cyfry to numer, cyfry przed nimi — liczba powtórzeń." },
        { kind: "order", q: "Ułóż podprogram jednego zwoju spirali.", items: ["M99", "O2000", "G90", "G91 G03 I-3. Z-1."], answer: [1, 3, 2, 0], why: "Numer, ruch przyrostowy, powrót do G90, koniec." },
        { kind: "choice", q: "Podprogram `G90 G03 I-3. Z-1.` wywołany 4 razy. Na jakiej głębokości skończy się spirala?", options: ["Z−1 — każdy przebieg jedzie do tego samego Z", "Z−4", "Z0", "alarm"], answer: 0, why: "W G90 Z−1 to położenie absolutne, a nie przyrost." },
      ],
    },
  ],

  pitfalls: [
    { title: "Brak G90 przed M99", x: "Podprogram kończy się w G91. Program główny jedzie dalej `G41 D1 G01 Y18.` — sterowanie odmierza 18 mm od bieżącego punktu zamiast jechać do Y18." },
    { title: "Wymiary absolutne w powtarzanym podprogramie", x: "`Z-1.` w G90 wykonane cztery razy to cztery przebiegi na tej samej głębokości. Program wygląda poprawnie, a kieszeń ma 1 mm zamiast 4." },
    { title: "M99 w programie głównym", x: "Na Fanucu M99 w programie głównym wraca na jego początek — program kręci się w pętli, dopóki operator go nie zatrzyma. Program główny kończy M30." },
    { title: "Zły zapis liczby powtórzeń", x: "`M98 P4 2000` albo `M98 P2000 4`. Sterowanie odczyta inny numer programu albo zgłosi alarm. Pisz `P2000 L4` albo `P42000` — zależnie od maszyny." },
  ],

  controllers: {
    rows: [
      ["Wywołanie", "`M98 P2000`", "nazwa podprogramu: `SPIRALA` albo `L2000`"],
      ["Powtórzenia", "`L4` albo `P42000`", "`SPIRALA P4`"],
      ["Koniec podprogramu", "`M99`", "`RET` albo `M17`"],
      ["Parametry", "makro `G65 P… A… B…`", "`PROC SPIRALA(REAL …)`"],
    ],
    note: "Sinumerik wywołuje podprogramy nazwą, a nie numerem — szczegóły w lekcji F7.2.",
  },

  quiz: [
    { kind: "choice", review: "F6.3", q: "Czym różni się blok spirali od pełnego okręgu?", options: ["dodatkowym ruchem w Z", "adresem R", "kodem G01", "niczym"], answer: 0, why: "G03 I… z Z to zwój spirali." },
    { kind: "choice", q: "Co robi `M99` na końcu podprogramu?", options: ["wraca do bloku po M98", "kończy cały program", "wraca na początek podprogramu", "wyłącza wrzeciono"], answer: 0, why: "M99 zwraca sterowanie do programu wywołującego." },
    { kind: "gap", q: "Zapisz 5 wywołań podprogramu O1002 w formie z adresem L.", template: "M98 P{0} L{1}", answers: [["1002"], ["5"]], why: "P — numer, L — liczba powtórzeń." },
    { kind: "choice", q: "Dlaczego powtarzany podprogram zwykle pracuje w G91?", options: ["każdy przebieg zaczyna się tam, gdzie skończył poprzedni", "G91 jest szybsze", "M98 tego wymaga", "bez powodu"], answer: 0, why: "Tylko wtedy kolejne przebiegi robią coś nowego." },
    { kind: "choice", q: "Podprogram włącza G91. Co przed M99?", options: ["G90", "G80", "M30", "nic"], answer: 0, why: "Stan modalny wraca do programu głównego." },
    { kind: "choice", q: "Co się stanie z `M99` zamiast `M30` na końcu programu głównego (Fanuc)?", options: ["program zacznie się od nowa — pętla", "program się zakończy", "alarm", "wrzeciono się zatrzyma"], answer: 0, why: "M99 w programie głównym wraca na jego początek." },
    { kind: "token", q: "Tapnij słowo, które podaje **numer podprogramu**.", block: "M98 P2000 L4", answer: 1, why: "P2000 — podprogram O2000." },
  ],

  summary: [
    "M98 P… wywołuje podprogram, M99 wraca do bloku po wywołaniu.",
    "Powtórzenia: L4 albo cyfry przed numerem (P42000).",
    "Powtarzany podprogram pracuje w G91 i przed M99 przywraca G90.",
    "M99 w programie głównym to pętla — program główny kończy M30.",
  ],

  sources: [
    { id: "fanuc", where: "podprogramy M98 i M99, zagnieżdżanie, powtórzenia" },
    { id: "sinumerik", where: "technika podprogramów — porównanie" },
  ],
};
