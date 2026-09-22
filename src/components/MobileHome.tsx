import Image from "next/image";
import Link from "next/link";

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

function Ico({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d={ICONS[name]} />
    </svg>
  );
}

export default function MobileHome({ firstLesson, lessonCount }: { firstLesson?: LessonRef; lessonCount: number }) {
  const startHref = firstLesson ? `/nauka/${firstLesson.slug}` : "/nauka";
  const startTitle = firstLesson?.title ?? "Podstawy G-code";

  return (
    <section className="mobile-dash">
      <div className="dash-greet reveal">
        <span className="pill">GCat</span>
        <h2>Witaj!</h2>
        <p>Ucz się. Ćwicz. Obrabiaj.</p>
      </div>

      <Link href={startHref} className="dash-cta reveal reveal-1">
        <span className="dash-cta-thumb">
          <Image src="/img/hero-cnc.jpg" alt="" fill sizes="72px" />
        </span>
        <span className="dash-cta-body">
          <span className="dash-cta-label">Zacznij naukę</span>
          <b>{startTitle}</b>
          <span className="dash-cta-sub">{lessonCount} lekcji od podstaw do zaawansowanych</span>
        </span>
        <span className="dash-cta-go" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
        </span>
      </Link>

      <div className="dash-grid reveal reveal-2">
        {TILES.map((t) => (
          <Link key={t.href} href={t.href} className="dash-tile">
            <span className="dash-tile-ico"><Ico name={t.icon} /></span>
            <span>{t.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
