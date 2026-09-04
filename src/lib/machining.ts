export interface MaterialPreset {
  id: string; name: string; group: "P" | "M" | "K" | "N" | "S" | "H";
  vcMill: [number, number];  // zakres Vc dla frezowania węglikiem [m/min]
  vcTurn: [number, number];
  vcDrill: [number, number];
  fz: [number, number];      // posuw na ostrze dla freza ⌀10 [mm]
  fTurn: [number, number];   // posuw na obrót przy toczeniu [mm/obr]
  kc: number;                // właściwy opór skrawania kc1.1 [N/mm²]
  note?: string;
}

export const GROUPS: Record<string, string> = {
  P: "Stal", M: "Stal nierdzewna", K: "Żeliwo", N: "Metale nieżelazne", S: "Stopy trudnoobrabialne", H: "Materiały twarde",
};

export const MATERIALS: MaterialPreset[] = [
  { id: "s235", name: "Stal konstrukcyjna S235 / St3", group: "P", vcMill: [140, 250], vcTurn: [180, 300], vcDrill: [25, 45], fz: [0.04, 0.12], fTurn: [0.15, 0.4], kc: 1500 },
  { id: "c45", name: "Stal C45 (1.0503)", group: "P", vcMill: [120, 200], vcTurn: [150, 260], vcDrill: [20, 35], fz: [0.04, 0.1], fTurn: [0.15, 0.35], kc: 1700 },
  { id: "42crmo4", name: "Stal stopowa 42CrMo4 ulepszana", group: "P", vcMill: [90, 160], vcTurn: [110, 200], vcDrill: [15, 28], fz: [0.03, 0.08], fTurn: [0.12, 0.3], kc: 1950 },
  { id: "16mncr5", name: "Stal do nawęglania 16MnCr5", group: "P", vcMill: [110, 190], vcTurn: [140, 240], vcDrill: [20, 32], fz: [0.04, 0.1], fTurn: [0.15, 0.35], kc: 1750 },
  { id: "304", name: "Stal nierdzewna 1.4301 (304)", group: "M", vcMill: [70, 130], vcTurn: [90, 170], vcDrill: [12, 22], fz: [0.03, 0.08], fTurn: [0.12, 0.3], kc: 2000, note: "Skłonna do umocnienia — nie schodź poniżej zakresu i nie pracuj bez chłodzenia." },
  { id: "316", name: "Stal nierdzewna 1.4404 (316L)", group: "M", vcMill: [60, 110], vcTurn: [80, 150], vcDrill: [10, 20], fz: [0.03, 0.07], fTurn: [0.1, 0.28], kc: 2100 },
  { id: "duplex", name: "Stal duplex 1.4462", group: "M", vcMill: [40, 80], vcTurn: [60, 110], vcDrill: [8, 15], fz: [0.03, 0.06], fTurn: [0.1, 0.25], kc: 2400 },
  { id: "gg25", name: "Żeliwo szare GJL-250", group: "K", vcMill: [150, 300], vcTurn: [180, 350], vcDrill: [30, 60], fz: [0.06, 0.2], fTurn: [0.2, 0.5], kc: 1150, note: "Zwykle na sucho — przerywane chłodzenie węglika powoduje mikropęknięcia." },
  { id: "ggg50", name: "Żeliwo sferoidalne GJS-500", group: "K", vcMill: [110, 220], vcTurn: [140, 260], vcDrill: [22, 40], fz: [0.05, 0.15], fTurn: [0.18, 0.45], kc: 1450 },
  { id: "alsi", name: "Aluminium AlSi (odlewnicze)", group: "N", vcMill: [300, 800], vcTurn: [350, 900], vcDrill: [60, 140], fz: [0.06, 0.2], fTurn: [0.1, 0.4], kc: 700 },
  { id: "al6061", name: "Aluminium 6061 / AW-6082", group: "N", vcMill: [400, 1000], vcTurn: [450, 1000], vcDrill: [70, 160], fz: [0.08, 0.25], fTurn: [0.1, 0.45], kc: 600, note: "Ograniczeniem są zwykle obroty wrzeciona, nie materiał." },
  { id: "brass", name: "Mosiądz CuZn39Pb3", group: "N", vcMill: [200, 500], vcTurn: [250, 600], vcDrill: [50, 110], fz: [0.05, 0.18], fTurn: [0.1, 0.4], kc: 800 },
  { id: "copper", name: "Miedź Cu-ETP", group: "N", vcMill: [150, 400], vcTurn: [180, 450], vcDrill: [40, 90], fz: [0.05, 0.15], fTurn: [0.1, 0.35], kc: 900 },
  { id: "ti64", name: "Tytan Ti-6Al-4V", group: "S", vcMill: [35, 70], vcTurn: [40, 80], vcDrill: [8, 18], fz: [0.03, 0.08], fTurn: [0.1, 0.25], kc: 1400, note: "Niska przewodność cieplna — ciepło zostaje w ostrzu. Chłodzenie obfite, posuw nie za mały." },
  { id: "inconel", name: "Inconel 718", group: "S", vcMill: [20, 45], vcTurn: [25, 55], vcDrill: [5, 12], fz: [0.02, 0.06], fTurn: [0.08, 0.2], kc: 2600, note: "Silne umocnienie. Stały posuw, ostrze zawsze pod materiałem." },
  { id: "hardened", name: "Stal hartowana 45–55 HRC", group: "H", vcMill: [40, 90], vcTurn: [60, 140], vcDrill: [5, 12], fz: [0.02, 0.06], fTurn: [0.05, 0.15], kc: 2800, note: "Płytki CBN lub ceramika; węglik tylko przy małym naddatku." },
];

/** Współczynnik korekcyjny Vc dla materiału narzędzia. */
export const TOOL_MATERIAL: { id: string; name: string; f: number }[] = [
  { id: "hss", name: "HSS (stal szybkotnąca)", f: 0.35 },
  { id: "hsscо", name: "HSS-Co (kobaltowa)", f: 0.45 },
  { id: "carbide", name: "Węglik z powłoką", f: 1 },
  { id: "carbide_un", name: "Węglik bez powłoki", f: 0.75 },
  { id: "cermet", name: "Cermet", f: 1.25 },
  { id: "ceramic", name: "Ceramika", f: 3 },
];

/** Gwinty metryczne podstawowe: [skok, otwór pod gwintownik, średnica pod gwint zewnętrzny] */
export const THREADS: { name: string; pitch: number; drill: number; outer: number }[] = [
  { name: "M3", pitch: 0.5, drill: 2.5, outer: 2.9 },
  { name: "M4", pitch: 0.7, drill: 3.3, outer: 3.9 },
  { name: "M5", pitch: 0.8, drill: 4.2, outer: 4.9 },
  { name: "M6", pitch: 1.0, drill: 5.0, outer: 5.9 },
  { name: "M8", pitch: 1.25, drill: 6.8, outer: 7.9 },
  { name: "M10", pitch: 1.5, drill: 8.5, outer: 9.85 },
  { name: "M12", pitch: 1.75, drill: 10.2, outer: 11.85 },
  { name: "M14", pitch: 2.0, drill: 12.0, outer: 13.85 },
  { name: "M16", pitch: 2.0, drill: 14.0, outer: 15.85 },
  { name: "M20", pitch: 2.5, drill: 17.5, outer: 19.8 },
  { name: "M24", pitch: 3.0, drill: 21.0, outer: 23.8 },
  { name: "M30", pitch: 3.5, drill: 26.5, outer: 29.8 },
];

export const mid = (r: [number, number]) => (r[0] + r[1]) / 2;
