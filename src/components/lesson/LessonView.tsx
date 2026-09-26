import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import Article from "@/components/Article";
import { rich } from "@/components/Rich";
import { diagrams } from "@/components/diagrams";
import LessonPager from "@/components/LessonPager";
import TocDrawer from "@/components/TocDrawer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Chip from "@/components/ui/Chip";
import PageBanner from "@/components/ui/PageBanner";
import { buildup } from "@/content/nauka/buildup";
import { sources } from "@/content/nauka/sources";
import { flat, lessonDoc, lessonHref, orderOf, tracks, type Track } from "@/lib/course";
import Buildup, { type ShownLine } from "./Buildup";
import JogDemo from "./JogDemo";
import OffsetJog from "./OffsetJog";
import StateExplorer from "./StateExplorer";
import ProgramTask from "./ProgramTask";
import { PointDrill } from "./PointGrid";
import Quiz from "./Quiz";

function Sec({ id, n, title, children }: { id: string; n?: number; title: string; children: ReactNode }) {
  return (
    <section className="ls-sec" aria-labelledby={`${id}-h`}>
      <h2 id={id} className="ls-h">{n !== undefined && <i aria-hidden>{n}</i>}<span id={`${id}-h`}>{title}</span></h2>
      {children}
    </section>
  );
}

export default function LessonView({ track, slug }: { track: Track; slug: string }) {
  const plan = lessonDoc(track, slug);
  const doc = plan?.doc;
  if (!plan || !doc) notFound();
  const T = tracks[track];
  const all = flat(track);
  const idx = orderOf(track, doc.id);
  const ready = all.filter((l) => l.doc);
  const r = ready.findIndex((l) => l.id === doc.id);
  const prev = ready[r - 1], next = ready[r + 1];

  const bu = buildup[track];
  const lines: ShownLine[] = bu.lines
    .flatMap((l) => {
      const o = orderOf(track, l.since);
      const u = l.until ? orderOf(track, l.until) : Infinity;
      if (idx >= u) return [];
      if (o > idx && l.until) return [];
      const state: ShownLine["state"] = o < idx ? "old" : o === idx ? "new" : "future";
      return [{ ...l, state, sinceTitle: all[o]?.title }];
    });

  const quizFigs: Record<string, ReactNode> = {};
  doc.quiz.forEach((q) => { if (q.kind === "choice" && q.fig && diagrams[q.fig]) quizFigs[q.fig] = diagrams[q.fig](); });

  const toc = [
    { id: "cel", label: "Cel lekcji" },
    { id: "teoria", label: "Teoria" },
    { id: "przyklad", label: "Przykład rozwiązany" },
    { id: "sprobuj", label: "Spróbuj sam" },
    { id: "bledy", label: "Typowe błędy" },
    ...(doc.controllers ? [{ id: "sterowania", label: "Fanuc i Sinumerik" }] : []),
    { id: "test", label: "Sprawdź się" },
    { id: "program", label: "Program detalu" },
    { id: "podsumowanie", label: "Podsumowanie" },
  ];
  let n = 0;

  return (
    <article className="grid gap-7 ls">
      <Breadcrumbs items={[{ href: "/", label: "GCat" }, { href: "/nauka", label: "Nauka" }, { href: `/nauka/${track}`, label: T.title }, { label: doc.id }]} />
      <PageBanner src={T.banner} kicker={`${doc.id}  ·  ${plan.module.id} ${plan.module.title}`} title={doc.title}
        meta={<><Chip>{doc.minutes} min</Chip><Chip tone="info">{T.title.toLowerCase()}</Chip></>} size="compact" priority />

      <section className="ls-goal" aria-labelledby="cel">
        <h2 id="cel">Cel lekcji</h2>
        <p>{rich(doc.goal)}</p>
      </section>

      <Sec id="teoria" n={++n} title="Teoria"><Article blocks={doc.theory} /></Sec>

      <Sec id="przyklad" n={++n} title="Przykład rozwiązany">
        <h3 className="ls-sub">{doc.worked.title}</h3>
        <p className="ls-p">{rich(doc.worked.intro)}</p>
        {doc.worked.fig && diagrams[doc.worked.fig]?.()}
        <ol className="ls-steps">
          {doc.worked.steps.map((s, i) => (
            <li key={i}><span>{rich(s.x)}</span>{s.code && <code>{s.code}</code>}</li>
          ))}
        </ol>
        <p className="ls-result">{rich(doc.worked.result)}</p>
      </Sec>

      <Sec id="sprobuj" n={++n} title="Spróbuj sam">
        {doc.practice.map((p, i) => (
          <div key={i} className="ls-practice">
            <p className="ls-p">{rich(p.intro)}</p>
            {p.kind === "jog" ? <JogDemo goals={p.goals} />
              : p.kind === "offset" ? <OffsetJog parts={p.parts} goals={p.goals} set={p.set} />
              : p.kind === "drill" ? <Quiz questions={p.questions} drill />
              : p.kind === "state" ? <StateExplorer program={p.program} />
              : p.kind === "task" ? <ProgramTask starter={p.starter} checks={p.checks} hints={p.hints} solution={p.solution} />
              : <PointDrill tasks={p.tasks} />}
          </div>
        ))}
      </Sec>

      <Sec id="bledy" n={++n} title="Typowe błędy">
        <div className="ls-pits">
          {doc.pitfalls.map((p) => (
            <div key={p.title} className="ls-pit">
              <h3>{p.title}</h3>
              <p>{rich(p.x)}</p>
              {p.fig && diagrams[p.fig]?.()}
            </div>
          ))}
        </div>
      </Sec>

      {doc.controllers && (
        <Sec id="sterowania" n={++n} title="Fanuc i Sinumerik">
          <div className="overflow-x-auto">
            <table className="code-table ls-ctl">
              <thead><tr><th /><th>Fanuc</th><th>Sinumerik</th></tr></thead>
              <tbody>{doc.controllers.rows.map((row) => (
                <tr key={row[0]}><th scope="row">{row[0]}</th><td>{rich(row[1])}</td><td>{rich(row[2])}</td></tr>
              ))}</tbody>
            </table>
          </div>
          {doc.controllers.note && <p className="cap">{rich(doc.controllers.note)}</p>}
        </Sec>
      )}

      <Sec id="test" n={++n} title="Sprawdź się"><Quiz questions={doc.quiz} figs={quizFigs} /></Sec>

      <Sec id="program" n={++n} title="Program detalu">
        <p className="ls-p">Detal przewodni ścieżki: {T.part.toLowerCase()}. Każda lekcja dopisuje do programu to, czego właśnie się nauczyłeś. Tapnij linię, żeby zobaczyć, co robi.</p>
        <Buildup title={bu.title} lines={lines} lessonId={doc.id} mode={T.mode} />
      </Sec>

      <Sec id="podsumowanie" n={++n} title="Podsumowanie">
        <ul className="ls-sum">{doc.summary.map((s) => <li key={s}>{rich(s)}</li>)}</ul>
      </Sec>

      <section className="ls-src" aria-labelledby="zrodla">
        <h2 id="zrodla">Źródła</h2>
        <ul>
          {doc.sources.map((s) => {
            const src = sources[s.id];
            return <li key={s.id}><b title={src?.full}>{src?.short ?? s.id}</b> — {s.where}</li>;
          })}
        </ul>
      </section>

      <LessonPager pos={idx + 1} total={all.length}
        prev={prev ? { href: lessonHref(track, prev.slug!), label: `${prev.id} ${prev.title}` } : undefined}
        next={next ? { href: lessonHref(track, next.slug!), label: `${next.id} ${next.title}` }
          : { href: `/nauka/${track}`, label: "Plan ścieżki" }} />
      <TocDrawer items={toc} title={doc.id} />
    </article>
  );
}
