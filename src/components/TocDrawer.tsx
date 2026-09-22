"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type TocItem = { id: string; label: string };

/*
  Spis treści wysuwany z prawej krawędzi (mobile/tablet).
  Uchwyt przy krawędzi pokazuje numer bieżącej sekcji; panel zamyka się
  po wyborze sekcji, tapnięciu w tło, przesunięciu w prawo lub Escape.
*/
export default function TocDrawer({ items, title = "Spis treści" }: { items: TocItem[]; title?: string }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const touchX = useRef<number | null>(null);

  // Scroll-spy: aktywna jest ostatnia sekcja, której nagłówek minął górną część ekranu;
  // na samym dole strony — ostatnia. Obliczenia w rAF, setState tylko przy zmianie.
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

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open]);

  if (items.length < 2) return null;

  const goTo = (id: string) => {
    setOpen(false);
    const el = document.getElementById(id);
    if (el) { el.scrollIntoView({ behavior: "smooth", block: "start" }); history.replaceState(null, "", `#${id}`); }
  };

  return (
    <>
      <button type="button" className="toc-handle" aria-label="Pokaż spis treści" aria-expanded={open} onClick={() => setOpen(true)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" /></svg>
        <span>{active >= 0 ? `${active + 1}/${items.length}` : items.length}</span>
      </button>

      {open && createPortal(
        <div className="toc-drawer-root">
          <button type="button" className="toc-backdrop" aria-label="Zamknij spis treści" onClick={() => setOpen(false)} />
          <aside
            className="toc-drawer"
            role="dialog"
            aria-label={title}
            onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
              if (touchX.current !== null && e.changedTouches[0].clientX - touchX.current > 60) setOpen(false);
              touchX.current = null;
            }}
          >
            <div className="toc-drawer-head">
              <span>{title}</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Zamknij">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>
            <ol>
              {items.map((it, k) => (
                <li key={it.id}>
                  <a href={`#${it.id}`} className={k === active ? "is-active" : undefined}
                    onClick={(e) => { e.preventDefault(); goTo(it.id); }}>
                    <span className="toc-n">{String(k + 1).padStart(2, "0")}</span>
                    <span>{it.label}</span>
                  </a>
                </li>
              ))}
            </ol>
          </aside>
        </div>,
        document.body,
      )}
    </>
  );
}
