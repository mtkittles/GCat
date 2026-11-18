"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { flushSync } from "react-dom";
import { Search } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { sectionOf } from "./nav";
import { setPaletteOpen, useModKey } from "@/lib/ui/palette";
import ShellKeys from "./ShellKeys";

/*
  Pasek nad treścią. Komputer: nazwa działu, pole szukania (Ctrl+K — jedyne w powłoce) i klawisze
  motyw / dźwięk / konto. Telefon: logo, przycisk szukania; motyw i konto są w „Więcej” w doku.
  #topbar-slot — przycisk kontekstowy strony (spis lekcji / karty, src/lib/ui/topbarSlot.ts).
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
        <div id="topbar-slot" className="topbar-slot" />
        <button type="button" className="topbar-search" onClick={open} aria-label="Szukaj w serwisie" aria-keyshortcuts="Control+K Meta+K">
          <Search aria-hidden />
          <span className="topbar-search-t">Szukaj kodu, lekcji, hasła…</span>
          <kbd>{mod} K</kbd>
        </button>
        <div className="topbar-keys"><ShellKeys tipSide="bottom" /></div>
      </div>
    </header>
  );
}
