import Link from "next/link";
import { notFound } from "next/navigation";
import SimClient from "@/components/simulator/SimClient";
import { lessonBySlug, lessons } from "@/lib/content";

export function generateStaticParams() { return lessons.map((l) => ({ slug: l.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const l = lessonBySlug((await params).slug); return { title: l ? `${l.title} — KodG.pl` : "Lekcja" };
}
export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const l = lessonBySlug((await params).slug); if (!l) notFound();
  const i = lessons.indexOf(l); const prev = lessons[i - 1], next = lessons[i + 1];
  return (
    <article className="grid gap-6">
      <header className="grid gap-1"><div className="text-sm text-muted">Lekcja {i + 1} z {lessons.length} · {l.minutes} min</div>
        <h1 className="text-3xl font-bold">{l.title}</h1><p className="text-lg max-w-prose">{l.intro}</p></header>
      {l.sections.map((s) => <section key={s.h} className="max-w-prose"><h2 className="text-xl font-bold mb-1">{s.h}</h2><p className="leading-relaxed">{s.p}</p></section>)}
      <section className="grid gap-2"><h2 className="text-xl font-bold">Program do przerobienia</h2><SimClient initial={l.example} mode={l.mode} /></section>
      <section className="pitfall" style={{ borderLeftColor: "var(--amber)" }}><strong>Zadanie:</strong> {l.task}</section>
      <nav className="flex justify-between text-sm pt-4 border-t border-line">
        <span>{prev && <Link href={`/nauka/${prev.slug}`}>‹ {prev.title}</Link>}</span>
        <span>{next ? <Link href={`/nauka/${next.slug}`}>{next.title} ›</Link> : <Link href="/kody">Przeglądaj kody ›</Link>}</span>
      </nav>
    </article>
  );
}
