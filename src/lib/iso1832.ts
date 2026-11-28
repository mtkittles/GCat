/*
  Oznaczenie płytek wymiennych wg ISO 1832:2017 (płytki tokarskie, zapis metryczny) — dane dekodera <DekoderISO>.
  Pozycje 1–7 obowiązkowe (§5.1–5.7), 8–9 opcjonalne (§6.2 stan krawędzi, §6.3 kierunek posuwu), 10 — oznaczenie
  producenta (łamacz wióra). Źródła w artykule plytki-iso/oznaczenie-plytek-tokarskich (Kennametal M28–M31, ISCAR
  „Get to Know Cutting Tools” s. 68–70, Mitsubishi Materials kurs 85, Kyocera B2, spis treści normy z DIN).
  Liczbowych tolerancji klas nie podajemy — zależą od wielkości płytki (tabela normy i katalog producenta).
*/

export type PozId = "ksztalt" | "przylozenie" | "tolerancja" | "typ" | "wielkosc" | "grubosc" | "naroze" | "krawedz" | "kierunek" | "lamacz";

export interface Pozycja {
  id: PozId;
  nr: number;
  nazwa: string;
  /** czy pozycja jest obowiązkowa w ISO 1832 */
  obowiazkowa: boolean;
  opis: string;
}

export const POZYCJE: Pozycja[] = [
  { id: "ksztalt", nr: 1, nazwa: "Kształt płytki", obowiazkowa: true, opis: "Litera kształtu; przy rombie i równoległoboku kąt naroża to kąt ostry." },
  { id: "przylozenie", nr: 2, nazwa: "Kąt przyłożenia", obowiazkowa: true, opis: "Kąt przyłożenia płytki pod krawędzią skrawającą. N (0°) — płytka negatywowa, inna litera — pozytywowa." },
  { id: "tolerancja", nr: 3, nazwa: "Klasa tolerancji", obowiazkowa: true, opis: "Łączy tolerancje trzech wymiarów: wysokości naroża m, średnicy okręgu wpisanego d i grubości s. Wartości zależą od wielkości płytki." },
  { id: "typ", nr: 4, nazwa: "Mocowanie i łamacz wióra", obowiazkowa: true, opis: "Otwór mocujący (brak, walcowy, z pogłębieniem) i łamacz wióra na jednej albo obu stronach." },
  { id: "wielkosc", nr: 5, nazwa: "Wielkość płytki", obowiazkowa: true, opis: "Długość krawędzi skrawającej w milimetrach, bez części dziesiętnych; przy płytce okrągłej — średnica." },
  { id: "grubosc", nr: 6, nazwa: "Grubość płytki", obowiazkowa: true, opis: "Grubość s jako symbol dwuznakowy; litera T oznacza grubości pośrednie." },
  { id: "naroze", nr: 7, nazwa: "Naroże", obowiazkowa: true, opis: "Promień naroża rε w dziesiątych częściach milimetra; 00 — naroże ostre, M0 — płytka okrągła (zapis metryczny)." },
  { id: "krawedz", nr: 8, nazwa: "Stan krawędzi", obowiazkowa: false, opis: "Opcjonalnie: krawędź ostra, zaokrąglona albo z fazką." },
  { id: "kierunek", nr: 9, nazwa: "Kierunek posuwu", obowiazkowa: false, opis: "Opcjonalnie: płytka prawa, lewa albo neutralna." },
  { id: "lamacz", nr: 10, nazwa: "Oznaczenie producenta", obowiazkowa: false, opis: "Po kresce: łamacz wióra i zastosowanie według systemu producenta, poza normą." },
];

/** 1 — kształt: litera → [nazwa, kąt naroża w stopniach (0 = okrągła)] */
export const KSZTALTY: Record<string, [string, number]> = {
  A: ["równoległobok 85°", 85],
  B: ["równoległobok 82°", 82],
  C: ["romb 80°", 80],
  D: ["romb 55°", 55],
  E: ["romb 75°", 75],
  F: ["romb 50°", 50],
  H: ["sześciokąt", 120],
  K: ["równoległobok 55°", 55],
  L: ["prostokąt", 90],
  M: ["romb 86°", 86],
  O: ["ośmiokąt", 135],
  P: ["pięciokąt", 108],
  R: ["okrągła", 0],
  S: ["kwadrat", 90],
  T: ["trójkąt", 60],
  V: ["romb 35°", 35],
  W: ["trygon, naroża 80°", 80],
};

/** 2 — kąt przyłożenia */
export const PRZYLOZENIA: Record<string, number | null> = { A: 3, B: 5, C: 7, D: 15, E: 20, F: 25, G: 30, N: 0, P: 11, O: null };

/** 3 — klasy tolerancji: A…J szlifowane (płytki „G”), K…U szlifowane tylko powierzchnie górna i dolna (płytki „M”) */
export const TOLERANCJE = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "U"] as const;
export const tolerancjaOpis = (l: string) =>
  "ABCDEFGHJ".includes(l) ? "płytka szlifowana na obwodzie (klasy A–J) — wąskie tolerancje"
    : "KLMNU".includes(l) ? "obwód nieszlifowany, szlifowane tylko powierzchnie górna i dolna (klasy K–U)"
      : "klasa spoza zestawienia";

/** 4 — mocowanie i łamacz: [otwór, łamacz wióra] */
export const TYPY: Record<string, [string, string]> = {
  N: ["bez otworu", "bez łamacza"],
  R: ["bez otworu", "łamacz z jednej strony"],
  F: ["bez otworu", "łamacz z obu stron"],
  A: ["otwór walcowy", "bez łamacza"],
  M: ["otwór walcowy", "łamacz z jednej strony"],
  G: ["otwór walcowy", "łamacz z obu stron"],
  W: ["otwór z pogłębieniem 40–60° z jednej strony", "bez łamacza"],
  T: ["otwór z pogłębieniem 40–60° z jednej strony", "łamacz z jednej strony"],
  Q: ["otwór z pogłębieniem 40–60° z obu stron", "bez łamacza"],
  U: ["otwór z pogłębieniem 40–60° z obu stron", "łamacz z obu stron"],
  B: ["otwór z pogłębieniem 70–90° z jednej strony", "bez łamacza"],
  H: ["otwór z pogłębieniem 70–90° z jednej strony", "łamacz z jednej strony"],
  C: ["otwór z pogłębieniem 70–90° z obu stron", "bez łamacza"],
  J: ["otwór z pogłębieniem 70–90° z obu stron", "łamacz z obu stron"],
  X: ["wykonanie specjalne", "według rysunku producenta"],
};

/** 6 — grubość: symbol → mm (zapis metryczny) */
export const GRUBOSCI: Record<string, number> = { "02": 2.38, "03": 3.18, T3: 3.97, "04": 4.76, "05": 5.56, "06": 6.35, "07": 7.94 };

/** 8 — stan krawędzi (§6.2, §7.2) */
export const KRAWEDZIE: Record<string, string> = {
  F: "krawędź ostra",
  E: "krawędź zaokrąglona",
  T: "krawędź z fazką",
  S: "krawędź z fazką i zaokrąglona",
  K: "krawędź z podwójną fazką",
  P: "krawędź z podwójną fazką i zaokrąglona",
};

/** 9 — kierunek posuwu (§6.3) */
export const KIERUNKI: Record<string, string> = { R: "płytka prawa", L: "płytka lewa", N: "płytka neutralna (do posuwu w obu kierunkach)" };

export interface Znak {
  poz: PozId;
  /** znaki z oznaczenia */
  s: string;
  /** odczyt; null — znak spoza zestawienia */
  odczyt: string | null;
}

export interface Dekod {
  kod: string;
  znaki: Znak[];
  /** błąd zapisu (oznaczenie nie pasuje do wzoru ISO 1832, zapis metryczny) */
  blad?: string;
}

const RE = /^([A-Z])([A-Z])([A-Z])([A-Z])\s*(\d{2})(\d{2}|T\d)(\d{2}|M0)([FETSKP])?([RLN])?(?:\s*-\s*([A-Z0-9]+))?$/;

/** Odczyt oznaczenia, np. „CNMG 120408”, „DCMT 11T304”, „RCMT 0803M0”, „CNMG 120408EN-MP”. */
export function dekoduj(kodWe: string): Dekod {
  const kod = kodWe.trim().toUpperCase().replace(/\s+/g, " ");
  const m = kod.replace(/\s(?=\d)/, "").match(RE);
  if (!m) return { kod, znaki: [], blad: "Oznaczenie nie pasuje do wzoru ISO 1832 (np. CNMG 120408): 4 litery, wielkość, grubość, naroże." };
  const [, k1, k2, k3, k4, k5, k6, k7, k8, k9, k10] = m;
  const sh = KSZTALTY[k1];
  const pr = k2 in PRZYLOZENIA ? PRZYLOZENIA[k2] : undefined;
  const ty = TYPY[k4];
  const g = GRUBOSCI[k6];
  const rr = k7 === "M0" ? "płytka okrągła (bez promienia naroża)" : k7 === "00" ? "naroże ostre" : `promień naroża ${(Number(k7) / 10).toLocaleString("pl-PL")} mm`;
  const znaki: Znak[] = [
    { poz: "ksztalt", s: k1, odczyt: sh ? sh[0] : null },
    { poz: "przylozenie", s: k2, odczyt: pr === undefined ? null : pr === null ? "kąt przyłożenia inny, opisany osobno" : `kąt przyłożenia ${pr}°${pr === 0 ? " — płytka negatywowa" : " — płytka pozytywowa"}` },
    { poz: "tolerancja", s: k3, odczyt: (TOLERANCJE as readonly string[]).includes(k3) ? `klasa ${k3}: ${tolerancjaOpis(k3)}` : null },
    { poz: "typ", s: k4, odczyt: ty ? `${ty[0]}, ${ty[1]}` : null },
    { poz: "wielkosc", s: k5, odczyt: k1 === "R" ? `średnica płytki ${Number(k5)} mm` : `długość krawędzi skrawającej ${Number(k5)},… mm — symbol to jej część całkowita` },
    { poz: "grubosc", s: k6, odczyt: g ? `grubość ${g.toLocaleString("pl-PL")} mm` : null },
    { poz: "naroze", s: k7, odczyt: rr },
  ];
  if (k8) znaki.push({ poz: "krawedz", s: k8, odczyt: KRAWEDZIE[k8] ?? null });
  if (k9) znaki.push({ poz: "kierunek", s: k9, odczyt: KIERUNKI[k9] ?? null });
  if (k10) znaki.push({ poz: "lamacz", s: k10, odczyt: "łamacz wióra według oznaczenia producenta" });
  return { kod, znaki };
}

/** Pozycja po id. */
export const pozycja = (id: PozId) => POZYCJE.find((p) => p.id === id)!;
