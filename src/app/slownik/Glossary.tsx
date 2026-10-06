"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import PageBanner from "@/components/ui/PageBanner";
import { glossary } from "@/lib/content";
import { bySlug } from "@/lib/gcodes";
import { diagrams } from "@/components/diagrams";

const first = (t: string) => t.trim().charAt(0).toLocaleUpperCase("pl");

export default function Glossary() {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const sorted = [...glossary].sort((a, b) => a.term.localeCompare(b.term, "pl"));
    if (!s) return sorted;
    return sorted.filter((e) => [e.term, e.def, ...e.aliases].join(" ").toLowerCase().includes(s));
  }, [q]);
  const letters = useMemo(() => [...new Set(list.map((e) => first(e.term)))], [list]);

  return (
    <div className="grid gap-5">
      <PageBanner src="/img/banner-turn.jpg" kicker="Referencja" title="Słownik"
        subtitle="Pojęcia z lekcji i z hali, wyjaśnione krótko." size="compact" priority />
      <div className="filters">
        <input placeholder="Szukaj: pocienianie, naddatek, ap…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <nav className="gl-letters" aria-label="Litery">
        {letters.map((L) => <a key={L} href={`#litera-${L}`}>{L}</a>)}
        <span className="gl-count">{list.length} haseł</span>
      </nav>
      <dl className="glossary">
        {list.map((e, k) => (
          <div key={e.term} id={e.anchor} className={e.diagram ? "has-fig" : undefined}>
            {(k === 0 || first(list[k - 1].term) !== first(e.term)) && <span className="gl-letter" id={`litera-${first(e.term)}`}>{first(e.term)}</span>}
            <dt>{e.term}</dt>
            <dd>
              <p>{e.def}</p>
              {e.diagram && diagrams[e.diagram] && <div className="glossary-fig">{diagrams[e.diagram]()}</div>}
              {e.see.length > 0 && (
                <p className="text-sm text-muted">
                  Zobacz: {e.see.map((s, i) => { const g = bySlug(s); return g ? <span key={s}>{i > 0 && ", "}<Link href={`/kody/${s}`} className="underline">{g.code}</Link></span> : null; })}
                </p>
              )}
            </dd>
          </div>
        ))}
      </dl>
      {list.length === 0 && <p className="text-muted">Nic nie pasuje do „{q}”.</p>}
    </div>
  );
}
