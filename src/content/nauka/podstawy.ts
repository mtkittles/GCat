import type { Block } from "@/lib/article";
import type { LessonDoc } from "@/lib/lesson";

/*
  Moduł P „Podstawy” (issue #31 §6): trzy krótkie lekcje przed modułem Maszyna, wspólne dla
  frezowania i toczenia. Treść jest jedna; identyfikator ma prefiks ścieżki (FP.1 / TP.1),
  bo postęp i plan ścieżki liczą lekcje osobno w każdej ścieżce.
  W tekście nie ma odwołań do numerów lekcji jednej ścieżki — te same lekcje stoją w obu.
  Rysunki występują tylko tu — kolejne lekcje ich nie powtarzają.
*/

type P = "F" | "T";

const mill = (h?: string): Block[] => [
  ...(h ? [{ t: "h" as const, x: h, id: "frezarka" }] : []),
  { t: "p", x: "We frezarce pionowej ze stołem krzyżowym stół przesuwa się w osiach X i Y, a wrzeciennik — w osi Z. W pokazanym modelu frezarki z ruchomym stojakiem stół jest nieruchomy: stojak przesuwa się w osiach X i Y, a wrzeciennik — w osi Z; maszyny tego typu różnią się podziałem osi między zespoły. Podobnie we frezarce bramowej ruchy wykonuje brama z wrzeciennikiem. Spotyka się też układy mieszane." },
  { t: "diagram", id: "p1-mill" },
];
const lathe = (h?: string): Block[] => [
  ...(h ? [{ t: "h" as const, x: h, id: "tokarka" }] : []),
  { t: "p", x: "Wrzeciono tokarki obraca uchwyt, a szczęki uchwytu trzymają przedmiot. Nóż jest zamocowany w oprawce na głowicy narzędziowej, a głowica przesuwa się na suporcie w osiach X i Z. Długi wałek podpiera kieł konika." },
  { t: "diagram", id: "t01-machine" },
];

const p1 = (k: P): LessonDoc => ({
  id: `${k}P.1`,
  slug: "p-1-obrabiarka-i-ruchy",
  title: "Obrabiarka i jej ruchy",
  minutes: 7,
  goal: "Rozróżnisz ruch główny i ruchy posuwowe na frezarce i tokarce oraz wyjaśnisz, dlaczego program opisuje ruch narzędzia względem przedmiotu.",

  theory: [
    { t: "h", x: "Ruch główny i ruch posuwowy", id: "ruchy" },
    { t: "p", x: "Obróbka skrawaniem wymaga dwóch ruchów. **Ruch główny** nadaje prędkość skrawania, a **ruch posuwowy** zmienia położenie narzędzia względem przedmiotu obrabianego (w kursie: detalu). We frezowaniu i toczeniu ruch główny jest obrotowy; w innych odmianach obróbki, np. w struganiu czy dłutowaniu, jest prostoliniowy." },
    { t: "ul", items: [
      "**Frezarka** — ruch główny wykonuje narzędzie: obraca się wrzeciono z frezem. Ruchy posuwowe w osiach X, Y i Z wykonują stół i wrzeciennik — w zależności od budowy maszyny.",
      "**Tokarka** — ruch główny wykonuje przedmiot: obraca się wrzeciono z uchwytem i prętem. Ruchy posuwowe w osiach X i Z wykonuje suport z głowicą narzędziową.",
    ] },

    // Maszyna własnej ścieżki w treści, druga — w zwijanym porównaniu (#80, FP.1).
    ...(k === "F"
      ? [...mill("Budowa frezarki decyduje, co się przesuwa"), { t: "more" as const, title: "Porównanie z toczeniem: tokarka", blocks: lathe() }]
      : [...lathe("Tokarka"), { t: "more" as const, title: "Porównanie z frezowaniem: budowa frezarki", blocks: mill() }]),

    { t: "h", x: "Program opisuje ruch narzędzia względem przedmiotu", id: "wzgledny" },
    { t: "p", x: "Niezależnie od budowy maszyny współrzędne w programie opisują położenie narzędzia względem przedmiotu — tak definiuje to norma ISO 841. Jeżeli w danej osi przesuwa się stół, jego ruch ma zwrot przeciwny: przesunięcie stołu w lewo oznacza ruch narzędzia względem przedmiotu w prawo, czyli X+. Dzięki temu ten sam tor, zapisany tymi samymi współrzędnymi, opisuje obróbkę na maszynach o różnej budowie, a o tym, który zespół wykona ruch, decyduje sterowanie. Zgodna kinematyka nie oznacza jeszcze zgodnego programu: kody M, wymianę narzędzia, korekcje i procedury startowe dostosowuje się do konkretnej maszyny." },
  ],

  worked: {
    title: "Kto wykonuje ruch w bloku G01 X60.",
    intro: "Sytuacja: narzędzie stoi w X20. Fragment programu przesuwa je do X60. Ten sam blok wykonują dwie frezarki o różnej budowie.",
    data: [
      ["Maszyny", "frezarka pionowa ze stołem krzyżowym i frezarka z ruchomym stojakiem — modele z rysunku"],
      ["Program", "fragment: aktywne G90, milimetry; poprzedni blok zostawił narzędzie w X20"],
      ["Odczyt", "ekran współrzędnych przedmiotu (Fanuc ABSOLUTE, SINUMERIK WCS)"],
    ],
    steps: [
      { x: "Program: narzędzie ma przejść z X20 do X60, czyli o 40 mm w kierunku X+ względem przedmiotu.", code: "G01 X60." },
      { x: "Frezarka ze stołem krzyżowym: wrzeciennik nie przesuwa się w osi X, a stół z przedmiotem przesuwa się o 40 mm w lewo." },
      { x: "Frezarka z ruchomym stojakiem: stół jest nieruchomy, a stojak z wrzeciennikiem przesuwa się o 40 mm w prawo." },
      { x: "Na obu maszynach odczyt X na ekranie współrzędnych przedmiotu zmienia się z 20 na 60. Ekran współrzędnych maszynowych pokazałby inne liczby, ale tę samą zmianę o 40 mm." },
    ],
    result: "Ruch zespołów maszyny jest różny, ale zapis toru w programie i odczyt położenia względem przedmiotu są takie same.",
  },

  practice: [
    {
      kind: "drill",
      intro: "Rozpoznaj ruchy na obu obrabiarkach.",
      questions: [
        { kind: "choice", q: "Co wykonuje ruch główny na tokarce?", options: ["suport z nożem", "wrzeciono z uchwytem i przedmiotem", "konik", "łoże"], answer: 1, why: "Na tokarce obraca się przedmiot zamocowany w uchwycie. Suport z nożem wykonuje ruchy posuwowe." },
        { kind: "choice", q: "Frezarka ze stołem krzyżowym, program przesuwa narzędzie w X−. W którą stronę przesuwa się stół?", options: ["w lewo", "w prawo", "stół stoi, przesuwa się wrzeciennik", "w górę"], answer: 1, why: "Narzędzie ma się przesunąć względem przedmiotu w lewo, więc stół z przedmiotem przesuwa się w prawo — zwrot przeciwny." },
        { kind: "choice", q: "Frezarka z ruchomym stojakiem — co przesuwa się w osi X?", options: ["stół", "imadło", "stojak z wrzeciennikiem", "nic — oś X jest tylko w programie"], answer: 2, why: "W tej budowie stół jest nieruchomy, a w osi X przesuwa się stojak razem z wrzeciennikiem." },
      ],
    },
  ],

  pitfalls: [
    { title: "Ruch stołu odczytany jako kierunek osi", x: "Na frezarce ze stołem krzyżowym stół przesuwa się w lewo, a operator uznaje, że to X−. W rzeczywistości jest to X+, bo liczy się ruch narzędzia względem przedmiotu. Błąd odwraca znak przy ręcznym przesuwie osi." },
    { title: "Założenie jednej budowy maszyny", x: "Przed pracą na nowej maszynie sprawdź, które zespoły przesuwają się w poszczególnych osiach. Kierunki osi w programie się nie zmieniają, ale zmienia się ruch, który widzisz, i miejsca możliwej kolizji." },
  ],

  quiz: [
    { kind: "choice", q: "Co wykonuje ruch główny na frezarce?", options: ["obracające się wrzeciono z narzędziem", "przesuwający się stół", "wrzeciennik przesuwający się w osi Z", "imadło z przedmiotem"], answer: 0, why: "Ruch główny to obrót wrzeciona z frezem. Przesuwy stołu i wrzeciennika to ruchy posuwowe." },
    { kind: "choice", q: "Co wykonuje ruch główny na tokarce?", options: ["nóż", "suport", "przedmiot zamocowany w uchwycie", "konik"], answer: 2, why: "Na tokarce wrzeciono obraca uchwyt z przedmiotem, a nóż na suporcie wykonuje ruchy posuwowe." },
    { kind: "choice", q: "Co opisują współrzędne w programie?", options: ["położenie stołu względem łoża", "położenie narzędzia względem przedmiotu", "kąt obrotu wrzeciona", "położenie imadła na stole"], answer: 1, why: "Program opisuje położenie narzędzia względem przedmiotu (ISO 841) — niezależnie od tego, który zespół maszyny się przesuwa." },
    { kind: "choice", q: "Frezarka ze stołem krzyżowym: stół przesuwa się o 30 mm w prawo. Jaki to ruch narzędzia względem przedmiotu?", options: ["X+30", "X−30", "Y+30", "Z−30"], answer: 1, why: "Przesunięcie stołu z przedmiotem w prawo to ruch narzędzia względem przedmiotu w lewo, czyli X−30." },
    { kind: "choice", q: "W których osiach przesuwa się nóż tokarki dwuosiowej?", options: ["X i Z", "X i Y", "tylko Z", "Y i Z"], answer: 0, why: "Suport z głowicą narzędziową przesuwa się w osi X (średnica) i w osi Z (wzdłuż osi obrotu)." },
  ],

  summary: [
    "Ruch główny: na frezarce obraca się narzędzie, na tokarce — przedmiot. Ruchy posuwowe wykonują stół, wrzeciennik albo suport.",
    "To, który zespół przesuwa się w danej osi, zależy od budowy maszyny.",
    "Program opisuje położenie narzędzia względem przedmiotu; ruch stołu ma zwrot przeciwny.",
  ],

  sources: [
    { id: "iso841", where: "ruch narzędzia względem przedmiotu, kierunki osi" },
    { id: "haas-workbook", where: "osie maszyny, ruch stołu i wrzeciona, punkt zerowy maszyny", loc: "s. 1–8 (PDF 7–14)" },
    { id: "kuryjanski", where: "ruch główny i ruch posuwowy, podstawowe parametry skrawania", loc: "s. 51–54" },
  ],
});

const p2 = (k: P): LessonDoc => ({
  id: `${k}P.2`,
  slug: "p-2-zespol-narzedziowy",
  title: "Zespół narzędziowy",
  minutes: 7,
  goal: "Rozróżnisz elementy zespołu narzędziowego, wyjaśnisz, od czego mierzy się długość narzędzia, i dlaczego bezpieczny tor punktu programowanego nie wyklucza kolizji oprawki.",

  theory: [
    { t: "h", x: "Budowa zespołu narzędziowego", id: "zespol" },
    { t: "p", x: "Narzędzie mocuje się w **oprawce narzędziowej**, a oprawkę — w gnieździe **wrzeciona**. Frez ma **część chwytową**, zamocowaną w oprawce, i **część roboczą** z ostrzami. Odcinek narzędzia wystający z oprawki to **wysięg**." },
    { t: "diagram", id: "p2-assembly" },

    { t: "h", x: "Długość narzędzia", id: "dlugosc" },
    { t: "p", x: "**Długość narzędzia L** to odległość od przyjętej płaszczyzny odniesienia do punktu programowanego narzędzia. W kursie płaszczyzną odniesienia jest czoło wrzeciona **N**; na konkretnej maszynie zależy ona od sposobu pomiaru i ustawień sterowania. Długość mierzy się na przyrządzie do ustawiania narzędzi albo na maszynie i wpisuje do tabeli korekcji. Program wybiera tę wartość adresem H w bloku z [[G43]]." },
    { t: "note", kind: "info", x: "Model kursu: L jest dodatnia, a położenie N liczymy w tym samym układzie co program — N = Z punktu programowanego + L. Tak obliczone N to położenie płaszczyzny odniesienia nad przedmiotem, a nie odczyt Z na ekranie współrzędnych maszynowych; ten zależy jeszcze od przesunięcia punktu zerowego, omawianego w module Maszyna." },

    { t: "h", x: "Program prowadzi jeden punkt", id: "punkt" },
    { t: "p", x: "Współrzędne w programie frezarki określają położenie **punktu programowanego**. Dla freza walcowo-czołowego leży on na osi freza, w płaszczyźnie jego czoła; dla wiertła — w wierzchołku. Oprawka, wrzeciono i pozostała część narzędzia nie są opisane w programie, ale przemieszczają się razem z nim. Dlatego bezpieczny tor punktu programowanego nie gwarantuje, że oprawka nie zderzy się z imadłem, dociskiem albo przedmiotem." },
    { t: "p", x: "Wysięg dobiera się możliwie krótki, ale taki, żeby oprawka mijała przeszkody z zapasem. Niepotrzebnie duży wysięg zmniejsza sztywność: narzędzie bardziej się ugina i łatwiej wpada w drgania." },

    { t: "h", x: "Geometria i zużycie", id: "geometria" },
    { t: "p", x: "Tabela korekcji narzędzi ma zwykle dwie grupy wartości: **geometrię** (zmierzona długość i średnica) oraz **zużycie** (niewielka poprawka wprowadzana np. po pomiarze przedmiotu). Na sterowaniu Haas są to pola Length Geometry i Length Wear. Nazwy pól i sposób sumowania zależą od sterowania." },

    { t: "h", x: "Podstawowe narzędzia", id: "rodzaje" },
    { t: "ul", items: [
      "**Frez walcowo-czołowy** — ostrza na obwodzie i na czole; frezowanie konturów, kieszeni i płaszczyzn.",
      "**Frez kulisty** — część robocza zakończona półkulą; frezowanie powierzchni krzywoliniowych.",
      "**Nawiertak (wiertło do punktowania)** — wykonuje płytkie stożkowe nawiercenie, które ustala początek wiercenia. To inna operacja niż wykonanie nakiełka pod kieł tokarki. Kąt nawiertaka dobiera się do wiertła według zaleceń producenta narzędzi.",
      "**Wiertło kręte** — wiercenie otworów.",
      "**Gwintownik maszynowy** — gwintowanie otworu wywierconego na średnicę pod gwint.",
      "**Nóż tokarski składany** — przykład: oprawka nożowa z płytką wymienną; wierzchołek płytki ma promień naroża. Spotyka się też noże jednolite i lutowane.",
    ] },
  ],

  worked: {
    title: "Dwa narzędzia na tej samej wysokości Z5",
    intro: "Sytuacja: frez T1 ma długość 85,2 mm, wiertło T2 — 102,7 mm. Punkt programowany każdego z nich ma się zatrzymać 5 mm nad górną powierzchnią przedmiotu (Z5).",
    data: [
      ["Odniesienie długości", "czoło wrzeciona N (przyjęte w kursie)"],
      ["T1", "frez walcowo-czołowy, L = 85,2 mm, punkt programowany na osi w płaszczyźnie czoła"],
      ["T2", "wiertło, L = 102,7 mm, punkt programowany w wierzchołku"],
      ["Model", "N = Z punktu programowanego + L; Z0 na górnej powierzchni przedmiotu"],
    ],
    steps: [
      { x: "W programie wysokość jest dla obu narzędzi ta sama.", code: "Z5." },
      { x: "Dla frezu czoło wrzeciona zatrzyma się na Z5 + 85,2 = Z90,2." },
      { x: "Dla wiertła: Z5 + 102,7 = Z107,7, czyli 17,5 mm wyżej." },
      { x: "Sterowanie wykonuje to przeliczenie samo, jeżeli długości są wpisane do tabeli korekcji, a program włącza korekcję długości." },
    ],
    result: "Ta sama współrzędna w programie, dwie różne pozycje wrzeciona. Bez znanej długości sterowanie nie wie, gdzie znajduje się punkt programowany narzędzia.",
  },

  practice: [
    {
      kind: "drill",
      intro: "Wymiary zespołu narzędziowego w liczbach i w kolejności.",
      questions: [
        { kind: "gap", q: "Frez ma długość L = 92,5 mm. Punkt programowany ma się zatrzymać na Z10. Na jakiej wysokości Z, w modelu kursu, zatrzyma się czoło wrzeciona N?", template: "Z{0}", answers: [["102.5", "102,5"]], why: "N = Z punktu programowanego + L = 10 + 92,5 = 102,5." },
        { kind: "choice", q: "Kontur na Z−12 biegnie obok docisku, którego górna powierzchnia leży na Z10. Oprawka Ø32 jest szersza od freza i sięga nad docisk. Przy jakim wysięgu (od czoła oprawki do punktu programowanego) oprawka minie docisk?", options: ["30 mm — czoło oprawki będzie na Z18, 8 mm nad dociskiem", "15 mm — czoło oprawki będzie na Z3", "wysięg nie ma znaczenia, liczy się tylko tor freza", "każdy wysięg, bo program prowadzi frez obok docisku"], answer: 0, why: "Czoło oprawki leży na Z punktu programowanego + wysięg: −12 + 30 = 18 (nad dociskiem), −12 + 15 = 3 (poniżej górnej powierzchni docisku — kolizja). Wybierasz najkrótszy wysięg, który daje zapas." },
        { kind: "order", q: "Ułóż elementy od wrzeciona do punktu programowanego narzędzia.", items: ["część robocza", "wrzeciono", "część chwytowa narzędzia", "oprawka narzędziowa"], answer: [1, 3, 2, 0], why: "Wrzeciono trzyma oprawkę, oprawka — część chwytową narzędzia, a za nią jest część robocza z ostrzami." },
      ],
    },
  ],

  pitfalls: [
    { title: "Zbyt mały wysięg przy wysokim mocowaniu", x: "Frez wchodzi w otwór obok docisku, a szersza oprawka opuszcza się razem z nim i uderza w docisk, choć tor punktu programowanego jest poprawny. Wysięg dobiera się tak, aby oprawka mijała przeszkody znajdujące się w jej zasięgu.", danger: true },
    { title: "Numer rejestru zamiast wartości", x: "H1 w programie to numer rejestru, a nie długość. Długość to liczba zapisana w tym rejestrze, np. 85,2 mm. Błędny numer rejestru oznacza długość innego narzędzia." },
  ],

  quiz: [
    { kind: "choice", q: "Od czego w tym kursie mierzy się długość narzędzia L?", options: ["od górnej powierzchni przedmiotu", "od czoła wrzeciona N do punktu programowanego narzędzia", "od stołu do punktu programowanego", "od oprawki do końca części chwytowej"], answer: 1, why: "W kursie płaszczyzną odniesienia jest czoło wrzeciona N. Na konkretnej maszynie zależy ona od sposobu pomiaru." },
    { kind: "choice", q: "Gdzie leży punkt programowany freza walcowo-czołowego?", options: ["w środku oprawki", "na osi freza, w płaszczyźnie jego czoła", "na krawędzi wrzeciona", "w najszerszym punkcie ostrza"], answer: 1, why: "Współrzędne opisują punkt na osi freza, w płaszczyźnie czoła. Pozostała część zespołu nie jest opisana w programie." },
    { kind: "choice", q: "Dlaczego bezpieczny tor punktu programowanego nie wyklucza kolizji?", options: ["bo sterowanie nie zna długości narzędzia", "bo oprawka i wrzeciono są szersze i mogą zahaczyć o przeszkodę obok toru", "bo czubek porusza się szybciej niż oprawka", "bo program prowadzi środek oprawki"], answer: 1, why: "Program prowadzi jeden punkt, ale maszyna przesuwa cały zespół: oprawkę, wrzeciono i narzędzie o swojej średnicy." },
    { kind: "choice", q: "Co zwykle wpisuje się w kolumnie „zużycie” korekcji długości?", options: ["całą zmierzoną długość", "niewielką poprawkę, np. po pomiarze przedmiotu", "numer narzędzia", "prędkość obrotową wrzeciona"], answer: 1, why: "Geometria to zmierzona długość, zużycie — niewielka poprawka. Nazwy i sposób sumowania zależą od sterowania." },
    { kind: "choice", q: "Co wykonuje ruch główny na frezarce?", options: ["przesuwający się stół", "obracające się wrzeciono z narzędziem", "wrzeciennik w osi Z", "imadło"], answer: 1, why: "Ruch główny frezarki to obrót wrzeciona z narzędziem.", review: `${k}P.1` },
  ],

  summary: [
    "Zespół narzędziowy: wrzeciono, oprawka, część chwytowa i część robocza narzędzia.",
    "Długość L mierzy się od przyjętej płaszczyzny odniesienia (w kursie: czoło wrzeciona N) do punktu programowanego; wartość wpisuje się do tabeli korekcji.",
    "Program prowadzi punkt programowany narzędzia; o kolizji decyduje cały zespół — oprawka, wysięg i średnica. Wysięg możliwie krótki, ale z zapasem nad przeszkodami.",
  ],

  sources: [
    { id: "haas-basic", where: "pola Length Geometry i H (Length) Wear w tabeli narzędzi", loc: "s. 39" },
    { id: "kuryjanski", where: "budowa narzędzia: część chwytowa i robocza", loc: "s. 26–29" },
    { id: "fanuc", where: "G43 H — korekcja długości z rejestru", loc: "rozdz. 4, s. 85" },
  ],
});

const p3 = (k: P): LessonDoc => ({
  id: `${k}P.3`,
  slug: "p-3-ustawienie-przedmiotu",
  title: "Ustawienie przedmiotu",
  minutes: 8,
  goal: "Wymienisz, co trzeba ustalić przed pierwszym uruchomieniem programu: punkt zerowy przedmiotu, sposób mocowania, położenie elementów mocujących i dane narzędzi.",

  theory: [
    { t: "h", x: "Baza wymiarowa i punkt zerowy przedmiotu", id: "baza" },
    { t: "p", x: "Wymiary na rysunku wykonawczym są podane od baz wymiarowych — krawędzi, powierzchni albo osi. [[zero detalu|Punkt zerowy przedmiotu]] W najwygodniej umieścić w bazie: na frezarce zwykle w narożniku albo w środku przedmiotu, na tokarce — w osi obrotu na czole. Po zamocowaniu przedmiotu położenie W mierzy się na maszynie i wpisuje do rejestru przesunięcia punktu zerowego, np. [[G54–G59|G54]]." },
    { t: "h", x: "Mocowanie przedmiotu", id: "mocowanie" },
    { t: "p", x: "Na frezarce przedmiot mocuje się najczęściej w imadle maszynowym albo dociskami do stołu, na tokarce — w szczękach uchwytu. Elementy mocujące wystają poza przedmiot, dlatego głębokość obróbki i drogi przejazdów trzeba sprawdzić względem nich." },
    { t: "p", x: "W zamocowaniu działają trzy rzeczy. **Ustalenie** — przedmiot przylega do powierzchni, które wyznaczają jego położenie: stałej szczęki imadła i podkładek. **Podparcie** — podkładki pod przedmiotem przenoszą siłę skrawania skierowaną w dół i ustalają wysokość. **Zamocowanie** — szczęka ruchoma dociska przedmiot tak, żeby podczas skrawania nie przesunął się, nie obrócił i nie uniósł." },
    { t: "diagram", id: "p3-setup" },
    { t: "h", x: "Przed pierwszym uruchomieniem", id: "lista" },
    { t: "p", x: "Lista poniżej to fragment przygotowania, nie kompletna procedura — pełną kolejność czynności podaje instrukcja maszyny i zakładu." },
    { t: "ul", items: [
      "Przedmiot leży na podkładkach, przylega do szczęki stałej i jest dociśnięty.",
      "Punkt zerowy zmierzono po zamocowaniu i wpisano do rejestru przesunięcia (np. G54).",
      "Długości narzędzi (na tokarce — korekcje) zmierzono i wpisano do tabeli korekcji.",
      "Wysokość bezpieczna nad elementami mocującymi jest znana — w programie i przy ręcznych dojazdach.",
      "Program jest napisany dla tego sterowania i trybu programowania maszyny.",
    ] },
  ],

  worked: {
    title: "Płytka w imadle: dopuszczalna głębokość",
    intro: "Sytuacja: płytka 80 × 50 × 20 leży w imadle na podkładkach, szczęki obejmują ją na wysokości 14 mm. Kontur zewnętrzny frezem Ø12 ma mieć głębokość 5 mm; frez przechodzi tuż obok płytki, nad szczękami. Rysunek to widok z przodu (rzut XZ).",
    data: [
      ["Przedmiot", "płytka 80 × 50 × 20 na podkładkach; szczęki obejmują 14 mm wysokości"],
      ["Zero W", "lewy przedni narożnik górnej powierzchni — w rzucie XZ lewy górny róg, w rzucie z góry (XY) lewy dolny; Z0 na górnej powierzchni"],
      ["Narzędzie", "frez Ø12, kontur zewnętrzny tuż obok płytki"],
      ["Założenie", "liczymy tylko frez i górną krawędź szczęk; oprawkę i kształt szczęk sprawdza się osobno"],
    ],
    steps: [
      { x: "Płytka wystaje ponad szczęki na 20 − 14 = 6 mm. Górna krawędź szczęk leży więc na Z−6." },
      { x: "Kontur na Z−5: w tym modelu czoło frezu jest 1 mm nad górną krawędzią szczęki. Czy taki zapas wystarczy, zależy od kształtu szczęk, oprawki i wymagań zakładu.", code: "G01 Z-5." },
      { x: "Kontur na Z−8 przeciąłby szczękę na głębokość 2 mm. Taka obróbka wymaga innego zamocowania płytki." },
      { x: "Przejazdy między operacjami wykonuje się na wysokości bezpiecznej, np. Z50, ponad przedmiotem i imadłem." },
    ],
    result: "Głębokość z rysunku sprawdza się razem z mocowaniem: dla tych danych Z−5 mija szczękę o 1 mm, a Z−8 ją przecina. Wynik dotyczy pokazanej geometrii, nie każdego zamocowania.",
  },

  practice: [
    {
      kind: "drill",
      intro: "Obliczenia względem punktu zerowego i elementów mocujących.",
      questions: [
        { kind: "gap", q: "Płytka ma 25 mm wysokości, szczęki obejmują ją na wysokości 18 mm. Na jakiej wysokości Z leży górna krawędź szczęk, jeżeli Z0 leży na górnej powierzchni płytki?", template: "Z{0}", answers: [["-7", "−7"]], why: "25 − 18 = 7 mm ponad szczękami, więc górna krawędź szczęk leży na Z−7." },
        { kind: "order", q: "Ułóż te trzy czynności (fragment przygotowania) w kolejności.", items: ["zmierz punkt zerowy i wpisz go do G54", "zamocuj przedmiot", "uruchom program w trybie pracy blok po bloku"], answer: [1, 0, 2], why: "Punkt zerowy mierzy się na zamocowanym przedmiocie. Program uruchamia się na końcu, najpierw blok po bloku." },
        { kind: "choice", q: "Co przenosi siłę skrawania skierowaną w dół, gdy przedmiot leży w imadle?", options: ["podkładki pod przedmiotem", "szczęka ruchoma", "śruba imadła", "punkt zerowy W"], answer: 0, why: "Podkładki podpierają przedmiot i ustalają jego wysokość. Szczęka ruchoma dociska go poziomo." },
      ],
    },
  ],

  pitfalls: [
    { title: "Punkt zerowy zmierzony przed dociśnięciem", x: "Przedmiot przesunął się przy dokręcaniu imadła, a punkt zerowy zmierzono wcześniej. Cała obróbka zostaje przesunięta o ten błąd." },
    { title: "Głębokość bez sprawdzenia szczęk", x: "Kontur zewnętrzny głębszy niż część przedmiotu wystająca ponad szczęki prowadzi frez w imadło. Policz: wysokość przedmiotu minus wysokość zamocowania w szczękach.", danger: true },
  ],

  quiz: [
    { kind: "gap", q: "Płytka o wysokości 20 mm jest zamocowana w imadle na wysokości 12 mm. Na jakiej wysokości Z leży górna krawędź szczęk?", template: "Z{0}", answers: [["-8", "−8"]], why: "20 − 12 = 8 mm ponad szczękami — górna krawędź szczęk leży na Z−8." },
    { kind: "choice", q: "Co wpisuje się do rejestru przesunięcia G54?", options: ["długość narzędzia", "położenie punktu zerowego przedmiotu względem punktu zerowego maszyny", "prędkość obrotową wrzeciona", "wysokość szczęk imadła"], answer: 1, why: "Rejestr przesunięcia przechowuje współrzędne punktu zerowego przedmiotu; sterowanie liczy od niego wymiary programu." },
    { kind: "choice", q: "Kiedy mierzy się punkt zerowy przedmiotu?", options: ["przed zamocowaniem przedmiotu", "po zamocowaniu przedmiotu", "po pierwszym wykonaniu programu", "nie trzeba — oblicza go sterowanie"], answer: 1, why: "Przedmiot może się przesunąć przy mocowaniu, dlatego punkt zerowy mierzy się na przedmiocie już zamocowanym." },
    { kind: "choice", q: "Górna krawędź szczęk leży na Z−6. Co się stanie przy konturze zewnętrznym na głębokości Z−8?", options: ["frez pozostawi 2 mm materiału", "frez przetnie szczękę na głębokość 2 mm", "nic — szczęki są niżej", "sterowanie samo skróci zejście"], answer: 1, why: "Z−8 leży 2 mm poniżej górnej krawędzi szczęk — frez przecina szczękę." },
    { kind: "choice", q: "Od czego w tym kursie mierzy się długość narzędzia L?", options: ["od stołu", "od czoła wrzeciona N do punktu programowanego", "od górnej powierzchni przedmiotu", "od szczęk imadła"], answer: 1, why: "L to odległość od czoła wrzeciona N — płaszczyzny odniesienia przyjętej w kursie — do punktu programowanego.", review: `${k}P.2` },
  ],

  summary: [
    "Punkt zerowy przedmiotu wybiera się w bazie wymiarowej, mierzy na zamocowanym przedmiocie i wpisuje do rejestru przesunięcia.",
    "Ustalenie, podparcie i zamocowanie: przedmiot przylega do baz, leży na podkładkach i jest dociśnięty.",
    "Elementy mocujące wystają poza przedmiot: głębokość i przejazdy sprawdza się względem nich.",
    "Przed uruchomieniem: punkt zerowy, długości narzędzi, wysokość bezpieczna, program dla właściwego sterowania.",
  ],

  sources: [
    { id: "haas-basic", where: "przesunięcia punktu zerowego G54–G59 i G154 P1–P99 — współrzędne zera przedmiotu", loc: "s. 43" },
    { id: "fanuc", where: "G54–G59 — wybór układu współrzędnych przedmiotu", loc: "rozdz. 3.1, tab. 3.1, s. 72; rozdz. 4, s. 87" },
  ],
});

export const podstawy = (k: P): LessonDoc[] => [p1(k), p2(k), p3(k)];
