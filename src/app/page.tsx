import Link from "next/link";
import MobileHome from "@/components/MobileHome";
import HomeHero, { type HeroSlide } from "@/components/HomeHero";
import HomeQuick from "@/components/HomeQuick";
import { PROGRAMS } from "@/content/programy";
import SimClient from "@/components/simulator/SimClient";
import RefTables from "@/components/RefTables";
import SectionHeader from "@/components/ui/SectionHeader";
import Chip from "@/components/ui/Chip";
import { exercises } from "@/lib/content";
import { flat, lessonHref, readyLessons } from "@/lib/course";
import { gcodes } from "@/lib/gcodes";

const DEMO = `(PLYTKA MOCUJACA 80 x 50)
G21 G90 G17 G54 G40 G80
T01 M06
S2400 M03
(KONTUR ZEWNETRZNY Z ZAOKRAGLENIAMI R10)
G00 X10 Y0 Z5
G01 Z-3 F120
G01 X70 F400
G03 X80 Y10 R10
G01 Y40
G03 X70 Y50 R10
G01 X10
G03 X0 Y40 R10
G01 Y10
G03 X10 Y0 R10
G00 Z5
(KIESZEN OKRAGLA W SRODKU)
G00 X40 Y25
G01 Z-2 F120
G02 I10 J0 F300
G02 I14 J0
G00 Z5
(ROWEK POPRZECZNY)
G00 X18 Y25
G01 Z-2 F120
G01 X30 F350
G00 Z5
G00 X50 Y25
G01 Z-2 F120
G01 X62 F350
G00 Z5
(CZTERY OTWORY MOCUJACE)
T02 M06
S1400 M03
G99 G81 X12 Y10 Z-14 R2 F130
X68
Y40
X12
G80
G00 Z20
M30`;

const I = {
  book: "M4 5.5A1.5 1.5 0 0 1 5.5 4H19v16H5.5A1.5 1.5 0 0 1 4 18.5zM9 4v16",
  play: "M8 5l11 7-11 7z",
  code: "M9 8l-5 4 5 4M15 8l5 4-5 4",
  calc: "M6 3h12v18H6zM9 7h6M8 11h1M12 11h1M16 11h1M8 15h1M12 15h1M16 15h5",
  check: "M4 12l5 5L20 6",
};


const NAUKA_TOTAL = flat("frezowanie").length + flat("toczenie").length;
const HOME_LESSONS = (["frezowanie", "toczenie"] as const).flatMap((t) => readyLessons(t).slice(0, 3).map((l) => ({
  href: lessonHref(t, l.slug!), id: l.id, title: l.title, minutes: l.doc!.minutes, track: t === "frezowanie" ? "FREZOWANIE" : "TOCZENIE",
})));

const QUICK_LESSONS = (["frezowanie", "toczenie"] as const).flatMap((t) => readyLessons(t).map((l) => ({ track: t, id: l.id, title: l.title, href: lessonHref(t, l.slug!) })));

const HERO_SLIDES: HeroSlide[] = [
  { src: "/img/hero-cnc.jpg", kicker: "Nauka", stat: `${NAUKA_TOTAL} lekcji`, title: "Naucz się czytać i pisać G-kod.",
    text: "Dwie ścieżki — frezowanie i toczenie. Każda lekcja ma teorię z rysunkami, zadanie w symulatorze, test i program detalu budowany krok po kroku.",
    cta: { href: "/nauka", label: "Rozpocznij naukę" }, alt: { href: "/nauka/toczenie", label: "Ścieżka toczenia" } },
  { src: "/img/banner-simulator.jpg", kicker: "Symulator", stat: "2D + 3D", title: "Zobacz, co robi Twój program.",
    text: "Tor narzędzia, ubytek materiału, korekcja promienia, cykle wiercenia i toczenia, gwinty. Frezarka i tokarka, składnia Fanuc.",
    cta: { href: "/symulator", label: "Otwórz symulator" } },
  { src: "/img/banner-mill.jpg", kicker: "Gotowe programy", stat: `${PROGRAMS.length} detali`, title: "Kompletne programy z narzędziami.",
    text: "Tuleje, sworznie, kołnierze, gwinty frezowane i toczone. Podgląd detalu i otwarcie w symulatorze jednym kliknięciem.",
    cta: { href: "/programy", label: "Przeglądaj programy" } },
  { src: "/img/banner-thread.jpg", kicker: "Kody G i M", stat: `${gcodes.length} kart`, title: "Każdy kod wyjaśniony po polsku.",
    text: "Składnia Fanuc i Sinumerik, schemat, symulacja przykładu, typowe błędy i lekcje, w których kod pracuje.",
    cta: { href: "/kody", label: "Przeglądaj kody" }, alt: { href: "/kalkulator", label: "Kalkulatory" } },
];

const PILLARS = [
  { href: "/nauka", ico: I.book, t: "Nauka", d: "Dwie ścieżki — frezowanie i toczenie — od osi maszyny do gotowego programu.", m: `${NAUKA_TOTAL} lekcji` },
  { href: "/symulator", ico: I.play, t: "Symulator", d: "Tor 2D i 3D, cykle stałe, kompensacja, kontrola kolizji.", m: "2D · 3D" },
  { href: "/kody", ico: I.code, t: "Kody G i M", d: "Karty funkcji ze składnią Fanuc i Sinumerik oraz przykładami.", m: `${gcodes.length} kart` },
  { href: "/kalkulator", ico: I.calc, t: "Kalkulatory", d: "Obroty, posuwy, moc skrawania, gwinty, presety materiałów.", m: "4 moduły" },
  { href: "/zadania", ico: I.check, t: "Zadania", d: "Napisz program, a symulator sprawdzi tor narzędzia.", m: "16 zadań" },
];

export default function Home() {
  const starter = gcodes.filter((g) => g.level === 1).slice(0, 6);
  return (
    <div className="grid gap-14">
      <MobileHome />

      <div className="home-top">
        <HomeHero slides={HERO_SLIDES} />
        <HomeQuick lessons={QUICK_LESSONS} counts={{ programs: PROGRAMS.length, codes: gcodes.length, lessons: NAUKA_TOTAL }} />
      </div>

      <section className="grid gap-4">
        <SectionHeader eyebrow="Symulator" title="Zobacz, co robi Twój program"
          lead="Kontur, kieszeń, rowki i cztery otwory cyklem G81. Dwa narzędzia, jeden program."
          action={<Link className="btn ghost" href="/symulator">Otwórz pełny symulator</Link>} />
        <div className="reveal reveal-1"><SimClient initial={DEMO} mode="mill" showcase autoplay editable={false} /></div>
      </section>

      <section className="grid gap-4">
        <SectionHeader eyebrow="Zawartość" title="Co znajdziesz w GCat" />
        <div className="pillars reveal reveal-1">
          {PILLARS.map((p) => (
            <Link key={p.href} href={p.href} className="pillar">
              <span className="pillar-ico">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={p.ico} /></svg>
              </span>
              <b>{p.t}</b>
              <span>{p.d}</span>
              <span className="pillar-meta">{p.m}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4">
        <SectionHeader eyebrow="Ścieżka nauki" title="Od bloku do gotowego programu"
          action={<Link className="btn ghost" href="/nauka">Wszystkie lekcje</Link>} />
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 reveal reveal-2">
          {HOME_LESSONS.map((l) => (
            <li key={l.href}><Link href={l.href} className="tile h-full">
              <span className="tile-num">{l.id} · {l.track} · {l.minutes} MIN</span>
              <div className="font-semibold mt-1">{l.title}</div>
            </Link></li>
          ))}
        </ol>
      </section>

      <section className="grid gap-4">
        <SectionHeader eyebrow="Referencja" title="Zacznij od podstaw"
          action={<Link className="btn ghost" href="/kody">Wszystkie kody</Link>} />
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 reveal reveal-2">
          {starter.map((g) => (
            <Link key={g.slug} href={`/kody/${g.slug}`} className="tile">
              <div className="flex items-center gap-2">
                <span className="tile-code">{g.code}</span>
                <Chip tone="neutral">{g.group}</Chip>
              </div>
              <div className="font-semibold mt-1">{g.name}</div>
              <p className="text-sm mt-1" style={{ color: "var(--ink-2)" }}>{g.short}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4">
        <SectionHeader eyebrow="Praktyka" title="Sprawdź się"
          lead="Symulator porówna Twój tor narzędzia z rozwiązaniem i pokaże różnice."
          action={<Link className="btn ghost" href="/zadania">Wszystkie zadania</Link>} />
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 reveal reveal-3">
          {exercises.slice(0, 4).map((e) => (
            <Link key={e.slug} href={`/zadania/${e.slug}`} className="tile">
              <div className="font-semibold">{e.title}</div>
              <div className="mt-2"><Chip tone={e.mode === "mill" ? "accent" : "info"}>{e.mode === "mill" ? "frezowanie" : "toczenie"}</Chip></div>
            </Link>
          ))}
        </div>
      </section>

      <RefTables />
    </div>
  );
}
