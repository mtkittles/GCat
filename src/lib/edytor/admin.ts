"use client";
import { useEffect, useSyncExternalStore } from "react";

/*
  Kto jest „właścicielem” strony (tryb edycji, edytor, rysownik): konto GitHub z prawem zapisu do repozytorium,
  sprawdzone przez API (/api/edytor/ja → GitHub). To samo logowanie co publikacja, więc nie ma drugiego hasła.
  Przycisk/pasek w przeglądarce to tylko widok — zapis i tak odrzuci GitHub, jeśli konto nie ma prawa zapisu.
  Odwiedzający bez logowania nie wysyła żadnego zapytania: brak ciasteczka i brak śladu właściciela = „nie”.
  Lokalnie (next dev) zawsze „tak” — zapis idzie na dysk.
*/

export type Admin = "unknown" | "yes" | "no";
const HINT = "gcat:admin"; // login GitHub właściciela, zapamiętany po potwierdzeniu prawa zapisu
const CACHE = "gcat:admin:ok"; // wynik sprawdzenia w tej karcie (10 min)
const EVENT = "gcat:admin";
const LOCAL = process.env.NODE_ENV === "development";

let state: Admin = LOCAL ? "yes" : "unknown";
let running: Promise<void> | null = null;
const set = (s: Admin) => { state = s; window.dispatchEvent(new Event(EVENT)); };
const hasToken = () => /(?:^|;\s*)keystatic-gh-access-token=/.test(document.cookie);
const ls = { get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k: string, v: string | null) => { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch { /* nic */ } } };

interface Ja { user: { login: string } | null; canWrite: boolean; refresh?: boolean }
const ja = async (): Promise<Ja> => (await fetch("/api/edytor/ja", { cache: "no-store", credentials: "same-origin" })).json();

/** Sprawdzenie (raz na kartę przeglądarki, potem z pamięci na 10 min). `force` — po zalogowaniu. */
export function checkAdmin(force = false): Promise<void> {
  if (LOCAL) return Promise.resolve();
  if (running && !force) return running;
  running = (async () => {
    if (!force) {
      try { const c = JSON.parse(sessionStorage.getItem(CACHE) ?? "null") as { ok: boolean; at: number } | null; if (c && Date.now() - c.at < 600_000) { set(c.ok ? "yes" : "no"); return; } } catch { /* brak */ }
      if (!hasToken() && !ls.get(HINT)) { set("no"); return; }
    }
    let r: Ja = { user: null, canWrite: false };
    try {
      r = await ja();
      // token wygasa po 8 h; ciasteczko odświeżania (httpOnly) zna tylko serwer
      if (!r.user && r.refresh && (await fetch("/api/keystatic/github/refresh-token", { method: "POST", credentials: "same-origin" })).ok) r = await ja();
    } catch { /* sieć — traktuj jak brak */ }
    const ok = !!r.user && r.canWrite;
    ls.set(HINT, ok ? r.user!.login : null);
    try { sessionStorage.setItem(CACHE, JSON.stringify({ ok, at: Date.now() })); } catch { /* nic */ }
    set(ok ? "yes" : "no");
  })().finally(() => { running = null; });
  return running;
}

const subscribe = (cb: () => void) => { window.addEventListener(EVENT, cb); return () => window.removeEventListener(EVENT, cb); };

/** Stan właściciela; pierwszy odczyt uruchamia sprawdzenie. */
export function useAdmin(): Admin {
  const s = useSyncExternalStore(subscribe, () => state, () => (LOCAL ? "yes" : "unknown"));
  useEffect(() => { if (state === "unknown") void checkAdmin(); }, []);
  return s;
}

/** Czy ta przeglądarka należała już do właściciela (pokazuje link „Tryb edycji” w stopce bez zapytania do API). */
export const wasAdmin = () => LOCAL || !!ls.get(HINT);
