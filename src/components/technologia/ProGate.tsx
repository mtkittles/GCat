"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { useProAccess } from "./useProAccess";

/*
  Artykuł `plan: pro`: treść dla konta redakcji i planu Pro, reszta widzi informację.
  Strona jest statyczna — to warstwa widoku; pełna blokada treści wymaga serwera (razem z płatnościami).
*/
export default function ProGate({ children }: { children: ReactNode }) {
  const ok = useProAccess();
  if (ok) return <>{children}</>;
  return (
    <section className="tech-gate" aria-labelledby="pro-h">
      <h2 id="pro-h" className="card-h">Artykuł w przygotowaniu</h2>
      <p>Ten artykuł jest jeszcze opracowywany i nie jest publicznie dostępny.</p>
      <p><Link href="/technologia">Wróć do działu Technologia</Link></p>
    </section>
  );
}
