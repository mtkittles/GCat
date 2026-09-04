import Link from "next/link";
import SimClient from "@/components/simulator/SimClient";
import RefTables from "@/components/RefTables";
import { exercises, lessons } from "@/lib/content";

const DEMO = `G21 G90 G17 G54
S1500 M03
G00 X-10 Y-10 Z5
G01 Z-2 F100
G01 X0 Y0 F250
G01 X50
G02 X70 Y20 I0 J20
G01 Y40
G03 X50 Y60 R20
G01 X0
G01 Y0
G00 Z5
M30`;

export default function Home() {
  return (
    <div className="grid gap-12">
      <section className="grid gap-5 lg:grid-cols-[1fr_1.1fr] items-start">
        <div className="grid gap-4">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">Naucz się czytać i pisać G-kod. Po polsku, z symulatorem.</h1>
          <p className="text-lg text-muted max-w-prose">Kursy krok po kroku, karty każdej funkcji G i M ze składnią Fanuc i Sinumerik, symulator toru narzędzia i kalkulator parametrów skrawania.</p>
          <div className="flex gap-3 flex-wrap">
            <Link className="btn" href="/nauka">Zacznij naukę</Link>
            <Link className="btn ghost" href="/zadania">Zadania</Link>
            <Link className="btn ghost" href="/symulator">Symulator</Link>
            <Link className="btn ghost" href="/kalkulator">Kalkulator</Link>
          </div>
          <div className="legend"><span><i style={{ background: "var(--amber)" }} />G00 szybki</span><span><i style={{ background: "var(--green)" }} />G01 liniowy</span><span><i style={{ background: "var(--blue)" }} />G02/G03 łuk</span></div>
        </div>
        <SimClient initial={DEMO} mode="mill" compact autoplay editable={false} />
      </section>

      <section className="grid gap-3">
        <h2 className="text-2xl font-bold">Ścieżka nauki</h2>
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((l, i) => (
            <li key={l.slug}><Link href={`/nauka/${l.slug}`} className="block bg-card border border-line rounded-md p-4 hover:border-ink h-full">
              <div className="text-sm text-muted">Lekcja {i + 1} · {l.minutes} min</div>
              <div className="font-semibold">{l.title}</div>
            </Link></li>
          ))}
        </ol>
      </section>

      <section className="grid gap-3">
        <h2 className="text-2xl font-bold">Sprawdź się</h2>
        <p className="text-muted max-w-prose">Napisz program, a symulator porówna Twój tor narzędzia z rozwiązaniem wzorcowym i wskaże, co się nie zgadza.</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {exercises.slice(0, 4).map((e) => (
            <Link key={e.slug} href={`/zadania/${e.slug}`} className="block bg-card border border-line rounded-md p-4 hover:border-ink">
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
