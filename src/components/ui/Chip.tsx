import type { ReactNode } from "react";

type Tone = "neutral" | "accent" | "success" | "warning" | "danger" | "info";

export default function Chip({ children, tone = "neutral", mono = false }: { children: ReactNode; tone?: Tone; mono?: boolean }) {
  return <span className={`chip chip-${tone} ${mono ? "chip-mono" : ""}`}>{children}</span>;
}
