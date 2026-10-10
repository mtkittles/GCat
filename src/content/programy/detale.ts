import type { LibProgram } from "@/lib/programLibrary";

/*
  Detale wielozabiegowe: każdy program to kompletna obróbka z kilkoma narzędziami
  i kartą technologiczną (`ops`) — kolejne zabiegi, narzędzie, kody i parametry.
*/

export const plytaPrzylaczeniowa: LibProgram = {
  slug: "plyta-przylaczeniowa", title: "Płyta przyłączeniowa — 9 narzędzi", mode: "mill", category: "Płyty i korpusy", level: "zaawansowany",
  summary: "Pełna obróbka płyty 110 × 70 z surówki: planowanie, kontur z promieniami R10 z korekcją G41, kieszeń z podprogramu pisanego przyrostowo (G91), trzy rowki obracane G68, nawiercanie, wiercenie głębokie G83 i G73, rozwiercanie otworów kołkowych H7 i gwinty M8.",
  features: ["G41", "G02", "M98 L", "G91", "G68", "G82", "G83", "G73", "G85", "G84"],
  stock: { x: 120, y: 80, z: 26, ox: 0, oy: 0, oz: 25 },
  tools: {
    1: { kind: "facemill", name: "Głowica Ø63", d: 63, flutes: 5 },
    2: { kind: "endmill", name: "Frez walcowo-czołowy Ø16", d: 16, flutes: 4 },
    3: { kind: "endmill", name: "Frez walcowo-czołowy Ø8", d: 8, flutes: 3 },
    4: { kind: "spotdrill", name: "Nawiertak Ø10 90°", d: 10, angle: 90 },
    5: { kind: "drill", name: "Wiertło Ø6,8 (pod M8)", d: 6.8, angle: 118 },
    6: { kind: "drill", name: "Wiertło Ø5,8 (pod rozwiertak)", d: 5.8, angle: 118 },
    7: { kind: "reamer", name: "Rozwiertak Ø6 H7", d: 6, flutes: 6 },
    8: { kind: "drill", name: "Wiertło Ø10", d: 10, angle: 118 },
    9: { kind: "tap", name: "Gwintownik M8×1,25", d: 8, flutes: 1.25 },
  },
  ops: [
    { t: 1, op: "Planowanie górnej powierzchni (naddatek 1 mm)", how: "G01 dwoma przejściami, Z0" },
    { t: 2, op: "Kontur 110 × 70 z promieniami R10, gł. 10", how: "G41 D2, G02 R10, podprogram O2200 dwa razy (Z−5, Z−10)" },
    { t: 3, op: "Kieszeń 30 × 20, gł. 6", how: "podprogram O2100 pisany w G91, M98 P2100 L3 — po 2 mm na wywołanie" },
    { t: 3, op: "Trzy rowki co 120° wokół X85 Y40, gł. 3", how: "G68 R90 / R210 / R330 + ten sam podprogram O2300" },
    { t: 4, op: "Nawiercanie 7 otworów", how: "G82 Z−3 z postojem P200" },
    { t: 5, op: "4 otwory pod gwint M8, przelotowe", how: "G83 Q5 — wiercenie głębokie z pełnym wycofaniem" },
    { t: 6, op: "2 otwory kołkowe pod rozwiercanie", how: "G73 Q3 — łamanie wióra bez wycofania" },
    { t: 7, op: "Rozwiercanie Ø6 H7, gł. 15", how: "G85 — wyjście posuwem roboczym" },
    { t: 8, op: "Otwór środkowy Ø10 przelotowy", how: "G83 Q6, powrót G98" },
    { t: 9, op: "Gwintowanie M8×1,25", how: "G84, F = S × skok = 500 × 1,25 = 625" },
  ],
  src: `O1200 (PLYTA PRZYLACZENIOWA 110X70X25)
(SUROWKA 120X80X26, ZERO: LEWY DOLNY NAROZNIK, Z0 NA GORZE)
(NADDATEK 1 MM NA GORZE, KONTUR 110X70 R10 NA GLEBOKOSC 10)
G21 G90 G94 G17
G40 G49 G80
G54
(--- 1. PLANOWANIE ---)
T1 M06 (GLOWICA FI63 5Z)
G43 H1 Z50.
S1000 M03
M08
G00 X-40. Y20.
G00 Z5.
G01 Z0. F200
G01 X160. F800
G01 Y60.
G01 X-40.
G00 Z50.
M09
M05
(--- 2. KONTUR ZEWNETRZNY Z KOREKCJA G41, DWA PRZEJSCIA ---)
T2 M06 (FREZ FI16 4Z)
G43 H2 Z50.
S3000 M03
M08
G00 X-15. Y-15.
G00 Z2.
G01 Z-5. F300
M98 P2200
G01 Z-10. F300
M98 P2200
G00 Z50.
M09
M05
(--- 3. KIESZEN 30X20 GL.6 - PODPROGRAM PRZYROSTOWY G91 ---)
T3 M06 (FREZ FI8 3Z)
G43 H3 Z50.
S4500 M03
M08
G00 X25. Y40.
G00 Z2.
G01 Z0. F200
M98 P2100 L3
G00 Z5.
(--- 4. TRZY ROWKI CO 120ST WOKOL X85 Y40 - OBROT UKLADU G68 ---)
G68 X85. Y40. R90.
M98 P2300
G69
G68 X85. Y40. R210.
M98 P2300
G69
G68 X85. Y40. R330.
M98 P2300
G69
G00 Z50.
M09
M05
(--- 5. NAWIERCANIE 7 OTWOROW ---)
T4 M06 (NAWIERTAK FI10 90ST)
G43 H4 Z50.
S2000 M03
M08
G00 X14. Y14.
G00 Z5.
G99 G82 Z-3. R2. P200 F150
X106.
Y66.
X14.
X60. Y20.
Y60.
G98 X85. Y40.
G80
M09
M05
(--- 6. OTWORY POD M8 - WIERCENIE GLEBOKIE G83 ---)
T5 M06 (WIERTLO FI6.8)
G43 H5 Z50.
S2200 M03
M08
G00 X14. Y14.
G00 Z5.
G99 G83 Z-29. R2. Q5. F250
X106.
Y66.
G98 X14.
G80
M09
M05
(--- 7. OTWORY KOLKOWE FI6 H7 - G73 I ROZWIERCANIE G85 ---)
T6 M06 (WIERTLO FI5.8)
G43 H6 Z50.
S2500 M03
M08
G00 X60. Y20.
G00 Z5.
G99 G73 Z-18. R2. Q3. F250
G98 Y60.
G80
M05
T7 M06 (ROZWIERTAK FI6 H7)
G43 H7 Z50.
S600 M03
G00 X60. Y20.
G00 Z5.
G99 G85 Z-15. R2. F80
G98 Y60.
G80
M09
M05
(--- 8. OTWOR SRODKOWY FI10 PRZELOTOWY ---)
T8 M06 (WIERTLO FI10)
G43 H8 Z50.
S1600 M03
M08
G00 X85. Y40.
G00 Z5.
G98 G83 Z-30. R2. Q6. F200
G80
M09
M05
(--- 9. GWINTY M8X1.25 ---)
T9 M06 (GWINTOWNIK M8X1.25)
G43 H9 Z50.
S500 M03
M08
G00 X14. Y14.
G00 Z10.
G99 G84 Z-16. R5. F625
X106.
Y66.
G98 X14.
G80
M09
M05
G91 G28 Z0.
G90
M30
O2100 (WARSTWA KIESZENI 30X20 - PRZYROSTOWO)
G91 G01 Z-2. F100
X10. F350
X3. Y-3.
Y6.
X-16.
Y-6.
X16.
X3. Y-3.
Y12.
X-22.
Y-12.
X22.
X-16. Y6.
G90
M99
O2200 (KONTUR 110X70 R10 - JEDNO PRZEJSCIE)
G41 D2 G01 X5. Y0. F500
G01 Y65.
G02 X15. Y75. R10.
G01 X105.
G02 X115. Y65. R10.
G01 Y15.
G02 X105. Y5. R10.
G01 X15.
G02 X5. Y15. R10.
G01 Y25.
G40 G01 X-15. Y25.
G00 Y-15.
M99
O2300 (ROWEK R11-R18 GL.3 W UKLADZIE OBROCONYM)
G00 X96. Y40.
G00 Z2.
G01 Z-1.5 F100
G01 X103. F300
G01 Z-3. F100
G01 X96. F300
G00 Z5.
M99`,
};

export const tabliczkaGrawer: LibProgram = {
  slug: "tabliczka-grawer", title: "Tabliczka znamionowa z grawerem", mode: "mill", category: "Płyty i korpusy", level: "średni",
  summary: "Tabliczka 100 × 50: zagłębienie pod napis frezowane zygzakiem z obwiednią na gotowo, napis GCAT grawerem V 60° w dnie, otwory montażowe z pogłębieniem stożkowym i faza obwodu z korekcją G41.",
  features: ["zygzak", "grawer V", "G82", "G83", "G41", "fazownik"],
  stock: { x: 100, y: 50, z: 12, ox: 0, oy: 0, oz: 12 },
  tools: {
    1: { kind: "endmill", name: "Frez walcowo-czołowy Ø10", d: 10, flutes: 3 },
    2: { kind: "vbit", name: "Grawer V 60° Ø6", d: 6, angle: 60 },
    3: { kind: "spotdrill", name: "Nawiertak Ø10 90° (pogłębienie)", d: 10, angle: 90 },
    4: { kind: "drill", name: "Wiertło Ø3,4", d: 3.4, angle: 118 },
    5: { kind: "chamfer", name: "Fazownik Ø10 90°", d: 10, angle: 90 },
  },
  ops: [
    { t: 1, op: "Zagłębienie 70 × 26 pod napis, gł. 1", how: "zygzak co 4 mm, potem obwiednia na gotowo" },
    { t: 2, op: "Grawerowanie napisu GCAT, 0,5 mm w dnie", how: "G00 / G01 z podnoszeniem między kreskami" },
    { t: 3, op: "Nawiercanie z pogłębieniem 90° pod łeb M3", how: "G82 Z−3,2 z postojem — stożek Ø6,4" },
    { t: 4, op: "4 otwory przelotowe Ø3,4", how: "G83 Q3" },
    { t: 5, op: "Faza 1 × 45° na obwodzie", how: "G41 D5, obejście w prawo (współbieżnie)" },
  ],
  src: `O1300 (TABLICZKA ZNAMIONOWA 100X50X12 - GRAWER GCAT)
(ZERO: LEWY DOLNY NAROZNIK, Z0 NA GORZE)
G21 G90 G94 G17
G40 G49 G80
G54
(--- 1. ZAGLEBIENIE POD NAPIS 70X26 GL.1 ---)
T1 M06 (FREZ FI10 3Z)
G43 H1 Z50.
S4000 M03
M08
G00 X20. Y17.
G00 Z2.
G01 Z-1. F150
G01 X80. F600
Y21.
X20.
Y25.
X80.
Y29.
X20.
Y33.
X80.
(OBWIEDNIA NA GOTOWO)
Y17.
X20.
Y33.
X80.
G00 Z50.
M09
M05
(--- 2. GRAWEROWANIE NAPISU GCAT W DNIE ZAGLEBIENIA ---)
T2 M06 (GRAWER V 60ST FI6)
G43 H2 Z50.
S12000 M03
(LITERA G)
G00 X29. Y35.
G00 Z1.
G01 Z-1.5 F100
G01 X17. F400
Y15.
X29.
Y24.
X23.
G00 Z1.
(LITERA C)
G00 X47. Y35.
G01 Z-1.5 F100
G01 X35. F400
Y15.
X47.
G00 Z1.
(LITERA A)
G00 X53. Y15.
G01 Z-1.5 F100
G01 X59. Y35. F400
X65. Y15.
G00 Z1.
G00 X56. Y25.
G01 Z-1.5 F100
G01 X62. F400
G00 Z1.
(LITERA T)
G00 X71. Y35.
G01 Z-1.5 F100
G01 X83. F400
G00 Z1.
G00 X77. Y35.
G01 Z-1.5 F100
G01 Y15. F400
G00 Z50.
M05
(--- 3. NAWIERCANIE Z POGLEBIENIEM POD LEB M3 ---)
T3 M06 (NAWIERTAK FI10 90ST)
G43 H3 Z50.
S2500 M03
M08
G00 X7. Y7.
G00 Z5.
G99 G82 Z-3.2 R2. P300 F150
X93.
Y43.
G98 X7.
G80
M05
(--- 4. OTWORY PRZELOTOWE FI3.4 ---)
T4 M06 (WIERTLO FI3.4)
G43 H4 Z50.
S4000 M03
G00 X7. Y7.
G00 Z5.
G99 G83 Z-14. R2. Q3. F200
X93.
Y43.
G98 X7.
G80
M05
(--- 5. FAZA 1X45 NA OBWODZIE ---)
T5 M06 (FAZOWNIK FI10 90ST)
G43 H5 Z50.
S5000 M03
G00 X-10. Y-10.
G00 Z2.
G01 Z-1.5 F200
G41 D5 G01 X0. Y-5. F600
G01 Y50.
X100.
Y0.
X-5.
G40 G01 X-10. Y-10.
G00 Z50.
M09
M05
G91 G28 Z0.
G90
M30`,
};

export const walek4Os: LibProgram = {
  slug: "walek-4-os", title: "Wałek na 4. osi — płaszczyzny, rowek śrubowy, otwory", mode: "mill", category: "4 i 5 osi", level: "zaawansowany",
  summary: "Wałek Ø60 w uchwycie stołu obrotowego A: dwie płaszczyzny po obrocie o 180°, rowek śrubowy (ruch jednoczesny X i A), rowek obwodowy samym obrotem oraz nawiercanie i wiercenie prostopadle do płaszczyzn — każda strona z tego samego podprogramu.",
  features: ["A", "G01 X A", "M98", "indeksowanie", "G82", "G83"],
  stock: { shape: "cylX", d: 60, len: 100, ox: 0, oz: 30, grip: 10 },
  tools: {
    1: { kind: "endmill", name: "Frez walcowo-czołowy Ø16", d: 16, flutes: 4 },
    2: { kind: "ballnose", name: "Frez kulisty Ø6", d: 6, flutes: 2 },
    3: { kind: "spotdrill", name: "Nawiertak Ø8 90°", d: 8, angle: 90 },
    4: { kind: "drill", name: "Wiertło Ø6", d: 6, angle: 118 },
  },
  ops: [
    { t: 1, op: "Płaszczyzna od X60 do czoła na A0, gł. 3", how: "podprogram O4300: dwie warstwy po 1,5 mm, wejście od czoła" },
    { t: 1, op: "Ta sama płaszczyzna na A180", how: "G00 Z40 przed obrotem, G00 A180, M98 P4300" },
    { t: 2, op: "Rowek śrubowy X15–X51, gł. 2", how: "G01 X51 A360 — jeden obrót na 36 mm" },
    { t: 2, op: "Rowek obwodowy na X56, gł. 2", how: "G01 A360 — sam obrót stołu" },
    { t: 3, op: "Nawiercanie 2 + 2 otworów na płaszczyznach", how: "O4400: G82, poziom R−1 nad płaszczyzną" },
    { t: 4, op: "Wiercenie Ø6, gł. 15 od płaszczyzny", how: "O4500: G83 Q4 na A0 i A180" },
  ],
  src: `O4003 (WALEK FI60 NA 4. OSI - PLASZCZYZNY, ROWEK SRUBOWY, OTWORY)
(ZERO: X0 LEWE CZOLO, Z0 NA POWIERZCHNI WALCA, Y0 NA OSI)
(UCHWYT TRZYMA X0-X10, OBROBKA OD X15)
G21 G90 G94 G17 G40 G49 G80
G54
(--- 1. DWIE PLASZCZYZNY NA A0 I A180, GL.3 ---)
T1 M06 (FREZ FI16 4Z)
G43 H1 Z60.
S3000 M03
M08
G00 A0
M98 P4300
G00 Z40. (ODJAZD PRZED OBROTEM)
G00 A180.
M98 P4300
G00 Z40.
M09
M05
(--- 2. ROWEK SRUBOWY I ROWEK OBWODOWY ---)
T2 M06 (FREZ KULISTY FI6)
G43 H2 Z60.
S5000 M03
M08
G00 X15. Y0 Z5. A0
G01 Z-2. F100
G01 X51. A360. F300 (JEDEN OBROT NA 36 MM)
G00 Z5.
G00 X56. A0
G01 Z-2. F100
G01 A360. F300 (ROWEK OBWODOWY - SAM OBROT)
G00 Z40.
G00 A0
M09
M05
(--- 3. NAWIERCANIE NA PLASZCZYZNACH ---)
T3 M06 (NAWIERTAK FI8 90ST)
G43 H3 Z60.
S2500 M03
M08
G00 A0
M98 P4400
G00 Z40.
G00 A180.
M98 P4400
G00 Z40.
M05
(--- 4. WIERCENIE FI6 GL.15 OD PLASZCZYZNY ---)
T4 M06 (WIERTLO FI6)
G43 H4 Z60.
S2800 M03
G00 A0
M98 P4500
G00 Z40.
G00 A180.
M98 P4500
G00 Z40.
G00 A0
M09
M05
M30
O4300 (PLASZCZYZNA OD X60 DO CZOLA, DWIE WARSTWY)
G00 X108. Y-6. Z5.
G01 Z-1.5 F300
G01 X68. F500
G00 Z5.
G00 X108. Y6.
G01 Z-1.5 F300
G01 X68. F500
G00 Z5.
G00 X108. Y-6.
G01 Z-3. F300
G01 X68. F500
G00 Z5.
G00 X108. Y6.
G01 Z-3. F300
G01 X68. F500
G00 Z5.
M99
O4400 (NAWIERCANIE DWOCH OTWOROW NA PLASZCZYZNIE)
G00 X72. Y0 Z5.
G99 G82 Z-5. R-1. P200 F120
X88.
G80
G00 Z5.
M99
O4500 (WIERCENIE FI6 GL.15 OD PLASZCZYZNY Z-3)
G00 X72. Y0 Z5.
G99 G83 Z-18. R-1. Q4. F150
X88.
G80
G00 Z5.
M99`,
};

export const korpus5OsiFanuc: LibProgram = {
  slug: "plaszczyzna-g68-2", title: "Korpus 3+2 i 5 osi: skos, otwory, rowek, faza z TCP (Fanuc)", mode: "mill", category: "4 i 5 osi", level: "zaawansowany",
  summary: "Kostka 60 × 60 × 40 na stole A/C. Skos 30° w płaszczyźnie pochylonej G68.2 z obrotem stołu G53.1, nawiercanie i wiercenie prostopadle do skosu, rowek na przedniej ścianie, a na koniec faza 4 × 45° na trzech krawędziach ruchem 5-osiowym z TCP (G43.4) — w narożach obraca się tylko stół.",
  features: ["G68.2", "G53.1", "G69", "G82", "G81", "G43.4", "A", "C", "3+2"],
  stock: { x: 60, y: 60, z: 40, ox: 30, oy: 30, oz: 40 },
  tools: {
    1: { kind: "endmill", name: "Frez walcowo-czołowy Ø16", d: 16, flutes: 4 },
    2: { kind: "spotdrill", name: "Nawiertak Ø8 90°", d: 8, angle: 90 },
    3: { kind: "drill", name: "Wiertło Ø6", d: 6, angle: 118 },
    4: { kind: "endmill", name: "Frez walcowo-czołowy Ø10", d: 10, flutes: 3 },
  },
  ops: [
    { t: 1, op: "Skos 30° na prawej krawędzi, 3 warstwy", how: "G68.2 X15 I90 J30 K−90 + G53.1 (stół ustawia oś narzędzia)" },
    { t: 2, op: "Nawiercanie 2 otworów w skosie", how: "G82 w płaszczyźnie pochylonej" },
    { t: 3, op: "Wiercenie Ø6, gł. 10 prostopadle do skosu", how: "G81, potem G69 i odjazd G53 Z0" },
    { t: 4, op: "Rowek na ścianie przedniej, gł. 3", how: "G68.2 Y−30 Z−20 J90 — oś Z płaszczyzny = −Y detalu" },
    { t: 4, op: "Faza 4 × 45° na krawędziach: przód, lewa, tył", how: "G43.4 (TCP), A45; w narożach G01 C270 / C360" },
  ],
  src: `O5001 (3+2 I 5 OSI - SKOS 30ST, OTWORY, ROWEK, FAZA Z TCP)
(KOSTKA 60X60X40, ZERO: SRODEK GORNEJ POWIERZCHNI)
(ZERO = SRODEK OBROTU STOLU, MASZYNA STOL A/C)
G21 G90 G94 G17 G40 G49 G80
G54
(--- 1. SKOS 30ST: PLASZCZYZNA POCHYLONA G68.2 ---)
T1 M06 (FREZ FI16)
S2500 M03
M08
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
(--- 2. NAWIERCANIE PROSTOPADLE DO SKOSU ---)
T2 M06 (NAWIERTAK FI8 90ST)
G43 H2 Z60.
S2500 M03
G00 X8.66 Y-15.
G99 G82 Z-2. R2. P200 F120
Y15.
G80
G00 Z60.
(--- 3. WIERCENIE FI6 GL.10 ---)
T3 M06 (WIERTLO FI6)
G43 H3 Z60.
S2800 M03
G00 X8.66 Y-15.
G99 G81 Z-10. R2. F150
Y15.
G80
G00 Z60.
G69
G49 G53 Z0 (ODJAZD W OSI Z MASZYNY)
(--- 4. ROWEK NA SCIANIE PRZEDNIEJ: OS Z PLASZCZYZNY = -Y DETALU ---)
T4 M06 (FREZ FI10)
G68.2 X0 Y-30. Z-20. I0 J90. K0
G53.1
G43 H4 Z50.
S3200 M03
G00 X-10. Y0
G00 Z2.
G01 Z-3. F150
G01 X10. F400
G00 Z50.
G69
G49 G53 Z0
(--- 5. FAZA 4X45 NA KRAWEDZIACH PRZOD, LEWA, TYL - 5 OSI Z TCP ---)
S4500 M03
G00 A45. C180. (OS NARZEDZIA NA KRAWEDZ PRZEDNIA)
G43.4 H4 (TCP: X Y Z = WIERZCHOLEK NARZEDZIA)
G00 X40. Y-28. Z50.
G00 Z-2.
G01 X-28. F600
G01 C270. (NAROZE: OBRACA SIE TYLKO STOL)
G01 Y28.
G01 C360.
G01 X15. (DO POCZATKU SKOSU)
G00 Z50.
G49
G00 A0 C360. (C360 = C0, BEZ COFANIA OBROTU)
M09
M05
M30`,
};

export const korpus5OsiSinumerik: LibProgram = {
  slug: "cycle800-sinumerik", title: "Korpus 3+2 i 5 osi: CYCLE800 i TRAORI (Sinumerik)", mode: "mill", dialect: "sinumerik", category: "4 i 5 osi", level: "zaawansowany",
  summary: "Ten sam korpus co w wersji Fanuc, zapisany w języku Sinumerika: CYCLE800 obraca układ osiowo i ustawia stół (skos 30° i ściana przednia), otwory wiercone ruchami G1 z wycofaniem, CYCLE800() wraca do położenia podstawowego, a fazę robi transformacja 5-osiowa TRAORI.",
  features: ["CYCLE800", "TRAORI", "TRAFOOF", "Sinumerik", "3+2", "5 osi"],
  stock: { x: 60, y: 60, z: 40, ox: 30, oy: 30, oz: 40 },
  tools: {
    1: { kind: "endmill", name: "Frez walcowo-czołowy Ø16", d: 16, flutes: 4 },
    2: { kind: "drill", name: "Wiertło Ø6", d: 6, angle: 118 },
    3: { kind: "endmill", name: "Frez walcowo-czołowy Ø10", d: 10, flutes: 3 },
  },
  ops: [
    { t: 1, op: "Skos 30° na prawej krawędzi, 3 warstwy", how: "CYCLE800 tryb 57 (X→Y→Z), _B = 30, punkt odniesienia X15" },
    { t: 2, op: "2 otwory Ø6 prostopadle do skosu", how: "G1 do Z−5, wycofanie, G1 do Z−10 (bez cyklu)" },
    { t: 3, op: "Rowek na ścianie przedniej, gł. 3", how: "CYCLE800 _A = 90 wokół X, potem CYCLE800()" },
    { t: 3, op: "Faza 4 × 45° na krawędziach: przód, lewa, tył", how: "TRAORI / TRAFOOF, A45, w narożach G1 C270 / C360" },
  ],
  src: `; KORPUS 60X60X40 - 3+2 Z CYCLE800 I FAZA Z TRAORI, STOL A/C
; ZERO: SRODEK GORNEJ POWIERZCHNI = SRODEK OBROTU STOLU
G17 G90 G94 G54
; --- 1. SKOS 30ST: OBROT O 30ST WOKOL Y, PUNKT ODNIESIENIA X15 ---
T1 D1 ; FREZ FI16
M6
S2500 M3
M8
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
; --- 2. OTWORY FI6 PROSTOPADLE DO SKOSU, WIERCENIE Z WYCOFANIEM ---
T2 D1 ; WIERTLO FI6
M6
S2800 M3
G0 X8.66 Y-15 Z5
G1 Z-5 F150
G0 Z2
G1 Z-10 F150
G0 Z5
G0 Y15
G1 Z-5 F150
G0 Z2
G1 Z-10 F150
G0 Z60
; --- 3. ROWEK NA SCIANIE PRZEDNIEJ: OBROT O 90ST WOKOL X ---
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
; --- 4. FAZA 4X45 NA KRAWEDZIACH PRZOD, LEWA, TYL - TRAORI ---
S4500 M3
G0 A45 C180
TRAORI
G0 X40 Y-28 Z50
G0 Z-2
G1 X-28 F600
G1 C270
G1 Y28
G1 C360
G1 X15
G0 Z50
TRAFOOF
G0 A0 C360
M9
M5
M30`,
};

export const walekRowkiGwint: LibProgram = {
  slug: "walek-rowki-gwint", title: "Wałek stopniowany — gwint M24, trzy rowki, odcięcie", mode: "lathe", category: "Wałki i tuleje", level: "zaawansowany",
  summary: "Pełny cykl z pręta Ø50 pięcioma nożami: planowanie czoła, zgrubnie G71, na gotowo G70 z korekcją promienia ostrza, podcięcie G75, trzy jednakowe rowki z jednego podprogramu przesuwanego adresem W, gwint M24×2 cyklem G76 i odcięcie detalu.",
  features: ["G71", "G70", "G42", "G75", "M98 L", "W", "G76", "odcinanie"],
  tools: {
    101: { kind: "turning", name: "Nóż zewnętrzny CNMG 120408", d: 0.8, angle: 95, shape: "C" },
    202: { kind: "turning", name: "Nóż wykańczający VBMT 160404", d: 0.4, angle: 93, shape: "V" },
    303: { kind: "grooving", name: "Nóż do rowków 3 mm", d: 3 },
    404: { kind: "threading", name: "Nóż do gwintów 60°", angle: 60 },
    505: { kind: "grooving", name: "Nóż do odcinania 3 mm", d: 3 },
  },
  ops: [
    { t: 101, op: "Planowanie czoła i toczenie zgrubne", how: "G01 do X−1,6; G71 U2 R0,5, naddatek U0,4 W0,1" },
    { t: 202, op: "Toczenie na gotowo: fazy, stopnie, promień R4", how: "G42 + G70 P10 Q20" },
    { t: 303, op: "Podcięcie pod gwint Ø20", how: "G75 X20 Z−24 P1000 Q1000" },
    { t: 303, op: "Trzy rowki Ø28 co 8 mm", how: "M98 P3100 L3 — podprogram przesuwa się W−8" },
    { t: 404, op: "Gwint M24×2", how: "G76 P010060 Q50, X21,55 Z−21 P1230 Q300 F2" },
    { t: 505, op: "Odcięcie detalu", how: "G01 X−0,5 F0,04 przy stałych obrotach G97" },
  ],
  src: `O3010 (WALEK STOPNIOWANY - GWINT M24X2, TRZY ROWKI, ODCIECIE)
(SUROWKA: PRET FI50, WYSIEG 85)
(KONTUR: X20 Z0 / X24 Z-2 / Z-24 / X30 / X32 Z-25 / Z-50)
(X36 / G02 X44 Z-54 R4 / Z-70 / X48 Z-72 / Z-76)
G18 G21 G40 G80 G99
G54
(--- 1. PLANOWANIE CZOLA I TOCZENIE ZGRUBNE G71 ---)
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
N10 G00 X20.
G01 X24. Z-2. F0.1
Z-24.
X30.
X32. Z-25.
Z-50.
X36.
G02 X44. Z-54. R4.
G01 Z-70.
X48. Z-72.
Z-76.
N20 X52.
G28 U0.
G28 W0.
(--- 2. WYKANCZANIE G70 Z KOREKCJA PROMIENIA OSTRZA ---)
T0202 (NOZ WYKANCZAJACY VBMT 160404)
G96 S250 M03
G42 G00 X52. Z2.
G70 P10 Q20
G40 G00 X54. Z5.
G28 U0.
G28 W0.
(--- 3. PODCIECIE POD GWINT I TRZY ROWKI Z PODPROGRAMU ---)
T0303 (NOZ DO ROWKOW 3MM)
G96 S120 M03
G00 X28. Z-23.
G75 R0.5
G75 X20. Z-24. P1000 Q1000 F0.05
G00 X36.
G00 Z-30.
M98 P3100 L3
G00 X54.
G28 U0.
G28 W0.
(--- 4. GWINT M24X2 ---)
T0404 (NOZ DO GWINTOW 60ST)
G97 S700 M03
G00 X28. Z6.
G76 P010060 Q50 R0.05
G76 X21.55 Z-21. P1230 Q300 F2.
G00 X54.
G28 U0.
G28 W0.
(--- 5. ODCIECIE GOTOWEGO DETALU ---)
T0505 (NOZ DO ODCINANIA 3MM)
G97 S800 M03
G00 X54. Z-75.
G01 X-0.5 F0.04
G00 X54.
M09
M05
G28 U0.
G28 W0.
M30
O3100 (ROWEK FI28 SZER.3 I PRZESUNIECIE O 8)
G01 X28. F0.05
G00 X36.
W-8.
M99`,
};
