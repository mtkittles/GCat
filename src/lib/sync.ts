"use client";
import { getSupabase } from "./supabase";
import { importProgress, onProgressChange, snapshotProgress, type ProgressStore } from "./progress";
import { importDone, onDoneChange, snapshotDone } from "./exercisesDone";
import { importPrograms, loadPrograms, onProgramsChange, type StoredProgram } from "@/app/symulator/programs";

/*
  Synchronizacja z kontem: po zalogowaniu pobieramy dane z konta i scalamy z lokalnymi
  (nic nie ginie), odsyłamy wynik, a potem każdą lokalną zmianę wysyłamy z opóźnieniem.
  Tabele są małe (≤ 51 lekcji, ≤ 20 programów), więc wysyłamy cały stan — prościej i odporniej.
  Każde wywołanie Supabase jest w try/catch: błąd trafia do statusu (widoczny na /konto), nie na ekran błędu.
*/
export type SyncStatus = "off" | "syncing" | "ok" | "error";
export interface SyncSnapshot { status: SyncStatus; error: string | null }

/** Stały snapshot „wyłączona” — także dla renderu na serwerze. */
export const SYNC_OFF: SyncSnapshot = { status: "off", error: null };

/*
  useSyncExternalStore wymaga, by getSnapshot zwracał TEN SAM obiekt, dopóki stan się nie zmienił
  (porównanie przez Object.is). Dlatego snapshot jest budowany raz, w setStatus, a nie przy odczycie.
*/
let snapshot: SyncSnapshot = SYNC_OFF;
const listeners = new Set<() => void>();
const setStatus = (status: SyncStatus, error: string | null = null) => {
  if (snapshot.status !== status || snapshot.error !== error) snapshot = status === "off" && !error ? SYNC_OFF : { status, error };
  listeners.forEach((l) => l());
};
export const getSyncStatus = (): SyncSnapshot => snapshot;
export function subscribeSync(cb: () => void) { listeners.add(cb); return () => { listeners.delete(cb); }; }

const messageOf = (e: unknown): string => {
  if (e && typeof e === "object" && "message" in e && typeof (e as { message: unknown }).message === "string") return (e as { message: string }).message;
  return String(e);
};

let userId: string | null = null;
let unhook: (() => void)[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

const rowsFromProgress = (uid: string, s: ProgressStore) => Object.entries(s).map(([key, p]) => ({
  user_id: uid, key, visited: p.visited ?? null, read: !!(p.read || p.done),
  quiz_score: p.quiz?.score ?? null, quiz_total: p.quiz?.total ?? null, quiz_at: p.quiz?.at ?? null, updated_at: new Date().toISOString(),
}));
export const progressFromRows = (rows: Record<string, unknown>[]): ProgressStore => {
  const out: ProgressStore = {};
  for (const r of rows) {
    const key = String(r.key);
    out[key] = {
      ...(r.visited ? { visited: Number(r.visited) } : {}),
      ...(r.read ? { read: true } : {}),
      ...(r.quiz_total ? { quiz: { score: Number(r.quiz_score ?? 0), total: Number(r.quiz_total), at: Number(r.quiz_at ?? 0) } } : {}),
    };
  }
  return out;
};

async function pushAll() {
  if (!userId) return;
  const uid = userId;
  setStatus("syncing");
  try {
    const sb = await getSupabase(); if (!sb) { setStatus("off"); return; }
    const prog = rowsFromProgress(uid, snapshotProgress());
    if (prog.length) { const { error } = await sb.from("lesson_progress").upsert(prog); if (error) throw error; }
    const done = snapshotDone().map((slug) => ({ user_id: uid, slug, passed: true }));
    if (done.length) { const { error } = await sb.from("exercise_results").upsert(done, { ignoreDuplicates: true }); if (error) throw error; }
    const progs = loadPrograms().map((p) => ({ user_id: uid, id: p.id, name: p.name, src: p.src, mode: p.mode, updated: p.updated }));
    if (progs.length) { const { error } = await sb.from("programs").upsert(progs); if (error) throw error; }
    if (userId === uid) setStatus("ok");
  } catch (e) { if (userId === uid) setStatus("error", messageOf(e)); }
}

const schedulePush = () => { if (timer) clearTimeout(timer); timer = setTimeout(() => { timer = null; pushAll(); }, 1500); };

/** Nigdy nie rzuca: błąd trafia do statusu synchronizacji. */
export async function startSync(uid: string): Promise<void> {
  if (userId === uid) return;
  stopSync();
  userId = uid;
  try {
    const sb = await getSupabase(); if (!sb) { setStatus("off"); return; }
    if (userId !== uid) return; // wylogowano, zanim klient się załadował
    setStatus("syncing");
    const [p, d, g] = await Promise.all([
      sb.from("lesson_progress").select("key, visited, read, quiz_score, quiz_total, quiz_at").eq("user_id", uid),
      sb.from("exercise_results").select("slug").eq("user_id", uid).eq("passed", true),
      sb.from("programs").select("id, name, src, mode, updated").eq("user_id", uid),
    ]);
    if (p.error) throw p.error; if (d.error) throw d.error; if (g.error) throw g.error;
    if (userId !== uid) return; // wylogowano w trakcie pobierania
    importProgress(progressFromRows(p.data ?? []));
    importDone((d.data ?? []).map((r) => String(r.slug)));
    importPrograms((g.data ?? []) as StoredProgram[]);
    await pushAll();
  } catch (e) { if (userId === uid) setStatus("error", messageOf(e)); }
  if (userId === uid) unhook = [onProgressChange(schedulePush), onDoneChange(schedulePush), onProgramsChange(schedulePush)];
}

export function stopSync() {
  unhook.forEach((u) => u()); unhook = [];
  if (timer) { clearTimeout(timer); timer = null; }
  userId = null;
  setStatus("off");
}
