import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { tracks, type Track } from "@/lib/course";
import TrackLessons from "./TrackLessons";
import { trackPlan } from "./trackPlan";

/* Plan ścieżki (/nauka/frezowanie, /nauka/toczenie): nagłówek bez zdjęcia i lista lekcji; przełącznik zmienia ścieżkę. */
export default function TrackPage({ track }: { track: Track }) {
  const T = tracks[track];
  return (
    <div className="grid gap-6">
      <Breadcrumbs items={[{ href: "/", label: "GCat" }, { href: "/nauka", label: "Nauka" }, { label: T.title }]} />
      <header className="ph">
        <span className="ph-k">Ścieżka nauki · {T.part}</span>
        <h1 className="ph-title">{T.title}</h1>
        <p className="ph-lead">{T.blurb}</p>
      </header>
      <TrackLessons tracks={trackPlan()} initial={track} nav />
    </div>
  );
}
