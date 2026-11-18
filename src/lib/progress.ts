"use client";
import { useSyncExternalStore } from "react";
import { mergeProgress } from "./merge";

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
  /**
   * Dziennik dni z nauką (mapa nauki na Pulpicie): dzień lokalny `RRRR-MM-DD` → bity
   * 1 — otwarcie lekcji, 2 — pełny test, 4 — ukończenie (test ≥ 80% albo „przeczytana”).
   * Tylko w przeglądarce (konto synchronizuje pola z tabeli `lesson_progress`).
   */
  log?: Record<string, number>;
}

/** Bity dziennika dni. */
export const LOG_OPEN = 1, LOG_TEST = 2, LOG_DONE = 4;
/** Najwięcej dni w dzienniku jednej lekcji — starsze wypadają. */
const LOG_MAX = 400;

/** Dzień lokalny `RRRR-MM-DD` dla znacznika czasu. */
export function dayKey(t: number): string {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Dopisanie bitu do dziennika dnia; przycina dziennik do {@link LOG_MAX} ostatnich dni. */
export function logDay(log: Record<string, number> | undefined, t: number, bit: number): Record<string, number> {
  const k = dayKey(t);
  const next = { ...(log ?? {}), [k]: ((log ?? {})[k] ?? 0) | bit };
  const keys = Object.keys(next);
  if (keys.length > LOG_MAX) for (const old of keys.sort().slice(0, keys.length - LOG_MAX)) delete next[old];
  return next;
}
export type ProgressStore = Record<string, LessonProgress>;

const KEY = "gcat:nauka:v1";
const EMPTY: ProgressStore = {};
const PASS = 0.8;

let mem: ProgressStore = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();
/** Odbiorcy zmian zapisanych lokalnie (synchronizacja z kontem). Import z konta ich nie budzi. */
const hooks = new Set<(store: ProgressStore) => void>();

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

function commit(next: ProgressStore, silent = false) {
  mem = next;
  try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* bez zapisu — zostaje w pamięci */ }
  listeners.forEach((l) => l());
  if (!silent) hooks.forEach((h) => h(next));
}

export function onProgressChange(h: (store: ProgressStore) => void) { hooks.add(h); return () => { hooks.delete(h); }; }
/** Bieżący stan (do wysłania na konto). */
export function snapshotProgress(): ProgressStore { return load(); }
/** Dane z konta scalane z lokalnymi — nic nie ginie, lepszy wynik wygrywa. */
export function importProgress(remote: ProgressStore) { commit(mergeProgress(load(), remote), true); }

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

export function markVisited(key: string) { const t = Date.now(); update(key, (p) => ({ ...p, visited: t, log: logDay(p.log, t, LOG_OPEN) })); }
/** Ręczne oznaczenie „przeczytana”. Cofnięcie usuwa też zapis „done” ze starszej wersji (dziennik dni zostaje). */
export function setRead(key: string, read: boolean) { update(key, (p) => ({ ...p, read, ...(read ? { log: logDay(p.log, Date.now(), LOG_DONE) } : { done: false }) })); }

/** Wynik pełnego testu: zostaje najlepszy; zaliczenie liczy się z wyniku (≥ 80%). */
export function recordQuiz(key: string, score: number, total: number) {
  update(key, (p) => {
    const t = Date.now();
    const best = !p.quiz || score / total >= p.quiz.score / p.quiz.total ? { score, total, at: t } : p.quiz;
    const bits = LOG_TEST | (total > 0 && score / total >= PASS ? LOG_DONE : 0);
    return { ...p, quiz: best, log: logDay(p.log, t, bits) };
  });
}

/** Zeruje postęp ścieżki; zwraca stan sprzed zmiany (do „Cofnij” — {@link restoreProgress}). */
export function resetTrack(track: string): ProgressStore {
  const cur = load();
  const next: ProgressStore = {};
  for (const [k, v] of Object.entries(cur)) if (!k.startsWith(`${track}/`)) next[k] = v;
  commit(next);
  return cur;
}

/** Przywraca zapisany wcześniej stan (cofnięcie wyzerowania). */
export function restoreProgress(prev: ProgressStore) { commit({ ...prev }); }
