# Sprint 23 — issue #31 (przegląd wizualny Nauki)

Paczka F (etap 2, ćwiczenia) — opis w `docs/sprint-22.md`, PR #74.

## Paczka G — F0.1 (`sprint-23/paczka-g`)

| ID | Zmiana |
|---|---|
| V07 | rysunek prawej dłoni (`f01-hand`) w tym samym rzucie co osie: wnętrze do góry, kciuk +X, wskazujący +Y, środkowy +Z |
| V08 | pokaz `f01-relative`: ten sam blok X20 → X60 — u góry jedzie stół (X−), u dołu narzędzie względem detalu (X+); zero W na detalu, wspólny odczyt X; Start/Pauza/Reset i suwak; przy „ogranicz ruch” bez animacji |
| §8 | F0.1: „obowiązuje na każdym sterowaniu” → „Fanuc i SINUMERIK stosują tę konwencję” |

Brak nowych zmiennych środowiskowych i zależności.

## Paczka H — diagramy F5.4 i T0.1 (`sprint-23/paczka-h`)

| ID | Zmiana |
|---|---|
| V13 | F5.4: w teorii jeden rysunek G98/G99 (`f54-levels`) zamiast dwóch; przebieg krok po kroku zostaje w przykładzie (`f54-run`) |
| V14 | `f54-levels` pokazuje cały zespół: wiertło Ø6 z wysięgiem 40 i oprawkę Ø32 przy dnie otworu X45 — oprawka 8 mm nad dociskiem; w podpisie skutek krótszego wysięgu (oprawka na Z13, kolizja mimo poprawnego toru czubka) |
| V15 | T0.1: nowy schemat `t01-machine` przed osiami — wrzeciennik, uchwyt, szczęki, pręt, głowica, oprawka, płytka, konik z kłem (opcjonalnie), łoże; co się obraca, a co przesuwa |

## Paczka I — wejście do Nauki (`sprint-23/paczka-i`)

| ID | Zmiana |
|---|---|
| V01 | `/nauka`: „Zaczynam od podstaw — 7 dni do pierwszego programu” przed kartami ścieżek; nad kartami nagłówek „Wybieram ścieżkę” |
| V03 | plan ścieżki: „Etap N z M” nad każdym modułem; następna lekcja obramowana i oznaczona „następny krok” (z postępu w przeglądarce) |
| V04 | baner lekcji niższy (`size="slim"`, ok. 112 px zamiast 210–230 px) — więcej treści na pierwszym ekranie |
| §5 | plan 7 dni: „około 30–40 minut dziennie, we własnym tempie” zamiast „po pół godziny dziennie”; czas ćwiczeń zależy od ucznia |

## Paczka J — moduł P „Podstawy” (`sprint-24/paczka-j`)

Trzy krótkie lekcje przed modułem Maszyna, wspólne dla obu ścieżek (identyfikatory FP.1–FP.3 i TP.1–TP.3, jedna treść w `src/content/nauka/podstawy.ts`):

| Lekcja | Treść | Rysunki |
|---|---|---|
| P.1 Obrabiarka i jej ruchy (7 min) | ruch główny i ruchy posuwowe na frezarce i tokarce; budowa frezarki decyduje, który zespół się przesuwa (stół krzyżowy / ruchomy stojak / brama); program opisuje ruch narzędzia względem przedmiotu | `p1-mill` (dwie budowy), `t01-machine` (przeniesiony z T0.1) |
| P.2 Zespół narzędziowy (7 min) | wrzeciono → oprawka → część chwytowa → część robocza; długość L od czoła wrzeciona N; wysięg i Ø a kolizja oprawki; geometria i zużycie; podstawowe narzędzia | `p2-assembly` |
| P.3 Ustawienie przedmiotu (8 min) | baza wymiarowa → punkt zerowy W → G54; mocowanie i wysokość szczęk; lista przed pierwszym uruchomieniem | `p3-setup` |

- Każdy rysunek występuje w kursie raz (bez powtórzeń w lekcji i w kolejnych lekcjach).
- Słownictwo: ruch główny / ruch posuwowy, wrzeciennik, stojak, stół krzyżowy, suport, oprawka narzędziowa, część chwytowa, przedmiot obrabiany.
- Źródła: ISO 841, Haas Mill Programming Workbook s. 1–8, Haas Basic Mill Operator Hand Out ver. C (s. 39 — Length Geometry/Wear, s. 43 — work offsets; nowy wpis `haas-basic`), Fanuc B-64607EN.
- F0.1 i T0.1 mają pytanie powtórkowe z P.1. Plan „7 dni”: wstęp „Zanim zaczniesz” (FP.1–FP.3, ok. 22 min) przed dniem 1; „4,5 godz.” z przecinkiem.
- Schemat lekcji: identyfikator `FP.1` / `TP.1` dopuszczony (`^[FT](\d+|P)\.\d+$`). Liczba lekcji w teście: 53 → 59.
