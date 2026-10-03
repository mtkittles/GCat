# Karty kodów G/M — standard opracowania i lista kontrolna

Dokument roboczy dla dalszej pracy nad kartami w `/kody`. Opisuje, **jak** opracowywać
i sprawdzać karty. Samo istnienie tej listy **nie oznacza**, że baza kart została
zaudytowana — status poszczególnych kart jest w tabeli na końcu.

## Ograniczenia obowiązujące przy pracy nad kartami

1. **Symulator jest chroniony.** Nie zmieniamy przy pracy nad treścią: `/symulator`, parsera
   (`src/lib/parser/`), silnika i renderowania (`src/components/simulator/`), osadzonych
   symulacji (bloki `sim` / `demo` w artykułach, lekcjach i na stronie głównej) ani programów
   demonstracyjnych. Rozbieżność w chronionym przykładzie **zapisujemy** w sekcji
   „Tematy do osobnego zlecenia”, a nie poprawiamy przy okazji.
2. **Odnośniki są chronione.** Znaczniki `[[G17]]`, `[[hasło|etykieta]]`, slugi kart, kotwice
   i odnośniki do materiałów planowanych zostają w dotychczasowej postaci — także te, które
   dziś prowadzą donikąd. Poprawiamy tylko tekst wokół nich.
3. Bez masowych zamian tekstu. Każda karta osobno, z kontrolą kontekstu.

## 1. Struktura karty

Sekcje — tylko te, które mają zastosowanie (bez pustych sekcji, prosty kod zostaje prosty):

1. Co robi kod — krótka definicja.
2. Zakres: maszyna (frezarka / tokarka), sterowanie, tryb / system kodów.
3. Składnia i znaczenie parametrów **z jednostkami**.
4. Warunki początkowe i wymagane aktywne ustawienia (płaszczyzna, jednostki, tryb posuwu…).
5. Działanie krok po kroku.
6. Minimalny przykład z opisem oczekiwanego wyniku.
7. Typowe błędy i ograniczenia.
8. Różnice między sterowaniami.
9. Zweryfikowane źródła (dokument, wersja, rozdział/strona, link — tylko faktycznie sprawdzone).

## 2. Kontekst zamiast uogólnień — pytania do każdego kodu

- Czy jest modalny? Co go odwołuje lub zastępuje?
- Od jakich aktywnych trybów zależy (płaszczyzna, G90/G91, G94/G95, G20/G21, korekcje)?
- Czy parametry są absolutne czy przyrostowe? W jakich jednostkach?
- Czy znaczenie zmienia się między frezarką a tokarką?
- Czy zachowanie zależy od systemu kodów (Fanuc A/B/C), parametrów lub opcji sterowania?

Unikamy słów „zawsze”, „wyłącznie”, „na każdym sterowaniu”, jeżeli dokumentacja nie
uzasadnia tak szerokiego stwierdzenia. Przykład: na tokarce Haas G90 to cykl toczenia,
G92 — cykl gwintowania, G98 — posuw na minutę, G99 — posuw na obrót; tych znaczeń nie
przenosimy automatycznie na wszystkie tokarki.

## 3. Zgodność treści, przykładu i geometrii

Opis słowny sprawdzamy z: składnią, współrzędnymi, komentarzami w programie, rysunkiem,
wynikiem kalkulatora i pozostałymi sekcjami tej samej karty.

- Geometria: punkt startu i końca, kierunek, promień, środek, znaki.
- Cykle: kolejność ruchów, płaszczyzny powrotu, interpretacja parametrów i ich jednostek.
- Nie dopasowujemy teorii do błędnej wizualizacji — rozbieżność z chronioną symulacją zapisujemy.

## 4. Przykład edukacyjny a kompletny program

Rozróżniamy wprost:
- **fragment** ilustrujący jeden kod — z założeniami (płaszczyzna, jednostki, pozycja
  początkowa, tryb posuwu),
- **program do ćwiczenia w GCat** (symulator),
- **przykład wymagający dostosowania** do konkretnej maszyny.

Fragmentu nie przedstawiamy jako programu produkcyjnego. Nie dopisujemy uniwersalnego
„bezpiecznego nagłówka” bez określenia maszyny i sterowania.

## 5. Źródła i status

- Treść weryfikujemy w dokumentacji producentów. Podajemy dokument, wersję, rozdział
  lub stronę i link — tylko jeśli zostały faktycznie sprawdzone.
- Niczego nie wymyślamy. Czego nie da się potwierdzić — wpis „do weryfikacji” w tabeli niżej.
- Gwiazdka ★ w spisie kodów oznacza **pełny układ karty** (schematy, symulacje, sekcje),
  a nie weryfikację źródłową.

## 6. Priorytety kontroli kolejnych kodów

To lista tematów do sprawdzenia, nie stwierdzenie istniejących błędów.

- [ ] **G00/G01** — rzeczywisty charakter toru szybkiego (nie musi być prostą), posuw, zależność od trybów.
- [ ] **G02/G03** — płaszczyzny, kierunki, I/J/K, znak R, pełne okręgi, helisy.
- [ ] **G17–G19** — orientacja płaszczyzn, wpływ na łuki i cykle.
- [ ] **G90/G91** — frezarka vs tokarka, systemy kodów.
- [ ] **G94/G95/G98/G99** — jednostki posuwu, inne znaczenie w cyklach i na tokarkach.
- [ ] **G40–G42** — strona względem kierunku ruchu, wejście, wyjście, ograniczenia.
- [ ] **G43/G49** — korekcja długości, założenia dotyczące korektorów.
- [ ] **G54–G59, G52/G53, G28** — układy współrzędnych, modalność, punkt pośredni.
- [ ] **G96/G97** — prędkość skrawania, obroty, ograniczanie obrotów zależne od sterowania.
- [ ] **Cykle wiercenia i gwintowania** — płaszczyzny powrotu, jednostki parametrów, synchronizacja.
- [ ] **Cykle tokarskie** — warianty składni, zależność od systemu.
- [ ] **Kody M** — funkcje zależne od producenta maszyny i konfiguracji.

## 7. Status kart (prowadzić na bieżąco)

| Karta | Co sprawdzono | Wynik | Źródła |
|---|---|---|---|
| G02/G03 (`/kody/g03`, `/kody/g02`) | znak R i łuk > 180°, pełny okrąg a R, kalkulator R ↔ I/J (środek, kąt, długość, strzałka), reguła kierunku na tokarce | poprawione 2026-10: opis znaku R, strzałka dużego łuku w kalkulatorze, usunięta reguła „wklęsłe = G02” | do weryfikacji (rozdział o interpolacji kołowej w podręczniku programowania Fanuc i Sinumerik — nie sprawdzono strony) |
| G84 | jednostki F (G94/G95), G98/G99 na frezarce, 4 głębokości, otwór D − P, Sinumerik CYCLE84/840 | poprawione 2026-10 — szczegóły `docs/audyt-tresci-2026-10.md` | Haas AP-602 (04/2016) dla F; Sinumerik — do weryfikacji |
| G28, G27/G29/G30 | punkt pośredni G90/G91, tryb ISO Sinumerika, SUPA | poprawione 2026-10 | Siemens ISO Milling 02/2012, rozdz. 2.2.1 (spis treści) |
| G40–G42 | skutek złej strony korekcji | poprawione 2026-10 | obliczenie własne |
| G92, G94/G95 | znaczenie na tokarce wg systemu kodów | poprawione 2026-10, oznaczenie „zależy od” | do weryfikacji (Fanuc, systemy A/B/C) |
| G90/G92/G94 na tokarce (`g90-g94-t`), G94/G95, G92, G50, G98/G99 | odpowiedniki cykli i par posuwu w systemach kodów A/B/C | uzupełnione 2026-10: B = G77/G78/G79 i G94/G95, C = G20/G21/G24 i G94/G95 (jednostki w C: G70/G71) | zestawienia G‑kodów tokarek Fanuc (Helman CNC, Reaco CNC — tabele systemów A/B/C); do potwierdzenia w instrukcji operatora konkretnej serii 0i/30i |
| G28, G27/G29/G30 — Sinumerik | składnia G74/G75 w języku natywnym | uzupełnione 2026-10: `G74 X=0 Z=0` (wartości osi ignorowane, ale wymagane), `G75 FP=n X=0 Z=0` | Siemens, *SINUMERIK ONE — NC programming, Programming Manual* 03/2025, rozdziały „Reference point approach (G74)” i „Fixed point approach (G75)”; to samo w instrukcjach 808D/828D/840D sl |
| G84 — CYCLE84 / CYCLE840 | zestaw parametrów obu cykli | potwierdzone 2026-10: CYCLE84(RTP, RFP, SDIS, DP, DPR, DTB, SDAC, MPIT, PIT, POSS, SST, SST1, …), CYCLE840(RTP, RFP, SDIS, DP, DPR, DTB, SDR, SDAC, ENC, MPIT, PIT, …); skok podaje PIT (wartość) albo MPIT (rozmiar gwintu), posuwu F nie programuje się | Siemens, *SINUMERIK 840D sl/840D/840Di sl/840Di/810D — Cycles, Programming Manual* 04/2006, rozdz. „Rigid tapping — CYCLE84”, „Tapping with compensating chuck — CYCLE840”; zestaw parametrów zależy od wersji oprogramowania |
| karty bez artykułu (24) | pełne czytanie: definicja, zakres, parametry z jednostkami, zależności od sterowania, przykład | przejrzane 2026-10 — bez błędów merytorycznych wymagających zmiany; poprawiono składnię Sinumerika przy G28/G27–G30 i dopisano systemy kodów | wiedza ogólna + zestawienia jak wyżej; źródła producentów dla parametrów cykli nadal do dopisania przy każdej karcie |
| karty z artykułem (27) | przegląd uogólnień („zawsze”, „wyłącznie”, „na każdym sterowaniu”) | 2026-10: pozostałe wystąpienia dotyczą geometrii interpolacji (tor G01 jest prostą) albo zaleceń — bez zmian | — |
| pozostałe | — | nie audytowano źródłowo | — |

Kontrolne przypadki kalkulatora łuku (start X20 Y20, koniec X50 Y50, R30, G03):
krótki łuk — środek (20, 50), I0 J30, 90°, 47,12 mm, strzałka 8,79 mm;
długi łuk — środek (50, 20), I30 J0, 270°, 141,37 mm, strzałka 51,21 mm.

## 7a. Standard lekcji

Lekcja rozwija umiejętność, karta kodu jest referencją — dane techniczne zgodne, bez kopiowania opisów. Kolejność: cel („po lekcji potrafisz…”) → wymagania wstępne → wyjaśnienie z rysunkiem → przykład rozwiązany → ćwiczenie częściowo uzupełnione → zadanie samodzielne → analiza typowego błędu → test (wyjaśnienie poprawnej odpowiedzi i błędu rozumowania) → podsumowanie i odnośniki. Każdy niezależny przykład podaje kontekst: jednostki, płaszczyznę, tryb współrzędnych, jednostkę posuwu, punkt początkowy i aktywne korekcje.

Raport z audytu treści: `docs/audyt-tresci-2026-10.md`.

## 7b. Audyt 2026-10 — zakres i metoda

- 201 programów z treści (karty, lekcje, zadania, galeria, artykuły, strona główna) przechodzi parser i walidator bez błędów (`npm run audit:programy`); rozwiązania wzorcowe zadań i lekcji przechodzą własne sprawdzenie.
- Przykłady na kartach uzupełnione o komplet S/M03, G43 po wymianie narzędzia, G97 na tokarce; przykłady tokarskie na kartach frez + tok mają `exampleMode: "lathe"`.
- Program pokazowy na stronie głównej poprawiony (kieszeń współśrodkowa, rowki poza kieszenią) — temat z §8 zamknięty.
- Komunikat walidatora o G28 na Sinumeriku zgodny z kartą (tryb ISO / G74, G75) — temat z audytu §4 zamknięty.
- Weryfikacja źródeł online: dostęp do dokumentów producentów bywa ograniczony; w tabeli podano tytuł, wydanie i rozdział, a gdzie źródłem jest zestawienie niezależne — zaznaczono to wprost.

## 8. Tematy do osobnego zlecenia (chronione elementy — nie zmieniono)

- ~~Pokazowy program na stronie głównej~~ — poprawiony 2026-10 (sprint 0): dwa współśrodkowe przejścia wokół (40, 25).
