import Link from "next/link";
import { notFound } from "next/navigation";
import Runner from "./Runner";
import PageBanner from "@/components/ui/PageBanner";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Chip from "@/components/ui/Chip";
import { exerciseBySlug, exercises } from "@/lib/content";

export function generateStaticParams() { return exercises.map((e) => ({ slug: e.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const e = exerciseBySlug((await params).slug); return { title: e ? `${e.title} — zadanie — GCat` : "Zadanie" };
}

const LEVEL = { 1: "podstawy", 2: "średni", 3: "zaawansowany" } as const;

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const e = exerciseBySlug((await params).slug); if (!e) notFound();
  const i = exercises.indexOf(e); const next = exercises[i + 1];
  return (
    <article className="grid gap-5">
      <Breadcrumbs items={[{ href: "/", label: "GCat" }, { href: "/zadania", label: "Zadania" }, { label: `Zadanie ${i + 1}` }]} />
      <PageBanner src="/img/banner-tasks.jpg" kicker={`Zadanie ${i + 1} z ${exercises.length}`} title={e.title} size="compact" priority
        meta={<>
          <Chip tone={e.level === 1 ? "success" : e.level === 2 ? "warning" : "danger"}>{LEVEL[e.level]}</Chip>
          <Chip tone="info">{e.mode === "mill" ? "frezowanie" : "toczenie"}</Chip>
        </>} />
      <p className="lead max-w-prose">{e.brief}</p>
      <Runner ex={e} />
      <nav className="flex justify-between text-sm pt-4 border-t border-line">
        <Link href="/zadania">Wszystkie zadania</Link>
        {next && <Link href={`/zadania/${next.slug}`}>Następne: {next.title} ›</Link>}
      </nav>
    </article>
  );
}
