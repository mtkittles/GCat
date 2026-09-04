"use client";
import { useState } from "react";

const r1 = (v: number) => (Number.isFinite(v) ? Math.round(v * 10) / 10 : 0);
const r3 = (v: number) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : 0);

function Field({ label, unit, value, onChange }: { label: string; unit: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="grid gap-1 text-sm"><span>{label} <span className="text-muted">[{unit}]</span></span>
      <input type="number" inputMode="decimal" className="border border-line rounded px-2 py-1.5 bg-white font-mono" value={value} onChange={(e) => onChange(Number(e.target.value))} /></label>
  );
}
function Out({ label, value, unit }: { label: string; value: number | string; unit: string }) {
  return <div className="bg-panel text-white rounded-md p-3"><div className="text-xs opacity-70">{label}</div><div className="font-mono text-2xl">{value} <span className="text-sm opacity-70">{unit}</span></div></div>;
}

export default function Calc() {
  const [vc, setVc] = useState(150); const [d, setD] = useState(10); const [z, setZ] = useState(4); const [fz, setFz] = useState(0.05);
  const n = (vc * 1000) / (Math.PI * d); const vf = n * z * fz;
  const [vct, setVct] = useState(200); const [dt, setDt] = useState(50); const [fr, setFr] = useState(0.25); const [ap, setAp] = useState(2);
  const nt = (vct * 1000) / (Math.PI * dt); const vft = nt * fr; const q = vct * fr * ap;
  const [vcd, setVcd] = useState(30); const [dd, setDd] = useState(8); const [frd, setFrd] = useState(0.15);
  const nd = (vcd * 1000) / (Math.PI * dd);
  return (
    <div className="grid gap-8">
      <div><h1 className="text-3xl font-bold">Kalkulator obrotów i posuwu</h1>
        <p className="text-muted max-w-prose">Wzory: n = 1000·Vc / (π·D), Vf = n·z·fz (frezowanie), Vf = n·f (toczenie, wiercenie). Prędkość skrawania Vc bierz z katalogu narzędzia dla danego materiału.</p></div>

      <section className="grid gap-3"><h2 className="text-xl font-bold">Frezowanie</h2>
        <div className="grid gap-3 sm:grid-cols-4"><Field label="Prędkość skrawania Vc" unit="m/min" value={vc} onChange={setVc} /><Field label="Średnica freza D" unit="mm" value={d} onChange={setD} /><Field label="Liczba ostrzy z" unit="—" value={z} onChange={setZ} /><Field label="Posuw na ostrze fz" unit="mm" value={fz} onChange={setFz} /></div>
        <div className="grid gap-3 sm:grid-cols-3"><Out label="Obroty S" value={Math.round(n)} unit="obr/min" /><Out label="Posuw F (G94)" value={Math.round(vf)} unit="mm/min" /><Out label="Posuw na obrót" value={r3(z * fz)} unit="mm/obr" /></div>
        <p className="text-sm text-muted">Do programu: <code>S{Math.round(n)} M03</code> i <code>F{Math.round(vf)}</code>.</p></section>

      <section className="grid gap-3"><h2 className="text-xl font-bold">Toczenie</h2>
        <div className="grid gap-3 sm:grid-cols-4"><Field label="Prędkość skrawania Vc" unit="m/min" value={vct} onChange={setVct} /><Field label="Średnica D" unit="mm" value={dt} onChange={setDt} /><Field label="Posuw f" unit="mm/obr" value={fr} onChange={setFr} /><Field label="Głębokość ap" unit="mm" value={ap} onChange={setAp} /></div>
        <div className="grid gap-3 sm:grid-cols-3"><Out label="Obroty przy tej średnicy" value={Math.round(nt)} unit="obr/min" /><Out label="Posuw minutowy" value={Math.round(vft)} unit="mm/min" /><Out label="Wydajność Q" value={r1(q)} unit="cm³/min" /></div>
        <p className="text-sm text-muted">Do programu: <code>G96 S{vct}</code> z limitem <code>G50 S{Math.min(4000, Math.round(nt * 2))}</code> i <code>G95 F{fr}</code>.</p></section>

      <section className="grid gap-3"><h2 className="text-xl font-bold">Wiercenie</h2>
        <div className="grid gap-3 sm:grid-cols-3"><Field label="Prędkość skrawania Vc" unit="m/min" value={vcd} onChange={setVcd} /><Field label="Średnica wiertła D" unit="mm" value={dd} onChange={setDd} /><Field label="Posuw f" unit="mm/obr" value={frd} onChange={setFrd} /></div>
        <div className="grid gap-3 sm:grid-cols-2"><Out label="Obroty S" value={Math.round(nd)} unit="obr/min" /><Out label="Posuw F (G94)" value={Math.round(nd * frd)} unit="mm/min" /></div></section>

      <p className="text-sm text-muted max-w-prose">Wyniki są punktem startu — dopasuj do sztywności mocowania, wysięgu narzędzia i chłodzenia. Typowe Vc dla węglika: aluminium 200–500, stal konstrukcyjna 120–250, stal nierdzewna 80–150, tytan 40–70 m/min.</p>
    </div>
  );
}
