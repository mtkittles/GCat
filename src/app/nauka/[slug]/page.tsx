import { notFound } from "next/navigation";
import SimClient from "@/components/simulator/SimClient";
import PageBanner from "@/components/ui/PageBanner";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Chip from "@/components/ui/Chip";
import TocDrawer from "@/components/TocDrawer";
import LessonPager from "@/components/LessonPager";
import { slugify } from "@/components/Article";
import { lessonBySlug, lessons } from "@/lib/content";

export function generateStaticParams() { return lessons.map((l) => ({ slug: l.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const l = lessonBySlug((await params).slug); return { title: l ? `${l.title} — GCat` : "Lekcja" };
}
export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const l = lessonBySlug((await params).slug); if (!l) notFound();
  const i = lessons.indexOf(l); const prev = lessons[i - 1], next = lessons[i + 1];
  const toc = [
    ...l.sections.map((s) => ({ id: slugify(s.h), label: s.h })),
    { id: "program", label: "Program do przerobienia" },
    { id: "zadanie", label: "Zadanie" },
  ];
  return (
    <article className="grid gap-6 lesson">
      <Breadcrumbs items={[{ href: "/", label: "GCat" }, { href: "/nauka", label: "Nauka" }, { label: `Lekcja ${i + 1}` }]} />
      <PageBanner src={l.mode === "lathe" ? "/img/banner-turn.jpg" : "/img/banner-mill.jpg"}
        kicker={`Lekcja ${i + 1} z ${lessons.length}`} title={l.title}
        meta={<><Chip>{l.minutes} min</Chip><Chip tone="info">{l.mode === "lathe" ? "toczenie" : "frezowanie"}</Chip></>}
        size="compact" priority />
      <p className="lead max-w-prose">{l.intro}</p>
      {l.sections.map((s) => (
        <section key={s.h} className="max-w-prose">
          <h2 id={slugify(s.h)} className="text-xl font-bold mb-1">{s.h}</h2>
          <p className="leading-relaxed">{s.p}</p>
        </section>
      ))}
      <section className="grid gap-2"><h2 id="program" className="text-xl font-bold">Program do przerobienia</h2><SimClient initial={l.example} mode={l.mode} /></section>
      <section id="zadanie" className="pitfall" style={{ borderLeftColor: "var(--amber)" }}><strong>Zadanie:</strong> {l.task}</section>
      <LessonPager
        pos={i + 1} total={lessons.length}
        prev={prev ? { href: `/nauka/${prev.slug}`, label: prev.title } : undefined}
        next={next ? { href: `/nauka/${next.slug}`, label: next.title } : { href: "/kody", label: "Przeglądaj kody" }}
      />
      <TocDrawer items={toc} title={`Lekcja ${i + 1}`} />
    </article>
  );
}
