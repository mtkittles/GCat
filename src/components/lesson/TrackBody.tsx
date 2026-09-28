"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { progressKey, resetTrack, useProgress } from "@/lib/progress";

/*
  Plan ścieżki: moduły jako karty (na komputerze w siatce) i panel boczny
  z postępem, przyciskiem „kontynuuj” i rysunkiem detalu przewodniego.
*/

export type TrackLesson = { id: string; title: string; href: string | null; minutes?: number };
export type TrackModule = { id: string; title: string; lessons: TrackLesson[] };

export default function TrackBody({ track, modules, part, partFig, other }: {
  track: string; modules: TrackModule[]; part: string; partFig?: ReactNode; other: { href: string; label: string };
}) {
  const prog = useProgress();
  const all = modules.flatMap((m) => m.lessons).filter((l) => l.href);
  const done = all.filter((l) => prog[progressKey(track, l.id)]?.done);
  const nextUp = all.find((l) => !prog[progressKey(track, l.id)]?.done) ?? all[0];
  const started = done.length > 0 || all.some((l) => prog[progressKey(track, l.id)]?.visited);
  const pct = all.length ? Math.round((done.length / all.length) * 100) : 0;

  return (
    <div className="tp-body">
      <ol className="tp-mods">
        {modules.map((m) => {
          const ready = m.lessons.filter((l) => l.href);
          const mDone = ready.filter((l) => prog[progressKey(track, l.id)]?.done).length;
          return (
            <li key={m.id} className="tp-mod">
              <h2><span className="tp-mid">{m.id}</span>{m.title}{ready.length > 0 && <span className="tp-mod-bar">{mDone}/{ready.length}</span>}</h2>
              <ol className="tp-lessons">
                {m.lessons.map((l) => {
                  const isDone = !!prog[progressKey(track, l.id)]?.done;
                  return (
                    <li key={l.id}>
                      {l.href ? (
                        <Link href={l.href} className={`tp-l is-ready${isDone ? " is-done" : ""}`}>
                          <span className="tp-lid">{l.id}</span>
                          <span className="tp-lt">{l.title}</span>
                          <span className="tp-lm">{isDone ? <b className="tp-check" aria-label="zaliczona">✓</b> : `${l.minutes} min`}</span>
                        </Link>
                      ) : (
                        <div className="tp-l is-planned" aria-disabled>
                          <span className="tp-lid">{l.id}</span>
                          <span className="tp-lt">{l.title}</span>
                          <span className="tp-lm">wkrótce</span>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </li>
          );
        })}
      </ol>

      <aside className="tp-side" aria-label="Postęp i detal">
        <div className="tp-card">
          <h2>Twój postęp</h2>
          <div className="tp-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${pct}%` }} /></div>
          <p>{done.length} z {all.length} lekcji zaliczonych{pct ? ` · ${pct}%` : ""}. Lekcję zalicza test od 80% albo ręczne oznaczenie.</p>
          {nextUp?.href && <Link href={nextUp.href} className="btn">{started ? "Kontynuuj" : "Zacznij"}: {nextUp.id} {nextUp.title}</Link>}
          {started && <button type="button" className="tp-reset" onClick={() => { if (window.confirm("Wyzerować postęp tej ścieżki?")) resetTrack(track); }}>Wyzeruj postęp ścieżki</button>}
        </div>
        <div className="tp-card">
          <h2>Detal przewodni</h2>
          <p>{part}. Każda lekcja dopisuje do jego programu kolejny fragment.</p>
          {partFig}
        </div>
        <Link href={other.href} className="tp-switch">{other.label}</Link>
      </aside>
    </div>
  );
}
