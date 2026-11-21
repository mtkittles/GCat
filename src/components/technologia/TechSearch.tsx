"use client";
import Link from "next/link";
import { Search } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { norm, queryTerms } from "@/lib/searchNorm";
import { artHref, TYP_LABEL, type Dzial, type TechArt } from "@/lib/technologia";

/*
  Szukajka działu Technologia: tytuł, opis, normy i nagłówki artykułów (bez pełnego tekstu — ten jest w /szukaj).
  Pusta fraza = nic nie pokazuje; pod listą odnośnik do wyszukiwarki całego serwisu z tą samą frazą.
*/
export default function TechSearch({ arts, dzialy }: { arts: TechArt[]; dzialy: Dzial[] }) {
  const [q, setQ] = useState("");
  const id = useId();
  const hits = useMemo(() => {
    if (norm(q.trim()).length < 2) return [];
    const terms = queryTerms(q);
    return arts.map((a) => {
      const title = norm(a.title), rest = norm([a.short, ...a.normy, ...a.headings.map((h) => h.label)].join(" "));
      let score = 0;
      for (const t of terms) { if (title.includes(t)) score += 10; else if (rest.includes(t)) score += 3; else return null; }
      return { a, score };
    }).filter((x): x is { a: TechArt; score: number } => !!x).sort((x, y) => y.score - x.score).slice(0, 8);
  }, [q, arts]);
  const dz = (s: string) => dzialy.find((d) => d.slug === s)?.title ?? s;
  return (
    <div className="tech-search" role="search">
      <label htmlFor={id} className="sr-only">Szukaj w Technologii</label>
      <div className="tech-search-box">
        <Search aria-hidden />
        <input id={id} type="search" value={q} placeholder="Szukaj, np. frez, Vc, węglik…" autoComplete="off" onChange={(e) => setQ(e.target.value)} />
      </div>
      {norm(q.trim()).length >= 2 && (
        <div className="tech-search-res" aria-live="polite">
          {hits.length ? (
            <ul>{hits.map(({ a }) => (
              <li key={a.key}><Link href={artHref(a)}><span className="tech-k">{dz(a.dzial)} · {TYP_LABEL[a.typ]}</span><b>{a.title}</b><span>{a.short}</span></Link></li>
            ))}</ul>
          ) : <p className="text-muted">Brak artykułów dla tej frazy.</p>}
          <Link className="tech-search-all" href={`/szukaj?q=${encodeURIComponent(q.trim())}`}>Szukaj „{q.trim()}” w całym serwisie ›</Link>
        </div>
      )}
    </div>
  );
}
