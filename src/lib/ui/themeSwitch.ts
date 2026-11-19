"use client";
import { setTheme, type Theme } from "./prefs";

/*
  Zmiana motywu z kołem rozchodzącym się od przycisku (View Transitions API, bez biblioteki).
  Bez obsługi API, przy „ogranicz ruch” i w silniku WebKit (Safari, każda przeglądarka na iPhonie) —
  zwykła, natychmiastowa zmiana. Na iPhonie motyw po przejściu wracał do poprzedniego (zgłoszenie
  2026-11-19), a WebKit ma znane błędy przejść z animacją pseudo-elementu i otwartym arkuszem.
*/
type VT = { ready: Promise<void>; finished: Promise<void> };
type DocVT = Document & { startViewTransition?: (cb: () => void) => VT };

/** Safari i przeglądarki na iOS (wszystkie na WebKit) zgłaszają dostawcę Apple. */
export const isWebKit = () => typeof navigator !== "undefined" && navigator.vendor.startsWith("Apple");

export function switchTheme(next: Theme, from?: HTMLElement | null) {
  const d = document as DocVT;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!d.startViewTransition || reduce || isWebKit()) { setTheme(next); return; }
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

let lastToggle = -Infinity;

/**
 * Przełącza motyw na przeciwny. Bieżący motyw czyta z <html> (nie ze stanu Reacta, który przy
 * przejściu jest o klatkę spóźniony), a drugie wywołanie w ciągu 400 ms pomija — jedno stuknięcie
 * nie może przełączyć motywu tam i z powrotem.
 */
export function toggleTheme(from?: HTMLElement | null) {
  const now = performance.now();
  if (now - lastToggle < 400) return;
  lastToggle = now;
  const cur: Theme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
  switchTheme(cur === "dark" ? "light" : "dark", from);
}
