"use client";
import Link from "next/link";
import type { MouseEvent, PointerEvent, ReactNode } from "react";

/*
  Karta z obramowaniem 1 px, rozjaśnioną górną krawędzią i delikatnym światłem pod kursorem.
  Światło tylko przy myszce (hover + pointer: fine) — pozycja idzie do zmiennych CSS, bez stanu Reacta.
*/
function track(e: PointerEvent<HTMLElement>) {
  if (e.pointerType !== "mouse") return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${e.clientX - r.left}px`);
  el.style.setProperty("--my", `${e.clientY - r.top}px`);
}

export default function SpotlightCard({ href, children, className, as = "div", onClick, ...rest }: {
  href?: string; children: ReactNode; className?: string; as?: "div" | "section" | "article";
  /** tylko z `href`: np. otwarcie panelu zamiast przejścia (zwykłe kliknięcie bez klawiszy) */
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
} & { "aria-label"?: string; "aria-labelledby"?: string; "aria-haspopup"?: "dialog" }) {
  const cls = `spot${className ? ` ${className}` : ""}`;
  if (href) return <Link href={href} className={cls} onPointerMove={track} onClick={onClick} {...rest}>{children}</Link>;
  const Tag = as;
  return <Tag className={cls} onPointerMove={track} {...rest}>{children}</Tag>;
}
