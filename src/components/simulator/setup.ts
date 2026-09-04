export type ToolKind = "endmill" | "ballnose" | "drill" | "tap" | "turning" | "grooving" | "boring";

export interface Tool {
  kind: ToolKind;
  d: number;      // średnica freza/wiertła lub promień naroża noża [mm]
  flutes: number;
  angle: number;  // kąt wierzchołkowy wiertła lub kąt przystawienia noża [°]
  name?: string;
}

export interface Stock {
  auto: boolean;
  x: number; y: number; z: number;   // wymiary półfabrykatu (frezowanie)
  ox: number; oy: number; oz: number; // położenie zera detalu względem lewego dolnego narożnika i podstawy
  d: number; len: number;             // ⌀ i długość (toczenie)
}

export interface Setup {
  tools: Record<number, Tool>;
  stock: Stock;
}

export const TOOL_LABEL: Record<ToolKind, string> = {
  endmill: "Frez walcowy",
  ballnose: "Frez kulisty",
  drill: "Wiertło",
  tap: "Gwintownik",
  turning: "Nóż tokarski",
  grooving: "Nóż do rowków",
  boring: "Wytaczak",
};

export const MILL_TOOLS: ToolKind[] = ["endmill", "ballnose", "drill", "tap"];
export const LATHE_TOOLS: ToolKind[] = ["turning", "grooving", "boring"];

export const defaultTool = (mode: "mill" | "lathe"): Tool =>
  mode === "mill"
    ? { kind: "endmill", d: 10, flutes: 4, angle: 118 }
    : { kind: "turning", d: 0.8, flutes: 1, angle: 93 };

export const defaultSetup = (mode: "mill" | "lathe"): Setup => ({
  tools: { 1: defaultTool(mode) },
  stock: { auto: true, x: 100, y: 80, z: 20, ox: 0, oy: 0, oz: 20, d: 60, len: 120 },
});

/** Uzupełnia tabelę o narzędzia użyte w programie, zachowując już ustawione. */
export function withProgramTools(setup: Setup, used: number[], mode: "mill" | "lathe"): Setup {
  const missing = used.filter((t) => !(t in setup.tools));
  if (!missing.length) return setup;
  const tools = { ...setup.tools };
  for (const t of missing) tools[t] = defaultTool(mode);
  return { ...setup, tools };
}

export const toolOf = (setup: Setup, t: number | null, mode: "mill" | "lathe"): Tool =>
  (t !== null && setup.tools[t]) || setup.tools[Object.keys(setup.tools).map(Number).sort((a, b) => a - b)[0]] || defaultTool(mode);

export const isLatheTool = (k: ToolKind) => k === "turning" || k === "grooving" || k === "boring";
