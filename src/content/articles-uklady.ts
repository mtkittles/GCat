import type { Block } from "@/lib/article";

/* Karty ★: układy i tryby — G54–G59, G90/G91, G17–G19, G20/G21, G94/G95. */

const g54g59: Block[] = [
  { t: "p", x: "**G54–G59** wybierają jeden z sześciu **układów współrzędnych detalu**. W każdym rejestrze sterownik trzyma przesunięcie od zera maszyny do zera detalu. Program pisze się względem detalu, a to, gdzie detal leży na stole, załatwia rejestr." },

  { t: "h", x: "Co dokładnie robi sterownik" },
  { t: "p", x: "Pozycja, do której jedzie maszyna, to suma przesunięcia z aktywnego rejestru i współrzędnej z programu. Zmiana `G54` na `G55` nie zmienia ani jednego bloku programu — zmienia tylko to, do którego przesunięcia sterownik go dolicza." },
  { t: "diagram", id: "f02-points" },
  { t: "code", x: "X maszynowe = X z rejestru G54 + X z programu\n              −320,000       +   40,000   = −280,000", caption: "Ekran pozycji pokazuje obie wartości: „Maszynowe” i „Absolutne” (w układzie detalu)." },
  { t: "table", head: ["Punkt", "Kto go ustala", "Zmienia się?"], rows: [
    ["**M** — zero maszyny", "producent, przy bazowaniu osi", "nigdy"],
    ["**W** — zero detalu", "programista / operator, w rejestrze G54–G59", "przy każdym nowym zamocowaniu"],
    ["zero programu", "zwykle równe W", "—"],
  ] },

  { t: "h", x: "Ustawianie zera" },
  { t: "p", x: "Na frezarce operator dojeżdża do krawędzi czujnikiem krawędziowym albo sondą i zapisuje pozycję do rejestru, uwzględniając promień końcówki. Z ustala się na górnej powierzchni — dotykiem narzędzia wzorcowego albo sondą." },
  { t: "diagram", id: "f03-edge" },
  { t: "code", x: "czujnik ⌀10 dotyka lewej krawędzi w X maszynowym −325,000\nkrawędź = −325,000 + 5,000 = −320,000   → G54 X = −320,000", caption: "Końcówka dotyka krawędzi bokiem, więc do odczytu dodaje się jej promień (w stronę materiału)." },
  { t: "p", x: "Na tokarce X0 jest zawsze na osi obrotu, więc ustala się tylko Z — dotykiem noża na splanowanym czole." },
  { t: "diagram", id: "t03-zero" },

  { t: "h", x: "Gdzie postawić zero detalu" },
  { t: "ul", items: [
    "**Detal prostokątny** — narożnik, od którego wymiarowany jest rysunek; Z na górnej powierzchni. Współrzędne w XY dodatnie, głębokości ujemne.",
    "**Detal symetryczny** — środek, jeśli rysunek wymiaruje od osi symetrii.",
    "**Toczenie** — oś obrotu i czoło gotowego detalu.",
    "**Zasada ogólna** — tam, skąd wymiaruje rysunek. Każde przeliczenie wymiaru to miejsce na błąd.",
  ] },

  { t: "h", x: "Kilka detali, jeden program" },
  { t: "diagram", id: "f03-two" },
  { t: "code", x: "G54\nM98 P1001     (DETAL 1)\nG55\nM98 P1001     (DETAL 2)\nG56\nM98 P1001     (DETAL 3)\nM30", caption: "Trzy imadła, trzy rejestry, jeden podprogram. Zmienia się tylko aktywny układ." },
  { t: "sim", src: "G21 G90 G17 G54\nT1 M06 (FREZ FI10)\nG43 H1 Z50.\nS2000 M03\nG00 X0. Y0. Z5.\nG01 Z-2. F120\nG01 X30. F350\nY20.\nX0.\nY0.\nG00 Z5.\nM30", caption: "Kontur względem zera detalu. Ten sam program z G55 zamiast G54 frezuje w innym miejscu stołu, bez zmiany żadnej współrzędnej." },
  { t: "note", kind: "info", x: "Sześciu układów za mało? Fanuc ma rozszerzenie **G54.1 P1…P48** (w nowszych seriach do P300), Sinumerik — **G505…G599** obok G54–G57." },

  { t: "h", x: "Powiązane funkcje" },
  { t: "table", head: ["Kod", "Działanie"], rows: [
    ["`G52`", "układ lokalny — dodatkowe przesunięcie względem aktywnego G54–G59"],
    ["`G53`", "jednorazowy ruch we współrzędnych maszynowych (np. do wymiany)"],
    ["`G92`", "przypisanie bieżącej pozycji zadanych współrzędnych — metoda sprzed G54"],
    ["`G10 L2 P_`", "wpis przesunięcia do rejestru z programu"],
  ] },

  { t: "h", x: "Fanuc kontra Sinumerik" },
  { t: "table", head: ["Zagadnienie", "Fanuc", "Sinumerik"], rows: [
    ["Podstawowe układy", "`G54`–`G59`", "`G54`–`G57`"],
    ["Rozszerzone", "`G54.1 P_`", "`G505`–`G599`"],
    ["Wyłączenie", "—", "`G500` (przesunięcie zerowe)"],
    ["Przesunięcie dodatkowe", "`G52`", "`TRANS` / `ATRANS`"],
  ] },

  { t: "h", x: "Typowe błędy" },
  { t: "ul", items: [
    "**Pusty rejestr** — układ pokrywa się z zerem maszyny; pierwszy dojazd kończy się kolizją albo alarmem krańcówki.",
    "**Brak G54 w programie** — obowiązuje układ zostawiony przez poprzednią pracę.",
    "**Zero na surowej powierzchni** — nierówny naddatek: pierwsze przejście miejscami nie dotyka materiału, miejscami bierze podwójnie.",
    "**Promień czujnika dodany w złą stronę** — cały detal przesunięty o średnicę końcówki.",
    "**Przełożony detal, stare zero** — nawet w tym samym imadle przesunięcie o dziesiąte części milimetra.",
  ] },
];

const g90g91: Block[] = [
  { t: "p", x: "**G90** i **G91** mówią sterownikowi, jak czytać liczby przy osiach. **G90 (absolutnie)** — współrzędna to punkt względem zera detalu. **G91 (przyrostowo)** — przesunięcie od miejsca, w którym narzędzie teraz stoi." },
  { t: "diagram", id: "f13-absinc" },

  { t: "h", x: "Ten sam blok, dwa różne miejsca" },
  { t: "p", x: "Narzędzie stoi w X20 Y10. Blok `G01 X30. Y20.` znaczy:" },
  { t: "ul", items: [
    "w **G90** — jedź do punktu X30 Y20,",
    "w **G91** — przesuń się o 30 w X i 20 w Y, czyli do X50 Y30.",
  ] },
  { t: "code", x: "wymiar przyrostowy = cel − bieżące położenie\nX: 50 − 20 = 30,   Y: 30 − 10 = 20", caption: "Kontrola: suma przyrostów zamkniętego konturu w każdej osi musi dać zero." },

  { t: "h", x: "Kiedy który tryb" },
  { t: "table", head: ["Zastosowanie", "Tryb", "Dlaczego"], rows: [
    ["kontur z rysunku wymiarowany od bazy", "G90", "liczby przepisuje się wprost z rysunku"],
    ["program główny", "G90", "można go wznowić od dowolnego bloku"],
    ["powtarzalny wzór w podprogramie", "G91", "ten sam fragment działa z dowolnego punktu startu"],
    ["odjazd na punkt referencyjny", "G91", "`G91 G28 Z0.` — w górę bez punktu pośredniego"],
    ["wymiarowanie łańcuchowe na rysunku", "G91", "odległości między elementami są podane wprost"],
  ] },
  { t: "sim", src: "G21 G90 G17 G54\nT1 M06 (FREZ FI10)\nG43 H1 Z50.\nS2000 M03\nG00 X10. Y10. Z5.\nG01 Z-2. F120\nG91\nG01 X30. F350\nY20.\nX-30.\nY-20.\nG90\nG00 Z5.\nG00 X60. Y10.\nG01 Z-2. F120\nG91\nG01 X30. F350\nY20.\nX-30.\nY-20.\nG90\nG00 Z5.\nM30", caption: "Ten sam prostokąt dwa razy: zmienia się tylko punkt startu, fragment przyrostowy jest identyczny." },
  { t: "note", kind: "warn", x: "Program w całości przyrostowy **nie da się bezpiecznie wznowić od środka**: po przerwaniu każdy kolejny ruch liczy się od miejsca, w którym maszyna akurat stoi. Dlatego program główny pisze się w G90, a G91 zostawia na krótkie, zamknięte fragmenty." },

  { t: "h", x: "Tokarki Fanuc: U i W" },
  { t: "p", x: "Na tokarkach Fanuc w systemie A nie ma przełączania trybu — przyrost daje sam adres: **U** dla X i **W** dla Z. Można je mieszać z X i Z w jednym bloku: `G01 X40. W-10.` — na średnicę 40 i 10 mm w stronę uchwytu. **U jest w średnicy**, tak jak X: `U-2.` to 1 mm w stronę osi." },
  { t: "diagram", id: "t12-uw" },
  { t: "note", kind: "warn", x: "W systemie A tokarki Fanuc **G90 to cykl toczenia wzdłużnego**, a nie wymiary absolutne. `G90` przepisane z programu frezarskiego uruchomi cykl." },

  { t: "h", x: "Sinumerik: tryb dla jednej osi" },
  { t: "p", x: "Sinumerik pozwala zmienić tryb dla pojedynczej współrzędnej: `X=IC(10)` — przyrostowo, `X=AC(50)` — absolutnie, niezależnie od aktywnego G90/G91. `G1 X=AC(50) Y=IC(10)` — do X50 i 10 mm dalej w Y." },

  { t: "h", x: "Fanuc kontra Sinumerik" },
  { t: "table", head: ["Zagadnienie", "Fanuc frezarka", "Fanuc tokarka (A)", "Sinumerik"], rows: [
    ["Absolutnie", "`G90`", "X, Z", "`G90` / `AC()`"],
    ["Przyrostowo", "`G91`", "U, W", "`G91` / `IC()`"],
    ["G90 znaczy", "wymiary absolutne", "cykl toczenia", "wymiary absolutne"],
  ] },

  { t: "h", x: "Typowe błędy" },
  { t: "ul", items: [
    "**Brak powrotu do G90** po fragmencie przyrostowym — kolejne bloki jadą w zupełnie inne miejsca.",
    "**`G90 G28 Z0.`** — maszyna jedzie najpierw do Z0 detalu, czyli w materiał. Poprawnie: `G91 G28 Z0.`.",
    "**Podprogram przyrostowy bez domknięcia** — każde powtórzenie przesuwa wzór o nadmiar.",
    "**U liczone w promieniu** na tokarce — zejście o połowę mniejsze niż planowane.",
    "**Tryb zakładany domyślnie** — blok startowy powinien go ustawiać jawnie.",
  ] },
];

const g17g19: Block[] = [
  { t: "p", x: "**G17, G18 i G19** wybierają **płaszczyznę pracy**. Od niej zależą trzy rzeczy: w której płaszczyźnie idą łuki G02/G03, w której działa korekcja promienia G41/G42 i wzdłuż której osi pracują cykle wiertarskie." },
  { t: "diagram", id: "g17-g19" },
  { t: "table", head: ["Kod", "Płaszczyzna", "Środek łuku", "Oś cykli wiertarskich", "Gdzie domyślnie"], rows: [
    ["`G17`", "XY", "I, J", "Z", "frezarka"],
    ["`G18`", "ZX", "I, K", "Y", "tokarka"],
    ["`G19`", "YZ", "J, K", "X", "—"],
  ] },

  { t: "h", x: "Co dokładnie robi sterownik" },
  { t: "p", x: "Płaszczyzna to modalny wybór, który sterownik stosuje do każdego łuku i do korekcji. Kierunek G02 (zgodnie z zegarem) ocenia się, **patrząc z dodatniej strony osi prostopadłej do płaszczyzny**: w G17 — z góry (+Z), w G18 — od strony +Y, w G19 — od strony +X." },
  { t: "note", kind: "info", x: "Dlatego na tokarce kierunek łuku odczytuje się z rysunku z osią X w górę i Z w prawo, a nie z tego, co widać przez szybę. Przy głowicy przedniej łuk G02 wygląda z miejsca operatora na przeciwny — program jest ten sam." },

  { t: "h", x: "Kiedy inna płaszczyzna niż domyślna" },
  { t: "ul", items: [
    "**frezarka, łuk w ścianie bocznej** — G18 lub G19, np. zaokrąglenie krawędzi frezem kulistym w przekroju,",
    "**głowica kątowa, obróbka z boku** — cykle wiertarskie wzdłuż X lub Y,",
    "**interpolacja śrubowa** — płaszczyzna określa, która oś jest osią spirali (w G17 to Z).",
  ] },
  { t: "sim", src: "G21 G90 G17 G54\nT1 M06 (FREZ KULISTY FI6)\nG43 H1 Z50.\nS3000 M03\nG00 X0. Y10. Z5.\nG01 Z0. F200\nG18\nG02 X10. Z-10. R10. F300\nG01 X40.\nG17\nG00 Z5.\nM30", caption: "Łuk w płaszczyźnie XZ na frezarce: po `G18` blok G02 łączy ruch w X i Z, a środek łuku leży w tej płaszczyźnie." },
  { t: "sim", mode: "lathe", src: "G18 G21 G40 G99\nG97 S1000 M03\nG00 X52. Z2.\nG01 X40. F0.25\nZ-20.\nG02 X50. Z-25. R5.\nG01 Z-40.\nX52.\nG00 Z2.\nM30", caption: "Na tokarce G18 jest domyślne. Przy zapisie środka łuku używa się I (w X) i K (w Z) — nie I i J." },

  { t: "h", x: "Fanuc kontra Sinumerik" },
  { t: "p", x: "Kody są takie same na obu sterowaniach. Różnice dotyczą zapisu łuku: Sinumerik przyjmuje promień jako `CR=`, a pełne zwoje spirali jako `TURN=`." },

  { t: "h", x: "Typowe błędy" },
  { t: "ul", items: [
    "**J w płaszczyźnie G18** — alarm albo łuk w innym miejscu niż zamierzony.",
    "**Korekcja promienia w złej płaszczyźnie** — odsunięcie w innej osi niż kontur.",
    "**Cykl wiertarski po G18 na frezarce** — wiercenie w osi Y, prosto w bok detalu.",
    "**G17 przepisane do programu tokarskiego** — łuki i korekcja ostrza w złej płaszczyźnie.",
    "**Brak powrotu do G17** po fragmencie w G18 — kolejne łuki idą w płaszczyźnie XZ.",
  ] },
];

const g20g21: Block[] = [
  { t: "p", x: "**G21** ustawia milimetry, **G20** — cale. Wybór dotyczy wszystkiego, co ma wymiar: współrzędnych, posuwu, promieni i wartości w rejestrach korekcji." },
  { t: "diagram", id: "f14-units" },

  { t: "h", x: "Co dokładnie robi sterownik" },
  { t: "p", x: "Sterownik przelicza wszystkie wartości wymiarowe z programu na swoją jednostkę wewnętrzną. Na Fanucu jednostki zmienia się **na początku programu, w osobnym bloku, przed jakimkolwiek ruchem** — zmiana w połowie obróbki przestawia też interpretację korekcji i przesunięć." },
  { t: "code", x: "1 cal = 25,4 mm\nX1.5  (G20) → 1,5 · 25,4 = 38,1 mm\nF10.  (G20) → 10 cal/min = 254 mm/min" },

  { t: "h", x: "Najbardziej podchwytliwa różnica sterowań" },
  { t: "table", head: ["Znaczenie", "Fanuc frezarka", "Fanuc tokarka", "Sinumerik"], rows: [
    ["cale", "`G20`", "`G20`", "`G70` (albo `G700`)"],
    ["milimetry", "`G21`", "`G21`", "`G71` (albo `G710`)"],
    ["cykl zgrubny toczenia", "—", "`G71`", "`CYCLE95`"],
    ["cykl wykańczający", "—", "`G70`", "`CYCLE95`"],
  ], caption: "`G71` na Sinumeriku to milimetry, na tokarce Fanuc — cykl zgrubny. Ten sam zapis robi zupełnie co innego." },
  { t: "note", kind: "info", x: "Sinumerik ma dwa warianty: `G70`/`G71` przeliczają tylko geometrię, a `G700`/`G710` także posuw i dane technologiczne." },

  { t: "h", x: "Skutki pomyłki" },
  { t: "ul", items: [
    "**program calowy w trybie metrycznym** — detal 25,4 raza mniejszy: X2.0 to 2 mm zamiast 50,8 mm,",
    "**program metryczny w trybie calowym** — ruchy 25,4 raza za duże, zwykle alarm krańcówki albo kolizja,",
    "**posuw** — F200 w calach to 5080 mm/min.",
  ] },
  { t: "sim", src: "G21 G90 G17 G54\nT1 M06 (FREZ FI10)\nG43 H1 Z50.\nS2000 M03\nG00 X0. Y0. Z5.\nG01 Z-1. F150\nG01 X38.1 F400\nY19.05\nX0.\nY0.\nG00 Z5.\nM30", caption: "Prostokąt 1,5 × 0,75 cala zapisany w milimetrach (38,1 × 19,05). Przeliczenie raz, w programie — maszyna pracuje w jednym systemie." },

  { t: "h", x: "Dobre praktyki" },
  { t: "ul", items: [
    "`G21` (albo `G20`) **jawnie w bloku startowym** — sterownik pamięta ostatnie ustawienie.",
    "Rysunek calowy: albo cały program w G20, albo wszystko przeliczone na milimetry — nie mieszać.",
    "Przy przenoszeniu programu między Fanucem i Sinumerikiem najpierw sprawdź G70/G71.",
  ] },

  { t: "h", x: "Typowe błędy" },
  { t: "ul", items: [
    "**Brak G21 w programie** — obowiązują jednostki zostawione przez poprzednią pracę.",
    "**Zmiana jednostek w połowie programu** — korekcje i przesunięcia czytane w innej jednostce.",
    "**G71 z Sinumerika na tokarce Fanuc** — zamiast milimetrów uruchamia się cykl zgrubny.",
    "**Posuw nieprzeliczony** — współrzędne w mm, posuw z rysunku w calach na minutę.",
  ] },
];

const g94g95: Block[] = [
  { t: "p", x: "**G94** i **G95** ustalają jednostkę posuwu. Przy **G94** F to **mm/min**, przy **G95** — **mm na obrót wrzeciona**. Ta sama liczba znaczy w obu trybach coś skrajnie innego, więc tryb zawsze ustawia blok startowy." },

  { t: "h", x: "Co dokładnie robi sterownik" },
  { t: "p", x: "Przy G95 sterownik mierzy obroty wrzeciona i na bieżąco przelicza posuw osi: **vf = f · n**. Gdy obroty spadną (np. przy G96 na dużej średnicy albo przy spadku pod obciążeniem), posuw minutowy spada razem z nimi, a grubość wióra zostaje stała. Przy G94 posuw osi nie zależy od wrzeciona." },
  { t: "code", x: "tokarka:  vf = f · n            0,25 mm/obr · 1200 obr/min = 300 mm/min\nfrezarka: vf = fz · z · n       0,05 · 4 · 2000 = 400 mm/min" },

  { t: "h", x: "Który tryb gdzie" },
  { t: "table", head: ["Maszyna", "Domyślnie", "Typowe F", "Kod na Fanucu"], rows: [
    ["frezarka, centrum", "mm/min", "100–5000", "`G94` / `G95`"],
    ["tokarka Fanuc, system A", "mm/obr", "0,05–0,5", "`G98` (mm/min) / `G99` (mm/obr)"],
    ["tokarka Fanuc, system B/C", "mm/obr", "0,05–0,5", "`G94` / `G95`"],
    ["Sinumerik (obie)", "zależnie od maszyny", "—", "`G94` / `G95`"],
  ] },
  { t: "note", kind: "warn", x: "Na tokarkach Fanuc w systemie A (najczęstszym) jednostkę posuwu przełączają **G98 i G99** — te same numery, które na frezarce oznaczają poziom powrotu w cyklach wiertarskich. Przenosząc program między maszynami, sprawdź system kodów." },

  { t: "h", x: "Posuw na obrót a powierzchnia" },
  { t: "p", x: "Przy toczeniu posuw na obrót wprost decyduje o chropowatości. Naroże płytki o promieniu rε zostawia łuki co f — wysokość grzbietów to teoretyczna chropowatość:" },
  { t: "code", x: "Rt ≈ f² / (8 · rε) · 1000   [µm]\nf 0,2, rε 0,8:   0,04 / 6,4 · 1000 ≈ 6,3 µm   (Ra ≈ Rt / 4 ≈ 1,6)", caption: "Dwa razy większy posuw — cztery razy większe Rt." },
  { t: "diagram", id: "t23-rt" },
  { t: "sim", mode: "lathe", src: "G18 G21 G40 G99\nG97 S1200 M03\nG00 X52. Z2.\nG01 X44. F0.25\nZ-35.\nX52.\nG00 Z2.\nM30", caption: "Toczenie z posuwem 0,25 mm/obr. Przy 1200 obr/min to 300 mm/min — tyle pokazuje licznik czasu symulatora." },

  { t: "h", x: "G95 na frezarce" },
  { t: "p", x: "Posuw na obrót przydaje się na frezarce przy **wierceniu i gwintowaniu** — F wprost równa się posuwowi na obrót wiertła albo skokowi gwintownika. Po takim fragmencie trzeba wrócić do G94 przed frezowaniem." },

  { t: "h", x: "Fanuc kontra Sinumerik" },
  { t: "table", head: ["Posuw", "Fanuc frezarka", "Fanuc tokarka (A)", "Sinumerik"], rows: [
    ["mm/min", "`G94`", "`G98`", "`G94`"],
    ["mm/obr", "`G95`", "`G99`", "`G95`"],
    ["odwrotność czasu", "`G93`", "—", "`G93`"],
  ] },

  { t: "h", x: "Typowe błędy" },
  { t: "ul", items: [
    "**F0.2 na frezarce w G94** — 0,2 mm/min: narzędzie stoi w materiale i się grzeje.",
    "**F250 na tokarce w G95** — 250 mm na obrót: wyrwana płytka albo detal.",
    "**Zmiana trybu bez zmiany F** — F400 po przełączeniu na G95 to 400 mm/obr.",
    "**G99 z tokarki na frezarce** — nie posuw na obrót, tylko powrót do płaszczyzny R w cyklu.",
    "**Wiercenie w G95 i frezowanie dalej w G95** — następny kontur jedzie posuwem na obrót.",
  ] },
];

export const uklady: Record<string, Block[]> = {
  "g54-g59": g54g59, "g90-g91": g90g91, "g17-g19": g17g19, "g20-g21": g20g21, "g94-g95": g94g95,
};
