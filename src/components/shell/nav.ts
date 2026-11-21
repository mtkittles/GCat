import { BookA, BookOpen, Box, Calculator, FileCode2, Gauge, Layers, ListChecks, SquareTerminal, Wrench, type LucideIcon } from "lucide-react";

/* Nawigacja powłoki aplikacji: panel boczny (komputer), dok i arkusz „Więcej” (telefon), paleta Ctrl+K. */
export interface NavItem { href: string; label: string; short?: string; icon: LucideIcon; kbd?: string }

export const NAV_MAIN: NavItem[] = [
  { href: "/", label: "Pulpit", icon: Gauge },
  { href: "/nauka", label: "Nauka", icon: BookOpen },
  { href: "/symulator", label: "Symulator 2D/3D", short: "Symulator", icon: Box },
  { href: "/zadania", label: "Zadania", icon: ListChecks },
];

export const NAV_SHOP: NavItem[] = [
  { href: "/kody", label: "Katalog kodów", short: "Kody", icon: SquareTerminal },
  { href: "/technologia", label: "Technologia", icon: Wrench },
  { href: "/programy", label: "Gotowe programy", short: "Programy", icon: FileCode2 },
  { href: "/kalkulator", label: "Kalkulatory", icon: Calculator },
  { href: "/slownik", label: "Słownik CNC", short: "Słownik", icon: BookA },
  { href: "/fiszki", label: "Fiszki", icon: Layers },
];

export const NAV_ALL = [...NAV_MAIN, ...NAV_SHOP];

/** Dok na telefonie: cztery działy + „Więcej”. */
export const DOCK = ["/", "/nauka", "/symulator", "/kody"].map((h) => NAV_ALL.find((n) => n.href === h)!);
/** Arkusz „Więcej”. */
export const MORE = ["/technologia", "/zadania", "/programy", "/kalkulator", "/slownik", "/fiszki"].map((h) => NAV_ALL.find((n) => n.href === h)!);

export const isActive = (path: string, href: string) => (href === "/" ? path === "/" : path === href || path.startsWith(href + "/"));

/** Nazwa działu dla paska nad treścią. */
export function sectionOf(path: string): NavItem | undefined {
  return NAV_ALL.find((n) => n.href !== "/" && isActive(path, n.href)) ?? (path === "/" ? NAV_MAIN[0] : undefined);
}
