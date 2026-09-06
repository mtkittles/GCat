import Image from "next/image";
import Link from "next/link";
import SimClient from "@/components/simulator/SimClient";
import RefTables from "@/components/RefTables";
import SectionHeader from "@/components/ui/SectionHeader";
import TechGrid from "@/components/ui/TechGrid";
import Chip from "@/components/ui/Chip";
import BrandLogo from "@/components/BrandLogo";
import { exercises, lessons } from "@/lib/content";
import { gcodes } from "@/lib/gcodes";

const DEMO = `G21 G90 G17 G54
S1500 M03
G00 X0 Y0 Z5
G01 Z-2 F100
G01 X50 F250
G02 X70 Y20 I0 J20
G01 Y40
G03 X50 Y60 R20
G01 X0
G01 Y0
G00 Z5
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

      <section className="grid gap-4 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        <div className="hero-visual-light reveal"><TechGrid /></div>
        <div className="codecard">
          <div className="codecard-head"><span className="codecard-dot" />Symulator G-code</div>
          <pre>
{`  `}<span className="ln">1</span><span className="g">G21 G90 G17 G54</span>{`\n`}
{`  `}<span className="ln">2</span><span className="fs">S1500</span> <span className="m">M03</span>{`\n`}
<span className="active">{`  `}<span className="ln">3</span><span className="g">G01</span> <span className="ax">X50 Y0</span> <span className="fs">F250</span>{`\n`}</span>
{`  `}<span className="ln">4</span><span className="g">G02</span> <span className="ax">X70 Y20 I0 J20</span>{`\n`}
{`  `}<span className="ln">5</span><span className="g">G03</span> <span className="ax">X50 Y60 R20</span>{`\n`}
{`  `}<span className="ln">6</span><span className="m">M30</span><span className="caret">&nbsp;</span>
          </pre>
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
        <SectionHeader eyebrow="Symulator" title="Zobacz, co robi Twój program"
          lead="Każdy blok tłumaczony na polski, tor rysowany na bieżąco, walidator wskazujący kolizje i błędy składni."
          action={<Link className="btn ghost" href="/symulator">Otwórz pełny symulator</Link>} />
        <SimClient initial={DEMO} mode="mill" compact autoplay editable={false} />
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
