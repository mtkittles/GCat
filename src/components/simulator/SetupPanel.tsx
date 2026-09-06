"use client";
import { useState } from "react";
import { FIELD_LABEL, LATHE_TOOLS, MILL_TOOLS, TOOL_FIELDS, TOOL_LABEL, makeTool, type Setup, type Tool, type ToolKind } from "./setup";

function Num({ l, v, on, min = 0, suffix, w = "5rem" }: { l: string; v: number; on: (n: number) => void; step?: number; min?: number; suffix?: string; w?: string }) {
  const [text, setText] = useState(String(v));
  const [focused, setFocused] = useState(false);
  return (
    <label className="setup-field"><span>{l}</span>
      <span className="setup-input">
        <input type="text" inputMode="decimal" style={{ width: w }}
          value={focused ? text : String(v)}
          onFocus={(e) => { setFocused(true); setText(String(v)); e.currentTarget.select(); }}
          onBlur={() => { setFocused(false); const n = Number(text.replace(",", ".")); if (Number.isFinite(n) && n >= min) on(n); }}
          onChange={(e) => {
            const raw = e.target.value;
            if (!/^-?[0-9]*[.,]?[0-9]*$/.test(raw)) return;
            setText(raw);
            const n = Number(raw.replace(",", "."));
            if (raw !== "" && raw !== "-" && Number.isFinite(n) && n >= min) on(n);
          }} />
        {suffix && <i>{suffix}</i>}
      </span>
    </label>
  );
}

function ToolRow({ n, tool, mode, active, onChange, onRemove }: { n: number; tool: Tool; mode: "mill" | "lathe"; active: boolean; onChange: (t: Tool) => void; onRemove?: () => void }) {
  const kinds = mode === "mill" ? MILL_TOOLS : LATHE_TOOLS;
  const p = (x: Partial<Tool>) => onChange({ ...tool, ...x });
  const fields = TOOL_FIELDS[tool.kind];
  const isTap = tool.kind === "tap" || tool.kind === "threadmill";

  return (
    <div className={`tool-row ${active ? "is-active" : ""}`}>
      <div className="tool-head">
        <span className="tool-id">T{String(n).padStart(2, "0")}</span>
        <select value={tool.kind} onChange={(e) => { const k = e.target.value as ToolKind; onChange({ ...makeTool(k), tiltA: tool.tiltA, tiltB: tool.tiltB }); }}>
          {kinds.map((k) => <option key={k} value={k}>{TOOL_LABEL[k]}</option>)}
        </select>
        {active && <span className="tool-badge">w użyciu</span>}
        {onRemove && <button className="tool-del" onClick={onRemove} aria-label={`Usuń narzędzie T${n}`}>×</button>}
      </div>
      <div className="tool-params">
        {fields.map((f) => {
          const cfg = FIELD_LABEL[f];
          const label = f === "flutes" && isTap ? "skok" : f === "d" && mode === "lathe" ? "rε" : cfg.l;
          const unit = f === "flutes" && isTap ? "mm" : cfg.unit;
          const step = f === "flutes" && isTap ? 0.25 : cfg.step;
          return <Num key={f} l={label} v={tool[f] as number} on={(v) => p({ [f]: v } as Partial<Tool>)} step={step} min={cfg.min ?? 0} suffix={unit} w="4.2rem" />;
        })}
      </div>
      {mode === "mill" && (
        <details className="tool-tilt">
          <summary>Oś narzędzia {(tool.tiltA || tool.tiltB) ? `— A${tool.tiltA}° B${tool.tiltB}°` : "— pionowa"}</summary>
          <div className="tool-params">
            <Num l="A (wokół X)" v={tool.tiltA} on={(tiltA) => p({ tiltA })} step={5} min={-90} suffix="°" w="4.2rem" />
            <Num l="B (wokół Y)" v={tool.tiltB} on={(tiltB) => p({ tiltB })} step={5} min={-90} suffix="°" w="4.2rem" />
          </div>
          <p className="setup-hint">Pochylenie osi narzędzia — do obróbki na głowicy kątowej albo pod kątem. Widoczne w podglądzie 3D; tor pozostaje zgodny z programem.</p>
        </details>
      )}
    </div>
  );
}

export default function SetupPanel({ mode, setup, onChange, activeTool }: { mode: "mill" | "lathe"; setup: Setup; onChange: (s: Setup) => void; activeTool: number | null }) {
  const { stock, tools } = setup;
  const s = (p: Partial<Setup["stock"]>) => onChange({ ...setup, stock: { ...stock, ...p } });
  const nums = Object.keys(tools).map(Number).sort((a, b) => a - b);
  const nextFree = (nums.at(-1) ?? 0) + 1;

  return (
    <details className="setup" open>
      <summary>Narzędzia i półfabrykat</summary>
      <div className="setup-grid">
        <fieldset><legend>Tabela narzędzi</legend>
          <p className="setup-hint">Numery wykryte w programie ({nums.map((n) => `T${String(n).padStart(2, "0")}`).join(", ") || "brak"}) dodają się same. Symulator przełącza narzędzie na bloku z T_ M06.</p>
          {nums.map((n) => (
            <ToolRow key={n} n={n} tool={tools[n]} mode={mode} active={activeTool === n}
              onChange={(t) => onChange({ ...setup, tools: { ...tools, [n]: t } })}
              onRemove={nums.length > 1 ? () => { const t = { ...tools }; delete t[n]; onChange({ ...setup, tools: t }); } : undefined} />
          ))}
          <button className="tool-add" onClick={() => onChange({ ...setup, tools: { ...tools, [nextFree]: makeTool(mode === "mill" ? "endmill" : "turning") } })}>+ Dodaj T{String(nextFree).padStart(2, "0")}</button>
        </fieldset>

        <fieldset><legend>Półfabrykat i zero detalu</legend>
          <label className="setup-field setup-check"><span>Dobierz półfabrykat automatycznie</span>
            <input type="checkbox" checked={stock.auto} onChange={(e) => s({ auto: e.target.checked })} /></label>
          {mode === "mill" ? (
            <>
              <Num l="Długość X" v={stock.x} on={(x) => s({ x })} min={1} suffix="mm" />
              <Num l="Szerokość Y" v={stock.y} on={(y) => s({ y })} min={1} suffix="mm" />
              <Num l="Wysokość Z" v={stock.z} on={(z) => s({ z })} min={1} suffix="mm" />
              <p className="setup-hint">Zero detalu — odległość punktu X0 Y0 Z0 od lewego dolnego narożnika podstawy.</p>
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
