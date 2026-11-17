"use client";
import NumberFlow from "@number-flow/react";
import { isFinished, progressKey, useProgress } from "@/lib/progress";

/*
  Wskaźnik postępu nauki z realnego zapisu (src/lib/progress.ts, localStorage + konto).
  Linijka segmentów jak wskaźnik słupkowy na pulpicie: jeden segment = jedna lekcja.
*/
export type MeterLesson = { track: "frezowanie" | "toczenie"; id: string };

export function useLearnCounts(lessons: MeterLesson[]) {
  const prog = useProgress();
  const done = (l: MeterLesson) => isFinished(prog[progressKey(l.track, l.id)]);
  const by = (t: MeterLesson["track"]) => { const ls = lessons.filter((l) => l.track === t); return { list: ls.map(done), done: ls.filter(done).length, total: ls.length }; };
  const mill = by("frezowanie"), turn = by("toczenie");
  return { mill, turn, done: mill.done + turn.done, total: mill.total + turn.total };
}

function Bar({ cells }: { cells: boolean[] }) {
  return (
    <span className="lm-bar" aria-hidden>
      {cells.map((on, i) => <i key={i} className={on ? "is-on" : undefined} />)}
    </span>
  );
}

export default function LearnMeter({ lessons }: { lessons: MeterLesson[] }) {
  const c = useLearnCounts(lessons);
  const pct = c.total ? Math.round((c.done / c.total) * 100) : 0;
  return (
    <div className="lm" aria-label={`Postęp nauki: ${c.done} z ${c.total} lekcji`}>
      <div className="lm-head">
        <span className="lm-k">Postęp nauki</span>
        <span className="lm-v"><NumberFlow value={c.done} />/{c.total}</span>
      </div>
      <div className="lm-row"><span className="lm-t">FREZ</span><Bar cells={c.mill.list} /></div>
      <div className="lm-row"><span className="lm-t">TOK</span><Bar cells={c.turn.list} /></div>
      <span className="lm-pct" aria-hidden>{pct}%</span>
    </div>
  );
}
