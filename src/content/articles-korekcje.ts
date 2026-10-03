import type { Block } from "@/lib/article";

/* Karty ★: G40–G42 (korekcja promienia) i G43–G49 (korekcja długości). */

const g40g42: Block[] = [
  { t: "p", x: "**Korekcja promienia** pozwala programować **kontur z rysunku**, a nie tor środka narzędzia. Sterownik sam odsuwa narzędzie o promień zapisany w rejestrze **D**. Ten sam program pasuje wtedy do freza ⌀10 i ⌀12, a wymiar detalu koryguje się w rejestrze, bez zmiany programu." },

  { t: "h", x: "Co dokładnie robi sterownik" },
  { t: "p", x: "Z aktywnym G41 albo G42 sterownik czyta program **o dwa–trzy bloki do przodu**. Dla każdego elementu konturu liczy tor przesunięty w bok o promień, a w narożach szuka punktu, w którym przesunięte tory się spotykają. Dlatego korekcja musi „widzieć” następny ruch — blok bez ruchu w płaszczyźnie (np. sam ruch w Z) w środku konturu potrafi zaburzyć naroże." },
  { t: "diagram", id: "f42-comp" },
  { t: "ul", items: [
    "**Odcinek** — tor równoległy, odsunięty o promień.",
    "**Łuk** — łuk współśrodkowy o promieniu większym albo mniejszym o promień narzędzia, zależnie od tego, czy frez jest na zewnątrz, czy wewnątrz łuku.",
    "**Naroże zewnętrzne** — sterownik domyka tor łukiem albo przedłuża odcinki do przecięcia (zależnie od parametru; Sinumerik: `G450` / `G451`).",
    "**Naroże wewnętrzne** — tor kończy się w przecięciu odsuniętych elementów, frez nie wchodzi w ściankę.",
  ] },

  { t: "h", x: "Po której stronie konturu" },
  { t: "p", x: "Reguła jest jedna: **stań za narzędziem i patrz w kierunku ruchu**. Narzędzie po lewej stronie konturu — **G41**, po prawej — **G42**. **G40** korekcję wyłącza." },
  { t: "diagram", id: "g40-g42" },
  { t: "table", head: ["Obróbka (M03, frez prawotnący)", "Kierunek obiegu", "Kod", "Rodzaj frezowania"], rows: [
    ["kontur zewnętrzny", "zgodnie z zegarem", "`G41`", "współbieżne"],
    ["kontur zewnętrzny", "przeciwnie do zegara", "`G42`", "przeciwbieżne"],
    ["kieszeń, otwór", "przeciwnie do zegara", "`G41`", "współbieżne"],
  ], caption: "Współbieżne daje lepszą powierzchnię i mniejsze zużycie ostrzy na maszynach ze śrubą kulową — to domyślny wybór." },

  { t: "h", x: "Rejestr D: geometria i zużycie" },
  { t: "p", x: "W tabeli korekcji każdy numer D ma dwie wartości: **geometrię** (promień freza, np. 5,000 dla ⌀10) i **zużycie** (drobna poprawka). Sterownik sumuje obie. Na Fanucu rejestr przechowuje zwykle promień; część maszyn jest ustawiona na średnicę — to trzeba sprawdzić przed pierwszym uruchomieniem." },
  { t: "code", x: "Kontur zewnętrzny 80 × 50, zmierzono 80,04 × 50,04\nnadwymiar na stronę:  0,04 / 2 = 0,02\nzużycie D1:           −0,020  (frez podejdzie 0,02 bliżej ściany)", caption: "Korekcja działa po obu stronach detalu naraz, więc zmiana D o x zmienia wymiar zewnętrzny o 2x." },
  { t: "note", kind: "tip", x: "Przed pierwszym przebiegiem z korekcją wpisz do rejestru **zero** i przejedź program nad detalem. Tor pokryje się z konturem z rysunku, co łatwo sprawdzić z rysunkiem. Dopiero potem wpisz rzeczywisty promień." },

  { t: "h", x: "Włączenie i wyłączenie" },
  { t: "p", x: "Korekcji nie da się włączyć w miejscu. Sterownik potrzebuje **ruchu prostoliniowego**, w trakcie którego przesunie narzędzie z punktu nieskompensowanego na tor odsunięty o promień." },
  { t: "ul", items: [
    "blok włączający to **G00 albo G01** — nigdy G02/G03,",
    "jego długość musi być **większa niż promień** narzędzia, najlepiej co najmniej 1,5 raza,",
    "ruch prowadzi **z zewnątrz materiału** do początku konturu,",
    "wyłączenie `G40` też wymaga ruchu — odjazdu od detalu.",
  ] },
  { t: "diagram", id: "comp-entry" },
  { t: "sim", src: "G21 G90 G17 G54 G40\nT1 M06 (FREZ FI10)\nG43 H1 Z50.\nS2200 M03\nG00 X-20. Y-20. Z5.\nG01 Z-3. F100\nG41 D1 G01 X0. Y0. F350\nG01 Y40.\nX60.\nY0.\nX0.\nG40 G01 X-20. Y-20.\nG00 Z5.\nM30", caption: "Program opisuje prostokąt 60 × 40 z rysunku. Przycisk „Tor rzeczywisty (G41/G42)” pokazuje środek freza odsunięty o 5 mm, przerywana linia — kontur z programu." },

  { t: "h", x: "Wejście styczne" },
  { t: "p", x: "Dojazd prostopadły zostawia na ściance ślad w miejscu wejścia. Lepiej włączyć korekcję na odcinku, a potem wejść na kontur **łukiem stycznym** o promieniu większym niż promień freza — tak samo wyjść." },
  { t: "diagram", id: "f43-leadin" },
  { t: "sim", src: "G21 G90 G17 G54 G40\nT1 M06 (FREZ FI10)\nG43 H1 Z50.\nS2400 M03\nG00 X-25. Y10. Z5.\nG01 Z-3. F100\nG41 D1 G01 X-10. Y0. F350\nG03 X0. Y10. R10.\nG01 Y40.\nX60.\nY0.\nX0.\nY10.\nG03 X-10. Y20. R10.\nG40 G01 X-25. Y10.\nG00 Z5.\nM30", caption: "Łuk R10 wprowadza frez stycznie do ścianki i wyprowadza go tak samo — bez uskoku na powierzchni." },

  { t: "h", x: "Ograniczenia geometrii" },
  { t: "ul", items: [
    "**Naroże wewnętrzne o promieniu mniejszym niż promień freza** — niewykonalne. Frez ⌀12 nie zrobi naroża R4; sterownik zgłosi alarm albo zostawi materiał.",
    "**Rowek węższy niż średnica freza** — tor po jednej ścianie przecina tor po drugiej, alarm przecięcia.",
    "**Bardzo krótki element konturu** przy zmianie kierunku — możliwe podcięcie; sterownik ostrzega, gdy wykryje przecięcie w buforze.",
    "**Zmiana G41 na G42 bez G40** — zachowanie zależy od sterownika, lepiej wyłączyć i włączyć od nowa.",
  ] },

  { t: "h", x: "Na tokarce" },
  { t: "p", x: "Na tokarce promieniem korekcji jest **promień naroża płytki rε**. Nóż mierzy się do teoretycznego wierzchołka P, więc bez korekcji fazy, stożki i łuki wychodzą z błędem kształtu — na fazie 45° około **0,414 · rε**. Oprócz promienia sterowanie potrzebuje **kierunku ostrza T** (0–9)." },
  { t: "diagram", id: "t41-sides" },
  { t: "table", head: ["Obróbka na tokarce", "Kod"], rows: [
    ["zewnętrzna, w stronę uchwytu", "`G42`"],
    ["wewnętrzna (wytaczanie), w stronę uchwytu", "`G41`"],
  ] },
  { t: "demo", mode: "lathe", title: "G42 na tokarce — faza i promienie", src: "G18 G21 G40 G80 G99\nG54\nT0101 (NOZ R0.8, KIERUNEK OSTRZA 3)\nG96 S200 M03\nG42 G00 X14. Z2.\nG01 X20. Z-1. F0.1\nZ-5.\nG02 X24. Z-7. R2.\nG01 X26.\nG03 X28. Z-8. R1.\nG01 Z-12.\nG40 G00 X32.\nM30", caption: "Pomarańczowy pas to ślad naroża płytki. Z G42 przylega do konturu z programu także na fazie i promieniach." },

  { t: "h", x: "Dobre praktyki" },
  { t: "ul", items: [
    "**Numer D = numer narzędzia** (T1 → D1). Pomyłkę widać wtedy od razu.",
    "**G40 w bloku bezpiecznego startu** i przed każdą wymianą narzędzia.",
    "**Kontur wykańczający z korekcją, zgrubny — bez niej** z naddatkiem: przy obróbce zgrubnej liczy się materiał, nie wymiar.",
    "**Wymiar koryguj w zużyciu**, nie w geometrii — geometria to zmierzony promień, zużycie to poprawka.",
  ] },

  { t: "h", x: "Fanuc kontra Sinumerik" },
  { t: "table", head: ["Zagadnienie", "Fanuc", "Sinumerik"], rows: [
    ["Włączenie", "`G41 D1`", "`G41` — korektor z `T1 D1`"],
    ["Rejestr", "tabela korekcji: geometria i zużycie", "dane narzędzia: promień i zużycie promienia"],
    ["Sposób najazdu", "ruch prostoliniowy", "prostoliniowy; `NORM` / `KONT` / `KONTC` / `KONTT` sterują najazdem"],
    ["Naroża zewnętrzne", "łuk albo przecięcie — parametr", "`G450` — łuk, `G451` — przecięcie"],
    ["Najazd miękki", "programowany ręcznie (łuk)", "gotowe funkcje `G147`/`G148`, `G247`/`G248`, `G347`/`G348`"],
  ] },

  { t: "h", x: "Typowe błędy" },
  { t: "ul", items: [
    "**Włączenie korekcji w bloku z łukiem** — alarm.",
    "**Blok włączający krótszy niż promień** — alarm przecięcia albo podcięcie naroża.",
    "**Zapomniane G40** przed wymianą narzędzia — następne narzędzie pracuje z korekcją poprzedniego.",
    "**D pomylone z H** — H to rejestr długości. Długość wpisana jako promień odsuwa tor o kilkadziesiąt milimetrów.",
    "**Zła strona** — G42 zamiast G41 na konturze zewnętrznym prowadzi frez po wewnętrznej stronie. Dla prostokąta z narożami R ≥ promień freza każda krawędź przesuwa się do środka o średnicę freza, więc każdy wymiar zewnętrzny maleje o dwie średnice (Ø10: 80 × 50 → 60 × 30). Przy innych kształtach skutek zależy od geometrii — naroża wewnętrzne mniejsze od promienia dają alarm albo podcięcie.",
    "**Zmiana wymiaru o całą odchyłkę** — przy konturze zewnętrznym korekcję D zmienia się o połowę odchyłki wymiaru.",
  ] },
];

const g43g49: Block[] = [
  { t: "p", x: "**G43** włącza **korekcję długości narzędzia**: sterownik dodaje do Z długość zapisaną w rejestrze **H**. Program pisze się wtedy względem zera detalu, a to, jak długo wystaje narzędzie z oprawki, załatwia tabela korekcji." },

  { t: "h", x: "Co dokładnie robi sterownik" },
  { t: "p", x: "Pozycja maszynowa końca narzędzia to suma trzech składników: przesunięcia zera detalu w Z, współrzędnej Z z programu i długości narzędzia z rejestru H. Po G43 sterownik przelicza wszystkie kolejne ruchy w Z tak, żeby **koniec narzędzia** — a nie czoło wrzeciona — trafiał w zaprogramowane Z." },
  { t: "diagram", id: "f41-length" },
  { t: "code", x: "Z maszynowe = Z przesunięcia (G54) + Z z programu + H\nprzykład:    −400,000     +   (−5,000)    + 150,000 = −255,000", caption: "Dłuższe narzędzie (większe H) zatrzymuje wrzeciono wyżej — koniec narzędzia i tak trafia w Z−5." },

  { t: "h", x: "Skąd bierze się wartość H" },
  { t: "table", head: ["Metoda", "Jak", "Kiedy"], rows: [
    ["dotyk na detalu", "koniec narzędzia sprowadzony na powierzchnię (papier, czujnik), pozycja zapisana do rejestru", "pojedyncze sztuki, brak przedustawiacza"],
    ["przedustawiacz", "pomiar poza maszyną, wynik wpisany do rejestru", "narzędzia używane wielokrotnie w tych samych oprawkach"],
    ["sonda narzędziowa", "maszyna sama mierzy długość na stole", "produkcja, pomiar po każdej wymianie lub kontrola zużycia"],
  ] },
  { t: "note", kind: "warn", x: "**Numer H = numer narzędzia.** Aktywne H3 przy narzędziu T5 znaczy, że maszyna liczy Z dla innej długości. Jeśli T5 jest dłuższe, wchodzi w detal albo w stół ruchem szybkim." },

  { t: "h", x: "Składnia i kody" },
  { t: "table", head: ["Kod", "Działanie"], rows: [
    ["`G43`", "dodaje długość z rejestru H — standard"],
    ["`G44`", "odejmuje długość — rzadkie, zależne od konwencji pomiaru"],
    ["`G49`", "wyłącza korekcję długości"],
    ["`H`", "numer rejestru długości"],
  ] },
  { t: "code", x: "T2 M06\nG43 H2 Z50.       (korekcja razem z ruchem na wysokość bezpieczną)\nS2000 M03\n…\nG49               (wyłączenie — w bloku startowym i przed powrotem na referencję)" },

  { t: "h", x: "Włączenie razem z ruchem w Z" },
  { t: "p", x: "Samo `G43 H2` bez Z na wielu sterownikach nic nie zmienia aż do następnego ruchu w Z — a wtedy narzędzie przeskakuje o całą różnicę długości. Dlatego G43 pisze się **w bloku z dojazdem na wysokość bezpieczną**, np. `G43 H2 Z50.`. Ten ruch idzie z prędkością szybką, więc wysokość musi być naprawdę bezpieczna — także dla najdłuższego narzędzia w magazynie." },
  { t: "sim", src: "G21 G90 G17 G54 G40 G49 G80\nT2 M06 (FREZ FI10)\nG43 H2 Z50.\nS2000 M03\nG00 X20. Y20.\nG00 Z2.\nM08\nG01 Z-4. F120\nG01 X70. F400\nG01 Y50.\nG00 Z50.\nM09\nM05\nG91 G28 Z0.\nG90\nM30", caption: "Szkielet obróbki jednym narzędziem: wymiana, korekcja długości z ruchem na Z50, obróbka i odjazd na referencję." },

  { t: "h", x: "Zużycie długości" },
  { t: "p", x: "Tak jak przy promieniu, rejestr H ma **geometrię** i **zużycie**. Głębokość wyszła 5,03 zamiast 5,00? Frez wszedł za głęboko — zużycie długości zmieniasz o **+0,03**, a program zostaje bez zmian." },

  { t: "h", x: "Na tokarce" },
  { t: "p", x: "Tokarki nie używają G43. Długość noża w Z i jego położenie w X zapisane są w **korekcji geometrii**, którą włącza słowo T: `T0101` — nóż z pozycji 1 z korekcją 1. `T0100` wyłącza korekcję. Zasada jest ta sama: program pisze się względem zera detalu, różnice między nożami bierze na siebie tabela." },

  { t: "h", x: "Fanuc kontra Sinumerik" },
  { t: "table", head: ["Zagadnienie", "Fanuc", "Sinumerik"], rows: [
    ["Włączenie", "`G43 H_` z ruchem w Z", "samo wywołanie `T_ D_` (po wymianie)"],
    ["Wyłączenie", "`G49`", "`D0`"],
    ["Rejestr", "tabela: długość (geometria + zużycie)", "dane ostrza: długości L1–L3 i zużycie"],
  ], caption: "Sinumerik nie ma G43 — długość jest częścią danych ostrza D i działa od chwili jego wybrania." },

  { t: "h", x: "Dobre praktyki" },
  { t: "ul", items: [
    "`G49` w bloku bezpiecznego startu — żadna korekcja nie zostaje z poprzedniego programu.",
    "`G43 H_` zawsze w pierwszym ruchu w Z po wymianie, na wysokość bezpieczną.",
    "Po przełożeniu narzędzia w oprawce — nowy pomiar długości.",
    "Przy pierwszym przebiegu zmniejsz korektor ruchu szybkiego i sprawdź odczyt „pozostało do przejechania” przed zejściem w Z.",
  ] },

  { t: "h", x: "Typowe błędy" },
  { t: "ul", items: [
    "**H niezgodne z T** — najczęstsza przyczyna uderzenia narzędzia w stół.",
    "**Brak G43 po wymianie** — maszyna liczy Z od czoła wrzeciona; koniec narzędzia jest o całą jego długość niżej, niż myślisz.",
    "**G43 bez ruchu w Z** — skok o różnicę długości przy pierwszym ruchu w Z, często już blisko detalu.",
    "**Pomiar przy innym wysięgu** — narzędzie przełożone w oprawce, rejestr stary.",
    "**Korekta głębokości w programie zamiast w zużyciu** — każda wymiana narzędzia wymaga wtedy poprawiania programu.",
  ] },
];

export const korekcje: Record<string, Block[]> = { "g40-g42": g40g42, "g43-g49": g43g49 };
