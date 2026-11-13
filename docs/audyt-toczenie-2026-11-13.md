# Audyt Nauki toczenia (ścieżka T0–T9) — 2026-11-13

Raport, bez poprawek w treści. Wzór: raport #80 (`docs/audyt-frezowanie-etapy-1-5-2026-10-11.md`) i audyt kart (`docs/audyt-kody-gm-2026-10-17.md`, cz. 2 `docs/audyt-kody-gm-cz2-2026-11-09.md`). Stan `main` po #105 (`e204706`).

## 0. Zakres, metoda, priorytety

**Zakres:** 23 lekcje T0.1–T9.1 (`src/content/nauka/t*.ts`), ich rysunki (`src/components/lesson/figs-t0…t9.tsx`, 55 rysunków), „Program detalu” toczenia (`buildup.ts`), testy i zadania. Wspólne Podstawy TP.1–TP.3 tylko w miarach języka.

**Metoda:**
- Przeczytana cała treść 23 lekcji. Geometria i liczby przeliczone ręcznie (Rt, Ra, X = −2·rε, błąd fazy 0,414·rε, kierunki G02/G03 i G41/G42 z widoku od +Y, kierunki ostrza 2/3/4, kolejne głębokości G76, przejścia G32, przesunięcie zwoju w T7.2, obroty w G96).
- Zgodność z kartami: G71/G70, G72, G74, G75, G76, G33/G32, G50, G96/G97, G90/G92/G94 (tok.), G28.
- `npm run audit:nauka`, `audit:programy`, `audit:jezyk`. Do tego trzy skrypty (wyniki w zał. A i B):
  - profil kursu (`scripts/lib/profil-kursu.ts`) na 31 programach lekcji (dziś `audit:programy` stosuje profil tylko do kart),
  - kontrprzykłady zaliczeń przez `runTaskChecks` (jak R1–R6 w #80),
  - miary języka per lekcja i klasyfikacja pauz.
- Telefon: `next build` + `next start`, Playwright 390×844 i 360×800 (DPR 2), axe-core (wcag2a/2aa/21aa) na 390 px, zrzuty rysunków.

**Priorytety** (jak w #80):
- **P1** — treść uczy błędnej zasady, przykład łamie regułę oznaczoną w kursie jako niebezpieczna, test albo zadanie zalicza brak nauczanej czynności.
- **P2** — nieścisłość, brak źródła lub założenia, niespójność z kartą, bariera czytania na telefonie.
- **P3** — redakcja, drobne liczby, kosmetyka.

## 1. Podsumowanie

| Obszar | P1 | P2 | P3 | Najważniejsze |
|---|---|---|---|---|
| Merytoryka lekcji | 3 | 12 | 8 | G21 w T1.3 z odwróconym kierunkiem pomyłki; quiz T6.1 „FALX w promieniu” wbrew T5.3; demo T4.1 z G96 bez G50 |
| Zgodność z kartami | — | 3 | 3 | karta G71: CYCLE95 z zamienionymi FALZ/FALX; G97 przed odjazdem — karta nazywa brak błędem, lekcje go nie stosują |
| Programy i zadania | 2 | 3 | 1 | 11 z 15 kontrprzykładów zaliczonych w 8 zadaniach; 139 z 152 pytań testowych ma poprawną odpowiedź A |
| Język i nazewnictwo | — | 4 | 3 | pauzy 21,8 na 1000 słów (131 wtrąceń w zdaniach), „korektor”, „gwintowanie” zamiast „toczenie gwintu” |
| Rysunki | — | 4 | 2 | etykiety mediana 8,8 px (390 px), 80% < 11 px; ≥ 14 legend nie podaje znaczenia koloru |
| Telefon i axe | — | 6 | 1 | 310 ekranów na 23 lekcje (mediana 13,6); „Program detalu” do 4,3 ekranu; tabela narzędzi warsztatu za szeroka; axe 4 reguły |
| Typografia | — | 1 | — | 27 rozmiarów tekstu na lekcjach (mediana 23 na stronę), skala Z a działa tylko w `.code-card` |

Co już jest dobre i zostaje: nazewnictwo z X w toczeniu jest w większości wdrożone (0 × „kompensacja”, 0 × „sterownik”, 0 × „większość sterowań”); obliczenia w przykładach są poprawne (sprawdzone wszystkie liczby z §0); kierunki łuków i korekcji są opisane z właściwego widoku; 0 błędów parsera w programach lekcji; zdania > 25 słów: 1 na 23 lekcje.

## 2. Merytoryka

### 2.1 P1

**M1. T1.3 — G21 chroni w złą stronę.** Tabela bloku startowego: G21 „przed czym chroni: programem calowym czytanym jako metryczny”. Program kursu jest metryczny. G21 chroni przed odczytem jego wymiarów jako calowych, gdy po poprzednim programie zostało G20. F1.5 poprawiono w paczce L/O („G20 zostawione po programie calowym”) — T1.3 ma wciąż starą wersję.

**M2. T6.1 — test powtórkowy przeczy T5.3.** Pytanie `review: "T5.3"`: „W czym podawany jest FALX w CYCLE95?” — poprawna „w promieniu”, uzasadnienie „Inaczej niż U w G71”. T5.3 uczy, że to zależy od wersji cyklu, i ma pytanie z poprawną odpowiedzią „z instrukcji cykli dla tej wersji sterowania”. Do czasu wyciągu z instrukcji Siemens (zadanie odłożone nr 3) pytanie powinno pytać o to samo co T5.3.

**M3. T4.1 — dwa programy demo łamią regułę z T2.2.** `demo(false)` i `demo(true)` mają `G96 S200 M03` bez wcześniejszego `G50 S…` i bez M05 przed M30. T2.2 oznacza „G96 bez G50” jako niebezpieczne (`danger: true`). Profil kursu zgłasza oba (zał. A.1).

### 2.2 P2

| # | Lekcja | Ustalenie | Kierunek poprawki |
|---|---|---|---|
| M4 | T0.3 | Przykład: pozycja maszynowa ostrza `Z −312,4` zapisana wprost jako G54 Z. To działa tylko dla noża z korekcją geometrii Z = 0 (nóż wzorcowy). Przy noże z własną korekcją Z odsunięcie liczy się dwa razy. | Podać założenie „nóż wzorcowy” albo opisać wariant „Z0 w tabeli korekcji noża, G54 Z = 0”. |
| M5 | T5.1, T9.1 | Pułapka „Punkt startowy w materiale”: start X38 Z2 (T5.1) i X42 Z2 (T9.1) leży przed czołem, nie w materiale. Problem jest inny: pierwsza warstwa schodzi do X − 2U i bierze 3 mm (T5.1) albo 5,5 mm (T9.1) na stronę zamiast U. T9.1 podaje liczbę dobrze, ale opis „start w materiale” powtarza. | Tytuł i zdanie: „Start cyklu poniżej średnicy pręta — przeciążona pierwsza warstwa”. |
| M6 | T5.1 | „Program skrócił się o ponad 20 bloków”. Pięć przejść to 20 bloków, cykl to 3 bloki (2 × G71 + G70) — skrót o 17. | Poprawić liczbę. |
| M7 | T7.1, karty G33, G76, G96/G97 | „Przy G96 obroty zmieniałyby się między przejściami i nóż nie trafiałby w ten sam zwój”. Start przejścia synchronizuje znacznik obrotu, więc skok się zgadza. Przesuwa się początek zwoju, bo opóźnienie osi Z zależy od obrotów. Ten sam mechanizm stoi za pułapką „Zmiana S między przejściami”. | Jedno zdanie o opóźnieniu osi Z zależnym od obrotów. Źródło: instrukcja Fanuc (rozdz. o gwintowaniu) — do wyciągu z B-64604EN. Zmiana w 3 kartach i T7.1 naraz. |
| M8 | T2.2 | Pułapka „S po zmianie trybu”: „Po G97 zostaje S200 z G96 — wrzeciono kręci się 200 obr/min”. Według mojej wiedzy Fanuc przy G97 bez S zostawia obroty z chwili przełączenia, a nie liczbę S jako obr/min. Nie mam tekstu instrukcji. | **Do weryfikacji w B-64604EN.** Jeśli się potwierdzi — P1 i nowa treść pułapki („G97 bez S: obroty z chwili przełączenia, zależnie od średnicy”). |
| M9 | T1.2 | Tytuł „G90, G91 oraz U i W” — w systemie A, w którym pisany jest kurs, G90 to cykl toczenia, a G91 nie jest wymiarowaniem przyrostowym. Dwa zdania bez źródła: „G90 sam w bloku… cykl z bieżącymi wartościami albo alarm” i „współrzędne po G91 [system A] — absolutnymi”. Rzeczywiste ryzyko to G90 i G00/G01 w tej samej grupie 01 (w bloku obowiązuje ostatni kod). | Tytuł bez G90/G91 (slug zostaje). Oba zdania do weryfikacji albo „zależy od sterowania”. |
| M10 | T0.1, T0.2 | „X jest domyślnie programowane średnicowo” na obu sterowaniach. W Sinumeriku stan po starcie ustawia dana maszynowa (DIAMON jako ustawienie początkowe). T0.2 pisze dobrze: „Na Sinumeriku tryb średnicowy włącza się w programie” — T0.1 przeczy. | „Zależy od konfiguracji maszyny” przy Sinumeriku, bez lokalizacji — dokument `sinumerik` nie ma stron (zadanie odłożone nr 1). |
| M11 | T4.1 | „Ruch włączający musi być dłuższy niż rε” — reguła bez źródła. Fanuc w podręczniku podaje warunki startu korekcji inaczej (ruch liniowy, nie łuk). | Źródło albo „zalecenie kursu”. |
| M12 | T4.2 | „W dokumentacji obu producentów rysunek położeń 1–9 jest taki sam” — bez lokalizacji w Sinumeriku (dokument bez stron). Podpis rysunku: „ten sam numer obowiązuje przy głowicy przedniej i tylnej” — lokalizacja `fanuc` wskazuje rozdział zmiennych, nie rysunek kierunków. | Do weryfikacji w B-64604EN i Sinumerik Fundamentals. |
| M13 | T2.1 | „Format czterocyfrowy … najczęstszy na tokarkach Fanuc” — superlatyw bez źródła (§3a). | „Format przyjęty w kursie; liczbę cyfr ustala parametr.” |
| M14 | T3.1, T7.1 | „Korektor ruchu szybkiego/posuwu/obrotów” — w kartach i słowniku to „potencjometr korekty” (hasło `potencjometr-korekty`, alias override) albo „nastawa” (karta G00). „Korektor” w kartach G40–G42 i G43 znaczy rejestr korekcji. | Ujednolicić z hasłem słownika. Dotyczy 5 miejsc. |
| M15 | T5.3 | Źródło wpisane w podpis tabeli („według SINUMERIK 840D/810D Programming Guide Cycles, wydanie 04/2000, rozdz. 4…”). Od X źródła są tylko w polu `sources`. | Przenieść do `sources` (wpis `sinumerik-cycles` już jest). |

### 2.3 P3

- **T3.2:** „ap około 2–2,5 mm”, a piąte przejście ma 2,55. Wartość dla CNMG bez źródła stron (`sandvik` bez lokalizacji).
- **T3.3:** „R2 zamiast R1 — alarm albo inny kształt”. Przy cięciwie 1,41 mm promień 2 jest poprawny geometrycznie, więc wychodzi inny kształt, nie alarm.
- **T3.2:** `,C1.` / `,R1.` na tokarce Fanuc — przecinek zależy od opcji i parametru. Do weryfikacji razem z M8.
- **T5.2:** „oba cykle zrobią po osiem warstw” — z prześwitem startu wychodzi 9. Lepiej „ok. 8–9”.
- **T5.1:** „Część starszych sterowań Fanuc i tokarki Haas…” — brak źródła Haas dla tokarki w `sources.ts`.
- **T6.1:** podsumowanie „P i Q w mikrometrach” bez warunku „przy systemie 0,001 mm” (warunek jest w teorii).
- **T8.1:** pułapka „Zapomniane przesunięcie” ilustruje skutek blokiem absolutnym `G00 Z-30.`, który i tak trafi w Z−30. Lepszy przykład: następny ruch przyrostowy albo dojazd w X nad stopniem.
- **T9.1:** „X tylko rośnie, Z tylko maleje” → „X nie maleje, Z nie rośnie” (bloki w samym Z zmieniają tylko jedną oś).

### 2.4 Zgodność z kartami kodów

| Karta | Lekcja | Ustalenie | P |
|---|---|---|---|
| G71/G70 | T5.1, T5.3 | Składnia Sinumerik w karcie `CYCLE95("KONTUR", 2, 0.5, 0.1, ...)` przy Fanucu `U0.5 W0.1`. Kolejność parametrów (NPP, MID, FALZ, FALX…) daje FALZ = 0,5 i FALX = 0,1 — odwrotnie niż U/W. Lekcja T5.3 przelicza dobrze. | P2 |
| G96/G97 | T2.2–T9.1 | Karta: „Brak powrotu do G97 przed odjazdem i zatrzymaniem” jako typowy błąd. Żaden program lekcji nie wraca do G97 przed odjazdem. | P2, decyzja 3 |
| G50 | T2.3 | Przykład karty planuje do `X0.0`; T2.3 uczy X = −2·rε (pozostaje czop). Zera z kropką i zerem (`X60.0`) — inny zapis niż w kursie. | P2 |
| G76 | T7.1 | Karta: P „00 wybieg”, lekcja: „wyjście skośne (00 — brak)”. Jedna nazwa. | P3 |
| G33 (G32) | T7.2 | Zgodne: nazwa, system A/B/C, K w Sinumeriku, 0,92 mm w czterech/pięciu przejściach. | — |
| G90/G92/G94 tok. | T1.2, T7.1 | Zgodne co do systemu A. Karta mówi o G77/G78/G79 w systemie B — lekcja T1.2 nie (wystarczy odsyłacz). | P3 |
| G72, G74, G75 | T5.2, T6.1, T6.2 | Zgodne (pierwszy blok G72 w Z, P/Q w µm bez kropki, wycofanie R). | — |
| G28 | T1.3 | Lekcja: Sinumerik `G74 X1=0 Z1=0`. Karta G28 nie podaje odpowiednika Sinumerika dla tokarki. | P3 |

### 2.5 Źródła

- `audit:nauka`: 35 odwołań T0–T9 bez miejsca: `sinumerik` 21, `sandvik` 10, `jemielniak` 2, `iso841` 1, `fanuc` 1 (T1.1). Bez dokumentów Siemens i Sandvik paczka X ich nie ruszała — to samo tu.
- `fanuc` w kursie to **Operation and Maintenance Handbook** 0i-F. Wystarcza na formaty bloków (G71–G76, P/Q bez kropki). Szczegóły zachowania (M7, M8, M9, M12, `,C`, zachowanie G96 → G97) wymagają **Operator's Manual B-64604EN** (lathe). To rozszerza odłożone zadanie nr 2 o T1.2, T2.2, T3.2, T4.1, T4.2, T7.1.

## 3. Programy, profil T1.3, zadania i testy

### 3.1 audit:programy

227 programów, 0 błędów. W toczeniu 3 ostrzeżenia, wszystkie w starterach zadań „dopisz” (T1.3 bez M30, T2.2 ruch przed M03, T9.1 pusty starter) — oczekiwane.

### 3.2 Profil T1.3 na programach lekcji (zał. A.1)

31 programów lekcji przez `profil()` (dziś tylko karty):
- **T1.3 (rozwiązanie)** — brak `T0101` w linii 3. Lekcja jest przed T2.1, więc to świadome, ale profil kursu tego nie przewiduje — decyzja 2.
- **T4.1 demo × 2** — G96 bez G50, brak M05 (M3).
- **Zakończenie programu w trzech wariantach:** `G00 X100. Z100.` (T1.1, T2.1, T2.2), `G28 U0. / G28 W0.` (T1.3, T2.3–T9.1, buildup), sam M05 + M30 (T1.2). Profil T1.3 i karty mówią G28 — P2.
- **Linie > 42 znaki: 48** (limit telefonu z U). Głównie komentarze w starterach (do 91 znaków w T8.1), `T0303 (NOZ DO ROWKOW 3MM, POMIAR NA LEWYM NAROZU)` (49, T6.1 i buildup), 5 linii „Program detalu” (do 54), komentarze w T7.2 (49) — P2.
- Fragmenty (bloki `code` z G71/G72/G75/G76 bez kontekstu) — ostrzeżenia walidatora oczekiwane; T8.1 „program” z M98 nad podprogramem rozpoznany jako frezarski — wymaga oznaczenia jako fragment.

### 3.3 Sprawdzanie zadań — kontrprzykłady (zał. A.2)

18 rozwiązań wzorcowych zaliczonych. Na 15 kontrprzykładów **11 zaliczonych** w 8 zadaniach — 10 to P1 (jak R1–R6 w #80), T5.1 to P2:

| Zadanie | Kontrprzykład | Wynik | Czego brakuje |
|---|---|---|---|
| T1.3 | blok startowy i G54 dopisane po obróbce, przed odjazdem | **zaliczone** | `require` bez `before: "move"` (mechanizm z M już jest) |
| T1.3 | odjazd `G28 W0.` przed `G28 U0.` | **zaliczone** | wstęp obiecuje „kolejność odjazdu”, kontrola jej nie sprawdza |
| T2.1 | `T0202` bez odjazdu do punktu referencyjnego | **zaliczone** | kontrola „T po odjeździe w X i Z” |
| T2.1 | `G97 S250` zamiast `G96 S250` | **zaliczone** | G96 jest już w starterze; potrzebny `state` trybu obrotów przy ruchach T0202 |
| T2.2 | `G50 S3000` po `G96 S200 M03` | **zaliczone** | kolejność G50 przed G96 (pułapka `danger`) |
| T4.1 | `G42` dopiero po konturze, przed `G40` | **zaliczone** | korekcja aktywna na ruchach konturu |
| T5.1 | `G70` nożem zgrubnym, przed zmianą na T0202 | **zaliczone** (P2) | `state` z narzędziem przy G70 |
| T6.2 | wiercenie przy `G96 S200` | **zaliczone** | tryb G97 przy G74 |
| T7.1 | gwint przy `G96` | **zaliczone** | tryb G97 przy G76 |
| T9.1 | `G50` po `G96` | **zaliczone** | jak T2.2 |
| T9.1 | `G42` dopisane dopiero po G70 | **zaliczone** | jak T4.1 |
| T2.2 | G97 zamiast G96 | odrzucone | — |
| T3.1 | wyjście z materiału `G00 X42.` | odrzucone | — |
| T4.1 | G41 zamiast G42 | odrzucone | — |
| T7.2 | przejście ze startu Z3 | odrzucone | — |

Wniosek: `cut` dobrze pilnuje toru, `require` bez miejsca i stanu nie pilnuje tego, czego uczą T1.3, T2.x, T4.1, T6.2, T7.1. `taskCheck.ts` ma już `state` (narzędzie, S, kierunek) i `require … before: "move"` — brakuje: trybu obrotów (G96/G97) w `state`, aktywnej korekcji G41/G42 w `state`, kolejności dwóch kodów i odjazdu X przed Z/T.

### 3.4 Testy

- **139 ze 152 pytań wyboru w T0–T9 ma poprawną odpowiedź na pozycji A** (91%). `Quiz.tsx` nie losuje kolejności opcji. W frezowaniu 138 z 230 (60%). Test da się zaliczyć bez czytania — **P1**, decyzja 1.
- Testy powtórkowe (`review`) — 20 pytań, poza M2 zgodne z lekcjami źródłowymi.

## 4. Język i nazewnictwo

### 4.1 Miary (`audit:jezyk`, ten sam algorytm per lekcja)

| | słowa | zdania > 25 | pauzy / 1000 | ozdobniki / 1000 |
|---|---|---|---|---|
| Toczenie (TP + T) | 12 791 | 1 | **21,8** | 0,7 |
| Frezowanie | 17 457 | 1 | 19,5 | 1,4 |
| Kody G i M (po X3) | 13 844 | 18 | 1,9 | 0,4 |

Najwięcej pauz: T2.2 36,0 · T3.2 34,5 · T5.2 32,6 · T6.2 30,2 · T1.1 29,1 · T5.1 27,9. Z 251 pauz w T0–T9 **120 to definicje** (`G17 — XY`, „Ø20 — czop”, do 4 słów przed pauzą) — zostają. **131 to wtrącenia w zdaniach** (np. „Program opisuje tylko górną połowę konturu — resztę tworzy obrót detalu”) — do przepisania jak w X2b (≈ 10 na 1000 słów po redakcji).

`audit:jezyk` nie liczy: testów, wstępów zadań, tytułów pułapek, tabel „Fanuc i Sinumerik”, podpisów rysunków (JSX). To ok. 30% tekstu lekcji — P3, rozszerzyć skrypt.

### 4.2 Nazewnictwo z X i §3a

| Wzorzec | T0–T9 | Uwagi |
|---|---|---|
| „kompensacja promienia” | 0 | wdrożone („korekcja promienia ostrza”) |
| „sterownik”, „większość sterowań”, Heidenhain | 0 | — |
| „korektor” (override) | 5 | M14 |
| „gwintowanie” dla G76/G92/G32 | 15 | karta G76 po X: „Cykl toczenia gwintu”; tytuł T7.1 „G76 — cykl gwintowania”, moduł T7 „Gwintowanie”, tabele w T1.2 i T7.1 — decyzja 6 |
| superlatyw bez źródła („najczęstszy”) | 2 | T2.1 (M13), T5.3 wynik przykładu |
| „baza” | 1 | T0.1 „Wymiar od złej bazy” → „od innego punktu odniesienia” / „wymiarowanie od innej powierzchni” |
| kolory w podpisach symulacji | 4 | T4.1 × 2 („Pomarańczowy pas”, „zielony tor”), T5.2 × 2 („Zielone — przejścia”, „pomarańczowy pas naddatku”) — zasada Y1 |
| żargon | 1 | buildup „pipki” (lekcja T2.3 mówi „czop”) |
| „zawsze / nigdy / musi” | 18 / 2 / — | większość to zasady kursu („w kursie zawsze…”) albo definicje; do przejrzenia przy redakcji: buildup „Gwint zawsze przy stałych obrotach”, T2.2 „ostrze pracowało zawsze z tą samą prędkością” (przed limitem G50), T0.2 „R jest zawsze promieniem” |

## 5. Rysunki

55 rysunków (`figs-t0…t9.tsx`), 51 z legendą, 1 z legendą wg znaczenia (`t71ps`, wpis `[rodzaj, opis]` z Y1).

| # | Ustalenie | Rysunki | P |
|---|---|---|---|
| R1 | **Etykiety na telefonie.** 390 px: mediana 8,8 px, 420 z 527 etykiet < 11 px (80%), 230 < 9 px. 360 px: 97% < 11 px, mediana 8,1. Rysunek zajmuje 335 px z 390 (ramka `.fig` z wcięciem 12 px w kolumnie lekcji). Reguła pełnej szerokości z Y1 obejmuje tylko `.code-card .fig`. Na kartach po Y1 mediana 11,4 px. | wszystkie | P2 |
| R2 | **Pomarańczowe wypełnienie = narzędzie / płytka / głowica**, legenda „parametr”. | t01ax, t02dr, t03zr, t03ft, t21tu, t21of, t21ch, t41np, t41sd, t42td, t61gr, t71jb (12) | P2 |
| R3 | **Czerwony = limit obrotów G50**, legenda „błąd / kolizja”. | t22cs, t22fr | P2 |
| R4 | **Punkt zerowy W/M kropką w kolorze G00** (bursztyn), bez wpisu w legendzie. | t01ax, t01pt, t01cp, t03zr, t03ft, t12uw, t21of, t41np, t41ce, t61gr, t91pt (11) | P2 |
| R5 | Podpisy > 250 znaków (limit Y1). | t01mc 421, t13ex 361, t51gp 357, t42ns 325, t41rn 296, t72dp 295, t61pk 288, t71jb 285, t42td 277, t33vw 266, t33ar 262, t52ly 256 (12) | P3 |
| R6 | Tytuł z kodem, który powtarza chip `fig-code` (zasada Y1: tytuły bez kodu). | t22fr, t33vw, t51gp, t52gp, t53pm, t61pk, t62dr, t62pk, t71ps, t81ct (10) | P3 |

Uwaga do R2–R4: przy poprawce wystarczy wpis `[rodzaj, opis]` (np. `["acc", "płytka i oprawka"]`, `["bad", "limit G50"]`) albo klasa `tool`/`stock` z istniejącej legendy — bez zmiany geometrii.

## 6. Telefon 390/360 px i axe

Pomiary dla każdej lekcji: zał. B.

| # | Ustalenie | P |
|---|---|---|
| F1 | **Długość:** 390 px — 310 ekranów na 23 lekcje (mediana 13,6, najdłuższa T4.1 17,8); 360 px — 339 (mediana 14,9, T4.1 19,3). Teoria 2,2–5,8 ekranu (T4.1 z dwoma demo). | P2 |
| F2 | **„Program detalu”** rośnie z lekcją: 1,1 ekranu (T0.1) → 3,1 (T5.x) → 4,3 (T7.1–T9.1). Pod koniec ścieżki to ok. 30% długości lekcji. | P2, decyzja 7 |
| F3 | **Tabela narzędzi warsztatu** (5 kolumn) — 393 px w kontenerze 337 px (390) i 307 px (360); przewijanie w poziomie w 19 lekcjach z zadaniem. To komponent symulatora — zmiana świadoma, z testem. | P2 |
| F4 | **Bloki kodu:** `pre.syntax` przewija się w poziomie w 9 lekcjach (390) i 12 (360) — linie 44–78 znaków (§3.2). Najdłuższe: wzór stożka w T0.2 (78), starter T8.1 (91). | P2 |
| F5 | **Uchwyt spisu treści** nachodzi na tekst przy prawej krawędzi (zrzut T2.2, T4.1). W kartach Z a chowa go przy przewijaniu — lekcje mają osobny komponent. | P2 |
| F6 | **axe (390 px):** `aria-input-field-name` (edytor CodeMirror bez etykiety) — 19 lekcji; `scrollable-region-focusable` (`.cm-scroller`) — 18; `color-contrast` (aktywna linia symulacji `.cm-sim-active`) — T1.2, T3.2, T7.1, 18 węzłów; `listitem` (`.bug-code > li` poza listą) — T2.2, T5.1. Lekcje bez warsztatu (T0.x, T4.2, T5.3): 0. | P2 (etykieta edytora już w „do rozważenia” po Z) |
| F7 | Symulacje: kanwa 380 px w zadaniu, 230 px w demo — mieści się; `Demo` w lekcji ma pełną listę bloków (§7 pkt 3 audytu kart, komponent wspólny). | P3 |
| F8 | Brak poziomego przewijania strony (0 / 46 pomiarów). | — |

## 7. Typografia

- Lekcje T0–T9 na 390 px: **27 różnych rozmiarów tekstu**, mediana **23 na stronę** (karty po Z a: 7). Najczęstsze: 12, 13, 16, 14, 12,5, 13,5, 16,5, 14,5, 15, 21,6, 15,5 px oraz wartości ułamkowe ze skalowania (12,76; 14,52; 17,28…).
- Tokeny `--fs-text 1rem / --fs-aux .875rem / --fs-code .8125rem / --fs-label .75rem / --fs-h2 1.3125rem / --fs-h3 1.0625rem` są w `tokens.css`, ale reguły Z a są pod `.code-card`. Lekcja ma akapit 16,5 px (`.ls .article p`, desktop 17 px), H2 `.ls-h` 21,6 px, nagłówek rysunku 14,5 px, kod 12,5–13,5 px.
- **Zalecenie:** przenieść skalę 5 ról na lekcję (`.ls`): treść i pułapki `--fs-text`, podpisy/legendy/notki/źródła `--fs-aux`, kod i program detalu `--fs-code`, etykiety (chipy, „Cel lekcji”, numery kroków) `--fs-label`, nagłówki `--fs-h2/h3`. Akapit 16,5 → 16 px. Wyjątek: interfejs symulatora (edytor, przyciski, tabela narzędzi) — wspólny z `/symulator`, osobna zmiana. Decyzja 5.

## 8. Plan paczek

Jedna paczka = gałąź `sprint-27/paczka-tX` + draft PR. Kolejność jak w T–Z: najpierw merytoryka i zaliczanie, potem forma.

| Paczka | Zakres | Ustalenia | Zależy od |
|---|---|---|---|
| **TA** | Merytoryka P1/P2 w lekcjach i 4 kartach: T1.3 G21, T6.1 FALX, demo T4.1 z G50 i M05, T0.3 nóż wzorcowy, T5.1/T9.1 „start cyklu poniżej pręta”, T5.1 liczba bloków, T1.2 tytuł i dwa zdania, T0.1 Sinumerik, T4.1 rε, T2.1 superlatyw, „korektor”, źródło z podpisu T5.3; karty G71 (CYCLE95), G50 (X0.0 → X−2rε, zapis z kropką), G96 (G97 przed odjazdem — wg decyzji 3), G76 nazwa „wybieg”; P3 z §2.3 | M1–M6, M9–M11, M13–M15, §2.3, §2.4 | decyzje 3, 9 |
| **TB** | Zaliczanie: `taskCheck.ts` — tryb obrotów i korekcja w `state`, kolejność dwóch kodów, odjazd przed T; kontrole w T1.3, T2.1, T2.2, T4.1, T5.1, T6.2, T7.1, T9.1; testy R7–R16 z kontrprzykładów zał. A.2; losowa kolejność odpowiedzi w `Quiz.tsx` (obie ścieżki) z testem | §3.3, §3.4 | decyzje 1, 4 |
| **TC** | Programy wg profilu: zakończenie G28 w T1.1, T2.1, T2.2, T1.2; T0101 w T0–T1 wg decyzji 2; linie ≤ 42 znaki (48); sekcja „profil lekcji” w `audit:programy` (raport, potem bramka) | §3.2 | decyzja 2 |
| **TD** | Redakcja języka bez zmiany merytoryki: 131 wtrąceń → cel ≤ 10 pauz na 1000 słów, kolory z podpisów symulacji, „gwintowanie” → „toczenie gwintu” (wg decyzji 6), „baza”, „pipka”, „zawsze” z listy; `audit:jezyk` liczy też testy, zadania, tabele i podpisy rysunków | §4 | decyzja 6; po TA |
| **TE** | Rysunki lekcji: pełna szerokość na telefonie (reguła Y1 także dla `.ls .fig`), legendy wg znaczenia (R2–R4, ok. 25 rysunków), podpisy ≤ 250 znaków, tytuły bez kodu | §5 | — |
| **TF** | Telefon i typografia lekcji: skala 5 ról w `.ls`, uchwyt spisu treści, „Program detalu” zwinięty, `.bug-code` jako lista, kontrast aktywnej linii, etykieta edytora i fokus `.cm-scroller` (komponent symulatora — z testem), tabela narzędzi na telefonie | §6, §7 | decyzje 5, 7, 8 |
| **TG** | Źródła: lokalizacje Sinumerik (21) i Sandvik (10) w T0–T9, wyciąg Fanuc B-64604EN dla M7, M8, M12, `,C/,R`, G96→G97 | §2.5 | dokumenty (decyzja 10) |

TA i TB można robić równolegle (różne pliki poza T1.3/T2.2 — przy kolizji TB po TA). TE niezależna. TD po TA (te same zdania).

## 9. Decyzje do podjęcia

1. **Test:** losować kolejność odpowiedzi w `Quiz.tsx` (zmiana wspólna dla frezowania i toczenia, 1 komponent) czy ręcznie przestawić odpowiedzi w treści? Proponuję losowanie z ustalonym ziarnem na pytanie (ta sama kolejność po odświeżeniu).
2. **T0101 przed lekcją T2.1:** w T0.x–T1.x programy nie mają T. Wyjątek w profilu („przed T2.1 bez T”) czy dopisać `T0101` z komentarzem?
3. **G97 przed odjazdem:** dopisać w programach lekcji (od T2.2) czy w karcie G96 zmienić „typowy błąd” na wskazówkę?
4. **Zaliczanie:** zgoda na rozszerzenie `taskCheck.ts` (tryb obrotów, korekcja, kolejność) — kod wspólny z frezowaniem, z testami?
5. **Typografia:** skala Z a w lekcjach, akapit 16,5 → 16 px. Interfejs symulatora poza zakresem?
6. **Nazwy:** „toczenie gwintu” dla G32/G76/G92 w lekcjach; tytuł T7.1 „G76 — cykl toczenia gwintu”, moduł T7 „Toczenie gwintów” (slugi bez zmian)?
7. **„Program detalu” na telefonie:** pokazywać tylko linie nowe i zmienione w lekcji + „Pokaż cały program”?
8. **Baner lekcji ze zdjęciem:** zostaje czy bez zdjęcia jak karty (decyzja 8 z części 2)? Na zrzucie T2.2 napis modułu leży na jasnym fragmencie zdjęcia.
9. **T1.2:** nowy tytuł np. „Wymiary absolutne i przyrostowe: X Z oraz U W” (slug `t1-2-g90-g91-u-w` zostaje)?
10. **Dokumenty:** czy masz Fanuc Operator's Manual B-64604EN (lathe) i SINUMERIK Fundamentals z numerami stron? Bez nich M7, M8, M10, M12 zostają z dopiskiem „zależy od sterowania / do weryfikacji”.

## Załącznik A — skrypty i wyniki

Skrypty w `scripts/audyt-toczenie/` (`npx tsx scripts/audyt-toczenie/<plik>.ts`): `profil.ts` — profil kursu i walidator na programach lekcji, `checks.ts` — rozwiązania wzorcowe i kontrprzykłady zaliczeń. Pomiary telefonu (Playwright + axe) i miary języka per lekcja robione jednorazowo, poza repo.

**A.1 Profil kursu na programach lekcji** (31 programów, 16 z uwagami; fragmenty z ostrzeżeniami walidatora pominięte):

```
T1.3 zadanie (program): linia 3: „G97 S1000 M03” zamiast T0101
T4.1 demo bez korekcji:  G96 bez wcześniejszego G50 S_ · brak M05 przed M30
T4.1 demo z korekcją:    G96 bez wcześniejszego G50 S_ · brak M05 przed M30
T6.1 zadanie:            L4: 49 znaków (limit 42)
T8.1 zadanie:            L4: 49 znaków (limit 42)
T8.1 teoria (M98 + O3000): rozpoznany jako frezarski — oznaczyć jako fragment
```

Zakończenia programów: `G00 X100. Z100. | M09 | M05 | M30` (T1.1, T2.1, T2.2), `M05 | M30` (T1.2), `M05 | G28 U0. | G28 W0. | M30` (T1.3 i od T2.3).

**A.2 Kontrprzykłady zaliczeń** — tabela w §3.3. Wszystkie 18 rozwiązań wzorcowych zaliczone.

## Załącznik B — telefon, per lekcja (390 px)

| Lekcja | ekrany | rysunki | etykieta min / mediana [px] | `pre` za szerokie (znaki) | axe |
|---|---|---|---|---|---|
| T0.1 | 11,0 | 4 | 8,8 / 9,3 | — | 0 |
| T0.2 | 11,6 | 5 | 8,8 / 9,8 | 78 | 0 |
| T0.3 | 11,5 | 4 | 8,8 / 10,2 | — | 0 |
| T1.1 | 11,9 | 3 | 8,8 / 10,2 | 48 | 1 |
| T1.2 | 11,8 | 3 | 8,8 / 8,8 | 51 | 3 |
| T1.3 | 12,1 | 3 | 8,8 / 8,8 | 47 | 2 |
| T2.1 | 12,9 | 4 | 8,8 / 9,8 | — | 2 |
| T2.2 | 12,6 | 3 | 8,8 / 8,8 | — | 2 |
| T2.3 | 12,8 | 4 | 8,8 / 9,3 | 46 | 2 |
| T3.1 | 12,5 | 3 | 8,8 / 8,8 | — | 2 |
| T3.2 | 14,9 | 3 | 8,8 / 8,8 | 45 | 3 |
| T3.3 | 13,7 | 3 | 8,8 / 10,2 | — | 2 |
| T4.1 | 17,8 | 5 | 8,8 / 9,8 | — | 2 |
| T4.2 | 12,2 | 3 | 8,8 / 10,2 | — | 0 |
| T5.1 | 14,3 | 3 | 8,8 / 9,8 | — | 3 |
| T5.2 | 14,3 | 3 | 8,8 / 8,8 | — | 2 |
| T5.3 | 13,6 | 3 | 8,8 / 8,8 | — | 0 |
| T6.1 | 14,0 | 3 | 8,8 / 9,8 | — | 2 |
| T6.2 | 13,7 | 3 | 8,8 / 8,8 | 44 | 2 |
| T7.1 | 16,3 | 4 | 8,8 / 8,8 | 40* | 3 |
| T7.2 | 14,1 | 3 | 8,8 / 8,8 | 49 | 2 |
| T8.1 | 14,7 | 3 | 8,8 / 8,8 | — | 2 |
| T9.1 | 16,1 | 4 | 8,8 / 10,5 | — | 2 |

\* przy 390 px przewija się już linia 40 znaków, przy 360 px — 37 znaków (T0.2, T2.2, T4.2). Blok kodu lekcji jest węższy niż blok karty na pełnej szerokości, dla którego paczka U ustaliła limit 42 znaków.
