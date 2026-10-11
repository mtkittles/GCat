# Przegląd: telefon, jasny motyw, kontrast (issue #31 §10, paczka K)

Data: 11 października 2026. Narzędzia: Playwright (Chromium), axe-core 4.10.2. Skrypt: `scripts/audit-a11y.py` (wymaga uruchomionego `npm run dev` i pliku `axe.min.js`, np. `npm pack axe-core@4.10.2`).

## Zakres

- 18 stron: start, Nauka (wejście, plan frezowania, plan 7 dni, FP.1, F0.1, F4.1, F5.4, T0.1), Kody (lista, G01), Zadania (lista, zadanie), Programy, Kalkulator, Słownik, Symulator, Fiszki.
- Szerokości: 320, 390, 430 px (telefon; 320 px odpowiada powiększeniu 200 % przy 640 px) i 1363 px (PC).
- Oba motywy: ciemny i jasny.
- Reguły axe: `color-contrast`, `target-size`, `link-in-text-block`, `button-name`, `image-alt`, `label`, `aria-allowed-attr`, `scrollable-region-focusable`, `nested-interactive`.
- Przewijanie poziome: `scrollWidth` dokumentu względem szerokości okna; elementy wychodzące poza okno poza własnym obszarem przewijania.

## Wynik przed poprawkami

| Pomiar | Ciemny | Jasny |
|---|---|---|
| Przewijanie całej strony w poziomie (320–1363 px) | 0 stron | 0 stron |
| `color-contrast` (węzły, 390 + 1363 px) | 361 | 1 155 |
| `scrollable-region-focusable` | 12 | 12 |
| `target-size`, `button-name`, `image-alt`, `label` i pozostałe | 0 | 0 |

Główne przyczyny kontrastu:

| Para kolorów | Kontrast | Gdzie |
|---|---|---|
| biały na #F97316 | 2,8 : 1 | przyciski główne, aktywne zakładki, „następna lekcja” |
| #F97316 na białym / #FFF7ED / #F1F5F9 (jasny motyw) | 2,6–2,8 : 1 | kod inline, etykiety rysunków, identyfikatory lekcji, linki |
| #64748B na #F1F5F9 i #FFF7ED (jasny) | 4,3–4,5 : 1 | nagłówki tabel, profil zapisu, podpisy |
| szarości ze zmniejszoną przezroczystością w stopce | 2,7–3,4 : 1 | wersja, hasło stopki, nota prawna |
| numery linii i komentarze w kodzie | 2,4–3,8 : 1 | wizytówki kodu, edytor |
| zielony / bursztyn / czerwony jako tekst | 2,0–4,4 : 1 | notatki rysunków, etykiety błędów |

## Poprawki

- Nowe tokeny (`src/design/tokens.ts`, `globals.css`):
  - `--accent-ink` — pomarańcz jako **tekst**: jasny motyw #C2410C (5,2 : 1 na białym), ciemny #F97316. Tło przycisków, linie rysunków i logo zostają w #F97316.
  - `--on-accent` #111214 — tekst na tle akcentu (6,7 : 1). Przyciski główne mają ciemny napis na pomarańczu.
  - `--red-ink`, `--green-ink`, `--amber-ink`, `--blue-ink` — kolory stanów i ruchów jako tekst: w jasnym motywie ciemniejszy odcień tej samej barwy, w ciemnym bez zmian. Linie G00/G01/G02 na rysunkach i w symulatorze bez zmian.
- `--muted` w jasnym motywie #64748B → #5B6577 (≥ 5,3 : 1 na jasnych tłach).
- Kolory edytora w jasnym motywie: komentarz i numery bloków #5B6577, G00 #B45309, F/S #15803D, I/J/K #0E7490, T/H/D #BE185D; w ciemnym komentarz #8B98AB.
- Panele zawsze ciemne (kod, rysunki, odczyty) dostają jasne warianty tokenów `*-ink` także w jasnym motywie.
- Numery linii w wizytówkach kodu #475569 → #8A94A6; stopka bez obniżonej przezroczystości.
- Obrys fokusu `:focus-visible` w kolorze `--accent-ink` (≥ 3 : 1 w obu motywach).
- Przewijane bloki kodu (`.syntax`), lista linii pokazu i opis bloków w symulatorze, odczyt współrzędnych w trybie pełnoekranowym — `tabIndex={0}`, więc da się je przewinąć klawiaturą.

## Wynik po poprawkach

| Pomiar | Ciemny | Jasny |
|---|---|---|
| Przewijanie całej strony w poziomie (320, 390, 1363 px) | 0 | 0 |
| `color-contrast` | **0** | **0** |
| `scrollable-region-focusable` | 1 | 1 |

Pozostały wpis to obszar przewijania edytora CodeMirror w `/symulator`. Zawiera on pole edycji (`contenteditable`), do którego wchodzi się klawiszem Tab i przewija kursorem; axe nie uznaje `contenteditable` za element fokusowalny. Zostawione bez zmian.

## Czego nie sprawdza ten pomiar

- Czytelności treści rysunków SVG (tekst w rysunkach jest na ciemnym panelu i ma obwódkę w kolorze tła; axe nie mierzy tekstu SVG).
- Pełnej obsługi klawiaturą i czytnika ekranu — do ręcznego przejścia.
- Rzeczywistych urządzeń (Safari iOS, Android) — pomiar w Chromium z emulacją szerokości.
