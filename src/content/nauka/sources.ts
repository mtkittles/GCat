/*
  Bibliografia techniczna kursu. Lekcje odwołują się do pozycji po `id`
  i podają, której części źródła dotyczy dana treść.
  Uzupełniając listę: podawaj wydanie/wersję dokumentu, z którego faktycznie korzystasz.
*/

export interface Source { id: string; short: string; full: string }

export const sources: Record<string, Source> = {
  iso841: {
    id: "iso841", short: "ISO 841",
    full: "ISO 841 — Industrial automation systems and integration. Numerical control of machines. Coordinate system and motion nomenclature.",
  },
  fanuc: {
    id: "fanuc", short: "FANUC — instrukcja obsługi",
    full: "FANUC Series 0i-F Plus — Operator's Manual (część wspólna dla tokarek i centrów obróbkowych).",
  },
  sinumerik: {
    id: "sinumerik", short: "SINUMERIK — Podstawy programowania",
    full: "SIEMENS SINUMERIK 840D sl / 828D — Programming Manual, Fundamentals, wyd. 10/2015, 6FC5398-1BP40-5BA3. Język natywny Siemensa; inne wersje sterowania mogą się różnić.",
  },
  "sinumerik-iso-t": {
    id: "sinumerik-iso-t", short: "SINUMERIK — ISO Turning",
    full: "SIEMENS SINUMERIK 840D sl / 828D — ISO Turning, oprogramowanie 4.5, wyd. 02/2012, 6FC5398-5BP40-3BA0. Rozdz. 1.1 (tryby języka), rozdz. 4.1.2 (G70–G76, typy G71).",
  },
  jemielniak: {
    id: "jemielniak", short: "Jemielniak, Obróbka skrawaniem",
    full: "K. Jemielniak, Obróbka skrawaniem, Oficyna Wydawnicza Politechniki Warszawskiej.",
  },
  sandvik: {
    id: "sandvik", short: "Sandvik Coromant — poradnik",
    full: "Sandvik Coromant, poradnik techniczny obróbki skrawaniem (toczenie, frezowanie, wiercenie).",
  },
  haas: {
    id: "haas", short: "Haas — kody G frezarki",
    full: "Haas Automation, Mill Operator's Manual — G-codes (G83: Q jako przyrost, start posuwu od R, ustawienia wycofania; G84: gwintowanie sztywne bez M29). haascnc.com, dostęp 10/2026. Dotyczy maszyn Haas, nie dowolnego Fanuca.",
  },
  harvey: {
    id: "harvey", short: "Harvey Performance — Spot Drilling",
    full: "Harvey Performance Company, In The Loupe: Choosing the Right Spot Drill — dobór kąta nawiertaka do kąta wiertła. harveyperformance.com, dostęp 10/2026.",
  },
  vergnano: {
    id: "vergnano", short: "Vergnano — geometria gwintowników",
    full: "Vergnano, Technical information — opis oznaczeń geometrii gwintowników (formy nakroju: C 2–3 zwoje, E 1,5–2 zwoje). vergnano.com, dostęp 10/2026.",
  },
};
