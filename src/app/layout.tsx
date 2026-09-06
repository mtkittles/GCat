import type { Metadata } from "next";
import AppHeader from "@/components/AppHeader";
import BrandLogo from "@/components/BrandLogo";
import "./globals.css";

export const metadata: Metadata = {
  title: "GCat — zrozum, programuj, obrabiaj",
  description: "Nauka G-kodu po polsku: lekcje, karty funkcji G i M, symulator 2D/3D toru narzędzia, walidator, kalkulator parametrów skrawania.",
  icons: { icon: [{ url: "/icon-192.png", type: "image/png" }] },
  openGraph: { title: "GCat — nauka G-kodu po polsku", description: "Zrozum. Programuj. Obrabiaj. Lekcje, symulator 2D/3D, walidator, kalkulator.", siteName: "GCat" },
};

const themeInit = `(function(){try{var t=localStorage.getItem('theme');if(!t){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-screen flex flex-col">
        <AppHeader />

        <main className="wrap flex-1 py-7 w-full">{children}</main>

        <footer className="site-footer">
          <div className="wrap py-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <BrandLogo height={26} variant="lockup" />
            <span className="footer-tag">Zrozum. Programuj. Obrabiaj.</span>
            <span className="footer-tag ml-auto">CNC · Edukacja · Symulacja · Praktyka</span>
          </div>
          <div className="wrap pb-6 text-sm text-muted max-w-prose">
            Materiał edukacyjny. Zawsze weryfikuj program na swoim sterowniku — składnia różni się między Fanuc, Sinumerik i Heidenhain.
          </div>
        </footer>
      </body>
    </html>
  );
}
