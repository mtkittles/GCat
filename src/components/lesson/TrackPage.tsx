import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Chip from "@/components/ui/Chip";
import PageBanner from "@/components/ui/PageBanner";
import { diagrams } from "@/components/diagrams";
import { lessonHref, trackStats, tracks, type Track } from "@/lib/course";
import TrackBody from "./TrackBody";
import { pl } from "@/lib/plural";

const PART_FIG: Record<Track, string> = { frezowanie: "f01-top", toczenie: "t01-part" };

export default function TrackPage({ track }: { track: Track }) {
  const T = tracks[track];
  const other = tracks[track === "frezowanie" ? "toczenie" : "frezowanie"];
  const { ready, total } = trackStats(track);
  const modules = T.modules.map((m) => ({
    id: m.id, title: m.title,
    lessons: m.lessons.map((l) => ({ id: l.id, title: l.title, href: l.doc ? lessonHref(track, l.slug!) : null, minutes: l.doc?.minutes })),
  }));
  return (
    <div className="grid gap-6 tp">
      <Breadcrumbs items={[{ href: "/", label: "GCat" }, { href: "/nauka", label: "Nauka" }, { label: T.title }]} />
      <PageBanner src={T.banner} kicker="Ścieżka nauki" title={T.title} subtitle={T.blurb}
        meta={<><Chip tone="accent">{ready === total ? pl(total, "lekcja", "lekcje", "lekcji") : `${ready} z ${total} lekcji opublikowanych`}</Chip><Chip>{T.part}</Chip></>} size="compact" priority />
      <TrackBody track={track} modules={modules} part={T.part} partFig={diagrams[PART_FIG[track]]?.()}
        other={{ href: `/nauka/${other.key}`, label: `Przejdź na ścieżkę: ${other.title.toLowerCase()}` }} />
    </div>
  );
}
