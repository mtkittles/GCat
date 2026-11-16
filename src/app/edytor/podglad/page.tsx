import type { Metadata } from "next";
import Podglad from "@/components/edytor/Podglad";

export const metadata: Metadata = { title: "Podgląd — GCat", robots: { index: false, follow: false } };

/* Podgląd w ramce edytora: treść z edytora (localStorage) skompilowana tak jak przy buildzie. */
export default function PodgladPage() {
  return <Podglad />;
}
