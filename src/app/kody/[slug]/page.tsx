import CardQuick from "@/components/CardQuick";
import { cardCodes, lessonsForCodes } from "@/lib/lessonRefs";
import Link from "next/link";
import { notFound } from "next/navigation";
import SimClient from "@/components/simulator/SimClient";
import SourceList from "@/components/lesson/SourceList";
import { diagrams } from "@/components/diagrams";
import { Toc, tocItems } from "@/components/Article";
import CodeText from "@/components/CodeText";
import TocDrawer from "@/components/TocDrawer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Chip from "@/components/ui/Chip";
import PageBanner from "@/components/ui/PageBanner";
import { bannerFor, bySlug, gcodes, levelName, type GCode } from "@/lib/gcodes";
import { kartaMdx, normProgram } from "@/lib/mdx/kody";
import { readOnlyCaption } from "@/lib/simGaps";

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

/* Profil zapisu przykładów — jak nad lekcjami i zadaniami. */
function profileOf(g: { milling: boolean; turning: boolean; exampleDialect?: "fanuc" | "sinumerik"; exampleMode?: "mill" | "lathe" }) {
  if (g.exampleDialect === "sinumerik") return "Zapis przykładu: SINUMERIK — język natywny · frezarka · milimetry.";
  const mill = "Fanuc (ISO) · frezarka · milimetry, posuw na minutę (G94)";
  const lathe = "Fanuc, system A · tokarka, X w średnicy · milimetry, posuw na obrót (G99)";
  if (g.milling && g.turning) return `Zapis przykładów: frezarka — ${mill.replace(" · frezarka", "")}; tokarka — ${lathe.replace(" · tokarka", "")}. Przykład główny: ${g.exampleMode === "lathe" ? "tokarski" : "frezarski"}.`;
  return `Zapis przykładów: ${g.turning ? lathe : mill}. Różnice w SINUMERIKU — w składni i sekcji Sinumerik.`;
}

/*
  Standard karty kodu (ten sam układ dla każdego kodu):
  baner → jedno zdanie → Składnia i adresy → [Schemat] → Jak to działa → Przykład
  → Sinumerik → Na co uważać → Powiązane. Karty z pełnym artykułem zamiast sekcji
  opisowych mają artykuł, a pod nim „W skrócie”: Na co uważać, Sinumerik i przykład
  z frontmattera (o ile artykuł go nie zawiera). Gdy artykuł ma własną tabelę adresów,
  Składnia strony pokazuje tylko zapis Fanuc/Sinumerik.
*/
export default async function CodePage({ params }: { params: Promise<{ slug: string }> }) {
  const g = bySlug((await params).slug);
  if (!g) notFound();
  // artykuł karty z content/kody/<slug>.mdx (dane karty: frontmatter tego samego pliku)
  const mdx = g.hasArticle ? await kartaMdx(g.slug) : null;
  const i = gcodes.findIndex((x) => x.slug === g.slug);
  const prev = gcodes[i - 1], next = gcodes[i + 1];
  const mode = g.exampleMode ?? (g.turning && !g.milling ? "lathe" : "mill");
  const self = g.code.toUpperCase().split(/[\s/–-]+/).filter((c) => /^[GM]\d/.test(c));
  const artHasFig = !!mdx?.hasDiagram;
  const fig = diagrams[g.slug] && !artHasFig ? diagrams[g.slug] : null;
  const rel = relatedOf(g);
  const inLessons = lessonsForCodes(cardCodes(g.code), [...(g.milling ? ["frezowanie" as const] : []), ...(g.turning ? ["toczenie" as const] : [])]);

  // artykuł z własną tabelą adresów: strona pokazuje tylko zapis Fanuc/Sinumerik (jedna „Składnia”, W)
  const showParams = g.params.length > 0 && !mdx?.hasAddrTable;
  const syntax = (
    <section className="grid gap-3">
      <H id="skladnia">Składnia</H>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><div className="syntax-label">Fanuc</div><pre tabIndex={0} className="syntax">{g.syntax.fanuc}</pre></div>
        <div><div className="syntax-label">Sinumerik</div><pre tabIndex={0} className="syntax">{g.syntax.sinumerik}</pre></div>
      </div>
      {showParams && (
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

  const lessonsSec = inLessons.length > 0 && (
    <section className="grid gap-3">
      <H id="w-lekcjach">W lekcjach</H>
      <div className="rel-list">
        {inLessons.map((l) => (
          <Link key={l.href} href={l.href} className="rel">
            <code>{l.id}</code><span>{l.title}</span>
          </Link>
        ))}
      </div>
    </section>
  );

  const sourcesSec = g.sources?.length ? <SourceList items={g.sources} fold="mobile" /> : (
    <section className="ls-src" aria-labelledby="zrodla">
      <h2 id="zrodla">Źródła</h2>
      <p className="ls-src-note">Do uzupełnienia — tej karty nie sprawdzono jeszcze w dokumentacji producenta sterowania. Opis dotyczy profilu podanego wyżej; na konkretnej maszynie obowiązuje jej dokumentacja.</p>
    </section>
  );

  const example = g.simulate === false ? (
    <figure className="grid gap-1">
      <pre tabIndex={0} className="syntax">{g.example}</pre>
      <figcaption className="cap">{readOnlyCaption(g.example, mode)}</figcaption>
    </figure>
  ) : (
    <SimClient initial={g.example} mode={mode} stock={g.exampleStock} dialect={g.exampleDialect} />
  );
  const sinumerikNote = g.sinumerik && <aside className="note note-info"><CodeText text={g.sinumerik} self={self} /></aside>;
  const pitfallNotes = g.pitfalls.map((p) => <aside key={p} className="note note-warn"><CodeText text={p} self={self} /></aside>);

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
          {g.variesBy && <Chip tone="warning">zależy od: {g.variesBy}</Chip>}
        </>} />
      <p className="lead max-w-prose"><CodeText text={g.short} self={self} /></p>
      <p className="tp-profile">{profileOf(g)}</p>
    </>
  );

  if (mdx) {
    // spis treści artykułu z nagłówków MDX (kotwice jawne w pliku)
    const tocBlocks = mdx.headings.map((h) => ({ t: "h" as const, x: h.label, id: h.id }));
    // pola karty z frontmattera pod artykułem (decyzja 1, W); przykład tylko wtedy, gdy artykuł go nie zawiera
    const showEx = !!g.example.trim() && !mdx.programs.includes(normProgram(g.example));
    const recap = (g.pitfalls.length > 0 || !!g.sinumerik || showEx) && (
      <section className="grid gap-3 cc-recap">
        <H id="w-skrocie">W skrócie</H>
        {g.pitfalls.length > 0 && <div className="grid gap-2 max-w-prose"><h3 className="cc-h3">Na co uważać</h3>{pitfallNotes}</div>}
        {sinumerikNote && <div className="grid gap-2 max-w-prose"><h3 className="cc-h3">Sinumerik</h3>{sinumerikNote}</div>}
        {showEx && <div className="grid gap-2"><h3 className="cc-h3">Program przykładowy</h3>{example}</div>}
      </section>
    );
    const toc = [{ id: "skladnia", label: "Składnia" }, ...(figure ? [{ id: "schemat", label: "Schemat" }] : []), ...tocItems(tocBlocks), ...(recap ? [{ id: "w-skrocie", label: "W skrócie" }] : []), ...(lessonsSec ? [{ id: "w-lekcjach", label: "W lekcjach" }] : []), ...(related ? [{ id: "powiazane", label: "Powiązane" }] : []), { id: "zrodla", label: "Źródła" }];
    return (
      <div className="article-layout cc">
        <aside className="cc-left"><LeftToc items={toc} /></aside>
        <article className="grid gap-6 min-w-0 code-card">
          {head}
          {syntax}
          {figure}
          <details className="toc-mobile toc-fold"><summary>W tej karcie</summary><Toc blocks={tocBlocks} /></details>
          <div className="article grid gap-4">{await mdx.render()}</div>
          {recap}
          {lessonsSec}
          {related}
          {sourcesSec}
          {footerNav}
        </article>
        <aside className="cc-right"><CardQuick g={g} related={rel} lessons={inLessons} toc={toc} /></aside>
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
    ...(lessonsSec ? [{ id: "w-lekcjach", label: "W lekcjach" }] : []),
    ...(related ? [{ id: "powiazane", label: "Powiązane" }] : []),
    { id: "zrodla", label: "Źródła" },
  ];

  return (
    <div className="article-layout cc">
    <aside className="cc-left"><LeftToc items={toc} /></aside>
    <article className="grid gap-6 min-w-0 code-card">
      {head}
      {syntax}
      {figure}
      <section className="grid gap-2 max-w-prose">
        <H id="opis">Jak to działa</H>
        {paras.map((t, k) => <p key={k} className="leading-relaxed"><CodeText text={t} self={self} /></p>)}
      </section>
      <section className="grid gap-2">
        <H id="przyklad">Przykład</H>
        {example}
      </section>
      {g.sinumerik && (
        <section className="grid gap-2 max-w-prose">
          <H id="sinumerik">Sinumerik</H>
          {sinumerikNote}
        </section>
      )}
      {g.pitfalls.length > 0 && (
        <section className="grid gap-2 max-w-prose">
          <H id="uwagi">Na co uważać</H>
          {pitfallNotes}
        </section>
      )}
      {lessonsSec}
      {related}
      {sourcesSec}
      {footerNav}
    </article>
    <aside className="cc-right"><CardQuick g={g} related={rel} lessons={inLessons} toc={toc} /></aside>
    <div className="toc-drawer-only"><TocDrawer title={g.code} items={toc} /></div>
    </div>
  );
}

/** Spis sekcji karty — lewa kolumna na szerokich ekranach. */
function LeftToc({ items }: { items: { id: string; label: string }[] }) {
  return (
    <nav className="toc toc-sticky" aria-label="W tej karcie">
      <span className="toc-title">W tej karcie</span>
      <ol>{items.map((t) => <li key={t.id}><a href={`#${t.id}`}>{t.label}</a></li>)}</ol>
    </nav>
  );
}
