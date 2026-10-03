import Image from "next/image";
import Link from "next/link";
import TrackResume from "@/components/lesson/TrackResume";
import { lessonHref, readyLessons, trackList, trackStats } from "@/lib/course";
import { pl } from "@/lib/plural";

/* Wybór ścieżki: karty ze zdjęciem (Frezowanie / Toczenie) — wspólne dla strony głównej i /nauka. */
export default function TrackPicker() {
  return (
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
  );
}
