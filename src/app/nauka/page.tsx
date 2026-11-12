import Link from "next/link";
import TrackPicker from "@/components/lesson/TrackPicker";
import PageBanner from "@/components/ui/PageBanner";

export const metadata = { title: "Nauka G-kodu krok po kroku — GCat" };

export default function Nauka() {
  return (
    <div className="grid gap-6">
      <PageBanner src="/img/banner-simulator.jpg" kicker="Ścieżka nauki" title="Nauka"
        subtitle="Wybierz obróbkę. Każda ścieżka prowadzi od osi maszyny do gotowego programu."
        info={<p>Każda lekcja ma ten sam układ: teoria z rysunkami, przykład, ćwiczenia, typowe błędy, test i program detalu, który rośnie z lekcji na lekcję.</p>} priority />
      <Link href="/nauka/start" className="s7-cta">
        <span className="s7-cta-k">Zaczynam od podstaw</span>
        <b>7 dni do pierwszego programu</b>
        <span>Nie wiesz, od czego zacząć? Plan na 7 dni z lekcji frezowania: 30–40 minut dziennie, z testami. Na końcu piszesz program płytki.</span>
      </Link>
      <h2 className="nk-choose">Wybieram ścieżkę</h2>
      <TrackPicker />
      <p className="nk-profile">Nie musisz znać <span className="whitespace-nowrap">G-kodu</span>. Przykłady piszemy w zapisie Fanuc dla frezarki pionowej (osie X, Y, Z) i tokarki (osie X, Z). Różnice w Sinumeriku opisujemy przy każdej lekcji.</p>
    </div>
  );
}
