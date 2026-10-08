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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {dark
          ? <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
          : <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>}
      </svg>
    </button>
  );
}
