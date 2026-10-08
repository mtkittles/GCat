import Tagline from "@/components/Tagline";
import Link from "next/link";
import Image from "next/image";
import HubTiles from "./HubTiles";
import HomeResume, { type ResumeLesson } from "./HomeResume";

function SectionHead({ title }: { title: string }) {
  return (
    <div className="dash-head">
      <h3>{title}</h3>
    </div>
  );
}

export default function MobileHome({ lessons }: { lessons: ResumeLesson[] }) {

  return (
    <section className="mobile-dash">
      {/* 1. obietnica wartości i start — jeden statyczny baner zamiast karuzeli */}
      <div className="m-hero">
        <Image src="/img/hero-cnc.jpg" alt="" fill sizes="100vw" className="m-hero-photo" priority />
        <div className="m-hero-scrim" />
        <div className="m-hero-body">
          <span className="m-hero-k"><Tagline /></span>
          <p className="m-hero-h">Naucz się czytać i pisać G‑kod.</p>
          <p>Lekcje frezowania i toczenia, symulator 2D/3D, karty kodów Fanuc i Sinumerik, kalkulatory.</p>
          <Link href="/nauka" className="btn">Rozpocznij naukę</Link>
        </div>
      </div>

      {/* 2. szybki dostęp — te same nazwy co w menu na komputerze */}
      <div>
        <SectionHead title="Szybki dostęp" />
        <HubTiles compact />
      </div>

      {/* 3. powrót do nauki — tylko gdy jest zapisany postęp w tej przeglądarce */}
      <HomeResume lessons={lessons} />
    </section>
  );
}
