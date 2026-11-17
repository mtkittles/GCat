"use client";
import { useSyncExternalStore } from "react";

/*
  Ustawienia interfejsu trzymane na <html> (data-*) i w localStorage:
  - data-sb: "e" panel boczny rozwinięty / "c" zwinięty (skrót Ctrl+B),
  - data-sound: "1" dźwięk pulpitu włączony (domyślnie wyłączony).
  Atrybuty ustawia skrypt w <head> przed malowaniem (layout.tsx), więc szerokość panelu
  nie skacze przy wczytaniu. React czyta je przez MutationObserver — bez stanu w komponentach.
*/

const observe = (attr: string) => (cb: () => void) => {
  const o = new MutationObserver(cb);
  o.observe(document.documentElement, { attributes: true, attributeFilter: [attr] });
  return () => o.disconnect();
};

const subSb = observe("data-sb");
const subSound = observe("data-sound");
const subTheme = observe("data-theme");

function save(key: string, v: string) { try { localStorage.setItem(key, v); } catch { /* tryb prywatny */ } }

export function useSidebarCollapsed(): boolean {
  return useSyncExternalStore(subSb, () => document.documentElement.dataset.sb === "c", () => false);
}
export function setSidebarCollapsed(c: boolean) {
  document.documentElement.dataset.sb = c ? "c" : "e";
  save("gcat:sb", c ? "c" : "e");
}
export function toggleSidebar() { setSidebarCollapsed(document.documentElement.dataset.sb !== "c"); }

export function useSoundOn(): boolean {
  return useSyncExternalStore(subSound, () => document.documentElement.dataset.sound === "1", () => false);
}
export function setSoundOn(on: boolean) {
  document.documentElement.dataset.sound = on ? "1" : "0";
  save("gcat:sound", on ? "1" : "0");
}

export type Theme = "dark" | "light";
export function useTheme(): Theme {
  return useSyncExternalStore(subTheme, () => (document.documentElement.dataset.theme === "light" ? "light" : "dark"), () => "dark");
}
export function setTheme(t: Theme) {
  document.documentElement.dataset.theme = t;
  save("theme", t);
}

/** Skrypt w <head>: motyw, panel boczny (domyślnie zwinięty poniżej 1440 px) i dźwięk — przed pierwszym malowaniem. */
export const PREFS_SCRIPT = `try{var d=document.documentElement,s=localStorage,t=s.getItem("theme");if(t==="light"||t==="dark")d.dataset.theme=t;var b=s.getItem("gcat:sb");d.dataset.sb=b==="c"||b==="e"?b:(innerWidth<1440?"c":"e");d.dataset.sound=s.getItem("gcat:sound")==="1"?"1":"0"}catch(e){}`;
