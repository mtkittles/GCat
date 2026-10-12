# Sprint 25 — raport #80 (audyt Nauki frezowania, etapy 1–5)

Plan wdrożenia raportu z PR #80 w paczkach:

| Paczka | Zakres raportu |
|---|---|
| L | §7 A — spójność techniczna (P1) |
| M | §7 B — zaliczanie zadań, kontrprzykłady R1–R6 |
| N | §7 E — szablon lekcji: ramka danych przykładu, zwijane porównania, podpisy, bibliografia |
| O | Podstawy + F0 — język, założenia, rysunki |
| P | F1 |
| Q | F2 |
| R | F3 |

## Paczka L — spójność techniczna (`sprint-25/paczka-l`)

| Ustalenie | Zmiana |
|---|---|
| tor X−5 styczny do X0, brak warstwy do zebrania (F2.3, F3.2, zadania) | półfabrykat w zadaniach frezarskich 84 × 54 × 20 (2 mm naddatku na bok), W na narożniku konturu gotowego (`ProgramTask`); rysunki `f23-feeds` i `f32-path` pokazują naddatek, kontur gotowy, W i frez Ø10; nowa legenda „naddatek”; tekst F2.3/F3.2 rozróżnia zejście w powietrzu i wejście w naddatek; komentarz o półfabrykacie w programie detalu |
| G00 przed G43 nieokreślone (F1.5 i starty) | pierwszy ruch po wymianie `G00 G43 Hn Z..` we wszystkich lekcjach frezowania (program detalu od F2.1); starty F3.1–F3.5 z G43 i osobnym ruchem Z / XY; dema bez łączenia XYZ w pierwszym ruchu; F1.5: akapit o trybie ruchu, krok w przykładzie, podsumowanie |
| F1.5 — kierunek G21, „ustawia wszystko”, G80, M06 przed startem | G21 chroni przed G20 z poprzedniego programu; nagłówek ustawia tryby profilu, nie wszystko; G80 a ruch XY bez G00/G01 (Fanuc 0i-F, rozdz. 3, s. 69); pytanie o kolejność „przyjętą w kursie” + uwaga o przykładzie Haas (Workbook s. 42) |
| G500 = zero maszyny (F0.3) | G500 wyłącza przesunięcie nastawne; frame bazowy i inne mogą zostać aktywne; stan po włączeniu ustala producent; pytanie z jawnym założeniem; źródło SINUMERIK rozdz. 9.1 s. 135, 13.10 s. 334; F0.2: G53/G153/SUPA — różny zakres |
| pomiar ręczny a sonda (F0.3) | uwaga: cykl sondy uwzględnia promień końcówki sam; przykład opisany jako pomiar ręczny Ø10; przejazd między zamocowaniami z wysokości bezpiecznej dla całego zespołu |
| „wejście w materiał” przy X−20 (F3.2) | pytanie „Który blok ustawia narzędzie na Z−5?” + nowe „Który blok jako pierwszy skrawa?” (dojazd do X−5) |
| chłodzenie HRSA (F2.4) | węglik — zwykle obfite chłodzenie; frezy ceramiczne w stopach żaroodpornych — bez chłodziwa (nowe źródło `sandvik-ceramic`); M07 i MQL zależne od maszyny; „detal nie rośnie” → ograniczenie zmian wymiarów |
| F3.1 — nieopisana wysokość startu, „bezpieczny na każdej maszynie” | start opisany (G43 na Z50, potem XY); uwaga sterowań bez „każdej maszyny”; pytanie o wysokość przejazdu rozdziela współrzędną Z i najwyższą przeszkodę |

Ostrzeżenia `audit:programy`: 23 → 18 (jawne G00 w startach).

## Paczka M — zaliczanie zadań (`sprint-25/paczka-m`)

Nowe warunki w `src/lib/taskCheck.ts` (typy w `lesson.ts`, schemat w `mdx/schema.ts`) sprawdzają stan wykonania i kolejność, nie obecność słowa:

| Warunek | Co sprawdza |
|---|---|
| `state` | na ruchach roboczych (opcjonalnie tylko nad punktem `at` albo tylko ze zmianą XY): narzędzie we wrzecionie po M06, rejestr H aktywnego G43, S, kierunek obrotów, G90/G91 |
| `stopBeforeChange` | każde M06 przy zatrzymanym wrzecionie |
| `dwell` | postój G04 w zadanym punkcie, co najmniej `min` s |
| `arcFormat` | każdy łuk przez R albo przez I/J |
| `winding` | kierunek obiegu konturu w XY (pole ze wzoru Gaussa) |
| `require` + `before: "move"` | kody w blokach przed pierwszym ruchem |
| `feed` + `tol` | dopuszczalne zaokrąglenie posuwu |
| `approach` (zaostrzony) | przed zjazdem żaden ruch szybki nie łączy XY ze zmianą Z |

| Lekcja | Kontrprzykład | Zmiana warunków |
|---|---|---|
| F1.3 | R4 — G91 tylko przed G90 | ruchy konturu przy aktywnym G91 (`state abs:false`) zamiast `require G91` |
| F1.4 | R5 — F6 nieprzeliczony | posuw 152,4 mm/min, dopuszczone świadome F150; rozwiązanie F152.4, polecenie i podpowiedź z posuwem |
| F1.5 | R6 — nagłówek po obróbce | G21 … G54 przed pierwszym ruchem |
| F2.1 | R1 — brak drugiego M06 | nawiercanie X12 Y10: T2 we wrzecionie, H2, S1800 M03; M05 przed M06 |
| F2.2 | — | S2500 i M03 aktywne na każdym ruchu roboczym (zamiast obecności słów) |
| F3.1 | R2 — XYZ naraz, potem poprawna para | zaostrzony `approach` |
| F3.2 | — | F150 na zejściu, F400 na konturze, obieg zgodnie z zegarem; polecenie mówi, co jest sprawdzane |
| F3.3 | — | każdy łuk przez R (cel: zapis R) |
| F3.4 | — | okrąg przez I/J, bez R |
| F3.5 | R3 — 0,01 s na Z5 | postój ≥ 0,5 s w X20 Y25 Z−2; zdanie o 0,5 s a 0,12 s |

- Komunikaty porównania torów: „Pokryto cały wymagany tor”, „Tor roboczy nie wychodzi poza wymagany tor” (zamiast „cały kontur obrobiony”).
- F2.4: warunek chłodziwa nazwany jako warunek ćwiczenia (także zejście w powietrzu).
- Testy `tests/taskCheck80.test.ts`: R1–R6 odrzucane (programy z raportu bez zmian), wzorce zaliczane, równoważne zapisy zaliczane (F150, G91 w bloku ruchu, start w jednej linii, M05 przed odjazdem, obieg w krótszych blokach), błędy celu odrzucane (M06 przy obrotach, S/M03 po obróbce, obieg przeciwny, I/J zamiast R, okrąg z dwóch R).

## Paczka N — szablon lekcji (`sprint-25/paczka-n`)

| Element (#80 §5) | Zmiana |
|---|---|
| dane przykładu rozrzucone po tekście, rysunku i kodzie | `worked.data` — ramka „Dane przykładu” (maszyna, jednostki, W, półfabrykat, narzędzie, stan początkowy); pilotażowo F2.3 i F3.2, dalsze lekcje w paczkach O–R |
| duże porównania odsuwają zadanie | blok zwijany `{ t: "more", title, blocks }` (`<details>`); `flatBlocks()` dla audytów, wyszukiwarki i liczenia rysunków. FP.1/TP.1: maszyna drugiej ścieżki w „Porównanie z toczeniem / z frezowaniem” |
| etykiety SVG maleją na telefonie | przycisk powiększenia na każdym rysunku `Fig` — okno na cały ekran, rysunek co najmniej 760 px szerokości, przesuwany palcem; Esc zamyka; kopia rysunku powstaje dopiero po otwarciu |
| podpisy ok. 13 px | podpis 14,5 px, legenda 13 px |
| pusta sekcja „Program detalu” (Podstawy) | sekcja i pozycja w spisie treści tylko, gdy program ma linie z tej lub wcześniejszych lekcji |
| powtarzalne metadane źródeł | w lekcjach lista skrótów, pełne opisy (wydanie, rozdział, strona) pod „pokaż”; karty kodów bez zmian |
| zdjęcie banera przyciąga wzrok | baner lekcji (`slim`): zdjęcie przygaszone (nasycenie 35%, jasność 75%) |
| — | tabela „Fanuc i Sinumerik”: wersja „Series 0i-F” zamiast „0i-F Plus” (zgodnie z bibliografią — instrukcja B-64607EN nie wymienia Plus) |

Przegląd dostępności (`scripts/audit-a11y.py`, 390 i 1363 px, oba motywy, 18 stron): kontrast 0, przewijanie poziome 0; zostaje znany fałszywy alarm `.cm-scroller` w edytorze symulatora.

## Paczka O — Podstawy i F0 (`sprint-25/paczka-o`)

| Lekcja | Zmiana |
|---|---|
| FP.1 | ruch główny obrotowy we frezowaniu i toczeniu (w struganiu i dłutowaniu prostoliniowy; Kuryjański s. 51–54 — nowe źródło `kuryjanski`); „ten sam tor” zamiast „ten sam program” + zdanie o dostosowaniu M-kodów, wymiany i korekcji; ruchomy stojak „w pokazanym modelu”; przykład jako fragment z danymi (G90, mm, start X20) i odczytem na ekranie współrzędnych przedmiotu |
| FP.2 | „punkt programowany” (oś freza, płaszczyzna czoła; wiertło — wierzchołek) zamiast „czubka”; płaszczyzna odniesienia długości (w kursie czoło wrzeciona N) i ramka modelu N = Z + L; wysięg krótki, ale z zapasem — sztywność; nowe pytanie: wysięg 15 / 30 mm przy docisku; nawiertak ≠ nakiełek, kąt według producenta; nóż składany jako przykład. Rysunek: linie pomocnicze L, wysięgu i Ø, opis płaszczyzny odniesienia, „punkt programowany” |
| FP.3 | ustalenie, podparcie, zamocowanie; wynik 1 mm „dla pokazanej geometrii”; lista jako fragment przygotowania; pytanie o podkładki. Rysunek: podkładki, rzut XZ, opis W w obu rzutach |
| F0.1 | współrzędne „ze znakiem, względem zera” zamiast „odległości”; „ten sam tor” na maszynach z ruchomym stołem i stojakiem; reguła prawej dłoni w bloku zwijanym; cel JOG „ustaw punkt programowany na X40 Y20 Z−5” + zdanie, że to ćwiczenie współrzędnych. Rysunek z góry: rzut, mm, linie wymiarowe do H |
| F0.2 | R: czujnik bazowania i/lub znacznik referencyjny; N: odniesienie długości zależne od maszyny; bazowanie zależne od instrukcji (pomiar absolutny), R ≠ kraniec osi; model X/Y bez transformacji, Z — korekcja długości; „program pisze się w układzie W” + wyjątki G53/G28; baza zgodna z wymiarowaniem bez obietnicy o tolerancjach; pytanie z dodatnim przesunięciem. Rysunki: jeden przykład położenia M i R, osie otworu i rzut |
| F0.3 | dane pomiaru ręcznego w ramce; rysunek: r = 5 także w Y, strzałki +X/+Y, model pomiaru ręcznego, uwaga o cyklu sondy; dwa detale — „widok z góry, układ przykładowy” i przejazd z wysokości bezpiecznej |
| wszystkie | ramki „Dane przykładu” w FP.1–FP.3 i F0.1–F0.3 |

## Paczka P — F1 (`sprint-25/paczka-p`)

| Lekcja | Zmiana |
|---|---|
| F1.1 | blok = jednostka programu z kilkoma słowami; kolejność działania funkcji w bloku ustala sterowanie; S — prędkość obrotowa, F — prędkość posuwu; zapis bez kropki a parametr 3401#0 DPI i przyrost 0,001 mm (s. 200); nowe pytanie: zamiana X i Y; przykład z naddatkiem (krawędź na X0 po przejściu 2 mm naddatku). Rysunki: anatomia bloku z `X60.` `Y20.`, odczyt bloku z naddatkiem |
| F1.2 | grupy modalne kodów G osobno od zapamiętanych F i S; grupa 00 — jednorazowe; dwa kody jednej grupy: Fanuc 0i-F bierze ostatni (rozdz. 3, s. 69); „mimo że kod G00 nie został ponownie zapisany”; pytanie o stan przed linią 4; rysunek XZ: start nad W na Z50, stałe Y10, naddatek; G43 w podglądzie stanu |
| F1.3 | G91 — przyrost ze znakiem; błąd w G90 trwa, dopóki oś nie dostanie nowego położenia; przykład z kontrolą „poprzednie + przyrost = nowe”; G90 przy tolerancjach jako praktyka, nie dokładność obrabiarki |
| F1.4 | rejestry po zmianie jednostek zależne od sterowania, Haas Setting 9 (Workbook s. 44); G17 po włączeniu — parametr; przeliczenie posuwu w przykładzie i nowe pytanie (F8. → F203.2). Rysunek: osie otworu, wymiary bez nakładania |
| F1.5 | szkielet „podobny”, nie „zmienia się tylko obróbka”; M30 i przewinięcie — parametr 3404#4/#5; D w Sinumeriku zależne od ustawień. Rysunek szkieletu: `G00 G43 H1 Z50.`, opis uproszczenia |
| wszystkie | ramki „Dane przykładu” w F1.1–F1.5 |

## Paczka Q — F2 (`sprint-25/paczka-q`)

| Lekcja | Zmiana |
|---|---|
| F2.1 | preselekcja zależna od magazynu; przebieg wymiany ustala konstruktor (nie „makro”); numer T / kieszeń / rejestr H; samo T nie włącza korekcji; nawiertak 90° z wiertłem 140° — „do przykładu”, dobór według producenta; układanka z `G00 Z50.` i opisem procedury M06. Oś czasu: „schemat kolejności”, „T2 przygotowuje / M06 wymienia” |
| F2.2 | „prędkość obrotowa n” i „prędkość skrawania vc”; limit obrotów: wrzeciono, oprawka i narzędzie; G97/G96 zależne od profilu sterowania (Haas — lista kodów); M04 „może się wykruszyć”; „trzy razy za wolno” przy tym samym vc. Wykres: jednostka obr/min, limit przyjęty dla zespołu |
| F2.3 | G95 a system A tokarki (G99); z — liczba efektywnych ostrzy; „może trzeć” zamiast „trze”; nowa część ap/ae (ap = 5, ae = 2 mm na płytce, pocienianie wióra) z rysunkiem `apae` w bloku zwijanym; rysunek fz jako model uproszczony (rzeczywisty tor — trochoida); źródło Kuryjański s. 54 |
| F2.4 | M09 → M05 jako kolejność przyjęta w kursie, bez „zalanego wrzeciona”; przerywany strumień — zalecenie producenta zamiast „lepiej na sucho”; oś czasu z rozsuniętymi etykietami |
| wszystkie | ramki „Dane przykładu” w F2.1–F2.4 (F2.3 — z paczki N) |
