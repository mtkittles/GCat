import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { tracks, type Track } from "@/lib/course";
import Certificate from "./Certificate";

export function generateStaticParams() { return [{ track: "frezowanie" }, { track: "toczenie" }]; }
export const metadata: Metadata = { title: "Certyfikat ścieżki — GCat" };

export default async function CertPage({ params }: { params: Promise<{ track: string }> }) {
  const t = (await params).track as Track;
  if (!tracks[t]) notFound();
  return <Certificate track={t} />;
}
