import Glossary from "./Glossary";
import { glossary } from "@/lib/content";
import { lessonsForGlossary } from "@/lib/lessonRefs";
export const metadata = { title: "Słownik pojęć obróbki i programowania — GCat" };
export default function Page() {
  const refs = lessonsForGlossary(glossary);
  const lessons = Object.fromEntries(Object.entries(refs).map(([a, ls]) => [a, ls.map((l) => ({ id: l.id, title: l.title, href: l.href }))]));
  return <Glossary lessons={lessons} />;
}
