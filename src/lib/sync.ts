"use client";
import { getSupabase } from "./supabase";
import { importProgress, onProgressChange, snapshotProgress, type ProgressStore } from "./progress";
import { importDone, onDoneChange, snapshotDone } from "./exercisesDone";
import { importPrograms, loadPrograms, onProgramsChange, type StoredProgram } from "@/app/symulator/programs";

/*
  Synchronizacja z kontem: po zalogowaniu pobieramy dane z konta i scalamy z lokalnymi
  (nic nie ginie), odsyłamy wynik, a potem każdą lokalną zmianę wysyłamy z opóźnieniem.
  Tabele są małe (≤ 51 lekcji, ≤ 20 programów), więc wysyłamy cały stan — prościej i odporniej.
*/
export type SyncStatus = "off" | "syncing" | "ok" | "error";
let status: SyncStatus = "off";
let lastError: string | null = null;
const listeners = new Set<() => void>();
const setStatus = (s: SyncStatus, err: string | null = null) => { status = s; lastError = err; listeners.forEach((l) => l()); };
export const getSyncStatus = () => ({ status, error: lastError });
export function subscribeSync(cb: () => void) { listeners.add(cb); return () => { listeners.delete(cb); }; }

let userId: string | null = null;
let unhook: (() => void)[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

const rowsFromProgress = (uid: string, s: ProgressStore) => Object.entries(s).map(([key, p]) => ({
  user_id: uid, key, visited: p.visited ?? null, read: !!(p.read || p.done),
  quiz_score: p.quiz?.score ?? null, quiz_total: p.quiz?.total ?? null, quiz_at: p.quiz?.at ?? null, updated_at: new Date().toISOString(),
}));
const progressFromRows = (rows: Record<string, unknown>[]): ProgressStore => {
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
  const sb = await getSupabase(); if (!sb || !userId) return;
  const uid = userId;
  setStatus("syncing");
  try {
    const prog = rowsFromProgress(uid, snapshotProgress());
    if (prog.length) { const { error } = await sb.from("lesson_progress").upsert(prog); if (error) throw error; }
    const done = snapshotDone().map((slug) => ({ user_id: uid, slug, passed: true }));
    if (done.length) { const { error } = await sb.from("exercise_results").upsert(done, { ignoreDuplicates: true }); if (error) throw error; }
    const progs = loadPrograms().map((p) => ({ user_id: uid, id: p.id, name: p.name, src: p.src, mode: p.mode, updated: p.updated }));
    if (progs.length) { const { error } = await sb.from("programs").upsert(progs); if (error) throw error; }
    setStatus("ok");
  } catch (e) { setStatus("error", (e as Error).message); }
}

const schedulePush = () => { if (timer) clearTimeout(timer); timer = setTimeout(() => { timer = null; pushAll(); }, 1500); };

export async function startSync(uid: string) {
  if (userId === uid) return;
  stopSync();
  userId = uid;
  const sb = await getSupabase(); if (!sb) return;
  setStatus("syncing");
  try {
    const [p, d, g] = await Promise.all([
      sb.from("lesson_progress").select("key, visited, read, quiz_score, quiz_total, quiz_at").eq("user_id", uid),
      sb.from("exercise_results").select("slug").eq("user_id", uid).eq("passed", true),
      sb.from("programs").select("id, name, src, mode, updated").eq("user_id", uid),
    ]);
    if (p.error) throw p.error; if (d.error) throw d.error; if (g.error) throw g.error;
    importProgress(progressFromRows(p.data ?? []));
    importDone((d.data ?? []).map((r) => String(r.slug)));
    importPrograms((g.data ?? []) as StoredProgram[]);
    await pushAll();
  } catch (e) { setStatus("error", (e as Error).message); }
  unhook = [onProgressChange(schedulePush), onDoneChange(schedulePush), onProgramsChange(schedulePush)];
}

export function stopSync() {
  unhook.forEach((u) => u()); unhook = [];
  if (timer) { clearTimeout(timer); timer = null; }
  userId = null;
  setStatus("off");
}
