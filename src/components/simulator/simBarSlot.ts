"use client";
import { useSyncExternalStore } from "react";

/* Miejsce w pasku strony /symulator (SimPage), do którego Symulator wstawia widok, warstwy i menu „Plik” (V5). */
const noop = () => () => {};
export function useSimBarSlot(): HTMLElement | null {
  return useSyncExternalStore(noop, () => document.getElementById("sim-bar-view"), () => null);
}
