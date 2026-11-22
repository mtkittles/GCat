"use client";
import Link from "next/link";
import type { PointerEvent, ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { DZIAL_ICO, IcoCube } from "@/components/obszary/icons";
import { useLive } from "@/components/obszary/live";
import { ChipPreview, HardnessBars, IsoDecoder, MillParts, RpmDro, RunoutPreview, TrochoidPreview } from "@/components/obszary/previews";
import { bento } from "@/lib/obszary";
import { pl } from "@/lib/plural";
import { HV } from "./tech-data";

/*
  /technologia — „żywe karty” działów (V3.0b). Karta jak tabliczka stanowiska: plakietka T01…, dioda (zielona —
  dział ma artykuły), klawisz z ikoną dwubarwną, okno z podglądem treści działu, stopka z liczbą artykułów.
  Siatka bento z hierarchią (src/lib/obszary.ts → bento): Narzędzia 4 × 2, dwa działy obok, rzędy po trzy, reszta pasem.
  Podglądy ruszają tylko w widoku i bez „ogranicz ruch” (useLive); światło za kursorem tylko przy myszce.
*/
export interface TechCardData { slug: string; title: string; short: string; icon: string; big?: boolean; arts: string[] }

const HV_ROWS: [string, number, number][] = HV.filter(([n]) => ["HSS", "węglik spiekany", "CBN (spiekany)", "diament spiekany"].includes(n))
  .map(([n, a, b]) => [n.replace(" spiekany", "").replace(" (spiekany)", "").replace("diament", "PCD"), a, b]);

function preview(icon: string, live: boolean, hero: boolean): ReactNode {
  switch (icon) {
    case "frez": return hero ? <MillParts live={live} /> : null;
    case "plytka": return <IsoDecoder live={live} />;
    case "wzory": return <RpmDro live={live} />;
    case "proces": return <ChipPreview />;
    case "mocowanie": return <RunoutPreview />;
    case "materialy": return <HardnessBars rows={HV_ROWS} max={12000} />;
    case "strategie": return <TrochoidPreview />;
    default: return null;
  }
}

function light(e: PointerEvent<HTMLElement>) {
  if (e.pointerType !== "mouse") return;
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
}

export default function TechCards({ dzialy }: { dzialy: TechCardData[] }) {
  const [ref, live] = useLive<HTMLDivElement>();
  return (
    <div ref={ref} className="tc-grid" data-live={live ? "" : undefined}>
      {bento(dzialy).map(({ item: d, span }) => {
        const Icon = DZIAL_ICO[d.icon] ?? IcoCube;
        const n = d.arts.length;
        const hero = span === "hero";
        const count = n ? pl(n, "artykuł", "artykuły", "artykułów") : "w przygotowaniu";
        return (
          <Link key={d.slug} href={`/technologia/${d.slug}`} className={`tc spot live-card is-${span}`} onPointerMove={light}
            aria-label={`${d.title} — ${count}`}>
            <span className="tc-ttl">
              <span className="ikey"><Icon /></span>
              <span className="tc-tt">
                <b>{d.title}</b>
                {hero && <span className="tc-short">{d.short}</span>}
              </span>
            </span>
            {!hero && <span className="tc-short">{d.short}</span>}
            <span className="tc-pv">{preview(d.icon, live, hero)}</span>
            {hero && n > 0 && (
              <span className="tc-in" aria-hidden>
                <span className="tc-k">W dziale</span>
                {d.arts.slice(0, 3).map((t) => <span key={t} className="tc-art">{t}</span>)}
              </span>
            )}
            <span className="tc-ft">
              <span className="tc-k">{count}</span>
              <ChevronRight aria-hidden className="tc-go" />
            </span>
          </Link>
        );
      })}
    </div>
  );
}
