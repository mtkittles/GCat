"use client";
import { useState } from "react";

/*
  Dolny arkusz (Vaul) z dwoma punktami zatrzymania: połowa ekranu i pełny ekran.
  Otwiera się w połowie — widać nagłówek i początek treści, a lista pod spodem zostaje w tle;
  przeciągnięcie w górę rozwija do pełnej wysokości (wtedy treść przewija się w środku), w dół — zamyka.
*/
export const SHEET_SNAPS: (number | string)[] = [0.55, 1];

export function useSheetSnap(open: boolean) {
  const [snap, setSnap] = useState<number | string | null>(SHEET_SNAPS[0]);
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) { setPrevOpen(open); if (open) setSnap(SHEET_SNAPS[0]); }
  return { snap, setSnap, full: snap === 1 };
}

type Snap = ReturnType<typeof useSheetSnap>;
type SnapProps =
  | { snapPoints: (number | string)[]; activeSnapPoint: number | string | null; setActiveSnapPoint: (s: number | string | null) => void; fadeFromIndex: number }
  | { snapPoints?: undefined };
/** Właściwości Drawer.Root: na telefonie (arkusz od dołu) punkty zatrzymania, na komputerze (panel z boku) — bez. */
export function snapProps(bottom: boolean, s: Snap): SnapProps {
  return bottom ? { snapPoints: SHEET_SNAPS, activeSnapPoint: s.snap, setActiveSnapPoint: s.setSnap, fadeFromIndex: 0 } : {};
}
