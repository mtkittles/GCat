# content/slownik — hasła słownika

> **Jedyne źródło prawdy dla słownika** (od kroku 4): `/slownik`, dymki `[[…]]`, wyszukiwarka i fiszki czytają te pliki (przez `npm run tresci`). Stary `content/glossary.json` jest nieużywany (usunięcie w kroku 9).

**Plik:** jeden plik YAML na hasło, `<kotwica>.yaml`. Kotwica = nazwa pliku = adres `/slownik#<kotwica>`.
**Schemat:** `hasloSchema` w `src/lib/mdx/schema.ts`.

```yaml
term: Frezowanie współbieżne
anchor: frezowanie-współbieżne   # = nazwa pliku; NIE zmieniać (zmiana `term` nie zmienia adresu)
order: 210                       # kolejność: przy kilku pasujących hasłach dymek bierze pierwsze
aliases: [współbieżne, climb milling]
def: Frezowanie, w którym kierunek obrotu narzędzia…
see: [g40-g42]                   # slugi kart, sprawdzane przy buildzie
diagram: climb                   # opcjonalnie: id rysunku z diagrams.tsx
```

**Kotwica:** przy eksporcie (krok 4) pole `anchor` dostało dzisiejszą kotwicę liczoną z `term`: małe litery, każdy ciąg znaków innych niż litery i cyfry → `-`. Może się więc kończyć myślnikiem, np. `3-2-obróbka-pozycjonowana-`. Test pilnuje, że kotwice = migawka `tests/fixtures/kotwice.json`.

Markery `[[…]]` w polach są sprawdzane tak samo jak w MDX.
