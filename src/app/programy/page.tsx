import Link from "next/link";
import PageBanner from "@/components/ui/PageBanner";
import Chip from "@/components/ui/Chip";
import ProgramPreview from "@/components/ProgramPreview";
import { PROGRAMS } from "@/content/programy";
import type { LibProgram } from "@/lib/programLibrary";

export const metadata = { title: "Gotowe programy CNC — frezowanie i toczenie — GCat" };

function Card({ p }: { p: LibProgram }) {
  const blocks = p.src.split("\n").filter((l) => l.trim()).length;
  return (
    <li className="pg-card">
      <Link href={`/programy/${p.slug}`} className="pg-prev" aria-label={`Szczegóły: ${p.title}`}>
        <ProgramPreview p={p} id={`pv-${p.slug}`} />
      </Link>
      <div className="pg-body">
        <div className="pg-meta"><span>{p.category}</span><span>{p.level}</span></div>
        <h3><Link href={`/programy/${p.slug}`}>{p.title}</Link></h3>
        <p>{p.summary}</p>
        <div className="pg-chips">{p.features.slice(0, 5).map((f) => <Chip key={f}>{f}</Chip>)}</div>
        <div className="pg-foot">
          <span className="pg-stat">{Object.keys(p.tools).length} narz. · {blocks} bloków</span>
          <Link href={`/symulator?program=${p.slug}`} className="btn">Otwórz w symulatorze</Link>
        </div>
      </div>
    </li>
  );
}

export default function ProgramsPage() {
  const groups = [
    { key: "frezowanie", title: "Frezowanie", items: PROGRAMS.filter((p) => p.mode === "mill") },
    { key: "toczenie", title: "Toczenie", items: PROGRAMS.filter((p) => p.mode === "lathe") },
  ];
  return (
    <div className="grid gap-6">
      <PageBanner src="/img/banner-simulator.jpg" kicker="Biblioteka" title="Gotowe programy"
        subtitle={`${PROGRAMS.length} kompletnych programów z przypisanymi narzędziami — otwórz dowolny w symulatorze i zobacz, jak powstaje detal.`} priority />
      <nav className="pg-jump" aria-label="Działy">
        {groups.map((g) => <a key={g.key} href={`#${g.key}`}>{g.title} <b>{g.items.length}</b></a>)}
      </nav>
      {groups.map((g) => (
        <section key={g.key} id={g.key} className="grid gap-4">
          <h2 className="pg-h">{g.title}</h2>
          <ul className="pg-grid">{g.items.map((p) => <Card key={p.slug} p={p} />)}</ul>
        </section>
      ))}
    </div>
  );
}
