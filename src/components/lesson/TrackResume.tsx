"use client";
import Link from "next/link";
import { isFinished, isPassed, progressKey, useProgress } from "@/lib/progress";

/*
  Blok postępu na karcie ścieżki: aktualna lekcja, ukończone lekcje (test albo „przeczytana”) i jeden przycisk.
  „Rozpocznij” pokazuje się, dopóki użytkownik nie otworzył żadnej lekcji ścieżki
  (liczy się aktywność, nie sam wynik 0/N). Postęp jest zapisany w tej przeglądarce.
*/
export default function TrackResume({ track, lessons, fallback }: { track: string; lessons: { id: string; title: string; href: string }[]; fallback: { href: string; label: string } }) {
  const prog = useProgress();
  const P = (id: string) => prog[progressKey(track, id)];
  const passed = lessons.filter((l) => isPassed(P(l.id))).length;
  // ukończone = zaliczone testem albo oznaczone ręcznie jako przeczytane
  const finished = lessons.filter((l) => isFinished(P(l.id))).length;
  const started = lessons.some((l) => P(l.id)?.visited || isFinished(P(l.id)));
  const next = lessons.find((l) => !isFinished(P(l.id)));
  const first = lessons[0];
  const cur = started ? (next ?? first) : first;
  if (!cur) return null;
  return (
    <div className="tr-block">
      <dl className="tr-meta">
        <div><dt>{started ? "Aktualna lekcja" : "Pierwsza lekcja"}</dt><dd>{cur.id} {cur.title}</dd></div>
        <div><dt>Ukończone</dt><dd>{finished}/{lessons.length}{passed !== finished ? <span className="tr-sub"> · testem {passed}</span> : null}</dd></div>
      </dl>
      <Link href={started ? cur.href : fallback.href} className={`btn${started ? "" : " ghost"}`}>{started ? "Kontynuuj naukę" : "Rozpocznij naukę"}</Link>
    </div>
  );
}
