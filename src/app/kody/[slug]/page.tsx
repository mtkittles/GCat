import Link from "next/link";
import { notFound } from "next/navigation";
import SimClient from "@/components/simulator/SimClient";
import { bySlug, gcodes, levelName } from "@/lib/gcodes";
import { diagrams } from "@/components/diagrams";

export function generateStaticParams() { return gcodes.map((g) => ({ slug: g.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const g = bySlug((await params).slug);
  return { title: g ? `${g.code} — ${g.name} — GCat` : "Kod" };
}

export default async function CodePage({ params }: { params: Promise<{ slug: string }> }) {
  const g = bySlug((await params).slug);
  if (!g) notFound();
  const i = gcodes.findIndex((x) => x.slug === g.slug);
  const prev = gcodes[i - 1], next = gcodes[i + 1];
  const mode = g.turning && !g.milling ? "lathe" : "mill";
  return (
    <article className="grid gap-6">
      <header className="grid gap-1">
        <div className="text-sm text-muted">{g.group} · {levelName(g.level)} · {g.modal ? "modalny" : "jednorazowy"} · {g.milling && "frezowanie"} {g.milling && g.turning && "/"} {g.turning && "toczenie"}</div>
        <h1 className="text-3xl font-bold"><span className="font-mono">{g.code}</span> — {g.name}</h1>
        <p className="text-lg">{g.short}</p>
      </header>

      <p className="max-w-prose leading-relaxed">{g.desc}</p>
      {diagrams[g.slug]?.()}

      <div className="grid gap-3 sm:grid-cols-2">
        <div><div className="syntax-label">Fanuc</div><pre className="syntax">{g.syntax.fanuc}</pre></div>
        <div><div className="syntax-label">Sinumerik</div><pre className="syntax">{g.syntax.sinumerik}</pre></div>
      </div>
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

      <nav className="flex justify-between text-sm pt-4 border-t border-line">
        <span>{prev && <Link href={`/kody/${prev.slug}`}>‹ {prev.code}</Link>}</span>
        <Link href="/kody">Wszystkie kody</Link>
        <span>{next && <Link href={`/kody/${next.slug}`}>{next.code} ›</Link>}</span>
      </nav>
    </article>
  );
}
