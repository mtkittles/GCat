import { flat, lessonHref, type Track } from "@/lib/course";
import type { LibProgram } from "@/lib/programLibrary";

/* Gotowe programy: frezowanie i toczenie. Kolejność = kolejność w liście i galerii. */

function L(track: Track, id: string) {
  const l = flat(track).find((x) => x.id === id);
  return l?.slug ? { href: lessonHref(track, l.slug), label: `${l.id} ${l.title}` } : undefined;
}

export const PROGRAMS: LibProgram[] = [
  {
    slug: "plytka-gcat", title: "Płytka przewodnia GCat", mode: "mill", category: "Detale kompletne", level: "zaawansowany",
    summary: "Program płytki z całej ścieżki frezowania: planowanie, kontur z korekcją, dwie kieszenie, nawiercanie, wiercenie i gwintowanie M6, spirala z podprogramu.",
    features: ["G41", "G02/G03", "G82", "G83", "G84", "M98"],
    stock: { x: 90, y: 60, z: 21, ox: 5, oy: 5, oz: 20 },
    lesson: L("frezowanie", "F7.1"),
    tools: {
    1: { kind: "endmill", name: "Frez walcowo-czołowy Ø10", d: 10, flutes: 4 },
    2: { kind: "spotdrill", name: "Nawiertak Ø10 90°", d: 10, angle: 90 },
    3: { kind: "drill", name: "Wiertło VHM Ø5 140°", d: 5, angle: 140 },
    4: { kind: "tap", name: "Gwintownik M6×1", d: 6, flutes: 1 },
    5: { kind: "facemill", name: "Głowica Ø63", d: 63, flutes: 5 }
    },
    src: `O1000 (PLYTKA 80X50X20 - GCAT)
(ZERO W: LEWY DOLNY NAROZNIK, Z0 NA GORZE)
(P1 X0 Y0 / P2 X80 Y0 / P3 X80 Y50 / P4 X0 Y50)
G21 G90 G17
G40 G49 G80
G54
(NADDATEK 1 MM NA GORNEJ POWIERZCHNI)
T5 M06 (GLOWICA FI63 5Z 45ST)
G43 H5 Z50.
S1000 M03
M08
G00 X-40. Y25.
G00 Z5.
G01 Z0. F200
G01 X120. F800
G00 Z50.
M09
M05
T1 M06 (FREZ FI10)
G43 H1 Z50.
S2500 M03
M08
G00 X-20. Y10.
G00 Z5.
G01 Z-5. F150
G41 D1 G01 X-10. Y0. F400
G03 X0. Y10. R10.
G01 Y40.
G02 X10. Y50. R10.
G01 X70.
G02 X80. Y40. R10.
G01 Y10.
G02 X70. Y0. R10.
G01 X10.
G02 X0. Y10. R10.
G03 X-10. Y20. R10.
G40 G01 X-20. Y10.
G00 Z5.
(KIESZEN 26X20 R6 GL.4, SRODEK X30 Y25)
G00 X23. Y25.
G01 Z0. F200
G01 X37. Z-1.
X23. Z-2.
X37. Z-3.
X23. Z-4.
X37. F400
Y29.
X23.
Y21.
X37.
Y25.
G41 D1 G01 X24. Y21.
G03 X30. Y15. R6.
G01 X37.
G03 X43. Y21. R6.
G01 Y29.
G03 X37. Y35. R6.
G01 X23.
G03 X17. Y29. R6.
G01 Y21.
G03 X23. Y15. R6.
G01 X30.
G03 X36. Y21. R6.
G40 G01 X30. Y25.
G00 Z5.
(KIESZEN OKRAGLA FI20 GL.4, SRODEK X60 Y25)
G00 X63. Y25.
G01 Z0. F200
M98 P2000 L4
G03 I-3. F400
G41 D1 G01 Y18.
G03 X70. Y25. R7.
G03 I-10.
G03 X63. Y32. R7.
G40 G01 Y25.
G00 Z5.
M09
M05
T2 M06 (NAWIERTAK FI10 90ST)
G43 H2 Z50.
S1900 M03
M08
G99 G82 X10. Y10. Z-3. R2. P200 F150
X70.
Y40.
X10.
G80
M09
M05
T3 M06 (WIERTLO FI5 VHM 140ST)
G43 H3 Z50.
S3800 M03
M08
G99 G83 X10. Y10. Z-16. R2. Q4. F380
X70.
Y40.
X10.
G80
M09
M05
T4 M06 (GWINTOWNIK M6X1)
G43 H4 Z50.
S500 M03
M29 S500
M08
G99 G84 X10. Y10. Z-12. R5. F500
X70.
Y40.
X10.
G80
M09
M05
G91 G28 Z0.
G90
M30
O2000 (ZWOJ SPIRALI 1 MM)
G91 G03 I-3. Z-1.
G90
M99`,
  },
  {
    slug: "korpus-pelny", title: "Korpus — pełna obróbka", mode: "mill", category: "Detale kompletne", level: "zaawansowany",
    summary: "Planowanie głowicą, kieszeń w trzech przejściach, fasolka frezem kulistym i cztery otwory przelotowe.",
    features: ["G43", "G41", "G83", "wiele narzędzi"],
    stock: { x: 120, y: 80, z: 25, ox: 0, oy: 0, oz: 25 },
    tools: {
    1: { kind: "facemill", name: "Głowica Ø50", d: 50, flutes: 5 },
    2: { kind: "endmill", name: "Frez walcowy Ø16", d: 16 },
    3: { kind: "ballnose", name: "Frez kulisty Ø10", d: 10 },
    4: { kind: "drill", name: "Wiertło Ø10", d: 10 }
    },
    src: `O0600 (KORPUS 120x80x25)
(POLFABRYKAT 120 x 80 x 25, ZERO: LEWY DOLNY NAROZNIK, Z NA GORZE)
G21 G90 G17 G54 G40 G49 G80

(T01 GLOWICA 50 - PLANOWANIE CZOLA)
T01 M06
G43 H01 Z50
S1600 M03
M08
G00 X-32 Y18
G00 Z2
G01 Z-1 F150
G01 X152 F900
G01 Y42
G01 X-32
G01 Y62
G01 X152
G00 Z50
M09
M05

(T02 FREZ WALCOWY 16 - KIESZEN 64x24 W 3 PRZEJSCIACH PO 3MM)
(TOR SRODKA ODSUNIETY O PROMIEN 8 OD SCIANEK KIESZENI)
T02 M06
G43 H02 Z50
S2000 M03
M08
G00 X28 Y28
G00 Z2
G01 Z-4 F150
G01 X92 F450
G01 Y52
G01 X28
G01 Y28
G01 X38 Y38
G01 X82
G01 Y42
G01 X38
G01 Y38
G00 Z2
G00 X28 Y28
G01 Z-7 F150
G01 X92 F450
G01 Y52
G01 X28
G01 Y28
G01 X38 Y38
G01 X82
G01 Y42
G01 X38
G01 Y38
G00 Z2
G00 X28 Y28
G01 Z-10 F150
G01 X92 F450
G01 Y52
G01 X28
G01 Y28
G01 X38 Y38
G01 X82
G01 Y42
G01 X38
G01 Y38
G00 Z50
M09
M05

(T03 FREZ KULISTY 10 - FASOLKA ZAOKRAGLONA)
T03 M06
G43 H03 Z50
S3200 M03
M08
G00 X26 Y66
G00 Z2
G01 Z-3 F200
G01 X94 F350
G03 X94 Y72 I0 J3
G01 X26
G03 X26 Y66 I0 J-3
G01 Z-5 F200
G01 X94
G03 X94 Y72 I0 J3
G01 X26
G03 X26 Y66 I0 J-3
G00 Z50
M09
M05

(T04 WIERTLO 10 - 4 OTWORY PRZELOTOWE)
T04 M06
G43 H04 Z50
S1100 M03
M08
G99 G83 X15 Y15 Z-28 R2 Q7 F120
X105
Y65
X15
G80
G00 Z50
M09
M05

G91 G28 Z0
G90
M30`,
  },
  {
    slug: "plytka-m10", title: "Płytka z gwintami M10", mode: "mill", category: "Detale kompletne", level: "średni",
    summary: "Kontur frezem Ø12, cztery otwory Ø8,5 i gwintowanie M10×1,5 cyklem G84.",
    features: ["G81", "G84", "G43"],
    stock: { x: 90, y: 60, z: 25, ox: 0, oy: 0, oz: 25 },
    lesson: L("frezowanie", "F5.3"),
    tools: {
    1: { kind: "endmill", name: "Frez walcowy Ø12", d: 12 },
    2: { kind: "drill", name: "Wiertło Ø8,5", d: 8.5 },
    3: { kind: "tap", name: "Gwintownik M10×1,5", d: 10, flutes: 1.5 }
    },
    src: `O0200 (PLYTKA 90x60x20)
G21 G90 G17 G54 G40 G49 G80
(T01 FREZ WALCOWY 12 — KONTUR)
T01 M06
G43 H01 Z50
S2200 M03
M08
G00 X-18 Y-18
G00 Z2
G01 Z-4 F120
G42 D01 X0 Y0 F450
G01 X80
G01 Y50
G01 X0
G01 Y0
G40 X-18 Y-18
G00 Z50
M09
M05
(T02 WIERTLO 8.5 — 4 OTWORY POD M10)
T02 M06
G43 H02 Z50
S1200 M03
M08
G99 G83 X15 Y15 Z-24 R2 Q6 F110
X65
Y35
X15
G80
G00 Z50
M09
M05
(T03 GWINTOWNIK M10x1.5)
T03 M06
G43 H03 Z50
S400 M03
G99 G84 X15 Y15 Z-18 R5 F600
X65
Y35
X15
G80
G00 Z50
M05
G91 G28 Z0
G90
M30`,
  },
  {
    slug: "korpus-4", title: "Korpus — 4 narzędzia", mode: "mill", category: "Detale kompletne", level: "średni",
    summary: "Krótszy korpus: planowanie, kieszeń, nawiercanie i wiercenie przelotowe.",
    features: ["G43", "G81", "G83"],
    tools: {
    1: { kind: "facemill", name: "Głowica Ø50", d: 50, flutes: 5 },
    2: { kind: "endmill", name: "Frez Ø16", d: 16 },
    3: { kind: "spotdrill", name: "Nawiertak Ø10 90°", d: 10, angle: 90 },
    4: { kind: "drill", name: "Wiertło Ø10", d: 10 }
    },
    src: `O0300 (KORPUS)
G21 G90 G17 G54 G40 G49 G80
(T01 GLOWICA 50 — PLANOWANIE)
T01 M06
G43 H01 Z50
S1600 M03
M08
G00 X-30 Y15
G00 Z2
G01 Z-1 F150
G01 X130 F800
G01 Y45
G01 X-30
G00 Z50
M09
M05
(T02 FREZ 16 — KIESZEN)
T02 M06
G43 H02 Z50
S2000 M03
M08
G00 X30 Y30
G00 Z2
G01 Z-3 F120
G01 X70 F400
G01 Y40
G01 X30
G01 Y20
G01 X70
G00 Z50
M09
M05
(T03 NAWIERTAK)
T03 M06
G43 H03 Z50
S2500 M03
M08
G99 G82 X20 Y20 Z-3 R2 P300 F150
X90
Y45
X20
G80
G00 Z50
M09
M05
(T04 WIERTLO 10 — PRZELOTOWE)
T04 M06
G43 H04 Z50
S1100 M03
M08
G99 G83 X20 Y20 Z-28 R2 Q7 F120
X90
Y45
X20
G80
G00 Z50
M09
M05
G91 G28 Z0
G90
M30`,
  },
  {
    slug: "kolnierz-okragly", title: "Kołnierz z otworami na okręgu", mode: "mill", category: "Detale kompletne", level: "zaawansowany",
    summary: "Okrągły kołnierz Ø90 na kwadratowej płycie: narożniki zebrane okręgami o malejącym promieniu, kontur na gotowo pełnym łukiem z korekcją, kieszeń Ø40 z wejściem po spirali i sześć otworów na średnicy podziałowej 70.",
    features: ["G41", "G02 pełny okrąg", "spirala", "M98", "G82", "G83"],
    stock: { x: 100, y: 100, z: 15, ox: 50, oy: 50, oz: 15 },
    lesson: L("frezowanie", "F6.3"),
    tools: {
    1: { kind: "endmill", name: "Frez Ø12", d: 12 },
    2: { kind: "spotdrill", name: "Nawiertak Ø10 90°", d: 10, angle: 90 },
    3: { kind: "drill", name: "Wiertło Ø8,5", d: 8.5 }
    },
    src: `O1102 (KOLNIERZ OKRAGLY Z OTWORAMI)
(PLYTA 100X100X15, ZERO: SRODEK, Z0 NA GORZE)
G21 G90 G17 G54 G40 G49 G80
T1 M06 (FREZ FI12)
G43 H1 Z50.
S2600 M03
M08
(KOLNIERZ FI90 - NAJPIERW NAROZNIKI PLYTY)
G00 X80. Y0.
G00 Z2.
G01 Z-5. F150
G01 X72. F450
G02 I-72.
G01 X64.
G02 I-64.
G01 X58.
G02 I-58.
(KONTUR FI90 NA GOTOWO Z KOREKCJA)
G41 D1 G01 X45.
G02 I-45.
G40 G01 X60.
G00 Z2.
(KIESZEN FI40 GL.8)
G00 X5. Y0.
G01 Z0. F200
M98 P2002 L8
G03 I-5. F450
G01 X12.
G03 I-12.
G41 D1 G01 X13. Y-7.
G03 X20. Y0. R7.
G03 I-20.
G03 X13. Y7. R7.
G40 G01 X0. Y0.
G00 Z50.
M05
T2 M06 (NAWIERTAK FI10 90ST)
G43 H2 Z50.
S1900 M03
G99 G82 X35. Y0. Z-2.5 R2. P200 F150
X17.5 Y30.311
X-17.5
X-35. Y0.
X-17.5 Y-30.311
X17.5
G80
G00 Z50.
M05
T3 M06 (WIERTLO FI8.5)
G43 H3 Z50.
S1600 M03
G99 G83 X35. Y0. Z-19. R2. Q4. F160
X17.5 Y30.311
X-17.5
X-35. Y0.
X-17.5 Y-30.311
X17.5
G80
G00 Z50.
M09
M05
G91 G28 Z0.
G90
M30
O2002 (ZWOJ SPIRALI 1MM)
G91 G03 I-5. Z-1.
G90
M99`,
  },
  {
    slug: "gwint-frezem", title: "Gwint wewnętrzny M24×2 frezem", mode: "mill", category: "Otwory i gwinty", level: "zaawansowany",
    summary: "Wiercenie Ø20, wytaczanie po spirali do Ø22 i frezowanie gwintu M24×2 — każdy zwój to jeden obrót G03 z przesuwem o skok, powtarzany podprogramem.",
    features: ["G83", "interpolacja śrubowa", "M98", "frez do gwintów"],
    stock: { x: 60, y: 60, z: 30, ox: 30, oy: 30, oz: 30 },
    lesson: L("frezowanie", "F6.3"),
    tools: {
    1: { kind: "drill", name: "Wiertło Ø20", d: 20 },
    2: { kind: "endmill", name: "Frez Ø10", d: 10 },
    3: { kind: "threadmill", name: "Frez do gwintów Ø16, skok 2", d: 16, flutes: 2 }
    },
    src: `O1101 (GWINT WEWN. M24X2 FREZEM)
(PLYTA 60X60X30, ZERO: SRODEK OTWORU, Z0 NA GORZE)
G21 G90 G17 G54 G40 G49 G80
T1 M06 (WIERTLO FI20)
G43 H1 Z50.
S1400 M03
M08
G00 X0. Y0.
G99 G83 Z-34. R2. Q5. F140
G80
G00 Z50.
M05
T2 M06 (FREZ FI10)
G43 H2 Z50.
S3200 M03
G00 X6. Y0.
G00 Z2.
G01 Z0. F200
M98 P2000 L16
G03 I-6. F300
G01 X0.
G00 Z50.
M05
T3 M06 (FREZ DO GWINTOW FI16 P2)
G43 H3 Z50.
S2400 M03
G00 X0. Y0.
G00 Z2.
G01 Z-22. F400
G01 X4. F120
M98 P2001 L10
G01 X0.
G00 Z50.
M09
M05
G91 G28 Z0.
G90
M30
O2000 (ZWOJ WYTACZANIA)
G91 G03 I-6. Z-2.
G90
M99
O2001 (ZWOJ GWINTU W GORE)
G91 G03 I-4. Z2.
G90
M99`,
  },
  {
    slug: "wiercenie-g83-g73", title: "Wiercenie głębokie G83 i G73", mode: "mill", category: "Otwory i gwinty", level: "średni",
    summary: "Dwa otwory głębokie: z pełnym wyjściem wiertła (G83) i z samym łamaniem wióra (G73).",
    features: ["G83", "G73", "G80"],
    lesson: L("frezowanie", "F5.2"),
    tools: {
    1: { kind: "drill", name: "Wiertło Ø8", d: 8 }
    },
    src: `G21 G90 G17 G54 G80
S1200 M03
T01 M06
G43 H01 Z50
G00 X20 Y20 Z10
M08
(G83 — pelne wycofanie do R po kazdym Q)
G99 G83 X20 Y20 Z-40 R2 Q5 F100
G80
(G73 — krotkie wycofanie, szybciej)
G99 G73 X60 Y20 Z-40 R2 Q5 F100
G80
G00 Z50
M09
M30`,
  },
  {
    slug: "kontur-luki", title: "Kontur z łukami", mode: "mill", category: "Kontury i kieszenie", level: "podstawowy",
    summary: "Prosty kontur z łukiem przez I, J i przez R — na rozgrzewkę.",
    features: ["G01", "G02", "G03"],
    lesson: L("frezowanie", "F3.3"),
    tools: {
    1: { kind: "endmill", name: "Frez Ø10", d: 10 }
    },
    src: `G21 G90 G17 G54\nS1500 M03\nG00 X0 Y0 Z5\nG01 Z-2 F100\nG01 X50 F250\nG02 X70 Y20 I0 J20\nG01 Y40\nG03 X50 Y60 R20\nG01 X0\nG01 Y0\nG00 Z5\nM30`,
  },
  {
    slug: "kompensacja-g41", title: "Kompensacja G41 — tor rzeczywisty", mode: "mill", category: "Kontury i kieszenie", level: "średni",
    summary: "Kontur zapisany wymiarami z rysunku, frez prowadzony z korekcją promienia. Przełącz tor programowany i rzeczywisty.",
    features: ["G41", "G40", "D"],
    stock: { x: 90, y: 60, z: 20, ox: 0, oy: 0, oz: 20 },
    lesson: L("frezowanie", "F4.2"),
    tools: {
    1: { kind: "endmill", name: "Frez Ø10", d: 10 }
    },
    src: `G21 G90 G17 G54 G40
T01 M06
G43 H01 Z50
S2400 M03
M08
G00 X-25 Y-25
G00 Z2
G01 Z-4 F120
G41 D1 X0 Y0 F400
G01 Y50
G01 X80
G01 Y0
G01 X0
G40 X-25 Y-25
G00 Z50
M09
M05
M30`,
  },
  {
    slug: "wpust-faza", title: "Rowek wpustowy i faza krawędzi", mode: "mill", category: "Kontury i kieszenie", level: "średni",
    summary: "Rowek 8 × 40 wybrany wahadłowo po rampie i faza 1 × 45° fazownikiem po obwodzie płytki.",
    features: ["rampa", "G41", "fazownik"],
    stock: { x: 80, y: 40, z: 20, ox: 0, oy: 0, oz: 20 },
    lesson: L("frezowanie", "F6.2"),
    tools: {
    1: { kind: "endmill", name: "Frez Ø8", d: 8 },
    2: { kind: "chamfer", name: "Fazownik Ø10 90°", d: 10, angle: 90 }
    },
    src: `O1103 (ROWEK WPUSTOWY I FAZA KRAWEDZI)
(PLYTA 80X40X20, ZERO: LEWY DOLNY NAROZNIK, Z0 NA GORZE)
G21 G90 G17 G54 G40 G49 G80
T1 M06 (FREZ FI8)
G43 H1 Z50.
S4000 M03
M08
(ROWEK 8 X 40, GL. 4 - WAHADLOWO)
G00 X20. Y20.
G00 Z2.
G01 Z0. F200
G01 X60. Z-1. F300
X20. Z-2.
X60. Z-3.
X20. Z-4.
X60.
G00 Z50.
M05
T2 M06 (FAZOWNIK FI10 90ST)
G43 H2 Z50.
S3500 M03
(FAZA 1X45 NA OBWODZIE)
G00 X-10. Y-10.
G00 Z2.
G01 Z-1.5 F200
G41 D2 G01 X0. Y-5. F500
G01 Y40.
X80.
Y0.
X-5.
G40 G01 X-10. Y-10.
G00 Z50.
M09
M05
G91 G28 Z0.
G90
M30`,
  },
  {
    slug: "kieszen-g91", title: "Kieszeń przyrostowo G91", mode: "mill", category: "Kontury i kieszenie", level: "podstawowy",
    summary: "Kieszeń zapisana ruchami przyrostowymi — ten sam kształt da się przenieść w inne miejsce jednym blokiem.",
    features: ["G91", "G90"],
    lesson: L("frezowanie", "F1.3"),
    tools: {
    1: { kind: "endmill", name: "Frez Ø6", d: 6 }
    },
    src: `G21 G90 G17 G54\nS2000 M03\nG00 X10 Y10 Z5\nG01 Z-1 F80\nG91\nG01 X30 F200\nG01 Y20\nG01 X-30\nG01 Y-20\nG01 X5 Y5\nG01 X20\nG01 Y10\nG01 X-20\nG01 Y-10\nG90\nG00 Z5\nM30`,
  },
  {
    slug: "obrot-g68", title: "Obrót układu G68", mode: "mill", category: "Kontury i kieszenie", level: "zaawansowany",
    summary: "Ten sam rowek frezowany w kilku położeniach kątowych przez obrót układu współrzędnych.",
    features: ["G68", "G69"],
    stock: { x: 120, y: 100, z: 20, ox: 60, oy: 50, oz: 20 },
    tools: {
    1: { kind: "endmill", name: "Frez Ø6", d: 6 }
    },
    src: `G21 G90 G17 G54
T01 M06
G43 H01 Z50
S2600 M03
G68 X0 Y0 R0
G00 X20 Y-6
G00 Z2
G01 Z-3 F120
G01 X40 F400
G01 Y6
G01 X20
G01 Y-6
G00 Z5
G69
G68 X0 Y0 R120
G00 X20 Y-6
G00 Z2
G01 Z-3 F120
G01 X40 F400
G01 Y6
G01 X20
G01 Y-6
G00 Z5
G69
G68 X0 Y0 R240
G00 X20 Y-6
G00 Z2
G01 Z-3 F120
G01 X40 F400
G01 Y6
G01 X20
G01 Y-6
G00 Z50
G69
M30`,
  },
  {
    slug: "grawer-gcat", title: "Grawerowanie napisu GCAT", mode: "mill", category: "Grawerowanie", level: "podstawowy",
    summary: "Cztery litery grawerem V 60° na głębokość 0,5 mm — same ruchy G00 i G01 z podnoszeniem narzędzia między kreskami.",
    features: ["G00", "G01", "grawer V"],
    stock: { x: 80, y: 40, z: 10, ox: 0, oy: 0, oz: 10 },
    tools: {
    1: { kind: "vbit", name: "Grawer V 60° Ø6", d: 6, angle: 60 }
    },
    src: `O1104 (GRAWEROWANIE NAPISU GCAT)
(PLYTKA 80X40X10, ZERO: LEWY DOLNY NAROZNIK, Z0 NA GORZE)
G21 G90 G17 G54 G40 G49 G80
T1 M06 (GRAWER V 60ST FI6)
G43 H1 Z50.
S12000 M03
(LITERA G)
G00 X20. Y30.
G00 Z1.
G01 Z-0.5 F100
G01 X8. F400
Y10.
X20.
Y19.
X14.
G00 Z1.
(LITERA C)
G00 X38. Y30.
G01 Z-0.5 F100
G01 X26. F400
Y10.
X38.
G00 Z1.
(LITERA A)
G00 X44. Y10.
G01 Z-0.5 F100
G01 X50. Y30. F400
X56. Y10.
G00 Z1.
G00 X47. Y20.
G01 Z-0.5 F100
G01 X53. F400
G00 Z1.
(LITERA T)
G00 X62. Y30.
G01 Z-0.5 F100
G01 X74. F400
G00 Z1.
G00 X68. Y30.
G01 Z-0.5 F100
G01 Y10. F400
G00 Z50.
M05
G91 G28 Z0.
G90
M30`,
  },
  {
    slug: "kostka-os-a", title: "Kostka na 4. osi — cztery ściany", mode: "mill", category: "4 i 5 osi", level: "średni",
    summary: "Indeksowanie osi A co 90°: na dwóch ścianach rowek z podprogramu, na dwóch — po dwa otwory G81. Zero na osi obrotu, odjazd w Z przed każdym obrotem.",
    features: ["A", "M98", "G81", "indeksowanie"],
    stock: { x: 60, y: 40, z: 40, ox: 0, oy: 20, oz: 20 },
    tools: {
    1: { kind: "endmill", name: "Frez walcowo-czołowy Ø8", d: 8, flutes: 3 },
    2: { kind: "drill", name: "Wiertło Ø6", d: 6, angle: 118 }
    },
    src: `O4001 (KOSTKA 60X40X40 - 4 SCIANY NA OSI A)
(ZERO: X0 LEWE CZOLO, Y0 Z0 NA OSI OBROTU A)
(KAZDA SCIANA PO OBROCIE LEZY NA Z20)
G21 G90 G17 G40 G49 G80
G54
T1 M06 (FREZ FI8)
G43 H1 Z60.
S3500 M03
M08
G00 A0
M98 P4100
G00 Z40. (ODJAZD PRZED OBROTEM)
G00 A180.
M98 P4100
G00 Z40.
M09
M05
T2 M06 (WIERTLO FI6)
G43 H2 Z60.
S2800 M03
M08
G00 A90.
M98 P4200
G00 Z40.
G00 A270.
M98 P4200
G00 Z40.
G00 A0
M09
M05
M30
O4100 (ROWEK WZDLUZNY GL. 2)
G00 X6. Y0 Z25.
G01 Z18. F200
G01 X54. F450
G00 Z25.
M99
O4200 (DWA OTWORY GL. 8)
G00 X15. Y0 Z25.
G99 G81 Z12. R22. F150
X45.
G80
G00 Z25.
M99`,
  },
  {
    slug: "walec-os-a", title: "Walec na 4. osi — rowek śrubowy", mode: "mill", category: "4 i 5 osi", level: "średni",
    summary: "Ruch jednoczesny X i A: rowek śrubowy (jeden obrót na 60 mm), potem rowek obwodowy na ćwierć obrotu. Walec Ø60 w uchwycie, Z0 na powierzchni.",
    features: ["A", "G01 X A", "linia śrubowa"],
    stock: { shape: "cylX", d: 60, len: 100, ox: 0, oz: 30, grip: 10 },
    tools: {
    1: { kind: "ballnose", name: "Frez kulisty Ø4", d: 4, flutes: 2 }
    },
    src: `O4002 (WALEC FI60 - ROWEK SRUBOWY, 4. OS A)
(ZERO: X0 LEWE CZOLO, Z0 NA POWIERZCHNI WALCA, Y0 NA OSI)
G21 G90 G17 G40 G49 G80
G54
T1 M06 (FREZ KULISTY FI4)
G43 H1 Z50.
S6000 M03
M08
G00 X20. Y0 Z5. A0
G01 Z-1. F100
G01 X80. A360. F300 (JEDEN OBROT NA 60 MM)
G00 Z5.
G00 X90. A0
G01 Z-2. F100
G01 A90. F300 (ROWEK OBWODOWY - SAM OBROT)
G00 Z50.
G00 A0
M09
M05
M30`,
  },
  {
    slug: "plaszczyzna-g68-2", title: "3+2: skos 30° z otworami i kieszeń z boku (G68.2)", mode: "mill", category: "4 i 5 osi", level: "zaawansowany",
    summary: "Fanuc: płaszczyzna pochylona G68.2 i obrót stołu G53.1. Skos 30° na prawej krawędzi planowany w trzech warstwach, dwa otwory G81 prostopadle do skosu, rowek na przedniej ścianie.",
    features: ["G68.2", "G53.1", "G69", "G81", "3+2"],
    stock: { x: 60, y: 60, z: 40, ox: 30, oy: 30, oz: 40 },
    tools: {
    1: { kind: "endmill", name: "Frez walcowo-czołowy Ø16", d: 16, flutes: 4 },
    2: { kind: "drill", name: "Wiertło Ø6", d: 6, angle: 118 },
    3: { kind: "endmill", name: "Frez walcowo-czołowy Ø10", d: 10, flutes: 3 }
    },
    src: `O5001 (3+2 - SKOS 30ST I ROWEK Z PRZODU, G68.2)
(KOSTKA 60X60X40, ZERO: SRODEK GORNEJ POWIERZCHNI)
(ZERO = SRODEK OBROTU STOLU, MASZYNA STOL A/C)
G21 G90 G17 G40 G49 G80
G54
T1 M06 (FREZ FI16)
S2500 M03
M08
(--- SKOS 30ST: PLASZCZYZNA OBROCONA WOKOL Y ---)
(I90 J30 K-90 = OBROT 30ST WOKOL OSI Y)
G68.2 X15. Y0 Z0 I90. J30. K-90.
G53.1 (STOL USTAWIA OS NARZEDZIA PROSTOPADLE DO SKOSU)
G43 H1 Z60.
G00 X4. Y-40.
G00 Z7.
G01 Z5. F300
G01 Y40. F700
G00 X13.
G01 Y-40.
G01 Z2.5 F300
G01 Y40. F700
G00 X4.
G01 Y-40.
G01 Z0 F300
G01 Y40. F700
G00 X13.
G01 Y-40.
G00 Z60.
(OTWORY PROSTOPADLE DO SKOSU)
T2 M06 (WIERTLO FI6)
G43 H2 Z60.
S2800 M03
G00 X8.66 Y-15.
G99 G81 Z-10. R2. F150
Y15.
G80
G00 Z60.
G69
G49 G53 Z0 (ODJAZD W OSI Z MASZYNY)
(--- SCIANA PRZEDNIA: OS Z PLASZCZYZNY = -Y DETALU ---)
T3 M06 (FREZ FI10)
G68.2 X0 Y-30. Z-20. I0 J90. K0
G53.1
G43 H3 Z50.
S3200 M03
G00 X-10. Y0
G00 Z2.
G01 Z-3. F150
G01 X10. F400
G00 Z50.
G69
G49 G53 Z0
G00 A0 C0
M09
M05
M30`,
  },
  {
    slug: "cycle800-sinumerik", title: "3+2 na Sinumeriku: CYCLE800", mode: "mill", dialect: "sinumerik", category: "4 i 5 osi", level: "zaawansowany",
    summary: "Ta sama kostka co w programie G68.2, zapisana w języku Sinumerika: CYCLE800 obraca układ osiowo (X→Y→Z) i ustawia stół, CYCLE800() wraca do położenia podstawowego.",
    features: ["CYCLE800", "TRANS", "Sinumerik", "3+2"],
    stock: { x: 60, y: 60, z: 40, ox: 30, oy: 30, oz: 40 },
    tools: {
    1: { kind: "endmill", name: "Frez walcowo-czołowy Ø16", d: 16, flutes: 4 },
    3: { kind: "endmill", name: "Frez walcowo-czołowy Ø10", d: 10, flutes: 3 }
    },
    src: `; KOSTKA 60X60X40 - 3+2 Z CYCLE800, STOL A/C
; ZERO: SRODEK GORNEJ POWIERZCHNI = SRODEK OBROTU STOLU
G17 G90 G54
T1 D1 ; FREZ FI16
M6
S2500 M3
M8
; SKOS 30ST: OBROT O 30ST WOKOL Y, PUNKT ODNIESIENIA X15
CYCLE800(1,"TABLE",100000,57,15,0,0,0,30,0,0,0,0,-1,100,1)
G0 X4 Y-40 Z60
G0 Z7
G1 Z5 F300
G1 Y40 F700
G0 X13
G1 Y-40
G1 Z2.5 F300
G1 Y40 F700
G0 X4
G1 Y-40
G1 Z0 F300
G1 Y40 F700
G0 X13
G1 Y-40
G0 Z60
; SCIANA PRZEDNIA: OBROT O 90ST WOKOL X
T3 D1 ; FREZ FI10
M6
S3200 M3
CYCLE800(1,"TABLE",100000,57,0,-30,-20,90,0,0,0,0,0,-1,100,1)
G0 X-10 Y0 Z50
G0 Z2
G1 Z-3 F150
G1 X10 F400
G0 Z50
CYCLE800()
M9
M5
M30`,
  },
  {
    slug: "faza-tcp-g43-4", title: "5 osi jednocześnie: faza 4×45° z TCP (G43.4)", mode: "mill", category: "4 i 5 osi", level: "zaawansowany",
    summary: "Fanuc G43.4: X Y Z to wierzchołek narzędzia w układzie detalu, A i C ustawiają oś narzędzia prostopadle do fazy. W narożach obraca się tylko C — wierzchołek stoi, oś narzędzia przechodzi na kolejną krawędź.",
    features: ["G43.4", "G49", "A", "C", "TCP"],
    stock: { x: 60, y: 60, z: 40, ox: 30, oy: 30, oz: 40 },
    tools: {
    1: { kind: "endmill", name: "Frez walcowo-czołowy Ø10", d: 10, flutes: 3 }
    },
    src: `O5003 (5 OSI - FAZA 4X45 NA GORNYCH KRAWEDZIACH, TCP)
(KOSTKA 60X60X40, ZERO: SRODEK GORNEJ POWIERZCHNI)
(ZERO = SRODEK OBROTU STOLU, MASZYNA STOL A/C)
(FREZ FI10 PRACUJE CZOLEM PROSTOPADLE DO FAZY)
G21 G90 G17 G40 G49 G80
G54
T1 M06 (FREZ FI10)
S4500 M03
M08
G00 A45. C0 (OS NARZEDZIA NA KRAWEDZ +Y)
G43.4 H1 (TCP: X Y Z = WIERZCHOLEK NARZEDZIA)
G00 X-40. Y28. Z50.
G00 Z-2.
G01 X28. F600
G01 C90. (NAROZE: OBRACA SIE TYLKO STOL)
G01 Y-28.
G01 C180.
G01 X-28.
G01 C270.
G01 Y40.
G00 Z50.
G49
G00 A0 C0
M09
M05
M30`,
  },
  {
    slug: "faza-traori", title: "5 osi na Sinumeriku: faza z TRAORI", mode: "mill", dialect: "sinumerik", category: "4 i 5 osi", level: "zaawansowany",
    summary: "Ta sama faza co z G43.4, zapisana dla Sinumerika: TRAORI włącza transformację 5-osiową, TRAFOOF ją wyłącza.",
    features: ["TRAORI", "TRAFOOF", "A", "C", "TCP"],
    stock: { x: 60, y: 60, z: 40, ox: 30, oy: 30, oz: 40 },
    tools: {
    1: { kind: "endmill", name: "Frez walcowo-czołowy Ø10", d: 10, flutes: 3 }
    },
    src: `; KOSTKA 60X60X40 - FAZA 4X45, TRANSFORMACJA 5-OSIOWA
; ZERO: SRODEK GORNEJ POWIERZCHNI = SRODEK OBROTU STOLU
G17 G90 G54
T1 D1 ; FREZ FI10
M6
S4500 M3
M8
G0 A45 C0
TRAORI
G0 X-40 Y28 Z50
G0 Z-2
G1 X28 F600
G1 C90
G1 Y-28
G1 C180
G1 X-28
G1 C270
G1 Y40
G0 Z50
TRAFOOF
G0 A0 C0
M9
M5
M30`,
  },
  {
    slug: "walek-gcat", title: "Wałek stopniowany GCat", mode: "lathe", category: "Detale kompletne", level: "zaawansowany",
    summary: "Program wałka z całej ścieżki toczenia: planowanie, G71/G70 z korekcją ostrza, podcięcie, gwint M20×1,5 i otwór osiowy.",
    features: ["G71", "G70", "G42", "G75", "G76", "G74"],
    lesson: L("toczenie", "T8.1"),
    tools: {
    101: { kind: "turning", name: "Nóż zewnętrzny CNMG 120408", d: 0.8, angle: 95, shape: "C" },
    202: { kind: "turning", name: "Nóż wykańczający VBMT 160404", d: 0.4, angle: 93, shape: "V" },
    303: { kind: "grooving", name: "Nóż do rowków 3 mm", d: 3 },
    404: { kind: "threading", name: "Nóż do gwintów 60°", angle: 60 },
    505: { kind: "drill", name: "Wiertło Ø8", d: 8 }
    },
    src: `O2001 (WALEK STOPNIOWANY - GCAT)
(ZERO W: OS OBROTU, CZOLO DETALU)
(SUROWKA: PRET FI40, WYSIEG 70)
(KONTUR: X18 Z0 / X20 Z-1 / X20 Z-20 / X28 Z-20)
(X30 Z-21 / X30 Z-39 R1 / X36 Z-40.5 R0.5 / X36 Z-55)
G18 G21 G40 G80 G99
G54
T0101 (NOZ ZEWN. CNMG R0.8)
G50 S3000
G96 S200 M03
M08
(PLANOWANIE CZOLA)
G00 X44. Z0.
G01 X-1.6 F0.15
G00 Z2.
(TOCZENIE ZGRUBNE CYKLEM G71)
G00 X42.
G71 U2. R0.5
G71 P10 Q20 U0.4 W0.1 F0.3
N10 G00 X14.
G01 X20. Z-1. F0.1
Z-20.
X28.
X30. Z-21.
Z-39.
G02 X32. Z-40. R1.
G01 X35.
G03 X36. Z-40.5 R0.5
G01 Z-55.
N20 X42.
G28 U0.
G28 W0.
T0202 (NOZ WYKANCZAJACY VBMT R0.4)
(T0202: R0.4, KIERUNEK OSTRZA 3)
G96 S250 M03
(WYKANCZANIE CYKLEM G70)
G42 G00 X42. Z2.
G70 P10 Q20
G40 G00 X44. Z5.
(PODCIECIE POD GWINT)
G28 U0.
G28 W0.
T0303 (NOZ DO ROWKOW 3MM, POMIAR NA LEWYM NAROZU)
G96 S120 M03
G00 X22. Z-19.
G75 R0.5
G75 X17. Z-20. P1500 Q1000 F0.05
G00 X44.
(GWINT M20X1.5)
G28 U0.
G28 W0.
T0404 (NOZ DO GWINTOW 60ST)
G97 S1200 M03
G00 X22. Z5.
G76 P010060 Q50 R0.05
G76 X18.16 Z-17. P920 Q300 F1.5
G00 X44.
(OTWOR OSIOWY FI8 GL.15)
G28 U0.
G28 W0.
T0505 (WIERTLO FI8)
G97 S1200 M03
G00 X0. Z2.
G74 R0.5
G74 Z-15. Q3000 F0.08
G00 Z5.
M09
M05
G28 U0.
G28 W0.
M30`,
  },
  {
    slug: "tuleja-gwint-wewn", title: "Tuleja z gwintem wewnętrznym M30×1,5", mode: "lathe", category: "Detale kompletne", level: "zaawansowany",
    summary: "Toczenie zewnętrzne, wiercenie Ø20, wytaczanie cyklem G71 od środka i gwint wewnętrzny G76 nożem skierowanym od osi.",
    features: ["G71 wewnętrzny", "G74", "G76 wewnętrzny", "wytaczak"],
    lesson: L("toczenie", "T7.1"),
    tools: {
    101: { kind: "turning", name: "Nóż zewnętrzny CNMG 120408", d: 0.8, angle: 95, shape: "C" },
    202: { kind: "drill", name: "Wiertło Ø20", d: 20 },
    303: { kind: "boring", name: "Wytaczak DNMG 110404", d: 0.4, angle: 93, shape: "D" },
    404: { kind: "threading", name: "Nóż do gwintów wewnętrznych 60°", angle: 60, tip: 6 }
    },
    src: `O3001 (TULEJA Z GWINTEM WEWN. M30X1.5)
(SUROWKA: PRET FI50, WYSIEG 45)
G18 G21 G40 G80 G99
G54
T0101 (NOZ ZEWN. CNMG 120408)
G50 S2500
G96 S200 M03
M08
G00 X54. Z0.
G01 X-1.6 F0.15
G00 Z2.
G00 X52.
G71 U2. R0.5
G71 P10 Q20 U0.4 W0.1 F0.25
N10 G00 X44.
G01 X48. Z-2. F0.12
Z-40.
N20 X52.
G70 P10 Q20
G28 U0.
G28 W0.
(OTWOR FI20)
T0202 (WIERTLO FI20)
G97 S600 M03
G00 X0. Z2.
G74 R0.5
G74 Z-38. Q5000 F0.12
G00 Z5.
G28 U0.
G28 W0.
(WYTACZANIE POD GWINT FI28.4)
T0303 (WYTACZAK DNMG 110404)
G96 S150 M03
G00 X18. Z2.
G71 U1.5 R0.5
G71 P30 Q40 U-0.4 W0.1 F0.2
N30 G00 X32.
G01 X28.4 Z-0.8 F0.1
Z-25.
N40 X18.
G70 P30 Q40
G00 Z5.
G28 U0.
G28 W0.
(GWINT WEWNETRZNY M30X1.5)
T0404 (NOZ DO GWINTOW WEWN. 60ST)
G97 S700 M03
G00 X26. Z5.
G76 P010060 Q50 R0.05
G76 X30. Z-22. P812 Q250 F1.5
G00 Z10.
M09
M05
G28 U0.
G28 W0.
M30`,
  },
  {
    slug: "sworzen-m16", title: "Sworzeń M16×2 z odcięciem", mode: "lathe", category: "Detale kompletne", level: "zaawansowany",
    summary: "Czop pod gwint, podcięcie, gwint M16×2 i odcięcie gotowego detalu od pręta — pełny cykl z pręta.",
    features: ["G71", "G70", "G75", "G76", "odcinanie"],
    lesson: L("toczenie", "T7.1"),
    tools: {
    101: { kind: "turning", name: "Nóż zewnętrzny CNMG 120408", d: 0.8, angle: 95, shape: "C" },
    202: { kind: "turning", name: "Nóż wykańczający VBMT 160404", d: 0.4, angle: 93, shape: "V" },
    303: { kind: "grooving", name: "Nóż do rowków 3 mm", d: 3 },
    404: { kind: "threading", name: "Nóż do gwintów 60°", angle: 60 }
    },
    src: `O3005 (SWORZEN M16X2 Z ODCIECIEM)
(SUROWKA: PRET FI25, WYSIEG 60)
G18 G21 G40 G80 G99
G54
T0101 (NOZ ZEWN. CNMG 120408)
G50 S3000
G96 S200 M03
M08
G00 X29. Z0.
G01 X-1.6 F0.15
G00 Z2.
G00 X27.
G71 U2. R0.5
G71 P10 Q20 U0.4 W0.1 F0.25
N10 G00 X12.
G01 X16. Z-2. F0.1
Z-28.
X20.
X22. Z-29.
Z-48.
N20 X27.
G28 U0.
G28 W0.
T0202 (NOZ WYKANCZAJACY VBMT 160404)
G96 S250 M03
G42 G00 X27. Z2.
G70 P10 Q20
G40 G00 X30. Z5.
G28 U0.
G28 W0.
(PODCIECIE POD GWINT)
T0303 (NOZ DO ROWKOW 3MM)
G96 S100 M03
G00 X20. Z-27.
G75 R0.5
G75 X13. Z-28. P1000 Q1000 F0.05
G00 X30.
G28 U0.
G28 W0.
(GWINT M16X2)
T0404 (NOZ DO GWINTOW 60ST)
G97 S900 M03
G00 X20. Z6.
G76 P010060 Q50 R0.05
G76 X13.54 Z-26. P1230 Q300 F2.
G00 X30.
G28 U0.
G28 W0.
(ODCIECIE)
T0303 (NOZ DO ROWKOW 3MM)
G97 S800 M03
G00 X27. Z-48.
G01 X-0.5 F0.04
G00 X30.
M09
M05
G28 U0.
G28 W0.
M30`,
  },
  {
    slug: "tokarka-3-narzedzia", title: "Wałek — 3 narzędzia", mode: "lathe", category: "Detale kompletne", level: "średni",
    summary: "Obróbka zgrubna, wykańczająca i rowek — trzy noże w jednym programie.",
    features: ["wiele narzędzi", "rowek"],
    tools: {
    1: { kind: "turning", name: "Nóż zgrubny CNMG 120408", d: 0.8, angle: 95, shape: "C" },
    2: { kind: "turning", name: "Nóż wykańczający VBMT 160404", d: 0.4, angle: 93, shape: "V" },
    3: { kind: "grooving", name: "Nóż do rowków 3 mm", d: 3 }
    },
    src: `O0400 (WALEK 3 NARZEDZIA)
G18 G21 G40 G99
G50 S2800
(T01 NOZ ZGRUBNY)
T01 M06
G97 S1200 M03
M08
G00 X62 Z2
G96 S200
G01 X54 F0.3
G01 Z-55
G00 X64
G00 Z2
G01 X46
G01 Z-55
G00 X64
G00 Z2
G01 X40
G01 Z-30
G00 X64
G00 Z2
(T02 NOZ WYKANCZAJACY)
T02 M06
G97 S1600 M03
G00 X36 Z2
G96 S250
G01 X38 Z0 F0.12
G01 X38 Z-30
G02 X44 Z-33 R3
G01 X44 Z-55
G01 X62
G00 Z2
(T03 NOZ DO ROWKOW)
T03 M06
G97 S900 M03
G00 X46 Z-25
G01 X34 F0.08
G00 X46
G00 Z2
M09
M05
M30`,
  },
  {
    slug: "koncowka-kulista", title: "Końcówka kulista R10", mode: "lathe", category: "Kontury", level: "średni",
    summary: "Półkula R10 na czole wałka. Wąska płytka V 35° przechodzi cały łuk bez podcinania — płytka C by tego nie zrobiła.",
    features: ["G03", "G71", "płytka V"],
    lesson: L("toczenie", "T3.3"),
    tools: {
    101: { kind: "turning", name: "Nóż zewnętrzny CNMG 120408", d: 0.8, angle: 95, shape: "C" },
    202: { kind: "turning", name: "Nóż wykańczający VBMT 160404", d: 0.4, angle: 93, shape: "V" }
    },
    src: `O3006 (KONCOWKA KULISTA R10)
(SUROWKA: PRET FI25, WYSIEG 55)
G18 G21 G40 G80 G99
G54
T0101 (NOZ ZEWN. CNMG 120408)
G50 S3000
G96 S200 M03
M08
G00 X29. Z0.5
G01 X-1.6 F0.15
G00 Z2.
G00 X27.
G71 U1.5 R0.5
G71 P10 Q20 U0.4 W0.1 F0.25
N10 G00 X0.
G01 Z0. F0.1
G03 X20. Z-10. R10.
G01 Z-30.
X22.
X24. Z-31.
Z-45.
N20 X27.
G28 U0.
G28 W0.
T0202 (NOZ WYKANCZAJACY VBMT 160404)
G96 S250 M03
G42 G00 X27. Z2.
G70 P10 Q20
G40 G00 X30. Z5.
M09
M05
G28 U0.
G28 W0.
M30`,
  },
  {
    slug: "walek-stozek", title: "Wałek ze stożkiem 1:10", mode: "lathe", category: "Kontury", level: "średni",
    summary: "Stożek zapisany jednym blokiem G01 w obu osiach — średnica rośnie o 1 mm na każde 10 mm długości.",
    features: ["G01 X Z", "G71", "stożek"],
    lesson: L("toczenie", "T3.2"),
    tools: {
    101: { kind: "turning", name: "Nóż zewnętrzny CNMG 120408", d: 0.8, angle: 95, shape: "C" },
    202: { kind: "turning", name: "Nóż wykańczający VBMT 160404", d: 0.4, angle: 93, shape: "V" }
    },
    src: `O3007 (WALEK ZE STOZKIEM 1:10)
(SUROWKA: PRET FI40, WYSIEG 75)
G18 G21 G40 G80 G99
G54
T0101 (NOZ ZEWN. CNMG 120408)
G50 S3000
G96 S200 M03
M08
G00 X44. Z0.
G01 X-1.6 F0.15
G00 Z2.
G00 X42.
G71 U2. R0.5
G71 P10 Q20 U0.4 W0.1 F0.25
N10 G00 X20.
G01 X24. Z-2. F0.1
Z-10.
X28. Z-50.
X34.
X36. Z-51.
Z-65.
N20 X42.
G28 U0.
G28 W0.
T0202 (NOZ WYKANCZAJACY VBMT 160404)
G96 S250 M03
G42 G00 X42. Z2.
G70 P10 Q20
G40 G00 X44. Z5.
M09
M05
G28 U0.
G28 W0.
M30`,
  },
  {
    slug: "walek-stopien", title: "Wałek ze stopniem", mode: "lathe", category: "Kontury", level: "podstawowy",
    summary: "Najprostszy kontur tokarski: średnica, promień przy stopniu i wyjście.",
    features: ["G96", "G01", "G02"],
    tools: {
    1: { kind: "turning", name: "Nóż zewnętrzny CNMG 120408", d: 0.8, angle: 95, shape: "C" }
    },
    src: `G18 G21 G40 G99\nG50 S3000\nG97 S1200 M03\nG00 X62 Z2\nG96 S200\nG01 X40 F0.3\nG01 Z-20\nG02 X50 Z-25 R5\nG01 Z-45\nG01 X62\nG00 Z2\nM30`,
  },
  {
    slug: "walek-faza", title: "Wałek z fazą i zaokrągleniem", mode: "lathe", category: "Kontury", level: "podstawowy",
    summary: "Faza na czole, zaokrąglenie przy stopniu i faza na krawędzi.",
    features: ["faza", "G02"],
    tools: {
    1: { kind: "turning", name: "Nóż zewnętrzny DNMG 150604", d: 0.4, angle: 93, shape: "D" }
    },
    src: `G18 G21 G40 G99\nG50 S3000\nG97 S1500 M03\nG00 X50 Z2\nG96 S220\nG01 X26 F0.25\nG01 X30 Z0\nG01 Z-15\nG02 X40 Z-20 R5\nG01 Z-35\nG01 X44\nG01 X48 Z-37\nG00 X50 Z2\nM30`,
  },
  {
    slug: "kolnierz-g72", title: "Kołnierz z piastą (G72)", mode: "lathe", category: "Rowki i cykle", level: "średni",
    summary: "Detal krótki i szeroki — przejścia poprzeczne cyklem G72 i wykończenie G70.",
    features: ["G72", "G70"],
    lesson: L("toczenie", "T5.2"),
    tools: {
    101: { kind: "turning", name: "Nóż zewnętrzny CNMG 120408", d: 0.8, angle: 95, shape: "C" },
    202: { kind: "turning", name: "Nóż wykańczający VBMT 160404", d: 0.4, angle: 93, shape: "V" }
    },
    src: `O2005 (KOLNIERZ Z PIASTA)
(SUROWKA: PRET FI60, WYSIEG 30)
G18 G21 G40 G80 G99
G54
T0101 (NOZ ZEWN. CNMG 120408)
G50 S2500
G96 S180 M03
M08
G00 X64. Z0.
G01 X-1.6 F0.15
G00 Z2.
G00 X64.
G72 W2. R0.5
G72 P10 Q20 U0.4 W0.1 F0.25
N10 G00 Z-15.
G01 X30. F0.1
Z-1.
N20 X28. Z0.
G28 U0.
G28 W0.
T0202 (NOZ WYKANCZAJACY VBMT 160404)
G96 S220 M03
G00 X64. Z2.
G70 P10 Q20
M09
M05
G28 U0.
G28 W0.
M30`,
  },
  {
    slug: "trzy-rowki", title: "Trzpień z trzema rowkami", mode: "lathe", category: "Rowki i cykle", level: "średni",
    summary: "Trzy jednakowe rowki z jednego podprogramu przesuwanego adresem W.",
    features: ["M98", "M99", "W"],
    lesson: L("toczenie", "T8.1"),
    tools: {
    303: { kind: "grooving", name: "Nóż do rowków 3 mm", d: 3 }
    },
    src: `O2010 (TRZPIEN - TRZY ROWKI)
(SUROWKA: PRET FI30, WYSIEG 50)
G18 G21 G40 G80 G99
G54
T0303 (NOZ DO ROWKOW 3MM)
G50 S3000
G96 S120 M03
M08
G00 X34. Z-10.
M98 P3000 L3
G00 X44.
M09
M05
G28 U0.
G28 W0.
M30
O3000 (ROWEK I PRZESUNIECIE)
G01 X26. F0.05
G00 X34.
W-10.
M99`,
  }
];

export const programBySlug = (slug: string) => PROGRAMS.find((p) => p.slug === slug);
