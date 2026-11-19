"use client";
import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import NumberFlow from "@number-flow/react";
import { ArrowRight } from "lucide-react";
import StatusLed from "@/components/tactile/StatusLed";
import { isFinished, progressKey, useProgress } from "@/lib/progress";

/*
  Karta „Twój następny krok” obok powitania (V3): jedna lekcja do otwarcia — ostatnio otwierana,
  jeśli nieukończona, inaczej pierwsza nieukończona w tej samej ścieżce — ze zdjęciem ścieżki,
  numerem lekcji w ścieżce i paskiem postępu. Pod nią jedna linia do drugiej ścieżki.
  Liczniki serwisu są w linii pod przyciskami powitania (page.tsx), nie w kafelkach.
*/
export type ResumeLesson = { track: "frezowanie" | "toczenie"; id: string; title: string; href: string };
type Track = ResumeLesson["track"];

const hydrated = () => true;
const noop = () => () => {};
const NAME: Record<Track, string> = { frezowanie: "Frezowanie", toczenie: "Toczenie" };

export default function ResumePanel({ lessons, img }: { lessons: ResumeLesson[]; img: Record<Track, string> }) {
  const prog = useProgress();
  const live = useSyncExternalStore(noop, hydrated, () => false);
  const P = (l: ResumeLesson) => prog[progressKey(l.track, l.id)];
  const done = lessons.filter((l) => isFinished(P(l))).length;

  // ostatnio otwierana lekcja, jeśli nieukończona; inaczej pierwsza nieukończona w tej samej ścieżce
  const visited = lessons.filter((l) => P(l)?.visited).sort((a, b) => (P(b)!.visited ?? 0) - (P(a)!.visited ?? 0));
  const track = visited[0]?.track ?? "frezowanie";
  const next = visited[0] && !isFinished(P(visited[0])) ? visited[0] : lessons.find((l) => l.track === track && !isFinished(P(l))) ?? lessons.find((l) => !isFinished(P(l)));
  const other = lessons.find((l) => l.track !== next?.track && !isFinished(P(l)));
  const inTrack = lessons.filter((l) => l.track === next?.track);
  const doneInTrack = inTrack.filter((l) => isFinished(P(l))).length;
  const pos = next ? inTrack.indexOf(next) + 1 : 0;
  const started = visited.length > 0 || done > 0;

  return (
    <div className="rp">
      {next ? (
        <Link href={next.href} className="rp-card">
          <span className="rp-k"><StatusLed state={started ? "on" : "ready"} />{started ? "Wznów naukę" : "Twój następny krok"}</span>
          <span className="rp-row">
            <span className="rp-img"><Image src={img[next.track]} alt="" fill sizes="96px" /></span>
            <span className="rp-txt">
              <span className="rp-sub">{NAME[next.track]} · lekcja {pos} z {inTrack.length}</span>
              <span className="rp-l"><code>{next.id}</code>{next.title}</span>
              <span className="rp-meta">ukończone <b><NumberFlow value={live ? doneInTrack : 0} /></b>/{inTrack.length}</span>
            </span>
            <span className="rp-go" aria-hidden><ArrowRight /></span>
          </span>
          <span className="rp-bar" aria-hidden><i style={{ width: `${inTrack.length ? (doneInTrack / inTrack.length) * 100 : 0}%` }} /></span>
        </Link>
      ) : (
        <div className="rp-card is-done"><span className="rp-k"><StatusLed state="ready" />Obie ścieżki ukończone</span><span className="rp-l">{done} z {lessons.length} lekcji</span></div>
      )}
      {other && next && (
        <Link href={other.href} className="rp-alt">
          <span className="rp-alt-img"><Image src={img[other.track]} alt="" fill sizes="36px" /></span>
          <span>{other.track === "toczenie" ? "Wolisz tokarkę?" : "Wolisz frezarkę?"} <b>{NAME[other.track]}: <code>{other.id}</code> {other.title}</b></span>
          <ArrowRight aria-hidden />
        </Link>
      )}
    </div>
  );
}
