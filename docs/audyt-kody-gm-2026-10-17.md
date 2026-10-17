# Audyt sekcji „Kody G i M”

Data: 17 października 2026 r. Stan treści: gałąź `sprint-25/paczka-s`, commit `f522c8c` (main + poprawka `G00 G43` z paczki S, PR #89). Raport planuje zmiany. Sam niczego w kartach nie poprawia.

## 1. Zakres i sposób sprawdzenia

| Obszar | Co sprawdzono | Jak |
|---|---|---|
| Treść | 56 kart (`content/kody/*.mdx`): 12 z ★, 27 z artykułem, 29 bez artykułu | pełne czytanie frontmattera i artykułu, porównanie z lekcjami po paczkach L–R |
| Programy | 90 programów Fanuc (27 z nich ukrytych, patrz §3.1) i 2 Sinumerika | parser i walidator w trybie wykrytym z treści oraz osobny skrypt kontrolny: nagłówek, G94/G99, G43, pierwszy ruch, kropka, tryb tokarki |
| Rysunki | 39 rysunków na 28 kartach | zrzut każdego rysunku, sprawdzenie geometrii z programem i opisem |
| Układ | lista `/kody` i każda karta | Playwright na build produkcyjnym: 1440 px i 390 px, ciemny motyw, a jasny na próbce |
| Odnośniki | 115 adresów wewnętrznych, kotwice `#`, markery `[[…]]` | żądanie HTTP do każdego adresu, kontrola kotwic na stronie, walidacja `npm run tresci` |
| Fonty | Sora, Inter, JetBrains Mono | `document.fonts` i style obliczone dla nagłówków, tekstu, kodu i rysunków |

**Granice.** Twierdzeń o zachowaniu Fanuca nie sprawdzałem w instrukcji B-64604EN, bo nie ma jej w materiałach projektu (odłożona pozycja 2). Rejestr źródeł podaje Handbook B-64607EN, który jest zestawieniem i nie opisuje zachowań. Takie miejsca mają status **do weryfikacji**. Linków zewnętrznych w źródłach nie otwierałem, bo sesja nie ma dostępu do tych domen. Nie robiłem prób na obrabiarce. Na telefonie i w jasnym motywie oglądałem próbkę kart, nie wszystkie.

### Priorytety (jak w raporcie #80)

- **P1 — poprawić najpierw.** Treść uczy błędnej zasady albo przykład przeczy opisowi lub geometrii.
- **P2 — przy redakcji karty.** Nieprecyzyjny termin, brak założeń, sprzeczność z lekcją, trudny rysunek.
- **P3 — dopracowanie.** Czytelność, układ, powtórzenia.
- **Do weryfikacji.** Zależność od sterowania lub parametru, której nie da się rozstrzygnąć bez instrukcji. To nie jest rozstrzygnięty błąd.

## 2. Najważniejsze ustalenia

Karty dobrze pokrywają podstawy. Wzorzec ★ (G00–G04, G17–G21, G40–G49, G54, G90, G94) jest rozbudowany i w większości poprawny. Obliczenia na kartach są poprawne: R↔I/J, kompensacja, G43, czujnik krawędzi, Rt, d₃ dla M24×3, otwory pod gwint. Lekcje po paczkach L–R są jednak dokładniejsze. Karty mają **starsze, bardziej kategoryczne sformułowania** i miejscami **przeczą lekcjom**. Programy w kartach nie trzymają się profilu kursu: 15 wariantów bloku startowego, brak G94, łączenie XY i Z w pierwszym dojeździe.

| Pr. | Ustalenie | Gdzie | Co zmienić |
|---|---|---|---|
| P1 | Program tokarski wyświetlany w symulatorze frezarki (`<Sim mode="mill">`) | G71/G70, G96/G97 | `mode="lathe"`, przepisać przykład |
| P1 | Przykład „odpowiednik G71” ma inny kontur niż program obok i inną głębokość (3 mm zamiast U2.0) | G71/G70 | pokazać sam cykl G71/G70 (parser go obsługuje) |
| P1 | Gwint pokazany ruchem G01 zamiast G32/G76; ostatnie przejście M24×1,5 za głęboko | G33/G32, G76 | G32 albo G76 w symulacji; d₃ = 22,16 |
| P1 | „Przy G96 zmienia się rzeczywisty skok” — skok jest na obrót; przy zmianie obrotów kolejne przejścia nie trafiają w ten sam zwój | G33/G32, G90/G92/G94 (tok.), G96/G97 | opis jak w pitfallu G33 |
| P1 | „Wybierz G72, gdy materiału jest więcej w osi Z niż w X” — odwrotnie | G72 | G72 dla krótkich detali o dużej różnicy średnic |
| P1 | „Działają jak G28: najpierw punkt pośredni” dotyczy też G27 — G27 nie ma punktu pośredniego | G27/G29/G30 | rozdzielić opis G27, G29, G30 |
| P1 | „G92 S… na starszych tokarkach, G50 S… na nowszych” — to systemy kodów A vs B/C | G92 (artykuł) | jak we frontmatterze karty |
| P1 | Pozycję **czoła wrzeciona** (N) nazwano pozycją **końca narzędzia** | G43/G49 | „N = …” jak w FP.2 i na rysunku tej samej karty |
| P1 | Nieaktualne „symulator nie obsługuje”: G16, G68, cykle stałe — parser obsługuje wszystkie trzy | G01, G68/G69, G80–G83 | usunąć notki, pokazać prawdziwe G68 i G83 |
| P1 | Brak G80 „wywierci otwór przy dojeździe do frezowania” — jawne G00/G01 kasuje cykl (Fanuc 0i-F, rozdz. 3, s. 69, jak w F1.5) | G80–G83 | warunek: ruch bez kodu grupy 01 |
| P1 | Sprzeczne zasady jednej M w bloku: „na części Fanuców” i „większość Fanuców” na tej samej karcie | M03–M05, M07–M09 | jedno zdanie z parametrem (do weryfikacji: 3404#7 M3B) |
| P2 | 27 kart z artykułem ma w pliku opis, przykład, notkę Sinumerika i pitfalle, których strona nie pokazuje. Wyszukiwarka je indeksuje. Ukryte przykłady mają błędy | §3.1 | decyzja: pokazać, usunąć albo oznaczyć w panelu |
| P2 | Sprzeczności z lekcjami po paczkach L–R: tor G00, liczba obrotów postoju, G500, G53/G153/SUPA, M30, chłodziwo, makro M06, rejestry przy G20/G21, kolejność G43 → S M03 | §3.3 | przenieść sformułowania z lekcji |
| P2 | Programy niezgodne z profilem kursu: 15 nagłówków, 27 frezarskich bez G94, 41 pierwszych dojazdów XY+Z, 13 z mieszaną kropką, tokarka bez G99/T | §3.2, zał. A | jeden nagłówek frezarki i tokarki, jak w F1.5 i T1.3 |
| P2 | Nazewnictwo: „sterownik” 103× (lekcje: tylko „sterowanie”), korekcja/kompensacja, „baza” zamiast punktu referencyjnego, „wytak”, dwie karty „Cykl gwintowania” | §3.4 | słownik pojęć sekcji |
| P2 | 18 kart bez źródeł; 12 kart ★ z Sinumerikiem bez strony | §3.5 | źródła przy każdej karcie |
| P2 | Rysunki: oś czasu G04 sugeruje wcięcie 0,56 s (w przykładzie 14 s), zbędny łuk na najeździe stycznym, numery ①–④ bez opisu, legendy „błąd / kolizja” przy R−30 i krzywej bez limitu | §5 | poprawki SVG |
| P3 | „Składnia” trzy razy na karcie z artykułem (nagłówek strony, artykuł, prawa kolumna), dwa style H2, G03 = kopia G02 | §3.1, §6 | jeden szablon karty |
| P3 | 28 kart bez rysunku, choć lekcje mają gotowe rysunki do G32/G76, G81–G83, M03, G74 | §5.3 | ponowne użycie rysunków z lekcji |

**Nie zgłaszam jako błędu:** kierunku G02/G03 na tokarce (rysunek z X w górę i Z w prawo, niezależnie od głowicy — opis poprawny), strony G41/G42 na tokarce, obliczeń kompensacji (80 × 50 → 60 × 30 przy złej stronie), rozpisania czujnika krawędzi, R−30 w kalkulatorze łuku, tabeli otworów pod gwint (poprawne wartości; źródło — odłożona pozycja 4).

## 3. Ustalenia przekrojowe

### 3.1 Struktura karty

1. **Dwa szablony.** Karta bez artykułu: Składnia → Jak to działa → Przykład → Sinumerik → Na co uważać → Powiązane → Źródła. Karta z artykułem: Składnia → artykuł z własnymi sekcjami. Pola `desc`, `example`, `sinumerik` i `pitfalls` z frontmattera **nie są wtedy pokazywane** (`src/app/kody/[slug]/page.tsx`), ale trafiają do wyszukiwarki (`src/lib/searchIndex.ts`). Fraza znaleziona w wyszukiwarce może więc nie wystąpić na karcie. Panel Keystatic pokazuje te pola jak zwykłe.
2. **Ukryte przykłady mają błędy.** G00: `G01 X80 Y30` po `G00 X80 Y30` to ruch zerowy. G33: pierwsze przejście 2,3 mm na stronę przy skoku 1,5. G96: `G96` bez `G50`. Przykłady G52, G68, G92 i M98 nie używają kodu karty. Paczka S poprawiła w nich `G00 G43`, ale nikt ich nie widzi.
3. **Powtórzona składnia.** 11 artykułów ma własne `## Składnia` pod nagłówkiem strony „Składnia” (G00, G01, G33, G43, G68, G71, G76, G81, G84, G85, G96). Na komputerze prawa kolumna powtarza składnię i adresy po raz trzeci. Spis treści G00 ma dwa razy „Składnia” (pozycje 1 i 3).
4. **Nazwy sekcji porównania** to raz „Fanuc kontra Sinumerik”, raz „Różnice między sterownikami”, raz „Sinumerik”. W G00–G04 jest dodatkowo Heidenhain bez źródła.
5. **G02 i G03** mają ten sam artykuł (różnią się 4 linie). Każda poprawka wymaga dwóch zmian. Zostawiłbym pełny artykuł na G02, a na G03 krótki z odesłaniem. Druga opcja to jedna karta „G02/G03” z przekierowaniem.
6. **Gwiazdka ★** oznacza pełny układ, nie weryfikację (`docs/karty-kodow.md` §5). Czytelnik może to odebrać inaczej, zwłaszcza że lista pokazuje filtr „★ Opracowane”.
7. `docs/karty-kodow.md` mówi, że symulacje w kartach są „chronione” i się ich nie zmienia. Paczki L–S zmieniały je świadomie, a P1 z §2 wymaga takich zmian. Zasadę trzeba zaktualizować (decyzja w §8).

### 3.2 Programy i profil zapisu

Profil kursu (F1.5, T1.3): frezarka `G21 G90 G94 G17` / `G40 G49 G80` / `G54` → `T1 M06` → `G00 G43 H1 Z50.` → `S… M03`; tokarka `G18 G21 G40 G80 G99`, `T0101`, `G50 S…` przed `G96`. Karty pokazują ten profil nad przykładami („Zapis przykładów: … G94 … G99”), ale same go nie stosują.

| Kontrola | Wynik | Uwagi |
|---|---|---|
| warianty bloku startowego | 15 | 28× `G21 G90 G17 G54`, 19× `G21 G90 G94 G17 G54`, 11× `G18 G21 G40 G99` … |
| frezarka bez G94 przy ruchu roboczym | 27 | w tym wszystkie dema G01–G03 |
| pierwszy dojazd łączy XY i Z | 41 | m.in. G01–G03 (dema), G40–G42, G54, G90, G17, G20; sprzeczne z G00 „Bezpieczny dojazd” i F3.x |
| kolejność S M03 → G43 | 9 | m.in. Sim G00 i M03 („standardowa sekwencja”) |
| M06 bez G43 przed ruchem Z | 3 | G74, G76/G87–G89, M00/M01 |
| mieszany zapis z kropką i bez | 13 | G04, G20, G33, G76 … — przy karcie G00, która ostrzega przed brakiem kropki |
| tokarka bez T | 11 | m.in. Sim G04, G17, G33, G71, G76, G94, G96 |
| tokarka bez G99 przy F w mm/obr | 4 | G50, G72, G75 (walidator czyta F0.15 jako mm/min), Sim G04 |
| tokarka z G95 zamiast G99 | 1 | Sim tokarski G04 |
| G96 bez G50 | 2 | demo G40–G42, ukryty przykład G96 |
| gwint wykonany G01 | 3 | Sim G33, Sim G76, ukryty G76 |
| tokarka w symulatorze frezarki | 2 | G71/G70, G96/G97 |
| komentarze `;` w zapisie Fanuc | 9 kart | G28, G33, G52/G53, G68/G69, G71/G70, G84, G85/G86, M30, M98/M99 — w Fanuc komentarz jest w nawiasach, `;` zostaje w Sinumeriku |

Przykłady z `simulate: false`, które parser już wykonuje bez błędów: G34, G50, G72, G74, G75, G76/G87–G89, M29. Mogą dostać podgląd. Parser obsługuje też G71/G70, G76, G32 i G83, więc karty nie muszą ich rozpisywać ręcznie (sprawdzone: 0 błędów, 0 ostrzeżeń). Zestawienie programów: załącznik A.

### 3.3 Sprzeczności z lekcjami po paczkach L–R

| Temat | Karta | Lekcja (stan po paczkach) |
|---|---|---|
| tor G00 | „Tor nie jest linią prostą”, „najważniejsza rzecz”, „zwykle łamany”, „typowo 45°” | F3.1: „G00 bez gwarancji”, tor zależny od parametru i prędkości osi |
| postój | G04: „dwa obroty wystarczą”, „zasada: 1–2 obroty”, utwardzanie bezwarunkowo; G82: „kilka obrotów” | F3.5: czas według operacji, w przykładzie co najmniej 3 obroty, umacnianie warunkowo |
| G80 | „brak G80 → dojazd wywierci otwór” | F1.5: jawne G00/G01 kasuje cykl (s. 69) |
| G500 | G54: „G500 (przesunięcie zerowe)” | F0.3: wyłącza przesunięcie nastawne, frame bazowy może zostać |
| G53 / SUPA | G52/G53: „SUPA (dawniej G153)”, „SUPA zamiast G53” | F0.2: G53, G153 i SUPA mają różny zakres |
| M30 | artykuł: zawsze stop wrzeciona, chłodziwa, reset, licznik | F1.5: przewinięcie i reset zależą od parametrów 3404#4/#5 (s. 201) |
| chłodziwo | M07–M09: przerywany strumień → mikropęknięcia, bezwarunkowo | F2.4: zalecenie producenta narzędzia |
| M06 | „często robi to makro producenta” | F2.1: przebieg wymiany ustala konstruktor |
| wykruszanie | M03–M05: „najczęściej wykrusza w kilka sekund”; G96: „płytka wykrusza” | F2.2: „może się wykruszyć” |
| G20/G21 | „przelicza wszystko, także rejestry korekcji” | F1.4: rejestry zależne od sterowania (Haas Setting 9) |
| G43 | „pozycja maszynowa końca narzędzia” | FP.2: N = Z + L, punkt programowany na końcu narzędzia |
| kolejność | M03: S M03 przed G43 jako „standardowa sekwencja” | F1.5: T M06 → G00 G43 → S M03 |

### 3.4 Nazewnictwo i styl

| Problem | Przykład | Propozycja |
|---|---|---|
| sterownik / sterowanie / kontroler | 103× „sterownik”, 35× „sterowanie”, 1× „kontroler”; lekcje: tylko „sterowanie” | „sterowanie” (układ sterowania CNC); „sterownik” zostawić dla PLC |
| korekcja / kompensacja promienia | tytuł G40 „Kompensacja…”, tekst „Korekcja promienia”, lekcja F4.2 „korekcja promienia” | „korekcja promienia narzędzia”; „kompensacja” jako synonim w słowniku |
| baza / punkt referencyjny / zero maszyny | G27–G30 i rysunek: „baza maszyny”, „powrót do bazy”; G28: „punkt referencyjny” | M — zero maszyny, R — punkt referencyjny (jak F0.2); bez „bazy” |
| wytak | M19, G76/G87–G89 | „wytaczak” |
| gwintowanie | G33 „Gwintowanie jednym przejściem”, G76 „Cykl gwintowania (tokarka)”, G84 „Cykl gwintowania” | tokarka: „toczenie gwintu”; G84: „gwintowanie gwintownikiem” |
| płaszczyzna R | G81 params: „płaszczyzna bezpieczna” | „płaszczyzna R — początek posuwu” |
| G00 | karta „Szybki dojazd”; lekcja „G00 — ruch szybki”; Fanuc „positioning” | „Ruch szybki (pozycjonowanie)” |
| pewność bez źródła | 10× „większość/większości”, „dokładnie” w znaczeniu „bez odchyłki”, „zawsze na osi obrotu”, „najlepszy” | warunek albo źródło |
| styl pitfalli | G28, G84: „(przyczyna) → (skutek) → (poprawka)”; reszta: zdanie | jeden styl |
| G32/G33 w profilu | artykuł: „G33 (na części Fanuców G32)” | profil kursu = system A → G32; G33 w systemach B/C i na frezarce |

### 3.5 Źródła

- **18 kart bez źródeł:** G15/G16, G22/G23, G31, G34, G68/G69, G93, M00/M01, M03–M05, M06, M07–M09, M19, M30, M41–M44, M48/M49, G68.2/G53.1, G43.4, CYCLE800, TRAORI.
- **12 kart z wpisem bez strony:** wpis `sinumerik` bez rozdziału w kartach ★ i osiach A/B/C (odłożona pozycja 1).
- Wpis `fanuc` to Handbook B-64607EN. Zachowania (G20/G21 w osobnym bloku, kilka M w bloku, G53, narożniki kompensacji) wymagają B-64604EN (odłożona pozycja 2).
- Heidenhain (G00–G04), LinuxCNC/Tormach (G04), GRBL (G92), Haas M88/M89 — bez wpisu w rejestrze.

## 4. Przegląd karta po karcie

Karty bez uwag merytorycznych: **G73, G75, G94/G95** (poza jednym G95 w „Typowych błędach”), **G98/G99, osie A/B/C, G68.2/G53.1, G43.4, CYCLE800, TRAORI** (poza brakiem źródeł). Karty wieloosiowe są dobrym wzorem: ten sam detal w G68.2 i CYCLE800 oraz w G43.4 i TRAORI.

| Karta | Pr. | Ustalenia | Zmiana |
|---|---|---|---|
| G00 | P1/P2 | tor bezwarunkowo łamany (desc, nagłówek, pitfall, tabela) i zaraz potem LRP/RTLION; „F ignorowany” — F zostaje zapamiętane dla G01; „wycofanie w cyklach zawsze G00” (nie w G84, G85, G89); ostrzeżenie o kropce, a przykłady bez kropki | wg F3.1; „F nie wpływa na G00, ale zostaje zapisane”; cykle wymienić; kropka w przykładach |
| G01 | P1 | notka „symulator nie interpretuje G16” nieaktualna; tabela „tokarki starsze: G98/G99” (to system A) i „G91 na tokarce” (w A brak); „F250 w trybie G95” na tokarce; „przesuń się o 100 mm pod kątem” (w G90 to położenie od zera); liczby zagłębiania i rampy bez źródła | poprawić tabelę i notkę; liczby „wg producenta narzędzia” |
| G02 / G03 | P2/P3 | pitfall „na tokarce w G18 obraz bywa odwrócony” przeczy dobremu akapitowi; „większość sterowników przyjmie R” → Fanuc (źródło); helisa to opcja; `,R`/`,C` Fanuc do weryfikacji; G03 = kopia G02 | patrz §3.1 pkt 5 |
| G04 | P1/P2 | Sim tokarski z G95 i bez T; liczba obrotów i utwardzanie sprzeczne z F3.5; DWL a P „zwykle w ms”, „odliczanie w polu X”, Haas „P przejmowane przez cykl” — bez źródła | G99, T0101; wg F3.5; do weryfikacji |
| G09/G61/G64 | P2 | opis G62 bez kodu w nazwie i składni; brak G63; „G64 domyślny” (parametr) | dopisać G62/G63 do karty albo usunąć z opisu |
| G10 | P2 | L10–L13 to pamięć korektorów C; tokarka: P10000+n geometria / P n zużycie; brak L20 (G54.1) | dopisać warunki |
| G15/G16 | P2 | „biegun zależy od G90/G91 w bloku z G16” — w Fanuc decyduje tryb podania promienia (do weryfikacji); brak źródeł | przeredagować po sprawdzeniu |
| G17–G19 | P2 | oś cykli wiertarskich przy G18/G19 zależy od parametru FXY (do weryfikacji, 5101#0); „frezarka domyślnie G17” — parametr | warunek |
| G20/G21 | P2 | „przelicza wszystko, także korekcje” vs F1.4; „na Fanucu w osobnym bloku” — wszystkie programy kursu łączą G21 z G90 (do weryfikacji w B-64604); tabela bez G70/G71 systemu C; „G20/G21 nie istnieją” w Sinumeriku — istnieją w trybie ISO | wg F1.4; źródło albo złagodzenie |
| G22/G23 | P3 | brak źródeł; nazwa Fanuc „kontrola obszaru 2” | źródło |
| G27/G29/G30 | P1 | G27 opisany jak G28 (punkt pośredni) | rozdzielić |
| G28 | P2 | brak wariantu tokarki `G28 U0 W0`; komentarze `;` | dopisać |
| G31 | P3 | brak źródeł; F 50–300 mm/min bez źródła | wg producenta sondy |
| G32/G33 | P1 | G32 jako „wariant”, choć w profilu kursu jest główny; „przy G96 zmienia się skok”; Sim przez G01, X21.8 za głęboko; rozbieg „2–4× skok” bez źródła; nazwa | §2, §3.4 |
| G34 | P3 | brak źródeł; parser obsługuje — można włączyć podgląd | — |
| G40–G42 | P2 | narożnik zewnętrzny „łuk albo przecięcie — parametr” dla Fanuc (kompensacja C: wektory liniowe, łuk przez G39 — do weryfikacji); demo tokarskie `G96` bez `G50` | do weryfikacji; G50 S |
| G43/G49 | P1/P2 | „pozycja końca narzędzia” (to N); tabela metod miesza konwencję H = długość i H z dotyku na detalu; „G43 bez Z nic nie robi” (do weryfikacji); Code „G49 przed referencją”, Sim bez G49 | wg FP.2; opisać dwie konwencje |
| G50 (tok.) | P2 | nagłówek bez G40/G99; brak informacji, że na frezarce G50 kasuje skalowanie | dopisać |
| G52/G53 | P2 | SUPA/G153 sprzeczne z F0.2; „G53 tylko z G00/G01” (do weryfikacji); „X-500 — stół do operatora”; ukryty przykład bez G52 | wg F0.2 |
| G54–G59 | P2 | „G500 (przesunięcie zerowe)” vs F0.3 | wg F0.3 |
| G65–G67 | P3 | przykład bez wrzeciona i G43 jako „Przykład” | opisać jako fragment |
| G68/G69 | P1 | dwie notki „symulator nie obsługuje G68” — nieaktualne; przykład bez G68; brak źródeł; G68 to opcja | Sim z G68 |
| G71/G70 | P1 | Sim `mode="mill"`; kontur Sim ≠ kontur P–Q; przejścia 3 mm vs U2.0; „CYCLE93–95 rowkowanie” (CYCLE93 rowki, CYCLE94 podcięcia, CYCLE95 kontur); FALX/FALZ (odłożona poz. 3) | Sim z prawdziwym G71/G70 |
| G72 | P1 | wybór G72 odwrotnie; nagłówek bez G99 | §2 |
| G74 | P2 | przykład frezarski bez G43 i G94; P/Q „w mikrometrach” — w najmniejszej jednostce wprowadzania | poprawić przykład |
| G76/G87–G89 (frez.) | P2 | przykład bez G43 i G94; adres `g76-g89` sugeruje zakres G76–G89 | adres zostaje (chroniony), nazwa jasna |
| G76 (tok.) | P1 | Sim przez G01 — parser wykonuje G76; „skok musi zgadzać się z obrotami” niejasne | Sim z G76; ograniczenie S·F ≤ posuw maks. |
| G80–G83 | P1 | notka „symulator nie interpretuje cykli” nieaktualna; rozpisany G83 „dokładnie to, co robi sterownik” — nie (powrót szybki do d nad poprzednią głębokością); G80 vs F1.5; G73 „0,5–1 mm” vs karta G73 „0,1–1 mm”; „Sinumerik nie używa G81–G89” — w trybie ISO używa | Sim z G83; wg F1.5 |
| G82 | P2 | liczba obrotów inna niż w G04 i F3.5; „ślad spirali” bez źródła | jedna reguła |
| G84 | P3 | Sim bez G94 i M29, choć karta je akcentuje; komentarze `;` | dopisać |
| G85/G86 | P2 | składnia Sinumerika sugeruje G86 = CYCLE86 (CYCLE86 ≈ G76 Fanuc); „brak śladu”, „najlepszy”; liczby bez źródła | tabela odpowiedników |
| G90/G91 | P2 | „G91 G28 Z0 — w górę bez punktu pośredniego” vs karta G28; „G90 G28 Z0 … w materiał” bezwarunkowo; dwa pitfalle o U/W | wg G28 |
| G90/G92/G94 (tok.) | P1 | „przy G96 skok się rozjedzie” | §2 |
| G92 | P1 | artykuł: „starsze/nowsze tokarki”; GRBL wymieniony jako sterowanie bez G54 (GRBL ma G54–G59); brak G92.1 | poprawić |
| G93 | P3 | brak źródeł (opcja Fanuc) | źródło |
| G96/G97 | P1 | Sim `mode="mill"`; `G01 X0 Z0` z Z2 tnie stożek zamiast czoła; potem Ø60 → Ø40 jednym przejściem; tabela Vc bez źródła i inna niż kalkulator | przepisać Sim; tabela z kalkulatora |
| M00/M01 | P2 | „większość maszyn zatrzymuje wrzeciono” (zależne od producenta); przykład: M06 bez G43, kończy się wymianą T02 i M30 | poprawić przykład |
| M03–M05 | P1/P2 | sprzeczność jednej M w bloku; „M03 dla standardowych noży tokarskich” — zależy od położenia głowicy i noża; wykruszanie; kolejność S → G43 | §2, §3.3 |
| M06 | P2 | „makro producenta” vs F2.1; brak źródeł (Haas Workbook ma M06) | wg F2.1 |
| M07–M09 | P2 | chłodzenie węglika vs F2.4; „jedna M w bloku” bezwarunkowo; „M30 wyłącza chłodziwo” (zależne od maszyny) | wg F2.4 |
| M19 | P3 | brak źródeł; „wytak” | — |
| M29 | P2 | „wpisane za G84 nie zadziała na większości” — do weryfikacji (Fanuc dopuszcza M29 przed G84); karta frez+tok, opis tylko frezarki | do weryfikacji |
| M30/M02 | P2 | artykuł bezwarunkowy vs frontmatter i F1.5; M02 i przewinięcie — parametr | wg F1.5 |
| M41–M44, M48/M49 | P3 | brak źródeł; M48/M49 oznaczone jako „Fanuc” — to kody producenta | etykieta „zależnie od producenta” |
| M98/M99 | P3 | format `P51001` / `L5` bez źródła (odłożona poz. 2); przykład O0200 bez narzędzia | — |

## 5. Rysunki i pomoce graficzne

### 5.1 Poprawne i dobre

Ruch szybki, przejazd obok zacisku, G01 z rozkładem F na osie (358/179 mm/min — obliczenia się zgadzają), G02/G03 z R±30 (środki i łuki zgodne z kodem), płaszczyzny G17/G18/G19 (orientacja patrzenia poprawna), G20/G21, G22, G28 przez punkt pośredni, G31, kompensacja (X−5…X85, R15), strona G41/G42 na frezarce i tokarce, G43 z dwoma narzędziami, punkty M/R/N/W, czujnik krawędzi, dwa imadła, G71, G72, G73/G83, G76 z orientacją, G84 z czterema głębokościami, G90/G91, U/W, G90 tokarski, Rt, krzywa G96 (przecięcie przy Ø21 zgadza się z n = 1000·Vc/(π·D)).

### 5.2 Do poprawy

| Rysunek | Karta | Pr. | Problem | Zmiana |
|---|---|---|---|---|
| `g04` | G04 | P2 | oś czasu w sekundach: wcięcie G01 kończy się przy 0,56 s, a w programie (X44 → X30, F0.05, 600 obr/min) trwa 14 s; Ø44 opisane w środku bloku, nie przy krawędzi | oś bez skali albo przerwana; wymiar Ø44 przy krawędzi |
| `f43-leadin` | G40–G42 | P2 | prawy niebieski łuk przy narożu płytki nie ma odpowiednika w programie (naroże X0 Y0 jest ostre); odjazd łukiem rysowany przerywaną niebieską linią, której nie ma w legendzie | usunąć łuk; styl linii wg legendy |
| `f42-comp` | G40–G42 | P3 | numery ①–④ bez objaśnienia; etykieta `G41 D1 G01 X0.` nachodzi na kontur | opis w podpisie, przesunąć etykietę |
| `comp-entry` | G40–G42 | P3 | dojazd G01 rysowany przerywaną linią (w legendzie przerywana = G00) | linia ciągła |
| `g02`, `g03` | G02/G03 | P3 | łuk R−30 w legendzie jako „błąd / kolizja”, choć to poprawny drugi wariant | osobny wpis legendy „drugi łuk (R ujemne)” |
| `ConstVc` | G50, G96 | P3 | krzywa bez limitu jako „błąd / kolizja”, zielona krzywa obrotów jako „G01 — ruch roboczy” | legenda wg znaczenia |
| `RefPoint` | G27–G30 | P2 | czerwona linia G90 … Z0 zaczyna się nad narzędziem, a powinna od narzędzia; „baza maszyny” zamiast punktu referencyjnego | jak `g28-path` |
| `CycleRetract` | G80–G83 | P2 | główny rysunek karty cykli pokazuje G98/G99 (ten sam co na karcie G98/G99), a nie anatomię cyklu opisaną tuż przed nim | rysunek cyklu z lekcji (`f51-cycle`) i `f52-peck` przy wierceniu głębokim |
| `Groove` | G75 | P3 | nierówne odstępy wgłębień (stałe Q) | równe odstępy, ostatnie krótsze |
| `t03-zero` | G54–G59 | P3 | etykieta „dotyk czoła → Z” obcięta na prawej krawędzi | przesunąć |
| `LatheSingle` | G90/G92/G94 (tok.) | P3 | obcięta etykieta przy dolnej krawędzi | przesunąć |
| `t12-uw` | G90/G91 | P3 | `Z-40.` i `X36.` nachodzą na linie | odsunąć |
| `g84-depths` | G84 | P3 | „Ø8,5, stożek 118°” nachodzi na krawędź materiału | odsunąć |
| `CycleRetract` | G98/G99 | P3 | „poziom początkowy” pod przyciskiem pełnego ekranu; „Z0” przy krawędzi | margines |
| `f41-length` | G43 | P3 | dwie etykiety rejestrów w jednej linii, bez odstępu | dwie linie |
| `helix-z` | G02/G03 | P3 | rzut z boku nie w skali (2 mm wyższe niż średnica) | „skala pionowa przesadzona” w podpisie |

Na telefonie (390 px) napisy w rysunkach mają ok. 8–9 px. Przycisk pełnego ekranu pomaga, ale minimum dla głównych etykiet to 11–12 px. Wymaga to większej czcionki SVG albo uproszczenia rysunków. W jasnym motywie rysunki zostają ciemne. Jest to spójne z symulatorem, więc nie zgłaszam tego jako błędu.

### 5.3 Brakujące pomoce

28 kart nie ma żadnego rysunku. Część rysunków istnieje już w lekcjach i można je podpiąć bez rysowania od nowa. Przed podpięciem trzeba sprawdzić, czy dane rysunku zgadzają się z przykładem karty:

| Karta | Gotowy rysunek z lekcji |
|---|---|
| G32/G33, G76 (tok.) | `t72-g32`, `t71-passes`, `t72-depths` |
| G80–G83 | `f51-cycle`, `f52-peck`, `f54-levels` |
| G74 | `t62-drill`, `t62-pecks`, `f53-tap` |
| M03–M05 | `f22-dir` |
| G04, G82 | `f35-dwell` |
| G96/G97, G50 | `t22-css`, `t22-face` |
| M06 | `f21-change` |
| G01 (zagłębianie) | `f62-ramp` |

Nowe rysunki wymagają: G09/G61/G64 (naroże przy G61 i G64), G52 (układ lokalny), G68 (obrót), G85/G86 (rodzaje wyjścia), G92 (G92 a G54), osie A/B/C (zwroty wg ISO 841), G68.2 i G43.4 (3+2 a TCP).

## 6. Układ, odnośniki i fonty

**Odnośniki.** 115 adresów wewnętrznych odpowiada 200, nie ma kotwic prowadzących donikąd, a markery `[[…]]` przechodzą walidację treści. Nie ma też błędów w konsoli ani przewijania w poziomie przy 390 px.

**Fonty.** Ładują się trzy kroje z repozytorium: Sora (nagłówki), Inter (tekst) i JetBrains Mono (kod oraz tytuł karty). Zgadza się to z identyfikacją GCat. Niespójności:

| Element | Karta z artykułem | Karta bez artykułu |
|---|---|---|
| tekst | Inter 15,5 px | Inter 16 px |
| H2 | dwa style na jednej stronie: `card-h` 19,2 px z pomarańczowym paskiem (Składnia, Powiązane) i artykułowe 22,7 px bez paska | tylko `card-h` |
| „Źródła” | mały nagłówek bez paska | jak obok |

**Układ karty.**
- Na komputerze są trzy kolumny: spis, treść ~640 px i karta skrócona. Karta skrócona powtarza składnię i adresy z treści. Przy kartach z artykułem składnia występuje trzy razy (§3.1).
- Na telefonie strony są długie: G40–G42 ok. 15 500 px, G00 ok. 11 800 px. Porównania sterowań i „Dobre praktyki” można zwijać, tak jak bibliografię w lekcjach (paczka N).
- W okruszkach odstępy są nierówne („GCat /Kody /G00”).
- W jasnym motywie poziom i maszyny (czerwony, niebieski) mają słaby kontrast na ciemnym banerze.

**Lista /kody.**
- Podtytuł obiecuje „przykład i animację dla każdego kodu”. Animacji nie ma 18 kart z `simulate: false`, a 27 kart z artykułem ukrywa przykład z pliku.
- Lista jest płaska: 56 wierszy w kolejności `order`. Grupa jest tylko kolumną, ukrytą na telefonie. Nagłówki grup (Ruch, Ustawienia, Korekcje, Cykle, Wrzeciono, Funkcje M, Wieloosiowe) skróciłyby szukanie.
- Nieaktywne znaczniki „frez/tok” różnią się od aktywnych tylko odcieniem.
- Dwie karty mają tę samą nazwę „Cykl gwintowania” (G76 tok., G84).

## 7. Proponowana kolejność pracy

| Paczka | Zakres | Kryterium zakończenia |
|---|---|---|
| T — błędy merytoryczne (P1) | wszystkie P1 z §2 i §4: tryb tokarki w Sim, G71/G72, gwinty (G32, skok a G96), G27, G92, G43, notki o symulatorze, G80, jedna M w bloku | każda zmieniona zasada ma źródło albo „zależy od sterowania”; Sim pokazuje kod karty |
| U — programy | jeden nagłówek frezarki i tokarki, G94/G99, G00 G43 → S M03, osobny dojazd XY i Z, kropka, T na tokarce, `( )` zamiast `;` w Fanucu; podgląd dla kart z `simulate: false`; prawdziwe cykle zamiast rozpisań | skrypt kontrolny z zał. A bez uwag; `audit:programy` bez nowych ostrzeżeń |
| V — zgodność z lekcjami | tabela §3.3 | każda pozycja z tym samym sformułowaniem i źródłem co w lekcji |
| W — struktura kart | decyzja o ukrytych polach, jedna „Składnia”, G02/G03, nazwy sekcji porównania, jeden styl H2 | ten sam szablon dla kart z artykułem i bez; wyszukiwarka indeksuje tylko widoczny tekst |
| X — nazewnictwo i źródła | słownik pojęć §3.4, źródła dla 18 kart, strony Sinumerika, „większość/dokładnie” | 0 kart bez źródeł; „sterownik” tylko w znaczeniu PLC |
| Y — rysunki | §5.2 i podpięcie rysunków z lekcji §5.3 | podpisy i legendy zgodne z rysunkiem; etykiety ≥ 11 px na telefonie |
| Z — lista i układ | grupy na liście, podtytuł, zwijane porównania, kontrast w jasnym motywie | lista z nagłówkami grup; karta ★ krótsza na telefonie |

Kolejność: T → U → V, bo poprawione programy i sformułowania przydadzą się w W–Z. Paczki Y i Z mogą iść równolegle.

## 8. Decyzje do podjęcia

1. **Ukryte pola kart z artykułem.** Pokazać pitfalle i notkę Sinumerika pod artykułem, usunąć je, czy oznaczyć w panelu jako niewidoczne? Ukryty przykład trzeba poprawić albo usunąć.
2. **G02 i G03:** jedna karta z przekierowaniem czy pełny G02 i krótki G03?
3. **Zasada „symulacje chronione”** w `docs/karty-kodow.md` („Ograniczenia…”, pkt 1, oraz §8) — zmienić na „zmiany symulacji z kontrolą skryptem i audytem”?
4. **Heidenhain** w tabelach G00–G04: zostawić ze źródłem czy usunąć? Profil serwisu to Fanuc i Sinumerik.
5. **Adres `g76-g89`:** zostaje (adresy chronione). Zmienić tylko nazwę wyświetlaną?

## 9. Do weryfikacji w instrukcjach

| Twierdzenie | Karta | Gdzie sprawdzić |
|---|---|---|
| G20/G21 w osobnym bloku przed ustawieniem układu | G20/G21 | B-64604EN, rozdz. o przeliczaniu cale/mm |
| liczba kodów M w bloku (parametr 3404#7 M3B) | M03–M05, M07–M09 | B-64604EN / B-64610EN |
| oś wiercenia przy G18/G19 (parametr 5101#0 FXY) | G17–G19 | B-64610EN |
| G53: rodzaj ruchu, dopuszczalne G01 | G52/G53 | B-64604EN |
| narożnik zewnętrzny w kompensacji C, G39 | G40–G42 | B-64604EN |
| G43 H bez ruchu Z | G43/G49 | B-64604EN |
| DWL (3405#1) a adres P | G04 | B-64610EN |
| biegun G16 przy podaniu promienia w G90/G91 | G15/G16 | B-64604EN |
| M29 w bloku G84 albo przed nim | M29 | B-64604EN, gwintowanie sztywne |
| odliczanie postoju na ekranie, Haas „P w cyklu” | G04 | B-64604EN, Haas Mill Operator's Manual |
| Sinumerik: RTLION/RTLIOF domyślnie, G4 S, CYCLE85–89 | G00, G04, G85/G86 | SINUMERIK Fundamentals, Cycles |

## Załącznik A — programy w kartach (skrypt kontrolny)

Programy z frontmattera i bloków `<Sim>`/`<Demo>`, tryb tokarki wykrywany z treści (G18, G99, T0x0x, G96, G50 S). „[ukryty]” oznacza przykład z frontmattera karty z artykułem.

**Bloki startowe (15 wariantów):** 28× `G21 G90 G17 G54`; 19× `G21 G90 G94 G17 G54`; 11× `G18 G21 G40 G99`; 4× `G21 G90 G94 G17`; 3× `G21 G90 G17`; 3× `G21 G18 G54`; 3× `G21 G90 G94 G17 G40 G49 G80`; 2× `G21 G18 G40 G99`; 2× `G21 G90 G17 G54 G40`; 2× `G21 G90 G17 G54 G80`; po 1× `G21 G90 G18 G40 G99`, `G21 G90 G54`, `G21 G18 G54 G95`, `G18 G21 G40 G80 G99`, `G21 G90 G17 G54 G40 G49 G80`.

**Ostrzeżenia walidatora w przykładach bez podglądu** (nie wchodzą do `audit:programy`, bo mają `simulate: false`): G50, G72, G75 — F w mm/obr przy domyślnym G94; G74, G76/G87–G89, M00/M01 — M06 bez G43; G31 — G00 w dół do Z−5; G34 — F6 przy G95.

**Tokarka bez T:** G33 [ukryty], G34, G76 [ukryty], G96 [ukryty], Sim G04, G17–G19, G33, G71, G76, G94, G96.

**Pierwszy dojazd XY + Z (41):** dema G01 (5), G02 (5), G03 (5); Sim G17, G20, G40 (2), G54, G80–G83, G90; przykłady G09, G65, M00, osie A/B/C, G43.4 oraz 14 ukrytych.

Skrypt i wyniki są w paczce U jako proponowane rozszerzenie `npm run audit:programy`: wykrywanie trybu tokarki, G94/G99, G43 po M06 i kolejności dojazdu.
