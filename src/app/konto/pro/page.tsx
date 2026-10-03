import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { FEATURES, type Feature } from "@/lib/entitlements";

export const metadata: Metadata = { title: "GCat Pro — GCat", description: "Co daje plan Pro w GCat: certyfikaty, symulator 4 i 5 osi, eksporty, fiszki." };

export default function ProPage() {
  const keys = Object.keys(FEATURES) as Feature[];
  return (
    <div className="grid gap-6 max-w-3xl">
      <Breadcrumbs items={[{ href: "/", label: "GCat" }, { href: "/konto", label: "Konto" }, { label: "Pro" }]} />
      <div className="grid gap-2">
        <p className="hero-kicker">Plan Pro</p>
        <h1 className="text-3xl font-bold">Wszystko z Free i narzędzia dla zaawansowanych</h1>
        <p className="text-muted max-w-prose">Lekcje, karty, symulator i zadania zostają bezpłatne. Pro dodaje funkcje, które powstają w kolejnych sprintach — poniżej stan na dziś.</p>
      </div>
      <ul className="plan-list">
        {keys.map((k) => { const f = FEATURES[k]; return (
          <li key={k} className={`plan-item is-${f.plan}`}>
            <span className={`chip ${f.plan === "pro" ? "chip-accent" : "chip-success"}`}>{f.plan === "pro" ? "Pro" : "Free"}</span>
            <div><b>{f.label}</b><p>{f.desc}</p></div>
            {f.soon && <span className="plan-soon">wkrótce</span>}
          </li>
        ); })}
      </ul>
      <div className="note note-info">Płatności jeszcze nie działają. Plan Pro włączy się po uruchomieniu subskrypcji; do tego czasu wszystkie dostępne funkcje konta są bezpłatne.</div>
      <div><Link href="/konto" className="btn ghost">← Wróć do konta</Link></div>
    </div>
  );
}
