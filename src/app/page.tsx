import Link from "next/link";
import SimClient from "@/components/simulator/SimClient";
import RefTables from "@/components/RefTables";
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

const FEATURES = [
  { t: "Symulator CNC", d: "Tor 2D i 3D, cykle, kolizje", i: "M4 7h16M4 12h10M4 17h6" },
  { t: "Kalkulatory", d: "Obroty, posuwy, gwinty", i: "M5 4h14v16H5zM9 8h6M9 12h6M9 16h3" },
  { t: "Zadania praktyczne", d: "Sprawdzanie toru narzędzia", i: "M5 12l4 4L19 7" },
  { t: "Wiedza w jednym miejscu", d: "27 kart, 12 lekcji, słownik", i: "M4 5h16v14H4zM8 5v14" },
];

export default function Home() {
  const starter = gcodes.filter((g) => g.level === 1).slice(0, 6);
  return (
    <div className="grid gap-12">
      <section className="hero grid gap-5 lg:grid-cols-[1fr_1.05fr] lg:items-center">
        <div className="grid gap-4 relative z-10">
          <span className="eyebrow">G-code · CNC · praktyka</span>
          <h1>Naucz się czytać i pisać G-kod.</h1>
          <p className="text-lg max-w-prose">Po polsku, z symulatorem. Od pierwszego bloku do programu na wiele narzędzi — z animacją toru, walidatorem i kalkulatorem parametrów skrawania.</p>
          <div className="hero-actions">
            <Link className="btn" href="/nauka">Rozpocznij naukę</Link>
            <Link className="btn ghost" href="/symulator">Otwórz symulator</Link>
          </div>
        </div>
        <div className="relative z-10">
          <SimClient initial={DEMO} mode="mill" compact autoplay editable={false} />
        </div>
      </section>

      <section className="feature-row">
        {FEATURES.map((f) => (
          <div key={f.t} className="feature">
            <span className="feature-ico">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={f.i} /></svg>
            </span>
            <span><b>{f.t}</b>{f.d}</span>
          </div>
        ))}
      </section>

      <section className="grid gap-3">
        <div>
          <h2 className="section-title">Ścieżka nauki</h2>
          <p className="section-lead">Dwanaście lekcji od czytania bloku do uruchomienia programu na maszynie.</p>
        </div>
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((l, i) => (
            <li key={l.slug}><Link href={`/nauka/${l.slug}`} className="tile h-full">
              <div className="text-sm text-muted">Lekcja {i + 1} · {l.minutes} min</div>
              <div className="font-semibold mt-1">{l.title}</div>
            </Link></li>
          ))}
        </ol>
      </section>

      <section className="grid gap-3">
        <div>
          <h2 className="section-title">Zacznij od podstaw</h2>
          <p className="section-lead">Karty najczęściej używanych funkcji, każda z animacją i przykładem do edycji.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {starter.map((g) => (
            <Link key={g.slug} href={`/kody/${g.slug}`} className="tile">
              <div className="tile-code">{g.code}</div>
              <div className="font-semibold">{g.name}</div>
              <p className="text-sm text-muted mt-1">{g.short}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-3">
        <div>
          <h2 className="section-title">Sprawdź się</h2>
          <p className="section-lead">Napisz program, a symulator porówna Twój tor narzędzia z rozwiązaniem wzorcowym.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {exercises.slice(0, 4).map((e) => (
            <Link key={e.slug} href={`/zadania/${e.slug}`} className="tile">
              <div className="font-semibold">{e.title}</div>
              <div className="text-sm text-muted mt-1">{e.mode === "mill" ? "frezowanie" : "toczenie"}</div>
            </Link>
          ))}
        </div>
      </section>

      <RefTables />
    </div>
  );
}
