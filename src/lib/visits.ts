export type VisitEntry = { path: string; title: string; ts: number };

const KEY = "gcat_visits_v1";
const MAX = 8;

export function recordVisit(path: string, title: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    const list: VisitEntry[] = raw ? JSON.parse(raw) : [];
    const next = [{ path, title, ts: Date.now() }, ...list.filter((v) => v.path !== path)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch { /* localStorage niedostępny (tryb prywatny itp.) — po prostu pomijamy */ }
}

export function getVisits(): VisitEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
