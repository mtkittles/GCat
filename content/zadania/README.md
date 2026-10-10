# content/zadania — zadania „napisz program”

> Krok 2 (szkielet): katalog jest pusty i **żadna strona go jeszcze nie czyta**. Dziś zadania są w `content/exercises.json`.

**Plik:** `<slug>.yaml`. Slug = nazwa pliku = adres zadania.
**Schemat:** `zadanieSchema` w `src/lib/mdx/schema.ts`. Pola są 1:1 z `exercises.json`.

```yaml
slug: plaszczyzna
title: Łuk w płaszczyźnie XY
level: 1                 # 1 | 2 | 3
mode: mill               # mill | lathe
brief: Wybierz płaszczyznę XY i zrób łuk.
hints: [G17 to XY.]
lessons: [F1.4]          # lekcje do powtórki przed zadaniem (link nad zadaniem)
starter: |
  G21 G90
reference: |             # wzorzec toru do sprawdzania
  G21 G90 G17 G54
  …
requireCodes: [G17]      # opcjonalnie: także forbidCodes, tolerance, maxCutLength, stock, tools
```
