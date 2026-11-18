"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Simulator from "@/components/simulator/Simulator";
import SplitHandle from "@/components/simulator/SplitHandle";
import StatusLed from "@/components/tactile/StatusLed";
import TactileSegmentedControl from "@/components/tactile/TactileSegmentedControl";
import { checkExercise, type CheckResult } from "@/lib/checker";
import type { Exercise } from "@/lib/content";
import { exerciseTools } from "@/lib/programLibrary";
import { markExerciseDone } from "@/lib/exercisesDone";

/*
  Strona zadania: po lewej treść zadania (z serwera, jako children), przyciski, podpowiedzi i wynik,
  po prawej warsztat. Na komputerze całość mieści się w wysokości okna (.task-grid w globals.css).
*/
export default function Runner({ ex, children }: { ex: Exercise; children?: ReactNode }) {
  const [src, setSrc] = useState(ex.starter);
  // narzędzia dobrane do zadania (np. gwintownik w zadaniu z gwintami) — stała tabela dla całej sesji zadania
  const [tools] = useState(() => exerciseTools(ex.tools));
  const [res, setRes] = useState<CheckResult | null>(null);
  const [showRef, setShowRef] = useState(false);
  const [hintsShown, setHintsShown] = useState(0);
  // telefon i tablet: zakładki Zadanie | Program (na komputerze obie kolumny naraz)
  const [tab, setTab] = useState<"brief" | "shop">("brief");

  // wynik, podpowiedź i rozwiązanie pojawiają się pod przyciskami — przewijamy do nich kolumnę z treścią
  const tail = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (res || hintsShown > 0 || showRef) tail.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [res, hintsShown, showRef]);

  const run = () => {
    const r = checkExercise(src, { mode: ex.mode, reference: ex.reference, tolerance: ex.tolerance, requireCodes: ex.requireCodes, forbidCodes: ex.forbidCodes, maxCutLength: ex.maxCutLength });
    setRes(r);
    if (r.passed) markExerciseDone(ex.slug);
    setTab("brief");
  };

  return (
    <div className={`task-grid is-tab-${tab}`}>
      <div className="task-tabs">
        <TactileSegmentedControl<"brief" | "shop"> label="Widok zadania" value={tab} onChange={setTab} full size="sm"
          options={[{ value: "brief", label: "Zadanie" }, { value: "shop", label: "Program i symulacja" }]} />
      </div>
      <aside className="task-brief" aria-label="Treść zadania">
        {children}
        <div className="task-actions">
          <button className="btn" onClick={run}>Sprawdź program</button>
          {hintsShown < ex.hints.length && <button onClick={() => setHintsShown((n) => n + 1)}>Podpowiedź {hintsShown + 1}/{ex.hints.length}</button>}
          <button onClick={() => setShowRef((v) => !v)}>{showRef ? "Ukryj rozwiązanie" : "Rozwiązanie"}</button>
          <button onClick={() => { setSrc(ex.starter); setRes(null); }}>Od nowa</button>
        </div>

        <div ref={tail} className="task-tail">
        {res && (
          <div className={`result ${res.passed ? "ok" : "bad"}`} role="status">
            <div className="result-head"><StatusLed state={res.passed ? "ready" : "warning"} pulse={false} />{res.passed ? "Zaliczone" : `Jeszcze nie — ${res.score}%`}</div>
            <ul>
              {res.checks.map((c, i) => (
                <li key={i} className={c.ok ? "ok" : "bad"}>
                  <span aria-hidden>{c.ok ? "✓" : "✗"}</span> {c.label}{c.detail ? ` — ${c.detail}` : ""}
                </li>
              ))}
            </ul>
            {!res.passed && <p className="text-sm text-muted">Porównywany jest sam tor roboczy, więc możesz dojść do celu własną drogą. Liczy się geometria, nie identyczny zapis.</p>}
          </div>
        )}

        {hintsShown > 0 && (
          <ul className="grid gap-2">{ex.hints.slice(0, hintsShown).map((h, i) => <li key={i} className="note note-info">{h}</li>)}</ul>
        )}

        {showRef && (
          <div className="grid gap-2">
            <h2 className="task-h">Rozwiązanie wzorcowe</h2>
            <pre tabIndex={0} className="syntax">{ex.reference}</pre>
            <button className="btn ghost w-fit" onClick={() => { setSrc(ex.reference); setRes(null); }}>Wczytaj do edytora</button>
          </div>
        )}
        </div>
      </aside>
      <div className="task-shop">
        {/* telefon / tablet: sprawdzenie bez przechodzenia do zakładki z treścią */}
        <div className="task-shop-check"><button className="btn" onClick={run}>Sprawdź program</button>{res && <span className={`zx-state${res.passed ? " is-ok" : ""}`}><StatusLed state={res.passed ? "ready" : "warning"} pulse={false} />{res.passed ? "Zaliczone" : `${res.score}%`}</span>}</div>
        <SplitHandle scope=".task-grid" first=":scope > .task-brief" cssVar="--brief-w" storageKey="gcat:task:briefw" min={260} maxFrac={0.5} label="Szerokość kolumny z treścią zadania" />
        <Simulator lesson source={src} onSourceChange={(v) => { setSrc(v); setRes(null); }} mode={ex.mode} stock={ex.stock} tools={tools} reference={ex.reference} />
      </div>
    </div>
  );
}
