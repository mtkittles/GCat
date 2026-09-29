import ExerciseList from "./ExerciseList";
import ProgramPreview from "@/components/ProgramPreview";
import { exercises } from "@/lib/content";

export const metadata = { title: "Zadania z G-kodu — GCat" };

/* Miniatury liczone przy budowie strony: detal z rozwiązania wzorcowego. */
export default function Page() {
  const previews = Object.fromEntries(exercises.map((e) => [e.slug,
    <ProgramPreview key={e.slug} id={`zx-${e.slug}`} p={{ slug: e.slug, title: e.title, mode: e.mode, category: "", level: "średni", summary: "", features: [], tools: {}, src: e.reference }} />]));
  return <ExerciseList previews={previews} />;
}
