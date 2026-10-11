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
