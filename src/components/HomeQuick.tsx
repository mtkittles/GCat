"use client";
import Link from "next/link";
import { progressKey, useProgress } from "@/lib/progress";

/* Cztery szybkie wejścia pod banerem. Pierwszy kafel pokazuje postęp nauki. */

export type QuickLesson = { track: string; id: string; title: string; href: string };

export default function HomeQuick({ lessons, counts }: { lessons: QuickLesson[]; counts: { programs: number; codes: number; lessons: number } }) {
  const prog = useProgress();
  const done = lessons.filter((l) => prog[progressKey(l.track, l.id)]?.done).length;
  const started = lessons.some((l) => prog[progressKey(l.track, l.id)]?.visited || prog[progressKey(l.track, l.id)]?.done);
  // ostatnio otwarta lekcja albo pierwsza niezaliczona
  const last = [...lessons].sort((a, b) => (prog[progressKey(b.track, b.id)]?.visited ?? 0) - (prog[progressKey(a.track, a.id)]?.visited ?? 0))[0];
  const next = started && last && !prog[progressKey(last.track, last.id)]?.done ? last : lessons.find((l) => !prog[progressKey(l.track, l.id)]?.done) ?? lessons[0];
  const pct = lessons.length ? Math.round((done / lessons.length) * 100) : 0;
  const tiles = [
    { href: started ? next.href : "/nauka", k: "Nauka", t: started ? `Kontynuuj: ${next.id} ${next.title}` : "Zacznij naukę", d: started ? `Zaliczone ${done} z ${lessons.length}` : `${counts.lessons} lekcji: frezowanie i toczenie`, bar: started ? pct : null },
    { href: "/symulator", k: "Symulator", t: "Tor narzędzia w 2D i 3D", d: "Wklej program albo wybierz gotowy", bar: null },
    { href: "/programy", k: "Gotowe programy", t: `${counts.programs} detali z narzędziami`, d: "Podgląd detalu i otwarcie w symulatorze", bar: null },
    { href: "/kody", k: "Kody G i M", t: `${counts.codes} kart kodów`, d: "Opis, składnia Fanuc i Sinumerik, symulacja", bar: null },
  ];
  return (
    <nav className="hq" aria-label="Szybki dostęp">
      {tiles.map((x) => (
        <Link key={x.k} href={x.href} className="hq-tile">
          <span className="hq-k">{x.k}</span>
          <b className="hq-t">{x.t}</b>
          <span className="hq-d">{x.d}</span>
          {x.bar !== null && <span className="hq-bar"><i style={{ width: `${x.bar}%` }} /></span>}
        </Link>
      ))}
    </nav>
  );
}
