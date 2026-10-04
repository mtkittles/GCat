"use client";
import { useSyncExternalStore } from "react";
import type { Session } from "@supabase/supabase-js";
import { ACCOUNT_ENABLED, getSupabase } from "./supabase";
import type { Plan } from "./entitlements";
import { startSync, stopSync } from "./sync";

/*
  Stan konta po stronie przeglądarki: sesja z Supabase i profil (plan).
  Jedna inicjalizacja na kartę; komponenty czytają stan przez useAccount().
  Każde wywołanie Supabase jest w try/catch: błąd ląduje w `state.error` (widoczny na /konto).
*/
export interface AccountUser { id: string; email: string | null }
export interface Profile { plan: Plan; displayName: string | null }
export interface AccountState { enabled: boolean; ready: boolean; user: AccountUser | null; profile: Profile | null; error: string | null }

let state: AccountState = { enabled: ACCOUNT_ENABLED, ready: !ACCOUNT_ENABLED, user: null, profile: null, error: null };
const listeners = new Set<() => void>();
const set = (patch: Partial<AccountState>) => { state = { ...state, ...patch }; listeners.forEach((l) => l()); };
let inited = false;

const messageOf = (e: unknown): string => {
  if (e && typeof e === "object" && "message" in e && typeof (e as { message: unknown }).message === "string") return (e as { message: string }).message;
  return String(e);
};

async function loadProfile(userId: string) {
  try {
    const sb = await getSupabase(); if (!sb) return;
    const { data, error } = await sb.from("profiles").select("plan, display_name").eq("id", userId).maybeSingle();
    if (error) throw error;
    if (state.user?.id !== userId) return; // w międzyczasie wylogowano
    set({ profile: { plan: data?.plan === "pro" ? "pro" : "free", displayName: data?.display_name ?? null } });
  } catch (e) {
    // Bez profilu konto działa jako Free; użytkownik widzi powód zamiast ekranu błędu.
    if (state.user?.id === userId) set({ error: `Nie udało się pobrać profilu: ${messageOf(e)}` });
  }
}

function applySession(session: Session | null) {
  const user = session?.user ? { id: session.user.id, email: session.user.email ?? null } : null;
  set({ user, ready: true, profile: user ? state.profile : null });
  if (user) { void loadProfile(user.id); void startSync(user.id); } else stopSync();
}

function init() {
  if (inited || !ACCOUNT_ENABLED) return;
  inited = true;
  const p = getSupabase(); if (!p) return;
  p.then(async (sb) => {
    sb.auth.onAuthStateChange((_e, session) => applySession(session));
    try {
      const { data, error } = await sb.auth.getSession();
      if (error) throw error;
      applySession(data.session);
    } catch (e) { set({ ready: true, error: `Nie udało się odczytać sesji: ${messageOf(e)}` }); }
  }).catch((e) => set({ ready: true, error: `Nie udało się uruchomić logowania: ${messageOf(e)}` }));
}

export function subscribeAccount(cb: () => void) { listeners.add(cb); init(); return () => { listeners.delete(cb); }; }
export const getAccountState = (): AccountState => state;
const SSR: AccountState = { enabled: ACCOUNT_ENABLED, ready: false, user: null, profile: null, error: null };

export function useAccount(): AccountState { return useSyncExternalStore(subscribeAccount, getAccountState, () => SSR); }

const redirectTo = () => `${window.location.origin}/konto`;

export async function signInWithEmail(email: string): Promise<string | null> {
  try {
    const sb = await getSupabase(); if (!sb) return "Konto jest wyłączone.";
    const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo() } });
    return error ? error.message : null;
  } catch (e) { return messageOf(e); }
}

export async function signInWithGoogle(): Promise<string | null> {
  try {
    const sb = await getSupabase(); if (!sb) return "Konto jest wyłączone.";
    const { error } = await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: redirectTo() } });
    return error ? error.message : null;
  } catch (e) { return messageOf(e); }
}

/** Usuwa zapisaną sesję Supabase z przeglądarki (ostatnia deska ratunku, gdy klient nie działa). */
function dropStoredSession() {
  try {
    for (const k of Object.keys(window.localStorage)) if (/^sb-.*-auth-token/.test(k)) window.localStorage.removeItem(k);
  } catch { /* brak dostępu do pamięci — nic więcej nie zrobimy */ }
}

/*
  Wylogowanie działa zawsze: najpierw zwykłe, potem tylko lokalne (bez sieci), na końcu
  usunięcie zapisanej sesji. Stan konta jest czyszczony niezależnie od wyniku.
  Zwraca komunikat tylko wtedy, gdy trzeba było sięgnąć po obejście.
*/
export async function signOut(): Promise<string | null> {
  let note: string | null = null;
  try {
    const sb = await getSupabase();
    if (sb) {
      const { error } = await sb.auth.signOut();
      if (error) {
        note = error.message;
        const local = await sb.auth.signOut({ scope: "local" });
        if (local.error) dropStoredSession();
      }
    } else dropStoredSession();
  } catch (e) { note = messageOf(e); dropStoredSession(); }
  stopSync();
  set({ user: null, profile: null, ready: true, error: null });
  return note;
}

export async function updateDisplayName(name: string): Promise<string | null> {
  try {
    const sb = await getSupabase(); if (!sb || !state.user) return "Brak sesji.";
    const { error } = await sb.from("profiles").update({ display_name: name }).eq("id", state.user.id);
    if (!error) set({ profile: { plan: state.profile?.plan ?? "free", displayName: name } });
    return error ? error.message : null;
  } catch (e) { return messageOf(e); }
}

/*
  Usunięcie konta: serwer (POST /api/konto/usun, klucz service_role) weryfikuje token sesji,
  usuwa dane i konto logowania. Potem czyścimy sesję lokalnie. Zwraca komunikat błędu albo null.
  Dane w tej przeglądarce (postęp, programy) zostają — można je wyczyścić osobno.
*/
export async function deleteAccount(): Promise<string | null> {
  try {
    const sb = await getSupabase(); if (!sb) return "Konto jest wyłączone.";
    const { data } = await sb.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return "Brak sesji. Zaloguj się ponownie.";
    const res = await fetch("/api/konto/usun", { method: "POST", headers: { authorization: `Bearer ${token}` } });
    let msg = `Błąd serwera (${res.status}).`;
    try { const j = (await res.json()) as { message?: string }; if (j.message) msg = j.message; } catch { /* odpowiedź bez JSON */ }
    if (!res.ok) return msg;
    try { await sb.auth.signOut({ scope: "local" }); } catch { dropStoredSession(); }
    stopSync();
    set({ user: null, profile: null, ready: true, error: null });
    return null;
  } catch (e) { return messageOf(e); }
}
