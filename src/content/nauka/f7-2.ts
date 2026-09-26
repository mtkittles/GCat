import type { LessonDoc } from "@/lib/lesson";

export const f7_2: LessonDoc = {
  id: "F7.2",
  slug: "f7-2-podprogramy-sinumerik",
  title: "Podprogramy w Sinumeriku",
  minutes: 12,
  goal: "Zapiszesz podprogram Sinumerika jako osobny plik, wywołasz go nazwą z powtórzeniami i przekażesz mu parametry.",

  theory: [
    { t: "h", x: "Plik zamiast numeru", id: "pliki" },
    { t: "p", x: "Sinumerik trzyma program główny w pliku .MPF, a podprogram w osobnym pliku .SPF — w katalogu detalu albo w katalogu podprogramów. Podprogram wywołuje się jego **nazwą**, bez M98. Nazwa może być opisowa, np. `SPIRALA`, albo w starym stylu `L2000`." },
    { t: "diagram", id: "f72-flow" },
    { t: "table", head: ["Zapis", "Znaczenie"], rows: [
      ["`SPIRALA`", "jedno wywołanie podprogramu SPIRALA.SPF"],
      ["`SPIRALA P4`", "cztery przebiegi"],
      ["`RET` albo `M17`", "koniec podprogramu i powrót"],
      ["`MCALL CYCLE81(…)`", "wywołanie modalne — po każdym ruchu XY (lekcja F5.1)"],
    ] },

    { t: "h", x: "Parametry", id: "parametry" },
    { t: "p", x: "Największa różnica względem M98: podprogram Sinumerika może przyjmować parametry. Deklaruje je pierwsza linia pliku, `PROC`, a wywołanie podaje wartości w nawiasie — jak funkcja w programowaniu." },
    { t: "code", x: "; OTWOR_M6.SPF\nPROC OTWOR_M6(REAL XP, REAL YP)\nG0 X=XP Y=YP\n; … nawiercenie, wiercenie, gwintowanie w punkcie XP, YP\nRET\n\n; w programie glownym\nOTWOR_M6(10, 10)\nOTWOR_M6(70, 10)", caption: "Jeden podprogram obsługuje każdy otwór — współrzędne przychodzą jako parametry." },
    { t: "p", x: "Na Fanucu podobną rolę pełni makro użytkownika wywoływane `G65 P9001 X10. Y10.` — wartości adresów trafiają do zmiennych (X do #24, Y do #25). To osobny, obszerny temat, bo makra mają własną składnię zmiennych i warunków." },

    { t: "h", x: "Przenoszenie programu z Fanuca", id: "przenoszenie" },
    { t: "ul", items: [
      "`M98 P2000 L4` zamieniasz na nazwę podprogramu z `P4`, a treść O2000 przenosisz do pliku .SPF.",
      "`M99` na końcu podprogramu zamieniasz na `RET` albo `M17`.",
      "Komentarze w nawiasach zamieniasz na średnik (lekcja F1.1).",
      "Tryb ISO na Sinumeriku potrafi wykonać program Fanuca z M98 wprost — ale tylko wtedy, gdy maszyna ma go włączonego.",
    ] },
    { t: "note", kind: "tip", x: "To ostatnia lekcja ścieżki frezowania. Program płytki poniżej jest kompletny: planowanie, kontur z korekcją, dwie kieszenie, trzy operacje otworów i podprogram. Rozwiń go i uruchom w symulatorze." },
  ],

  worked: {
    title: "Spirala płytki na Sinumeriku",
    intro: "Ten sam podprogram co w F7.1, przeniesiony do składni Siemensa.",
    steps: [
      { x: "Treść podprogramu do pliku SPIRALA.SPF, bez kropek i bez numeru O.", code: "G91 G3 I-3 Z-1" },
      { x: "Przywrócenie wymiarów absolutnych — tak samo jak na Fanucu.", code: "G90" },
      { x: "Koniec podprogramu.", code: "RET" },
      { x: "W programie głównym: nazwa i liczba przebiegów.", code: "SPIRALA P4" },
    ],
    result: "Zasada jest identyczna: przyrostowy zwój wykonany cztery razy. Różnią się tylko zapis wywołania, koniec podprogramu i to, gdzie podprogram leży.",
  },

  practice: [
    {
      kind: "drill",
      intro: "Symulator GCat pracuje w dialekcie Fanuca, więc tu ćwiczysz zapis Sinumerika na pytaniach.",
      questions: [
        { kind: "token", q: "Tapnij blok, który **wywołuje podprogram** 3 razy.", block: "G0 X10 Y10 | KIESZEN P3 | RET", answer: 1, why: "Nazwa podprogramu i P3." },
        { kind: "order", q: "Ułóż plik podprogramu z parametrami.", items: ["RET", "PROC OTWOR(REAL XP, REAL YP)", "G0 X=XP Y=YP"], answer: [1, 2, 0], why: "Deklaracja, treść, koniec." },
        { kind: "choice", q: "Czym kończy się podprogram Sinumerika?", options: ["RET albo M17", "M99", "M30", "M98"], answer: 0, why: "M99 to zapis Fanuca." },
        { kind: "gap", q: "Zapisz 6 przebiegów podprogramu ROWEK.", template: "ROWEK P{0}", answers: [["6"]], why: "P podaje liczbę przebiegów." },
      ],
    },
  ],

  pitfalls: [
    { title: "M99 w pliku SPF", x: "Podprogram przeniesiony z Fanuca z `M99` na końcu. W trybie Siemensa to nie jest koniec podprogramu — zmień na `RET` albo `M17`." },
    { title: "Podprogram w złym katalogu", x: "Plik SPF zapisany w innym katalogu niż ten, w którym sterowanie go szuka. Wywołanie kończy się alarmem o nieznanej nazwie. Trzymaj podprogram w katalogu detalu razem z programem głównym albo w katalogu podprogramów." },
    { title: "Nazwa zajęta przez cykl", x: "Podprogram nazwany jak cykl producenta albo polecenie języka. Sterowanie wywoła coś innego niż Twój plik. Używaj nazw opisowych z przedrostkiem detalu." },
  ],

  controllers: {
    rows: [
      ["Gdzie leży podprogram", "osobny program O… w pamięci", "plik .SPF w katalogu detalu lub podprogramów"],
      ["Wywołanie", "`M98 P2000`", "`SPIRALA` albo `L2000`"],
      ["Powtórzenia", "`L4` albo `P42000`", "`P4`"],
      ["Koniec", "`M99`", "`RET` albo `M17`"],
      ["Parametry", "makro `G65` ze zmiennymi #", "`PROC NAZWA(REAL A, …)`"],
    ],
    note: "Idea jest wspólna. Sinumerik dodaje nazwy i parametry, dzięki którym podprogram staje się biblioteczną funkcją.",
  },

  quiz: [
    { kind: "choice", review: "F7.1", q: "Co zapis `M98 P42000` oznacza na Fanucu?", options: ["4 przebiegi podprogramu O2000", "podprogram O42000", "2000 przebiegów O4", "alarm"], answer: 0, why: "Cyfry przed czterocyfrowym numerem to powtórzenia." },
    { kind: "choice", q: "Jak wywołać podprogram na Sinumeriku?", options: ["jego nazwą", "M98 P…", "G65", "M17"], answer: 0, why: "Nazwa pliku SPF w bloku." },
    { kind: "choice", q: "W jakim pliku jest podprogram Sinumerika?", options: [".SPF", ".MPF", ".NC", ".TXT"], answer: 0, why: "MPF — program główny, SPF — podprogram." },
    { kind: "choice", q: "Co daje `PROC OTWOR(REAL XP, REAL YP)`?", options: ["podprogram przyjmuje dwa parametry", "wywołuje cykl wiercenia", "kończy program", "definiuje zero detalu"], answer: 0, why: "Deklaracja parametrów podprogramu." },
    { kind: "choice", q: "Odpowiednik parametrycznego podprogramu na Fanucu to:", options: ["makro G65", "M98 L…", "G52", "G91"], answer: 0, why: "Makro użytkownika przyjmuje wartości przez adresy." },
    { kind: "token", q: "Tapnij zapis **końca** podprogramu Sinumerika.", block: "M99 | M30 | M17", answer: 2, why: "M17 albo RET." },
  ],

  summary: [
    "Podprogram Sinumerika to plik .SPF wywoływany nazwą.",
    "Powtórzenia: `NAZWA P4`. Koniec: `RET` albo `M17`.",
    "`PROC NAZWA(…)` pozwala przekazać parametry — na Fanucu robi to makro G65.",
    "Przy przenoszeniu z Fanuca: M98 → nazwa, M99 → RET, nawiasy → średnik.",
  ],

  sources: [
    { id: "sinumerik", where: "technika podprogramów, PROC, P, RET, M17, katalogi programów" },
    { id: "fanuc", where: "makro użytkownika G65 — porównanie" },
  ],
};
