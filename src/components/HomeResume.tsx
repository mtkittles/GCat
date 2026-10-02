"use client";
import Link from "next/link";
import { isFinished, isPassed, progressKey, useProgress } from "@/lib/progress";

/* Na pierwszym ekranie: link „Kontynuuj”, tylko gdy użytkownik ma już postęp. */

export type ResumeLesson = { track: string; id: string; title: string; href: string };

export default function HomeResume({ lessons }: { lessons: ResumeLesson[] }) {
  const prog = useProgress();
  const P = (l: ResumeLesson) => prog[progressKey(l.track, l.id)];
  const started = lessons.some((l) => P(l)?.visited || isFinished(P(l)));
  if (!started) return null;
  const last = [...lessons].sort((a, b) => (P(b)?.visited ?? 0) - (P(a)?.visited ?? 0))[0];
  const next = last && !isFinished(P(last)) ? last : lessons.find((l) => !isFinished(P(l)));
  if (!next) return null;
  const passed = lessons.filter((l) => isPassed(P(l))).length;
  return (
    <p className="hi-resume">
      <Link href={next.href}>Kontynuuj: {next.id} {next.title} →</Link>
      <span>zaliczone testem: {passed} z {lessons.length}</span>
    </p>
  );
}
