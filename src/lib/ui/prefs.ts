"use client";
import { useSyncExternalStore } from "react";

/*
  Ustawienia interfejsu trzymane na <html> (data-*) i w localStorage:
  - data-sb: "e" panel boczny rozwinięty / "c" zwinięty (skrót Ctrl+B),
  - data-sound: "1" dźwięk pulpitu włączony (domyślnie wyłączony),
  - data-haptic: "0" wibracje przycisków wyłączone (domyślnie włączone; działają tylko na ekranie dotykowym).
  Atrybuty ustawia skrypt przed malowaniem (layout.tsx), więc szerokość panelu
  nie skacze przy wczytaniu. React czyta je przez MutationObserver — bez stanu w komponentach.
  Wybrane wartości trzyma też window.__gcatPrefs, a skrypt pilnuje ich na <html>: gdy React
  odbuduje <html> (po błędzie hydratacji usuwa wszystkie atrybuty i wstawia data-theme="dark"
  z layoutu), ustawienia wracają od razu, bez czekania na zapis w localStorage.
*/

type PrefKey = "theme" | "sb" | "sound" | "haptic";
declare global { interface Window { __gcatPrefs?: Partial<Record<PrefKey, string>> } }

/** Ustawia atrybut na <html> i zapamiętuje wybór dla strażnika ze skryptu PREFS_SCRIPT. */
function put(key: PrefKey, v: string) {
  (window.__gcatPrefs ??= {})[key] = v;
  document.documentElement.dataset[key] = v;
}

const observe = (attr: string) => (cb: () => void) => {
  const o = new MutationObserver(cb);
  o.observe(document.documentElement, { attributes: true, attributeFilter: [attr] });
  return () => o.disconnect();
};

const subSb = observe("data-sb");
const subSound = observe("data-sound");
const subTheme = observe("data-theme");
const subHaptic = observe("data-haptic");

function save(key: string, v: string) { try { localStorage.setItem(key, v); } catch { /* tryb prywatny */ } }

export function useSidebarCollapsed(): boolean {
  return useSyncExternalStore(subSb, () => document.documentElement.dataset.sb === "c", () => false);
}
export function setSidebarCollapsed(c: boolean) {
  put("sb", c ? "c" : "e");
  save("gcat:sb", c ? "c" : "e");
}
export function toggleSidebar() { setSidebarCollapsed(document.documentElement.dataset.sb !== "c"); }

export function useSoundOn(): boolean {
  return useSyncExternalStore(subSound, () => document.documentElement.dataset.sound === "1", () => false);
}
export function setSoundOn(on: boolean) {
  put("sound", on ? "1" : "0");
  save("gcat:sound", on ? "1" : "0");
}

export function useHapticOn(): boolean {
  return useSyncExternalStore(subHaptic, () => document.documentElement.dataset.haptic !== "0", () => true);
}
export function setHapticOn(on: boolean) {
  put("haptic", on ? "1" : "0");
  save("gcat:haptic", on ? "1" : "0");
}

export type Theme = "dark" | "light";
export function useTheme(): Theme {
  return useSyncExternalStore(subTheme, () => (document.documentElement.dataset.theme === "light" ? "light" : "dark"), () => "dark");
}
export function setTheme(t: Theme) {
  put("theme", t);
  save("theme", t);
}

/** Kolor paska przeglądarki / ekranu startowego (meta theme-color) — jak tło motywu. */
export const THEME_COLOR = { dark: "#111214", light: "#FAFAF9" } as const;

/**
 * Skrypt na początku <body>: motyw, panel boczny (domyślnie zwinięty poniżej 1440 px), dźwięk i wibracje —
 * przed pierwszym malowaniem. Zostaje jako strażnik: MutationObserver przywraca wybrane wartości, gdy ktoś
 * inny zmieni lub usunie atrybut, i ustawia meta theme-color według motywu strony (nie systemu).
 */
export const PREFS_SCRIPT = [
  'try{var d=document.documentElement,g=function(k){try{return localStorage.getItem(k)}catch(e){return null}},',
  't=g("theme"),b=g("gcat:sb"),',
  'p=window.__gcatPrefs={theme:t==="light"?"light":"dark",sb:b==="c"||b==="e"?b:(innerWidth<1440?"c":"e"),',
  'sound:g("gcat:sound")==="1"?"1":"0",haptic:g("gcat:haptic")==="0"?"0":"1"},',
  'tc=function(q){var m=document.querySelector(\'meta[name="theme-color"]\');',
  'if(!m){m=document.createElement("meta");m.setAttribute("name","theme-color");document.head.appendChild(m)}',
  `var c=q.theme==="light"?"${THEME_COLOR.light}":"${THEME_COLOR.dark}";if(m.getAttribute("content")!==c)m.setAttribute("content",c)},`,
  'ap=function(){var q=window.__gcatPrefs||p;for(var k in q)if(q[k]&&d.dataset[k]!==q[k])d.dataset[k]=q[k];tc(q)};',
  'ap();new MutationObserver(ap).observe(d,{attributes:true,attributeFilter:["data-theme","data-sb","data-sound","data-haptic"]})}catch(e){}',
].join("");

/** Zapytanie media (np. "(min-width: 768px)"); na serwerze i przy hydratacji — `fallback`. */
export function useMedia(query: string, fallback = false): boolean {
  return useSyncExternalStore(
    (cb) => { const m = window.matchMedia(query); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); },
    () => window.matchMedia(query).matches,
    () => fallback,
  );
}
