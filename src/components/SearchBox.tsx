"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { search, type Hit } from "@/lib/searchIndex";

export default function SearchBox() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false); // tryb mobilny: pole rozwijane z ikony
  const [hits, setHits] = useState<Hit[]>([]);
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

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

  return (
    <div className={`searchbox ${expanded ? "is-open" : ""}`} ref={box}>
      <button className="search-toggle" aria-label="Szukaj" aria-expanded={expanded}
        onClick={() => { setExpanded((v) => !v); setTimeout(() => input.current?.focus(), 0); }}>
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
    </div>
  );
}
