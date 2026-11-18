"use client";
import { setTheme, type Theme } from "./prefs";

/*
  Zmiana motywu z kołem rozchodzącym się od przycisku (View Transitions API, bez biblioteki).
  Bez obsługi API albo przy „ogranicz ruch” — zwykła, natychmiastowa zmiana.
*/
type VT = { ready: Promise<void>; finished: Promise<void> };
type DocVT = Document & { startViewTransition?: (cb: () => void) => VT };

export function switchTheme(next: Theme, from?: HTMLElement | null) {
  const d = document as DocVT;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!d.startViewTransition || reduce) { setTheme(next); return; }
  const r = from?.getBoundingClientRect();
  const x = r ? r.left + r.width / 2 : window.innerWidth / 2, y = r ? r.top + r.height / 2 : 0;
  const end = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  const root = document.documentElement;
  root.classList.add("vt-theme");
  const t = d.startViewTransition(() => setTheme(next));
  t.ready.then(() => {
    root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
      { duration: 480, easing: "cubic-bezier(.23, 1, .32, 1)", pseudoElement: "::view-transition-new(root)" },
    );
  }).catch(() => {});
  t.finished.finally(() => root.classList.remove("vt-theme"));
}
