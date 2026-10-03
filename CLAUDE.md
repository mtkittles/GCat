# CLAUDE.md — GCat (KodG.pl)

> Kontekst dla Claude Code. Język pracy: polski. Raporty zwięzłe, commit po każdym kroku.

## Co to jest

**GCat** — nauka G‑kodu po polsku: ścieżki lekcji (frezowanie, toczenie), karty kodów G/M
(Fanuc + Sinumerik), symulator 2D/3D toru narzędzia z walidatorem, zadania, gotowe programy,
kalkulatory, słownik. Stack: **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind 4 + three.js
+ CodeMirror 6**. Wszystko statyczne (SSG), deploy na Vercel.

## Gdzie co jest

- `content/*.json` — karty kodów (`gcodes.json`), zadania, słownik, tabela referencyjna, archiwum starych lekcji.
- `src/content/nauka/*.ts` — lekcje ścieżek (szablon `src/lib/lesson.ts`), plan kursu w `src/lib/course.ts`.
- `src/content/articles-*.ts` — pełne artykuły kart; `src/content/programy/` — galeria programów.
- `src/lib/parser/` — tokenizer, interpreter (stan modalny, cykle, podprogramy, tokarka Fanuc A), `validate.ts`, `stats.ts`.
- `src/components/simulator/` — symulator 2D (canvas), 3D (three.js), edytor, narzędzia, półfabrykat.
- `src/components/lesson/` — widok lekcji, ćwiczenia interaktywne, rysunki `figs-*.tsx`.
- `src/lib/progress.ts`, `exercisesDone.ts`, `app/symulator/programs.ts` — stan w przeglądarce; `src/lib/sync.ts`, `auth.ts`, `supabase.ts` — konto i synchronizacja; `entitlements.ts` — plany Free/Pro; `supabase/migrations/` — schemat bazy.
- `docs/karty-kodow.md` — standard opracowania kart i lekcji + tabela statusu audytu. **Czytaj przed pracą nad treścią.**
- `docs/audyt-tresci-2026-10.md` — raport audytu treści.

## Polecenia

    npm run dev            # http://localhost:3000
    npm run lint
    npm run build          # musi przechodzić przed pushem
    npm run test           # vitest: parser, walidator, checker
    npm run audit:nauka    # spójność lekcji (odnośniki, testy, rysunki, źródła)
    npm run audit:programy # każdy program z treści przez parser + walidator
    npm run test:calc      # kalkulatory

## Zasady

1. **Nie wymyślamy treści technicznej.** Każde twierdzenie o sterowaniu musi mieć źródło
   (dokument, wersja, rozdział) albo oznaczenie „zależy od sterowania / do weryfikacji”.
   Unikamy „zawsze”, „wyłącznie”, „na każdym sterowaniu”.
2. **Odnośniki `[[G17]]`, `[[hasło|etykieta]]` muszą się rozwiązywać** — sprawdza to `audit:nauka`.
3. **Przykłady w treści mają przechodzić własny walidator bez ostrzeżeń** (komplet S/M03, tryb posuwu,
   G43 po wymianie narzędzia). Przykład tokarski na karcie „frez + tok” ma `exampleMode: "lathe"`.
4. **Symulator i parser zmieniamy świadomie** — każda zmiana w `src/lib/parser` i
   `src/components/simulator` z testem w `tests/` i przebiegiem `audit:programy`.
5. Sekrety tylko w zmiennych środowiskowych (Vercel, lokalnie `.env.local`). Nic w repo. Konto: `supabase/README.md`;
   bez `NEXT_PUBLIC_SUPABASE_*` strona działa bez konta (postęp w przeglądarce). Klucz `service_role` nigdy w kliencie.
6. Gałęzie: `sprint-N/nazwa` → draft PR do `main`. Nie commitujemy bezpośrednio na `main`.
7. Po każdej sesji: krótkie podsumowanie `.md` dla użytkownika (zadania, commity, decyzje, env vary).

## Czego nie robić

- ❌ Masowych zamian tekstu w treści bez kontroli kontekstu.
- ❌ Dopisywania „uniwersalnych” nagłówków programu bez określenia maszyny i sterowania.
- ❌ Raportowania „gotowe” bez `lint + build + test + audyty`.
