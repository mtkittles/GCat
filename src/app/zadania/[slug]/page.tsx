import Link from "next/link";
import { notFound } from "next/navigation";
import Runner from "./Runner";
import PageBanner from "@/components/ui/PageBanner";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Chip from "@/components/ui/Chip";
import { exerciseBySlug, exercises } from "@/lib/content";
import { flat, lessonHref, type Track } from "@/lib/course";

export function generateStaticParams() { return exercises.map((e) => ({ slug: e.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const e = exerciseBySlug((await params).slug); return { title: e ? `${e.title} — zadanie — GCat` : "Zadanie" };
}

const LEVEL = { 1: "podstawy", 2: "średni", 3: "zaawansowany" } as const;

/* Profil zapisu — ten sam co w ścieżkach Nauki (src/lib/course.ts), bez odwołania do panelu lekcji. */
const PROFILE = {
  mill: "Zapis: Fanuc (ISO) · frezarka pionowa, 3 osie · milimetry, posuw na minutę (G94).",
  lathe: "Zapis: Fanuc, system A · tokarka dwuosiowa, X w średnicy · milimetry, posuw na obrót (G99).",
} as const;

function lessonLinks(ids: string[] = []) {
  return ids.flatMap((id) => {
    const track: Track = id.startsWith("T") ? "toczenie" : "frezowanie";
    const l = flat(track).find((x) => x.id === id);
    return l?.slug ? [{ id, title: l.title, href: lessonHref(track, l.slug) }] : [];
  });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const e = exerciseBySlug((await params).slug); if (!e) notFound();
  const i = exercises.indexOf(e); const next = exercises[i + 1];
  return (
    <article className="grid gap-5">
      <Breadcrumbs items={[{ href: "/", label: "GCat" }, { href: "/zadania", label: "Zadania" }, { label: `Zadanie ${i + 1}` }]} />
      <PageBanner src="/img/banner-tasks.jpg" kicker={`Zadanie ${i + 1} z ${exercises.length}`} title={e.title} size="compact" priority
        meta={<>
          <Chip tone={e.level === 1 ? "success" : e.level === 2 ? "warning" : "danger"}>{LEVEL[e.level]}</Chip>
          <Chip tone="info">{e.mode === "mill" ? "frezowanie" : "toczenie"}</Chip>
        </>} />
      <p className="tp-profile">{PROFILE[e.mode]} Sprawdzanie porównuje tor narzędzia w symulatorze GCat — nie zastępuje sprawdzenia programu na konkretnej maszynie.</p>
      <p className="lead max-w-prose">{e.brief}</p>
      {lessonLinks(e.lessons).length > 0 && (
        <p className="ex-review">Przed zadaniem powtórz: {lessonLinks(e.lessons).map((l, k) => (
          <span key={l.id}>{k > 0 && " · "}<Link href={l.href}><b>{l.id}</b> {l.title}</Link></span>
        ))}</p>
      )}
      <Runner ex={e} />
      <nav className="flex justify-between text-sm pt-4 border-t border-line">
        <Link href="/zadania">Wszystkie zadania</Link>
        {next && <Link href={`/zadania/${next.slug}`}>Następne: {next.title} ›</Link>}
      </nav>
    </article>
  );
}
