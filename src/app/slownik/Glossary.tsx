"use client";
import Link from "next/link";
import { Fragment, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { glossary, type GlossaryEntry } from "@/lib/content";
import { bySlug } from "@/lib/gcodes";
import { diagrams } from "@/components/diagrams";
import { EditLink } from "@/components/edycja/EditMode";
import Rys from "@/components/rys/Rys";
import { rysBySlug } from "@/components/rys/registry";
import type { RysFigure } from "@/lib/rys/model";
import { sources } from "@/content/nauka/sources";
import { DIGITS, groupOf, hasla } from "@/lib/glossaryIndex";
import Term from "@/components/ui/Term";
import NumberFlow from "@number-flow/react";
import { Search, X } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

export type LessonLink = { id: string; title: string; href: string };

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

/**
 * Karta hasła — ta sama na stronie /slownik i w edytorze treści. `edit` (edytor) owija pola w „kliknij i edytuj”,
 * `figure` podaje rysunki z rysownika jeszcze nieopublikowane.
 */
export function Card({ e, lessons, edit, figure = rysBySlug }: { e: GlossaryEntry; lessons: LessonLink[]; edit?: (key: string, view: ReactNode) => ReactNode; figure?: (slug: string) => RysFigure | undefined }) {
  const ed = edit ?? ((_k: string, v: ReactNode) => v);
  // rysunek z rysownika ma pierwszeństwo przed rysunkiem z kodu strony
  const drawn = e.rysunek ? figure(e.rysunek) : undefined;
  const fig = drawn ? () => <Rys fig={drawn} /> : e.diagram ? diagrams[e.diagram] : undefined;
  const codes = e.see.map((s) => bySlug(s)).filter((g): g is NonNullable<typeof g> => !!g);
  // nazwy zamienne bez powtórzeń tytułu („n — obroty wrzeciona” nie pokazuje „n” ani „obroty wrzeciona”)
  const own = new Set(e.term.split(" — ").concat(e.term).map((t) => t.trim().toLocaleLowerCase("pl")));
  const also = e.aliases.filter((a) => !own.has(a.trim().toLocaleLowerCase("pl")));
  return (
    <article id={e.anchor} className={`gl-card${fig ? " is-wide" : ""}`}>
      <div className="gl-text">
        {ed("term", <h3><Title term={e.term} /> {!edit && <EditLink kolekcja="slownik" slug={e.anchor} />}</h3>)}
        {ed("aliases", also.length > 0 ? <p className="gl-alias">Także: {also.join(", ")}</p> : edit ? <p className="gl-alias">Nazwy zamienne: brak</p> : null)}
        {ed("def", <p className="gl-def">{e.def}</p>)}
        {ed("formulas", <>{e.formulas?.map((f) => (
          <div key={f.expr} className="gl-formula">
            <p className="gl-expr">{f.expr}</p>
            {f.where.length > 0 && (
              <ul className="gl-where">
                {f.where.map((w) => {
                  // „symbol — znaczenie, jednostka” (symbol do 6 znaków, np. D_otw, albo para „D_m, D_c”); wiersz bez myślnika to uwaga do wzoru
                  const m = w.match(/^(\S{1,6}(?:, \S{1,4})?) — (.+)$/);
                  return m ? <li key={w}><b>{m[1]}</b><span>{m[2]}</span></li> : <li key={w} className="is-note"><span>{w}</span></li>;
                })}
              </ul>
            )}
            {f.example && <p className="gl-ex"><b>Przykład.</b> {f.example}</p>}
          </div>
        ))}{edit && !e.formulas?.length && <p className="gl-alias">Wzory: brak</p>}</>)}
        {(lessons.length > 0 || codes.length > 0 || !!e.sources?.length) && ed("meta", (
          <dl className="gl-meta">
            {lessons.length > 0 && (
              <div><dt>W lekcjach</dt><dd>{lessons.map((l) => <Link key={l.href} href={l.href} title={l.title} className="gl-chip">{l.id}</Link>)}</dd></div>
            )}
            {codes.length > 0 && (
              // „Code Peek”: kliknięcie pokazuje skróconą składnię Fanuc i Sinumerik, w dymku link do pełnej karty
              <div><dt>Karty kodów</dt><dd>{codes.map((g) => <span key={g.slug} className="gl-peek"><Term k={g.slug}>{g.code}</Term></span>)}</dd></div>
            )}
            {e.sources?.length ? (
              <div><dt>Źródło</dt><dd className="gl-src">{e.sources.map((r, i) => {
                const src = sources[r.id], url = r.url || src?.url;
                const label = [src?.short ?? r.id, r.loc].filter(Boolean).join(", ");
                return <span key={r.id + r.where} title={r.where}>{i > 0 && " · "}{url ? <a href={url} target="_blank" rel="noopener noreferrer">{label} ↗</a> : label}</span>;
              })}</dd></div>
            ) : null}
          </dl>
        ))}
      </div>
      {fig ? ed("fig", <div className="gl-fig glossary-fig">{fig()}</div>) : edit ? ed("fig", <div className="gl-fig glossary-fig ed-empty">Bez rysunku — kliknij, żeby dodać</div>) : null}
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
    return s ? SORTED.filter((e) => [e.term, e.def, ...e.aliases, ...(e.formulas ?? []).flatMap((f) => [f.expr, ...f.where])].join(" ").toLocaleLowerCase("pl").includes(s)) : SORTED;
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
      <header className="ph">
        <span className="ph-k">Słownik CNC · {hasla(SORTED.length)}</span>
        <h1 className="ph-title">Słownik</h1>
        <p className="ph-lead">Pojęcia z lekcji i z hali, wyjaśnione krótko — ze wzorami, rysunkami i odnośnikami do kart kodów.</p>
      </header>

      {/* wyszukiwarka i indeks liter przyklejone razem pod paskiem strony */}
      <div className="gl-sticky">
      <div className="gl-bar">
        <label className="kc-search">
          <Search aria-hidden />
          <input type="text" inputMode="search" aria-label="Szukaj w słowniku" placeholder="Szukaj: pocienianie, naddatek, ap…" value={q}
            onChange={(e) => { setQ(e.target.value); if (letter) writeHash(""); /* szukanie obejmuje cały słownik; literą można potem zawęzić wyniki */ }} />
          {q && <button type="button" className="kc-clear" aria-label="Wyczyść wyszukiwanie" onClick={() => setQ("")}><X aria-hidden /></button>}
        </label>
        <span className="kc-count" aria-hidden><NumberFlow value={shown.length} /><small>/{SORTED.length}</small></span>
      </div>

      <nav className="gl-letters" aria-label="Filtr liter" ref={navRef}>
        <button type="button" className="gl-all" aria-pressed={!letter} onClick={() => pick("")}>Wszystkie</button>
        {GROUPS.map((L) => (
          <button key={L} type="button" aria-pressed={letter === L} disabled={!counts[L]} title={counts[L] ? hasla(counts[L]) : "Brak haseł w wynikach"} onClick={() => pick(letter === L ? "" : L)}>{L}</button>
        ))}
      </nav>
      </div>

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
          <EmptyState title={`Brak haseł pasujących do „${q.trim()}”.`}
            action={<button type="button" className="key empty-btn" onClick={() => setQ("")}>Wyczyść wyszukiwanie</button>}>
            Sprawdź pisownię albo wpisz krótszy fragment — szukanie obejmuje też nazwy zamienne haseł.
          </EmptyState>
        )}
      </div>
    </div>
  );
}
