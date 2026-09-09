import type { Block } from "@/lib/article";

/*
  Karta G01 — ruch roboczy po prostej. Układ referencyjny, treść własna,
  pojęcia oznaczone [[...]] mają podpowiedzi, przykłady w formie animacji.
*/

export const g01: Block[] = [
  { t: "p", x: "**G01** prowadzi narzędzie **po linii prostej** z aktualnego położenia do zadanego punktu, z prędkością ustaloną adresem **F**. To podstawowy ruch skrawający — konturowanie, planowanie, zagłębianie, toczenie wzdłużne i poprzeczne opierają się właśnie na nim." },

  { t: "h", x: "Co dokładnie robi sterownik" },
  { t: "p", x: "Sterownik rozkłada zadany odcinek na wszystkie osie biorące udział w ruchu i tak dobiera ich prędkości, żeby **skończyły ruch w tej samej chwili**. To nazywa się interpolacją liniową. Efekt jest taki, że tor jest zawsze idealną prostą, a wypadkowa prędkość końcówki narzędzia równa się dokładnie temu, co zapisałeś przy F — niezależnie od tego, czy ruch idzie wzdłuż jednej osi, czy po skosie w trzech." },
  { t: "note", kind: "info", x: "To jest właśnie różnica względem [[G00]]. Tam każda oś jedzie najszybciej, jak potrafi, i kończy, kiedy skończy — tor bywa łamany. Tu osie są zsynchronizowane i tor jest przewidywalny co do setnej milimetra." },

  { t: "h", x: "Składnia" },
  { t: "code", x: "G01 X84.5 Y32.0 Z-3.0 F250", caption: "Fanuc i Sinumerik zapisują to tak samo; Sinumerik dopuszcza skrót `G1`." },
  { t: "table", head: ["Adres", "Znaczenie"], rows: [
    ["X, Y, Z", "Punkt końcowy. Bezwzględnie przy [[G90]], przyrostowo przy [[G91]]"],
    ["F", "Posuw. Przy [[G94]] w milimetrach na minutę, przy [[G95]] w milimetrach na obrót wrzeciona"],
    ["A, B, C", "Osie obrotowe — na maszynach wieloosiowych mogą jechać razem z liniowymi w jednym bloku"],
  ] },
  { t: "note", kind: "warn", x: "**G01 bez F to najczęstszy błąd początkującego.** Większość sterowników zgłasza wtedy alarm, ale część używa po prostu posuwu z poprzedniej operacji — a ten mógł być dobrany do zupełnie innego narzędzia. Posuw jest modalny: raz podany obowiązuje aż do zmiany." },

  { t: "h", x: "Ten sam punkt, cztery zapisy" },
  { t: "p", x: "Z punktu (10, 10) chcemy dojechać do (90, 70). Poniżej cztery sposoby zapisania tego samego ruchu — różnią się trybem współrzędnych i liczbą bloków, ale narzędzie kończy w tym samym miejscu." },

  { t: "demo", title: "Wariant 1 — prosto, współrzędne bezwzględne",
    src: "G21 G90 G17 G54\nS2000 M03\nG00 X10 Y10 Z2\nG01 Z-2 F100\nG01 X90 Y70 F300\nG00 Z10\nM30",
    caption: "Jeden blok, jeden odcinek skośny. Sterownik prowadzi obie osie tak, by dojechały równocześnie — dlatego tor jest prostą, a nie łamaną." },

  { t: "demo", title: "Wariant 2 — prosto, współrzędne przyrostowe",
    src: "G21 G90 G17 G54\nS2000 M03\nG00 X10 Y10 Z2\nG01 Z-2 F100\nG91\nG01 X80 Y60 F300\nG90\nG00 Z10\nM30",
    caption: "Ten sam odcinek zapisany jako przesunięcie o 80 w X i 60 w Y. Tor identyczny; różnica jest wyłącznie w sposobie liczenia współrzędnych. Więcej na karcie [[G91]]." },

  { t: "demo", title: "Wariant 3 — dwoma bokami zamiast po skosie",
    src: "G21 G90 G17 G54\nS2000 M03\nG00 X10 Y10 Z2\nG01 Z-2 F100\nG01 X90 F300\nG01 Y70\nG00 Z10\nM30",
    caption: "Najpierw wzdłuż X, potem wzdłuż Y. Punkt końcowy ten sam, ale narzędzie zbiera materiał wzdłuż zupełnie innej drogi — i pokonuje dłuższy odcinek, więc obróbka trwa dłużej." },

  { t: "demo", title: "Wariant 4 — łańcuch bloków bez powtarzania G01",
    src: "G21 G90 G17 G54\nS2000 M03\nG00 X10 Y10 Z2\nG01 Z-2 F100\nG01 X90 F300\nY70\nX30\nY30\nX10 Y10\nG00 Z10\nM30",
    caption: "Bloki po pierwszym G01 zawierają same współrzędne. Funkcja jest modalna, więc wszystkie są ruchami roboczymi z tym samym posuwem. Tak zapisuje się kontury w praktyce." },

  { t: "h", x: "Modalność w praktyce" },
  { t: "p", x: "Skoro G01 i posuw F pozostają aktywne, kontur można zapisać bardzo zwięźle. Oba poniższe zapisy dają identyczny tor:" },
  { t: "code", x: "G01 X90 F300        G01 X90 F300\nG01 Y70 F300        Y70\nG01 X30 F300        X30\nG01 Y30 F300        Y30", caption: "Po lewej zapis pełny, po prawej skrócony. W praktyce stosuje się ten drugi — jest krótszy i mniej podatny na literówki." },
  { t: "note", kind: "warn", x: "Odwrotna strona medalu: jeżeli zapomnisz przełączyć się na [[G00]] przed odjazdem, powrót na wysokość bezpieczną wykona się z posuwem roboczym. Program nie zepsuje detalu, ale czas cyklu urośnie o kilkanaście sekund na każdym przejeździe." },

  { t: "h", x: "Dobór posuwu" },
  { t: "p", x: "Przy frezowaniu posuw liczy się z posuwu na ostrze: **Vf = n × z × fz**, gdzie n to obroty, z liczba ostrzy, a fz [[fz — posuw na ostrze|posuw na ostrze]] z katalogu narzędzia. Frez ⌀10 z czterema ostrzami przy 3000 obr/min i fz 0,05 mm daje F = 3000 × 4 × 0,05 = **600 mm/min**." },
  { t: "p", x: "Przy toczeniu podaje się wprost posuw na obrót, bo bezpośrednio odpowiada za grubość wióra i [[Rz — chropowatość|chropowatość]]: typowo 0,25–0,45 mm/obr zgrubnie i 0,08–0,20 mm/obr wykańczająco. Gotowe wartości dla konkretnego materiału policzysz w [kalkulatorze](/kalkulator)." },
  { t: "note", kind: "warn", x: "Pomylenie jednostek to najdroższy błąd przy G01. `F0.2` na frezarce w trybie [[G94]] oznacza 0,2 mm na minutę — narzędzie praktycznie stoi i wypala się w materiale. Odwrotnie, `F250` na tokarce w trybie [[G95]] to 250 mm na obrót, czyli natychmiastowe zniszczenie płytki." },

  { t: "h", x: "Zagłębianie w materiał" },
  { t: "p", x: "Ruch prosto w dół obciąża narzędzie inaczej niż ruch boczny — pracuje wtedy środek freza, gdzie prędkość skrawania spada do zera. Dlatego posuw zagłębiania przyjmuje się na poziomie **30–50% posuwu konturowego**, a frezy o środku niecentrującym w ogóle nie mogą zagłębiać się pionowo." },
  { t: "ul", items: [
    "**Pionowo** — tylko frezami do zagłębiania pionowego albo w otwór wstępny.",
    "**Po rampie** — ruch skośny G01 z jednoczesną zmianą X i Z; kąt 2–5° dla stali, do 15° dla aluminium.",
    "**Po helisie** — łuk [[G02]] lub [[G03]] z narastającym Z; najłagodniejsze dla narzędzia.",
  ] },
  { t: "demo", title: "Zagłębianie po rampie",
    src: "G21 G90 G17 G54\nS3000 M03\nG00 X10 Y25 Z2\nG01 X60 Z-1 F250\nG01 X10 Z-2\nG01 X60 Z-3\nG01 X10 Z-4\nG01 X60 F400\nG00 Z10\nM30",
    caption: "Narzędzie schodzi o 1 mm na każdym przejeździe wzdłuż rowka, zamiast wbijać się pionowo. Włącz widok 3D w symulatorze, żeby zobaczyć powstający rowek." },

  { t: "h", x: "Współrzędne biegunowe" },
  { t: "p", x: "Fanuc pozwala przełączyć się na współrzędne biegunowe funkcją **G16** (kasowanie: G15). Zamiast X i Y podajesz wtedy promień i kąt. Zapis `G01 X100 Y36.87` w trybie biegunowym oznacza: przesuń się o 100 mm pod kątem 36,87° — czyli dokładnie tam, gdzie prowadzi X80 Y60 w układzie prostokątnym." },
  { t: "p", x: "Największy pożytek jest przy elementach rozmieszczonych po okręgu, na przykład otworach na śruby wokół kołnierza. Zamiast liczyć sinusy dla każdego otworu, podajesz ten sam promień i kolejne kąty." },
  { t: "note", kind: "info", x: "Symulator nie interpretuje jeszcze G16 — przykłady na tej karcie używają wyłącznie współrzędnych prostokątnych." },

  { t: "h", x: "Dobre praktyki" },
  { t: "ul", items: [
    "**Sprawdzaj posuw przy każdym nowym narzędziu**, nawet jeśli F jest już aktywne z poprzedniej operacji — było dobrane do innej średnicy i innej liczby ostrzy.",
    "**Uruchamiaj pierwszy raz z korekcją posuwu na 50%**, z ręką nad przyciskiem zatrzymania.",
    "**Nie mieszaj bezmyślnie G00 i G01.** Klasyczny wypadek to zagłębienie na G00 wskutek złej kolejności bloków; opisane szerzej na karcie [[G00]].",
    "**Domykaj kontury.** Ostatni punkt powinien pokrywać się z pierwszym, inaczej zostaje cienka ścianka materiału.",
    "**Zaokrąglaj naroża**, gdzie to możliwe. Ostry zwrot o 90° oznacza chwilowe zatrzymanie osi i skok obciążenia narzędzia; łuk choćby R2 daje płynny ruch i lepszą powierzchnię.",
    "**Powtarzalne fragmenty wynoś do podprogramów** — patrz [[M98]]. Dziesiątki podobnych bloków G01 to prosta droga do literówki.",
  ] },

  { t: "h", x: "Różnice między sterownikami" },
  { t: "table", head: ["Zagadnienie", "Fanuc", "Sinumerik", "Heidenhain"], rows: [
    ["Zapis", "`G01` lub `G1`", "`G1`", "`L X.. Y.. R0 F..`"],
    ["Jednostka posuwu", "G94 / G95 (tokarki starsze: G98 / G99)", "G94 / G95", "F w mm/min, `FU` w mm/obr"],
    ["Współrzędne biegunowe", "G15 / G16", "`AP=` i `RP=`", "`LP PR.. PA..`"],
    ["Tryb przyrostowy", "G91 albo adresy U, W na tokarce", "G91 albo `IC()` przy pojedynczej osi", "`IX`, `IY`, `IZ`"],
  ] },

  { t: "h", x: "Typowe błędy" },
  { t: "ul", items: [
    "**Brak F w pierwszym bloku roboczym** — alarm albo posuw odziedziczony po poprzedniej operacji.",
    "**Ten sam posuw do zagłębiania i do konturu** — przeciążenie środka freza przy wejściu w materiał.",
    "**Pomylone jednostki posuwu** — mm/min zamiast mm/obr albo odwrotnie.",
    "**Pozostawione G01 przed odjazdem** — powrót na wysokość bezpieczną z posuwem roboczym marnuje czas cyklu.",
    "**Niedomknięty kontur** — brakujący ostatni blok zostawia ściankę materiału w narożniku.",
    "**Zapomniany powrót do [[G90]]** po fragmencie przyrostowym — dalsze bloki jadą w zupełnie inne miejsca.",
  ] },
];
