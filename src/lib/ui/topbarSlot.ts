"use client";
import { useSyncExternalStore } from "react";

/*
  Miejsce w górnym pasku (AppTopbar, #topbar-slot) na przycisk kontekstowy strony — np. spis lekcji
  albo spis karty na telefonie i tablecie. Strona wstawia go portalem; na serwerze i przy hydratacji — null,
  więc przycisk pojawia się dopiero po stronie klienta (bez rozjazdu hydratacji). Element paska jest
  w układzie (layout), więc nie znika między stronami — subskrypcja niepotrzebna.
*/
const noop = () => () => {};
export function useTopbarSlot(): HTMLElement | null {
  return useSyncExternalStore(noop, () => document.getElementById("topbar-slot"), () => null);
}
