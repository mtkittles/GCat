# Sprint 19 — koniec etapu 3 Nauki i start ujednolicenia działów (issue #29)

| PR | Zakres |
|---|---|
| #62 | Rysunek stanu detalu nad programem narastającym (płytka z góry, wałek z boku; elementy z bieżącej lekcji pomarańczowo); oznaczenie „fragment programu na etapie lekcji …” |
| #63 | F8.1 — zadanie końcowe frezowania: płytka 60 × 40, zero na środku, frez Ø12; cały program od pustej strony |
| #64 | T9.1 — zadanie końcowe toczenia: pręt Ø50, nowe średnice, nóż zgrubny R0,4 (planowanie do X−0,8); cały program |
| #65 | `npm run audit:dzialy` i `docs/plan-ujednolicenia-dzialow.md` — stan Kodów, Zadań, Programów, Kalkulatora i Słownika oraz plan w trzech paczkach |
| #66 | Zadania (paczka A, pkt 1): `G94` w bloku startowym 12 zadań frezarskich, `G43 H` po wymianie narzędzia w 3 zadaniach; tor wzorców bez zmian |

## Uwagi

- #63 i #64 zmieniają oba `tests/mdx.test.ts` (liczba lekcji 51 → 52). Po scaleniu pierwszego drugi wymaga poprawki na 53.
- Audyt działów: Kody nie mają pola źródeł — to pierwsza rzecz paczki B.

## Zostało

- Paczka A, pkt 2–5: profil i odnośniki w Zadaniach, źródło wzorów w Kalkulatorze, Słownik, karty technologiczne Programów.
- Paczki B i C — Kody.
- Do weryfikacji bez zmian: FALX w CYCLE95; numer dokumentu i rozdziały instrukcji Fanuc 0i-F Plus.

Brak nowych zmiennych środowiskowych i zależności.
