import type { NextConfig } from "next";

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
    return Object.entries(ARCHIVE_REDIRECTS).map(([from, to]) => ({ source: `/nauka/${from}`, destination: to, permanent: true }));
  },
};

export default nextConfig;
