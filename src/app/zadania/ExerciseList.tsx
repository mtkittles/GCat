"use client";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import PageBanner from "@/components/ui/PageBanner";
import { exercises } from "@/lib/content";

const LEVEL = { 1: "podstawy", 2: "średni", 3: "zaawansowany" } as const;
const EMPTY: string[] = [];
let cache: string[] = EMPTY; let cacheRaw = "";
const getDone = () => {
  try { const raw = localStorage.getItem("gcat:zadania") || "[]"; if (raw !== cacheRaw) { cacheRaw = raw; cache = JSON.parse(raw); } return cache; } catch { return EMPTY; }
};
const subscribe = (cb: () => void) => { window.addEventListener("storage", cb); return () => window.removeEventListener("storage", cb); };

export default function ExerciseList() {
  const done = useSyncExternalStore(subscribe, getDone, () => EMPTY);
  return (
    <div className="grid gap-5">
      <PageBanner src="/img/banner-tasks.jpg" title="Zadania"
        subtitle="Napisz program, a symulator porówna Twój tor narzędzia z rozwiązaniem wzorcowym." priority />
      <div>
        <h1 className="text-3xl font-bold">Zadania</h1>
        <p className="section-lead">Napisz program, a symulator porówna Twój tor narzędzia z rozwiązaniem wzorcowym. Nie musisz trafić w identyczny zapis — liczy się geometria.</p>
        {done.length > 0 && <p className="text-sm text-muted mt-1">Zaliczone: {done.length} z {exercises.length}</p>}
      </div>
      <ol className="grid gap-2 max-w-2xl">
        {exercises.map((e, i) => (
          <li key={e.slug}>
            <Link href={`/zadania/${e.slug}`} className="tile flex gap-4 items-start">
              <span className="font-mono text-xl font-bold w-6" style={{ color: done.includes(e.slug) ? "var(--green)" : "var(--accent)" }}>{done.includes(e.slug) ? "✓" : i + 1}</span>
              <span>
                <span className="font-semibold block">{e.title}</span>
                <span className="text-sm text-muted">{LEVEL[e.level]} · {e.mode === "mill" ? "frezowanie" : "toczenie"} — {e.brief.slice(0, 110)}…</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
