"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import PageBanner from "@/components/ui/PageBanner";
import { glossary } from "@/lib/content";
import { bySlug } from "@/lib/gcodes";
import { diagrams } from "@/components/diagrams";

export default function Glossary() {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const sorted = [...glossary].sort((a, b) => a.term.localeCompare(b.term, "pl"));
    if (!s) return sorted;
    return sorted.filter((e) => [e.term, e.def, ...e.aliases].join(" ").toLowerCase().includes(s));
  }, [q]);

  return (
    <div className="grid gap-5">
      <PageBanner src="/img/banner-turn.jpg" title="Słownik" subtitle="Terminy, które pojawiają się w artykułach i na hali." size="compact" priority />
      <div>
        <h1 className="text-3xl font-bold">Słownik pojęć</h1>
        <p className="section-lead">Terminy, które pojawiają się w artykułach i na hali. Bez skrótów myślowych.</p>
      </div>
      <div className="filters">
        <input placeholder="Szukaj: pocienianie, naddatek, ap…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <dl className="glossary">
        {list.map((e) => (
          <div key={e.term} id={e.term.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-")}>
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
