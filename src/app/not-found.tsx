import Link from "next/link";
import { NAV } from "@/lib/nav";

export const metadata = { title: "Nie znaleziono strony — GCat" };

export default function NotFound() {
  return (
    <div className="grid gap-5 max-w-prose py-10">
      <p className="hero-kicker">Błąd 404</p>
      <h1 className="text-3xl font-bold">Nie ma takiej strony</h1>
      <p className="text-muted">Adres mógł się zmienić albo zawiera literówkę. Spróbuj wyszukiwarki albo przejdź do jednego z działów.</p>
      <div className="flex flex-wrap gap-2">
        <Link href="/" className="btn">Strona główna</Link>
        <Link href="/szukaj" className="btn ghost">Szukaj</Link>
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
        {NAV.map((n) => <li key={n.href}><Link href={n.href} className="underline">{n.label}</Link></li>)}
      </ul>
    </div>
  );
}
