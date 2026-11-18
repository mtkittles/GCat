"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { flushSync } from "react-dom";
import { Search } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { sectionOf } from "./nav";
import { setPaletteOpen, useModKey } from "@/lib/ui/palette";

/*
  Pasek nad treścią. Komputer: nazwa działu i pole szukania (Ctrl+K) wewnątrz zagłębionego obszaru.
  Telefon: logo i przycisk szukania — nawigacja jest w doku na dole.
  Klasa site-header zostaje (wydruk, panel treści i symulator ukrywają go po niej).
*/
export default function AppTopbar() {
  const path = usePathname();
  const mod = useModKey();
  const sec = sectionOf(path);
  const Icon = sec?.icon;
  // flushSync: paleta montuje się w tym samym geście dotknięcia — iOS pokaże klawiaturę po focus()
  const open = () => {
    flushSync(() => setPaletteOpen(true));
    document.querySelector<HTMLInputElement>("[cmdk-input]")?.focus();
  };

  return (
    <header className="site-header topbar">
      <div className="wrap topbar-in">
        <Link href="/" className="topbar-brand" aria-label="GCat — pulpit"><BrandLogo height={34} /></Link>
        <div className="topbar-sec">
          {Icon && <Icon aria-hidden />}
          <span>{sec?.label ?? "GCat"}</span>
        </div>
        <button type="button" className="topbar-search" onClick={open} aria-label="Szukaj w serwisie" aria-keyshortcuts="Control+K Meta+K">
          <Search aria-hidden />
          <span className="topbar-search-t">Szukaj kodu, lekcji, hasła…</span>
          <kbd>{mod} K</kbd>
        </button>
      </div>
    </header>
  );
}
