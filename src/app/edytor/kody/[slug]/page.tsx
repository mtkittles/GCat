import { readdirSync, readFileSync } from "node:fs";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdminGate from "@/components/edycja/AdminGate";
import KartaEditor from "@/components/edytor/KartaEditor";

/* Edytor karty kodu. Plik z buildu to punkt startu; edytor od razu dociąga najnowszą wersję z repozytorium. */

const DIR = "content/kody";
export function generateStaticParams() {
  return readdirSync(DIR).filter((f) => f.endsWith(".mdx")).map((f) => ({ slug: f.slice(0, -4) }));
}
export const dynamicParams = false;
export const metadata: Metadata = { title: "Edytor karty — GCat", robots: { index: false, follow: false } };

export default async function EdytorKarty({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) notFound();
  const path = `${DIR}/${slug}.mdx`;
  let text: string;
  try { text = readFileSync(path, "utf8"); } catch { notFound(); }
  return <AdminGate what="Edytor treści"><KartaEditor path={path} initial={text} slug={slug} /></AdminGate>;
}
