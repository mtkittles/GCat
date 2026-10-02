"use client";
import { useState } from "react";
import PageBanner from "@/components/ui/PageBanner";
import { GROUPS, MATERIALS, THREADS, TOOL_MATERIAL, mid } from "@/lib/machining";

type Tab = "mill" | "turn" | "drill" | "thread";

const BANNERS: Record<Tab, { src: string; title: string; sub: string }> = {
  mill:   { src: "/img/banner-mill.jpg",   title: "Frezowanie",   sub: "Obroty i posuw dla frezu i materiału." },
  turn:   { src: "/img/banner-turn.jpg",   title: "Toczenie",     sub: "Obroty i posuw przy toczeniu i wytaczaniu." },
  drill:  { src: "/img/banner-drill.jpg",  title: "Wiercenie",    sub: "Obroty i posuw dla wiertła." },
  thread: { src: "/img/banner-thread.jpg", title: "Gwintowanie",  sub: "Obroty i posuw przy gwintowaniu." },
};

const r0 = (v: number) => (Number.isFinite(v) ? Math.round(v) : 0);
const r2 = (v: number) => (Number.isFinite(v) ? Math.round(v * 100) / 100 : 0);
const r3 = (v: number) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : 0);

type Rule = { min: number; max: number; int?: boolean; minIncl?: boolean };

/** Sprawdza wpis: null = poprawny, tekst = komunikat do pokazania przy polu. */
export function check(raw: string, r: Rule): string | null {
  const t = raw.trim();
  if (t === "") return "Wpisz wartość.";
  if (!/^[0-9]*[.,]?[0-9]*$/.test(t) || t === "." || t === ",") return "To nie jest liczba.";
  const n = Number(t.replace(",", "."));
  if (!Number.isFinite(n)) return "To nie jest liczba.";
  if (r.int && !Number.isInteger(n)) return "Wpisz liczbę całkowitą.";
  if (r.minIncl ? n < r.min : n <= r.min) return r.min === 0 ? "Wartość musi być większa od zera." : `Najmniej ${String(r.min).replace(".", ",")}.`;
  if (n > r.max) return `Najwięcej ${String(r.max).replace(".", ",")}.`;
  return null;
}

/**
 * Pole liczbowe kalkulatora. Błędny wpis zostaje w polu (nie wraca do poprzedniej
 * wartości), komunikat pojawia się przy polu po opuszczeniu go, a wynik jest
 * oznaczany jako nieaktualny. Przecinek działa jak kropka. Podczas pisania
 * dozwolony jest wpis niekompletny („1,”), bez komunikatu.
 */
function Field({ id, label, unit, value, onChange, rule, preset, onValid }: {
  id: string; label: string; unit?: string; value: number; onChange: (v: number) => void;
  rule: Rule; preset?: boolean; onValid: (id: string, ok: boolean) => void;
}) {
  const [text, setText] = useState(String(value).replace(".", ","));
  const [focused, setFocused] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  // wartość zmieniona z zewnątrz (preset, zmiana materiału) — pole przyjmuje ją, o ile nie ma w nim błędu w trakcie edycji
  const [prev, setPrev] = useState(value);
  if (prev !== value) {
    setPrev(value);
    if (!focused && !err) setText(String(value).replace(".", ","));
  }
  const msgId = `${id}-msg`;
  return (
    <label className={`calc-field${err ? " is-invalid" : ""}`}>
      <span>{label}{unit && <i> [{unit}]</i>}{preset && <em className="calc-preset" title="Wartość z tabeli dla wybranego materiału — orientacyjna">tabela</em>}</span>
      <input
        type="text" inputMode="decimal" value={text}
        aria-invalid={!!err} aria-describedby={err ? msgId : undefined}
        onFocus={(e) => { setFocused(true); e.currentTarget.select(); }}
        onBlur={() => {
          setFocused(false);
          const e = check(text, rule);
          setErr(e); onValid(id, !e);
          if (!e) onChange(Number(text.replace(",", ".")));
        }}
        onChange={(e) => {
          const raw = e.target.value;
          if (!/^[0-9]*[.,]?[0-9]*$/.test(raw)) return;
          setText(raw);
          const bad = check(raw, rule);
          onValid(id, !bad);
          if (!bad) { setErr(null); onChange(Number(raw.replace(",", "."))); }
        }} />
      {err && <small id={msgId} className="calc-err" role="alert">{err}</small>}
    </label>
  );
}

function Out({ label, value, unit, big, stale }: { label: string; value: string | number; unit: string; big?: boolean; stale?: boolean }) {
  return <div className={`calc-out ${big ? "big" : ""}${stale ? " is-stale" : ""}`}><div className="calc-out-l">{label}</div><div className="calc-out-v">{stale ? "—" : value} <span>{unit}</span></div></div>;
}
function Formula({ children }: { children: React.ReactNode }) {
  return <p className="calc-formula">{children}</p>;
}

/** Gotowy fragment G-kodu z przyciskiem kopiowania. */
function CodeOut({ text, stale }: { text: string; stale?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className={`codeout${stale ? " is-stale" : ""}`}>
      <pre className="syntax">{stale ? "Popraw zaznaczone pola — wynik nie jest aktualny." : text}</pre>
      <button disabled={stale} aria-disabled={stale} onClick={() => { if (stale) return; navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1600); }}>
        {copied ? "Skopiowano" : "Kopiuj"}
      </button>
    </div>
  );
}

/** Komunikat nad wynikami, gdy któreś pole ma błędny wpis. */
function StaleNote({ show }: { show: boolean }) {
  return show ? <p className="calc-stale" role="status">Wynik nie jest aktualny — popraw pola zaznaczone na czerwono.</p> : null;
}

export default function Calc() {
  const [tab, setTab] = useState<Tab>("mill");
  // pola z błędnym wpisem, per zakładka: id pola → true
  const [bad, setBad] = useState<Record<string, boolean>>({});
  const onValid = (id: string, ok: boolean) => setBad((b) => (b[id] === !ok ? b : { ...b, [id]: !ok }));
  const staleOf = (prefix: string) => Object.entries(bad).some(([k, v]) => v && k.startsWith(prefix));
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
    <div className="grid gap-5 calc-page">
      <PageBanner src={BANNERS[tab].src} kicker="Kalkulator parametrów" title={BANNERS[tab].title} subtitle={BANNERS[tab].sub}
        info={<ul>
          <li>Wartości startowe pochodzą z tabel dla wybranego materiału i narzędzia. Każde pole możesz nadpisać.</li>
          <li>Wynik to punkt startowy. Koryguj go pod mocowanie, wysięg narzędzia i chłodzenie.</li>
        </ul>} priority />

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
        <section className="grid gap-3 calc-section">
          <div className="calc-grid">
            <Field id="m-vc" label="Prędkość skrawania Vc" unit="m/min" value={vcMill} onChange={setVcM} rule={{ min: 0, max: 2000 }} preset={!vcM} onValid={onValid} />
            <Field id="m-d" label="Średnica freza D" unit="mm" value={d} onChange={setD} rule={{ min: 0, max: 200 }} onValid={onValid} />
            <Field id="m-z" label="Liczba ostrzy z" value={z} onChange={setZ} rule={{ min: 1, max: 20, int: true, minIncl: true }} onValid={onValid} />
            <Field id="m-fz" label="Posuw na ostrze fz" unit="mm" value={fz} onChange={setFzM} rule={{ min: 0, max: 2 }} preset={!fzM} onValid={onValid} />
            <Field id="m-ap" label="Głębokość ap" unit="mm" value={ap} onChange={setAp} rule={{ min: 0, max: 100 }} onValid={onValid} />
            <Field id="m-ae" label="Szerokość ae" unit="mm" value={ae} onChange={setAe} rule={{ min: 0, max: Math.max(d, 0.001), minIncl: false }} onValid={onValid} />
          </div>
          <div className="calc-side">
          <StaleNote show={staleOf("m-")} />
          <div className="calc-outs">
            <Out big label="Obroty S" value={r0(nMill)} unit="obr/min" stale={staleOf("m-")} />
            <Out big label="Posuw F" value={r0(vfMill)} unit="mm/min" stale={staleOf("m-")} />
            <Out label="Wydajność Q" value={r2(qMill)} unit="cm³/min" stale={staleOf("m-")} />
            <Out label="Szacowana moc skrawania" value={r2(pMill)} unit="kW" stale={staleOf("m-")} />
          </div>
          <CodeOut text={`S${r0(nMill)} M03\nG01 X_ Y_ F${r0(vfMill)}`} stale={staleOf("m-")} />
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
          
        </section>
      )}

      {tab === "turn" && (
        <section className="grid gap-3 calc-section">
          <div className="calc-grid">
            <Field id="t-vc" label="Prędkość skrawania Vc" unit="m/min" value={vcTurn} onChange={setVcT} rule={{ min: 0, max: 2000 }} preset={!vcT} onValid={onValid} />
            <Field id="t-d" label="Średnica D" unit="mm" value={dT} onChange={setDT} rule={{ min: 0, max: 1000 }} onValid={onValid} />
            <Field id="t-f" label="Posuw f" unit="mm/obr" value={fTurn} onChange={setFT} rule={{ min: 0, max: 3 }} preset={!fT} onValid={onValid} />
            <Field id="t-ap" label="Głębokość ap" unit="mm" value={apT} onChange={setApT} rule={{ min: 0, max: 50 }} onValid={onValid} />
            <Field id="t-re" label="Promień naroża rε" unit="mm" value={re} onChange={setRe} rule={{ min: 0, max: 5 }} onValid={onValid} />
          </div>
          <div className="calc-side">
          <StaleNote show={staleOf("t-")} />
          <div className="calc-outs">
            <Out big label="Obroty przy tej średnicy" value={r0(nTurn)} unit="obr/min" stale={staleOf("t-")} />
            <Out big label="Chropowatość Rz (teoret.)" value={r2(rz)} unit="µm" stale={staleOf("t-")} />
            <Out label="Wydajność Q" value={r2(qTurn)} unit="cm³/min" stale={staleOf("t-")} />
            <Out label="Szacowana moc skrawania" value={r2(pTurn)} unit="kW" stale={staleOf("t-")} />
          </div>
          <CodeOut stale={staleOf("t-")} text={`G50 S${Math.min(4000, r0(nTurn * 2))}   (LIMIT OBROTOW - DOBIERZ DO UCHWYTU)\nG96 S${vcTurn} M03\nG99   (MM/OBR: FANUC SYSTEM A; SINUMERIK I FANUC B/C: G95)\nG01 X_ Z_ F${fTurn}`} />
          </div>
          <div className="calc-formulas">
            <Formula>n = 1000 · Vc / (π · D) = 1000 · {vcTurn} / (π · {dT}) = <strong>{r0(nTurn)} obr/min</strong></Formula>
            <Formula>Q = Vc · ap · f = {vcTurn} · {apT} · {fTurn} = <strong>{r2(qTurn)} cm³/min</strong></Formula>
            <Formula>Rz ≈ f² / (8 · rε) · 1000 = {fTurn}² / (8 · {re}) · 1000 = <strong>{r2(rz)} µm</strong></Formula>
          </div>
          <p className="text-sm text-muted max-w-prose">Chropowatość teoretyczna zależy wyłącznie od posuwu i promienia naroża. Jeżeli wychodzi za wysoka, zmniejsz posuw albo weź płytkę o większym rε — zwiększanie obrotów nic tu nie da.</p>
          
        </section>
      )}

      {tab === "drill" && (
        <section className="grid gap-3 calc-section">
          <div className="calc-grid">
            <Field id="d-vc" label="Prędkość skrawania Vc" unit="m/min" value={vcDrill} onChange={setVcD} rule={{ min: 0, max: 500 }} preset={!vcD} onValid={onValid} />
            <Field id="d-d" label="Średnica wiertła D" unit="mm" value={dD} onChange={setDD} rule={{ min: 0, max: 100 }} onValid={onValid} />
            <Field id="d-f" label="Posuw f" unit="mm/obr" value={fDrill} onChange={setFD} rule={{ min: 0, max: 2 }} preset={!fD} onValid={onValid} />
          </div>
          <div className="calc-side">
          <StaleNote show={staleOf("d-")} />
          <div className="calc-outs">
            <Out big label="Obroty S" value={r0(nDrill)} unit="obr/min" stale={staleOf("d-")} />
            <Out big label="Posuw F" value={r0(vfDrill)} unit="mm/min" stale={staleOf("d-")} />
            <Out label="Szacowana moc skrawania" value={r2(pDrill)} unit="kW" stale={staleOf("d-")} />
          </div>
          <CodeOut stale={staleOf("d-")} text={`S${r0(nDrill)} M03\nG99 G83 X_ Y_ Z_ R2 Q${Math.max(1, Math.round(dD * 0.7))} F${r0(vfDrill)}\nG80`} />
          </div>
          <div className="calc-formulas">
            <Formula>n = 1000 · Vc / (π · D) = <strong>{r0(nDrill)} obr/min</strong></Formula>
            <Formula>Vf = n · f = {r0(nDrill)} · {fDrill} = <strong>{r0(vfDrill)} mm/min</strong></Formula>
          </div>
          <p className="text-sm text-muted max-w-prose">Powyżej 3 × D użyj cyklu G83 z odprowadzeniem wióra. Zasada startowa dla posuwu: około 2% średnicy wiertła.</p>
          
        </section>
      )}

      {tab === "thread" && (
        <section className="grid gap-3 calc-section">
          <div className="calc-grid">
            <label className="calc-field"><span>Gwint</span>
              <select value={thr} onChange={(e) => setThr(e.target.value)}>{THREADS.map((t) => <option key={t.name}>{t.name}</option>)}</select></label>
            <Field id="g-n" label="Obroty gwintowania" unit="obr/min" value={nTap} onChange={setNTap} rule={{ min: 10, max: 10000, int: true, minIncl: true }} onValid={onValid} />
          </div>
          <div className="calc-side">
          <StaleNote show={staleOf("g-")} />
          <div className="calc-outs">
            <Out big label="Otwór pod gwintownik" value={th.drill} unit="mm" />
            <Out big label="Posuw gwintowania F" value={r0(fTap)} unit="mm/min" stale={staleOf("g-")} />
            <Out label="Skok" value={th.pitch} unit="mm" />
            <Out label="⌀ pod gwint zewnętrzny" value={th.outer} unit="mm" />
          </div>
          <CodeOut stale={staleOf("g-")} text={`M29 S${nTap}\nG99 G84 X_ Y_ Z_ R5 F${r0(fTap)}\nG80`} />
          </div>
          <div className="calc-formulas">
            <Formula>F = n · skok = {nTap} · {th.pitch} = <strong>{r0(fTap)} mm/min</strong></Formula>
            <Formula>⌀ otworu ≈ ⌀ nominalna − skok = {th.name.slice(1)} − {th.pitch} = <strong>{th.drill} mm</strong></Formula>
          </div>
          <p className="note note-warn max-w-prose">Posuw gwintowania musi wynikać ze skoku. Wpisanie dowolnej wartości F kończy się złamaniem gwintownika w otworze.</p>
          
          <div className="overflow-x-auto"><table className="code-table">
            <thead><tr><th>Gwint</th><th>Skok</th><th>Otwór</th><th>⌀ zewn.</th></tr></thead>
            <tbody>{THREADS.map((t) => <tr key={t.name} style={t.name === thr ? { background: "var(--warn-bg)" } : undefined}><td className="font-mono font-bold">{t.name}</td><td>{t.pitch}</td><td>{t.drill}</td><td>{t.outer}</td></tr>)}</tbody>
          </table></div>
        </section>
      )}

      <div className="calc-notes">
        <p><b>Wartości „tabela”</b> (Vc, fz, f) to orientacyjne punkty startowe dla wybranej pary materiałów — nie dane katalogowe konkretnego narzędzia. Każde pole możesz nadpisać.</p>
        <p><b>Szacowana moc skrawania</b> to moc zużywana na samo skrawanie (P = Q · kc). Wymagana moc napędu wrzeciona jest większa: P / η, gdzie η to sprawność napędu z danych maszyny.</p>
      </div>
      <p className="text-sm text-muted max-w-prose">Zakres dla wybranego materiału i węglika: frezowanie Vc {mat.vcMill[0]}–{mat.vcMill[1]}, toczenie {mat.vcTurn[0]}–{mat.vcTurn[1]}, wiercenie {mat.vcDrill[0]}–{mat.vcDrill[1]} m/min. Właściwy opór skrawania kc {mat.kc} N/mm². Zawsze porównaj z katalogiem producenta narzędzia.</p>
    </div>
  );
}
