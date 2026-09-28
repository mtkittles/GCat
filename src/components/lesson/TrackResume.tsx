"use client";
import Link from "next/link";
import { progressKey, useProgress } from "@/lib/progress";

/** Na karcie ścieżki: liczba zaliczonych lekcji i link do pierwszej niezaliczonej. */
export default function TrackResume({ track, lessons, fallback }: { track: string; lessons: { id: string; title: string; href: string }[]; fallback: { href: string; label: string } }) {
  const prog = useProgress();
  const done = lessons.filter((l) => prog[progressKey(track, l.id)]?.done).length;
  const started = lessons.some((l) => prog[progressKey(track, l.id)]?.visited || prog[progressKey(track, l.id)]?.done);
  const next = lessons.find((l) => !prog[progressKey(track, l.id)]?.done);
  if (!started || !next) return <Link href={fallback.href} className="nk-start">{fallback.label}</Link>;
  return <Link href={next.href} className="nk-start">Kontynuuj: {next.id} {next.title} · zaliczone {done} z {lessons.length}</Link>;
}
