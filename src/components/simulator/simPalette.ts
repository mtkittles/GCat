/*
  Paleta kanwy 2D. Ciemny motyw: ciemne pole jak dotąd. Jasny (UI-9): papier techniczny (--paper, simTheme.ts)
  i ciemniejsze odcienie tych samych barw — linie i opisy nie zlewają się z kremowym tłem.
  Simulator.tsx trzyma paletę bieżącą (COLORS) i przepisuje do niej SIM_DARK albo SIM_LIGHT przy rysowaniu.
*/
export const SIM_DARK = {
  rapid: "#F59E0B",   // szybki przejazd
  linear: "#22C55E",  // ruch roboczy
  arc: "#38BDF8",     // interpolacja kołowa
  dwell: "#F97316",   // postój (G04) — bez ruchu, rysowany osobnym znacznikiem
  grid: "rgba(255,255,255,0.06)",
  axis: "rgba(255,255,255,0.22)",
  tool: "#FFFFFF",
  stock: "rgba(255,255,255,0.04)",
  stockEdge: "rgba(255,255,255,0.14)",
  gridMinor: "rgba(148,163,184,0.09)", center: "rgba(255,255,255,0.35)", flat: "rgba(148,163,184,0.20)", frame: "rgba(148,163,184,0.45)",
  latheFill: "rgba(148,163,184,0.24)", latheFillIn: "rgba(148,163,184,0.10)", latheEdge: "rgba(203,213,225,0.6)", latheEdgeIn: "rgba(203,213,225,0.25)",
  chuckFill: "rgba(100,116,139,0.55)", chuckEdge: "rgba(203,213,225,0.55)", label: "rgba(203,213,225,0.75)",
  trace: "rgba(249,115,22,0.12)", dashLight: "rgba(248,250,252,0.5)", faint: "rgba(255,255,255,0.18)",
  /** cel zadania (obszar obróbki wzorca) — fiolet toru wzorcowego, mocno przygaszony */
  refGhost: "rgba(167,139,250,0.22)", refFill: "rgba(167,139,250,0.55)", ref: "rgba(167,139,250,0.9)",
  hudText: "rgba(248,250,252,0.9)", hudMuted: "rgba(148,163,184,0.85)", zero: "#F97316",
  holderFill: "rgba(71,85,105,0.55)", holderEdge: "rgba(148,163,184,0.7)", insertFill: "rgba(202,160,40,0.55)", insertEdge: "#F5D76E", toolFill: "rgba(248,250,252,0.10)",
  probe: "rgba(90,169,240,0.9)", probeDot: "#5AA9F0", hudBg: "rgba(5,7,10,0.85)", hudBg2: "rgba(5,7,10,0.72)",
  dro0: "#F8FAFC", dro1: "#F97316", dro2: "#94A3B8", mLine: "rgba(249,115,22,0.4)", mEdge: "rgba(249,115,22,0.55)",
};
export const SIM_LIGHT: typeof SIM_DARK = {
  rapid: "#B45309", linear: "#15803D", arc: "#0369A1", dwell: "#C2410C",
  grid: "rgba(28,25,23,0.10)", axis: "rgba(28,25,23,0.55)", tool: "#1C1917", stock: "rgba(28,25,23,0.05)", stockEdge: "rgba(28,25,23,0.35)",
  gridMinor: "rgba(120,100,70,0.12)", center: "rgba(28,25,23,0.45)", flat: "rgba(87,83,78,0.18)", frame: "rgba(87,83,78,0.5)",
  latheFill: "rgba(87,83,78,0.22)", latheFillIn: "rgba(87,83,78,0.10)", latheEdge: "rgba(28,25,23,0.6)", latheEdgeIn: "rgba(28,25,23,0.3)",
  chuckFill: "rgba(87,83,78,0.45)", chuckEdge: "rgba(28,25,23,0.55)", label: "rgba(28,25,23,0.75)",
  trace: "rgba(194,65,12,0.14)", dashLight: "rgba(28,25,23,0.5)", faint: "rgba(28,25,23,0.2)",
  refGhost: "rgba(109,40,217,0.14)", refFill: "rgba(109,40,217,0.35)", ref: "rgba(109,40,217,0.85)",
  hudText: "#1C1917", hudMuted: "#57534E", zero: "#C2410C",
  holderFill: "rgba(87,83,78,0.35)", holderEdge: "rgba(28,25,23,0.6)", insertFill: "rgba(161,98,7,0.35)", insertEdge: "#A16207", toolFill: "rgba(28,25,23,0.06)",
  probe: "rgba(29,78,216,0.85)", probeDot: "#1D4ED8", hudBg: "rgba(255,252,245,0.94)", hudBg2: "rgba(255,252,245,0.88)",
  dro0: "#1C1917", dro1: "#C2410C", dro2: "#57534E", mLine: "rgba(194,65,12,0.5)", mEdge: "rgba(194,65,12,0.6)",
};
