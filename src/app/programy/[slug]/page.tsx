import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Chip from "@/components/ui/Chip";
import ProgramPreview from "@/components/ProgramPreview";
import { PROGRAMS, programBySlug } from "@/content/programy";
import { parseProgram } from "@/lib/parser";
import { TOOL_LABEL } from "@/components/simulator/setup";

export function generateStaticParams() { return PROGRAMS.map((p) => ({ slug: p.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const p = programBySlug((await params).slug);
  return { title: p ? `${p.title} — gotowy program — GCat` : "Program — GCat" };
}

export default async function ProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = programBySlug((await params).slug);
  if (!p) notFound();
  const prog = parseProgram(p.src, { diameterX: p.mode === "lathe" });
  const mins = Math.max(1, Math.round(prog.seconds / 60));
  const lines = p.src.split("\n");
  const same = PROGRAMS.filter((x) => x.mode === p.mode && x.category === p.category && x.slug !== p.slug).slice(0, 4);
  return (
    <div className="grid gap-6 pg-detail">
      <Breadcrumbs items={[{ href: "/", label: "GCat" }, { href: "/programy", label: "Gotowe programy" }, { label: p.title }]} />
      <div className="pg-hero">
        <div className="pg-hero-prev"><ProgramPreview p={p} id="pv-main" /></div>
        <div className="pg-hero-txt">
          <div className="pg-meta"><span>{p.mode === "mill" ? "Frezowanie" : "Toczenie"}</span><span>{p.category}</span><span>{p.level}</span></div>
          <h1>{p.title}</h1>
          <p>{p.summary}</p>
          <div className="pg-chips">{p.features.map((f) => <Chip key={f}>{f}</Chip>)}</div>
          <dl className="pg-facts">
            <div><dt>Czas obróbki</dt><dd>ok. {mins} min</dd></div>
            <div><dt>Bloki</dt><dd>{lines.filter((l) => l.trim()).length}</dd></div>
            <div><dt>Narzędzia</dt><dd>{Object.keys(p.tools).length}</dd></div>
            {p.ops && <div><dt>Zabiegi</dt><dd>{p.ops.length}</dd></div>}
          </dl>
          <div className="pg-actions">
            <Link href={`/symulator?program=${p.slug}`} className="btn">Otwórz w symulatorze</Link>
            {p.lesson && <Link href={p.lesson.href} className="btn ghost">Lekcja: {p.lesson.label}</Link>}
          </div>
        </div>
      </div>
      {p.ops && p.ops.length > 0 && (
        <section className="pg-ops">
          <h2 className="pg-h">Karta technologiczna</h2>
          <table className="tbl">
            <thead><tr><th>Nr</th><th>Zabieg</th><th>Narzędzie</th><th>Kody i parametry</th></tr></thead>
            <tbody>
              {p.ops.map((o, k) => {
                const tool = p.tools[o.t];
                const tn = p.mode === "lathe" && o.t >= 100 ? `T${String(o.t).padStart(4, "0")}` : `T${o.t}`;
                return <tr key={k}><td className="font-mono">{k + 1}</td><td>{o.op}</td><td><span className="font-mono">{tn}</span> {tool?.name}</td><td className="pg-how">{o.how}</td></tr>;
              })}
            </tbody>
          </table>
        </section>
      )}
      <div className="pg-cols">
        <section className="pg-tools">
          <h2 className="pg-h">Narzędzia</h2>
          <table className="tbl">
            <thead><tr><th>T</th><th>Narzędzie</th><th>Rodzaj</th></tr></thead>
            <tbody>
              {Object.entries(p.tools).map(([t, tool]) => (
                <tr key={t}><td className="font-mono">{p.mode === "lathe" && Number(t) >= 100 ? `T${t.padStart(4, "0")}` : `T${t}`}</td><td>{tool.name}</td><td>{TOOL_LABEL[tool.kind]}</td></tr>
              ))}
            </tbody>
          </table>
          <p className="text-muted text-sm">Symulator ustawia te narzędzia sam po otwarciu programu. Możesz je zmienić w zakładce Narzędzia.</p>
        </section>
        <section className="pg-code">
          <h2 className="pg-h">Program</h2>
          <pre>{lines.map((l, k) => <span key={k}><i>{k + 1}</i>{l}{"\n"}</span>)}</pre>
        </section>
      </div>
      {same.length > 0 && (
        <section className="grid gap-3">
          <h2 className="pg-h">Inne programy — {p.category}</h2>
          <ul className="pg-mini">
            {same.map((x) => <li key={x.slug}><Link href={`/programy/${x.slug}`}><ProgramPreview p={x} id={`pv-o-${x.slug}`} /><span>{x.title}</span></Link></li>)}
          </ul>
        </section>
      )}
    </div>
  );
}
