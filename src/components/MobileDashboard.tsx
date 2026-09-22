"use client";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { getVisits, type VisitEntry } from "@/lib/visits";

type LessonRef = { slug: string; title: string };

const TILES = [
  { href: "/nauka", label: "Nauka", icon: "book" },
  { href: "/symulator", label: "Symulator", icon: "play" },
  { href: "/kalkulator", label: "Kalkulatory", icon: "calc" },
  { href: "/slownik", label: "Baza wiedzy", icon: "search" },
  { href: "/zadania", label: "Zadania", icon: "check" },
  { href: "/kody", label: "Kody G/M", icon: "code" },
] as const;

const ICONS: Record<string, string> = {
  book: "M4 5.5A1.5 1.5 0 0 1 5.5 4H19v16H5.5A1.5 1.5 0 0 1 4 18.5zM9 4v16",
  play: "M8 5l11 7-11 7z",
  calc: "M6 3h12v18H6zM9 7h6M8 11h1M12 11h1M16 11h1M8 15h1M12 15h1M16 15h5",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM21 21l-4.35-4.35",
  check: "M4 12l5 5L20 6",
  code: "M9 8l-5 4 5 4M15 8l5 4-5 4",
};

function kindFor(path: string) {
  if (path.startsWith("/nauka/")) return "Lekcja";
  if (path.startsWith("/kody/")) return "Kod";
  if (path.startsWith("/zadania/")) return "Zadanie";
  if (path === "/symulator") return "Symulator";
  if (path === "/kalkulator") return "Kalkulator";
  if (path === "/slownik") return "Słownik";
  if (path === "/nauka") return "Nauka";
  if (path === "/kody") return "Kody";
  if (path === "/zadania") return "Zadania";
  return "Strona";
}

function timeAgo(ts: number) {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return "przed chwilą";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min temu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} godz. temu`;
  const d = Math.floor(h / 24);
  return d === 1 ? "wczoraj" : `${d} dni temu`;
}

function Ico({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d={ICONS[name]} />
    </svg>
  );
}

const noopSubscribe = () => () => {};
const emptyVisits: VisitEntry[] = [];

export default function MobileDashboard({ lessons }: { lessons: LessonRef[] }) {
  // localStorage nie istnieje na serwerze — useSyncExternalStore renderuje [] przy SSR/hydracji,
  // a zaraz po zamontowaniu dociąga prawdziwą zawartość bez błędu hydracji.
  const visits = useSyncExternalStore(noopSubscribe, getVisits, () => emptyVisits);

  const lessonSlugs = new Set(lessons.map((l) => l.slug));
  const visitedLessonSlugs = new Set(
    visits.filter((v) => v.path.startsWith("/nauka/")).map((v) => v.path.replace("/nauka/", ""))
  );
  const visitedCount = [...visitedLessonSlugs].filter((s) => lessonSlugs.has(s)).length;
  const pct = lessons.length ? Math.round((visitedCount / lessons.length) * 100) : 0;

  const lastLessonVisit = visits.find((v) => v.path.startsWith("/nauka/"));
  const continueHref = lastLessonVisit?.path ?? (lessons[0] ? `/nauka/${lessons[0].slug}` : "/nauka");
  const continueTitle = lastLessonVisit?.title ?? lessons[0]?.title ?? "Podstawy G-code";

  const recent = visits.slice(0, 3);

  return (
    <section className="mobile-dash">
      <div className="dash-greet">
        <h2>Witaj! 👋</h2>
        <p>Ucz się. Ćwicz. Obrabiaj.</p>
      </div>

      <Link href={continueHref} className="dash-continue">
        <div className="dash-continue-top">
          <span>{visitedCount > 0 ? "Kontynuuj naukę" : "Zacznij naukę"}</span>
          <span className="dash-continue-pct">{pct}%</span>
        </div>
        <b>{continueTitle}</b>
        <div className="dash-bar"><i style={{ width: `${pct}%` }} /></div>
      </Link>

      <div className="dash-grid">
        {TILES.map((t) => (
          <Link key={t.href} href={t.href} className="dash-tile">
            <span className="dash-tile-ico"><Ico name={t.icon} /></span>
            <span>{t.label}</span>
          </Link>
        ))}
      </div>

      {recent.length > 0 && (
        <div className="dash-recent">
          <span className="dash-recent-label">Ostatnio używane</span>
          {recent.map((v) => (
            <Link key={v.path} href={v.path} className="dash-recent-item">
              <span className="dash-recent-kind">{kindFor(v.path)}</span>
              <b>{v.title}</b>
              <span className="dash-recent-time">{timeAgo(v.ts)}</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
