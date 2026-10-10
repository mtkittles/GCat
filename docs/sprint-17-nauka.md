# Sprint 17 — toczenie T4.2–T8.1 (issue #29, etap 3)

Wzorzec pilotażu (sytuacja → rysunek z krokami → pytanie na przewidywanie) przeniesiony na ostatnie 9 lekcji toczenia. Po scaleniu cała ścieżka toczenia (22 lekcje) ma ten sam układ co frezowanie.

| PR | Zakres | Najważniejsze poprawki merytoryczne |
|---|---|---|
| #51 | T4.2 | kierunek ostrza wyprowadzany z rysunku naroża; zły kierunek przesuwa cały kontur o 2·rε promieniowo |
| #52 | T5.1–T5.3 | G71 typ I/II (monotoniczność w X i Z); porównanie G71/G72 po kierunku zdejmowania naddatku; CYCLE95 ze źródła |
| #53 | T6.1–T6.2 | P/Q w najmniejszych przyrostach; G74 a G73 — efekt wycofania, nie składnia |
| #54 | T7.1–T7.2 | rysunki przebiegu gwintu; A12 sprawdzone (poprawione w etapie 1) |
| #55 | T8.1 | licznik przebiegów i pozycja końcowa; M99 w programie głównym zależne od organizacji pracy |

Galeria (#50): przykład karty G84 zostaje z `M29 S500` (spójnie z F5.3), z komentarzem, że M29 zależy od maszyny.

## Do weryfikacji

- **FALX w CYCLE95 — promień czy średnica.** Nie udało się potwierdzić w dostępnych źródłach (Programming Guide Cycles 04/2000 podaje tylko „naddatek w osi poprzecznej”; nowsze wydania mają parametr _DMODE). Lekcja T5.3 opisuje to jako zależne od wersji, a przykład jawnie przyjmuje promień. Potwierdzić w instrukcji cykli 840D sl / 828D.

## Zostało (etap 3)

- Karty błędów: neutralne / czerwone (pole w danych).
- Tabela sterowań: język i wersja w nagłówkach.
- Układ trzech kolumn od 1440 px.
- Poprawki planu „7 dni”.
- Bibliografia: wydanie, rozdział i strona w `sources[].where`.
- Na koniec: ujednolicenie Kodów, Zadań, Programów, Kalkulatorów i Słownika ze stylem Nauki.

Brak nowych zmiennych środowiskowych i zależności.
