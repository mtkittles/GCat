"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Slide = { src: string; href: string; cta: string; kicker?: string; title?: string };

// Banery z wtopionym tytułem nie dostają nakładki z tekstem — tylko przycisk.
const SLIDES: Slide[] = [
  { src: "/img/hero-cnc.jpg", href: "/nauka", cta: "Zacznij naukę", kicker: "Nauka G-code", title: "Naucz się czytać i pisać G-kod" },
  { src: "/img/banner-simulator.jpg", href: "/symulator", cta: "Otwórz symulator" },
  { src: "/img/banner-tasks.jpg", href: "/zadania", cta: "Rozwiąż zadanie" },
  { src: "/img/banner-mill.jpg", href: "/kalkulator", cta: "Kalkulator frezowania" },
  { src: "/img/banner-turn.jpg", href: "/kalkulator", cta: "Kalkulator toczenia" },
  { src: "/img/banner-drill.jpg", href: "/kalkulator", cta: "Kalkulator wiercenia" },
  { src: "/img/banner-thread.jpg", href: "/kalkulator", cta: "Kalkulator gwintowania" },
];
const N = SLIDES.length;
const HOLD_MS = 5200;

export default function HeroCarousel() {
  const [s, setS] = useState({ cur: 0, prev: -1 });
  const touchX = useRef<number | null>(null);
  const swiped = useRef(false);

  const go = (k: number) => setS((v) => (k === v.cur ? v : { cur: k, prev: v.cur }));

  // Autoplay: jeden timeout na slajd, restartowany po każdej zmianie (także ręcznej).
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => setS((v) => ({ cur: (v.cur + 1) % N, prev: v.cur })), HOLD_MS);
    return () => window.clearTimeout(t);
  }, [s.cur]);

  return (
    <div
      className="hc"
      aria-roledescription="karuzela"
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; swiped.current = false; }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) < 40) return;
        swiped.current = true;
        setS((v) => {
          const k = dx < 0 ? (v.cur + 1) % N : (v.cur - 1 + N) % N;
          return { cur: k, prev: v.cur };
        });
      }}
      onClickCapture={(e) => { if (swiped.current) { e.preventDefault(); swiped.current = false; } }}
    >
      {SLIDES.map((sl, k) => (
        <Link
          key={sl.src}
          href={sl.href}
          className={`hc-slide${k === s.cur ? " is-on" : k === s.prev ? " is-prev" : ""}`}
          aria-hidden={k !== s.cur}
          tabIndex={k === s.cur ? 0 : -1}
        >
          <Image src={sl.src} alt="" fill priority={k === 0} sizes="(max-width: 767px) 100vw, 1px" className="hc-img" />
          <span className="hc-scrim" />
          {sl.title && (
            <span className="hc-copy">
              <span className="hc-kicker">{sl.kicker}</span>
              <b>{sl.title}</b>
            </span>
          )}
          <span className="hc-cta">
            {sl.cta}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
          </span>
        </Link>
      ))}

      <div className="hc-dots">
        {SLIDES.map((sl, k) => (
          <button key={sl.src} type="button" aria-label={`Slajd ${k + 1}`} className={k === s.cur ? "is-on" : undefined} onClick={() => go(k)}>
            {k === s.cur && <i key={s.cur} />}
          </button>
        ))}
      </div>
    </div>
  );
}
