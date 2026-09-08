"use client";
import { useMemo } from "react";
import type { Program } from "@/lib/parser";
import { computeStats } from "@/lib/parser/stats";
import { formatTime } from "@/lib/parser/validate";
import { TOOL_LABEL, toolOf, type Setup } from "./setup";

const m1 = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(2)} m` : `${Math.round(v)} mm`);
const n2 = (v: number) => Math.round(v * 100) / 100;

export default function StatsPanel({ program, setup, mode }: { program: Program; setup: Setup; mode: "mill" | "lathe" }) {
  const s = useMemo(() => computeStats(program), [program]);
  if (!s.moves) return null;
  const b = s.bounds;

  return (
    <details className="panel stats">
      <summary className="panel-head">Podsumowanie programu — {formatTime(s.seconds)}, {s.blocks} bloków</summary>
      <div className="panel-body grid gap-3">
        <div className="stat-grid">
          <div><span>Czas cyklu</span><b>{formatTime(s.seconds)}</b></div>
          <div><span>Droga robocza</span><b>{m1(s.cutLength)}</b></div>
          <div><span>Droga jałowa</span><b>{m1(s.rapidLength)}</b></div>
          <div><span>Ruchy</span><b>{s.moves}</b></div>
          <div><span>Łuki</span><b>{s.arcs}</b></div>
          <div><span>Cykle stałe</span><b>{s.cycles}</b></div>
        </div>

        <div className="overflow-x-auto"><table className="code-table">
          <thead><tr><th>Zakres</th><th>min</th><th>max</th><th>rozpiętość</th></tr></thead>
          <tbody>
            {(["x", "y", "z"] as const).filter((ax) => mode === "mill" || ax !== "y").map((ax) => {
              const dia = mode === "lathe" && ax === "x" ? 2 : 1;
              return (
                <tr key={ax}>
                  <td className="font-mono font-bold">{ax.toUpperCase()}{dia === 2 ? " ⌀" : ""}</td>
                  <td className="font-mono">{n2(b.min[ax] * dia)}</td>
                  <td className="font-mono">{n2(b.max[ax] * dia)}</td>
                  <td className="font-mono">{n2((b.max[ax] - b.min[ax]) * dia)}</td>
                </tr>
              );
            })}
          </tbody>
        </table></div>

        <div className="overflow-x-auto"><table className="code-table">
          <thead><tr><th>Narzędzie</th><th>Czas</th><th>Udział</th><th>Droga robocza</th><th>Najgłębiej Z</th></tr></thead>
          <tbody>
            {s.tools.map((t) => {
              const tool = toolOf(setup, t.tool, mode);
              const share = s.seconds > 0 ? Math.round((t.seconds / s.seconds) * 100) : 0;
              return (
                <tr key={t.tool}>
                  <td><span className="font-mono font-bold">T{String(t.tool).padStart(2, "0")}</span> <span className="text-muted">{TOOL_LABEL[tool.kind]} ⌀{tool.d}</span></td>
                  <td className="font-mono">{formatTime(t.seconds)}</td>
                  <td><span className="share"><i style={{ width: `${share}%` }} />{share}%</span></td>
                  <td className="font-mono">{m1(t.cutLength)}</td>
                  <td className="font-mono">{n2(t.minZ)}</td>
                </tr>
              );
            })}
          </tbody>
        </table></div>

        <p className="setup-hint">
          {s.feeds && <>Posuwy: {s.feeds.min}–{s.feeds.max}. </>}
          {s.spindle && <>Obroty: {s.spindle.min}–{s.spindle.max} obr/min. </>}
          Czas jest szacunkowy — nie uwzględnia przyspieszeń osi ani wymiany narzędzi.
        </p>
      </div>
    </details>
  );
}
