import Link from "next/link";
import type { ReactNode } from "react";
import LeftToc from "@/components/LeftToc";
import SourceList from "@/components/lesson/SourceList";
import TocDrawer from "@/components/TocDrawer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Chip from "@/components/ui/Chip";
import PageBanner from "@/components/ui/PageBanner";
import type { EditSlot } from "@/components/karta/CardView";
import { glossary } from "@/lib/content";
import { bySlug, levelName } from "@/lib/gcodes";
import { artByKey, artHref, lekcjaById, OBROBKA_LABEL, TYP_LABEL, type Dzial, type TechArt } from "@/lib/technologia";
import { DzialIcon } from "./icons";

/*
  Widok artykułu Technologii — wspólny dla strony /technologia/<dział>/<slug> (render przy buildzie)
  i edytora treści (/edytor/technologia/…): edytor podaje treść jako żywy edytor, a `edit` owija pola frontmattera.
  Układ jak karta kodu (CardView): spis z lewej, treść, Powiązane, Źródła, ‹ › w dziale, skrót z prawej.
*/

export interface TechNav { prev?: TechArt; next?: TechArt }

function H({ id, children }: { id: string; children: ReactNode }) {
  return <h2 id={id} className="card-h">{children}</h2>;
}

/** Powiązania z rozwiązanymi tytułami (nieznane klucze pomija — build i tak je zgłasza). */
export function relatedOf(a: TechArt) {
  const p = a.powiazane;
  return {
    kody: p.kody.map(bySlug).filter((g): g is NonNullable<typeof g> => !!g).map((g) => ({ href: `/kody/${g.slug}`, tag: g.code, label: g.name })),
    lekcje: p.lekcje.map(lekcjaById).filter((l): l is NonNullable<typeof l> => !!l).map((l) => ({ href: l.href, tag: l.id, label: l.title })),
    hasla: p.hasla.map((h) => glossary.find((g) => g.anchor === h)).filter((g): g is NonNullable<typeof g> => !!g).map((g) => ({ href: `/slownik#${g.anchor}`, tag: "hasło", label: g.term })),
    artykuly: p.artykuly.map(artByKey).filter((x): x is TechArt => !!x).map((x) => ({ href: artHref(x), tag: TYP_LABEL[x.typ], label: x.title })),
    kalkulator: p.kalkulator,
  };
}

export default function TechArticleView({ a, dzial, body, nav = {}, edit = (_k, v) => v, gate }: {
  a: TechArt; dzial: Dzial; body: ReactNode; nav?: TechNav;
  /** tryb edycji: owija pola artykułu (kliknij i edytuj) */
  edit?: EditSlot;
  /** artykuł Pro: bramka zamiast treści dla gościa (strona); w edytorze brak */
  gate?: (content: ReactNode) => ReactNode;
}) {
  const rel = relatedOf(a);
  const relItems = [...rel.kody, ...rel.lekcje, ...rel.hasla, ...rel.artykuly];
  const hasRel = relItems.length > 0 || rel.kalkulator;
  const toc = [
    ...a.headings.map((h) => ({ id: h.id, label: h.label })),
    ...(hasRel ? [{ id: "powiazane", label: "Powiązane" }] : []),
    { id: "zrodla", label: "Źródła" },
  ];

  const head = (
    <>
      <Breadcrumbs items={[{ href: "/", label: "GCat" }, { href: "/technologia", label: "Technologia" }, { href: `/technologia/${dzial.slug}`, label: dzial.title }, { label: a.title }]} />
      {edit("head", (
        <PageBanner plain kicker={dzial.title} title={a.title} subtitle={TYP_LABEL[a.typ]}
          meta={<>
            {a.stan === "szkic" && <Chip tone="warning">szkic — do weryfikacji</Chip>}
            {a.plan === "pro" && <Chip tone="accent">Pro</Chip>}
            <Chip tone={a.poziom === 1 ? "success" : a.poziom === 2 ? "warning" : "danger"}>{levelName(a.poziom)}</Chip>
            {a.obrobka.map((o) => <Chip key={o} tone="info">{OBROBKA_LABEL[o]}</Chip>)}
            {a.normy.map((n) => <Chip key={n} mono>{n}</Chip>)}
            <Chip>{a.minutes} min czytania</Chip>
          </>} />
      ))}
      {edit("short", <p className="lead max-w-prose">{a.short}</p>)}
    </>
  );

  const related = hasRel && (
    <section className="grid gap-3">
      <H id="powiazane">Powiązane</H>
      {edit("powiazane", (
        <div className="rel-list">
          {relItems.map((r) => <Link key={r.href} href={r.href} className="rel"><code>{r.tag}</code><span>{r.label}</span></Link>)}
          {rel.kalkulator && <Link href="/kalkulator" className="rel"><code>kalkulator</code><span>Parametry skrawania — obroty, posuw, wydajność</span></Link>}
        </div>
      ))}
    </section>
  );

  const sourcesSec = edit("sources", a.sources.length ? <SourceList items={a.sources} fold="mobile" /> : (
    <section className="ls-src" aria-labelledby="zrodla">
      <h2 id="zrodla">Źródła</h2>
      <p className="ls-src-note">Do uzupełnienia — artykuł nie ma jeszcze wskazanych źródeł. Wartości liczbowe traktuj jako orientacyjne; obowiązuje katalog producenta narzędzia.</p>
    </section>
  ));

  const footerNav = (
    <nav className="article-nav">
      <span>{nav.prev && <Link href={artHref(nav.prev)}>‹ {nav.prev.title}</Link>}</span>
      <Link href={`/technologia/${dzial.slug}`}>{dzial.title}</Link>
      <span>{nav.next && <Link href={artHref(nav.next)}>{nav.next.title} ›</Link>}</span>
    </nav>
  );

  const content = <div className="article grid gap-4">{body}</div>;

  return (
    <div className="article-layout cc tech-art">
      <aside className="cc-left"><LeftToc items={toc} title="W tym artykule" /></aside>
      <article className="grid gap-6 min-w-0 code-card">
        {head}
        {gate ? gate(content) : content}
        {related}
        {sourcesSec}
        {footerNav}
      </article>
      <aside className="cc-right">
        <div className="cq">
          <div className="cq-card">
            <div className="cq-head tech-q-head"><DzialIcon icon={dzial.icon} className="tech-q-ico" /><span>{dzial.title}</span></div>
            <div className="cq-tags">
              <span>{TYP_LABEL[a.typ]}</span><span>{levelName(a.poziom)}</span>
              {a.obrobka.map((o) => <span key={o}>{OBROBKA_LABEL[o]}</span>)}
              <span>{a.minutes} min</span>
            </div>
            {a.stan === "szkic" && <p className="tech-q-note">Szkic — treść czeka na weryfikację merytoryczną.</p>}
          </div>
          <nav className="cq-card cq-toc" aria-label="W tym artykule">
            <p className="cq-l">W tym artykule</p>
            <ol>{toc.map((t) => <li key={t.id}><a href={`#${t.id}`}>{t.label}</a></li>)}</ol>
          </nav>
          {rel.kody.length > 0 && (
            <div className="cq-card">
              <p className="cq-l">Kody</p>
              <div className="cq-rel">{rel.kody.map((r) => <Link key={r.href} href={r.href}>{r.tag}</Link>)}</div>
            </div>
          )}
          {rel.lekcje.length > 0 && (
            <div className="cq-card">
              <p className="cq-l">W lekcjach</p>
              <ul className="cq-links">{rel.lekcje.map((l) => <li key={l.href}><Link href={l.href}><code>{l.tag}</code>{l.label}</Link></li>)}</ul>
            </div>
          )}
        </div>
      </aside>
      <div className="toc-drawer-only"><TocDrawer title={a.title} items={toc} /></div>
    </div>
  );
}
