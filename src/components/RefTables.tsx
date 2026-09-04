import Link from "next/link";
import { reference } from "@/lib/content";

function Code({ code, slug }: { code: string; slug: string | null }) {
  return slug ? <Link href={`/kody/${slug}`} className="font-mono font-bold underline">{code}</Link> : <span className="font-mono font-bold text-muted">{code}</span>;
}

export default function RefTables() {
  return (
    <div className="grid gap-8">
      <section className="grid gap-2">
        <h2 className="text-2xl font-bold">Funkcje G</h2>
        <p className="text-muted text-sm">Podkreślone kody mają pełną kartę z animacją. Reszta — w przygotowaniu.</p>
        <div className="overflow-x-auto"><table className="code-table">
          <thead><tr><th>Kod</th><th>Działanie</th><th className="text-center">Frez</th><th className="text-center">Tok</th></tr></thead>
          <tbody>{reference.g.map(([code, desc, slug, mill, lathe]) => (
            <tr key={code}><td><Code code={code} slug={slug} /></td><td>{desc}</td><td className="text-center">{mill ? "●" : "–"}</td><td className="text-center">{lathe ? "●" : "–"}</td></tr>
          ))}</tbody>
        </table></div>
      </section>
      <section className="grid gap-2">
        <h2 className="text-2xl font-bold">Funkcje M</h2>
        <table className="code-table max-w-3xl"><thead><tr><th>Kod</th><th>Działanie</th></tr></thead>
          <tbody>{reference.m.map(([code, desc, slug]) => <tr key={code}><td><Code code={code} slug={slug} /></td><td>{desc}</td></tr>)}</tbody>
        </table>
      </section>
      <section className="grid gap-2">
        <h2 className="text-2xl font-bold">Adresy w bloku</h2>
        <table className="code-table max-w-3xl"><tbody>{reference.letters.map(([k, d]) => <tr key={k}><td className="font-mono font-bold whitespace-nowrap">{k}</td><td>{d}</td></tr>)}</tbody></table>
      </section>
    </div>
  );
}
