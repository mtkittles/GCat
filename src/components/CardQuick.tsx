import Link from "next/link";
import type { GCode } from "@/lib/gcodes";
import type { LessonRef } from "@/lib/lessonRefs";

/* Karta skrócona kodu — prawa kolumna na komputerze: wszystko, czego szuka się w pośpiechu. */

type ListItem = { id: string; label: string };

export default function CardQuick({ g, related, lessons, toc }: { g: GCode; related: GCode[]; lessons: LessonRef[]; toc?: ListItem[] }) {
  return (
    <div className="cq">
      <div className="cq-card">
        <div className="cq-head"><b>{g.code}</b><span>{g.name}</span></div>
        <div className="cq-tags">
          <span>{g.group}</span><span>{g.modal ? "modalny" : "jednorazowy"}</span>
          {g.milling && <span>frezarka</span>}{g.turning && <span>tokarka</span>}
        </div>
        <p className="cq-l">Fanuc</p>
        <pre>{g.syntax.fanuc}</pre>
        <p className="cq-l">Sinumerik</p>
        <pre>{g.syntax.sinumerik}</pre>
        {g.params.length > 0 && (
          <dl className="cq-params">{g.params.slice(0, 6).map((p) => <div key={p.key}><dt>{p.key}</dt><dd>{p.desc}</dd></div>)}</dl>
        )}
      </div>
      {toc && toc.length > 0 && (
        <nav className="cq-card cq-toc" aria-label="W tej karcie">
          <p className="cq-l">W tej karcie</p>
          <ol>{toc.map((t) => <li key={t.id}><a href={`#${t.id}`}>{t.label}</a></li>)}</ol>
        </nav>
      )}
      {lessons.length > 0 && (
        <div className="cq-card">
          <p className="cq-l">W lekcjach</p>
          <ul className="cq-links">{lessons.slice(0, 5).map((l) => <li key={l.href}><Link href={l.href}><code>{l.id}</code>{l.title}</Link></li>)}</ul>
        </div>
      )}
      {related.length > 0 && (
        <div className="cq-card">
          <p className="cq-l">Powiązane kody</p>
          <div className="cq-rel">{related.map((r) => <Link key={r.slug} href={`/kody/${r.slug}`}>{r.code}</Link>)}</div>
        </div>
      )}
    </div>
  );
}
