export type ToolKind = "endmill" | "ballnose" | "drill" | "tap" | "turning" | "grooving" | "boring";
export type OriginXY = "corner" | "center";

export interface Tool {
  kind: ToolKind;
  d: number;      // średnica / szerokość ostrza [mm]
  flutes: number; // liczba ostrzy (informacyjnie)
  angle: number;  // kąt wierzchołkowy wiertła lub kąt przystawienia noża [°]
}

export interface Stock {
  auto: boolean;
  // frezowanie
  x: number; y: number; z: number;
  originXY: OriginXY;   // gdzie leży zero detalu w planie
  originZTop: boolean;  // zero Z na górnej powierzchni (true) czy na stole
  // toczenie
  d: number; len: number;
}

export interface Setup { tool: Tool; stock: Stock }

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

export const defaultSetup = (mode: "mill" | "lathe"): Setup => ({
  tool: mode === "mill"
    ? { kind: "endmill", d: 10, flutes: 4, angle: 0 }
    : { kind: "turning", d: 0.8, flutes: 1, angle: 93 },
  stock: { auto: true, x: 100, y: 80, z: 20, originXY: "corner", originZTop: true, d: 60, len: 120 },
});
