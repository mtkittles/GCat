# Raport: treści GCat, przeniesienie do MDX + Keystatic i wspólne tokeny stylu

Sprint 7a, gałąź `sprint-7a/rozpoznanie-tresci` (od `main` @ `a879fa4`). **Tylko analiza.** Jedyna zmiana w repo to ten plik.

Liczby w raporcie są policzone skryptami na aktualnym `main`, nie oszacowane.

**Granice („nie ruszać”):**
- `/symulator`, parser, silnik ubytku, rendering 2D/3D;
- osadzone symulacje (`sim`, `demo`) i programy demo;
- współdzielone komponenty i `globals.css`.

Migracja dotyczy wyłącznie **źródeł treści** i sposobu ich wczytywania. Komponenty, które dziś renderują treść, zostają. Zmienia się tylko to, skąd dostają dane.

---

## 1. Gdzie i w jakim formacie są dziś treści

### 1.1 Zestawienie

| Typ treści | Plik(i) źródłowe | Format | Liczba | Trasa |
|---|---|---|---|---|
| Karty kodów G/M (dane) | `content/gcodes.json`, typ `GCode` w `src/lib/gcodes.ts` | JSON (93 kB) | **56 kart** | `/kody/[slug]` |
| Artykuły kart (rozszerzona treść) | `src/content/articles*.ts` (11 plików), typ `Block` w `src/lib/article.ts` | TS: tablice obiektów `Block` | **27 kart ma artykuł**, 29 nie ma | w `/kody/[slug]` |
| Karty ★ (opracowane) | `CURATED` w `src/content/articles.ts:18` | TS: `Set` slugów, **osobno od danych karty** | **12** | znaczek w `RefTables.tsx`, `kody/CodeTable.tsx` |
| Tabela kodów na stronie głównej | `content/reference.json` | JSON (krotki `[kod, nazwa, slug, frez, tok]`) | G i M | `/`, `/kody` |
| Lekcje F0–F7, T0–T8 | `src/content/nauka/*.ts` (51 plików + `buildup.ts`, `sources.ts`, `start7.ts`, `t3-common.ts`), typ `LessonDoc` w `src/lib/lesson.ts` | TS: obiekt na lekcję | **51 lekcji** (F: 29 w 8 modułach, T: 22 w 9 modułach), 677 min | `/nauka/{frezowanie,toczenie}/[slug]` |
| Plan kursu (moduły, kolejność) | `src/lib/course.ts` | TS: importy 51 modułów + tablice modułów | 17 modułów | `/nauka`, karty ścieżek |
| Słownik | `content/glossary.json` | JSON `{term, aliases[], def, see[]}` | **77 haseł** | `/slownik#…`, dymki `[[…]]` |
| Zadania | `content/exercises.json` | JSON (starter, wzorzec, tolerancje, stock, tools) | **16** | `/zadania/[slug]` |
| Gotowe programy | `src/content/programy/index.ts`, `detale.ts`, `cam.ts` (generatory), `redirects.ts`, typ `LibProgram` w `src/lib/programLibrary.ts` | TS: obiekty + G-kod w template literals; 2 programy CAM **generowane funkcją** | **22** (+13 przekierowań) | `/programy`, `/programy/[slug]`, symulator |
| „Narzędzia” | brak osobnego działu; patrz 1.5 | — | — | — |
| Teksty stron (strona główna, `/nauka/start`, prawne) | `src/app/**/page.tsx`, `src/lib/legal.ts`, `src/content/nauka/start7.ts` | JSX inline / TS | — | — |

### 1.2 Karty kodów (`GCode`)

**Pola stałe:**
- `code`, `slug`, `name`, `group`, `modal`, `milling`, `turning`, `level` (1–3);
- `short`, `desc` (akapity rozdzielone `\n\n`);
- `syntax.{fanuc,sinumerik}`, `params[] {key, desc}`;
- `example` (G-kod do osadzonej symulacji), `sinumerik` (notka), `pitfalls[]`.

**Pola opcjonalne (liczba kart):**

| Pole | Kart |
|---|---|
| `related[]` | 39 |
| `simulate: false` | 20 |
| `variesBy` | 6 |
| `exampleStock` | 5 |
| `exampleMode` | 2 |
| `exampleDialect` | 2 |

**Fanuc i Sinumerik w karcie:**
- `syntax.fanuc` i `syntax.sinumerik` to jednowierszowa składnia;
- `sinumerik` to tekst z różnicami;
- tabele porównawcze są w artykule (blok `table`).

**Artykuł karty (`Block[]`):**

| Typ bloku | Liczba |
|---|---|
| `h` | 159 |
| `p` | 116 |
| `note` | 49 |
| `table` | 48 |
| `ul` | 44 |
| `code` | 35 |
| `diagram` | 26 |
| `sim` | 20 |
| `demo` | 16 |
| `ol` | 4 |
| `widget` | 2 |

**Karty bez artykułu (29):** g09-g61-g64, g10, g15-g16, g22-g23, g27-g30, g31, g34, g50, g65-g67, g72, g73, g74, g75, g76-g89, g82, g90-g94-t, g93, g98-g99, m00-m01, m06, m19, m29, m41-m44, m48-m49, osie-abc, g68-2-g53-1, g43-4, cycle800, traori.

**★:** zbiór `CURATED` = g00, g01, g02, g03, g04, g40-g42, g43-g49, g54-g59, g90-g91, g17-g19, g20-g21, g94-g95.
- Znaczek rysują `src/components/RefTables.tsx:10` i `src/app/kody/CodeTable.tsx:65` (`title="Karta opracowana w pełnym układzie…"`).
- Filtr „★ Opracowane (12)” jest w `CodeTable.tsx:37,48`.
- ★ nie jest polem karty, więc w migracji staje się polem frontmatter `star: true` (sekcja 5).

### 1.3 Lekcje (`LessonDoc`)

Szablon jest stały. Kolejność sekcji: cel → teoria → przykład rozwiązany → spróbuj sam → typowe błędy → Fanuc/Sinumerik → sprawdź się → program detalu → podsumowanie → źródła (`src/components/lesson/LessonView.tsx`).

| Pole | Zawartość | Skala |
|---|---|---|
| `id`, `slug`, `title`, `minutes`, `goal` | metadane | 51 |
| `theory: Block[]` | `h` | 168 (**wszystkie z jawnym `id`**) |
| | `p` | 180 |
| | `diagram` | 85 |
| | `code` | 46 |
| | `note` | 40 |
| | `table` | 33 |
| | `ul` | 26 |
| | `demo` | 7 |
| | `widget` | 2 |
| `worked` | tytuł, wstęp, `fig?`, kroki `{x, code?}`, wynik | 51 |
| `practice: Practice[]` | `drill` | 46 |
| | `task` (edytor + sprawdzanie toru) | 40 |
| | `lathejog` | 3 |
| | `offset` | 2 |
| | `jog`, `points`, `state`, `css` | po 1 |
| `pitfalls[]` | `{title, x, fig?}` | — |
| `controllers` | `rows: [opis, Fanuc, Sinumerik][]`, `note?` | **51 / 51 lekcji** |
| `quiz: Question[]` | 6 rodzajów: `choice`, `gap`, `bughunt`, `point`, `token`, `order` | 320 pytań |
| `summary[]`, `sources[]` | tekst / odnośniki do `sources.ts` | — |

**Wniosek:** lekcja to w ~40% proza (teoria, błędy, podsumowanie), a w ~60% dane strukturalne (pytania z odpowiedziami, zadania z `checks`, wzorce G-kodu). Tylko prozę warto przenosić do treści MDX. Dane strukturalne powinny trafić do pól (YAML), patrz sekcja 5.

### 1.4 Gotowe programy (`LibProgram`)

**Pola:**
- `slug`, `title`, `mode`, `dialect?`, `category`, `level`, `summary`, `features[]`;
- `stock?`, `tools {T: {kind, name, d, …}}`, `ops[] {t, op, how}` (karta technologiczna, dodana w PR #19);
- `lesson?` (link wyliczany z `course.ts`), `src` (G-kod).

**Pliki:**
- `index.ts` zawiera 16 programów inline i importuje 6 z `detale.ts`;
- `cam.ts` generuje G-kod formy i kopuły (7029 i 2801 bloków) funkcjami. Tych **nie da się** sensownie edytować w CMS i zostają w TS.

### 1.5 „Narzędzia”: co to jest w tym repo

W serwisie nie ma działu „Narzędzia” (menu: Nauka, Zadania, Kody, Symulator, Programy, Kalkulator, Słownik, Fiszki). Są trzy kandydatki:
1. **Tabele narzędzi programów** (`LibProgram.tools`) — przenoszone razem z programami.
2. **Dane kalkulatora:** `src/lib/machining.ts` (`MATERIALS` — 16 materiałów z zakresami Vc/fz/f/kc i notkami, `TOOL_MATERIAL`, `GROUPS`). To dobry kandydat na kolekcję danych (YAML).
3. **Model narzędzi symulatora:** `src/components/simulator/setup.ts` (`ToolKind`, `TOOL_LABEL`, `TOOL_FIELDS`). To część silnika (**nie ruszać**).

Propozycja: „Narzędzia” = kolekcja `materialy` (pkt 2) plus opcjonalny katalog narzędzi do opisu. Do potwierdzenia przez Ciebie.

---

## 2. Linki `[[…]]` i dymki: co musi zostać 1:1

### 2.1 Jak to działa dziś

- **Składnia:** `[[klucz]]` albo `[[klucz|etykieta]]`, a także `**pogrubienie**` i `` `kod` ``.
- **Parser:** jedna funkcja `rich()` w `src/components/Rich.tsx` z regexem:
  `/\*\*([^*]+)\*\*|`([^`]+)`|\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g`.
  Wywołują ją `Article.tsx`, `LessonView.tsx`, `Quiz.tsx` i `fiszki/Flashcards.tsx`.
- **Dymek:** `src/components/ui/Term.tsx` (klient). `lookup(klucz)` szuka w tej kolejności:
  1. **karta kodu:** `code` równe kluczowi, albo klucz jest jednym ze słów pola `code` (np. „G41” w „G40 G41 G42”), albo slug = klucz ze spacjami zamienionymi na `-`; dymek prowadzi do `/kody/{slug}`;
  2. **hasło słownika:** `term` równe kluczowi, albo `term` zaczyna się od „klucz ”, albo jeden z `aliases`; dymek prowadzi do `/slownik#{slug(term)}`, gdzie slug to `term.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-")`.

  Nierozpoznany klucz renderuje sam tekst, bez błędu. To ryzyko cichej regresji: dziś wszystkie klucze się rozwiązują, a po literówce przestałyby bez żadnego sygnału.
- **Automatyczne linki w kartach:** `src/components/CodeText.tsx` zamienia **każdy** goły kod G/M (`/\b([GM]\d{1,3}(?:\.\d)?)\b/`), który ma kartę, w `Term`. Kody bieżącej karty (`self`) tylko wyróżnia. Dotyczy pól `short`, `desc`, `params[].desc`, `sinumerik`, `pitfalls` (bez markerów w źródle). To zachowanie też musi zostać.

### 2.2 Skala (policzone na polach tekstowych)

| Źródło | Markerów `[[…]]` |
|---|---|
| lekcje | 72 |
| artykuły kart | 59 |
| karty (JSON) | 1 (`g90-g91`) |
| słownik, zadania, programy | 0 |
| **razem** | **132** (19 z etykietą `\|`) |

- **Unikalne klucze:** 68 — 45 rozwiązuje się do karty, 23 do hasła, **0 nierozwiązanych**.
- Przykłady z etykietą: `[[funkcja modalna|modalne]]`, `[[vc|prędkość skrawania vc]]`, `[[G90 G92 G94 (tokarka)|proste cykle tokarskie]]`.

### 2.3 Wymogi dla migracji (1:1)

1. **Markery zostają literalnie w plikach MDX** (`[[G17]]`, `[[hasło|etykieta]]`). Zamianę na `<Term>` robi **plugin remark** przy kompilacji, z tym samym regexem i tą samą kolejnością wyszukiwania co `lookup`. Autor nie pisze JSX.
2. **Test regresji:** skrypt liczy markery w starych źródłach i w MDX (132 / 68 kluczy), a build kończy się błędem przy nierozwiązanym kluczu. To nowa ochrona, której dziś nie ma.
3. **Edytor Keystatic nie może ucieczkować nawiasów.** Edytor MDX zapisuje Markdown, a `[` i `]` bywają escapowane przy serializacji (`\[\[G17\]\]`). Wymagany test round-trip (zapis w panelu → diff pliku) przed migracją masową. Plugin remark powinien dodatkowo akceptować postać z backslashami.
4. **Slugi bez zmian:** 56 slugów kart, 51 slugów lekcji (`doc.slug`), 22 programów + 13 przekierowań (`redirects.ts`), 16 zadań, kotwice słownika (wyliczane z `term`, więc **zmiana pisowni hasła zmienia kotwicę**).
5. **Kotwice nagłówków:**
   - lekcje mają 168/168 jawnych `id`;
   - **artykuły kart mają tylko 2 jawne `id` na 159 nagłówków**, pozostałe 157 kotwic powstaje z tekstu (`slugify` w `Article.tsx:10`), więc poprawka literówki w nagłówku zmienia adres `#…`.

   Migracja zapisuje **każdą wyliczoną dziś kotwicę jawnie** (`## Tekst {#kotwica}` przez plugin `remark-heading-id` albo komponent `<H id>`).
6. **`CodeText` (auto-linki G/M w kartach)** zostaje w komponencie karty. Pola karty w MDX dalej idą przez `CodeText`, nie przez `rich()`.
7. **Klamry `{…}` w szablonach luk** (117 tekstów lekcji, np. `X{0} Y{1}`) są dla MDX wyrażeniem JS i zepsułyby kompilację. Dlatego pytania i zadania **nie mogą trafić do treści MDX**, tylko do pól (YAML). W prozie kart, artykułów i teorii nie ma `{`, `}` ani `<`. Są pojedyncze `>` (10 tekstów), MDX je toleruje, ale test kompilacji je obejmie.

---

## 3. Grafiki: gdzie są i jak są osadzane

### 3.1 Rysunki techniczne (wektor, kod)

- **Wspólna rama:** `src/components/fig.tsx`.
  - `Fig` daje nagłówek, `viewBox` 360 × 250, markery strzałek, kreskowanie i legendę.
  - `mapper()` przelicza mm na jednostki SVG.
  - **Styl jest w CSS** (`globals.css:1444–1504`, klasy `.fig .p-rap/.p-cut/.p-arc/.p-con/.p-dim/…`). W komponentach jest tylko geometria.
- **Rejestr:** `src/components/diagrams.tsx` — **117 rysunków** (`Record<id, () => ReactNode>`). Składa się z:
  - `figs.tsx` (361 linii), `figs2.tsx` (622);
  - `lesson/figs-f0…f7.tsx`, `lesson/figs-t0…t8.tsx`, `lesson/figs-audit.tsx` (razem 3818 linii JSX/SVG).
- **Osadzanie:**
  - blok `{ t: "diagram", id }` w artykułach (26 bloków, 25 id) i w teorii lekcji (85);
  - `fig` w `worked`, `pitfalls` i pytaniach — przekazywane do `Quiz` jako `figs`.
- **Inne generowane obrazy (symulator, nie ruszać):**
  - miniatury programów w `ProgramPreview.tsx` (PNG z mapy wysokości lub `isoRender`);
  - kanwy 2D/3D symulatora;
  - `src/app/opengraph-image.tsx` (OG 1200×630).

### 3.2 Pliki rastrowe i SVG w `public/` (6,1 MB)

| Ścieżka | Zawartość | Użycie |
|---|---|---|
| `public/img/banner-{mill,turn,drill,thread,tasks,simulator}.jpg`, `hero-cnc.jpg` | zdjęcia banerów (z wtopionym napisem) | `gcodes.ts → bannerFor()`, `course.ts → banner` |
| `public/img/clean/banner-*.jpg` (6) | te same bez napisu | `PageBanner.tsx:26`, `TrackPicker.tsx:17` (zamiana ścieżki w kodzie) |
| `public/brand/*` (35) | logo, znak, banery hero w PNG/SVG, jasne i ciemne | `BrandLogo.tsx:28` (`gcat-znak-{theme}.svg`, `gcat-poziomy-{theme}.svg`) |
| `public/icon-*.png` | ikony PWA | `manifest.ts` |

**Wniosek dla migracji:** rysunki to kod React, nie pliki. W MDX osadza się je komponentem `<Diagram id="g01-tor" />` (117 id w rejestrze). Keystatic dostaje pole wyboru z listą id generowaną z rejestru. Nowe zdjęcia z CMS mają trafiać do `public/content/<kolekcja>/<slug>/` (pole `fields.image` z `directory`).

---

## 4. Kolory, fonty, grubości linii + jeden plik tokenów

### 4.1 Inwentarz kolorów (wartości literalne: hex, `0x…`, `rgb(a)`)

Razem **217 unikalnych wartości, 501 wystąpień**.

| Plik | Wystąpień | Unikalnych | Uwagi |
|---|---|---|---|
| `src/app/globals.css` | 369 | 158 | zmienne motywu (`:root`, `[data-theme=dark]`), `@theme inline`, ~120 wartości wpisanych wprost w reguły (głównie `rgba(148,163,184,.x)`, `#FFF`, `#CBD5E1`) |
| `src/components/simulator/Simulator.tsx` | 46 | 40 | `COLORS` (tor: rapid `#F59E0B`, linear `#22C55E`, arc `#38BDF8`, dwell `#F97316`), siatka, HUD — **nie ruszać** |
| `src/components/simulator/Sim3D.tsx` | 37 | 23 | materiały three.js (`0x8a94a3`, tło `0x12161c`, tor) — **nie ruszać** |
| `src/components/simulator/unrolled.ts` | 14 | 13 | rozwinięcie walca — nie ruszać |
| `src/components/ui/TechGrid.tsx` | 9 | 2 | siatka tła |
| `src/app/opengraph-image.tsx` | 7 | 6 | OG |
| `src/components/ProgramPreview.tsx` | 5 | 5 | miniatury — nie ruszać |
| `simulator/exportPath.ts`, `simulator/measure2d.ts` | 4 + 4 | — | eksport SVG, wymiary `#FACC15` — nie ruszać |
| `manifest.ts`, `layout.tsx`, `Tagline.tsx`, `figs2.tsx` | 2 / 2 / 1 / 1 | — | `theme_color`, `themeColor` |

**Paleta zdefiniowana w `globals.css`:**

| Grupa | Zmienne |
|---|---|
| Marka | `--brand-ink #0F172A`, `--brand-accent #F97316` |
| Jasny motyw | `--bg #F8FAFC`, `--surface #FFF`, `--surface-2 #F1F5F9`, `--surface-3 #E9EEF5`, `--card #FFF`, `--ink #0F172A`, `--ink-2 #475569`, `--muted #64748B`, `--line #E2E8F0`, `--line-strong #CBD5E1`, `--panel #0F172A`, `--panel-ink #F8FAFC` |
| Ciemny motyw | `--bg #111214`, `--surface #17181B`, `--surface-2 #202125`, `--surface-3 #292A2F`, `--card #1A1B1F`, `--ink #F5F5F4`, `--ink-2 #C8C9CC`, `--muted #8B8D93`, `--line #2A2B30`, `--line-strong #3A3B41`, `--panel #141518` |
| Akcent | `--accent #F97316`, `--accent-hover #EA580C` (jasny) / `#FB923C` (ciemny), `--accent-soft #FFF7ED` / `#2B1C12` |
| Znaczenie | `--green #22C55E`, `--amber #F59E0B`, `--red #EF4444`, `--blue #38BDF8` |
| Składnia edytora | `--cm-*` × 11, osobno dla motywów |

**Kolory z ustalonym znaczeniem** (opisane w `fig.tsx`, zgodne z symulatorem):

| Element | Kolor | Linia |
|---|---|---|
| G00 | bursztyn `#F59E0B` | przerywana |
| G01 | zielony `#22C55E` | ciągła |
| G02/G03 | błękit `#38BDF8` | ciągła |
| kontur | `--ink` | ciągła |
| wymiar | `--ink-2` | ciągła |
| parametr | akcent `#F97316` | ciągła |
| błąd | czerwony `#EF4444` | przerywana |
| wymiary w symulatorze | `#FACC15` | ciągła |

**Niespójności (do decyzji, nie do poprawiania teraz):**
- Kolory toru są zapisane **trzy razy**: CSS `--amber/--green/--blue`, `Simulator.tsx COLORS`, `Sim3D.tsx`.
- Szarości `rgba(148,163,184,·)` (= slate-400) występują z ~15 różnymi alfami.
- `#FFF` i `#FFFFFF` występują obok siebie.

### 4.2 Fonty

| Rola | Krój | Wagi | Źródło |
|---|---|---|---|
| interfejs i tekst | Inter | 400, 500, 600 | `next/font/google` w `layout.tsx:12`, zmienna `--font-inter`, Tailwind `--font-sans` |
| nagłówki | Sora | 600, 700, 800 | `layout.tsx:13`, `--font-sora`, `--font-display` |
| G-kod | JetBrains Mono | 400, 500, 700 | `layout.tsx:14`, `--font-jetbrains`, `--font-mono` |
| kanwa symulatora | `ui-monospace, monospace` | — | `Simulator.tsx` (font systemowy, **nie JetBrains**), `measure2d.ts` |

**Rozmiary tekstu w rysunkach** (`globals.css:1448–1454`):

| Klasa | Rozmiar |
|---|---|
| bazowy | 11 px |
| `.t-mono` | 10,5 px |
| `.t-big` | 14 px |
| `.t-sm` | 9,5 px |
| `.t-ax` | 11,5 px |
| `.t-tick` | 8,5 px |

Halo tekstu: `stroke-width 3.2px` (tick 2.4px).

### 4.3 Grubości linii i kreskowanie

**Rysunki** (`globals.css:1462–1504`, jednostki viewBox 360):

| Klasa | Grubość | Kreskowanie |
|---|---|---|
| `.gr-min` (siatka) | 0.5 | — |
| `.gr-maj` (siatka) | 0.7 | — |
| `.ax` | 1.2 | — |
| `.axis-c` | 1.0 | `10 3 2 3` |
| `.p-rap` | 1.8 | `6 4` |
| `.p-cut`, `.p-arc` | 2.0 | — |
| `.p-con`, `.p-acc` | 1.6 | — |
| `.p-bad` | 1.6 | `5 4` |
| `.p-dim` | 0.9 | — |
| `.p-ext` | 0.6 | — |
| `.p-cons` | 0.9 | `3 3` |
| `.thick` | 2.8 | — |
| `.dashed` | — | `7 4` |
| `.hatch-line` | 1.2 | wzór co 6 |
| `.pt*` (punkty, obrys) | 1.5 | — |
| `.tool` | 1.0 | `3 2` |
| `.stock-out` | 1.0 | `4 3` |
| `.hole-top` | 1.6 | — |
| `.hole`, `.solid-hatch` | 1.2 | — |
| legenda (`border-top`) | 2.5 | — |

**Symulator (nie ruszać):** kanwa `lineWidth` 1–2.6 (tor 1.8 / pogrubiony 2.6, szybki 1–1.4), wymiary 1.4. W SVG ikon UI `strokeWidth` 2 (20 razy), 2.2, 1.5.

### 4.4 Propozycja: jeden plik tokenów

**Zasada:** jedno źródło prawdy w TS, z którego powstaje CSS. Na etapie 1 **nic nie zmienia się w `globals.css`**. Plik tokenów powstaje obok z identycznymi wartościami, a test sprawdza zgodność z `globals.css`. Przepięcie `globals.css` na tokeny to osobny, świadomy krok (sekcja 7, krok 7).

`src/design/tokens.ts`:
```ts
export const color = {
  brand: { ink: "#0F172A", accent: "#F97316" },
  light: { bg: "#F8FAFC", surface: "#FFFFFF", surface2: "#F1F5F9", surface3: "#E9EEF5", card: "#FFFFFF",
           ink: "#0F172A", ink2: "#475569", muted: "#64748B", line: "#E2E8F0", lineStrong: "#CBD5E1",
           panel: "#0F172A", panelInk: "#F8FAFC", accentHover: "#EA580C", accentSoft: "#FFF7ED" },
  dark:  { bg: "#111214", surface: "#17181B", surface2: "#202125", surface3: "#292A2F", card: "#1A1B1F",
           ink: "#F5F5F4", ink2: "#C8C9CC", muted: "#8B8D93", line: "#2A2B30", lineStrong: "#3A3B41",
           panel: "#141518", panelInk: "#F5F5F4", accentHover: "#FB923C", accentSoft: "#2B1C12" },
  // znaczenie stałe w obu motywach — rysunki, symulator, legenda
  sem:   { accent: "#F97316", green: "#22C55E", amber: "#F59E0B", red: "#EF4444", blue: "#38BDF8", measure: "#FACC15" },
  path:  { rapid: "#F59E0B", cut: "#22C55E", arc: "#38BDF8", dwell: "#F97316", tool: "#FFFFFF" },
  slate400: "148 163 184",           // baza szarości rgba(…, α) — alfy jako tokeny niżej
} as const;

export const alpha = { grid: 0.06, faint: 0.1, soft: 0.18, line: 0.22, mid: 0.3, strong: 0.45 } as const;

export const font = {
  sans: { family: "Inter", weights: [400, 500, 600] },
  display: { family: "Sora", weights: [600, 700, 800] },
  mono: { family: "JetBrains Mono", weights: [400, 500, 700] },
  fig: { base: 11, mono: 10.5, big: 14, sm: 9.5, axis: 11.5, tick: 8.5, halo: 3.2, haloTick: 2.4 },
} as const;

export const stroke = {         // jednostki viewBox rysunku (szer. 360)
  gridMinor: 0.5, gridMajor: 0.7, axis: 1.2, axisCenter: 1,
  rapid: 1.8, cut: 2, arc: 2, contour: 1.6, accent: 1.6, bad: 1.6,
  dim: 0.9, ext: 0.6, cons: 0.9, thick: 2.8, hatch: 1.2, point: 1.5, tool: 1, hole: 1.2, holeTop: 1.6,
  icon: 2,                       // ikony UI (SVG 24×24)
} as const;

export const dash = { rapid: "6 4", bad: "5 4", cons: "3 3", axisCenter: "10 3 2 3", dashed: "7 4", tool: "3 2", stockOut: "4 3" } as const;
export const radius = { sm: 8, md: 10, lg: 14, fig: 16 } as const;
```

`src/design/tokens.css` (generowany z TS skryptem `scripts/tokens-css.ts` albo pisany ręcznie i sprawdzany testem; Tailwind v4):
```css
@theme {
  --color-path-rapid: #F59E0B;  --color-path-cut: #22C55E;  --color-path-arc: #38BDF8;
  --color-measure: #FACC15;
  --font-weight-display: 700;
  --stroke-rapid: 1.8;  --stroke-cut: 2;  --stroke-contour: 1.6;  --stroke-dim: .9;
  --dash-rapid: 6 4;    --dash-bad: 5 4;  --dash-cons: 3 3;
}
:root {                       /* motyw jasny — te same nazwy co dziś w globals.css */
  --bg: #F8FAFC; --surface: #FFFFFF; /* … */ --accent: #F97316;
}
[data-theme="dark"] { --bg: #111214; /* … */ }
```

Nazwy zmiennych motywu zostają **dokładnie takie jak dziś** (`--bg`, `--ink`, `--accent`…), więc przepięcie nie dotyka żadnego komponentu. Nowe są tylko `--color-path-*`, `--stroke-*` i `--dash-*`. Symulator może je kiedyś czytać z `tokens.ts` (import TS), ale to poza zakresem i wymaga Twojej zgody.

---

## 5. Proponowana struktura `content/`

### 5.1 Drzewo

```
content/
  karty/<slug>.mdx                    # 56 — frontmatter = dane karty, treść = artykuł (dziś articles*.ts)
  nauka/
    frezowanie/_tor.yaml               # moduły F0–F7: id, tytuł, kolejność lekcji (dziś course.ts)
    frezowanie/<slug>/index.mdx        # 29 — metadane + teoria, błędy, podsumowanie (proza)
    frezowanie/<slug>/cwiczenia.yaml   #      przykład rozwiązany, „spróbuj sam”, test (dane strukturalne)
    toczenie/… (22, jak wyżej)
  slownik/<slug>.yaml                  # 77 (albo jeden slownik.yaml — patrz uwagi)
  programy/<slug>.mdx                  # 22 — frontmatter (narzędzia, karta technologiczna), opis w treści
  programy/<slug>.nc                   # G-kod programu (plik obok, edytowany jak tekst)
  zadania/<slug>.yaml                  # 16 (dziś exercises.json)
  materialy/<id>.yaml                  # 16 — dane kalkulatora („Narzędzia”, do potwierdzenia)
public/content/<kolekcja>/<slug>/…     # zdjęcia dodawane z CMS
```

**Zostaje w TS (nie do CMS):**
- `cam.ts` (generowane programy CAM): wpis `programy/cam-forma.mdx` ma `generator: camForma` zamiast pliku `.nc`;
- rejestr rysunków `diagrams.tsx`;
- `sources.ts` (do decyzji: można przenieść do YAML);
- cała logika (`checker`, `taskCheck`, `lessonRefs`).

### 5.2 Karta kodu: `content/karty/g01.mdx`

```mdx
---
code: G01                     # tekst wyświetlany; słowa z pola służą też do [[G01]]
slug: g01                     # = nazwa pliku; NIE zmieniać (adres /kody/g01)
name: Interpolacja liniowa
group: Ruch
level: 1                      # 1 podstawy · 2 średni · 3 zaawansowany
modal: true
machines: [frezowanie, toczenie]   # zamiast milling/turning
star: true                    # ★ — dziś zbiór CURATED w articles.ts
related: [g00, g02, g03]      # slugi kart (walidowane przy buildzie)
variesBy: null
short: Ruch po prostej z posuwem F.
desc: |-
  G01 prowadzi narzędzie po prostej…   # akapity jak dziś (\n\n); przetwarzane przez CodeText (auto-linki G/M)
syntax:
  fanuc: G01 X_ Y_ Z_ F_
  sinumerik: G1 X_ Y_ Z_ F_
sinumerik: Identycznie: G1. …   # notka „różnice w Sinumeriku”
params:
  - { key: "X Y Z", desc: "Punkt końcowy…" }
pitfalls:
  - G01 bez wcześniejszego F kończy się alarmem.
example:                      # osadzona symulacja (komponent nietykalny — tylko dane)
  src: |
    G21 G90 G17 G54
    …
  simulate: true
  mode: mill                  # exampleMode
  dialect: fanuc              # exampleDialect
  stock: null                 # exampleStock
---

## Ruch po prostej z posuwem {#ruch-po-prostej-z-posuwem}

[[G01]] prowadzi narzędzie po odcinku prostym… [[frezowanie współbieżne|współbieżnie]].

<Diagram id="g01" />

<Note kind="warn">G01 potrzebuje posuwu…</Note>

| Sterowanie | Zapis |
|---|---|
| Fanuc | `G01 X50. F200` |
| Sinumerik | `G1 X50 F200` |

<Demo mode="mill" title="Kontur z odcinków" caption="…">
G21 G90 G17 G54
…
</Demo>
```

**Mapowanie bloków `Block` na MDX** (to samo w artykułach i teorii lekcji):

| Blok | MDX |
|---|---|
| `h` | `## Tekst {#id}` (id zawsze jawne, także wyliczone dziś z tekstu) |
| `p` | akapit z `**…**`, `` `…` ``, `[[…]]` |
| `ul` / `ol` | lista Markdown |
| `note` | `<Note kind="tip\|warn\|info">` |
| `code` | blok kodu z podpisem: `<Code caption="…">` |
| `table` | tabela GFM (komórki z inline-markupem; `data-label` na telefonie liczony jak dziś z nagłówka) |
| `sim` | `<Sim mode="mill">…G-kod…</Sim>` (komponent `SimClient` nietykalny, MDX przekazuje tylko `src`) |
| `demo` | `<Demo mode title caption>…</Demo>` |
| `diagram` | `<Diagram id="…" />` |
| `widget` | `<Widget id="rij\|arc\|jog" />` |

### 5.3 Lekcja: `content/nauka/frezowanie/f3-2-g01-interpolacja-liniowa/`

`index.mdx`:
```mdx
---
id: F3.2
slug: f3-2-g01-interpolacja-liniowa   # NIE zmieniać
title: G01 — interpolacja liniowa
minutes: 14
goal: Zaprogramujesz wejście w materiał…
codes: [g01, g00]             # powiązane karty — dziś liczone heurystycznie w lessonRefs.ts; pole jawne, opcjonalne
controllers:                  # Fanuc / Sinumerik (jest w 51/51 lekcjach)
  rows:
    - ["Ruch liniowy", "G01 X_ Y_ F_", "G1 X_ Y_ F_"]
  note: …
pitfalls:
  - { title: "…", x: "…", fig: "f3-2-wejscie" }
summary: ["…", "…"]
sources: [{ id: fanuc-om, where: "rozdz. 4.2" }]
---

## Ruch po prostej z posuwem {#g01}
…teoria jak w karcie…
```

`cwiczenia.yaml` (dane strukturalne, bez MDX, bo `{0}` w lukach to dla MDX wyrażenie):
```yaml
worked: { title: …, intro: …, fig: …, steps: [{ x: …, code: … }], result: … }
practice:
  - kind: task                 # drill | task | jog | points | offset | state | lathejog | css
    intro: …
    starter: |
      O1000 (PLYTKA) …
    solution: |
      …
    checks: [{ t: cut, reference: "…" }, { t: require, codes: [G01] }]
quiz:
  - { kind: gap, q: …, template: "X{0} Y{1}", answers: [["-5"], ["55"]], why: … }
```

W Keystatic: `index.mdx` to kolekcja z polem `fields.mdx`, a `cwiczenia.yaml` to singleton/kolekcja z `fields.conditional` po `kind`. To pracochłonne (6 typów pytań, 8 typów ćwiczeń), dlatego jest **ostatnim** krokiem planu. Do tego czasu ćwiczenia mogą zostać w TS.

### 5.4 Program: `content/programy/plyta-przylaczeniowa.mdx` + `.nc`

```mdx
---
slug: plyta-przylaczeniowa
title: Płyta przyłączeniowa — 9 narzędzi
mode: mill
dialect: fanuc
category: Płyty i korpusy
level: zaawansowany
features: [G41, G02, M98 L, G91, G68, G82, G83, G73, G85, G84]
stock: { x: 120, y: 80, z: 26, ox: 0, oy: 0, oz: 25 }
lesson: F7.1                   # dziś obiekt {href,label} liczony z course.ts — w pliku tylko id lekcji
tools:
  1: { kind: facemill, name: Głowica Ø63, d: 63, flutes: 5 }
  # …
ops:
  - { t: 1, op: "Planowanie górnej powierzchni", how: "G01 dwoma przejściami, Z0" }
src: ./plyta-przylaczeniowa.nc  # albo generator: camForma
redirectsFrom: [wiercenie-g83-g73, kontur-luki]   # dziś redirects.ts
---
Pełna obróbka płyty 110 × 70 z surówki… (= summary)
```

### 5.5 Słownik, zadania, materiały

- **Słownik:** `slownik/<slug>.yaml` z polami `{term, aliases[], def, see[]}`. Slug pliku = dzisiejsza kotwica `#…`. Alternatywa to jeden `slownik.yaml`, bo 77 haseł łatwo przejrzeć w jednym pliku, ale wtedy Keystatic edytuje je jako singleton z listą.
- **Zadania:** `zadania/<slug>.yaml` 1:1 z `exercises.json`.
- **Materiały:** `materialy/<id>.yaml` 1:1 z `MATERIALS`.

---

## 6. Keystatic a Next.js 16 / React 19 / App Router

### 6.1 Aktualne wersje (rejestr npm, 5.10.2026)

| Pakiet | Wersja | Ostatnia publikacja | Wymagane zależności (peer) |
|---|---|---|---|
| `@keystatic/core` | **0.6.9** | 2026-08-26 | `react ^18.2 \|\| ^19`, `react-dom` j.w., `react-aria 3.50.0`, `react-stately 3.48.0`, `@keystar/ui ~0.10.0` |
| `@keystatic/next` | **5.0.5** | 2026-08-18 | `next >=14`, `react ^18.2 \|\| ^19` |
| `@keystar/ui` | 0.10.0 | — | `next >=14`, `react ^18.2 \|\| ^19` |
| GCat dziś | `next 16.3.4`, `react 19.2.8` | | |

Paczka `@keystatic/next` jest mała (9,5 kB JS). Eksporty: `ui/app` (App Router), `ui/pages`, `route-handler`, `api`, `reader-refresh`. Z Next używa tylko `next/navigation`.

### 6.2 Sprawdzone w praktyce (osobny katalog poza repo, nic nie trafiło do GCat)

- `npm install` z `next 16.3.4`, `react 19.2.8`, `@keystatic/core 0.6.9` i `@keystatic/next 5.0.5`: **bez konfliktów zależności** (259 paczek).
- **`next build` przechodzi.** Aplikacja testowa:
  - kolekcja `karty` z polami `slug`, `checkbox` (★), `array` (related) i `mdx`;
  - strona `/keystatic` (`makePage`, App Router);
  - `/api/keystatic/[...params]` (`makeRouteHandler`);
  - strona serwerowa czytająca treść przez `createReader`.
- `next start`: strona główna wyrenderowała slug z pliku `content/karty/g01.mdx`, a `/keystatic` odpowiada 200.

### 6.3 Znane problemy i ograniczenia

1. **Wsparcie React 19** było zgłaszane jako problem ([Keystatic #1374](https://github.com/Thinkmill/keystatic/issues/1374): konflikty peer przy Astro). W aktualnych wersjach peery obejmują `^19`, co potwierdza test w 6.2. W dokumentacji brak deklaracji o Next 16, mowa tylko o Next 14 + app dir ([instalacja dla Next.js](https://keystatic.com/docs/installation-next-js)). W wyszukiwaniu nie ma zgłoszeń o niezgodności z Next 16, ale to nie jest gwarancja wsparcia.
2. **Tryby zapisu:**
   - `local` działa tylko w `next dev` (zapis na dysk);
   - na Vercelu edycja wymaga trybu `github`: GitHub App, zmienne `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`, `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`. Każdy zapis to commit lub PR. Alternatywą jest Keystatic Cloud (płatny powyżej limitu).
3. **Sztywne wersje** `react-aria 3.50.0` / `react-stately 3.48.0` mogą kolidować z innymi bibliotekami Adobe w przyszłości. Dziś GCat ich nie używa, więc konfliktu nie ma.
4. **Edytor MDX Keystatic serializuje Markdown sam.** Ryzyko escapowania `[[…]]`, zmiany tabel GFM i usunięcia `{#id}` w nagłówkach. Wymagany test round-trip na 3 kartach (sekcja 7, krok 3).
5. **Komponenty MDX** (`<Diagram>`, `<Note>`, `<Sim>`, `<Demo>`) trzeba zadeklarować w konfiguracji pola `mdx` (`components`), inaczej edytor ich nie pokaże albo je usunie.
6. **Panel `/keystatic` ładuje duży bundle** (UI Keystar). Jest izolowany na tej trasie, więc nie wpływa na strony publiczne. Trasę trzeba wyłączyć z sitemapy i robots.
7. **Kompilacja MDX po stronie strony** to osobna decyzja (Keystatic tylko czyta pliki). Proponuję `@mdx-js/mdx` 3.1.1 przez `next-mdx-remote` 6.0.0 (`compileMDX`, RSC) z pluginami remark: `[[…]]` → `<Term>`, `{#id}` → id nagłówka, GFM. Nie `@next/mdx`, bo wymaga stron jako plików `.mdx` w `app/`, a treść ma być w `content/`. Znane problemy MDX w App Router (`createContext only works in Client Components`, [next.js #50110](https://github.com/vercel/next.js/issues/50110)) dotyczą komponentów klienckich w MDX. Rozwiązanie: `Term`, `SimClient` i `Demo` są już komponentami `"use client"` i będą importowane jako takie.

### 6.4 Werdykt i alternatywy

**Keystatic jest zgodny** z obecnym stosem (sprawdzone buildem i uruchomieniem). Rekomenduję go z jednym warunkiem: przechodzi test round-trip `[[…]]` / tabel / kotwic (krok 3). Jeśli nie przejdzie:

| Opcja | Plusy | Minusy |
|---|---|---|
| **Sam MDX + github.dev** (fallback) | zero zależności, te same pliki co dla Keystatic (decyzję można zmienić bez migracji), edycja w przeglądarce przez `.` na GitHubie | brak formularzy dla frontmattera, brak podglądu |
| TinaCMS 3.14.2 (`@tinacms/cli` 4.0.0, React ≥18.3 <20) | podgląd na żywo, edycja wizualna | wymaga Tina Cloud lub własnego backendu (GraphQL), cięższa integracja, schemat w osobnym DSL |
| Decap CMS 3.16.3 (React ^19.1) | prosty, tylko git | słabe wsparcie MDX z komponentami (Markdown + widgety), osobny SPA, logowanie przez git-gateway / OAuth |

Struktura z sekcji 5 jest neutralna względem CMS, więc fallback nie wymaga ponownej migracji.

---

## 7. Plan migracji: małe, odwracalne kroki

Każdy krok to osobny PR na zielonym CI, możliwy do cofnięcia jednym revertem. Do kroku 8 stare źródła (TS/JSON) **zostają** i są porównywane z nowymi testem.

| # | Krok | Co się zmienia | Jak sprawdzić / cofnąć |
|---|---|---|---|
| 0 | Ten raport | `docs/raport-tresci.md` | — |
| 1 | **Tokeny (bez przepinania)** | nowe `src/design/tokens.ts` + `tokens.css` z wartościami 1:1; test vitest porównuje je ze zmiennymi w `globals.css` | `globals.css` nietknięty; cofnięcie = usunięcie 3 plików |
| 2 | **Szkielet MDX bez CMS** | `src/lib/mdx/` (compileMDX + remark `[[…]]` → `<Term>`, `{#id}`, GFM), mapa komponentów (`Diagram`, `Note`, `Code`, `Sim`, `Demo`, `Widget`), skrypt `scripts/eksport-tresci.ts` (TS/JSON → MDX/YAML, deterministyczny) | nic nie jest jeszcze czytane przez strony; testy kompilacji |
| 3 | **Pilot: 3 karty** (g01 ★, g54-g59 ★, g73 bez artykułu) | strona karty czyta MDX dla tych 3 slugów (lista w jednym miejscu), reszta po staremu | **test równości HTML**: render ze starego i nowego źródła identyczny; liczniki markerów i kotwic; round-trip w Keystatic (local); cofnięcie = pusta lista |
| 4 | **Wszystkie karty (56) + słownik (77)** | eksport skryptem, przełącznik źródła | ten sam test równości dla 56 stron i `/slownik`; `audit:programy` bez zmian (przykłady kart) |
| 5 | **Programy (22)** | `programy/*.mdx` + `.nc`, `cam.ts` dalej jako generator, `redirects` z frontmattera | `audit:programy` (217, 0 błędów) bez zmian; hash segmentów każdego programu identyczny; 13 przekierowań działa |
| 6 | **Lekcje: proza (51)** | `index.mdx` (teoria, błędy, podsumowanie, sterowania); ćwiczenia, przykład i test **dalej w TS** | równość HTML 51 stron; `audit:nauka` 0; 168 kotwic `id` bez zmian |
| 7 | **Keystatic** | `keystatic.config.ts`, `/keystatic` (tryb `local`), potem `github` (GitHub App + 4 zmienne w Vercel); kolekcje karty/słownik/programy/lekcje | zapis w panelu → diff tylko w `content/`; trasa poza sitemapą |
| 8 | **Ćwiczenia lekcji do YAML + formularze** | `cwiczenia.yaml`, `fields.conditional` dla 6 typów pytań i 8 typów ćwiczeń | `audit:programy` (rozwiązania zadań przechodzą własne sprawdzenie); test równości |
| 9 | **Sprzątanie** | usunięcie starych `articles*.ts`, `gcodes.json`, `nauka/*.ts` po 2 tygodniach bez zgłoszeń | revert przywraca pliki |
| (opc.) | **Przepięcie stylów na tokeny** | `globals.css` importuje `tokens.css`; ewentualnie symulator czyta `tokens.ts` | wymaga Twojej zgody (dotyka plików „nie ruszać”); zrzuty ekranu przed i po |

### Ryzyka

| Ryzyko | Skutek | Zabezpieczenie |
|---|---|---|
| Edytor Keystatic escapuje `[[…]]` lub psuje tabele / `{#id}` | ciche zniknięcie dymków lub kotwic | round-trip w kroku 3; plugin akceptuje `\[\[…\]\]`; build kończy się błędem przy nierozwiązanym kluczu |
| Kotwice nagłówków artykułów liczone z tekstu (157 / 159) | poprawka literówki zmienia adres `#…`, giną linki z zewnątrz i z lekcji | eksport zapisuje każdą kotwicę jawnie; test listy kotwic przed i po |
| Kotwice słownika z tekstu hasła | zmiana pisowni hasła psuje `/slownik#…` i dymki | slug pliku jako kotwica; pole `term` zmienia tylko tekst |
| `{…}` w szablonach luk (117) i ewentualne `<` w przyszłej prozie | błąd kompilacji MDX | pytania i zadania w YAML; test kompilacji wszystkich plików w CI |
| Różnice w renderze (spacje, encje, kolejność) | drobne zmiany wyglądu | test równości HTML per strona przed przełączeniem |
| Dwa źródła prawdy w okresie przejściowym | edycja w złym miejscu | przełącznik per kolekcja; komentarz `@deprecated` w starych plikach; krok 9 z datą |
| Wydajność builda (kompilacja ~180 plików MDX) | dłuższy build | kompilacja tylko w `generateStaticParams` / RSC, cache po hashu pliku |
| Tryb `github` Keystatic | konfiguracja GitHub App, sekrety na Vercelu, każdy zapis = commit | najpierw `local`; sekrety tylko server-side (bez `NEXT_PUBLIC_` poza slugiem aplikacji) |
| Keystatic 0.x (API może się zmienić), sztywne `react-aria` | utrudnione aktualizacje | dokładne wersje w `package.json`; struktura plików niezależna od CMS (fallback: MDX + github.dev) |
| „Narzędzia” rozumiane inaczej niż w 1.5 | zły zakres | decyzja przed krokiem 5 |
| Treść edytowana równolegle przez Ciebie podczas kroków 4–6 | konflikty skryptu eksportu | eksport generowany z aktualnego `main` tuż przed PR; krótkie okna migracji |

### Pytania do Ciebie przed krokiem 1

1. „Narzędzia”: czy chodzi o dane kalkulatora (materiały, Vc, fz) czy o osobny katalog narzędzi do opisu?
2. Słownik: plik na hasło (wygodne w Keystatic) czy jeden plik (wygodny do przeglądania)?
3. Edycja na produkcji: Keystatic w trybie `github` (GitHub App) czy tylko lokalnie (`next dev`) i commit?
