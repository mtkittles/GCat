import type { SVGProps } from "react";
import { DZIAL_ICO, IcoCube } from "@/components/obszary/icons";

/*
  Ikony działów Technologii (pole `icon` w content/technologia/dzialy.yaml). Od V3.0b — wspólne z panelem bocznym
  i kartami: dwubarwne, siatka 24 × 24 jak lucide (src/components/obszary/icons.tsx).
*/
export function DzialIcon({ icon, ...p }: { icon: string; size?: number } & SVGProps<SVGSVGElement>) {
  const I = DZIAL_ICO[icon] ?? IcoCube;
  return <I {...p} />;
}
