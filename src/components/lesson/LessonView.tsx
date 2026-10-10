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
import { sourceDoc, sources } from "@/content/nauka/sources";
import { flat, lessonDoc, lessonHref, orderOf, tracks, type Track } from "@/lib/course";
import Buildup, { type ShownLine } from "./Buildup";
import PartState from "./PartState";
import JogDemo from "./JogDemo";
import OffsetJog from "./OffsetJog";
import StateExplorer from "./StateExplorer";
import ProgramTask from "./ProgramTask";
import LatheJog from "./LatheJog";
import CssWidget from "./CssWidget";
import { PointDrill } from "./PointGrid";
import Quiz from "./Quiz";
import { LessonNav, LessonRail, LessonStatus } from "./LessonSide";

function Sec({ id, n, title, children }: { id: string; n?: number; title: string; children: ReactNode }) {
  return (
    <section className="ls-sec" aria-labelledby={`${id}-h`}>
      <h2 id={id} className="ls-h">{n !== undefined && <i aria-hidden>{n}</i>}<span id={`${id}-h`}>{title}</span></h2>
      {children}
    </section>
  );
}

/* Wersje sterowań, do których odnoszą się tabele porównawcze (bibliografia: src/content/nauka/sources.ts). */
const FANUC_VER = { frezowanie: "Series 0i-F Plus, frezarka", toczenie: "Series 0i-F Plus, tokarka, system A" } as const;
const SIEMENS_VER = "840D sl / 828D, wyd. 10/2015";

export default function LessonView({ track, slug }: { track: Track; slug: string }) {
  const plan = lessonDoc(track, slug);
  const doc = plan?.doc;
  if (!plan || !doc) notFound();
  const fanucVer = FANUC_VER[track];
  const T = tracks[track];
  const native = doc.dialect === "sinumerik";
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
  const modLessons = plan.module.lessons.map((l) => ({ id: l.id, title: l.title, href: l.doc ? lessonHref(track, l.slug!) : null }));
  const prevLink = prev ? { href: lessonHref(track, prev.slug!), label: `${prev.id} ${prev.title}` } : undefined;
  const nextLink = next ? { href: lessonHref(track, next.slug!), label: `${next.id} ${next.title}` } : { href: `/nauka/${track}`, label: "Plan ścieżki" };

  return (
    <article className="ls">
      <Breadcrumbs items={[{ href: "/", label: "GCat" }, { href: "/nauka", label: "Nauka" }, { href: `/nauka/${track}`, label: T.title }, { label: doc.id }]} />
      <PageBanner src={T.banner} kicker={`${doc.id}  ·  ${plan.module.id} ${plan.module.title}`} title={doc.title}
        meta={<><Chip>{doc.minutes} min</Chip><Chip tone="info">{T.title.toLowerCase()}</Chip></>} size="compact" priority />

      <div className="ls-layout">
      <aside className="ls-left">
        <LessonNav toc={toc} track={track} moduleLabel={`${plan.module.id} ${plan.module.title}`} lessons={modLessons} currentId={doc.id} />
      </aside>
      <div className="ls-main grid gap-7">

      <section className="ls-goal" aria-labelledby="cel">
        <h2 id="cel">Cel lekcji</h2>
        <p>{rich(doc.goal)}</p>
        <p className="ls-profile">{native
          ? "Zapis przykładów w tej lekcji: SINUMERIK — natywny język Siemensa (Programming Manual Fundamentals, wyd. 10/2015). Odpowiedniki Fanuc (ISO) — w sekcji „Fanuc i Sinumerik”."
          : T.profile}</p>
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
              : p.kind === "lathejog" ? <LatheJog goals={p.goals} setZ={p.setZ} />
              : p.kind === "css" ? <CssWidget vc0={p.vc} limit0={p.limit} />
              : p.kind === "task" ? <ProgramTask starter={p.starter} checks={p.checks} hints={p.hints} solution={p.solution} mode={p.mode} />
              : <PointDrill tasks={p.tasks} />}
          </div>
        ))}
      </Sec>

      <Sec id="bledy" n={++n} title="Typowe błędy">
        {doc.pitfalls.some((p) => p.danger) && <p className="ls-pit-key"><span><i className="is-danger" aria-hidden />czerwona karta — kolizja, uszkodzenie narzędzia albo zagrożenie dla operatora</span><span><i aria-hidden />szara — zły wymiar, alarm albo strata czasu</span></p>}
        <div className="ls-pits">
          {doc.pitfalls.map((p) => (
            <div key={p.title} className={p.danger ? "ls-pit is-danger" : "ls-pit"}>
              {p.danger && <span className="ls-pit-tag">Groźne</span>}
              <h3>{p.title}</h3>
              <p>{rich(p.x)}</p>
              {p.fig && diagrams[p.fig]?.()}
            </div>
          ))}
        </div>
      </Sec>

      {doc.controllers && (
        <Sec id="sterowania" n={++n} title="Fanuc i Sinumerik">
          <p className="ls-p">{native
            ? "Ta lekcja uczy natywnego języka Siemensa. Tabela poniżej zestawia go z zapisem Fanuc (ISO) używanym w pozostałych lekcjach kursu. SINUMERIK z włączonym trybem ISO (zależnie od wersji i opcji sterowania) przyjmuje też zapis z kolumny Fanuc."
            : "Przykłady w lekcji są zapisane w języku Fanuc (ISO). SINUMERIK z włączonym trybem ISO (zależnie od wersji i opcji sterowania) przyjmuje wiele z tych kodów — wtedy obowiązuje kolumna Fanuc. Panel poniżej pokazuje natywny język Siemensa."}</p>
          <details className="ls-native" open={native || undefined}>
            <summary>{native ? "Fanuc (ISO) i SINUMERIK — porównanie" : "SINUMERIK — język natywny: pokaż różnice"}</summary>
            <p className="ls-ctl-vers">Fanuc: {fanucVer} · SINUMERIK: {SIEMENS_VER}</p>
            <div className="overflow-x-auto">
              <table className="code-table ls-ctl tbl-stack">
                <thead><tr><th />
                  <th>{native ? "Fanuc — ISO" : "Fanuc — ISO, przykład główny"}<small className="ls-ctl-ver">{fanucVer}</small></th>
                  <th>{native ? "SINUMERIK — język natywny, ta lekcja" : "SINUMERIK — język natywny"}<small className="ls-ctl-ver">{SIEMENS_VER}</small></th>
                </tr></thead>
                <tbody>{doc.controllers.rows.map((row) => (
                  <tr key={row[0]}><th scope="row">{rich(row[0])}</th><td data-label="Fanuc — ISO">{rich(row[1])}</td><td data-label="SINUMERIK — natywnie">{rich(row[2])}</td></tr>
                ))}</tbody>
              </table>
            </div>
            {doc.controllers.note && <p className="cap">{rich(doc.controllers.note)}</p>}
            <p className="cap">Odniesienie: SINUMERIK 840D sl / 828D — Programming Manual, Fundamentals (wyd. 10/2015); tryb ISO toczenia — ISO Turning (02/2012). Na konkretnej maszynie obowiązuje dokumentacja jej wersji sterowania.</p>
          </details>
        </Sec>
      )}

      <Sec id="test" n={++n} title="Sprawdź się"><Quiz questions={doc.quiz} figs={quizFigs} progressKey={`${track}/${doc.id}`} /></Sec>

      <Sec id="program" n={++n} title="Program detalu">
        <p className="ls-p">Detal przewodni ścieżki: {T.part.toLowerCase()}. Każda lekcja dopisuje do programu to, czego właśnie się nauczyłeś. Wybierz linię, żeby zobaczyć, co robi.</p>
        <PartState track={track} lessonId={doc.id} />
        <Buildup title={bu.title} lines={lines} lessonId={doc.id} mode={T.mode} />
      </Sec>

      <Sec id="podsumowanie" n={++n} title="Podsumowanie">
        <ul className="ls-sum">{doc.summary.map((s) => <li key={s}>{rich(s)}</li>)}</ul>
      </Sec>

      <section className="ls-src" aria-labelledby="zrodla">
        <h2 id="zrodla">Źródła</h2>
        <ul className="ls-src-list">
          {doc.sources.map((s) => {
            const src = sources[s.id];
            const url = s.url ?? src?.url;
            return (
              <li key={s.id + s.where} className="ls-src-item">
                <b>{src?.short ?? s.id}</b>
                {src && <span className="ls-src-doc">{sourceDoc(src)}{src.control && ` — ${src.control}`}</span>}
                <span><i>Potwierdza:</i> {s.where}</span>
                <span><i>Miejsce:</i> {s.loc ?? <em>rozdział i strona do uzupełnienia</em>}</span>
                {src?.note && <span className="ls-src-note">{src.note}</span>}
                {url && <a href={url} target="_blank" rel="noopener noreferrer">Otwórz dokument ↗{src?.accessed && <small> (dostęp {src.accessed})</small>}</a>}
              </li>
            );
          })}
        </ul>
      </section>

      <LessonStatus track={track} id={doc.id} inline />
      <LessonPager pos={idx + 1} total={all.length} prev={prevLink} next={nextLink} />
      </div>
      <div className="ls-right">
        <LessonRail track={track} id={doc.id} lines={lines.map((l) => ({ code: l.code, state: l.state }))}
          meta={[{ label: "Moduł", value: `${plan.module.id} ${plan.module.title}` }, { label: "Czas", value: `${doc.minutes} min` }, { label: "Lekcja", value: `${idx + 1} z ${all.length}` }]}
          prev={prevLink} next={nextLink} />
      </div>
      </div>
      <div className="ls-drawer"><TocDrawer items={toc} title={doc.id} /></div>
    </article>
  );
}
