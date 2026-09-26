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
    { t: "p", x: "Wynik zaokrągla się w dół do okrągłej wartości. Jeśli przekracza maksymalne obroty maszyny, programujesz maksimum — sterowanie i tak nie da więcej." },

    { t: "h", x: "Miejsce w programie", id: "miejsce" },
    { t: "p", x: "Obroty włącza się po wymianie narzędzia, przed pierwszym ruchem w stronę detalu: `S2500 M03`. Kolejność słów S i M w bloku nie ma znaczenia. Przed zakończeniem pracy narzędzia wrzeciono zatrzymuje `M05`." },
    { t: "note", kind: "info", x: "Na frezarce obroty są stałe — domyślny tryb `G97`. Stała prędkość skrawania `G96`, przy której obroty zmieniają się ze średnicą, to temat ścieżki Toczenie." },
  ],

  worked: {
    title: "Oblicz S dla dwóch materiałów",
    intro: "Frez VHM Ø10. Stal C45: vc = 80 m/min. Aluminium: vc = 300 m/min. Maszyna ma maksymalnie 8000 obr/min.",
    steps: [
      { x: "Stal: 1000 · 80 / (3,14 · 10) = 2546 obr/min. Zaokrąglasz w dół.", code: "S2500" },
      { x: "Aluminium: 1000 · 300 / (3,14 · 10) = 9549 obr/min.", code: "9549" },
      { x: "To więcej niż 8000, które daje maszyna.", code: "S8000" },
      { x: "Frez prawoskrętny, więc kierunek w prawo.", code: "M03" },
    ],
    result: "Stal: `S2500 M03`. Aluminium: `S8000 M03` — prędkość skrawania będzie niższa od katalogowej, co przy aluminium można częściowo nadrobić posuwem (lekcja F2.3).",
  },

  practice: [
    {
      kind: "drill",
      intro: "Obliczenia i kody wrzeciona. Przy obliczeniach wystarczy wynik w pełnych obrotach.",
      questions: [
        { kind: "gap", q: "Frez Ø8, vc = 100 m/min. Ile obrotów (w pełnych obr/min)?", template: "n = {0}", answers: [["3979", "3978", "3980"]], why: "1000 · 100 / (π · 8) ≈ 3979 obr/min." },
        { kind: "token", q: "Tapnij słowo, które **uruchamia** obroty.", block: "S1800 M03 M08", answer: 1, why: "M03 włącza obroty w prawo z wartością S1800. M08 to chłodziwo." },
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
    { kind: "choice", q: "Kierunek M03 ocenia się, patrząc:", options: ["od strony wrzeciona w stronę detalu", "od strony detalu na wrzeciono", "z boku maszyny", "zależy od sterowania"], answer: 0, why: "Na frezarce pionowej to widok z góry." },
    { kind: "choice", q: "Obliczone n = 11 400, maszyna ma maksymalnie 10 000. Co programujesz?", options: ["`S11400`", "`S10000`", "`S5700`", "zmieniasz narzędzie"], answer: 1, why: "Więcej maszyna nie da. Prędkość skrawania będzie nieco niższa." },
    { kind: "token", q: "Tapnij kod, który **zatrzymuje** wrzeciono.", block: "M03 M08 M05 M30", answer: 2, why: "M05 — stop wrzeciona." },
    { kind: "choice", q: "Co się stanie, gdy wstawisz do wzoru promień zamiast średnicy?", options: ["obroty wyjdą dwa razy za duże", "obroty wyjdą dwa razy za małe", "nic", "sterowanie to poprawi"], answer: 0, why: "Mianownik jest dwa razy mniejszy, więc wynik dwa razy większy." },
  ],

  summary: [
    "S ustawia obroty, M03/M04 je uruchamiają, M05 zatrzymuje.",
    "n = 1000 · vc / (π · D). Mniejsza średnica — większe obroty.",
    "Wynik zaokrąglasz w dół i ograniczasz do maksimum maszyny.",
    "Obroty włączasz po każdej wymianie narzędzia, przed ruchem do detalu.",
  ],

  sources: [
    { id: "jemielniak", where: "prędkość skrawania i obroty wrzeciona" },
    { id: "sandvik", where: "zalecane prędkości skrawania dla frezów VHM" },
    { id: "fanuc", where: "funkcja S, M03/M04/M05" },
    { id: "sinumerik", where: "S, M3/M4/M5, adresowanie wrzecion" },
  ],
};
