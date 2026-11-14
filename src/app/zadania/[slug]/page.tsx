import Link from "next/link";
import { notFound } from "next/navigation";
import Runner from "./Runner";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Chip from "@/components/ui/Chip";
import { exerciseBySlug, exercises, type Exercise } from "@/lib/content";
import { flat, lessonHref, type Track } from "@/lib/course";

export function generateStaticParams() { return exercises.map((e) => ({ slug: e.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const e = exerciseBySlug((await params).slug); return { title: e ? `${e.title} — zadanie — GCat` : "Zadanie" };
}

const LEVEL = { 1: "podstawy", 2: "średni", 3: "zaawansowany" } as const;

/* Profil zapisu — ten sam co w ścieżkach Nauki (src/lib/course.ts), bez odwołania do panelu lekcji. */
const PROFILE = {
  mill: "Fanuc (ISO), frezarka pionowa, 3 osie, milimetry, posuw na minutę (G94).",
  lathe: "Fanuc, system A, tokarka dwuosiowa, X w średnicy, milimetry, posuw na obrót (G99).",
} as const;

function lessonLinks(ids: string[] = []) {
  return ids.flatMap((id) => {
    const track: Track = id.startsWith("T") ? "toczenie" : "frezowanie";
    const l = flat(track).find((x) => x.id === id);
    return l?.slug ? [{ id, title: l.title, href: lessonHref(track, l.slug) }] : [];
  });
}

const num = (n: number) => String(n).replace(".", ",");
/** Dane zadania z pól `stock` i `tools` — to samo, co dostaje symulator. */
function taskData(e: Exercise): [string, string][] {
  const rows: [string, string][] = [];
  const s = e.stock;
  if (s?.d != null && s.len != null) rows.push(["Półfabrykat", `pręt ⌀${num(s.d)} × ${num(s.len)} mm`]);
  else if (s?.x != null && s.y != null && s.z != null) rows.push(["Półfabrykat", `${num(s.x)} × ${num(s.y)} × ${num(s.z)} mm`]);
  for (const [no, t] of Object.entries(e.tools ?? {})) rows.push([`T${e.mode === "lathe" ? no.padStart(4, "0") : no.padStart(2, "0")}`, t.name]);
  rows.push(["Zapis", PROFILE[e.mode]]);
  return rows;
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const e = exerciseBySlug((await params).slug); if (!e) notFound();
  const i = exercises.indexOf(e); const next = exercises[i + 1]; const prev = exercises[i - 1];
  const links = lessonLinks(e.lessons);
  return (
    <article className="task">
      <Breadcrumbs items={[{ href: "/", label: "GCat" }, { href: "/zadania", label: "Zadania" }, { label: `Zadanie ${i + 1}` }]} />
      <Runner ex={e}>
        <header className="task-head">
          <span className="task-kicker">Zadanie {i + 1} z {exercises.length}</span>
          <h1>{e.title}</h1>
          <div className="task-chips">
            <Chip tone={e.level === 1 ? "success" : e.level === 2 ? "warning" : "danger"}>{LEVEL[e.level]}</Chip>
            <Chip tone="info">{e.mode === "mill" ? "frezowanie" : "toczenie"}</Chip>
          </div>
        </header>
        {e.steps?.length ? (
          <>
            {e.goal && <p className="task-goal">{e.goal}</p>}
            <section aria-labelledby="task-steps-h">
              <h2 id="task-steps-h" className="task-h">Co zrobić</h2>
              <ol className="task-steps">{e.steps.map((s, k) => <li key={k}>{s}</li>)}</ol>
            </section>
          </>
        ) : <p className="task-goal">{e.brief}</p>}
        <section aria-labelledby="task-data-h">
          <h2 id="task-data-h" className="task-h">Dane</h2>
          <dl className="task-data">{taskData(e).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
        </section>
        {links.length > 0 && (
          <section aria-labelledby="task-rev-h">
            <h2 id="task-rev-h" className="task-h">Przed zadaniem powtórz</h2>
            <ul className="task-rev">{links.map((l) => <li key={l.id}><Link href={l.href}><b>{l.id}</b> {l.title}</Link></li>)}</ul>
          </section>
        )}
      </Runner>
      <p className="task-note">Sprawdzanie porównuje tor narzędzia w symulatorze GCat. Nie zastępuje sprawdzenia programu na konkretnej maszynie.</p>
      <nav className="task-nav">
        {prev ? <Link href={`/zadania/${prev.slug}`}>‹ {prev.title}</Link> : <span />}
        <Link href="/zadania">Wszystkie zadania</Link>
        {next ? <Link href={`/zadania/${next.slug}`}>{next.title} ›</Link> : <span />}
      </nav>
    </article>
  );
}
