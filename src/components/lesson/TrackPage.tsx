import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Chip from "@/components/ui/Chip";
import PageBanner from "@/components/ui/PageBanner";
import { lessonHref, trackStats, tracks, type Track } from "@/lib/course";

export default function TrackPage({ track }: { track: Track }) {
  const T = tracks[track];
  const other = tracks[track === "frezowanie" ? "toczenie" : "frezowanie"];
  const { ready, total } = trackStats(track);
  return (
    <div className="grid gap-6 tp">
      <Breadcrumbs items={[{ href: "/", label: "GCat" }, { href: "/nauka", label: "Nauka" }, { label: T.title }]} />
      <PageBanner src={T.banner} kicker="Ścieżka nauki" title={T.title} subtitle={T.blurb}
        meta={<><Chip tone="accent">{ready} z {total} lekcji gotowych</Chip><Chip>{T.part}</Chip></>} size="compact" priority />
      <Link href={`/nauka/${other.key}`} className="tp-switch">Przejdź na ścieżkę: {other.title.toLowerCase()}</Link>
      <ol className="tp-mods">
        {T.modules.map((m) => (
          <li key={m.id} className="tp-mod">
            <h2><span className="tp-mid">{m.id}</span>{m.title}</h2>
            <ol className="tp-lessons">
              {m.lessons.map((l) => (
                <li key={l.id}>
                  {l.doc ? (
                    <Link href={lessonHref(track, l.slug!)} className="tp-l is-ready">
                      <span className="tp-lid">{l.id}</span>
                      <span className="tp-lt">{l.title}</span>
                      <span className="tp-lm">{l.doc.minutes} min</span>
                    </Link>
                  ) : (
                    <div className="tp-l is-planned" aria-disabled>
                      <span className="tp-lid">{l.id}</span>
                      <span className="tp-lt">{l.title}</span>
                      <span className="tp-lm">wkrótce</span>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ol>
    </div>
  );
}
