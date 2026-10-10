# Sprint 13 — poprawki z audytu Nauki (issue #29)

Gałąź `sprint-13/nauka-audyt-1`, PR #30. Etap 1 audytu (zgodność i sprawdzanie) — wdrożony w pięciu partiach.

## Co zrobiono

| Partia | Ustalenia | Najważniejsze zmiany |
|---|---|---|
| 1 | A01 | `runTaskChecks` sprawdza stan wykonania (`feed`, `coolant`, `tapFeed`, `rapidAbove`); 4 kontrprzykłady audytu odrzucane |
| 2 | A02, A06 | M6×1: 12 mm pełnego gwintu, nakrój 3 mm → `G84 Z-15.`, pełna Ø5 do Z−17,1, `G83 Z-18.`; G83 liczony od R; przekrój czterech głębokości |
| po przeglądzie | — | rysunek G83 krok po kroku; 110 pytań-etykiet → pełne pytania (reguła w `audit:nauka`); wyprowadzenie 0,30·D / 0,18·D; przegląd 475 pytań i 40 zadań |
| 3 | A03, A07, A08, A09 | fz ≠ grubość wióra (rysunek, słownik); vc ≈ 251 m/min przy S8000; −20 + 5 = −15 z rysunkiem; `G99 X75.` w F5.4, docisk 25 mm, 864 mm |
| 4 | A04, A05 | profil zapisu nad lekcjami; SINUMERIK w panelu „język natywny”; `G21 G90 G94 G17` w programach frezarskich Nauki, programie narastającym i płytce |
| 5 | A10, A11, A12 | plan „7 dni” z F4.1 i powtórkami tylko z lekcji planu (reguła w `audit:nauka`); nawiertak 90° vs wiertło 140°; M29/R5/korektor w G84 warunkowo; chłodziwo; T6.1 posuw i µm; T7.1 10 przejść jako wynik symulatora; T7.2 rozkład wejść i lead |

## Decyzje użytkownika

- Gwint M6 — wariant A: zostaje 12 mm pełnego gwintu, nakrój 3 zwoje jako założenie przykładu.
- Przykład główny w zapisie Fanuc (ISO); SINUMERIK w rozwijanym panelu „język natywny”.
- `G94` w bloku startowym kompletnych programów frezarskich.

## Zostało (etapy 2–3 audytu)

- Galeria „Gotowe programy”: 13 programów frezarskich bez `G94` (poza zakresem Nauki).
- Karta kodu G84 (zakładka Kody): przykład `Z-12.`.
- Pilotaż redakcji: F0.1, F2.3, F4.1, F5.3, F5.4, T4.1 — sytuacja → przyczyna → blok → rezultat, rysunek w przykładzie rozwiązanym.
- Układ lekcji, rozmiary pisma, kroki przykładu na telefonie, autoplay a ograniczony ruch.
- Bibliografia: dokument, wydanie, rozdział i strona w każdym `sources[].where`.

Brak nowych zmiennych środowiskowych.
