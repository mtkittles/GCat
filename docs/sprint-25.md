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
