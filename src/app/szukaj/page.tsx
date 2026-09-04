import { Suspense } from "react";
import Results from "./Results";
export const metadata = { title: "Wyniki wyszukiwania — GCat" };
export default function Page() {
  return <Suspense fallback={<p className="text-muted">Szukam…</p>}><Results /></Suspense>;
}
