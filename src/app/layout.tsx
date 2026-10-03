import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Sora } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import BrandLogo from "@/components/BrandLogo";
import Tagline from "@/components/Tagline";
import "./globals.css";

// Czcionki serwowane z własnej domeny (bez żądań do Google Fonts), nazwy jak w globals.css.
const inter = Inter({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600"], variable: "--font-inter", display: "swap" });
const sora = Sora({ subsets: ["latin", "latin-ext"], weight: ["600", "700", "800"], variable: "--font-sora", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "700"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "GCat — ucz się, programuj, skrawaj",
  description: "Nauka G-kodu po polsku: lekcje, karty funkcji G i M, symulator 2D/3D toru narzędzia, walidator, kalkulator parametrów skrawania.",
  icons: { icon: [{ url: "/icon-192.png", type: "image/png" }], apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }] },
  appleWebApp: { capable: true, title: "GCat", statusBarStyle: "black" },
  openGraph: { title: "GCat — nauka G-kodu po polsku", description: "Ucz się. Programuj. Skrawaj. Lekcje, symulator 2D/3D, walidator, kalkulator.", siteName: "GCat" },
};

export const viewport: Viewport = {
  themeColor: "#111214",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" data-theme="dark" className={`${inter.variable} ${sora.variable} ${mono.variable}`}>
      <body className="min-h-screen flex flex-col">
        <AppHeader />

        <main className="wrap flex-1 py-7 w-full">{children}</main>

        <footer className="site-footer">
          <div className="wrap py-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <BrandLogo height={26} variant="lockup" />
            <span className="footer-tag"><Tagline /></span>
            <span className="footer-tag ml-auto">CNC · Edukacja · Symulacja · Praktyka</span>
            <span className="footer-ver" title="Wersja strony (commit)">v {(process.env.VERCEL_GIT_COMMIT_SHA ?? "dev").slice(0, 7)}</span>
          </div>
          <div className="wrap pb-6 text-sm text-muted max-w-prose">
            Materiał edukacyjny. Zawsze weryfikuj program na swoim sterowniku — składnia różni się między Fanuc, Sinumerik i Heidenhain.
          </div>
        </footer>

        <BottomNav />
      </body>
    </html>
  );
}
