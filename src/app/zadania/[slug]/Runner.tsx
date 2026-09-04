"use client";
import { useState } from "react";
import Simulator from "@/components/simulator/Simulator";
import { checkExercise, type CheckResult } from "@/lib/checker";
import type { Exercise } from "@/lib/content";

const KEY = "gcat:zadania";
const saveDone = (slug: string) => { try { const d = JSON.parse(localStorage.getItem(KEY) || "[]"); if (!d.includes(slug)) localStorage.setItem(KEY, JSON.stringify([...d, slug])); } catch {} };

export default function Runner({ ex }: { ex: Exercise }) {
  const [src, setSrc] = useState(ex.starter);
  const [res, setRes] = useState<CheckResult | null>(null);
  const [showRef, setShowRef] = useState(false);
  const [hintsShown, setHintsShown] = useState(0);

  const run = () => {
    const r = checkExercise(src, { mode: ex.mode, reference: ex.reference, tolerance: ex.tolerance, requireCodes: ex.requireCodes, forbidCodes: ex.forbidCodes, maxCutLength: ex.maxCutLength });
    setRes(r);
    if (r.passed) saveDone(ex.slug);
  };

  return (
    <div className="grid gap-4">
      <Simulator source={src} onSourceChange={(v) => { setSrc(v); setRes(null); }} mode={ex.mode} />

      <div className="filters">
        <button className="btn" onClick={run}>Sprawdź rozwiązanie</button>
        <button onClick={() => { setSrc(ex.starter); setRes(null); }}>Zacznij od nowa</button>
        {hintsShown < ex.hints.length && <button onClick={() => setHintsShown((n) => n + 1)}>Podpowiedź {hintsShown + 1}/{ex.hints.length}</button>}
        <button onClick={() => setShowRef((v) => !v)}>{showRef ? "Ukryj rozwiązanie" : "Pokaż rozwiązanie"}</button>
      </div>

      {hintsShown > 0 && (
        <ul className="grid gap-2">{ex.hints.slice(0, hintsShown).map((h, i) => <li key={i} className="note note-info">{h}</li>)}</ul>
      )}

      {res && (
        <div className={`result ${res.passed ? "ok" : "bad"}`}>
          <div className="result-head">{res.passed ? "Zaliczone" : `Jeszcze nie — ${res.score}%`}</div>
          <ul>
            {res.checks.map((c, i) => (
              <li key={i} className={c.ok ? "ok" : "bad"}>
                <span aria-hidden>{c.ok ? "✓" : "✗"}</span> {c.label}{c.detail ? ` — ${c.detail}` : ""}
              </li>
            ))}
          </ul>
          {!res.passed && <p className="text-sm text-muted">Porównywany jest sam tor roboczy, więc możesz dojść do celu własną drogą — liczy się geometria, nie identyczny zapis.</p>}
        </div>
      )}

      {showRef && (
        <div className="grid gap-2">
          <h2 className="text-lg font-bold">Rozwiązanie wzorcowe</h2>
          <pre className="syntax">{ex.reference}</pre>
          <button className="btn ghost w-fit" onClick={() => { setSrc(ex.reference); setRes(null); }}>Wczytaj do edytora</button>
        </div>
      )}
    </div>
  );
}
