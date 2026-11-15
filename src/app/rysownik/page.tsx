import type { Metadata } from "next";
import Sandbox from "./Sandbox";

export const metadata: Metadata = {
  title: "Rysownik — GCat",
  description: "Edytor rysunków technicznych w stylu GCat.",
  robots: { index: false, follow: false },
};

export default function RysownikPage() {
  return <Sandbox />;
}
