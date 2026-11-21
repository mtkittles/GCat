"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { search } from "@/lib/searchIndex";
import { matchRanges } from "@/lib/searchNorm";
import EmptyState from "@/components/ui/EmptyState";
import PageHead from "@/components/ui/PageHead";
import { Search } from "lucide-react";

const KINDS = ["wszystko", "kod", "lekcja", "zadanie", "pojęcie", "artykuł"] as const;

/** Podświetla trafienia według tych samych reguł co `search()` (bez polskich znaków, każde słowo osobno). */
function hl(text: string, q: string): ReactNode {
  const ranges = matchRanges(text, q);
  if (!ranges.length) return text;
  const out: ReactNode[] = [];
  let p = 0;
  ranges.forEach(([a, b], i) => {
    if (a > p) out.push(text.slice(p, a));
    out.push(<mark key={i} className="hl">{text.slice(a, b)}</mark>);
    p = b;
  });
  if (p < text.length) out.push(text.slice(p));
  return out;
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
      <PageHead title="Szukaj" />
      <label className="kc-search sz-search">
        <Search aria-hidden />
        <span className="sr-only">Szukaj w serwisie</span>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Wpisz frazę…" autoFocus />
      </label>
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
