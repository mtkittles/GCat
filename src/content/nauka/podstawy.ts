import type { LessonDoc } from "@/lib/lesson";

/*
  Moduł P „Podstawy” (issue #31 §6): trzy krótkie lekcje przed modułem Maszyna, wspólne dla
  frezowania i toczenia. Treść jest jedna; identyfikator ma prefiks ścieżki (FP.1 / TP.1),
  bo postęp i plan ścieżki liczą lekcje osobno w każdej ścieżce.
  W tekście nie ma odwołań do numerów lekcji jednej ścieżki — te same lekcje stoją w obu.
*/

type P = "F" | "T";

const p1 = (k: P): LessonDoc => ({
  id: `${k}P.1`,
  slug: "p-1-maszyna-detal-ruch",
  title: "Maszyna, detal i ruch",
  minutes: 7,
  goal: "Wskażesz, co na frezarce i tokarce się obraca, a co przesuwa, i odróżnisz ruch stołu od ruchu narzędzia względem detalu.",

  theory: [
    { t: "h", x: "Co się obraca, a co przesuwa", id: "ruchy" },
    { t: "p", x: "Obrabiarka skrawająca łączy dwa ruchy: **obrót**, który daje prędkość skrawania, i **przesuw**, który prowadzi ostrze po kształcie detalu. Na frezarce obraca się **narzędzie** we wrzecionie, a przesuwa stół albo wrzeciennik. Na tokarce obraca się **detal** w uchwycie, a przesuwa nóż na głowicy." },
    { t: "diagram", id: "p1-mill" },
    { t: "diagram", id: "t01-machine" },
    { t: "p", x: "Które zespoły jeżdżą w której osi, zależy od budowy maszyny. Na pokazanej frezarce stół jeździ w X i Y, a wrzeciennik w Z; inne konstrukcje mają ruchomą kolumnę albo bramę. Na tokarce głowica stoi za osią obrotu (jak w kursie) albo przed nią." },

    { t: "h", x: "Program opisuje ruch narzędzia względem detalu", id: "wzgledny" },
    { t: "p", x: "Wymiary na rysunku są liczone od detalu, więc program też opisuje położenie **narzędzia względem detalu** — tak przyjmuje norma ISO 841. Gdy na maszynie jedzie stół, zwrot jego ruchu jest przeciwny do zwrotu w programie: stół w lewo to narzędzie w prawo względem detalu." },
    { t: "diagram", id: "f01-relative" },
    { t: "note", kind: "info", x: "Dzięki temu ten sam program pasuje do maszyn o różnej budowie. Programista myśli o detalu i narzędziu, a sterowanie decyduje, który zespół ma się ruszyć." },
  ],

  worked: {
    title: "Kto się rusza w dwóch blokach",
    intro: "Sytuacja: na frezarce z ruchomym stołem program każe przejechać narzędziem z X20 do X60. Na tokarce nóż ma przejść wzdłuż wałka z Z0 do Z−30. Rysunek pokazuje ruch stołu i ten sam ruch względem detalu.",
    fig: "f01-relative",
    steps: [
      { x: "Frezarka: program mówi X+ — narzędzie ma znaleźć się 40 mm dalej w prawo względem detalu.", code: "G01 X60." },
      { x: "Stół z detalem jedzie 40 mm w lewo, wrzeciono z frezem stoi. Odczyt X rośnie z 20 do 60." },
      { x: "Tokarka: Z− to kierunek do uchwytu. Detal się obraca, głowica z nożem jedzie 30 mm w stronę uchwytu.", code: "G01 Z-30." },
      { x: "W obu maszynach liczby w programie opisują położenie ostrza względem zera na detalu." },
    ],
    result: "Na frezarce ruch stołu ma zwrot przeciwny do zapisu w programie, na tokarce nóż jedzie dokładnie tak, jak mówi program. Zapis w obu przypadkach opisuje narzędzie względem detalu.",
  },

  practice: [
    {
      kind: "drill",
      intro: "Rozpoznaj ruchy na rysunkach maszyn.",
      questions: [
        { kind: "choice", q: "Która część pokazanej frezarki przesuwa się w Z?", options: ["stół", "wrzeciennik po kolumnie", "imadło", "łoże"], answer: 1, why: "Na tej konstrukcji stół jeździ w X i Y, a wrzeciennik z wrzecionem w Z, wzdłuż kolumny." },
        { kind: "choice", q: "Co trzyma pręt na tokarce?", options: ["kieł konika", "szczęki uchwytu", "oprawka noża", "łoże"], answer: 1, why: "Szczęki uchwytu zaciskają pręt i obracają go razem z wrzecionem. Konik z kłem tylko podpiera długi wałek." },
        { kind: "choice", q: "Program frezarki z ruchomym stołem każe X−. W którą stronę jedzie stół?", options: ["w lewo", "w prawo", "w górę", "nie jedzie — jedzie wrzeciono"], answer: 1, why: "Narzędzie ma przesunąć się względem detalu w lewo, więc stół z detalem jedzie w prawo — zwrot przeciwny." },
      ],
    },
  ],

  pitfalls: [
    { title: "Ruch stołu wzięty za kierunek osi", x: "Operator widzi, że stół jedzie w lewo, i uznaje, że to X−. W programie to X+: liczy się ruch narzędzia względem detalu. Pomyłka odwraca znak w ręcznym przesuwie i przy odczycie pozycji." },
    { title: "Jedna budowa dla wszystkich maszyn", x: "Nie każda frezarka ma ruchomy stół i nie każda tokarka ma głowicę za osią. Kierunki osi w programie są te same, ale to, który zespół się rusza, trzeba sprawdzić na konkretnej maszynie." },
  ],

  quiz: [
    { kind: "choice", q: "Co obraca się na frezarce podczas skrawania?", options: ["detal", "narzędzie we wrzecionie", "stół", "imadło"], answer: 1, why: "Wrzeciono frezarki obraca narzędzie. Detal stoi w imadle na stole i przesuwa się razem z nim." },
    { kind: "choice", q: "Co obraca się na tokarce podczas skrawania?", options: ["nóż", "głowica narzędziowa", "detal w uchwycie", "konik"], answer: 2, why: "Na tokarce wrzeciono obraca uchwyt z detalem, a nóż w głowicy tylko się przesuwa." },
    { kind: "choice", q: "Co opisują współrzędne w programie?", options: ["położenie stołu względem łoża", "położenie narzędzia względem detalu", "kąt obrotu wrzeciona", "położenie imadła na stole"], answer: 1, why: "Program opisuje ruch narzędzia względem detalu (ISO 841) — niezależnie od tego, który zespół maszyny się rusza." },
    { kind: "choice", q: "Na frezarce z ruchomym stołem stół jedzie 30 mm w prawo. Jaki to ruch narzędzia względem detalu?", options: ["X+30", "X−30", "Y+30", "Z−30"], answer: 1, why: "Stół z detalem w prawo to narzędzie w lewo względem detalu, czyli X−30." },
    { kind: "choice", q: "W których osiach przesuwa się nóż tokarki dwuosiowej?", options: ["X i Z", "X i Y", "tylko Z", "Y i Z"], answer: 0, why: "Głowica z nożem jeździ na saniach w X (średnica) i Z (wzdłuż osi obrotu)." },
  ],

  summary: [
    "Frezarka: obraca się narzędzie, przesuwa stół albo wrzeciennik. Tokarka: obraca się detal, przesuwa nóż.",
    "Program opisuje położenie narzędzia względem detalu — ruch stołu ma zwrot przeciwny.",
    "Który zespół jeździ w której osi, zależy od budowy maszyny; kierunki osi w programie są te same.",
  ],

  sources: [
    { id: "iso841", where: "ruch narzędzia względem nieruchomego detalu, kierunki osi" },
    { id: "haas-workbook", where: "osie maszyny, ruch stołu i wrzeciona, punkt zerowy maszyny", loc: "s. 1–8 (PDF 7–14)" },
  ],
});

const p2 = (k: P): LessonDoc => ({
  id: `${k}P.2`,
  slug: "p-2-narzedzie-ma-ksztalt",
  title: "Narzędzie ma kształt",
  minutes: 7,
  goal: "Rozróżnisz wrzeciono, oprawkę, narzędzie, wysięg i długość narzędzia oraz wyjaśnisz, dlaczego jeden punkt z programu nie opisuje całej bryły.",

  theory: [
    { t: "h", x: "Zespół narzędziowy", id: "zespol" },
    { t: "p", x: "Narzędzie nie wisi w powietrzu: siedzi w **oprawce**, a oprawka we **wrzecionie**. Od czoła wrzeciona do czubka narzędzia jest **długość L**. Część narzędzia poza oprawką to **wysięg**. Średnica **Ø** decyduje, ile materiału obok toru zabiera ostrze." },
    { t: "diagram", id: "p2-assembly" },
    { t: "p", x: "Program prowadzi jeden punkt — na frezarce czubek na osi narzędzia. Żeby sterowanie wiedziało, gdzie ten czubek jest, musi znać długość L. Tę liczbę mierzy się przy ustawianiu i zapisuje w tabeli korekcji, a program wybiera ją słowem H przy [[G43]]." },

    { t: "h", x: "Geometria i zużycie", id: "geometria" },
    { t: "p", x: "W tabeli korekcji wiele sterowań ma osobne pola na **geometrię** (zmierzona długość, średnica) i na **zużycie** (mała poprawka, gdy ostrze się zetrze albo wymiar wyjdzie za duży). Na sterowaniu Haas to np. pola Length Geometry i Length Wear. Nazwy i sposób sumowania zależą od sterowania." },

    { t: "h", x: "Rodzaje narzędzi", id: "rodzaje" },
    { t: "ul", items: [
      "**Frez walcowo-czołowy** — ostrza na obwodzie i na czole; kontury, kieszenie, planowanie.",
      "**Frez kulisty** — czoło w kształcie półkuli; powierzchnie krzywoliniowe.",
      "**Nawiertak** i **wiertło** — najpierw stożkowe nakiełkowanie, potem otwór.",
      "**Gwintownik** — gwint wewnętrzny w nawierconym otworze.",
      "**Nóż tokarski** — płytka w oprawce nożowej; wierzchołek płytki ma promień, który poznasz przy korekcji ostrza.",
    ] },
  ],

  worked: {
    title: "Dwa frezy, ta sama wysokość Z5",
    intro: "Sytuacja: frez T1 ma długość 85,2 mm, wiertło T2 — 102,7 mm. Oba mają stanąć czubkiem 5 mm nad detalem. Rysunek pokazuje, gdzie stanie czoło wrzeciona N.",
    fig: "f41-length",
    steps: [
      { x: "Czubek ma być na Z5 — to mówi program. Liczba w programie jest dla obu narzędzi ta sama.", code: "Z5." },
      { x: "Dla frezu czoło wrzeciona musi stanąć 85,2 mm nad czubkiem: Z5 + 85,2 = Z90,2 względem detalu." },
      { x: "Dla wiertła 102,7 mm nad czubkiem: Z107,7. Wrzeciono stoi 17,5 mm wyżej." },
      { x: "Sterowanie dolicza tę różnicę samo, jeśli zna długości z tabeli korekcji i program je wybierze." },
    ],
    result: "Ta sama liczba w programie, dwie różne pozycje wrzeciona. Bez znanej długości L sterowanie nie wie, gdzie jest czubek.",
  },

  practice: [
    {
      kind: "drill",
      intro: "Wymiary zespołu narzędziowego w liczbach i w kolejności.",
      questions: [
        { kind: "gap", q: "Frez ma długość L = 92,5 mm. Czubek ma stanąć na Z10 względem detalu. Na jakim Z stanie czoło wrzeciona N?", template: "Z{0}", answers: [["102.5", "102,5"]], why: "N = Z czubka + L = 10 + 92,5 = 102,5." },
        { kind: "order", q: "Ułóż elementy od wrzeciona do czubka.", items: ["część robocza", "wrzeciono", "chwyt narzędzia", "oprawka"], answer: [1, 3, 2, 0], why: "Wrzeciono trzyma oprawkę, oprawka — chwyt narzędzia, a dalej jest część robocza z ostrzami." },
      ],
    },
  ],

  pitfalls: [
    { title: "Krótki wysięg przy wysokim mocowaniu", x: "Czubek zjeżdża w otwór obok docisku, a szeroka oprawka schodzi razem z nim — i dotyka docisku, choć tor czubka jest poprawny. Przed wyborem wysięgu porównaj go z wysokością przeszkód w zasięgu oprawki.", danger: true },
    { title: "Numer zamiast wartości", x: "H1 w programie to numer rejestru, a nie długość. Długość to liczba zapisana w tym rejestrze, np. 85,2 mm. Pomylenie rejestru wybiera długość innego narzędzia." },
  ],

  quiz: [
    { kind: "choice", q: "Od czego w tym kursie mierzy się długość narzędzia L?", options: ["od górnej powierzchni detalu", "od czoła wrzeciona N do czubka", "od stołu do czubka", "od oprawki do końca chwytu"], answer: 1, why: "Baza to czoło wrzeciona N — tak liczy korekcja długości: N = Z czubka + L." },
    { kind: "choice", q: "Który punkt narzędzia frezarki prowadzi program?", options: ["środek oprawki", "czubek na osi narzędzia", "krawędź wrzeciona", "najszerszy punkt ostrza"], answer: 1, why: "Współrzędne opisują czubek na osi. Reszta bryły nie jest opisana w programie." },
    { kind: "choice", q: "Dlaczego bezpieczny tor czubka nie wystarcza?", options: ["bo sterowanie nie zna długości", "bo oprawka i wrzeciono są szersze i mogą zahaczyć o przeszkodę obok toru", "bo czubek porusza się szybciej niż oprawka", "bo program prowadzi środek oprawki"], answer: 1, why: "Program prowadzi punkt, ale maszyna przesuwa całą bryłę: oprawkę, wrzeciono i ostrza o swojej średnicy." },
    { kind: "choice", q: "Co zwykle zapisuje się w polu „zużycie” korekcji długości?", options: ["całą zmierzoną długość", "małą poprawkę, np. po starciu ostrza", "numer narzędzia", "obroty wrzeciona"], answer: 1, why: "Geometria to zmierzona długość, zużycie — niewielka poprawka. Nazwy i sumowanie zależą od sterowania." },
    { kind: "choice", q: "Co na frezarce obraca się podczas skrawania?", options: ["stół", "narzędzie we wrzecionie", "detal", "imadło"], answer: 1, why: "Wrzeciono frezarki obraca narzędzie.", review: `${k}P.1` },
  ],

  summary: [
    "Zespół: wrzeciono → oprawka → chwyt → część robocza. Długość L liczy się od czoła wrzeciona N do czubka.",
    "Program prowadzi jeden punkt; prześwit zależy od całej bryły — oprawki, wysięgu i średnicy.",
    "Tabela korekcji ma zwykle geometrię i zużycie; numer rejestru to nie wartość.",
  ],

  sources: [
    { id: "haas-basic", where: "pola Length Geometry i H (Length) Wear w tabeli narzędzi", loc: "s. 39" },
    { id: "fanuc", where: "G43 H — korekcja długości z rejestru", loc: "rozdz. 4, s. 85" },
  ],
});

const p3 = (k: P): LessonDoc => ({
  id: `${k}P.3`,
  slug: "p-3-od-rysunku-do-ustawienia",
  title: "Od rysunku do ustawienia",
  minutes: 8,
  goal: "Wymienisz, co trzeba ustalić przed pierwszym ruchem: zero detalu, mocowanie, wysokość szczęk i dane narzędzi.",

  theory: [
    { t: "h", x: "Z rysunku na maszynę", id: "rysunek" },
    { t: "p", x: "Rysunek ma bazy wymiarowe — krawędzie albo osie, od których liczone są wymiary. Z nich wybierasz [[zero detalu]] W: najczęściej narożnik albo środek na frezarce, oś obrotu i czoło na tokarce. Na maszynie położenie W mierzy się po zamocowaniu i zapisuje w przesunięciu, np. [[G54–G59|G54]]." },
    { t: "h", x: "Mocowanie i to, co wystaje", id: "mocowanie" },
    { t: "p", x: "Detal na frezarce trzyma imadło albo dociski, na tokarce — szczęki uchwytu. To, co trzyma detal, zajmuje miejsce obok niego i nad stołem. Zanim napiszesz głębokość albo przejazd, sprawdź, gdzie kończy się materiał i zaczyna mocowanie." },
    { t: "diagram", id: "p3-setup" },
    { t: "h", x: "Przed pierwszym ruchem", id: "lista" },
    { t: "ul", items: [
      "Detal zamocowany — dopiero wtedy mierzysz zero W.",
      "Zero W zapisane w przesunięciu (G54 albo inne wybrane w programie).",
      "Długości (na tokarce — korekcje) narzędzi zmierzone i wpisane w tabelę.",
      "Wysokość bezpieczna nad mocowaniem znana — w programie i przy ręcznych dojazdach.",
      "Program w zapisie dla tego sterowania (profil nad lekcją).",
    ] },
  ],

  worked: {
    title: "Płytka w imadle: ile można zejść",
    intro: "Sytuacja: płytka 80 × 50 × 20 stoi w imadle, szczęki trzymają ją na 14 mm wysokości. Zero W jest na lewym górnym narożniku, Z0 na górnej powierzchni. Kontur zewnętrzny frezem Ø12 ma iść na głębokość 5 mm — frez przechodzi tuż obok płytki, nad szczękami.",
    fig: "p3-setup",
    steps: [
      { x: "Wysokość płytki nad szczękami: 20 − 14 = 6 mm. Górna krawędź szczęk jest więc na Z−6." },
      { x: "Kontur na Z−5: dół frezu jest 1 mm nad szczęką — frez nie dotyka imadła.", code: "G01 Z-5." },
      { x: "Na Z−8 frez wszedłby 2 mm w szczękę. Taki kontur wymaga innego mocowania albo wyższego zamocowania płytki." },
      { x: "Wysokość bezpieczna nad imadłem i detalem to np. Z50 — tam narzędzie przejeżdża między operacjami." },
    ],
    result: "Głębokość z rysunku sprawdzasz razem z mocowaniem: tutaj Z−5 jest bezpieczne, Z−8 — już nie.",
  },

  practice: [
    {
      kind: "drill",
      intro: "Licz od zera W i od mocowania.",
      questions: [
        { kind: "gap", q: "Płytka ma 25 mm wysokości, szczęki trzymają ją na 18 mm. Na jakim Z jest górna krawędź szczęk, gdy Z0 leży na górnej powierzchni?", template: "Z{0}", answers: [["-7", "−7"]], why: "25 − 18 = 7 mm nad szczękami, więc szczęki zaczynają się na Z−7." },
        { kind: "order", q: "Ułóż czynności przed pierwszym uruchomieniem programu.", items: ["ustaw zero W i zapisz je w G54", "zamocuj detal", "uruchom program blok po bloku"], answer: [1, 0, 2], why: "Zero mierzy się na zamocowanym detalu — po zamocowaniu. Program uruchamiasz na końcu, ostrożnie." },
      ],
    },
  ],

  pitfalls: [
    { title: "Zero zmierzone przed dociśnięciem", x: "Detal przesunął się przy dokręcaniu imadła, a zero W zostało zmierzone wcześniej. Cały program przesuwa się o ten błąd." },
    { title: "Głębokość bez sprawdzenia szczęk", x: "Kontur na głębokość większą niż wysokość detalu nad szczękami prowadzi frez w imadło. Policz: wysokość detalu minus wysokość chwytu.", danger: true },
  ],

  quiz: [
    { kind: "gap", q: "Płytka 20 mm trzymana w imadle na 12 mm. Na jakim Z leży górna krawędź szczęk?", template: "Z{0}", answers: [["-8", "−8"]], why: "20 − 12 = 8 mm nad szczękami — górna krawędź szczęk na Z−8." },
    { kind: "choice", q: "Co zapisujesz w przesunięciu G54?", options: ["długość narzędzia", "położenie zera detalu względem zera maszyny", "prędkość obrotową", "wysokość szczęk"], answer: 1, why: "Przesunięcie trzyma współrzędne zera detalu — sterowanie liczy od niego wymiary programu." },
    { kind: "choice", q: "Kiedy mierzysz zero W?", options: ["przed zamocowaniem detalu", "po zamocowaniu detalu", "po pierwszym przejściu programu", "nie trzeba — liczy je sterowanie"], answer: 1, why: "Detal może się przesunąć przy mocowaniu, więc zero mierzy się na już zamocowanym detalu." },
    { kind: "choice", q: "Szczęki zaczynają się na Z−6. Co się stanie przy konturze na Z−8?", options: ["frez zostawi 2 mm materiału", "frez wejdzie 2 mm w szczękę", "nic — szczęki są poniżej", "sterowanie samo skróci zejście"], answer: 1, why: "Z−8 jest 2 mm poniżej górnej krawędzi szczęk — frez przechodzi przez szczękę." },
    { kind: "choice", q: "Od czego mierzy się długość narzędzia L w tym kursie?", options: ["od stołu", "od czoła wrzeciona N do czubka", "od górnej powierzchni detalu", "od szczęk imadła"], answer: 1, why: "L to odległość od czoła wrzeciona N do czubka narzędzia.", review: `${k}P.2` },
  ],

  summary: [
    "Zero W wybierasz z baz rysunku, mierzysz na zamocowanym detalu i zapisujesz w przesunięciu.",
    "Mocowanie zajmuje miejsce: głębokość i przejazdy sprawdzasz względem szczęk i docisków.",
    "Przed pierwszym ruchem: zero, długości narzędzi, wysokość bezpieczna, właściwy zapis programu.",
  ],

  sources: [
    { id: "haas-basic", where: "przesunięcia detalu G54–G59 i G154 P1–P99 — współrzędne zera detalu", loc: "s. 43" },
    { id: "fanuc", where: "G54–G59 — wybór układu współrzędnych detalu", loc: "rozdz. 3.1, tab. 3.1, s. 72; rozdz. 4, s. 87" },
  ],
});

export const podstawy = (k: P): LessonDoc[] => [p1(k), p2(k), p3(k)];
