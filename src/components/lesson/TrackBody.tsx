"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { isFinished, isPassed, isRead, progressKey, resetTrack, useProgress } from "@/lib/progress";
import { plural } from "@/lib/plural";

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
  const P = (id: string) => prog[progressKey(track, id)];
  const passed = all.filter((l) => isPassed(P(l.id)));
  const read = all.filter((l) => isRead(P(l.id)));
  const nextUp = all.find((l) => !isFinished(P(l.id))) ?? all[0];
  const started = passed.length + read.length > 0 || all.some((l) => P(l.id)?.visited);
  const pct = all.length ? Math.round((passed.length / all.length) * 100) : 0;
  const pctRead = all.length ? Math.round((read.length / all.length) * 100) : 0;

  return (
    <div className="tp-body">
      <ol className="tp-mods">
        {modules.map((m) => {
          const ready = m.lessons.filter((l) => l.href);
          const mDone = ready.filter((l) => isPassed(P(l.id))).length;
          return (
            <li key={m.id} className="tp-mod">
              <h2><span className="tp-mid">{m.id}</span>{m.title}{ready.length > 0 && <span className="tp-mod-bar">{mDone}/{ready.length}</span>}</h2>
              <ol className="tp-lessons">
                {m.lessons.map((l) => {
                  const isDone = isPassed(P(l.id)), isRd = isRead(P(l.id));
                  return (
                    <li key={l.id}>
                      {l.href ? (
                        <Link href={l.href} className={`tp-l is-ready${isDone ? " is-done" : isRd ? " is-read" : ""}`}>
                          <span className="tp-lid">{l.id}</span>
                          <span className="tp-lt">{l.title}</span>
                          <span className="tp-lm">{isDone ? <b className="tp-check" title="zaliczona testem" aria-label="zaliczona testem">✓</b> : isRd ? <b className="tp-read" title="przeczytana" aria-label="przeczytana">•</b> : `${l.minutes} min`}</span>
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
          <div className="tp-bar" role="progressbar" aria-label="Lekcje zaliczone testem" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${pct}%` }} /><i className="is-read" style={{ width: `${pctRead}%` }} /></div>
          <p>Zaliczone testem: <b>{passed.length}</b> · przeczytane: <b>{read.length}</b> · razem {all.length} {plural(all.length, "lekcja", "lekcje", "lekcji")}. Test zalicza wynik od 80%; „przeczytana” to Twoje ręczne oznaczenie.</p>
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
