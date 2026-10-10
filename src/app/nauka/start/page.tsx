import type { Metadata } from "next";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import PageBanner from "@/components/ui/PageBanner";
import { START7 } from "@/content/nauka/start7";
import { flat, lessonHref } from "@/lib/course";
import StartPlan from "./StartPlan";

export const metadata: Metadata = { title: "7 dni do pierwszego programu — GCat", description: "Plan dzienny z lekcji frezowania: od osi maszyny do korekcji długości i pierwszych otworów cyklem G81." };

export default function StartPage() {
  const all = flat("frezowanie");
  const days = START7.map((d) => ({
    ...d,
    lessons: d.lessons.map((id) => { const l = all.find((x) => x.id === id); return { id, title: l?.title ?? id, href: l?.slug ? lessonHref("frezowanie", l.slug) : "/nauka/frezowanie", minutes: l?.doc?.minutes ?? 0 }; }),
  }));
  const total = days.reduce((a, d) => a + d.lessons.reduce((b, l) => b + l.minutes, 0), 0);
  return (
    <div className="grid gap-6 max-w-3xl">
      <Breadcrumbs items={[{ href: "/", label: "GCat" }, { href: "/nauka", label: "Nauka" }, { label: "7 dni" }]} />
      <PageBanner src="/img/banner-mill.jpg" kicker="Ścieżka startowa" title="7 dni do pierwszego programu"
        subtitle={`${days.reduce((a, d) => a + d.lessons.length, 0)} lekcji frezowania, około ${Math.round(total / 60 * 10) / 10} godz. — po pół godziny dziennie.`} size="compact" priority />
      <p className="text-muted max-w-prose">Każdy dzień to dwie–trzy lekcje z testem. Zaliczone testem oznaczamy automatycznie. Po tygodniu napiszesz pierwszy program płytki: kontur z łukami i wiercenie otworów cyklem. Planowanie, korekcję promienia, kieszenie i gwinty dokładasz potem w pełnej ścieżce frezowania.</p>
      <StartPlan days={days} />
    </div>
  );
}
