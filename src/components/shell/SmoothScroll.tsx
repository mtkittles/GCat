"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import { fullscreenTool } from "@/lib/ui/palette";

/*
  Płynne przewijanie kółkiem i gładzikiem (Lenis) — tylko komputer z myszą/gładzikiem i bez
  „ogranicz ruch” w systemie; dotyk zostaje natywny. Pomijamy elementy z własnym przewijaniem lub
  obsługą kółka: kanwy (zoom w symulatorze), edytory, szuflady, paletę, narzędzia na cały ekran.
  Gdy otwarte jest okno (szuflada Vaul, paleta) — strona pod spodem się nie przewija.
*/
const SKIP = "canvas, .cm-editor, .rys-shell, .ed-shell, .ks-panel, .vd, .vd-overlay, .pal, .pal-overlay, .term-pop, [data-lenis-prevent]";

const locked = () =>
  document.body.style.overflow === "hidden" || document.documentElement.style.overflow === "hidden" ||
  document.body.style.position === "fixed" || !!document.querySelector("[data-vaul-drawer][data-state='open'], [cmdk-dialog]");

export default function SmoothScroll() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.12,
      smoothWheel: true,
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
      anchors: { offset: -72 },
      prevent: (node) => !!node.closest(SKIP) || locked() || fullscreenTool(),
    });
    return () => lenis.destroy();
  }, []);
  return null;
}
