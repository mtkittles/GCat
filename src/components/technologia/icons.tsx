import { Cone, Diamond, Flame, Hexagon, Route, Sigma, type LucideIcon, type LucideProps } from "lucide-react";
import type { ComponentType } from "react";

/*
  Ikony działów Technologii (pole `icon` w content/technologia/dzialy.yaml). Lucide jak w całym serwisie;
  frez trzpieniowy narysowany w tej samej siatce 24 × 24 i grubości kreski (lucide nie ma narzędzia skrawającego).
*/

/** Frez trzpieniowy: chwyt, część robocza z rowkami śrubowymi, czoło. */
export function EndMillIcon({ size = 24, strokeWidth = 2, className, ...rest }: LucideProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden {...rest}>
      <path d="M9.5 2h5v7h-5z" />
      <path d="M8.5 9h7v11a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2z" />
      <path d="M8.5 13.5 15.5 11" />
      <path d="M8.5 18 15.5 15.5" />
    </svg>
  );
}

export const DZIAL_ICON: Record<string, LucideIcon | ComponentType<LucideProps>> = {
  frez: EndMillIcon,
  plytka: Diamond,
  wzory: Sigma,
  proces: Flame,
  mocowanie: Cone,
  materialy: Hexagon,
  strategie: Route,
};

export function DzialIcon({ icon, ...p }: { icon: string } & LucideProps) {
  const I = DZIAL_ICON[icon] ?? Hexagon;
  return <I aria-hidden {...p} />;
}
