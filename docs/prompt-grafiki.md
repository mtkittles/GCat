# GCat — prompt do ChatGPT: nowe grafiki kart i banerów

Jak używać: w ChatGPT (generator obrazów) wklej **Prompt bazowy** razem z załączonym logo
`public/brand/gcat-pionowy-dark.png` (pionowe: znak + GCAT). Potem dla każdej grafiki wklejaj
osobno jej **opis sceny** z tabeli — jedna grafika na wiadomość, w tej samej rozmowie, żeby styl
się nie rozjeżdżał. Gotowe pliki zapisz pod podanymi nazwami (JPG, jakość ~85) i podmień w repo —
kod nie wymaga zmian dla plików nadpisywanych; dla trzech nowych (`kody`, `programy`, `slownik`)
wystarczy zmienić pole `img` w `src/components/HubTiles.tsx`.

---

## Prompt bazowy (wklej raz, na początku rozmowy)

> Tworzysz serię fotorealistycznych grafik do serwisu GCat — nauki programowania obrabiarek CNC (G-kod, frezowanie, toczenie). W załączniku jest logo GCat w wersji pionowej (znak kota z frezem i napisem GCAT). Wszystkie grafiki muszą wyglądać jak jedna sesja zdjęciowa.
>
> **Styl i światło:** ciemne, techniczne zdjęcie makro z hali produkcyjnej; stal nierdzewna i aluminium, wióry, krople chłodziwa; jedno ciepłe pomarańczowe światło kontrowe (kolor #F97316) i chłodne, neutralne światło wypełniające; głęboka czerń i grafit w tle (#111214, #1A1B1F); płytka głębia ostrości, delikatny bokeh. Bez neonów, bez fioletów, bez zieleni w oświetleniu.
>
> **Logo:** odwzoruj logo z załącznika jako grawer laserowy lub płytkie frezowanie w metalowej powierzchni detalu — matowy grawer na błyszczącej stali. Zachowaj dokładnie kształt znaku i litery G C A T, proporcje i układ pionowy (znak nad napisem). Nie dodawaj innych napisów. Logo zajmuje najwyżej 15–20% kadru i stoi w prawej lub środkowej części obrazu, nigdy w lewym dolnym rogu. Jeżeli nie potrafisz wiernie odwzorować logo — zostaw w tym miejscu gładką, czystą powierzchnię metalu (logo nałożę sam).
>
> **Kompozycja (ważne — na grafiki nakładam tekst):** format poziomy 3:2 (1536×1024). Główny motyw w środkowym poziomym pasie kadru i przesunięty w prawo. Lewa dolna ćwiartka spokojna i ciemniejsza — tam będzie biały tytuł. Kadr jest przycinany do proporcji 3:1 (pasek) i 3:2 (kafelek), więc nic istotnego nie może leżeć przy górnej ani dolnej krawędzi.
>
> **Zakazy:** żadnego tekstu, cyfr, wymiarów, interfejsów z czytelnymi literami, znaków wodnych, ramek ani ludzi (najwyżej dłoń w rękawicy poza ostrością). Żadnych innych marek ani logotypów producentów maszyn i narzędzi.
>
> Potwierdź, że rozumiesz styl. Opisy kolejnych grafik będę wysyłał pojedynczo.

---

## Lista grafik

| # | Plik (ścieżka w repo) | Gdzie się wyświetla | Opis sceny (wklej po prompcie bazowym) |
|---|---|---|---|
| 1 | `public/img/hero-cnc.jpg` | baner strony głównej (PC i telefon) | Frez trzpieniowy wchodzi w płytę ze stali, snop pomarańczowych iskier i wiórów, na płycie wygrawerowane logo GCat. Ujęcie z góry pod kątem ~35°, wrzeciono w prawej górnej części kadru. |
| 2 | `public/img/clean/banner-mill.jpg` | karta „Frezowanie” (główna, /nauka), banery lekcji frezowania | Pryzmatyczny detal ze stali na stole frezarki: kieszeń z zaokrąglonymi narożami i kontur, frez walcowy w trakcie przejścia, wióry. Logo wygrawerowane na płaskiej ścianie detalu. |
| 3 | `public/img/clean/banner-turn.jpg` | karta „Toczenie”, banery lekcji toczenia, /slownik | Wałek ze stali w uchwycie tokarskim, rombowa płytka skrawająca (kształt C, 80°) w oprawce przy powierzchni, spiralny wiór. Logo wygrawerowane na obwodzie walca, czytelne mimo krzywizny. |
| 4 | `public/img/clean/banner-kody.jpg` *(nowy)* | kafelek „Kody G i M” | Gładka płyta aluminiowa z wygrawerowanym logo; nad nią unoszą się świetliste linie toru narzędzia: przerywana bursztynowa (#F59E0B, szybki przejazd), ciągła zielona (#22C55E, ruch roboczy) i błękitny łuk (#38BDF8, interpolacja kołowa). Linie cienkie, techniczne, bez napisów. |
| 5 | `public/img/clean/banner-programy.jpg` *(nowy)* | kafelek „Gotowe programy” | Kilka gotowych, czystych detali ułożonych na granitowej płycie pomiarowej: płytka z otworami, tuleja, wałek stopniowany, kołnierz. Na jednym detalu wygrawerowane logo. Światło jak w katalogu produktów. |
| 6 | `public/img/clean/banner-drill.jpg` | kafelek „Kalkulatory”, /kody, kalkulator wiercenia | Wiertło spiralne w otworze, strumień chłodziwa przez wiertło, rząd wywierconych otworów na bloku stali. Logo na bocznej ścianie bloku. |
| 7 | `public/img/clean/banner-thread.jpg` | kalkulator gwintowania, karty gwintów | Gwintownik maszynowy nad otworem gwintowanym w bloku stali, obok kilka gotowych otworów z widocznym zwojem gwintu. Logo na ścianie bloku. |
| 8 | `public/img/clean/banner-tasks.jpg` | kafelek „Zadania”, /zadania, /fiszki, /konto | Ciemny tablet lub karta rysunkowa z cienkim, jasnym rysunkiem technicznym detalu (linie bez wymiarów i liczb), pomarańczowy znacznik „✓” w polu wyboru, obok metalowy ołówek techniczny. Logo jako tłoczenie na obudowie tabletu. |
| 9 | `public/img/clean/banner-simulator.jpg` | /symulator, /nauka, /programy | Detal z kieszenią w kształcie znaku GCat, nad nim pomarańczowa świetlista ścieżka narzędzia i delikatna siatka osi XYZ w powietrzu (bez liczb), frez nad detalem. |
| 10 | `public/img/clean/banner-slownik.jpg` *(nowy)* | kafelek „Słownik” | Szuflada narzędziowa z ułożonymi w rzędach narzędziami: frezy, wiertła, płytki skrawające w gniazdach, oprawka narzędziowa. Logo wygrawerowane na oprawce. |

Wersja na telefon nie jest potrzebna — ten sam plik przycina się automatycznie (kafelek 3:2, pasek 3:1).

---

## Po wygenerowaniu — kontrola przed wgraniem

- Logo nie jest zniekształcone (litery G C A T, znak nad napisem). W razie wątpliwości wygeneruj wersję bez logo i nałóż `gcat-pionowy-dark.png` w edytorze jako grawer (tryb mieszania „Multiply/Overlay”, krycie 60–70%).
- Na obrazie nie ma żadnego innego tekstu, cyfr ani marek.
- Lewy dolny róg jest ciemny — biały tytuł musi być czytelny bez dodatkowego tła.
- Rozmiar 1536×1024, JPG ~85, plik do ~350 kB (Next.js i tak generuje mniejsze warianty).
- Pliki `public/img/banner-*.jpg` (bez `clean/`) to stare wersje z wtopionym napisem — nie trzeba ich odtwarzać.
