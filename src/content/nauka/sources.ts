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
    full: "SIEMENS SINUMERIK 840D sl / 828D — Programming Manual, Fundamentals.",
  },
  jemielniak: {
    id: "jemielniak", short: "Jemielniak, Obróbka skrawaniem",
    full: "K. Jemielniak, Obróbka skrawaniem, Oficyna Wydawnicza Politechniki Warszawskiej.",
  },
  sandvik: {
    id: "sandvik", short: "Sandvik Coromant — poradnik",
    full: "Sandvik Coromant, poradnik techniczny obróbki skrawaniem (toczenie, frezowanie, wiercenie).",
  },
};
