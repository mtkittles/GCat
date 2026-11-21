/*
  Detale w oknie programu na stronie startowej (V3.1): obok płytki mocującej (homeDemo.ts) — wałek stopniowany
  (toczenie) i korpus z kieszenią i wyspą (frezowanie). Każdy w dwóch zapisach: Fanuc (ISO) i Sinumerik.
  Tor na stronie liczy parser z wersji Fanuc; wersja Sinumerik jest do porównania zapisu (tak jak w homeDemo.ts).
  Programy przechodzą walidator bez uwag (tests/pulpit.test.ts). Parametry skrawania przykładowe, do pokazu toru —
  nie są zaleceniem technologicznym.

  Wałek: półfabrykat ⌀50, stopnie ⌀40 (do Z-55) i ⌀30 (do Z-30), fazy 1 × 45°. Zgrubnie czterema przejściami
  po 2,5 mm na promieniu (bez cyklu — zapis porównywalny w obu sterowaniach), naddatek 0,25 mm na promieniu, potem kontur.
  Fanuc: G50 S — ograniczenie obrotów przy G96, G99 — posuw na obrót. Sinumerik: LIMS= w bloku G96, G95 — posuw na obrót,
  DIAMON — wymiary X na średnicy, T1 D1 — narzędzie i korektor.

  Korpus: półfabrykat 90 × 70, układ w lewym dolnym narożu. Kieszeń 64 × 44 z narożami R10, wyspa ⌀16 w środku,
  głębokość 5; frez ⌀10 — trzy pętle: wokół wyspy (G02, współbieżnie), pośrednia (połowa 19 × 16, R6) i przy ścianie (G03,
  współbieżnie); odstępy między pętlami mniejsze niż promień freza, więc w kieszeni nie zostaje materiał.
  Cztery otwory wiertłem ⌀6,8 cyklem G81 / CYCLE81.
*/

export const WALEK = `(WALEK STOPNIOWANY FI50)
G21 G18 G40 G99
T0101 (NOZ ZEWNETRZNY)
G50 S3000
G96 S200 M03
G00 X52. Z2.
(TOCZENIE ZGRUBNE)
X45.
G01 Z-55. F0.25
X51.
G00 Z2.
X40.5
G01 Z-55.
X46.
G00 Z2.
X35.
G01 Z-30.
X41.
G00 Z2.
X30.5
G01 Z-30.
X36.
G00 Z2.
(TOCZENIE WYKANCZAJACE)
X28.
G01 Z0. F0.1
X30. Z-1.
Z-30.
X38.
X40. Z-31.
Z-55.
X52.
G00 X100. Z50.
M30`;

export const WALEK_OPS = ["(TOCZENIE ZGRUBNE", "(TOCZENIE WYKANCZAJACE"];

export const WALEK_SINUMERIK = `; WALEK STOPNIOWANY FI50
G18 G90 G71 G40 G95 DIAMON
T1 D1 ; NOZ ZEWNETRZNY
G96 S200 LIMS=3000 M3
G0 X52 Z2
; TOCZENIE ZGRUBNE
X45
G1 Z-55 F0.25
X51
G0 Z2
X40.5
G1 Z-55
X46
G0 Z2
X35
G1 Z-30
X41
G0 Z2
X30.5
G1 Z-30
X36
G0 Z2
; TOCZENIE WYKANCZAJACE
X28
G1 Z0 F0.1
X30 Z-1
Z-30
X38
X40 Z-31
Z-55
X52
G0 X100 Z50
M30`;

export const WALEK_SINUMERIK_OPS = ["; TOCZENIE ZGRUBNE", "; TOCZENIE WYKANCZAJACE"];

export const KORPUS = `(KORPUS 90 x 70 - KIESZEN Z WYSPA)
G21 G90 G17 G54 G40 G80
T01 M06 (FREZ FI10)
G00 G43 H01 Z50.
S3000 M03
(KIESZEN 64 x 44 Z WYSPA FI16)
G00 X58. Y35. Z2.
G01 Z-5. F100
G02 X58. Y35. I-13. J0. F450
G01 X64.
Y45.
G03 X58. Y51. R6.
G01 X32.
G03 X26. Y45. R6.
G01 Y25.
G03 X32. Y19. R6.
G01 X58.
G03 X64. Y25. R6.
G01 Y35.
X72.
Y47.
G03 X67. Y52. R5.
G01 X23.
G03 X18. Y47. R5.
G01 Y23.
G03 X23. Y18. R5.
G01 X67.
G03 X72. Y23. R5.
G01 Y35.
G00 Z50.
(CZTERY OTWORY FI6.8)
T02 M06 (WIERTLO FI6.8)
G00 G43 H02 Z50.
S1200 M03
G99 G81 X6. Y6. Z-12. R2. F120
X84.
Y64.
X6.
G80
G00 Z50.
M30`;

export const KORPUS_OPS = ["(KIESZEN", "(CZTERY OTWORY"];

export const KORPUS_SINUMERIK = `; KORPUS 90 x 70 - KIESZEN Z WYSPA
G17 G90 G54 G40 G71
T1 D1 ; FREZ FI10
M6
G0 Z50
S3000 M3
; KIESZEN 64 x 44 Z WYSPA FI16
G0 X58 Y35 Z2
G1 Z-5 F100
G2 X58 Y35 I-13 J0 F450
G1 X64
Y45
G3 X58 Y51 CR=6
G1 X32
G3 X26 Y45 CR=6
G1 Y25
G3 X32 Y19 CR=6
G1 X58
G3 X64 Y25 CR=6
G1 Y35
X72
Y47
G3 X67 Y52 CR=5
G1 X23
G3 X18 Y47 CR=5
G1 Y23
G3 X23 Y18 CR=5
G1 X67
G3 X72 Y23 CR=5
G1 Y35
G0 Z50
; CZTERY OTWORY FI6.8
T2 D1 ; WIERTLO FI6.8
M6
G0 Z50
S1200 M3
F120
MCALL CYCLE81(2, 0, 2, -12)
X6 Y6
X84
Y64
X6
MCALL
G0 Z50
M30`;

export const KORPUS_SINUMERIK_OPS = ["; KIESZEN", "; CZTERY OTWORY"];
