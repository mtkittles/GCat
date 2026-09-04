import type { Program } from "./types";

export interface Issue { line: number; level: "error" | "warn"; msg: string; }

/** Sprawdzenia programowe wykraczające poza pojedynczy blok. Dialekt: fanuc | sinumerik. */
export function validate(program: Program, dialect: "fanuc" | "sinumerik" = "fanuc"): Issue[] {
  const out: Issue[] = [];
  const L = program.lines;
  let sawToolChange = false, sawG43 = false, sawM30 = false, sawSpindle = false, sawMotion = false;
  let firstCutLine: number | null = null;

  L.forEach((l) => {
    for (const e of l.errors) out.push({ line: l.index, level: "error", msg: e });
    const gs = l.words.filter((w) => w.letter === "G").map((w) => w.value);
    const ms = l.words.filter((w) => w.letter === "M").map((w) => w.value);
    const has = (x: string) => l.words.some((w) => w.letter === x);

    // konflikty grup modalnych w jednym bloku
    const groups: number[][] = [[0, 1, 2, 3], [17, 18, 19], [90, 91], [20, 21], [40, 41, 42], [94, 95], [96, 97], [98, 99]];
    for (const g of groups) { const n = gs.filter((x) => g.includes(x)); if (n.length > 1) out.push({ line: l.index, level: "error", msg: `Dwie funkcje z tej samej grupy w bloku: G${n.join(" G")}.` }); }

    // dialekt
    if (dialect === "sinumerik") {
      if (gs.includes(20) || gs.includes(21)) out.push({ line: l.index, level: "warn", msg: "Sinumerik: jednostki to G70 (cale) / G71 (mm), nie G20/G21." });
      if (gs.includes(28)) out.push({ line: l.index, level: "warn", msg: "Sinumerik nie ma G28 — użyj SUPA G0 Z0 lub G75." });
      if (gs.includes(43)) out.push({ line: l.index, level: "warn", msg: "Sinumerik: długość narzędzia aktywuje T_ D_, nie G43." });
      if (has("R") && (gs.includes(2) || gs.includes(3))) out.push({ line: l.index, level: "warn", msg: "Sinumerik: promień łuku to CR=, nie R." });
    } else {
      if (gs.includes(70) || gs.includes(71)) if (l.state.plane === 17) out.push({ line: l.index, level: "warn", msg: "G70/G71 na frezarce Fanuc to nie jednostki (to cykle tokarskie). Jednostki: G20/G21." });
    }

    if (ms.includes(6)) { sawToolChange = true; sawG43 = false; }
    if (gs.includes(43)) sawG43 = true;
    if (ms.includes(3) || ms.includes(4)) sawSpindle = true;
    if (ms.includes(5)) sawSpindle = false;
    if (ms.includes(30) || ms.includes(2)) sawM30 = true;
    if (gs.some((g) => g <= 3)) sawMotion = true;

    for (const sg of l.segments) {
      if (sg.kind === "rapid" && l.state.plane === 17 && sg.to.z < sg.from.z && sg.to.z < 0)
        out.push({ line: l.index, level: "warn", msg: `G00 w dół do Z${fmt(sg.to.z)} — poniżej zera detalu. Zagłębiaj na G01.` });
      if (sg.kind !== "rapid") {
        if (firstCutLine === null) firstCutLine = l.index;
        if (!sawSpindle) out.push({ line: l.index, level: "warn", msg: "Ruch roboczy przy wyłączonym wrzecionie (brak M03/M04)." });
        if (dialect === "fanuc" && l.state.plane === 17 && sawToolChange && !sawG43) out.push({ line: l.index, level: "warn", msg: "Po wymianie narzędzia brak G43 H_ — długość narzędzia nieaktywna." });
        if (l.state.feed !== null && l.state.feedMode === 94 && l.state.plane === 18 && l.state.feed < 5) out.push({ line: l.index, level: "warn", msg: `Posuw F${l.state.feed} przy G94 (mm/min) wygląda na wartość mm/obr — sprawdź G95.` });
        if (l.state.feed !== null && l.state.feedMode === 95 && l.state.feed > 5) out.push({ line: l.index, level: "warn", msg: `Posuw F${l.state.feed} przy G95 (mm/obr) jest bardzo duży — to nie mm/min?` });
      }
    }
    if (ms.includes(99) && !L.some((x) => x.words.some((w) => w.letter === "O"))) { /* podprogram – ok */ }
  });

  if (L.some((l) => l.words.length) && !sawM30) out.push({ line: L.length - 1, level: "warn", msg: "Brak M30/M02 na końcu programu." });
  if (L.some((l) => l.words.length) && !sawMotion) out.push({ line: 0, level: "warn", msg: "Program nie zawiera żadnego ruchu (G00–G03)." });
  const dedup = new Map<string, Issue>();
  for (const i of out) dedup.set(`${i.line}:${i.msg}`, i);
  return [...dedup.values()].sort((a, b) => a.line - b.line);
}
const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));
