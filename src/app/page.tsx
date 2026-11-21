import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProgramPreview from "@/components/ProgramPreview";
import SpotlightCard from "@/components/tactile/SpotlightCard";
import StatusLed from "@/components/tactile/StatusLed";
import CncPanel from "@/components/pulpit/CncPanel";
import ResumePanel, { type ResumeLesson } from "@/components/pulpit/ResumePanel";
import LearnMap from "@/components/pulpit/LearnMap";
import TrackCards from "@/components/pulpit/TrackCards";
import CodeWidget, { type CodeCard } from "@/components/pulpit/CodeWidget";
import RpmWidget from "@/components/pulpit/RpmWidget";
import FlashWidget from "@/components/pulpit/FlashWidget";
import { lessonHref, readyLessons, tracks } from "@/lib/course";
import { gcodes } from "@/lib/gcodes";
import { exercises } from "@/lib/content";
import { PROGRAMS } from "@/content/programy";
import type { LibProgram } from "@/lib/programLibrary";
import { plural } from "@/lib/plural";
import ObszaryPicker from "@/components/obszary/ObszaryPicker";
import { artsOf, dzialy as techDzialy, publicArts } from "@/lib/technologia";

/*
  Pulpit operatora (strona główna): powitanie z liczbami serwisu i kartą „następny krok”, wybór obszaru nauki, mini-pulpit CNC z programem pokazowym,
  dwie ścieżki nauki i siatka narzędzi. Wszystkie liczby i treści z danych serwisu — nic na sztywno.
*/
const LESSONS: ResumeLesson[] = (["frezowanie", "toczenie"] as const).flatMap((t) =>
  readyLessons(t).map((l) => ({ track: t, id: l.id, title: l.title, href: lessonHref(t, l.slug!) })));

const card = (key: string, slug: string): CodeCard => {
  const g = gcodes.find((x) => x.slug === slug)!;
  return { key, slug, code: g.code, name: g.name, short: g.short, modal: g.modal, fanuc: g.syntax.fanuc, sinumerik: g.syntax.sinumerik };
};
const CODE_CARDS = [card("G00", "g00"), card("G41", "g40-g42"), card("G81", "g81-g83"), card("G96", "g96-g97")];
const DECK = gcodes.map((g) => ({ code: g.code, name: g.name, short: g.short, slug: g.slug }));
const DECK_START = Math.max(0, DECK.findIndex((d) => d.slug === "g40-g42"));

const TASK = exercises.find((e) => e.mode === "mill" && e.level >= 2) ?? exercises[0];
const TASK_AS_PROGRAM: LibProgram = { slug: TASK.slug, title: TASK.title, mode: TASK.mode, category: "", level: "średni", summary: "", features: [], tools: (TASK.tools ?? {}) as LibProgram["tools"], stock: TASK.stock, src: TASK.reference };
const PROGRAM = PROGRAMS.find((p) => p.slug === "plytka-gcat") ?? PROGRAMS[0];

const GK = "G‑kod";
const TECH = techDzialy.map((d) => ({ slug: d.slug, title: d.title, icon: d.icon, n: artsOf(d.slug, publicArts).length }));
const TRACK_IMG = { frezowanie: tracks.frezowanie.banner.replace("/img/banner-", "/img/clean/banner-"), toczenie: tracks.toczenie.banner.replace("/img/banner-", "/img/clean/banner-") };

export default function Home() {
  return (
    <div className="pulpit">
      {/* 1: powitanie i panel postępu */}
      <section className="pw" aria-labelledby="pw-title">
        <div className="pw-main">
          <span className="pw-badge"><StatusLed state="ready" />Ucz się · Programuj · Skrawaj</span>
          <h1 id="pw-title" className="pw-title">Naucz się czytać i pisać {GK} w&nbsp;praktyce</h1>
          <p className="pw-lead">
            Lekcje frezowania i toczenia z testami, symulator toru narzędzia 2D/3D
            i karty kodów ze składnią Fanuc i Sinumerik.
          </p>
          <div className="pw-actions">
            <Link href="/nauka" className="btn">Rozpocznij naukę</Link>
            <Link href="/symulator" className="btn ghost">Otwórz symulator</Link>
          </div>
          {/* liczniki z treści serwisu — jedna cicha linia zamiast trzech kafli (V3) */}
          <p className="pw-stats">
            <Link href="/nauka"><b>{LESSONS.length}</b> {plural(LESSONS.length, "lekcja", "lekcje", "lekcji")}</Link>
            <span aria-hidden>·</span>
            <Link href="/kody"><b>{gcodes.length}</b> {plural(gcodes.length, "karta kodu", "karty kodów", "kart kodów")}</Link>
            <span aria-hidden>·</span>
            <Link href="/programy"><b>{PROGRAMS.length}</b> {plural(PROGRAMS.length, "gotowy program", "gotowe programy", "gotowych programów")}</Link>
          </p>
        </div>
        <ResumePanel lessons={LESSONS} img={{ frezowanie: TRACK_IMG.frezowanie, toczenie: TRACK_IMG.toczenie }} />
      </section>

      {/* 2: obszary nauki (V3.0b) — wybór przełącza drzewo w panelu bocznym */}
      <section className="pz" aria-labelledby="pz-obszary">
        <header className="pz-head">
          <h2 id="pz-obszary" className="pz-title">Czego się uczysz?</h2>
        </header>
        <ObszaryPicker lessons={LESSONS} codes={gcodes.length} tech={TECH} />
      </section>

      {/* 3: mini-pulpit CNC */}
      <CncPanel />

      {/* 4: ścieżki nauki */}
      <section className="pz" aria-labelledby="pz-tracks">
        <header className="pz-head">
          <h2 id="pz-tracks" className="pz-title">Ścieżki nauki</h2>
          <Link href="/nauka" className="bw-link">Plan kursu <ArrowRight aria-hidden /></Link>
        </header>
        <TrackCards lessons={LESSONS} tracks={(["frezowanie", "toczenie"] as const).map((k) => ({
          key: k, title: tracks[k].title, blurb: tracks[k].blurb, img: TRACK_IMG[k],
        }))} />
      </section>

      {/* 5: mapa nauki — dni z nauką z zapisu postępu w przeglądarce */}
      <section className="pz" aria-labelledby="pz-map">
        <header className="pz-head">
          <h2 id="pz-map" className="pz-title">Mapa nauki</h2>
          <Link href="/nauka" className="bw-link">Plan kursu <ArrowRight aria-hidden /></Link>
        </header>
        <LearnMap lessons={LESSONS.map(({ track, id, title }) => ({ track, id, title }))} first={LESSONS[0]?.href ?? "/nauka"} />
      </section>

      {/* 6: warsztat i baza */}
      <section className="pz" aria-labelledby="pz-tools">
        <header className="pz-head">
          <h2 id="pz-tools" className="pz-title">Warsztat i baza wiedzy</h2>
        </header>
        <div className="bento">
          <CodeWidget cards={CODE_CARDS} total={gcodes.length} />
          <RpmWidget />
          <FlashWidget deck={DECK} start={DECK_START} />
          <SpotlightCard href="/zadania" className="bw bw-tile" aria-label={`Zadania praktyczne: ${exercises.length}`}>
            <header className="bw-head">
              <h3 className="bw-title">Zadania praktyczne</h3>
              <span className="bw-count">{exercises.length}</span>
            </header>
            <span className="bw-fig bg-cnc-grid"><ProgramPreview p={TASK_AS_PROGRAM} id="pz-task" /></span>
            <span className="bw-cap">Napisz program — symulator porówna tor z rozwiązaniem. Na rysunku: <b>{TASK.title}</b>.</span>
          </SpotlightCard>
          <SpotlightCard href="/programy" className="bw bw-tile" aria-label={`Gotowe programy: ${PROGRAMS.length}`}>
            <header className="bw-head">
              <h3 className="bw-title">Gotowe programy</h3>
              <span className="bw-count">{PROGRAMS.length}</span>
            </header>
            <span className="bw-fig bg-cnc-grid"><ProgramPreview p={PROGRAM} id="pz-prog" /></span>
            <span className="bw-cap">Kompletne detale z tabelą narzędzi. Na rysunku: <b>{PROGRAM.title}</b>.</span>
          </SpotlightCard>
        </div>
      </section>
    </div>
  );
}
