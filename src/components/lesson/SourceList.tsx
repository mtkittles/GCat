import { sourceDoc, sources } from "@/content/nauka/sources";

/*
  Lista źródeł — wspólna dla lekcji i kart kodów. Każdy wpis: dokument (wydanie, numer),
  co potwierdza, miejsce (rozdział i strona albo „do uzupełnienia”), uwaga i link z datą dostępu.
  `fold` (lekcje): pełne opisy zwinięte pod listą skrótów, żeby nie wydłużać końca lekcji (#80 §5).
*/

export interface SourceRef { id: string; where: string; loc?: string; url?: string }

export default function SourceList({ items, id = "zrodla", fold = false }: { items: SourceRef[]; id?: string; fold?: boolean }) {
  if (!items.length) return null;
  const list = (
      <ul className="ls-src-list">
        {items.map((s) => {
          const src = sources[s.id];
          const url = s.url || src?.url;
          return (
            <li key={s.id + s.where} className="ls-src-item">
              <b>{src?.short ?? s.id}</b>
              {src && <span className="ls-src-doc">{sourceDoc(src)}{src.control && ` — ${src.control}`}</span>}
              <span><i>Potwierdza:</i> {s.where}</span>
              <span><i>Miejsce:</i> {s.loc || (s.url ? "strona pod linkiem" : <em>rozdział i strona do uzupełnienia</em>)}</span>
              {src?.note && <span className="ls-src-note">{src.note}</span>}
              {url && <a href={url} target="_blank" rel="noopener noreferrer">Otwórz dokument ↗{src?.accessed && <small> (dostęp {src.accessed})</small>}</a>}
            </li>
          );
        })}
      </ul>
  );
  return (
    <section className="ls-src" aria-labelledby={id}>
      <h2 id={id}>Źródła</h2>
      {fold ? (
        <details className="ls-src-more">
          <summary>{[...new Set(items.map((s) => sources[s.id]?.short ?? s.id))].join(" · ")}<span className="ls-src-open"> — pokaż wydania, rozdziały i strony</span></summary>
          {list}
        </details>
      ) : list}
    </section>
  );
}
