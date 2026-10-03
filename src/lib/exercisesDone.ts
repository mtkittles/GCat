"use client";
import { useSyncExternalStore } from "react";
import { mergeDone } from "./merge";

/* Zaliczone zadania (slugi) — w przeglądarce, z opcjonalną synchronizacją z kontem. */
const KEY = "gcat:zadania";
const EMPTY: string[] = [];
let mem: string[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();
const hooks = new Set<(done: string[]) => void>();

function load(): string[] {
  if (loaded) return mem;
  loaded = true;
  try { const v = JSON.parse(window.localStorage.getItem(KEY) || "[]"); mem = Array.isArray(v) ? v.filter((x) => typeof x === "string") : []; } catch { mem = []; }
  return mem;
}
function commit(next: string[], silent = false) {
  mem = next;
  try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  listeners.forEach((l) => l());
  if (!silent) hooks.forEach((h) => h(next));
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => { if (e.key === KEY) { loaded = false; load(); cb(); } };
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(cb); window.removeEventListener("storage", onStorage); };
}

export function useDone(): string[] { return useSyncExternalStore(subscribe, load, () => EMPTY); }
export function markExerciseDone(slug: string) { const cur = load(); if (!cur.includes(slug)) commit([...cur, slug]); }
export function snapshotDone(): string[] { return load(); }
export function importDone(remote: string[]) { commit(mergeDone(load(), remote), true); }
export function onDoneChange(h: (done: string[]) => void) { hooks.add(h); return () => { hooks.delete(h); }; }
