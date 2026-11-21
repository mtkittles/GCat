"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import StatusLed from "@/components/tactile/StatusLed";
import AreaTree from "@/components/obszary/AreaTree";
import { OBSZAR_ICO } from "@/components/obszary/icons";
import LearnMeter, { type MeterLesson } from "./LearnMeter";
import Tip, { TipProvider } from "./Tip";
import { COMMON, HOME, isActive, type NavItem } from "./nav";
import { fullscreenTool, isEditing, useModKey } from "@/lib/ui/palette";
import { setObszar, setSidebarCollapsed, toggleSidebar, useObszar, useSidebarCollapsed } from "@/lib/ui/prefs";
import { OBSZAR, OBSZARY, obszarOf, treeOf, type ObszarKey, type TechData } from "@/lib/obszary";

/*
  Panel boczny (komputer, ≥ 768 px), V3.0b: szyna obszarów + drzewo wybranego obszaru.
  Szyna: pulpit i trzy klawisze obszarów (Programowanie CNC, Technologia, Pomiar i jakość — „wkrótce”), jak przełącznik
  trybu na pulpicie maszyny; dioda przy obszarze bieżącej strony. Drzewo: strony obszaru, a pod nim strony wspólne.
  Wybór obszaru zapamiętany (prefs: data-obszar); wejście na stronę obszaru przełącza drzewo samo.
  Zwinięty panel (68 px, Ctrl+B) to sama szyna — klawisz obszaru rozwija panel na jego drzewie, strony wspólne
  są wtedy ikonami w szynie. Na telefonie panelu nie ma — to samo drzewo jest w arkuszu „Więcej” (MobileDock).
*/
function RailLink({ n, path, collapsed, className }: { n: NavItem; path: string; collapsed: boolean; className?: string }) {
  const on = isActive(path, n.href);
  const Icon = n.icon;
  return (
    <Tip label={n.label} off={!collapsed && !className}>
      <Link href={n.href} className={`rail-key${className ? ` ${className}` : ""}`} aria-label={n.label} aria-current={on ? "page" : undefined}>
        <Icon aria-hidden className="rail-ico" />
        {on && <StatusLed state="on" pulse={false} className="rail-led" />}
      </Link>
    </Tip>
  );
}

export default function AppSidebar({ lessons, tech }: { lessons: MeterLesson[]; tech: TechData }) {
  const path = usePathname();
  const collapsed = useSidebarCollapsed();
  const mod = useModKey();
  const obszar = useObszar();
  const here = obszarOf(path);

  // strona obszaru przełącza drzewo (wybór zostaje po przejściu na stronę wspólną)
  useEffect(() => { if (here) setObszar(here); }, [here]);

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

  const def = OBSZAR[obszar];
  const nodes = useMemo(() => treeOf(obszar, tech), [obszar, tech]);
  const pick = (k: ObszarKey) => { setObszar(k); if (collapsed) setSidebarCollapsed(false); };

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

        <div className="sb-body">
          <nav className="rail" aria-label="Obszary nauki">
            <RailLink n={HOME} path={path} collapsed />
            <span className="rail-sep" aria-hidden />
            <div className="rail-keys" role="group" aria-label="Wybór obszaru">
              {OBSZARY.map((k) => {
                const o = OBSZAR[k];
                const Icon = OBSZAR_ICO[k];
                return (
                  <Tip key={k} label={<>{o.title}{o.soon ? " — wkrótce" : ""}</>}>
                    <button type="button" className={`rail-key rail-area${o.soon ? " is-soon" : ""}`} data-k={k}
                      aria-pressed={obszar === k} aria-label={`${o.title}${o.soon ? " (wkrótce)" : ""}`} onClick={() => pick(k)}>
                      <Icon className="rail-ico" />
                      {here === k && <StatusLed state="on" pulse={false} className="rail-led" />}
                    </button>
                  </Tip>
                );
              })}
            </div>
            <span className="rail-sep rail-only-c" aria-hidden />
            {COMMON.map((n) => <RailLink key={n.href} n={n} path={path} collapsed className="rail-only-c" />)}
          </nav>

          <nav className="sb-tree" aria-label={def.title}>
            <div className="sb-area">
              <span className="nplate"><b>{def.nr}</b><span>{def.soon ? "wkrótce" : "obszar"}</span></span>
              {def.href
                ? <Link href={def.href} className="sb-area-t">{def.title}</Link>
                : <span className="sb-area-t">{def.title}</span>}
              {def.soon && <span className="sb-area-lead">Plan działu w przygotowaniu.</span>}
            </div>
            <AreaTree key={obszar} nodes={nodes} path={path} label={def.title} />
            <p className="sb-label"><span>Wspólne</span></p>
            <ul className="at">
              {COMMON.map((n) => {
                const on = isActive(path, n.href);
                const Icon = n.icon;
                return (
                  <li key={n.href} className="at-li">
                    <Link href={n.href} className="at-item" aria-current={on ? "page" : undefined}>
                      <Icon aria-hidden className="at-ico" />
                      <span className="at-txt">{n.label}</span>
                      {on && <StatusLed state="on" pulse={false} className="at-led" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="sb-foot">
          <Tip label="Postęp nauki" off={!collapsed}>
            <Link href="/nauka" className="sb-meter"><LearnMeter lessons={lessons} /></Link>
          </Tip>
        </div>
      </aside>
    </TipProvider>
  );
}
