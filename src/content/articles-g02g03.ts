import type { Block } from "@/lib/article";

/*
  Karta G02/G03 — interpolacja kołowa. Treść wspólna dla obu kodów,
  różnicowana tylko tam, gdzie kierunek ma znaczenie.
*/

const build = (cw: boolean): Block[] => {
  const G = cw ? "G02" : "G03";
  const other = cw ? "G03" : "G02";
  const dirWord = cw ? "zgodnie z ruchem wskazówek zegara" : "przeciwnie do ruchu wskazówek zegara";

  return [
    { t: "p", x: `**${G}** prowadzi narzędzie po **łuku okręgu** z aktualnego położenia do zadanego punktu, **${dirWord}**, z prędkością zadaną adresem F. Razem z **${other}** tworzy parę funkcji nazywaną interpolacją kołową — to nią wykonuje się wszystkie zaokrąglenia, promienie i otwory frezowane z ruchu obrotowego.` },
    { t: "note", kind: "info", x: `Ta karta opisuje obie funkcje. ${G} i ${other} działają identycznie i mają tę samą składnię — różni je wyłącznie kierunek obiegu łuku.` },

    { t: "h", x: "Jak sterownik ustala kierunek" },
    { t: "p", x: "Kierunek określa się **patrząc na płaszczyznę roboczą od strony dodatniej osi do niej prostopadłej**. Dla płaszczyzny XY ([[G17]]) patrzysz z góry, wzdłuż osi Z w kierunku ujemnym — tak, jak stoisz przy frezarce i patrzysz na stół. Dla płaszczyzny ZX ([[G18]]), typowej dla tokarki, patrzysz od strony dodatniej osi Y, czyli od operatora." },
    { t: "note", kind: "warn", x: "Na tokarce ta reguła bywa myląca, bo część maszyn ma narzędzie pod osią detalu i obraz jest wtedy odwrócony. Przy standardowym układzie z osią X w górę i Z w prawo: **zaokrąglenie wklęsłe w narożu stopnia** to G02, a **wypukłe na krawędzi** to G03. Warto to raz sprawdzić na próbnym detalu." },

    { t: "h", x: "Trzy rzeczy, które trzeba podać" },
    { t: "p", x: "Łuk jest jednoznacznie opisany przez kierunek, punkt końcowy i środek. Punkt początkowy sterownik już zna — to miejsce, w którym narzędzie stoi. Środek podaje się na dwa sposoby: wektorem **I, J, K** albo promieniem **R**." },
    { t: "code", x: `${G} X_ Y_ I_ J_ F_      (zapis wektorowy — środek względem punktu startu)\n${G} X_ Y_ R_ F_          (zapis promieniowy)`, caption: "Obie postacie są równoważne dla łuków do 180°; powyżej różnią się jednoznacznością." },
    { t: "table", head: ["Adres", "Znaczenie"], rows: [
      ["X, Y, Z", "Punkt końcowy łuku ([[G90]] — bezwzględnie, [[G91]] — przyrostowo)"],
      ["I, J, K", "Składowe **wektora od punktu początkowego łuku do jego środka**, odpowiednio wzdłuż X, Y i Z. Prawie zawsze przyrostowe, nawet w trybie G90"],
      ["R", "Promień łuku. Wartość dodatnia wybiera łuk krótszy (≤180°), ujemna — dłuższy (>180°)"],
      ["F", "Posuw mierzony wzdłuż łuku"],
    ] },
    { t: "note", kind: "warn", x: "Adresy I, J, K liczy się od **punktu startu łuku**, a nie od zera detalu. To najczęstsza pomyłka u osób przepisujących wymiary wprost z rysunku, gdzie środek okręgu podany jest bezwzględnie." },

    { t: "h", x: "Które litery w której płaszczyźnie" },
    { t: "table", head: ["Płaszczyzna", "Osie ruchu", "Adresy środka"], rows: [
      ["**[[G17]]** — XY (frezowanie)", "X, Y", "I, J"],
      ["**[[G18]]** — ZX (toczenie)", "X, Z", "I, K"],
      ["**[[G19]]** — YZ", "Y, Z", "J, K"],
    ], caption: "Użycie litery spoza aktywnej płaszczyzny — na przykład J przy G18 — kończy się alarmem albo torem zupełnie innym niż zamierzony." },
    { t: "diagram", id: "g02" },

    { t: "h", x: "Przykład 1 — zapis wektorowy I/J" },
    { t: "demo", title: `${G} z wektorem I, J`,
      src: `G21 G90 G17 G54\nS2200 M03\nG00 X20 Y20 Z2\nG01 Z-2 F120\n${G} X50 Y50 ${cw ? "I30 J0" : "I0 J30"} F350\nG00 Z10\nM30`,
      caption: `Narzędzie startuje w punkcie (20, 20) i kończy w (50, 50). Wektor ${cw ? "I30 J0 prowadzi do środka w punkcie (50, 20)" : "I0 J30 prowadzi do środka w punkcie (20, 50)"} — stąd promień 30 mm. Zwróć uwagę na podpisy współrzędnych pojawiające się na torze.` },

    { t: "h", x: "Przykład 2 — zapis promieniowy R" },
    { t: "demo", title: `${G} z promieniem R`,
      src: `G21 G90 G17 G54\nS2200 M03\nG00 X20 Y20 Z2\nG01 Z-2 F120\n${G} X50 Y50 R30 F350\nG00 Z10\nM30`,
      caption: "Ten sam łuk zapisany krócej. Sterownik sam liczy środek, wybierając wariant krótszy niż półokrąg. Zapis czytelniejszy, ale ograniczony — dlaczego, wyjaśnia następny przykład." },

    { t: "h", x: "Przykład 3 — łuk dłuższy niż 180°" },
    { t: "p", x: "Przez dwa punkty i zadany promień przechodzą **dwa różne łuki**: krótszy i dłuższy. Znak przy R decyduje, który wybierze sterownik. Wartość ujemna oznacza łuk rozwarty." },
    { t: "demo", title: `${G} z promieniem ujemnym`,
      src: `G21 G90 G17 G54\nS2200 M03\nG00 X20 Y20 Z2\nG01 Z-2 F120\n${G} X50 Y50 R-30 F350\nG00 Z10\nM30`,
      caption: "Te same punkty, ten sam promień, znak przy R zmieniony na ujemny — narzędzie obiega detal drugą stroną. Porównaj z poprzednią animacją." },

    { t: "h", x: "Przykład 4 — pełny okrąg" },
    { t: "p", x: "Gdy punkt początkowy pokrywa się z końcowym, promień przestaje wystarczać: takich okręgów jest nieskończenie wiele. Dlatego **pełne koło zapisuje się wyłącznie przez I/J/K**, pomijając współrzędne końcowe." },
    { t: "demo", title: "Pełny okrąg jednym blokiem",
      src: `G21 G90 G17 G54\nS2400 M03\nG00 X30 Y30 Z2\nG01 Z-2 F120\n${G} I20 J0 F320\nG00 Z10\nM30`,
      caption: "Brak X i Y w bloku łuku oznacza dla sterownika: wróć do punktu, z którego wyszedłeś. Środek leży 20 mm w prawo od startu, więc powstaje okrąg o promieniu 20 mm." },

    { t: "h", x: "Kalkulator zamiany R ↔ I, J", id: "kalkulator-zamiany-r-i-j" },
    { t: "p", x: "Wpisz punkty i promień, a zobaczysz gotowe I, J wraz z geometrią łuku: położenie środka, kąt rozwarcia, długość łuku, cięciwę i strzałkę. Kalkulator ostrzega też, gdy zadany promień jest za mały, żeby łuk w ogóle istniał." },
    { t: "widget", id: "arc" },

    { t: "h", x: "Skąd biorą się te wzory" },
    { t: "p", x: "Mając punkt startu (X₁, Y₁), punkt końcowy (X₂, Y₂) i promień R, środek wyznacza się w trzech krokach:" },
    { t: "ol", items: [
      "Środek cięciwy: Mx = (X₁ + X₂) / 2, My = (Y₁ + Y₂) / 2.",
      "Długość cięciwy: d = √((X₂ − X₁)² + (Y₂ − Y₁)²). Łuk istnieje tylko wtedy, gdy |R| ≥ d / 2.",
      "Odległość środka okręgu od środka cięciwy: h = √(R² − (d/2)²).",
    ] },
    { t: "p", x: "Środek leży na prostopadłej do cięciwy, w odległości h od jej środka — po jednej albo po drugiej stronie, zależnie od kierunku obiegu i znaku R. Na koniec przelicza się go na wektor przyrostowy: **I = Xśrodka − X₁**, **J = Yśrodka − Y₁**. W drugą stronę jest prościej: **R = √(I² + J²)**." },
    { t: "p", x: "Warto znać jeszcze dwie wielkości, bo pojawiają się przy dobieraniu narzędzia: **kąt rozwarcia** łuku i **strzałkę**, czyli największą odległość łuku od cięciwy. Strzałka mówi, ile materiału zostaje w narożniku, jeśli zamiast łuku wykonasz prosty odcinek." },

    { t: "h", x: "Interpolacja śrubowa" },
    { t: "p", x: "Jeżeli oprócz łuku w płaszczyźnie roboczej podasz również przesunięcie w osi prostopadłej, sterownik wykona **ruch po helisie** — łuk z jednoczesnym zagłębianiem. Technika stosowana przy:" },
    { t: "ul", items: [
      "**łagodnym wejściu w materiał** zamiast zagłębiania pionowego — narzędzie stopniowo nabiera głębokości po okręgu,",
      "**frezowaniu gwintów** frezem do gwintów: jeden pełny obrót z przesunięciem w Z równym skokowi,",
      "**wytaczaniu otworów** frezem o średnicy mniejszej niż otwór.",
    ] },
    { t: "diagram", id: "helix" },
    { t: "demo", title: "Wejście po helisie",
      src: `G21 G90 G17 G54\nS3000 M03\nG00 X10 Y30 Z2\nG01 Z0 F150\n${G} X10 Y30 Z-2 I20 J0 F300\n${G} X10 Y30 Z-4 I20 J0\n${G} X10 Y30 Z-6 I20 J0\nG00 Z10\nM30`,
      caption: "Trzy pełne obroty, każdy o 2 mm głębiej. W rzucie z góry widać okrąg — włącz widok 3D w symulatorze, żeby zobaczyć powstający rowek kołowy." },

    { t: "h", x: "Wskazówki technologiczne" },
    { t: "ul", items: [
      "**Zaokrąglaj naroża konturu.** Ostry zwrot o 90° oznacza chwilowe zatrzymanie osi i skok obciążenia. Łuk o promieniu choćby 2 mm daje płynny ruch, lepszą powierzchnię i dłuższą żywotność ostrza.",
      "**Wchodź w materiał po łuku.** Wejście styczne zamiast prostopadłego dojazdu eliminuje ślad na powierzchni obrobionej.",
      "**Uważaj na luzy przy ćwiartkach.** Pełny okrąg wymaga czterech zmian kierunku osi; każdy luz w śrubie odwzorowuje się jako widoczny uskok. To klasyczny test dokładności maszyny.",
      "**Sprawdź promień narzędzia przy łukach wewnętrznych.** Łuk wklęsły o promieniu mniejszym niż promień freza jest fizycznie niewykonalny — z aktywną [[kompensacja promienia|kompensacją]] skończy się alarmem, bez niej podcięciem konturu.",
      "**Posuw na łuku wewnętrznym jest efektywnie większy.** Przy zaokrągleniu wklęsłym środek narzędzia pokonuje krótszą drogę niż jego krawędź, więc rzeczywista grubość wióra rośnie. Przy małych promieniach warto zejść z posuwem.",
    ] },

    { t: "h", x: "Różnice między sterownikami" },
    { t: "table", head: ["Zagadnienie", "Fanuc", "Sinumerik", "Heidenhain"], rows: [
      ["Kod", "`G02` / `G03`", "`G2` / `G3`", "`C` z `DR+` albo `DR-`"],
      ["Promień", "`R`", "`CR=`", "`CR`"],
      ["Środek", "I, J, K przyrostowo", "I, J, K przyrostowo; `AC()` wymusza bezwzględnie", "`CC X.. Y..` jako osobny blok"],
      ["Pełny okrąg", "tylko I/J/K", "tylko I/J/K", "`CC` + `C` z tym samym punktem"],
      ["Łuk przez punkt pośredni", "brak", "`CIP` z `I1= J1=`", "brak"],
      ["Łuk przez kąt rozwarcia", "brak", "`AR=`", "brak"],
      ["Zaokrąglenie naroża", "`R` w bloku G01 (część sterowników)", "`RND=`", "`RND`"],
    ] },
    { t: "note", kind: "warn", x: "Jeżeli w jednym bloku podasz **jednocześnie R oraz I/J**, większość sterowników przyjmie R i po cichu zignoruje I/J. To bywa powodem zagadkowych rozbieżności między symulacją a maszyną." },

    { t: "h", x: "Typowe błędy" },
    { t: "ul", items: [
      "**I/J liczone od zera detalu zamiast od startu łuku** — tor odjeżdża w zupełnie inne miejsce.",
      "**Próba pełnego okręgu przez R** — alarm albo brak ruchu.",
      "**Zły znak przy R** — zamiast małego zaokrąglenia powstaje prawie pełne koło.",
      "**Litera środka niezgodna z płaszczyzną** — J przy G18 albo K przy G17.",
      "**Włączenie [[G41]] lub [[G42]] w bloku z łukiem** — kompensację można uruchomić tylko w ruchu prostoliniowym.",
      "**Promień mniejszy niż połowa cięciwy** — łuk geometrycznie nie istnieje, sterownik zgłasza błąd.",
      "**Zaokrąglenie wewnętrzne mniejsze od promienia freza** — narzędzie fizycznie nie wejdzie w naroże.",
    ] },
  ];
};

export const g02 = build(true);
export const g03 = build(false);
