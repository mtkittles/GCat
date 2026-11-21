/*
  Font kanwy 2D/3D = --font-mono strony (JetBrains Mono z next/font). Wartość zmiennej czytana raz
  z :root (var() w zmiennej jest już podstawiony w wartości obliczonej). Bez DOM (testy, SSR) — font systemowy.
*/
const FALLBACK = "ui-monospace, monospace";
let fam: string | null = null;

export function monoFamily(): string {
  if (fam) return fam;
  if (typeof document === "undefined") return FALLBACK;
  const v = getComputedStyle(document.documentElement).getPropertyValue("--font-mono").trim();
  fam = v ? `${v}, ${FALLBACK}` : FALLBACK;
  return fam;
}

/** `mono(11)` → "11px <JetBrains Mono>", `mono(12, 600)` → "600 12px …" */
export const mono = (px: number, weight?: number | "bold") => `${weight ? `${weight} ` : ""}${px}px ${monoFamily()}`;
