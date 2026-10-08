# Znak GCat — pliki marki

Wszystkie pliki są generowane z jednej geometrii (wektory, tekst zamieniony na krzywe). Nie przerysowujemy ani nie przebarwiamy ich ręcznie.

| Plik | Do czego |
|---|---|
| `gcat-znak-{dark,light}.svg` | sam znak bez wąsów — nagłówek mobilny, małe rozmiary (od 16 px) |
| `gcat-znak-wasy-{dark,light}.svg` | znak z wąsami — duże formaty |
| `gcat-poziomy-{dark,light}.svg` | znak + napis GCAT — nagłówek, stopka (`BrandLogo`) |
| `gcat-pionowy-{dark,light}.svg/.png` | pełny znak: wąsy, linia, GCAT, hasło |
| `gcat-baner-*-{dark,light}.svg/.png` | baner 1920×600: pełne tło / transparent z siatką / transparent czysty |

`dark` = na ciemne tło (biel + pomarańcz), `light` = na jasne tło (grafit + pomarańcz).

Kolory: pomarańcz `#F97316`, biel `#FFFFFF`, grafit `#15171B`, tło strony `#111214`.
Hasło „Ucz się · Programuj · Skrawaj” w interfejsie renderuje komponent `<Tagline />` (tekst, nie obraz).

Ikony aplikacji i favicon (`public/icon*.png`, `public/apple-touch-icon.png`, `public/icon.svg`, `src/app/favicon.ico`) — znak bez wąsów na tle `#111214`.
