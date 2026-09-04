"use client";
import { LATHE_TOOLS, MILL_TOOLS, TOOL_LABEL, type Setup, type ToolKind } from "./setup";

function Num({ l, v, on, step = 1, min = 0.1, suffix }: { l: string; v: number; on: (n: number) => void; step?: number; min?: number; suffix?: string }) {
  return (
    <label className="setup-field"><span>{l}</span>
      <span className="setup-input"><input type="number" inputMode="decimal" step={step} min={min} value={v} onChange={(e) => on(Math.max(min, Number(e.target.value) || min))} />{suffix && <i>{suffix}</i>}</span>
    </label>
  );
}

export default function SetupPanel({ mode, setup, onChange }: { mode: "mill" | "lathe"; setup: Setup; onChange: (s: Setup) => void }) {
  const { tool, stock } = setup;
  const t = (p: Partial<typeof tool>) => onChange({ ...setup, tool: { ...tool, ...p } });
  const s = (p: Partial<typeof stock>) => onChange({ ...setup, stock: { ...stock, ...p } });
  const kinds = mode === "mill" ? MILL_TOOLS : LATHE_TOOLS;

  return (
    <details className="setup" open>
      <summary>Narzędzie i półfabrykat</summary>
      <div className="setup-grid">
        <fieldset><legend>Narzędzie</legend>
          <label className="setup-field"><span>Typ</span>
            <select value={tool.kind} onChange={(e) => t({ kind: e.target.value as ToolKind })}>
              {kinds.map((k) => <option key={k} value={k}>{TOOL_LABEL[k]}</option>)}
            </select>
          </label>
          {mode === "mill" ? (
            <>
              <Num l="Średnica" v={tool.d} on={(d) => t({ d })} step={0.5} suffix="mm" />
              {tool.kind !== "drill" && tool.kind !== "tap" && <Num l="Liczba ostrzy" v={tool.flutes} on={(flutes) => t({ flutes: Math.round(flutes) })} min={1} />}
              {tool.kind === "drill" && <Num l="Kąt wierzchołkowy" v={tool.angle || 118} on={(angle) => t({ angle })} min={60} suffix="°" />}
            </>
          ) : (
            <>
              <Num l="Promień naroża rε" v={tool.d} on={(d) => t({ d })} step={0.1} min={0.1} suffix="mm" />
              <Num l="Kąt przystawienia" v={tool.angle} on={(angle) => t({ angle })} min={45} suffix="°" />
            </>
          )}
        </fieldset>

        <fieldset><legend>Półfabrykat</legend>
          <label className="setup-field setup-check"><span>Dobierz automatycznie</span>
            <input type="checkbox" checked={stock.auto} onChange={(e) => s({ auto: e.target.checked })} /></label>
          {mode === "mill" ? (
            <>
              <Num l="Długość X" v={stock.x} on={(x) => s({ x })} suffix="mm" />
              <Num l="Szerokość Y" v={stock.y} on={(y) => s({ y })} suffix="mm" />
              <Num l="Wysokość Z" v={stock.z} on={(z) => s({ z })} suffix="mm" />
              <label className="setup-field"><span>Zero detalu w planie</span>
                <select value={stock.originXY} onChange={(e) => s({ originXY: e.target.value as "corner" | "center" })}>
                  <option value="corner">Lewy dolny narożnik</option>
                  <option value="center">Środek</option>
                </select></label>
              <label className="setup-field"><span>Zero osi Z</span>
                <select value={stock.originZTop ? "top" : "bottom"} onChange={(e) => s({ originZTop: e.target.value === "top" })}>
                  <option value="top">Górna powierzchnia</option>
                  <option value="bottom">Podstawa (stół)</option>
                </select></label>
            </>
          ) : (
            <>
              <Num l="Średnica ⌀" v={stock.d} on={(d) => s({ d })} suffix="mm" />
              <Num l="Długość" v={stock.len} on={(len) => s({ len })} suffix="mm" />
              <p className="setup-hint">Zero: oś obrotu (X0) i czoło detalu (Z0). Materiał rozciąga się w stronę ujemnych Z.</p>
            </>
          )}
        </fieldset>
      </div>
    </details>
  );
}
