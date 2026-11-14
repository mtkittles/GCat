import Link from "next/link";
import MobileHome from "@/components/MobileHome";
import BrandLogo from "@/components/BrandLogo";
import HomeResume from "@/components/HomeResume";
import TrackPicker from "@/components/lesson/TrackPicker";
import { pl } from "@/lib/plural";
import SimClient from "@/components/simulator/SimClient";
import HomeStory from "@/components/home/HomeStory";
import NarrowOnly from "@/components/home/NarrowOnly";
import HomeFx from "@/components/home/HomeFx";
import { HOME_DEMO } from "@/content/homeDemo";
import HubTiles from "@/components/HubTiles";
import SectionHeader from "@/components/ui/SectionHeader";
import { flat, lessonHref, readyLessons } from "@/lib/course";


const NAUKA_TOTAL = flat("frezowanie").length + flat("toczenie").length;
const QUICK_LESSONS = (["frezowanie", "toczenie"] as const).flatMap((t) => readyLessons(t).map((l) => ({ track: t, id: l.id, title: l.title, href: lessonHref(t, l.slug!) })));

// „G‑kod” z twardym łącznikiem — nie rozdziela się między wierszami
const GK = "G\u2011kod";


export default function Home() {
  return (
    <div className="home">
      <HomeFx />
      <MobileHome lessons={QUICK_LESSONS} />

      {/* 1: czym jest GCat i dwie główne akcje — pierwszy ekran w wysokości okna */}
      <section className="home-intro" aria-labelledby="hi-title">
        <div className="hi-brand"><BrandLogo height={96} variant="lockup" forceDark /></div>
        <h1 id="hi-title" className="hi-title">Naucz się czytać i pisać {GK}.</h1>
        <p className="hi-lead">GCat to nauka programowania CNC po polsku: {pl(NAUKA_TOTAL, "lekcja", "lekcje", "lekcji")} frezowania i toczenia z testami, symulator toru narzędzia w 2D i 3D oraz karty kodów ze składnią Fanuc i Sinumerik.</p>
        <div className="hi-actions">
          <Link href="/nauka" className="btn">Rozpocznij naukę</Link>
          <Link href="/symulator" className="btn ghost">Otwórz symulator</Link>
        </div>
        <HomeResume lessons={QUICK_LESSONS} />
        <a href="#program" className="hi-cue">Niżej: jeden program blok po bloku<span aria-hidden /></a>
      </section>

      {/* 2: program pokazowy. Komputer — sekcja przypięta, przewijanie prowadzi narzędzie; telefon — pokaz z odtwarzaniem. */}
      <HomeStory />
      <NarrowOnly>
        <section className="grid gap-4">
          <SectionHeader eyebrow="Symulator" title="Zobacz, co robi Twój program"
            lead="Kontur, kieszeń, rowki i cztery otwory cyklem G81. Dwa narzędzia, jeden program."
            action={<Link className="btn ghost" href="/symulator">Otwórz pełny symulator</Link>} />
          <SimClient initial={HOME_DEMO} mode="mill" showcase autoplay editable={false} />
        </section>
      </NarrowOnly>

      {/* 3: wybór ścieżki */}
      <section className="grid gap-4" data-fx="group">
        <SectionHeader eyebrow="Nauka" title="Wybierz ścieżkę nauki"
          lead="Każda ścieżka prowadzi od osi maszyny do kompletnego programu detalu." />
        <TrackPicker />
      </section>

      {/* 4: baza wiedzy i narzędzia — kafelki ze zdjęciem; na telefonie ta sama siatka jest w MobileHome */}
      <section className="grid gap-4 home-access" data-fx="group">
        <SectionHeader eyebrow="Baza wiedzy i narzędzia" title="Kody, programy, kalkulatory, zadania"
          lead="Pełna lista funkcji G i M z filtrami jest w katalogu kodów." action={<Link className="btn ghost" href="/kody">Katalog kodów</Link>} />
        <HubTiles />
      </section>
    </div>
  );
}
