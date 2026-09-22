import Link from "next/link";

type Ref = { href: string; label: string };

/* Pasek poprzednia/następna przyklejony nad dolną nawigacją (mobile); na desktopie zwykły pasek na końcu. */
export default function LessonPager({ prev, next, pos, total }: { prev?: Ref; next?: Ref; pos: number; total: number }) {
  return (
    <nav className="pager" aria-label="Nawigacja między lekcjami">
      {prev ? (
        <Link href={prev.href} className="pager-btn" aria-label={`Poprzednia: ${prev.label}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
          <span className="pager-label"><small>Poprzednia</small>{prev.label}</span>
        </Link>
      ) : <span className="pager-btn is-empty" />}
      <span className="pager-pos">{pos}<i>/</i>{total}</span>
      {next ? (
        <Link href={next.href} className="pager-btn is-next" aria-label={`Następna: ${next.label}`}>
          <span className="pager-label"><small>Następna</small>{next.label}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
        </Link>
      ) : <span className="pager-btn is-empty" />}
    </nav>
  );
}
