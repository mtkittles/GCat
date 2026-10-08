import Link from "next/link";
import MobileHome from "@/components/MobileHome";
import BrandLogo from "@/components/BrandLogo";
import HomeResume from "@/components/HomeResume";
import TrackPicker from "@/components/lesson/TrackPicker";
import { pl } from "@/lib/plural";
import { PROGRAMS } from "@/content/programy";
import SimClient from "@/components/simulator/SimClient";
import RefTables from "@/components/RefTables";
import SectionHeader from "@/components/ui/SectionHeader";
import { exercises } from "@/lib/content";
import { flat, lessonHref, readyLessons } from "@/lib/course";
import { gcodes } from "@/lib/gcodes";

const DEMO = `(PLYTKA MOCUJACA 80 x 50)
G21 G90 G17 G54 G40 G80
T01 M06 (FREZ FI10)
G43 H01 Z50.
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
(KIESZEN OKRAGLA FI30 W SRODKU - DWA PRZEJSCIA WOKOL X40 Y25)
G00 X40 Y25
G01 Z-2 F120
G01 X34 F300
G02 I6 J0
G01 X30
G02 I10 J0
G01 X40
G00 Z5
(DWA ROWKI POPRZECZNE)
G00 X8 Y25
G01 Z-2 F120
G01 X18 F350
G00 Z5
G00 X62 Y25
G01 Z-2 F120
G01 X72 F350
G00 Z5
(CZTERY OTWORY MOCUJACE)
G00 Z50
T02 M06 (WIERTLO FI6)
G43 H02 Z50.
S1400 M03
G99 G81 X12 Y10 Z-14 R2 F130
X68
Y40
X12
G80
G00 Z50
M30`;

const I = {
  book: "M4 5.5A1.5 1.5 0 0 1 5.5 4H19v16H5.5A1.5 1.5 0 0 1 4 18.5zM9 4v16",
  play: "M8 5l11 7-11 7z",
  code: "M9 8l-5 4 5 4M15 8l5 4-5 4",
  calc: "M6 3h12v18H6zM9 7h6M8 11h1M12 11h1M16 11h1M8 15h1M12 15h1M16 15h5",
  check: "M4 12l5 5L20 6",
};


const NAUKA_TOTAL = flat("frezowanie").length + flat("toczenie").length;
const QUICK_LESSONS = (["frezowanie", "toczenie"] as const).flatMap((t) => readyLessons(t).map((l) => ({ track: t, id: l.id, title: l.title, href: lessonHref(t, l.slug!) })));

// „G‑kod” z twardym łącznikiem — nie rozdziela się między wierszami
const GK = "G\u2011kod";

const ACCESS = [
  { href: "/kody", ico: I.code, t: "Kody G i M", d: "Karty funkcji: składnia Fanuc i Sinumerik, przykłady, typowe błędy.", m: pl(gcodes.length, "karta", "karty", "kart") },
  { href: "/kalkulator", ico: I.calc, t: "Kalkulatory", d: "Obroty, posuw, wydajność i szacowana moc — frezowanie, toczenie, wiercenie, gwinty.", m: "4 moduły" },
  { href: "/programy", ico: I.play, t: "Gotowe programy", d: "Kompletne programy z narzędziami, do otwarcia w symulatorze.", m: pl(PROGRAMS.length, "detal", "detale", "detali") },
  { href: "/zadania", ico: I.check, t: "Zadania", d: "Napisz program — symulator porówna tor z rozwiązaniem.", m: pl(exercises.length, "zadanie", "zadania", "zadań") },
];

export default function Home() {
  return (
    <div className="grid gap-14">
      <MobileHome lessons={QUICK_LESSONS} />

      {/* 1–2: czym jest GCat i dwie główne akcje — statyczny pierwszy ekran */}
      <section className="home-intro" aria-labelledby="hi-title">
        <div className="hi-brand"><BrandLogo height={96} variant="lockup" forceDark /></div>
        <h1 id="hi-title" className="hi-title">Naucz się czytać i pisać {GK}.</h1>
        <p className="hi-lead">GCat to nauka programowania CNC po polsku: {pl(NAUKA_TOTAL, "lekcja", "lekcje", "lekcji")} frezowania i toczenia z testami, symulator toru narzędzia w 2D i 3D oraz karty kodów ze składnią Fanuc i Sinumerik.</p>
        <div className="hi-actions">
          <Link href="/nauka" className="btn">Rozpocznij naukę</Link>
          <Link href="/symulator" className="btn ghost">Otwórz symulator</Link>
        </div>
        <HomeResume lessons={QUICK_LESSONS} />
      </section>

      <section className="grid gap-4">
        <SectionHeader eyebrow="Symulator" title="Zobacz, co robi Twój program"
          lead="Kontur, kieszeń, rowki i cztery otwory cyklem G81. Dwa narzędzia, jeden program."
          action={<Link className="btn ghost" href="/symulator">Otwórz pełny symulator</Link>} />
        <div className="reveal reveal-1"><SimClient initial={DEMO} mode="mill" showcase autoplay editable={false} /></div>
      </section>

      {/* 4: wybór ścieżki */}
      <section className="grid gap-4">
        <SectionHeader eyebrow="Nauka" title="Frezowanie czy toczenie?"
          lead="Każda ścieżka prowadzi od osi maszyny do kompletnego programu detalu." />
        <TrackPicker />
      </section>

      {/* 5: baza wiedzy i narzędzia — na telefonie te działy są w „Szybkim dostępie” i dolnym pasku */}
      <section className="grid gap-4 home-access">
        <SectionHeader eyebrow="Baza wiedzy i narzędzia" title="Kody, kalkulatory, programy, zadania" />
        <div className="pillars">
          {ACCESS.map((p) => (
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

      <RefTables />
    </div>
  );
}
