import LessonView from "@/components/lesson/LessonView";
import { lessonDoc, readyLessons } from "@/lib/course";

export const dynamicParams = false;
export function generateStaticParams() { return readyLessons("frezowanie").map((l) => ({ slug: l.slug! })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const l = lessonDoc("frezowanie", (await params).slug);
  return { title: l ? `${l.id} ${l.title} — GCat` : "Lekcja — GCat", description: l?.doc?.goal };
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <LessonView track="frezowanie" slug={(await params).slug} />;
}
