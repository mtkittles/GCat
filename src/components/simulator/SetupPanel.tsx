"use client";
import { LATHE_TOOLS, MILL_TOOLS, TOOL_LABEL, defaultTool, type Setup, type Tool, type ToolKind } from "./setup";

function Num({ l, v, on, step = 1, min = 0, suffix, w = "5.5rem" }: { l: string; v: number; on: (n: number) => void; step?: number; min?: number; suffix?: string; w?: string }) {
  return (
    <label className="setup-field"><span>{l}</span>
      <span className="setup-input">
        <input type="number" inputMode="decimal" step={step} value={v} style={{ width: w }}
          onChange={(e) => { const n = Number(e.target.value); on(Number.isFinite(n) ? Math.max(min, n) : min); }} />
        {suffix && <i>{suffix}</i>}
      </span>
    </label>
  );
}

function ToolRow({ n, tool, mode, active, onChange, onRemove }: { n: number; tool: Tool; mode: "mill" | "lathe"; active: boolean; onChange: (t: Tool) => void; onRemove?: () => void }) {
  const kinds = mode === "mill" ? MILL_TOOLS : LATHE_TOOLS;
  const p = (x: Partial<Tool>) => onChange({ ...tool, ...x });
  return (
    <div className={`tool-row ${active ? "is-active" : ""}`}>
      <div className="tool-head">
        <span className="tool-id">T{String(n).padStart(2, "0")}</span>
        <select value={tool.kind} onChange={(e) => p({ kind: e.target.value as ToolKind })}>
          {kinds.map((k) => <option key={k} value={k}>{TOOL_LABEL[k]}</option>)}
        </select>
        {active && <span className="tool-badge">w użyciu</span>}
        {onRemove && <button className="tool-del" onClick={onRemove} aria-label={`Usuń narzędzie T${n}`}>×</button>}
      </div>
      <div className="tool-params">
        {mode === "mill" ? (
          <>
            <Num l="⌀" v={tool.d} on={(d) => p({ d })} step={0.5} min={0.1} suffix="mm" w="4.5rem" />
            {(tool.kind === "endmill" || tool.kind === "ballnose") && <Num l="ostrza" v={tool.flutes} on={(f) => p({ flutes: Math.max(1, Math.round(f)) })} min={1} w="3.5rem" />}
            {tool.kind === "drill" && <Num l="kąt" v={tool.angle} on={(angle) => p({ angle })} min={60} suffix="°" w="4rem" />}
            {tool.kind === "tap" && <Num l="skok" v={tool.flutes} on={(f) => p({ flutes: f })} step={0.25} min={0.2} suffix="mm" w="4rem" />}
          </>
        ) : (
          <>
            <Num l="rε" v={tool.d} on={(d) => p({ d })} step={0.1} min={0.1} suffix="mm" w="4rem" />
            <Num l="kąt przyst." v={tool.angle} on={(angle) => p({ angle })} min={45} suffix="°" w="4rem" />
          </>
        )}
      </div>
    </div>
  );
}

export default function SetupPanel({ mode, setup, onChange, activeTool }: { mode: "mill" | "lathe"; setup: Setup; onChange: (s: Setup) => void; activeTool: number | null }) {
  const { stock, tools } = setup;
  const s = (p: Partial<Stock2>) => onChange({ ...setup, stock: { ...stock, ...p } });
  const nums = Object.keys(tools).map(Number).sort((a, b) => a - b);
  const nextFree = (nums.at(-1) ?? 0) + 1;

  return (
    <details className="setup" open>
      <summary>Narzędzia i półfabrykat</summary>
      <div className="setup-grid">
        <fieldset><legend>Tabela narzędzi</legend>
          <p className="setup-hint">Numery wykryte w programie ({nums.map((n) => `T${String(n).padStart(2, "0")}`).join(", ") || "brak"}) dodają się same. Symulator przełącza narzędzie na bloku z `T_ M06`.</p>
          {nums.map((n) => (
            <ToolRow key={n} n={n} tool={tools[n]} mode={mode} active={activeTool === n}
              onChange={(t) => onChange({ ...setup, tools: { ...tools, [n]: t } })}
              onRemove={nums.length > 1 ? () => { const t = { ...tools }; delete t[n]; onChange({ ...setup, tools: t }); } : undefined} />
          ))}
          <button className="tool-add" onClick={() => onChange({ ...setup, tools: { ...tools, [nextFree]: defaultTool(mode) } })}>+ Dodaj T{String(nextFree).padStart(2, "0")}</button>
        </fieldset>

        <fieldset><legend>Półfabrykat i zero detalu</legend>
          <label className="setup-field setup-check"><span>Dobierz półfabrykat automatycznie</span>
            <input type="checkbox" checked={stock.auto} onChange={(e) => s({ auto: e.target.checked })} /></label>
          {mode === "mill" ? (
            <>
              <Num l="Długość X" v={stock.x} on={(x) => s({ x })} min={1} suffix="mm" />
              <Num l="Szerokość Y" v={stock.y} on={(y) => s({ y })} min={1} suffix="mm" />
              <Num l="Wysokość Z" v={stock.z} on={(z) => s({ z })} min={1} suffix="mm" />
              <p className="setup-hint">Zero detalu — odległość punktu X0 Y0 Z0 od lewego dolnego narożnika podstawy półfabrykatu.</p>
              <Num l="Zero X od narożnika" v={stock.ox} on={(ox) => s({ ox })} step={0.5} min={-9999} suffix="mm" />
              <Num l="Zero Y od narożnika" v={stock.oy} on={(oy) => s({ oy })} step={0.5} min={-9999} suffix="mm" />
              <Num l="Zero Z od podstawy" v={stock.oz} on={(oz) => s({ oz })} step={0.5} min={-9999} suffix="mm" />
              <div className="setup-presets">
                <button onClick={() => s({ ox: 0, oy: 0, oz: stock.z })}>Narożnik, Z na górze</button>
                <button onClick={() => s({ ox: stock.x / 2, oy: stock.y / 2, oz: stock.z })}>Środek, Z na górze</button>
              </div>
            </>
          ) : (
            <>
              <Num l="Średnica ⌀" v={stock.d} on={(d) => s({ d })} min={1} suffix="mm" />
              <Num l="Długość" v={stock.len} on={(len) => s({ len })} min={1} suffix="mm" />
              <p className="setup-hint">Zero: oś obrotu (X0) i czoło gotowego detalu (Z0). Materiał rozciąga się w stronę ujemnych Z.</p>
            </>
          )}
        </fieldset>
      </div>
    </details>
  );
}
type Stock2 = Setup["stock"];
