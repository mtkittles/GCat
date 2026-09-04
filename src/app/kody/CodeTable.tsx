"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { levelName, type GCode } from "@/lib/gcodes";

type Filter = "all" | "mill" | "lathe";

export default function CodeTable({ items }: { items: GCode[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const list = useMemo(() => items.filter((g) => {
    if (filter === "mill" && !g.milling) return false;
    if (filter === "lathe" && !g.turning) return false;
    const s = q.trim().toLowerCase();
    return !s || [g.code, g.name, g.short, g.group].join(" ").toLowerCase().includes(s);
  }), [items, filter, q]);

  return (
    <div className="grid gap-4">
      <div className="filters">
        {(["all", "mill", "lathe"] as Filter[]).map((f) => (
          <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)}>{f === "all" ? "Wszystkie" : f === "mill" ? "Frezowanie" : "Toczenie"}</button>
        ))}
        <input placeholder="Szukaj: G02, łuk, chłodziwo…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <table className="code-table">
        <thead><tr><th>Kod</th><th>Funkcja</th><th className="hidden sm:table-cell">Grupa</th><th className="hidden sm:table-cell">Poziom</th></tr></thead>
        <tbody>
          {list.map((g) => (
            <tr key={g.slug}>
              <td><Link href={`/kody/${g.slug}`}>{g.code}</Link></td>
              <td><Link href={`/kody/${g.slug}`} className="font-semibold">{g.name}</Link><div className="text-muted text-[13px]">{g.short}</div>
                <div className="mt-1"><span className={`tag ${g.milling ? "on" : ""}`}>frez</span><span className={`tag ${g.turning ? "on" : ""}`}>tok</span>{g.modal && <span className="tag">modalny</span>}</div></td>
              <td className="hidden sm:table-cell">{g.group}</td>
              <td className="hidden sm:table-cell">{levelName(g.level)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {list.length === 0 && <p className="text-muted">Nic nie pasuje. Spróbuj krótszej frazy, np. „G4”.</p>}
    </div>
  );
}
