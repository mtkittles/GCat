# Sprint 20 — paczka A ujednolicenia działów (jedna gałąź, jeden PR)

Plan: `docs/plan-ujednolicenia-dzialow.md`. Pomiar: `npm run audit:dzialy`.

| Commit | Zakres |
|---|---|
| test liczby lekcji | 52 → 53 po scaleniu F8.1 i T9.1 (zastępuje #67) |
| Zadania | profil zapisu, „Przed zadaniem powtórz”, pole `lessons`; poprawki: faza w `toczenie-czolo` (wzorzec skrawał w powietrzu), planowanie za oś X−1,6, „przekrycie 50%” → 30% / 35 mm, M29 w gwintowaniu, blok startowy tokarski jak w T1.3 |
| Kalkulator | źródła wzorów (Kuryjański 2011, Storch), Rt zamiast Rz, warunki zamiast „zawsze” i „kończy się złamaniem”, odnośniki do lekcji |
| Słownik | 3 hasła z warunkami, „Chropowatość — Rt, Ra, Rz” (stara nazwa jako alias), „W lekcjach” przy hasłach, 6 nowych odnośników w lekcjach |
| Programy | profil zapisu, zastrzeżenie o parametrach, „Czas wg symulatora” |

## Paczka B — Kody (ta sama gałąź, osobny PR)

| Commit | Zakres |
|---|---|
| pole źródeł | `sources` w schemacie karty i Keystatic, wspólny `SourceList`, profil zapisu i sekcja „Źródła” na karcie, nowe pozycje rejestru (ISO Milling 02/2012, Cycles 04/2006, SINUMERIK ONE 03/2025, Haas Workbook) |
| treść kart | źródła 23 kart (12 ★ + 11 ze sprawdzonymi miejscami), G94 w 24 przykładach frezarskich |

## Do weryfikacji / do uzupełnienia

- Rozdziały i strony instrukcji Fanuc 0i-F Plus i SINUMERIK Fundamentals dla kart ★.

- Źródła wzorów na wydajność, moc, Rt i otwór pod gwint (kalkulator).
- Hasło `kc` — bez karty i lekcji.
- Bez zmian: FALX w CYCLE95; numer i rozdziały instrukcji Fanuc 0i-F Plus.

## Następnie

Paczka C — Kody: 10 kart ze „zawsze”, 3 z „złamanym narzędziem”, potem karty bez ★ wg `docs/karty-kodow.md` §6.

Brak nowych zmiennych środowiskowych i zależności.
