# Konto GCat — Supabase

Strona działa bez konta (postęp w przeglądarce). Konto włącza się przez dwie zmienne środowiskowe:

    NEXT_PUBLIC_SUPABASE_URL=https://<projekt>.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>

Lokalnie w `.env.local` (plik nie trafia do gita), na Vercel w ustawieniach projektu.
Klucz `anon` jest publiczny z założenia — dane chroni RLS (polityki w migracji).

## Uruchomienie

1. Nowy projekt na supabase.com.
2. SQL Editor → wklej `migrations/0001_konto.sql` → Run.
3. Authentication → Providers: **Email** (magic link) włączony; opcjonalnie **Google** (Client ID/Secret z Google Cloud).
4. Authentication → URL Configuration: Site URL = adres produkcyjny, Redirect URLs = `https://<domena>/konto`, `http://localhost:3000/konto`.
5. Zmienne środowiskowe jak wyżej, redeploy.

## Plan Pro

Kolumna `profiles.plan` (`free` / `pro`). Użytkownik nie może jej zmienić (polityka RLS). Do czasu płatności ustawia ją właściciel ręcznie w tabeli; po wdrożeniu Stripe zrobi to webhook z kluczem `service_role`.
