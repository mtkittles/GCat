"use client";
import { useSyncExternalStore } from "react";
import type { Session } from "@supabase/supabase-js";
import { ACCOUNT_ENABLED, getSupabase } from "./supabase";
import type { Plan } from "./entitlements";
import { startSync, stopSync } from "./sync";

/*
  Stan konta po stronie przeglądarki: sesja z Supabase i profil (plan).
  Jedna inicjalizacja na kartę; komponenty czytają stan przez useAccount().
*/
export interface AccountUser { id: string; email: string | null }
export interface Profile { plan: Plan; displayName: string | null }
export interface AccountState { enabled: boolean; ready: boolean; user: AccountUser | null; profile: Profile | null; error: string | null }

let state: AccountState = { enabled: ACCOUNT_ENABLED, ready: !ACCOUNT_ENABLED, user: null, profile: null, error: null };
const listeners = new Set<() => void>();
const set = (patch: Partial<AccountState>) => { state = { ...state, ...patch }; listeners.forEach((l) => l()); };
let inited = false;

async function loadProfile(userId: string) {
  const sb = await getSupabase(); if (!sb) return;
  const { data } = await sb.from("profiles").select("plan, display_name").eq("id", userId).maybeSingle();
  set({ profile: { plan: data?.plan === "pro" ? "pro" : "free", displayName: data?.display_name ?? null } });
}

function applySession(session: Session | null) {
  const user = session?.user ? { id: session.user.id, email: session.user.email ?? null } : null;
  set({ user, ready: true, profile: user ? state.profile : null });
  if (user) { loadProfile(user.id); startSync(user.id); } else stopSync();
}

function init() {
  if (inited || !ACCOUNT_ENABLED) return;
  inited = true;
  const p = getSupabase(); if (!p) return;
  p.then((sb) => {
    sb.auth.getSession().then(({ data }) => applySession(data.session));
    sb.auth.onAuthStateChange((_e, session) => applySession(session));
  }).catch((e) => set({ ready: true, error: String(e) }));
}

function subscribe(cb: () => void) { listeners.add(cb); init(); return () => { listeners.delete(cb); }; }
const SSR: AccountState = { enabled: ACCOUNT_ENABLED, ready: false, user: null, profile: null, error: null };

export function useAccount(): AccountState { return useSyncExternalStore(subscribe, () => state, () => SSR); }

const redirectTo = () => `${window.location.origin}/konto`;

export async function signInWithEmail(email: string): Promise<string | null> {
  const sb = await getSupabase(); if (!sb) return "Konto jest wyłączone.";
  const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo() } });
  return error ? error.message : null;
}

export async function signInWithGoogle(): Promise<string | null> {
  const sb = await getSupabase(); if (!sb) return "Konto jest wyłączone.";
  const { error } = await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: redirectTo() } });
  return error ? error.message : null;
}

export async function signOut() { const sb = await getSupabase(); if (sb) await sb.auth.signOut(); }

export async function updateDisplayName(name: string): Promise<string | null> {
  const sb = await getSupabase(); if (!sb || !state.user) return "Brak sesji.";
  const { error } = await sb.from("profiles").update({ display_name: name }).eq("id", state.user.id);
  if (!error) set({ profile: { plan: state.profile?.plan ?? "free", displayName: name } });
  return error ? error.message : null;
}
