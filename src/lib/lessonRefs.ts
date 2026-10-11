import { flat, lessonHref, type Track } from "@/lib/course";
import type { LessonDoc } from "@/lib/lesson";

/*
  „Gdzie w lekcjach”: dla kodu z karty — lekcje, które go omawiają albo używają.
  Liczone przy budowie strony z treści lekcji (teoria, przykłady, zadania, testy).
*/

export type LessonRef = { href: string; id: string; title: string; track: Track; hits: number };

function docText(d: LessonDoc): string {
  return JSON.stringify([d.theory, d.worked, d.practice, d.quiz, d.pitfalls, d.controllers, d.title, d.goal]);
}

let cache: { track: Track; id: string; title: string; href: string; text: string }[] | null = null;
function all() {
  if (cache) return cache;
  cache = (["frezowanie", "toczenie"] as Track[]).flatMap((t) =>
    flat(t).filter((l) => l.doc && l.slug).map((l) => ({ track: t, id: l.id, title: l.title, href: lessonHref(t, l.slug!), text: docText(l.doc!) })));
  return cache;
}

/** Kody z pola karty, np. "G40 G41 G42", "M41 M42 M43 M44", "G54–G59". */
export function cardCodes(code: string): string[] {
  return code.toUpperCase().split(/[\s/,]+/).filter(Boolean).flatMap((c) => {
    const m = c.match(/^([GM])(\d+)[–-][GM]?(\d+)$/);
    if (!m) return /^[GM]\d/.test(c) ? [c] : [];
    const out: string[] = [];
    for (let n = +m[2]; n <= +m[3]; n++) out.push(`${m[1]}${n}`);
    return out;
  });
}

export function lessonsForCodes(codes: string[], tracks: Track[] = ["frezowanie", "toczenie"], limit = 8): LessonRef[] {
  const res: LessonRef[] = [];
  for (const l of all()) {
    if (!tracks.includes(l.track)) continue;
    let hits = 0;
    for (const c of codes) {
      const [, L, n] = c.match(/^([GM])0*(\d+)/) ?? [];
      if (!L) continue;
      const re = new RegExp(`(?<![A-Z0-9.])${L}0*${n}(?![0-9.])`, "g");
      hits += (l.text.match(re) ?? []).length;
    }
    if (hits >= 2) res.push({ href: l.href, id: l.id, title: l.title, track: l.track, hits });
  }
  // najpierw lekcje, w których kod pada najczęściej; potem kolejność kursu
  return res.sort((a, b) => b.hits - a.hits).slice(0, limit).sort((a, b) => (a.track === b.track ? 0 : a.track === "frezowanie" ? -1 : 1) || a.id.localeCompare(b.id, "pl", { numeric: true }));
}

/**
 * Lekcje, które odsyłają do hasła słownika znacznikiem [[hasło]] albo [[alias|etykieta]].
 * Klucz: kotwica hasła. Liczone przy budowie strony — klient dostaje gotową mapę.
 */
export function lessonsForGlossary(entries: { anchor: string; term: string; aliases: string[] }[], limit = 4): Record<string, LessonRef[]> {
  const norm = (s: string) => s.trim().toLocaleLowerCase("pl");
  const keyOf = new Map<string, string>();
  for (const e of entries) for (const n of [e.term, ...e.aliases]) if (!keyOf.has(norm(n))) keyOf.set(norm(n), e.anchor);
  const out: Record<string, LessonRef[]> = {};
  for (const l of all()) {
    const seen = new Set<string>();
    // [^…"[{] — tekst to JSON; bez tego dopasowanie zaczęłoby się od „[[{” na początku tablicy
    for (const m of l.text.matchAll(/\[\[([^\]|"[{]+)(?:\|[^\]]+)?\]\]/g)) {
      const a = keyOf.get(norm(m[1]));
      if (!a || seen.has(a)) continue;
      seen.add(a);
      (out[a] ??= []).push({ href: l.href, id: l.id, title: l.title, track: l.track, hits: 1 });
    }
  }
  for (const a of Object.keys(out)) out[a] = out[a].slice(0, limit);
  return out;
}
