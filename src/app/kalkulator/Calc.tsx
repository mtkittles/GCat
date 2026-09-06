"use client";
import { useState } from "react";
import PageBanner from "@/components/ui/PageBanner";
import { GROUPS, MATERIALS, THREADS, TOOL_MATERIAL, mid } from "@/lib/machining";

type Tab = "mill" | "turn" | "drill" | "thread";

const BANNERS: Record<Tab, { src: string; title: string; sub: string }> = {
  mill:   { src: "/img/banner-mill.jpg",   title: "Frezowanie",   sub: "Dobór parametrów frezowania" },
  turn:   { src: "/img/banner-turn.jpg",   title: "Toczenie",     sub: "Dobór parametrów toczenia i wytaczania" },
  drill:  { src: "/img/banner-drill.jpg",  title: "Wiercenie",    sub: "Dobór parametrów wiercenia" },
  thread: { src: "/img/banner-thread.jpg", title: "Gwintowanie",  sub: "Dobór parametrów gwintowania" },
};

const r0 = (v: number) => (Number.isFinite(v) ? Math.round(v) : 0);
const r2 = (v: number) => (Number.isFinite(v) ? Math.round(v * 100) / 100 : 0);
const r3 = (v: number) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : 0);

function Field({ label, unit, value, onChange, step = 1, min = 0.01 }: { label: string; unit?: string; value: number; onChange: (v: number) => void; step?: number; min?: number }) {
  // Pole przechowuje to, co użytkownik faktycznie wpisał. Dzięki temu można
  // skasować całą zawartość albo zacząć od kropki bez podstawiania wartości.
  const [text, setText] = useState(String(value));
  const [focused, setFocused] = useState(false);
  const shown = focused ? text : String(value);

  return (
    <label className="calc-field"><span>{label}{unit && <i> [{unit}]</i>}</span>
      <input
        type="text" inputMode="decimal" step={step} value={shown}
        onFocus={(e) => { setFocused(true); setText(String(value)); e.currentTarget.select(); }}
        onBlur={() => {
          setFocused(false);
          const n = Number(text.replace(",", "."));
          if (Number.isFinite(n) && n >= min) onChange(n);
        }}
        onChange={(e) => {
          const raw = e.target.value;
          if (!/^[0-9]*[.,]?[0-9]*$/.test(raw)) return;
          setText(raw);
          const n = Number(raw.replace(",", "."));
          if (raw !== "" && Number.isFinite(n) && n >= min) onChange(n);
        }} /></label>
  );
}
function Out({ label, value, unit, big }: { label: string; value: string | number; unit: string; big?: boolean }) {
  return <div className={`calc-out ${big ? "big" : ""}`}><div className="calc-out-l">{label}</div><div className="calc-out-v">{value} <span>{unit}</span></div></div>;
}
function Formula({ children }: { children: React.ReactNode }) {
  return <p className="calc-formula">{children}</p>;
}

/** Gotowy fragment G-kodu z przyciskiem kopiowania. */
function CodeOut({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="codeout">
      <pre className="syntax">{text}</pre>
      <button onClick={() => { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1600); }}>
        {copied ? "Skopiowano" : "Kopiuj"}
      </button>
    </div>
  );
}

export default function Calc() {
  const [tab, setTab] = useState<Tab>("mill");
  const [matId, setMatId] = useState("s235");
  const [toolMatId, setToolMatId] = useState("carbide");
  const mat = MATERIALS.find((m) => m.id === matId)!;
  const tm = TOOL_MATERIAL.find((t) => t.id === toolMatId)!;

  // frezowanie
  const [d, setD] = useState(10);
  const [z, setZ] = useState(4);
  const [ap, setAp] = useState(5);
  const [ae, setAe] = useState(5);
  const [vcM, setVcM] = useState(0);
  const [fzM, setFzM] = useState(0);
  const vcMill = vcM || r0(mid(mat.vcMill) * tm.f);
  const fz = fzM || r3(mid(mat.fz));
  const nMill = (vcMill * 1000) / (Math.PI * d);
  // pocienianie wióra przy ae < d/2
  const thin = ae < d / 2 && ae > 0 ? d / (2 * Math.sqrt(ae * d - ae * ae)) : 1;
  const fzCorr = fz * thin;
  const vfMill = nMill * z * fzCorr;
  const qMill = (ap * ae * vfMill) / 1000; // cm³/min
  const pMill = (qMill * mat.kc) / 60000;  // kW

  // toczenie
  const [dT, setDT] = useState(50);
  const [apT, setApT] = useState(2);
  const [fT, setFT] = useState(0);
  const [vcT, setVcT] = useState(0);
  const [re, setRe] = useState(0.8);
  const vcTurn = vcT || r0(mid(mat.vcTurn) * tm.f);
  const fTurn = fT || r2(mid(mat.fTurn));
  const nTurn = (vcTurn * 1000) / (Math.PI * dT);
  const qTurn = (vcTurn * apT * fTurn) / 1000 * 1000 / 1000; // cm³/min = vc*ap*f
  const qT = vcTurn * apT * fTurn;
  const pTurn = (qT * mat.kc) / 60000;
  const rz = ((fTurn * fTurn) / (8 * re)) * 1000;

  // wiercenie
  const [dD, setDD] = useState(8);
  const [fD, setFD] = useState(0);
  const [vcD, setVcD] = useState(0);
  const vcDrill = vcD || r0(mid(mat.vcDrill) * (tm.id.startsWith("hss") ? 1 : 2.2));
  const fDrill = fD || r3(Math.min(0.3, dD * 0.02));
  const nDrill = (vcDrill * 1000) / (Math.PI * dD);
  const vfDrill = nDrill * fDrill;
  const pDrill = (mat.kc * fDrill * dD * vfDrill) / (4 * 60000 * 1000) * 1000;

  // gwintowanie
  const [thr, setThr] = useState("M10");
  const th = THREADS.find((t) => t.name === thr)!;
  const [nTap, setNTap] = useState(400);
  const fTap = nTap * th.pitch;

  const reset = () => { setVcM(0); setFzM(0); setVcT(0); setFT(0); setVcD(0); };

  return (
    <div className="grid gap-5">
      <PageBanner src={BANNERS[tab].src} title={BANNERS[tab].title} subtitle={BANNERS[tab].sub} priority />
      <div>
        <h1 className="text-3xl font-bold">Kalkulator parametrów skrawania</h1>
        <p className="text-muted max-w-prose">Wybierz materiał i narzędzie — wartości startowe podstawią się z tabel. Możesz je nadpisać własnymi. Wyniki są punktem wyjścia, nie gotową receptą: dopasuj je do sztywności mocowania, wysięgu narzędzia i chłodzenia.</p>
      </div>

      <div className="calc-presets">
        <label className="calc-field wide"><span>Materiał obrabiany</span>
          <select value={matId} onChange={(e) => { setMatId(e.target.value); reset(); }}>
            {Object.entries(GROUPS).map(([g, gname]) => (
              <optgroup key={g} label={`${g} — ${gname}`}>
                {MATERIALS.filter((m) => m.group === g).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </optgroup>
            ))}
          </select></label>
        <label className="calc-field wide"><span>Materiał narzędzia</span>
          <select value={toolMatId} onChange={(e) => { setToolMatId(e.target.value); reset(); }}>
            {TOOL_MATERIAL.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select></label>
      </div>
      {mat.note && <p className="note note-info max-w-prose">{mat.note}</p>}

      <div className="segmented" role="tablist" aria-label="Rodzaj obróbki">
        {([["mill", "Frezowanie"], ["turn", "Toczenie"], ["drill", "Wiercenie"], ["thread", "Gwintowanie"]] as [Tab, string][]).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === "mill" && (
        <section className="grid gap-3">
          <div className="calc-grid">
            <Field label="Prędkość skrawania Vc" unit="m/min" value={vcMill} onChange={setVcM} />
            <Field label="Średnica freza D" unit="mm" value={d} onChange={setD} step={0.5} />
            <Field label="Liczba ostrzy z" value={z} onChange={(v) => setZ(Math.round(v))} min={1} />
            <Field label="Posuw na ostrze fz" unit="mm" value={fz} onChange={setFzM} step={0.01} />
            <Field label="Głębokość ap" unit="mm" value={ap} onChange={setAp} step={0.5} />
            <Field label="Szerokość ae" unit="mm" value={ae} onChange={setAe} step={0.5} />
          </div>
          <div className="calc-outs">
            <Out big label="Obroty S" value={r0(nMill)} unit="obr/min" />
            <Out big label="Posuw F" value={r0(vfMill)} unit="mm/min" />
            <Out label="Wydajność Q" value={r2(qMill)} unit="cm³/min" />
            <Out label="Moc skrawania" value={r2(pMill)} unit="kW" />
          </div>
          {thin > 1.01 && (
            <div className="note note-tip max-w-prose">
              Przy ae {ae} mm i frezie ⌀{d} występuje <strong>pocienianie wióra</strong>: rzeczywista grubość wióra jest mniejsza niż fz.
              Posuw skorygowano współczynnikiem {r2(thin)}, czyli fz efektywne {r3(fzCorr)} mm. Bez tej korekty narzędzie pracowałoby zbyt lekko i szybciej się tępiło.
            </div>
          )}
          <div className="calc-formulas">
            <Formula>n = 1000 · Vc / (π · D) = 1000 · {vcMill} / (π · {d}) = <strong>{r0(nMill)} obr/min</strong></Formula>
            <Formula>Vf = n · z · fz = {r0(nMill)} · {z} · {r3(fzCorr)} = <strong>{r0(vfMill)} mm/min</strong></Formula>
            <Formula>Q = ap · ae · Vf / 1000 = {ap} · {ae} · {r0(vfMill)} / 1000 = <strong>{r2(qMill)} cm³/min</strong></Formula>
            <Formula>P = Q · kc / 60000 = {r2(qMill)} · {mat.kc} / 60000 = <strong>{r2(pMill)} kW</strong></Formula>
          </div>
          <CodeOut text={`S${r0(nMill)} M03\nG01 X_ Y_ F${r0(vfMill)}`} />
        </section>
      )}

      {tab === "turn" && (
        <section className="grid gap-3">
          <div className="calc-grid">
            <Field label="Prędkość skrawania Vc" unit="m/min" value={vcTurn} onChange={setVcT} />
            <Field label="Średnica D" unit="mm" value={dT} onChange={setDT} />
            <Field label="Posuw f" unit="mm/obr" value={fTurn} onChange={setFT} step={0.01} />
            <Field label="Głębokość ap" unit="mm" value={apT} onChange={setApT} step={0.5} />
            <Field label="Promień naroża rε" unit="mm" value={re} onChange={setRe} step={0.1} />
          </div>
          <div className="calc-outs">
            <Out big label="Obroty przy tej średnicy" value={r0(nTurn)} unit="obr/min" />
            <Out big label="Chropowatość Rz (teoret.)" value={r2(rz)} unit="µm" />
            <Out label="Wydajność Q" value={r2(qTurn)} unit="cm³/min" />
            <Out label="Moc skrawania" value={r2(pTurn)} unit="kW" />
          </div>
          <div className="calc-formulas">
            <Formula>n = 1000 · Vc / (π · D) = 1000 · {vcTurn} / (π · {dT}) = <strong>{r0(nTurn)} obr/min</strong></Formula>
            <Formula>Q = Vc · ap · f = {vcTurn} · {apT} · {fTurn} = <strong>{r2(qTurn)} cm³/min</strong></Formula>
            <Formula>Rz ≈ f² / (8 · rε) · 1000 = {fTurn}² / (8 · {re}) · 1000 = <strong>{r2(rz)} µm</strong></Formula>
          </div>
          <p className="text-sm text-muted max-w-prose">Chropowatość teoretyczna zależy wyłącznie od posuwu i promienia naroża. Jeżeli wychodzi za wysoka, zmniejsz posuw albo weź płytkę o większym rε — zwiększanie obrotów nic tu nie da.</p>
          <CodeOut text={`G50 S${Math.min(4000, r0(nTurn * 2))}\nG96 S${vcTurn} M03\nG95 F${fTurn}`} />
        </section>
      )}

      {tab === "drill" && (
        <section className="grid gap-3">
          <div className="calc-grid">
            <Field label="Prędkość skrawania Vc" unit="m/min" value={vcDrill} onChange={setVcD} />
            <Field label="Średnica wiertła D" unit="mm" value={dD} onChange={setDD} step={0.5} />
            <Field label="Posuw f" unit="mm/obr" value={fDrill} onChange={setFD} step={0.01} />
          </div>
          <div className="calc-outs">
            <Out big label="Obroty S" value={r0(nDrill)} unit="obr/min" />
            <Out big label="Posuw F" value={r0(vfDrill)} unit="mm/min" />
            <Out label="Moc skrawania" value={r2(pDrill)} unit="kW" />
          </div>
          <div className="calc-formulas">
            <Formula>n = 1000 · Vc / (π · D) = <strong>{r0(nDrill)} obr/min</strong></Formula>
            <Formula>Vf = n · f = {r0(nDrill)} · {fDrill} = <strong>{r0(vfDrill)} mm/min</strong></Formula>
          </div>
          <p className="text-sm text-muted max-w-prose">Powyżej 3 × D użyj cyklu G83 z odprowadzeniem wióra. Zasada startowa dla posuwu: około 2% średnicy wiertła.</p>
          <CodeOut text={`S${r0(nDrill)} M03\nG99 G83 X_ Y_ Z_ R2 Q${Math.max(1, Math.round(dD * 0.7))} F${r0(vfDrill)}\nG80`} />
        </section>
      )}

      {tab === "thread" && (
        <section className="grid gap-3">
          <div className="calc-grid">
            <label className="calc-field"><span>Gwint</span>
              <select value={thr} onChange={(e) => setThr(e.target.value)}>{THREADS.map((t) => <option key={t.name}>{t.name}</option>)}</select></label>
            <Field label="Obroty gwintowania" unit="obr/min" value={nTap} onChange={(v) => setNTap(Math.round(v))} min={10} />
          </div>
          <div className="calc-outs">
            <Out big label="Otwór pod gwintownik" value={th.drill} unit="mm" />
            <Out big label="Posuw gwintowania F" value={r0(fTap)} unit="mm/min" />
            <Out label="Skok" value={th.pitch} unit="mm" />
            <Out label="⌀ pod gwint zewnętrzny" value={th.outer} unit="mm" />
          </div>
          <div className="calc-formulas">
            <Formula>F = n · skok = {nTap} · {th.pitch} = <strong>{r0(fTap)} mm/min</strong></Formula>
            <Formula>⌀ otworu ≈ ⌀ nominalna − skok = {th.name.slice(1)} − {th.pitch} = <strong>{th.drill} mm</strong></Formula>
          </div>
          <p className="note note-warn max-w-prose">Posuw gwintowania musi wynikać ze skoku. Wpisanie dowolnej wartości F kończy się złamaniem gwintownika w otworze.</p>
          <CodeOut text={`M29 S${nTap}\nG99 G84 X_ Y_ Z_ R5 F${r0(fTap)}\nG80`} />
          <div className="overflow-x-auto"><table className="code-table">
            <thead><tr><th>Gwint</th><th>Skok</th><th>Otwór</th><th>⌀ zewn.</th></tr></thead>
            <tbody>{THREADS.map((t) => <tr key={t.name} style={t.name === thr ? { background: "var(--warn-bg)" } : undefined}><td className="font-mono font-bold">{t.name}</td><td>{t.pitch}</td><td>{t.drill}</td><td>{t.outer}</td></tr>)}</tbody>
          </table></div>
        </section>
      )}

      <p className="text-sm text-muted max-w-prose">Zakres dla wybranego materiału i węglika: frezowanie Vc {mat.vcMill[0]}–{mat.vcMill[1]}, toczenie {mat.vcTurn[0]}–{mat.vcTurn[1]}, wiercenie {mat.vcDrill[0]}–{mat.vcDrill[1]} m/min. Właściwy opór skrawania kc {mat.kc} N/mm². Zawsze porównaj z katalogiem producenta narzędzia.</p>
    </div>
  );
}
