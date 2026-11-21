import Link from "next/link";
import type { ComponentType } from "react";
import {
  IcoBook, IcoCalc, IcoCalculator, IcoCaliper, IcoChip, IcoCode, IcoCube, IcoHolder, IcoInsert, IcoMill, IcoPath, IcoSim, IcoTurn,
} from "@/components/obszary/icons";

/*
  Pulpit (V3.1): pas działów przewijający się w poziomie — w miejscu, gdzie strony firm pokazują logotypy klientów.
  Ikony te same co w panelu bocznym (dwubarwne, components/obszary/icons.tsx). Czysty CSS: dwie kopie listy, druga
  ukryta dla czytników i klawiatury; najechanie lub fokus zatrzymuje pas, „ogranicz ruch” zmienia go w przewijaną listę.
*/
interface Item { href: string | null; label: string; Ico: ComponentType<{ className?: string }> }

export const CATEGORIES: Item[] = [
  { href: "/nauka/frezowanie", label: "Frezowanie", Ico: IcoMill },
  { href: "/nauka/toczenie", label: "Toczenie", Ico: IcoTurn },
  { href: "/kody", label: "Kody G i M", Ico: IcoCode },
  { href: "/symulator", label: "Symulator 2D/3D", Ico: IcoSim },
  { href: "/technologia/plytki-iso", label: "Płytki ISO", Ico: IcoInsert },
  { href: "/technologia/obliczenia", label: "Obliczenia", Ico: IcoCalc },
  { href: "/technologia/proces", label: "Proces skrawania", Ico: IcoChip },
  { href: "/technologia/mocowanie", label: "Mocowanie", Ico: IcoHolder },
  { href: "/technologia/materialy", label: "Materiały", Ico: IcoCube },
  { href: "/technologia/strategie", label: "Strategie obróbki", Ico: IcoPath },
  { href: "/kalkulator", label: "Kalkulatory", Ico: IcoCalculator },
  { href: "/slownik", label: "Słownik CNC", Ico: IcoBook },
  { href: null, label: "Pomiar i jakość", Ico: IcoCaliper },
];

function Row({ copy }: { copy?: boolean }) {
  return (
    <ul className="mq-row" aria-hidden={copy || undefined}>
      {CATEGORIES.map(({ href, label, Ico }) => {
        const body = <><span className="mq-key"><Ico /></span><span className="mq-t">{label}</span>{!href && <em>wkrótce</em>}</>;
        return (
          <li key={label}>
            {href ? <Link href={href} className="mq-it live-card" tabIndex={copy ? -1 : undefined}>{body}</Link> : <span className="mq-it is-soon">{body}</span>}
          </li>
        );
      })}
    </ul>
  );
}

export default function CategoryMarquee() {
  return (
    <nav className="mq" aria-label="Działy serwisu">
      <div className="mq-track"><Row /><Row copy /></div>
    </nav>
  );
}
