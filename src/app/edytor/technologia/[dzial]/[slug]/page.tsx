import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdminGate from "@/components/edycja/AdminGate";
import ArtykulEditor from "@/components/edytor/ArtykulEditor";

/* Edytor artykułu Technologii. Plik z buildu to punkt startu; edytor od razu dociąga najnowszą wersję z repozytorium. */

const DIR = "content/technologia";
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export function generateStaticParams() {
  if (!existsSync(DIR)) return [];
  return readdirSync(DIR).filter((d) => statSync(`${DIR}/${d}`).isDirectory())
    .flatMap((d) => readdirSync(`${DIR}/${d}`).filter((f) => f.endsWith(".mdx")).map((f) => ({ dzial: d, slug: f.slice(0, -4) })));
}
export const dynamicParams = false;
export const metadata: Metadata = { title: "Edytor artykułu — GCat", robots: { index: false, follow: false } };

export default async function EdytorArtykulu({ params }: { params: Promise<{ dzial: string; slug: string }> }) {
  const { dzial, slug } = await params;
  if (!SLUG.test(dzial) || !SLUG.test(slug)) notFound();
  const path = `${DIR}/${dzial}/${slug}.mdx`;
  let text: string;
  try { text = readFileSync(path, "utf8"); } catch { notFound(); }
  return <AdminGate what="Edytor treści"><ArtykulEditor path={path} initial={text} /></AdminGate>;
}
