import Link from "next/link";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SITE_URL } from "@/lib/site";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import BrandLogo from "@/components/BrandLogo";
import "./globals.css";

// Czcionki z repozytorium (src/app/fonts, licencja OFL): build nie pobiera nic z Google Fonts.
// Pliki zmienne (oś wght), podzbiór latin + latin-ext; zakres wag jak w nazwach poniżej. Nazwy zmiennych jak w globals.css.
const inter = localFont({ src: "./fonts/inter.woff2", weight: "400 600", variable: "--font-inter", display: "swap" });
const sora = localFont({ src: "./fonts/sora.woff2", weight: "600 800", variable: "--font-sora", display: "swap" });
const mono = localFont({ src: "./fonts/jetbrains-mono.woff2", weight: "400 700", variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "GCat — ucz się, programuj, skrawaj",
  description: "Nauka G-kodu po polsku: lekcje, karty funkcji G i M, symulator 2D/3D toru narzędzia, walidator, kalkulator parametrów skrawania.",
  icons: { icon: [{ url: "/icon-192.png", type: "image/png" }], apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }] },
  appleWebApp: { capable: true, title: "GCat", statusBarStyle: "black" },
  openGraph: { title: "GCat — nauka G-kodu po polsku", description: "Ucz się. Programuj. Skrawaj. Lekcje, symulator 2D/3D, walidator, kalkulator.", siteName: "GCat" },
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#F8FAFC" }, { media: "(prefers-color-scheme: dark)", color: "#111214" }],
  colorScheme: "dark light",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" data-theme="dark" className={`${inter.variable} ${sora.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        {/* Zapisany motyw ustawiamy przed malowaniem treści, żeby jasny motyw nie migał na ciemno. Domyślnie ciemny. */}
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}` }} />
        <AppHeader />

        <main className="wrap flex-1 py-7 w-full">{children}</main>

        <footer className="site-footer">
          <div className="wrap py-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <BrandLogo height={56} variant="lockup" />
            <span className="footer-tag ml-auto">CNC · Edukacja · Symulacja · Praktyka</span>
            <span className="footer-ver" title="Wersja strony (commit)">v {(process.env.VERCEL_GIT_COMMIT_SHA ?? "dev").slice(0, 7)}</span>
          </div>
          <nav className="wrap pb-3 text-sm flex flex-wrap gap-x-5 gap-y-2" aria-label="Informacje prawne">
            <Link href="/regulamin" className="text-muted">Regulamin</Link>
            <Link href="/polityka-prywatnosci" className="text-muted">Polityka prywatności</Link>
            <Link href="/konto" className="text-muted">Konto</Link>
          </nav>
          <div className="wrap pb-6 text-sm text-muted max-w-prose">
            Materiał edukacyjny. Zawsze weryfikuj program na swoim sterowniku — składnia różni się między Fanuc, Sinumerik i Heidenhain.
          </div>
        </footer>

        <BottomNav />
      </body>
    </html>
  );
}
