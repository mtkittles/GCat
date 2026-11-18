"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import NumberFlow from "@number-flow/react";
import { ArrowRight } from "lucide-react";
import StatusLed from "@/components/tactile/StatusLed";
import TactileSegmentedControl from "@/components/tactile/TactileSegmentedControl";
import { isFinished, isPassed, isRead, progressKey, resetTrack, restoreProgress, useProgress } from "@/lib/progress";
import { toast } from "sonner";
import Shared, { vtName } from "@/components/ui/Shared";

/*
  Plan ścieżki jako lista: przełącznik Frezowanie ↔ Toczenie, postęp z zapisu nauki (NumberFlow + linijka
  segmentów), „Kontynuuj naukę”, moduły z wierszami lekcji (dioda stanu, kod, tytuł, plakietki Test / Symulator).
  `nav` — przełącznik zmienia adres (/nauka/frezowanie ↔ /nauka/toczenie); bez niego przełącza na miejscu (/nauka).
*/
export type Track = "frezowanie" | "toczenie";
export type PlanLesson = { id: string; title: string; href: string | null; minutes?: number; test: boolean; sim: boolean };
export type PlanModule = { id: string; title: string; skill?: string; lessons: PlanLesson[] };
export type PlanTrack = { title: string; profile: string; part: string; modules: PlanModule[]; partFig?: ReactNode };

export default function TrackLessons({ tracks, initial, nav = false, aside }: {
  tracks: Record<Track, PlanTrack>; initial: Track; nav?: boolean; aside?: ReactNode;
}) {
  const router = useRouter();
  const [track, setTrack] = useState<Track>(initial);
  const prog = useProgress();
  const T = tracks[track];
  const P = (id: string) => prog[progressKey(track, id)];
  const all = T.modules.flatMap((m) => m.lessons).filter((l) => l.href);
  const finished = all.filter((l) => isFinished(P(l.id)));
  const passed = all.filter((l) => isPassed(P(l.id))).length;
  const next = all.find((l) => !isFinished(P(l.id)));
  const started = finished.length > 0 || all.some((l) => P(l.id)?.visited);

  const choose = (t: Track) => { if (nav) router.push(`/nauka/${t}`); else setTrack(t); };
  const count = (t: Track) => tracks[t].modules.flatMap((m) => m.lessons).filter((l) => l.href).length;

  return (
    <div className="tl">
      <div className="tl-head">
        <TactileSegmentedControl<Track> label="Ścieżka nauki" value={track} onChange={choose}
          options={(["frezowanie", "toczenie"] as const).map((t) => ({ value: t, label: <>{tracks[t].title} <small className="tl-n">{count(t)}</small></> }))} />
        <div className="tl-prog" aria-label={`Ukończone ${finished.length} z ${all.length} lekcji, testem ${passed}`}>
          <span className="tl-prog-v"><NumberFlow value={finished.length} /><small>/{all.length}</small></span>
          <span className="lm-bar" aria-hidden>{all.map((l) => <i key={l.id} className={isFinished(P(l.id)) ? "is-on" : undefined} />)}</span>
          <span className="tl-prog-k">ukończone · testem {passed}</span>
        </div>
        {next
          ? <Link href={next.href!} className="btn tl-go">{started ? "Kontynuuj naukę" : "Zacznij"}: <code>{next.id}</code> <ArrowRight aria-hidden /></Link>
          : <span className="tl-done"><StatusLed state="ready" />Ścieżka ukończona</span>}
      </div>

      <p className="tl-profile">{T.profile}</p>

      <div className="tl-body">
        <ol className="tl-mods">
          {T.modules.map((m) => {
            const ready = m.lessons.filter((l) => l.href);
            const done = ready.filter((l) => isFinished(P(l.id))).length;
            return (
              <li key={m.id} className="tl-mod">
                <div className="tl-mod-h">
                  <span className="tl-mid">{m.id}</span>
                  <h2>{m.title}</h2>
                  {ready.length > 0 && <span className="tl-mod-n">{done}/{ready.length}</span>}
                </div>
                {m.skill && <p className="tl-skill">{m.skill}</p>}
                <ol className="tl-rows">
                  {m.lessons.map((l) => {
                    const p = P(l.id);
                    const isNext = l.id === next?.id;
                    const state = isPassed(p) ? "zaliczona testem" : isRead(p) ? "przeczytana" : isNext ? "następna" : undefined;
                    const body = (
                      <>
                        <StatusLed state={isPassed(p) ? "ready" : isRead(p) ? "ready" : isNext ? "on" : "idle"} pulse={isNext} className={isRead(p) ? "is-dim" : undefined} />
                        <Shared name={vtName("lek", l.id)}><code className="tl-id">{l.id}</code></Shared>
                        <span className="tl-t">{l.title}</span>
                        <span className="tl-tags">
                          {l.test && <span className="tl-tag">Test</span>}
                          {l.sim && <span className="tl-tag">Symulator</span>}
                        </span>
                        <span className="tl-meta">{l.href ? state ?? `${l.minutes} min` : "wkrótce"}</span>
                      </>
                    );
                    return (
                      <li key={l.id}>
                        {l.href
                          ? <Link href={l.href} className={`tl-row${isNext ? " is-next" : ""}`} aria-current={isNext ? "step" : undefined}>{body}</Link>
                          : <div className="tl-row is-planned" aria-disabled>{body}</div>}
                      </li>
                    );
                  })}
                </ol>
              </li>
            );
          })}
        </ol>

        <aside className="tl-side" aria-label="Detal przewodni">
          <div className="tl-card">
            <p className="cp-k">Detal przewodni</p>
            <p>{T.part}. Każda lekcja dopisuje do jego programu kolejny fragment.</p>
            {T.partFig}
          </div>
          {aside}
          {started && <button type="button" className="tp-reset" onClick={() => {
            // bez okna potwierdzenia: zerowanie od razu, z możliwością cofnięcia w powiadomieniu
            const prev = resetTrack(track);
            toast(`Wyzerowano postęp: ${T.title.toLowerCase()}`, { action: { label: "Cofnij", onClick: () => restoreProgress(prev) }, duration: 8000 });
          }}>Wyzeruj postęp ścieżki</button>}
        </aside>
      </div>
    </div>
  );
}
