"use client";
import Link from "next/link";
import { useState } from "react";
import NumberFlow from "@number-flow/react";
import { ArrowRight } from "lucide-react";
import SpotlightCard from "@/components/tactile/SpotlightCard";

/* Obroty wrzeciona z prędkości skrawania: n = 1000 · Vc / (π · D) — ten sam wzór co w /kalkulator. */
function Knob({ id, label, unit, value, min, max, step, onChange }: { id: string; label: string; unit: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <div className="kn">
      <label htmlFor={id} className="kn-l"><span>{label}</span><b>{value}<small> {unit}</small></b></label>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))}
        style={{ "--p": `${((value - min) / (max - min)) * 100}%` } as React.CSSProperties} />
    </div>
  );
}

export default function RpmWidget() {
  const [d, setD] = useState(10);
  const [vc, setVc] = useState(120);
  const n = Math.round((1000 * vc) / (Math.PI * d));
  return (
    <SpotlightCard as="article" className="bw bw-rpm" aria-labelledby="bw-rpm-t">
      <header className="bw-head">
        <h3 id="bw-rpm-t" className="bw-title">Obroty wrzeciona</h3>
        <Link href="/kalkulator" className="bw-link">Kalkulatory <ArrowRight aria-hidden /></Link>
      </header>
      <Knob id="rpm-d" label="Średnica D" unit="mm" value={d} min={1} max={80} step={1} onChange={setD} />
      <Knob id="rpm-vc" label="Prędkość Vc" unit="m/min" value={vc} min={20} max={400} step={5} onChange={setVc} />
      <div className="dro" aria-live="polite">
        <span className="dro-k">S</span>
        <NumberFlow value={n} className="dro-v" format={{ useGrouping: false }} />
        <span className="dro-u">obr/min</span>
      </div>
      <p className="bw-formula">n = 1000 · {vc} / (π · {d}) = <b>{n}</b></p>
    </SpotlightCard>
  );
}
