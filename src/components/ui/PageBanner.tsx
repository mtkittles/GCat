"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/*
  Baner sekcji: fotografia technologiczna z przesłoną i nagłówkiem.
  Przy zmianie źródła obraz przenika płynnie — nowa warstwa pojawia się
  na wierzchu poprzedniej. Ruch wyłączony przy prefers-reduced-motion.
*/

export interface BannerProps {
  src: string;
  title: string;
  subtitle?: string;
  /** Wysokość banera; "compact" dla stron z gęstą treścią. */
  size?: "default" | "compact";
  priority?: boolean;
}

export default function PageBanner({ src, title, subtitle, size = "default", priority }: BannerProps) {
  const [layers, setLayers] = useState<{ src: string; key: number }[]>([{ src, key: 0 }]);
  const counter = useRef(0);

  useEffect(() => {
    setLayers((prev) => {
      if (prev[prev.length - 1].src === src) return prev;
      counter.current += 1;
      const next = [...prev, { src, key: counter.current }];
      return next.slice(-2);
    });
  }, [src]);

  useEffect(() => {
    if (layers.length < 2) return;
    const t = setTimeout(() => setLayers((p) => p.slice(-1)), 700);
    return () => clearTimeout(t);
  }, [layers]);

  return (
    <section className={`banner ${size === "compact" ? "is-compact" : ""}`} aria-label={title}>
      {layers.map((l, i) => (
        <Image
          key={l.key}
          src={l.src}
          alt=""
          fill
          sizes="100vw"
          priority={priority && i === 0}
          className={`banner-photo ${i === layers.length - 1 && layers.length > 1 ? "is-entering" : ""}`}
        />
      ))}
      <div className="banner-scrim" />
      <div className="banner-inner">
        <span className="banner-rule" aria-hidden />
        <h1 className="banner-title">{title}</h1>
        {subtitle && <p className="banner-sub">{subtitle}</p>}
      </div>
    </section>
  );
}
