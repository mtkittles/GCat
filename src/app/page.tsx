import Link from "next/link";
import { ArrowRight } from "lucide-react";
import StatusLed from "@/components/tactile/StatusLed";
import type { ResumeLesson } from "@/components/pulpit/types";
import HeroWindow from "@/components/pulpit/HeroWindow";
import HeroCta from "@/components/pulpit/HeroCta";
import CategoryMarquee from "@/components/pulpit/CategoryMarquee";
import Reveal from "@/components/pulpit/Reveal";
import { heroDetale } from "@/components/pulpit/heroData";
import { IcoCode, IcoSim, IcoCalculator } from "@/components/obszary/icons";
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
const rpm = Math.round((1000 * 150) / (Math.PI * 10));

export default function Home() {
  return (
    <div className="pulpit pv3">
      <Reveal />
      <section className="h3" aria-labelledby="pw-title">
        <p className="h3-badge"><StatusLed state="ready" />Fanuc · Sinumerik</p>
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
            <span className="fl3-top"><span className="mq-key"><IcoCode /></span><span className="fl3-n">01</span></span>
            <h3>Ucz się składni</h3>
            <p>Lekcje frezowania i toczenia z testami oraz karty kodów G i M — każda z zapisem Fanuc i Sinumerik obok siebie.</p>
            <span className="fl3-fig fl3-diff" aria-hidden>
              <span><em>Fanuc</em><code><i className="k-arc">G03</i> X80 Y10 <i className="is-d">R10</i></code></span>
              <span><em>Sinumerik</em><code><i className="k-arc">G3</i> X80 Y10 <i className="is-d">CR=10</i></code></span>
            </span>
            <span className="fl3-go">Plan kursu <ArrowRight aria-hidden /></span>
          </Link>
          <Link href="/symulator" className="fl3-card live-card">
            <span className="fl3-top"><span className="mq-key"><IcoSim /></span><span className="fl3-n">02</span></span>
            <h3>Testuj w symulatorze</h3>
            <p>Wklej program — symulator 2D/3D pokaże tor, zebrany materiał i uwagi walidatora, zanim program trafi na maszynę.</p>
            <span className="fl3-fig fl3-checks" aria-hidden>
              <span><i className="is-ok" />Składnia i tryb posuwu</span>
              <span><i className="is-ok" />Obroty i kierunek wrzeciona</span>
              <span><i className="is-warn" />G43 po wymianie narzędzia</span>
            </span>
            <span className="fl3-go">Otwórz symulator <ArrowRight aria-hidden /></span>
          </Link>
          <Link href="/kalkulator" className="fl3-card live-card">
            <span className="fl3-top"><span className="mq-key"><IcoCalculator /></span><span className="fl3-n">03</span></span>
            <h3>Stosuj w praktyce</h3>
            <p>Gotowe programy detali z tabelą narzędzi, kalkulatory obrotów i posuwów oraz dział Technologia o narzędziach i obróbce.</p>
            <span className="fl3-fig fl3-dro" aria-hidden>
              <span><b>n</b><strong>{rpm.toLocaleString("pl-PL")}</strong><small>⌀10 · Vc 150</small></span>
              <small>n = 1000 · Vc / (π · D)</small>
            </span>
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
