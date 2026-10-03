import type { SupabaseClient } from "@supabase/supabase-js";

/*
  Klient Supabase ładowany dopiero przy pierwszym użyciu (nie obciąża stron bez konta).
  Bez zmiennych środowiskowych konto jest wyłączone, a strona działa jak dotąd.
*/
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const ACCOUNT_ENABLED = !!(URL && KEY);

let client: Promise<SupabaseClient> | null = null;

export function getSupabase(): Promise<SupabaseClient> | null {
  if (!ACCOUNT_ENABLED || typeof window === "undefined") return null;
  if (!client) client = import("@supabase/supabase-js").then((m) => m.createClient(URL!, KEY!));
  return client;
}
