/*
  Bibliografia techniczna kursu. Lekcje odwołują się do pozycji po `id`.
  W lekcji: `where` — co dokładnie źródło potwierdza, `loc` — rozdział i strona,
  `url` — odnośnik do konkretnej strony, jeśli inny niż dokumentu.
  Uzupełniając listę: podawaj wydanie i numer dokumentu, z którego faktycznie korzystasz.
  Pola, których nie potwierdzono, zostają puste — strona pokazuje wtedy „do uzupełnienia”.
*/

export interface Source {
  id: string;
  /** krótka nazwa na liście źródeł lekcji */
  short: string;
  /** autor albo producent */
  author: string;
  title: string;
  /** wydanie / wersja dokumentu, np. „10/2015” */
  edition?: string;
  /** numer dokumentu producenta, np. „6FC5398-1BP40-5BA3” */
  number?: string;
  /** sterowanie i język, których dotyczy źródło */
  control?: string;
  url?: string;
  /** data dostępu do źródła internetowego */
  accessed?: string;
  /** zastrzeżenie, np. czego nie potwierdzono */
  note?: string;
}

export const sources: Record<string, Source> = {
  iso841: {
    id: "iso841", short: "ISO 841", author: "ISO",
    title: "ISO 841 — Industrial automation systems and integration. Numerical control of machines. Coordinate system and motion nomenclature",
    edition: "2001",
  },
  fanuc: {
    id: "fanuc", short: "FANUC — instrukcja obsługi", author: "FANUC",
    title: "Series 0i-F Plus — Operator's Manual (część wspólna dla tokarek i centrów obróbkowych)",
    control: "Fanuc 0i-F Plus, kody ISO; tokarka w systemie A",
    note: "Numer dokumentu oraz rozdziały i strony dla poszczególnych lekcji do uzupełnienia.",
  },
  sinumerik: {
    id: "sinumerik", short: "SINUMERIK — Podstawy programowania", author: "Siemens",
    title: "SINUMERIK 840D sl / 828D — Programming Manual, Fundamentals",
    edition: "10/2015", number: "6FC5398-1BP40-5BA3",
    control: "język natywny Siemensa; inne wersje sterowania mogą się różnić",
  },
  "sinumerik-iso-t": {
    id: "sinumerik-iso-t", short: "SINUMERIK — ISO Turning", author: "Siemens",
    title: "SINUMERIK 840D sl / 828D — ISO Turning",
    edition: "02/2012, oprogramowanie 4.5", number: "6FC5398-5BP40-3BA0",
    control: "tryb ISO na tokarce",
  },
  "sinumerik-cycles": {
    id: "sinumerik-cycles", short: "SINUMERIK — Cykle", author: "Siemens",
    title: "SINUMERIK 840D/840Di/810D/FM-NC — Programming Guide, Cycles (PGZ)",
    edition: "04/2000",
    control: "cykle języka natywnego (starsza składnia)",
    url: "https://cache.industry.siemens.com/dl/files/500/109439500/att_829866/v1/PGZ_0400_en.pdf",
    accessed: "10/2026",
  },
  "sinumerik-iso-m": {
    id: "sinumerik-iso-m", short: "SINUMERIK — ISO Milling", author: "Siemens",
    title: "SINUMERIK 840D sl / 828D — ISO Milling, Programming Manual",
    edition: "02/2012", number: "6FC5398-7BP40-3BA0",
    control: "tryb ISO na frezarce",
    url: "https://cache.industry.siemens.com/dl/files/169/65711169/att_76738/v1/PGM_0212_fr_fr-FR.pdf",
    accessed: "10/2026",
    note: "Link prowadzi do wersji francuskiej. W audycie sprawdzono spis treści (istnienie funkcji), nie treść rozdziałów.",
  },
  "sinumerik-cycles-2006": {
    id: "sinumerik-cycles-2006", short: "SINUMERIK — Cykle (2006)", author: "Siemens",
    title: "SINUMERIK 840D sl/840D/840Di sl/840Di/810D — Cycles, Programming Manual",
    edition: "04/2006",
    control: "cykle języka natywnego; zestaw parametrów zależy od wersji oprogramowania",
  },
  "sinumerik-one": {
    id: "sinumerik-one", short: "SINUMERIK ONE — programowanie NC", author: "Siemens",
    title: "SINUMERIK ONE — NC programming, Programming Manual",
    edition: "03/2025",
    control: "język natywny Siemensa",
    note: "Numer dokumentu do uzupełnienia. Te same funkcje opisują instrukcje 808D/828D/840D sl.",
  },
  "haas-workbook": {
    id: "haas-workbook", short: "Haas — Mill Programming Workbook", author: "Haas Automation",
    title: "Mill Programming Workbook (frezarki VF/EC)",
    control: "maszyny Haas — nie dowolny Fanuc",
    note: "Dokument w materiałach projektu (145 stron PDF). Data w nagłówku wydruku nie jest datą wydania. Strony: drukowana / PDF.",
  },
  jemielniak: {
    id: "jemielniak", short: "Jemielniak, Obróbka skrawaniem", author: "K. Jemielniak",
    title: "Obróbka skrawaniem, Oficyna Wydawnicza Politechniki Warszawskiej",
    note: "Wydania i stron nie potwierdzono w audycie treści (issue #29).",
  },
  sandvik: {
    id: "sandvik", short: "Sandvik Coromant — poradnik", author: "Sandvik Coromant",
    title: "Poradnik techniczny obróbki skrawaniem (toczenie, frezowanie, wiercenie)",
    note: "Wydanie i strony do uzupełnienia. Wartości skrawania obowiązują dla konkretnej płytki i materiału z katalogu.",
  },
  haas: {
    id: "haas", short: "Haas — kody G frezarki", author: "Haas Automation",
    title: "Mill Operator's Manual — G-codes",
    control: "maszyny Haas — nie dowolny Fanuc",
    url: "https://www.haascnc.com", accessed: "10/2026",
  },
  harvey: {
    id: "harvey", short: "Harvey Performance — Spot Drilling", author: "Harvey Performance Company",
    title: "In The Loupe: Choosing the Right Spot Drill — dobór kąta nawiertaka do kąta wiertła",
    url: "https://www.harveyperformance.com", accessed: "10/2026",
  },
  vergnano: {
    id: "vergnano", short: "Vergnano — geometria gwintowników", author: "Vergnano",
    title: "Technical information — oznaczenia geometrii gwintowników (formy nakroju)",
    url: "https://www.vergnano.com", accessed: "10/2026",
  },
};

/** Opis dokumentu w jednej linii: producent, tytuł, wydanie, numer. */
export function sourceDoc(s: Source): string {
  return [`${s.author}, ${s.title}`, s.edition && `wyd. ${s.edition}`, s.number].filter(Boolean).join(", ");
}
