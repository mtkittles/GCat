# Standard UI GCat (UI-4)

Jedno źródło prawdy dla wyglądu wszystkich działów: Programowanie CNC, Technologia, symulator, rysownik, edytor.
Wartości są w `src/design/tokens.ts` (→ `npm run tokeny`). Pilnuje go `tests/standard-ui.test.ts`.

## Kroje

| Krój | Do czego | Czego nie robi |
|---|---|---|
| **Inter** (`--font-sans`) | treść, przyciski, tytuły kart, nawigacja | — |
| **Sora** (`--font-display`) | tylko H1–H3 i hasło strony głównej | nie w kartach, tabelach ani przyciskach |
| **JetBrains Mono** (`--font-mono`) | G‑kod, adresy, liczby, etykiety wersalikami, kanwa symulatora | nie w zdaniach |

## Skala tekstu — 8 stopni

| Token | px | Użycie |
|---|---|---|
| `--fs-display` | 34–54 | tylko hasło na `/` |
| `--fs-h1` | 28–36 | H1 strony |
| `--fs-h2` | 22 | H2 sekcji |
| `--fs-h3` | 18 | H3, cel lekcji, pytanie testu |
| `--fs-text` (= `--fs-lesson`) | 16 | treść, listy, tytuły kart — także w lekcjach |
| `--fs-aux` | 14 | interfejs, podpisy, tabele, źródła |
| `--fs-small` = `--fs-code` | 13 | metadane; **bloki kodu i edytor** |
| `--fs-label` | 12 | etykiety: mono 600, wersaliki, odstęp .06em |

Wyjątki z własnym tokenem: `--fs-num` (28, mono) dla odczytów DRO i wyników kalkulatora,
`--fs-micro` (11) tylko w gęstych panelach narzędzi (rysownik, przyciski symulatora). Napisy w SVG mają własne
`--fig-text-*` (jednostki rysunku).

**Kod w zdaniu** jest o stopień mniejszy od tekstu wokół: `0,875 em`, zaokrąglone do pełnych px, min. 12 px
(16 → 14, 14 → 12). JetBrains Mono ma wyższe litery niż Inter, więc przy tym samym rozmiarze wygląda na większy.
Mono większe niż 14 px tylko dla nazw kodów jako tytułów kart (16) i odczytów (`--fs-num`).

**Reguły prozy** (`.article p/ul/ol`, lekcje, karty kodów) piszemy przez `:where(…)` i tylko dla list bez klasy —
nie mogą nadpisać komponentów osadzonych w treści (legenda i kod symulatora, tabele, żetony).

## Karty — 3 rodzaje

| Rodzaj | Tło | Ramka | Promień |
|---|---|---|---|
| **Karta** (sekcja, kafel, notatka, rysunek) | `--card` | `--line` | `--radius-lg` 14 |
| **Wnęka** (blok kodu, wiersz w karcie, pole) | `--surface` / `--bg` | `--line` | `--radius` / `--radius-sm` |
| **Uniesiona** (menu, dymek, aktywny przycisk) | `--surface-2` | `--line-strong` | `--radius` |

Pigułki (przyciski, chipy, przełączniki): `999px`. Drobne detale (kbd, znaczniki, paski) ≤ 5 px.
Dok i arkusz dolny na telefonie mają własny, współśrodkowy promień.

## Kolor

- Tło strony czarne (`--bg #000`), karty `--card`; nic barwnego jako tło karty.
- **Pomarańcz** (`--accent`) tylko: główne CTA, stan aktywny, znacznik bieżącego miejsca, cel lekcji (ramka).
- **Kolory ruchu** tylko dla toru i kodu: G00 `#F59E0B`, G01 `#22C55E`, G02/G03 `#38BDF8`.
- **Znaczenie** (zielony/czerwony/niebieski) tylko w etykiecie i ramce notatki („Wskazówka”, „Uwaga”,
  „Warto wiedzieć”) oraz w wyniku sprawdzenia — nie jako wypełnienie.
- Chipy tematów (poziom, frezowanie/toczenie) neutralne; barwny tylko chip stanu (`szkic — do weryfikacji`,
  `zależy od…`) i `Pro`.

## Telefon

Treść przewija się do samego dołu ekranu, pod dokiem i paskiem przeglądarki. Zamiast pełnego pasa jest
łagodne wygaszenie: na dole gradient do `--bg` (wysokość doku + 32 px), pod paskiem górnym 20 px.
Symulator i panel klawiszy go nie mają.

## Kontrola

- `tests/standard-ui.test.ts` — rozmiary tylko z `--fs-*`, promienie z tokenów, kanwa przez `--font-mono`.
- Pomiar na żywo (17 stron): przed UI-4 31 par krój+rozmiar i 19 rodzajów kart; po UI-4 patrz PR.
