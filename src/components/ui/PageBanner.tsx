"use client";
import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";

/*
  Baner sekcji: zdjęcie (wersja bez wtopionego napisu z /img/clean/), tytuł strony,
  krótki opis i opcjonalny przycisk „?” z dymkiem na dłuższe wyjaśnienie.
  Przy zmianie źródła zdjęcie przenika płynnie.
*/

export interface BannerProps {
  src: string;
  title: string;
  subtitle?: string;
  /** Mała linia nad tytułem, np. „Lekcja 3 z 12”. */
  kicker?: string;
  /** Plakietki pod opisem (np. czas lekcji, tryb). */
  meta?: ReactNode;
  /** Treść dymka pod przyciskiem „?”. */
  info?: ReactNode;
  mono?: boolean;
  size?: "default" | "compact";
  priority?: boolean;
}

const clean = (s: string) => (s.startsWith("/img/banner-") ? s.replace("/img/banner-", "/img/clean/banner-") : s);

export default function PageBanner({ src, title, subtitle, kicker, meta, info, mono, size = "default", priority }: BannerProps) {
  const photo = clean(src);
  const [layers, setLayers] = useState<{ src: string; key: number }[]>([{ src: photo, key: 0 }]);
  const counter = useRef(0);
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLayers((prev) => {
      if (prev[prev.length - 1].src === photo) return prev;
      counter.current += 1;
      return [...prev, { src: photo, key: counter.current }].slice(-2);
    });
  }, [photo]);

  useEffect(() => {
    if (layers.length < 2) return;
    const t = setTimeout(() => setLayers((p) => p.slice(-1)), 700);
    return () => clearTimeout(t);
  }, [layers]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <div className="banner-wrap" ref={wrap}>
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
          {kicker && <span className="banner-kicker">{kicker}</span>}
          <h1 className={`banner-title${mono ? " is-mono" : ""}`}>{title}</h1>
          {subtitle && <p className="banner-sub">{subtitle}</p>}
          {meta && <div className="banner-meta">{meta}</div>}
        </div>
        {info && (
          <button type="button" className={`banner-info${open ? " is-open" : ""}`} aria-label="Więcej informacji" aria-expanded={open}
            onClick={() => setOpen((v) => !v)}>?</button>
        )}
      </section>
      {info && open && (
        <div className="banner-pop" role="dialog" aria-label={`${title} — informacje`}>
          {info}
        </div>
      )}
    </div>
  );
}
