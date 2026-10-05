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
          <span className="pg-stat">{p.ops ? `${p.ops.length} zabiegów · ` : ""}{Object.keys(p.tools).length} narz. · {blocks} bloków</span>
          <Link href={`/symulator?program=${p.slug}`} className="btn">Otwórz w symulatorze</Link>
        </div>
      </div>
    </li>
  );
}

export default function ProgramsPage() {
  // działy: frezowanie / toczenie, w nich kategorie w kolejności z biblioteki
  const groups = (["mill", "lathe"] as const).map((mode) => {
    const items = PROGRAMS.filter((p) => p.mode === mode);
    const cats = [...new Set(items.map((p) => p.category))];
    return {
      key: mode === "mill" ? "frezowanie" : "toczenie", title: mode === "mill" ? "Frezowanie" : "Toczenie", count: items.length,
      cats: cats.map((c) => ({ c, id: `${mode}-${c.toLowerCase().replace(/[^a-z0-9ąćęłńóśźż]+/g, "-")}`, items: items.filter((p) => p.category === c) })),
    };
  });
  return (
    <div className="grid gap-6">
      <PageBanner src="/img/banner-simulator.jpg" kicker="Biblioteka" title="Gotowe programy"
        subtitle={`${PROGRAMS.length} kompletnych detali — każdy z kilkoma narzędziami, kartą technologiczną i opisem zabiegów. Otwórz dowolny w symulatorze i zobacz, jak powstaje detal.`} priority />
      <nav className="pg-jump" aria-label="Działy">
        {groups.flatMap((g) => g.cats.map((c) => <a key={c.id} href={`#${c.id}`}>{g.title}: {c.c} <b>{c.items.length}</b></a>))}
      </nav>
      {groups.map((g) => (
        <section key={g.key} id={g.key} className="grid gap-5">
          <h2 className="pg-h">{g.title} <span className="pg-count">{g.count}</span></h2>
          {g.cats.map((c) => (
            <div key={c.id} id={c.id} className="grid gap-3">
              <h3 className="pg-cat">{c.c}</h3>
              <ul className="pg-grid">{c.items.map((p) => <Card key={p.slug} p={p} />)}</ul>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
