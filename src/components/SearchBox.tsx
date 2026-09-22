"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import { search, type Hit } from "@/lib/searchIndex";

const POPULAR = ["G00", "G01", "G02", "G41", "G81", "M03", "kompensacja", "posuw", "cykl"];

/* Pełnoekranowe wyszukiwanie na telefonie — renderowane w portalu, bo nagłówek
   ma backdrop-filter (fixed wewnątrz niego byłby przycięty do nagłówka). */
function SearchSheet({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const run = (v: string) => { setQ(v); setHits(v.trim() ? search(v, 20) : []); };

  // useLayoutEffect: focus jeszcze w obrębie gestu dotknięcia (wymóg iOS dla klawiatury)
  useLayoutEffect(() => { input.current?.focus(); }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  return createPortal(
    <div className="ssheet" role="dialog" aria-label="Wyszukiwanie">
      <div className="ssheet-bar">
        <div className="ssheet-field">
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="2" /><path d="M12.8 12.8 L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          <input ref={input} value={q} onChange={(e) => run(e.target.value)} placeholder="Kod, pojęcie, lekcja…"
            aria-label="Szukaj w serwisie" enterKeyHint="search" autoComplete="off" autoCorrect="off" spellCheck={false} />
          {q && <button type="button" className="ssheet-clear" aria-label="Wyczyść" onClick={() => { run(""); input.current?.focus(); }}>×</button>}
        </div>
        <button type="button" className="ssheet-cancel" onClick={onClose}>Anuluj</button>
      </div>

      <div className="ssheet-body">
        {!q.trim() && (
          <>
            <span className="ssheet-label">Często szukane</span>
            <div className="ssheet-chips">
              {POPULAR.map((p) => <button key={p} type="button" onClick={() => run(p)}>{p}</button>)}
            </div>
          </>
        )}
        {q.trim() && hits.length === 0 && <p className="ssheet-empty">Brak wyników dla „{q}”.</p>}
        {hits.length > 0 && (
          <ul className="ssheet-list">
            {hits.map((h) => (
              <li key={h.href + h.title}>
                <Link href={h.href} onClick={onClose}>
                  <span className={`search-kind k-${h.kind}`}>{h.kind}</span>
                  <span className="search-title">{h.title}</span>
                  <span className="search-snip">{h.snippet}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>,
    document.body,
  );
}

export default function SearchBox() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false); // tryb mobilny: pole rozwijane z ikony
  const [hits, setHits] = useState<Hit[]>([]);
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [sheet, setSheet] = useState(false);
  const path = usePathname();
  const [prevPath, setPrevPath] = useState(path);
  if (prevPath !== path) { setPrevPath(path); if (sheet) setSheet(false); }

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) { setOpen(false); setExpanded(false); } };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); setExpanded(false); }
      const a = document.activeElement as HTMLElement | null;
      if (e.key === "/" && a?.tagName !== "INPUT" && a?.tagName !== "TEXTAREA" && !a?.isContentEditable) {
        e.preventDefault(); setExpanded(true); setTimeout(() => input.current?.focus(), 0);
      }
    };
    document.addEventListener("mousedown", onDoc); document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, []);

  const run = (v: string) => { setQ(v); const h = search(v, 8); setHits(h); setOpen(h.length > 0); };
  const closeSheet = useCallback(() => setSheet(false), []);

  return (
    <div className={`searchbox ${expanded ? "is-open" : ""}`} ref={box}>
      <button className="search-toggle" aria-label="Szukaj" aria-expanded={expanded}
        onClick={() => {
          if (window.matchMedia("(max-width: 767px)").matches) {
            // flushSync: arkusz montuje się w tym samym geście, więc iOS pokaże klawiaturę po focus()
            flushSync(() => setSheet(true));
            return;
          }
          setExpanded((v) => !v); setTimeout(() => input.current?.focus(), 0);
        }}>
        <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="2" />
          <path d="M12.8 12.8 L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      <input ref={input} value={q} onChange={(e) => run(e.target.value)} onFocus={() => setOpen(hits.length > 0)}
        placeholder="Szukaj: G02, kompensacja, wiór…" aria-label="Szukaj w serwisie" />
      {open && (
        <div className="search-results">
          {hits.map((h) => (
            <Link key={h.href + h.title} href={h.href} onClick={() => { setOpen(false); setExpanded(false); }}>
              <span className={`search-kind k-${h.kind}`}>{h.kind}</span>
              <span className="search-title">{h.title}</span>
              <span className="search-snip">{h.snippet}</span>
            </Link>
          ))}
          <Link href={`/szukaj?q=${encodeURIComponent(q)}`} className="search-all" onClick={() => { setOpen(false); setExpanded(false); }}>Wszystkie wyniki dla „{q}”</Link>
        </div>
      )}
      {sheet && <SearchSheet onClose={closeSheet} />}
    </div>
  );
}
