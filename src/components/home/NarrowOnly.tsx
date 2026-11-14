"use client";
import { useSyncExternalStore, type ReactNode } from "react";

/* Treść tylko poniżej 900 px szerokości. Na szerokim ekranie nie montuje dzieci wcale —
   ukrycie przez CSS zostawiłoby działającą w tle animację symulatora. */
const Q = "(max-width: 899px)";
const sub = (cb: () => void) => { const m = window.matchMedia(Q); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); };

export default function NarrowOnly({ children }: { children: ReactNode }) {
  const narrow = useSyncExternalStore(sub, () => window.matchMedia(Q).matches, () => false);
  return narrow ? <>{children}</> : null;
}
