import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import SearchBox from "@/components/SearchBox";
import "./globals.css";

export const metadata: Metadata = {
  title: "GCat — nauka G-kodu po polsku",
  description: "Interaktywna nauka G-kodu: lekcje, karty funkcji G i M, symulator 2D/3D toru narzędzia, walidator, różnice Fanuc / Sinumerik.",
  openGraph: { title: "GCat — nauka G-kodu po polsku", description: "Lekcje, karty kodów, symulator 2D/3D, walidator, kalkulator.", siteName: "GCat" },
};

const themeInit = `(function(){try{var t=localStorage.getItem('theme');if(!t){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeInit }} /></head>
      <body className="min-h-screen flex flex-col">
        <header className="site-header">
          <div className="wrap flex items-center gap-3">
            <Link href="/" className="brand py-3 flex items-center gap-2"><Logo />G<b>Cat</b></Link>
            <nav className="flex gap-4 text-[15px] overflow-x-auto min-w-0">
              <Link href="/nauka">Nauka</Link>
              <Link href="/zadania">Zadania</Link>
              <Link href="/kody">Kody</Link>
              <Link href="/symulator">Symulator</Link>
              <Link href="/kalkulator">Kalkulator</Link>
              <Link href="/slownik">Słownik</Link>
            </nav>
            <div className="ml-auto flex items-center gap-2"><SearchBox /><ThemeToggle /></div>
          </div>
        </header>
        <main className="wrap flex-1 py-6 w-full">{children}</main>
        <footer className="wrap py-6 text-sm text-muted border-t border-line mt-8">
          GCat — materiał edukacyjny. Zawsze weryfikuj program na swoim sterowniku; składnia różni się między Fanuc, Sinumerik i Heidenhain.
        </footer>
      </body>
    </html>
  );
}
