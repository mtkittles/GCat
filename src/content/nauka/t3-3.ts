import type { LessonDoc } from "@/lib/lesson";
import { T3_FIN_HEAD } from "./t3-common";

const arcs = `Z-39.
G02 X32. Z-40. R1.
G01 X35.
G03 X36. Z-40.5 R0.5`;

const starter = `${T3_FIN_HEAD}
G00 X14. Z2.
G01 X20. Z-1. F0.1
Z-20.
X28.
X30. Z-21.
(DOPISZ STOPIEN Z PROMIENIAMI: FI30 DO POCZATKU R1,
 LUK R1 DO X32 Z-40, CZOLO DO X35, LUK R0.5 DO X36 Z-40.5)

G01 Z-55.
X42.
G00 Z2.
M09
M05
G28 U0.
G28 W0.
M30`;

export const t3_3: LessonDoc = {
  id: "T3.3",
  slug: "t3-3-g02-g03-glowica",
  title: "G02 i G03 a położenie głowicy",
  minutes: 15,
  goal: "Zaprogramujesz promienie wklęsłe i wypukłe na tokarce i nie pomylisz kierunku łuku przy głowicy przedniej.",

  theory: [
    { t: "h", x: "Łuki w płaszczyźnie ZX", id: "g18" },
    { t: "p", x: "Tokarka pracuje w [[G18]], więc [[G02]] i [[G03]] opisują łuki w płaszczyźnie ZX. Blok podaje punkt końcowy X, Z i promień R — jak na frezarce. Środek przez adresy zapisuje się literami I (w X) i K (w Z), nie I i J." },
    { t: "p", x: "Promień R jest zawsze promieniem, a X — średnicą (T0.2). Łuk R1 kończy się w punkcie o średnicy większej o 2 × 1 = 2 mm." },

    { t: "h", x: "Który kierunek", id: "kierunek" },
    { t: "p", x: "Kierunek łuku określa norma: patrzy się na płaszczyznę ZX od strony dodatniej osi Y. Na rysunku ustawionym tak jak w kursie — **Z w prawo, X w górę**, głowica tylna — oś +Y wychodzi z kartki w stronę patrzącego, więc kierunek odczytuje się wprost z rysunku. Nóż jedzie od czoła w stronę uchwytu. W takim widoku promień wklęsły między średnicą a czołem stopnia to G02, a zaokrąglenie krawędzi wypukłej — G03." },
    { t: "table", head: ["Naroże", "Nóż jedzie", "Kod"], rows: [
      ["wklęsłe: średnica → czoło stopnia w górę", "od czoła w stronę uchwytu", "`G02`"],
      ["wypukłe: czoło stopnia → większa średnica", "od czoła w stronę uchwytu", "`G03`"],
    ], caption: "Przy ruchu w drugą stronę, od uchwytu do czoła, oba kody się zamieniają." },

    { t: "h", x: "Głowica przednia", id: "glowica" },
    { t: "diagram", id: "t33-views" },
    { t: "p", x: "Na tokarce z głowicą przednią +X biegnie w stronę operatora. Ten sam blok G02 wygląda z jego miejsca jak łuk przeciwny do zegara. Na typowych tokarkach program się nie zmienia — kierunki osi ustawia producent w konfiguracji maszyny, więc przy nowej maszynie sprawdź to w jej dokumentacji. Myli się zwykle człowiek, który ocenia kierunek przez szybę, bez układu osi." },
    { t: "note", kind: "warn", x: "Po łuku obowiązuje G02 lub G03 aż do zmiany. Blok `Z-55.` zaraz po G03 byłby dla sterowania łukiem bez promienia — stąd `G01 Z-55.` w programie wałka." },
  ],

  worked: {
    title: "Promienie przy stopniu Ø30 → Ø36",
    intro: "Sytuacja: na rysunku doszły promienie — R1 w narożu wklęsłym między Ø30 a czołem stopnia i R0,5 na krawędzi Ø36. Rysunek w widoku z kursu: Z w prawo, X w górę, głowica tylna. Numery na rysunku to numery kroków.",
    fig: "t33-arcs",
    steps: [
      { x: "Ø30 kończy się 1 mm przed czołem stopnia — tam zaczyna się łuk R1.", code: "Z-39." },
      { x: "Łuk wklęsły w górę do czoła, zgodnie z zegarem: średnica 30 + 2 · 1.", code: "G02 X32. Z-40. R1." },
      { x: "Czoło stopnia do początku zaokrąglenia: 36 − 2 · 0,5.", code: "G01 X35." },
      { x: "Zaokrąglenie wypukłe na Ø36, przeciwnie do zegara, 0,5 mm dalej w Z.", code: "G03 X36. Z-40.5 R0.5" },
    ],
    result: "Po G03 kontur wraca do ruchu liniowego jawnym `G01 Z-55.`. Tak wygląda docelowy kontur wykańczający wałka — poniżej w programie.",
  },

  practice: [
    {
      kind: "task",
      mode: "lathe",
      intro: "Dopisz fragment stopnia z oboma promieniami. Sprawdzany jest tor i użycie G02 oraz G03.",
      starter,
      checks: [
        { t: "cut", reference: `${T3_FIN_HEAD}\nG00 X14. Z2.\nG01 X20. Z-1. F0.1\nZ-20.\nX28.\nX30. Z-21.\n${arcs}\nG01 Z-55.\nX42.\nG00 Z2.`, tolerance: 0.05 },
        { t: "require", codes: ["G02", "G03"] },
      ],
      hints: ["Z-39., potem G02 X32. Z-40. R1.", "G01 X35., potem G03 X36. Z-40.5 R0.5."],
      solution: starter.replace("(DOPISZ STOPIEN Z PROMIENIAMI: FI30 DO POCZATKU R1,\n LUK R1 DO X32 Z-40, CZOLO DO X35, LUK R0.5 DO X36 Z-40.5)\n", `${arcs}\n`),
    },
    {
      kind: "drill",
      intro: "Kierunek i punkty łuków.",
      questions: [
        { kind: "choice", q: "Nóż jedzie od czoła w stronę uchwytu (głowica za osią). Którym kodem zaprogramujesz promień wklęsły między Ø24 a czołem stopnia Ø30?", options: ["G02", "G03", "G01", "zależy od głowicy"], answer: 0, why: "Wklęsły w kierunku uchwytu przy X w górę — zgodnie z zegarem." },
        { kind: "choice", q: "W przykładzie zamiast `G02 X32. Z-40. R1.` wpisano `G03 X32. Z-40. R1.`. Co powstanie w narożu?", options: ["wypukły garb materiału zamiast wklęsłego promienia", "nic — punkty końcowe są te same", "alarm — zły kierunek łuku", "łuk wytnie wgłębienie w czole stopnia"], answer: 0, why: "Przy tych samych punktach i R sterowanie liczy łuk ze środkiem po drugiej stronie cięciwy — w samym narożu, w X30 Z−40. Tor wygina się na zewnątrz i zostawia w narożu ćwierćokrągły garb zamiast promienia R1." },
        { kind: "gap", q: "Czop Ø24 przechodzi łukiem wklęsłym R2 w czoło stopnia w Z−30. W jakim punkcie kończy się łuk?", template: "X{0} Z{1}", answers: [["28"], ["-30"]], why: "24 + 2 · 2 = 28, na czole stopnia." },
        { kind: "choice", q: "Tokarka z głowicą przednią. Czy trzeba zamienić G02 na G03?", options: ["zwykle nie, program jest ten sam", "tak, zawsze", "tylko przy R", "tylko przy G96"], answer: 0, why: "Na typowych tokarkach zmienia się tylko widok z miejsca operatora — kierunki osi ustawia konfiguracja maszyny." },
      ],
    },
  ],

  pitfalls: [
    { title: "Kierunek z widoku przez szybę", x: "Operator przy głowicy przedniej widzi łuk „odwrotnie” i poprawia G02 na G03. Promień wychodzi wypukły zamiast wklęsłego — nóż wcina się w stopień." },
    { title: "Średnica w R", x: "Promień R1 wpisany jako `R2.` przez analogię do X. Łuk o promieniu 2 między punktami odległymi o 1,4 mm — alarm albo inny kształt." },
    { title: "Modalne G03", x: "Po zaokrągleniu blok `Z-55.` bez G01. Sterowanie traktuje go jak łuk — alarm braku promienia albo nieoczekiwany tor." },
    { title: "J zamiast K", x: "Środek łuku zapisany `I… J…` jak na frezarce. W G18 składowa Z to K — J zostanie zignorowane albo da alarm." },
  ],

  controllers: {
    rows: [
      ["Łuki", "`G02` / `G03` z R albo I, K", "`G2` / `G3` z `CR=` albo I, K"],
      ["I na tokarce", "zwykle w promieniu", "zależnie od DIAM…"],
      ["Położenie głowicy", "parametr maszyny", "dane maszynowe"],
    ],
    note: "Na obu sterowaniach kierunek łuku w programie jest niezależny od głowicy. Na Sinumeriku promień zapisuje się CR=, w trybie ISO także R.",
  },

  quiz: [
    { kind: "gap", review: "T3.2", q: "Toczysz z Ø40 na Ø35 jednym przejściem. Ile wynosi ap?", template: "{0} mm", answers: [["2.5", "2,5"]], why: "(40 − 35) / 2." },
    { kind: "choice", q: "W której płaszczyźnie pracują łuki na tokarce?", options: ["G18 — ZX", "G17 — XY", "G19 — YZ", "dowolnej"], answer: 0, why: "Tokarka pracuje w ZX." },
    { kind: "choice", q: "Którym kodem zaokrąglisz krawędź wypukłą, jadąc od czoła w stronę uchwytu (głowica za osią)?", options: ["G03", "G02", "G01", "zależy od głowicy"], answer: 0, why: "Przy X w górę — przeciwnie do zegara." },
    { kind: "gap", q: "Łuk R0,5 kończy się na Ø36. Na jakiej średnicy zaczyna się na czole stopnia?", template: "X{0}", answers: [["35"]], why: "36 − 2 · 0,5." },
    { kind: "choice", q: "Którymi adresami podaje się środek łuku na tokarce?", options: ["I i K", "I i J", "J i K", "tylko R"], answer: 0, why: "W G18: I dla X, K dla Z." },
    { kind: "choice", q: "Po `G03 X36. Z-40.5 R0.5` następny blok toczy Ø36 do Z−55. Jak go zapisać?", options: ["`G01 Z-55.`", "`Z-55.`", "`G03 Z-55.`", "`G00 Z-55.`"], answer: 0, why: "Trzeba jawnie wrócić do G01." },
  ],

  summary: [
    "Łuki na tokarce w G18: X, Z i R albo I, K. R w promieniu, X w średnicy.",
    "Kierunek z rysunku: Z w prawo, X w górę. Od czoła do uchwytu: wklęsły G02, wypukły G03.",
    "Program nie zależy od położenia głowicy — nie oceniaj łuku przez szybę.",
    "Po łuku wracaj do G01 jawnie.",
  ],

  sources: [
    { id: "fanuc", where: "interpolacja kołowa na tokarce, G18, I i K" },
    { id: "sinumerik", where: "G2/G3 na tokarce, CR=" },
  ],
};
