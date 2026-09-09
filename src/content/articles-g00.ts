import type { Block } from "@/lib/article";

/*
  Karta G00 — układ referencyjny: czym jest, składnia, modalność,
  zastosowania, bezpieczeństwo, przykłady, sterowniki, błędy.
  Treść własna; pojęcia oznaczone [[...]] mają podpowiedzi.
*/

export const g00: Block[] = [
  { t: "p", x: "**G00** to polecenie szybkiego przejazdu. Mówi maszynie: przejedź z miejsca, w którym jesteś, do podanego punktu tak szybko, jak pozwalają napędy. Nie służy do skrawania — narzędzie ma w tym czasie nie dotykać materiału." },

  { t: "h", x: "Czym różni się od ruchu roboczego" },
  { t: "p", x: "Przy [[G01]] podajesz posuw i sterownik pilnuje, żeby wypadkowa prędkość końcówki narzędzia była dokładnie taka, jak zapisałeś. Przy G00 nie decydujesz o prędkości — jest ona ustawiona przez producenta maszyny i zwykle wynosi od kilkunastu do kilkudziesięciu metrów na minutę. Adres `F` w bloku z G00 jest ignorowany." },
  { t: "table", head: ["", "G00", "G01"], rows: [
    ["Prędkość", "Maksymalna maszyny, niezmienialna z programu", "Zadana adresem F"],
    ["Tor", "Zależny od maszyny, zwykle łamany", "Zawsze linia prosta"],
    ["Zastosowanie", "Dojazdy i odjazdy w powietrzu", "Skrawanie"],
    ["Ryzyko", "Kolizja przy błędzie w współrzędnych", "Złamanie narzędzia przy złym posuwie"],
  ] },

  { t: "h", x: "Składnia" },
  { t: "code", x: "G00 X85.4 Y32.0 Z12.5", caption: "Zapis w Fanuc i Sinumerik jest identyczny; Sinumerik dopuszcza skróconą postać `G0`." },
  { t: "table", head: ["Adres", "Znaczenie"], rows: [
    ["X, Y, Z", "Współrzędne punktu docelowego. Interpretowane bezwzględnie przy [[G90]] albo przyrostowo przy [[G91]]"],
    ["A, B, C", "Osie obrotowe na maszynach cztero- i pięcioosiowych"],
    ["F", "Ignorowany — prędkość szybkiego przejazdu jest parametrem maszyny"],
  ] },
  { t: "p", x: "Nie musisz podawać wszystkich osi. Blok `G00 Z50` przesunie wyłącznie oś Z, pozostałe zostaną na swoich miejscach. To bardzo częsty zapis przy odjeździe na wysokość bezpieczną." },

  { t: "h", x: "G00 jest funkcją modalną" },
  { t: "p", x: "Raz włączone G00 obowiązuje aż do wywołania innej funkcji ruchu z tej samej grupy: [[G01]], [[G02]] albo [[G03]]. Dzięki temu ciąg dojazdów można zapisać bez powtarzania kodu w każdej linii." },
  { t: "code", x: "N10 G00 X20 Y15      (szybki przejazd nad punkt startu)\nN20 Z5               (nadal G00 — tylko oś Z)\nN30 X60              (nadal G00 — tylko oś X)\nN40 G01 Z-3 F120     (dopiero tu przechodzimy na posuw roboczy)", caption: "Bloki N20 i N30 nie zawierają G00, ale wykonują się jako szybkie przejazdy, bo funkcja pozostaje aktywna." },
  { t: "note", kind: "warn", x: "Ta sama właściwość działa w drugą stronę i bywa groźna. Jeżeli w programie zostało aktywne G00, a Ty w kolejnym bloku wpiszesz same współrzędne, spodziewając się ruchu roboczego — narzędzie pojedzie z pełną prędkością. Przy zagłębianiu w materiał kończy się to złamanym frezem." },
  { t: "p", x: "Sam blok `G00`, bez współrzędnych, nie wykonuje żadnego ruchu. Ustawia tylko tryb." },

  { t: "h", x: "Do czego się go używa" },
  { t: "ul", items: [
    "**Dojazd nad detal** przed rozpoczęciem obróbki — najdłuższy odcinek drogi narzędzie pokonuje w powietrzu.",
    "**Odjazd na wysokość bezpieczną** po zakończeniu przejścia.",
    "**Przejazd między obszarami obróbki**, na przykład od jednej kieszeni do drugiej.",
    "**Dojazd do pozycji wymiany narzędzia** przed obrotem magazynu albo [[głowica rewolwerowa|głowicy rewolwerowej]].",
    "**Wycofanie w cyklach stałych** — sterownik używa G00 wewnętrznie, wracając z dna otworu do płaszczyzny R.",
  ] },

  { t: "h", x: "Tor nie jest linią prostą" },
  { t: "p", x: "To najważniejsza rzecz do zrozumienia przy G00. Sterownik uruchamia wszystkie osie **jednocześnie, każdą z jej własną maksymalną prędkością**. Oś, która ma do pokonania krótszą drogę, kończy ruch wcześniej — od tego momentu porusza się już tylko druga oś." },
  { t: "diagram", id: "rapid-path" },
  { t: "p", x: "Efekt: tor wypadkowy składa się z odcinka skośnego i dobiegu wzdłuż jednej osi. Przekątna, którą podpowiada intuicja, to tor, którego maszyna **nie** wykona. Część sterowników potrafi wymusić ruch prostoliniowy — w Fanuc odpowiada za to parametr maszynowy, w Sinumerik polecenia `RTLION` i `RTLIOF` — ale nie zakładaj tego z góry." },

  { t: "h", x: "Bezpieczny dojazd" },
  { t: "p", x: "Skoro nie wiesz dokładnie, którędy pojedzie narzędzie, musisz zaplanować drogę tak, żeby **żaden z możliwych torów** nie prowadził przez przeszkodę. Praktyczna zasada: nie łącz ruchu w płaszczyźnie XY z ruchem w osi Z, kiedy w pobliżu są zaciski albo detal." },
  { t: "diagram", id: "rapid-clamp" },
  { t: "ol", items: [
    "Podnieś oś Z na wysokość bezpieczną, ponad wszystko, co stoi na stole.",
    "Przejedź w płaszczyźnie XY nad punkt, w którym zaczynasz obróbkę.",
    "Zejdź w osi Z do płaszczyzny bezpiecznej, typowo 2–5 mm nad materiałem.",
    "Dopiero teraz przejdź na [[G01]] i zagłębiaj się na głębokość skrawania.",
  ] },
  { t: "code", x: "G00 Z50          (najpierw wysoko)\nG00 X40 Y25      (potem nad miejsce obróbki)\nG00 Z2           (dopiero teraz w dół, nad materiał)\nG01 Z-3 F120     (zagłębienie na posuwie roboczym)", caption: "Kolejność, która eliminuje większość kolizji przy dojeździe." },

  { t: "h", x: "Wskazówki z praktyki" },
  { t: "ul", items: [
    "**Pierwsze uruchomienie z obniżoną prędkością.** Pokrętło Rapid Override na pulpicie ustaw na 5–25%, korekcję posuwu na 50%, rękę trzymaj nad przyciskiem zatrzymania. To jedyny moment, w którym błąd w [[zero detalu|zerze detalu]] ujawnia się fizycznie.",
    "**Uważaj na kropkę dziesiętną.** Na sterownikach Fanuc `Z50` i `Z50.` mogą znaczyć co innego: bez kropki liczba bywa interpretowana w najmniejszych jednostkach programowania, czyli 50 mikrometrów zamiast 50 milimetrów. Wpisuj kropkę konsekwentnie.",
    "**Nie podjeżdżaj zbyt blisko.** Zostaw miejsce na dojazd w [[kompensacja promienia|kompensacji promienia]] i na wejście styczne w materiał.",
    "**Pamiętaj o korekcji długości.** Bez aktywnego [[G43]] sterownik liczy pozycję Z od czoła wrzeciona, a nie od ostrza narzędzia.",
    "**Sprawdź, gdzie kończy się poprzednie narzędzie.** Program zaczynający się od `G00 X0 Y0` wykona dojazd z dowolnego miejsca, w którym zostawił maszynę poprzedni zabieg.",
  ] },

  { t: "h", x: "Przykład — porównaj oba warianty" },
  { t: "sim", src: "G21 G90 G17 G54\nT01 M06\nS2200 M03\nG00 Z50\nG00 X20 Y15\nG00 Z2\nG01 Z-3 F120\nG01 X80 F400\nG01 Y45\nG01 X20\nG01 Y15\nG00 Z50\nM05\nM30", caption: "Uruchom i prześledź krokami. Żółte linie przerywane to szybkie przejazdy, zielone ciągłe — ruch roboczy. Zwróć uwagę, że zagłębienie na Z−3 wykonuje G01, a nie G00." },

  { t: "h", x: "Różnice między sterownikami" },
  { t: "table", head: ["Zagadnienie", "Fanuc", "Sinumerik", "Heidenhain"], rows: [
    ["Zapis", "`G00` lub `G0`", "`G0`", "`L X.. Y.. R0 FMAX`"],
    ["Wymuszenie toru prostego", "Parametr maszynowy (LRP)", "`RTLION` / `RTLIOF`", "Domyślnie prostoliniowy"],
    ["Prędkość", "Parametr maszyny, korygowana pokrętłem", "Parametr maszyny, korygowana pokrętłem", "`FMAX`, korygowana pokrętłem"],
  ] },
  { t: "note", kind: "info", x: "W dialekcie Heidenhain w trybie konwersacyjnym szybki przejazd zapisuje się jako ruch liniowy z posuwem `FMAX`. Znaczenie jest to samo: jedź najszybciej, jak potrafisz." },

  { t: "h", x: "Typowe błędy" },
  { t: "ul", items: [
    "**Zagłębienie na G00 zamiast G01.** Jedna cyfra różnicy, a narzędzie wbija się w detal z pełną prędkością.",
    "**Założenie prostoliniowego toru.** Przejazd tuż obok zacisku po przekątnej kończy się jego zaczepieniem.",
    "**Odziedziczone G00 przed konturem.** Blok z samymi współrzędnymi po wcześniejszym G00 nadal jest szybkim przejazdem.",
    "**`G90 G28 Z0` zamiast `G91 G28 Z0`.** Maszyna jedzie najpierw do Z0 detalu, czyli w materiał. Opisane szerzej na karcie [[G28]].",
    "**Brak odjazdu przed wymianą narzędzia.** Magazyn albo głowica potrzebują określonej pozycji — inaczej dojdzie do kolizji przy obrocie.",
  ] },
];
