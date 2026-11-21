"use client";
import type { ReactNode } from "react";
import { useProAccess } from "./useProAccess";

/** Element list (kafel, wiersz) widoczny tylko dla konta redakcji i planu Pro. */
export default function ProOnly({ children }: { children: ReactNode }) {
  return useProAccess() ? <>{children}</> : null;
}
