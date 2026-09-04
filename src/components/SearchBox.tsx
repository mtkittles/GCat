"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { search, type Hit } from "@/lib/searchIndex";

export default function SearchBox() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [hits, setHits] = useState<Hit[]>([]);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA" && !(document.activeElement as HTMLElement)?.isContentEditable) {
        e.preventDefault(); box.current?.querySelector("input")?.focus();
      }
    };
    document.addEventListener("mousedown", onDoc); document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, []);

  const run = (v: string) => { setQ(v); const h = search(v, 8); setHits(h); setOpen(h.length > 0); };

  return (
    <div className="searchbox" ref={box}>
      <input value={q} onChange={(e) => run(e.target.value)} onFocus={() => setOpen(hits.length > 0)}
        placeholder="Szukaj: G02, kompensacja, wiór…" aria-label="Szukaj w serwisie" />
      {open && (
        <div className="search-results">
          {hits.map((h) => (
            <Link key={h.href + h.title} href={h.href} onClick={() => setOpen(false)}>
              <span className={`search-kind k-${h.kind}`}>{h.kind}</span>
              <span className="search-title">{h.title}</span>
              <span className="search-snip">{h.snippet}</span>
            </Link>
          ))}
          <Link href={`/szukaj?q=${encodeURIComponent(q)}`} className="search-all" onClick={() => setOpen(false)}>Wszystkie wyniki dla „{q}”</Link>
        </div>
      )}
    </div>
  );
}
