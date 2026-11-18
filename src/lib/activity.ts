import { dayKey, isFinished, LOG_DONE, LOG_OPEN, LOG_TEST, type ProgressStore } from "./progress";

/*
  Mapa nauki (Etap 12c): dni z nauką w układzie jak wykres aktywności GitHuba — kolumna to tydzień
  (poniedziałek–niedziela), komórka to dzień. Tylko prawdziwe dane z zapisu postępu: dziennik dni
  (`log`), a dla zapisów sprzed dziennika — data ostatniego otwarcia (`visited`) i data najlepszego testu (`quiz.at`).
*/

export interface DayActivity {
  /** klucze lekcji (`frezowanie/F3.2`) z aktywnością tego dnia */
  lessons: string[];
  /** lekcje z pełnym testem tego dnia */
  tests: number;
  /** lekcje ukończone tego dnia (test ≥ 80% albo „przeczytana”) */
  done: number;
}

/** Aktywność według dni (`RRRR-MM-DD`). */
export function activityByDay(store: ProgressStore): Map<string, DayActivity> {
  const out = new Map<string, DayActivity>();
  const add = (day: string, key: string, bits: number) => {
    const a = out.get(day) ?? { lessons: [], tests: 0, done: 0 };
    const first = !a.lessons.includes(key);
    if (first) a.lessons.push(key);
    // test i ukończenie liczone raz na lekcję i dzień — dziennik ma jeden wpis na dzień
    if (bits & LOG_TEST) a.tests += 1;
    if (bits & LOG_DONE) a.done += 1;
    out.set(day, a);
  };
  for (const [key, p] of Object.entries(store)) {
    const log = { ...(p.log ?? {}) };
    // zapisy sprzed dziennika: daty, które już są w danych
    if (p.visited) { const d = dayKey(p.visited); log[d] = (log[d] ?? 0) | LOG_OPEN; }
    if (p.quiz?.at) { const d = dayKey(p.quiz.at); log[d] = (log[d] ?? 0) | LOG_TEST; }
    for (const [d, bits] of Object.entries(log)) if (bits) add(d, key, bits);
  }
  return out;
}

/** Poziom komórki 0–4 z liczby lekcji danego dnia. */
export const level = (n: number) => (n <= 0 ? 0 : n === 1 ? 1 : n === 2 ? 2 : n <= 4 ? 3 : 4);

export interface MapCell { day: string; date: Date; future: boolean; a?: DayActivity }

/**
 * Siatka `weeks` tygodni zakończona tygodniem z dniem `today`: kolumny od najstarszej,
 * w kolumnie poniedziałek → niedziela. Dni po dzisiejszym są oznaczone `future`.
 */
export function mapGrid(by: Map<string, DayActivity>, today: Date, weeks: number): MapCell[][] {
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dow = (t.getDay() + 6) % 7; // 0 = poniedziałek
  const start = new Date(t); start.setDate(t.getDate() - dow - 7 * (weeks - 1));
  const cols: MapCell[][] = [];
  for (let w = 0; w < weeks; w++) {
    const col: MapCell[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(start); date.setDate(start.getDate() + w * 7 + d);
      const day = dayKey(date.getTime());
      col.push({ day, date, future: date > t, a: by.get(day) });
    }
    cols.push(col);
  }
  return cols;
}

/** Seria: kolejne dni z nauką kończące się dziś albo wczoraj (dziś jeszcze można dołożyć). */
export function streak(by: Map<string, DayActivity>, today: Date): number {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (!by.has(dayKey(d.getTime()))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (by.has(dayKey(d.getTime()))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

/** Podsumowanie okresu siatki: dni z nauką, lekcje (różne), ukończenia. */
export function summary(cols: MapCell[][], store: ProgressStore) {
  const cells = cols.flat().filter((c) => c.a);
  const lessons = new Set(cells.flatMap((c) => c.a!.lessons));
  return { days: cells.length, lessons: lessons.size, finished: Object.values(store).filter((p) => isFinished(p)).length };
}
