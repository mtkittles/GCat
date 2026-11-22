"use client";
import { useEffect } from "react";
import { PROG_LINE_EVENT, type ProgLineDetail } from "@/lib/progHash";

/*
  Fragment kodu w opisie (`G01 X60.` z data-prog i data-prog-line, plugin remark: programLinks) — kliknięcie albo
  Enter/Spacja przewija do symulatora z tym programem i ustawia go na tej linii (Simulator nasłuchuje PROG_LINE_EVENT).
  Jeden nasłuch na dokument; montowany raz na stronie z treścią MDX.
*/
export default function ProgLinks() {
  useEffect(() => {
    const go = (el: HTMLElement) => {
      const hash = el.dataset.prog, line = Number(el.dataset.progLine);
      if (!hash || !Number.isFinite(line)) return;
      const fig = document.querySelector<HTMLElement>(`figure[data-prog="${CSS.escape(hash)}"]`);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      fig?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      window.dispatchEvent(new CustomEvent<ProgLineDetail>(PROG_LINE_EVENT, { detail: { hash, line } }));
    };
    const target = (e: Event) => (e.target as HTMLElement | null)?.closest?.<HTMLElement>("[data-prog-line]") ?? null;
    const onClick = (e: MouseEvent) => { const el = target(e); if (el) go(el); };
    const onKey = (e: KeyboardEvent) => { if (e.key !== "Enter" && e.key !== " ") return; const el = target(e); if (el) { e.preventDefault(); go(el); } };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("click", onClick); document.removeEventListener("keydown", onKey); };
  }, []);
  return null;
}
