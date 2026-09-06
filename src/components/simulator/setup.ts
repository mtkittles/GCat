export type ToolKind =
  | "endmill" | "ballnose" | "bullnose" | "chamfer" | "vbit" | "facemill" | "tslot"
  | "drill" | "spotdrill" | "reamer" | "tap" | "threadmill"
  | "turning" | "grooving" | "boring" | "threading";

export interface Tool {
  kind: ToolKind;
  d: number;         // średnica [mm] (przy nożu tokarskim: promień naroża)
  flutes: number;    // liczba ostrzy; przy gwintowniku i frezie do gwintów — skok
  angle: number;     // kąt wierzchołkowy / fazujący / przystawienia [°]
  corner: number;    // promień naroża freza (bullnose) [mm]
  len: number;       // długość ostrza [mm]
  tiltA: number;     // pochylenie wokół osi X [°]
  tiltB: number;     // pochylenie wokół osi Y [°]
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
export const TOOL_FIELDS: Record<ToolKind, ("d" | "flutes" | "angle" | "corner" | "len")[]> = {
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
  turning: ["d", "angle"],
  grooving: ["d", "len"],
  boring: ["d", "angle"],
  threading: ["d", "angle"],
};

export const FIELD_LABEL: Record<string, { l: string; unit?: string; step?: number; min?: number }> = {
  d: { l: "⌀", unit: "mm", step: 0.5, min: 0.1 },
  flutes: { l: "ostrza", step: 1, min: 1 },
  angle: { l: "kąt", unit: "°", step: 1, min: 1 },
  corner: { l: "R naroża", unit: "mm", step: 0.1, min: 0 },
  len: { l: "dł. ostrza", unit: "mm", step: 1, min: 1 },
};

export const MILL_TOOLS: ToolKind[] = ["endmill", "ballnose", "bullnose", "chamfer", "vbit", "facemill", "tslot", "drill", "spotdrill", "reamer", "tap", "threadmill"];
export const LATHE_TOOLS: ToolKind[] = ["turning", "grooving", "boring", "threading"];

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
  turning: { d: 0.8, angle: 93 },
  grooving: { d: 3, len: 3 },
  boring: { d: 0.4, angle: 95 },
  threading: { d: 0.2, angle: 60 },
};

export const makeTool = (kind: ToolKind): Tool => ({ ...BASE, kind, ...PRESETS[kind] });
export const defaultTool = (mode: "mill" | "lathe"): Tool => makeTool(mode === "mill" ? "endmill" : "turning");

export const defaultSetup = (mode: "mill" | "lathe"): Setup => ({
  tools: { 1: defaultTool(mode) },
  stock: { auto: true, x: 100, y: 80, z: 20, ox: 0, oy: 0, oz: 20, d: 60, len: 120 },
});

export function withProgramTools(setup: Setup, used: number[], mode: "mill" | "lathe"): Setup {
  const missing = used.filter((t) => !(t in setup.tools));
  if (!missing.length) return setup;
  const tools = { ...setup.tools };
  for (const t of missing) tools[t] = defaultTool(mode);
  return { ...setup, tools };
}

export const toolOf = (setup: Setup, t: number | null, mode: "mill" | "lathe"): Tool =>
  (t !== null && setup.tools[t]) || setup.tools[Object.keys(setup.tools).map(Number).sort((a, b) => a - b)[0]] || defaultTool(mode);

export const isLatheTool = (k: ToolKind) => k === "turning" || k === "grooving" || k === "boring" || k === "threading";

/** Efektywny promień skrawania używany do ubytku materiału. */
export const cuttingRadius = (t: Tool) => (isLatheTool(t.kind) ? 3 : t.d / 2);
