"use client";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import PageBanner from "@/components/ui/PageBanner";
import { exercises } from "@/lib/content";
import { useDone } from "@/lib/exercisesDone";

const LEVEL = { 1: "podstawy", 2: "średni", 3: "zaawansowany" } as const;

export default function ExerciseList({ previews = {} }: { previews?: Record<string, ReactNode> }) {
  const done = useDone();
  const [mode, setMode] = useState<"all" | "mill" | "lathe">("all");
  const [lvl, setLvl] = useState<0 | 1 | 2 | 3>(0);
  const shown = exercises.map((e, i) => ({ e, i })).filter(({ e }) => (mode === "all" || e.mode === mode) && (!lvl || e.level === lvl));
  return (
    <div className="grid gap-5">
      <PageBanner src="/img/banner-tasks.jpg" kicker="Praktyka" title="Zadania"
        subtitle="Napisz program, symulator porówna tor z rozwiązaniem."
        meta={done.length > 0 ? <span className="chip chip-success">Zaliczone {done.length} z {exercises.length}</span> : undefined}
        info={<ul>
          <li>Liczy się geometria toru, nie identyczny zapis programu.</li>
          <li>Zadania są ułożone od najprostszych. Zaliczone oznaczamy ✓.</li>
        </ul>} priority />
      <div className="ex-filters" role="group" aria-label="Filtry">
        {([["all", "Wszystkie"], ["mill", "Frezowanie"], ["lathe", "Toczenie"]] as const).map(([k, l]) => (
          <button key={k} type="button" className={mode === k ? "is-on" : ""} aria-pressed={mode === k} onClick={() => setMode(k)}>{l}</button>
        ))}
        <span className="ex-sep" />
        {([[0, "Każdy poziom"], [1, "Podstawy"], [2, "Średni"], [3, "Zaawansowany"]] as const).map(([k, l]) => (
          <button key={k} type="button" className={lvl === k ? "is-on" : ""} aria-pressed={lvl === k} onClick={() => setLvl(k)}>{l}</button>
        ))}
      </div>
      <ol className="ex-grid">
        {shown.map(({ e, i }) => {
          const ok = done.includes(e.slug);
          return (
            <li key={e.slug}>
              <Link href={`/zadania/${e.slug}`} className={`ex-card${ok ? " is-done" : ""}`}>
                {previews[e.slug] && <span className="ex-prev">{previews[e.slug]}</span>}
                <span className="ex-body">
                  <span className="ex-top"><b>{ok ? "✓" : i + 1}</b><span>{LEVEL[e.level]} · {e.mode === "mill" ? "frezowanie" : "toczenie"}</span></span>
                  <span className="ex-title">{e.title}</span>
                  <span className="ex-brief">{e.brief.slice(0, 120)}…</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
