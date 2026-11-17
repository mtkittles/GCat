"use client";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import NumberFlow from "@number-flow/react";
import { ArrowRight } from "lucide-react";
import StatusLed from "@/components/tactile/StatusLed";
import { isFinished, progressKey, useProgress } from "@/lib/progress";

/*
  Panel postępu obok powitania: liczniki z treści serwisu (lekcje, karty kodów, gotowe programy)
  i karta powrotu do nauki z zapisu postępu w przeglądarce. Liczniki ruszają od zera po hydratacji.
*/
export type ResumeLesson = { track: "frezowanie" | "toczenie"; id: string; title: string; href: string };

const hydrated = () => true;
const noop = () => () => {};

export default function ResumePanel({ lessons, counts }: { lessons: ResumeLesson[]; counts: { lessons: number; codes: number; programs: number } }) {
  const prog = useProgress();
  const live = useSyncExternalStore(noop, hydrated, () => false);
  const P = (l: ResumeLesson) => prog[progressKey(l.track, l.id)];
  const done = lessons.filter((l) => isFinished(P(l))).length;

  // ostatnio otwierana lekcja, jeśli nieukończona; inaczej pierwsza nieukończona w tej samej ścieżce
  const visited = lessons.filter((l) => P(l)?.visited).sort((a, b) => (P(b)!.visited ?? 0) - (P(a)!.visited ?? 0));
  const track = visited[0]?.track ?? "frezowanie";
  const next = visited[0] && !isFinished(P(visited[0])) ? visited[0] : lessons.find((l) => l.track === track && !isFinished(P(l))) ?? lessons.find((l) => !isFinished(P(l)));
  const other = lessons.find((l) => l.track !== track && !isFinished(P(l)));
  const inTrack = lessons.filter((l) => l.track === next?.track);
  const doneInTrack = inTrack.filter((l) => isFinished(P(l))).length;
  const started = visited.length > 0 || done > 0;

  return (
    <div className="rp">
      <dl className="rp-dro">
        <div><dt>Lekcje</dt><dd><NumberFlow value={live ? counts.lessons : 0} /></dd></div>
        <div><dt>Kody G/M</dt><dd><NumberFlow value={live ? counts.codes : 0} /></dd></div>
        <div><dt>Detale</dt><dd><NumberFlow value={live ? counts.programs : 0} /></dd></div>
      </dl>

      {next ? (
        <Link href={next.href} className="rp-card">
          <span className="rp-k"><StatusLed state={started ? "on" : "ready"} />{started ? "Wznów naukę" : "Pierwsza lekcja"}</span>
          <span className="rp-l"><code>{next.id}</code>{next.title}</span>
          <span className="rp-meta">
            <span>{next.track === "frezowanie" ? "Frezowanie" : "Toczenie"} · ukończone <b><NumberFlow value={live ? doneInTrack : 0} /></b>/{inTrack.length}</span>
            <ArrowRight aria-hidden />
          </span>
          <span className="rp-bar" aria-hidden><i style={{ width: `${inTrack.length ? (doneInTrack / inTrack.length) * 100 : 0}%` }} /></span>
        </Link>
      ) : (
        <div className="rp-card is-done"><span className="rp-k"><StatusLed state="ready" />Obie ścieżki ukończone</span><span className="rp-l">{done} z {lessons.length} lekcji</span></div>
      )}
      {other && next && (
        <Link href={other.href} className="rp-alt">
          {other.track === "frezowanie" ? "Frezowanie" : "Toczenie"}: <code>{other.id}</code> {other.title}
        </Link>
      )}
    </div>
  );
}
