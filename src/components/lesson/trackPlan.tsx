import { diagrams } from "@/components/diagrams";
import { flatBlocks } from "@/lib/article";
import { lessonHref, tracks, type Track } from "@/lib/course";
import type { PlanTrack } from "./TrackLessons";

/* Dane planu obu ścieżek dla TrackLessons, liczone przy budowie strony (plakietki z treści lekcji). */
const PART_FIG: Record<Track, string> = { frezowanie: "f01-top", toczenie: "t01-part" };

export function trackPlan(): Record<Track, PlanTrack> {
  const one = (t: Track): PlanTrack => {
    const T = tracks[t];
    return {
      title: T.title, profile: T.profile, part: T.part, partFig: diagrams[PART_FIG[t]]?.(),
      modules: T.modules.map((m) => ({
        id: m.id, title: m.title, skill: m.skill,
        lessons: m.lessons.map((l) => ({
          id: l.id, title: l.title, href: l.doc ? lessonHref(t, l.slug!) : null, minutes: l.doc?.minutes,
          test: !!l.doc && l.doc.quiz.length > 0,
          // symulator w lekcji: zadanie z programem albo animacja / symulacja w teorii
          sim: !!l.doc && (l.doc.practice.some((p) => p.kind === "task") || flatBlocks(l.doc.theory).some((b) => b.t === "sim" || b.t === "demo")),
        })),
      })),
    };
  };
  return { frezowanie: one("frezowanie"), toczenie: one("toczenie") };
}
