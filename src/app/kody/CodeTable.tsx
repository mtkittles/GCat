"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { levelName, type GCode } from "@/lib/gcodes";
import { codeParts, groupId } from "@/lib/codeRange";

/*
  Lista /kody (paczka Z c, audyt kart cz. 2 §4.1): nagłówki grup z przyklejonym paskiem skoku,
  zwarty wiersz (kod, nazwa, jedna linia opisu), znacznik maszyny tylko przy karcie jednej maszyny,
  kolejne kody jako zakres („G40–G42”). Filtry maszyny i wyszukiwanie zostają; pole wyboru grupy
  zastępuje pasek skoku.
*/

type Filter = "all" | "mill" | "lathe" | "curated";

const KEY = "gcat:kody:filters";

/** Filtry katalogu zapamiętane w sesji — po wejściu w kartę i cofnięciu lista wygląda tak samo. */
function loadSaved(): { filter: Filter; q: string; y: number } | null {
  try { const v = JSON.parse(window.sessionStorage.getItem(KEY) || "null"); return v && typeof v === "object" ? v : null; } catch { return null; }
}

function Code({ code }: { code: string }) {
  const parts = codeParts(code);
  return <>{parts.map((p, i) => <span key={p} className="kl-code-part">{p}{i < parts.length - 1 ? " " : ""}</span>)}</>;
}

export default function CodeTable({ items }: { items: GCode[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  // odtworzenie filtrów i pozycji listy po hydratacji (stan początkowy musi zgadzać się z HTML-em z serwera)
  useEffect(() => {
    const t = setTimeout(() => {
      const v = loadSaved(); if (!v) return;
      setFilter(v.filter ?? "all"); setQ(v.q ?? "");
      if (v.y > 0) requestAnimationFrame(() => window.scrollTo({ top: v.y }));
    }, 0);
    return () => clearTimeout(t);
  }, []);
  const remember = (patch: Partial<{ filter: Filter; q: string }>) => {
    try { window.sessionStorage.setItem(KEY, JSON.stringify({ filter, q, ...patch, y: 0 })); } catch { /* bez zapisu */ }
  };
  const rememberScroll = () => { try { window.sessionStorage.setItem(KEY, JSON.stringify({ filter, q, y: window.scrollY })); } catch { /* bez zapisu */ } };
  const list = useMemo(() => items.filter((g) => {
    if (filter === "mill" && !g.milling) return false;
    if (filter === "lathe" && !g.turning) return false;
    if (filter === "curated" && !g.star) return false;
    const s = q.trim().toLowerCase();
    return !s || [g.code, g.name, g.short, g.group].join(" ").toLowerCase().includes(s);
  }), [items, filter, q]);
  // grupy w kolejności pierwszego wystąpienia na liście (pole `order` kart)
  const groups = useMemo(() => {
    const m = new Map<string, GCode[]>();
    for (const g of list) { if (!m.has(g.group)) m.set(g.group, []); m.get(g.group)!.push(g); }
    return [...m];
  }, [list]);

  return (
    <div className="grid gap-4">
      <div className="filters">
        {(["all", "mill", "lathe", "curated"] as Filter[]).map((f) => (
          <button key={f} aria-pressed={filter === f} onClick={() => { setFilter(f); remember({ filter: f }); }}>
            {f === "all" ? "Wszystkie" : f === "mill" ? "Frezowanie" : f === "lathe" ? "Toczenie" : `★ Opracowane (${items.filter((g) => g.star).length})`}
          </button>
        ))}
        <input type="search" placeholder="Szukaj: G02, łuk, chłodziwo…" aria-label="Szukaj w katalogu" value={q} onChange={(e) => { setQ(e.target.value); remember({ q: e.target.value }); }} />
      </div>
      {groups.length > 1 && (
        <nav className="kl-jump" aria-label="Grupy kodów">
          {groups.map(([g, gs]) => <a key={g} href={`#${groupId(g)}`}>{g} <small>{gs.length}</small></a>)}
        </nav>
      )}
      <p className="text-sm text-muted" aria-live="polite">{list.length === items.length ? `${items.length} kart` : `${list.length} z ${items.length} kart`}</p>
      {groups.map(([grp, gs]) => (
        <section key={grp} className="kl-group" aria-labelledby={groupId(grp)}>
          <h2 id={groupId(grp)} className="kl-h">{grp} <small>{gs.length}</small></h2>
          <ul className="kl-list">
            {gs.map((g) => {
              const one = g.milling !== g.turning;
              return (
                <li key={g.slug}>
                  <Link href={`/kody/${g.slug}`} className="kl-row" onClick={rememberScroll}>
                    <span className="kl-code"><Code code={g.code} />{g.star && <span className="star" title="Karta opracowana w pełnym układzie: schematy, animacje, różnice sterowań, typowe błędy">★</span>}</span>
                    <span className="kl-main">
                      <b>{g.name}</b>
                      <span className="kl-short">{g.short}</span>
                    </span>
                    <span className="kl-meta">
                      {one && <span className="tag on">{g.milling ? "frez" : "tok"}</span>}
                      {g.variesBy && <span className="tag tag-var" title={`Znaczenie zależy od: ${g.variesBy}`}>zależy od: {g.variesBy}</span>}
                      <span className="kl-level">{levelName(g.level)}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      {list.length === 0 && (
        <p className="text-muted" role="status">Nic nie pasuje do „{q.trim()}”. Spróbuj krótszej frazy, np. „G4”, albo <button type="button" className="link-btn" onClick={() => { setQ(""); setFilter("all"); remember({ q: "", filter: "all" }); }}>wyczyść filtry</button>.</p>
      )}
    </div>
  );
}
