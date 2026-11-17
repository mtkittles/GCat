"use client";
import { useCallback } from "react";

/*
  Sprzężenie zwrotne przycisku membranowego: krótki klik z Web Audio API (bez plików)
  i mikro-wibracja 8 ms na telefonie. Działa tylko po włączeniu „Dźwięk pulpitu”
  (data-sound="1", zapis w localStorage — src/lib/ui/prefs.ts).
*/

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (ctx) return ctx;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  return ctx;
}

/** Klik: wysoki „trzask” styku (2,4 kHz, ~25 ms) i niski stuk membrany (150 Hz, ~45 ms). */
function click(strength = 1) {
  const a = audio();
  if (!a) return;
  if (a.state === "suspended") void a.resume();
  const t = a.currentTime;
  const out = a.createGain();
  out.gain.value = 0.05 * strength;
  out.connect(a.destination);

  const tick = a.createOscillator();
  const tg = a.createGain();
  tick.type = "square";
  tick.frequency.setValueAtTime(2400, t);
  tg.gain.setValueAtTime(0.5, t);
  tg.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
  tick.connect(tg).connect(out);
  tick.start(t); tick.stop(t + 0.03);

  const thump = a.createOscillator();
  const hg = a.createGain();
  thump.type = "sine";
  thump.frequency.setValueAtTime(150, t);
  thump.frequency.exponentialRampToValueAtTime(80, t + 0.045);
  hg.gain.setValueAtTime(0.9, t);
  hg.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
  thump.connect(hg).connect(out);
  thump.start(t); thump.stop(t + 0.05);
}

/** Zwraca funkcję wywoływaną przy przełączeniu trybu / kroku. Bez włączonego dźwięku nic nie robi. */
export function useTactileFeedback() {
  return useCallback((strength = 1) => {
    if (typeof document === "undefined" || document.documentElement.dataset.sound !== "1") return;
    try { click(strength); } catch { /* przeglądarka bez Web Audio */ }
    if (window.matchMedia("(pointer: coarse)").matches) navigator.vibrate?.(8);
  }, []);
}
