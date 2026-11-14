# content/slownik — hasła słownika

> **Jedyne źródło prawdy dla słownika** (od kroku 4): `/slownik`, dymki `[[…]]`, wyszukiwarka i fiszki czytają te pliki (przez `npm run tresci`). Stary `content/glossary.json` jest nieużywany (usunięcie w kroku 9).

**Plik:** jeden plik YAML na hasło, `<kotwica>.yaml`. Kotwica = nazwa pliku = adres `/slownik#<kotwica>`.
**Schemat:** `hasloSchema` w `src/lib/mdx/schema.ts`.

Format = zapis panelu Keystatic (`/keystatic`, test round-trip `tests/keystatic.test.ts`): listy w osobnych liniach, długie teksty zawinięte `>-` do 80 znaków.

```yaml
term: Frezowanie współbieżne
anchor: frezowanie-współbieżne   # = nazwa pliku; NIE zmieniać (zmiana `term` nie zmienia adresu)
order: 130                       # kolejność: przy kilku pasujących hasłach dymek bierze pierwsze
aliases:
  - współbieżne
  - climb milling
def: >-
  Frezowanie, w którym kierunek obrotu narzędzia…
formulas:                        # wzory; [] = brak
  - expr: n = 1000 · Vc / (π · D)
    where:                       # „symbol — znaczenie, jednostka”; wiersz bez „ — ” to uwaga do wzoru
      - n — obroty wrzeciona, obr/min
    example: 'Vc 400 m/min, średnica 100 mm: n = 1274 obr/min.'   # pole można pominąć
see:
  - g40-g42                      # slugi kart, sprawdzane przy buildzie
diagram: climb                   # id rysunku z diagrams.tsx; '' = brak
```

**Kotwica:** przy eksporcie (krok 4) pole `anchor` dostało dzisiejszą kotwicę liczoną z `term`: małe litery, każdy ciąg znaków innych niż litery i cyfry → `-`. Może się więc kończyć myślnikiem, np. `3-2-obróbka-pozycjonowana-`. Test pilnuje, że kotwice = migawka `tests/fixtures/kotwice.json`. W panelu pole „Kotwica” jest edytowalne (Keystatic nie ma pola tylko do odczytu dla nazwy pliku) — zmiana wywróci ten test, czyli CI na PR.

Markery `[[…]]` w polach są sprawdzane tak samo jak w MDX.

**Wzory (`formulas`, paczka UE):** każdy wzór musi mieć pokrycie w polu `sources` (dokument i miejsce) albo wynikać rachunkiem z wzorów, które je mają — wtedy w `where` źródła trzeba to napisać. Przykład liczbowy przelicz przed zapisaniem. Mnożenie zapisujemy kropką środkową `·`, liczby z przecinkiem.
