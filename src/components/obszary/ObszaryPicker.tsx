"use client";
import Link from "next/link";
import { useState, type ComponentType } from "react";
import { ArrowRight } from "lucide-react";
import { isFinished, progressKey, useProgress } from "@/lib/progress";
import { setObszar } from "@/lib/ui/prefs";
import { pl } from "@/lib/plural";
import { OBSZAR, OBSZARY, POMIAR_PLAN, type ObszarKey } from "@/lib/obszary";
import type { ResumeLesson } from "@/components/pulpit/types";
import { DZIAL_ICO, IcoMill, IcoTurn, OBSZAR_ICO } from "./icons";
import { CncPreview, PomiarPreview, TechPreview } from "./previews";
import { useLive } from "./live";

/*
  Pulpit: „Czego się uczysz?” — trzy kafle obszarów (V3.0b). Jeden kafel rozwinięty (podgląd, liczniki, przycisk dalej),
  pozostałe zwinięte z listą działów. Rozwinięty jest wybrany obszar (html[data-obszar], bez mignięcia przy wczytaniu),
  po najechaniu myszą — kafel pod kursorem. Kliknięcie kafla wybiera obszar: drzewo w panelu bocznym przełącza się na niego.
*/
export interface TechDzialCount { slug: string; title: string; icon: string; n: number }

function Seg({ cells }: { cells: boolean[] }) {
  return <span className="ob-seg" aria-hidden>{cells.map((on, i) => <i key={i} className={on ? "is-on" : undefined} />)}</span>;
}

export default function ObszaryPicker({ lessons, codes, tech }: { lessons: ResumeLesson[]; codes: number; tech: TechDzialCount[] }) {
  const prog = useProgress();
  const [hot, setHot] = useState<ObszarKey | null>(null);
  const [ref, live] = useLive<HTMLDivElement>();

  const track = (t: ResumeLesson["track"]) => {
    const ls = lessons.filter((l) => l.track === t);
    const cells = ls.map((l) => isFinished(prog[progressKey(l.track, l.id)]));
    return { ls, cells, done: cells.filter(Boolean).length };
  };
  const mill = track("frezowanie"), turn = track("toczenie");
  const anyDone = mill.done + turn.done > 0;
  const next = lessons.find((l) => !isFinished(prog[progressKey(l.track, l.id)])) ?? lessons[0];
  const techArts = tech.reduce((s, d) => s + d.n, 0);

  const pick = (k: ObszarKey) => { setObszar(k); setHot(k); };
  const hover = (k: ObszarKey) => (e: { pointerType: string }) => { if (e.pointerType === "mouse") setHot(k); };

  const body: Record<ObszarKey, { sub: { ico?: ComponentType<{ className?: string }>; t: string }[]; more: React.ReactNode; fig: React.ReactNode }> = {
    cnc: {
      fig: <CncPreview />,
      sub: [
        { ico: IcoMill, t: `Frezowanie · ${mill.done}/${mill.ls.length}` },
        { ico: IcoTurn, t: `Toczenie · ${turn.done}/${turn.ls.length}` },
        { t: "Kody G i M · Symulator · Zadania" },
      ],
      more: (
        <>
          <Link href="/nauka/frezowanie" className="ob-pill"><IcoMill className="ob-pill-ico" />Frezowanie <Seg cells={mill.cells} /><span className="ob-pill-n">{mill.done}/{mill.ls.length}</span></Link>
          <Link href="/nauka/toczenie" className="ob-pill"><IcoTurn className="ob-pill-ico" />Toczenie <Seg cells={turn.cells} /><span className="ob-pill-n">{turn.done}/{turn.ls.length}</span></Link>
          <Link href="/kody" className="ob-pill">Kody G i M <span className="ob-pill-n">{codes}</span></Link>
          {next && <Link href={next.href} className="btn ob-cta" onClick={() => setObszar("cnc")}>{anyDone ? "Kontynuuj" : "Zacznij od"} <code>{next.id}</code><ArrowRight aria-hidden /></Link>}
        </>
      ),
    },
    tech: {
      fig: <TechPreview />,
      sub: [
        ...tech.slice(0, 3).map((d) => ({ ico: DZIAL_ICO[d.icon], t: d.n ? `${d.title} · ${d.n}` : d.title })),
        { t: `+ ${pl(tech.length - 3, "dział", "działy", "działów")}` },
      ],
      more: (
        <>
          {tech.slice(0, 3).map((d) => {
            const I = DZIAL_ICO[d.icon];
            return <Link key={d.slug} href={`/technologia/${d.slug}`} className="ob-pill" onClick={() => setObszar("tech")}>{I && <I className="ob-pill-ico" />}{d.title}{d.n > 0 && <span className="ob-pill-n">{d.n}</span>}</Link>;
          })}
          <Link href="/technologia" className="btn ob-cta" onClick={() => setObszar("tech")}>Otwórz Technologię<ArrowRight aria-hidden /></Link>
        </>
      ),
    },
    pomiar: {
      fig: <PomiarPreview />,
      sub: POMIAR_PLAN.slice(0, 3).map((t) => ({ t })),
      more: <span className="ob-pill is-muted">Plan działu w przygotowaniu</span>,
    },
  };

  const meta: Record<ObszarKey, string> = {
    cnc: `${pl(lessons.length, "lekcja", "lekcje", "lekcji")} · ${pl(codes, "kod", "kody", "kodów")}`,
    tech: `${pl(tech.length, "dział", "działy", "działów")} · ${pl(techArts, "artykuł", "artykuły", "artykułów")}`,
    pomiar: "wkrótce",
  };

  return (
    <div ref={ref} className="obs" data-hot={hot ?? undefined} data-live={live ? "" : undefined} onPointerLeave={() => setHot(null)}>
      {OBSZARY.map((k) => {
        const o = OBSZAR[k];
        const Icon = OBSZAR_ICO[k];
        const b = body[k];
        return (
          <article key={k} className={`ob-card live-card spot${o.soon ? " is-soon" : ""}`} data-k={k} onPointerEnter={hover(k)}
            onPointerMove={(e) => {
              if (e.pointerType !== "mouse") return;
              const r = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
              e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
            }}>
            <div className="ob-ttl">
              <span className="ikey is-l"><Icon /></span>
              <span className="ob-tt">
                <h3><button type="button" className="ob-sel" onClick={() => pick(k)}>{o.title}</button></h3>
                <span className="ob-meta">{meta[k]}</span>
              </span>
            </div>
            <p className="ob-lead">{o.lead}</p>
            <div className="well ob-fig">{b.fig}</div>
            <ul className="ob-sub">
              {b.sub.map((s) => { const I = s.ico; return <li key={s.t}>{I && <I className="ob-sub-ico" />}{s.t}</li>; })}
            </ul>
            <div className="ob-more">{b.more}</div>
          </article>
        );
      })}
    </div>
  );
}
