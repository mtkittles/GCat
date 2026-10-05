# content/slownik — hasła słownika

> Krok 2 (szkielet): katalog jest pusty i **żadna strona go jeszcze nie czyta**. Dziś słownik jest w `content/glossary.json`.

**Plik:** jeden plik YAML na hasło, `<kotwica>.yaml`. Kotwica = nazwa pliku = adres `/slownik#<kotwica>`.
**Schemat:** `hasloSchema` w `src/lib/mdx/schema.ts`.

```yaml
term: Frezowanie współbieżne
anchor: frezowanie-współbieżne   # = nazwa pliku; NIE zmieniać (zmiana `term` nie zmienia adresu)
aliases: [współbieżne, climb milling]
def: Frezowanie, w którym kierunek obrotu narzędzia…
see: [g40-g42]                   # slugi kart, sprawdzane przy buildzie
diagram: climb                   # opcjonalnie: id rysunku z diagrams.tsx
```

**Kotwica:** przy eksporcie (krok 4) pole `anchor` dostaje dzisiejszą kotwicę liczoną z `term`: małe litery, każdy ciąg znaków innych niż litery i cyfry → `-`. Może się więc kończyć myślnikiem, np. `3-2-obróbka-pozycjonowana-`.

Markery `[[…]]` w polach są sprawdzane tak samo jak w MDX.
