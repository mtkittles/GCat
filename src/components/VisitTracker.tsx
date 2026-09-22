"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { recordVisit } from "@/lib/visits";

const SKIP = new Set(["/", "/szukaj"]);

export default function VisitTracker() {
  const path = usePathname();

  useEffect(() => {
    if (SKIP.has(path)) return;
    // Next aktualizuje <title> tuż po zmianie trasy — mały odstęp, żeby złapać właściwy tytuł.
    const id = window.setTimeout(() => {
      const title = document.title.replace(/\s*—\s*GCat\s*$/, "").trim();
      recordVisit(path, title || path);
    }, 250);
    return () => window.clearTimeout(id);
  }, [path]);

  return null;
}
