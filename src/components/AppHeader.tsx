"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import BrandLogo from "./BrandLogo";
import SearchBox from "./SearchBox";
import ThemeToggle from "./ThemeToggle";

export const NAV = [
  { href: "/nauka", label: "Nauka" },
  { href: "/zadania", label: "Zadania" },
  { href: "/kody", label: "Kody" },
  { href: "/symulator", label: "Symulator" },
  { href: "/kalkulator", label: "Kalkulator" },
  { href: "/slownik", label: "Słownik" },
];

export default function AppHeader() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => path === href || path.startsWith(href + "/");

  const [prevPath, setPrevPath] = useState(path);
  if (prevPath !== path) { setPrevPath(path); if (open) setOpen(false); }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="site-header">
      <div className="wrap header-bar">
        <Link href="/" aria-label="GCat — strona główna" className="brand"><BrandLogo height={30} /></Link>

        <nav className="desktop-nav" aria-label="Nawigacja główna">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={active(n.href) ? "page" : undefined}>{n.label}</Link>
          ))}
        </nav>

        <div className="header-tools">
          <SearchBox />
          <ThemeToggle />
          <button className="nav-burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <><path d="M6 6l12 12" /><path d="M18 6L6 18" /></> : <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="nav-sheet" role="dialog" aria-label="Menu nawigacji">
          <div className="wrap grid gap-1 py-2">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} aria-current={active(n.href) ? "page" : undefined}>{n.label}</Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
