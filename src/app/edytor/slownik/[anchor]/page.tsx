import { readdirSync, readFileSync } from "node:fs";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdminGate from "@/components/edycja/AdminGate";
import HasloEditor from "@/components/edytor/HasloEditor";
import { glossary } from "@/lib/content";
import { lessonsForGlossary } from "@/lib/lessonRefs";

/* Edytor hasła słownika (content/slownik/<kotwica>.yaml). */

const DIR = "content/slownik";
export function generateStaticParams() {
  return readdirSync(DIR).filter((f) => f.endsWith(".yaml")).map((f) => ({ anchor: f.slice(0, -5) }));
}
export const dynamicParams = false;
export const metadata: Metadata = { title: "Edytor hasła — GCat", robots: { index: false, follow: false } };

export default async function EdytorHasla({ params }: { params: Promise<{ anchor: string }> }) {
  const anchor = decodeURIComponent((await params).anchor);
  if (!/^[\p{Ll}\p{N}-]+$/u.test(anchor)) notFound();
  const path = `${DIR}/${anchor}.yaml`;
  let text: string;
  try { text = readFileSync(path, "utf8"); } catch { notFound(); }
  const lessons = (lessonsForGlossary(glossary)[anchor] ?? []).map((l) => ({ id: l.id, title: l.title, href: l.href }));
  return <AdminGate what="Edytor treści"><HasloEditor path={path} initial={text} lessons={lessons} /></AdminGate>;
}
