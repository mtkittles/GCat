import FoldMobile from "@/components/ui/FoldMobile";
import { sourceDoc, sources } from "@/content/nauka/sources";

/*
  Lista źródeł — wspólna dla lekcji i kart kodów. Każdy wpis: dokument (wydanie, numer),
  co potwierdza, miejsce (rozdział i strona; bez wiersza, gdy jeszcze nieustalone — braki wylicza
  audit:nauka), uwaga dla czytelnika (`note`, bez notatek redakcji `internal`) i link z datą dostępu.
  `fold` (lekcje): pełne opisy zwinięte pod listą skrótów, żeby nie wydłużać końca lekcji (#80 §5).
  `fold="mobile"` (karty kodów): zwinięte tylko na telefonie, od 768 px otwarte (decyzja 10 audytu kart).
*/

export interface SourceRef { id: string; where: string; loc?: string; url?: string }

export default function SourceList({ items, id = "zrodla", fold = false }: { items: SourceRef[]; id?: string; fold?: boolean | "mobile" }) {
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
              {(s.loc || s.url) && <span><i>Miejsce:</i> {s.loc || "strona pod linkiem"}</span>}
              {src?.note && <span className="ls-src-note">{src.note}</span>}
              {url && <a href={url} target="_blank" rel="noopener noreferrer">Otwórz dokument ↗{src?.accessed && <small> (dostęp {src.accessed})</small>}</a>}
            </li>
          );
        })}
      </ul>
  );
  const summary = <>{[...new Set(items.map((s) => sources[s.id]?.short ?? s.id))].join(" · ")}<span className="ls-src-open"> — pokaż wydania, rozdziały i strony</span></>;
  return (
    <section className="ls-src" aria-labelledby={id}>
      <h2 id={id}>Źródła</h2>
      {fold === "mobile" ? (
        <FoldMobile className="ls-src-more" summary={summary}>{list}</FoldMobile>
      ) : fold ? (
        <details className="ls-src-more">
          <summary>{summary}</summary>
          {list}
        </details>
      ) : list}
    </section>
  );
}
