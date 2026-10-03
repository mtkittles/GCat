/*
  Scalanie danych z przeglądarki z danymi z konta — czyste funkcje, bez dostępu do DOM.
  Zasada: nic nie ginie. Lepszy wynik testu wygrywa, oznaczenia „przeczytana” się sumują,
  nowsza wersja programu zastępuje starszą.
*/
import type { LessonProgress, ProgressStore } from "./progress";

const ratio = (q?: { score: number; total: number }) => (q && q.total > 0 ? q.score / q.total : -1);

export function mergeLesson(a: LessonProgress = {}, b: LessonProgress = {}): LessonProgress {
  const out: LessonProgress = {};
  const visited = Math.max(a.visited ?? 0, b.visited ?? 0);
  if (visited) out.visited = visited;
  if (a.read || b.read) out.read = true;
  if (a.done || b.done) out.done = true;
  const qa = a.quiz, qb = b.quiz;
  if (qa && qb) out.quiz = ratio(qa) > ratio(qb) ? qa : ratio(qb) > ratio(qa) ? qb : (qa.at >= qb.at ? qa : qb);
  else if (qa || qb) out.quiz = (qa ?? qb)!;
  return out;
}

export function mergeProgress(a: ProgressStore, b: ProgressStore): ProgressStore {
  const out: ProgressStore = {};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) out[k] = mergeLesson(a[k], b[k]);
  return out;
}

export const mergeDone = (a: string[], b: string[]) => [...new Set([...a, ...b])];

export interface ProgramRow { id: string; name: string; src: string; mode: "mill" | "lathe"; updated: number }
export function mergePrograms(a: ProgramRow[], b: ProgramRow[]): ProgramRow[] {
  const by = new Map<string, ProgramRow>();
  for (const p of [...a, ...b]) { const cur = by.get(p.id); if (!cur || p.updated > cur.updated) by.set(p.id, p); }
  return [...by.values()].sort((x, y) => x.updated - y.updated);
}
