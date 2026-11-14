"use client";
import Link from "next/link";
import { Fragment, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { glossary, type GlossaryEntry } from "@/lib/content";
import { bySlug } from "@/lib/gcodes";
import { diagrams } from "@/components/diagrams";
import { sources } from "@/content/nauka/sources";
import { DIGITS, groupOf, hasla } from "@/lib/glossaryIndex";

type LessonLink = { id: string; title: string; href: string };

const SORTED = [...glossary].sort((a, b) => a.term.localeCompare(b.term, "pl"));
const GROUPS = [...new Set(SORTED.map((e) => groupOf(e.term)))];

/*
  Wybrana litera żyje w adresie (#litera-K), żeby dało się ją podesłać i żeby „wstecz” działało.
  Kotwica hasła (#posuw) nie filtruje: pokazuje wszystkie hasła i przewija do wskazanego.
*/
const subs = new Set<() => void>();
const subscribe = (cb: () => void) => {
  subs.add(cb); window.addEventListener("hashchange", cb);
  return () => { subs.delete(cb); window.removeEventListener("hashchange", cb); };
};
const readHash = () => { try { return decodeURIComponent(window.location.hash.slice(1)); } catch { return ""; } };
const writeHash = (h: string) => {
  window.history.pushState(null, "", h ? `#${encodeURIComponent(h)}` : window.location.pathname + window.location.search);
  subs.forEach((cb) => cb());
};
const LETTER = "litera-";

/** „ae — szerokość skrawania” → symbol i nazwa osobno; pozostałe hasła bez zmian. */
function Title({ term }: { term: string }) {
  const m = term.match(/^(\S{1,3}) — (.+)$/);
  return m ? <><span className="gl-sym">{m[1]}</span> {m[2]}</> : <>{term}</>;
}

function Card({ e, lessons }: { e: GlossaryEntry; lessons: LessonLink[] }) {
  const fig = e.diagram ? diagrams[e.diagram] : undefined;
  const codes = e.see.map((s) => bySlug(s)).filter((g): g is NonNullable<typeof g> => !!g);
  return (
    <article id={e.anchor} className={`gl-card${fig ? " is-wide" : ""}`}>
      <div className="gl-text">
        <h3><Title term={e.term} /></h3>
        {e.aliases.length > 0 && <p className="gl-alias">Także: {e.aliases.join(", ")}</p>}
        <p className="gl-def">{e.def}</p>
        {(lessons.length > 0 || codes.length > 0 || !!e.sources?.length) && (
          <dl className="gl-meta">
            {lessons.length > 0 && (
              <div><dt>W lekcjach</dt><dd>{lessons.map((l) => <Link key={l.href} href={l.href} title={l.title} className="gl-chip">{l.id}</Link>)}</dd></div>
            )}
            {codes.length > 0 && (
              <div><dt>Karty kodów</dt><dd>{codes.map((g) => <Link key={g.slug} href={`/kody/${g.slug}`} className="gl-chip is-code">{g.code}</Link>)}</dd></div>
            )}
            {e.sources?.length ? (
              <div><dt>Źródło</dt><dd className="gl-src">{e.sources.map((r, i) => {
                const src = sources[r.id], url = r.url || src?.url;
                const label = [src?.short ?? r.id, r.loc].filter(Boolean).join(", ");
                return <span key={r.id + r.where} title={r.where}>{i > 0 && " · "}{url ? <a href={url} target="_blank" rel="noopener noreferrer">{label} ↗</a> : label}</span>;
              })}</dd></div>
            ) : null}
          </dl>
        )}
      </div>
      {fig && <div className="gl-fig glossary-fig">{fig()}</div>}
    </article>
  );
}

export default function Glossary({ lessons = {} }: { lessons?: Record<string, LessonLink[]> }) {
  const [q, setQ] = useState("");
  const hash = useSyncExternalStore(subscribe, readHash, () => "");
  const listRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  const found = useMemo(() => {
    const s = q.trim().toLocaleLowerCase("pl");
    return s ? SORTED.filter((e) => [e.term, e.def, ...e.aliases].join(" ").toLocaleLowerCase("pl").includes(s)) : SORTED;
  }, [q]);
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const e of found) c[groupOf(e.term)] = (c[groupOf(e.term)] ?? 0) + 1;
    return c;
  }, [found]);

  // litera z adresu obowiązuje, o ile ma hasła w bieżących wynikach wyszukiwania
  const wanted = hash.startsWith(LETTER) ? hash.slice(LETTER.length) : "";
  const letter = wanted && counts[wanted] ? wanted : "";
  const shown = letter ? found.filter((e) => groupOf(e.term) === letter) : found;

  // Przejście do hasła po kotwicy (wejście z dymka, z kalkulatora, z wyszukiwarki w nagłówku).
  // Lista jest długa, a po wczytaniu czcionek i rysunków jej wysokość jeszcze się zmienia, więc przez
  // chwilę po wejściu hasło jest dosuwane pod pasek liter — do pierwszego ruchu użytkownika.
  useEffect(() => {
    if (!hash || hash.startsWith(LETTER)) return;
    const el = document.getElementById(hash), list = listRef.current;
    if (!el || !list) return;
    const go = () => el.scrollIntoView({ block: "start", behavior: "instant" });
    go();
    const ro = new ResizeObserver(go);
    ro.observe(list);
    const moves = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    const stop = () => { ro.disconnect(); window.clearTimeout(timer); moves.forEach((m) => window.removeEventListener(m, stop)); };
    moves.forEach((m) => window.addEventListener(m, stop, { passive: true }));
    const timer = window.setTimeout(stop, 2500);
    return stop;
  }, [hash]);

  // na telefonie pasek liter przewija się w poziomie — wybrana litera ma być widoczna (np. po wejściu z adresu #litera-W)
  useEffect(() => {
    const nav = navRef.current, on = nav?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (nav && on && nav.scrollWidth > nav.clientWidth) nav.scrollTo({ left: on.offsetLeft - (nav.clientWidth - on.clientWidth) / 2 });
  }, [letter]);

  const pick = (L: string) => {
    writeHash(L ? LETTER + L : "");
    const el = listRef.current;
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: "start" });
  };

  const summary = q.trim()
    ? `${hasla(shown.length)} dla „${q.trim()}”${letter ? ` na literę ${letter}` : ""}`
    : letter ? `${hasla(shown.length)} na ${letter === DIGITS ? "cyfrę" : `literę ${letter}`}` : hasla(SORTED.length);

  return (
    <div className="gl-page">
      <header className="gl-top">
        <div>
          <h1>Słownik</h1>
          <p>Pojęcia z lekcji i z hali, wyjaśnione krótko.</p>
        </div>
        <div className="gl-search">
          <input type="text" inputMode="search" aria-label="Szukaj w słowniku" placeholder="Szukaj: pocienianie, naddatek, ap…" value={q}
            onChange={(e) => { setQ(e.target.value); if (letter) writeHash(""); /* szukanie obejmuje cały słownik; literą można potem zawęzić wyniki */ }} />
          {q && <button type="button" aria-label="Wyczyść wyszukiwanie" onClick={() => setQ("")}>×</button>}
        </div>
      </header>

      <nav className="gl-letters" aria-label="Filtr liter" ref={navRef}>
        <button type="button" className="gl-all" aria-pressed={!letter} onClick={() => pick("")}>Wszystkie</button>
        {GROUPS.map((L) => (
          <button key={L} type="button" aria-pressed={letter === L} disabled={!counts[L]} title={counts[L] ? hasla(counts[L]) : "Brak haseł w wynikach"} onClick={() => pick(letter === L ? "" : L)}>{L}</button>
        ))}
      </nav>

      <div className="gl-list" ref={listRef}>
        {/* przy samym filtrze litery liczbę haseł pokazuje nagłówek litery; komunikat zostaje dla czytników ekranu */}
        <p className={`gl-count${letter && !q.trim() ? " sr-only" : ""}`} role="status">{summary}</p>
        {shown.map((e, k) => {
          const g = groupOf(e.term), head = k === 0 || groupOf(shown[k - 1].term) !== g;
          return (
            <Fragment key={e.anchor}>
              {head && <h2 className="gl-letter"><span>{g}</span><small>{hasla(counts[g])}</small></h2>}
              <Card e={e} lessons={lessons[e.anchor] ?? []} />
            </Fragment>
          );
        })}
        {shown.length === 0 && (
          <p className="gl-empty">Brak haseł pasujących do „{q.trim()}”. Sprawdź pisownię albo <button type="button" className="link-btn" onClick={() => setQ("")}>wyczyść wyszukiwanie</button>.</p>
        )}
      </div>
    </div>
  );
}
