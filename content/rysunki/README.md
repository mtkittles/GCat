# Rysunki z rysownika

Jeden plik = jeden rysunek: `content/rysunki/<nazwa>.yaml`. Nazwa pliku to id rysunku.

Plików nie pisze się ręcznie. Rysunek powstaje w panelu treści (`/keystatic` → **Rysunki (rysownik)** → pole
**Rysunek** → „Otwórz rysownik”) albo w brudnopisie `/rysownik`, skąd przenosi się go do panelu
(„Kopiuj rysunek”, potem Ctrl+V w rysowniku panelu).

## Pola

| Pole | Znaczenie |
|---|---|
| `title` | tytuł w nagłówku rysunku |
| `code` | etykieta przy tytule, np. `G01`; puste = brak |
| `caption` | podpis pod rysunkiem; działają `**pogrubienie**`, `` `kod` `` i `[[hasło]]` |
| `legend` | lista `{ k, label }`; pusta = legenda automatyczna z rodzajów linii użytych na rysunku |
| `rys` | `{ h, items }` — wysokość (szerokość zawsze 360) i elementy; zapisuje je rysownik |

## Gdzie rysunek się pojawia

- w karcie kodu: blok **Rysunek z rysownika** w artykule (`<Rys id="nazwa" />`),
- w haśle słownika: pole **Rysunek z rysownika** (`rysunek: nazwa`) — ma pierwszeństwo przed rysunkiem z kodu strony,
- na stronie `/edycja` — lista wszystkich rysunków z podglądem.

## Styl

Element wybiera rodzaj linii, wypełnienie i rodzaj tekstu z zamkniętych list (`src/lib/rys/model.ts`).
Kolory, grubości i kreski pochodzą z tych samych klas CSS co rysunki pisane kodem (`src/components/fig.tsx`),
więc rysunek z rysownika nie odróżnia się od pozostałych. Wzornik: `wzornik-rysownika.yaml`.

`npm run tresci` sprawdza, czy zapis jest w formacie rysownika i czy karty oraz hasła odwołują się do istniejących rysunków.
