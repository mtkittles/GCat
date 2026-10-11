import Link from "next/link";
import TrackPicker from "@/components/lesson/TrackPicker";
import PageBanner from "@/components/ui/PageBanner";

export const metadata = { title: "Nauka G-kodu krok po kroku — GCat" };

export default function Nauka() {
  return (
    <div className="grid gap-6">
      <PageBanner src="/img/banner-simulator.jpg" kicker="Ścieżka nauki" title="Nauka"
        subtitle="Wybierz obróbkę. Każda ścieżka prowadzi od osi maszyny do gotowego programu."
        info={<p>Lekcje mają stały układ: teoria z rysunkami, przykład rozwiązany, ćwiczenia, typowe błędy, test i program detalu, który rośnie z lekcji na lekcję.</p>} priority />
      <Link href="/nauka/start" className="s7-cta">
        <span className="s7-cta-k">Zaczynam od podstaw</span>
        <b>7 dni do pierwszego programu</b>
        <span>Nie wiesz, od czego zacząć? Plan dzienny z lekcji frezowania — około 30–40 minut dziennie, we własnym tempie, z testami i programem płytki na końcu.</span>
      </Link>
      <h2 className="nk-choose">Wybieram ścieżkę</h2>
      <TrackPicker />
      <p className="nk-profile">Kurs nie wymaga wcześniejszej znajomości <span className="whitespace-nowrap">G-kodu</span>. Przykłady są pisane dla trzyosiowej frezarki pionowej i klasycznej tokarki dwuosiowej w zapisie Fanuc (ISO, na tokarce system A), a różnice w SINUMERIKU są opisane przy każdej lekcji.</p>
    </div>
  );
}
