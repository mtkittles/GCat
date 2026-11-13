"use client";
import { useEffect, useRef, useState } from "react";

/*
  Spis sekcji karty — lewa kolumna na szerokich ekranach.
  Podświetla sekcję, w której jest czytelnik (ta sama reguła co w TocDrawer: ostatni nagłówek,
  który minął 30% wysokości ekranu; na samym dole strony — ostatnia sekcja).
  Gdy spis jest dłuższy niż ekran, przewija się sam tak, żeby bieżąca pozycja była widoczna.
*/
export default function LeftToc({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(-1);
  const nav = useRef<HTMLElement>(null);

  useEffect(() => {
    let raf = 0;
    const calc = () => {
      raf = 0;
      const line = window.innerHeight * 0.3;
      let idx = -1;
      items.forEach((it, k) => {
        const el = document.getElementById(it.id);
        if (el && el.getBoundingClientRect().top < line) idx = k;
      });
      const doc = document.documentElement;
      if (idx >= 0 && window.scrollY + window.innerHeight >= doc.scrollHeight - 8) idx = items.length - 1;
      setActive(idx);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(calc); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [items]);

  // przewijamy tylko wnętrze spisu — scrollIntoView ruszyłby całą stronę
  useEffect(() => {
    const box = nav.current;
    const el = box?.querySelector<HTMLElement>('a[aria-current="location"]');
    if (!box || !el || box.scrollHeight <= box.clientHeight) return;
    const top = el.offsetTop - box.offsetTop, pad = 28;
    if (top < box.scrollTop + pad) box.scrollTop = Math.max(0, top - pad);
    else if (top + el.offsetHeight > box.scrollTop + box.clientHeight - pad) box.scrollTop = top + el.offsetHeight - box.clientHeight + pad;
  }, [active]);

  return (
    <nav ref={nav} className="toc toc-sticky toc-spy" aria-label="W tej karcie">
      <span className="toc-title">W tej karcie</span>
      <ol>
        {items.map((t, k) => (
          <li key={t.id} className={k === active ? "is-active" : undefined}>
            <a href={`#${t.id}`} aria-current={k === active ? "location" : undefined}>{t.label}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
