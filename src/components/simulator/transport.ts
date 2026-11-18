import type { Segment } from "@/lib/parser";

/*
  Pulpit symulatora (Etap 11): override posuwu, tryby pracy AUTO / SINGLE BLOCK / DRY RUN,
  zatrzymanie po bloku i czas programu pod bieżącym punktem. Czysta logika — rysowanie
  i stan Reacta zostają w Simulator.tsx.
*/

export type RunMode = "auto" | "single" | "dry";

/** Zapadki pokrętła: 0–150% co 10% (jak typowy przełącznik override na pulpicie). */
export const FEED_MIN = 0;
export const FEED_MAX = 150;
export const FEED_STEP = 10;
export const FEED_DETENTS = Array.from({ length: (FEED_MAX - FEED_MIN) / FEED_STEP + 1 }, (_, i) => FEED_MIN + i * FEED_STEP);

/** Wartość dosunięta do najbliższej zapadki i obcięta do zakresu. */
export function snapFeed(v: number): number {
  if (!Number.isFinite(v)) return 100;
  const s = Math.round(v / FEED_STEP) * FEED_STEP;
  return Math.min(FEED_MAX, Math.max(FEED_MIN, s));
}

/** Krok pokrętła o `n` zapadek (ujemne — w lewo). */
export function stepFeed(v: number, n: number): number {
  return snapFeed(snapFeed(v) + n * FEED_STEP);
}

/** Bazowe tempo odtwarzania [mm/s] dla ruchu roboczego przy 100%. */
export const BASE_RATE = 40;
/** G00 rysuje się 3× szybciej niż ruch roboczy (jak dotąd). */
export const RAPID_MULT = 3;
/** DRY RUN: jedno, wyższe tempo dla wszystkich ruchów (posuw próbny zamiast F z programu). */
export const DRY_MULT = 5;

/**
 * Tempo przyrostu drogi [mm/s] na danym odcinku.
 * - AUTO / SINGLE BLOCK: override działa na ruchy robocze (G01/G02/G03); G00 i postój bez zmian —
 *   szybki posuw ma na pulpicie osobny przełącznik, czas postoju nie zależy od posuwu.
 * - DRY RUN: wszystkie ruchy jednym tempem, override działa także na G00 (zależy od sterowania;
 *   tu przyjęte dla czytelności).
 */
export function segmentRate(kind: Segment["kind"] | undefined, feed: number, mode: RunMode, base = BASE_RATE): number {
  const f = snapFeed(feed) / 100;
  if (mode === "dry") return kind === "dwell" ? base : base * DRY_MULT * f;
  if (kind === "rapid") return base * RAPID_MULT;
  if (kind === "dwell") return base;
  return base * f;
}

/** Skumulowane długości: marks[i] = początek odcinka i, marks[n] = całość. */
export function cumulative(lengths: number[]): number[] {
  const m = [0];
  for (const l of lengths) m.push(m[m.length - 1] + l);
  return m;
}

const EPS = 1e-6;

/**
 * Koniec bloku, w którym jest (albo do którego zaraz wejdzie) punkt `p`.
 * Blok = kolejne odcinki z tej samej linii programu (np. cykl wiercenia, łuk z korekcją).
 * Stojąc dokładnie na granicy bloków, zwraca koniec NASTĘPNEGO bloku — tak działa
 * kolejne naciśnięcie CYCLE START w trybie SINGLE BLOCK.
 */
export function blockEnd(p: number, segments: Pick<Segment, "line">[], lengths: number[], marks = cumulative(lengths)): number {
  if (!segments.length) return 0;
  let i = 0;
  while (i < segments.length && marks[i + 1] <= p + EPS) i++;
  if (i >= segments.length) return marks[segments.length];
  const line = segments[i].line;
  while (i + 1 < segments.length && segments[i + 1].line === line) i++;
  return marks[i + 1];
}

/**
 * Jeden krok animacji. Zwraca nową drogę i informację, czy odtwarzanie ma stanąć
 * (koniec programu albo koniec bloku w SINGLE BLOCK). Przy override 0% ruch roboczy stoi,
 * ale odtwarzanie trwa — jak na maszynie: posuw zatrzymany, cykl nie przerwany.
 */
export function advance(p: number, dt: number, opts: {
  segments: Pick<Segment, "kind">[];
  lengths: number[];
  feed: number;
  mode: RunMode;
  stopAt: number;
  base?: number;
  /** cumulative(lengths) — przekaż gotowe, żeby nie liczyć w każdej klatce */
  marks?: number[];
}): { p: number; stop: boolean } {
  const { segments, lengths, feed, mode, base = BASE_RATE } = opts;
  const marks = opts.marks ?? cumulative(lengths);
  const total = marks[marks.length - 1];
  const stopAt = Math.min(total, opts.stopAt);
  // indeks startowy wyszukiwaniem binarnym — długie programy z CAM mają dziesiątki tysięcy odcinków
  let i = 0;
  { let lo = 0, hi = segments.length - 1; while (lo < hi) { const mid = (lo + hi) >> 1; if (marks[mid + 1] <= p + EPS) lo = mid + 1; else hi = mid; } i = lo; }
  let left = dt;
  let q = p;
  // Przejście przez kilka krótkich odcinków w jednej klatce — każdy swoim tempem.
  for (let guard = 0; guard < 10_000 && left > 0 && q < stopAt - EPS; guard++) {
    while (i < segments.length - 1 && marks[i + 1] <= q + EPS) i++;
    const rate = segmentRate(segments[i]?.kind, feed, mode, base);
    if (rate <= 0) break;
    const end = Math.min(marks[i + 1] ?? total, stopAt);
    const need = (end - q) / rate;
    if (need >= left) { q += left * rate; left = 0; break; }
    q = end; left -= need;
  }
  if (q >= stopAt - EPS) return { p: stopAt, stop: true };
  return { p: q, stop: false };
}

/** Czas [s] odcinka przy zaprogramowanym posuwie (te same założenia co statystyki programu). */
export type SegSeconds = (sg: Segment) => number;

/** Skumulowany czas programu na granicach odcinków. */
export function cumulativeSeconds(segments: Segment[], secs: SegSeconds): number[] {
  const m = [0];
  for (const sg of segments) m.push(m[m.length - 1] + Math.max(0, secs(sg)));
  return m;
}

/** Czas programu w punkcie `p` drogi — liniowo w obrębie odcinka. */
export function secondsAt(p: number, lengths: number[], cumSecs: number[]): number {
  let acc = 0;
  for (let i = 0; i < lengths.length; i++) {
    const l = lengths[i];
    if (p < acc + l) return cumSecs[i] + (cumSecs[i + 1] - cumSecs[i]) * (l > 0 ? (p - acc) / l : 0);
    acc += l;
  }
  return cumSecs[cumSecs.length - 1] ?? 0;
}

/** 83 → „1:23”, 3725 → „1:02:05”. */
export function fmtClock(s: number): string {
  const t = Math.max(0, Math.round(s));
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), sec = t % 60;
  const ss = String(sec).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}

export const MODE_LABEL: Record<RunMode, string> = { auto: "AUTO", single: "SINGLE BLOCK", dry: "DRY RUN" };
export const MODE_TITLE: Record<RunMode, string> = {
  auto: "Praca automatyczna — program idzie do końca",
  single: "Pojedynczy blok — zatrzymanie po każdym bloku, dalej przyciskiem CYCLE START",
  dry: "Próba na sucho — wszystkie ruchy jednym, szybszym tempem zamiast F z programu",
};
export const MODES: RunMode[] = ["auto", "single", "dry"];
