"use client";
import * as T from "@radix-ui/react-tooltip";
import type { ReactNode } from "react";

/* Dymek z opisem (Radix Tooltip). `off` — sam element bez dymka (np. rozwinięty panel ma już etykiety). */
export function TipProvider({ children }: { children: ReactNode }) {
  return <T.Provider delayDuration={250} skipDelayDuration={150}>{children}</T.Provider>;
}

export default function Tip({ label, side = "right", off, children }: { label: ReactNode; side?: "right" | "top" | "bottom" | "left"; off?: boolean; children: ReactNode }) {
  if (off) return <>{children}</>;
  return (
    <T.Root>
      <T.Trigger asChild>{children}</T.Trigger>
      <T.Portal>
        <T.Content side={side} sideOffset={10} className="tip">{label}</T.Content>
      </T.Portal>
    </T.Root>
  );
}
