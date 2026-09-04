import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kod G po polsku — nauka programowania CNC",
  description: "Interaktywna nauka G-kodu: karty funkcji G i M, symulator toru narzędzia, różnice Fanuc / Sinumerik.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className="min-h-screen flex flex-col">
        <header className="site-header">
          <div className="wrap flex items-center gap-6">
            <Link href="/" className="brand py-3">Kod<b>G</b>.pl</Link>
            <nav className="flex gap-5 text-[15px]">
              <Link href="/nauka">Nauka</Link>
              <Link href="/kody">Kody</Link>
              <Link href="/symulator">Symulator</Link>
              <Link href="/kalkulator">Kalkulator</Link>
            </nav>
          </div>
        </header>
        <main className="wrap flex-1 py-6 w-full">{children}</main>
        <footer className="wrap py-6 text-sm text-muted border-t border-line mt-8">
          Materiał edukacyjny. Zawsze weryfikuj program na swoim sterowniku — składnia różni się między Fanuc, Sinumerik i Heidenhain.
        </footer>
      </body>
    </html>
  );
}
