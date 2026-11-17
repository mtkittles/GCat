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
- `src/lib/edytor/`, `src/components/edytor/`, `/edytor` — edytor treści na stronie: MDX ↔ dokument TipTap (blok bez zmian zapisuje się bajt w bajt, `tests/edytor.test.ts`), frontmatter przez `yaml` (zmienia się tylko edytowane pole), walidacja jak `npm run tresci`, API `/api/edytor/*` (lokalnie dysk + `git log`; produkcja: token GitHub z logowania panelu, zapis = gałąź `tresci/…` + PR + scalenie). Widok karty wspólny ze stroną: `src/components/karta/CardView.tsx`. Słownik: `/edytor/slownik/<kotwica>` (karta hasła z `app/slownik/Glossary.tsx`). Rysunki i obrazy publikują się razem z treścią (`components/edytor/pending.tsx`: rysownik nad edytorem, „Przerysuj w rysowniku” dla rysunków z `diagrams.tsx` — oryginał zostaje w kodzie; obrazy do `public/rysunki/`, sygnatura pliku sprawdzana). Narzędzia redakcji tylko dla konta GitHub z prawem zapisu (`lib/edytor/admin.ts`).
- `src/lib/rys/`, `src/components/rys/` — rysownik: model rysunku (warstwy `layers` + pole `l`, grupy `g`, układ współrzędnych `axes`), renderer wspólny z `fig.tsx`, edytor (`/rysownik`), pole panelu; rysunki w `content/rysunki/*.yaml` (README obok). Śledzenie jak w CAD: `lib/rys/track.ts`; edycja geometrii (utnij, wydłuż, zaokrąglij, fazuj, odsuń, lustro, rozbij, złącz) na krzywych L/A, łuk styczny do dwóch krzywych (`filletCurves`), faza d × kąt: `lib/rys/edit.ts`; ołówek odręczny z wygładzaniem: `lib/rys/sketch.ts`; wymiary robocze („Wstaw jako wymiar”): `components/rys/workdims.tsx`; polilinia może mieć łuki (pole `b`, wypukłość jak bulge w CAD). Obszary nachodzących figur i operacje logiczne (suma, różnica, część wspólna, „poza wspólną”): `lib/rys/regions.ts`; krycie elementu `op` i warstwy `layers[].op` (zapis tylko poniżej 100%). Menu Plik i eksport SVG/PNG/PDF: `components/rys/exportRys.tsx`, `Extras.tsx`; szkice, kopie automatyczne i kalka w IndexedDB (`lib/rys/idb.ts`). `src/lib/edycja.ts`, `/edycja` — tryb edycji i adresy wpisów w panelu.
- `docs/karty-kodow.md` — standard opracowania kart i lekcji + tabela statusu audytu. **Czytaj przed pracą nad treścią.**
- `docs/audyt-tresci-2026-10.md` — raport audytu treści.

## Polecenia

    npm run dev            # http://localhost:3000
    npm run lint
    npm run build          # musi przechodzić przed pushem
    npm run test           # vitest: parser, walidator, checker
    npm run audit:nauka    # spójność lekcji (odnośniki, testy, rysunki, źródła)
    npm run audit:programy # każdy program z treści przez parser + walidator
    npm run audit:jezyk    # miary języka: zdania > 25 słów, pauzy i ozdobniki na 1000 słów (--karty)
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

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
