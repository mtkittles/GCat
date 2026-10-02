import Image from "next/image";
import TrackResume from "@/components/lesson/TrackResume";
import { pl } from "@/lib/plural";
import Link from "next/link";
import PageBanner from "@/components/ui/PageBanner";
import { lessons } from "@/lib/content";
import { readyLessons, trackList, trackStats, lessonHref } from "@/lib/course";

export const metadata = { title: "Nauka G-kodu krok po kroku — GCat" };

export default function Nauka() {
  return (
    <div className="grid gap-6">
      <PageBanner src="/img/banner-simulator.jpg" kicker="Ścieżka nauki" title="Nauka"
        subtitle="Wybierz obróbkę. Każda ścieżka prowadzi od osi maszyny do gotowego programu."
        info={<p>Lekcje mają stały układ: teoria z rysunkami, przykład rozwiązany, ćwiczenia, typowe błędy, test i program detalu, który rośnie z lekcji na lekcję.</p>} priority />
      <div className="nk-pick">
        {trackList.map((t) => {
          const { ready, total } = trackStats(t.key);
          const first = readyLessons(t.key)[0];
          return (
            <div key={t.key} className="nk-card">
              <Link href={`/nauka/${t.key}`} className="nk-main">
                <Image src={t.banner.replace("/img/banner-", "/img/clean/banner-")} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="nk-photo" />
                <span className="nk-scrim" />
                <span className="nk-body">
                  <b>{t.title}</b>
                  <span>{t.blurb}</span>
                  <span className="nk-meta">{ready === total ? pl(total, "lekcja", "lekcje", "lekcji") : `${ready} z ${total} lekcji opublikowanych`}</span>
                </span>
              </Link>
              {first
                ? <TrackResume track={t.key} lessons={readyLessons(t.key).map((l) => ({ id: l.id, title: l.title, href: lessonHref(t.key, l.slug!) }))}
                    fallback={{ href: lessonHref(t.key, first.slug!), label: `Zacznij od ${first.id}: ${first.title}` }} />
                : <span className="nk-start is-off">Pierwsze lekcje w przygotowaniu</span>}
            </div>
          );
        })}
      </div>
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
