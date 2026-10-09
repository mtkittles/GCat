"use client";
import { useState } from "react";
import Simulator from "@/components/simulator/Simulator";
import type { TaskCheck } from "@/lib/lesson";
import { runTaskChecks } from "@/lib/taskCheck";

/*
  Zadanie „dopisz do programu”: edytor z symulatorem, sprawdzanie według listy warunków.
  Porównywana jest geometria i położenia, a nie identyczny zapis.
*/

export default function ProgramTask({ starter, checks, hints = [], solution, mode = "mill" }: { starter: string; checks: TaskCheck[]; hints?: string[]; solution: string; mode?: "mill" | "lathe" }) {
  const [src, setSrc] = useState(starter);
  const [res, setRes] = useState<ReturnType<typeof runTaskChecks> | null>(null);
  const [hint, setHint] = useState(0);
  const [showSol, setShowSol] = useState(false);
  return (
    <div className="ptask">
      <Simulator source={src} onSourceChange={(v) => { setSrc(v); setRes(null); }} mode={mode} reference={showSol ? solution : undefined}
        stock={mode === "mill" ? { x: 80, y: 50, z: 20, ox: 0, oy: 0, oz: 20 } : undefined} />
      <div className="ptask-actions">
        <button type="button" className="btn" onClick={() => setRes(runTaskChecks(src, checks, mode))}>Sprawdź program</button>
        <button type="button" className="btn ghost" onClick={() => { setSrc(starter); setRes(null); }}>Od nowa</button>
        {hint < hints.length && <button type="button" className="btn ghost" onClick={() => setHint(hint + 1)}>Podpowiedź {hint + 1}/{hints.length}</button>}
        <button type="button" className="btn ghost" onClick={() => setShowSol(!showSol)}>{showSol ? "Ukryj rozwiązanie" : "Rozwiązanie"}</button>
      </div>
      {hint > 0 && <ul className="grid gap-2">{hints.slice(0, hint).map((h, i) => <li key={i} className="note note-info">{h}</li>)}</ul>}
      {res && (
        <div className={`result ${res.passed ? "ok" : "bad"}`}>
          <div className="result-head">{res.passed ? "Zaliczone" : "Jeszcze nie"}</div>
          <ul>{res.checks.map((c, i) => <li key={i} className={c.ok ? "ok" : "bad"}><span aria-hidden>{c.ok ? "✓" : "✗"}</span> {c.label}{c.detail ? ` — ${c.detail}` : ""}</li>)}</ul>
          {res.passed && <p className="text-sm text-muted mt-2">Zaliczenie obejmuje tylko warunki z listy. Nie zastępuje sprawdzenia programu na konkretnej obrabiarce.</p>}
        </div>
      )}
      {showSol && (
        <div className="grid gap-2">
          <pre className="syntax">{solution}</pre>
          <button type="button" className="btn ghost w-fit" onClick={() => { setSrc(solution); setRes(null); }}>Wczytaj do edytora</button>
        </div>
      )}
    </div>
  );
}
