# Tokeny stylu GCat

Wygenerowane z `src/design/tokens.ts` (`npm run tokeny`) — nie edytuj ręcznie.

**Stan:** etap 1 (sprint 7b). Tokeny opisują obecne wartości 1:1. `globals.css` jest bez zmian, a `src/design/tokens.css` nie jest jeszcze nigdzie importowany. Test `tests/tokens.test.ts` pilnuje zgodności: `tokens.css` = `tokens.ts` = obecne `globals.css`, a dla rysunków także `fig.tsx` i `layout.tsx`.

**Figma:**
- `docs/tokeny.json` to eksport w formacie W3C Design Tokens; wczytuje go np. wtyczka Tokens Studio.
- Kolory z kolumny „Wartość” to style jasne, z kolumny „Ciemny” — ciemne.
- Grubości linii rysunków są w jednostkach `viewBox` (szerokość 360). W Figmie przy ramce 360 px to te same piksele.

## Kolory

### Tło

| Token | Wartość (jasny) | Ciemny | Gdzie używany |
|---|---|---|---|
| `--bg` | ![#F8FAFC](tokeny/F8FAFC.svg) `#F8FAFC` | ![#111214](tokeny/111214.svg) `#111214` | tło strony (html), pola formularzy w symulatorze |

### Powierzchnie

| Token | Wartość (jasny) | Ciemny | Gdzie używany |
|---|---|---|---|
| `--surface` | ![#FFFFFF](tokeny/FFFFFF.svg) `#FFFFFF` | ![#17181B](tokeny/17181B.svg) `#17181B` | paski, panele boczne |
| `--surface-2` | ![#F1F5F9](tokeny/F1F5F9.svg) `#F1F5F9` | ![#202125](tokeny/202125.svg) `#202125` | tło drugiego poziomu: chipy, pola, kroki rysunków (.step) |
| `--surface-3` | ![#E9EEF5](tokeny/E9EEF5.svg) `#E9EEF5` | ![#292A2F](tokeny/292A2F.svg) `#292A2F` | trzeci poziom: uchwyty i wrzeciono w rysunkach (.clamp, .spindle) |
| `--card` | ![#FFFFFF](tokeny/FFFFFF.svg) `#FFFFFF` | ![#1A1B1F](tokeny/1A1B1F.svg) `#1A1B1F` | karty, ramka rysunku (.fig), kod inline |
| `--panel` | ![#0F172A](tokeny/0F172A.svg) `#0F172A` | ![#141518](tokeny/141518.svg) `#141518` | „ciemna wyspa”: tło rysunków SVG, kanw, bloków kodu; halo napisów w rysunkach |
| `--panel-ink` | ![#F8FAFC](tokeny/F8FAFC.svg) `#F8FAFC` | ![#F5F5F4](tokeny/F5F5F4.svg) `#F5F5F4` | tekst na panelu |

### Tekst

| Token | Wartość (jasny) | Ciemny | Gdzie używany |
|---|---|---|---|
| `--ink` | ![#0F172A](tokeny/0F172A.svg) `#0F172A` | ![#F5F5F4](tokeny/F5F5F4.svg) `#F5F5F4` | tekst główny; kontur detalu w rysunkach (.p-con) |
| `--ink-2` | ![#475569](tokeny/475569.svg) `#475569` | ![#C8C9CC](tokeny/C8C9CC.svg) `#C8C9CC` | tekst drugorzędny, nawigacja; linie wymiarowe (.p-dim, .p-ext), napisy w rysunkach |
| `--muted` | ![#64748B](tokeny/64748B.svg) `#64748B` | ![#8B8D93](tokeny/8B8D93.svg) `#8B8D93` | podpisy, legenda; osie i linie pomocnicze rysunków (.ax, .p-cons) |
| `--brand-ink` | ![#0F172A](tokeny/0F172A.svg) `#0F172A` | ![#F5F5F4](tokeny/F5F5F4.svg) `#F5F5F4` | kolor znaku marki (logo, wordmark) |

### Akcent

| Token | Wartość (jasny) | Ciemny | Gdzie używany |
|---|---|---|---|
| `--brand-accent` | ![#F97316](tokeny/F97316.svg) `#F97316` | — (jak jasny) | pomarańcz marki |
| `--accent` | ![#F97316](tokeny/F97316.svg) `#F97316` | ![#F97316](tokeny/F97316.svg) `#F97316` | przyciski główne, aktywna zakładka, kod inline, parametr w rysunkach (.p-acc) |
| `--accent-hover` | ![#EA580C](tokeny/EA580C.svg) `#EA580C` | ![#FB923C](tokeny/FB923C.svg) `#FB923C` | akcent po najechaniu |
| `--accent-soft` | ![#FFF7ED](tokeny/FFF7ED.svg) `#FFF7ED` | ![#2B1C12](tokeny/2B1C12.svg) `#2B1C12` | tło etykiet akcentu (.fig-code, nazwa pliku) |

### Stany

| Token | Wartość (jasny) | Ciemny | Gdzie używany |
|---|---|---|---|
| `--green` | ![#22C55E](tokeny/22C55E.svg) `#22C55E` | — (jak jasny) | sukces, zaliczone; G01 w rysunkach |
| `--amber` | ![#F59E0B](tokeny/F59E0B.svg) `#F59E0B` | — (jak jasny) | ostrzeżenie; G00 w rysunkach |
| `--red` | ![#EF4444](tokeny/EF4444.svg) `#EF4444` | — (jak jasny) | błąd, kolizja (.p-bad) |
| `--blue` | ![#38BDF8](tokeny/38BDF8.svg) `#38BDF8` | — (jak jasny) | informacja; G02/G03 w rysunkach |
| `--warn-bg` | ![#FFF7ED](tokeny/FFF7ED.svg) `#FFF7ED` | ![#2A1A10](tokeny/2A1A10.svg) `#2A1A10` | tło ostrzeżeń |

### Linie pomocnicze

| Token | Wartość (jasny) | Ciemny | Gdzie używany |
|---|---|---|---|
| `--line` | ![#E2E8F0](tokeny/E2E8F0.svg) `#E2E8F0` | ![#2A2B30](tokeny/2A2B30.svg) `#2A2B30` | obramowania, separatory; drobna siatka rysunków (.gr-min) |
| `--line-strong` | ![#CBD5E1](tokeny/CBD5E1.svg) `#CBD5E1` | ![#3A3B41](tokeny/3A3B41.svg) `#3A3B41` | mocniejsze obramowania; główna siatka i kreskowanie rysunków (.gr-maj, .hatch-line) |

### Tor narzędzia (G00 / G01 / G02)

| Token | Wartość | Gdzie używany |
|---|---|---|
| `--path-g00` | ![#F59E0B](tokeny/F59E0B.svg) `#F59E0B` | G00 — ruch szybki, linia przerywana (rysunki, legenda; w symulatorze osobno — patrz docs/tokeny.md) · = `--amber` |
| `--path-g01` | ![#22C55E](tokeny/22C55E.svg) `#22C55E` | G01 — ruch roboczy, linia ciągła · = `--green` |
| `--path-g02` | ![#38BDF8](tokeny/38BDF8.svg) `#38BDF8` | G02/G03 — łuk · = `--blue` |

### Składnia G-kodu (edytor)

| Token | Wartość (jasny) | Ciemny | Gdzie używany |
|---|---|---|---|
| `--cm-comment` | ![#94A3B8](tokeny/94A3B8.svg) `#94A3B8` | ![#64748B](tokeny/64748B.svg) `#64748B` | komentarz ( … ) |
| `--cm-g` | ![#B45309](tokeny/B45309.svg) `#B45309` | ![#FBBF24](tokeny/FBBF24.svg) `#FBBF24` | słowa G |
| `--cm-m` | ![#7C3AED](tokeny/7C3AED.svg) `#7C3AED` | ![#C4B5FD](tokeny/C4B5FD.svg) `#C4B5FD` | słowa M |
| `--cm-n` | ![#94A3B8](tokeny/94A3B8.svg) `#94A3B8` | ![#64748B](tokeny/64748B.svg) `#64748B` | numery bloków N |
| `--cm-g00` | ![#D97706](tokeny/D97706.svg) `#D97706` | ![#F59E0B](tokeny/F59E0B.svg) `#F59E0B` | G00 w edytorze |
| `--cm-g01` | ![#15803D](tokeny/15803D.svg) `#15803D` | ![#4ADE80](tokeny/4ADE80.svg) `#4ADE80` | G01 w edytorze |
| `--cm-g02` | ![#0369A1](tokeny/0369A1.svg) `#0369A1` | ![#38BDF8](tokeny/38BDF8.svg) `#38BDF8` | G02/G03 w edytorze |
| `--cm-axis` | ![#0F172A](tokeny/0F172A.svg) `#0F172A` | ![#E2E8F0](tokeny/E2E8F0.svg) `#E2E8F0` | adresy osi X Y Z |
| `--cm-ijk` | ![#0891B2](tokeny/0891B2.svg) `#0891B2` | ![#67E8F9](tokeny/67E8F9.svg) `#67E8F9` | I J K R |
| `--cm-fs` | ![#16A34A](tokeny/16A34A.svg) `#16A34A` | ![#86EFAC](tokeny/86EFAC.svg) `#86EFAC` | F i S |
| `--cm-t` | ![#DB2777](tokeny/DB2777.svg) `#DB2777` | ![#F9A8D4](tokeny/F9A8D4.svg) `#F9A8D4` | T, H, D |

## Fonty

### Kroje

| Token | Wartość | Gdzie używany |
|---|---|---|
| `--font-sans` | `var(--font-inter), Inter, system-ui, -apple-system, "Segoe UI", sans-serif` | interfejs i tekst (Inter) · `@theme inline { --font-sans }` |
| `--font-display` | `var(--font-sora), Sora, Inter, system-ui, sans-serif` | nagłówki h1–h3, tytuły rysunków (Sora) · `@theme inline { --font-display }` |
| `--font-mono` | `var(--font-jetbrains), "JetBrains Mono", ui-monospace, Menlo, Consolas, monospace` | G-kod, kod inline, liczby w rysunkach (JetBrains Mono) · `@theme inline { --font-mono }` |

### Wagi wczytywane (next/font)

| Token | Wartość | Gdzie używany |
|---|---|---|
| `--font-weights-sans` | `400 500 600` | Inter · `src/app/layout.tsx` |
| `--font-weights-display` | `600 700 800` | Sora · `src/app/layout.tsx` |
| `--font-weights-mono` | `400 500 700` | JetBrains Mono · `src/app/layout.tsx` |

### Tekst w rysunkach (jednostki viewBox 360)

| Token | Wartość | Gdzie używany |
|---|---|---|
| `--fig-text` | `11px` | napisy w rysunkach · `.fig svg text { font-size }` |
| `--fig-text-mono` | `10.5px` | liczby i kod w rysunkach (.t-mono) · `.fig svg .t-mono { font-size }` |
| `--fig-text-big` | `14px` | .t-big · `.fig svg .t-big { font-size }` |
| `--fig-text-sm` | `9.5px` | .t-sm · `.fig svg .t-sm { font-size }` |
| `--fig-text-axis` | `11.5px` | opisy osi (.t-ax) · `.fig svg .t-ax { font-size }` |
| `--fig-text-tick` | `8.5px` | podziałka (.t-tick) · `.fig svg .t-tick { font-size }` |
| `--fig-text-halo` | `3.2px` | obwódka napisu w kolorze panelu (czytelność na liniach) · `.fig svg text { stroke-width }` |
| `--fig-text-halo-tick` | `2.4px` | obwódka napisów podziałki · `.fig svg .t-tick { stroke-width }` |

## Grubości i kreskowanie linii

### Grubości linii w rysunkach (jednostki viewBox)

| Token | Wartość | Gdzie używany |
|---|---|---|
| `--stroke-grid-minor` | `.5` | siatka drobna (.gr-min) · `.fig .gr-min { stroke-width }` |
| `--stroke-grid-major` | `.7` | siatka główna (.gr-maj) · `.fig .gr-maj { stroke-width }` |
| `--stroke-axis` | `1.2` | osie układu (.ax) · `.fig .ax { stroke-width }` |
| `--stroke-axis-center` | `1` | oś symetrii / obrotu (.axis-c) · `.fig .axis-c { stroke-width }` |
| `--stroke-g00` | `1.8` | G00 (.p-rap) · `.fig .p-rap { stroke-width }` |
| `--stroke-g01` | `2` | G01 (.p-cut) · `.fig .p-cut { stroke-width }` |
| `--stroke-g02` | `2` | G02/G03 (.p-arc) · `.fig .p-arc { stroke-width }` |
| `--stroke-contour` | `1.6` | kontur detalu (.p-con) · `.fig .p-con { stroke-width }` |
| `--stroke-accent` | `1.6` | parametr cyklu (.p-acc) · `.fig .p-acc { stroke-width }` |
| `--stroke-bad` | `1.6` | błąd / kolizja (.p-bad) · `.fig .p-bad { stroke-width }` |
| `--stroke-dim` | `.9` | linia wymiarowa (.p-dim) · `.fig .p-dim { stroke-width }` |
| `--stroke-ext` | `.6` | linia pomocnicza wymiaru (.p-ext) · `.fig .p-ext { stroke-width }` |
| `--stroke-cons` | `.9` | linia konstrukcyjna (.p-cons) · `.fig .p-cons { stroke-width }` |
| `--stroke-thick` | `2.8` | pogrubienie (.thick) · `.fig .thick { stroke-width }` |
| `--stroke-hatch` | `1.2` | kreskowanie materiału (.hatch-line) · `.fig .hatch-line { stroke-width }` |
| `--stroke-point` | `1.5` | obwódka punktu (.pt) · `.fig .pt { stroke-width }` |
| `--stroke-tool` | `1` | narzędzie (.tool) · `.fig .tool { stroke-width }` |
| `--stroke-hole` | `1.2` | otwór w przekroju (.hole) · `.fig .hole { stroke-width }` |
| `--stroke-hole-top` | `1.6` | otwór z góry (.hole-top) · `.fig .hole-top { stroke-width }` |
| `--stroke-legend` | `2.5px` | kreska w legendzie rysunku · `.fig-legend .lg { border-top }` |

### Kreskowanie (stroke-dasharray)

| Token | Wartość | Gdzie używany |
|---|---|---|
| `--dash-g00` | `6 4` | G00 · `.fig .p-rap { stroke-dasharray }` |
| `--dash-bad` | `5 4` | błąd · `.fig .p-bad { stroke-dasharray }` |
| `--dash-cons` | `3 3` | linia konstrukcyjna · `.fig .p-cons { stroke-dasharray }` |
| `--dash-axis-center` | `10 3 2 3` | oś symetrii (kreska-kropka) · `.fig .axis-c { stroke-dasharray }` |
| `--dash-default` | `7 4` | klasa .dashed · `.fig .dashed { stroke-dasharray }` |
| `--dash-tool` | `3 2` | obrys narzędzia · `.fig .tool { stroke-dasharray }` |
| `--dash-stock` | `4 3` | obrys półfabrykatu (.stock-out) · `.fig .stock-out { stroke-dasharray }` |

## Strzałki i wymiary w rysunkach

### Rysunek: kadr i ramka

| Token | Wartość | Gdzie używany |
|---|---|---|
| `--fig-width` | `360` | szerokość viewBox (format pod telefon) · `src/components/fig.tsx` |
| `--fig-height` | `250` | domyślna wysokość viewBox · `src/components/fig.tsx` |
| `--fig-radius` | `16px` | zaokrąglenie ramki .fig · `.fig { border-radius }` |
| `--fig-svg-radius` | `10px` | zaokrąglenie panelu SVG · `.fig svg { border-radius }` |
| `--fig-padding` | `.75rem` | wewnętrzny odstęp ramki · `.fig { padding }` |

### Strzałki i wymiary

| Token | Wartość | Gdzie używany |
|---|---|---|
| `--fig-arrow-box` | `10` | rozmiar markera strzałki (markerWidth / markerHeight) · `src/components/fig.tsx` |
| `--fig-arrow-ref-x` | `8` | punkt zaczepienia strzałki (refX) · `src/components/fig.tsx` |
| `--fig-arrow-path` | `M0 1.2 L9 5 L0 8.8 z` | grot: długość 9, szerokość 7.6 · `src/components/fig.tsx` |
| `--fig-point-r` | `3.6` | promień punktu (Pt) · `src/components/fig.tsx` |
| `--fig-step-r` | `7.5` | promień kółka z numerem kroku (Step) · `src/components/fig.tsx` |
| `--fig-dim-label-gap` | `9` | odsunięcie opisu od linii wymiarowej (Dim) · `src/components/fig.tsx` |
| `--fig-dim-ext-over` | `3` | wysunięcie linii pomocniczej poza wymiarową · `src/components/fig.tsx` |
| `--fig-legend-line` | `16px` | długość kreski w legendzie · `.fig-legend .lg { width }` |

## Promienie, cienie, odstępy

### Promienie zaokrągleń

| Token | Wartość | Gdzie używany |
|---|---|---|
| `--radius-sm` | `8px` | małe przyciski, pola |
| `--radius` | `10px` | karty, panele |
| `--radius-lg` | `14px` | duże karty, banery |
| `--radius-pill` | `999px` | chipy, pigułki (używany wprost w regułach) · wartość z reguł `border-radius` |

### Cienie

| Token | Wartość (jasny) | Ciemny | Gdzie używany |
|---|---|---|---|
| `--shadow-sm` | `0 1px 2px rgba(15, 23, 42, .06)` | `0 1px 2px rgba(0, 0, 0, .5)` | lekkie uniesienie |
| `--shadow` | `0 6px 20px rgba(15, 23, 42, .08)` | `0 10px 30px rgba(0, 0, 0, .55)` | karty pływające, menu |

### Odstępy (najczęstsze wartości gap/padding w globals.css)

| Token | Wartość | Gdzie używany |
|---|---|---|
| `--space-1` | `.25rem` | gap ikon, drobne odstępy · wartość z reguł `gap` |
| `--space-2` | `.3rem` | gap chipów · wartość z reguł `gap` |
| `--space-3` | `.4rem` | gap list · wartość z reguł `gap` |
| `--space-4` | `.5rem` | gap domyślny (najczęstszy) · wartość z reguł `gap` |
| `--space-5` | `.6rem` | padding pól i przycisków · wartość z reguł `padding` |
| `--space-6` | `.8rem` | padding kart · wartość z reguł `padding` |
| `--space-7` | `1rem` | padding sekcji, gap układu · wartość z reguł `padding` |

## Do ujednolicenia później — tylko za zgodą

Symulator jest **nietykalny**. Poniższe wartości są wpisane w jego kod obok tokenów. Nie są deduplikowane w tym kroku; ujednolicenie (import z `tokens.ts`) wymaga osobnej zgody.

| Co | Wartość | Plik | Odpowiada tokenowi |
|---|---|---|---|
| tor G00 na kanwie 2D (COLORS.rapid) | ![#F59E0B](tokeny/F59E0B.svg) `#F59E0B` | `src/components/simulator/Simulator.tsx` | --path-g00 |
| tor G01 na kanwie 2D (COLORS.linear) | ![#22C55E](tokeny/22C55E.svg) `#22C55E` | `src/components/simulator/Simulator.tsx` | --path-g01 |
| tor G02/G03 na kanwie 2D (COLORS.arc) | ![#38BDF8](tokeny/38BDF8.svg) `#38BDF8` | `src/components/simulator/Simulator.tsx` | --path-g02 |
| postój G04 na kanwie 2D (COLORS.dwell) | ![#F97316](tokeny/F97316.svg) `#F97316` | `src/components/simulator/Simulator.tsx` | --accent |
| tor G00 w 3D | ![#F59E0B](tokeny/F59E0B.svg) `#F59E0B` | `src/components/simulator/Sim3D.tsx` | --path-g00 |
| tor G01 w 3D | ![#22C55E](tokeny/22C55E.svg) `#22C55E` | `src/components/simulator/Sim3D.tsx` | --path-g01 |
| tor G02/G03 w 3D | ![#38BDF8](tokeny/38BDF8.svg) `#38BDF8` | `src/components/simulator/Sim3D.tsx` | --path-g02 |
| wymiary (pomiar 2D i 3D) | ![#FACC15](tokeny/FACC15.svg) `#FACC15` | `src/components/simulator/measure2d.ts, Sim3D.tsx` | — (brak tokenu) |
| materiał półfabrykatu w 3D | ![#8A94A3](tokeny/8A94A3.svg) `#8A94A3` | `src/components/simulator/Sim3D.tsx` | — (brak tokenu) |
| tło sceny 3D | ![#12161C](tokeny/12161C.svg) `#12161C` | `src/components/simulator/Sim3D.tsx` | — (brak tokenu) |
| font kanwy 2D (HUD, podziałka, wymiary) | `ui-monospace, monospace` | `src/components/simulator/Simulator.tsx, measure2d.ts` | --font-mono (JetBrains Mono) — kanwa używa fontu systemowego |
