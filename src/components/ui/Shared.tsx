import { ViewTransition, type ReactNode } from "react";

/*
  Wspólny element dwóch stron (B1): ten sam `name` na liście i na stronie docelowej — przy nawigacji
  przeglądarka przenosi element z jednego miejsca w drugie (View Transitions; bez obsługi — zwykła podmiana).
  Nazwa musi być niepowtarzalna na ekranie. Bez pary po drugiej stronie element się nie animuje (default="none").
*/
export const vtName = (kind: string, id: string) => `${kind}-${id.toLowerCase().replace(/[^a-z0-9-]+/g, "-")}`;

export default function Shared({ name, children }: { name: string; children: ReactNode }) {
  return <ViewTransition name={name} share="vt-morph" default="none">{children}</ViewTransition>;
}
