"use client";
import Image from "next/image";
import { useSyncExternalStore } from "react";

/*
  Znak marki GCat (v3: głowa kota z frezem w oprawce, napis GCAT) — pliki z /public/brand,
  ciasno przycięte SVG. Źródło: public/brand/README.md.
  "mark"       → sam znak, bez wąsów (czytelny od 16 px)
  "horizontal" → znak + napis GCAT w poziomie (nagłówek, stopka)
  "lockup"     → alias "horizontal" (zgodność wsteczna); hasło renderuje <Tagline /> jako tekst
*/
const subscribe = (cb: () => void) => {
  const o = new MutationObserver(cb);
  o.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => o.disconnect();
};
const isDark = () => document.documentElement.dataset.theme === "dark";

const RATIO = { mark: 0.768, horizontal: 2.595 } as const;

export default function BrandLogo({
  height = 34,
  variant = "horizontal",
  forceDark,
}: { height?: number; variant?: "horizontal" | "lockup" | "mark"; forceDark?: boolean }) {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);
  const theme = (forceDark ?? dark) ? "dark" : "light";
  const kind = variant === "mark" ? "mark" : "horizontal";
  const src = kind === "mark" ? `/brand/gcat-znak-${theme}.svg` : `/brand/gcat-poziomy-${theme}.svg`;

  return (
    <Image
      src={src}
      alt="GCat"
      height={height}
      width={Math.round(height * RATIO[kind])}
      className="brand-logo"
      style={{ height, width: "auto" }}
      unoptimized
      priority
    />
  );
}
