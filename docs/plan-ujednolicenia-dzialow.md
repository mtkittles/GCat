# Ujednolicenie działów ze standardem Nauki — stan i plan

Cel (issue #29, „na koniec”): Kody, Zadania, Programy, Kalkulatory i Słownik mają mieć
tę samą jakość co lekcje Nauki — profil zapisu przed kodem, przykłady przechodzące walidator,
warunki zamiast reguł bezwarunkowych, źródła z miejscem, spokojny język bez straszenia.

Wygląd (baner, chipy, typografia) jest już wspólny. Różnice dotyczą **treści i źródeł**.
Stan liczbowy daje `npm run audit:dzialy` (skrypt `scripts/audit-dzialy.ts`).

## Stan na 2026-10-11

| Dział | Co już jest zgodne | Główne braki |
|---|---|---|
| **Kody** (56 kart, 12 ★) | przykłady bez błędów i ostrzeżeń walidatora; składnia Fanuc / Sinumerik; typowe błędy | **brak pola źródeł** w schemacie karty; 24 przykłady frezarskie z ruchem roboczym bez `G94`; 10 kart ze „zawsze”; 3 z językiem „złamane narzędzie”; brak profilu zapisu nad przykładem |
| **Zadania** (16) | sprawdzanie toru, podpowiedzi, półfabrykat i narzędzia | 12 wzorców frezarskich bez `G94`; 3 wzorce bez `G43 H` po wymianie narzędzia; brak profilu maszyny i warunków w treści zadania; brak odnośnika do lekcji |
| **Programy** (22) | 0 błędów, 0 ostrzeżeń, `G94` we wszystkich frezarskich (sprint 16) | brak źródeł parametrów skrawania; karta technologiczna bez oznaczenia „wartości orientacyjne / do dobrania” tam, gdzie go brak — do przejrzenia ręcznie |
| **Kalkulator** | wzory pokazane z podstawieniem; wartości z tabeli opisane jako orientacyjne | brak źródła wzorów (dostępne: Kuryjański 2011, rozdz. 3, s. 53–54, wzory 3.1 i 3.4); brak odnośników do lekcji F2.2/F2.3 i T2.2/T2.3 |
| **Słownik** (77 haseł) | definicje krótkie, aliasy, odnośniki do kart | brak źródeł; 11 haseł bez odnośnika do karty kodu; 3 hasła ze słowami bezwarunkowymi |

Pełna lista kart i haseł — wynik `npm run audit:dzialy`.

## Plan — paczki po 5 PR

Każda paczka to osobna tura pracy. Kolejność według ryzyka merytorycznego i liczby odbiorców.

### Paczka A — Zadania i Kalkulator (małe, mechaniczne, z kontrolą kontekstu) — **zrobione** (#66 i jedna paczka sprint 20)
1. Zadania: `G94` w bloku startowym wzorców i starterów frezarskich; `G43 H` po wymianie narzędzia w 3 wzorcach — każde zadanie osobno, sprawdzenie, że tor wzorca się nie zmienia.
2. Zadania: linia profilu nad treścią (jak w lekcjach) i odnośnik „Powtórz: lekcja …”.
3. Kalkulator: źródło wzorów (Kuryjański, wydanie, rozdział, strony) i odnośniki do lekcji.
4. Słownik: 3 hasła ze słowami bezwarunkowymi — warunki zamiast reguł; odnośniki do lekcji dla 11 haseł bez kart.
5. Programy: przegląd kart technologicznych — „wartości orientacyjne” tam, gdzie brakuje.

### Paczka B — Kody: schemat i źródła
1. Pole `sources` w schemacie karty (jak w lekcjach: dokument, co potwierdza, miejsce, URL) i sekcja „Źródła” na stronie karty — ten sam komponent co w lekcji.
2. Źródła dla 12 kart ★ — tylko faktycznie sprawdzone miejsca; reszta „do uzupełnienia”.
3. Profil zapisu nad przykładem karty (Fanuc ISO / frezarka 3-osiowa / G94 albo tokarka system A / G99).
4–5. `G94` w przykładach frezarskich, które są kompletnymi programami (karta po karcie, zgodnie z `docs/karty-kodow.md` §4: fragment ≠ program).

### Paczka C — Kody: język i warunki
1–3. 10 kart ze „zawsze” i 3 z językiem „złamane narzędzie” — przeredagowanie według zasad z audytu Nauki (sytuacja → przyczyna → blok → rezultat).
4–5. Karty bez ★ w kolejności z `docs/karty-kodow.md` §6.

### Stan po paczce A (sprint 20)

- Zadania: 0 ostrzeżeń, 0 bez G94, 0 bez lekcji do powtórki; profil nad treścią. Przy okazji poprawione błędy merytoryczne: faza w `toczenie-czolo` skrawała w powietrzu, „przekrycie 50%” w `planowanie`.
- Kalkulator: źródła (Kuryjański, Storch), Rt zamiast Rz, odnośniki do lekcji. Wzory na Q, P, Rt i otwór pod gwint — źródło do uzupełnienia.
- Słownik: 0 haseł ze słowami bezwarunkowymi; 27 haseł z odnośnikiem z lekcji (liczone z `[[…]]`); bez karty i lekcji zostało `kc` (używane w kalkulatorze).
- Programy: profil zapisu i zastrzeżenie o parametrach na stronie programu.

## Zasady (bez zmian)

- Symulator, parser, osadzone dema i odnośniki są chronione (`docs/karty-kodow.md`).
- Nie wymyślamy treści technicznej. Brak potwierdzenia → „zależy od sterowania / do weryfikacji”.
- Bez masowych zamian tekstu: każda karta, zadanie i hasło osobno.
