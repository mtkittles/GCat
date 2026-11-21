import type { Metadata } from "next";
import Link from "next/link";
import AdminGate from "@/components/edycja/AdminGate";
import PageBanner from "@/components/ui/PageBanner";
import { glossary } from "@/lib/content";
import { gcodes } from "@/lib/gcodes";
import { panelUrl } from "@/lib/edycja";
import { artsOf, dzialy, TYP_LABEL } from "@/lib/technologia";

export const metadata: Metadata = { title: "Edytor treści — GCat", robots: { index: false, follow: false } };

/* Lista treści do edycji: karty kodów (edytor na stronie), artykuły Technologii, słownik i rysunki. */
export default function EdytorIndex() {
  const groups = [...new Set(gcodes.map((g) => g.group))];
  return (
    <AdminGate what="Edytor treści">
    <div className="ed-index">
      <PageBanner plain kicker="Tryb edycji" title="Edytor treści" subtitle="Wybierz kartę — edytujesz ją na stronie, z podglądem i historią wersji." />
      {groups.map((gr) => (
        <section key={gr} className="grid gap-2">
          <h2 className="card-h">{gr}</h2>
          <div className="ed-index-grid">
            {gcodes.filter((g) => g.group === gr).map((g) => (
              <Link key={g.slug} href={`/edytor/kody/${g.slug}`}><code>{g.code}{g.star ? " ★" : ""}</code><span>{g.name}</span></Link>
            ))}
          </div>
        </section>
      ))}
      <section className="grid gap-2">
        <h2 className="card-h" id="technologia">Technologia</h2>
        <div className="ed-index-grid">
          <Link href="/edytor/technologia/nowy" className="ed-index-new"><code>+ Nowy artykuł</code><span>Dział, szablon, tytuł</span></Link>
          {dzialy.flatMap((d) => artsOf(d.slug).map((a) => (
            <Link key={a.key} href={`/edytor/technologia/${a.key}`}><code>{d.title}{a.stan === "szkic" ? " · szkic" : ""}{a.plan === "pro" ? " · Pro" : ""}</code><span>{a.title} — {TYP_LABEL[a.typ]}</span></Link>
          )))}
        </div>
      </section>
      <section className="grid gap-2">
        <h2 className="card-h" id="slownik">Słownik</h2>
        <div className="ed-index-grid">
          {[...glossary].sort((a, b) => a.term.localeCompare(b.term, "pl")).map((h) => (
            <Link key={h.anchor} href={`/edytor/slownik/${encodeURIComponent(h.anchor)}`}><code>{h.term.split(" — ")[0]}</code><span>{h.term.includes(" — ") ? h.term.split(" — ")[1] : h.aliases.slice(0, 2).join(", ")}</span></Link>
          ))}
        </div>
      </section>
      <section className="grid gap-2">
        <h2 className="card-h">Inne treści</h2>
        <div className="ed-index-grid">
          <Link href="/rysownik"><code>Rysownik</code><span>Rysunki w stylu strony</span></Link>
          <a href={panelUrl()}><code>Panel Keystatic</code><span>Zapasowo: dotychczasowy panel treści</span></a>
        </div>
      </section>
    </div>
    </AdminGate>
  );
}
