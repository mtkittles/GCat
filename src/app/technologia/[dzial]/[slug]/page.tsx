import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProGate from "@/components/technologia/ProGate";
import TechArticleView from "@/components/technologia/TechArticleView";
import { artykulMdx } from "@/lib/mdx/technologia";
import { artByKey, artsOf, artykuly, dzialBySlug } from "@/lib/technologia";

export function generateStaticParams() { return artykuly.map((a) => ({ dzial: a.dzial, slug: a.slug })); }
export const dynamicParams = false;

type P = { params: Promise<{ dzial: string; slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { dzial, slug } = await params;
  const a = artByKey(`${dzial}/${slug}`);
  if (!a) return { title: "Technologia — GCat" };
  return { title: `${a.title} — ${dzialBySlug(a.dzial)?.title ?? "Technologia"} — GCat`, description: a.short, ...(a.plan === "pro" ? { robots: { index: false, follow: true } } : {}) };
}

/* Układ: src/components/technologia/TechArticleView.tsx (ten sam widok w edytorze treści). */
export default async function ArtykulPage({ params }: P) {
  const { dzial, slug } = await params;
  const a = artByKey(`${dzial}/${slug}`);
  const d = dzialBySlug(dzial);
  if (!a || !d) notFound();
  const mdx = await artykulMdx(dzial, slug);
  if (!mdx) notFound();
  const body = await mdx.render();
  // ‹ › tylko po artykułach publicznych (Pro nie wskazuje gościa w ślepy zaułek)
  const list = artsOf(dzial).filter((x) => x.plan === "free" || x.key === a.key);
  const i = list.findIndex((x) => x.key === a.key);
  return <TechArticleView a={a} dzial={d} body={body} nav={{ prev: list[i - 1], next: list[i + 1] }} gate={a.plan === "pro" ? (c) => <ProGate>{c}</ProGate> : undefined} />;
}
