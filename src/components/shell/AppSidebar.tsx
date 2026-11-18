"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import StatusLed from "@/components/tactile/StatusLed";
import LearnMeter, { type MeterLesson } from "./LearnMeter";
import ShellKeys from "./ShellKeys";
import Tip, { TipProvider } from "./Tip";
import { NAV_MAIN, NAV_SHOP, isActive, type NavItem } from "./nav";
import { fullscreenTool, isEditing, openPalette, useModKey } from "@/lib/ui/palette";
import { toggleSidebar, useSidebarCollapsed } from "@/lib/ui/prefs";

/*
  Panel boczny (komputer, ≥ 768 px): 248 px ↔ 68 px, przycisk w nagłówku panelu i Ctrl+B.
  Szerokość to zmienna --sb-w z atrybutu <html data-sb>; po zwinięciu etykiety chowa CSS,
  a ikony dostają dymki. Na telefonie panelu nie ma — nawigację przejmuje dok (MobileDock).
*/
function Item({ n, path, collapsed }: { n: NavItem; path: string; collapsed: boolean }) {
  const on = isActive(path, n.href);
  const Icon = n.icon;
  return (
    <li>
      <Tip label={n.label} off={!collapsed}>
        <Link href={n.href} className="sb-item" aria-label={n.label} aria-current={on ? "page" : undefined}>
          <Icon aria-hidden className="sb-ico" />
          <span className="sb-txt">{n.label}</span>
          {on && <StatusLed state="on" pulse={false} className="sb-led" />}
        </Link>
      </Tip>
    </li>
  );
}

export default function AppSidebar({ lessons }: { lessons: MeterLesson[] }) {
  const path = usePathname();
  const collapsed = useSidebarCollapsed();
  const mod = useModKey();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === "b" && !isEditing(e.target) && !fullscreenTool()) {
        e.preventDefault();
        toggleSidebar();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <TipProvider>
      <aside className="sb" aria-label="Panel boczny">
        <div className="sb-head">
          <Link href="/" className="sb-brand" aria-label="GCat — pulpit">
            <span className="sb-logo-wide"><BrandLogo height={30} /></span>
            <span className="sb-logo-mark"><BrandLogo height={28} variant="mark" /></span>
          </Link>
          <Tip label={<>{collapsed ? "Rozwiń panel" : "Zwiń panel"} <kbd>{mod} B</kbd></>} side={collapsed ? "right" : "bottom"}>
            <button type="button" className="sb-toggle" onClick={toggleSidebar} aria-label={collapsed ? "Rozwiń panel boczny" : "Zwiń panel boczny"} aria-expanded={!collapsed}>
              {collapsed ? <PanelLeftOpen aria-hidden /> : <PanelLeftClose aria-hidden />}
            </button>
          </Tip>
        </div>

        <Tip label={<>Szukaj <kbd>{mod} K</kbd></>} off={!collapsed}>
          <button type="button" className="sb-search" onClick={openPalette} aria-label="Szukaj w serwisie" aria-keyshortcuts="Control+K Meta+K">
            <Search aria-hidden className="sb-ico" />
            <span className="sb-txt">Szukaj…</span>
            <kbd className="sb-kbd">{mod} K</kbd>
          </button>
        </Tip>

        <nav className="sb-nav" aria-label="Nawigacja główna">
          <p className="sb-label"><span>Główne</span></p>
          <ul>{NAV_MAIN.map((n) => <Item key={n.href} n={n} path={path} collapsed={collapsed} />)}</ul>
          <p className="sb-label"><span>Warsztat i baza</span></p>
          <ul>{NAV_SHOP.map((n) => <Item key={n.href} n={n} path={path} collapsed={collapsed} />)}</ul>
        </nav>

        <div className="sb-foot">
          <Tip label="Postęp nauki" off={!collapsed}>
            <Link href="/nauka" className="sb-meter"><LearnMeter lessons={lessons} /></Link>
          </Tip>
          <ShellKeys tipSide={collapsed ? "right" : "top"} />
        </div>
      </aside>
    </TipProvider>
  );
}
