import { segmentLength, type Program, type Segment } from "./index";

export interface ToolStat {
  tool: number;
  seconds: number;
  cutLength: number;   // droga robocza [mm]
  rapidLength: number; // droga jałowa [mm]
  minZ: number;
  blocks: number;
}

export interface ProgramStats {
  seconds: number;
  cutLength: number;
  rapidLength: number;
  blocks: number;
  moves: number;
  arcs: number;
  cycles: number;
  bounds: { min: { x: number; y: number; z: number }; max: { x: number; y: number; z: number } };
  tools: ToolStat[];
  feeds: { min: number; max: number } | null;
  spindle: { min: number; max: number } | null;
}

const segSeconds = (sg: Segment, program: Program, rapidRate = 20000) => {
  const len = segmentLength(sg);
  if (sg.kind === "rapid") return (len / rapidRate) * 60;
  const l = program.lines[sg.line];
  let f = l?.state.feed ?? 200;
  if (l?.state.feedMode === 95) f *= l.state.spindle ?? 1000;
  return (len / Math.max(1, f)) * 60;
};

/** Podsumowanie programu: czas, drogi, zakresy i rozbicie na narzędzia. */
export function computeStats(program: Program): ProgramStats {
  const perTool = new Map<number, ToolStat>();
  let cutLength = 0, rapidLength = 0, seconds = 0, arcs = 0;
  const feeds: number[] = [], spins: number[] = [];

  for (const sg of program.segments) {
    const len = segmentLength(sg);
    const t = program.lines[sg.line]?.state.tool ?? 1;
    const secs = segSeconds(sg, program);
    seconds += secs;
    if (sg.kind === "rapid") rapidLength += len; else cutLength += len;
    if (sg.kind === "arc") arcs++;

    const st = perTool.get(t) ?? { tool: t, seconds: 0, cutLength: 0, rapidLength: 0, minZ: 0, blocks: 0 };
    st.seconds += secs;
    if (sg.kind === "rapid") st.rapidLength += len; else st.cutLength += len;
    st.minZ = Math.min(st.minZ, sg.to.z, sg.from.z);
    perTool.set(t, st);
  }

  let blocks = 0, cycles = 0;
  for (const l of program.lines) {
    if (!l.words.length) continue;
    blocks++;
    const t = l.state.tool ?? 1;
    const st = perTool.get(t);
    if (st) st.blocks++;
    if (l.words.some((w) => w.letter === "G" && [73, 81, 82, 83, 84, 85, 86, 89].includes(w.value))) cycles++;
    if (l.state.feed) feeds.push(l.state.feed);
    if (l.state.spindle) spins.push(l.state.spindle);
  }

  return {
    seconds, cutLength, rapidLength, blocks,
    moves: program.segments.length, arcs, cycles,
    bounds: program.bounds,
    tools: [...perTool.values()].sort((a, b) => a.tool - b.tool),
    feeds: feeds.length ? { min: Math.min(...feeds), max: Math.max(...feeds) } : null,
    spindle: spins.length ? { min: Math.min(...spins), max: Math.max(...spins) } : null,
  };
}
