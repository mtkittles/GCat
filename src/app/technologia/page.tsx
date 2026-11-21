import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { DzialIcon } from "@/components/technologia/icons";
import TechSearch from "@/components/technologia/TechSearch";
import TechThumb from "@/components/technologia/TechThumb";
import { levelName } from "@/lib/gcodes";
import { artHref, artsOf, artykulow, dzialy, publicArts, recent, TYP_LABEL } from "@/lib/technologia";

export const metadata: Metadata = {
  title: "Technologia obróbki skrawaniem — GCat",
  description: "Narzędzia, płytki ISO, obliczenia parametrów skrawania, proces, mocowanie, materiały i strategie obróbki — po polsku, ze źródłami.",
};

/* /technologia — szukajka, kafle działów (Narzędzia i Płytki szersze), ostatnio dodane. Dział darmowy (decyzja 2026-11-21). */
export default function TechnologiaPage() {
  const normal = dzialy.filter((d) => !d.big);
  const rest = normal.length % 3; // ostatni rząd zwykłych kafli wypełnia szerokość
  const wide = (slug: string) => { const i = normal.findIndex((d) => d.slug === slug); return i >= normal.length - rest ? (rest === 1 ? " is-full" : " is-half") : ""; };
  const latest = recent(publicArts, 4);
  return (
    <div className="grid gap-6 tech">
      <header className="ph">
        <h1 className="ph-title">Technologia <span className="ph-n">{artykulow(publicArts.length)}</span></h1>
        <p className="ph-lead">Obróbka skrawaniem w całości: budowa i dobór narzędzi, płytki, wzory, proces, mocowanie, materiały i strategie. Wartości liczbowe zawsze ze wskazanym źródłem.</p>
      </header>
      <TechSearch arts={publicArts} dzialy={dzialy} />
      <section aria-labelledby="tech-dzialy" className="grid gap-3">
        <h2 id="tech-dzialy" className="sr-only">Działy</h2>
        <div className="tech-bento">
          {dzialy.map((d) => {
            const n = artsOf(d.slug, publicArts).length;
            return (
              <Link key={d.slug} href={`/technologia/${d.slug}`} className={`tech-tile${d.big ? " is-big" : wide(d.slug)}`}>
                <span className="tech-tile-ico"><DzialIcon icon={d.icon} /></span>
                <span className="tech-tile-top"><b>{d.title}</b><span className="tech-k">{n ? artykulow(n) : "w przygotowaniu"}</span></span>
                <span className="tech-tile-short">{d.short}</span>
                {d.big && <span className="tech-tile-zakres">{d.zakres}</span>}
                <span className="tech-tile-go" aria-hidden><ChevronRight /></span>
              </Link>
            );
          })}
        </div>
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
