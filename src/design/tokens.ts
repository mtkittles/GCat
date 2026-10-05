/*
  Tokeny stylu GCat — jedno źródło wartości dla UI, rysunków technicznych i (w przyszłości) Figmy.

  Etap 1 (sprint 7b): plik tylko OPISUJE stan obecny. Nic go jeszcze nie importuje, a globals.css
  zostaje bez zmian. Test `tests/tokens.test.ts` pilnuje, że:
    tokens.css  ==  tokens.ts  ==  obecne wartości w src/app/globals.css (i fig.tsx, layout.tsx).
  Przepięcie globals.css na tokens.css to osobny krok, za zgodą.

  Nazwy zmiennych motywu są takie same jak w globals.css (--bg, --ink, --accent…).
  Nowe nazwy (--path-*, --stroke-*, --dash-*, --fig-*, --space-*) opisują wartości, które dziś
  są wpisane wprost w reguły CSS lub w kod rysunków — `src` mówi, skąd test je czyta.
*/

/** Skąd test bierze obecną wartość: zmienna motywu w globals.css, właściwość reguły CSS albo fragment pliku. */
export type Src =
  | { kind: "var" }                                          // ta sama nazwa w :root / [data-theme="dark"] w globals.css
  | { kind: "same"; as: string }                             // ta sama wartość co inna zmienna globals.css
  | { kind: "rule"; sel: string; prop: string }              // właściwość reguły w globals.css
  | { kind: "file"; file: string; re: string }               // wyrażenie z grupą 1 = wartość
  | { kind: "usage"; prop: string; min: number };            // wartość używana w globals.css co najmniej `min` razy

export interface Token {
  /** nazwa zmiennej CSS (tokens.css) */
  name: string;
  /** wartość w motywie jasnym (i jedyna, gdy brak `dark`) */
  value: string;
  /** wartość w motywie ciemnym; brak = dziedziczy jasną */
  dark?: string;
  /** gdzie używany (do docs/tokeny.md) */
  use: string;
  src: Src;
}

export interface Group { id: string; title: string; tokens: Token[] }

const V: Src = { kind: "var" };
const rule = (sel: string, prop: string): Src => ({ kind: "rule", sel, prop });

/* ---------------- kolory ---------------- */

export const colors: Group[] = [
  { id: "tlo", title: "Tło", tokens: [
    { name: "--bg", value: "#F8FAFC", dark: "#111214", use: "tło strony (html), pola formularzy w symulatorze", src: V },
  ] },
  { id: "powierzchnie", title: "Powierzchnie", tokens: [
    { name: "--surface", value: "#FFFFFF", dark: "#17181B", use: "paski, panele boczne", src: V },
    { name: "--surface-2", value: "#F1F5F9", dark: "#202125", use: "tło drugiego poziomu: chipy, pola, kroki rysunków (.step)", src: V },
    { name: "--surface-3", value: "#E9EEF5", dark: "#292A2F", use: "trzeci poziom: uchwyty i wrzeciono w rysunkach (.clamp, .spindle)", src: V },
    { name: "--card", value: "#FFFFFF", dark: "#1A1B1F", use: "karty, ramka rysunku (.fig), kod inline", src: V },
    { name: "--panel", value: "#0F172A", dark: "#141518", use: "„ciemna wyspa”: tło rysunków SVG, kanw, bloków kodu; halo napisów w rysunkach", src: V },
    { name: "--panel-ink", value: "#F8FAFC", dark: "#F5F5F4", use: "tekst na panelu", src: V },
  ] },
  { id: "tekst", title: "Tekst", tokens: [
    { name: "--ink", value: "#0F172A", dark: "#F5F5F4", use: "tekst główny; kontur detalu w rysunkach (.p-con)", src: V },
    { name: "--ink-2", value: "#475569", dark: "#C8C9CC", use: "tekst drugorzędny, nawigacja; linie wymiarowe (.p-dim, .p-ext), napisy w rysunkach", src: V },
    { name: "--muted", value: "#64748B", dark: "#8B8D93", use: "podpisy, legenda; osie i linie pomocnicze rysunków (.ax, .p-cons)", src: V },
    { name: "--brand-ink", value: "#0F172A", dark: "#F5F5F4", use: "kolor znaku marki (logo, wordmark)", src: V },
  ] },
  { id: "akcent", title: "Akcent", tokens: [
    { name: "--brand-accent", value: "#F97316", use: "pomarańcz marki", src: V },
    { name: "--accent", value: "#F97316", dark: "#F97316", use: "przyciski główne, aktywna zakładka, kod inline, parametr w rysunkach (.p-acc)", src: V },
    { name: "--accent-hover", value: "#EA580C", dark: "#FB923C", use: "akcent po najechaniu", src: V },
    { name: "--accent-soft", value: "#FFF7ED", dark: "#2B1C12", use: "tło etykiet akcentu (.fig-code, nazwa pliku)", src: V },
  ] },
  { id: "stany", title: "Stany", tokens: [
    { name: "--green", value: "#22C55E", use: "sukces, zaliczone; G01 w rysunkach", src: V },
    { name: "--amber", value: "#F59E0B", use: "ostrzeżenie; G00 w rysunkach", src: V },
    { name: "--red", value: "#EF4444", use: "błąd, kolizja (.p-bad)", src: V },
    { name: "--blue", value: "#38BDF8", use: "informacja; G02/G03 w rysunkach", src: V },
    { name: "--warn-bg", value: "#FFF7ED", dark: "#2A1A10", use: "tło ostrzeżeń", src: V },
  ] },
  { id: "linie", title: "Linie pomocnicze", tokens: [
    { name: "--line", value: "#E2E8F0", dark: "#2A2B30", use: "obramowania, separatory; drobna siatka rysunków (.gr-min)", src: V },
    { name: "--line-strong", value: "#CBD5E1", dark: "#3A3B41", use: "mocniejsze obramowania; główna siatka i kreskowanie rysunków (.gr-maj, .hatch-line)", src: V },
  ] },
  { id: "tor", title: "Tor narzędzia (G00 / G01 / G02)", tokens: [
    { name: "--path-g00", value: "#F59E0B", use: "G00 — ruch szybki, linia przerywana (rysunki, legenda; w symulatorze osobno — patrz docs/tokeny.md)", src: { kind: "same", as: "--amber" } },
    { name: "--path-g01", value: "#22C55E", use: "G01 — ruch roboczy, linia ciągła", src: { kind: "same", as: "--green" } },
    { name: "--path-g02", value: "#38BDF8", use: "G02/G03 — łuk", src: { kind: "same", as: "--blue" } },
  ] },
  { id: "skladnia", title: "Składnia G-kodu (edytor)", tokens: [
    { name: "--cm-comment", value: "#94A3B8", dark: "#64748B", use: "komentarz ( … )", src: V },
    { name: "--cm-g", value: "#B45309", dark: "#FBBF24", use: "słowa G", src: V },
    { name: "--cm-m", value: "#7C3AED", dark: "#C4B5FD", use: "słowa M", src: V },
    { name: "--cm-n", value: "#94A3B8", dark: "#64748B", use: "numery bloków N", src: V },
    { name: "--cm-g00", value: "#D97706", dark: "#F59E0B", use: "G00 w edytorze", src: V },
    { name: "--cm-g01", value: "#15803D", dark: "#4ADE80", use: "G01 w edytorze", src: V },
    { name: "--cm-g02", value: "#0369A1", dark: "#38BDF8", use: "G02/G03 w edytorze", src: V },
    { name: "--cm-axis", value: "#0F172A", dark: "#E2E8F0", use: "adresy osi X Y Z", src: V },
    { name: "--cm-ijk", value: "#0891B2", dark: "#67E8F9", use: "I J K R", src: V },
    { name: "--cm-fs", value: "#16A34A", dark: "#86EFAC", use: "F i S", src: V },
    { name: "--cm-t", value: "#DB2777", dark: "#F9A8D4", use: "T, H, D", src: V },
  ] },
];

/* ---------------- fonty ---------------- */

export const fonts: Group[] = [
  { id: "kroje", title: "Kroje", tokens: [
    { name: "--font-sans", value: 'var(--font-inter), Inter, system-ui, -apple-system, "Segoe UI", sans-serif', use: "interfejs i tekst (Inter)", src: rule("@theme inline", "--font-sans") },
    { name: "--font-display", value: "var(--font-sora), Sora, Inter, system-ui, sans-serif", use: "nagłówki h1–h3, tytuły rysunków (Sora)", src: rule("@theme inline", "--font-display") },
    { name: "--font-mono", value: 'var(--font-jetbrains), "JetBrains Mono", ui-monospace, Menlo, Consolas, monospace', use: "G-kod, kod inline, liczby w rysunkach (JetBrains Mono)", src: rule("@theme inline", "--font-mono") },
  ] },
  { id: "wagi", title: "Wagi wczytywane (next/font)", tokens: [
    { name: "--font-weights-sans", value: "400 500 600", use: "Inter", src: { kind: "file", file: "src/app/layout.tsx", re: String.raw`Inter\(\{[^}]*weight: \[([^\]]*)\]` } },
    { name: "--font-weights-display", value: "600 700 800", use: "Sora", src: { kind: "file", file: "src/app/layout.tsx", re: String.raw`Sora\(\{[^}]*weight: \[([^\]]*)\]` } },
    { name: "--font-weights-mono", value: "400 500 700", use: "JetBrains Mono", src: { kind: "file", file: "src/app/layout.tsx", re: String.raw`JetBrains_Mono\(\{[^}]*weight: \[([^\]]*)\]` } },
  ] },
  { id: "tekst-rysunkow", title: "Tekst w rysunkach (jednostki viewBox 360)", tokens: [
    { name: "--fig-text", value: "11px", use: "napisy w rysunkach", src: rule(".fig svg text", "font-size") },
    { name: "--fig-text-mono", value: "10.5px", use: "liczby i kod w rysunkach (.t-mono)", src: rule(".fig svg .t-mono", "font-size") },
    { name: "--fig-text-big", value: "14px", use: ".t-big", src: rule(".fig svg .t-big", "font-size") },
    { name: "--fig-text-sm", value: "9.5px", use: ".t-sm", src: rule(".fig svg .t-sm", "font-size") },
    { name: "--fig-text-axis", value: "11.5px", use: "opisy osi (.t-ax)", src: rule(".fig svg .t-ax", "font-size") },
    { name: "--fig-text-tick", value: "8.5px", use: "podziałka (.t-tick)", src: rule(".fig svg .t-tick", "font-size") },
    { name: "--fig-text-halo", value: "3.2px", use: "obwódka napisu w kolorze panelu (czytelność na liniach)", src: rule(".fig svg text", "stroke-width") },
    { name: "--fig-text-halo-tick", value: "2.4px", use: "obwódka napisów podziałki", src: rule(".fig svg .t-tick", "stroke-width") },
  ] },
];

/* ---------------- grubości i kreskowanie linii (rysunki) ---------------- */

export const strokes: Group[] = [
  { id: "grubosci", title: "Grubości linii w rysunkach (jednostki viewBox)", tokens: [
    { name: "--stroke-grid-minor", value: ".5", use: "siatka drobna (.gr-min)", src: rule(".fig .gr-min", "stroke-width") },
    { name: "--stroke-grid-major", value: ".7", use: "siatka główna (.gr-maj)", src: rule(".fig .gr-maj", "stroke-width") },
    { name: "--stroke-axis", value: "1.2", use: "osie układu (.ax)", src: rule(".fig .ax", "stroke-width") },
    { name: "--stroke-axis-center", value: "1", use: "oś symetrii / obrotu (.axis-c)", src: rule(".fig .axis-c", "stroke-width") },
    { name: "--stroke-g00", value: "1.8", use: "G00 (.p-rap)", src: rule(".fig .p-rap", "stroke-width") },
    { name: "--stroke-g01", value: "2", use: "G01 (.p-cut)", src: rule(".fig .p-cut", "stroke-width") },
    { name: "--stroke-g02", value: "2", use: "G02/G03 (.p-arc)", src: rule(".fig .p-arc", "stroke-width") },
    { name: "--stroke-contour", value: "1.6", use: "kontur detalu (.p-con)", src: rule(".fig .p-con", "stroke-width") },
    { name: "--stroke-accent", value: "1.6", use: "parametr cyklu (.p-acc)", src: rule(".fig .p-acc", "stroke-width") },
    { name: "--stroke-bad", value: "1.6", use: "błąd / kolizja (.p-bad)", src: rule(".fig .p-bad", "stroke-width") },
    { name: "--stroke-dim", value: ".9", use: "linia wymiarowa (.p-dim)", src: rule(".fig .p-dim", "stroke-width") },
    { name: "--stroke-ext", value: ".6", use: "linia pomocnicza wymiaru (.p-ext)", src: rule(".fig .p-ext", "stroke-width") },
    { name: "--stroke-cons", value: ".9", use: "linia konstrukcyjna (.p-cons)", src: rule(".fig .p-cons", "stroke-width") },
    { name: "--stroke-thick", value: "2.8", use: "pogrubienie (.thick)", src: rule(".fig .thick", "stroke-width") },
    { name: "--stroke-hatch", value: "1.2", use: "kreskowanie materiału (.hatch-line)", src: rule(".fig .hatch-line", "stroke-width") },
    { name: "--stroke-point", value: "1.5", use: "obwódka punktu (.pt)", src: rule(".fig .pt", "stroke-width") },
    { name: "--stroke-tool", value: "1", use: "narzędzie (.tool)", src: rule(".fig .tool", "stroke-width") },
    { name: "--stroke-hole", value: "1.2", use: "otwór w przekroju (.hole)", src: rule(".fig .hole", "stroke-width") },
    { name: "--stroke-hole-top", value: "1.6", use: "otwór z góry (.hole-top)", src: rule(".fig .hole-top", "stroke-width") },
    { name: "--stroke-legend", value: "2.5px", use: "kreska w legendzie rysunku", src: rule(".fig-legend .lg", "border-top") },
  ] },
  { id: "kreskowanie", title: "Kreskowanie (stroke-dasharray)", tokens: [
    { name: "--dash-g00", value: "6 4", use: "G00", src: rule(".fig .p-rap", "stroke-dasharray") },
    { name: "--dash-bad", value: "5 4", use: "błąd", src: rule(".fig .p-bad", "stroke-dasharray") },
    { name: "--dash-cons", value: "3 3", use: "linia konstrukcyjna", src: rule(".fig .p-cons", "stroke-dasharray") },
    { name: "--dash-axis-center", value: "10 3 2 3", use: "oś symetrii (kreska-kropka)", src: rule(".fig .axis-c", "stroke-dasharray") },
    { name: "--dash-default", value: "7 4", use: "klasa .dashed", src: rule(".fig .dashed", "stroke-dasharray") },
    { name: "--dash-tool", value: "3 2", use: "obrys narzędzia", src: rule(".fig .tool", "stroke-dasharray") },
    { name: "--dash-stock", value: "4 3", use: "obrys półfabrykatu (.stock-out)", src: rule(".fig .stock-out", "stroke-dasharray") },
  ] },
];

/* ---------------- strzałki i wymiary w rysunkach (fig.tsx) ---------------- */

const FIG = "src/components/fig.tsx";
export const figure: Group[] = [
  { id: "rysunek", title: "Rysunek: kadr i ramka", tokens: [
    { name: "--fig-width", value: "360", use: "szerokość viewBox (format pod telefon)", src: { kind: "file", file: FIG, re: String.raw`w = (\d+)` } },
    { name: "--fig-height", value: "250", use: "domyślna wysokość viewBox", src: { kind: "file", file: FIG, re: String.raw`h = (\d+)` } },
    { name: "--fig-radius", value: "16px", use: "zaokrąglenie ramki .fig", src: rule(".fig", "border-radius") },
    { name: "--fig-svg-radius", value: "10px", use: "zaokrąglenie panelu SVG", src: rule(".fig svg", "border-radius") },
    { name: "--fig-padding", value: ".75rem", use: "wewnętrzny odstęp ramki", src: rule(".fig", "padding") },
  ] },
  { id: "strzalki", title: "Strzałki i wymiary", tokens: [
    { name: "--fig-arrow-box", value: "10", use: "rozmiar markera strzałki (markerWidth / markerHeight)", src: { kind: "file", file: FIG, re: String.raw`markerWidth="(\d+)"` } },
    { name: "--fig-arrow-ref-x", value: "8", use: "punkt zaczepienia strzałki (refX)", src: { kind: "file", file: FIG, re: String.raw`refX="(\d+)"` } },
    { name: "--fig-arrow-path", value: "M0 1.2 L9 5 L0 8.8 z", use: "grot: długość 9, szerokość 7.6", src: { kind: "file", file: FIG, re: String.raw`<path d="(M0 [^"]+)"` } },
    { name: "--fig-point-r", value: "3.6", use: "promień punktu (Pt)", src: { kind: "file", file: FIG, re: String.raw`r=\{([\d.]+)\} className=\{dot\}` } },
    { name: "--fig-step-r", value: "7.5", use: "promień kółka z numerem kroku (Step)", src: { kind: "file", file: FIG, re: String.raw`r=\{([\d.]+)\} className="step"` } },
    { name: "--fig-dim-label-gap", value: "9", use: "odsunięcie opisu od linii wymiarowej (Dim)", src: { kind: "file", file: FIG, re: String.raw`nx \* (\d+) \* lside` } },
    { name: "--fig-dim-ext-over", value: "3", use: "wysunięcie linii pomocniczej poza wymiarową", src: { kind: "file", file: FIG, re: String.raw`ax \+ nx \* (\d+) \* Math\.sign` } },
    { name: "--fig-legend-line", value: "16px", use: "długość kreski w legendzie", src: rule(".fig-legend .lg", "width") },
  ] },
];

/* ---------------- promienie, cienie, odstępy ---------------- */

export const shape: Group[] = [
  { id: "promienie", title: "Promienie zaokrągleń", tokens: [
    { name: "--radius-sm", value: "8px", use: "małe przyciski, pola", src: V },
    { name: "--radius", value: "10px", use: "karty, panele", src: V },
    { name: "--radius-lg", value: "14px", use: "duże karty, banery", src: V },
    { name: "--radius-pill", value: "999px", use: "chipy, pigułki (używany wprost w regułach)", src: { kind: "usage", prop: "border-radius", min: 10 } },
  ] },
  { id: "cienie", title: "Cienie", tokens: [
    { name: "--shadow-sm", value: "0 1px 2px rgba(15, 23, 42, .06)", dark: "0 1px 2px rgba(0, 0, 0, .5)", use: "lekkie uniesienie", src: V },
    { name: "--shadow", value: "0 6px 20px rgba(15, 23, 42, .08)", dark: "0 10px 30px rgba(0, 0, 0, .55)", use: "karty pływające, menu", src: V },
  ] },
  { id: "odstepy", title: "Odstępy (najczęstsze wartości gap/padding w globals.css)", tokens: [
    { name: "--space-1", value: ".25rem", use: "gap ikon, drobne odstępy", src: { kind: "usage", prop: "gap", min: 10 } },
    { name: "--space-2", value: ".3rem", use: "gap chipów", src: { kind: "usage", prop: "gap", min: 10 } },
    { name: "--space-3", value: ".4rem", use: "gap list", src: { kind: "usage", prop: "gap", min: 10 } },
    { name: "--space-4", value: ".5rem", use: "gap domyślny (najczęstszy)", src: { kind: "usage", prop: "gap", min: 10 } },
    { name: "--space-5", value: ".6rem", use: "padding pól i przycisków", src: { kind: "usage", prop: "padding", min: 10 } },
    { name: "--space-6", value: ".8rem", use: "padding kart", src: { kind: "usage", prop: "padding", min: 10 } },
    { name: "--space-7", value: "1rem", use: "padding sekcji, gap układu", src: { kind: "usage", prop: "padding", min: 10 } },
  ] },
];

export const groups: { id: string; title: string; groups: Group[] }[] = [
  { id: "kolory", title: "Kolory", groups: colors },
  { id: "fonty", title: "Fonty", groups: fonts },
  { id: "linie", title: "Grubości i kreskowanie linii", groups: strokes },
  { id: "rysunki", title: "Strzałki i wymiary w rysunkach", groups: figure },
  { id: "ksztalt", title: "Promienie, cienie, odstępy", groups: shape },
];

export const allTokens: Token[] = groups.flatMap((g) => g.groups.flatMap((x) => x.tokens));

/** Zmienne CSS z tokenów: motyw jasny (:root) i ciemny ([data-theme="dark"], tylko różniące się). */
export function cssVars(): { light: Record<string, string>; dark: Record<string, string> } {
  const light: Record<string, string> = {}, dark: Record<string, string> = {};
  for (const t of allTokens) { light[t.name] = t.value; if (t.dark !== undefined) dark[t.name] = t.dark; }
  return { light, dark };
}

/**
 * Wartości używane poza CSS — do ujednolicenia PÓŹNIEJ, za zgodą (symulator jest nietykalny).
 * Tylko dokumentacja: nic tego nie importuje.
 */
export const simulatorDuplicates: { what: string; value: string; file: string; same?: string }[] = [
  { what: "tor G00 na kanwie 2D (COLORS.rapid)", value: "#F59E0B", file: "src/components/simulator/Simulator.tsx", same: "--path-g00" },
  { what: "tor G01 na kanwie 2D (COLORS.linear)", value: "#22C55E", file: "src/components/simulator/Simulator.tsx", same: "--path-g01" },
  { what: "tor G02/G03 na kanwie 2D (COLORS.arc)", value: "#38BDF8", file: "src/components/simulator/Simulator.tsx", same: "--path-g02" },
  { what: "postój G04 na kanwie 2D (COLORS.dwell)", value: "#F97316", file: "src/components/simulator/Simulator.tsx", same: "--accent" },
  { what: "tor G00 w 3D", value: "#F59E0B", file: "src/components/simulator/Sim3D.tsx", same: "--path-g00" },
  { what: "tor G01 w 3D", value: "#22C55E", file: "src/components/simulator/Sim3D.tsx", same: "--path-g01" },
  { what: "tor G02/G03 w 3D", value: "#38BDF8", file: "src/components/simulator/Sim3D.tsx", same: "--path-g02" },
  { what: "wymiary (pomiar 2D i 3D)", value: "#FACC15", file: "src/components/simulator/measure2d.ts, Sim3D.tsx" },
  { what: "materiał półfabrykatu w 3D", value: "0x8a94a3", file: "src/components/simulator/Sim3D.tsx" },
  { what: "tło sceny 3D", value: "0x12161c", file: "src/components/simulator/Sim3D.tsx" },
  { what: "font kanwy 2D (HUD, podziałka, wymiary)", value: "ui-monospace, monospace", file: "src/components/simulator/Simulator.tsx, measure2d.ts", same: "--font-mono (JetBrains Mono) — kanwa używa fontu systemowego" },
];
