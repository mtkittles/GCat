# content/technologia — dział Technologia

> Źródło prawdy dla `/technologia`. Strony, wyszukiwarka, mapa strony i edytor czytają te pliki przez `npm run tresci`
> (→ `content/.generated/technologia.json`, `szukaj-technologia.json`). Kontrola: `npm run audit:technologia`.

**Działy:** `dzialy.yaml` — lista (`slug`, `title`, `short`, `zakres`, `icon`, `order`, `big`). `slug` = katalog = adres `/technologia/<slug>`.
Ikony: `frez`, `plytka`, `wzory`, `proces`, `mocowanie`, `materialy`, `strategie` (`src/components/technologia/icons.tsx`).

**Artykuł:** `<dział>/<slug>.mdx` → `/technologia/<dział>/<slug>`. Schemat: `artykulSchema` w `src/lib/mdx/schema.ts`.
Nowy artykuł najlepiej z edytora (`/edytor/technologia/nowy`: dział, szablon, tytuł) — plik powstaje w formacie zapisu edytora.

```mdx
---
title: Prędkość skrawania i obroty wrzeciona
slug: predkosc-skrawania          # = nazwa pliku; NIE zmieniać (adres)
dzial: obliczenia                 # = katalog
typ: temat                        # narzedzie | temat | porownanie (szablon)
order: 10                         # kolejność w dziale (co 10)
short: >-
  Jedno zdanie pod tytułem; widać je na liście działu i w wyszukiwarce.
obrobka:                          # frezowanie | toczenie | wiercenie (filtr na liście)
  - frezowanie
poziom: 1                         # 1 podstawy · 2 średni · 3 zaawansowany
normy: []                         # np. ISO 513
stan: szkic                       # szkic = plakietka „do weryfikacji”; sprawdzony po weryfikacji
plan: free                        # pro = tylko konto redakcji i plan Pro (znika z list, wyszukiwarki, mapy)
dodano: 2026-11-21                # „Ostatnio dodane”
sources:                          # rejestr src/content/nauka/sources.ts (jak karty kodów)
  - id: sandvik-wzory-frezowanie
    where: co dokładnie źródło potwierdza
    loc: rozdział, strona
powiazane:
  kody: [g96-g97]                 # slugi kart
  lekcje: [F2.2]                  # id gotowych lekcji
  hasla: [vc-prędkość-skrawania]  # kotwice haseł słownika
  artykuly: [narzedzia/frez-trzpieniowy-walcowy]
  kalkulator: true
---
Treść jak w kartach kodów (content/kody/README.md): nagłówki z kotwicą \{#…}, markery [[…]], komponenty
<Diagram>, <Rys>, <Obraz>, <Note>, <Code>, <Sim>, <Demo>, <Widget>, <Table>, <Kolor>.
```

**Szablony** (`src/lib/edytor/szablony.ts`): Karta narzędzia — Budowa, Rodzaje, Zastosowanie, Dobór, Parametry startowe,
Typowe błędy, W G-kodzie; Temat — wstęp, Teoria, Wzór i przykład, Na co uważać; Porównanie — `<Table sort="true">` + Wnioski.

**Zasady treści:**
- Każda wartość liczbowa ma źródło w polu `sources` (CLAUDE.md, zasada 1). Wartości z katalogu producenta — „zależy od narzędzia”; przykład rachunkowy oznacz „wartości przyjęte do rachunku”.
- Programy w `<Sim>`/`<Demo>` przechodzą parser i walidator bez ostrzeżeń (`audit:programy`, `audit:technologia`).
- Narzędzie w symulatorze wynika z komentarza przy wywołaniu T: `(FREZ FI10)`, `(FREZ KULISTY FI10)`, `(FREZ FI12 R1.5)` (z promieniem naroża),
  `(FREZ FAZOWY FI10 90ST)`, `(FREZ TEOWY FI20 SZER6)`, `(GLOWICA FI80)`, `(NAWIERTAK FI10 90ST)`, `(WIERTLO FI8)`,
  `(GWINTOWNIK M10X1.5)`, `(FREZ DO GWINTOW FI12 P2)` (średnica i skok), `(ROZWIERTAK FI10 H7)`. Głowicy wytaczarskiej frezarki
  symulator nie ma — program z G76 idzie w `<Code>`.
- Tokarka (`<Sim mode="lathe">`): nóż z kodu płytki ISO albo słowa NOZ — `(NOZ CNMG 120408)` (kształt C, promień naroża 0,8),
  wytaczak `(WYTACZAK DCMT 070204)`, przecinak / nóż do rowków z szerokością `(PRZECINAK 3MM)`, `(NOZ DO ROWKOW 3MM)`
  (punkt odniesienia na lewym narożu), nóż do gwintów `(NOZ DO GWINTOW 60ST)`, wewnętrzny `(NOZ DO GWINTOW WEWN 60ST)`,
  wiertło w osi `(WIERTLO FI20)`. Pręt: komentarz `(SUROWKA: PRET FI40, WYSIEG 60)`.
- Półfabrykat frezarki: komentarz `(POLFABRYKAT 100X60X20)` — X × Y × Z w mm od zera detalu (X i Y w plus, Z w dół od Z0).
  Bez niego symulator bierze obrys ruchów roboczych powiększony o promień narzędzia.
- Symulator liczy ubytek materiału z góry (mapa wysokości), więc podcięć (frez teowy) nie pokazuje — taki program idzie w `<Code>`
  i trzeba go sprawdzić parserem i walidatorem ręcznie.
- Miniatura na liście = pierwszy `<Diagram>`/`<Rys>` w treści.
- `<Table sort="true">` — sortowanie kliknięciem w nagłówek (liczby i zakresy „200–1200” sortują się liczbowo).
- `<DekoderISO kod="CNMG 120408" />` — oznaczenie płytki wg ISO 1832 (zapis metryczny): klik w znak → pozycja, odczyt i rysunek. Dane: `src/lib/iso1832.ts`; zły zapis kodu zatrzymuje `npm run tresci`. W edytorze: przycisk „Dekoder ISO”.
- Format pliku = zapis edytora (test `tests/technologia.test.ts`: zapis od zera daje ten sam plik).
