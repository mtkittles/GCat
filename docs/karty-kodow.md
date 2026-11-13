# Karty kodów G/M — standard opracowania i lista kontrolna

Dokument roboczy dla dalszej pracy nad kartami w `/kody`. Opisuje, **jak** opracowywać
i sprawdzać karty. Samo istnienie tej listy **nie oznacza**, że baza kart została
zaudytowana — status poszczególnych kart jest w tabeli na końcu.

## Ograniczenia obowiązujące przy pracy nad kartami

1. **Symulator zmieniamy świadomie** (decyzja z 9 listopada 2026 r., zastępuje zasadę
   „symulator jest chroniony”). Przy pracy nad treścią nie zmieniamy `/symulator`, parsera
   (`src/lib/parser/`) ani silnika i renderowania (`src/components/simulator/`) — to osobna
   paczka, z testem w `tests/` i przebiegiem `audit:programy`. Osadzone symulacje i programy
   w treści (bloki `sim` / `demo` w kartach, lekcjach i na stronie głównej) **wolno poprawiać**,
   jeśli spełnione są trzy warunki: program przechodzi parser i walidator bez błędów i
   ostrzeżeń (`npm run audit:programy`), tryb maszyny (`mode`) zgadza się z programem, a tor
   obejrzano w symulatorze i zgadza się on z opisem i podpisem. Zmianę symulacji wymieniamy
   w opisie PR.
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

Rysunki (paczka Y1): projekt na 360 jednostek szerokości, etykieta główna 11 px, podziałka 9,5 px. Na telefonie rysunek karty zajmuje pełną szerokość ekranu. Legenda opisuje znaczenie koloru na danym rysunku (`legend={[["bad", "obroty bez limitu"]]}`), a nie tylko rodzaj ruchu. Kod w notce (`<Code>`) z kropką i łącznikiem; minus typograficzny tylko w opisach. Tytuł rysunku nie powtarza kodu z plakietki. Podpis do 250 znaków; podpis symulacji opisuje tor, bez nazw przycisków i kolorów.

Tekst karty (paczka Z a, audyt cz. 2 §5): pięć ról ze zmiennych `--fs-*` w `globals.css` (tokeny w `src/design/tokens.ts`, `docs/tokeny.md`) — tekst 16 px / 1,65 (akapit, lista, ramka uwagi, lead — lead wyróżniony kolorem), pomocniczy 14 px (podpisy, tabele, źródła, linia profilu, okruszki), kod 13 px mono (bloki, notki w rysunkach; kod w zdaniu 14 px, w tabeli 13 px), etykieta 12 px wersalikami (nagłówki tabel, nadtytuły, znaczniki), nagłówki 21 i 17 px. Jeden wygląd H2 (pomarańczowa kreska) dla sekcji strony, artykułu i „Źródeł”. Tabele na telefonie: 2 kolumny jako tabela, 3 kolumny z krótkimi wartościami jako etykieta wiersza nad parą wartości, reszta jako karty (`src/lib/tableKind.ts`); podpis tabeli nad tabelą; komórka nagłówka nie może być pusta. Ramka uwagi to `<div role="note">`, nie `<aside>`.

Symulacje na karcie (paczka Z b, decyzja 7): `<Sim>`, `<Demo>` i przykład z frontmattera pokazują animację (lista bloków z podświetleniem, bez edytora) z przyciskiem „Otwórz w symulatorze”. Przycisk przenosi ten sam program, tryb maszyny, półfabrykat i dialekt do `/symulator?kod=…` (`src/lib/simLink.ts`). Podpis stoi pod animacją i opisuje tor, nie przyciski warsztatu. Lekcje mają pełny warsztat jak dotąd.

Na stronie (paczka W1, `src/app/kody/[slug]/page.tsx`):

- **Jedna „Składnia”.** Sekcja strony pokazuje zapis Fanuc/Sinumerik z pola `syntax` i tabelę adresów z `params`. Gdy artykuł ma własną tabelę „| Adres |”, strona jej nie powtarza. Sekcja artykułu ze zapisem nazywa się „Zapis bloku” (albo „Zapis w Fanucu”, „Kody i zapis”), nie „Składnia”; kotwica `#składnia` zostaje.
- **Pola frontmattera są widoczne zawsze.** Karta bez artykułu: Przykład → Sinumerik → Na co uważać. Karta z artykułem: pod artykułem sekcja „W skrócie” z `pitfalls`, `sinumerik` i przykładem z `example`; przykład pomijamy, gdy artykuł zawiera ten sam program. Te pola podlegają tym samym zasadom redakcyjnym (§3a) co artykuł.
- **Źródła** na telefonie są zwinięte (lista skrótów + „pokaż wydania…”), od 768 px rozwinięte.

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
- Nie dopasowujemy teorii do błędnej wizualizacji — błędną symulację poprawiamy na warunkach z pkt 1 ograniczeń albo zapisujemy rozbieżność w §8.

### 3a. Zasady redakcyjne (audyt cz. 2, §3.5; paczka X2)

Rejestr sekcji to rejestr kart krótkich i lekcji: krótkie zdania, warunek zamiast pewnika, liczba z jednostką.

1. Zdanie niesie fakt o sterowaniu, o programie albo o skutku na maszynie. Zdanie, które tylko ocenia ważność („To najważniejsza rzecz…”), wypada.
2. Bez superlatywów i „zawsze/nigdy/jedyny”, chyba że stoi przy nich źródło. Zamiast „najczęstszy błąd” — „częsty błąd” albo sam opis skutku.
3. Liczba ma jednostkę i pochodzi z przykładu na karcie albo ze źródła („odjazd o 50 mm z F400 trwa 7,5 s”, nie „kilkanaście sekund”).
4. Jeden termin na pojęcie (tabela w §3.3 audytu cz. 2: sterowanie, ruch szybki, zwój, wytaczak, vc/vf/fz, „·” we wzorach). Od paczki X: „sterowanie” (układ sterowania CNC; „sterownik” tylko dla PLC), „korekcja promienia” („kompensacja” tylko jako synonim w słowniku), „punkt referencyjny” i „zero maszyny” zamiast „bazy maszyny”, „przesunięcie zera / układ G54” zamiast „bazy G54”, „płaszczyzna R”, „toczenie gwintu” (tokarka) i „gwintowanie gwintownikiem” (G84). Bez „większość” i „dokładnie” bez źródła — „na wielu maszynach”, „zależy od sterowania”.
   Stałe nazwy sekcji: „Fanuc i Sinumerik” (porównanie sterowań), „Wskazówki” (porady), „Typowe błędy”; kotwice dawnych nazw zostają.
   Źródła: tylko w polu `sources` (nie notką „Źródło: …” w treści). W `sources.ts` `note` to jedno zdanie dla czytelnika, `internal` — notatka redakcji, której strona nie pokazuje. Brak rozdziału i strony nie jest pokazywany; listę braków daje `npm run audit:nauka`.
5. Bez frazeologii i wzmacniaczy („odwrotna strona medalu”, „zupełnie”, „po prostu”, „bardzo”, „warto”, „w praktyce” jako podpórka). Nagłówki rzeczowe („Zastosowanie”), nie zachęty („Dlaczego warto”).
6. Pogrubione hasło na początku punktu tylko w „Typowych błędach”, w postaci `**Hasło.** Zdanie.`; porady i zastosowania — zwykłym zdaniem.
7. Pauza „ — ” tylko dla wtrącenia. Resztę rozbij na dwa zdania albo użyj dwukropka. Cel: ≤ 10 pauz i ≤ 3 ozdobniki na 1000 słów (`npm run audit:jezyk -- --karty`).
8. Podpis mówi, co widać i na co patrzeć. Nie wprowadza nowej zasady i nie nazywa przycisków („W widoku 3D widać rowek”, nie „Włącz widok 3D”).
9. Linia kodu z komentarzem ma najwyżej 42 znaki (§4a).

## 4. Przykład edukacyjny a kompletny program

Rozróżniamy wprost:
- **fragment** ilustrujący jeden kod — z założeniami (płaszczyzna, jednostki, pozycja
  początkowa, tryb posuwu),
- **program do ćwiczenia w GCat** (symulator),
- **przykład wymagający dostosowania** do konkretnej maszyny.

Fragmentu nie przedstawiamy jako programu produkcyjnego. Nie dopisujemy uniwersalnego
„bezpiecznego nagłówka” bez określenia maszyny i sterowania.

### 4a. Profil zapisu programów w kartach (paczka U)

Program w karcie (przykład z frontmattera, `<Sim>`, `<Demo>`, blok ``` z wymianą narzędzia i M30)
ma ten sam profil co lekcje F1.5 i T1.3 — maszyna i sterowanie są określone w linii „Zapis
przykładów” nad kartą (Fanuc, frezarka pionowa albo tokarka w systemie A).

| | frezarka | tokarka |
|---|---|---|
| start | `G21 G90 G94 G17` / `G40 G49 G80` / `G54` | `G18 G21 G40 G80 G99` / `G54` |
| narzędzie | `T1 M06` → `G00 G43 H1 Z50.` → `S… M03` | `T0101` → `G50 S…` + `G96 S… M03` albo `G97 S… M03` |
| dojazd | `G00 X… Y…`, potem `G00 Z…` | `G00 X… Z…` |
| koniec | `M05` przed `M30` | `M05` przed `M30` |

Karta może zmienić kod swojej grupy w bloku startowym (G20, G91, G95, G18/G19, G55…).
Programy 5-osiowe (G43.4, G68.2) mają kolejność opisaną na swojej karcie.

Zapis w każdym bloku kodu Fanuc (też we fragmentach i składni):
- współrzędne X Y Z I J K R U W z kropką (`X20.`); na frezarce także Q cykli (`Q4.` — bez kropki
  to 0,004 mm); na tokarce P i Q cykli bez kropki (mikrometry albo numery bloków),
- komentarz w nawiasach `( )` — `;` tylko w sekcji Sinumerika,
- linia z komentarzem, komentarz i linia obliczeń najwyżej **42 znaki** (blok kodu na telefonie
  390 px); dłuższy komentarz idzie w osobnej linii nad kodem,
- łącznik `-` w kodzie, także w notkach `<Code>` rysunków; minus typograficzny `−` tylko w zdaniach,
  obliczeniach i wymiarach.

Fragment (bez M30) zaczyna się od komentarza z założeniami, np. `(fragment: sonda w wrzecionie, G54)`.
Przykład bez podglądu (`simulate: false`) dostaje podpis z `src/lib/simGaps.ts` — wynika z opisów
parsera: kody pominięte, kody odtwarzane w przybliżeniu albo brak ruchu. Jeśli symulator odtwarza
program w całości i bez ostrzeżeń, przykład ma mieć podgląd. Wszystko to sprawdza `npm run audit:programy`
(sekcja „profil kart”, `scripts/lib/profil-kursu.ts`) i test `tests/profil-kart.test.ts`.

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
| G02/G03 (`/kody/g02`; `/kody/g03` → przekierowanie 308 od W2) | znak R i łuk > 180°, pełny okrąg a R, kalkulator R ↔ I/J (środek, kąt, długość, strzałka), reguła kierunku na tokarce | poprawione 2026-10: opis znaku R, strzałka dużego łuku w kalkulatorze, usunięta reguła „wklęsłe = G02” | do weryfikacji (rozdział o interpolacji kołowej w podręczniku programowania Fanuc i Sinumerik — nie sprawdzono strony) |
| G84 | jednostki F (G94/G95), G98/G99 na frezarce, 4 głębokości, otwór D − P, Sinumerik CYCLE84/840 | poprawione 2026-10 — szczegóły `docs/audyt-tresci-2026-10.md` | Haas AP-602 (04/2016) dla F; Sinumerik — do weryfikacji |
| G28, G27/G29/G30 | punkt pośredni G90/G91, tryb ISO Sinumerika, SUPA | poprawione 2026-10 | Siemens ISO Milling 02/2012, rozdz. 2.2.1 (spis treści) |
| G40–G42 | skutek złej strony korekcji | poprawione 2026-10 | obliczenie własne |
| G92, G94/G95 | znaczenie na tokarce wg systemu kodów | poprawione 2026-10, oznaczenie „zależy od” | do weryfikacji (Fanuc, systemy A/B/C) |
| G90/G92/G94 na tokarce (`g90-g94-t`), G94/G95, G92, G50, G98/G99 | odpowiedniki cykli i par posuwu w systemach kodów A/B/C | uzupełnione 2026-10: B = G77/G78/G79 i G94/G95, C = G20/G21/G24 i G94/G95 (jednostki w C: G70/G71) | zestawienia G‑kodów tokarek Fanuc (Helman CNC, Reaco CNC — tabele systemów A/B/C); do potwierdzenia w instrukcji operatora konkretnej serii 0i/30i |
| G28, G27/G29/G30 — Sinumerik | składnia G74/G75 w języku natywnym | uzupełnione 2026-10: `G74 X=0 Z=0` (wartości osi ignorowane, ale wymagane), `G75 FP=n X=0 Z=0` | Siemens, *SINUMERIK ONE — NC programming, Programming Manual* 03/2025, rozdziały „Reference point approach (G74)” i „Fixed point approach (G75)”; to samo w instrukcjach 808D/828D/840D sl |
| G84 — CYCLE84 / CYCLE840 | zestaw parametrów obu cykli | potwierdzone 2026-10: CYCLE84(RTP, RFP, SDIS, DP, DPR, DTB, SDAC, MPIT, PIT, POSS, SST, SST1, …), CYCLE840(RTP, RFP, SDIS, DP, DPR, DTB, SDR, SDAC, ENC, MPIT, PIT, …); skok podaje PIT (wartość) albo MPIT (rozmiar gwintu), posuwu F nie programuje się | Siemens, *SINUMERIK 840D sl/840D/840Di sl/840Di/810D — Cycles, Programming Manual* 04/2006, rozdz. „Rigid tapping — CYCLE84”, „Tapping with compensating chuck — CYCLE840”; zestaw parametrów zależy od wersji oprogramowania |
| karty bez artykułu (24) | pełne czytanie: definicja, zakres, parametry z jednostkami, zależności od sterowania, przykład | przejrzane 2026-10 — bez błędów merytorycznych wymagających zmiany; poprawiono składnię Sinumerika przy G28/G27–G30 i dopisano systemy kodów | wiedza ogólna + zestawienia jak wyżej; źródła producentów dla parametrów cykli nadal do dopisania przy każdej karcie |
| karty z artykułem (27) | przegląd uogólnień („zawsze”, „wyłącznie”, „na każdym sterowaniu”) | 2026-10: pozostałe wystąpienia dotyczą geometrii interpolacji (tor G01 jest prostą) albo zaleceń — bez zmian | — |
| źródła kart (pole `sources`) | 23 karty: 12 ★ + G84, M29, G81–G83, G98/G99, G28, G27–G30, G71/G70, G72, G75, G76, osie A/B/C | dodane 2026-10 (sprint 20); miejsca tylko tam, gdzie sprawdzone — reszta „do uzupełnienia” | rejestr `src/content/nauka/sources.ts`; stan: `npm run audit:dzialy` |
| język kart (paczka C) | „zawsze”, „nigdy”, „złamane narzędzie” w polach i artykułach; G33/G34/G76, G04, M30, M99, M03–M05, M07/M08, G71, G73, G85/G86 | przeredagowane 2026-10 (sprint 21) — warunki zamiast reguł, skutek opisany rzeczowo | spójność z lekcjami T7.1, T8.1, F4.2; parametry sterowania — „zależy od” |
| paczka T (błędy P1 z audytu sekcji) | G71/G70, G72, G32/G33, G76 (tok.), G90/G92/G94 (tok.), G92, G96/G97, G04, G00, G01, G27/G29/G30, G43/G49, G68/G69, G80–G83, M03–M05, M08/M09 | poprawione 2026-11: tryb tokarki w symulacjach, prawdziwe cykle G71/G76/G83 i G68 zamiast rozpisań, gwint blokami G32 do rdzenia 22,16, kryterium G72, G27 bez punktu pośredniego, G92 według systemów kodów, czoło wrzeciona N w G43, tor G00 warunkowo, jedna zasada o liczbie M w bloku | jak w polach `sources` kart; liczba M w bloku (parametr 3404#7) i G92.1 — do weryfikacji w B-64604EN |
| paczka U (programy wg profilu kursu) | wszystkie 56 kart: 56 przykładów, 21 `<Sim>`, 16 `<Demo>`, 35 bloków kodu i pola składni | poprawione 2026-11: profil §4a; przykłady G52, G68, G92, M98 używają kodu karty; podgląd dla G27–G30, G50, G74, G75, G76/G87–G89, G93, M00/M01, M06, M29; podpis przykładów bez podglądu wg `simGaps`; tor roboczy bez zmian poza przykładami dopisanymi od nowa | profil: lekcje F1.5, T1.3 |
| paczka V (zgodność z lekcjami, §3.3 audytu) | G04, G82, G20/G21, G52/G53, G54–G59, M03–M05, G96/G97, M06, M08/M09, M30; rysunek `g04` | poprawione 2026-11: postój wg F3.5 (czas wg operacji, w przykładach ≥ 3 obroty, umacnianie warunkowo), jednostki i rejestry wg F1.4, G53/G153/SUPA wg F0.2, G500 wg F0.3, M30 i przewinięcie wg F1.5 (3404#4/#5), chłodzenie węglika wg F2.4, wymiana wg F2.1, wykruszanie wg F2.2; tor G00, G80, G43 (N) i kolejność G43 → S M03 — już w T i U | te same co w lekcjach: Fanuc B-64604EN, Sinumerik Fundamentals (rozdz. 9.1, 13.10, 15.7), Haas Workbook s. 42 i 44, Sandvik |
| paczka X2b (redakcja językowa, §3.2 i §3.5 audytu cz. 2) | 16 artykułów głosu A: G00, G01, G02, G03, G33, G68/G69, G71/G70, G76 (tok.), G81–G83, G85/G86, G92, G96/G97, M03–M05, M08/M09, M30, M98/M99 | zredagowane 2026-11 bez zmiany merytoryki: zdania-zapowiedzi, superlatywy, dramatyzm, liczby „na oko” (G01, G71, G81) zastąpione rachunkiem z przykładu, frazeologia, nagłówki-zachęty, listy z pogrubionym hasłem poza „Typowymi błędami”, podwójne rady (ręka nad stopem, zaokrąglanie naroży); „Typowe błędy” w postaci `**Hasło.** Zdanie.`; wszystkie 16 kart ≤ 10 pauz i ≤ 3 ozdobniki na 1000 słów | — |
| paczka X3 (redakcja językowa, pozostałe karty) | 30 kart: G04, G09/G61/G64, G15/G16, G17–G19, G20/G21, G22/G23, G27/G29/G30, G28, G34, G40–G42, G43–G49, G43.4, G52/G53, G54–G59, G68.2/G53.1, G72, G73, G76–G89 (frez.), G82, G84, G90/G91, G90/G92/G94 (tok.), G94/G95, G98/G99, M06, M19, M41–M44, osie A/B/C, CYCLE800, TRAORI | zredagowane 2026-11 bez zmiany merytoryki: pauzy zastąpione dwukropkiem, przecinkiem albo podziałem zdania; superlatywy bez źródła („najczęstsza przyczyna”, „najbardziej podchwytliwa”, „najwięcej błędów”), „zupełnie”, „w praktyce”, „naprawdę”, wykrzyknik; żargon „coś się dzieje z iksem” (G04); listy z pogrubionym hasłem poza „Typowymi błędami” → `hasło: opis`; „Typowe błędy” w postaci `**Hasło.** Zdanie.`; nagłówki z pauzą (G04, G52/G53) i nagłówek-superlatyw (G20/G21) przemianowane z zachowaniem kotwic. Kody G i M: pauzy 15,9 → 4,9 i ozdobniki 1,2 → 0,5 na 1000 słów; żadna karta ≥ 150 słów nie przekracza progu | — |
| paczka W1 (struktura kart, decyzje 1 i 10 audytu cz. 2) | wszystkie karty; pola i nagłówki: G00, G01, G02, G03, G04, G17–G19, G20/G21, G33, G43–G49, G52/G53, G54–G59, G68/G69, G71/G70, G76 (tok.), G81–G83, G84, G85/G86, G90/G91, G92, G94/G95, G96/G97, M03–M05 | pola `pitfalls`, `sinumerik`, `example` kart z artykułem pokazane pod artykułem („W skrócie”, przykład tylko gdy artykuł go nie zawiera) i zredagowane wg §3a; jedna „Składnia” (11 sekcji artykułów przemianowanych, kotwice bez zmian; tabela adresów strony ukryta, gdy artykuł ma własną); źródła zwinięte na telefonie; G43: pierwszy akapit bez szablonu wspólnego z G54 (§3.2); nazwa `g76-g89` („G76 G87 G88 G89 — Wytaczanie dokładne i specjalne (frezarka)”) już jednoznaczna, bez zmian | — |
| paczka W2 (decyzja 2 audytu cz. 2) | G02/G03 | jedna karta `g02` („G02 G03 — Interpolacja kołowa CW i CCW”): wstęp o obu kierunkach, składnia G02 i G03, rysunki `g02` i `g03`, przykład G03 z wektorem I0 J30 obok G02 w „Przykład 1”, pitfall o znaku R z dawnej karty G03; `content/kody/g03.mdx` usunięty, `/kody/g03` → `/kody/g02` (308, `next.config.ts`; kotwice obu kart były identyczne, więc linki z `#` działają); `see` w hasłach słownika i `content/reference.json` wskazują `g02`; liczniki testów: 55 kart, 146 kotwic, 33 programy Sim/Demo | — |
| paczka X (nazewnictwo i źródła, decyzja 4, §3.4–3.5 audytu, §4.4 cz. 2) | wszystkie karty | Heidenhain usunięty z tabel G00–G04 (i LinuxCNC z tabeli G04 — bez wpisu w rejestrze źródeł); „sterowanie” zamiast „sterownik” w kartach i słowniku (55 miejsc, ręcznie); korekcja promienia (nazwa G40–G42, hasło słownika „Korekcja promienia” z aliasem „kompensacja promienia”, kotwica bez zmian); punkt referencyjny zamiast bazy (G27–G30, G28), przesunięcie zera zamiast bazy (G10, G31); wytaczak (M19); płaszczyzna R (G81); nazwy G00 „Ruch szybki (pozycjonowanie)”, G33 „Toczenie gwintu jednym przejściem”, G76 „Cykl toczenia gwintu (tokarka)”, G84 „Gwintowanie gwintownikiem”; „większość”/„dokładnie”/„zawsze” bez źródła usunięte; nazwy sekcji „Fanuc i Sinumerik” (18) i „Wskazówki” (6), kotwice bez zmian; pitfalle G28/G84 jednym stylem; `note`/`internal` w `sources.ts` (10 notatek redakcji poza stroną), bez „do uzupełnienia” na stronie, lista braków w `audit:nauka` (105 odwołań bez miejsca); notki „Źródło: …” z G28/G84 → pole `sources` (nowa pozycja `haas-ap602`). Strony Sinumerika (§3.5, 12 kart) — bez zmian, czekają na dokumenty | — |
| paczka Y1 (rysunki — poprawki §5.2 cz. 1, §6.1 i §6.3 cz. 2) | 16 rysunków na kartach + podpisy symulacji | na telefonie rysunek karty na pełną szerokość ekranu (etykiety: mediana 9,8 → 11,4 px przy 390 px, najmniejsza 10,3 px; 0 rysunków poniżej 9 px — było 15), podziałka 8,5 → 9,5 px (`--fig-text-tick`), przycisk powiększenia w nagłówku rysunku; G04 oś czasu bez skali (wcięcie 14 s, postój 0,3 s), Ø44 przy krawędzi; f43-leadin bez łuku przy ostrym narożu, odjazd liniami wg legendy; f42-comp: objaśnione numery ①–④, etykieta bez nachodzenia; comp-entry: dojazd G01 linią ciągłą, „Korekcja promienia”; g02: R ujemne jako „drugi łuk (R ujemne)”, nie błąd; ConstVc: legenda wg znaczenia (wpis `[rodzaj, opis]` w `Fig`); G27–G30: rysunek `g28-path` zamiast dawnego RefPoint; G81–G83: anatomia cyklu `f51-cycle`, G98/G99 w swojej sekcji; G75 równe odstępy Q; t03-zero, LatheSingle, t12-uw, g84-depths, CycleRetract, f41-length, helix-z (podpis: skala przesadzona) — etykiety bez obcięć i nachodzenia; tytuły bez powtórzonego kodu (G28, G84); podpisy > 250 znaków skrócone (G00, G28, G41, G43, G54); notki z kodem z kropką (10 rysunków, w tym `tlen` z G00); podpisy symulacji bez nazw przycisków i kolorów (G00, G04, G40 ×2, G85, G94). Rysunki z lekcji na kartach bez rysunku (§5.3) i nowe rysunki — Y2, Y3 | — |
| paczka Y2 (rysunki z lekcji na kartach, §5.3 cz. 1) | G01, G04, G33/G32, G74, G76 (tok.), M03–M05, M06 | w artykułach: G01 „Zagłębianie” ← `f62-ramp`, G04 „Ile czekać” ← `f35-dwell`, G33 „Synchronizacja” ← `t72-g32`, G76 „Malejąca głębokość” ← `t71-passes` (dane = przykład karty: Q300, P920), M03–M05 „Który kierunek” ← `f22-dir`; karty krótkie (Schemat): M06 ← `f21-change`, G74 ← `t62-drill`; legendy tych rysunków wg znaczenia (M03/M04, rampa i wejście pionowe, przejścia G76). Pominięte: `t72-depths`, `t62-pecks`, `t22-face` (podpis odsyła do kroków przykładu z lekcji), `t22-css` przy G96/G50 (ten sam wykres co `ConstVc`), `f35-dwell` na G82 (notka z kodem G04, nie G82), `f53-tap` na G74 (karta G74 pokazuje tokarkę; gwintowanie lewe — przy G84) | — |
| paczka Y3 (nowe rysunki kart, §5.3 cz. 1) | G09/G61/G64, G52/G53, G68/G69, G85/G86, G92, osie A/B/C, G68.2/G53.1, G43.4 | 8 nowych rysunków w `src/components/figs3.tsx`, dane z przykładów kart: naroże i posuw przy G61 i G64 (prostokąt 40 × 30, łuk G64 powiększony), trzy zera lokalne G52 dla jednego podprogramu (blok kodu artykułu), rowek X15.–X35. przy R0./R60./R120. (symulacja G68), wyjście G85 na posuwie i G86 ruchem szybkim ze stopem wrzeciona (blok „Zapis bloku”), zero z rejestru G54 a zero z G92 (dwa panele), dodatnie A/B/C wg prawej śruby i C′ ruchu stołu (ISO 841), skos 30° z osiami X′ Z′ i osią narzędzia przed i po G53.1 (przekrój XZ, układ detalu), blok C90. z TCP i bez (widok z góry, oś C w zerze G54, kierunek obrotu przyjęty); karty z artykułem (G52, G68, G85/G86, G92) mają rysunek w treści (`<Diagram id>`), krótkie — w sekcji „Schemat” | ISO 841:2001 (osie i litery z primem — potwierdzone też w ISO 841:1974, p. 6.2 i 10); pozostałe jak w polach `sources` kart |
| paczka Z a (typografia i tabele, audyt cz. 2 §4.2–4.5, §5, §8, decyzja 8) | wszystkie karty (szablon strony) | skala tekstu 5 ról w `rem` (tokeny `--fs-*`, `--lh-*`): na próbie 7 kart 15–18 rozmiarów → 6–7 (poza widżetem kalkulatora łuku); jeden wygląd H2; baner bez zdjęcia, niski (decyzja 8); linia profilu zapisu w jednym wierszu z rozwinięciem; tabele wg liczby kolumn (`tableClass`), podpis nad tabelą, puste nagłówki tabel G00 i G33 → „Cecha”; kod w zdaniu bez łamania; jeden spis treści (bez bloku „W tej karcie”, uchwyt chowa się przy przewijaniu w dół, szuflada `aria-modal` z fokusem); okno powiększenia rysunku w szerokości ekranu, skala 1–3×, z podpisem; ramki uwag jako `role="note"` (axe: `landmark-complementary-is-top-level` 0) | — |
| paczka Z b (symulator w karcie, decyzja 7, audyt cz. 2 §7 i §8) | 21 bloków `<Sim>`, 16 `<Demo>`, przykłady kart z podglądem | animacja zamiast pełnego warsztatu + „Otwórz w symulatorze” (`/symulator?kod=…`, program, tryb, półfabrykat, dialekt); podpis G40 bez nazwy przycisku („Tor rzeczywisty”); karty: suma wysokości na telefonie 443 → 383 ekranów (mediana 6,6 → 5,6), G02 23,6 → 23, G40 20,6 → 17,5; axe na 55 kartach: 0 naruszeń (było `aria-input-field-name` 47 kart, `scrollable-region-focusable` 18 — edytor CodeMirror) | — |
| paczka Z c (lista i nawigacja, audyt cz. 2 §4.1, decyzja 9) | `/kody`, pasek dolny, kafelki strony głównej | lista z nagłówkami grup (kolejność wg `order`) i przyklejonym paskiem skoku zamiast pola „Każda grupa”; zwarty wiersz: kod, nazwa, jedna linia opisu; znacznik maszyny tylko przy karcie jednej maszyny, poziom tylko od 768 px; kolejne kody jako zakres („G40–G42”, `src/lib/codeRange.ts`), części kodu bez łamania; podtytuł bez obietnicy animacji „dla każdego kodu”; własny opis meta; lista na telefonie 9,5 → 6,8 ekranu (360 px: 10,1 → 7,1). Pasek dolny: Start, Nauka, **Kody**, Symulator, Więcej — „Kalkulatory” w „Więcej” (decyzja 9 potwierdzona 2026-11-13); kafelki strony głównej na telefonie: Kalkulatory zamiast Kodów | — |
| pozostałe | — | nie audytowano źródłowo | — |

Kontrolne przypadki kalkulatora łuku (start X20 Y20, koniec X50 Y50, R30, G03):
krótki łuk — środek (20, 50), I0 J30, 90°, 47,12 mm, strzałka 8,79 mm;
długi łuk — środek (50, 20), I30 J0, 270°, 141,37 mm, strzałka 51,21 mm.

## 7a. Standard lekcji

Lekcja rozwija umiejętność, karta kodu jest referencją — dane techniczne zgodne, bez kopiowania opisów. Kolejność: cel („po lekcji potrafisz…”) → wymagania wstępne → wyjaśnienie z rysunkiem → przykład → ćwiczenie częściowo uzupełnione → zadanie samodzielne → analiza typowego błędu → test (wyjaśnienie poprawnej odpowiedzi i błędu rozumowania) → podsumowanie i odnośniki. Każdy niezależny przykład podaje kontekst: jednostki, płaszczyznę, tryb współrzędnych, jednostkę posuwu, punkt początkowy i aktywne korekcje.

Raport z audytu treści: `docs/audyt-tresci-2026-10.md`. Audyt sekcji Kody G i M (karty, programy, rysunki, układ): `docs/audyt-kody-gm-2026-10-17.md`. Część 2 (język, telefon, typografia, podpisy, dostępność): `docs/audyt-kody-gm-cz2-2026-11-09.md`.

## 7b. Audyt 2026-10 — zakres i metoda

- 201 programów z treści (karty, lekcje, zadania, galeria, artykuły, strona główna) przechodzi parser i walidator bez błędów (`npm run audit:programy`); rozwiązania wzorcowe zadań i lekcji przechodzą własne sprawdzenie.
- Przykłady na kartach uzupełnione o komplet S/M03, G43 po wymianie narzędzia, G97 na tokarce; przykłady tokarskie na kartach frez + tok mają `exampleMode: "lathe"`.
- Program pokazowy na stronie głównej poprawiony (kieszeń współśrodkowa, rowki poza kieszenią) — temat z §8 zamknięty.
- Komunikat walidatora o G28 na Sinumeriku zgodny z kartą (tryb ISO / G74, G75) — temat z audytu §4 zamknięty.
- Weryfikacja źródeł online: dostęp do dokumentów producentów bywa ograniczony; w tabeli podano tytuł, wydanie i rozdział, a gdzie źródłem jest zestawienie niezależne — zaznaczono to wprost.

## 8. Tematy do osobnego zlecenia

- ~~Pokazowy program na stronie głównej~~ — poprawiony 2026-10 (sprint 0): dwa współśrodkowe przejścia wokół (40, 25).
