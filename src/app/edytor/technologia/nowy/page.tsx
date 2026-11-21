import type { Metadata } from "next";
import AdminGate from "@/components/edycja/AdminGate";
import NowyArtykul from "@/components/edytor/NowyArtykul";

export const metadata: Metadata = { title: "Nowy artykuł — GCat", robots: { index: false, follow: false } };

/* „Nowy artykuł” w Technologii: dział, szablon, tytuł → edytor z treścią szablonu (plik powstaje przy publikacji). */
export default function NowyArtykulPage() {
  return <AdminGate what="Edytor treści"><NowyArtykul /></AdminGate>;
}
