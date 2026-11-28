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
  // ── Technologia (V3.1a): geometria ostrza i frezy ──
  "iso3002-1": {
    id: "iso3002-1", short: "ISO 3002-1", author: "ISO",
    title: "ISO 3002-1 — Basic quantities in cutting and grinding — Part 1: Geometry of the active part of cutting tools — General terms, reference systems, tool and working angles, chip breakers",
    edition: "1982 (wydanie 2), zmiana Amd 1:1992",
    url: "https://www.iso.org/standard/8052.html", accessed: "11/2026",
    note: "Kąty narzędzia w układzie narzędzia (przed zamocowaniem); kąty robocze w czasie skrawania mogą się od nich różnić.",
    internal: "Definicje i zależności przeczytane z normy indyjskiej IS 11522 (Part 1)-1986, identycznej z ISO 3002/1-1982 (law.resource.org/pub/in/bis/S01/is.11522.1.1986.pdf, tekst OCR). Numery punktów jak w normie. Samego tekstu ISO nie sprawdzono.",
  },
  "mmc-geometria-toczenie": {
    id: "mmc-geometria-toczenie", short: "Mitsubishi Materials — kąty ostrza noża tokarskiego", author: "Mitsubishi Materials",
    title: "Basic Turning — kurs e-learningowy producenta, rozdział Tool geometry (kąty ostrza i ich wpływ)",
    url: "https://www.mmc-carbide.com/permanent/courses/75/tool-geometry.html", accessed: "11/2026",
    note: "Zależności ogólne; kąty konkretnej płytki i oprawki podaje katalog.",
  },
  "mmc-katy-frez-czolowy": {
    id: "mmc-katy-frez-czolowy", short: "Mitsubishi Materials — kąty ostrza głowicy frezowej", author: "Mitsubishi Materials",
    title: "Function of each cutting edge angle in face milling — kąty natarcia osiowy i promieniowy, kąt przystawienia, kąt pochylenia (informacja techniczna producenta)",
    url: "https://mitsubishicarbide.net/contents/mmus/enus/html/product/technical_information/information/f_shoumen.html", accessed: "11/2026",
  },
  "sandvik-frezowanie-czolowe": {
    id: "sandvik-frezowanie-czolowe", short: "Sandvik Coromant — frezowanie czołowe", author: "Sandvik Coromant",
    title: "Face milling — frezowanie czołowe: kąt przystawienia, średnica i położenie głowicy, wejście w materiał (strona producenta)",
    url: "https://www.sandvik.coromant.com/en-us/knowledge/milling/face-milling", accessed: "11/2026",
    internal: "Strona renderowana skryptem — narzędzie do pobierania stron nie czyta treści. Zdania potwierdzone w wynikach wyszukiwarki z tej strony (11/2026): 45° najczęściej, 90° do ścianek cienkich i słabo zamocowanych, średnica 20–50% większa od przedmiotu, wtoczenie w materiał (roll into cut), położenie poza osią przy krawędziach cienkich ścianek. Do sprawdzenia w przeglądarce.",
  },
  "sandvik-tor-freza": {
    id: "sandvik-tor-freza", short: "Sandvik Coromant — tor freza i tworzenie wióra", author: "Sandvik Coromant",
    title: "Cutter path and chip formation in milling — wejście, łuk przyporu i wyjście ostrza, położenie freza (strona producenta)",
    url: "https://www.sandvik.coromant.com/en-us/knowledge/milling/cutter-path-and-chip-formation", accessed: "11/2026",
    internal: "Strona renderowana skryptem — zdania potwierdzone w wynikach wyszukiwarki z tej strony (11/2026): Dc o 20–50% większe od ae, frez poza osią, wyjście z materiału najbardziej wrażliwe, gruby wiór na wyjściu przy wejściu na wprost. Do sprawdzenia w przeglądarce.",
  },
  "sandvik-frezowanie-kopiowe": {
    id: "sandvik-frezowanie-kopiowe", short: "Sandvik Coromant — frezowanie kopiowe", author: "Sandvik Coromant",
    title: "Profile milling — frezowanie kopiowe: płytki okrągłe, frezy z promieniem i frezy kuliste (strona producenta)",
    url: "https://www.sandvik.coromant.com/en-us/knowledge/milling/profile-milling", accessed: "11/2026",
    internal: "Strona renderowana skryptem — zdanie o płytkach okrągłych i promieniu (zgrubnie) i frezach kulistych (wykańczająco) potwierdzone w wyniku wyszukiwarki (11/2026).",
  },
  "sandvik-rowki": {
    id: "sandvik-rowki", short: "Sandvik Coromant — frezowanie rowków", author: "Sandvik Coromant",
    title: "Groove or slot milling — frezowanie rowków frezem tarczowym, frezem z długą krawędzią i frezem trzpieniowym (strona producenta)",
    url: "https://www.sandvik.coromant.com/en-us/knowledge/milling/groove-or-slot-milling", accessed: "11/2026",
    internal: "Strona renderowana skryptem — treść potwierdzona w wyniku wyszukiwarki (11/2026).",
  },
  "sandvik-corom331": {
    id: "sandvik-corom331", short: "Sandvik Coromant — frez tarczowy CoroMill 331", author: "Sandvik Coromant",
    title: "How to use CoroMill 331 — frez tarczowy trzystronny i dwustronny: dobór korpusu, montaż zestawu (strona producenta)",
    url: "https://www.sandvik.coromant.com/en-us/tools/milling-tools/cut-off-slot-and-groove-milling-tools/coromill-331/how-to-use-coromill-331", accessed: "11/2026",
    internal: "Strona renderowana skryptem — treść potwierdzona w wyniku wyszukiwarki (11/2026).",
  },
  "sandvik-fazowanie": {
    id: "sandvik-fazowanie", short: "Sandvik Coromant — frezowanie faz", author: "Sandvik Coromant",
    title: "Chamfer milling — frezowanie faz: dobór narzędzia, dane skrawania, programowanie (strona producenta)",
    url: "https://www.sandvik.coromant.com/en-gb/knowledge/milling/chamfer-milling", accessed: "11/2026",
    internal: "Strona renderowana skryptem — treść potwierdzona w wynikach wyszukiwarki (11/2026).",
  },
  "sandvik-corom316-faza": {
    id: "sandvik-corom316-faza", short: "Sandvik Coromant — głowice do faz CoroMill 316", author: "Sandvik Coromant",
    title: "Milling heads for chamfer milling — CoroMill 316: kąty fazy, nawiercanie głowicą dwuostrzową (strona producenta)",
    url: "https://sandvik.coromant.com/en-gb/tools/milling-tools/solid-carbide-end-mills/coromill-316/milling-heads-for-chamfer-milling", accessed: "11/2026",
  },
  "imco-kulisty": {
    id: "imco-kulisty", short: "IMCO — frezy kuliste: średnica efektywna i grzbiety", author: "IMCO Carbide Tool",
    title: "Adjustments for Ball Nose End Mills — średnica efektywna, wysokość grzbietów (karta techniczna producenta)",
    url: "https://cms.imcousa.com/wp-content/uploads/2021/01/Adjustments-for-Ball-Nose-Endmills.pdf", accessed: "11/2026",
    note: "Wzór na wysokość grzbietów jest przybliżony.",
  },
  "datron-teowy": {
    id: "datron-teowy", short: "DATRON — frez do rowków teowych", author: "DATRON",
    title: "T-Slot Mill — opis narzędzia w sklepie producenta",
    url: "https://shop.datron.com/?p=9504", accessed: "11/2026",
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
  // V3.1b Otwory (2026-11-28)
  "mmc-wiercenie": {
    id: "mmc-wiercenie", short: "Mitsubishi Materials — kurs wiercenia", author: "Mitsubishi Materials",
    title: "Advanced Drilling — kurs: budowa wiertła, kąt wierzchołkowy, chłodzenie, dobór wiertła",
    url: "https://www.mmc-carbide.com/permanent/courses/68/parts%2c-properties---functions.html", accessed: "11/2026",
  },
  "sandvik-wzory-wiercenie": {
    id: "sandvik-wzory-wiercenie", short: "Sandvik Coromant — wzory wiercenia", author: "Sandvik Coromant",
    title: "Drilling formulas and definitions — obroty, posuw na obrót i posuw minutowy przy wierceniu (strona producenta)",
    url: "https://www.sandvik.coromant.com/en-us/knowledge/machining-formulas-definitions/drilling-formulas-definitions", accessed: "11/2026",
    internal: "Strona renderowana skryptem, wzory obrazkami; treść (n, vf, fn; prędkość skrawania wiertła z płytkami spada od 100% na obwodzie do zera w osi) potwierdzona wynikiem wyszukiwarki.",
  },
  "sumitomo-wiertla-plytki": {
    id: "sumitomo-wiertla-plytki", short: "Sumitomo Electric — wiertła z płytkami na tokarce", author: "Sumitomo Electric Hardmetal",
    title: "SCI General Catalog 2021–2022 — Indexable Insert Drills WDX Type, Lathe Machining Guidelines",
    edition: "2021–2022",
    url: "https://online.flippingbook.com/view/895750/944", accessed: "11/2026",
    note: "Zalecenia dla wierteł WDX tego producenta; inne wiertła — według ich katalogu.",
  },
  "iscar-wiercenie": {
    id: "iscar-wiercenie", short: "ISCAR — poradnik wiercenia", author: "ISCAR",
    title: "Drilling Handbook — wiertła z płytkami wymiennymi",
    url: "https://www.iscar.com/Catalogs/Publication/english_1/Drilling_Handbook/Drilling_Handbook_flipview/files/basic-html/page102.html", accessed: "11/2026",
  },
  "sandvik-wiercenie-promieniowe": {
    id: "sandvik-wiercenie-promieniowe", short: "Sandvik Coromant — wiercenie z przesunięciem promieniowym", author: "Sandvik Coromant",
    title: "Radial adjusted drilling — zmiana średnicy wiertła z płytkami przez przesunięcie (strona producenta)",
    url: "https://www.sandvik.coromant.com/en-us/knowledge/drilling/radial-adjusted-drilling", accessed: "11/2026",
    internal: "Strona renderowana skryptem; zdania potwierdzone wynikiem wyszukiwarki.",
  },
  "titan-nawiertaki": {
    id: "titan-nawiertaki", short: "Titan USA (Harvey Performance) — nawiertaki", author: "Titan USA, Harvey Performance Company",
    title: "Spot Drills — Carbide: kąty 90°, 120°, 142°; kąt nawiertaka równy kątowi wiertła albo większy (strona producenta)",
    url: "https://www.titancuttingtools.com/products/spot-drills", accessed: "11/2026",
  },
  din333: {
    id: "din333", short: "DIN 333", author: "DIN",
    title: "DIN 333 — Zentrierbohrer 60°; Form R, A und B (nawiertaki do nakiełków 60°, formy R, A i B)",
    edition: "1986-04",
    url: "https://www.din.de/en/wdc-beuth:din21:1284124", accessed: "11/2026",
    internal: "Treści normy nie czytano — tytuł i formy z karty normy w katalogu DIN; forma A bez stożka ochronnego potwierdzona kartą produktu RECA.",
  },
  "reca-din333": {
    id: "reca-din333", short: "RECA — nawiertak DIN 333 forma A", author: "RECA",
    title: "HSS centre drill bit DIN 333 — forma A, kąt 60°, bez stożka ochronnego (karta produktu)",
    url: "https://shop.recanorm.de/Complete-catalogue/HSS-centre-drill-bit-DIN-333/1601CL02_03030601.cyid/1601.cgid/en/US/EUR", accessed: "11/2026",
  },
  "sandvik-typ-gwintownika": {
    id: "sandvik-typ-gwintownika", short: "Sandvik Coromant — wybór rodzaju gwintownika", author: "Sandvik Coromant",
    title: "How to choose the right type of tap — rowki proste, ostrze śrubowe, rowki śrubowe, gwintownik wygniatający (strona producenta)",
    url: "https://www.sandvik.coromant.com/en-gb/knowledge/threading/tapping/how-to-choose-tap-type", accessed: "11/2026",
    internal: "Strona renderowana skryptem; podział na cztery rodzaje i cechy gwintownika wygniatającego potwierdzone wynikiem wyszukiwarki.",
  },
  "seco-gwintowniki": {
    id: "seco-gwintowniki", short: "Seco Tools — gwintowniki", author: "Seco Tools",
    title: "Elevate Thread Quality and Cost Effectiveness with Seco's Experts — rowki, formy nakroju, oprawki (artykuł producenta)",
    url: "https://www.secotools.com/article/124478", accessed: "11/2026",
  },
  "sandvik-frezowanie-gwintow": {
    id: "sandvik-frezowanie-gwintow", short: "Sandvik Coromant — frezowanie gwintów", author: "Sandvik Coromant",
    title: "Thread milling application tips — kierunek obiegu, wejście i wyjście, osie X, Y, Z (strona producenta)",
    url: "https://www.sandvik.coromant.com/en-us/knowledge/threading/thread-milling/application-tips", accessed: "11/2026",
    internal: "Strona renderowana skryptem; zdania potwierdzone wynikiem wyszukiwarki.",
  },
  "iscar-frezowanie-gwintow": {
    id: "iscar-frezowanie-gwintow", short: "ISCAR — poradnik gwintowania, frezowanie gwintów", author: "ISCAR",
    title: "Threading Handbook — Thread Milling: zalety i zasada frezowania gwintów",
    url: "https://iscar.com/Catalogs/flipview/reference-user-guides/Threading_Handbook/files/basic-html/page154.html", accessed: "11/2026",
  },
  "iscar-frez-gwint-program": {
    id: "iscar-frez-gwint-program", short: "ISCAR — program frezowania gwintu wewnętrznego", author: "ISCAR",
    title: "Milling Catalog, User Guide — Thread Milling CNC Program for Internal Thread (gwint prawy, współbieżnie, od dołu)",
    url: "https://iscar.com/Catalogs/flipview/flipview2022/english-1/MILLING-CATALOG-38_2021-p319-548/files/basic-html/page121.html", accessed: "11/2026",
  },
  "cte-frezowanie-gwintow": {
    id: "cte-frezowanie-gwintow", short: "Cutting Tool Engineering — frezowanie gwintów", author: "Cutting Tool Engineering",
    title: "Thread milling, simplified — frezy jedno- i wielozarysowe, interpolacja śrubowa (artykuł)",
    url: "https://ctemag.com/articles/thread-milling-simplified/", accessed: "11/2026",
  },
  "hartner-rozwiertaki": {
    id: "hartner-rozwiertaki", short: "Hartner — katalog rozwiertaków", author: "Hartner",
    title: "Reibahlen / Reamers 2025 — rozwiertaki H7, zalecany naddatek na rozwiercanie (katalog producenta)",
    edition: "2025",
    url: "https://www.hartner.de/wp-content/uploads/2025/12/HAR_Reibahlen_2025_EN_Web.pdf", accessed: "11/2026",
    note: "Naddatki dla rozwiertaków tego producenta; inne narzędzia — według ich katalogu.",
  },
  "sandvik-rozwiercanie": {
    id: "sandvik-rozwiercanie", short: "Sandvik Coromant — rozwiercanie", author: "Sandvik Coromant",
    title: "How to ream a hole — naddatek, otwór wstępny, wejście na skos (strona producenta)",
    url: "https://www.sandvik.coromant.com/en-gb/knowledge/reaming/how-to-ream-a-hole", accessed: "11/2026",
    internal: "Strona renderowana skryptem; zdania potwierdzone wynikiem wyszukiwarki.",
  },
  "sandvik-wytaczanie-zgrubne": {
    id: "sandvik-wytaczanie-zgrubne", short: "Sandvik Coromant — wytaczanie zgrubne", author: "Sandvik Coromant",
    title: "Rough boring — wytaczanie wieloostrzowe, stopniowe i jednoostrzowe (strona producenta)",
    url: "https://www.sandvik.coromant.com/en-gb/knowledge/boring/rough-boring", accessed: "11/2026",
    internal: "Strona renderowana skryptem; zdania potwierdzone wynikiem wyszukiwarki.",
  },
  "sandvik-wytaczanie-dokladne": {
    id: "sandvik-wytaczanie-dokladne", short: "Sandvik Coromant — wytaczanie dokładne", author: "Sandvik Coromant",
    title: "Finish boring — małe głębokości skrawania, nastawa średnicy, kąt przystawienia (strona producenta)",
    url: "https://www.sandvik.coromant.com/en-gb/knowledge/boring/finish-boring", accessed: "11/2026",
    internal: "Strona renderowana skryptem; zdania potwierdzone wynikiem wyszukiwarki.",
  },
  "taylorjones-rozwiertaki": {
    id: "taylorjones-rozwiertaki", short: "Taylor & Jones — rozwiertaki", author: "Taylor & Jones",
    title: "Reamers — Nomenclature and Definitions; Reaming Tips (materiał producenta)",
    url: "https://web.mae.ufl.edu/designlab/Lab%20Resources/ReamingTips.pdf", accessed: "11/2026",
    note: "Wartości jako punkt wyjścia; dane konkretnego rozwiertaka podaje jego katalog.",
    internal: "Kopia materiału producenta na stronie uczelni (University of Florida); wydania nie podano.",
  },
  // V3.1c — noże tokarskie
  "sandvik-jakosc-toczenie": {
    id: "sandvik-jakosc-toczenie", short: "Sandvik Coromant — jakość przy toczeniu", author: "Sandvik Coromant",
    title: "How to achieve good component quality in turning — wiór, kąt przystawienia, chropowatość, płytki wiper (strona producenta)",
    url: "https://www.sandvik.coromant.com/en-gb/knowledge/general-turning/how-to-achieve-good-component-quality-in-turning", accessed: "11/2026",
    internal: "Strona renderowana skryptem; zdania potwierdzone wynikiem wyszukiwarki.",
  },
  "sandvik-toczenie-wewnetrzne": {
    id: "sandvik-toczenie-wewnetrzne", short: "Sandvik Coromant — toczenie wewnętrzne", author: "Sandvik Coromant",
    title: "Internal turning — wysięg, wielkość narzędzia, płytki pozytywowe, kąt przystawienia (strona producenta)",
    url: "https://www.sandvik.coromant.com/en-gb/knowledge/general-turning/internal-turning", accessed: "11/2026",
    internal: "Strona renderowana skryptem; zdania potwierdzone wynikiem wyszukiwarki.",
  },
  "sandvik-wytaczaki-wysieg": {
    id: "sandvik-wytaczaki-wysieg", short: "Sandvik Coromant — wysięg wytaczaków", author: "Sandvik Coromant",
    title: "Turning application guide — największy zalecany wysięg wytaczaków stalowych, węglikowych i tłumionych (strona producenta)",
    url: "https://www.sandvik.coromant.com/en-gb/turning-appl-guide", accessed: "11/2026",
    note: "Wysięg podany jako wielokrotność średnicy trzonka BD; dane konkretnego wytaczaka podaje katalog.",
    internal: "Strona renderowana skryptem; tabela wysięgów potwierdzona wynikiem wyszukiwarki.",
  },
  "mmc-wytaczak-drgania": {
    id: "mmc-wytaczak-drgania", short: "Mitsubishi Materials — drgania wytaczaka", author: "Mitsubishi Materials",
    title: "Basic Turning — kurs e-learningowy producenta, rozdział Vibrations and cutting resistance of boring bars",
    url: "https://www.mmc-carbide.com/permanent/courses/75/vibrations-and-cutting-resistance-of-boring-bars.html", accessed: "11/2026",
  },
  "mmc-wytaczak-dobor": {
    id: "mmc-wytaczak-dobor", short: "Mitsubishi Materials — dobór wytaczaka", author: "Mitsubishi Materials",
    title: "Basic Turning — kurs e-learningowy producenta, rozdział Selecting a boring bar",
    url: "https://www.mmc-carbide.com/permanent/courses/75/selecting-a-boring-bar.html", accessed: "11/2026",
  },
  "mmc-wzory-toczenie": {
    id: "mmc-wzory-toczenie", short: "Mitsubishi Materials — wzory toczenia", author: "Mitsubishi Materials",
    title: "Formula for turning — prędkość skrawania, posuw, czas skrawania, teoretyczna chropowatość (informacja techniczna producenta)",
    url: "https://www.mmc-carbide.com/en_jp/technical_information/formula/tec_turning_formula", accessed: "11/2026",
    note: "Chropowatość teoretyczna — wysokość nierówności z geometrii naroża; zmierzona zależy też od drgań, zużycia i materiału.",
  },
  "sandvik-przecinanie": {
    id: "sandvik-przecinanie", short: "Sandvik Coromant — przecinanie", author: "Sandvik Coromant",
    title: "Parting off — wysięg, wysokość osi, zmniejszenie posuwu przy osi, szerokość płytki (strona producenta)",
    url: "https://www.sandvik.coromant.com/en-gb/knowledge/parting-and-grooving/parting-off", accessed: "11/2026",
    internal: "Strona renderowana skryptem; zdania potwierdzone wynikiem wyszukiwarki (wersje en-gb i en-us).",
  },
  "iscar-przecinanie": {
    id: "iscar-przecinanie", short: "ISCAR — przecinanie, ustawienie płytki", author: "ISCAR",
    title: "Turning catalog (inch) 2022 — Parting user guide: ustawienie płytki, wysokość krawędzi względem osi",
    url: "https://iscar.com/Catalogs/publication-2022/english-1/Turning_catalog_INCH_2022_45/flipview_Turning_catalog_INCH_2022_P509-690/files/basic-html/page87.html", accessed: "11/2026",
    note: "Wartości w calach, dla przecinaków TANG-GRIP.",
  },
  "seco-przecinak-150-10": {
    id: "seco-przecinak-150-10", short: "Seco Tools — system przecinania 150.10", author: "Seco Tools",
    title: "150.10 — Parting-Off: ostrze nożowe ze stali szybkotnącej i oprawka (strona producenta)",
    url: "https://www.secotools.com/article/n150_10___parting_off?language=en", accessed: "11/2026",
  },
  "seco-przecinak-karta": {
    id: "seco-przecinak-karta", short: "Seco Tools — nóż do rowków i przecinania (karta)", author: "Seco Tools",
    title: "Groove and cut-off tool — karta informacyjna: wysokość osi, posuw przy końcu przecinania, chłodziwo",
    url: "https://storage.googleapis.com/ma-static/pdf/1679887-faktablad_c145en_english.pdf", accessed: "11/2026",
    internal: "Karta opisuje „Seco's cut-off tool”; plik na serwerze zewnętrznym, wydawcy (Seco czy dystrybutor) i daty wydania nie potwierdzono.",
  },
  "sandvik-dosuw-gwint": {
    id: "sandvik-dosuw-gwint", short: "Sandvik Coromant — sposób dosuwu przy toczeniu gwintu", author: "Sandvik Coromant",
    title: "How to choose infeed method in thread turning operations — dosuw zmodyfikowany wzdłuż boku, promieniowy, naprzemienny (strona producenta)",
    url: "https://www.sandvik.coromant.com/en-gb/knowledge/threading/thread-turning/how-to-choose-infeed-method-in-thread-turning-operations", accessed: "11/2026",
    internal: "Strona renderowana skryptem; zdania potwierdzone wynikiem wyszukiwarki.",
  },
  "sandvik-plytka-gwint": {
    id: "sandvik-plytka-gwint", short: "Sandvik Coromant — płytka i podkładka do gwintów", author: "Sandvik Coromant",
    title: "How to choose thread turning insert and shim — płytki z pełnym zarysem i V, nachylenie płytki równe kątowi wzniosu (strona producenta)",
    url: "https://www.sandvik.coromant.com/en-gb/knowledge/threading/thread-turning/how-to-choose-thread-turning-insert-and-shim", accessed: "11/2026",
    internal: "Strona renderowana skryptem; zdania potwierdzone wynikiem wyszukiwarki.",
  },
  "sandvik-gwint-wskazowki": {
    id: "sandvik-gwint-wskazowki", short: "Sandvik Coromant — wskazówki do toczenia gwintów", author: "Sandvik Coromant",
    title: "Thread turning application tips — wiór, średnica przed gwintowaniem, gwinty wielokrotne (strona producenta)",
    url: "https://www.sandvik.coromant.com/en-gb/knowledge/threading/thread-turning/thread-turning-application-tips", accessed: "11/2026",
    internal: "Strona renderowana skryptem; zdania potwierdzone wynikiem wyszukiwarki.",
  },
  "iscar-toczenie-gwintow": {
    id: "iscar-toczenie-gwintow", short: "ISCAR — poradnik gwintowania, toczenie gwintów", author: "ISCAR",
    title: "Threading Handbook — sposoby dosuwu (2.11), głębokość i liczba przejść (2.12), kąt wzniosu i podkładki",
    url: "https://iscar.com/Catalogs/flipview/reference-user-guides/Threading_Handbook/files/basic-html/page117.html", accessed: "11/2026",
  },
  "mmc-gwint-metody": {
    id: "mmc-gwint-metody", short: "Mitsubishi Materials — metody toczenia gwintów", author: "Mitsubishi Materials",
    title: "Threading — guide: sposoby dosuwu, głębokość ostatniego przejścia, przykład programu z dosuwem zmodyfikowanym (informacja techniczna producenta)",
    url: "https://www.mmc-carbide.com/us/technical_information/tec_turning_tools/tec_threading/guide/tec_threading_methods", accessed: "11/2026",
  },
  "kennametal-gwint": {
    id: "kennametal-gwint", short: "Kennametal — dane techniczne noży do gwintów", author: "Kennametal",
    title: "Threading Tools, Technical Data (Top Notch) — kąt dosuwu, sposoby dosuwu, głębokość ostatniego przejścia",
    url: "https://www1.mscdirect.com/images/solutions/kennametal/tnThreadingTechData.pdf", accessed: "11/2026",
    note: "Strony katalogu C58–C60.",
    internal: "Wyciąg z katalogu Kennametal na serwerze dystrybutora (MSC); wydania nie podano.",
  },
  "cnccookbook-g76": {
    id: "cnccookbook-g76", short: "CNCCookbook — cykl G76 na tokarce", author: "CNCCookbook",
    title: "G76 Lathe Threading Cycle — kurs G-kodu: zapis dwublokowy Fanuc, kąt w adresie P a kąt dosuwu",
    url: "https://s3.amazonaws.com/s3.cnccookbook.com/CCCNCGCodeG76LatheThreadingCycle.htm", accessed: "11/2026",
    note: "Poradnik, nie instrukcja sterowania; zakres kątów i działanie cyklu podaje instrukcja maszyny.",
  },
  // V3.2a — oznaczenie płytek ISO 1832
  iso1832: {
    id: "iso1832", short: "ISO 1832", author: "ISO",
    title: "ISO 1832:2017 — Indexable inserts for cutting tools — Designation",
    edition: "2017 (wydanie 6), potwierdzona 2022",
    url: "https://www.iso.org/standard/69202.html", accessed: "11/2026",
    note: "Pozycje 1–7 obowiązkowe (rozdz. 5.1–5.7), stan krawędzi i kierunek posuwu opcjonalne (rozdz. 6.2–6.3); wartości tolerancji, wielkości i grubości w tabelach i załącznikach A–B normy.",
    internal: "Tekstu normy nie czytano. Zakres i spis treści: strona ISO i spis treści DIN ISO 1832 udostępniony przez DIN (din.de, plik toc-2649995). Litery i wartości z katalogów producentów (kennametal-plytki-oznaczenie, iscar-poradnik-narzedzia, kyocera-plytki-oznaczenie).",
  },
  "kennametal-plytki-oznaczenie": {
    id: "kennametal-plytki-oznaczenie", short: "Kennametal — system oznaczania płytek", author: "Kennametal",
    title: "Kennametal Milling Insert Identification System — kształt, kąt przyłożenia, klasy tolerancji, otwór i łamacz, grubość, naroże, krawędź (wyciąg katalogu)",
    url: "https://www1.mscdirect.com/images/solutions/kennametal/millingInsertIdSystem.pdf", accessed: "11/2026",
    note: "Strony M28–M31. System oparty na ISO i ANSI; wartości konkretnej płytki podaje jej tabela wymiarów.",
    internal: "Wyciąg katalogu Kennametal na serwerze dystrybutora (MSC); wydania nie podano. Tekst tabel z PDF częściowo rozsypany — przypisanie kolumn tolerancji niepewne, dlatego liczbowych tolerancji nie używamy.",
  },
  "iscar-poradnik-narzedzia": {
    id: "iscar-poradnik-narzedzia", short: "ISCAR — Get to Know Cutting Tools", author: "ISCAR",
    title: "Get to Know Cutting Tools — ISCAR's Reference Guide, rozdział Insert Designation",
    url: "https://www.iscar.com/Catalogs/Publication/english_1/Cutting_tools_user_guide/Cutting_tools_user_guide.pdf", accessed: "11/2026",
    note: "s. 68–70: siedem symboli obowiązkowych, przykład CNMG 120404, oznaczenie łamacza ISCAR (F3P).",
  },
  "mmc-oznaczenie-plytek": {
    id: "mmc-oznaczenie-plytek", short: "Mitsubishi Materials — oznaczenie płytek tokarskich", author: "Mitsubishi Materials",
    title: "Kurs e-learningowy producenta (85), rozdział Insert turning identification code — kąt przyłożenia, klasy tolerancji",
    url: "https://www.mmc-carbide.com/permanent/courses/85/insert-turning-identification-code.html", accessed: "11/2026",
  },
  "kyocera-plytki-oznaczenie": {
    id: "kyocera-plytki-oznaczenie", short: "Kyocera — oznaczenie płytek tokarskich", author: "Kyocera",
    title: "Turning Indexable Inserts Identification System — katalog płytek tokarskich, s. B2",
    url: "https://asia.kyocera.com/products/cuttingtools/wp-content/uploads/2016/11/B.pdf", accessed: "11/2026",
    internal: "Z PDF czytelne tylko kształty i promienie naroża; tabele kątów i tolerancji rozsypane w tekście — nie używane.",
  },
};

/** Opis dokumentu w jednej linii: producent, tytuł, wydanie, numer. */
export function sourceDoc(s: Source): string {
  return [`${s.author}, ${s.title}`, s.edition && `wyd. ${s.edition}`, s.number].filter(Boolean).join(", ");
}
