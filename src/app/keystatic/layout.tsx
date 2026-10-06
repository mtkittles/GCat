import type { Metadata } from "next";
import Panel from "./keystatic";

export const metadata: Metadata = { title: "Treści — GCat", robots: { index: false, follow: false } };

export default function KeystaticLayout() {
  return <Panel />;
}
