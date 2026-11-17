"use client";
import { useEffect, useRef, useState } from "react";

/*
  Uchwyt podziału stanowiska symulatora (komputer, ≥ 1100 px): przeciąganie zmienia szerokość kolumny
  programu (zmienna --code-w na .workbench), dwuklik przywraca domyślną. Szerokość w localStorage.
  W trakcie przeciągania zmieniamy tylko styl elementu — bez renderu Reacta; kanwa dopasowuje się sama
  (ResizeObserver w Simulator.tsx).
*/
const KEY = "gcat:sim:codew";
const MIN = 280;

export default function SplitHandle() {
  const ref = useRef<HTMLDivElement>(null);
  // udział kolumny programu w % — dla czytników ekranu (aktualizowany po puszczeniu uchwytu, nie w trakcie)
  const [pct, setPct] = useState(30);
  const sync = () => {
    const wb = ref.current?.closest<HTMLElement>(".workbench");
    const code = wb?.querySelector<HTMLElement>(":scope > .m-code");
    if (wb && code && wb.clientWidth) setPct(Math.round((code.getBoundingClientRect().width / wb.clientWidth) * 100));
  };

  useEffect(() => {
    const wb = ref.current?.closest<HTMLElement>(".workbench");
    if (!wb) return;
    try { const w = Number(localStorage.getItem(KEY)); if (w >= MIN) wb.style.setProperty("--code-w", `${w}px`); } catch { /* bez zapisu */ }
    requestAnimationFrame(sync);
  }, []);

  const start = (e: React.PointerEvent<HTMLDivElement>) => {
    const wb = ref.current?.closest<HTMLElement>(".workbench");
    if (!wb) return;
    e.preventDefault();
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    const left = wb.getBoundingClientRect().left;
    const max = wb.clientWidth * 0.6;
    let w = 0;
    wb.classList.add("is-resizing");
    const move = (ev: PointerEvent) => {
      w = Math.round(Math.min(max, Math.max(MIN, ev.clientX - left)));
      wb.style.setProperty("--code-w", `${w}px`);
    };
    const end = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", end);
      el.removeEventListener("pointercancel", end);
      wb.classList.remove("is-resizing");
      if (w) try { localStorage.setItem(KEY, String(w)); } catch { /* bez zapisu */ }
      sync();
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
  };

  const reset = () => {
    const wb = ref.current?.closest<HTMLElement>(".workbench");
    wb?.style.removeProperty("--code-w");
    try { localStorage.removeItem(KEY); } catch { /* bez zapisu */ }
    requestAnimationFrame(sync);
  };

  // klawiatura: strzałki zmieniają szerokość o 24 px
  const key = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const wb = ref.current?.closest<HTMLElement>(".workbench");
    const code = wb?.querySelector<HTMLElement>(":scope > .m-code");
    if (!wb || !code) return;
    e.preventDefault(); e.stopPropagation();
    const w = Math.round(Math.min(wb.clientWidth * 0.6, Math.max(MIN, code.getBoundingClientRect().width + (e.key === "ArrowRight" ? 24 : -24))));
    wb.style.setProperty("--code-w", `${w}px`);
    try { localStorage.setItem(KEY, String(w)); } catch { /* bez zapisu */ }
    requestAnimationFrame(sync);
  };

  return (
    <div ref={ref} className="split-h" role="separator" aria-orientation="vertical" aria-valuenow={pct} aria-valuemin={20} aria-valuemax={60} aria-label="Szerokość kolumny programu (strzałki, dwuklik — domyślna)"
      tabIndex={0} onPointerDown={start} onDoubleClick={reset} onKeyDown={key} title="Przeciągnij, żeby zmienić szerokość kolumny programu. Dwuklik — domyślna." />
  );
}
