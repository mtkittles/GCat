"use client";
import Image from "next/image";
import { useState, useSyncExternalStore } from "react";

/*
  Znak marki ładowany z dostarczonych plików — nigdy przerysowywany.
  Wariant dobierany do jasności tła.
*/
const subscribe = (cb: () => void) => {
  const o = new MutationObserver(cb);
  o.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => o.disconnect();
};
const isDark = () => document.documentElement.dataset.theme === "dark";

export default function BrandLogo({ height = 30, forceDark }: { height?: number; forceDark?: boolean }) {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);
  const onDarkSurface = forceDark ?? dark;
  const [missing, setMissing] = useState(false);
  const src = onDarkSurface ? "/brand/gcat-logo-full-dark.png" : "/brand/gcat-logo-full-light.png";

  // Dopóki pliki znaku nie zostaną wgrane do /public/brand, pokazujemy
  // czytelną sygnaturę tekstową zamiast pustego miejsca.
  if (missing) {
    return (
      <span className="brand-fallback" style={{ fontSize: height * 0.62 }}>
        <b>G</b>Cat
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt="GCat"
      height={height}
      width={Math.round(height * 3.4)}
      priority
      unoptimized
      className="brand-logo"
      style={{ height, width: "auto" }}
      onError={() => setMissing(true)}
    />
  );
}
