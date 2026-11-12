"use client";

import { useEffect, useRef } from "react";

/*
  Blok zwijany, który na telefonie startuje zwinięty, a od 768 px otwarty (decyzja 10 audytu kart: źródła).
  Bez JS zostaje zwinięty — treść jest pod <summary>, więc nic nie ginie.
*/
export default function FoldMobile({ className, summary, children }: { className?: string; summary: React.ReactNode; children: React.ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    if (ref.current && window.matchMedia("(min-width: 768px)").matches) ref.current.open = true;
  }, []);
  return (
    <details ref={ref} className={className}>
      <summary>{summary}</summary>
      {children}
    </details>
  );
}
