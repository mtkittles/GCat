import Link from "next/link";
import SimClient from "@/components/simulator/SimClient";
import { gcodes } from "@/lib/gcodes";

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
  const starter = gcodes.filter((g) => g.level === 1);
  return (
    <div className="grid gap-10">
      <section className="grid gap-5 lg:grid-cols-[1fr_1.1fr] items-start">
        <div className="grid gap-4">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">Naucz się czytać i pisać G-kod. Po polsku, z symulatorem.</h1>
          <p className="text-lg text-muted max-w-prose">Każda funkcja G i M ma kartę: co robi, jak wygląda w Fanuc i Sinumerik, na czym ludzie się wykładają — i animację toru narzędzia, którą możesz edytować.</p>
          <div className="flex gap-3 flex-wrap">
            <Link className="btn" href="/kody">Przeglądaj kody</Link>
            <Link className="btn ghost" href="/symulator">Otwórz symulator</Link>
          </div>
          <div className="legend"><span><i style={{ background: "var(--amber)" }} />G00 szybki</span><span><i style={{ background: "var(--green)" }} />G01 liniowy</span><span><i style={{ background: "var(--blue)" }} />G02/G03 łuk</span></div>
        </div>
        <SimClient initial={DEMO} mode="mill" compact autoplay editable={false} />
      </section>

      <section className="grid gap-3">
        <h2 className="text-2xl font-bold">Zacznij od podstaw</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {starter.map((g) => (
            <Link key={g.slug} href={`/kody/${g.slug}`} className="block bg-white border border-line rounded-md p-4 hover:border-ink">
              <div className="font-mono font-bold">{g.code}</div>
              <div className="font-semibold">{g.name}</div>
              <p className="text-sm text-muted mt-1">{g.short}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
