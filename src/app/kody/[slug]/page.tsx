import { notFound } from "next/navigation";
import CardView from "@/components/karta/CardView";
import { bySlug, gcodes } from "@/lib/gcodes";
import { kartaMdx } from "@/lib/mdx/kody";

export function generateStaticParams() { return gcodes.map((g) => ({ slug: g.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const g = bySlug((await params).slug);
  return g ? { title: `${g.code} — ${g.name} — GCat`, description: g.short } : { title: "Kod — GCat" };
}

/* Układ karty: src/components/karta/CardView.tsx (ten sam widok w edytorze treści). */
export default async function CodePage({ params }: { params: Promise<{ slug: string }> }) {
  const g = bySlug((await params).slug);
  if (!g) notFound();
  // artykuł karty z content/kody/<slug>.mdx (dane karty: frontmatter tego samego pliku)
  const mdx = g.hasArticle ? await kartaMdx(g.slug) : null;
  const article = mdx && { node: await mdx.render(), headings: mdx.headings, hasDiagram: mdx.hasDiagram, hasAddrTable: mdx.hasAddrTable, programs: mdx.programs };
  return <CardView g={g} article={article} />;
}
