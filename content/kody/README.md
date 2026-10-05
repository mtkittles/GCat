# content/kody — karty kodów G/M

> Krok 2 (szkielet): katalog jest pusty i **żadna strona go jeszcze nie czyta**. Dziś karty są w `content/gcodes.json` i `src/content/articles*.ts`.

**Plik:** `<slug>.mdx`. Slug = nazwa pliku = adres `/kody/<slug>`. Nie zmieniać.
**Schemat:** `kodSchema` w `src/lib/mdx/schema.ts`.

```mdx
---
code: G17 G18 G19            # tekst wyświetlany; słowa służą też do [[G17]] i auto-linków
slug: g17-g19                # = nazwa pliku
name: Wybór płaszczyzny      # tytuł karty
group: Ustawienia
level: 2                     # 1 podstawy · 2 średni · 3 zaawansowany
modal: true
machines: [frezowanie, toczenie]
star: false                  # ★ (dziś CURATED w articles.ts)
related: [g02, g40-g42]      # slugi kart, sprawdzane przy buildzie
variesBy: null
short: Płaszczyzna dla łuków i kompensacji…
desc: |-
  Akapity rozdzielone pustą linią. Gołe kody G/M (G02, G41) linkują się same, jak dziś.
syntax:
  fanuc: G17 | G18 | G19
  sinumerik: G17 | G18 | G19
sinumerik: Notka „różnice w Sinumeriku”.
params: [{ key: "X Y Z", desc: "…" }]
pitfalls: ["…"]
example:                     # osadzona symulacja: tylko dane
  src: |
    G21 G90 G18 …
  mode: lathe                # opcjonalnie; także simulate, dialect, stock
---

## Trzy płaszczyzny {#trzy-plaszczyzny}

Treść artykułu: [[G17]], [[funkcja modalna|modalna]], **pogrubienie**, `kod`.

<Diagram id="g17-g19" />
```

**Zasady:**
- **Markery** `[[klucz]]` / `[[klucz|etykieta]]` zostają w pliku dosłownie.
  - Przy kompilacji stają się dymkiem `Term`. Szukana jest najpierw karta, potem hasło słownika.
  - Nierozpoznany klucz = błąd builda.
  - W tabeli `|` w markerze jest obsługiwany automatycznie.
- **Kotwice:** każdy nagłówek ma jawną kotwicę `{#kotwica}` (małe litery, cyfry, myślniki), unikalną w pliku.
- **Komponenty:** tylko `<Diagram id="…" />` (id z `src/components/diagrams.tsx`). Wyrażenia `{…}` i `import/export` są zabronione.
- **Auto-linki:** pola `short`, `desc`, `sinumerik`, `params[].desc` i `pitfalls` linkują gołe kody G/M jak dziś (`CodeText`). Treść artykułu ich nie linkuje (jak dziś `rich()`).
