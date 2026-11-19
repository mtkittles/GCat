"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { search } from "@/lib/searchIndex";
import EmptyState from "@/components/ui/EmptyState";

const KINDS = ["wszystko", "kod", "lekcja", "zadanie", "pojęcie"] as const;

/** Podświetla w tekście wystąpienia frazy (bez rozróżniania wielkości liter) — V4. */
function hl(text: string, q: string): ReactNode {
  const s = q.trim();
  if (s.length < 2 || !text) return text;
  const esc = s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp("(" + esc + ")", "gi");
  return text.split(re).map((part, i) => (i % 2 ? <mark key={i} className="hl">{part}</mark> : part));
}

export default function Results() {
  const params = useSearchParams();
  const initial = params.get("q") ?? "";
  const [q, setQ] = useState(initial);
  const [kind, setKind] = useState<(typeof KINDS)[number]>("wszystko");
  const hits = useMemo(() => search(q, 60), [q]);
  const shown = kind === "wszystko" ? hits : hits.filter((h) => h.kind === kind);

  return (
    <div className="grid gap-4">
      <h1 className="text-3xl font-bold">Szukaj</h1>
      <div className="filters">
        <input className="grow" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Wpisz frazę…" autoFocus />
      </div>
      <div className="filters">
        {KINDS.map((k) => <button key={k} aria-pressed={kind === k} onClick={() => setKind(k)}>{k}{k !== "wszystko" && ` (${hits.filter((h) => h.kind === k).length})`}</button>)}
      </div>
      {q.length >= 2 && <p className="text-sm text-muted">{shown.length} {shown.length === 1 ? "wynik" : "wyników"}</p>}
      <div className="grid gap-2">
        {shown.map((h) => (
          <Link key={h.href + h.title} href={h.href} className="search-row">
            <span className={`search-kind k-${h.kind}`}>{h.kind}</span>
            <span className="search-title">{hl(h.title, q)}</span>
            <span className="text-sm text-muted">{h.subtitle}</span>
            <span className="search-snip">{hl(h.snippet, q)}</span>
          </Link>
        ))}
      </div>
      {q.length >= 2 && shown.length === 0 && <EmptyState title={`Nic nie znaleziono dla „${q}”.`}>Spróbuj krótszej frazy, na przykład „łuk” albo „G83”.</EmptyState>}
    </div>
  );
}
