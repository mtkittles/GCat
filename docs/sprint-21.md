# Sprint 21 — paczka C ujednolicenia działów (Kody: język i warunki)

Plan: `docs/plan-ujednolicenia-dzialow.md`. Pomiar: `npm run audit:dzialy`.

- 26 kart: „zawsze”, „nigdy”, „złamane narzędzie” zastąpione warunkami i rzeczowym opisem skutku — w polach kart i w artykułach MDX (bez bloków `sim`).
- Poprawki merytoryczne: G33/G34/G76 (G96 a trafienie w zwój, spójnie z T7.1), G04 (X bez kropki zależy od ustawień), M30 (co kasuje — parametry maszyny), M99 w programie głównym (jak T8.1), M03–M05 (liczba funkcji M w bloku), M07/M08 (przypisanie ustala producent), G71 (zasada bloku P — typ I), G73 (granica głębokości wg producenta wiertła), G85/G86.
- Wszystkie zmienione karty znormalizowane zapisem Keystatic (round-trip bez zmian); dane kart po normalizacji identyczne z edytowanymi.
- `audit:dzialy`: Kody — słowa bezwarunkowe 10 → 1 (G28, celowo), alarmistyczne 3 → 0; regex pomija termin „złamać wiór”.

Do uzupełnienia: rozdziały i strony instrukcji Fanuc 0i-F Plus i SINUMERIK dla kart ★; FALX w CYCLE95.

Brak nowych zmiennych środowiskowych i zależności.
