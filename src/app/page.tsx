import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ResumeLesson } from "@/components/pulpit/types";
import HeroWindow from "@/components/pulpit/HeroWindow";
import HeroCta from "@/components/pulpit/HeroCta";
import CategoryMarquee from "@/components/pulpit/CategoryMarquee";
import Reveal from "@/components/pulpit/Reveal";
import { heroDetale } from "@/components/pulpit/heroData";
import { ShotCalc, ShotLesson, ShotSim } from "@/components/pulpit/Shots";
import { lessonHref, readyLessons } from "@/lib/course";
import { gcodes } from "@/lib/gcodes";
import { PROGRAMS } from "@/content/programy";
import { sources } from "@/content/nauka/sources";
import { pl, plural } from "@/lib/plural";

/*
  Strona startowa (V3.1, „w duchu Framera”, czerń): krótki nagłówek z mottem, okno programu z trzema detalami,
  pas działów, trzy filary (ucz się · testuj · stosuj), źródła i zakończenie. Panel boczny i dok bez zmian.
  Kafle obszarów i mapa nauki — na /nauka. Wszystkie liczby i treści z danych serwisu.
*/
const LESSONS: ResumeLesson[] = (["frezowanie", "toczenie"] as const).flatMap((t) =>
  readyLessons(t).map((l) => ({ track: t, id: l.id, title: l.title, href: lessonHref(t, l.slug!) })));
const DETALE = heroDetale();

/** Wydawcy dokumentów z bibliografii kursu (firmy i normy, bez autorów podręczników), od najczęściej cytowanych. */
const AUTHORS = (() => {
  const n = new Map<string, number>();
  for (const s of Object.values(sources)) {
    if (/^[A-ZŁŚŻŹ]\. /.test(s.author)) continue;
    const a = s.author.replace(/\s*\(.*\)$/, "").replace(/^Siemens$/, "Siemens Sinumerik");
    n.set(a, (n.get(a) ?? 0) + 1);
  }
  return [...n.entries()].sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0], "pl")).map(([a]) => a);
})();
const N_SOURCES = Object.keys(sources).length;

export default function Home() {
  return (
    <div className="pulpit pv3">
      <Reveal />
      <section className="h3" aria-labelledby="pw-title">
        <h1 id="pw-title" className="h3-title">Nauka, symulacja i technologia obróbki CNC.</h1>
        <p className="h3-lead">
          Praktyczne lekcje G‑kodu, podgląd toru narzędzia 2D/3D, kalkulatory skrawania oraz kompendium wiedzy o narzędziach i pomiarach.
        </p>
        <HeroCta lessons={LESSONS} />
        <p className="h3-stats">
          <Link href="/nauka"><b>{LESSONS.length}</b> {plural(LESSONS.length, "lekcja", "lekcje", "lekcji")}</Link>
          <span aria-hidden>·</span>
          <Link href="/kody"><b>{gcodes.length}</b> {plural(gcodes.length, "karta kodu", "karty kodów", "kart kodów")}</Link>
          <span aria-hidden>·</span>
          <Link href="/programy"><b>{PROGRAMS.length}</b> {plural(PROGRAMS.length, "gotowy program", "gotowe programy", "gotowych programów")}</Link>
        </p>
      </section>

      <HeroWindow detale={DETALE} />

      <CategoryMarquee />

      <section className="pz" aria-labelledby="pz-filary" data-rv>
        <header className="pz-head">
          <h2 id="pz-filary" className="pz-title">Od pierwszego bloku do gotowego detalu</h2>
          <p className="pz-lead">Trzy kroki, które powtarzasz przy każdym programie: zrozum zapis, sprawdź tor, użyj w praktyce.</p>
        </header>
        <div className="fl3">
          <Link href="/nauka" className="fl3-card live-card">
            <ShotLesson />
            <span className="fl3-txt"><h3>Ucz się składni</h3>
              <p>Lekcje frezowania i toczenia z testami po każdym temacie oraz karty kodów G i M z przykładami.</p></span>
            <span className="fl3-go">Plan kursu <ArrowRight aria-hidden /></span>
          </Link>
          <Link href="/symulator" className="fl3-card live-card">
            <ShotSim />
            <span className="fl3-txt"><h3>Testuj w symulatorze</h3>
              <p>Wklej program — symulator 2D/3D pokaże tor, zebrany materiał i uwagi walidatora, zanim program trafi na maszynę.</p></span>
            <span className="fl3-go">Otwórz symulator <ArrowRight aria-hidden /></span>
          </Link>
          <Link href="/kalkulator" className="fl3-card live-card">
            <ShotCalc />
            <span className="fl3-txt"><h3>Stosuj w praktyce</h3>
              <p>Kalkulatory obrotów i posuwów, gotowe programy detali z tabelą narzędzi i dział Technologia o narzędziach i obróbce.</p></span>
            <span className="fl3-go">Kalkulatory <ArrowRight aria-hidden /></span>
          </Link>
        </div>
      </section>

      <section className="src3" aria-labelledby="src3-t" data-rv>
        <p id="src3-t" className="src3-k">Treści oparte na dokumentacji producentów i normach — {pl(N_SOURCES, "pozycja", "pozycje", "pozycji")} w bibliografii</p>
        <ul className="src3-list">{AUTHORS.map((a) => <li key={a}>{a}</li>)}</ul>
      </section>

      <section className="end3" aria-labelledby="end3-t" data-rv>
        <h2 id="end3-t">Pierwszy program napiszesz w tydzień.</h2>
        <p>Plan na 7 dni z lekcji frezowania: 30–40 minut dziennie, z testami. Na końcu piszesz program płytki.</p>
        <div className="h3-actions">
          <Link href="/nauka/start" className="pill-btn is-primary">Plan na 7 dni</Link>
          <Link href="/nauka" className="h3-link">Wszystkie lekcje <ArrowRight aria-hidden /></Link>
        </div>
      </section>
    </div>
  );
}
