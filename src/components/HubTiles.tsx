import Image from "next/image";
import Link from "next/link";
import { pl } from "@/lib/plural";
import { PROGRAMS } from "@/content/programy";
import { exercises, glossary } from "@/lib/content";
import { gcodes } from "@/lib/gcodes";

/* Kafelki działów ze zdjęciem — ten sam język wizualny co karty Frezowanie/Toczenie (nk-card).
   Grafiki podmienia się w jednym miejscu: pole `img`. Docelowo /img/karty/<nazwa>.jpg (patrz docs/prompt-grafiki.md). */
const HUB = [
  { href: "/kody", t: "Kody G i M", d: "Składnia Fanuc i Sinumerik, przykłady, typowe błędy.", m: pl(gcodes.length, "karta", "karty", "kart"), img: "/img/clean/banner-simulator.jpg", pos: "50% 40%", big: true },
  { href: "/programy", t: "Gotowe programy", d: "Kompletne programy z narzędziami — otwórz w symulatorze.", m: pl(PROGRAMS.length, "detal", "detale", "detali"), img: "/img/clean/banner-thread.jpg", pos: "50% 50%", big: true },
  { href: "/kalkulator", t: "Kalkulatory", d: "Obroty, posuw, wydajność i moc skrawania.", m: "4 moduły", img: "/img/clean/banner-drill.jpg", pos: "45% 50%", desktopOnly: true },
  { href: "/zadania", t: "Zadania", d: "Napisz program — symulator porówna tor z rozwiązaniem.", m: pl(exercises.length, "zadanie", "zadania", "zadań"), img: "/img/clean/banner-tasks.jpg", pos: "50% 45%" },
  { href: "/slownik", t: "Słownik", d: "Pojęcia obróbki i programowania CNC.", m: pl(glossary.length, "hasło", "hasła", "haseł"), img: "/img/hero-cnc.jpg", pos: "35% 50%" },
];

/* compact = telefon: siatka 2×2, bez opisu; Kalkulatory pomijamy, bo są w dolnym pasku */
export default function HubTiles({ compact = false }: { compact?: boolean }) {
  const items = compact ? HUB.filter((h) => !h.desktopOnly) : HUB;
  return (
    <div className={`hub-grid${compact ? " is-compact" : ""}`}>
      {items.map((h) => (
        <Link key={h.href} href={h.href} className={`hub-tile${h.big && !compact ? " is-big" : ""}`}>
          <Image src={h.img} alt="" fill sizes={compact ? "50vw" : "(min-width: 1024px) 50vw, 100vw"} className="nk-photo" style={{ objectPosition: h.pos }} />
          <span className="nk-scrim" />
          <span className="hub-body">
            <b>{h.t}</b>
            {!compact && <span className="hub-d">{h.d}</span>}
            <span className="hub-m">{h.m}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}
