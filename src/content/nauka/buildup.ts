import type { Track } from "@/lib/course";

/*
  Program narastający: jeden detal przewodni na ścieżkę.
  Każda linia ma `since` — lekcję, w której się pojawia. Lekcja pokazuje linie
  ze swojej i wcześniejszych lekcji; nowe są wyróżnione, stare mają dymek z przypomnieniem.

  Zapis w stylu Fanuc: wymiary z kropką dziesiętną (lekcja F1.1).
  Frezowanie: płytka 80 × 50 × 20, naroża R10, obróbka konturu frezem Ø10 na głębokość 5 mm.
  Do lekcji F4.2 program prowadzi środek freza, odsunięty od konturu o promień 5 mm
  (X−5, Y55, łuki R15). Od F4.2 — wymiary z rysunku i korekcja G41 D1.
*/

/** `until` — lekcja, od której linia znika (zastąpiona innym zapisem). */
export interface BuildLine { code: string; since: string; note: string; until?: string }

export const buildup: Record<Track, { title: string; lines: BuildLine[] }> = {
  frezowanie: {
    title: "Płytka 80 × 50",
    lines: [
      { code: "O1000 (PLYTKA 80X50X20 - GCAT)", since: "F1.1", note: "Numer programu i nazwa detalu w komentarzu." },
      { code: "(ZERO W: LEWY DOLNY NAROZNIK, Z0 NA GORZE)", since: "F0.1", note: "Gdzie leży zero detalu. Wszystkie współrzędne niżej liczymy od tego punktu." },
      { code: "(P1 X0 Y0 / P2 X80 Y0 / P3 X80 Y50 / P4 X0 Y50)", since: "F0.1", note: "Naroża płytki odczytane z rysunku, względem zera W." },
      { code: "G21 G90 G17", since: "F1.4", note: "Milimetry, wymiary absolutne, płaszczyzna XY." },
      { code: "G40 G49 G80", since: "F1.5", note: "Kasowanie korekcji promienia, korekcji długości i cyklu — na wypadek, gdyby zostały z poprzedniego programu." },
      { code: "G54", since: "F0.3", note: "Aktywne przesunięcie zera detalu z rejestru G54." },
      { code: "T1 M06 (FREZ FI10)", since: "F2.1", note: "Wymiana na narzędzie nr 1 — frez Ø10." },
      { code: "G43 H1 Z50.", since: "F4.1", note: "Włączenie korekcji długości narzędzia nr 1 i dojazd na Z50." },
      { code: "S2500 M03", since: "F2.2", note: "2500 obr/min, obroty w prawo." },
      { code: "M08", since: "F2.4", note: "Chłodziwo włączone przed dojazdem do detalu." },
      { code: "G00 X-20. Y10.", since: "F3.1", note: "Ruch szybki nad punkt startu, z boku detalu." },
      { code: "G00 Z5.", since: "F3.1", note: "Zjazd szybki na wysokość bezpieczną 5 mm nad górną powierzchnią." },
      { code: "G01 Z-5. F150", since: "F3.2", note: "Wejście na głębokość obok detalu, posuw 150 mm/min." },
      { code: "G01 X-5. F400", since: "F3.2", until: "F4.2", note: "Dojazd do lewej krawędzi (środek freza 5 mm od konturu)." },
      { code: "G41 D1 G01 X0. F400", since: "F4.2", until: "F4.3", note: "Włączenie korekcji promienia z rejestru D1 na dojeździe. Od teraz program opisuje kontur detalu." },
      { code: "G41 D1 G01 X-10. Y0. F400", since: "F4.3", note: "Korekcja promienia włączana na odcinku w powietrzu, przed łukiem najazdu." },
      { code: "G03 X0. Y10. R10.", since: "F4.3", note: "Łuk najazdu stycznego — frez wchodzi na kontur bez zatrzymania na ścianie." },
      { code: "G01 Y55.", since: "F3.2", until: "F3.3", note: "Lewa krawędź w górę, do narożnika toru — kontur bez zaokrągleń." },
      { code: "G01 X85.", since: "F3.2", until: "F3.3", note: "Górna krawędź." },
      { code: "G01 Y-5.", since: "F3.2", until: "F3.3", note: "Prawa krawędź w dół." },
      { code: "G01 X-5.", since: "F3.2", until: "F3.3", note: "Dolna krawędź." },
      { code: "G01 Y10.", since: "F3.2", until: "F3.3", note: "Domknięcie konturu. Od lekcji F3.3 naroża dostaną promień R10." },
      { code: "G01 Y40.", since: "F3.3", note: "Lewa krawędź w górę, do początku naroża." },
      { code: "G02 X10. Y55. R15.", since: "F3.3", until: "F4.2", note: "Naroże R10 + promień freza 5 = tor R15." },
      { code: "G02 X10. Y50. R10.", since: "F4.2", note: "Naroże z rysunku: R10. Promień freza dolicza korekcja." },
      { code: "G01 X70.", since: "F3.3", note: "Górna krawędź." },
      { code: "G02 X85. Y40. R15.", since: "F3.3", until: "F4.2", note: "Prawe górne naroże." },
      { code: "G02 X80. Y40. R10.", since: "F4.2", note: "Prawe górne naroże, wymiar z rysunku." },
      { code: "G01 Y10.", since: "F3.3", note: "Prawa krawędź w dół." },
      { code: "G02 X70. Y-5. R15.", since: "F3.3", until: "F4.2", note: "Prawe dolne naroże." },
      { code: "G02 X70. Y0. R10.", since: "F4.2", note: "Prawe dolne naroże, wymiar z rysunku." },
      { code: "G01 X10.", since: "F3.3", note: "Dolna krawędź." },
      { code: "G02 X-5. Y10. R15.", since: "F3.3", until: "F4.2", note: "Lewe dolne naroże — kontur zamknięty." },
      { code: "G02 X0. Y10. R10.", since: "F4.2", note: "Lewe dolne naroże — kontur zamknięty w punkcie wejścia." },
      { code: "G40 G01 X-20.", since: "F4.2", until: "F4.3", note: "Wyłączenie korekcji na odjeździe od konturu." },
      { code: "G03 X-10. Y20. R10.", since: "F4.3", note: "Łuk odjazdu stycznego." },
      { code: "G40 G01 X-20. Y10.", since: "F4.3", note: "Wyłączenie korekcji na odcinku w powietrzu." },
      { code: "G00 Z5.", since: "F3.1", note: "Odjazd w górę ruchem szybkim." },
      { code: "M09", since: "F2.4", note: "Chłodziwo wyłączone po obróbce." },
      { code: "M05", since: "F2.2", note: "Stop wrzeciona." },
      { code: "G91 G28 Z0.", since: "F0.2", note: "Odjazd osi Z do punktu referencyjnego R (Fanuc). G91 to wymiary przyrostowe — poznasz je w F1.3." },
      { code: "G90", since: "F1.3", note: "Powrót do wymiarów absolutnych po G91." },
      { code: "M30", since: "F1.5", note: "Koniec programu i powrót na początek." },
    ],
  },
  toczenie: { title: "Wałek stopniowany", lines: [] },
};
