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
      <PageBanner src="/img/banner-tasks.jpg" title={`Zadanie ${i + 1}`} subtitle={e.title} size="compact" priority />
      <header className="grid gap-2">
        <Breadcrumbs items={[{ href: "/", label: "GCat" }, { href: "/zadania", label: "Zadania" }, { label: e.title }]} />
        <div className="flex flex-wrap gap-1.5">
          <Chip tone="accent">Zadanie {i + 1} z {exercises.length}</Chip>
          <Chip tone={e.level === 1 ? "success" : e.level === 2 ? "warning" : "danger"}>{LEVEL[e.level]}</Chip>
          <Chip tone="info">{e.mode === "mill" ? "frezowanie" : "toczenie"}</Chip>
        </div>
        <h1 className="text-3xl font-bold">{e.title}</h1>
        <p className="text-lg max-w-prose" style={{ color: "var(--ink-2)" }}>{e.brief}</p>
      </header>
      <Runner ex={e} />
      <nav className="flex justify-between text-sm pt-4 border-t border-line">
        <Link href="/zadania">Wszystkie zadania</Link>
        {next && <Link href={`/zadania/${next.slug}`}>Następne: {next.title} ›</Link>}
      </nav>
    </article>
  );
}
