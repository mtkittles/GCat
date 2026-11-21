import Link from "next/link";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SITE_URL } from "@/lib/site";
import AppToaster from "@/components/shell/AppToaster";
import SmoothScroll from "@/components/shell/SmoothScroll";
import ShortcutsHelp from "@/components/shell/ShortcutsHelp";
import AppSidebar from "@/components/shell/AppSidebar";
import AppTopbar from "@/components/shell/AppTopbar";
import MobileDock from "@/components/shell/MobileDock";
import CommandPalette, { type PaletteProgram } from "@/components/shell/CommandPalette";
import type { MeterLesson } from "@/components/shell/LearnMeter";
import { flat } from "@/lib/course";
import { PROGRAMS } from "@/content/programy";
import { PREFS_SCRIPT } from "@/lib/ui/prefs";
import { AdminFooterLink } from "@/components/edycja/AdminGate";
import { EditBar } from "@/components/edycja/EditMode";
import BrandLogo from "@/components/BrandLogo";
import "./globals.css";
import "./tactile.css";
import "./technologia.css";

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
  // iOS zamienia ciągi cyfr na linki tel: przed hydratacją — niezgodność drzewa i przebudowa <html> przez Reacta.
  formatDetection: { telephone: false, date: false, address: false, email: false },
  openGraph: { title: "GCat — nauka G-kodu po polsku", description: "Ucz się. Programuj. Skrawaj. Lekcje, symulator 2D/3D, walidator, kalkulator.", siteName: "GCat" },
};

export const viewport: Viewport = {
  // theme-color ustawia skrypt PREFS_SCRIPT według motywu strony — z media (prefers-color-scheme)
  // pasek miał kolor motywu systemu, nie wybranego na stronie.
  colorScheme: "dark light",
  viewportFit: "cover",
};

/* Dane powłoki liczone przy budowie: lista lekcji do wskaźnika postępu i programy do palety Ctrl+K. */
const METER: MeterLesson[] = (["frezowanie", "toczenie"] as const).flatMap((t) => flat(t).filter((l) => l.doc).map((l) => ({ track: t, id: l.id })));
const PALETTE_PROGRAMS: PaletteProgram[] = PROGRAMS.map((p) => ({
  title: p.title, href: `/programy/${p.slug}`,
  sub: `${p.mode === "mill" ? "frezowanie" : "toczenie"} · ${p.category}`,
  keys: [p.category, ...p.features].join(" "),
}));

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" data-theme="dark" data-scroll-behavior="smooth" className={`${inter.variable} ${sora.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen">
        {/* Motyw, panel boczny i dźwięk pulpitu ustawiamy przed malowaniem treści (src/lib/ui/prefs.ts). Domyślnie ciemny. */}
        <script dangerouslySetInnerHTML={{ __html: PREFS_SCRIPT }} />
        <AppSidebar lessons={METER} />

        <div className="app-main">
          <div className="app-inset">
            <AppTopbar />
            <main className="wrap flex-1 py-7 w-full">{children}</main>

            <footer className="site-footer">
              <div className="wrap py-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                <BrandLogo height={44} variant="lockup" />
                <span className="footer-tag ml-auto">CNC · Edukacja · Symulacja · Praktyka</span>
                <span className="footer-ver" title="Wersja strony (commit)">v {(process.env.VERCEL_GIT_COMMIT_SHA ?? "dev").slice(0, 7)}</span>
              </div>
              <nav className="wrap pb-3 text-sm flex flex-wrap gap-x-5 gap-y-2" aria-label="Informacje prawne">
                <Link href="/regulamin" className="text-muted">Regulamin</Link>
                <Link href="/polityka-prywatnosci" className="text-muted">Polityka prywatności</Link>
                <Link href="/konto" className="text-muted">Konto</Link>
                <AdminFooterLink />
              </nav>
              <div className="wrap pb-6 text-sm text-muted max-w-prose">
                Materiał edukacyjny. Program zawsze sprawdź na swoim sterowaniu — Fanuc i Sinumerik różnią się w szczegółach.
              </div>
            </footer>
          </div>
        </div>

        <MobileDock />
        <EditBar />
        <CommandPalette programs={PALETTE_PROGRAMS} />
        <AppToaster />
        <SmoothScroll />
        <ShortcutsHelp />
      </body>
    </html>
  );
}
