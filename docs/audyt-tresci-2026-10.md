# Audyt treści — Kody i Nauka (październik 2026)

Zakres: tylko materiały wskazane w zleceniu — karty G84, G28 (z G27/G29/G30), G40–G42, G92, G94/G95,
oznaczenia katalogu, lekcje F4.2 i T0.2 (plus spójne miejsce w T3.2). **To nie jest audyt całej bazy.**
Symulator, jego dane i osadzone symulacje nie były zmieniane.

## 1. Tabela audytu

| Materiał | Problem | Dowód | Źródło / obliczenie | Rodzaj | Istotność | Poprawka |
|---|---|---|---|---|---|---|
| G84 — składnia (karta) | `M29 S500 / G99 G84 … F1.0 (F = skok)` bez trybu posuwu; G99 wyglądało na posuw/obr | `content/gcodes.json` → g84.syntax | Haas AP-602 (04/2016): G94 F = P·RPM, G95 F = P | brak założenia | wysoka | Dwa warianty G94/G95 z jawnym trybem; G98/G99 opisane jako poziom powrotu |
| G84 — parametr Z | „Z — głębokość gwintu / do końca pełnego zarysu” | karta i artykuł | geometria: Z = −(L + nakrój); otwór głębiej | potwierdzony błąd | wysoka | Rozdzielone 4 głębokości + rysunek `g84-depths` |
| G84 — otwór D − P | podane jako reguła ogólna | artykuł | dotyczy gwintowników skrawających; wygniataki wg katalogu | nadmierne uogólnienie | średnia | Zawężenie + błąd „przyczyna → skutek → poprawka” |
| G84 — Sinumerik | `PIT`, `SDR`, „cykl liczy posuw sam — brak ryzyka” | artykuł, karta | parametry zależą od wydania CYCLE84/CYCLE840 — nie zweryfikowano | zależność od sterowania | średnia | Bez list parametrów; odesłanie do dokumentacji „Cykle” danej wersji |
| G84 — M29 | jako uniwersalne | karta | zależne od parametrów/OEM | zależność od sterowania | średnia | „na wielu sterowaniach Fanuc” |
| G28 — Sinumerik | „Sinumerik nie ma G28”; SUPA/G75 jako zamienniki | artykuł, karta | Siemens ISO Milling 02/2012, rozdz. 2.2.1 (G28 w trybie ISO) | potwierdzony błąd | wysoka | Tryb ISO vs język natywny (G74/G75); SUPA ≠ powrót do bazy |
| G28 — G90 G28 Z0 | „to poważny błąd” bezwarunkowo; „prosto w górę” | artykuł, karta | punkt pośredni w G90 = Z0 układu detalu; kierunek do bazy zależy od maszyny | nadmierne uogólnienie | wysoka | Warunki niebezpieczeństwa; rysunek `g28-path`; bez superlatyw |
| G40–G42 — zła strona | „detal mniejszy o średnicę freza” | `articles-korekcje.ts` | prostokąt: każda krawędź −D → wymiar −2D (Ø10: 80×50 → 60×30) | potwierdzony błąd | średnia | Liczba z geometrią i zastrzeżeniem dla innych kształtów |
| F4.2 — przykład rozwiązany | brak `G01 Y40` między X0 Y10 a `G02 X10 Y50 R10` | `nauka/f4-2.ts` → worked.steps | cięciwa √(10² + 40²) ≈ 41,23 mm > 2R = 20 mm — łuk nie istnieje | potwierdzony błąd | wysoka | Dodany krok `G01 Y40.` (rozwiązanie zadania już go miało) |
| F4.2 — tabela korekt D | jedna płytka: D −0,02 i +0,015 naraz | tabela w teorii | jedna korekcja przesuwa wszystkie krawędzie w tę samą stronę | niejednoznaczność | średnia | Dwa niezależne scenariusze + diagnoza sprzecznych odchyłek |
| F4.2 — rejestr D | brak rozróżnienia promień/średnica | teoria | zależne od parametru maszyny | brak założenia | niska | Jedno zdanie o parametrze |
| T0.2 — faza | „ΔX = 1 → faza 0,5 × 45°” | błąd typowy w t0-2 | |ΔX| = 1, |ΔZ| = 1 → Δr = 0,5, tan α = 0,5, α ≈ 26,6° | potwierdzony błąd | wysoka | Opis stożka; wzory na wartościach bezwzględnych; definicja półkąta; rysunek `t02-taper` |
| T3.2 — podsumowanie | `ΔX = 2 · ΔZ` bez wartości bezwzględnych | podsumowanie | jw. | niejednoznaczność | niska | `|ΔX| = 2 · |ΔZ|` |
| G92 — tokarka | „Fanuc 0T G92 S ogranicza obroty” | karta | systemy kodów A/B/C — do weryfikacji w dokumentacji Fanuc | zależność od sterowania | średnia | Opis zależny od systemu kodów; znacznik w katalogu |
| G94/G95 — tokarka | „toczenie: zwykle G95” | karta | system A: G98/G99 | zależność od sterowania | średnia | Rozróżnienie systemów |
| Katalog | G90/G91, G92, G94/G95, G98/G99, G74 oznaczone frez + tok bez informacji o różnym znaczeniu | `/kody` | j.w. | propozycja dydaktyczna | średnia | Znacznik „zależy od: system kodów” w katalogu i na karcie |

## 2. Źródła wykorzystane

- Siemens AG, *SINUMERIK 840D sl / 828D ISO Milling — Programming Manual*, 02/2012, nr 6FC5398-7BP40-3BA0, rozdz. 2.2.1 „Reference point approach with intermediate point (G28)” (str. 33 w spisie treści). Wersja francuska: https://cache.industry.siemens.com/dl/files/169/65711169/att_76738/v1/PGM_0212_fr_fr-FR.pdf — sprawdzono spis treści (istnienie G28 w trybie ISO), nie treść rozdziału.
- Haas Automation, *G84 Tapping Canned Cycle*, AP-602 X1, 04/2016: https://www.haascnc.com/content/dam/haascnc/videos/bonus-content/ep25-tap-programming/Haas_G84_Tapping.pdf — zależności F = P × RPM (G94) i możliwość G95. Dotyczy frezarek Haas.
- Obliczenia własne: cięciwa łuku F4.2, kąt stożka T0.2, głębokości G84 (przy założonym nakroju 3 zwojów).

## 3. Kwestie niepotwierdzone (do weryfikacji)

- Systemy kodów G tokarek Fanuc (A/B/C) — znaczenia G92/G50 i G98/G99 vs G94/G95 według podręcznika Fanuc dla konkretnej serii.
- Parametry CYCLE84 / CYCLE840 i składnia G74 / G75 w języku natywnym Sinumerika — według instrukcji „Cykle” / programowania dla wersji sterowania.
- Długość nakroju gwintownika — przyjęto 3 zwoje jako założenie przykładu; zależy od formy narzędzia.
- Położenie punktu referencyjnego Z — „typowo u góry” na frezarkach pionowych, nie reguła.

## 4. Wyłączone z realizacji (ochrona symulatora)

- `src/lib/parser/validate.ts`: komunikat walidatora „Sinumerik nie ma G28 — użyj SUPA G0 Z0 lub G75” — sprzeczny z poprawioną kartą; do osobnego zlecenia.
- Przykład na karcie G84 (`content/gcodes.json` → g84.example, symulowany) i symulacja w artykule G84 nie deklarują jawnie G94/G95 — opis wokół wyjaśnia założenie G94.
- Pokazowy program na stronie głównej (`G02 I10 J0` / `G02 I14 J0`) — opisany wcześniej w `docs/karty-kodow.md`.

## 5. Sprawdzenia po zmianach

- build, lint, audyt lekcji (`npm run audit:nauka`), testy kalkulatorów (`npm run test:calc`);
- nowe rysunki i karty na 360, 390, 768 i 1440 px;
- znaczniki `[[…]]`, slugi i kotwice — liczba linii ze znacznikami bez zmian;
- diff: brak zmian w `src/lib/parser`, `src/components/simulator`, `src/app/symulator`, programach demonstracyjnych.
