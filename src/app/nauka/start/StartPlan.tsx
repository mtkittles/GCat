"use client";
import Link from "next/link";
import { isFinished, isPassed, progressKey, useProgress } from "@/lib/progress";

type Day = { day: number; title: string; goal: string; lessons: { id: string; title: string; href: string; minutes: number }[] };

export default function StartPlan({ days }: { days: Day[] }) {
  const prog = useProgress();
  const P = (id: string) => prog[progressKey("frezowanie", id)];
  const next = days.flatMap((d) => d.lessons).find((l) => !isFinished(P(l.id)));
  return (
    <div className="grid gap-4">
      {next && <Link href={next.href} className="btn w-fit">Kontynuuj: {next.id} {next.title}</Link>}
      <ol className="s7">
        {days.map((d) => {
          const done = d.lessons.filter((l) => isFinished(P(l.id))).length;
          return (
            <li key={d.day} className={`s7-day${done === d.lessons.length ? " is-done" : ""}`}>
              <div className="s7-head"><span className="s7-n">Dzień {d.day}</span><b>{d.title}</b><span className="s7-m">{done}/{d.lessons.length} · {d.lessons.reduce((a, l) => a + l.minutes, 0)} min</span></div>
              <p className="s7-goal">{d.goal}</p>
              <ul className="s7-lessons">
                {d.lessons.map((l) => { const p = P(l.id); const st = isPassed(p) ? "✓" : isFinished(p) ? "•" : ""; return (
                  <li key={l.id}><Link href={l.href} className={st ? "is-done" : undefined}><i aria-hidden>{st}</i><code>{l.id}</code><span>{l.title}</span><small>{l.minutes} min</small></Link></li>
                ); })}
              </ul>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
