"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { levelName, type GCode } from "@/lib/gcodes";
import { CURATED } from "@/content/articles";

type Filter = "all" | "mill" | "lathe" | "curated";

const KEY = "gcat:kody:filters";

/** Filtry katalogu zapamiętane w sesji — po wejściu w kartę i cofnięciu lista wygląda tak samo. */
function loadSaved(): { filter: Filter; q: string; group: string; y: number } | null {
  try { const v = JSON.parse(window.sessionStorage.getItem(KEY) || "null"); return v && typeof v === "object" ? v : null; } catch { return null; }
}

export default function CodeTable({ items }: { items: GCode[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("");
  const groups = useMemo(() => [...new Set(items.map((g) => g.group))], [items]);
  // odtworzenie filtrów i pozycji listy po hydratacji (stan początkowy musi zgadzać się z HTML-em z serwera)
  useEffect(() => {
    const t = setTimeout(() => {
      const v = loadSaved(); if (!v) return;
      setFilter(v.filter ?? "all"); setQ(v.q ?? ""); setGroup(v.group ?? "");
      if (v.y > 0) requestAnimationFrame(() => window.scrollTo({ top: v.y }));
    }, 0);
    return () => clearTimeout(t);
  }, []);
  const remember = (patch: Partial<{ filter: Filter; q: string; group: string }>) => {
    try { window.sessionStorage.setItem(KEY, JSON.stringify({ filter, q, group, ...patch, y: 0 })); } catch { /* bez zapisu */ }
  };
  const rememberScroll = () => { try { window.sessionStorage.setItem(KEY, JSON.stringify({ filter, q, group, y: window.scrollY })); } catch { /* bez zapisu */ } };
  const list = useMemo(() => items.filter((g) => {
    if (filter === "mill" && !g.milling) return false;
    if (filter === "lathe" && !g.turning) return false;
    if (filter === "curated" && !CURATED.has(g.slug)) return false;
    if (group && g.group !== group) return false;
    const s = q.trim().toLowerCase();
    return !s || [g.code, g.name, g.short, g.group].join(" ").toLowerCase().includes(s);
  }), [items, filter, q, group]);

  return (
    <div className="grid gap-4">
      <div className="filters">
        {(["all", "mill", "lathe", "curated"] as Filter[]).map((f) => (
          <button key={f} aria-pressed={filter === f} onClick={() => { setFilter(f); remember({ filter: f }); }}>
            {f === "all" ? "Wszystkie" : f === "mill" ? "Frezowanie" : f === "lathe" ? "Toczenie" : `★ Opracowane (${CURATED.size})`}
          </button>
        ))}
        <select aria-label="Grupa kodów" value={group} onChange={(e) => { setGroup(e.target.value); remember({ group: e.target.value }); }}>
          <option value="">Każda grupa</option>
          {groups.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <input type="search" placeholder="Szukaj: G02, łuk, chłodziwo…" aria-label="Szukaj w katalogu" value={q} onChange={(e) => { setQ(e.target.value); remember({ q: e.target.value }); }} />
      </div>
      <p className="text-sm text-muted" aria-live="polite">{list.length === items.length ? `${items.length} kart` : `${list.length} z ${items.length} kart`}</p>
      <table className="code-table">
        <thead><tr><th>Kod</th><th>Funkcja</th><th className="hidden sm:table-cell">Grupa</th><th className="hidden sm:table-cell">Poziom</th></tr></thead>
        <tbody>
          {list.map((g) => (
            <tr key={g.slug}>
              <td>
                <Link href={`/kody/${g.slug}`} onClick={rememberScroll}>{g.code}</Link>
                {CURATED.has(g.slug) && <span className="star" title="Karta opracowana w pełnym układzie: schematy, animacje, sterowniki, błędy">★</span>}
              </td>
              <td><Link href={`/kody/${g.slug}`} className="font-semibold" onClick={rememberScroll}>{g.name}</Link><div className="text-muted text-[13px]">{g.short}</div>
                <div className="mt-1"><span className={`tag ${g.milling ? "on" : ""}`}>frez</span><span className={`tag ${g.turning ? "on" : ""}`}>tok</span>{g.modal && <span className="tag">modalny</span>}{g.variesBy && <span className="tag tag-var" title={`Znaczenie zależy od: ${g.variesBy}`}>zależy od: {g.variesBy}</span>}</div></td>
              <td className="hidden sm:table-cell">{g.group}</td>
              <td className="hidden sm:table-cell">{levelName(g.level)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {list.length === 0 && (
        <p className="text-muted" role="status">Nic nie pasuje do „{q.trim()}”{group ? ` w grupie ${group}` : ""}. Spróbuj krótszej frazy, np. „G4”, albo <button type="button" className="link-btn" onClick={() => { setQ(""); setGroup(""); setFilter("all"); remember({ q: "", group: "", filter: "all" }); }}>wyczyść filtry</button>.</p>
      )}
    </div>
  );
}
