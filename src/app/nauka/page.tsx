import Link from "next/link";
import PageBanner from "@/components/ui/PageBanner";
import { lessons } from "@/lib/content";
export const metadata = { title: "Nauka G-kodu krok po kroku — GCat" };
export default function Nauka() {
  return (
    <div className="grid gap-5">
      <PageBanner src="/img/banner-mill.jpg" kicker="Ścieżka nauki" title="Nauka"
        subtitle={`${lessons.length} lekcji, od czytania bloku do toczenia.`}
        info={<p>Każda lekcja kończy się programem, który przerabiasz w symulatorze.</p>} priority />
      <ol className="grid gap-2 max-w-2xl">
        {lessons.map((l, i) => (
          <li key={l.slug}><Link href={`/nauka/${l.slug}`} className="tile flex gap-4">
            <span className="font-mono text-2xl font-bold w-8" style={{ color: "var(--accent)" }}>{i + 1}</span>
            <span><span className="font-semibold block">{l.title}</span><span className="text-sm text-muted">{l.intro}</span></span>
          </Link></li>
        ))}
      </ol>
    </div>
  );
}
