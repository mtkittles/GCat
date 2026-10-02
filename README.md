# KodG.pl — nauka G-kodu po polsku

Next.js 16 + TypeScript + Tailwind 4. Parser G-kodu (Fanuc/ISO), symulator 2D (frezowanie XY / toczenie ZX), karty kodów z różnicami Fanuc vs Sinumerik.

## Struktura
- `content/gcodes.json` — treść kart (dopisuj nowe kody tutaj)
- `src/lib/parser/` — tokenizer + interpreter (stan modalny, G90/G91, I/J/K i R, opisy PL)
- `src/components/simulator/` — canvas, sterowanie, lista linii
- `src/app/` — strony: `/`, `/kody`, `/kody/[slug]`, `/symulator`

## Zasady pracy nad treścią
- Standard i lista kontrolna kart kodów: `docs/karty-kodow.md`.
- Symulator (parser, silnik, renderowanie, osadzone symulacje, programy demonstracyjne) i znaczniki odnośników `[[…]]` są chronione przy pracy nad treścią — szczegóły w tym samym dokumencie.

## Uruchomienie
    npm install
    npm run dev      # http://localhost:3000
    npm run build    # sprawdzenie produkcyjne

## Deploy
Repo na GitHub → Vercel → Import. Zero konfiguracji.
