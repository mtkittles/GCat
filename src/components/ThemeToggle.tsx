"use client";
import { useSyncExternalStore } from "react";

const subscribe = (cb: () => void) => { const o = new MutationObserver(cb); o.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] }); return () => o.disconnect(); };
const get = () => document.documentElement.dataset.theme === "dark";

export default function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, get, () => false);
  const toggle = () => {
    const next = dark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch {}
  };
  return (
    <button onClick={toggle} className="theme-toggle" aria-label={dark ? "Włącz jasny motyw" : "Włącz ciemny motyw"} title={dark ? "Jasny motyw" : "Ciemny motyw"}>
      <span>{dark ? "☾" : "☀"}</span>
    </button>
  );
}
