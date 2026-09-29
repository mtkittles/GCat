export type ToolKind =
  | "endmill" | "ballnose" | "bullnose" | "chamfer" | "vbit" | "facemill" | "tslot"
  | "drill" | "spotdrill" | "reamer" | "tap" | "threadmill"
  | "turning" | "grooving" | "boring" | "threading";

/** Kształt płytki tokarskiej wg ISO: litera i kąt naroża. */
export type InsertShape = "C" | "D" | "V" | "T" | "W" | "S";
export const INSERT_ANGLE: Record<InsertShape, number> = { C: 80, D: 55, V: 35, T: 60, W: 80, S: 90 };
export const INSERT_LABEL: Record<InsertShape, string> = { C: "C — romb 80°", D: "D — romb 55°", V: "V — romb 35°", T: "T — trójkąt 60°", W: "W — trygon 80°", S: "S — kwadrat 90°" };

export interface Tool {
  kind: ToolKind;
  d: number;         // średnica [mm] (przy nożu tokarskim: promień naroża)
  flutes: number;    // liczba ostrzy; przy gwintowniku i frezie do gwintów — skok
  angle: number;     // kąt wierzchołkowy / fazujący / przystawienia [°]
  corner: number;    // promień naroża freza (bullnose) [mm]
  len: number;       // długość ostrza [mm]
  tiltA: number;     // pochylenie wokół osi X [°]
  tiltB: number;     // pochylenie wokół osi Y [°]
  tip?: number;      // nóż tokarski: kierunek ostrza 0–9 (położenie punktu P względem środka naroża)
  shape?: InsertShape; // nóż tokarski: kształt płytki wg ISO (C, D, V, T, W, S)
  name?: string;
}

export interface Stock {
  auto: boolean;
  x: number; y: number; z: number;
  ox: number; oy: number; oz: number;
  d: number; len: number;
}

export interface Setup { tools: Record<number, Tool>; stock: Stock }

export const TOOL_LABEL: Record<ToolKind, string> = {
  endmill: "Frez walcowy",
  ballnose: "Frez kulisty",
  bullnose: "Frez z naroża promieniowym",
  chamfer: "Frez do faz",
  vbit: "Frez grawerski (V)",
  facemill: "Głowica frezowa",
  tslot: "Frez do rowków T",
  drill: "Wiertło",
  spotdrill: "Nawiertak",
  reamer: "Rozwiertak",
  tap: "Gwintownik",
  threadmill: "Frez do gwintów",
  turning: "Nóż tokarski",
  grooving: "Nóż do rowków",
  boring: "Wytaczak",
  threading: "Nóż do gwintów",
};

/** Które pola mają sens dla danego narzędzia. */
export const TOOL_FIELDS: Record<ToolKind, ("d" | "flutes" | "angle" | "corner" | "len" | "tip" | "shape")[]> = {
  endmill: ["d", "flutes", "len"],
  ballnose: ["d", "flutes", "len"],
  bullnose: ["d", "corner", "flutes", "len"],
  chamfer: ["d", "angle", "flutes"],
  vbit: ["d", "angle", "flutes"],
  facemill: ["d", "flutes"],
  tslot: ["d", "len", "flutes"],
  drill: ["d", "angle", "len"],
  spotdrill: ["d", "angle"],
  reamer: ["d", "flutes", "len"],
  tap: ["d", "flutes"],
  threadmill: ["d", "flutes", "len"],
  turning: ["d", "tip", "angle", "shape"],
  grooving: ["d", "len"],
  boring: ["d", "tip", "angle", "shape"],
  threading: ["d", "tip", "angle"],
};

export const FIELD_LABEL: Record<string, { l: string; unit?: string; step?: number; min?: number }> = {
  d: { l: "⌀", unit: "mm", step: 0.5, min: 0.1 },
  flutes: { l: "ostrza", step: 1, min: 1 },
  angle: { l: "kąt", unit: "°", step: 1, min: 1 },
  corner: { l: "R naroża", unit: "mm", step: 0.1, min: 0 },
  len: { l: "dł. ostrza", unit: "mm", step: 1, min: 1 },
  tip: { l: "kier. ostrza", step: 1, min: 0 },
  shape: { l: "płytka" },
};

export const MILL_TOOLS: ToolKind[] = ["endmill", "ballnose", "bullnose", "chamfer", "vbit", "facemill", "tslot", "drill", "spotdrill", "reamer", "tap", "threadmill"];
export const LATHE_TOOLS: ToolKind[] = ["turning", "grooving", "boring", "threading", "drill"];

const BASE: Omit<Tool, "kind"> = { d: 10, flutes: 4, angle: 118, corner: 0, len: 30, tiltA: 0, tiltB: 0 };

const PRESETS: Partial<Record<ToolKind, Partial<Tool>>> = {
  ballnose: { d: 10, flutes: 2 },
  bullnose: { d: 12, corner: 1.5, flutes: 4 },
  chamfer: { d: 10, angle: 90, flutes: 2 },
  vbit: { d: 6, angle: 60, flutes: 1 },
  facemill: { d: 50, flutes: 5 },
  tslot: { d: 20, len: 6, flutes: 4 },
  drill: { d: 8, angle: 118, len: 60 },
  spotdrill: { d: 10, angle: 90 },
  reamer: { d: 8, flutes: 6, len: 40 },
  tap: { d: 10, flutes: 1.5 },
  threadmill: { d: 8, flutes: 1.5, len: 20 },
  turning: { d: 0.8, angle: 93, tip: 3 },
  grooving: { d: 3, len: 3 },
  boring: { d: 0.4, angle: 95, tip: 2 },
  threading: { d: 0.2, angle: 60 },
};

export const makeTool = (kind: ToolKind): Tool => ({ ...BASE, kind, ...PRESETS[kind] });
export const defaultTool = (mode: "mill" | "lathe"): Tool => makeTool(mode === "mill" ? "endmill" : "turning");

export const defaultSetup = (mode: "mill" | "lathe"): Setup => ({
  tools: { 1: defaultTool(mode) },
  stock: { auto: true, x: 100, y: 80, z: 20, ox: 0, oy: 0, oz: 20, d: 60, len: 120 },
});

/**
 * Narzędzie odczytane z komentarza przy wywołaniu, np. `T1 M06 (FREZ FI10)`,
 * `T0303 (NOZ DO ROWKOW 3MM)`, `T0505 (WIERTLO FI8)`. Null, gdy komentarz nic nie mówi.
 */
export function inferTool(comment: string | undefined, mode: "mill" | "lathe"): Tool | null {
  if (!comment) return null;
  const c = comment.toUpperCase();
  const num = (re: RegExp) => { const m = c.match(re); return m ? Number(m[1].replace(",", ".")) : undefined; };
  const fi = num(/(?:FI|Ø|⌀)\s*(\d+(?:[.,]\d+)?)/);
  const deg = num(/(\d+)\s*(?:ST\b|°)/);
  if (mode === "lathe") {
    if (/WIERT|DRILL/.test(c)) return { ...makeTool("drill"), d: fi ?? 8, angle: deg ?? 118 };
    if (/ROWK|GROOV|PRZECIN/.test(c)) return { ...makeTool("grooving"), d: num(/(\d+(?:[.,]\d+)?)\s*MM/) ?? 3 };
    if (/GWINT|THREAD/.test(c)) return { ...makeTool("threading"), angle: deg ?? 60, ...(/WEWN|INTERN/.test(c) ? { tip: 6 } : {}) };
    const r = num(/\bR\s*(\d+(?:[.,]\d+)?)/);
    // kod ISO płytki, np. CNMG 120408, VBMT 160404: pierwsza litera to kształt, ostatnie cyfry — promień naroża
    const iso = c.match(/\b([CDVTWS])[A-Z]{2}[A-Z]?\s*(\d{2})(\d{2})(\d{2})\b/) ?? c.match(/\b([CDVTWS])[NBC][MG][GTAX]\b/);
    const shape = iso ? (iso[1] as InsertShape) : undefined;
    const rIso = iso && iso[4] ? Number(iso[4]) / 10 : undefined;
    if (/WYTACZ|BORING/.test(c)) return { ...makeTool("boring"), d: r ?? rIso ?? 0.4, ...(shape ? { shape } : {}) };
    if (/NOZ|NÓŻ|TURN/.test(c) || iso) return { ...makeTool("turning"), d: r ?? rIso ?? 0.8, ...(shape ? { shape } : {}) };
    return null;
  }
  if (/GWINTOWNIK|\bTAP\b/.test(c)) {
    const m = c.match(/M(\d+(?:[.,]\d+)?)\s*[X×]\s*(\d+(?:[.,]\d+)?)/);
    return { ...makeTool("tap"), d: m ? Number(m[1].replace(",", ".")) : fi ?? 10, flutes: m ? Number(m[2].replace(",", ".")) : 1.5 };
  }
  if (/NAWIERT|SPOT/.test(c)) return { ...makeTool("spotdrill"), d: fi ?? 10, angle: deg ?? 90 };
  if (/WIERT|DRILL/.test(c)) return { ...makeTool("drill"), d: fi ?? 8, angle: deg ?? 118 };
  if (/GLOWIC|GŁOWIC|FACE/.test(c)) return { ...makeTool("facemill"), d: fi ?? 50 };
  if (/KULIST|BALL/.test(c)) return { ...makeTool("ballnose"), d: fi ?? 10 };
  if (/FREZ|MILL/.test(c)) return { ...makeTool("endmill"), d: fi ?? 10 };
  return null;
}

export function withProgramTools(setup: Setup, used: number[], mode: "mill" | "lathe", comments: Record<number, string> = {}): Setup {
  // brakujące narzędzia, a także nietknięte narzędzie domyślne, jeśli komentarz mówi coś innego
  const untouched = (t: number) => JSON.stringify(setup.tools[t]) === JSON.stringify(defaultTool(mode));
  const missing = used.filter((t) => !(t in setup.tools) || (untouched(t) && inferTool(comments[t], mode) !== null));
  if (!missing.length) return setup;
  const tools = { ...setup.tools };
  for (const t of missing) tools[t] = inferTool(comments[t], mode) ?? defaultTool(mode);
  return { ...setup, tools };
}

export const toolOf = (setup: Setup, t: number | null, mode: "mill" | "lathe"): Tool =>
  (t !== null && setup.tools[t]) || setup.tools[Object.keys(setup.tools).map(Number).sort((a, b) => a - b)[0]] || defaultTool(mode);

export const isLatheTool = (k: ToolKind) => k === "turning" || k === "grooving" || k === "boring" || k === "threading";

/** Efektywny promień skrawania używany do ubytku materiału. */
export const cuttingRadius = (t: Tool) => (isLatheTool(t.kind) ? 3 : t.d / 2);
