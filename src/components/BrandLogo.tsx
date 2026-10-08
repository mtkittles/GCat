"use client";
import Image from "next/image";
import { useSyncExternalStore } from "react";

/*
  Znak marki GCat (v3) — pliki z /public/brand, ciasno przycięte SVG. Opis: public/brand/README.md.
  "mark"       → sam znak z wąsami
  "horizontal" → znak + GCAT (nagłówek)
  "lockup"     → znak + GCAT + linia + hasło (strona główna, stopka)
*/
const subscribe = (cb: () => void) => {
  const o = new MutationObserver(cb);
  o.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => o.disconnect();
};
const isDark = () => document.documentElement.dataset.theme === "dark";

const RATIO = { mark: 1.062, horizontal: 2.809, lockup: 2.610 } as const;

export default function BrandLogo({
  height = 34,
  variant = "horizontal",
  forceDark,
}: { height?: number; variant?: "horizontal" | "lockup" | "mark"; forceDark?: boolean }) {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);
  const theme = (forceDark ?? dark) ? "dark" : "light";
  const kind = variant;
  const file = { mark: "gcat-znak", horizontal: "gcat-poziomy", lockup: "gcat-poziomy-pelny" }[kind];
  const src = `/brand/${file}-${theme}.svg`;

  return (
    <Image
      src={src}
      alt={kind === "lockup" ? "GCat — ucz się, programuj, skrawaj" : "GCat"}
      height={height}
      width={Math.round(height * RATIO[kind])}
      className="brand-logo"
      style={{ height, width: "auto" }}
      unoptimized
      priority
    />
  );
}
