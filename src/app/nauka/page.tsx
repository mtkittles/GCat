import TrackPicker from "@/components/lesson/TrackPicker";
import { pl } from "@/lib/plural";
import Link from "next/link";
import PageBanner from "@/components/ui/PageBanner";
import { lessons } from "@/lib/content";

export const metadata = { title: "Nauka G-kodu krok po kroku — GCat" };

export default function Nauka() {
  return (
    <div className="grid gap-6">
      <PageBanner src="/img/banner-simulator.jpg" kicker="Ścieżka nauki" title="Nauka"
        subtitle="Wybierz obróbkę. Każda ścieżka prowadzi od osi maszyny do gotowego programu."
        info={<p>Lekcje mają stały układ: teoria z rysunkami, przykład rozwiązany, ćwiczenia, typowe błędy, test i program detalu, który rośnie z lekcji na lekcję.</p>} priority />
      <TrackPicker />
      {/* archiwum: starszy kurs zostaje pod dotychczasowymi adresami, ale nie konkuruje ze ścieżkami */}
      <details className="nk-old nk-archive">
        <summary>Archiwum — poprzednia wersja kursu ({pl(lessons.length, "lekcja", "lekcje", "lekcji")})</summary>
        <p className="nk-archive-note">Starszy, krótszy kurs sprzed podziału na ścieżki. Aktualne lekcje są w ścieżkach frezowania i toczenia powyżej.</p>
        <ol className="grid gap-2">
          {lessons.map((l, i) => (
            <li key={l.slug}><Link href={`/nauka/${l.slug}`} className="tile flex gap-4">
              <span className="font-mono text-lg font-bold w-7" style={{ color: "var(--muted)" }}>{i + 1}</span>
              <span><span className="font-semibold block">{l.title}</span><span className="text-sm text-muted">{l.intro}</span></span>
            </Link></li>
          ))}
        </ol>
      </details>
    </div>
  );
}
