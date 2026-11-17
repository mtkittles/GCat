"use client";
import Image from "next/image";
import Link from "next/link";
import NumberFlow from "@number-flow/react";
import { ArrowRight } from "lucide-react";
import { isFinished, progressKey, useProgress } from "@/lib/progress";
import { pl } from "@/lib/plural";
import type { ResumeLesson } from "./ResumePanel";

/*
  Ścieżki nauki — jedyne karty ze zdjęciem na pulpicie. Zachowanie kafli ze zdjęciem jak w całym serwisie:
  ramka, przy najechaniu lekkie powiększenie zdjęcia (bez cienia i błysku).
*/
export type TrackCard = { key: "frezowanie" | "toczenie"; title: string; blurb: string; img: string };

export default function TrackCards({ lessons, tracks }: { lessons: ResumeLesson[]; tracks: TrackCard[] }) {
  const prog = useProgress();
  return (
    <div className="tk">
      {tracks.map((t) => {
        const ls = lessons.filter((l) => l.track === t.key);
        const done = ls.filter((l) => isFinished(prog[progressKey(l.track, l.id)])).length;
        const next = ls.find((l) => !isFinished(prog[progressKey(l.track, l.id)])) ?? ls[0];
        return (
          <Link key={t.key} href={done ? next.href : `/nauka/${t.key}`} className="tk-card">
            <span className="tk-photo"><Image src={t.img} alt="" fill sizes="(min-width: 1024px) 40vw, 100vw" className="nk-photo" /></span>
            <span className="tk-body">
              <span className="tk-top">
                <b>{t.title}</b>
                <span className="tk-n">{pl(ls.length, "lekcja", "lekcje", "lekcji")}</span>
              </span>
              <span className="tk-blurb">{t.blurb}</span>
              <span className="tk-meter" aria-label={`Ukończone ${done} z ${ls.length}`}>
                <span className="lm-bar" aria-hidden>{ls.map((l) => <i key={l.id} className={isFinished(prog[progressKey(l.track, l.id)]) ? "is-on" : undefined} />)}</span>
                <span className="tk-v"><NumberFlow value={done} />/{ls.length}</span>
              </span>
              <span className="tk-cta">{done ? <>Kontynuuj: <code>{next.id}</code></> : <>Zacznij od <code>{next.id}</code></>}<ArrowRight aria-hidden /></span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
