"use client";
import Image from "next/image";
import { useSyncExternalStore } from "react";

/*
  Znak marki z dostarczonych plików — nigdy przerysowywany ani przebarwiany.
  Wariant "lockup" to pełny znak pionowy (mark + sygnatura + hasło),
  wariant "mark" to sam znak, używany w poziomym układzie nagłówka
  razem ze złożoną typograficznie sygnaturą — odpowiednik wersji POZIOMEJ.
*/
const subscribe = (cb: () => void) => {
  const o = new MutationObserver(cb);
  o.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => o.disconnect();
};
const isDark = () => document.documentElement.dataset.theme === "dark";

export default function BrandLogo({
  height = 34,
  variant = "horizontal",
  forceDark,
}: { height?: number; variant?: "horizontal" | "lockup" | "mark"; forceDark?: boolean }) {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);
  const onDark = forceDark ?? dark;

  if (variant === "lockup") {
    const src = onDark ? "/brand/gcat-logo-full-dark.png" : "/brand/gcat-logo-full-light.png";
    return <Image src={src} alt="GCat — zrozum, programuj, obrabiaj" height={height} width={Math.round(height * 0.94)} className="brand-logo" style={{ height, width: "auto" }} priority />;
  }

  const src = onDark ? "/brand/gcat-mark-dark.png" : "/brand/gcat-mark-light.png";
  const mark = <Image src={src} alt="GCat" height={height} width={Math.round(height * 1.38)} className="brand-logo" style={{ height, width: "auto" }} priority />;

  if (variant === "mark") return mark;

  return (
    <span className="brand-lockup">
      {mark}
      <span className="brand-word" style={{ fontSize: height * 0.62 }}><b>G</b>Cat</span>
    </span>
  );
}
