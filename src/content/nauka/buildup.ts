import type { Track } from "@/lib/course";

/*
  Program narastający: jeden detal przewodni na ścieżkę.
  Każda linia ma `since` — lekcję, w której się pojawia. Lekcja pokazuje linie
  ze swojej i wcześniejszych lekcji; nowe są wyróżnione, stare mają dymek z przypomnieniem.

  Frezowanie: płytka 80 × 50 × 20, naroża R10, obróbka konturu frezem Ø10 na głębokość 5 mm.
  Do czasu lekcji o korekcji promienia (F4.2) program prowadzi środek freza,
  odsunięty od konturu o promień 5 mm — stąd X−5, Y55 i łuki R15.
*/

export interface BuildLine { code: string; since: string; note: string }

export const buildup: Record<Track, { title: string; lines: BuildLine[] }> = {
  frezowanie: {
    title: "Płytka 80 × 50",
    lines: [
      { code: "O1000 (PLYTKA 80X50X20 - GCAT)", since: "F1.1", note: "Numer programu i nazwa detalu w komentarzu." },
      { code: "(ZERO W: LEWY DOLNY NAROZNIK, Z0 NA GORZE)", since: "F0.1", note: "Gdzie leży zero detalu. Wszystkie współrzędne niżej liczymy od tego punktu." },
      { code: "(P1 X0 Y0 / P2 X80 Y0 / P3 X80 Y50 / P4 X0 Y50)", since: "F0.1", note: "Naroża płytki odczytane z rysunku, względem zera W." },
      { code: "G21 G90 G17", since: "F1.4", note: "Milimetry, wymiary absolutne, płaszczyzna XY." },
      { code: "G54", since: "F0.3", note: "Aktywne przesunięcie zera detalu z rejestru G54." },
      { code: "T1 M06 (FREZ FI10)", since: "F2.1", note: "Wymiana na narzędzie nr 1 — frez Ø10." },
      { code: "G43 H1 Z50", since: "F4.1", note: "Włączenie korekcji długości narzędzia nr 1 i dojazd na Z50." },
      { code: "S2500 M03", since: "F2.2", note: "2500 obr/min, obroty w prawo." },
      { code: "G00 X-20 Y10", since: "F3.1", note: "Ruch szybki nad punkt startu, z boku detalu." },
      { code: "G00 Z5", since: "F3.1", note: "Zjazd szybki na wysokość bezpieczną 5 mm nad górną powierzchnią." },
      { code: "G01 Z-5 F150", since: "F3.2", note: "Wejście na głębokość obok detalu, posuw 150 mm/min." },
      { code: "G01 X-5 F400", since: "F3.2", note: "Dojazd do lewej krawędzi (środek freza 5 mm od konturu)." },
      { code: "G01 Y40", since: "F3.2", note: "Lewa krawędź w górę." },
      { code: "G02 X10 Y55 R15", since: "F3.3", note: "Naroże R10 + promień freza 5 = tor R15." },
      { code: "G01 X70", since: "F3.2", note: "Górna krawędź." },
      { code: "G02 X85 Y40 R15", since: "F3.3", note: "Prawe górne naroże." },
      { code: "G01 Y10", since: "F3.2", note: "Prawa krawędź w dół." },
      { code: "G02 X70 Y-5 R15", since: "F3.3", note: "Prawe dolne naroże." },
      { code: "G01 X10", since: "F3.2", note: "Dolna krawędź." },
      { code: "G02 X-5 Y10 R15", since: "F3.3", note: "Lewe dolne naroże — kontur zamknięty." },
      { code: "G00 Z5", since: "F3.1", note: "Odjazd w górę ruchem szybkim." },
      { code: "M05", since: "F2.2", note: "Stop wrzeciona." },
      { code: "G91 G28 Z0", since: "F0.2", note: "Odjazd osi Z do punktu referencyjnego R (Fanuc). G91 to wymiary przyrostowe — poznasz je w F1.3." },
      { code: "G90", since: "F1.3", note: "Powrót do wymiarów absolutnych po G91." },
      { code: "M30", since: "F1.5", note: "Koniec programu i powrót na początek." },
    ],
  },
  toczenie: { title: "Wałek stopniowany", lines: [] },
};
