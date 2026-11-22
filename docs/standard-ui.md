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

**Karta z podglądem** (strona główna, w duchu Framera; `components/pulpit/Shots.tsx`): na górze uproszczona makieta
ekranu serwisu (lekcja, symulator, kalkulator) na wnęce, wygaszona maską w dół i w prawo; pod nią tytuł Inter 500
18 px, opis 16 px wyciszony i odnośnik „… →”. Bez ramki ikony i numeru; ikony w makietach cienkie (lucide 1,5).

**Karty list (UI-7)** — ten sam układ na listach programów, zadań, artykułów Technologii: karta z wewnętrznym
odstępem 8 px, podgląd na wnęce (`calc(--radius-lg − 4px)`, linia wewnętrzna zamiast ramki dolnej), pod nim meta
(wyciszona), tytuł Inter 500 18 px, opis wyciszony, akcje lub „Czytaj →”. Bez plakietek z numerem („01 CNC”, „T03”)
i diod stanu na kartach i w panelu bocznym. Rysunki detali (`ProgramPreview`) w szarościach: jasna krawędź obróbki,
punkt W bez pomarańczu (`--pp-cut`, `--pp-w`); kolory ruchu tylko dla toru i kodu. Na liście z wieloma kartami
żadna akcja karty nie jest pomarańczowa (`btn ghost`).

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

## Szkielet podstrony (UI-6)

Każda podstrona zaczyna się od `components/ui/PageHead.tsx`:

- okruszki (gdy strona jest głębiej niż jeden poziom),
- **tytuł** Sora 600 `--fs-h1`, **liczba** szarym tekstem przy tytule („55 kart”), bez pigułki,
- **opis** 16 px wyciszony (`--muted`), najwyżej ~62 znaki w wierszu,
- opcjonalnie `aside` (postęp, wybór talii) po prawej na komputerze, pod opisem na telefonie, i `icon` (ikona działu).

Nad tytułem nie ma napisów wersalikami ani zdjęć. Etykiety grup na listach („Ruch 3”, „Płyty i korpusy 9”) i etykiety
kart („Detal przewodni”) są zdaniem: Inter 500–600, 13–14 px. Wersaliki mono zostają tylko w nagłówkach tabel,
etykietach składni (FANUC / SINUMERIK w bloku kodu), odczytach DRO i makietach.

**Sterowanie list:**

| Element | Wygląd |
|---|---|
| Pole szukania | pigułka 44 px, tło `--surface`, ikona 17 px, fokus = `--line-strong` (bez pomarańczowej poświaty) |
| Przełącznik (2–4 opcje) | `TactileSegmentedControl`, bez diod (dioda tylko `led: true` w trybach symulatora) |
| Filtry (wiele opcji) | `.pill-f`; wybrany = `--surface-2` + `--line-strong`, nie pomarańcz |
| Przycisk | `.btn` 40 px, 14 px, pigułka; pomarańczowy tylko główne działanie strony |

**Pomarańcz na listach:** główny przycisk („Zacznij”), stan aktywny i znacznik „tu jesteś” (dioda przy następnej
lekcji, wskazana karta słownika). Numery lekcji, litery słownika, skróty, gwiazdki, rodzaje wyników — neutralnie.

## Strony robocze (UI-8)

Lekcja, karta kodu, artykuł Technologii, kalkulator, zadanie, program i symulator.

- **Ramki z treścią** (cel lekcji, dane przykładu, wynik kroku, typowe błędy, notatki, zadanie w lekcji) — tło karty;
  kolor znaczenia tylko w ramce i etykiecie (zielony wynik, czerwone „Groźne”, „Uwaga”). Cel lekcji: ramka `--line-strong`.
- **Numery sekcji lekcji** i kroków zadania — neutralny kwadrat/kółko (`--surface-2`), nie pomarańcz.
- **Nagłówki H2** w karcie kodu i artykule — bez pomarańczowej kreski; „tu jesteś” w spisie treści zostaje.
- **Etykiety** („Cel lekcji”, „Dane przykładu”, „Co zrobić”, „Stan sterowania”, wyniki kalkulatora) — zdaniem, Inter.
- **Akcje:** pomarańczowa jedna — „Następna lekcja”, „Sprawdź”, „Sprawdź program”, „Otwórz w symulatorze”;
  „Oznacz jako przeczytaną” — `btn ghost`. Odnośniki w tekście i źródła — kolor tekstu z podkreśleniem.
- **Chipy** poziomu i obróbki neutralne; kody wymagane w zadaniu w kolorze ruchu (`motionClass`).
- **Tabela danych** `.tbl` — jak tabela kodów; na telefonie przewijana w bok.
- **Rysunki i symulator** zachowują własną semantykę barw (narzędzie, nowy fragment programu, kolory ruchu).

## Telefon

Strona główna: po otwarciu widać hasło, przyciski (40 px) i rysunek toru w oknie programu. Pasek okna to jeden
wiersz (detale + odtwarzanie); bez przełącznika Fanuc/Sinumerik — zapis Sinumerik należy do nauki.

Treść przewija się do samego dołu ekranu, pod dokiem i paskiem przeglądarki. Zamiast pełnego pasa jest
łagodne wygaszenie: pod paskiem górnym 20 px; na dole gradient do `--bg` (wysokość doku + 32 px) — poza iOS.
Na iPhonie dół wygasza sam Safari 26; element stały nie rysuje się pod jego paskiem, więc nasz gradient
zostawiałby tam jaśniejszy pas.
Symulator i panel klawiszy go nie mają.

Dok ma 86% szerokości ekranu (najwyżej 420 px). Safari 26 maluje pod swoim paskiem jednolity pas, gdy przy
krawędzi stoi stały element szerszy niż 90% widoku (WebKit `LocalFrameView::fixedContainerEdges`); węższy dok
jest pomijany. Nie poszerzaj doku ani nie dodawaj pełnej szerokości stałych pasków przy dolnej krawędzi.

## Kontrola

- `tests/standard-ui.test.ts` — rozmiary tylko z `--fs-*`, promienie z tokenów, kanwa przez `--font-mono`.
- Pomiar na żywo (17 stron): przed UI-4 31 par krój+rozmiar i 19 rodzajów kart; po UI-4 patrz PR.
