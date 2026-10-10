/** Preferencje ruchu dla animacji symulatora (audyt Nauki #29, etap 3). */

export const reduceMotion = () =>
  typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Czy animacja może ruszyć sama: nigdy przy „ogranicz ruch”; dla „wide” nie na wąskim ekranie
    (telefon pokazuje pierwszy kadr i przycisk startu). */
export function autoStartOk(mode: boolean | "wide") {
  if (!mode || typeof window === "undefined" || reduceMotion()) return false;
  return mode !== "wide" || !window.matchMedia?.("(max-width: 699px)").matches;
}
