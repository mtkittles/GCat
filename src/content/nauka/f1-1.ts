import type { LessonDoc } from "@/lib/lesson";

export const f1_1: LessonDoc = {
  id: "F1.1",
  slug: "f1-1-blok-slowo-adres",
  title: "Blok, słowo i adres",
  minutes: 12,
  goal: "Rozłożysz dowolny blok na słowa, rozpoznasz adresy i przeczytasz program linijka po linijce.",

  theory: [
    { t: "h", x: "Program to lista bloków", id: "bloki" },
    { t: "p", x: "Program CNC to zwykły tekst. Każda linia to [[blok]], czyli jedno polecenie dla maszyny. Sterowanie czyta bloki po kolei, od góry: wykonuje blok i dopiero wtedy przechodzi do następnego." },
    { t: "demo", mode: "mill", title: "Sterowanie wykonuje blok po bloku",
      src: "N10 G21 G90 G17 G54\nN20 G00 X-20. Y10.\nN30 Z5.\nN40 G01 Z-5. F150\nN50 X-5. F400\nN60 Y40.\nN70 G00 Z5.\nN80 M30",
      caption: "Podświetlona linia to blok, który sterowanie właśnie wykonuje." },

    { t: "h", x: "Słowo = adres + wartość", id: "slowo" },
    { t: "p", x: "Blok składa się ze słów. Słowo to litera, czyli [[adres]], i liczba. W `X60` adresem jest X, a wartością 60. W `G01` adresem jest G, a wartością 1. Adres mówi, czego dotyczy liczba." },
    { t: "diagram", id: "f11-block" },

    { t: "h", x: "Najważniejsze adresy", id: "adresy" },
    { t: "table", head: ["Adres", "Znaczenie", "Przykład"], rows: [
      ["**O**", "numer programu (Fanuc)", "`O1000`"],
      ["**N**", "numer bloku", "`N40`"],
      ["**G**", "funkcja przygotowawcza: rodzaj ruchu, tryb pracy", "`G01`"],
      ["**X Y Z**", "współrzędne celu", "`X60. Y20.`"],
      ["**I J K**, **R**", "parametry łuku", "`R15.`"],
      ["**F**", "posuw", "`F300`"],
      ["**S**", "obroty wrzeciona", "`S2500`"],
      ["**T**", "numer narzędzia", "`T1`"],
      ["**M**", "funkcja pomocnicza: wrzeciono, chłodziwo, koniec programu", "`M08`"],
      ["**H**, **D**", "numer rejestru korekcji", "`H1`"],
    ], caption: "Każdy kod G i M ma własną kartę w dziale Kody." },
    { t: "p", x: "W jednym bloku może stać kilka kodów G, jeśli należą do różnych grup, np. `G90 G54 G17`. Ile kodów M zmieści się w bloku, zależy od sterowania. Bezpieczna zasada to jeden M na blok." },

    { t: "h", x: "Komentarze, numery i pomijanie bloków", id: "komentarze" },
    { t: "ul", items: [
      "**Komentarz** to tekst dla człowieka, sterowanie go pomija. Na Fanucu zapisuje się go w nawiasach, `(FREZ FI10)`, na Sinumeriku po średniku, `; FREZ FI10`.",
      "**Numer bloku** `N` jest opcjonalny. Ułatwia szukanie miejsca w programie i wznowienie pracy po przerwaniu.",
      "**Ukośnik** `/` na początku bloku oznacza pomijanie. Przy włączonym przełączniku BLOCK SKIP sterowanie opuszcza taki blok.",
    ] },

    { t: "h", x: "Liczby i kropka dziesiętna", id: "kropka" },
    { t: "p", x: "Na Sinumeriku `X60` znaczy 60 mm. Na Fanucu zależy to od parametru: bez kropki wartość może zostać policzona w najmniejszych przyrostach, czyli `X60` to 0,060 mm. Dlatego w programach na Fanuca wymiary (X, Y, Z, I, J, K, R) pisze się z kropką: `X60.`" },
    { t: "note", kind: "warn", x: "Brak kropki nie wywołuje alarmu. Wartość jest po prostu 1000 razy mniejsza: `Z5` zamiast 5 mm nad detalem daje 0,005 mm, a ruch szybki na takiej wysokości kończy się na imadle." },
  ],

  worked: {
    title: "Przeczytaj blok słowo po słowie",
    intro: "Blok z programu płytki: `N90 G01 X-5. F400`.",
    steps: [
      { x: "Numer bloku. To tylko etykieta, na ruch nie wpływa.", code: "N90" },
      { x: "Ruch roboczy po prostej (lekcja F3.2).", code: "G01" },
      { x: "Cel w osi X: 5 mm na lewo od zera W.", code: "X-5." },
      { x: "Posuw 400 mm/min.", code: "F400" },
    ],
    result: "Całość: jedź po prostej do X−5 z posuwem 400 mm/min. Y i Z się nie zmieniają, bo blok ich nie podaje. Dlaczego to działa, wyjaśnia lekcja F1.2.",
  },

  practice: [
    {
      kind: "drill",
      intro: "Krótkie zadania na czytanie bloków. Tapnij właściwe słowo albo uzupełnij luki.",
      questions: [
        { kind: "token", q: "Tapnij słowo, które ustawia **posuw**.", block: "N20 G01 X40. Y10. F250", answer: 4, why: "F to adres posuwu." },
        { kind: "token", q: "Tapnij **funkcję pomocniczą**.", block: "N30 S2000 M03", answer: 2, why: "M03 włącza obroty wrzeciona w prawo — to funkcja M." },
        { kind: "token", q: "Tapnij słowo, które podaje cel w osi **Z**.", block: "N40 G00 Z5. M08", answer: 2, why: "Z5. — cel 5 mm nad zerem Z." },
        { kind: "gap", q: "Uzupełnij blok: ruch roboczy do X80 Y0 z posuwem 300 mm/min.", template: "G{0} X{1}. Y0. F{2}", answers: [["01", "1"], ["80"], ["300"]], why: "G01 to ruch roboczy, X80. to cel, F300 to posuw." },
        { kind: "choice", q: "Który zapis na Fanucu na pewno oznacza 60 mm?", options: ["`X60`", "`X60.`", "`X0.60`", "`X6.0`"], answer: 1, why: "Kropka dziesiętna usuwa zależność od parametru." },
      ],
    },
  ],

  pitfalls: [
    { title: "Brak kropki na Fanucu", x: "`G00 Z5` bez kropki na maszynie ustawionej na najmniejszy przyrost to ruch szybki 0,005 mm nad detalem. Pisz `Z5.` zawsze, także tam, gdzie wartość jest całkowita." },
    { title: "Litera O zamiast zera", x: "`G0O` albo `X1O` przy ręcznym przepisywaniu programu. Sterowanie zgłosi błąd albo przeczyta literę jako osobny adres." },
    { title: "Ten sam adres dwa razy", x: "`X10. X20.` w jednym bloku. Zależnie od sterowania to alarm albo wykonanie tylko ostatniej wartości. Jedna oś — jedno słowo w bloku." },
    { title: "Komentarz w obcym formacie", x: "Program z Fanuca z komentarzami w nawiasach uruchomiony na Sinumeriku w języku Siemensa: nawias nie jest komentarzem i daje alarm. Przy przenoszeniu programów zamień komentarze." },
  ],

  controllers: {
    rows: [
      ["Numer programu", "`O1000` w pierwszej linii", "nazwa pliku, np. `PLYTKA.MPF`"],
      ["Komentarz", "`(TEKST)`", "`; TEKST`"],
      ["`X60` bez kropki", "60 mm albo 0,060 mm — zależy od parametru", "60 mm"],
      ["Pomijanie bloku", "`/` na początku bloku", "`/` na początku bloku"],
    ],
    note: "Wymiary z kropką (`X60.`) są bezpieczne na obu sterowaniach.",
  },

  quiz: [
    { kind: "choice", review: "F0.2", q: "Pozycja maszynowa to:",
      options: ["przesunięcie + współrzędna z programu", "współrzędna z programu − przesunięcie", "zawsze to samo co w programie", "wartość z G28"], answer: 0,
      why: "Program liczy od W, a W leży w miejscu zapisanym w rejestrze przesunięcia." },
    { kind: "choice", q: "Jak nazywa się litera na początku słowa, np. X w `X60.`?",
      options: ["wartość", "adres", "blok", "kod M"], answer: 1, why: "Litera to adres, liczba po niej to wartość." },
    { kind: "token", q: "Tapnij **funkcję przygotowawczą**.", block: "N10 S1200 M03 G01 X20.", answer: 3,
      why: "Funkcje przygotowawcze mają adres G." },
    { kind: "choice", q: "Co zrobi sterowanie z blokiem `/N50 M08` przy włączonym przełączniku BLOCK SKIP?",
      options: ["wykona go", "pominie go", "zatrzyma program", "zgłosi alarm"], answer: 1, why: "Ukośnik oznacza blok do pominięcia, gdy przełącznik jest włączony." },
    { kind: "choice", q: "Na Sinumeriku komentarz zaczyna się od:",
      options: ["`(`", "`;`", "`/`", "`%`"], answer: 1, why: "Sinumerik: średnik. Fanuc: nawias." },
    { kind: "gap", q: "Zapisz posuw 250 mm/min jako jedno słowo.", template: "{0}", answers: [["F250", "F250."]],
      why: "Adres F i wartość 250." },
    { kind: "choice", q: "Dlaczego na Fanucu pisze się `Z5.` z kropką?",
      options: ["wymaga tego ISO 841", "bez kropki `Z5` może znaczyć 0,005 mm", "kropka oznacza ruch szybki", "dla czytelności, bez znaczenia"], answer: 1,
      why: "Zależnie od parametru wartość bez kropki liczona jest w najmniejszych przyrostach." },
  ],

  summary: [
    "Program to bloki czytane od góry. Blok to słowa, słowo to adres i wartość.",
    "G ustawia rodzaj ruchu i tryby, M steruje maszyną, X Y Z to cel, F posuw, S obroty, T narzędzie.",
    "Komentarz: `( )` na Fanucu, `;` na Sinumeriku.",
    "Na Fanucu wymiary zawsze z kropką.",
  ],

  sources: [
    { id: "fanuc", where: "format bloku, adresy, wprowadzanie kropki dziesiętnej, pomijanie bloku" },
    { id: "sinumerik", where: "struktura programu i bloku, komentarze, nazwy programów" },
  ],
};
