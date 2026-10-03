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
    </div>
  );
}
