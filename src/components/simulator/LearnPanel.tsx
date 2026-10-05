"use client";
import { activeOffset, frameShift, wcsLabel, type MachineState, type ParsedLine, type Program } from "@/lib/parser";

/*
  Tryb nauki: dla wykonywanego bloku pokazuje, co się zmieniło w stanie maszyny
  (grupy modalne, posuw, obroty, narzędzie), skąd dokąd jedzie oś i co blok znaczy po polsku.
  Dane pochodzą z parsera — stan przed blokiem to stan po poprzednim wykonanym bloku.
*/
type Row = { label: string; before: string; after: string };
const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(3).replace(/0+$/, "").replace(/\.$/, ""));
const vz = (v: { x: number; y: number; z: number }) => Math.abs(v.x) < 1e-9 && Math.abs(v.y) < 1e-9 && Math.abs(v.z) < 1e-9;
/** Kierunek osi Z płaszczyzny pochylonej w układzie detalu, np. „(0, -1, 0)”. */
const vecN = (m: readonly number[]) => `(${[m[2], m[5], m[8]].map((v) => fmt(Math.round(v * 1000) / 1000)).join(", ")})`;
const vec = (v: { x: number; y: number; z: number }, dia: boolean) => dia ? `X${fmt(v.x * 2)} Z${fmt(v.z)}` : `X${fmt(v.x)} Y${fmt(v.y)} Z${fmt(v.z)}`;

function describe(s: MachineState | undefined, dia: boolean): Record<string, string> {
  if (!s) return {};
  return {
    "Ruch": s.motion === null ? "—" : `G0${s.motion}`,
    "Wymiary": s.absolute ? "G90" : "G91",
    "Płaszczyzna": `G${s.plane}`,
    "Jednostki": s.units === "mm" ? "G21 mm" : "G20 cal",
    "Układ": `${wcsLabel(s)}${vz(activeOffset(s)) ? "" : ` (${vec(activeOffset(s), dia)})`}`,
    ...(vz(s.local) ? {} : { "G52 lokalne": vec(s.local, dia) }),
    ...(vz(s.shift) ? {} : { "G92 przesunięcie": vec(s.shift, dia) }),
    ...(vz(s.frame) ? {} : { "TRANS": vec(s.frame, dia) }),
    ...(vz(frameShift(s)) ? {} : { "Zero programu w maszynie": vec(frameShift(s), dia) }),
    "Korekcja R": `G${s.comp}`,
    "Posuw": s.feed === null ? "—" : `F${fmt(s.feed)} ${s.feedMode === 95 ? "mm/obr" : "mm/min"}`,
    "Obroty": s.spindle === null ? "—" : `S${fmt(s.spindle)}${s.css ? " (G96 m/min)" : ""}`,
    "Wrzeciono": s.spindleOn === "off" ? "M05" : s.spindleOn === "cw" ? "M03" : "M04",
    "Chłodziwo": s.coolant ? "M08" : "M09",
    "Narzędzie": s.tool === null ? "—" : `T${String(s.tool).padStart(2, "0")}`,
    "Cykl": s.cycle ? `G${s.cycle.code} (${s.cycle.retract === 98 ? "G98" : "G99"})` : "—",
    ...(dia && s.maxRpm ? { "Limit obrotów": `G50 S${fmt(s.maxRpm)}` } : {}),
    "TCP (wierzchołek narzędzia)": s.tcp ? "wł. (G43.4 / TRAORI)" : "wył.",
    "Płaszczyzna pochylona": s.tilt ? `${s.tilt.src}, oś Z płaszczyzny ${vecN(s.tilt.m)}` : "brak",
    ...(s.rotary ? { "Osie obrotowe": ["a", "b", "c"].filter((k) => s.rotary![k as "a" | "b" | "c"] !== undefined).map((k) => `${k.toUpperCase()}${fmt(s.rotary![k as "a" | "b" | "c"]!)}°`).join(" ") } : {}),
  };
}

export default function LearnPanel({ program, activeLine, mode }: { program: Program; activeLine: number | null; mode: "mill" | "lathe" }) {
  const dia = mode === "lathe";
  const line: ParsedLine | undefined = activeLine !== null ? program.lines[activeLine] : undefined;
  if (!line) return (
    <div className="learn" aria-live="polite">
      <div className="learn-head"><b>Tryb nauki</b><span>koniec programu — wciśnij Reset albo tapnij linię</span></div>
    </div>
  );
  // stan przed blokiem: ostatnia wcześniejsza linia ze słowami
  let prev: ParsedLine | undefined;
  for (let i = line.index - 1; i >= 0; i--) { if (program.lines[i]?.words.length) { prev = program.lines[i]; break; } }
  const before = describe(prev?.state, dia), after = describe(line.state, dia);
  const rows: Row[] = Object.keys(after).map((k) => ({ label: k, before: before[k] ?? "—", after: after[k] })).filter((r) => r.before !== r.after);
  const moves = line.segments.filter((s) => s.kind !== "dwell");
  const from = moves[0]?.from, to = moves[moves.length - 1]?.to;
  const pos = (p: { x: number; y: number; z: number }) => dia ? `X${fmt(p.x * 2)} Z${fmt(p.z)}` : `X${fmt(p.x)} Y${fmt(p.y)} Z${fmt(p.z)}`;
  return (
    <div className="learn" aria-live="polite">
      <div className="learn-head"><b>Tryb nauki</b><code>{String(line.index + 1).padStart(2, "0")} {line.raw.trim() || "(pusta linia)"}</code></div>
      <p className="learn-desc">{line.errors.length ? line.errors.join(" ") : line.description || (line.comment ? `Komentarz: ${line.comment}` : "Blok bez ruchu i bez zmiany stanu.")}</p>
      {from && to && (
        <p className="learn-move">{moves.length === 1 ? "Ruch" : `${moves.length} ruchy`}: <b>{pos(from)}</b> → <b>{pos(to)}</b>{moves.some((m) => m.kind === "rapid") && moves.every((m) => m.kind === "rapid") ? " (szybki przejazd)" : ""}</p>
      )}
      {rows.length > 0 ? (
        <table className="learn-tbl">
          <thead><tr><th>Co się zmieniło</th><th>przed</th><th>po</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.label}><th scope="row">{r.label}</th><td>{r.before}</td><td><b>{r.after}</b></td></tr>)}</tbody>
        </table>
      ) : <p className="learn-none">Stan modalny bez zmian — blok korzysta z ustawień poprzednich bloków.</p>}
    </div>
  );
}
