import type { Metadata } from "next";
import Link from "next/link";
import TechSearch from "@/components/technologia/TechSearch";
import TechThumb from "@/components/technologia/TechThumb";
import TechCards from "@/components/technologia/TechCards";
import { levelName } from "@/lib/gcodes";
import { artHref, artsOf, artykulow, dzialy, publicArts, recent, TYP_LABEL } from "@/lib/technologia";
import PageHead from "@/components/ui/PageHead";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Technologia obróbki skrawaniem — GCat",
  description: "Narzędzia, płytki ISO, obliczenia parametrów skrawania, proces, mocowanie, materiały i strategie obróbki — po polsku, ze źródłami.",
};

/* /technologia — szukajka, „żywe karty” działów (V3.0b, TechCards), ostatnio dodane. Dział darmowy (decyzja 2026-11-21). */
export default function TechnologiaPage() {
  const cards = dzialy.map((d) => ({ slug: d.slug, title: d.title, short: d.short, icon: d.icon, big: d.big, arts: artsOf(d.slug, publicArts).map((a) => a.title) }));
  const latest = recent(publicArts, 4);
  return (
    <div className="grid gap-6 tech">
      <PageHead title="Technologia" count={artykulow(publicArts.length)}
        lead="Obróbka skrawaniem w całości: budowa i dobór narzędzi, płytki, wzory, proces, mocowanie, materiały i strategie. Wartości liczbowe zawsze ze wskazanym źródłem." />
      <TechSearch arts={publicArts} dzialy={dzialy} />
      <section aria-labelledby="tech-dzialy" className="grid gap-3">
        <h2 id="tech-dzialy" className="sr-only">Działy</h2>
        <TechCards dzialy={cards} />
      </section>
      {latest.length > 0 && (
        <section aria-labelledby="tech-nowe" className="grid gap-3">
          <h2 id="tech-nowe" className="sec-h">Ostatnio dodane</h2>
          <ul className="tech-list">
            {latest.map((a) => {
              const d = dzialy.find((x) => x.slug === a.dzial)!;
              return (
                <li key={a.key}>
                  <Link href={artHref(a)} className="tech-row">
                    <TechThumb a={a} icon={d.icon} />
                    <span className="tech-row-txt">
                      <span className="tech-k">{d.title} · {TYP_LABEL[a.typ]}</span>
                      <b>{a.title}</b>
                      <span className="tech-row-short">{a.short}</span>
                      <span className="tech-row-meta">{levelName(a.poziom)} · {a.obrobka.join(", ")} · {a.minutes} min{a.stan === "szkic" ? " · szkic" : ""}</span>
                      <span className="tech-row-go">Czytaj<ArrowRight aria-hidden /></span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
