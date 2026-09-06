import Link from "next/link";

export default function Breadcrumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav className="breadcrumbs" aria-label="Ścieżka nawigacji">
      {items.map((it, i) => (
        <span key={it.label}>
          {i > 0 && <span className="sep" aria-hidden>/</span>}
          {it.href ? <Link href={it.href}>{it.label}</Link> : <span aria-current="page">{it.label}</span>}
        </span>
      ))}
    </nav>
  );
}
