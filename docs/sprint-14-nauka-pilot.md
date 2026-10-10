# Sprint 14 — pilotaż redakcji Nauki i czytelność (issue #29, etapy 2–3)

## Etap 2 — pilotaż (PR #33–#38, scalone)

Wzorzec: sytuacja → przyczyna → blok kodu → widoczny rezultat; rysunek w przykładzie rozwiązanym z numerami kroków; pytanie na przewidywanie.

| Lekcja | PR | Rysunek w przykładzie | Pytanie na przewidywanie |
|---|---|---|---|
| F0.1 | #33 | `f01-side` — Z−5 nad płytką i obok niej | frez w X−20 Z−5: powietrze czy materiał |
| F2.3 | #34 | `f23-feeds` — gdzie który posuw | następny blok po `G01 X-5. F400` |
| F4.1 | #35 | `f41-two` — dwie długości, ten sam Z5 | T1 we wrzecionie, `G43 H2 Z5.` → czubek Z22,5 |
| F5.3 | #36 | `f53-run` — przebieg G84, kroki 1–6 | `G84 … Z-12.` → pełny gwint do ok. Z−9 |
| F5.4 | #37 | `f54-run` — tor przy G98/G99 i docisku | start z Z20 → G98 wraca na Z20, kolizja |
| T4.1 | #38 | `t41-run` — włączenie i wyłączenie korekcji | G42 przy R = 0 → błąd fazy 0,17 mm |

Poprawki merytoryczne przy okazji: F4.1 — kontrola zgodności H/T opisana jako zależna od maszyny; T4.1 — zamiana G41/G42 psuje cały kontur (ok. 2·rε w promieniu), nie tylko fazy.

## Etap 3, część 1 — czytelność lekcji

- Tekst teorii 16,5 px (od 1100 px — 17 px, do 72ch); kod 14 px także na telefonie (przewijanie wiersza zamiast zmniejszania).
- Kroki przykładu: na telefonie opis nad kodem.
- Błędy, podsumowanie, wynik, informacja zwrotna testu — większe pismo.
- Źródła: pełny opis dokumentu widoczny pod pozycją (wcześniej tylko w atrybucie `title`).
- Demonstracje: nie startują same przy „ogranicz ruch”; w lekcjach na telefonie pokazują pierwszy kadr i przycisk; pasek start/pauza/krok/reset; jedna kolumna (rysunek → sterowanie → kod). Po ręcznym sterowaniu pokaz nie wznawia się sam. Logika w `src/components/simulator/motion.ts`, testy w `tests/motion.test.ts`.

## Zostało

- Przeniesienie wzorca pilotażu na pozostałe 45 lekcji (po kilka lekcji na PR).
- Karty błędów: neutralne dla pomyłek niegroźnych, czerwone tylko dla niebezpiecznych (wymaga pola w danych).
- Tabela sterowań: język i wersja w nagłówkach.
- Układ trzech kolumn od 1440 px (prawy panel dubluje treść).
- Galeria „Gotowe programy”: `G94` w 13 programach frezarskich; karta G84 w Kodach: przykład `Z-12.`.
- Bibliografia: wydanie, rozdział i strona w każdym `sources[].where`.

Brak nowych zmiennych środowiskowych i zależności.
