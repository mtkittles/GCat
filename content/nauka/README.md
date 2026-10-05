# content/nauka — lekcje

> Krok 2 (szkielet): katalog jest pusty i **żadna strona go jeszcze nie czyta**. Dziś lekcje są w `src/content/nauka/*.ts`.

**Układ:**
```
nauka/
  frezowanie/<slug>/index.mdx        # F0–F7
  frezowanie/<slug>/cwiczenia.yaml
  toczenie/<slug>/index.mdx          # T0–T8
  toczenie/<slug>/cwiczenia.yaml
```
Slug = nazwa katalogu = adres `/nauka/<tor>/<slug>`. Nie zmieniać.
**Schematy:** `lekcjaSchema` i `cwiczeniaSchema` w `src/lib/mdx/schema.ts`.

**`index.mdx`:** metadane we frontmatterze, teoria w treści.
```mdx
---
id: F3.2                       # F… frezowanie, T… toczenie
slug: f3-2-g01-interpolacja-liniowa
title: G01 — interpolacja liniowa
minutes: 14
goal: Zaprogramujesz wejście w materiał…
codes: [g01, g00]              # opcjonalnie: powiązane karty
controllers: { rows: [["Ruch liniowy", "G01 X_ Y_ F_", "G1 X_ Y_ F_"]], note: "…" }
pitfalls: [{ title: "…", x: "…", fig: f3-2-wejscie }]
summary: ["…"]
sources: [{ id: fanuc-om, where: "rozdz. 4.2" }]
---

## Ruch po prostej z posuwem {#g01}

Teoria: [[G01]], <Diagram id="g01" />…
```

**`cwiczenia.yaml`:** przykład rozwiązany, „spróbuj sam”, test (`worked`, `practice`, `quiz`).
- To dane strukturalne, bez MDX. Szablony luk `X{0} Y{1}` byłyby dla MDX wyrażeniem JS.
- Typy pytań i ćwiczeń są takie same jak w `src/lib/lesson.ts`. Zgodność pilnuje kompilator.

Nagłówki muszą mieć jawne `{#kotwica}`. Markery `[[…]]` w polach YAML są sprawdzane przy buildzie.
