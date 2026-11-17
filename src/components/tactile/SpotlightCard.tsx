"use client";
import Link from "next/link";
import type { PointerEvent, ReactNode } from "react";

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

export default function SpotlightCard({ href, children, className, as = "div", ...rest }: {
  href?: string; children: ReactNode; className?: string; as?: "div" | "section" | "article";
} & { "aria-label"?: string; "aria-labelledby"?: string }) {
  const cls = `spot${className ? ` ${className}` : ""}`;
  if (href) return <Link href={href} className={cls} onPointerMove={track} {...rest}>{children}</Link>;
  const Tag = as;
  return <Tag className={cls} onPointerMove={track} {...rest}>{children}</Tag>;
}
