import Link from "next/link";
import { notFound } from "next/navigation";
import SimClient from "@/components/simulator/SimClient";
import { diagrams } from "@/components/diagrams";
import Article, { Toc } from "@/components/Article";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Chip from "@/components/ui/Chip";
import { articles } from "@/content/articles";
import { bySlug, gcodes, levelName } from "@/lib/gcodes";

export function generateStaticParams() { return gcodes.map((g) => ({ slug: g.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const g = bySlug((await params).slug);
  return g ? { title: `${g.code} — ${g.name} — GCat`, description: g.short } : { title: "Kod — GCat" };
}

export default async function CodePage({ params }: { params: Promise<{ slug: string }> }) {
  const g = bySlug((await params).slug);
  if (!g) notFound();
  const i = gcodes.findIndex((x) => x.slug === g.slug);
  const prev = gcodes[i - 1], next = gcodes[i + 1];
  const mode = g.turning && !g.milling ? "lathe" : "mill";
  const art = articles[g.slug];

  const header = (
    <header className="grid gap-3">
      <Breadcrumbs items={[{ href: "/", label: "GCat" }, { href: "/kody", label: "Kody" }, { label: g.code }]} />
      <div className="flex flex-wrap gap-1.5">
        <Chip tone="accent" mono>{g.code}</Chip>
        <Chip>{g.group}</Chip>
        <Chip tone={g.level === 1 ? "success" : g.level === 2 ? "warning" : "danger"}>{levelName(g.level)}</Chip>
        <Chip>{g.modal ? "modalny" : "jednorazowy"}</Chip>
        {g.milling && <Chip tone="info">frezowanie</Chip>}
        {g.turning && <Chip tone="info">toczenie</Chip>}
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold leading-tight">{g.name}</h1>
      <p className="text-lg max-w-prose" style={{ color: "var(--ink-2)" }}>{g.short}</p>
    </header>
  );

  const syntax = (
    <div className="grid gap-3 sm:grid-cols-2">
      <div><div className="syntax-label">Fanuc</div><pre className="syntax">{g.syntax.fanuc}</pre></div>
      <div><div className="syntax-label">Sinumerik</div><pre className="syntax">{g.syntax.sinumerik}</pre></div>
    </div>
  );

  const footerNav = (
    <nav className="article-nav">
      <span>{prev && <Link href={`/kody/${prev.slug}`}>‹ {prev.code}</Link>}</span>
      <Link href="/kody">Wszystkie kody</Link>
      <span>{next && <Link href={`/kody/${next.slug}`}>{next.code} ›</Link>}</span>
    </nav>
  );

  if (art) {
    return (
      <div className="article-layout">
        <article className="grid gap-6 min-w-0">
          {header}
          {syntax}
          <div className="toc-mobile"><Toc blocks={art} /></div>
          <Article blocks={art} />
          {footerNav}
        </article>
        <aside className="toc-rail"><Toc blocks={art} sticky /></aside>
      </div>
    );
  }

  return (
    <article className="grid gap-6 max-w-4xl">
      {header}
      <p className="max-w-prose leading-relaxed" style={{ color: "var(--ink-2)" }}>{g.desc}</p>
      {diagrams[g.slug]?.()}
      {syntax}
      {g.sinumerik && <p className="text-sm max-w-prose"><strong>Różnice Sinumerik:</strong> {g.sinumerik}</p>}
      {g.params.length > 0 && (
        <table className="code-table max-w-prose"><tbody>
          {g.params.map((p) => <tr key={p.key}><td className="font-mono font-bold whitespace-nowrap">{p.key}</td><td>{p.desc}</td></tr>)}
        </tbody></table>
      )}
      <section className="grid gap-2">
        <h2 className="text-xl font-bold">Przykład — edytuj i uruchom</h2>
        <SimClient initial={g.example} mode={mode} />
      </section>
      {g.pitfalls.length > 0 && (
        <section className="grid gap-2">
          <h2 className="text-xl font-bold">Na czym ludzie się wykładają</h2>
          {g.pitfalls.map((p) => <div key={p} className="pitfall">{p}</div>)}
        </section>
      )}
      {footerNav}
    </article>
  );
}
