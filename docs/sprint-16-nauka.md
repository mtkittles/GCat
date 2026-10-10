# Sprint 16 — toczenie T0–T3 i poprawki galerii (issue #29, etap 3)

Wzorzec pilotażu (sytuacja → rysunek z krokami → pytanie na przewidywanie) przeniesiony na pierwsze 12 lekcji toczenia.

| PR | Zakres | Najważniejsze poprawki merytoryczne |
|---|---|---|
| #46 | T0.1–T0.3 | konwencja widoku; X ujemne przy planowaniu; M jako konwencja podręcznikowa, zero maszynowe zależne od producenta |
| #47 | T1.1–T1.3 | „najpierw X” tylko przy obróbce zewnętrznej; moment działania korekcji z `T0101` zależny od parametru |
| #48 | T2.1–T2.3 | format T jako profil kursu; obszar limitu G50; Rt teoretyczne a Ra z pomiaru; −2·rε dla kierunku ostrza 3 bez korekcji |
| #49 | T3.1–T3.3 | prześwity od surówki i szczęk; wyjście `X40.5` → `X42.`; kierunek łuku od +Y |
| #50 | galeria, karty | `G94` w 14 programach frezarskich (12 w galerii + 2 z CAM); przykład karty G84 zamieniony na prawdziwy cykl, `Z-15.` (wariant 2A) także na karcie M29 |

Rysunki toczenia wzdłużnego w T1 i T3.1 mają powiększoną skalę promieniową — opisane w podpisie.

## Zostało

- Toczenie T4.2–T8.1 (9 lekcji) tym samym wzorcem.
- Karty błędów: neutralne / czerwone (pole w danych).
- Tabela sterowań: język i wersja w nagłówkach.
- Układ trzech kolumn od 1440 px.
- Poprawki planu „7 dni”.
- Bibliografia: wydanie, rozdział i strona w `sources[].where`.
- Na koniec: ujednolicenie Kodów, Zadań, Programów, Kalkulatorów i Słownika ze stylem Nauki.

Brak nowych zmiennych środowiskowych i zależności.
