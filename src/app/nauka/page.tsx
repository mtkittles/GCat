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
      <TrackPicker />
      <Link href="/nauka/start" className="s7-cta">
        <span className="s7-cta-k">Nie wiesz, od czego zacząć?</span>
        <b>7 dni do pierwszego programu</b>
        <span>Plan dzienny z lekcji frezowania — po pół godziny dziennie, z testami i programem płytki na końcu.</span>
      </Link>
    </div>
  );
}
