import { flat, lessonHref, type Track } from "@/lib/course";
import type { LibProgram } from "@/lib/programLibrary";
import { camForma, camKopula } from "./cam";
import { PROGRAM_REDIRECTS } from "./redirects";
import { korpus5OsiFanuc, korpus5OsiSinumerik, plytaPrzylaczeniowa, tabliczkaGrawer, walek4Os, walekRowkiGwint } from "./detale";

/*
  Gotowe programy: frezowanie i toczenie. Kolejność = kolejność w liście i galerii.
  Same detale wielozabiegowe (kilka narzędzi, karta technologiczna `ops`); krótkie przykłady
  pojedynczych kodów żyją w kartach kodów i lekcjach.
*/

function L(track: Track, id: string) {
  const l = flat(track).find((x) => x.id === id);
  return l?.slug ? { href: lessonHref(track, l.slug), label: `${l.id} ${l.title}` } : undefined;
}

export const PROGRAMS: LibProgram[] = [
  {
    slug: "plytka-gcat", title: "Płytka przewodnia GCat", mode: "mill", category: "Płyty i korpusy", level: "zaawansowany",
    summary: "Program płytki z całej ścieżki frezowania: planowanie, kontur z korekcją, dwie kieszenie, nawiercanie, wiercenie i gwintowanie M6, spirala z podprogramu.",
    features: ["G41", "G02/G03", "G82", "G83", "G84", "M98"],
    stock: { x: 90, y: 60, z: 21, ox: 5, oy: 5, oz: 20 },
    lesson: L("frezowanie", "F7.1"),
    ops: [
      { t: 5, op: "Planowanie górnej powierzchni (naddatek 1 mm)", how: "głowica Ø63, G01 na Z0" },
      { t: 1, op: "Kontur 80 × 50 z promieniami R10, gł. 5", how: "G41 D1, wejście i wyjście po łuku G03" },
      { t: 1, op: "Kieszeń 26 × 20 R6, gł. 4", how: "rampa wahadłowa, zygzak, obwiednia z G41" },
      { t: 1, op: "Kieszeń okrągła Ø20, gł. 4", how: "spirala: podprogram O2000 M98 P2000 L4" },
      { t: 2, op: "Nawiercanie otworów", how: "G82 z postojem" },
      { t: 3, op: "Wiercenie Ø5 pod gwint M6", how: "G83 Q4" },
      { t: 4, op: "Gwintowanie M6×1", how: "G84" },
    ],
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
G21 G90 G94 G17
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
G99 G83 X10. Y10. Z-18. R2. Q4. F380
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
G99 G84 X10. Y10. Z-15. R5. F500
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
  plytaPrzylaczeniowa,
  {
    slug: "korpus-pelny", title: "Korpus — pełna obróbka", mode: "mill", category: "Płyty i korpusy", level: "zaawansowany",
    summary: "Planowanie głowicą, kieszeń w trzech przejściach, fasolka frezem kulistym i cztery otwory przelotowe.",
    features: ["G43", "G41", "G83", "wiele narzędzi"],
    stock: { x: 120, y: 80, z: 25, ox: 0, oy: 0, oz: 25 },
    ops: [
      { t: 1, op: "Planowanie czoła, 1 mm", how: "trzy przejścia G01 głowicą Ø50" },
      { t: 2, op: "Kieszeń 64 × 24, gł. 9", how: "3 przejścia po 3 mm, tor środka odsunięty o promień" },
      { t: 3, op: "Fasolka zaokrąglona frezem kulistym", how: "G02/G03 w dnie kieszeni" },
      { t: 4, op: "4 otwory przelotowe Ø10", how: "G83 Q7" },
    ],
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
    slug: "korpus-4", title: "Korpus — 4 narzędzia", mode: "mill", category: "Płyty i korpusy", level: "średni",
    summary: "Krótszy korpus: planowanie, kieszeń, nawiercanie i wiercenie przelotowe.",
    features: ["G43", "G81", "G83"],
    ops: [
      { t: 1, op: "Planowanie", how: "głowica Ø50" },
      { t: 2, op: "Kieszeń", how: "frez Ø16, przejścia warstwami" },
      { t: 3, op: "Nawiercanie", how: "G82 z postojem P300" },
      { t: 4, op: "Otwory przelotowe Ø10", how: "G83 Q7" },
    ],
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
    slug: "plytka-m10", title: "Płytka z gwintami M10", mode: "mill", category: "Płyty i korpusy", level: "średni",
    summary: "Kontur frezem Ø12, cztery otwory Ø8,5 i gwintowanie M10×1,5 cyklem G84.",
    features: ["G81", "G84", "G43"],
    stock: { x: 90, y: 60, z: 25, ox: 0, oy: 0, oz: 25 },
    lesson: L("frezowanie", "F5.3"),
    ops: [
      { t: 1, op: "Kontur 80 × 50, gł. 4", how: "G42 D01 — korekcja po prawej" },
      { t: 2, op: "4 otwory Ø8,5 pod M10", how: "G83 Q6" },
      { t: 3, op: "Gwintowanie M10×1,5", how: "G84" },
    ],
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
    slug: "kolnierz-okragly", title: "Kołnierz z otworami na okręgu", mode: "mill", category: "Płyty i korpusy", level: "zaawansowany",
    summary: "Okrągły kołnierz Ø90 na kwadratowej płycie: narożniki zebrane okręgami o malejącym promieniu, kontur na gotowo pełnym łukiem z korekcją, kieszeń Ø40 z wejściem po spirali i sześć otworów na średnicy podziałowej 70.",
    features: ["G41", "G02 pełny okrąg", "spirala", "M98", "G82", "G83"],
    stock: { x: 100, y: 100, z: 15, ox: 50, oy: 50, oz: 15 },
    lesson: L("frezowanie", "F6.3"),
    ops: [
      { t: 1, op: "Naroża płyty i kontur kołnierza Ø90", how: "G41, kontur kołowy na gotowo" },
      { t: 1, op: "Kieszeń Ø40, gł. 8", how: "spirala z podprogramu M98 P2002 L8" },
      { t: 2, op: "Nawiercanie otworów na okręgu", how: "G82" },
      { t: 3, op: "Wiercenie Ø8,5", how: "G83 Q4" },
    ],
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
    slug: "gwint-frezem", title: "Gwint wewnętrzny M24×2 frezem", mode: "mill", category: "Płyty i korpusy", level: "zaawansowany",
    summary: "Wiercenie Ø20, wytaczanie po spirali do Ø22 i frezowanie gwintu M24×2 — każdy zwój to jeden obrót G03 z przesuwem o skok, powtarzany podprogramem.",
    features: ["G83", "interpolacja śrubowa", "M98", "frez do gwintów"],
    stock: { x: 60, y: 60, z: 30, ox: 30, oy: 30, oz: 30 },
    lesson: L("frezowanie", "F6.3"),
    ops: [
      { t: 1, op: "Otwór wstępny Ø20", how: "G83 Q5" },
      { t: 2, op: "Wytaczanie frezem pod gwint", how: "spirala: M98 P2000 L16" },
      { t: 3, op: "Frezowanie gwintu M24×2", how: "linia śrubowa w górę: M98 P2001 L10" },
    ],
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
    slug: "wpust-faza", title: "Płytka z rowkiem wpustowym, otworami i fazą", mode: "mill", category: "Płyty i korpusy", level: "średni",
    summary: "Rowek 8 × 40 wybierany wahadłowo po rampie, cztery otwory przelotowe Ø6,6 z nawierceniem i faza 1 × 45° fazownikiem po obwodzie z korekcją G41.",
    features: ["rampa", "G82", "G83", "G41", "fazownik"],
    stock: { x: 80, y: 40, z: 20, ox: 0, oy: 0, oz: 20 },
    lesson: L("frezowanie", "F6.2"),
    ops: [
      { t: 1, op: "Rowek 8 × 40, gł. 4", how: "wahadłowo po rampie, 1 mm na przejście" },
      { t: 3, op: "Nawiercanie 4 otworów", how: "G82 Z−3,3" },
      { t: 4, op: "4 otwory przelotowe Ø6,6", how: "G83 Q5" },
      { t: 2, op: "Faza 1 × 45° na obwodzie", how: "G41 D2, obejście współbieżne" },
    ],
    tools: {
    1: { kind: "endmill", name: "Frez Ø8", d: 8 },
    2: { kind: "chamfer", name: "Fazownik Ø10 90°", d: 10, angle: 90 },
    3: { kind: "spotdrill", name: "Nawiertak Ø10 90°", d: 10, angle: 90 },
    4: { kind: "drill", name: "Wiertło Ø6,6", d: 6.6, angle: 118 }
    },
    src: `O1103 (PLYTKA - ROWEK WPUSTOWY, OTWORY I FAZA)
(PLYTA 80X40X20, ZERO: LEWY DOLNY NAROZNIK, Z0 NA GORZE)
G21 G90 G17 G54 G40 G49 G80
(--- 1. ROWEK 8 X 40, GL. 4 - WAHADLOWO PO RAMPIE ---)
T1 M06 (FREZ FI8)
G43 H1 Z50.
S4000 M03
M08
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
(--- 2. NAWIERCANIE 4 OTWOROW ---)
T3 M06 (NAWIERTAK FI10 90ST)
G43 H3 Z50.
S2000 M03
G00 X8. Y8.
G00 Z5.
G99 G82 Z-3.3 R2. P200 F150
X72.
Y32.
G98 X8.
G80
M05
(--- 3. OTWORY PRZELOTOWE FI6.6 ---)
T4 M06 (WIERTLO FI6.6)
G43 H4 Z50.
S2400 M03
G00 X8. Y8.
G00 Z5.
G99 G83 Z-23. R2. Q5. F220
X72.
Y32.
G98 X8.
G80
M05
(--- 4. FAZA 1X45 NA OBWODZIE ---)
T2 M06 (FAZOWNIK FI10 90ST)
G43 H2 Z50.
S3500 M03
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
  tabliczkaGrawer,
  {
    slug: "kostka-os-a", title: "Kostka na 4. osi — cztery ściany", mode: "mill", category: "4 i 5 osi", level: "średni",
    summary: "Indeksowanie osi A co 90°: na dwóch ścianach rowek z podprogramu, na dwóch — po dwa otwory G81. Zero na osi obrotu, odjazd w Z przed każdym obrotem.",
    features: ["A", "M98", "G81", "indeksowanie"],
    stock: { x: 60, y: 40, z: 40, ox: 0, oy: 20, oz: 20 },
    ops: [
      { t: 1, op: "Rowek wzdłużny na A0 i A180, gł. 2", how: "podprogram O4100, odjazd Z40 przed obrotem" },
      { t: 2, op: "Po dwa otwory Ø6 na A90 i A270", how: "podprogram O4200 z G81" },
    ],
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
  walek4Os,
  korpus5OsiFanuc,
  korpus5OsiSinumerik,
  {
    slug: "cam-forma", title: "Forma z powierzchnią swobodną (program z CAM)", mode: "mill", category: "Programy z CAM", level: "zaawansowany",
    summary: "Tak wygląda program z CAM dla kształtu z modelu 3D: zgrubnie warstwami frezem Ø10 z naddatkiem, potem wykańczanie frezem kulistym Ø6 co 1 mm — około 7 tysięcy bloków samych współrzędnych.",
    features: ["CAM", "G01", "frez kulisty", "3D"],
    stock: { x: 80, y: 60, z: 25, ox: 0, oy: 0, oz: 25 },
    ops: [
      { t: 1, op: "Zgrubnie warstwami co 3 mm, naddatek 0,8", how: "frez Ø10, G01 po powierzchni" },
      { t: 2, op: "Wykańczanie co 1 mm", how: "frez kulisty Ø6, raster ok. 6 tys. bloków" },
    ],
    tools: {
    1: { kind: "endmill", name: "Frez walcowo-czołowy Ø10", d: 10, flutes: 3 },
    2: { kind: "ballnose", name: "Frez kulisty Ø6", d: 6, flutes: 2, len: 20 }
    },
    src: camForma(),
  },
  {
    slug: "cam-kopula-5osi", title: "Kopuła 5-osiowa z TCP (program z CAM)", mode: "mill", category: "Programy z CAM", level: "zaawansowany",
    summary: "Zgrubnie okręgami wokół kopuły (3 osie), potem wykańczanie 5-osiowe po spirali: wierzchołek narzędzia na powierzchni (G43.4), oś narzędzia pochylona w stronę normalnej, A i C zmieniają się w każdym bloku.",
    features: ["CAM", "G43.4", "A", "C", "5 osi jednocześnie"],
    stock: { x: 60, y: 60, z: 40, ox: 30, oy: 30, oz: 40 },
    ops: [
      { t: 1, op: "Zgrubnie okręgami wokół kopuły co 3 mm", how: "G02 pełnymi okręgami, 3 osie" },
      { t: 2, op: "Wykańczanie 5-osiowe po spirali", how: "G43.4 (TCP), A i C w każdym bloku" },
    ],
    tools: {
    1: { kind: "endmill", name: "Frez walcowo-czołowy Ø12", d: 12, flutes: 4 },
    2: { kind: "ballnose", name: "Frez kulisty Ø6", d: 6, flutes: 2, len: 25 }
    },
    src: camKopula(),
  },
  {
    slug: "walek-gcat", title: "Wałek stopniowany GCat", mode: "lathe", category: "Wałki i tuleje", level: "zaawansowany",
    summary: "Program wałka z całej ścieżki toczenia: planowanie, G71/G70 z korekcją ostrza, podcięcie, gwint M20×1,5 i otwór osiowy.",
    features: ["G71", "G70", "G42", "G75", "G76", "G74"],
    lesson: L("toczenie", "T8.1"),
    ops: [
      { t: 101, op: "Planowanie czoła i toczenie zgrubne", how: "G71 U2 R0,5" },
      { t: 202, op: "Toczenie na gotowo", how: "G42 + G70" },
      { t: 303, op: "Podcięcie pod gwint", how: "G75" },
      { t: 404, op: "Gwint M20×1,5", how: "G76" },
      { t: 505, op: "Otwór osiowy Ø8, gł. 15", how: "G74 Q3000" },
    ],
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
  walekRowkiGwint,
  {
    slug: "sworzen-m16", title: "Sworzeń M16×2 z odcięciem", mode: "lathe", category: "Wałki i tuleje", level: "zaawansowany",
    summary: "Czop pod gwint, podcięcie, gwint M16×2 i odcięcie gotowego detalu od pręta — pełny cykl z pręta.",
    features: ["G71", "G70", "G75", "G76", "odcinanie"],
    lesson: L("toczenie", "T7.1"),
    ops: [
      { t: 101, op: "Planowanie i toczenie zgrubne", how: "G71" },
      { t: 202, op: "Toczenie na gotowo", how: "G42 + G70" },
      { t: 303, op: "Podcięcie pod gwint", how: "G75" },
      { t: 404, op: "Gwint M16×2", how: "G76" },
      { t: 303, op: "Odcięcie detalu", how: "G01 X−0,5" },
    ],
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
    slug: "tuleja-gwint-wewn", title: "Tuleja z gwintem wewnętrznym M30×1,5", mode: "lathe", category: "Wałki i tuleje", level: "zaawansowany",
    summary: "Toczenie zewnętrzne, wiercenie Ø20, wytaczanie cyklem G71 od środka i gwint wewnętrzny G76 nożem skierowanym od osi.",
    features: ["G71 wewnętrzny", "G74", "G76 wewnętrzny", "wytaczak"],
    lesson: L("toczenie", "T7.1"),
    ops: [
      { t: 101, op: "Planowanie, toczenie zewnętrzne zgrubnie i na gotowo", how: "G71 / G70" },
      { t: 202, op: "Wiercenie Ø20", how: "G74 Q5000" },
      { t: 303, op: "Wytaczanie pod gwint Ø28,4", how: "G71 wewnętrzny (U−0,4) i G70" },
      { t: 404, op: "Gwint wewnętrzny M30×1,5", how: "G76" },
    ],
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
    slug: "walek-stozek", title: "Wałek ze stożkiem 1:10, otworem osiowym i rowkiem", mode: "lathe", category: "Wałki i tuleje", level: "średni",
    summary: "Stożek zapisany jednym blokiem G01 w obu osiach (średnica rośnie o 1 mm na 10 mm długości), toczenie G71 / G70, otwór osiowy Ø10 wiercony cyklem G74, rowek na Ø36 i odcięcie od pręta.",
    features: ["G01 X Z", "stożek", "G71", "G70", "G74", "G75", "odcinanie"],
    lesson: L("toczenie", "T3.2"),
    ops: [
      { t: 101, op: "Planowanie czoła i toczenie zgrubne", how: "G71 U2 R0,5" },
      { t: 202, op: "Stożek 1:10 i stopnie na gotowo", how: "G42 + G70" },
      { t: 505, op: "Otwór osiowy Ø10, gł. 20", how: "G74 Q3000 — wiercenie z wycofaniem" },
      { t: 303, op: "Rowek Ø32 na Ø36", how: "G75" },
      { t: 303, op: "Odcięcie", how: "G01 X−0,5 F0,04" },
    ],
    tools: {
    101: { kind: "turning", name: "Nóż zewnętrzny CNMG 120408", d: 0.8, angle: 95, shape: "C" },
    202: { kind: "turning", name: "Nóż wykańczający VBMT 160404", d: 0.4, angle: 93, shape: "V" },
    303: { kind: "grooving", name: "Nóż do rowków i odcinania 3 mm", d: 3 },
    505: { kind: "drill", name: "Wiertło Ø10", d: 10 }
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
G28 U0.
G28 W0.
(OTWOR OSIOWY FI10 GL.20)
T0505 (WIERTLO FI10)
G97 S1200 M03
G00 X0. Z5.
G74 R0.5
G74 Z-20. Q3000 F0.08
G00 Z5.
G28 U0.
G28 W0.
(ROWEK NA FI36 I ODCIECIE)
T0303 (NOZ DO ROWKOW 3MM)
G96 S120 M03
G00 X40. Z-57.
G75 R0.5
G75 X32. Z-58. P1000 Q1000 F0.05
G00 X40.
G97 S800 M03
G00 Z-68.
G01 X-0.5 F0.04
G00 X44.
M09
M05
G28 U0.
G28 W0.
M30`,
  },
  {
    slug: "koncowka-kulista", title: "Końcówka kulista R10 z rowkiem i odcięciem", mode: "lathe", category: "Wałki i tuleje", level: "średni",
    summary: "Półkula R10 na czole wałka: zgrubnie G71, na gotowo wąską płytką V 35°, która przechodzi cały łuk bez podcinania. Potem rowek Ø20 na czopie i odcięcie gotowej końcówki od pręta.",
    features: ["G03", "G71", "G70", "płytka V", "G75", "odcinanie"],
    lesson: L("toczenie", "T3.3"),
    ops: [
      { t: 101, op: "Planowanie czoła i toczenie zgrubne", how: "G71 U1,5 R0,5" },
      { t: 202, op: "Półkula R10 i czop na gotowo", how: "G42 + G70, płytka V 35°" },
      { t: 303, op: "Rowek Ø20 na czopie Ø24", how: "G75" },
      { t: 303, op: "Odcięcie końcówki", how: "G01 X−0,5 F0,04" },
    ],
    tools: {
    101: { kind: "turning", name: "Nóż zewnętrzny CNMG 120408", d: 0.8, angle: 95, shape: "C" },
    202: { kind: "turning", name: "Nóż wykańczający VBMT 160404", d: 0.4, angle: 93, shape: "V" },
    303: { kind: "grooving", name: "Nóż do rowków i odcinania 3 mm", d: 3 }
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
G28 U0.
G28 W0.
(ROWEK FI20 NA CZOPIE FI24)
T0303 (NOZ DO ROWKOW 3MM)
G96 S120 M03
G00 X28. Z-37.
G75 R0.5
G75 X20. Z-38. P1000 Q1000 F0.05
G00 X30.
(ODCIECIE)
G97 S800 M03
G00 X28. Z-48.
G01 X-0.5 F0.04
G00 X30.
M09
M05
G28 U0.
G28 W0.
M30`,
  },
  {
    slug: "kolnierz-g72", title: "Kołnierz z piastą — G72, wiercenie, wytaczanie, odcięcie", mode: "lathe", category: "Wałki i tuleje", level: "średni",
    summary: "Detal krótki i szeroki: przejścia poprzeczne cyklem G72 i wykończenie G70, otwór Ø16 przez piastę cyklem G74, wytaczanie do Ø20 z fazą cyklem G71 od środka i odcięcie kołnierza od pręta.",
    features: ["G72", "G70", "G74", "G71 wewnętrzny", "wytaczak", "odcinanie"],
    lesson: L("toczenie", "T5.2"),
    ops: [
      { t: 101, op: "Planowanie i piasta Ø30 zgrubnie", how: "G72 W2 R0,5 — przejścia poprzeczne" },
      { t: 202, op: "Piasta na gotowo", how: "G70 P10 Q20" },
      { t: 505, op: "Otwór Ø16 przez piastę", how: "G74 Q4000" },
      { t: 606, op: "Wytaczanie Ø20 z fazą 1 × 45°", how: "G71 wewnętrzny (U−0,3) i G70" },
      { t: 303, op: "Odcięcie kołnierza", how: "G01 X18 — do otworu" },
    ],
    tools: {
    101: { kind: "turning", name: "Nóż zewnętrzny CNMG 120408", d: 0.8, angle: 95, shape: "C" },
    202: { kind: "turning", name: "Nóż wykańczający VBMT 160404", d: 0.4, angle: 93, shape: "V" },
    303: { kind: "grooving", name: "Nóż do odcinania 3 mm", d: 3 },
    505: { kind: "drill", name: "Wiertło Ø16", d: 16 },
    606: { kind: "boring", name: "Wytaczak DNMG 110404", d: 0.4, angle: 93, shape: "D" }
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
G28 U0.
G28 W0.
(OTWOR FI16 PRZEZ PIASTE)
T0505 (WIERTLO FI16)
G97 S900 M03
G00 X0. Z5.
G74 R0.5
G74 Z-28. Q4000 F0.1
G00 Z5.
G28 U0.
G28 W0.
(WYTACZANIE FI20 Z FAZA)
T0606 (WYTACZAK DNMG 110404)
G96 S180 M03
G00 X15. Z2.
G71 U1. R0.5
G71 P30 Q40 U-0.3 W0.05 F0.15
N30 G00 X22.
G01 X20. Z-1. F0.08
Z-26.
N40 X15.
G70 P30 Q40
G00 Z5.
G28 U0.
G28 W0.
(ODCIECIE KOLNIERZA)
T0303 (NOZ DO ODCINANIA 3MM)
G97 S600 M03
G00 X64. Z-25.
G01 X18. F0.04
G00 X64.
M09
M05
G28 U0.
G28 W0.
M30`,
  }
];

/** Program po adresie; stare adresy usuniętych krótkich programów prowadzą do detalu z tą samą techniką. */
export const programBySlug = (slug: string) => PROGRAMS.find((p) => p.slug === (PROGRAM_REDIRECTS[slug] ?? slug));
