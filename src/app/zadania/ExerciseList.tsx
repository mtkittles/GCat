"use client";
import { useState, type ReactNode } from "react";
import NumberFlow from "@number-flow/react";
import SpotlightCard from "@/components/tactile/SpotlightCard";
import StatusLed from "@/components/tactile/StatusLed";
import TactileSegmentedControl from "@/components/tactile/TactileSegmentedControl";
import { exercises } from "@/lib/content";
import { useDone } from "@/lib/exercisesDone";
import EmptyState from "@/components/ui/EmptyState";
import Shared, { vtName } from "@/components/ui/Shared";
import { motionClass } from "@/lib/motionClass";
import { pl } from "@/lib/plural";

/*
  Lista zadań: nagłówek z postępem (zaliczone z zapisu w przeglądarce / koncie), przełączniki maszyny
  i poziomu, siatka kart z rysunkiem detalu z rozwiązania wzorcowego na siatce współrzędnych,
  wymaganymi kodami (pole requireCodes zadania) i zieloną diodą przy zaliczonych.
*/
const LEVEL = { 1: "podstawy", 2: "średni", 3: "zaawansowany" } as const;
type Mode = "all" | "mill" | "lathe";
type Lvl = "0" | "1" | "2" | "3";

export default function ExerciseList({ previews = {} }: { previews?: Record<string, ReactNode> }) {
  const done = useDone();
  const [mode, setMode] = useState<Mode>("all");
  const [lvl, setLvl] = useState<Lvl>("0");
  const shown = exercises.map((e, i) => ({ e, i })).filter(({ e }) => (mode === "all" || e.mode === mode) && (lvl === "0" || e.level === Number(lvl)));
  const passed = exercises.filter((e) => done.includes(e.slug)).length;

  return (
    <div className="grid gap-5">
      <header className="ph zx-head">
        <div className="grid gap-2">
          <h1 className="ph-title">Zadania <span className="ph-n">{pl(exercises.length, "zadanie", "zadania", "zadań")}</span></h1>
          <p className="ph-lead">Napisz program, a symulator porówna tor narzędzia z rozwiązaniem wzorcowym. Liczy się geometria toru, nie identyczny zapis.</p>
        </div>
        <div className="zx-prog" aria-label={`Zaliczone ${passed} z ${exercises.length}`}>
          <span className="tl-prog-v"><NumberFlow value={passed} /><small>/{exercises.length}</small></span>
          <span className="lm-bar" aria-hidden>{exercises.map((e) => <i key={e.slug} className={done.includes(e.slug) ? "is-on" : undefined} />)}</span>
          <span className="tl-prog-k">zaliczone</span>
        </div>
      </header>

      <div className="zx-filters">
        <TactileSegmentedControl<Mode> label="Maszyna" size="sm" value={mode} onChange={setMode}
          options={[{ value: "all", label: "Wszystkie", led: false }, { value: "mill", label: "Frezowanie", led: false }, { value: "lathe", label: "Toczenie", led: false }]} />
        <TactileSegmentedControl<Lvl> label="Poziom" size="sm" value={lvl} onChange={setLvl}
          options={[{ value: "0", label: "Każdy poziom", led: false }, { value: "1", label: "Podstawy", led: false }, { value: "2", label: "Średni", led: false }, { value: "3", label: "Zaawansowany", led: false }]} />
        <span className="kc-count" aria-live="polite"><NumberFlow value={shown.length} /><small>/{exercises.length}</small></span>
      </div>

      <ol className="zx-grid">
        {shown.map(({ e, i }) => {
          const ok = done.includes(e.slug);
          return (
            <li key={e.slug}>
              <SpotlightCard href={`/zadania/${e.slug}`} className={`zx-card${ok ? " is-done" : ""}`} aria-label={`Zadanie ${i + 1}: ${e.title}${ok ? " — zaliczone" : ""}`}>
                {previews[e.slug] && <span className="zx-fig bg-cnc-grid">{previews[e.slug]}</span>}
                <span className="zx-body">
                  <span className="zx-top">
                    <code className="zx-n">{String(i + 1).padStart(2, "0")}</code>
                    <span className="zx-meta">{LEVEL[e.level]} · {e.mode === "mill" ? "frezowanie" : "toczenie"}</span>
                    <span className={`zx-state${ok ? " is-ok" : ""}`}><StatusLed state={ok ? "ready" : "idle"} pulse={false} />{ok ? "Zaliczone" : "Do zrobienia"}</span>
                  </span>
                  <Shared name={vtName("zad", e.slug)}><span className="zx-title">{e.title}</span></Shared>
                  <span className="zx-brief">{e.brief}</span>
                  {e.requireCodes && e.requireCodes.length > 0 && (
                    <span className="zx-codes" aria-label="Wymagane kody">
                      {e.requireCodes.map((c) => <code key={c} className={motionClass(c).trim() || undefined}>{c}</code>)}
                    </span>
                  )}
                </span>
              </SpotlightCard>
            </li>
          );
        })}
      </ol>
      {shown.length === 0 && (
        <EmptyState title="Brak zadań dla tej maszyny na wybranym poziomie."
          action={<button type="button" className="key empty-btn" onClick={() => { setMode("all"); setLvl("0"); }}>Pokaż wszystkie zadania</button>} />
      )}
    </div>
  );
}
