import Link from "next/link";
import HeroCarousel from "./HeroCarousel";

// accent: ikona pomarańczowa (jak w mockupie część kafli), reszta biała
const TILES = [
  { href: "/nauka", label: ["Nauka", "G-code"], icon: "screen", accent: true },
  { href: "/symulator", label: ["Symulator", "CNC"], icon: "cube", accent: false },
  { href: "/kalkulator", label: ["Kalkulatory", "obróbki"], icon: "calc", accent: true },
  { href: "/slownik", label: ["Baza wiedzy"], icon: "doc", accent: false },
  { href: "/zadania", label: ["Zadania", "i ćwiczenia"], icon: "task", accent: false },
  { href: "/kody", label: ["Kody", "G i M"], icon: "code", accent: false },
] as const;

const ICONS: Record<string, string[]> = {
  screen: ["M3 4h18v12H3z", "M8 20h8", "M12 16v4", "M7 8h10", "M7 12h6"],
  cube: ["M12 2 3 7l9 5 9-5-9-5Z", "M3 7v10l9 5 9-5V7", "M12 12v10"],
  calc: ["M5 2h14v20H5z", "M8 6h8", "M8 11h.01", "M12 11h.01", "M16 11h.01", "M8 15h.01", "M12 15h.01", "M16 15h.01", "M8 19h.01", "M12 19h.01", "M16 19h.01"],
  doc: ["M14 2H6v20h12V6z", "M14 2v4h4", "M9 12h6", "M9 16h6"],
  task: ["M15 3H5v18h7", "M15 3l4 4v5", "M8 9h6", "M8 13h4", "M14 18l2 2 4-4"],
  code: ["M9 8l-5 4 5 4", "M15 8l5 4-5 4"],
};

function Ico({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name].map((d) => <path key={d} d={d} />)}
    </svg>
  );
}

function SectionHead({ title, href }: { title: string; href: string }) {
  return (
    <div className="dash-head">
      <h3>{title}</h3>
      <Link href={href}>Zobacz wszystko <span aria-hidden="true">›</span></Link>
    </div>
  );
}

export default function MobileHome() {

  return (
    <section className="mobile-dash">
      <div className="dash-greet reveal">
        <h2>Witaj w GCat</h2>
        <p>Ucz się. Ćwicz. Obrabiaj.</p>
      </div>

      <div className="reveal reveal-1"><HeroCarousel /></div>

      <div className="reveal reveal-2">
        <SectionHead title="Szybki dostęp" href="/nauka" />
        <div className="dash-grid">
          {TILES.map((t) => (
            <Link key={t.href} href={t.href} className={`dash-tile${t.accent ? " is-accent" : ""}`}>
              <Ico name={t.icon} />
              <span>{t.label.map((l) => <span key={l} className="block">{l}</span>)}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
