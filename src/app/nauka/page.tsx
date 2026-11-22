import Link from "next/link";
import TrackLessons from "@/components/lesson/TrackLessons";
import { trackPlan } from "@/components/lesson/trackPlan";
import { lessonHref, readyLessons } from "@/lib/course";
import ObszaryPicker from "@/components/obszary/ObszaryPicker";
import LearnMap from "@/components/pulpit/LearnMap";
import type { ResumeLesson } from "@/components/pulpit/types";
import { gcodes } from "@/lib/gcodes";
import { artsOf, dzialy as techDzialy, publicArts } from "@/lib/technologia";
import { pl } from "@/lib/plural";
import PageHead from "@/components/ui/PageHead";

export const metadata = { title: "Nauka G-kodu krok po kroku — GCat" };

const N = readyLessons("frezowanie").length + readyLessons("toczenie").length;
/* Centrum nauki (V3.1): obszary nauki i mapa nauki przeniesione ze strony startowej. */
const LESSONS: ResumeLesson[] = (["frezowanie", "toczenie"] as const).flatMap((t) =>
  readyLessons(t).map((l) => ({ track: t, id: l.id, title: l.title, href: lessonHref(t, l.slug!) })));
const TECH = techDzialy.map((d) => ({ slug: d.slug, title: d.title, icon: d.icon, n: artsOf(d.slug, publicArts).length }));

export default function Nauka() {
  return (
    <div className="grid gap-6">
      <PageHead title="Nauka" count={pl(N, "lekcja", "lekcje", "lekcji")}
        lead={<>Wybierz obróbkę. Każda lekcja ma ten sam układ: teoria z rysunkami, przykład, ćwiczenia, typowe błędy, test i program detalu, który rośnie z lekcji na lekcję. Nie musisz znać <span className="whitespace-nowrap">G-kodu</span>.</>} />
      <section className="pz" aria-labelledby="nk-obszary">
        <header className="pz-head"><h2 id="nk-obszary" className="pz-title">Czego się uczysz?</h2></header>
        <ObszaryPicker lessons={LESSONS} codes={gcodes.length} tech={TECH} />
      </section>
      <section className="pz" aria-labelledby="nk-mapa">
        <header className="pz-head"><h2 id="nk-mapa" className="pz-title">Mapa nauki</h2></header>
        <LearnMap lessons={LESSONS.map(({ track, id, title }) => ({ track, id, title }))} first={LESSONS[0]?.href ?? "/nauka"} />
      </section>
      <TrackLessons tracks={trackPlan()} initial="frezowanie" aside={
        <Link href="/nauka/start" className="s7-cta">
          <span className="s7-cta-k">Zaczynam od podstaw</span>
          <b>7 dni do pierwszego programu</b>
          <span>Plan na 7 dni z lekcji frezowania: 30–40 minut dziennie, z testami. Na końcu piszesz program płytki.</span>
        </Link>
      } />
    </div>
  );
}
