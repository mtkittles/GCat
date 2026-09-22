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
      <PageBanner src="/img/banner-tasks.jpg" kicker="Praktyka" title="Zadania"
        subtitle="Napisz program, symulator porówna tor z rozwiązaniem."
        meta={done.length > 0 ? <span className="chip chip-success">Zaliczone {done.length} z {exercises.length}</span> : undefined}
        info={<ul>
          <li>Liczy się geometria toru, nie identyczny zapis programu.</li>
          <li>Zadania są ułożone od najprostszych. Zaliczone oznaczamy ✓.</li>
        </ul>} priority />
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
