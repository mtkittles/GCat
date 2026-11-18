"use client";
import NumberFlow from "@number-flow/react";

/*
  Wyświetlacz DRO w tabelce podglądu: dokładność 0,001, cyfry stałej szerokości.
  W trakcie odtwarzania (live) wartość zmienia się w każdej klatce — wtedy zwykły tekst (bez pracy
  komponentu animacji co klatkę); animowane cyfry przy kroku, przewijaniu, resecie i po zatrzymaniu.
*/
const FMT = { minimumFractionDigits: 3, maximumFractionDigits: 3, useGrouping: false } as const;
const fmt3 = (v: number) => (Math.abs(v) < 5e-4 ? 0 : v).toFixed(3);

export default function SimDro({ v, live }: { v: number; live: boolean }) {
  if (live) return <span className="dro-n">{fmt3(v)}</span>;
  return <NumberFlow className="dro-n" value={Math.abs(v) < 5e-4 ? 0 : v} format={FMT} locales="en-US" />;
}
