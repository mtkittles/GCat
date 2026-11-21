import Link from "next/link";
import { NAV } from "@/lib/nav";
import PageHead from "@/components/ui/PageHead";

export const metadata = { title: "Nie znaleziono strony — GCat" };

export default function NotFound() {
  return (
    <div className="grid gap-5 max-w-prose py-10">
      <PageHead title="Nie ma takiej strony" count="błąd 404" lead="Adres mógł się zmienić albo zawiera literówkę. Spróbuj wyszukiwarki albo przejdź do jednego z działów." />
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
