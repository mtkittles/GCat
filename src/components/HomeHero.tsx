"use client";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import BrandLogo from "@/components/BrandLogo";

/*
  Baner startowy na komputerze: slajdy z najważniejszymi częściami serwisu.
  Logo z mottem stoi na stałe w lewym górnym rogu. Slajdy zmieniają się same,
  zatrzymują przy najechaniu, działają strzałki, kropki, klawiatura i przesunięcie.
*/

export type HeroSlide = { src: string; kicker: string; title: string; text: string; cta: { href: string; label: string }; alt?: { href: string; label: string }; stat?: string };

const HOLD = 7000;

export default function HomeHero({ slides }: { slides: HeroSlide[] }) {
  const n = slides.length;
  const [cur, setCur] = useState(0);
  const [paused, setPaused] = useState(false);
  const touch = useRef<number | null>(null);
  const go = useCallback((k: number) => setCur(((k % n) + n) % n), [n]);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => setCur((c) => (c + 1) % n), HOLD);
    return () => window.clearTimeout(t);
  }, [cur, paused, n]);

  return (
    <section className="hh" aria-roledescription="karuzela" aria-label="Najważniejsze w GCat"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
      onKeyDown={(e) => { if (e.key === "ArrowRight") go(cur + 1); if (e.key === "ArrowLeft") go(cur - 1); }}
      onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => { if (touch.current == null) return; const dx = e.changedTouches[0].clientX - touch.current; if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1)); touch.current = null; }}>
      {slides.map((s, k) => (
        <div key={s.title} className={`hh-slide${k === cur ? " is-on" : ""}`} aria-hidden={k !== cur} role="group" aria-roledescription="slajd" aria-label={`${k + 1} z ${n}`}>
          <Image src={s.src} alt="" fill priority={k === 0} sizes="100vw" className="hh-photo" />
          <div className="hh-scrim" />
          <div className="hh-body">
            <span className="hh-kicker">{s.kicker}{s.stat ? <b>{s.stat}</b> : null}</span>
            <h2 className="hh-title">{s.title}</h2>
            <p className="hh-text">{s.text}</p>
            <div className="hh-actions">
              <Link href={s.cta.href} className="btn" tabIndex={k === cur ? 0 : -1}>{s.cta.label}</Link>
              {s.alt && <Link href={s.alt.href} className="btn ghost" tabIndex={k === cur ? 0 : -1}>{s.alt.label}</Link>}
            </div>
          </div>
        </div>
      ))}

      <div className="hh-brand">
        <BrandLogo height={58} variant="lockup" forceDark />
        <span className="hh-motto">Zrozum. Programuj. Obrabiaj.</span>
      </div>

      <div className="hh-nav">
        <button type="button" className="hh-arrow" aria-label="Poprzedni slajd" onClick={() => go(cur - 1)}>‹</button>
        <div className="hh-dots" role="tablist">
          {slides.map((s, k) => (
            <button key={s.title} type="button" role="tab" aria-selected={k === cur} aria-label={s.kicker} className={k === cur ? "is-on" : ""} onClick={() => go(k)}>
              <span>{s.kicker}</span>
              {k === cur && !paused ? <i style={{ animationDuration: `${HOLD}ms` }} /> : null}
            </button>
          ))}
        </div>
        <button type="button" className="hh-arrow" aria-label="Następny slajd" onClick={() => go(cur + 1)}>›</button>
      </div>
    </section>
  );
}
