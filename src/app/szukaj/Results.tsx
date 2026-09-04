"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { search } from "@/lib/searchIndex";

const KINDS = ["wszystko", "kod", "lekcja", "zadanie", "pojęcie"] as const;

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
            <span className="search-title">{h.title}</span>
            <span className="text-sm text-muted">{h.subtitle}</span>
            <span className="search-snip">{h.snippet}</span>
          </Link>
        ))}
      </div>
      {q.length >= 2 && shown.length === 0 && <p className="text-muted">Nic nie znaleziono. Spróbuj krótszej frazy, na przykład „łuk” albo „G83”.</p>}
    </div>
  );
}
