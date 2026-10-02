"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { isPassed, isRead, markVisited, progressKey, setRead, useProgress } from "@/lib/progress";

/*
  Boczne panele lekcji na komputerze:
  – lewy: spis sekcji z zaznaczeniem bieżącej i lekcje modułu ze stanem,
  – prawy: postęp lekcji, podgląd programu detalu, poprzednia i następna.
  Na telefonie oba są ukryte; zostaje wysuwany spis treści i status pod treścią.
*/

export type TocItem = { id: string; label: string };
export type SideLesson = { id: string; title: string; href: string | null };

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(-1);
  useEffect(() => {
    let raf = 0;
    const calc = () => {
      raf = 0;
      const line = window.innerHeight * 0.3;
      let idx = -1;
      ids.forEach((id, k) => { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < line) idx = k; });
      const d = document.documentElement;
      if (idx >= 0 && window.scrollY + window.innerHeight >= d.scrollHeight - 8) idx = ids.length - 1;
      setActive((a) => (a === idx ? a : idx));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(calc); };
    calc();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); if (raf) cancelAnimationFrame(raf); };
  }, [ids]);
  return active;
}

export function LessonNav({ toc, track, moduleLabel, lessons, currentId }: { toc: TocItem[]; track: string; moduleLabel: string; lessons: SideLesson[]; currentId: string }) {
  const [ids] = useState(() => toc.map((t) => t.id));
  const active = useActiveSection(ids);
  const prog = useProgress();
  return (
    <nav className="ls-nav" aria-label="Nawigacja lekcji">
      <p className="ls-nav-h">W tej lekcji</p>
      <ol className="ls-nav-toc">
        {toc.map((t, k) => (
          <li key={t.id}><a href={`#${t.id}`} className={k === active ? "is-on" : undefined} aria-current={k === active ? "true" : undefined}>{t.label}</a></li>
        ))}
      </ol>
      <p className="ls-nav-h">{moduleLabel}</p>
      <ol className="ls-nav-mod">
        {lessons.map((l) => {
          const p = prog[progressKey(track, l.id)];
          const passed = isPassed(p), read = isRead(p);
          const state = l.id === currentId ? "is-cur" : passed ? "is-done" : read ? "is-read" : "";
          const body = <><i aria-label={passed ? "zaliczona testem" : read ? "przeczytana" : undefined}>{passed ? "✓" : read ? "•" : ""}</i><b>{l.id}</b><span>{l.title}</span></>;
          return (
            <li key={l.id}>
              {l.href && l.id !== currentId ? <Link href={l.href} className={state}>{body}</Link> : <span className={`ls-nav-self ${state}`}>{body}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Stan lekcji: zaliczona / najlepszy wynik testu / przycisk. Zapisuje też wizytę. */
export function LessonStatus({ track, id, inline = false }: { track: string; id: string; inline?: boolean }) {
  const key = progressKey(track, id);
  const p = useProgress()[key];
  useEffect(() => { if (!inline) markVisited(key); }, [key, inline]);
  return (
    <div className={`ls-status${isPassed(p) ? " is-done" : isRead(p) ? " is-read" : ""}${inline ? " ls-status-inline" : ""}`}>
      <p className="ls-status-h">{isPassed(p) ? "Zaliczona testem" : isRead(p) ? "Przeczytana" : "Postęp"}</p>
      <p className="ls-status-q">
        {p?.quiz ? <>Najlepszy wynik testu: <b>{p.quiz.score} / {p.quiz.total}</b>{isPassed(p) ? "" : " — test zalicza wynik od 80%."}</> : "Test jeszcze nierozwiązany. Wynik od 80% zalicza lekcję testem."}
      </p>
      {!isPassed(p) && (
        <button type="button" className={isRead(p) ? "btn ghost" : "btn"} onClick={() => setRead(key, !isRead(p))}>
          {isRead(p) ? "Cofnij „przeczytana”" : "Oznacz jako przeczytaną"}
        </button>
      )}
    </div>
  );
}

export type RailLine = { code: string; state: "old" | "new" | "future" };

export function LessonRail({ track, id, meta, lines, prev, next }: {
  track: string; id: string; meta: { label: string; value: string }[]; lines: RailLine[];
  prev?: { href: string; label: string }; next?: { href: string; label: string };
}) {
  const shown = lines.filter((l) => l.state !== "future");
  const fresh = shown.filter((l) => l.state === "new").length;
  return (
    <aside className="ls-rail" aria-label="Postęp i program">
      <LessonStatus track={track} id={id} />
      <dl className="ls-rail-meta">{meta.map((m) => <div key={m.label}><dt>{m.label}</dt><dd>{m.value}</dd></div>)}</dl>
      <div className="ls-rail-prog">
        <p className="ls-nav-h">Program detalu <span>{shown.length} bl.{fresh ? ` · +${fresh}` : ""}</span></p>
        <pre>{shown.map((l, k) => <span key={k} className={l.state === "new" ? "is-new" : undefined}>{l.code}{"\n"}</span>)}</pre>
        <a href="#program" className="ls-rail-link">Opis linii ↓</a>
      </div>
      <div className="ls-rail-nav">
        {prev && <Link href={prev.href}><small>Poprzednia</small>{prev.label}</Link>}
        {next && <Link href={next.href}><small>Następna</small>{next.label}</Link>}
      </div>
    </aside>
  );
}
