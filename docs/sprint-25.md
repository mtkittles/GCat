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
