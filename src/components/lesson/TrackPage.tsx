import { tracks, type Track } from "@/lib/course";
import TrackLessons from "./TrackLessons";
import { trackPlan } from "./trackPlan";
import PageHead from "@/components/ui/PageHead";

/* Plan ścieżki (/nauka/frezowanie, /nauka/toczenie): nagłówek bez zdjęcia i lista lekcji; przełącznik zmienia ścieżkę. */
export default function TrackPage({ track }: { track: Track }) {
  const T = tracks[track];
  return (
    <div className="grid gap-6">
      <PageHead crumbs={[{ href: "/", label: "GCat" }, { href: "/nauka", label: "Nauka" }, { label: T.title }]}
        title={T.title} lead={<>{T.blurb} Program detalu: {T.part.charAt(0).toLowerCase() + T.part.slice(1)}.</>} />
      <TrackLessons tracks={trackPlan()} initial={track} nav />
    </div>
  );
}
