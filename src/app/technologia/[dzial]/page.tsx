import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DzialIcon } from "@/components/technologia/icons";
import TechDzialList from "@/components/technologia/TechDzialList";
import TechThumb from "@/components/technologia/TechThumb";
import { artsOf, artykulow, dzialBySlug, dzialy } from "@/lib/technologia";
import PageHead from "@/components/ui/PageHead";

export function generateStaticParams() { return dzialy.map((d) => ({ dzial: d.slug })); }
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ dzial: string }> }): Promise<Metadata> {
  const d = dzialBySlug((await params).dzial);
  return d ? { title: `${d.title} — Technologia — GCat`, description: d.short } : { title: "Technologia — GCat" };
}

/* /technologia/<dział> — lista artykułów z miniaturą rysunku i filtrami (obróbka, poziom). */
export default async function DzialPage({ params }: { params: Promise<{ dzial: string }> }) {
  const d = dzialBySlug((await params).dzial);
  if (!d) notFound();
  const arts = artsOf(d.slug);
  const pub = arts.filter((a) => a.plan === "free");
  const thumbs = Object.fromEntries(arts.map((a) => [a.key, <TechThumb key={a.key} a={a} icon={d.icon} />]));
  return (
    <div className="grid gap-5 tech">
      <PageHead crumbs={[{ href: "/", label: "GCat" }, { href: "/technologia", label: "Technologia" }, { label: d.title }]}
        icon={<DzialIcon icon={d.icon} />} title={d.title} count={pub.length ? artykulow(pub.length) : "w przygotowaniu"} lead={d.short} />
      {pub.length === 0 && (
        <section className="tech-empty">
          <p className="tech-k">Zakres działu</p>
          <p>{d.zakres}</p>
          <p className="text-muted">Pierwsze artykuły są w przygotowaniu.</p>
        </section>
      )}
      <TechDzialList arts={arts} thumbs={thumbs} />
      <nav className="tech-other" aria-label="Inne działy Technologii">
        {dzialy.filter((x) => x.slug !== d.slug).map((x) => <Link key={x.slug} href={`/technologia/${x.slug}`} className="pill-f"><DzialIcon icon={x.icon} width={15} height={15} />{x.title}</Link>)}
      </nav>
    </div>
  );
}
