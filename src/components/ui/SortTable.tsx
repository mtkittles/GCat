"use client";
import { Children, cloneElement, isValidElement, useMemo, useState, type ReactElement, type ReactNode } from "react";

/*
  Tabela sortowana kliknięciem w nagłówek (<Table sort="true"> w treści MDX; porównania w Technologii).
  Dostaje gotową tabelę z kompilacji MDX (thead + tbody) i przestawia wiersze tbody — bez zmiany HTML komórek.
  Liczby (także z przecinkiem i zakresy „200–1200” — po pierwszej liczbie) sortują się liczbowo, reszta alfabetycznie (pl).
  Na telefonie tabela układa się w karty (nagłówek ukryty), kolejność zostaje z ostatniego sortowania.
*/

type El = ReactElement<{ children?: ReactNode; [k: string]: unknown }>;

/** Tekst węzła React (komórki z pogrubieniem, kodem, odnośnikami). */
export function textOf(n: ReactNode): string {
  if (n == null || typeof n === "boolean") return "";
  if (typeof n === "string" || typeof n === "number") return String(n);
  if (Array.isArray(n)) return n.map(textOf).join("");
  if (isValidElement(n)) return textOf((n.props as { children?: ReactNode }).children);
  return "";
}

/** Pierwsza liczba w tekście komórki (przecinek dziesiętny, spacja tysięcy) albo NaN. */
export function numOf(s: string): number {
  const m = s.replace(/(\d)[\s  ](?=\d{3}\b)/g, "$1").match(/-?\d+(?:[.,]\d+)?/);
  return m ? parseFloat(m[0].replace(",", ".")) : NaN;
}

const kids = (e: El) => Children.toArray(e.props.children).filter(isValidElement) as El[];

export function compareCells(a: string, b: string): number {
  const x = numOf(a), y = numOf(b);
  if (!Number.isNaN(x) && !Number.isNaN(y) && x !== y) return x - y;
  return a.localeCompare(b, "pl", { sensitivity: "base", numeric: true });
}

export default function SortTable({ children }: { children: ReactNode }) {
  const [sort, setSort] = useState<{ col: number; dir: 1 | -1 } | null>(null);
  const table = Children.toArray(children).find(isValidElement) as El | undefined;

  const view = useMemo(() => {
    if (!table) return null;
    const parts = kids(table);
    const thead = parts.find((p) => p.type === "thead"), tbody = parts.find((p) => p.type === "tbody");
    if (!thead || !tbody) return null;
    const headRow = kids(thead)[0];
    const rows = kids(tbody);
    const sorted = sort ? [...rows].sort((r1, r2) => sort.dir * compareCells(textOf(kids(r1)[sort.col]), textOf(kids(r2)[sort.col]))) : rows;
    const ths = headRow ? kids(headRow).map((th, i) => {
      const on = sort?.col === i;
      const label = textOf(th);
      const next = on && sort!.dir === 1 ? -1 : 1;
      return cloneElement(th, {
        key: i,
        "aria-sort": on ? (sort!.dir === 1 ? "ascending" : "descending") : "none",
        children: (
          <button type="button" className="st-btn" onClick={() => setSort({ col: i, dir: next })} title={`Sortuj: ${label}`}>
            {th.props.children}
            <span className="st-ico" aria-hidden>{on ? (sort!.dir === 1 ? "▲" : "▼") : "↕"}</span>
          </button>
        ),
      });
    }) : [];
    return cloneElement(table, { className: `${String(table.props.className ?? "")} st-table`.trim() },
      cloneElement(thead, { key: "h" }, headRow ? cloneElement(headRow, {}, ths) : null),
      cloneElement(tbody, { key: "b" }, sorted.map((r, i) => cloneElement(r, { key: (r.key as string) ?? i }))));
  }, [table, sort]);

  return <>{view ?? children}</>;
}
