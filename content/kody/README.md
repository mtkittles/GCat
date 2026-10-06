# content/kody — karty kodów G/M

> **Jedyne źródło prawdy dla kart** (od kroku 4). Strona karty, lista `/kody`, wyszukiwarka, dymki `[[…]]`, tabela na stronie głównej i ★ czytają te pliki (przez `npm run tresci`, które uruchamia się samo przy instalacji, `dev`, testach i buildzie). Stare `content/gcodes.json` i `src/content/articles*.ts` są nieużywane i zostaną usunięte w kroku 9.

**Plik:** `<slug>.mdx`. Slug = nazwa pliku = adres `/kody/<slug>`. Nie zmieniać.
**Schemat:** `kodSchema` w `src/lib/mdx/schema.ts`.

Pliki są w **formacie zapisu Keystatic** (panel `/keystatic`, krok 7): panel zapisuje dokładnie taki tekst, więc edycja zmienia tylko to, co zmienił redaktor. Pilnuje tego test round-trip `tests/keystatic.test.ts`. Przy edycji ręcznej trzymaj się tego formatu (inaczej pierwszy zapis w panelu przeformatuje plik):

```mdx
---
code: G17 G18 G19            # tekst wyświetlany; słowa służą też do [[G17]] i auto-linków
slug: g17-g19                # = nazwa pliku
name: Wybór płaszczyzny
order: 90                    # kolejność na listach i w nawigacji ‹ › (odstępy co 10)
group: Ustawienia
level: 2                     # 1 podstawy · 2 średni · 3 zaawansowany
modal: true
machines:
  - frezowanie
  - toczenie
star: true                   # ★ — karta opracowana w pełnym układzie
related: []                  # slugi kart, sprawdzane przy buildzie
variesBy: ''                 # '' = brak
short: 'Płaszczyzna dla łuków…'
desc: >-
  Długie teksty YAML zawija w linie do 80 znaków (>-); po wczytaniu to ten sam tekst.
syntax:
  fanuc: G17 | G18 | G19
  sinumerik: G17 | G18 | G19
sinumerik: Notka „różnice w Sinumeriku”.
params: []
pitfalls:
  - …
example:                     # osadzona symulacja: tylko dane
  src: |-
    G21 G90 G18 …
  simulate: true
  mode: lathe                # '' (auto) | mill | lathe
  dialect: ''                # '' (Fanuc) | sinumerik
  stock:                     # własny półfabrykat: discriminant: true + value: {x, y, z, ox, oy, oz}
    discriminant: false
---
Treść artykułu: \[\[G17]], \[\[funkcja modalna|modalna]], **pogrubienie**, `kod`.

<Diagram id="g17-g19" />

## Trzy płaszczyzny \{#trzy-płaszczyzny}

<Note kind="info">
  Treść ramki w osobnych liniach, wcięta o 2 spacje.
</Note>
```

**Zasady:**
- **Markery** `[[klucz]]` / `[[klucz|etykieta]]`. Przy kompilacji stają się dymkiem `Term`: szukana jest najpierw karta, potem hasło słownika. Nierozpoznany klucz = błąd builda.
  - W tekście artykułu Keystatic zapisuje je z escape'em `\[\[klucz]]` (dla Markdown `[` to znak specjalny). Kompilacja traktuje obie formy tak samo; w panelu widać zwykłe `[[klucz]]`.
  - W atrybutach komponentów (`caption`, `title`) i w polach YAML marker jest zapisany bez escape'u.
  - W tabeli `|` w markerze jest obsługiwany automatycznie.
- **Kotwice:** każdy nagłówek kończy się jawną kotwicą `\{#kotwica}` (z `\`, bo bez niego edytor MDX odrzuca plik). Kotwica: małe litery, cyfry, myślniki, unikalna w pliku. W panelu widać ją jako tekst `{#kotwica}` na końcu nagłówka — **nie zmieniać** (linki z zewnątrz; test migawki `tests/fixtures/kotwice.json`).
- **Komponenty** (panel: przycisk „+” w edytorze):
  - `<Diagram id="…" />` — rysunek z rejestru `src/components/diagrams.tsx` (lista w panelu);
  - `<Obraz src="/rysunki/<slug>/plik.png" alt="…" caption="…" />` — plik wgrany przez panel do `public/rysunki/<slug>/`; brak pliku = błąd builda;
  - `<Note kind="tip|warn|info">`, `<Code caption>`, `<Sim mode caption>`, `<Demo mode title caption>` (w `Code/Sim/Demo` dokładnie jeden blok ``` z programem), `<Widget id="rij|arc|jog" />`, `<Table caption>` wokół tabeli.
  - Wyrażenia `{…}` i `import/export` są zabronione.
- **Auto-linki:** pola `short`, `desc`, `sinumerik`, `params[].desc` i `pitfalls` linkują gołe kody G/M jak dziś (`CodeText`). Treść artykułu ich nie linkuje (jak dziś `rich()`).
- **Podgląd:** przycisk „Preview” w panelu otwiera kartę na podglądzie Vercela bieżącej gałęzi (`/api/podglad`).
