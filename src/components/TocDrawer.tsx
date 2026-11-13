"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type TocItem = { id: string; label: string };

/*
  Spis treści wysuwany z prawej krawędzi (mobile/tablet).
  Uchwyt przy krawędzi pokazuje numer bieżącej sekcji; panel zamyka się
  po wyborze sekcji, tapnięciu w tło, przesunięciu w prawo lub Escape.
  Z a (audyt kart cz. 2 §4.5): uchwyt chowa się przy przewijaniu w dół, żeby nie zasłaniał
  końców wierszy, i wraca przy przewijaniu w górę; panel jest modalny — fokus przechodzi
  do bieżącej pozycji spisu i wraca na uchwyt po zamknięciu.
*/
export default function TocDrawer({ items, title = "Spis treści" }: { items: TocItem[]; title?: string }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [away, setAway] = useState(false);
  const touchX = useRef<number | null>(null);
  const handle = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);
  const wasOpen = useRef(false);

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
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY) > 12) { setAway(y > lastY && y > 200); lastY = y; }
      if (!raf) raf = requestAnimationFrame(calc);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [items]);

  // fokus: do bieżącej pozycji spisu po otwarciu, na uchwyt po zamknięciu
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      const links = panel.current?.querySelectorAll<HTMLAnchorElement>("ol a");
      (links?.[Math.max(0, active)] ?? links?.[0])?.focus();
    } else if (wasOpen.current) {
      wasOpen.current = false;
      handle.current?.focus({ preventScroll: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tylko przy zmianie `open`
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      // fokus zostaje w panelu (Tab z ostatniego elementu wraca na pierwszy)
      if (e.key === "Tab" && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>("button, a[href]");
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
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
      <button ref={handle} type="button" className={`toc-handle${away && !open ? " is-away" : ""}`} aria-label="Pokaż spis treści" aria-expanded={open} onClick={() => setOpen(true)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" /></svg>
        <span>{active >= 0 ? `${active + 1}/${items.length}` : items.length}</span>
      </button>

      {open && createPortal(
        <div className="toc-drawer-root">
          <button type="button" className="toc-backdrop" aria-label="Zamknij spis treści" onClick={() => setOpen(false)} />
          <aside
            ref={panel}
            className="toc-drawer"
            role="dialog"
            aria-modal="true"
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
