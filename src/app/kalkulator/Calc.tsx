"use client";
import Link from "next/link";
import { useState } from "react";
import CalcFig from "./CalcFig";
import { GROUPS, MATERIALS, THREADS, TOOL_MATERIAL, mid } from "@/lib/machining";

type Tab = "mill" | "turn" | "drill" | "thread";

const BANNERS: Record<Tab, { title: string; sub: string }> = {
  mill:   { title: "Frezowanie",   sub: "Obroty i posuw dla frezu i materiału." },
  turn:   { title: "Toczenie",     sub: "Obroty i posuw przy toczeniu i wytaczaniu." },
  drill:  { title: "Wiercenie",    sub: "Obroty i posuw dla wiertła." },
  thread: { title: "Gwintowanie",  sub: "Obroty i posuw przy gwintowaniu." },
};

const r0 = (v: number) => (Number.isFinite(v) ? Math.round(v) : 0);
const r2 = (v: number) => (Number.isFinite(v) ? Math.round(v * 100) / 100 : 0);
const r3 = (v: number) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : 0);
const pl = (v: number) => String(v).replace(".", ",");

/** Moc skrawania [kW] z wydajności Q [cm³/min] i oporu właściwego kc [N/mm²]. */
export const cutPower = (q: number, kc: number) => (q * kc) / 60000;
/** Wydajność wiercenia [cm³/min]: pole przekroju otworu [mm²] · posuw minutowy [mm/min] / 1000. */
export const drillRate = (d: number, vf: number) => (Math.PI * d * d * vf) / 4000;
/** Wydajność toczenia [cm³/min] = Vc [m/min] · ap [mm] · f [mm/obr]. */
export const turnRate = (vc: number, ap: number, f: number) => vc * ap * f;

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
function Field({ id, label, unit, value, onChange, rule, preset, onValid, table }: {
  id: string; label: string; unit?: string; value: number; onChange: (v: number) => void;
  rule: Rule; preset?: boolean; onValid: (id: string, ok: boolean) => void;
  /** wartość z tabeli materiału; gdy pole ją nadpisuje, obok etykiety jest przycisk powrotu (onChange(0) = „weź z tabeli”) */
  table?: number;
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
      <span>{label}{preset && <em className="calc-preset" title="Wartość z tabeli dla wybranego materiału — orientacyjna">tabela</em>}
        {!preset && table !== undefined && (
          <button type="button" className="calc-preset is-back" title={`Wróć do wartości z tabeli: ${String(table).replace(".", ",")}`}
            aria-label={`${label}: wróć do wartości z tabeli`}
            onClick={(e) => { e.preventDefault(); setText(String(table).replace(".", ",")); setErr(null); onValid(id, true); onChange(0); }}>
            ↺ tabela
          </button>
        )}</span>
      <span className="calc-inp"><input
        type="text" inputMode="decimal" value={text} aria-label={unit ? `${label} [${unit}]` : label}
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
        }} />{unit && <i aria-hidden="true">{unit}</i>}</span>
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
      <pre tabIndex={0} className="syntax">{stale ? "Popraw zaznaczone pola — wynik nie jest aktualny." : text}</pre>
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
  const pMill = cutPower(qMill, mat.kc);

  // toczenie
  const [dT, setDT] = useState(50);
  const [apT, setApT] = useState(2);
  const [fT, setFT] = useState(0);
  const [vcT, setVcT] = useState(0);
  const [re, setRe] = useState(0.8);
  const vcTurn = vcT || r0(mid(mat.vcTurn) * tm.f);
  const fTurn = fT || r2(mid(mat.fTurn));
  const nTurn = (vcTurn * 1000) / (Math.PI * dT);
  const qTurn = turnRate(vcTurn, apT, fTurn);
  const pTurn = cutPower(qTurn, mat.kc);
  const rz = ((fTurn * fTurn) / (8 * re)) * 1000;

  // wiercenie
  const [dD, setDD] = useState(8);
  const [fD, setFD] = useState(0);
  const [vcD, setVcD] = useState(0);
  const vcDrill = vcD || r0(mid(mat.vcDrill) * (tm.id.startsWith("hss") ? 1 : 2.2));
  const fDrill = fD || r3(Math.min(0.3, dD * 0.02));
  const nDrill = (vcDrill * 1000) / (Math.PI * dD);
  const vfDrill = nDrill * fDrill;
  const qDrill = drillRate(dD, vfDrill);
  const pDrill = cutPower(qDrill, mat.kc); // ten sam model co przy frezowaniu i toczeniu: P = Q · kc

  // gwintowanie
  const [thr, setThr] = useState("M10");
  const th = THREADS.find((t) => t.name === thr)!;
  const [nTap, setNTap] = useState(400);
  const fTap = nTap * th.pitch;

  const reset = () => { setVcM(0); setFzM(0); setVcT(0); setFT(0); setVcD(0); };

  // wybór pary materiałów — te same pola w kartach „Dane” frezowania, toczenia i wiercenia
  const matBox = (range: [number, number]) => (
    <>
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
      <p className="calc-range">
        Zakres Vc (węglik z powłoką) <b>{range[0]}–{range[1]} m/min</b> · <Link href="/slownik#kc-właściwy-opór-skrawania">opór właściwy</Link> kc1 <b>{mat.kc} N/mm²</b>
        {mat.note && <span className="calc-matnote">{mat.note}</span>}
      </p>
    </>
  );

  return (
    <div className="grid gap-5 calc-page">
      <header className="calc-head">
        <div>
          <h1><span className="calc-kicker">Kalkulator</span> {BANNERS[tab].title}</h1>
          <p>{BANNERS[tab].sub}</p>
        </div>
        <div className="segmented" role="tablist" aria-label="Rodzaj obróbki">
          {([["mill", "Frezowanie"], ["turn", "Toczenie"], ["drill", "Wiercenie"], ["thread", "Gwintowanie"]] as [Tab, string][]).map(([k, l]) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
      </header>

      {tab === "mill" && (
        <section className="grid gap-3 calc-section">
          <div className="calc-card calc-in"><h2 className="calc-h">Dane</h2>{matBox(mat.vcMill)}<div className="calc-grid">
            <Field id="m-vc" label="Prędkość skrawania Vc" unit="m/min" value={vcMill} onChange={setVcM} rule={{ min: 0, max: 2000 }} preset={!vcM} table={r0(mid(mat.vcMill) * tm.f)} onValid={onValid} />
            <Field id="m-d" label="Średnica freza D" unit="mm" value={d} onChange={setD} rule={{ min: 0, max: 200 }} onValid={onValid} />
            <Field id="m-z" label="Liczba ostrzy z" value={z} onChange={setZ} rule={{ min: 1, max: 20, int: true, minIncl: true }} onValid={onValid} />
            <Field id="m-fz" label="Posuw na ostrze fz" unit="mm" value={fz} onChange={setFzM} rule={{ min: 0, max: 2 }} preset={!fzM} table={r3(mid(mat.fz))} onValid={onValid} />
            <Field id="m-ap" label="Głębokość ap" unit="mm" value={ap} onChange={setAp} rule={{ min: 0, max: 100 }} onValid={onValid} />
            <Field id="m-ae" label="Szerokość ae" unit="mm" value={ae} onChange={setAe} rule={{ min: 0, max: Math.max(d, 0.001), minIncl: false }} onValid={onValid} />
          </div></div>
          <CalcFig kind="mill" d={d} ae={Math.min(ae, d)} ap={ap} z={z} />
          <div className="calc-card calc-side"><h2 className="calc-h">Wynik</h2>
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
              Posuw skorygowano współczynnikiem {r2(thin)}, czyli fz efektywne {r3(fzCorr)} mm. Bez korekty wiór byłby cieńszy, niż zakłada fz — ostrze może wtedy trzeć zamiast skrawać.
            </div>
          )}
          <div className="calc-card calc-formulas"><h2 className="calc-h">Jak to policzono</h2>
            <Formula>n = 1000 · Vc / (π · D) = 1000 · {vcMill} / (π · {d}) = <strong>{r0(nMill)} obr/min</strong></Formula>
            <Formula>Vf = n · z · fz = {r0(nMill)} · {z} · {r3(fzCorr)} = <strong>{r0(vfMill)} mm/min</strong></Formula>
            <Formula>Q = ap · ae · Vf / 1000 = {ap} · {ae} · {r0(vfMill)} / 1000 = <strong>{r2(qMill)} cm³/min</strong></Formula>
            <Formula>P = Q · kc / 60000 = {r2(qMill)} · {mat.kc} / 60000 = <strong>{r2(pMill)} kW</strong></Formula>
          </div>
          
        </section>
      )}

      {tab === "turn" && (
        <section className="grid gap-3 calc-section">
          <div className="calc-card calc-in"><h2 className="calc-h">Dane</h2>{matBox(mat.vcTurn)}<div className="calc-grid">
            <Field id="t-vc" label="Prędkość skrawania Vc" unit="m/min" value={vcTurn} onChange={setVcT} rule={{ min: 0, max: 2000 }} preset={!vcT} table={r0(mid(mat.vcTurn) * tm.f)} onValid={onValid} />
            <Field id="t-d" label="Średnica D" unit="mm" value={dT} onChange={setDT} rule={{ min: 0, max: 1000 }} onValid={onValid} />
            <Field id="t-f" label="Posuw f" unit="mm/obr" value={fTurn} onChange={setFT} rule={{ min: 0, max: 3 }} preset={!fT} table={r2(mid(mat.fTurn))} onValid={onValid} />
            <Field id="t-ap" label="Głębokość ap" unit="mm" value={apT} onChange={setApT} rule={{ min: 0, max: 50 }} onValid={onValid} />
            <Field id="t-re" label="Promień naroża rε" unit="mm" value={re} onChange={setRe} rule={{ min: 0, max: 5 }} onValid={onValid} />
          </div></div>
          <CalcFig kind="turn" d={dT} ap={apT} f={fTurn} re={re} rt={rz} />
          <div className="calc-card calc-side"><h2 className="calc-h">Wynik</h2>
          <StaleNote show={staleOf("t-")} />
          <div className="calc-outs">
            <Out big label="Obroty przy tej średnicy" value={r0(nTurn)} unit="obr/min" stale={staleOf("t-")} />
            <Out big label="Chropowatość Rt (teoret.)" value={r2(rz)} unit="µm" stale={staleOf("t-")} />
            <Out label="Wydajność Q" value={r2(qTurn)} unit="cm³/min" stale={staleOf("t-")} />
            <Out label="Szacowana moc skrawania" value={r2(pTurn)} unit="kW" stale={staleOf("t-")} />
          </div>
          <CodeOut stale={staleOf("t-")} text={`G50 S${Math.min(4000, r0(nTurn * 2))}   (LIMIT OBROTOW - DOBIERZ DO UCHWYTU)\nG96 S${vcTurn} M03\nG99   (MM/OBR: FANUC SYSTEM A; SINUMERIK I FANUC B/C: G95)\nG01 X_ Z_ F${fTurn}`} />
          </div>
          <div className="calc-card calc-formulas"><h2 className="calc-h">Jak to policzono</h2>
            <Formula>n = 1000 · Vc / (π · D) = 1000 · {vcTurn} / (π · {dT}) = <strong>{r0(nTurn)} obr/min</strong></Formula>
            <Formula>Q = Vc · ap · f = {vcTurn} · {apT} · {fTurn} = <strong>{r2(qTurn)} cm³/min</strong></Formula>
            <Formula>P = Q · kc / 60000 = {r2(qTurn)} · {mat.kc} / 60000 = <strong>{r2(pTurn)} kW</strong></Formula>
            <Formula>Rt ≈ f² / (8 · rε) · 1000 = {fTurn}² / (8 · {re}) · 1000 = <strong>{r2(rz)} µm</strong></Formula>
          </div>
          <p className="text-sm text-muted max-w-prose">W tym modelu teoretyczna wysokość nierówności Rt zależy tylko od posuwu i promienia naroża — obroty we wzorze nie występują. Rzeczywista chropowatość zależy też od drgań, zużycia ostrza i materiału; potwierdza ją pomiar. Ra wynosi orientacyjnie ok. Rt / 4 (lekcja T2.3).</p>
          
        </section>
      )}

      {tab === "drill" && (
        <section className="grid gap-3 calc-section">
          <div className="calc-card calc-in"><h2 className="calc-h">Dane</h2>{matBox(mat.vcDrill)}<div className="calc-grid">
            <Field id="d-vc" label="Prędkość skrawania Vc" unit="m/min" value={vcDrill} onChange={setVcD} rule={{ min: 0, max: 500 }} preset={!vcD} table={r0(mid(mat.vcDrill) * (tm.id.startsWith("hss") ? 1 : 2.2))} onValid={onValid} />
            <Field id="d-d" label="Średnica wiertła D" unit="mm" value={dD} onChange={setDD} rule={{ min: 0, max: 100 }} onValid={onValid} />
            <Field id="d-f" label="Posuw f" unit="mm/obr" value={fDrill} onChange={setFD} rule={{ min: 0, max: 2 }} preset={!fD} table={r3(Math.min(0.3, dD * 0.02))} onValid={onValid} />
          </div></div>
          <CalcFig kind="drill" d={dD} f={fDrill} />
          <div className="calc-card calc-side"><h2 className="calc-h">Wynik</h2>
          <StaleNote show={staleOf("d-")} />
          <div className="calc-outs">
            <Out big label="Obroty S" value={r0(nDrill)} unit="obr/min" stale={staleOf("d-")} />
            <Out big label="Posuw F" value={r0(vfDrill)} unit="mm/min" stale={staleOf("d-")} />
            <Out label="Wydajność Q" value={r2(qDrill)} unit="cm³/min" stale={staleOf("d-")} />
            <Out label="Szacowana moc skrawania" value={r2(pDrill)} unit="kW" stale={staleOf("d-")} />
          </div>
          <CodeOut stale={staleOf("d-")} text={`S${r0(nDrill)} M03\nG99 G83 X_ Y_ Z_ R2 Q${Math.max(1, Math.round(dD * 0.7))} F${r0(vfDrill)}\nG80`} />
          </div>
          <div className="calc-card calc-formulas"><h2 className="calc-h">Jak to policzono</h2>
            <Formula>n = 1000 · Vc / (π · D) = <strong>{r0(nDrill)} obr/min</strong></Formula>
            <Formula>Vf = n · f = {r0(nDrill)} · {fDrill} = <strong>{r0(vfDrill)} mm/min</strong></Formula>
            <Formula>Q = π · D² / 4 · Vf / 1000 = π · {dD}² / 4 · {r0(vfDrill)} / 1000 = <strong>{r2(qDrill)} cm³/min</strong></Formula>
            <Formula>P = Q · kc / 60000 = {r2(qDrill)} · {mat.kc} / 60000 = <strong>{r2(pDrill)} kW</strong></Formula>
          </div>
          <p className="text-sm text-muted max-w-prose">Przy otworach głębszych niż ok. 3 × D stosuje się zwykle wiercenie z wycofaniem (G83, lekcja F5.2) — granicę podaje producent wiertła. Orientacyjny posuw na start: ok. 2% średnicy wiertła na obrót.</p>
          
        </section>
      )}

      {tab === "thread" && (
        <section className="grid gap-3 calc-section">
          <div className="calc-card calc-in"><h2 className="calc-h">Dane</h2><div className="calc-grid">
            <label className="calc-field"><span>Gwint</span>
              <select value={thr} onChange={(e) => setThr(e.target.value)}>{THREADS.map((t) => <option key={t.name}>{t.name}</option>)}</select></label>
            <Field id="g-n" label="Obroty gwintowania" unit="obr/min" value={nTap} onChange={setNTap} rule={{ min: 10, max: 10000, int: true, minIncl: true }} onValid={onValid} />
          </div></div>
          <CalcFig kind="thread" name={th.name} pitch={th.pitch} drill={th.drill} />
          <div className="calc-card calc-side"><h2 className="calc-h">Wynik</h2>
          <StaleNote show={staleOf("g-")} />
          <div className="calc-outs">
            <Out big label="Otwór pod gwintownik" value={th.drill} unit="mm" />
            <Out big label="Posuw gwintowania F" value={r0(fTap)} unit="mm/min" stale={staleOf("g-")} />
            <Out label="Skok" value={th.pitch} unit="mm" />
            <Out label="⌀ pod gwint zewnętrzny" value={th.outer} unit="mm" />
          </div>
          <CodeOut stale={staleOf("g-")} text={`M29 S${nTap}\nG99 G84 X_ Y_ Z_ R5 F${r0(fTap)}\nG80`} />
          </div>
          <div className="calc-card calc-formulas"><h2 className="calc-h">Jak to policzono</h2>
            <Formula>F = n · skok = {nTap} · {th.pitch} = <strong>{r0(fTap)} mm/min</strong></Formula>
            <Formula>⌀ otworu ≈ ⌀ nominalna − skok = {th.name.slice(1)} − {th.pitch} = <strong>{th.drill} mm</strong></Formula>
          </div>
          <p className="note note-warn max-w-prose">Posuw gwintowania wynika ze skoku: przy G94 F = S · skok, przy G95 F = skok. Inna wartość rozjeżdża ruch osi Z z obrotem wrzeciona — przy gwintowaniu sztywnym grozi to zniszczeniem gwintu albo złamaniem gwintownika (lekcja F5.3).</p>
          
          <div className="calc-card calc-threads">
            <h2 className="calc-h">Gwinty metryczne zwykłe — wybierz rozmiar</h2>
            <div className="calc-picks">
              {THREADS.map((t) => (
                <button key={t.name} type="button" className="calc-pick" aria-pressed={t.name === thr} onClick={() => setThr(t.name)}>
                  <b>{t.name}</b>
                  <span>skok {pl(t.pitch)}</span>
                  <span>otwór {pl(t.drill)}</span>
                  <span>zewn. {pl(t.outer)}</span>
                </button>
              ))}
            </div>
            <p className="calc-range">Skok i średnica otworu w mm. „Zewn.” to średnica wałka pod gwint zewnętrzny.</p>
          </div>
        </section>
      )}

      <div className="calc-notes">
        <section className="calc-card">
          <h2 className="calc-h">Wartości z tabeli</h2>
          <p>Vc, fz i f oznaczone „tabela” to orientacyjne punkty startowe dla wybranej pary materiałów — nie dane katalogowe konkretnego narzędzia. Przed obróbką porównaj je z katalogiem producenta. Każde pole możesz nadpisać, a przyciskiem „↺ tabela” wrócić do wartości z tabeli.</p>
        </section>
        <section className="calc-card">
          <h2 className="calc-h">Moc skrawania a moc wrzeciona</h2>
          <p>Szacowana moc skrawania to moc zużywana na samo skrawanie: P = Q · kc. Wymagana moc napędu wrzeciona jest większa: P / η, gdzie η to sprawność napędu z danych maszyny.</p>
        </section>
        <section className="calc-card">
          <h2 className="calc-h">W lekcjach</h2>
          <ul>
            <li><Link href="/nauka/frezowanie/f2-2-obroty-s-m03">F2.2 Obroty</Link></li>
            <li><Link href="/nauka/frezowanie/f2-3-posuw-f-g94">F2.3 Posuw na ostrze</Link></li>
            <li><Link href="/nauka/frezowanie/f5-3-g84-gwintowanie">F5.3 Gwintowanie</Link></li>
            <li><Link href="/nauka/toczenie/t2-2-g96-g97-limit-obrotow">T2.2 G96 i limit obrotów</Link></li>
            <li><Link href="/nauka/toczenie/t2-3-posuw-na-obrot">T2.3 Posuw na obrót i Rt</Link></li>
          </ul>
        </section>
        <section className="calc-card calc-src">
          <h2 className="calc-h">Źródła</h2>
          <ul>
            <li>Prędkość skrawania i posuw na ostrze (z nich wzory na n i Vf) — R. Kuryjański, <i>Obróbka skrawaniem i obrabiarki</i>, Warszawa 2011, rozdz. 3, s. 53–54 (wzory 3.1 i 3.4).</li>
            <li>Dobór parametrów jako kompromis dokładności, wydajności i kosztu — B. Storch, <i>Podstawy obróbki skrawaniem</i>, Koszalin (rok wydania nieustalony), rozdz. 4.1, s. 168.</li>
            <li>Wydajność Q i moc netto przy frezowaniu i toczeniu — Sandvik Coromant, <i>Milling formulas and definitions</i> oraz <i>Turning formulas and definitions</i> (sandvik.coromant.com, dostęp 2026-11-14). Wiercenie liczone tym samym modelem P = Q · kc, gdzie Q to pole przekroju otworu razy posuw minutowy.</li>
            <li>Rt i otwór pod gwint — źródło do uzupełnienia.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
