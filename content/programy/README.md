# content/programy — gotowe programy

> Krok 2 (szkielet): katalog jest pusty i **żadna strona go jeszcze nie czyta**. Dziś programy są w `src/content/programy/*.ts`.

**Pliki:**
- `<slug>.mdx`: metadane we frontmatterze, opis w treści.
- `<slug>.nc`: G-kod obok, edytowany jak zwykły tekst.

Slug = nazwa pliku = adres `/programy/<slug>`.
**Schemat:** `programSchema` w `src/lib/mdx/schema.ts`.

```mdx
---
slug: plyta-przylaczeniowa
title: Płyta przyłączeniowa — 9 narzędzi
mode: mill                      # mill | lathe
dialect: fanuc                  # fanuc (domyślnie) | sinumerik
category: Płyty i korpusy
level: zaawansowany             # podstawowy | średni | zaawansowany
features: [G41, G02, G83]
stock: { x: 120, y: 80, z: 26, ox: 0, oy: 0, oz: 25 }
tools:
  1: { kind: facemill, name: Głowica Ø63, d: 63, flutes: 5 }
ops:                            # karta technologiczna; t = klucz w tools
  - { t: 1, op: Planowanie, how: "G01 dwoma przejściami, Z0" }
lesson: F7.1                    # opcjonalnie: id lekcji
src: ./plyta-przylaczeniowa.nc  # albo `generator: camForma` (program liczony w kodzie)
redirectsFrom: [stary-slug]     # stare adresy (dziś redirects.ts)
---
Pełna obróbka płyty 110 × 70 z surówki…
```

Pola `tools` i `stock` mają te same nazwy co w symulatorze. Zgodność pilnuje kompilator.
