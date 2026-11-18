"use client";
import { useEffect, useRef, useState } from "react";

/*
  Uchwyt podziału stanowiska symulatora (komputer, ≥ 1100 px): przeciąganie zmienia szerokość kolumny
  programu (zmienna --code-w na .workbench), dwuklik przywraca domyślną. Szerokość w localStorage.
  W trakcie przeciągania zmieniamy tylko styl elementu — bez renderu Reacta; kanwa dopasowuje się sama
  (ResizeObserver w Simulator.tsx).
*/
/** Domyślnie: stanowisko symulatora (kolumna programu w .workbench). Strona zadania podaje własne. */
export default function SplitHandle({ scope = ".workbench", first = ":scope > .m-code", cssVar = "--code-w", storageKey = "gcat:sim:codew", min = 280, maxFrac = 0.6, label = "Szerokość kolumny programu" }: {
  scope?: string; first?: string; cssVar?: string; storageKey?: string; min?: number; maxFrac?: number; label?: string;
}) {
  const KEY = storageKey, MIN = min;
  const ref = useRef<HTMLDivElement>(null);
  // udział kolumny programu w % — dla czytników ekranu (aktualizowany po puszczeniu uchwytu, nie w trakcie)
  const [pct, setPct] = useState(30);
  const sync = () => {
    const wb = ref.current?.closest<HTMLElement>(scope);
    const code = wb?.querySelector<HTMLElement>(first);
    if (wb && code && wb.clientWidth) setPct(Math.round((code.getBoundingClientRect().width / wb.clientWidth) * 100));
  };

  useEffect(() => {
    const wb = ref.current?.closest<HTMLElement>(scope);
    if (!wb) return;
    try { const w = Number(localStorage.getItem(KEY)); if (w >= MIN) wb.style.setProperty(cssVar, `${w}px`); } catch { /* bez zapisu */ }
    requestAnimationFrame(sync);
    // tylko przy montowaniu: ustawienia uchwytu są stałe dla danego miejsca na stronie
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = (e: React.PointerEvent<HTMLDivElement>) => {
    const wb = ref.current?.closest<HTMLElement>(scope);
    if (!wb) return;
    e.preventDefault();
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    const left = wb.getBoundingClientRect().left;
    const max = wb.clientWidth * maxFrac;
    let w = 0;
    wb.classList.add("is-resizing");
    const move = (ev: PointerEvent) => {
      w = Math.round(Math.min(max, Math.max(MIN, ev.clientX - left)));
      wb.style.setProperty(cssVar, `${w}px`);
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
    const wb = ref.current?.closest<HTMLElement>(scope);
    wb?.style.removeProperty(cssVar);
    try { localStorage.removeItem(KEY); } catch { /* bez zapisu */ }
    requestAnimationFrame(sync);
  };

  // klawiatura: strzałki zmieniają szerokość o 24 px
  const key = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const wb = ref.current?.closest<HTMLElement>(scope);
    const code = wb?.querySelector<HTMLElement>(first);
    if (!wb || !code) return;
    e.preventDefault(); e.stopPropagation();
    const w = Math.round(Math.min(wb.clientWidth * maxFrac, Math.max(MIN, code.getBoundingClientRect().width + (e.key === "ArrowRight" ? 24 : -24))));
    wb.style.setProperty(cssVar, `${w}px`);
    try { localStorage.setItem(KEY, String(w)); } catch { /* bez zapisu */ }
    requestAnimationFrame(sync);
  };

  return (
    <div ref={ref} className="split-h" role="separator" aria-orientation="vertical" aria-valuenow={pct} aria-valuemin={20} aria-valuemax={Math.round(maxFrac * 100)} aria-label={`${label} (strzałki, dwuklik — domyślna)`}
      tabIndex={0} onPointerDown={start} onDoubleClick={reset} onKeyDown={key} title={`${label}: przeciągnij, strzałki; dwuklik — domyślna.`} />
  );
}
