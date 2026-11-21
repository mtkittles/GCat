/*
  Bibliografia techniczna kursu. Lekcje odwołują się do pozycji po `id`.
  W lekcji: `where` — co dokładnie źródło potwierdza, `loc` — rozdział i strona,
  `url` — odnośnik do konkretnej strony, jeśli inny niż dokumentu.
  Uzupełniając listę: podawaj wydanie i numer dokumentu, z którego faktycznie korzystasz.
  Pola, których nie potwierdzono, zostają puste. Strona pomija wtedy wiersz „Miejsce”,
  a braki wylicza `npm run audit:nauka` (sekcja „do uzupełnienia”).
  `note` widzi czytelnik (zastrzeżenie, np. „maszyny Haas — nie dowolny Fanuc”),
  `internal` — tylko redakcja (stan prac, skąd mamy dokument); strona go nie pokazuje.
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
  /** zastrzeżenie dla czytelnika — jedno krótkie zdanie, pokazywane przy każdym odwołaniu */
  note?: string;
  /** notatka redakcyjna (stan prac, czego nie potwierdzono) — nie trafia na stronę */
  internal?: string;
}

export const sources: Record<string, Source> = {
  iso841: {
    id: "iso841", short: "ISO 841", author: "ISO",
    title: "ISO 841 — Industrial automation systems and integration. Numerical control of machines. Coordinate system and motion nomenclature",
    edition: "2001",
  },
  fanuc: {
    id: "fanuc", short: "FANUC — instrukcja obsługi", author: "FANUC",
    title: "Series 0i-MODEL F — Operation and Maintenance Handbook (modele 0i-TF i 0i-MF)",
    edition: "01, 10/2016", number: "B-64607EN/01",
    control: "Fanuc 0i-F, kody ISO; tokarka w systemie A. Instrukcja nie wymienia 0i-F Plus — nowsze wersje sterowania mogą się różnić",
    note: "Zestawienie kodów, formatu programu, parametrów i alarmów, a nie opis cykli. Szczegóły: OPERATOR'S MANUAL B-64604EN i PARAMETER MANUAL B-64610EN.",
    internal: "Zakres: rozdz. 3 (tabele kodów G), 4 (format programu), 7 (parametry), 8 (alarmy). Część tokarska B-64604EN-1, frezarska B-64604EN-2. Miejsca (strony) dla lekcji i kart bez wpisanej strony do uzupełnienia.",
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
    note: "Link prowadzi do wersji francuskiej.",
    internal: "W audycie sprawdzono spis treści (istnienie funkcji), nie treść rozdziałów.",
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
    note: "Te same funkcje opisują instrukcje 808D/828D/840D sl.",
    internal: "Numer dokumentu do uzupełnienia.",
  },
  "haas-basic": {
    id: "haas-basic", short: "Haas — Basic Mill Operator", author: "Haas Automation (Haas Factory Outlet)",
    title: "Basic Mill Operator Hand Out, ver. C — materiały szkoleniowe operatora frezarki",
    control: "sterowanie Haas — nazwy pól i układ ekranów innych sterowań mogą się różnić",
    url: "https://www.haascnc.com/content/dam/haascnc/hfo-microsite/hfo-allendale/training-documents/Basic_Mill_Operator_Hand_Out_verC.pdf", accessed: "10/2026",
  },
  "haas-workbook": {
    id: "haas-workbook", short: "Haas — Mill Programming Workbook", author: "Haas Automation",
    title: "Mill Programming Workbook (frezarki VF/EC)",
    control: "maszyny Haas — nie dowolny Fanuc",
    note: "Strony: drukowana / PDF.",
    internal: "Dokument w materiałach projektu (145 stron PDF). Data w nagłówku wydruku nie jest datą wydania.",
  },
  kuryjanski: {
    id: "kuryjanski", short: "Kuryjański, Obróbka skrawaniem i obrabiarki", author: "R. Kuryjański",
    title: "Obróbka skrawaniem i obrabiarki, Politechnika Warszawska, Warszawa",
    edition: "2011", number: "ISBN 83-89703-72-6",
    note: "Strony — numeracja drukowana.",
    internal: "Dokument w materiałach projektu (raport #80, S1).",
  },
  storch: {
    id: "storch", short: "Storch, Podstawy obróbki skrawaniem", author: "B. Storch",
    title: "Podstawy obróbki skrawaniem",
    internal: "Dokument w materiałach projektu (raport #80, S2). Wydania nie potwierdzono.",
  },
  jemielniak: {
    id: "jemielniak", short: "Jemielniak, Obróbka skrawaniem", author: "K. Jemielniak",
    title: "Obróbka skrawaniem, Oficyna Wydawnicza Politechniki Warszawskiej",
    internal: "Wydania i stron nie potwierdzono w audycie treści (issue #29).",
  },
  sandvik: {
    id: "sandvik", short: "Sandvik Coromant — poradnik", author: "Sandvik Coromant",
    title: "Poradnik techniczny obróbki skrawaniem (toczenie, frezowanie, wiercenie)",
    note: "Wartości skrawania obowiązują dla konkretnej płytki i materiału z katalogu.",
    internal: "Wydanie i strony do uzupełnienia.",
  },
  "sandvik-tg-d": {
    id: "sandvik-tg-d", short: "Sandvik Coromant — poradnik, D Frezowanie", author: "Sandvik Coromant",
    title: "Metalcutting Technical Guide, część D — Milling (wyciąg z katalogu)",
    url: "https://dcngli4g50fhp.cloudfront.net/userfiles/ad/sandvik/documents/sandvik_5747275_catalog.pdf", accessed: "10/2026",
    note: "Wyciąg, strony D 22–D 40. Strony — numeracja drukowana.",
    internal: "Wyciąg udostępniony przez dystrybutora; tytułu całości, wydania i numeru dokumentu nie potwierdzono.",
  },
  "sandvik-wzory-toczenie": {
    id: "sandvik-wzory-toczenie", short: "Sandvik Coromant — wzory toczenia", author: "Sandvik Coromant",
    title: "Turning formulas and definitions — wzory i definicje dla toczenia (strona producenta)",
    url: "https://www.sandvik.coromant.com/en-gb/knowledge/machining-formulas-definitions/general-turning-formulas-definitions", accessed: "11/2026",
  },
  "sandvik-wzory-frezowanie": {
    id: "sandvik-wzory-frezowanie", short: "Sandvik Coromant — wzory frezowania", author: "Sandvik Coromant",
    title: "Formulas and definitions for milling — metric (arkusz wzorów z materiałów szkoleniowych)",
    url: "https://cdn.sandvik.coromant.com/files/sitecollectiondocuments/services/metal-cutting-e-learning/formulas-and-definitions/formulas-and-deinitions-for-milling-metric-enu.pdf", accessed: "11/2026",
  },
  "sandvik-handbook": {
    id: "sandvik-handbook", short: "Sandvik Coromant — podręcznik szkoleniowy", author: "Sandvik Coromant",
    title: "Training Handbook — podręcznik szkoleniowy obróbki skrawaniem",
    edition: "2017.11",
    url: "https://api.dgisupply.ca/uploads/literature/0F05F3n1r0r00cFjfpG1mVHh5bNAluN3Ddh1FdO0.pdf", accessed: "11/2026",
    internal: "Kopia u dystrybutora; tytułu z okładki, numeru dokumentu i numerów stron nie potwierdzono (tekst czytany z wyciągu), dlatego odwołania podają część i rozdział bez strony.",
  },
  "sandvik-plytka-tokarska": {
    id: "sandvik-plytka-tokarska", short: "Sandvik Coromant — dobór płytki tokarskiej", author: "Sandvik Coromant",
    title: "How to choose correct turning insert — dobór płytki tokarskiej (strona producenta)",
    url: "https://www.sandvik.coromant.com/en-gb/knowledge/general-turning/how-to-choose-correct-turning-insert", accessed: "11/2026",
  },
  "sandvik-kat-frezowanie": {
    id: "sandvik-kat-frezowanie", short: "Sandvik Coromant — kąt przystawienia i grubość wióra", author: "Sandvik Coromant",
    title: "Entering angle and chip thickness in milling — kąt przystawienia i grubość wióra przy frezowaniu (strona producenta)",
    url: "https://www.sandvik.coromant.com/en-us/knowledge/milling/entering-angle-and-chip-thickness", accessed: "11/2026",
  },
  "sandvik-kc": {
    id: "sandvik-kc", short: "Sandvik Coromant — właściwa siła skrawania", author: "Sandvik Coromant",
    title: "Specific cutting force — właściwa siła skrawania kc1 (strona producenta)",
    url: "https://www.sandvik.coromant.com/en-gb/knowledge/materials/specific-cutting-force", accessed: "11/2026",
  },
  "sandvik-rampa": {
    id: "sandvik-rampa", short: "Sandvik Coromant — wejście po rampie i helisie", author: "Sandvik Coromant",
    title: "Ramping: two axis linear and circular — rampa liniowa i kołowa (strona producenta)",
    url: "https://www.sandvik.coromant.com/en-gb/knowledge/milling/milling-holes-cavities-pockets/ramping", accessed: "11/2026",
    internal: "Wzory na posuw środka narzędzia są na stronie obrazkami; w tekście: vfm — posuw na obwodzie (z korekcją promienia), vf — posuw środka, Dvf — zaprogramowany tor. Relacja vf = vfm · (Dm − Dc)/Dm to stosunek obwodów torów (geometria).",
  },
  "sandvik-programowanie-frez": {
    id: "sandvik-programowanie-frez", short: "Sandvik Coromant — programowanie frezowania", author: "Sandvik Coromant",
    title: "Milling programming — posuw środka a posuw na obwodzie, redukcja posuwu w narożach (strona producenta)",
    url: "https://www.sandvik.coromant.com/en-gb/knowledge/milling/programming", accessed: "11/2026",
  },
  "sandvik-wzory-gwinty": {
    id: "sandvik-wzory-gwinty", short: "Sandvik Coromant — wzory gwintowania", author: "Sandvik Coromant",
    title: "Threading formulas and definitions — wzory i definicje dla toczenia i frezowania gwintów (strona producenta)",
    url: "https://www.sandvik.coromant.com/en-gb/knowledge/machining-formulas-definitions/threading-formulas-definitions", accessed: "11/2026",
  },
  "sandvik-corotap": {
    id: "sandvik-corotap", short: "Sandvik Coromant — otwór pod gwintownik", author: "Sandvik Coromant",
    title: "How to use CoroTap 100 — średnica otworu pod gwintownik skrawający, formy nakroju (strona producenta)",
    url: "https://www.sandvik.coromant.com/en-us/tools/drilling-tools/solid-carbide-threading-tools/corotap-100/how-to-use-corotap-100", accessed: "11/2026",
    note: "Zasada D − P dotyczy gwintowników skrawających; gwintowniki wygniatające wymagają większego otworu.",
  },
  "sandvik-frez-problemy": {
    id: "sandvik-frez-problemy", short: "Sandvik Coromant — rozwiązywanie problemów przy frezowaniu", author: "Sandvik Coromant",
    title: "Milling troubleshooting — drgania, bicie, zużycie (strona producenta)",
    url: "https://www.sandvik.coromant.com/en-gb/knowledge/milling/troubleshooting-milling", accessed: "11/2026",
  },
  "sandvik-drgania": {
    id: "sandvik-drgania", short: "Sandvik Coromant — drgania przy frezowaniu", author: "Sandvik Coromant",
    title: "How to reduce vibration in milling — wysięg, sztywność mocowania, kierunek sił (strona producenta)",
    url: "https://www.sandvik.coromant.com/en-us/knowledge/milling/vibration", accessed: "11/2026",
  },
  "iscar-gwintowniki": {
    id: "iscar-gwintowniki", short: "ISCAR — formy nakroju gwintowników (DIN 2197)", author: "ISCAR",
    title: "Threading Catalog, User Guide — Tap nomenclature and standards: chamfer lead forms according to DIN 2197",
    url: "https://iscar.com/Catalogs/publication-2023/english-1/THREADING-CATALOG-62-ver-3-3431159/flipview-THREADING-CATALOG-62-ver-3-3431159/files/basic-html/page380.html", accessed: "11/2026",
    internal: "Katalog producenta cytuje DIN 2197; samej normy nie sprawdzono.",
  },
  "cadem-rt": {
    id: "cadem-rt", short: "CADEM — promień naroża, posuw i chropowatość", author: "CADEM Technologies",
    title: "Insert nose radius chart — for feed rate selection in turning",
    url: "https://cadem.com/?p=2527", accessed: "11/2026",
    note: "Wartości teoretyczne — rzeczywista chropowatość zależy od zużycia narzędzia, maszyny i drgań.",
    internal: "Strona podaje zależność (Rmax rośnie z kwadratem posuwu, maleje z promieniem naroża) i tabelę; sam wzór jest na obrazku, nie w tekście. Do zastąpienia źródłem książkowym, gdy będzie potwierdzone.",
  },
  "sandvik-ceramic": {
    id: "sandvik-ceramic", short: "Sandvik Coromant — frezy ceramiczne do HRSA", author: "Sandvik Coromant",
    title: "Ceramic end mills take the heat in HRSA machining — informacja producenta o frezach ceramicznych do stopów żaroodpornych (HRSA)",
    url: "https://www.machinery.co.uk/content/product-launches/ceramic-end-mills-from-sandvik-coromant-take-the-heat-in-hrsa-machining", accessed: "10/2026",
    note: "Zalecenie dotyczy frezów ceramicznych w stopach żaroodpornych: „without coolant application”. Dla narzędzi z węglika obowiązują inne zalecenia.",
  },
  // ── Technologia (V3.0): narzędzia i materiały narzędziowe ──
  iso513: {
    id: "iso513", short: "ISO 513", author: "ISO",
    title: "ISO 513 — Classification and application of hard cutting materials for metal removal with defined cutting edges — Designation of the main groups and groups of application",
    edition: "2012 (wydanie 4)",
    url: "https://www.iso.org/standard/59932.html", accessed: "11/2026",
    note: "Norma obejmuje twarde materiały skrawające (węgliki, ceramikę, diament, azotek boru); stali szybkotnącej nie klasyfikuje.",
    internal: "Tabele 1–5 (oznaczenia literowe i grupy P–H z kolorami) przeczytane z bezpłatnej próbki normy (standards.iteh.ai). Pełnego tekstu nie sprawdzono.",
  },
  "mmc-frezowanie": {
    id: "mmc-frezowanie", short: "Mitsubishi Materials — kurs frezowania", author: "Mitsubishi Materials",
    title: "Basic Milling — kurs e-learningowy producenta, część End milling (Parts names and functions, Classification, Types)",
    url: "https://www.mmc-carbide.com/permanent/courses/83/", accessed: "11/2026",
  },
  "mmc-materialy": {
    id: "mmc-materialy", short: "Mitsubishi Materials — materiały narzędziowe", author: "Mitsubishi Materials",
    title: "Cutting tool materials — rozwój materiałów narzędziowych i tabela właściwości twardych składników (informacja techniczna producenta)",
    url: "https://mitsubishicarbide.net/contents/mhg/ru/html/product/technical_information/information/sessaku.html", accessed: "11/2026",
    internal: "Strona w języku angielskim w serwisie regionalnym (ścieżka /ru/); wersja /enus/ ma tę samą tabelę, ale bez akapitu o historii materiałów.",
  },
  "mmc-bezpieczenstwo": {
    id: "mmc-bezpieczenstwo", short: "Mitsubishi Materials — właściwości twardych materiałów narzędziowych", author: "Mitsubishi Materials",
    title: "Safety of cutting tool products — Basic characteristics of hard tool materials (twardość i gęstość)",
    url: "https://www.mmc-carbide.com/sea/technical_information/tec_guide/tec_guide_safely", accessed: "11/2026",
    note: "Zakresy dla całych grup materiałów; konkretny gatunek ma jedną wartość z karty producenta.",
  },
  "mmc-cbn-pcd": {
    id: "mmc-cbn-pcd", short: "Mitsubishi Materials — gatunki CBN i PCD", author: "Mitsubishi Materials",
    title: "CBN & PCD inserts — grades (informacja techniczna producenta)",
    url: "https://www.mmc-carbide.com/sea/technical_information/tec_turning_tools/tec_cbn_pcd_insert/grades/tec_cbn_pcd_list", accessed: "11/2026",
  },
  "ntk-materialy": {
    id: "ntk-materialy", short: "NTK — materiały narzędziowe i dobór", author: "NTK Cutting Tools",
    title: "Tool Materials / Selection Guide — część C katalogu (ceramika, CBN, PCD)",
    url: "https://ntkcuttingtools.com/wpdata/wp-content/uploads/2024/11/C_ToolMaterials_SelectionGuide_ntk_en.pdf", accessed: "11/2026",
    note: "Strony — numeracja katalogu (C14, C19…).",
    internal: "Data wydania nie jest podana w dokumencie; plik z 11/2024 według adresu.",
  },
  "sandvik-materialy": {
    id: "sandvik-materialy", short: "Sandvik Coromant — materiały narzędziowe", author: "Sandvik Coromant",
    title: "Cutting tool materials — materiały narzędziowe (strona producenta)",
    url: "https://www.sandvik.coromant.com/en-us/knowledge/materials/cutting-tool-materials", accessed: "11/2026",
    internal: "Strona renderowana skryptem — narzędzie do pobierania stron nie czyta treści. Zdanie o udziale powlekanego węglika potwierdzone w wyniku wyszukiwarki z tej strony (11/2026); do sprawdzenia w przeglądarce.",
  },
  "bigdaishowa-pcd": {
    id: "bigdaishowa-pcd", short: "BIG DAISHOWA — PCD i CBN", author: "BIG DAISHOWA",
    title: "Tooling Today 2023 — magazyn techniczny producenta, artykuł o wyborze płytek PCD i CBN",
    edition: "2023",
    url: "https://catalog.bigdaishowa.com/view/944013250/32/", accessed: "11/2026",
  },
  "helical-guidebook": {
    id: "helical-guidebook", short: "Helical Solutions — Machining Guidebook", author: "Helical Solutions",
    title: "Machining Guidebook — poradnik obróbki frezami trzpieniowymi",
    edition: "© 2016",
    url: "https://web.mae.ufl.edu/designlab/Advanced%20Manufacturing/Helical_Machining_Guidebook.pdf", accessed: "11/2026",
    note: "Strony — numeracja PDF.",
    internal: "Kopia poradnika producenta na stronie uczelni (University of Florida); wersji na stronie producenta nie znaleziono.",
  },
  haas: {
    id: "haas", short: "Haas — kody G frezarki", author: "Haas Automation",
    title: "Mill Operator's Manual — G-codes",
    control: "maszyny Haas — nie dowolny Fanuc",
    url: "https://www.haascnc.com", accessed: "10/2026",
  },
  "haas-ap602": {
    id: "haas-ap602", short: "Haas — G84 Tapping Canned Cycle", author: "Haas Automation",
    title: "G84 Tapping Canned Cycle",
    edition: "04/2016", number: "AP-602",
    control: "frezarki Haas — na innych sterowaniach potwierdź w ich dokumentacji",
    internal: "Wcześniej cytowany w treści karty G84 (notka „Źródło: …”), przeniesiony do pola sources w paczce X.",
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
