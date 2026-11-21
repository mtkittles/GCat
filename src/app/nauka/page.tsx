import Link from "next/link";
import TrackLessons from "@/components/lesson/TrackLessons";
import { trackPlan } from "@/components/lesson/trackPlan";
import { readyLessons } from "@/lib/course";
import { pl } from "@/lib/plural";

export const metadata = { title: "Nauka G-kodu krok po kroku — GCat" };

const N = readyLessons("frezowanie").length + readyLessons("toczenie").length;

export default function Nauka() {
  return (
    <div className="grid gap-6">
      <header className="ph">
        <h1 className="ph-title">Nauka <span className="ph-n">{pl(N, "lekcja", "lekcje", "lekcji")}</span></h1>
        <p className="ph-lead">Wybierz obróbkę. Każda lekcja ma ten sam układ: teoria z rysunkami, przykład, ćwiczenia, typowe błędy, test i program detalu, który rośnie z lekcji na lekcję. Nie musisz znać <span className="whitespace-nowrap">G-kodu</span>.</p>
      </header>
      <TrackLessons tracks={trackPlan()} initial="frezowanie" aside={
        <Link href="/nauka/start" className="s7-cta">
          <span className="s7-cta-k">Zaczynam od podstaw</span>
          <b>7 dni do pierwszego programu</b>
          <span>Plan na 7 dni z lekcji frezowania: 30–40 minut dziennie, z testami. Na końcu piszesz program płytki.</span>
        </Link>
      } />
    </div>
  );
}
