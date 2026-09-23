import Link from "next/link";
import { notFound } from "next/navigation";
import SimClient from "@/components/simulator/SimClient";
import { diagrams } from "@/components/diagrams";
import Article, { Toc, tocItems } from "@/components/Article";
import CodeText from "@/components/CodeText";
import TocDrawer from "@/components/TocDrawer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Chip from "@/components/ui/Chip";
import PageBanner from "@/components/ui/PageBanner";
import { articles } from "@/content/articles";
import { bannerFor, bySlug, gcodes, levelName, type GCode } from "@/lib/gcodes";

export function generateStaticParams() { return gcodes.map((g) => ({ slug: g.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const g = bySlug((await params).slug);
  return g ? { title: `${g.code} — ${g.name} — GCat`, description: g.short } : { title: "Kod — GCat" };
}

function H({ id, children }: { id: string; children: React.ReactNode }) {
  return <h2 id={id} className="card-h">{children}</h2>;
}

function relatedOf(g: GCode): GCode[] {
  const list = g.related?.map(bySlug).filter((x): x is GCode => !!x)
    ?? gcodes.filter((x) => x.group === g.group && x.slug !== g.slug).slice(0, 4);
  return list.slice(0, 6);
}

/*
  Standard karty kodu (ten sam układ dla każdego kodu):
  baner → jedno zdanie → Składnia i adresy → [Schemat] → Jak to działa → Przykład
  → Sinumerik → Na co uważać → Powiązane. Karty z pełnym artykułem zamiast sekcji
  opisowych mają artykuł, ale początek i koniec zostają takie same.
*/
export default async function CodePage({ params }: { params: Promise<{ slug: string }> }) {
  const g = bySlug((await params).slug);
  if (!g) notFound();
  const i = gcodes.findIndex((x) => x.slug === g.slug);
  const prev = gcodes[i - 1], next = gcodes[i + 1];
  const mode = g.turning && !g.milling ? "lathe" : "mill";
  const art = articles[g.slug];
  const self = g.code.toUpperCase().split(/[\s/–-]+/).filter((c) => /^[GM]\d/.test(c));
  const artHasFig = !!art?.some((b) => b.t === "diagram");
  const fig = diagrams[g.slug] && !artHasFig ? diagrams[g.slug] : null;
  const rel = relatedOf(g);

  const syntax = (
    <section className="grid gap-3">
      <H id="skladnia">Składnia</H>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><div className="syntax-label">Fanuc</div><pre className="syntax">{g.syntax.fanuc}</pre></div>
        <div><div className="syntax-label">Sinumerik</div><pre className="syntax">{g.syntax.sinumerik}</pre></div>
      </div>
      {g.params.length > 0 && (
        <table className="addr-table">
          <thead><tr><th>Adres</th><th>Znaczenie</th></tr></thead>
          <tbody>{g.params.map((p) => (
            <tr key={p.key}><td><code className="addr">{p.key}</code></td><td><CodeText text={p.desc} self={self} /></td></tr>
          ))}</tbody>
        </table>
      )}
    </section>
  );

  const figure = fig && (<section className="grid gap-3"><H id="schemat">Schemat</H>{fig()}</section>);

  const related = rel.length > 0 && (
    <section className="grid gap-3">
      <H id="powiazane">Powiązane</H>
      <div className="rel-list">
        {rel.map((r) => (
          <Link key={r.slug} href={`/kody/${r.slug}`} className="rel">
            <code>{r.code}</code><span>{r.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );

  const footerNav = (
    <nav className="article-nav">
      <span>{prev && <Link href={`/kody/${prev.slug}`}>‹ {prev.code}</Link>}</span>
      <Link href="/kody">Wszystkie kody</Link>
      <span>{next && <Link href={`/kody/${next.slug}`}>{next.code} ›</Link>}</span>
    </nav>
  );

  const head = (
    <>
      <Breadcrumbs items={[{ href: "/", label: "GCat" }, { href: "/kody", label: "Kody" }, { label: g.code }]} />
      <PageBanner src={bannerFor(g)} kicker={g.group} title={g.code} subtitle={g.name} mono size="compact" priority
        meta={<>
          <Chip tone={g.level === 1 ? "success" : g.level === 2 ? "warning" : "danger"}>{levelName(g.level)}</Chip>
          <Chip>{g.modal ? "modalny" : "jednorazowy"}</Chip>
          {g.milling && <Chip tone="info">frezowanie</Chip>}
          {g.turning && <Chip tone="info">toczenie</Chip>}
        </>} />
      <p className="lead max-w-prose"><CodeText text={g.short} self={self} /></p>
    </>
  );

  if (art) {
    const toc = [{ id: "skladnia", label: "Składnia" }, ...(figure ? [{ id: "schemat", label: "Schemat" }] : []), ...tocItems(art), ...(related ? [{ id: "powiazane", label: "Powiązane" }] : [])];
    return (
      <div className="article-layout">
        <article className="grid gap-6 min-w-0 code-card">
          {head}
          {syntax}
          {figure}
          <div className="toc-mobile"><Toc blocks={art} /></div>
          <Article blocks={art} />
          {related}
          {footerNav}
        </article>
        <aside className="toc-rail"><Toc blocks={art} sticky /></aside>
        <div className="toc-drawer-only"><TocDrawer title={g.code} items={toc} /></div>
      </div>
    );
  }

  const paras = g.desc.split(/\n\n+/);
  const toc = [
    { id: "skladnia", label: "Składnia" },
    ...(figure ? [{ id: "schemat", label: "Schemat" }] : []),
    { id: "opis", label: "Jak to działa" },
    { id: "przyklad", label: "Przykład" },
    ...(g.sinumerik ? [{ id: "sinumerik", label: "Sinumerik" }] : []),
    ...(g.pitfalls.length ? [{ id: "uwagi", label: "Na co uważać" }] : []),
    ...(related ? [{ id: "powiazane", label: "Powiązane" }] : []),
  ];

  return (
    <article className="grid gap-6 max-w-4xl code-card">
      {head}
      {syntax}
      {figure}
      <section className="grid gap-2 max-w-prose">
        <H id="opis">Jak to działa</H>
        {paras.map((t, k) => <p key={k} className="leading-relaxed"><CodeText text={t} self={self} /></p>)}
      </section>
      <section className="grid gap-2">
        <H id="przyklad">Przykład</H>
        {g.simulate === false ? (
          <figure className="grid gap-1">
            <pre className="syntax">{g.example}</pre>
            <figcaption className="cap">Program do przeczytania — symulator nie odtwarza tej funkcji.</figcaption>
          </figure>
        ) : (
          <SimClient initial={g.example} mode={mode} />
        )}
      </section>
      {g.sinumerik && (
        <section className="grid gap-2 max-w-prose">
          <H id="sinumerik">Sinumerik</H>
          <aside className="note note-info"><CodeText text={g.sinumerik} self={self} /></aside>
        </section>
      )}
      {g.pitfalls.length > 0 && (
        <section className="grid gap-2 max-w-prose">
          <H id="uwagi">Na co uważać</H>
          {g.pitfalls.map((p) => <aside key={p} className="note note-warn"><CodeText text={p} self={self} /></aside>)}
        </section>
      )}
      {related}
      {footerNav}
      <TocDrawer title={g.code} items={toc} />
    </article>
  );
}
