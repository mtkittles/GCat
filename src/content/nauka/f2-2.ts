import type { LessonDoc } from "@/lib/lesson";

export const f2_2: LessonDoc = {
  id: "F2.2",
  slug: "f2-2-obroty-s-m03",
  title: "Obroty: S i M03/M04/M05",
  minutes: 12,
  goal: "Obliczysz obroty wrzeciona z prędkości skrawania i włączysz je we właściwym kierunku.",

  theory: [
    { t: "h", x: "S i kierunek", id: "s-kierunek" },
    { t: "p", x: "Adres **S** podaje obroty wrzeciona na minutę, np. `S2500`. Samo S niczego nie włącza — obroty startują dopiero z kodem kierunku: [[M03]] w prawo, [[M04]] w lewo. [[M05]] zatrzymuje wrzeciono." },
    { t: "diagram", id: "f22-dir" },
    { t: "p", x: "Prawie wszystkie frezy i wiertła są prawoskrętne i pracują na `M03`. `M04` służy narzędziom lewoskrętnym i specjalnym operacjom, np. wytaczaniu wstecznemu." },

    { t: "h", x: "Skąd wziąć S", id: "obliczanie" },
    { t: "p", x: "Producent narzędzia podaje [[vc|prędkość skrawania vc]] w m/min — prędkość ostrza względem materiału. Obroty zależą od średnicy: im mniejszy frez, tym szybciej musi się kręcić, żeby ostrze miało tę samą prędkość." },
    { t: "code", x: "n = 1000 · vc / (π · D)\n\nvc — prędkość skrawania [m/min]\nD  — średnica narzędzia [mm]\nn  — obroty [obr/min]", caption: "1000 zamienia metry na milimetry. Kalkulator obróbki liczy to samo." },
    { t: "diagram", id: "vc" },
    { t: "p", x: "W kursie wynik zaokrąglamy w dół do okrągłej wartości — rzeczywista vc wychodzi wtedy nieco niższa od katalogowej. Jeśli wynik przekracza maksymalne obroty maszyny, programujesz maksimum. Rzeczywista prędkość skrawania jest wtedy niższa: vc = π · D · n / 1000. Posuw liczysz od nowa dla tych obrotów (lekcja F2.3) — zwiększenie F nie przywraca vc, tylko zwiększa obciążenie ostrza." },

    { t: "h", x: "Miejsce w programie", id: "miejsce" },
    { t: "p", x: "Obroty włącza się po wymianie narzędzia, przed pierwszym ruchem w stronę detalu: `S2500 M03`. Kolejność słów S i M w bloku nie ma znaczenia. Przed zakończeniem pracy narzędzia wrzeciono zatrzymuje `M05`." },
    { t: "note", kind: "info", x: "Na frezarce obroty są stałe — domyślny tryb `G97`. Stała prędkość skrawania `G96`, przy której obroty zmieniają się ze średnicą, to temat ścieżki Toczenie." },
  ],

  worked: {
    title: "Oblicz S dla dwóch materiałów",
    intro: "Sytuacja: ten sam frez VHM Ø10 ma obrabiać detal ze stali C45 (vc = 80 m/min) i z aluminium (vc = 300 m/min). Wartości vc to założenie przykładu. Maszyna daje najwyżej 8000 obr/min. Rysunek porównuje wyliczone obroty z tym limitem.",
    fig: "f22-limit",
    steps: [
      { x: "Stal: 1000 · 80 / (π · 10) ≈ 2546 obr/min. Zaokrąglasz w dół.", code: "S2500" },
      { x: "Aluminium: 1000 · 300 / (π · 10) ≈ 9549 obr/min — czerwona część słupka wychodzi poza limit.", code: "9549" },
      { x: "To więcej niż 8000, które daje maszyna — programujesz maksimum.", code: "S8000" },
      { x: "Rzeczywista vc przy S8000: π · 10 · 8000 / 1000 ≈ 251 m/min zamiast 300.", code: "vc ≈ 251" },
      { x: "Frez prawoskrętny, więc kierunek w prawo.", code: "M03" },
    ],
    result: "Stal: `S2500 M03`. Aluminium: `S8000 M03` przy vc ≈ 251 m/min. Posuw F liczysz z fz dla S8000 (lekcja F2.3) i sprawdzasz, czy te parametry mieszczą się w zaleceniach producenta freza.",
  },

  practice: [
    {
      kind: "task", mode: "mill",
      intro: "Oblicz obroty i włącz wrzeciono. Frez VHM Ø10, stal C45, vc = 80 m/min, frez prawoskrętny.",
      starter: "O1000 (PLYTKA)\nG21 G90 G94 G17\nG40 G49 G80\nG54\nT1 M06 (FREZ FI10)\nG43 H1 Z50.\n(DOPISZ OBROTY: N = 1000 * VC / (PI * D), ZAOKRAGLIJ W DOL DO PELNYCH SETEK, KIERUNEK W PRAWO)\nM08\nG00 X-20. Y10.\nG00 Z5.\nG01 Z-5. F150\nG01 X-5. F400\nG00 Z50.\nM09\nM05\nM30",
      checks: [{"t":"require","codes":["S2500","M03"]},{"t":"forbid","codes":["M04"]},{"t":"cut","reference":"G90\nG00 X-20. Y10.\nG00 Z5.\nG01 Z-5. F150\nG01 X-5. F400\nG00 Z50.","tolerance":0.05}],
      hints: ["1000 · 80 / (π · 10) ≈ 2546 obr/min. W kursie zaokrąglamy w dół do pełnych setek.","Frez prawoskrętny skrawa przy obrotach w prawo: `S2500 M03` w jednym bloku."],
      solution: "O1000 (PLYTKA)\nG21 G90 G94 G17\nG40 G49 G80\nG54\nT1 M06 (FREZ FI10)\nG43 H1 Z50.\nS2500 M03\nM08\nG00 X-20. Y10.\nG00 Z5.\nG01 Z-5. F150\nG01 X-5. F400\nG00 Z50.\nM09\nM05\nM30",
    },
    {
      kind: "drill",
      intro: "Obliczenia i kody wrzeciona. Przy obliczeniach wystarczy wynik w pełnych obrotach.",
      questions: [
        {"kind":"bughunt","q":"Frez prawoskrętny. Znajdź błąd.","program":"T1 M06 (FREZ FI10)\nG43 H1 Z50.\nS2500 M04\nM08\nG00 X-20. Y10.","answer":2,"why":"M04 to obroty w lewo — frez prawoskrętny obraca się wtedy grzbietami ostrzy do materiału: nie skrawa, tylko trze, grzeje się i szybko tępi albo wykrusza. Powinno być S2500 M03."},

        { kind: "gap", q: "Frez Ø8, vc = 100 m/min. Ile obrotów (w pełnych obr/min)?", template: "n = {0}", answers: [["3979", "3978", "3980"]], why: "1000 · 100 / (π · 8) ≈ 3979 obr/min." },
        { kind: "gap", q: "W programie dla aluminium z przykładu (S8000) frez Ø10 zastąpiono frezem Ø6, a S zostało bez zmian. Jaka będzie prędkość skrawania (m/min, w pełnych)?", template: "vc ≈ {0}", answers: [["151", "150"]], why: "vc = π · 6 · 8000 / 1000 ≈ 151 m/min. Mniejsza średnica przy tych samych obrotach to mniejsza prędkość na ostrzu — S trzeba liczyć od nowa dla każdego narzędzia." },
        { kind: "token", q: "Wskaż słowo, które **uruchamia** obroty.", block: "S1800 M03 M08", answer: 1, why: "M03 włącza obroty w prawo z wartością S1800. M08 to chłodziwo." },
        { kind: "choice", q: "Wiertło Ø5 i wiertło Ø20 z tego samego materiału, to samo vc. Które potrzebuje większych obrotów?", options: ["Ø5, czterokrotnie większych", "Ø20", "takich samych", "zależy od posuwu"], answer: 0, why: "Obroty są odwrotnie proporcjonalne do średnicy." },
        { kind: "choice", q: "Frez prawoskrętny. Który kod?", options: ["M03", "M04", "M05", "M06"], answer: 0, why: "Narzędzia prawoskrętne pracują w prawo — M03." },
      ],
    },
  ],

  pitfalls: [
    { title: "Promień zamiast średnicy", x: "We wzorze stoi średnica D. Wstawienie promienia daje obroty dwa razy za duże — ostrza szybko się przegrzewają." },
    { title: "M04 z narzędziem prawoskrętnym", x: "Ostrza trą grzbietem zamiast skrawać. Narzędzie się grzeje, a po chwili pęka." },
    { title: "S bez M03", x: "Po wymianie narzędzia program ustawia `S3000`, ale bez `M03`. Wrzeciono stoi, a następny ruch roboczy wprowadza nieruchome narzędzie w materiał." },
    { title: "Obroty dla poprzedniego narzędzia", x: "S jest modalne. Po wymianie frezu Ø10 na wiertło Ø3 bez nowego S wiertło pracuje z obrotami frezu — ponad trzy razy za wolno." },
  ],

  controllers: {
    rows: [
      ["Obroty", "`S2500`", "`S2500` (dla wrzeciona głównego)"],
      ["Kierunek i stop", "`M03` `M04` `M05`", "`M3` `M4` `M5`"],
      ["Obroty stałe", "`G97` — domyślne na frezarce", "`G97` — domyślne na frezarce"],
    ],
    note: "Na maszynach z kilkoma wrzecionami Sinumerik adresuje je numerem: `S1=…`, `M1=3`. Na zwykłej frezarce wystarczy `S` i `M3`.",
  },

  quiz: [
    { kind: "choice", review: "F2.1", q: "W jakim stanie jest wrzeciono po `M06`?", options: ["stoi", "obraca się", "obraca się w lewo", "zależy od S"], answer: 0, why: "Dlatego po wymianie znowu pada S… M03." },
    { kind: "choice", q: "Co robi samo `S2000` przy zatrzymanym wrzecionie?", options: ["uruchamia obroty w prawo", "tylko ustawia wartość obrotów", "zatrzymuje wrzeciono", "wywołuje alarm"], answer: 1, why: "Obroty startują dopiero z M03 lub M04." },
    { kind: "gap", q: "Frez Ø12, vc = 90 m/min. Ile obrotów (pełne obr/min)?", template: "n = {0}", answers: [["2387", "2386", "2388"]], why: "1000 · 90 / (π · 12) ≈ 2387." },
    { kind: "choice", q: "Skąd patrzysz, oceniając kierunek obrotów M03?", options: ["od strony wrzeciona w stronę detalu", "od strony detalu na wrzeciono", "z boku maszyny", "zależy od sterowania"], answer: 0, why: "Na frezarce pionowej to widok z góry." },
    { kind: "choice", q: "Obliczone n = 11 400, maszyna ma maksymalnie 10 000. Co programujesz?", options: ["`S11400`", "`S10000`", "`S5700`", "zmieniasz narzędzie"], answer: 1, why: "Więcej maszyna nie da. Rzeczywista vc spadnie proporcjonalnie (tu ok. 88%), a posuw F trzeba przeliczyć dla S10000 z przyjętego fz." },
    { kind: "token", q: "Wskaż kod, który **zatrzymuje** wrzeciono.", block: "M03 M08 M05 M30", answer: 2, why: "M05 — stop wrzeciona." },
    { kind: "choice", q: "Co się stanie, gdy wstawisz do wzoru promień zamiast średnicy?", options: ["obroty wyjdą dwa razy za duże", "obroty wyjdą dwa razy za małe", "nic", "sterowanie to poprawi"], answer: 0, why: "Mianownik jest dwa razy mniejszy, więc wynik dwa razy większy." },
  ],

  summary: [
    "S ustawia obroty, M03/M04 je uruchamiają, M05 zatrzymuje.",
    "n = 1000 · vc / (π · D). Mniejsza średnica — większe obroty.",
    "Wynik zaokrąglasz w dół i ograniczasz do maksimum maszyny. Przy ograniczonych obrotach vc spada, a F liczysz od nowa.",
    "Obroty włączasz po każdej wymianie narzędzia, przed ruchem do detalu.",
  ],

  sources: [
    { id: "jemielniak", where: "prędkość skrawania i obroty wrzeciona" },
    { id: "sandvik", where: "zalecane prędkości skrawania dla frezów VHM" },
    { id: "fanuc", where: "funkcja S, M03/M04/M05" },
    { id: "sinumerik", where: "S, M3/M4/M5, adresowanie wrzecion" },
  ],
};
