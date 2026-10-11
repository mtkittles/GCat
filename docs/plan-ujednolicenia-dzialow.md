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

### Paczka B — Kody: schemat i źródła — **zrobione** (sprint 20, jedna paczka)
1. Pole `sources` w schemacie karty (jak w lekcjach: dokument, co potwierdza, miejsce, URL) i sekcja „Źródła” na stronie karty — ten sam komponent co w lekcji.
2. Źródła dla 12 kart ★ — tylko faktycznie sprawdzone miejsca; reszta „do uzupełnienia”.
3. Profil zapisu nad przykładem karty (Fanuc ISO / frezarka 3-osiowa / G94 albo tokarka system A / G99).
4–5. `G94` w przykładach frezarskich, które są kompletnymi programami (karta po karcie, zgodnie z `docs/karty-kodow.md` §4: fragment ≠ program).

### Paczka C — Kody: język i warunki — **zrobione** (sprint 21, jedna paczka)
1–3. 10 kart ze „zawsze” i 3 z językiem „złamane narzędzie” — przeredagowanie według zasad z audytu Nauki (sytuacja → przyczyna → blok → rezultat).
4–5. Karty bez ★ w kolejności z `docs/karty-kodow.md` §6.

### Stan po paczce A (sprint 20)

- Zadania: 0 ostrzeżeń, 0 bez G94, 0 bez lekcji do powtórki; profil nad treścią. Przy okazji poprawione błędy merytoryczne: faza w `toczenie-czolo` skrawała w powietrzu, „przekrycie 50%” w `planowanie`.
- Kalkulator: źródła (Kuryjański, Storch), Rt zamiast Rz, odnośniki do lekcji. Wzory na Q, P, Rt i otwór pod gwint — źródło do uzupełnienia.
- Słownik: 0 haseł ze słowami bezwarunkowymi; 27 haseł z odnośnikiem z lekcji (liczone z `[[…]]`); bez karty i lekcji zostało `kc` (używane w kalkulatorze).
- Programy: profil zapisu i zastrzeżenie o parametrach na stronie programu.

### Stan po paczce B (sprint 20)

- Pole `sources` w karcie (schemat, Keystatic, strona) i wspólny komponent `SourceList` z lekcjami.
- Źródła ma 23 karty, w tym wszystkie 12 ★; 9 kart ma potwierdzone miejsce (rozdział/strona albo konkretna strona WWW). Karty ★ odwołują się do instrukcji Fanuc 0i-F Plus i SINUMERIK Fundamentals bez stron — pokazują „do uzupełnienia”, dopóki nie sprawdzimy rozdziałów.
- Karty bez źródeł pokazują jawnie „do uzupełnienia”.
- Profil zapisu przykładów pod nagłówkiem każdej karty.
- `G94` w bloku startowym 24 przykładów frezarskich (pole `example`); bloki `sim` w artykułach bez zmian.

Zostało dla Kodów: rozdziały i strony instrukcji Fanuc i SINUMERIK dla kart ★; paczka C (język).

### Stan po paczce C (sprint 21)

- Słowa bezwarunkowe w polach kart: 10 → 1 (G28 — opis błędnego założenia „G28 to zawsze ruch w górę”, zostaje celowo). Słownictwo alarmistyczne: 3 → 0 („złamać wiór” w G73 to termin technologiczny; audyt go pomija).
- Artykuły kart (MDX): przeredagowane zdania o „złamanym frezie”, „zniszczeniu płytki”, „nigdy G02/G03”, „zawsze G97”, „Zawsze kończ G52”. Zostają zdania geometryczne (tor G01 jest prostą, X0 tokarki na osi, start gwintu w tym samym położeniu kątowym).
- Poprawki merytoryczne: G33/G34/G76 — przy G96 problemem jest trafienie w ten sam zwój, nie zmiana skoku (spójnie z T7.1); G04 — X bez kropki zależy od ustawień; M30 — co kasuje, zależy od parametrów; M99 w programie głównym — opisane jak w T8.1; M03–M05 — liczba funkcji M w bloku zależy od sterowania; M07/M08 — przypisanie ustala producent; G71 — zasada bloku P dotyczy typu I.

Zostało dla Kodów: rozdziały i strony instrukcji Fanuc i SINUMERIK dla kart ★ (potrzebny dostęp do dokumentacji).

### Stan po paczce D (sprint 22)

- Dokument Fanuc ustalony: **B-64607EN/01**, wydanie 01, Oct. 2016, „FANUC Series 0i-MODEL F — Operation and Maintenance Handbook” (modele 0i-TF i 0i-MF). Instrukcja **nie wymienia 0i-F Plus**, więc wpis w rejestrze źródeł mówi o 0i-F i zastrzega, że nowsze wersje mogą się różnić.
- Strony (ze stopki dokumentu) uzupełnione w 12 kartach ★ i 22 lekcjach: tabele kodów G (rozdz. 3.1 s. 71–74, 3.2 s. 75–78), format programu (rozdz. 4, s. 79–93), parametry (1401#1 LRP, 3405#1 DWL, 3401#6/#7 GSB/GSC, 5003#0/#1 SUP/SUV, rozdz. 7).
- Poprawka merytoryczna: G04 — instrukcja podaje adresy X i P (`G04 {X_ / P_}`, s. 79); wzmianka o U usunięta z opisu źródła, bo nie jest tam potwierdzona.
- Instrukcja jest zestawieniem — nie opisuje cykli (G71/G70, G76, G32) ani makr; lekcje o nich zostają bez stron do czasu sięgnięcia do DESCRIPTIONS (B-64602EN).
- Brak w dokumencie (nie wpisujemy jako faktu): definicje M00–M09, M30, M98/M99 jako funkcji standardowych; parametr G94/G95 po włączeniu dla frezarki; parametr wyboru G98/G99; alarm za pominięty G43.

Zostało dla Kodów: SINUMERIK (strony kart ★), lekcje bez stron (f0-*, f1-1, f1-2, f1-5, f2-1, f2-2, f2-4, f5, f6-3, f7-*, f8-1, t0-*, t1-1, t1-3, t2-1, t2-2, t4-2, t5-*, t6-*, t7-*, t8-1, t9-1), FALX w CYCLE95.

## Zasady (bez zmian)

- Symulator, parser, osadzone dema i odnośniki są chronione (`docs/karty-kodow.md`).
- Nie wymyślamy treści technicznej. Brak potwierdzenia → „zależy od sterowania / do weryfikacji”.
- Bez masowych zamian tekstu: każda karta, zadanie i hasło osobno.
