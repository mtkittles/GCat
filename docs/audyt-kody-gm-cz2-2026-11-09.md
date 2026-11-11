# Audyt sekcji „Kody G i M” — część 2: język, telefon, typografia, podpisy

Data: 9 listopada 2026 r. Stan treści: gałąź `sprint-25/paczka-s`, commit `f522c8c` — ten sam co w części 1 (`docs/audyt-kody-gm-2026-10-17.md`, PR #90). `main` nie zmienił się od 17 października. Raport planuje zmiany. Sam niczego w kartach nie poprawia.

Część 1 obejmuje merytorykę, programy, geometrię rysunków i odnośniki. Ta część dokłada to, co tam było sprawdzone na próbce albo wcale: **język każdej karty, telefon na wszystkich 56 kartach, typografię, podpisy rysunków i symulacji, dostępność**. Na końcu jest lista rzeczy, których żaden z dwóch raportów jeszcze nie obejmuje (§9).

## 1. Zakres i sposób sprawdzenia

| Obszar | Co sprawdzono | Jak |
|---|---|---|
| Język | 56 kart, 14 995 słów widocznej prozy | drugie pełne czytanie z notatkami; skrypt liczący wzorce (wzmacniacze, zdania-zapowiedzi, pauzy, terminy) |
| Merytoryka | ustalenia części 1 | ponowne sprawdzenie przy czytaniu; przeliczenie liczb w podpisach rysunków i symulacji |
| Telefon | lista `/kody` i 56 kart, 390 × 844 i 360 × 740 | Playwright na buildzie produkcyjnym: wysokość strony, rozmiary tekstu, tabele, przewijane bloki, pola dotyku; zrzuty ekran po ekranie dla listy i 5 kart (G00, G40–G42, G10, G71, M30) |
| Interakcje na telefonie | spis treści, powiększenie rysunku, menu „Więcej”, jasny motyw, układ poziomy, powiększona czcionka | zrzuty i pomiar po kliknięciu |
| Podpisy | 39 rysunków, 20 symulacji, 16 animacji, 53 bloki kodu, 90 tabel w artykułach | wyciąg z gotowej strony, porównanie z treścią i z interfejsem |
| Dostępność | 56 kart i lista | axe-core 4.10 (WCAG 2.1 A/AA i 2.2 AA), motyw ciemny na wszystkich, jasny na liście i 4 kartach |
| Waga strony | lista i 5 kart | bajty przesłane przy pierwszym wejściu (CDP) |

**Granice.** Pomiary robiłem w Chromium z emulacją ekranu, nie na fizycznym telefonie — Safari na iOS może łamać wiersze inaczej. Nie sprawdzałem czytnikiem ekranu, tylko regułami axe i strukturą DOM. Ocena języka jest moja, liczby są ze skryptu. Zachowań Fanuca nadal nie da się potwierdzić w B-64604EN (jak w części 1).

Priorytety jak w części 1: **P1** poprawić najpierw, **P2** przy redakcji karty, **P3** dopracowanie.

## 2. Najważniejsze ustalenia

Tekst czyta się na telefonie wygodnie: 15,5–16 px, interlinia 1,6–1,7, dobry kontrast w obu motywach, brak poziomego przewijania strony przy 390 i 360 px. Rysunki mają tytuł, legendę i rzeczowy podpis. Problem leży gdzie indziej: **karta na telefonie jest długa i w dużej części zajęta przez elementy, które nie są treścią karty**, a **starsze artykuły są napisane innym, gawędziarskim głosem** niż nowsze i niż lekcje.

| Pr. | Ustalenie | Gdzie | Co zmienić |
|---|---|---|---|
| P1 | Pełny warsztat symulatora wstawiony w kartę zajmuje na telefonie średnio 1755 px (2 ekrany): edytor, klawiatura G-kodu, wczytywanie i zapis pliku, eksport, materiał, jednostki, narzędzia. Dla 14 linii przykładu. | 20 symulacji na 17 kartach | Na karcie lekki odtwarzacz (`Demo`, 860 px). Pełny symulator pod przyciskiem „Otwórz w symulatorze”. §7 |
| P1 | Symulacja G71 na telefonie pokazuje czytelnikowi błąd: widok XY, „T00 Frez walcowy ø10”, ostrzeżenie „Posuw F0.3 przy G94…”, czas 263:29. | G71/G70 (to P1 z części 1, tu widać skutek) | Paczka T: `mode="lathe"` |
| P1 | Dwa głosy w sekcji. 16 starszych artykułów ma 5–17 ozdobników na 1000 słów, nowsze 0–4, karty krótkie 1,1. | §3.1, załącznik A | Redakcja starszych artykułów do rejestru nowszych; zasady w §3.5 |
| P1 | Blok kodu obcina na telefonie komentarze, czyli to, co w przykładzie uczy. 36 bloków wymaga przewijania w bok, do 1,9 szerokości. | m.in. G00, G40, G71, M30 | Limit 42 znaków w linii albo komentarz w osobnej linii. §4.3 |
| P1 | Źródła pokazują notatki redakcyjne: „Dokument w materiałach projektu (145 stron PDF)”, „Miejsca (strony)… do uzupełnienia”. Długa notka o Handbooku Fanuca powtarza się na każdej karcie. | sekcja „Źródła” wszystkich kart | Pole `note` podzielić na publiczne i wewnętrzne. Na telefonie lista zwinięta. §4.4 |
| P2 | „Składnia” występuje dwa razy w pierwszych trzech ekranach, z dwiema tabelami adresów o różnym wyglądzie. | 27 kart z artykułem | Jedna „Składnia” (to też W w części 1) |
| P2 | Tabele porównawcze 3–4 kolumnowe rozpadają się na karty etykieta/wartość i tracą porównanie. Najwyższa ma 1412 px. Tabele dwukolumnowe też są rozbijane, choć mieszczą się bez tego. | 48 tabel; G02/G03, G04, G40, G71 | Dwie kolumny zostają tabelą. Porównania: przewijanie z przyklejoną pierwszą kolumną. §4.3 |
| P2 | Etykiety na rysunkach mają na telefonie medianę 9,8 px (przy 360 px — 8,9). 16 rysunków ma etykietę poniżej 9 px. | 39 rysunków | Rysunek na pełną szerokość ekranu: mediana rośnie do ok. 11,4 px bez przerysowania. §6 |
| P2 | Uchwyt spisu treści zasłania końce wierszy i przycisk powiększenia zasłania etykietę rysunku. | wszystkie karty; rys. `comp-entry` | Uchwyt do paska dolnego albo nagłówka. §4.5 |
| P2 | Około 20 rozmiarów tekstu na jednej karcie; 52 % widocznych znaków jest poniżej 14 px. Ten sam poziom nagłówka (H2) ma trzy wyglądy. | wszystkie karty | Skala 5 rozmiarów. §5 |
| P2 | Podpisy symulacji odsyłają do elementów, których na telefonie nie ma pod tą nazwą albo nie widać. | G00, G01, G02/G03, G04, G40, G94, G96 | Podpis opisuje tor, nie interfejs. §6.3 |
| P2 | Czytelnik widzi sprzeczność: G81 „Symulator nie interpretuje jeszcze cykli stałych”, G84 i G85 symulują cykl. | G81–G83 | Paczka T (jest w części 1, podnoszę wagę: to widać bez wiedzy o CNC) |
| P3 | Lista ma 9,6 ekranu bez nagłówków grup. „Kody” są w menu „Więcej”, nie w pasku dolnym. | `/kody` | §4.1 |
| P3 | Żadna z 47 kanw nie ma opisu dla czytnika ekranu. Edytor w symulacji nie ma etykiety. Szuflada spisu treści nie przejmuje fokusu. | §8 | — |

Drugie przejście merytoryczne **nie znalazło błędu w ustaleniach części 1**. Jedna pozycja do złagodzenia: „X0 zawsze na osi obrotu” (G54) było tam wymienione jako pewnik bez źródła — to konwencja prawdziwa dla tokarki dwuosiowej i wystarczy dopisek „w układzie detalu”. Nowe drobne pozycje merytoryczne są w §3.4.

## 3. Język

### 3.1 Dwa głosy

**Głos A — 16 starszych artykułów:** G00, G01, G02, G03, G33, G68/G69, G71/G70, G76 (tok.), G81–G83, G85/G86, G92, G96/G97, M03–M05, M08/M09, M30, M98/M99. Cechy: superlatywy, dramatyzm, zdania zapowiadające ważność, liczby „na oko”, listy z pogrubionym hasłem, zwroty wprost do czytelnika z oceną.

**Głos B — 11 nowszych artykułów i karty krótkie:** G04, G17–G19, G20/G21, G28, G40–G42, G43, G52/G53, G54–G59, G84, G90/G91, G94/G95 oraz wszystkie 29 kart bez artykułu. Krótkie zdania, warunek zamiast pewnika, liczba z jednostką. Karty krótkie mają 3555 słów i 4 ozdobniki. **To jest rejestr docelowy** — taki sam jak w lekcjach po paczkach L–R.

Gęstość ozdobników na 1000 słów (naj-, „w praktyce”, zupełnie, po prostu, klasyczny, kluczowy, warto, „Efekt:”, zdania „To jest…”, bardzo, wykrzyknik):

| Karta | /1000 | | Karta | /1000 |
|---|---|---|---|---|
| G85/G86 | 17,3 | | G81–G83 | 6,1 |
| M98/M99 | 15,9 | | G76 (tok.) | 6,1 |
| G92 | 14,0 | | G96/G97 | 5,5 |
| G01 | 13,2 | | G33 | 5,3 |
| M08/M09 | 12,3 | | M03–M05 | 5,0 |
| G00 | 11,1 | | G20/G21 | 4,2 |
| G02, G03 | 8,4 | | G43 | 3,8 |
| G71/G70 | 6,9 | | G94/G95 | 3,0 |
| M30 | 6,5 | | G90/G91 | 2,6 |
| G68/G69 | 6,4 | | G04 | 2,3 |

G40–G42, G84, G54–G59, G28, G17–G19, G52/G53: 0.

### 3.2 Wzorce do usunięcia

Suma w sekcji: 383 pauzy „ — ” (25 na 1000 słów), 24 superlatywy „naj-”, 13 zdań-zapowiedzi, 8 × „warto”, 8 × „zupełnie”, 7 × „większość”, 159 punktów list zaczynających się od pogrubionego hasła.

| Wzorzec | Przykłady z kart | Zamiast |
|---|---|---|
| Zdanie zapowiada ważność, zamiast podać treść | G00: „To najważniejsza rzecz do zrozumienia przy G00.” G04: „Tu kryje się najwięcej błędów.” G92: „Stąd bierze się główne niebezpieczeństwo.” | usunąć; następne zdanie niesie treść |
| Superlatyw bez źródła | G01: „najczęstszy błąd początkującego” i trzy akapity dalej „najdroższy błąd”; G43: „najczęstsza przyczyna uderzenia narzędzia w stół”; G20: nagłówek „Najbardziej podchwytliwa różnica sterowań” | „częsty błąd” albo sam opis skutku |
| Fałszywy absolut | G00: „To jedyny moment, w którym błąd w zerze detalu ujawnia się fizycznie.” | zdanie bez „jedyny” |
| Dramatyzm | G00: „Jedna cyfra różnicy, a narzędzie wbija się w detal z pełną prędkością.” G96: „rosną do nieskończoności”, „rosłyby lawinowo” | skutek z liczbą: „przy ⌀2 mm to 31 800 obr/min” |
| Liczba z powietrza | G01: „czas cyklu urośnie o kilkanaście sekund na każdym przejeździe”; G71: „około 40 bloków”; G81: „około dwudziestu” | policzyć z przykładu albo usunąć |
| Frazeologia zamiast informacji | G01: „Odwrotna strona medalu”, „prosta droga do literówki”, „Klasyczny wypadek”; G92: „sprzed epoki rejestrów G54”, „kolejna pułapka”; G81: „Anatomia cyklu”, „Kosztem jest czas.” | zwykłe zdanie orzekające |
| Nagłówek-zachęta | G71: „Dlaczego warto”; G96: „Dlaczego to ma znaczenie”; M08: „Po co w ogóle chłodziwo” | „Zastosowanie”, „Kiedy stosować” |
| Wzmacniacze | „zupełnie inny”, „po prostu szybszy” (G85), „bardzo przydatne narzędzie” (M30), „bardzo nieprzyjemne” (M98), „właśnie ta różnica decyduje” (G85), „kluczowe” (M08) | bez przysłówka |
| „W praktyce” jako podpórka | G01 trzy razy; G76: „w praktyce h ≈ 0,613 × P” (to wzór z zarysu gwintu, nie praktyka) | usunąć albo podać źródło wzoru |
| Ten sam szablon zdania w dwóch kartach | G76: „Zapis `P010060` bywa mylący, bo wygląda jak jedna liczba”; M98: „Zapis `P51001` bywa mylący, bo wygląda jak numer programu”. G43 i G54 otwierają się tym samym zdaniem („Program pisze się względem…, a to… załatwia tabela/rejestr”) | jedno z dwóch przeredagować |
| Żargon obok terminu | G71: „na gotowo”, „na czysto” obok „wykańczające”; G04: „coś się dzieje z iksem”; G33: „skok gwintu się rozjedzie” | termin z lekcji |
| Lista z pogrubionym hasłem jako domyślna forma | 159 punktów; w G00 trzy takie listy pod rząd | hasło pogrubione tylko w „Typowych błędach”; porady zwykłym zdaniem |
| Pauza w co drugim zdaniu | 25 na 1000 słów | pauza tylko dla wtrącenia; resztę rozbić na dwa zdania albo użyć dwukropka |

Pozostałości redakcyjne: G00 ma nagłówek „Przykład — porównaj oba warianty”, a pod nim jedną symulację. G00 pisze „Ty” wielką literą, reszta sekcji małą. G40: „Tor pokryje się z konturem z rysunku, co łatwo sprawdzić z rysunkiem.” G02: „otwory frezowane z ruchu obrotowego”. Rada o ręce nad przyciskiem zatrzymania jest powtórzona w G00 i G01, rada o zaokrąglaniu naroży w G01, G02 i G03.

### 3.3 Terminologia i zapis

Liczby wystąpień w widocznym tekście sekcji:

| Pojęcie | Warianty | Propozycja |
|---|---|---|
| układ CNC | sterownik 66, sterowanie 22 | „sterowanie” — lekcje nie używają „sterownik” w tym znaczeniu (część 1, X) |
| G41/G42 i G43 | korekcja 38, kompensacja 11, korektor 2 | „kompensacja promienia”, „korekcja długości”; „korektor” usunąć |
| override | „korektor ruchu szybkiego” (G43) | „nastawa ruchu szybkiego (override)” |
| G90 | bezwzględne 11, absolutne 6 | jedno, to z lekcji |
| „baza” | przesunięcie zera (G10), punkt referencyjny (G27/G28), baza wymiarowa (G90) | „zero detalu”, „punkt referencyjny”, „baza wymiarowa” — każde w jednym znaczeniu |
| G00 | „szybki dojazd” (tytuł), „szybki przejazd” 4, „ruch szybki” 6 | „ruch szybki” jak w lekcji F3.1 |
| gwint | zwój 5, nitka 2 | „zwój” |
| dno otworu | „na dnie” 11, „w dnie” 6 | „na dnie” |
| narzędzie | wytaczak 1, wytak 2 | „wytaczak” |
| średnica | ⌀ 7, Ø 5 (oba w G40) | jeden znak w tekście i na rysunkach |
| symbole | Vc 6, Vf 1, vf 1 | małe: vc, vf, fz — jak w lekcjach i w słowniku |
| mnożenie | × 19, · 9 | „×” w wymiarach, „·” we wzorach |
| nazwy sterowań | „w Fanuc”, „na Fanucu”, „Fanuca”, „w Sinumerik”, „na Sinumeriku” | odmieniać: „w Fanucu”, „w Sinumeriku” |
| kolor G00 | „żółte linie” (G00), „pomarańczowy pas” (G40), w legendzie bursztyn | jedna nazwa koloru w podpisach |

Nagłówki: 14 × „Typowe błędy”, 8 × „Składnia”, 7 × „Co dokładnie robi sterownik”, porównanie sterowań pod trzema nazwami („Sinumerik” 7, „Fanuc kontra Sinumerik” 6, „Różnice między sterownikami” 5), porady pod trzema („Wskazówki z praktyki”, „Dobre praktyki”, „Wskazówki technologiczne”). Do tego 80 nagłówków jednorazowych. Wzory są zapisane na trzy sposoby: pogrubione w zdaniu (G01), zwykłym tekstem w akapicie (G02), w bloku kodu (G04). Listy raz mają punkty-zdania z kropką, raz hasła małą literą z przecinkiem (G17, G20).

### 3.4 Drobne pozycje merytoryczne z drugiego czytania

- **G76 (tok.):** litera P oznacza w jednym akapicie skok gwintu („h ≈ 0,613 × P”) i adres („czyli P1840”). Skok zapisać jako „p” albo „skok”, adres zostawić w `kodzie`. P2.
- **G43, rysunek:** trzy zapisy tej samej liczby — „85,2” w podpisie, „85.200” na etykiecie rejestru, „85,200” w notce. Na ekranie sterowania jest kropka; tekst po polsku ma przecinek. Ustalić: etykieta rejestru z kropką jako „ekran”, reszta z przecinkiem. P3.
- **G52/G53, podpis kodu:** „G53 wymaga trybu G90 i działa tylko z G00 lub G01” — źródło karty (Handbook, s. 87) tego nie rozstrzyga. Do weryfikacji razem z listą z §9 części 1.
- **Rysunki z kodem w notce:** część ma minus typograficzny w kodzie (`G22 … Z−50`, `G31 Z−5 F150`, `G75 X30 Z−26`), część łącznik (`G41 D1 G01 X-10. Y0.`). Kod zawsze z łącznikiem, minus typograficzny tylko w zdaniach i wymiarach. P3.
- Liczby w podpisach rysunków i symulacji przeliczyłem ponownie (G01 rozkład F400, G04 obroty w czasie postoju, G20 50,8 mm, G50 próg Ø21, G84 19,5 = 15 + 4,5, G94 Rt 6,3 µm) — zgadzają się.

### 3.5 Zasady redakcyjne do dopisania w `docs/karty-kodow.md`

1. Zdanie niesie fakt o sterowaniu, o programie albo o skutku na maszynie. Zdanie, które tylko ocenia ważność, wypada.
2. Bez superlatywów i „zawsze/nigdy/jedyny”, chyba że stoi przy nich źródło.
3. Liczba ma jednostkę i pochodzi z przykładu na karcie albo ze źródła.
4. Jeden termin na pojęcie — tabela z §3.3 trafia do standardu.
5. Stały zestaw nagłówków H2: Składnia · Działanie · Przykład · Fanuc i Sinumerik · Typowe błędy. Dodatkowe tylko wtedy, gdy karta ma osobny temat (np. „Na tokarce”).
6. Pogrubione hasło na początku punktu tylko w „Typowych błędach”.
7. Podpis mówi, co widać i na co patrzeć. Nie wprowadza nowej zasady i nie nazywa przycisków.
8. Linia kodu z komentarzem ma najwyżej 42 znaki.

Punkty 2, 4 i 8 da się sprawdzać skryptem (§9, poz. 1).

## 4. Układ na telefonie

### 4.1 Lista `/kody`

- 8094 px, czyli 9,6 ekranu (11,8 przy 360 px). 57 wierszy po ok. 131 px. Brak nagłówków grup — lista jest płaska, choć karty mają pole `group` i jest filtr „Każda grupa”.
- Każdy wiersz pokazuje kod, nazwę, 2–4 linie opisu i 2–3 znaczniki. Znaczniki „frez”/„tok” w stanie nieaktywnym są prawie nie do odróżnienia od aktywnych.
- Komórka z kilkoma kodami łamie się przypadkowo („G40 G41 / G42 ★”, „G43 G44 / G49 ★”).
- Natywna lista wyboru „Każda grupa” jest wyższa i ma większy tekst niż sąsiednie przyciski filtrów.
- `/kody` ma tylko ogólny opis serwisu w meta description.
- „Kody” są w menu „Więcej” (trzecia pozycja z siedmiu), nie w pasku dolnym. Dojście z dowolnej strony to dwa dotknięcia.

Propozycja: nagłówki grup (Ruch, Płaszczyzny i jednostki, Korekcje, Układy, Cykle, Funkcje M) z przyklejanym paskiem skoku między grupami; wiersz zwarty — kod, nazwa, jedna linia opisu; znaczniki maszyn tylko wtedy, gdy karta dotyczy jednej maszyny; zakres kodów zapisany „G40–G42”. Lista skróci się mniej więcej o połowę.

### 4.2 Długość i proporcje karty

Karty z artykułem mają medianę 9,7 ekranu, karty krótkie 4,5. Najdłuższe: G02 i G03 po 20,7, G40–G42 18,4, G04 16,9, G01 16,3, G00 13,9, G54–G59 12,3 (pełna tabela w załączniku A).

Udział w wysokości wszystkich kart:

| Element | Udział |
|---|---|
| tabele | 14,6 % |
| pełny symulator | 10,3 % |
| „W lekcjach” i „Powiązane” | 7,6 % |
| źródła | 5,9 % |
| baner, lead, linia profilu | 5,5 % |
| rysunki | 5,3 % |
| bloki kodu | 4,6 % |
| animacje `Demo` | 4,0 % |

Pod względem liczby widocznych znaków panele symulatora mają 27,7 %, źródła 13,0 %, a akapity artykułu 13,6 %. **Na telefonie czytelnik widzi tyle samo tekstu źródeł co treści karty i dwa razy więcej tekstu interfejsu symulatora.**

Pierwszy ekran karty: nagłówek serwisu 53 px, okruszki, baner ze zdjęciem 168–184 px (20–22 % ekranu, to samo zdjęcie frezarki także na kartach funkcji M i ustawień), lead, cztery szare linie profilu zapisu. Treść zaczyna się na dole pierwszego ekranu. Stały nagłówek i pasek dolny zajmują razem 111 px, czyli 13 % wysokości.

Koniec karty: „W lekcjach” (do jednego ekranu), „Powiązane”, „Źródła” (ok. 1,5 ekranu) — łącznie ok. 3 ekrany po ostatnim zdaniu artykułu.

Propozycja kolejności na telefonie: baner niski bez zdjęcia (kod, nazwa, znaczniki) → lead → Składnia (raz) → artykuł → Typowe błędy → Powiązane w jednym rzędzie przewijanym w bok → „W lekcjach” i „Źródła” zwinięte. Linia profilu jako jedna linia z rozwinięciem albo w stopce karty.

### 4.3 Tabele i kod

- **Tabele:** 152 na kartach (z tabelami symulatora), 48 ułożonych w karty etykieta/wartość, 31 przewijanych w bok (do 1,21 szerokości). Ułożenie w karty jest dobre dla tabel-słowników, złe dla porównań: tabela kierunków frezowania w G40 zajmuje cały ekran i nie da się w niej porównać dwóch wierszy. W G71 rozbita jest nawet dwukolumnowa tabela adresów — każdy adres to osobna karta z etykietami „ADRES” i „ZNACZENIE”.
- **Podpis tabeli** stoi pod tabelą, więc przy tabeli wysokiej na ekran czytelnik dowiaduje się, co porównuje, po przewinięciu.
- **Bloki składni i kodu:** 36 przewijanych w bok, do 1,92 szerokości. Obcięte są komentarze wyrównane spacjami: G00 „(dopiero tu przechodzimy r…”, M30 „; odjazd na wysokość bezpieczn…”, G71 „; głębokoś…”. W blokach z obliczeniem (G40 „zmierzono 80,04 × 5…”, G43) ucięty jest wynik.
- Przy czcionce 12,5 px w bloku mieszczą się 43 znaki. Stąd limit 42 z §3.5.
- Znaczniki kodu w zdaniu łamią się w środku (`G00` / `Z50`), a kropka po terminie słownikowym potrafi spaść do osobnego wiersza („głowicy rewolwerowej” / „.”).

Propozycja: tabele dwukolumnowe zawsze jako tabela; porównania Fanuc/Sinumerik jako dwie kolumny z etykietą wiersza nad parą wartości; podpis nad tabelą; komentarz dłuższy niż limit w linii nad kodem; `white-space: nowrap` na znaczniku kodu w zdaniu i sklejenie interpunkcji z przyciskiem terminu.

### 4.4 Źródła, „W lekcjach”, „Powiązane”

Lista źródeł jest na telefonie rozwinięta, tekstem 12–13 px, jedna pozycja nawet 10,4 px. Wpis Handbooka Fanuca ma na każdej karcie siedem linii stałej notki o zakresie dokumentu. Pokazane są uwagi przeznaczone dla redakcji: „Dokument w materiałach projektu (145 stron PDF). Data w nagłówku wydruku nie jest datą wydania”, „Miejsca (strony) dla lekcji i kart bez wpisanej strony do uzupełnienia”, „Miejsce: rozdział i strona do uzupełnienia”.

Dla czytelnika ważne są trzy rzeczy: dokument, miejsce, co potwierdza. Propozycja: w `sources.ts` rozdzielić `note` na `note` (publiczne zastrzeżenie, np. „maszyny Haas — nie dowolny Fanuc”) i `internal` (stan prac); na karcie jedna linia na źródło, szczegóły po rozwinięciu; „do uzupełnienia” tylko w panelu redakcji i w `audit:nauka`. Notki „Źródło: …” w treści G28 i G84 przenieść do pola `sources`.

### 4.5 Nawigacja w karcie

- Dwa spisy treści naraz: pływający uchwyt (56 kart) i zwijane „W tej karcie” (27 kart z artykułem).
- Uchwyt stoi przy prawej krawędzi nad paskiem dolnym i zasłania końce wierszy akapitów oraz tekst stopki („…na swoim sterowni”). Przy powiększonej czcionce zasłania więcej.
- Szuflada spisu działa dobrze: 14 pozycji po 42 px, zaznaczona bieżąca sekcja, zamyka się klawiszem Esc. Braki: nie ma `aria-modal`, fokus nie przechodzi do szuflady.
- Spis zawiera sekcje techniczne („W lekcjach”, „Powiązane”, „Źródła”) na równi z treścią.
- Powiększenie rysunku otwiera kopię w szerokości 760 px (etykiety 20–25 px) i pokazuje na telefonie lewy górny fragment — trzeba przesuwać w dwóch osiach. W oknie nie ma podpisu rysunku. Przycisk powiększenia (34 × 34 px) leży na rysunku i w `comp-entry` zasłania etykietę „tor środka narzędzia”.
- Pola dotyku: 991 elementów poniżej 24 px wysokości, z tego ok. 315 to pola liczbowe symulatora (80 × 20 px), dalej pola wyboru 13–17 px, odnośniki okruszków (15 px), odnośniki stopki (16 px), przyciski terminów w tabelach (22 px).

Propozycja: jeden spis — uchwyt w pasku dolnym albo jako przycisk w nagłówku, bez zwijanego bloku; okno powiększenia startuje dopasowane do szerokości i pozwala powiększać gestem, z podpisem pod spodem; przycisk powiększenia w nagłówku rysunku obok tytułu.

### 4.6 Inne układy

- **Jasny motyw (390 px):** axe nie zgłasza błędów kontrastu na liście i 4 kartach. Wizualnie słabe są znaczniki „frezowanie”/„toczenie” na zdjęciu banera (niebieski tekst na jasnym fragmencie zdjęcia). Odtwarzacz `Demo` zostaje ciemny w jasnym motywie — spójne, traktowane jak ekran.
- **Poziomo (844 × 390):** włącza się układ szeroki bez paska dolnego, brak poziomego przewijania. Nagłówek 61 px przy 390 px wysokości to 16 % ekranu.
- **Powiększona czcionka bazowa (130 %):** nagłówki i akapity rosną, kod (12,5 px) i podpisy rysunków (14,5 px) nie — są w pikselach. Strona się nie rozsypuje.
- **`prefers-reduced-motion`:** obsłużone (przewijanie, animacje banera, kursor edytora).

## 5. Typografia

Kroje są dobrane dobrze i ładują się lokalnie: Sora w nagłówkach, Inter w tekście, JetBrains Mono w kodzie i tytule karty. Kłopot jest w skali, nie w krojach.

| Element | Rozmiar na telefonie |
|---|---|
| H1 (kod karty) | 31 px mono |
| H2 w artykule | 22,7 px |
| H2 sekcji strony (z pomarańczową kreską) | 19,2 px |
| H2 „Źródła” | 13 px |
| lead | 16,8 px |
| akapit — karta z artykułem | 15,5 px / 1,72 |
| akapit — karta krótka | 16 px / 1,63 |
| ramka uwagi | 15 px |
| podpis rysunku | 14,5 px |
| tabela / nagłówek tabeli | 14 / 12 px |
| linia profilu | 13,5 px |
| podpis kodu, tabeli, symulacji | 13 px |
| źródła | 13 / 12 px (jedna pozycja 10,4) |
| blok kodu | 12,5 px mono |
| notka w rysunku | 12 px mono, interlinia 1,0 |
| etykiety SVG | 7,9–10,2 px (mediana 9,8) |

Ustalenia:

1. **Około 20 rozmiarów** na jednej karcie (18 na G00). 52,3 % widocznych znaków jest poniżej 14 px (głównie panele symulatora, źródła, podpisy).
2. **Ten sam poziom nagłówka wygląda na trzy sposoby**: H2 artykułu, H2 sekcji strony, H2 „Źródła”. Czytelnik nie odróżni sekcji artykułu od sekcji strony.
3. **Dwa rozmiary akapitu** zależnie od typu karty (15,5 i 16 px).
4. **Trzy rozmiary podpisów**: 14,5 (rysunek), 13 (kod, tabela, symulacja). Podpis symulacji stoi nad symulacją, pozostałe pod elementem.
5. Notka z kodem w rysunku ma interlinię 1,0 — linie kodu stykają się.
6. Nagłówki Sora w 22,7 px łamią się na 2 linie przy dłuższych tytułach („Zakończenie programu w praktyce”); przy czcionce 130 % także krótsze („Co dokładnie robi sterownik”).

Proponowana skala na telefon — pięć rozmiarów:

| Rola | Rozmiar | Uwagi |
|---|---|---|
| tekst | 16 px / 1,65 | akapit, lista, ramka uwagi, lead (lead wyróżnić kolorem, nie rozmiarem) |
| tekst pomocniczy | 14 px / 1,5 | podpisy wszystkich typów, tabele, źródła, linia profilu |
| kod | 13 px mono / 1,55 | bloki kodu, notki w rysunkach |
| etykieta | 12 px wersaliki | nagłówki tabel, nadtytuły; nic innego |
| nagłówki | 21 px (H2), 17 px (H3) | jeden wygląd H2 dla artykułu i sekcji strony; „Źródła” jako H2 w zwiniętym bloku |

Rozmiary w `rem`, żeby reagowały na ustawienie czcionki w przeglądarce.

## 6. Rysunki i podpisy

### 6.1 Rysunki

39 rysunków na 28 kartach. Każdy ma tytuł, podpis i (25 z nich) notkę z kodem. Podpisy są rzeczowe, mediana 158 znaków, najdłuższe 300 (G00) i 294 (G28). To najlepiej napisana warstwa sekcji — opisują, co widać, i podają liczby zgodne z rysunkiem.

Do poprawy:

- **Wielkość etykiet.** Rysunek ma na telefonie 335 px szerokości przy projekcie na 360, więc etykieta 11 px wychodzi 9,8 px, a przy ekranie 360 px — 8,9 px. Jeśli rysunek dostanie pełną szerokość ekranu (bez marginesu karty), skala rośnie o 16 % i mediana wraca do ok. 11,4 px. 16 rysunków ma dziś na telefonie etykietę poniżej 9 px (kolumna w załączniku A). Po poszerzeniu najmniejsza miałaby ok. 9,2 px, więc te etykiety trzeba powiększyć w SVG — to zakres paczki Y z części 1.
- **Tekst alternatywny.** `aria-label` rysunku to sam tytuł; opis jest w `figcaption`, więc czytnik go dostaje. Wystarczające. Brakuje tylko jednego: tytuł powtarza kod ze znacznika („G84 | G84 — cztery różne głębokości”, „G28 | G28 — przejazd przez punkt pośredni”).
- **Podpisy powyżej 250 znaków** (G00, G28, G43, G54 „Dwa imadła”) mieszczą dwie myśli — drugą przenieść do akapitu pod rysunkiem.
- **G02 i G03** mają te same dwa rysunki i pięć tych samych animacji z tymi samymi podpisami (decyzja 2 z części 1).
- Zapis liczb i minusa — §3.4.
- Baner karty ma `alt=""` — poprawnie, to dekoracja.

### 6.2 Tabele i kod

- 90 tabel w artykułach, 8 z podpisem. Podpisy tabel nie opisują tabeli, tylko dodają wniosek („Współbieżne daje lepszą powierzchnię… — to domyślny wybór”, „Sinumerik nie ma G43…”). Wniosek zapisany szarym tekstem 13 px pod tabelą jest najmniej widocznym miejscem na karcie. Wniosek do akapitu, podpis zostaje dla opisu.
- 44 bloki kodu z podpisem, 9 bez. 18 kart krótkich ma identyczny podpis automatyczny „Program do przeczytania — symulator nie odtwarza tej funkcji.” Część 1 wskazała nieaktualne notki tego rodzaju (G16, G68, cykle stałe). Po paczce U podpis ma wynikać z tego, czy symulator faktycznie obsługuje kod.
- Trzy podpisy kodu niosą zasadę: G40 „…zmiana D o x zmienia wymiar zewnętrzny o 2x”, G52 „G53 wymaga trybu G90…”, G90 „suma przyrostów zamkniętego konturu… musi dać zero”. Zasada należy do treści; podpis może ją najwyżej powtórzyć.
- G02/G03: podpis „Obie postacie są równoważne dla łuków do 180°; powyżej różnią się jednoznacznością” jest niejasny. Chodzi o to, że R nie rozróżnia dwóch łuków powyżej 180° bez znaku.

### 6.3 Symulacje i animacje

- 20 symulacji i 16 animacji, wszystkie z podpisem. Mediana 121 i 161 znaków.
- **Podpisy odsyłające do interfejsu:**
  - G40: „Przycisk „Tor rzeczywisty (G41/G42)” pokazuje…” — na telefonie przycisk nazywa się „G41/42”.
  - G01, G02, G03: „Włącz widok 3D w symulatorze, żeby zobaczyć powstający rowek” — animacja `Demo` nie ma widoku 3D; trzeba przejść do symulatora, a podpis nie daje odnośnika.
  - G04: „Czas postoju widać w statystykach programu” — w interfejsie nie ma „statystyk”; jest zwinięty blok „Podsumowanie programu” pod kanwą.
  - G94: „tyle pokazuje licznik czasu symulatora”; G96: „Panel stanu pokazuje aktualną pozycję średnicową” (ta symulacja ma `mode="mill"` — P1 z części 1, więc panel tego nie pokaże).
  - G02/G03: „Zwróć uwagę na podpisy współrzędnych pojawiające się na torze.”
- **Podpis zależny od koloru:** G00 „Żółte linie przerywane…”, G85 „zielona linia”, G40 „Pomarańczowy pas”. Kolor jest w legendzie; podpis powinien mówić „linia przerywana — ruch szybki”.
- G71 i G81: „dokładnie to, co cykl generuje wewnętrznie” / „dokładnie to, co sterownik robi wewnętrznie” — rozpisanie ręczne jest przybliżeniem (część 1).
- Żadna kanwa nie ma `aria-label`. Animacja `Demo` ma obok listę bloków, więc treść jest dostępna tekstowo; pełny symulator — nie.

## 7. Symulator w karcie

20 pełnych warsztatów na 17 kartach. Na telefonie każdy to: edytor, „Klawiatura G-kodu”, „Wczytaj plik”, „Zapisz jako .nc”, „Kopiuj”, „N-umeruj”, „Bez N”, objaśnienia bloków, przełącznik XY/3D, „Materiał”, „Jednostki”, „Pełny ekran”, „Nauka”, „Eksport”, kanwa 380 px, sterowanie, stan modalny, „Narzędzia i półfabrykat”, „Podsumowanie programu”. Mediana 1755 px. W G17–G19 symulacje zajmują 40 % wysokości karty. Kanwa, czyli to, po co symulacja jest na karcie, pojawia się po ekranie przewijania.

Animacja `Demo` (860 px: tytuł, kanwa, sterowanie, legenda, lista bloków z podświetleniem, stan) robi na karcie to samo i mieści się na ekranie.

Propozycja:

1. Na karcie domyślnie `Demo`. Pod nim przycisk „Otwórz w symulatorze” z programem w adresie.
2. Pełny warsztat zostaje tam, gdzie czytelnik ma coś zmienić (np. „zmień D1 i zobacz tor”) — wtedy w wersji skróconej: edytor, kanwa, start. Reszta paneli pod „Więcej opcji”.
3. Lista bloków w `Demo` na telefonie zwinięta do bieżącej linii i dwóch sąsiednich, żeby kanwa i kod były na jednym ekranie.

To zmiana komponentu, nie treści, i koliduje z zasadą „symulacje chronione” — patrz decyzja 3 z części 1 oraz decyzja 7 niżej.

Waga strony przy pierwszym wejściu (po kompresji): lista 953 kB, karta krótka G10 901 kB, karta z pełnym symulatorem 1031–1042 kB. Skrypty to 510 kB także na karcie bez żadnej symulacji; pełny symulator dokłada 118 kB. Czcionki 175 kB. Warto sprawdzić, co wchodzi do wspólnej paczki skryptów (§9, poz. 5).

## 8. Dostępność

axe, motyw ciemny, 390 px, 56 kart:

| Reguła | Waga | Zasięg | Przyczyna |
|---|---|---|---|
| `aria-input-field-name` | poważna | 28 kart | edytor CodeMirror (`.cm-content`) bez etykiety |
| `scrollable-region-focusable` | poważna | 8 kart | przewijany edytor nieosiągalny z klawiatury |
| `target-size` | poważna | G84 | 2 przyciski poniżej 24 px |
| `landmark-complementary-is-top-level` | umiarkowana | 56 kart, 139 miejsc | ramka uwagi jako `<aside>` wewnątrz artykułu |
| `empty-table-header` | drobna | 2 karty (m.in. G00) | pusta komórka nagłówka |

Kontrast: bez naruszeń w obu motywach. Lista `/kody`: czysto.

Poza regułami automatu: kanwy bez opisu (§6.3), szuflada spisu treści bez przejęcia fokusu (§4.5), pola dotyku (§4.5), pole wyszukiwania w nagłówku ma w stanie zwiniętym 2 × 23 px.

## 9. Co jeszcze wziąć pod uwagę

Rzeczy, których nie obejmuje ani część 1, ani ta:

1. **Kontrola automatyczna języka i składu.** Skrypt `audit:jezyk` w CI: lista słów zakazanych (§3.2), pary terminów (§3.3), minus typograficzny w kodzie, linie kodu powyżej 42 znaków, podpis powyżej 200 znaków, nagłówek spoza zestawu. Bez tego styl rozjedzie się przy następnych kartach.
2. **Próba z użytkownikami.** 3–5 osób uczących się, telefon, trzy zadania („co robi G43”, „jak zapisać łuk przez R”, „czym się różni G98 od G99”). Pomiary pokazują długość i rozmiary; nie pokazują, czy ktoś znajduje odpowiedź.
3. **Użycie przy maszynie.** Jasne światło hali, rękawice, tablet w układzie poziomym. Jasny motyw jest poprawny, ale nie był projektowany jako główny. Osobny przegląd tabletu 768–1024 px.
4. **Karta do wydruku i tryb offline.** Arkusz druku: składnia, adresy, typowe błędy, bez symulacji. PWA jest w planie projektu; karty kodów to pierwsza treść, którą opłaca się mieć offline.
5. **Wydajność na słabszym telefonie.** 510 kB skryptów na karcie bez symulacji. Do zbadania: analiza paczek (`next build` z analizatorem), ładowanie symulatora dopiero po zbliżeniu do niego, czas do interakcji na telefonie ze średniej półki.
6. **Wyszukiwanie.** Wyszukiwarka indeksuje ukryte pola kart (część 1). Do sprawdzenia osobno: synonimy („korekcja”/„kompensacja”, „postój”/„dwell”), wyszukiwanie po adresie („co znaczy Q”), wynik prowadzący do sekcji, nie do początku karty.
7. **Widoczność w wyszukiwarkach.** `/kody` bez własnego opisu, tytuły kart do 79 znaków, brak danych strukturalnych. Opisy kart (pole `short`, 34–145 znaków) są dobre.
8. **Status weryfikacji na karcie.** Data ostatniego sprawdzenia i wersja sterowania, z którą porównano — zamiast „do uzupełnienia” w źródłach. Uczciwsze wobec czytelnika i łatwiejsze do utrzymania.
9. **Jedno źródło prawdy dla definicji.** To samo objaśnienie (np. G43, G98/G99) jest w karcie, lekcji i słowniku w trzech wersjach. Wspólne fragmenty treści usunęłyby sprzeczności z §3.3 części 1 u źródła.
10. **Czytnik ekranu.** Przejście VoiceOver/TalkBack po jednej karcie ★ i jednej krótkiej; tekstowa alternatywa toru narzędzia dla symulacji.
11. **Zdjęcia w banerach.** Dwa zdjęcia (frezarka, tokarka) na 56 kartach, na telefonie 20 % pierwszego ekranu. Na karcie referencyjnej nie niosą informacji. Do rozważenia baner bez zdjęcia w sekcji Kody; zdjęcia zostają na stronach wejściowych.
12. **Safari na iOS.** Pomiary są z Chromium. Do sprawdzenia na urządzeniu: przyklejony nagłówek przy pasku adresu, obszar bezpieczny pod paskiem dolnym, `<dialog>` powiększenia, przewijanie tabel.

## 10. Zmiany w planie paczek

Plan T–Z z części 1 zostaje. Dopisuję zakres i jedną nową paczkę.

| Paczka | Dopisać z tej części |
|---|---|
| T — błędy merytoryczne | bez zmian; sprzeczność G81/G84 o symulatorze jako pierwsza pozycja |
| U — programy | limit 42 znaków w linii, komentarz nad kodem; łącznik zamiast minusa typograficznego w kodzie na rysunkach |
| W — struktura kart | zestaw nagłówków z §3.5; jeden wygląd H2; źródła z polem `internal`; kolejność sekcji na telefonie (§4.2) |
| X — nazewnictwo i źródła | tabela §3.3; `audit:jezyk` (§9, poz. 1) |
| **X2 — redakcja językowa (nowa)** | 16 artykułów głosu A wg §3.2 i §3.5, po jednej–trzech kartach na commit, bez zmiany merytoryki; kryterium: ozdobniki ≤ 3 na 1000 słów, pauzy ≤ 10 na 1000 słów |
| Y — rysunki | rysunek na pełną szerokość na telefonie; etykiety ≥ 11 px; okno powiększenia dopasowane do ekranu z podpisem; przycisk powiększenia w nagłówku rysunku |
| Z — lista i układ | lista z grupami i zwartym wierszem; skala typograficzna §5; tabele §4.3; jeden spis treści; `Demo` zamiast pełnego warsztatu (§7); poprawki z §8 |

Kolejność: T → U → V jak dotąd. X2 po T i V, żeby nie redagować zdań, które i tak się zmienią. Z jest największa i dzieli się na trzy osobne PR-y: (a) typografia i tabele, (b) symulator w karcie, (c) lista.

## 11. Decyzje do podjęcia

Pięć decyzji z części 1 (§8) pozostaje otwartych. Nowe:

6. **Rejestr docelowy:** głos B (zwięzły, jak karty krótkie i lekcje) dla całej sekcji — tak?
7. **Symulator w karcie:** `Demo` domyślnie i pełny warsztat pod przyciskiem — czy pełny warsztat ma zostać na wybranych kartach?
8. **Baner ze zdjęciem** na kartach kodów: zostaje, niski bez zdjęcia na telefonie, czy bez zdjęcia wszędzie?
9. **„Kody” w pasku dolnym** zamiast jednej z pozycji (np. „Kalkulatory” do „Więcej”) — czy zostaje jak jest?
10. **Źródła na telefonie:** zwinięte domyślnie — tak?

## 12. Decyzje podjęte (9 listopada 2026 r.)

| Nr | Pytanie | Decyzja | Paczka |
|---|---|---|---|
| 1 | Ukryte pola kart z artykułem (pitfalle, notka Sinumerika, przykład) | **Pokazać** pod artykułem; ukryte przykłady i pitfalle poprawić przed pokazaniem | W (błędy P1 w tych polach — T) |
| 2 | G02 i G03 | **Połączyć** w jedną kartę; adres `/kody/g03` zostaje jako przekierowanie | W |
| 3 | Zasada „symulacje chronione” | **Zmienić** na „zmiany symulacji w kartach z kontrolą skryptem i audytem” | T (wpis w `docs/karty-kodow.md`) |
| 4 | Heidenhain w tabelach G00–G04 | **Usunąć** | X |
| 5 | Adres `g76-g89` | Adres zostaje, **zmienić nazwę wyświetlaną** | W |
| 6 | Rejestr docelowy | **Głos B** dla całej sekcji | X2 |
| 7 | Symulator w karcie | **`Demo` domyślnie**, pełny warsztat pod przyciskiem „Otwórz w symulatorze” | Z (b) |
| 8 | Baner ze zdjęciem na kartach kodów | **Bez zdjęcia wszędzie** (telefon i szeroki ekran) | Z (a) |
| 9 | „Kody” w pasku dolnym | **Tak**; do „Więcej” przechodzą „Kalkulatory” (propozycja z §11 — do potwierdzenia przy paczce Z) | Z (c) |
| 10 | Źródła na telefonie | **Zwinięte domyślnie** | W |

## Załącznik A — karty w liczbach (telefon 390 px)

Kolumny: słowa widocznej prozy · wysokość w ekranach 844 px · ozdobniki na 1000 słów (tylko artykuły powyżej 150 słów) · głos · rysunki (w nawiasie: ile ma etykietę poniżej 9 px) · pełne symulatory / animacje · tabele ułożone w karty / przewijane w bok · bloki kodu przewijane w bok.

| Karta | Typ | Słów | Ekrany | Ozd./1000 | Głos | Rysunki | Sim / Demo | Tabele ukł. / przew. | Kod przew. |
|---|---|---|---|---|---|---|---|---|---|
| G00 | ★ artykuł | 808 | 13,9 | 11,1 | A | 2 (1 <9 px) | 1 / 0 | 3 / 1 | 2 |
| G01 | ★ artykuł | 907 | 16,3 | 13,2 | A | 1 (1 <9 px) | 0 / 5 | 2 / 0 | 0 |
| G02 | ★ artykuł | 1070 | 20,7 | 8,4 | A | 2 (2 <9 px) | 0 / 5 | 3 / 0 | 1 |
| G03 | ★ artykuł | 1070 | 20,7 | 8,4 | A | 2 (2 <9 px) | 0 / 5 | 3 / 0 | 1 |
| G04 | ★ artykuł | 854 | 16,9 | 2,3 | B | 1 (1 <9 px) | 2 / 0 | 4 / 2 | 1 |
| G09 G61 G64 | krótka | 130 | 5,2 | — | — | 0 | 0 / 0 | 0 / 1 | 0 |
| G10 | krótka | 128 | 3,8 | — | — | 0 | 0 / 0 | 0 / 0 | 0 |
| G15 G16 | krótka | 104 | 5,6 | — | — | 1 | 0 / 0 | 0 / 1 | 0 |
| G17 G18 G19 | ★ artykuł | 281 | 10,1 | 0,0 | B | 1 (1 <9 px) | 2 / 0 | 1 / 2 | 0 |
| G20 G21 | ★ artykuł | 237 | 8,6 | 4,2 | B | 1 | 1 / 0 | 1 / 1 | 0 |
| G22 G23 | krótka | 106 | 3,8 | — | — | 1 | 0 / 0 | 0 / 0 | 1 |
| G27 G29 G30 | krótka | 127 | 4,5 | — | — | 1 | 0 / 0 | 0 / 0 | 1 |
| G28 | artykuł | 336 | 6,8 | 0,0 | B | 1 (1 <9 px) | 0 / 0 | 1 / 0 | 2 |
| G31 | krótka | 113 | 3,9 | — | — | 1 | 0 / 0 | 0 / 0 | 0 |
| G33 G32 | artykuł | 187 | 7 | 5,3 | A | 0 | 1 / 0 | 1 / 1 | 0 |
| G34 | krótka | 109 | 3,2 | — | — | 0 | 0 / 0 | 0 / 0 | 0 |
| G40 G41 G42 | ★ artykuł | 769 | 18,4 | 0,0 | B | 5 (3 <9 px) | 2 / 1 | 3 / 2 | 1 |
| G43 G44 G49 | ★ artykuł | 533 | 11 | 3,8 | B | 1 | 1 / 0 | 3 / 1 | 2 |
| G50 | krótka | 113 | 4,9 | — | — | 1 (1 <9 px) | 0 / 0 | 0 / 0 | 0 |
| G52 G53 | artykuł | 164 | 4,8 | 0,0 | B | 0 | 0 / 0 | 1 / 0 | 2 |
| G54–G59 | ★ artykuł | 369 | 12,3 | 0,0 | B | 4 (1 <9 px) | 1 / 0 | 3 / 1 | 2 |
| G65 G66 G67 | krótka | 121 | 4 | — | — | 0 | 0 / 0 | 0 / 0 | 1 |
| G68 G69 | artykuł | 157 | 4,1 | 6,4 | A | 0 | 0 / 0 | 1 / 0 | 1 |
| G71 G70 | artykuł | 291 | 9,9 | 6,9 | A | 1 | 1 / 0 | 2 / 1 | 1 |
| G72 | krótka | 113 | 5 | — | — | 1 | 0 / 0 | 0 / 0 | 0 |
| G73 | krótka | 130 | 6,2 | — | — | 1 | 0 / 0 | 0 / 1 | 0 |
| G74 | krótka | 121 | 4,2 | — | — | 0 | 0 / 0 | 0 / 0 | 0 |
| G75 | krótka | 116 | 4,7 | — | — | 1 | 0 / 0 | 0 / 0 | 0 |
| G76 G87 G88 G89 | krótka | 138 | 4,5 | — | — | 1 | 0 / 0 | 0 / 0 | 1 |
| G76 | artykuł | 330 | 8 | 6,1 | A | 0 | 1 / 0 | 1 / 1 | 0 |
| G80 G81 G83 | artykuł | 490 | 11,6 | 6,1 | A | 1 | 1 / 0 | 2 / 1 | 2 |
| G82 | krótka | 81 | 5,1 | — | — | 0 | 0 / 0 | 0 / 1 | 0 |
| G84 | artykuł | 404 | 11,7 | 0,0 | B | 1 (1 <9 px) | 1 / 0 | 3 / 1 | 4 |
| G85 G86 | artykuł | 173 | 6,3 | 17,3 | A | 0 | 1 / 0 | 1 / 1 | 1 |
| G90 G91 | ★ artykuł | 389 | 10,3 | 2,6 | B | 2 | 1 / 0 | 2 / 1 | 0 |
| G90 G92 G94 (tokarka) | krótka | 188 | 7 | — | — | 1 | 0 / 0 | 0 / 1 | 0 |
| G92 | artykuł | 215 | 4,3 | 14,0 | A | 0 | 0 / 0 | 0 / 0 | 0 |
| G93 | krótka | 96 | 2,8 | — | — | 0 | 0 / 0 | 0 / 0 | 0 |
| G94 G95 | ★ artykuł | 336 | 9,5 | 3,0 | B | 1 | 1 / 0 | 2 / 1 | 2 |
| G96 G97 | artykuł | 363 | 9,7 | 5,5 | A | 1 (1 <9 px) | 1 / 0 | 1 / 1 | 1 |
| G98 G99 | krótka | 123 | 6,9 | — | — | 1 | 0 / 0 | 0 / 1 | 1 |
| M00 M01 | krótka | 96 | 3,3 | — | — | 0 | 0 / 0 | 0 / 0 | 0 |
| M03 M04 M05 | artykuł | 202 | 6,2 | 5,0 | A | 0 | 1 / 0 | 0 / 1 | 0 |
| M06 | krótka | 109 | 3,8 | — | — | 0 | 0 / 0 | 0 / 0 | 0 |
| M07 M08 M09 | artykuł | 162 | 4,3 | 12,3 | A | 0 | 0 / 0 | 1 / 0 | 0 |
| M19 | krótka | 86 | 2,7 | — | — | 0 | 0 / 0 | 0 / 0 | 0 |
| M29 | krótka | 109 | 3,9 | — | — | 0 | 0 / 0 | 0 / 0 | 1 |
| M30 M02 | artykuł | 154 | 4,4 | 6,5 | A | 0 | 0 / 0 | 1 / 0 | 1 |
| M41 M42 M43 M44 | krótka | 91 | 2,9 | — | — | 0 | 0 / 0 | 0 / 0 | 0 |
| M48 M49 | krótka | 70 | 2,7 | — | — | 0 | 0 / 0 | 0 / 0 | 0 |
| M98 M99 | artykuł | 189 | 6,1 | 15,9 | A | 0 | 0 / 0 | 2 / 0 | 2 |
| A B C | krótka | 190 | 5,6 | — | — | 0 | 0 / 0 | 0 / 1 | 0 |
| G68,2 G53,1 | krótka | 206 | 5,9 | — | — | 0 | 0 / 0 | 0 / 1 | 0 |
| G43,4 | krótka | 169 | 6,2 | — | — | 0 | 0 / 0 | 0 / 1 | 0 |
| CYCLE800 | krótka | 172 | 5,4 | — | — | 0 | 0 / 0 | 0 / 1 | 1 |
| TRAORI TRAFOOF | krótka | 100 | 4,8 | — | — | 0 | 0 / 0 | 0 / 1 | 0 |

## Załącznik B — pliki pomiarowe

Skrypty i wyniki są poza repozytorium (katalog roboczy sesji): pomiary 390/360 px i axe dla każdej karty, tekst według komponentu, wyciąg wszystkich podpisów, zrzuty ekran po ekranie. Skrypt liczący wzorce językowe nadaje się na zalążek `audit:jezyk` — do przeniesienia do `scripts/` w paczce X.
