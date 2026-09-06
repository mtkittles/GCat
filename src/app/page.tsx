import Image from "next/image";
import Link from "next/link";
import SimClient from "@/components/simulator/SimClient";
import RefTables from "@/components/RefTables";
import SectionHeader from "@/components/ui/SectionHeader";
import Chip from "@/components/ui/Chip";
import BrandLogo from "@/components/BrandLogo";
import { exercises, lessons } from "@/lib/content";
import { gcodes } from "@/lib/gcodes";

const DEMO = `(PLYTKA Z ZAOKRAGLENIAMI)
G21 G90 G17 G54
T01 M06
S2400 M03
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
G00 X40 Y25
G01 Z-2 F120
G02 I12 J0 F300
G00 Z20
M30`;

const I = {
  book: "M4 5.5A1.5 1.5 0 0 1 5.5 4H19v16H5.5A1.5 1.5 0 0 1 4 18.5zM9 4v16",
  play: "M8 5l11 7-11 7z",
  code: "M9 8l-5 4 5 4M15 8l5 4-5 4",
  calc: "M6 3h12v18H6zM9 7h6M8 11h1M12 11h1M16 11h1M8 15h1M12 15h1M16 15h5",
  check: "M4 12l5 5L20 6",
};

const HERO_BULLETS: { i: string; a: string; b: string }[] = [
  { i: I.play, a: "Symulator", b: "CNC" },
  { i: I.calc, a: "Kalkulatory", b: "technologiczne" },
  { i: I.check, a: "Praktyczne", b: "zadania" },
  { i: I.book, a: "Wiedza", b: "w jednym miejscu" },
];

const PILLARS = [
  { href: "/nauka", ico: I.book, t: "Nauka", d: "Dwanaście lekcji od pierwszego bloku do programu wielonarzędziowego.", m: "12 lekcji" },
  { href: "/symulator", ico: I.play, t: "Symulator", d: "Tor 2D i 3D, cykle stałe, kompensacja, kontrola kolizji.", m: "2D · 3D" },
  { href: "/kody", ico: I.code, t: "Kody G i M", d: "Karty funkcji ze składnią Fanuc i Sinumerik oraz przykładami.", m: "27 kart" },
  { href: "/kalkulator", ico: I.calc, t: "Kalkulatory", d: "Obroty, posuwy, moc skrawania, gwinty, presety materiałów.", m: "4 moduły" },
  { href: "/zadania", ico: I.check, t: "Zadania", d: "Napisz program, a symulator sprawdzi tor narzędzia.", m: "16 zadań" },
];

export default function Home() {
  const starter = gcodes.filter((g) => g.level === 1).slice(0, 6);
  return (
    <div className="grid gap-14">
      <section className="hero">
        <Image src="/img/hero-cnc.jpg" alt="Frez w trakcie obróbki bloku stalowego z wygrawerowanym znakiem GCat"
          fill priority sizes="100vw" className="hero-photo" />
        <div className="hero-scrim" />
        <div className="hero-inner">
          <div className="grid gap-5 max-w-2xl">
            <span className="hero-kicker">
              <span className="on">G-code</span><i>/</i>CNC<i>/</i>Praktyka
            </span>
            <h1>Naucz się czytać<br />i pisać G-kod.</h1>
            <p className="text-lg">Po polsku, z symulatorem toru narzędzia.</p>
            <div className="hero-actions">
              <Link className="btn" href="/nauka">Rozpocznij naukę</Link>
              <Link className="btn ghost" href="/kody">Przeglądaj kody</Link>
            </div>
          </div>

          <ul className="hero-bullets">
            {HERO_BULLETS.map((b) => (
              <li key={b.a}>
                <span className="hero-bullet-ico">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={b.i} /></svg>
                </span>
                <span>{b.a}<br />{b.b}</span>
              </li>
            ))}
          </ul>

          <span className="hero-corner">From<br />G-code<br />to parts</span>
        </div>
      </section>

      <section className="brandblock reveal">
        <BrandLogo height={190} variant="lockup" />
        <span className="brandblock-motto">Zrozum. Programuj. Obrabiaj.</span>
        <p className="brandblock-lead">
          GCat powstał z prostego założenia: G-kodu nie da się nauczyć z samej tabeli kodów.
          Każda funkcja ma tu wyjaśnienie, schemat i program, który uruchomisz jednym kliknięciem —
          i zobaczysz, co narzędzie naprawdę zrobi z materiałem.
        </p>
        <div className="brandblock-stats">
          <span className="brandstat"><b>27</b><span>kart kodów</span></span>
          <span className="brandstat"><b>12</b><span>lekcji</span></span>
          <span className="brandstat"><b>16</b><span>zadań</span></span>
          <span className="brandstat"><b>2D+3D</b><span>symulacja</span></span>
        </div>
      </section>

      <section className="grid gap-4">
        <SectionHeader eyebrow="Co znajdziesz w GCat" title="Pięć narzędzi, jedna ścieżka" lead="Teoria, referencja i praktyka połączone tak, żeby każdy kod dało się od razu uruchomić i zobaczyć." />
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
        <SectionHeader eyebrow="Symulator" title="Zobacz, co robi Twój program"
          lead="Program po lewej, tor narzędzia po prawej — linia wykonywana w tej chwili podświetla się razem z rysowanym ruchem."
          action={<Link className="btn ghost" href="/symulator">Otwórz pełny symulator</Link>} />
        <div className="reveal reveal-1"><SimClient initial={DEMO} mode="mill" showcase autoplay editable={false} /></div>
      </section>

      <section className="grid gap-4">
        <SectionHeader eyebrow="Ścieżka nauki" title="Od bloku do gotowego programu"
          action={<Link className="btn ghost" href="/nauka">Wszystkie lekcje</Link>} />
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 reveal reveal-2">
          {lessons.slice(0, 6).map((l, i) => (
            <li key={l.slug}><Link href={`/nauka/${l.slug}`} className="tile h-full">
              <span className="tile-num">LEKCJA {String(i + 1).padStart(2, "0")} · {l.minutes} MIN</span>
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
          lead="Napisz program, a symulator porówna Twój tor narzędzia z rozwiązaniem wzorcowym i wskaże, co się nie zgadza."
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
