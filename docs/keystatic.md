# Panel treści Keystatic (`/keystatic`)

Edycja **kart kodów** (`content/kody/*.mdx`) i **słownika** (`content/slownik/*.yaml`). Lekcje, programy i zadania dojdą później.

| Gdzie | Tryb | Zapis |
|---|---|---|
| `npm run dev` → http://localhost:3000/keystatic | local | prosto do plików na dysku (potem zwykły commit) |
| produkcja → `https://<domena>/keystatic` | GitHub | commit na gałęzi `tresci/…` → PR → preview Vercela → scalenie |

Konfiguracja: `keystatic.config.ts`. Format plików = format zapisu Keystatic, pilnuje go test round-trip `tests/keystatic.test.ts`.

## Jednorazowa konfiguracja produkcji (tylko kliknięcia)

### 1. GitHub App
1. GitHub → avatar → **Settings → Developer settings → GitHub Apps → New GitHub App**.
2. Wypełnij:
   - **GitHub App name:** np. `GCat Keystatic`. Z nazwy powstaje *slug* (`gcat-keystatic`), widoczny potem w adresie `github.com/apps/<slug>`.
   - **Homepage URL:** `https://<domena>`.
   - **Callback URL:** `https://<domena>/api/keystatic/github/oauth/callback`.
     - Opcjonalnie drugi (*Add Callback URL*): `http://127.0.0.1:3000/api/keystatic/github/oauth/callback`. Przydaje się tylko do testu trybu GitHub lokalnie, normalnie niepotrzebny.
   - **Expire user authorization tokens:** zostaw zaznaczone.
   - **Request user authorization (OAuth) during installation:** nie zaznaczaj.
   - **Webhook → Active:** odznacz.
   - **Repository permissions:**
     - **Contents:** Read and write;
     - **Pull requests:** Read and write;
     - **Metadata:** Read-only (ustawi się samo).
   - **Where can this GitHub App be installed?** Only on this account.
3. **Create GitHub App**. Na stronie aplikacji:
   - skopiuj **Client ID**;
   - kliknij **Generate a new client secret** i skopiuj sekret (widać go tylko raz).
4. W menu po lewej **Install App → Install** przy koncie `mtkittles` → **Only select repositories** → `mtkittles/GCat` → **Install**.

### 2. Zmienne w Vercel
Vercel → projekt `gcat` → **Settings → Environment Variables**. Dodaj 4 zmienne, środowisko **Production** (i **Preview**, jeśli chcesz panel także na preview):

| Nazwa | Wartość | Uwagi |
|---|---|---|
| `KEYSTATIC_GITHUB_CLIENT_ID` | Client ID z kroku 1.3 | |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | Client secret z kroku 1.3 | zaznacz **Sensitive** |
| `KEYSTATIC_SECRET` | losowy ciąg ≥ 32 znaki, np. wynik `openssl rand -hex 32` | zaznacz **Sensitive**; szyfruje ciasteczka sesji |
| `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | slug aplikacji, np. `gcat-keystatic` | jawny (to tylko nazwa w adresie) |

Potem **Deployments → ostatni deployment produkcji → Redeploy**: zmienne działają dopiero w nowym buildzie.

Bez tych zmiennych strona działa normalnie. `/keystatic` pokazuje wtedy „Log in with GitHub”, a API zwraca 503 z listą brakujących zmiennych.

### 3. Ochrona gałęzi `main` (ważne)
`branchPrefix: "tresci/"` tylko **podpowiada nazwę** nowej gałęzi. **Nie blokuje** zapisu prosto na `main`: osoba z prawem zapisu mogłaby w panelu wybrać `main` i zapisać. Blokadę daje GitHub:

GitHub → repo `GCat` → **Settings → Branches → Add branch ruleset**. Możesz też użyć *Add classic branch protection rule*.
- **Ruleset name:** `main`.
- **Enforcement status:** Active.
- **Target branches → Add target → Include default branch.**
- Zaznacz:
  - **Restrict deletions**;
  - **Require a pull request before merging** (*Required approvals*: 0, bo jesteś jedyną osobą);
  - **Block force pushes**.
- **Bypass list:** zostaw pustą. Inaczej Ty, jako właściciel, nadal mógłbyś zapisać prosto na `main`.
- **Create**.

Od tej chwili zapis w panelu na `main` kończy się błędem GitHuba. Zawsze pracuje się na gałęzi `tresci/…`.

## Kto ma dostęp
- `/keystatic` na produkcji wymaga **logowania przez GitHub** („Log in with GitHub”).
- Treść czyta i zapisuje przeglądarka **przez API GitHuba z uprawnieniami zalogowanej osoby**, więc edytować może tylko ktoś z prawem zapisu do `mtkittles/GCat`. Inni po zalogowaniu nie zobaczą repozytorium.
- Sekrety (`KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`) są tylko po stronie serwera Vercela, nigdy w przeglądarce ani w gicie.
- `/keystatic` i `/api/` mają `noindex` i `Disallow` w robots.txt.

## Praca w panelu (produkcja)
1. `https://<domena>/keystatic` → **Log in with GitHub**.
2. Menu gałęzi (u góry po lewej) → **New branch**. Nazwa dostaje prefiks `tresci/`, np. `tresci/g84-tabela`.
3. Edytuj kartę albo hasło → **Save**. Każdy zapis to commit na tej gałęzi.
4. Menu gałęzi → **Create pull request**. Vercel zbuduje preview, a CI sprawdzi treść (markery, kotwice, rysunki, round-trip).
5. Na karcie przycisk **Preview** (ikona ↗ obok *Save*) otwiera tę kartę na preview Vercela bieżącej gałęzi (`/api/podglad`). Preview jest gotowe ok. 1–2 min po zapisie. Przy bardzo długiej nazwie gałęzi otwiera się lista PR z linkiem do preview.
6. Scal PR na GitHubie, gdy wszystko jest zielone.

## Czego nie zmieniać w panelu
- **Slug karty i kotwica hasła** (pola „— nie zmieniać”). To adresy `/kody/…` i `/slownik#…`. Keystatic nie ma pola tylko do odczytu, ale zmianę wyłapie test migawki kotwic (CI na PR).
- **Kotwice nagłówków** `{#…}` na końcu nagłówka w artykule.
- Markery `[[klucz]]` / `[[klucz|etykieta]]` wpisuje się normalnie. W pliku zapisują się jako `\[\[…]]`, co jest poprawne.
