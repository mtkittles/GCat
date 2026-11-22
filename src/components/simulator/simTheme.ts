"use client";
/*
  Motyw podglądów symulatora (UI-9). W ciemnym motywie kanwa 2D i scena 3D są ciemne jak dotąd; w jasnym —
  „papier techniczny” (ciepła kremowa kartka z siatką), a linie, opisy i kolory ruchu przechodzą na ciemniejsze
  odcienie, żeby nie zlewały się z tłem (kontrast linii ≥ 3:1 do papieru).
  Motyw strony to atrybut data-theme na <html> (lib/ui/prefs.ts); kanwy czytają go w chwili rysowania.
*/
import { useEffect, useState } from "react";

/** Papier techniczny jasnego motywu — ta sama wartość co --paper w globals.css. */
export const PAPER = "#F4EFE4";

export function isLight(): boolean {
  return typeof document !== "undefined" && document.documentElement.dataset.theme === "light";
}

/** Bieżący motyw jako stan Reacta — zmiana motywu przerysowuje kanwy (2D) albo przebudowuje scenę (3D). */
export function useLightTheme(): boolean {
  const [light, setLight] = useState(false);
  useEffect(() => {
    const read = () => setLight(isLight());
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);
  return light;
}

/**
 * Kolor opisu albo linii na papierze: jasne odcienie z ciemnej sceny (pastelowe osie, żółty pomiar)
 * zamienione na ciemniejsze tej samej barwy. W ciemnym motywie bez zmian.
 */
const ON_PAPER: Record<string, string> = {
  "#F59E0B": "#B45309", "#22C55E": "#15803D", "#38BDF8": "#0369A1", "#F97316": "#C2410C",
  "#EF4444": "#B91C1C", "#FCA5A5": "#B91C1C", "#86EFAC": "#15803D", "#7DD3FC": "#0369A1",
  "#FBBF24": "#A16207", "#FACC15": "#A16207", "#A78BFA": "#6D28D9", "#F9A8D4": "#BE185D",
  "#67E8F9": "#0E7490", "#5AA9F0": "#1D4ED8", "#94A3B8": "#57534E",
};
export function ink(hex: string, light = isLight()): string {
  return light ? ON_PAPER[hex.toUpperCase()] ?? hex : hex;
}
