"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { isFinished, progressKey, useProgress } from "@/lib/progress";
import type { ResumeLesson } from "./types";

/*
  Przycisk w nagłówku strony startowej: gość — „Rozpocznij naukę”; ktoś z postępem — „Kontynuuj <lekcja>”
  (pierwsza nieukończona lekcja). Postęp z przeglądarki albo konta (src/lib/progress.ts); przed hydratacją — wariant gościa.
*/
export default function HeroCta({ lessons }: { lessons: ResumeLesson[] }) {
  const prog = useProgress();
  const started = lessons.some((l) => prog[progressKey(l.track, l.id)]);
  const next = lessons.find((l) => !isFinished(prog[progressKey(l.track, l.id)]));
  return (
    <div className="h3-actions">
      {started && next
        ? <Link href={next.href} className="pill-btn is-primary">Kontynuuj <code>{next.id}</code></Link>
        : <Link href="/nauka" className="pill-btn is-primary">Rozpocznij naukę</Link>}
      <Link href="/symulator" className="h3-link">Otwórz symulator <ArrowRight aria-hidden /></Link>
    </div>
  );
}
