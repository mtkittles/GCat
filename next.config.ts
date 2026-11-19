import type { NextConfig } from "next";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PROGRAM_REDIRECTS } from "./src/content/programy/redirects";
import { codeRedirects } from "./src/lib/codeRedirects";

/* Karty kodów: slug i pole `code` z frontmattera MDX — do przekierowań z pojedynczych kodów (src/lib/codeRedirects.ts). */
const KODY_DIR = join(process.cwd(), "content/kody");
const CODE_CARDS = readdirSync(KODY_DIR).filter((f) => f.endsWith(".mdx")).map((f) => {
  const t = readFileSync(join(KODY_DIR, f), "utf8");
  return { slug: /^slug:\s*(.+)$/m.exec(t)?.[1].trim() ?? f.replace(/\.mdx$/, ""), code: /^code:\s*(.+)$/m.exec(t)?.[1].trim() ?? "" };
});

/* Stare adresy archiwalnego kursu (12 lekcji sprzed podziału na ścieżki) prowadzą do odpowiedników w ścieżkach. */
const ARCHIVE_REDIRECTS: Record<string, string> = {
  "1-czym-jest-gkod": "/nauka/frezowanie/f1-1-blok-slowo-adres",
  "2-uklad-wspolrzednych": "/nauka/frezowanie/f0-1-uklad-wspolrzednych",
  "3-g00-g01": "/nauka/frezowanie/f3-2-g01-interpolacja-liniowa",
  "4-luki": "/nauka/frezowanie/f3-3-g02-g03-promien-r",
  "5-g90-g91": "/nauka/frezowanie/f1-3-g90-g91",
  "6-struktura-programu": "/nauka/frezowanie/f1-5-blok-startowy-koniec",
  "7-toczenie": "/nauka/toczenie/t0-2-programowanie-srednicowe",
  "8-kompensacja": "/nauka/frezowanie/f4-2-g41-g42-korekcja-promienia",
  "9-cykle-wiertarskie": "/nauka/frezowanie/f5-1-g81-g82",
  "10-program-wielonarzedziowy": "/nauka/frezowanie/f2-1-wymiana-narzedzia",
  "11-toczenie-cykle": "/nauka/toczenie/t5-1-g71-g70",
  "12-uruchomienie": "/nauka/frezowanie"
};

const nextConfig: NextConfig = {
  async redirects() {
    return [
      ...Object.entries(ARCHIVE_REDIRECTS).map(([from, to]) => ({ source: `/nauka/${from}`, destination: to, permanent: true })),
      // G02 i G03 to jedna karta (decyzja 2 audytu kart, paczka W2); kotwice obu kart były takie same
      { source: "/kody/g03", destination: "/kody/g02", permanent: true },
      // pojedynczy kod z karty zbiorczej (/kody/g81 → /kody/g81-g83); g03 jest wyżej
      ...Object.entries(codeRedirects(CODE_CARDS)).filter(([from]) => from !== "g03").map(([from, to]) => ({ source: `/kody/${from}`, destination: `/kody/${to}`, permanent: true })),
      ...Object.entries(PROGRAM_REDIRECTS).map(([from, to]) => ({ source: `/programy/${from}`, destination: `/programy/${to}`, permanent: true })),
    ];
  },
};

export default nextConfig;
