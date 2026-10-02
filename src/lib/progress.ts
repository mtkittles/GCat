"use client";
import { useSyncExternalStore } from "react";

/*
  Postęp nauki zapisywany w przeglądarce (localStorage). Każdy odczyt i zapis
  jest w try/catch: tryb prywatny, pełna pamięć albo wyłączone ciasteczka
  nie mogą zatrzymać strony — wtedy postęp żyje tylko do przeładowania.
  Klucz lekcji: `frezowanie/F4.2`.
*/

export interface LessonProgress {
  /** ostatnie otwarcie lekcji (ms) */
  visited?: number;
  /** oznaczona ręcznie jako przeczytana */
  read?: boolean;
  /** zapis z wcześniejszej wersji: „zaliczona” (test ≥ 80% albo ręcznie) — czytany wstecznie */
  done?: boolean;
  /** najlepszy wynik pełnego testu */
  quiz?: { score: number; total: number; at: number };
}
export type ProgressStore = Record<string, LessonProgress>;

const KEY = "gcat:nauka:v1";
const EMPTY: ProgressStore = {};
const PASS = 0.8;

let mem: ProgressStore = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load(): ProgressStore {
  if (loaded) return mem;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    const v = raw ? JSON.parse(raw) : {};
    mem = v && typeof v === "object" && !Array.isArray(v) ? v : {};
  } catch { mem = {}; }
  return mem;
}

function commit(next: ProgressStore) {
  mem = next;
  try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* bez zapisu — zostaje w pamięci */ }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => { if (e.key === KEY) { loaded = false; load(); cb(); } };
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(cb); window.removeEventListener("storage", onStorage); };
}

/** Postęp wszystkich lekcji. Na serwerze i przy hydratacji — pusty. */
export function useProgress(): ProgressStore {
  return useSyncExternalStore(subscribe, load, () => EMPTY);
}

export const progressKey = (track: string, id: string) => `${track}/${id}`;

function update(key: string, fn: (p: LessonProgress) => LessonProgress) {
  const cur = load();
  commit({ ...cur, [key]: fn(cur[key] ?? {}) });
}

/** Zaliczona testem: najlepszy wynik pełnego testu ≥ 80%. */
export const isPassed = (p?: LessonProgress) => !!p?.quiz && p.quiz.total > 0 && p.quiz.score / p.quiz.total >= PASS;
/** Przeczytana: oznaczona ręcznie (albo „zaliczona” ręcznie w starszej wersji), bez zaliczonego testu. */
export const isRead = (p?: LessonProgress) => !isPassed(p) && (!!p?.read || !!p?.done);
/** Ukończona w jakiejkolwiek formie — do wyboru następnej lekcji. */
export const isFinished = (p?: LessonProgress) => isPassed(p) || isRead(p);

export function markVisited(key: string) { update(key, (p) => ({ ...p, visited: Date.now() })); }
/** Ręczne oznaczenie „przeczytana”. Cofnięcie usuwa też zapis „done” ze starszej wersji. */
export function setRead(key: string, read: boolean) { update(key, (p) => ({ ...p, read, ...(read ? {} : { done: false }) })); }

/** Wynik pełnego testu: zostaje najlepszy; zaliczenie liczy się z wyniku (≥ 80%). */
export function recordQuiz(key: string, score: number, total: number) {
  update(key, (p) => {
    const best = !p.quiz || score / total >= p.quiz.score / p.quiz.total ? { score, total, at: Date.now() } : p.quiz;
    return { ...p, quiz: best };
  });
}

export function resetTrack(track: string) {
  const cur = load();
  const next: ProgressStore = {};
  for (const [k, v] of Object.entries(cur)) if (!k.startsWith(`${track}/`)) next[k] = v;
  commit(next);
}
