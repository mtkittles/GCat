"use client";
import type { Problem } from "./walidacja";

/*
  Edytor w przeglądarce: API (/api/edytor), logowanie GitHub (okno panelu treści), szkice i kopie w localStorage,
  porównanie wersji (różnice linii).
*/

export interface Ja { mode: "local" | "github"; canWrite: boolean; user: { login: string; name: string; avatar?: string } | null; expired?: boolean }
export interface Wersja { sha: string; date: string; author: string; message: string; url: string }
export interface ZapisWynik { mode: "local" | "github"; merged: boolean; branch?: string; commit?: string; pr?: { number: number; url: string }; compare?: string; note?: string; files: { path: string; sha: string }[] }
export class ApiError extends Error {
  constructor(public status: number, message: string, public data: { login?: boolean; problems?: (Problem & { file: string })[]; conflict?: string } = {}) { super(message); }
}

async function call<T>(url: string, init?: RequestInit, retry = true): Promise<T> {
  const res = await fetch(url, { ...init, cache: "no-store", credentials: "same-origin" });
  if (res.status === 401 && retry) {
    // token GitHub wygasa po 8 h — odświeżenie przez API panelu treści (ciasteczko z refresh tokenem)
    const r = await fetch("/api/keystatic/github/refresh-token", { method: "POST", credentials: "same-origin" }).catch(() => null);
    if (r?.ok) return call<T>(url, init, false);
  }
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new ApiError(res.status, data.error ?? `Błąd ${res.status}`, data as ApiError["data"]);
  return data;
}

const q = (o: Record<string, string>) => new URLSearchParams(o).toString();
export const api = {
  ja: () => call<Ja>("/api/edytor/ja"),
  plik: (path: string) => call<{ text: string; sha: string }>(`/api/edytor/plik?${q({ path })}`),
  historia: (path: string) => call<{ versions: Wersja[] }>(`/api/edytor/historia?${q({ path })}`).then((r) => r.versions),
  wersja: (path: string, sha: string) => call<{ text: string }>(`/api/edytor/wersja?${q({ path, sha })}`).then((r) => r.text),
  strona: () => call<{ commit: string | null }>("/api/edytor/strona").then((r) => r.commit),
  zapisz: (files: { path: string; text: string }[], message: string, base: Record<string, string | null>) =>
    call<ZapisWynik>("/api/edytor/zapisz", { method: "POST", headers: { "Content-Type": "application/json", "x-gcat-edytor": "1" }, body: JSON.stringify({ files, message, base }) }),
};

/** Logowanie GitHub w osobnym oknie (to samo co w panelu treści); kończy się, gdy pojawi się ciasteczko z tokenem. */
export function loginGithub(): Promise<boolean> {
  const has = () => /(?:^|;\s*)keystatic-gh-access-token=/.test(document.cookie);
  const w = window.open("/api/keystatic/github/login?from=branch/main", "gcat-login", "width=620,height=760");
  return new Promise((resolve) => {
    const t = window.setInterval(() => {
      if (has()) { window.clearInterval(t); try { w?.close(); } catch { /* inne okno */ } resolve(true); }
      else if (!w || w.closed) { window.clearInterval(t); resolve(has()); }
    }, 700);
  });
}

/* ───────────── szkice i kopie ───────────── */

export interface Szkic { text: string; base: string; at: number }
const SZ = (path: string) => `gcat:edytor:szkic:${path}`;
const KO = (path: string) => `gcat:edytor:kopie:${path}`;
const read = <T,>(k: string): T | null => { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : null; } catch { return null; } };
const write = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* pełny albo prywatny tryb */ } };

export const szkice = {
  get: (path: string) => read<Szkic>(SZ(path)),
  set: (path: string, s: Szkic) => write(SZ(path), s),
  drop: (path: string) => { try { localStorage.removeItem(SZ(path)); } catch { /* nic */ } },
};

/** Kopie lokalne (ostatnie 20): przed publikacją i przed przywróceniem wersji — zawsze jest do czego wrócić. */
export interface Kopia { at: number; text: string; label: string }
export const kopie = {
  list: (path: string) => read<Kopia[]>(KO(path)) ?? [],
  add: (path: string, text: string, label: string) => {
    const list = kopie.list(path);
    if (list[0]?.text === text) return;
    write(KO(path), [{ at: Date.now(), text, label }, ...list].slice(0, 20));
  },
};

/* ───────────── porównanie wersji ───────────── */

export type DiffLine = { t: "=" | "+" | "-"; s: string };

/** Różnice linii (LCS); dla dużych plików ogranicza się do zmienionego środka. */
export function diffLines(a: string, b: string): DiffLine[] {
  const A = a.split("\n"), B = b.split("\n");
  let s = 0;
  while (s < A.length && s < B.length && A[s] === B[s]) s++;
  let ea = A.length, eb = B.length;
  while (ea > s && eb > s && A[ea - 1] === B[eb - 1]) { ea--; eb--; }
  const a2 = A.slice(s, ea), b2 = B.slice(s, eb);
  const n = a2.length, m = b2.length;
  const out: DiffLine[] = A.slice(0, s).map((x) => ({ t: "=", s: x }));
  if (n * m > 4_000_000) { a2.forEach((x) => out.push({ t: "-", s: x })); b2.forEach((x) => out.push({ t: "+", s: x })); }
  else {
    const L = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = a2[i] === b2[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    let i = 0, j = 0;
    while (i < n && j < m) {
      if (a2[i] === b2[j]) { out.push({ t: "=", s: a2[i] }); i++; j++; }
      else if (L[i + 1][j] >= L[i][j + 1]) out.push({ t: "-", s: a2[i++] });
      else out.push({ t: "+", s: b2[j++] });
    }
    while (i < n) out.push({ t: "-", s: a2[i++] });
    while (j < m) out.push({ t: "+", s: b2[j++] });
  }
  A.slice(ea).forEach((x) => out.push({ t: "=", s: x }));
  return out;
}

export const czas = (t: number | string) => new Date(t).toLocaleString("pl-PL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
