import Link from "next/link";
import { notFound } from "next/navigation";
import Runner from "./Runner";
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
      <header className="grid gap-1">
        <div className="text-sm text-muted">Zadanie {i + 1} z {exercises.length} · {LEVEL[e.level]} · {e.mode === "mill" ? "frezowanie" : "toczenie"}</div>
        <h1 className="text-3xl font-bold">{e.title}</h1>
        <p className="text-lg max-w-prose">{e.brief}</p>
      </header>
      <Runner ex={e} />
      <nav className="flex justify-between text-sm pt-4 border-t border-line">
        <Link href="/zadania">Wszystkie zadania</Link>
        {next && <Link href={`/zadania/${next.slug}`}>Następne: {next.title} ›</Link>}
      </nav>
    </article>
  );
}
