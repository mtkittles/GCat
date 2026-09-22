"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const TABS = [
  { href: "/", label: "Start", icon: "home" },
  { href: "/nauka", label: "Nauka", icon: "book" },
  { href: "/symulator", label: "Symulator", icon: "cube" },
  { href: "/kalkulator", label: "Kalkulatory", icon: "calc" },
] as const;

const MORE = [
  { href: "/zadania", label: "Zadania" },
  { href: "/kody", label: "Kody" },
  { href: "/slownik", label: "Słownik" },
  { href: "/szukaj", label: "Szukaj" },
];

function Icon({ name }: { name: string }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5 10v10h14V10" />
        </svg>
      );
    case "book":
      return (
        <svg {...common}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
    case "cube":
      return (
        <svg {...common}>
          <path d="M12 2 3 7l9 5 9-5-9-5Z" />
          <path d="M3 7v10l9 5 9-5V7" />
          <path d="M12 12v10" />
        </svg>
      );
    case "calc":
      return (
        <svg {...common}>
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <path d="M8 6h8" />
          <path d="M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h.01M16 19h.01" />
        </svg>
      );
    case "more":
      return (
        <svg {...common}>
          <circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
          <circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none" />
        </svg>
      );
    default:
      return null;
  }
}

export default function BottomNav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  const active = (href: string) => (href === "/" ? path === "/" : path === href || path.startsWith(href + "/"));
  const moreActive = MORE.some((m) => active(m.href));

  const [prevPath, setPrevPath] = useState(path);
  if (prevPath !== path) { setPrevPath(path); if (open) setOpen(false); }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {open && <button className="bottom-nav-backdrop" aria-label="Zamknij menu" onClick={() => setOpen(false)} />}
      {open && (
        <div className="bottom-nav-sheet" role="dialog" aria-label="Więcej">
          {MORE.map((m) => (
            <Link key={m.href} href={m.href} aria-current={active(m.href) ? "page" : undefined}>{m.label}</Link>
          ))}
        </div>
      )}
      <nav className="bottom-nav" aria-label="Nawigacja mobilna">
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} aria-current={active(t.href) ? "page" : undefined}>
            <Icon name={t.icon} />
            <span>{t.label}</span>
          </Link>
        ))}
        <button type="button" className={moreActive ? "is-active" : undefined} aria-expanded={open} aria-label="Więcej" onClick={() => setOpen((v) => !v)}>
          <Icon name="more" />
          <span>Więcej</span>
        </button>
      </nav>
    </>
  );
}
